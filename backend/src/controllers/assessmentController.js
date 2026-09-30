import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/appError.js'

// 1. Fetch Lesson Quiz (Excludes isCorrect from Client)
export async function getLessonQuiz(req, res, next) {
  try {
    const { lessonId } = req.params

    const quiz = await prisma.quiz.findFirst({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              select: { id: true, optionText: true } // Never send isCorrect to student!
            }
          }
        }
      }
    })

    if (!quiz) {
      throw new NotFoundError('No assessment quiz configured for this lesson.')
    }

    return successResponse(res, { quiz })
  } catch (err) {
    next(err)
  }
}

// 2. Server-Side Quiz Grading & Attempt Recording
export async function submitQuizAttempt(req, res, next) {
  try {
    const studentId = req.user.id
    const { quizId } = req.params
    const { answers } = req.body // Map of { questionId: selectedOptionId }

    if (!answers || typeof answers !== 'object') {
      throw new BadRequestError('Answers payload must be an object mapping question IDs to option IDs')
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true }
        }
      }
    })

    if (!quiz) {
      throw new NotFoundError('Quiz not found')
    }

    // Check maximum attempts
    const attemptsCount = await prisma.quizAttempt.count({
      where: { quizId, studentId }
    })

    if (attemptsCount >= quiz.maxAttempts) {
      throw new ForbiddenError(`Maximum attempt limit (${quiz.maxAttempts}) reached for this quiz.`)
    }

    const totalQuestions = quiz.questions.length
    let correctCount = 0

    quiz.questions.forEach((q) => {
      const correctOption = q.options.find((o) => o.isCorrect)
      if (correctOption && answers[q.id] === correctOption.id) {
        correctCount++
      }
    })

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100
    const passed = score >= quiz.passingScore

    // Persist attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId,
        score,
        passed
      }
    })

    return successResponse(
      res,
      {
        attemptId: attempt.id,
        quizId,
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions,
        attemptsRemaining: quiz.maxAttempts - (attemptsCount + 1)
      },
      passed ? 'Congratulations! You passed the assessment.' : 'Passing threshold not met. You may review and retry.'
    )
  } catch (err) {
    next(err)
  }
}

// 3. Verifiable Digital Credential Issuance (Strict Idempotency & Completion Verification)
export async function issueCertificateIfEligible(req, res, next) {
  try {
    const studentId = req.user.id
    const { courseId } = req.params

    // 1. Idempotency Check: return existing certificate if already issued
    const existingCert = await prisma.certificate.findFirst({
      where: { studentId, courseId }
    })

    if (existingCert) {
      return successResponse(res, { certificate: existingCert }, 'Certificate already issued and valid.')
    }

    // 2. Verify Active Enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('Active course enrollment required for credential issuance.')
    }

    // 3. Fetch Course and verify certificate is enabled
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        playlists: {
          where: { status: 'PUBLISHED' },
          include: {
            lessons: {
              where: { status: 'PUBLISHED' },
              include: { quizzes: true }
            }
          }
        }
      }
    })

    if (!course) {
      throw new NotFoundError('Course not found')
    }

    if (!course.certificateEnabled) {
      throw new BadRequestError('Certificates are not enabled for this course by platform policy.')
    }

    // 4. Verify ALL published lessons completed
    const allPublishedLessons = []
    const requiredQuizIds = []

    course.playlists.forEach((p) => {
      p.lessons.forEach((l) => {
        allPublishedLessons.push(l.id)
        if (l.quizzes && l.quizzes.length > 0) {
          l.quizzes.forEach((q) => requiredQuizIds.push(q.id))
        }
      })
    })

    const completedProgresses = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        lessonId: { in: allPublishedLessons },
        isCompleted: true
      }
    })

    if (completedProgresses.length < allPublishedLessons.length) {
      throw new BadRequestError(
        `Course requirements incomplete: ${completedProgresses.length}/${allPublishedLessons.length} lessons completed. You must complete 100% of curriculum lessons to earn certification.`
      )
    }

    // 5. Verify ALL required assessments passed
    if (requiredQuizIds.length > 0) {
      const passedAttempts = await prisma.quizAttempt.findMany({
        where: {
          studentId,
          quizId: { in: requiredQuizIds },
          passed: true
        }
      })

      const passedQuizIds = new Set(passedAttempts.map((a) => a.quizId))
      const allQuizzesPassed = requiredQuizIds.every((qId) => passedQuizIds.has(qId))

      if (!allQuizzesPassed) {
        throw new BadRequestError('All required comprehension quizzes must be passed before credential issuance.')
      }
    }

    // 6. Generate Unique Serial & Issue Certificate
    const student = await prisma.user.findUnique({ where: { id: studentId } })
    const year = new Date().getFullYear()
    const rand = String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')
    const certificateCode = `AVT-${year}-${rand}`

    const certificate = await prisma.$transaction(async (tx) => {
      const c = await tx.certificate.create({
        data: {
          certificateCode,
          studentId,
          courseId,
          studentName: student.name,
          courseTitle: course.title,
          status: 'VALID',
          verificationUrl: `/certificates?code=${certificateCode}`
        }
      })

      // Mark enrollment 100% and completed
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercent: 100,
          completedAt: new Date()
        }
      })

      // Send congratulations notification
      await tx.notification.create({
        data: {
          userId: studentId,
          title: 'Certificate Awarded!',
          message: `Congratulations! You have completed "${course.title}". Your digital certificate ${certificateCode} is now available.`,
          linkUrl: '/student/certificates'
        }
      })

      await tx.auditLog.create({
        data: {
          userId: studentId,
          action: 'CERTIFICATE_ISSUED',
          entityType: 'Certificate',
          entityId: c.id,
          details: `Digital credential ${certificateCode} issued to ${student.email} for ${course.title}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      })

      return c
    })

    return successResponse(
      res,
      { certificate },
      'Curriculum verified! Digital certificate awarded and registered.',
      201
    )
  } catch (err) {
    next(err)
  }
}

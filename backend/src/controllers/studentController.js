import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/appError.js'

// 1. Student Dashboard Aggregates
export async function getDashboardStats(req, res, next) {
  try {
    const studentId = req.user.id

    const [enrolledCount, completedLessonsCount, certificatesCount, enrollments, recentAnnouncements] =
      await Promise.all([
        prisma.enrollment.count({ where: { studentId, status: 'ACTIVE' } }),
        prisma.lessonProgress.count({ where: { studentId, isCompleted: true } }),
        prisma.certificate.count({ where: { studentId, status: 'VALID' } }),
        prisma.enrollment.findMany({
          where: { studentId },
          include: {
            course: {
              include: {
                playlists: {
                  where: { status: 'PUBLISHED' },
                  include: {
                    lessons: {
                      where: { status: 'PUBLISHED' },
                      select: { id: true, title: true, duration: true }
                    }
                  }
                }
              }
            },
            lessonProgress: {
              where: { isCompleted: true }
            }
          }
        }),
        prisma.notification.findMany({
          where: { userId: studentId },
          take: 4,
          orderBy: { createdAt: 'desc' }
        })
      ])

    // Compute approximate hours invested based on lesson progress
    const progressRecords = await prisma.lessonProgress.findMany({
      where: { studentId },
      select: { watchSeconds: true }
    })
    const totalWatchSeconds = progressRecords.reduce((acc, p) => acc + (p.watchSeconds || 0), 0)
    const hoursInvested = Math.round((totalWatchSeconds / 3600) * 10) / 10

    // Find the continue learning course (first active course)
    const activeCourse = enrollments.find((e) => e.progressPercent < 100) || enrollments[0]
    let continueLearning = null

    if (activeCourse) {
      // Find first incomplete lesson
      let lastLesson = null
      for (const pl of activeCourse.course.playlists) {
        for (const les of pl.lessons) {
          const isDone = activeCourse.lessonProgress.some((lp) => lp.lessonId === les.id)
          if (!isDone) {
            lastLesson = les
            break
          }
        }
        if (lastLesson) break
      }

      continueLearning = {
        courseId: activeCourse.course.id,
        courseTitle: activeCourse.course.title,
        progressPercent: activeCourse.progressPercent,
        nextLessonTitle: lastLesson ? lastLesson.title : 'Course Completed',
        nextLessonId: lastLesson ? lastLesson.id : null
      }
    }

    return successResponse(res, {
      stats: {
        enrolledCoursesCount: enrolledCount,
        completedLessonsCount,
        hoursInvested: hoursInvested || 12.5,
        certificatesCount,
        activeStreakDays: 14
      },
      continueLearning,
      recentAnnouncements
    })
  } catch (err) {
    next(err)
  }
}

// 2. Enrolled Courses with Sequential Progress
export async function getMyCourses(req, res, next) {
  try {
    const studentId = req.user.id

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          include: {
            playlists: {
              where: { status: 'PUBLISHED' },
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  where: { status: 'PUBLISHED' },
                  orderBy: { orderIndex: 'asc' },
                  select: { id: true, title: true, duration: true, orderIndex: true }
                }
              }
            }
          }
        },
        lessonProgress: true
      }
    })

    const courses = enrollments.map((e) => {
      const now = new Date()
      const isExpired = e.expiresAt && new Date(e.expiresAt) < now

      let totalLessons = 0
      e.course.playlists.forEach((p) => {
        totalLessons += p.lessons.length
      })
      const completedCount = e.lessonProgress.filter((lp) => lp.isCompleted).length

      return {
        id: e.course.id,
        slug: e.course.slug,
        title: e.course.title,
        category: e.course.category,
        level: e.course.level,
        thumbnail: e.course.thumbnail,
        shortDescription: e.course.shortDescription,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
        expiresAt: e.expiresAt,
        isExpired: !!isExpired,
        status: e.status,
        totalLessons,
        completedLessons: completedCount,
        playlists: e.course.playlists
      }
    })

    return successResponse(res, { courses })
  } catch (err) {
    next(err)
  }
}

// 3. Granular Lesson Progression & Percentage Calculation
export async function toggleLessonProgress(req, res, next) {
  try {
    const courseId = req.params.courseId || req.body.courseId
    const lessonId = req.params.lessonId || req.body.lessonId
    const { isCompleted, watchSeconds = 0, lastPositionSec = 0 } = req.body
    const studentId = req.user.id

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    })

    if (!enrollment) {
      throw new ForbiddenError('You must be enrolled in this course to record progress')
    }

    if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
      throw new ForbiddenError('Your course enrollment access period has expired')
    }

    // 1. Fetch lesson to verify duration & attached quizzes
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: true, quizzes: true }
    })

    if (!lesson || lesson.playlist.courseId !== courseId) {
      throw new NotFoundError('Lesson not found or does not belong to this course')
    }

    // 2. Fetch existing verified progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      }
    })

    let targetCompleted = Boolean(isCompleted)

    if (targetCompleted) {
      // Server-authoritative check: video content requirement
      const currentPos = Math.max(existingProgress?.lastPositionSec || 0, Number(lastPositionSec || 0))
      const totalWatch = existingProgress?.watchSeconds || 0
      const isVideoWatched = currentPos >= (lesson.durationSeconds - 5) || totalWatch >= lesson.durationSeconds

      if (!isVideoWatched && !existingProgress?.isCompleted) {
        throw new BadRequestError('Required lesson video content must be completed before marking as complete.')
      }

      // Server-authoritative check: required quizzes
      if (lesson.quizzes && lesson.quizzes.length > 0) {
        const quizIds = lesson.quizzes.map((q) => q.id)
        const passedAttempts = await prisma.quizAttempt.findMany({
          where: {
            studentId,
            quizId: { in: quizIds },
            passed: true
          }
        })
        const passedQuizIds = new Set(passedAttempts.map((a) => a.quizId))
        const allQuizzesPassed = quizIds.every((qid) => passedQuizIds.has(qid))

        if (!allQuizzesPassed) {
          throw new BadRequestError('All required comprehension quizzes must be passed before completing this lesson.')
        }
      }
    }

    // Upsert validated lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      },
      update: {
        isCompleted: targetCompleted,
        lastPositionSec: Math.max(existingProgress?.lastPositionSec || 0, Number(lastPositionSec || 0)),
        completedAt: targetCompleted ? (existingProgress?.completedAt || new Date()) : null
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        studentId,
        isCompleted: targetCompleted,
        watchSeconds: 0,
        lastPositionSec: Number(lastPositionSec || 0),
        completedAt: targetCompleted ? new Date() : null
      }
    })

    // Recalculate total course progress
    const allPublishedLessons = await prisma.lesson.findMany({
      where: {
        playlist: { courseId, status: 'PUBLISHED' },
        status: 'PUBLISHED'
      },
      select: { id: true }
    })

    const completedProgresses = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true
      },
      select: { id: true }
    })

    const totalCount = allPublishedLessons.length || 1
    const completedCount = completedProgresses.length
    const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100))

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null
      }
    })

    return successResponse(res, {
      progressPercent,
      isCompleted: Boolean(isCompleted),
      completedCount,
      totalCount,
      courseCompleted: progressPercent === 100
    }, 'Progress synchronized successfully')
  } catch (err) {
    next(err)
  }
}

// 4. Private Student Notes
export async function getNote(req, res, next) {
  try {
    const studentId = req.user.id
    const { lessonId } = req.params

    const note = await prisma.studentNote.findUnique({
      where: {
        studentId_lessonId: { studentId, lessonId }
      }
    })

    return successResponse(res, { noteText: note ? note.noteText : '' })
  } catch (err) {
    next(err)
  }
}

export async function saveNote(req, res, next) {
  try {
    const studentId = req.user.id
    const { lessonId } = req.params
    const { noteText } = req.body

    const note = await prisma.studentNote.upsert({
      where: {
        studentId_lessonId: { studentId, lessonId }
      },
      update: {
        noteText: noteText || ''
      },
      create: {
        studentId,
        lessonId,
        noteText: noteText || ''
      }
    })

    return successResponse(res, { note }, 'Private note synchronized')
  } catch (err) {
    next(err)
  }
}

// 5. Student Certificates
export async function getStudentCertificates(req, res, next) {
  try {
    const studentId = req.user.id

    const certificates = await prisma.certificate.findMany({
      where: { studentId },
      orderBy: { issueDate: 'desc' },
      include: {
        course: { select: { id: true, title: true, slug: true, thumbnail: true } }
      }
    })

    return successResponse(res, { certificates })
  } catch (err) {
    next(err)
  }
}

// 6. Student Payment History
export async function getStudentPayments(req, res, next) {
  try {
    const studentId = req.user.id

    const orders = await prisma.order.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, thumbnail: true } }
      }
    })

    return successResponse(res, { payments: orders })
  } catch (err) {
    next(err)
  }
}

// 7. Update Student Profile
export async function updateProfile(req, res, next) {
  try {
    const studentId = req.user.id
    const { name, phone, bio } = req.body

    const updated = await prisma.user.update({
      where: { id: studentId },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        bio: bio ? bio.trim() : undefined
      },
      select: { id: true, name: true, email: true, phone: true, bio: true, avatar: true }
    })

    return successResponse(res, { user: updated }, 'Profile updated successfully')
  } catch (err) {
    next(err)
  }
}

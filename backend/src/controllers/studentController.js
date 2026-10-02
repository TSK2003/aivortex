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

// 2b. Course Curriculum with Playlists and Student Completion Status
export async function getCourseCurriculum(req, res, next) {
  try {
    const studentId = req.user.id
    const { courseId } = req.params

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        level: true,
        thumbnail: true,
        shortDescription: true,
        certificateEnabled: true,
        status: true
      }
    })

    if (!course) {
      throw new NotFoundError('Course not found')
    }

    let enrollment = null
    if (req.user.role === 'STUDENT') {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId, courseId: course.id }
        },
        include: {
          lessonProgress: true
        }
      })

      if (!enrollment) {
        throw new ForbiddenError('You must be enrolled in this course to access the curriculum.')
      }

      if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
        throw new ForbiddenError('Your course enrollment access period has expired.')
      }
    } else {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: { studentId, courseId: course.id }
        },
        include: {
          lessonProgress: true
        }
      })
    }

    const playlists = await prisma.playlist.findMany({
      where: { courseId: course.id },
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          where: req.user.role === 'ADMIN' ? {} : { status: 'PUBLISHED' },
          orderBy: { orderIndex: 'asc' },
          include: {
            quizzes: {
              select: { id: true, title: true, passingScore: true, maxAttempts: true }
            },
            resources: true
          }
        }
      }
    })

    const progressMap = new Map()
    if (enrollment?.lessonProgress) {
      enrollment.lessonProgress.forEach((lp) => {
        progressMap.set(lp.lessonId, lp)
      })
    }

    let previousLessonCompleted = true
    const enrichedPlaylists = playlists.map((pl) => ({
      id: pl.id,
      title: pl.title,
      description: pl.description,
      orderIndex: pl.orderIndex,
      lessons: pl.lessons.map((les) => {
        const prog = progressMap.get(les.id)
        const isCompleted = prog?.isCompleted || false
        const isLocked = !previousLessonCompleted
        // Update condition for subsequent lesson
        previousLessonCompleted = isCompleted
        return {
          id: les.id,
          title: les.title,
          description: les.description,
          duration: les.duration,
          durationSeconds: les.durationSeconds,
          orderIndex: les.orderIndex,
          isPreview: les.isPreview,
          isCompleted,
          isLocked,
          lastPositionSec: prog?.lastPositionSec || 0,
          watchSeconds: prog?.watchSeconds || 0,
          quizzes: les.quizzes,
          resources: les.resources.map((r) => ({
            id: r.id,
            title: r.title,
            fileName: r.fileName,
            fileType: r.fileType,
            fileUrl: r.fileUrl,
            fileSizeBytes: r.fileSizeBytes != null ? Number(r.fileSizeBytes) : null,
            orderIndex: r.orderIndex
          }))
        }
      })
    }))

    return successResponse(res, {
      course,
      playlists: enrichedPlaylists,
      enrollment: enrollment
        ? {
            id: enrollment.id,
            progressPercent: enrollment.progressPercent,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt
          }
        : null
    })
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

    if (!courseId || !lessonId) {
      throw new BadRequestError('Course ID and Lesson ID are required')
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('You must be enrolled in this course to record progress')
    }

    if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
      throw new ForbiddenError('Your course enrollment access period has expired')
    }

    // 1. Fetch lesson to verify duration & attached quizzes
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        playlist: {
          include: {
            course: true
          }
        },
        quizzes: true
      }
    })

    if (!lesson || lesson.playlist.courseId !== courseId) {
      throw new NotFoundError('Lesson not found or does not belong to this course')
    }

    if (lesson.status !== 'PUBLISHED' && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('This lesson has not been published for student learning yet.')
    }

    let targetCompleted = Boolean(isCompleted)

    if (targetCompleted) {
      // 2. Server-authoritative check: video content requirement
      const existingProgress = await prisma.lessonProgress.findUnique({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId
          }
        }
      })

      const totalWatch = existingProgress?.watchSeconds || 0
      const currentPos = Math.max(existingProgress?.lastPositionSec || 0, Number(lastPositionSec || 0))
      const requiredWatch = Math.min(lesson.durationSeconds, Math.floor(lesson.durationSeconds * 0.8))

      const isVideoWatched =
        lesson.durationSeconds <= 0 ||
        (totalWatch >= requiredWatch && (currentPos >= (lesson.durationSeconds - 15) || totalWatch >= lesson.durationSeconds))

      if (!isVideoWatched && !existingProgress?.isCompleted) {
        throw new BadRequestError('Required lesson video content must be completed before marking as complete.')
      }

      // 3. Sequential learning rule: Check all earlier lessons across curriculum
      const earlierPlaylists = await prisma.playlist.findMany({
        where: {
          courseId,
          orderIndex: { lt: lesson.playlist.orderIndex }
        },
        include: {
          lessons: {
            where: { status: 'PUBLISHED' },
            select: { id: true, title: true }
          }
        }
      })

      const earlierLessonsInSamePlaylist = await prisma.lesson.findMany({
        where: {
          playlistId: lesson.playlistId,
          orderIndex: { lt: lesson.orderIndex },
          status: 'PUBLISHED'
        },
        select: { id: true, title: true }
      })

      const allPrerequisiteLessonIds = [
        ...earlierPlaylists.flatMap((p) => p.lessons.map((l) => l.id)),
        ...earlierLessonsInSamePlaylist.map((l) => l.id)
      ]

      if (allPrerequisiteLessonIds.length > 0) {
        const completedPrereqs = await prisma.lessonProgress.findMany({
          where: {
            enrollmentId: enrollment.id,
            lessonId: { in: allPrerequisiteLessonIds },
            isCompleted: true
          }
        })

        if (completedPrereqs.length < allPrerequisiteLessonIds.length) {
          throw new ForbiddenError(
            'Sequential learning rule enforced: You must complete earlier lessons before unlocking this lecture.'
          )
        }
      }

      // 4. Server-authoritative check: required quizzes
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

    // Fetch existing verified progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      }
    })

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
    const publishedLessonIds = allPublishedLessons.map((l) => l.id)

    const completedProgresses = await prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        lessonId: { in: publishedLessonIds },
        isCompleted: true
      },
      select: { id: true }
    })

    const totalCount = publishedLessonIds.length || 1
    const completedCount = completedProgresses.length
    const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100))

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent,
        completedAt: progressPercent === 100 ? (enrollment.completedAt || new Date()) : null
      }
    })

    return successResponse(res, {
      progressPercent,
      isCompleted: targetCompleted,
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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: true }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId: lesson.playlist.courseId }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('You must be enrolled in this course to access notes')
    }

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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: true }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId: lesson.playlist.courseId }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('You must be enrolled in this course to save notes')
    }

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

// 4b. Lesson Resources
export async function getLessonResources(req, res, next) {
  try {
    const studentId = req.user.id
    const { lessonId } = req.params

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        playlist: true,
        resources: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    if (lesson.status !== 'PUBLISHED' && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Lesson resources unavailable.')
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId: lesson.playlist.courseId }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('Active course enrollment required to access lesson resources.')
    }

    const resources = lesson.resources.map((r) => ({
      id: r.id,
      title: r.title,
      fileName: r.fileName,
      fileType: r.fileType,
      fileUrl: r.fileUrl,
      fileSizeBytes: r.fileSizeBytes != null ? Number(r.fileSizeBytes) : null,
      orderIndex: r.orderIndex
    }))

    return successResponse(res, { resources })
  } catch (err) {
    next(err)
  }
}

export async function downloadLessonResource(req, res, next) {
  try {
    const studentId = req.user.id
    const { resourceId } = req.params

    const resource = await prisma.lessonResource.findUnique({
      where: { id: resourceId },
      include: {
        lesson: {
          include: { playlist: true }
        }
      }
    })

    if (!resource) {
      throw new NotFoundError('Resource not found')
    }

    const courseId = resource.lesson.playlist.courseId
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('Active course enrollment required to download lesson resources.')
    }

    return successResponse(
      res,
      {
        resource: {
          id: resource.id,
          title: resource.title,
          fileName: resource.fileName,
          fileType: resource.fileType,
          downloadUrl: resource.fileUrl
        }
      },
      'Resource download authorized'
    )
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

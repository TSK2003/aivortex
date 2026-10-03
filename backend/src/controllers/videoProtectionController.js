import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/prisma.js'
import s3Service from '../services/s3Service.js'
import { successResponse } from '../utils/responseWrapper.js'
import { ForbiddenError, ConflictError, NotFoundError, BadRequestError } from '../utils/appError.js'

export async function startVideoSession(req, res, next) {
  try {
    const studentId = req.user.id
    const { courseId, lessonId } = req.body

    if (!courseId || !lessonId) {
      throw new BadRequestError('Course ID and Lesson ID are required')
    }

    // 1. Check Active Course Enrollment & Expiration
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
      }
    })

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new ForbiddenError('Active course enrollment required to view video lessons.')
    }

    if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
      throw new ForbiddenError('Your course enrollment access period has expired.')
    }

    // 2. Validate Lesson Exists & Belongs to Course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        playlist: true,
        quizzes: true
      }
    })

    if (!lesson || lesson.playlist.courseId !== courseId) {
      throw new NotFoundError('Lesson not found or does not belong to the enrolled course.')
    }

    if (lesson.status !== 'PUBLISHED' && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('This lesson has not been published for student learning yet.')
    }

    // 3. Backend-Enforced Sequential Learning Unlock Check
    const earlierPlaylists = await prisma.playlist.findMany({
      where: {
        courseId,
        orderIndex: { lt: lesson.playlist.orderIndex }
      },
      include: {
        lessons: {
          where: { status: 'PUBLISHED' },
          include: { quizzes: true }
        }
      }
    })

    const earlierLessonsInSamePlaylist = await prisma.lesson.findMany({
      where: {
        playlistId: lesson.playlistId,
        orderIndex: { lt: lesson.orderIndex },
        status: 'PUBLISHED'
      },
      include: { quizzes: true }
    })

    const allEarlierLessons = [
      ...earlierPlaylists.flatMap((p) => p.lessons),
      ...earlierLessonsInSamePlaylist
    ]

    if (allEarlierLessons.length > 0) {
      const completedProgress = await prisma.lessonProgress.findMany({
        where: {
          enrollmentId: enrollment.id,
          lessonId: { in: allEarlierLessons.map((l) => l.id) },
          isCompleted: true
        }
      })

      if (completedProgress.length < allEarlierLessons.length) {
        throw new ForbiddenError(
          'Sequential learning rule enforced: You must complete earlier lessons before unlocking this lecture.'
        )
      }

      // Check required quizzes for earlier lessons
      for (const earlierLesson of allEarlierLessons) {
        if (earlierLesson.quizzes && earlierLesson.quizzes.length > 0) {
          const quizIds = earlierLesson.quizzes.map((q) => q.id)
          const passedAttempt = await prisma.quizAttempt.findFirst({
            where: {
              studentId,
              quizId: { in: quizIds },
              passed: true
            }
          })
          if (!passedAttempt) {
            throw new ForbiddenError(
              `Prerequisite assessment required: You must pass the quiz for "${earlierLesson.title}" before proceeding.`
            )
          }
        }
      }
    }

    // 4. Enforce Single Active Video Session per Student (Concurrency Control)
    const newSessionId = uuidv4()
    const ipAddress = String(req.ip || req.headers['x-forwarded-for'] || '127.0.0.1')

    // Invalidate existing sessions for this student in database
    await prisma.activeVideoSession.deleteMany({
      where: { studentId }
    })

    // Register new session
    await prisma.activeVideoSession.create({
      data: {
        studentId,
        lessonId,
        sessionId: newSessionId,
        ipAddress,
        lastHeartbeatAt: new Date()
      }
    })

    // 5. Generate Signed Video Streaming Access
    let streamUrl = lesson.videoUrl
    if (lesson.s3Key) {
      streamUrl = await s3Service.getPresignedDownloadUrl(lesson.s3Key, 7200)
    }

    // 6. Student Watermark Payload (Separates display from audit IP per prompt specification)
    const watermark = {
      displayId: `AIVORTEX-STU-${studentId.slice(0, 8).toUpperCase()}`,
      sessionTag: `SES-${newSessionId.slice(0, 6).toUpperCase()}`,
      displayText: `Student #${studentId.slice(0, 8).toUpperCase()} • Active Learner Stream`,
      timestamp: new Date().toISOString()
    }

    // Audit log playback authorization
    try {
      await prisma.auditLog.create({
        data: {
          userId: studentId,
          action: 'VIDEO_STREAM_AUTHORIZED',
          entityType: 'Lesson',
          entityId: lessonId,
          details: `Authorized playback for lesson "${lesson.title}" under session ${newSessionId}`,
          ipAddress
        }
      })
    } catch (e) {
      // silent
    }

    // Find saved position
    const savedProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      }
    })

    const resumePosition = savedProgress ? savedProgress.lastPositionSec : 0

    return successResponse(
      res,
      {
        sessionId: newSessionId,
        streamUrl,
        videoUrl: streamUrl,
        watermark,
        resumePositionSec: resumePosition,
        lastPositionSec: resumePosition,
        durationSeconds: lesson.durationSeconds,
        expiresAt: new Date(Date.now() + 7200 * 1000).toISOString(),
        maxSeekAllowedSeconds: 300,
        heartbeatIntervalMs: 20000
      },
      'Video session authorized'
    )
  } catch (err) {
    next(err)
  }
}

export async function heartbeatVideoSession(req, res, next) {
  try {
    const studentId = req.user.id
    const { sessionId, positionSeconds, currentPositionSec, watchSecondsDelta } = req.body
    const rawPos = positionSeconds ?? currentPositionSec ?? 0

    if (!sessionId) {
      throw new BadRequestError('Session ID is required for heartbeat')
    }

    if (typeof rawPos !== 'number' || isNaN(rawPos) || rawPos < 0) {
      throw new BadRequestError('Invalid position: must be a non-negative number')
    }

    const activeSession = await prisma.activeVideoSession.findUnique({
      where: { sessionId },
      include: {
        lesson: {
          include: {
            playlist: true,
            quizzes: true
          }
        }
      }
    })

    if (!activeSession || activeSession.studentId !== studentId) {
      throw new ConflictError(
        'Concurrent session detected. Your video playback was paused because your account is active on another device.'
      )
    }

    // Check if session has timed out (stale after 2 minutes without heartbeat)
    const now = Date.now()
    const staleThresholdMs = 2 * 60 * 1000
    const timeSinceLastHeartbeat = now - new Date(activeSession.lastHeartbeatAt).getTime()

    if (timeSinceLastHeartbeat > staleThresholdMs) {
      await prisma.activeVideoSession.delete({ where: { sessionId } }).catch(() => {})
      throw new ConflictError('Playback session expired due to inactivity. Please reload to resume.')
    }

    // Calculate trusted elapsed watch time (bounded by heartbeat interval with jitter buffer)
    const elapsedSeconds = Math.min(45, Math.max(1, Math.round(timeSinceLastHeartbeat / 1000)))

    // Refresh heartbeat
    await prisma.activeVideoSession.update({
      where: { sessionId },
      data: { lastHeartbeatAt: new Date() }
    })

    // Update server-authoritative lesson progress for enrolled student
    const courseId = activeSession.lesson?.playlist?.courseId
    let lessonCompleted = false
    let currentWatchSeconds = 0
    let currentPos = 0

    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId, courseId } }
      })

      if (enrollment && enrollment.status === 'ACTIVE') {
        const lesson = activeSession.lesson
        const existingProgress = await prisma.lessonProgress.findUnique({
          where: {
            enrollmentId_lessonId: {
              enrollmentId: enrollment.id,
              lessonId: lesson.id
            }
          }
        })

        currentWatchSeconds = (existingProgress?.watchSeconds || 0) + elapsedSeconds
        currentPos = Math.min(lesson.durationSeconds, Math.max(0, Math.floor(rawPos)))

        // Check if video content requirement is genuinely satisfied (prevent seek-to-end cheating)
        const requiredWatchSeconds = Math.min(lesson.durationSeconds, Math.floor(lesson.durationSeconds * 0.8))
        const videoFinished =
          lesson.durationSeconds <= 0 ||
          (currentWatchSeconds >= requiredWatchSeconds && (currentPos >= (lesson.durationSeconds - 15) || currentWatchSeconds >= lesson.durationSeconds))

        // Check if quizzes are required and passed
        let allQuizzesPassed = true
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
          allQuizzesPassed = quizIds.every((qid) => passedQuizIds.has(qid))
        }

        lessonCompleted = videoFinished && allQuizzesPassed

        await prisma.lessonProgress.upsert({
          where: {
            enrollmentId_lessonId: {
              enrollmentId: enrollment.id,
              lessonId: lesson.id
            }
          },
          update: {
            lastPositionSec: currentPos,
            watchSeconds: currentWatchSeconds,
            isCompleted: existingProgress?.isCompleted ? true : lessonCompleted,
            completedAt: (existingProgress?.isCompleted || lessonCompleted) ? (existingProgress?.completedAt || new Date()) : null
          },
          create: {
            enrollmentId: enrollment.id,
            lessonId: lesson.id,
            studentId,
            lastPositionSec: currentPos,
            watchSeconds: currentWatchSeconds,
            isCompleted: lessonCompleted,
            completedAt: lessonCompleted ? new Date() : null
          }
        })

        // If newly completed, recalculate total enrollment progressPercent
        if (lessonCompleted && !existingProgress?.isCompleted) {
          const totalPublished = await prisma.lesson.count({
            where: { playlist: { courseId, status: 'PUBLISHED' }, status: 'PUBLISHED' }
          })
          const completedCount = await prisma.lessonProgress.count({
            where: {
              enrollmentId: enrollment.id,
              lesson: { playlist: { courseId, status: 'PUBLISHED' }, status: 'PUBLISHED' },
              isCompleted: true
            }
          })
          const progressPercent = Math.min(100, Math.round((completedCount / (totalPublished || 1)) * 100))

          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: {
              progressPercent,
              completedAt: progressPercent === 100 ? new Date() : null
            }
          })
        }
      }
    }

    return successResponse(
      res,
      {
        active: true,
        lessonCompleted,
        currentPositionSec: currentPos,
        positionSeconds: currentPos,
        watchSeconds: currentWatchSeconds
      },
      'Session heartbeat acknowledged'
    )
  } catch (err) {
    next(err)
  }
}

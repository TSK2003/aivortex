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
    // If not first lesson in first playlist, verify earlier lessons completed
    const earlierLessons = await prisma.lesson.findMany({
      where: {
        playlistId: lesson.playlistId,
        orderIndex: { lt: lesson.orderIndex },
        status: 'PUBLISHED'
      },
      include: {
        quizzes: true
      }
    })

    if (earlierLessons.length > 0) {
      const completedProgress = await prisma.lessonProgress.findMany({
        where: {
          enrollmentId: enrollment.id,
          lessonId: { in: earlierLessons.map((l) => l.id) },
          isCompleted: true
        }
      })

      if (completedProgress.length < earlierLessons.length) {
        throw new ForbiddenError(
          'Sequential learning rule enforced: You must complete earlier lessons before unlocking this lecture.'
        )
      }

      // Check required quizzes for earlier lessons
      for (const earlierLesson of earlierLessons) {
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
      displayId: `APEX-STU-${studentId.slice(0, 8).toUpperCase()}`,
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

    return successResponse(
      res,
      {
        sessionId: newSessionId,
        streamUrl,
        watermark,
        resumePositionSec: savedProgress ? savedProgress.lastPositionSec : 0,
        maxSeekAllowedSeconds: 300,
        heartbeatIntervalMs: 30000
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
    const { sessionId, positionSeconds = 0 } = req.body

    if (!sessionId) {
      throw new BadRequestError('Session ID is required for heartbeat')
    }

    const activeSession = await prisma.activeVideoSession.findUnique({
      where: { sessionId }
    })

    if (!activeSession || activeSession.studentId !== studentId) {
      throw new ConflictError(
        'Concurrent session detected. Your video playback was paused because your account is active on another device.'
      )
    }

    // Check if session has timed out (stale after 2 minutes without heartbeat)
    const staleThresholdMs = 2 * 60 * 1000
    if (Date.now() - new Date(activeSession.lastHeartbeatAt).getTime() > staleThresholdMs) {
      await prisma.activeVideoSession.delete({ where: { sessionId } }).catch(() => {})
      throw new ConflictError('Playback session expired due to inactivity. Please reload to resume.')
    }

    // Refresh heartbeat
    await prisma.activeVideoSession.update({
      where: { sessionId },
      data: { lastHeartbeatAt: new Date() }
    })

    return successResponse(res, { active: true }, 'Session heartbeat acknowledged')
  } catch (err) {
    next(err)
  }
}

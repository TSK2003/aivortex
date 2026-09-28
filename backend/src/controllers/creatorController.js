import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/appError.js'
import s3Service from '../services/s3Service.js'

// 1. Get Assigned Courses for Creator
export async function getAssignedCourses(req, res, next) {
  try {
    const creatorId = req.user.id

    const assignments = await prisma.courseCreator.findMany({
      where: { creatorId },
      include: {
        course: {
          include: {
            playlists: {
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
            }
          }
        }
      }
    })

    const courses = assignments.map((a) => {
      const c = a.course
      let totalLessons = 0
      let publishedLessons = 0
      c.playlists.forEach((p) => {
        totalLessons += p.lessons.length
        publishedLessons += p.lessons.filter((l) => l.status === 'PUBLISHED').length
      })
      return {
        ...c,
        modulesCount: c.playlists.length,
        lessonsCount: totalLessons,
        publishedLessonsCount: publishedLessons
      }
    })

    return successResponse(res, { courses })
  } catch (err) {
    next(err)
  }
}

// 2. Create Playlist (Object-Level Authorization Check)
export async function createPlaylist(req, res, next) {
  try {
    const creatorId = req.user.id
    const { courseId, title, description, orderIndex = 1 } = req.body

    if (!courseId || !title) {
      throw new BadRequestError('Course ID and Playlist title are required')
    }

    // Verify creator is assigned to this course (IDOR protection)
    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId, creatorId } }
      })
      if (!assignment) {
        throw new ForbiddenError('You are not authorized to create playlists for this course')
      }
    }

    const playlist = await prisma.playlist.create({
      data: {
        courseId,
        creatorId,
        title: title.trim(),
        description: description ? description.trim() : null,
        orderIndex: Number(orderIndex),
        status: 'PUBLISHED'
      }
    })

    return successResponse(res, { playlist }, 'Playlist created successfully', 201)
  } catch (err) {
    next(err)
  }
}

// 3. Upload Video / Register Lesson
export async function uploadVideo(req, res, next) {
  try {
    const creatorId = req.user.id
    const {
      playlistId,
      title,
      description,
      duration = '15:00',
      durationSeconds = 900,
      orderIndex = 1,
      videoUrl,
      s3Key,
      isPreview = false
    } = req.body

    if (!playlistId || !title) {
      throw new BadRequestError('Playlist ID and lesson title are required')
    }

    // Verify playlist belongs to a course assigned to creator
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { course: true }
    })

    if (!playlist) {
      throw new NotFoundError('Playlist not found')
    }

    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId: playlist.courseId, creatorId } }
      })
      if (!assignment) {
        throw new ForbiddenError('You are not authorized to upload lessons to this course')
      }
    }

    const lesson = await prisma.lesson.create({
      data: {
        playlistId,
        creatorId,
        title: title.trim(),
        description: description ? description.trim() : null,
        duration,
        durationSeconds: Number(durationSeconds),
        orderIndex: Number(orderIndex),
        videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        s3Key: s3Key || null,
        isPreview: Boolean(isPreview),
        status: 'UPLOADED'
      }
    })

    // Record initial status history
    await prisma.videoStatusHistory.create({
      data: {
        lessonId: lesson.id,
        toStatus: 'UPLOADED',
        changedById: creatorId,
        reason: 'Lesson asset uploaded by Creator'
      }
    })

    return successResponse(res, { lesson }, 'Video lesson uploaded to studio', 201)
  } catch (err) {
    next(err)
  }
}

// 4. Submit Video for Admin Verification
export async function submitVideoForReview(req, res, next) {
  try {
    const { lessonId } = req.params
    const creatorId = req.user.id

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: true }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    // Verify creator owns this lesson or is admin
    if (req.user.role !== 'ADMIN' && lesson.creatorId !== creatorId) {
      throw new ForbiddenError('You are not authorized to submit this lesson')
    }

    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.lesson.update({
        where: { id: lessonId },
        data: { status: 'SUBMITTED_FOR_REVIEW' }
      })

      await tx.videoStatusHistory.create({
        data: {
          lessonId,
          fromStatus: lesson.status,
          toStatus: 'SUBMITTED_FOR_REVIEW',
          changedById: creatorId,
          reason: 'Creator submitted video for Admin review'
        }
      })

      return l
    })

    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        action: 'VIDEO_SUBMITTED_FOR_REVIEW',
        entityType: 'Lesson',
        entityId: lessonId,
        details: `Creator ${req.user.email} submitted lesson ${lesson.title} for review`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { lesson: updated }, 'Video submitted to Admin review queue')
  } catch (err) {
    next(err)
  }
}

// 5. Creator Submissions Queue & Feedback History
export async function getCreatorSubmissions(req, res, next) {
  try {
    const creatorId = req.user.id

    const lessons = await prisma.lesson.findMany({
      where: { creatorId },
      orderBy: { updatedAt: 'desc' },
      include: {
        playlist: {
          include: {
            course: { select: { id: true, title: true } }
          }
        },
        verificationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    return successResponse(res, { submissions: lessons, count: lessons.length })
  } catch (err) {
    next(err)
  }
}

// 6. Creator Profile & Profile Change Requests
export async function getCreatorProfile(req, res, next) {
  try {
    const creatorId = req.user.id

    let profile = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
      include: {
        requests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!profile) {
      profile = await prisma.creatorProfile.create({
        data: {
          userId: creatorId,
          specialization: 'Technical Instructor',
          headline: 'Course Creator at ApexLearn',
          biography: ''
        },
        include: {
          requests: true
        }
      })
    }

    return successResponse(res, { profile })
  } catch (err) {
    next(err)
  }
}

export async function requestProfileChange(req, res, next) {
  try {
    const creatorId = req.user.id
    const { requestedBio, requestedHeadline, supportingUrl } = req.body

    if (!requestedBio && !requestedHeadline) {
      throw new BadRequestError('Either headline or bio must be provided for update request')
    }

    let profile = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId }
    })

    if (!profile) {
      profile = await prisma.creatorProfile.create({
        data: {
          userId: creatorId,
          specialization: 'Technical Instructor',
          headline: 'Course Creator at ApexLearn'
        }
      })
    }

    const request = await prisma.profileChangeRequest.create({
      data: {
        creatorProfileId: profile.id,
        requestedBio,
        requestedHeadline,
        supportingUrl,
        status: 'PENDING'
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        action: 'CREATOR_PROFILE_REQUEST_SUBMITTED',
        entityType: 'ProfileChangeRequest',
        entityId: request.id,
        details: `Creator ${req.user.email} submitted profile change request`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { request }, 'Profile update request submitted to Admin for review', 201)
  } catch (err) {
    next(err)
  }
}

// 7. S3 Direct Upload Presigned URL Generator
export async function getUploadPresignedUrl(req, res, next) {
  try {
    const { fileName, fileType, courseId } = req.body

    if (!fileName || !fileType) {
      throw new BadRequestError('File name and file type (MIME) are required')
    }

    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'application/pdf', 'image/jpeg', 'image/png']
    if (!allowedMimeTypes.includes(fileType.toLowerCase())) {
      throw new BadRequestError(`File type ${fileType} is not permitted. Allowed types: MP4, MOV, WebM, PDF, JPEG, PNG`)
    }

    const safeFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const objectKey = `uploads/courses/${courseId || 'general'}/${safeFileName}`

    const presignedResult = await s3Service.getPresignedUploadUrl(objectKey, fileType, 3600)
    const uploadUrl = typeof presignedResult === 'object' && presignedResult.uploadUrl
      ? presignedResult.uploadUrl
      : presignedResult
    const fileUrl = typeof uploadUrl === 'string'
      ? uploadUrl.split('?')[0]
      : `https://${process.env.AWS_S3_BUCKET || 'aivortex'}.s3.amazonaws.com/${objectKey}`

    return successResponse(res, {
      uploadUrl,
      objectKey,
      fileUrl
    }, 'Presigned S3 upload URL generated')
  } catch (err) {
    next(err)
  }
}

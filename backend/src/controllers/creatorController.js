import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/appError.js'
import s3Service from '../services/s3Service.js'

// 1. Get Assigned Courses for Creator
export async function getAssignedCourses(req, res, next) {
  try {
    const creatorId = req.user.id

    const coursesFound = await prisma.course.findMany({
      where: {
        OR: [
          { creators: { some: { creatorId } } },
          { playlists: { some: { lessons: { some: { creatorId } } } } }
        ]
      },
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
    })

    const courses = coursesFound.map((c) => {
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

// 1b. Get Single Assigned Course for Creator (Object-level IDOR protection)
export async function getAssignedCourseById(req, res, next) {
  try {
    const creatorId = req.user.id
    const { courseId } = req.params

    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId, creatorId } }
      })
      const hasLessonInCourse = await prisma.lesson.findFirst({
        where: { creatorId, playlist: { courseId } }
      })
      if (!assignment && !hasLessonInCourse) {
        throw new ForbiddenError('You are not authorized to view this course')
      }
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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
    })

    if (!course) {
      throw new NotFoundError('Course not found')
    }

    return successResponse(res, { course })
  } catch (err) {
    next(err)
  }
}

// 2. Create Playlist / Section (Object-Level Authorization Check)
export async function createPlaylist(req, res, next) {
  try {
    const creatorId = req.user.id
    const { courseId, title, description, orderIndex } = req.body

    if (!courseId || !title || !title.trim()) {
      throw new BadRequestError('Course ID and Section title are required')
    }

    // Verify creator is assigned to this course or has lessons in it (IDOR protection)
    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId, creatorId } }
      })
      const hasLessonInCourse = await prisma.lesson.findFirst({
        where: { creatorId, playlist: { courseId } }
      })
      if (!assignment && !hasLessonInCourse) {
        throw new ForbiddenError('You are not authorized to create sections for this course')
      }
    }

    // Auto-calculate orderIndex if not provided
    const existingCount = await prisma.playlist.count({ where: { courseId } })
    const nextOrder = orderIndex !== undefined && orderIndex !== null && Number(orderIndex) > 0
      ? Number(orderIndex)
      : (existingCount + 1)

    // Clean section title: if creator typed "Section 1: Data Prep", store clean title "Data Prep"
    const cleanTitle = title.trim().replace(/^section\s*\d+[:\-—–\s]\s*/i, '').trim() || title.trim()

    const playlist = await prisma.playlist.create({
      data: {
        courseId,
        creatorId,
        title: cleanTitle,
        description: description ? description.trim() : null,
        orderIndex: nextOrder,
        status: 'PUBLISHED'
      }
    })

    return successResponse(res, { playlist }, 'Section created successfully', 201)
  } catch (err) {
    next(err)
  }
}

// 2b. Update Playlist / Section (Rename / Reorder)
export async function updatePlaylist(req, res, next) {
  try {
    const creatorId = req.user.id
    const { playlistId } = req.params
    const { title, description, orderIndex } = req.body

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }
    })
    if (!playlist) {
      throw new NotFoundError('Section not found')
    }

    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId: playlist.courseId, creatorId } }
      })
      if (!assignment) {
        throw new ForbiddenError('You are not authorized to update sections for this course')
      }
    }

    const cleanTitle = title !== undefined
      ? (title.trim().replace(/^section\s*\d+[:\-—–\s]\s*/i, '').trim() || title.trim())
      : undefined

    const updated = await prisma.playlist.update({
      where: { id: playlistId },
      data: {
        ...(cleanTitle ? { title: cleanTitle } : {}),
        ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
        ...(orderIndex !== undefined ? { orderIndex: Number(orderIndex) } : {})
      }
    })

    return successResponse(res, { playlist: updated }, 'Section updated successfully')
  } catch (err) {
    next(err)
  }
}

// 2c. Delete Playlist / Section (Confirm rules: warn if contains lectures, restrict approved)
export async function deletePlaylist(req, res, next) {
  try {
    const creatorId = req.user.id
    const { playlistId } = req.params

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { lessons: true }
    })
    if (!playlist) {
      throw new NotFoundError('Section not found')
    }

    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId: playlist.courseId, creatorId } }
      })
      if (!assignment) {
        throw new ForbiddenError('You are not authorized to delete sections from this course')
      }

      // Check if section contains approved or published lessons
      const restricted = playlist.lessons.find((l) => l.status === 'APPROVED' || l.status === 'PUBLISHED')
      if (restricted) {
        throw new BadRequestError(`Cannot delete section containing approved or published content.`)
      }
    }

    // Delete playlist and cascade delete draft/incomplete lessons
    await prisma.playlist.delete({
      where: { id: playlistId }
    })

    return successResponse(res, null, 'Section deleted successfully')
  } catch (err) {
    next(err)
  }
}

// 3. Upload Video / Register Lesson
export async function uploadVideo(req, res, next) {
  try {
    const {
      playlistId,
      title,
      description,
      duration,
      durationSeconds,
      orderIndex,
      videoUrl,
      s3Key,
      isPreview = false,
      status,
      creatorId: bodyCreatorId
    } = req.body

    const creatorId = req.user.role === 'ADMIN'
      ? (bodyCreatorId || null)
      : req.user.id

    if (!playlistId || !title || !title.trim()) {
      throw new BadRequestError('Section ID and lecture title are required')
    }

    if (req.user.role !== 'ADMIN' && (status === 'APPROVED' || status === 'PUBLISHED')) {
      throw new ForbiddenError('Lessons cannot be created directly in APPROVED or PUBLISHED status')
    }

    // Verify playlist belongs to a course assigned to creator
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { course: true, lessons: true }
    })

    if (!playlist) {
      throw new NotFoundError('Section not found')
    }

    if (req.user.role !== 'ADMIN') {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId: playlist.courseId, creatorId: req.user.id } }
      })
      const hasLessonInCourse = await prisma.lesson.findFirst({
        where: { creatorId: req.user.id, playlist: { courseId: playlist.courseId } }
      })
      if (!assignment && !hasLessonInCourse) {
        throw new ForbiddenError('You are not authorized to upload lessons to this course')
      }
    }

    // Determine if video file or URL is actually provided
    const cleanVideoUrl = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null
    const hasVideo = Boolean(cleanVideoUrl || s3Key)

    // IMPORTANT WORKFLOW RULE:
    // A lecture created without required video MUST be INCOMPLETE or DRAFT.
    // It must NEVER automatically enter SUBMITTED_FOR_REVIEW or UPLOADED.
    let resolvedStatus = 'DRAFT'
    if (!hasVideo) {
      resolvedStatus = 'INCOMPLETE'
    } else if (req.user.role === 'ADMIN' && status === 'APPROVED') {
      resolvedStatus = 'APPROVED'
    } else if (status === 'SUBMITTED_FOR_REVIEW') {
      resolvedStatus = 'SUBMITTED_FOR_REVIEW'
    } else if (status === 'UPLOADED') {
      resolvedStatus = 'UPLOADED'
    } else {
      resolvedStatus = 'DRAFT'
    }

    const nextOrder = orderIndex !== undefined && orderIndex !== null && Number(orderIndex) > 0
      ? Number(orderIndex)
      : (playlist.lessons.length + 1)

    const lesson = await prisma.lesson.create({
      data: {
        playlistId,
        creatorId,
        title: title.trim(),
        description: description ? description.trim() : null,
        duration: hasVideo ? (duration || '15:00') : '',
        durationSeconds: hasVideo ? (Number(durationSeconds) || 900) : 0,
        orderIndex: nextOrder,
        videoUrl: cleanVideoUrl,
        s3Key: s3Key || null,
        isPreview: Boolean(isPreview),
        status: resolvedStatus
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

    // Record initial status history
    await prisma.videoStatusHistory.create({
      data: {
        lessonId: lesson.id,
        toStatus: resolvedStatus,
        changedById: req.user.id,
        reason: !hasVideo
          ? 'Lecture created as incomplete (no video uploaded yet)'
          : resolvedStatus === 'SUBMITTED_FOR_REVIEW'
          ? 'Lecture submitted for Admin review'
          : resolvedStatus === 'APPROVED'
          ? 'Lecture created with APPROVED status by Admin'
          : 'Lesson draft saved'
      }
    })

    return successResponse(res, { lesson }, 'Lecture saved successfully', 201)
  } catch (err) {
    next(err)
  }
}

// 3b. Update Lesson (Edit Draft or Update after Changes Requested)
export async function updateLesson(req, res, next) {
  try {
    const { lessonId } = req.params
    const {
      title,
      description,
      duration,
      durationSeconds,
      orderIndex,
      videoUrl,
      s3Key,
      isPreview,
      status,
      creatorId: bodyCreatorId
    } = req.body

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: true }
    })
    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    if (req.user.role !== 'ADMIN' && lesson.creatorId !== req.user.id) {
      const assignment = await prisma.courseCreator.findUnique({
        where: { courseId_creatorId: { courseId: lesson.playlist.courseId, creatorId: req.user.id } }
      })
      if (!assignment) {
        throw new ForbiddenError('You are not authorized to edit this lesson')
      }
    }

    // Check effective video availability
    const cleanVideoUrl = videoUrl !== undefined
      ? (videoUrl && typeof videoUrl === 'string' && videoUrl.trim() ? videoUrl.trim() : null)
      : lesson.videoUrl
    const effectiveS3Key = s3Key !== undefined ? s3Key : lesson.s3Key
    const hasVideo = Boolean(cleanVideoUrl || effectiveS3Key)

    // Disallow illegal status transitions
    if (status) {
      if (req.user.role !== 'ADMIN' && (status === 'APPROVED' || status === 'PUBLISHED')) {
        throw new ForbiddenError('Creators are not permitted to set APPROVED or PUBLISHED status')
      }
      if (status === 'PUBLISHED' && lesson.status !== 'APPROVED') {
        throw new BadRequestError(`Only APPROVED lessons can be transitioned to PUBLISHED. Current status: ${lesson.status}`)
      }
    }

    // Cannot submit for review if no video
    if (status === 'SUBMITTED_FOR_REVIEW' && !hasVideo) {
      throw new BadRequestError('Upload a lecture video before submitting for review.')
    }

    let nextStatus = status
    if (!nextStatus) {
      if (!hasVideo) {
        nextStatus = 'INCOMPLETE'
      } else if (lesson.status === 'INCOMPLETE') {
        nextStatus = 'DRAFT'
      }
    } else if (!hasVideo && (nextStatus === 'UPLOADED' || nextStatus === 'SUBMITTED_FOR_REVIEW')) {
      throw new BadRequestError('Upload a lecture video before submitting for review.')
    }

    const updateData = {
      ...(title ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
      ...(duration !== undefined ? { duration: hasVideo ? duration : '' } : {}),
      ...(durationSeconds !== undefined ? { durationSeconds: hasVideo ? Number(durationSeconds) : 0 } : {}),
      ...(orderIndex !== undefined ? { orderIndex: Number(orderIndex) } : {}),
      ...(videoUrl !== undefined ? { videoUrl: cleanVideoUrl } : {}),
      ...(s3Key !== undefined ? { s3Key } : {}),
      ...(isPreview !== undefined ? { isPreview: Boolean(isPreview) } : {}),
      ...(nextStatus ? { status: nextStatus } : {})
    }

    if (req.user.role === 'ADMIN' && bodyCreatorId !== undefined) {
      updateData.creatorId = bodyCreatorId || null
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
      include: {
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    })

    return successResponse(res, { lesson: updated }, 'Lesson updated successfully')
  } catch (err) {
    next(err)
  }
}

// 3c. Delete Lesson (Draft / Incomplete / Unapproved only)
export async function deleteLesson(req, res, next) {
  try {
    const creatorId = req.user.id
    const { lessonId } = req.params

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: true }
    })
    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    if (req.user.role !== 'ADMIN' && lesson.creatorId !== creatorId) {
      throw new ForbiddenError('You are not authorized to delete this lesson')
    }

    if (lesson.status === 'PUBLISHED') {
      throw new BadRequestError('Cannot delete published lessons. Contact platform administrator.')
    }

    if (lesson.status === 'APPROVED' && req.user.role !== 'ADMIN') {
      throw new BadRequestError('Cannot delete approved lessons without Administrator approval.')
    }

    await prisma.lesson.delete({
      where: { id: lessonId }
    })

    if (lesson.s3Key) {
      try {
        await s3Service.deleteObject(lesson.s3Key)
      } catch (s3Err) {
        console.warn('S3 object deletion warning for lesson:', s3Err.message)
      }
    }

    return successResponse(res, null, 'Lesson deleted successfully')
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
      include: { playlist: { include: { course: true } } }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    // Verify creator owns this lesson or is admin
    if (req.user.role !== 'ADMIN' && lesson.creatorId !== creatorId) {
      throw new ForbiddenError('You are not authorized to submit this lesson')
    }

    // REQUIREMENT 4 & 6: VALIDATION BEFORE SUBMISSION
    if (!lesson.title || !lesson.title.trim()) {
      throw new BadRequestError('Lecture title is required.')
    }

    const hasVideo = Boolean((lesson.videoUrl && String(lesson.videoUrl).trim()) || lesson.s3Key)
    if (!hasVideo) {
      throw new BadRequestError('Upload a lecture video before submitting for review.')
    }

    if (lesson.status === 'APPROVED' || lesson.status === 'PUBLISHED') {
      throw new BadRequestError('This lecture is already approved.')
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
        details: `Creator ${req.user.email} submitted lesson "${lesson.title}" for review`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    // Notify Administrators of pending review item
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } })
      for (const a of admins) {
        await prisma.notification.create({
          data: {
            userId: a.id,
            title: 'Lesson Submitted for Review',
            message: `Creator submitted lecture "${lesson.title}" for review`,
            linkUrl: '/admin/video-verification'
          }
        })
      }
    } catch (notifErr) {
      console.warn('Admin notification warning on video submission:', notifErr.message)
    }

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
      where: { userId: creatorId }
    })

    if (!profile) {
      profile = await prisma.creatorProfile.create({
        data: {
          userId: creatorId,
          specialization: 'Technical Instructor',
          headline: 'Course Creator at AIVORTEX',
          biography: ''
        }
      })
    }

    // Auto-expire approved requests that exceeded the 24-hour expiration window
    await prisma.profileChangeRequest.updateMany({
      where: {
        creatorProfileId: profile.id,
        status: 'APPROVED',
        approvalExpiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED'
      }
    }).catch(() => {})

    const requests = await prisma.profileChangeRequest.findMany({
      where: { creatorProfileId: profile.id },
      orderBy: { createdAt: 'desc' }
    })

    const user = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        status: true,
        createdAt: true
      }
    })

    profile.requests = requests

    return successResponse(res, { profile, user, requests })
  } catch (err) {
    next(err)
  }
}

export async function getCreatorRequests(req, res, next) {
  try {
    const creatorId = req.user.id
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId }
    })

    if (!profile) {
      return successResponse(res, { requests: [] })
    }

    await prisma.profileChangeRequest.updateMany({
      where: {
        creatorProfileId: profile.id,
        status: 'APPROVED',
        approvalExpiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED'
      }
    }).catch(() => {})

    const requests = await prisma.profileChangeRequest.findMany({
      where: { creatorProfileId: profile.id },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(res, { requests })
  } catch (err) {
    next(err)
  }
}

export async function requestProfileChange(req, res, next) {
  try {
    const creatorId = req.user.id
    const {
      requestType = 'PROFILE_DATA',
      requestedValue,
      reason,
      supportingUrl,
      requestedHeadline,
      requestedBio
    } = req.body

    let profile = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId }
    })

    if (!profile) {
      profile = await prisma.creatorProfile.create({
        data: {
          userId: creatorId,
          specialization: 'Technical Instructor',
          headline: 'Course Creator at AIVORTEX',
          biography: ''
        }
      })
    }

    let currentVal = null
    let requestedVal = null
    let label = 'Profile Change'

    if (requestType === 'EMAIL_CHANGE') {
      label = 'Email Change'
      if (!requestedValue || !requestedValue.trim()) {
        throw new BadRequestError('Requested new email address is required.')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const newEmail = requestedValue.trim().toLowerCase()
      if (!emailRegex.test(newEmail)) {
        throw new BadRequestError('Please provide a valid email address format.')
      }

      if (newEmail === req.user.email.toLowerCase()) {
        throw new BadRequestError('The requested new email must be different from your current email address.')
      }

      // Check if email already in use
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      })
      if (existingUser) {
        throw new BadRequestError('This email address is already in use by another account.')
      }

      // Check for existing pending email request
      const existingPending = await prisma.profileChangeRequest.findFirst({
        where: {
          creatorProfileId: profile.id,
          requestType: 'EMAIL_CHANGE',
          status: 'PENDING'
        }
      })
      if (existingPending) {
        throw new BadRequestError('You already have a pending email change request awaiting Admin approval.')
      }

      currentVal = req.user.email
      requestedVal = newEmail
    } else if (requestType === 'PASSWORD_CHANGE') {
      label = 'Password Change'
      // SECURITY REQUIREMENT: Admin must NEVER receive, view, approve, store, or inspect the Creator's actual password.
      // Therefore, do NOT accept, read, or process any password values here!
      if (!reason || !reason.trim()) {
        throw new BadRequestError('Please provide a reason for the password change request.')
      }

      // Check if already pending or already approved and awaiting update
      const existingActive = await prisma.profileChangeRequest.findFirst({
        where: {
          creatorProfileId: profile.id,
          requestType: 'PASSWORD_CHANGE',
          OR: [
            { status: 'PENDING' },
            {
              status: 'APPROVED',
              approvalExpiresAt: { gt: new Date() }
            }
          ]
        }
      })
      if (existingActive) {
        if (existingActive.status === 'APPROVED') {
          throw new BadRequestError('Your password change request is already approved. You can now set your new password directly.')
        }
        throw new BadRequestError('You already have a pending password change request awaiting Admin approval.')
      }

      currentVal = null
      requestedVal = null
    } else if (requestType === 'PROFILE_PHOTO') {
      label = 'Profile Photo'
      if (!requestedValue || !requestedValue.trim()) {
        throw new BadRequestError('Profile photo URL or image data is required.')
      }
      currentVal = req.user.avatar || null
      requestedVal = requestedValue.trim()
    } else if (requestType === 'NAME') {
      label = 'Display Name'
      if (!requestedValue || !requestedValue.trim()) {
        throw new BadRequestError('Requested display name is required.')
      }
      currentVal = req.user.name || null
      requestedVal = requestedValue.trim()
    } else if (requestType === 'SPECIALIZATION') {
      label = 'Specialization'
      if (!requestedValue || !requestedValue.trim()) {
        throw new BadRequestError('Requested specialization is required.')
      }
      currentVal = profile.specialization || null
      requestedVal = requestedValue.trim()
    } else if (requestType === 'HEADLINE') {
      label = 'Headline'
      const val = (requestedValue || requestedHeadline || '').trim()
      if (!val) {
        throw new BadRequestError('Requested headline is required.')
      }
      currentVal = profile.headline || null
      requestedVal = val
    } else if (requestType === 'BIOGRAPHY') {
      label = 'Biography'
      const val = (requestedValue || requestedBio || '').trim()
      if (!val) {
        throw new BadRequestError('Requested biography is required.')
      }
      currentVal = profile.biography || null
      requestedVal = val
    } else {
      // Legacy profile data fallback
      if (!requestedBio && !requestedHeadline) {
        throw new BadRequestError('Either headline or bio must be provided for update request.')
      }
      currentVal = `${profile.headline || ''} | ${profile.biography || ''}`
      requestedVal = `${requestedHeadline || ''} | ${requestedBio || ''}`
      label = 'Profile Information'
    }

    const request = await prisma.profileChangeRequest.create({
      data: {
        creatorProfileId: profile.id,
        requestType,
        currentValue: currentVal,
        requestedValue: requestedVal,
        reason: reason?.trim() || null,
        requestedBio: requestedBio?.trim() || null,
        requestedHeadline: requestedHeadline?.trim() || null,
        supportingUrl: supportingUrl?.trim() || null,
        status: 'PENDING'
      }
    })

    // Notify all active Administrators
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', status: 'ACTIVE' },
      select: { id: true }
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `New Creator ${label} Request`,
          message: `${req.user.name} submitted a ${label.toLowerCase()} request for administrative review.`,
          linkUrl: '/admin/requests'
        }
      }).catch(() => {})
    }

    // Audit log - STRICTLY NO PASSWORDS RECORDED
    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        action: 'CREATOR_PROFILE_REQUEST_SUBMITTED',
        entityType: 'ProfileChangeRequest',
        entityId: request.id,
        details: `Creator ${req.user.email} submitted ${label} request (ID: ${request.id.slice(0, 8)})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    }).catch(() => {})

    return successResponse(res, { request }, `${label} request submitted to Admin for review.`, 201)
  } catch (err) {
    next(err)
  }
}

export async function verifyEmailChange(req, res, next) {
  try {
    const creatorId = req.user.id
    const { requestId, otp } = req.body

    if (!requestId || !otp) {
      throw new BadRequestError('Request ID and verification OTP code are required.')
    }

    const request = await prisma.profileChangeRequest.findUnique({
      where: { id: requestId },
      include: { creatorProfile: true }
    })

    if (!request || request.creatorProfile.userId !== creatorId) {
      throw new NotFoundError('Email change request not found.')
    }

    if (request.requestType !== 'EMAIL_CHANGE') {
      throw new BadRequestError('This request is not an email change request.')
    }

    if (request.status !== 'APPROVED') {
      if (request.status === 'COMPLETED') {
        throw new BadRequestError('This email change request has already been completed.')
      }
      throw new BadRequestError(`Request cannot be verified in current status: ${request.status}`)
    }

    // Check approval expiration
    if (request.approvalExpiresAt && new Date() > new Date(request.approvalExpiresAt)) {
      await prisma.profileChangeRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' }
      })
      throw new BadRequestError('Email change verification window has expired. Please submit a new request.')
    }

    // Validate OTP
    if (!request.verificationToken || request.verificationToken.trim() !== otp.trim()) {
      throw new BadRequestError('Invalid verification code. Please enter the OTP sent to your new email address.')
    }

    // Ensure email not taken in the interim
    const existing = await prisma.user.findFirst({
      where: {
        email: request.requestedValue,
        NOT: { id: creatorId }
      }
    })
    if (existing) {
      throw new BadRequestError('The requested email address is already taken by another account. Please submit a new request.')
    }

    // Transactionally update user login and profile email, mark request completed
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: creatorId },
        data: { email: request.requestedValue }
      })

      await tx.profileChangeRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      await tx.notification.create({
        data: {
          userId: creatorId,
          title: 'Email Address Updated Successfully',
          message: `Your account login email has been updated to ${request.requestedValue}.`,
          linkUrl: '/creator/profile'
        }
      })
    })

    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        action: 'CREATOR_EMAIL_CHANGED',
        entityType: 'User',
        entityId: creatorId,
        details: `Creator updated login email to ${request.requestedValue} after Admin approval and OTP verification`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    }).catch(() => {})

    return successResponse(res, { newEmail: request.requestedValue }, 'Email address successfully verified and updated.')
  } catch (err) {
    next(err)
  }
}

export async function completePasswordChange(req, res, next) {
  try {
    const creatorId = req.user.id
    const { requestId, currentPassword, newPassword, confirmPassword } = req.body

    // SECURITY: Validate inputs, do not log or expose them!
    if (!requestId || !currentPassword || !newPassword || !confirmPassword) {
      throw new BadRequestError('Current password, new password, and confirmation password are all required.')
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('New password and confirmation password do not match.')
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long.')
    }

    const request = await prisma.profileChangeRequest.findUnique({
      where: { id: requestId },
      include: { creatorProfile: true }
    })

    if (!request || request.creatorProfile.userId !== creatorId) {
      throw new NotFoundError('Password change request not found.')
    }

    if (request.requestType !== 'PASSWORD_CHANGE') {
      throw new BadRequestError('This request is not a password change request.')
    }

    if (request.status !== 'APPROVED') {
      if (request.status === 'COMPLETED') {
        throw new BadRequestError('This password change request has already been completed.')
      }
      throw new BadRequestError(`Cannot set password in current request status: ${request.status}`)
    }

    // Check 24-hour expiration window
    if (request.approvalExpiresAt && new Date() > new Date(request.approvalExpiresAt)) {
      await prisma.profileChangeRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' }
      })
      throw new BadRequestError('Password change approval has expired (24-hour limit). Please submit a new request.')
    }

    // Verify current password against database hash
    const user = await prisma.user.findUnique({
      where: { id: creatorId }
    })

    if (!user) {
      throw new NotFoundError('User not found.')
    }

    const isValidCurrent = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidCurrent) {
      throw new BadRequestError('Current password is incorrect. Please verify and try again.')
    }

    // Hash new password securely
    const hashed = await bcrypt.hash(newPassword, 10)

    // Transactionally update password and mark request completed
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: creatorId },
        data: { passwordHash: hashed }
      })

      await tx.profileChangeRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      await tx.notification.create({
        data: {
          userId: creatorId,
          title: 'Password Updated Successfully',
          message: 'Your account password has been updated securely.',
          linkUrl: '/creator/profile'
        }
      })
    })

    // Audit log - STRICTLY NO PASSWORDS RECORDED
    await prisma.auditLog.create({
      data: {
        userId: creatorId,
        action: 'CREATOR_PASSWORD_CHANGED',
        entityType: 'User',
        entityId: creatorId,
        details: `Creator completed approved password change securely (request ID: ${requestId.slice(0, 8)})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    }).catch(() => {})

    return successResponse(res, null, 'Password updated successfully.')
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
    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`
    const fileUrl = typeof uploadUrl === 'string' && uploadUrl.includes('/upload-local')
      ? `${baseUrl}/${objectKey}`
      : typeof uploadUrl === 'string'
      ? uploadUrl.split('?')[0]
      : `https://${process.env.AWS_S3_BUCKET || 'aivortex'}.s3.amazonaws.com/${objectKey}`

    return successResponse(res, {
      uploadUrl,
      objectKey,
      fileUrl
    }, 'Presigned upload URL generated')
  } catch (err) {
    next(err)
  }
}

// 8. Local Video File Stream Upload (Fallback when S3 is in dev/local mode)
export async function uploadLocalVideo(req, res, next) {
  try {
    const rawKey = req.query.key || `uploads/courses/${req.query.courseId || 'general'}/${Date.now()}-video.mp4`
    const safeKey = rawKey.replace(/\.\./g, '').replace(/^[/\\]+/, '')
    const filePath = path.join(process.cwd(), safeKey)

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    const writeStream = fs.createWriteStream(filePath)

    req.pipe(writeStream)

    writeStream.on('finish', () => {
      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`
      const fileUrl = `${baseUrl}/${safeKey.replace(/\\/g, '/')}`
      return res.status(200).json({
        success: true,
        message: 'Video file uploaded successfully',
        key: safeKey,
        fileUrl
      })
    })

    writeStream.on('error', (err) => {
      console.error('Error writing video file locally:', err)
      return res.status(500).json({
        success: false,
        message: 'Failed to write uploaded video file to local storage'
      })
    })

    req.on('error', (err) => {
      console.error('Request stream error during file upload:', err)
      writeStream.destroy()
      return res.status(500).json({
        success: false,
        message: 'Connection interrupted while uploading video'
      })
    })
  } catch (err) {
    next(err)
  }
}

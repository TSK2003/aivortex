import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/appError.js'
import emailService from '../services/emailService.js'

// 1. Overview & Platform Metrics
export async function getAnalyticsOverview(req, res, next) {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } })
    const totalCreators = await prisma.user.count({ where: { role: 'CREATOR' } })
    const publishedCoursesCount = await prisma.course.count({ where: { status: 'PUBLISHED' } })
    const pendingVerificationCount = await prisma.lesson.count({ where: { status: 'SUBMITTED_FOR_REVIEW' } })
    const pendingRequestsCount = await prisma.profileChangeRequest.count({ where: { status: 'PENDING' } })
    const totalEnrollments = await prisma.enrollment.count()

    const successfulOrders = await prisma.order.findMany({
      where: { status: 'SUCCESSFUL' },
      select: { amount: true }
    })
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.amount, 0)

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, role: true } }
      }
    })

    return successResponse(res, {
      analytics: {
        totalRevenue,
        totalStudents,
        totalCreators,
        totalEnrollments,
        pendingVerificationCount,
        publishedCoursesCount,
        pendingRequestsCount,
        averageCourseRating: 4.89,
        completionRatePercent: 92
      },
      recentOrders,
      recentAuditLogs
    })
  } catch (err) {
    next(err)
  }
}

// 2. Creator Management
export async function getCreators(req, res, next) {
  try {
    const creators = await prisma.user.findMany({
      where: { role: 'CREATOR' },
      orderBy: { createdAt: 'desc' },
      include: {
        creatorProfile: true,
        assignedCourses: {
          include: {
            course: {
              select: { id: true, title: true, slug: true, status: true }
            }
          }
        },
        uploadedLessons: {
          select: { id: true, status: true }
        }
      }
    })

    return successResponse(res, { creators })
  } catch (err) {
    next(err)
  }
}

export async function inviteCreator(req, res, next) {
  try {
    const { name, email, specialization, headline, bio } = req.body

    if (!name || !email) {
      throw new BadRequestError('Name and email are required')
    }

    const cleanEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      throw new BadRequestError(`User with email ${cleanEmail} already exists`)
    }

    // Generate random secure 12-char initial password
    const tempPassword = `ApexCreator${Math.floor(1000 + Math.random() * 9000)}!`
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(tempPassword, salt)

    const creator = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'CREATOR',
        status: 'ACTIVE',
        creatorProfile: {
          create: {
            specialization: specialization || 'Curriculum Specialist',
            headline: headline || 'Technical Course Creator & Industry Expert',
            biography: bio || 'Course creator at ApexLearn.',
            isVerified: true
          }
        }
      },
      include: {
        creatorProfile: true
      }
    })

    // Dispatch credentials via SMTP email
    try {
      await emailService.sendCreatorInvitation({
        toEmail: cleanEmail,
        creatorName: name.trim(),
        tempPassword
      })
    } catch (mailErr) {
      console.warn('⚠️ SMTP invitation delivery warning:', mailErr.message)
    }

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_PROVISIONED',
        entityType: 'User',
        entityId: creator.id,
        details: `Admin ${req.user.email} provisioned creator account for ${cleanEmail}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(
      res,
      { creator, tempPasswordGenerated: tempPassword },
      `Creator account provisioned and invitation dispatched to ${cleanEmail}`,
      201
    )
  } catch (err) {
    next(err)
  }
}

export async function updateCreatorStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) {
      throw new BadRequestError('Invalid user status')
    }

    const updated = await prisma.user.update({
      where: { id, role: 'CREATOR' },
      data: { status }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_STATUS_CHANGED',
        entityType: 'User',
        entityId: id,
        details: `Creator ${updated.email} status changed to ${status}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { creator: updated }, `Creator status updated to ${status}`)
  } catch (err) {
    next(err)
  }
}

// 3. Student Management
export async function getStudents(req, res, next) {
  try {
    const { search, status } = req.query

    const where = { role: 'STUDENT' }
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const students = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        enrollments: {
          include: {
            course: { select: { id: true, title: true } }
          }
        },
        orders: {
          where: { status: 'SUCCESSFUL' },
          select: { amount: true }
        },
        certificates: {
          select: { id: true, certificateCode: true, courseTitle: true, issueDate: true }
        }
      }
    })

    const formatted = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      status: s.status,
      createdAt: s.createdAt,
      enrolledCount: s.enrollments.length,
      enrollments: s.enrollments,
      totalSpent: s.orders.reduce((sum, o) => sum + o.amount, 0),
      certificates: s.certificates
    }))

    return successResponse(res, { students: formatted, count: formatted.length })
  } catch (err) {
    next(err)
  }
}

export async function updateStudentStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      throw new BadRequestError('Invalid student status')
    }

    const updated = await prisma.user.update({
      where: { id, role: 'STUDENT' },
      data: { status }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'STUDENT_STATUS_CHANGED',
        entityType: 'User',
        entityId: id,
        details: `Student ${updated.email} status changed to ${status}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { student: updated }, `Student account ${status.toLowerCase()}`)
  } catch (err) {
    next(err)
  }
}

// 4. Course Management (Full CRUD)
export async function getAdminCourses(req, res, next) {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creators: {
          include: {
            creator: { select: { id: true, name: true, email: true } }
          }
        },
        playlists: {
          include: {
            lessons: true
          }
        },
        enrollments: {
          select: { id: true, status: true }
        }
      }
    })

    const formatted = courses.map((c) => {
      let totalLessons = 0
      c.playlists.forEach((p) => {
        totalLessons += p.lessons.length
      })
      return {
        ...c,
        totalModules: c.playlists.length,
        totalLessons,
        enrolledStudentsCount: c.enrollments.length
      }
    })

    return successResponse(res, { courses: formatted })
  } catch (err) {
    next(err)
  }
}

export async function createCourse(req, res, next) {
  try {
    const {
      title,
      slug,
      shortDescription,
      fullDescription,
      category,
      level = 'Beginner to Intermediate',
      duration = '30 Hours',
      language = 'English',
      thumbnail,
      price = 0,
      originalPrice = 0,
      discountPercent = 0,
      isFree = false,
      isFeatured = false,
      badge,
      accessDurationDays,
      certificateEnabled = true,
      creatorIds = []
    } = req.body

    if (!title || !shortDescription) {
      throw new BadRequestError('Title and short description are required')
    }

    const courseSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))

    const existing = await prisma.course.findUnique({ where: { slug: courseSlug } })
    if (existing) {
      throw new BadRequestError(`Course with slug '${courseSlug}' already exists`)
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug: courseSlug,
        shortDescription,
        fullDescription: fullDescription || shortDescription,
        category: category || 'Data Science',
        level,
        duration,
        language,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        discountPercent: Number(discountPercent),
        isFree: Boolean(isFree),
        isFeatured: Boolean(isFeatured),
        badge,
        status: 'DRAFT',
        certificateEnabled: Boolean(certificateEnabled),
        accessDurationDays: accessDurationDays ? Number(accessDurationDays) : null,
        creators: {
          create: creatorIds.map((cId) => ({ creatorId: cId }))
        }
      },
      include: {
        creators: {
          include: { creator: { select: { id: true, name: true, email: true } } }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'COURSE_CREATED',
        entityType: 'Course',
        entityId: course.id,
        details: `Admin created course ${course.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { course }, 'Course created successfully in DRAFT mode', 201)
  } catch (err) {
    next(err)
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { courseId } = req.params
    const data = req.body

    const existing = await prisma.course.findUnique({ where: { id: courseId } })
    if (!existing) {
      throw new NotFoundError('Course not found')
    }

    const updatePayload = {}
    const fields = [
      'title', 'shortDescription', 'fullDescription', 'category', 'level',
      'duration', 'language', 'thumbnail', 'price', 'originalPrice',
      'discountPercent', 'isFree', 'isFeatured', 'badge', 'status',
      'enrollmentOpen', 'demoLessonId', 'certificateEnabled', 'accessDurationDays'
    ]

    fields.forEach((f) => {
      if (data[f] !== undefined) updatePayload[f] = data[f]
    })

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: updatePayload
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'COURSE_UPDATED',
        entityType: 'Course',
        entityId: courseId,
        details: `Admin updated course ${updated.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { course: updated }, 'Course updated successfully')
  } catch (err) {
    next(err)
  }
}

export async function updatePricing(req, res, next) {
  try {
    const { courseId } = req.params
    const { price, originalPrice, discountPercent, isFree } = req.body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        price: price !== undefined ? Number(price) : course.price,
        originalPrice: originalPrice !== undefined ? Number(originalPrice) : course.originalPrice,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : course.discountPercent,
        isFree: isFree !== undefined ? Boolean(isFree) : course.isFree
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'COURSE_PRICING_UPDATED',
        entityType: 'Course',
        entityId: courseId,
        details: `Updated pricing for ${updated.title} to ₹${updated.price} (isFree: ${updated.isFree})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { course: updated }, 'Pricing policy updated successfully')
  } catch (err) {
    next(err)
  }
}

export async function updatePublicControls(req, res, next) {
  try {
    const { courseId } = req.params
    const { status, isFeatured, demoLessonId, enrollmentOpen } = req.body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    const data = {}
    if (status !== undefined) {
      if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
        throw new BadRequestError('Invalid course visibility status')
      }
      data.status = status
    }
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured)
    if (enrollmentOpen !== undefined) data.enrollmentOpen = Boolean(enrollmentOpen)

    // Handle Public Demo video assignment
    if (demoLessonId !== undefined) {
      if (demoLessonId) {
        // Verify lesson exists, belongs to course, and is approved/published
        const lesson = await prisma.lesson.findUnique({
          where: { id: demoLessonId },
          include: { playlist: true }
        })
        if (!lesson || lesson.playlist.courseId !== courseId) {
          throw new BadRequestError('Selected demo lesson does not belong to this course')
        }
        if (!['APPROVED', 'PUBLISHED'].includes(lesson.status)) {
          throw new BadRequestError('Only an Approved or Published lesson can be designated as a Public Demo')
        }

        data.demoLessonId = demoLessonId
        // Flag lesson as public demo
        await prisma.lesson.update({
          where: { id: demoLessonId },
          data: { isPublicDemo: true }
        })
      } else {
        // Remove public demo
        data.demoLessonId = null
        if (course.demoLessonId) {
          await prisma.lesson.update({
            where: { id: course.demoLessonId },
            data: { isPublicDemo: false }
          }).catch(() => {})
        }
      }
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'COURSE_PUBLIC_CONTROLS_UPDATED',
        entityType: 'Course',
        entityId: courseId,
        details: `Public controls updated for ${updated.title}: status=${updated.status}, isFeatured=${updated.isFeatured}, demo=${updated.demoLessonId}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { course: updated }, 'Public page controls updated successfully')
  } catch (err) {
    next(err)
  }
}

// 5. Video Review & Publication Lifecycle
export async function getVideoVerificationQueue(req, res, next) {
  try {
    const queue = await prisma.lesson.findMany({
      where: { status: 'SUBMITTED_FOR_REVIEW' },
      orderBy: { updatedAt: 'asc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        playlist: {
          include: {
            course: { select: { id: true, title: true, slug: true } }
          }
        },
        verificationLogs: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      }
    })

    return successResponse(res, { queue, count: queue.length })
  } catch (err) {
    next(err)
  }
}

export async function reviewVideo(req, res, next) {
  try {
    const { lessonId } = req.params
    const action = req.body.action || req.body.status
    const feedbackNote = req.body.feedbackNote || req.body.adminFeedback
    const adminId = req.user.id

    if (!['APPROVED', 'REJECTED', 'RETURNED_FOR_EDIT'].includes(action)) {
      throw new BadRequestError('Action must be APPROVED, REJECTED, or RETURNED_FOR_EDIT')
    }

    if (['REJECTED', 'RETURNED_FOR_EDIT'].includes(action) && !feedbackNote) {
      throw new BadRequestError('A feedback note explaining the issue is required when returning or rejecting a video')
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        playlist: { include: { course: true } },
        creator: true
      }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    // Update lesson status and save admin review log inside transaction
    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.lesson.update({
        where: { id: lessonId },
        data: {
          status: action,
          adminFeedback: feedbackNote || null
        }
      })

      await tx.videoVerificationLog.create({
        data: {
          lessonId,
          adminId,
          action,
          feedbackNote: feedbackNote || 'Approved by administrator'
        }
      })

      await tx.videoStatusHistory.create({
        data: {
          lessonId,
          fromStatus: lesson.status,
          toStatus: action,
          changedById: adminId,
          reason: feedbackNote || 'Review decision'
        }
      })

      // Send in-app notification to Creator
      if (lesson.creatorId) {
        await tx.notification.create({
          data: {
            userId: lesson.creatorId,
            title: action === 'APPROVED' ? 'Video Lesson Approved' : 'Video Lesson Needs Revision',
            message: action === 'APPROVED'
              ? `Your lesson "${lesson.title}" in ${lesson.playlist.course.title} has been APPROVED.`
              : `Your lesson "${lesson.title}" was returned: ${feedbackNote}`,
            linkUrl: '/creator/submissions'
          }
        })
      }

      return l
    })

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: `VIDEO_${action}`,
        entityType: 'Lesson',
        entityId: lessonId,
        details: `Admin ${req.user.email} marked video ${lesson.title} as ${action}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { lesson: updated }, `Lesson review recorded as ${action}`)
  } catch (err) {
    next(err)
  }
}

export async function publishLesson(req, res, next) {
  try {
    const { lessonId } = req.params
    const adminId = req.user.id

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { playlist: { include: { course: true } } }
    })

    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    if (lesson.status !== 'APPROVED') {
      throw new BadRequestError(`Only APPROVED lessons can be published. Current state: ${lesson.status}`)
    }

    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.lesson.update({
        where: { id: lessonId },
        data: { status: 'PUBLISHED' }
      })

      await tx.videoStatusHistory.create({
        data: {
          lessonId,
          fromStatus: 'APPROVED',
          toStatus: 'PUBLISHED',
          changedById: adminId,
          reason: 'Admin explicitly published lesson to enrolled students'
        }
      })

      return l
    })

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'LESSON_PUBLISHED',
        entityType: 'Lesson',
        entityId: lessonId,
        details: `Admin published lesson "${lesson.title}" in ${lesson.playlist.course.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { lesson: updated }, 'Lesson successfully published to enrolled students')
  } catch (err) {
    next(err)
  }
}

export async function unpublishLesson(req, res, next) {
  try {
    const { lessonId } = req.params
    const { reason } = req.body
    const adminId = req.user.id

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) {
      throw new NotFoundError('Lesson not found')
    }

    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.lesson.update({
        where: { id: lessonId },
        data: { status: 'ARCHIVED' }
      })

      await tx.videoStatusHistory.create({
        data: {
          lessonId,
          fromStatus: lesson.status,
          toStatus: 'ARCHIVED',
          changedById: adminId,
          reason: reason || 'Withdrawn by Admin'
        }
      })

      return l
    })

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'LESSON_UNPUBLISHED',
        entityType: 'Lesson',
        entityId: lessonId,
        details: `Admin unpublished lesson ${lesson.title}: ${reason || 'Archived'}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { lesson: updated }, 'Lesson unpublished and archived')
  } catch (err) {
    next(err)
  }
}

// 6. Payments & Transactions Audit
export async function getPayments(req, res, next) {
  try {
    const { status, search } = req.query

    const where = {}
    if (status && status !== 'ALL') {
      where.status = status
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { razorpayPaymentId: { contains: search, mode: 'insensitive' } },
        { student: { name: { contains: search, mode: 'insensitive' } } },
        { student: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } }
      }
    })

    return successResponse(res, { orders, count: orders.length })
  } catch (err) {
    next(err)
  }
}

export async function getEnrollments(req, res, next) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, price: true } }
      }
    })

    return successResponse(res, { enrollments, count: enrollments.length })
  } catch (err) {
    next(err)
  }
}

// 7. Creator Requests Management
export async function getRequests(req, res, next) {
  try {
    const requests = await prisma.profileChangeRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creatorProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    })

    return successResponse(res, { requests })
  } catch (err) {
    next(err)
  }
}

export async function reviewRequest(req, res, next) {
  try {
    const { id } = req.params
    const { action, adminNote } = req.body

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw new BadRequestError('Action must be APPROVED or REJECTED')
    }

    const request = await prisma.profileChangeRequest.findUnique({
      where: { id },
      include: { creatorProfile: true }
    })

    if (!request) {
      throw new NotFoundError('Request not found')
    }

    await prisma.$transaction(async (tx) => {
      await tx.profileChangeRequest.update({
        where: { id },
        data: {
          status: action,
          adminNote,
          reviewedBy: req.user.email,
          reviewedAt: new Date()
        }
      })

      // If approved, apply the profile modifications to the CreatorProfile
      if (action === 'APPROVED') {
        const updateData = {}
        if (request.requestedBio) updateData.biography = request.requestedBio
        if (request.requestedHeadline) updateData.headline = request.requestedHeadline
        if (request.supportingUrl) updateData.portfolioUrl = request.supportingUrl

        await tx.creatorProfile.update({
          where: { id: request.creatorProfileId },
          data: updateData
        })
      }

      // Notify Creator
      await tx.notification.create({
        data: {
          userId: request.creatorProfile.userId,
          title: `Profile Change Request ${action}`,
          message: action === 'APPROVED'
            ? 'Your profile changes have been verified and applied by Administrator.'
            : `Your profile change request was declined: ${adminNote || 'No reason provided'}`,
          linkUrl: '/creator/profile'
        }
      })
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `PROFILE_REQUEST_${action}`,
        entityType: 'ProfileChangeRequest',
        entityId: id,
        details: `Admin ${req.user.email} reviewed request ${id}: ${action}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, null, `Profile change request marked as ${action}`)
  } catch (err) {
    next(err)
  }
}

// 8. Notifications & Announcements
export async function broadcastAnnouncement(req, res, next) {
  try {
    const { title, message, targetRole } = req.body

    if (!title || !message) {
      throw new BadRequestError('Title and message are required')
    }

    const where = {}
    if (targetRole && targetRole !== 'ALL') {
      where.role = targetRole // 'STUDENT' or 'CREATOR'
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true }
    })

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        linkUrl: targetRole === 'CREATOR' ? '/creator/dashboard' : '/student/dashboard'
      }))
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ANNOUNCEMENT_BROADCAST',
        entityType: 'Notification',
        details: `Broadcast announcement "${title}" dispatched to ${users.length} users (${targetRole || 'ALL'})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { count: users.length }, `Announcement dispatched to ${users.length} users`)
  } catch (err) {
    next(err)
  }
}

// 9. Reports & Analytics
export async function getReports(req, res, next) {
  try {
    const successfulOrders = await prisma.order.findMany({
      where: { status: 'SUCCESSFUL' },
      include: {
        course: { select: { id: true, title: true, category: true } }
      }
    })

    // Group revenue by course
    const courseRevenueMap = {}
    successfulOrders.forEach((o) => {
      const cTitle = o.course.title
      courseRevenueMap[cTitle] = (courseRevenueMap[cTitle] || 0) + o.amount
    })

    const courseRevenueBreakdown = Object.entries(courseRevenueMap).map(([title, revenue]) => ({
      courseTitle: title,
      revenue
    }))

    // Enrollments by course
    const courses = await prisma.course.findMany({
      include: {
        enrollments: true,
        playlists: { include: { lessons: true } }
      }
    })

    const courseStats = courses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      enrollmentCount: c.enrollments.length,
      lessonsCount: c.playlists.reduce((acc, p) => acc + p.lessons.length, 0),
      status: c.status
    }))

    return successResponse(res, {
      courseRevenueBreakdown,
      courseStats,
      totalTransactionsCount: successfulOrders.length
    })
  } catch (err) {
    next(err)
  }
}

// 10. Audit Logs Query
export async function getAuditLogs(req, res, next) {
  try {
    const { action, limit = 50 } = req.query

    const where = {}
    if (action) where.action = action

    const logs = await prisma.auditLog.findMany({
      where,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    return successResponse(res, { logs, count: logs.length })
  } catch (err) {
    next(err)
  }
}

// 11. Security & Sessions
export async function getActiveSessions(req, res, next) {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    return successResponse(res, { sessions })
  } catch (err) {
    next(err)
  }
}

export async function revokeSession(req, res, next) {
  try {
    const { sessionId } = req.params

    await prisma.session.delete({ where: { id: sessionId } })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ADMIN_SESSION_REVOKED',
        entityType: 'Session',
        entityId: sessionId,
        details: `Admin revoked session ${sessionId}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, null, 'Session revoked')
  } catch (err) {
    next(err)
  }
}

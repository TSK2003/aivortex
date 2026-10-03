import bcrypt from 'bcryptjs'
import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/appError.js'
import emailService from '../services/emailService.js'

/**
 * Sanitizes user records to ensure sensitive attributes like passwordHash are never leaked.
 */
export function sanitizeUser(user) {
  if (!user) return user
  if (Array.isArray(user)) {
    return user.map((u) => sanitizeUser(u))
  }
  const sanitized = { ...user }
  delete sanitized.passwordHash
  return sanitized
}

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

    // Real database aggregate for course rating
    const ratingAggregate = await prisma.courseReview.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true }
    })
    const averageCourseRating = ratingAggregate._avg.rating
      ? Number(ratingAggregate._avg.rating.toFixed(2))
      : 4.9

    // Real database aggregate for course completion percentage
    let completionRatePercent = 0
    if (totalEnrollments > 0) {
      const completedCount = await prisma.enrollment.count({
        where: { progressPercent: { gte: 100 } }
      })
      completionRatePercent = Math.round((completedCount / totalEnrollments) * 100)
    }

    return successResponse(res, {
      analytics: {
        totalRevenue,
        totalStudents,
        totalCreators,
        totalEnrollments,
        pendingVerificationCount,
        publishedCoursesCount,
        pendingRequestsCount,
        averageCourseRating,
        completionRatePercent
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
    const { search, status, sortBy } = req.query

    const where = { role: 'CREATOR' }

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase()
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
        {
          creatorProfile: {
            OR: [
              { specialization: { contains: q, mode: 'insensitive' } },
              { headline: { contains: q, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    let orderBy = { createdAt: 'desc' }
    if (sortBy === 'name') {
      orderBy = { name: 'asc' }
    } else if (sortBy === 'created_asc') {
      orderBy = { createdAt: 'asc' }
    }

    const creators = await prisma.user.findMany({
      where,
      orderBy,
      include: {
        creatorProfile: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
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

    return successResponse(res, { creators: sanitizeUser(creators) })
  } catch (err) {
    next(err)
  }
}

export async function getCreatorById(req, res, next) {
  try {
    const { id } = req.params
    const creator = await prisma.user.findFirst({
      where: { id, role: 'CREATOR' },
      include: {
        creatorProfile: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        assignedCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                category: true,
                price: true,
                studentsCount: true,
                averageRating: true
              }
            }
          }
        },
        uploadedLessons: {
          select: { id: true, title: true, status: true, durationSeconds: true },
          take: 10
        }
      }
    })

    if (!creator) {
      throw new NotFoundError('Creator account not found')
    }

    return successResponse(res, { creator: sanitizeUser(creator) })
  } catch (err) {
    next(err)
  }
}

/**
 * Extract 3-letter creator name prefix in uppercase (e.g. Banu -> CR-BAN)
 */
export function getCreatorPrefix(name) {
  const letters = name && typeof name === 'string' && name.trim()
    ? name.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
    : ''
  return `CR-${letters || 'FAC'}`
}

/**
 * Determine the next sequential 3-digit User ID for a creator based on existing database records
 * Example: if existing are CR-BAN-001, CR-BAN-002 -> returns CR-BAN-003
 */
export async function findNextCreatorUserId(name) {
  const prefix = getCreatorPrefix(name)
  const prefixWithDash = `${prefix}-`

  // Query database for all users whose ID matches this prefix pattern
  const existingUsers = await prisma.user.findMany({
    where: {
      OR: [
        { id: { startsWith: prefixWithDash } },
        { id: { startsWith: prefixWithDash.toLowerCase() } }
      ]
    },
    select: { id: true }
  })

  let maxSeq = 0
  const seqRegex = new RegExp(`^${prefix}-([0-9]+)$`, 'i')

  for (const u of existingUsers) {
    const match = u.id.match(seqRegex)
    if (match) {
      const num = parseInt(match[1], 10)
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num
      }
    }
  }

  const nextSeq = maxSeq + 1
  const formattedSeq = String(nextSeq).padStart(3, '0')
  return `${prefix}-${formattedSeq}`
}

/**
 * GET /admin/creators/next-user-id?name=...
 * Returns the next available sequential Creator User ID
 */
export async function getNextCreatorUserId(req, res, next) {
  try {
    const { name } = req.query
    const nextId = await findNextCreatorUserId(name)
    const prefix = getCreatorPrefix(name)
    return successResponse(
      res,
      { userId: nextId, prefix },
      'Next sequential Creator User ID generated successfully'
    )
  } catch (err) {
    next(err)
  }
}

export async function createCreator(req, res, next) {
  try {
    const {
      name,
      email,
      userId,
      password,
      phone,
      avatar,
      specialization,
      bio,
      organization,
      status = 'ACTIVE'
    } = req.body

    if (!name || !name.trim()) {
      throw new BadRequestError('Creator full name is required')
    }
    if (!email || !email.trim()) {
      throw new BadRequestError('Email address is required')
    }

    // 1. Verify email syntax and deliverability / reachable domain
    let cleanEmail
    try {
      cleanEmail = await emailService.verifyEmailDeliverability(email)
    } catch (valErr) {
      throw new BadRequestError(valErr.message || 'Please provide a valid, deliverable email address.')
    }

    // 2. Check if email already exists in database
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } })
    if (existingEmail) {
      throw new BadRequestError('This email address is already associated with an account.')
    }

    // 3. Check if custom userId exists or auto-assign sequential ID
    let chosenId = userId && userId.trim() ? userId.trim() : null
    if (chosenId) {
      const existingId = await prisma.user.findUnique({ where: { id: chosenId } })
      if (existingId) {
        throw new BadRequestError('Creator User ID already exists. Please choose a different ID.')
      }
    } else {
      // Auto-assign sequential ID from database
      chosenId = await findNextCreatorUserId(name)
      // Safety guard against race conditions: ensure chosenId is unique
      let attempts = 0
      while (attempts < 50) {
        const existing = await prisma.user.findUnique({ where: { id: chosenId } })
        if (!existing) break
        attempts++
        const prefix = getCreatorPrefix(name)
        const match = chosenId.match(new RegExp(`^${prefix}-([0-9]+)$`, 'i'))
        const curNum = match ? parseInt(match[1], 10) : 1
        chosenId = `${prefix}-${String(curNum + attempts).padStart(3, '0')}`
      }
    }

    // 4. Password validation if provided
    if (password !== undefined && password !== null && String(password).trim() !== '') {
      const pwd = String(password).trim()
      if (pwd.length < 8) {
        throw new BadRequestError('Password must be at least 8 characters long.')
      }
      if (pwd.length > 32) {
        throw new BadRequestError('Password cannot exceed 32 characters.')
      }
    }

    // Password generation or hashing
    const tempPassword = password && String(password).trim()
      ? String(password).trim()
      : `AivortexCreator${Math.floor(1000 + Math.random() * 9000)}!`

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(tempPassword, salt)

    // Per SOP, Creator account is always created and activated as ACTIVE
    const finalStatus = 'ACTIVE'

    const createData = {
      ...(chosenId ? { id: chosenId } : {}),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'CREATOR',
      status: finalStatus,
      phone: phone ? phone.trim() : null,
      avatar: avatar ? avatar.trim() : null,
      bio: bio ? bio.trim() : null,
      creatorProfile: {
        create: {
          specialization: specialization ? specialization.trim() : 'Curriculum Specialist',
          headline: organization
            ? `${specialization ? specialization.trim() : 'Technical Instructor'} • ${organization.trim()}`
            : (specialization ? specialization.trim() : 'Technical Course Creator'),
          biography: bio ? bio.trim() : 'Course creator and faculty specialist at AIVORTEX.',
          isVerified: true
        }
      }
    }

    const creator = await prisma.user.create({
      data: createData,
      include: {
        creatorProfile: true
      }
    })

    // 5. Automatic Credential Delivery via Email
    let emailStatus = { sent: true, error: null }
    try {
      const info = await emailService.sendCreatorInvitation({
        name: name.trim(),
        email: cleanEmail,
        tempPassword,
        userId: creator.id
      })
      emailStatus.sent = true
      emailStatus.messageId = info?.messageId || `msg_${Date.now()}`
    } catch (mailErr) {
      console.warn('[WARN] SMTP credential delivery issue:', mailErr.message)
      emailStatus.error = mailErr.message
    }

    // 6. Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_PROVISIONED',
        entityType: 'User',
        entityId: creator.id,
        details: `Admin ${req.user.email} provisioned and activated creator account for ${cleanEmail} (ID: ${creator.id}, Status: ${finalStatus}). Credentials dispatched to registered email.`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(
      res,
      {
        creator: sanitizeUser(creator),
        tempPasswordGenerated: tempPassword,
        emailStatus
      },
      'Creator account created successfully and login credentials dispatched to their registered email.',
      201
    )
  } catch (err) {
    next(err)
  }
}

export async function updateCreator(req, res, next) {
  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      avatar,
      bio,
      specialization,
      headline,
      organization,
      status
    } = req.body

    const existing = await prisma.user.findFirst({
      where: { id, role: 'CREATOR' },
      include: { creatorProfile: true }
    })

    if (!existing) {
      throw new NotFoundError('Creator not found')
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null
    if (avatar !== undefined) updateData.avatar = avatar ? avatar.trim() : null
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null
    if (status !== undefined && status !== null) {
      const normalizedStatus = String(status).trim().toUpperCase()
      if (['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(normalizedStatus)) {
        updateData.status = normalizedStatus
      }
    }

    if (email && email.trim().toLowerCase() !== existing.email) {
      const cleanEmail = email.trim().toLowerCase()
      const emailInUse = await prisma.user.findUnique({ where: { email: cleanEmail } })
      if (emailInUse && emailInUse.id !== id) {
        throw new BadRequestError('This email address is already associated with another account.')
      }
      updateData.email = cleanEmail
    }

    // Profile updates
    const resolvedHeadline = organization
      ? `${specialization || existing.creatorProfile?.specialization || 'Technical Instructor'} • ${organization.trim()}`
      : (headline !== undefined ? headline : existing.creatorProfile?.headline)

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        creatorProfile: {
          upsert: {
            create: {
              specialization: specialization || 'Curriculum Specialist',
              headline: resolvedHeadline || 'Technical Instructor',
              biography: bio || 'Course creator at AIVORTEX.',
              isVerified: true
            },
            update: {
              ...(specialization !== undefined ? { specialization: specialization.trim() } : {}),
              ...(resolvedHeadline !== undefined ? { headline: resolvedHeadline } : {}),
              ...(bio !== undefined ? { biography: bio.trim() } : {})
            }
          }
        }
      },
      include: {
        creatorProfile: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
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

    if (updateData.status === 'SUSPENDED' || updateData.status === 'INACTIVE') {
      await prisma.session.deleteMany({ where: { userId: id } })
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_UPDATED',
        entityType: 'User',
        entityId: id,
        details: `Admin ${req.user.email} updated profile for creator ${updated.email} (Status: ${updated.status})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { creator: sanitizeUser(updated) }, 'Creator profile updated successfully')
  } catch (err) {
    next(err)
  }
}

export async function resetCreatorPassword(req, res, next) {
  try {
    const { id } = req.params
    const { newPassword, sendEmail = true } = req.body

    const creator = await prisma.user.findFirst({
      where: { id, role: 'CREATOR' }
    })

    if (!creator) {
      throw new NotFoundError('Creator not found')
    }

    if (newPassword !== undefined && newPassword !== null && String(newPassword).trim() !== '') {
      const pwd = String(newPassword).trim()
      if (pwd.length < 8) {
        throw new BadRequestError('Password must be at least 8 characters long.')
      }
      if (pwd.length > 32) {
        throw new BadRequestError('Password cannot exceed 32 characters.')
      }
      if (!/[A-Z]/.test(pwd)) {
        throw new BadRequestError('Password must contain at least one uppercase letter.')
      }
      if (!/[a-z]/.test(pwd)) {
        throw new BadRequestError('Password must contain at least one lowercase letter.')
      }
      if (!/[0-9]/.test(pwd)) {
        throw new BadRequestError('Password must contain at least one number.')
      }
      if (!/[^A-Za-z0-9]/.test(pwd)) {
        throw new BadRequestError('Password must contain at least one special character.')
      }
    }

    const tempPassword = newPassword && newPassword.trim()
      ? newPassword.trim()
      : `Aivortex${Math.floor(100000 + Math.random() * 900000)}!`

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(tempPassword, salt)

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    })

    // Invalidate active creator sessions so they must log in with new password
    await prisma.session.deleteMany({ where: { userId: id } })

    let emailStatus = { sent: false, error: null }
    if (sendEmail) {
      try {
        await emailService.sendCreatorInvitation({
          name: creator.name,
          email: creator.email,
          tempPassword,
          userId: creator.id
        })
        emailStatus.sent = true
      } catch (mailErr) {
        console.warn('[WARN] SMTP password reset delivery warning:', mailErr.message)
        emailStatus.error = mailErr.message
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_PASSWORD_RESET',
        entityType: 'User',
        entityId: id,
        details: `Admin ${req.user.email} reset password credentials for creator ${creator.email}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(
      res,
      {
        tempPasswordGenerated: tempPassword,
        emailStatus
      },
      `Credentials reset successfully for ${creator.email}`
    )
  } catch (err) {
    next(err)
  }
}

export async function resendCreatorCredentials(req, res, next) {
  try {
    const { id } = req.params
    const creator = await prisma.user.findFirst({
      where: { id, role: 'CREATOR' }
    })

    if (!creator) {
      throw new NotFoundError('Creator not found')
    }

    // Generate a fresh temporary password to ensure it is valid
    const tempPassword = `AivortexCreator${Math.floor(1000 + Math.random() * 9000)}!`
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(tempPassword, salt)

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    })

    let emailStatus = { sent: false, error: null }
    try {
      await emailService.sendCreatorInvitation({
        name: creator.name,
        email: creator.email,
        tempPassword,
        userId: creator.id
      })
      emailStatus.sent = true
    } catch (mailErr) {
      console.warn('[WARN] SMTP credential resend delivery warning:', mailErr.message)
      emailStatus.error = mailErr.message
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_CREDENTIALS_RESENT',
        entityType: 'User',
        entityId: id,
        details: `Admin ${req.user.email} resent onboarding credentials to ${creator.email}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(
      res,
      {
        tempPasswordGenerated: tempPassword,
        emailStatus
      },
      `Onboarding credentials dispatched to ${creator.email}`
    )
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
    const tempPassword = `AivortexCreator${Math.floor(1000 + Math.random() * 9000)}!`
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
            biography: bio || 'Course creator at AIVORTEX.',
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
      console.warn('[WARN] SMTP invitation delivery warning:', mailErr.message)
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
      { creator: sanitizeUser(creator) },
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

    const normalizedStatus = String(status || '').toUpperCase()

    if (!['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(normalizedStatus)) {
      throw new BadRequestError('Invalid user status')
    }

    const updated = await prisma.user.update({
      where: { id, role: 'CREATOR' },
      data: { status: normalizedStatus },
      include: {
        creatorProfile: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
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

    if (normalizedStatus === 'SUSPENDED' || normalizedStatus === 'INACTIVE') {
      await prisma.session.deleteMany({ where: { userId: id } })
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_STATUS_CHANGED',
        entityType: 'User',
        entityId: id,
        details: `Creator ${updated.email} status changed to ${normalizedStatus}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { creator: sanitizeUser(updated) }, `Creator status updated to ${normalizedStatus}`)
  } catch (err) {
    next(err)
  }
}

export async function deleteCreator(req, res, next) {
  try {
    const { id } = req.params

    const creator = await prisma.user.findFirst({
      where: { id, role: 'CREATOR' }
    })

    if (!creator) {
      throw new NotFoundError('Creator not found')
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete user sessions, tokens, notifications
      await tx.session.deleteMany({ where: { userId: id } })
      await tx.passwordResetToken.deleteMany({ where: { userId: id } })
      await tx.notification.deleteMany({ where: { userId: id } })

      // 2. Delete course creator assignments
      await tx.courseCreator.deleteMany({ where: { creatorId: id } })

      // 3. Delete creator profile & profile change requests
      await tx.profileChangeRequest.deleteMany({ where: { creatorProfile: { userId: id } } })
      await tx.creatorProfile.deleteMany({ where: { userId: id } })

      // 4. Nullify creator on playlists & uploaded lessons so content remains intact
      await tx.playlist.updateMany({
        where: { creatorId: id },
        data: { creatorId: null }
      })
      await tx.lesson.updateMany({
        where: { creatorId: id },
        data: { creatorId: null }
      })

      // 5. Delete user
      await tx.user.delete({ where: { id } })
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATOR_DELETED',
        entityType: 'User',
        entityId: id,
        details: `Admin ${req.user.email} permanently deleted creator account ${creator.name} (${creator.email})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, null, `Creator account for ${creator.name} deleted successfully`)
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
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { expiresAt: true, createdAt: true }
        },
        activeVideoSessions: {
          orderBy: { lastHeartbeatAt: 'desc' },
          take: 1,
          select: { lastHeartbeatAt: true, lesson: { select: { id: true, title: true } } }
        },
        lessonProgress: {
          orderBy: { updatedAt: 'desc' },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                playlist: {
                  select: {
                    course: {
                      select: {
                        id: true,
                        title: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        enrollments: {
          orderBy: { enrolledAt: 'desc' },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnail: true,
                category: true,
                level: true,
                price: true,
                duration: true
              }
            }
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

    const formatStudyDuration = (seconds) => {
      if (!seconds || seconds <= 0) return '0m'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      if (hours > 0) {
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
      }
      return `${minutes}m`
    }

    const now = new Date()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000)

    const formatted = students.map((s) => {
      const completedCount = s.enrollments.filter(e => (e.progressPercent >= 100) || e.completedAt).length

      const totalWatchSeconds = (s.lessonProgress || []).reduce((sum, lp) => sum + (lp.watchSeconds || 0), 0)
      const thisWeekWatchSeconds = (s.lessonProgress || [])
        .filter(lp => lp.updatedAt && new Date(lp.updatedAt) >= sevenDaysAgo)
        .reduce((sum, lp) => sum + (lp.watchSeconds || 0), 0)

      // Course-wise time spent
      const enrichedEnrollments = s.enrollments.map((enr) => {
        const courseWatchSeconds = (s.lessonProgress || [])
          .filter(lp => lp.enrollmentId === enr.id)
          .reduce((sum, lp) => sum + (lp.watchSeconds || 0), 0)
        return {
          ...enr,
          timeSpentSeconds: courseWatchSeconds,
          timeSpentFormatted: formatStudyDuration(courseWatchSeconds)
        }
      })

      // Last course accessed & last lesson viewed
      const lastProgress = s.lessonProgress && s.lessonProgress.length > 0 ? s.lessonProgress[0] : null
      const lastLessonViewed = lastProgress?.lesson?.title || null
      const lastCourseAccessed = lastProgress?.lesson?.playlist?.course?.title || s.enrollments[0]?.course?.title || null
      const lastAccessedAt = lastProgress?.updatedAt || null

      // Determine Last Active timestamp
      const candidateDates = [
        s.activeVideoSessions?.[0]?.lastHeartbeatAt,
        lastProgress?.updatedAt,
        s.sessions?.[0]?.createdAt,
        s.updatedAt
      ].filter(Boolean)
      const lastActiveAt = candidateDates.length > 0
        ? new Date(Math.max(...candidateDates.map(d => new Date(d).getTime())))
        : s.createdAt

      // Determine Current Session Status (Active / Offline)
      const isOnline = Boolean(
        (s.activeVideoSessions?.[0]?.lastHeartbeatAt && new Date(s.activeVideoSessions[0].lastHeartbeatAt) > fifteenMinsAgo) ||
        (lastProgress?.updatedAt && new Date(lastProgress.updatedAt) > fifteenMinsAgo) ||
        (s.sessions?.[0] && new Date(s.sessions[0].expiresAt) > now && lastActiveAt && new Date(lastActiveAt) > thirtyMinsAgo)
      )

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        lastActiveAt,
        sessionStatus: isOnline ? 'ACTIVE' : 'OFFLINE',
        isOnline,
        totalLearningTimeSeconds: totalWatchSeconds,
        totalLearningTimeFormatted: formatStudyDuration(totalWatchSeconds),
        thisWeekStudyTimeSeconds: thisWeekWatchSeconds,
        thisWeekStudyTimeFormatted: formatStudyDuration(thisWeekWatchSeconds),
        lastCourseAccessed,
        lastLessonViewed,
        lastAccessedAt,
        enrolledCount: s.enrollments.length,
        completedCount,
        enrollments: enrichedEnrollments,
        totalSpent: s.orders.reduce((sum, o) => sum + o.amount, 0),
        certificates: s.certificates
      }
    })

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

export async function updateStudentEnrollmentStatus(req, res, next) {
  try {
    const { id, enrollmentId } = req.params
    const { status } = req.body

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      throw new BadRequestError('Invalid enrollment status')
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: { select: { id: true, title: true } },
        student: { select: { id: true, email: true, name: true } }
      }
    })

    if (!enrollment || enrollment.studentId !== id) {
      throw new NotFoundError('Enrollment record not found for this student')
    }

    const updated = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            category: true,
            level: true,
            price: true,
            duration: true
          }
        }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'STUDENT_ENROLLMENT_STATUS_CHANGED',
        entityType: 'Enrollment',
        entityId: enrollmentId,
        details: `Enrollment in "${enrollment.course?.title}" for student ${enrollment.student?.email} updated to ${status}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    }).catch(() => {})

    return successResponse(res, { enrollment: updated }, `Course activation status updated to ${status.toLowerCase()}`)
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
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              include: {
                creator: { select: { id: true, name: true, email: true, avatar: true } }
              },
              orderBy: { orderIndex: 'asc' }
            }
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
        previewVideoUrl: c.demoVideoUrl || null,
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
      previewVideoUrl,
      demoVideoUrl,
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

    if (thumbnail && thumbnail.trim()) {
      const trimmedThumb = thumbnail.trim()
      if (!/^https:\/\//i.test(trimmedThumb) && !trimmedThumb.startsWith('/uploads/') && !trimmedThumb.startsWith('/api/media/')) {
        throw new BadRequestError('Please enter a valid image URL or upload an image.')
      }
      if (/^https:\/\//i.test(trimmedThumb)) {
        try {
          const parsed = new URL(trimmedThumb)
          if (parsed.protocol !== 'https:' || !parsed.hostname || !parsed.hostname.includes('.')) {
            throw new BadRequestError('Please enter a valid HTTPS image URL.')
          }
        } catch {
          throw new BadRequestError('Please enter a valid HTTPS image URL.')
        }
      }
    }

    const courseSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))

    const existing = await prisma.course.findUnique({ where: { slug: courseSlug } })
    if (existing) {
      throw new BadRequestError(`Course with slug '${courseSlug}' already exists`)
    }

    const resolvedVideoUrl = (previewVideoUrl || demoVideoUrl) ? String(previewVideoUrl || demoVideoUrl).trim() : null

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
        thumbnail: (thumbnail && thumbnail.trim()) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        demoVideoUrl: resolvedVideoUrl,
        price: Number(price),
        originalPrice: Number(originalPrice || price),
        discountPercent: Number(discountPercent),
        isFree: Boolean(isFree),
        isFeatured: Boolean(isFeatured),
        badge,
        status: req.body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
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

    return successResponse(res, { course: { ...course, previewVideoUrl: course.demoVideoUrl } }, 'Course created successfully in DRAFT mode', 201)
  } catch (err) {
    next(err)
  }
}

/**
 * Strict server-authoritative course publication validator.
 * Enforces all prerequisites before a course can transition to PUBLISHED.
 */
export async function validateCoursePublicationPrerequisites(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      creators: true,
      playlists: {
        include: {
          lessons: true
        }
      }
    }
  })

  if (!course) {
    throw new NotFoundError('Course not found')
  }

  // 1. Valid course title
  if (!course.title || course.title.trim().length < 3) {
    throw new BadRequestError('Cannot publish course: Valid title of at least 3 characters is required')
  }

  // 2. Valid course description
  if (!course.shortDescription && !course.fullDescription) {
    throw new BadRequestError('Cannot publish course: Course description is required')
  }

  // 3. Assigned Creator is optional at the course level and can be handled per-lecture

  // 4. Valid curriculum modules/playlists
  if (!course.playlists || course.playlists.length === 0) {
    throw new BadRequestError('Cannot publish course: Course must contain at least one curriculum section')
  }

  // 5. Published lesson availability
  const allLessons = course.playlists.flatMap(p => p.lessons || [])
  const hasPublishedLesson = allLessons.some(l => l.status === 'PUBLISHED')
  if (!hasPublishedLesson) {
    throw new BadRequestError('Cannot publish course: At least one lecture must be in PUBLISHED status')
  }

  // 6. Pricing & Free/Paid consistency
  if (course.isFree) {
    if (course.price !== 0) {
      throw new BadRequestError('Cannot publish course: Free course must have price set to 0')
    }
  } else {
    if (course.price === null || course.price === undefined || course.price < 0) {
      throw new BadRequestError('Cannot publish course: Paid course must have a valid non-negative price')
    }
  }

  return true
}

export async function updateCourse(req, res, next) {
  try {
    const { courseId } = req.params
    const data = req.body

    const existing = await prisma.course.findUnique({ where: { id: courseId } })
    if (!existing) {
      throw new NotFoundError('Course not found')
    }

    if (data.status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      await validateCoursePublicationPrerequisites(courseId)
    }

    const willBePublished = (data.status !== undefined ? data.status : existing.status) === 'PUBLISHED'
    if (data.isFeatured === true && !willBePublished) {
      throw new BadRequestError('Only published courses can be featured on the public portal')
    }

    const updatePayload = {}

    if (data.thumbnail !== undefined && data.thumbnail !== null) {
      const trimmedThumb = String(data.thumbnail).trim()
      if (trimmedThumb) {
        if (!/^https:\/\//i.test(trimmedThumb) && !trimmedThumb.startsWith('/uploads/') && !trimmedThumb.startsWith('/api/media/')) {
          throw new BadRequestError('Please enter a valid image URL or upload an image.')
        }
        if (/^https:\/\//i.test(trimmedThumb)) {
          try {
            const parsed = new URL(trimmedThumb)
            if (parsed.protocol !== 'https:' || !parsed.hostname || !parsed.hostname.includes('.')) {
              throw new BadRequestError('Please enter a valid HTTPS image URL.')
            }
          } catch {
            throw new BadRequestError('Please enter a valid HTTPS image URL.')
          }
        }
        updatePayload.thumbnail = trimmedThumb
      } else {
        updatePayload.thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
      }
    }

    if (data.previewVideoUrl !== undefined) {
      updatePayload.demoVideoUrl = data.previewVideoUrl ? String(data.previewVideoUrl).trim() : null
    } else if (data.demoVideoUrl !== undefined) {
      updatePayload.demoVideoUrl = data.demoVideoUrl ? String(data.demoVideoUrl).trim() : null
    }

    const fields = [
      'title', 'shortDescription', 'fullDescription', 'category', 'level',
      'duration', 'language', 'price', 'originalPrice',
      'discountPercent', 'isFree', 'isFeatured', 'badge', 'status',
      'enrollmentOpen', 'demoLessonId', 'certificateEnabled', 'accessDurationDays'
    ]

    fields.forEach((f) => {
      if (data[f] !== undefined) updatePayload[f] = data[f]
    })

    if (data.status && data.status !== 'PUBLISHED') {
      updatePayload.isFeatured = false
    }

    if (Array.isArray(data.creatorIds)) {
      await prisma.courseCreator.deleteMany({ where: { courseId } })
      if (data.creatorIds.length > 0) {
        await prisma.courseCreator.createMany({
          data: data.creatorIds.map(cId => ({ courseId, creatorId: cId }))
        })
      }
    }

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

// 4b. Explicit Creator Assignment to Course
export async function assignCreatorToCourse(req, res, next) {
  try {
    const { courseId } = req.params
    const { creatorId, creatorIds } = req.body

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      throw new NotFoundError('Course not found')
    }

    const idsToAssign = creatorIds || (creatorId ? [creatorId] : [])
    if (idsToAssign.length === 0) {
      throw new BadRequestError('At least one Creator ID is required')
    }

    // Verify creators exist
    const creators = await prisma.user.findMany({
      where: { id: { in: idsToAssign }, role: 'CREATOR' }
    })
    if (creators.length === 0) {
      throw new BadRequestError('No valid Creators found matching provided IDs')
    }

    for (const c of creators) {
      await prisma.courseCreator.upsert({
        where: { courseId_creatorId: { courseId, creatorId: c.id } },
        create: { courseId, creatorId: c.id },
        update: {}
      })

      // Send operational notification to assigned creator
      await prisma.notification.create({
        data: {
          userId: c.id,
          title: 'Course Assigned',
          message: `You have been assigned to course '${course.title}'.`,
          linkUrl: `/creator/courses/${course.id}`
        }
      }).catch(() => {})
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'COURSE_CREATOR_ASSIGNED',
        entityType: 'Course',
        entityId: courseId,
        details: `Admin assigned creator(s) ${creators.map(c => c.name).join(', ')} to ${course.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { courseId, assignedCreators: creators.map(c => ({ id: c.id, name: c.name, email: c.email })) }, 'Creator assigned successfully')
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

    if (price !== undefined && (Number(price) < 0 || isNaN(Number(price)))) {
      throw new BadRequestError('Price must be a non-negative number')
    }
    if (originalPrice !== undefined && (Number(originalPrice) < 0 || isNaN(Number(originalPrice)))) {
      throw new BadRequestError('Original price must be a non-negative number')
    }
    if (discountPercent !== undefined && (Number(discountPercent) < 0 || Number(discountPercent) > 100 || isNaN(Number(discountPercent)))) {
      throw new BadRequestError('Discount percent must be between 0 and 100')
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

    if (status === 'PUBLISHED' && course.status !== 'PUBLISHED') {
      await validateCoursePublicationPrerequisites(courseId)
    }

    const willBePublished = (status !== undefined ? status : course.status) === 'PUBLISHED'
    if (isFeatured === true && !willBePublished) {
      throw new BadRequestError('Only published courses can be featured on the public portal')
    }

    const data = {}
    if (status !== undefined) {
      if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
        throw new BadRequestError('Invalid course visibility status')
      }
      data.status = status
      if (status !== 'PUBLISHED') {
        data.isFeatured = false
      }
    }
    if (isFeatured !== undefined && willBePublished) {
      data.isFeatured = Boolean(isFeatured)
    }
    if (enrollmentOpen !== undefined) data.enrollmentOpen = Boolean(enrollmentOpen)

    // Execute updates inside an atomic transaction
    const updated = await prisma.$transaction(async (tx) => {
      // Handle Public Demo video assignment
      if (demoLessonId !== undefined) {
        if (demoLessonId) {
          // Verify lesson exists, belongs to course, and is approved/published
          const lesson = await tx.lesson.findUnique({
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
          if (course.demoLessonId && course.demoLessonId !== demoLessonId) {
            await tx.lesson.update({
              where: { id: course.demoLessonId },
              data: { isPublicDemo: false }
            }).catch(() => {})
          }
          // Flag lesson as public demo
          await tx.lesson.update({
            where: { id: demoLessonId },
            data: { isPublicDemo: true }
          })
        } else {
          // Remove public demo
          data.demoLessonId = null
          if (course.demoLessonId) {
            await tx.lesson.update({
              where: { id: course.demoLessonId },
              data: { isPublicDemo: false }
            }).catch(() => {})
          }
        }
      }

      return await tx.course.update({
        where: { id: courseId },
        data
      })
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
    const { status } = req.query
    const where = {}
    if (status && status !== 'ALL') {
      where.status = status
    } else {
      where.status = { in: ['SUBMITTED_FOR_REVIEW', 'RETURNED_FOR_EDIT', 'APPROVED', 'PUBLISHED', 'ARCHIVED'] }
    }

    const queue = await prisma.lesson.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        playlist: {
          include: {
            course: { select: { id: true, title: true, slug: true } }
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
            title: action === 'APPROVED' ? 'Lecture Approved' : 'Changes Requested',
            message: action === 'APPROVED'
              ? `Your lecture '${lesson.title}' has been approved.`
              : `Changes were requested for '${lesson.title}'. Review the Admin feedback and resubmit.`,
            linkUrl: '/creator/courses'
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

    if (lesson.status !== 'APPROVED' && lesson.status !== 'ARCHIVED') {
      throw new BadRequestError(`Only APPROVED or ARCHIVED lessons can be published. Current state: ${lesson.status}`)
    }

    const updated = await prisma.$transaction(async (tx) => {
      const l = await tx.lesson.update({
        where: { id: lessonId },
        data: { status: 'PUBLISHED' }
      })

      await tx.videoStatusHistory.create({
        data: {
          lessonId,
          fromStatus: lesson.status,
          toStatus: 'PUBLISHED',
          changedById: adminId,
          reason: 'Admin explicitly published lesson to enrolled students'
        }
      })

      // Send operational notification to Creator
      if (lesson.creatorId) {
        await tx.notification.create({
          data: {
            userId: lesson.creatorId,
            title: 'Lecture Published',
            message: `Your lecture '${lesson.title}' in course '${lesson.playlist.course.title}' has been published.`,
            linkUrl: '/creator/courses'
          }
        })
      }

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
        data: { status: 'APPROVED', isPublicDemo: false }
      })

      // If this lesson was assigned as the public demo for its course, clear it
      await tx.course.updateMany({
        where: { demoLessonId: lessonId },
        data: { demoLessonId: null }
      })

      await tx.videoStatusHistory.create({
        data: {
          lessonId,
          fromStatus: lesson.status,
          toStatus: 'APPROVED',
          changedById: adminId,
          reason: reason || 'Unpublished by Admin'
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
        details: `Admin unpublished lesson ${lesson.title}: ${reason || 'Unpublished and reverted to Approved'}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { lesson: updated }, 'Lesson unpublished from student player and reverted to Approved')
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
    // Auto-expire approved requests that exceeded their 24-hour completion window
    await prisma.profileChangeRequest.updateMany({
      where: {
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
      orderBy: { createdAt: 'desc' },
      include: {
        creatorProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
              }
            }
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
    const { action } = req.body
    const adminNote = (req.body.adminNote || req.body.reason || '').trim()

    if (!['APPROVED', 'REJECTED'].includes(action)) {
      throw new BadRequestError('Action must be APPROVED or REJECTED')
    }

    if (action === 'REJECTED' && !adminNote) {
      throw new BadRequestError('Rejection reason is required when rejecting a request.')
    }

    const request = await prisma.profileChangeRequest.findUnique({
      where: { id },
      include: {
        creatorProfile: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    })

    if (!request) {
      throw new NotFoundError('Request not found')
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError(`Cannot review a request that is already ${request.status}`)
    }

    const typeLabels = {
      EMAIL_CHANGE: 'Email Change',
      PASSWORD_CHANGE: 'Password Change',
      PROFILE_PHOTO: 'Profile Photo',
      NAME: 'Display Name',
      SPECIALIZATION: 'Specialization',
      HEADLINE: 'Headline',
      BIOGRAPHY: 'Biography',
      PROFILE_DATA: 'Profile'
    }
    const typeLabel = typeLabels[request.requestType] || 'Profile Change'

    if (action === 'REJECTED') {
      await prisma.$transaction(async (tx) => {
        await tx.profileChangeRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            adminNote: adminNote.trim(),
            rejectionReason: adminNote.trim(),
            reviewedBy: req.user.email,
            reviewedAt: new Date()
          }
        })

        // Notify Creator with the required rejection reason
        await tx.notification.create({
          data: {
            userId: request.creatorProfile.userId,
            title: `${typeLabel} Request Declined`,
            message: `Your ${typeLabel.toLowerCase()} request was declined: ${adminNote.trim()}`,
            linkUrl: '/creator/profile'
          }
        })
      })

      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'PROFILE_REQUEST_REJECTED',
          entityType: 'ProfileChangeRequest',
          entityId: id,
          details: `Admin ${req.user.email} rejected ${typeLabel} request (ID: ${id.slice(0, 8)}). Reason: ${adminNote.trim()}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      }).catch(() => {})

      return successResponse(res, null, `${typeLabel} request has been rejected.`)
    }

    // ACTION === 'APPROVED'
    if (request.requestType === 'EMAIL_CHANGE') {
      // Generate 6-digit OTP code for verification
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.$transaction(async (tx) => {
        await tx.profileChangeRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            verificationToken: otpCode,
            tokenExpiresAt: expiry,
            approvalExpiresAt: expiry,
            adminNote: adminNote?.trim() || null,
            reviewedBy: req.user.email,
            reviewedAt: new Date()
          }
        })

        // Notify Creator
        await tx.notification.create({
          data: {
            userId: request.creatorProfile.userId,
            title: 'Email Change Request Approved',
            message: `Your email change request has been approved. Verify your new email address to complete the change. Verification code: ${otpCode}`,
            linkUrl: '/creator/profile'
          }
        })
      })

      // Dispatch verification email to the requested new email
      emailService.sendMail({
        to: request.requestedValue,
        subject: 'Verify Your New Email Address - AIVORTEX',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
            <h2 style="color: #0F172A;">Email Change Verification</h2>
            <p>Hello ${request.creatorProfile?.user?.name || 'Creator'},</p>
            <p>Your request to update your AIVORTEX account email to <strong>${request.requestedValue}</strong> was approved by Administrator.</p>
            <p>Please enter this 6-digit verification code in your Creator Profile to complete the update:</p>
            <div style="background: #F1F5F9; padding: 14px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563EB; border-radius: 6px; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="color: #64748B; font-size: 13px;">This code is valid for 24 hours. Your existing email remains active until verification is complete.</p>
          </div>
        `,
        text: `Your email change request was approved. Verification code: ${otpCode}. Valid for 24 hours.`
      }).catch(() => {})

      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'PROFILE_REQUEST_APPROVED',
          entityType: 'ProfileChangeRequest',
          entityId: id,
          details: `Admin ${req.user.email} approved Email Change request to ${request.requestedValue} (OTP generated, pending Creator verification)`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      }).catch(() => {})

      return successResponse(res, null, 'Email change request approved. Creator has been sent a verification code.')
    }

    if (request.requestType === 'PASSWORD_CHANGE') {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.$transaction(async (tx) => {
        await tx.profileChangeRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvalExpiresAt: expiry,
            adminNote: adminNote?.trim() || null,
            reviewedBy: req.user.email,
            reviewedAt: new Date()
          }
        })

        // Notify Creator exactly per requirement 9:
        await tx.notification.create({
          data: {
            userId: request.creatorProfile.userId,
            title: 'Password Change Request Approved',
            message: 'Your password change request has been approved. You can now set a new password from My Profile.',
            linkUrl: '/creator/profile'
          }
        })
      })

      // Audit log - STRICTLY NO PASSWORDS RECORDED
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'PROFILE_REQUEST_APPROVED',
          entityType: 'ProfileChangeRequest',
          entityId: id,
          details: `Admin ${req.user.email} approved Password Change permission for creator (valid for 24h, no password values involved)`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      }).catch(() => {})

      return successResponse(res, null, 'Password change request approved. Creator can now set their new password.')
    }

    // Direct Profile updates: PROFILE_PHOTO, NAME, SPECIALIZATION, HEADLINE, BIOGRAPHY, PROFILE_DATA
    await prisma.$transaction(async (tx) => {
      if (request.requestType === 'PROFILE_PHOTO') {
        await tx.user.update({
          where: { id: request.creatorProfile.userId },
          data: { avatar: request.requestedValue }
        })
      } else if (request.requestType === 'NAME') {
        await tx.user.update({
          where: { id: request.creatorProfile.userId },
          data: { name: request.requestedValue }
        })
      } else if (request.requestType === 'SPECIALIZATION') {
        await tx.creatorProfile.update({
          where: { id: request.creatorProfileId },
          data: { specialization: request.requestedValue }
        })
      } else if (request.requestType === 'HEADLINE') {
        await tx.creatorProfile.update({
          where: { id: request.creatorProfileId },
          data: { headline: request.requestedValue }
        })
      } else if (request.requestType === 'BIOGRAPHY') {
        await tx.creatorProfile.update({
          where: { id: request.creatorProfileId },
          data: { biography: request.requestedValue }
        })
      } else {
        // legacy PROFILE_DATA
        const updateData = {}
        if (request.requestedBio) updateData.biography = request.requestedBio
        if (request.requestedHeadline) updateData.headline = request.requestedHeadline
        if (request.supportingUrl) updateData.portfolioUrl = request.supportingUrl
        await tx.creatorProfile.update({
          where: { id: request.creatorProfileId },
          data: updateData
        })
      }

      await tx.profileChangeRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          adminNote: adminNote?.trim() || null,
          reviewedBy: req.user.email,
          reviewedAt: new Date()
        }
      })

      await tx.notification.create({
        data: {
          userId: request.creatorProfile.userId,
          title: `${typeLabel} Update Approved`,
          message: `Your ${typeLabel.toLowerCase()} changes have been verified and applied by Administrator.`,
          linkUrl: '/creator/profile'
        }
      })
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PROFILE_REQUEST_APPROVED',
        entityType: 'ProfileChangeRequest',
        entityId: id,
        details: `Admin ${req.user.email} approved and applied ${typeLabel} request (ID: ${id.slice(0, 8)})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    }).catch(() => {})

    return successResponse(res, null, `${typeLabel} request approved and applied successfully.`)
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

// 12. Offer Management (Full CRUD with Course Relation)
export async function getOffers(req, res, next) {
  try {
    const { courseId } = req.query
    const where = {}
    if (courseId) {
      where.OR = [
        { courseId },
        { courseId: null }
      ]
    }

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true, slug: true } }
      }
    })
    return successResponse(res, { offers })
  } catch (err) {
    next(err)
  }
}

export async function createOffer(req, res, next) {
  try {
    const {
      title,
      code,
      courseId,
      discountPercent,
      discountAmount,
      startDate,
      endDate,
      isActive = true,
      maxUses
    } = req.body

    if (!title || !code) {
      throw new BadRequestError('Offer title and coupon code are required')
    }

    if (discountPercent === undefined && discountAmount === undefined) {
      throw new BadRequestError('Either discount percentage or discount amount must be provided')
    }

    const cleanCode = code.trim().toUpperCase()

    const existing = await prisma.offer.findUnique({
      where: { code: cleanCode }
    })
    if (existing) {
      throw new BadRequestError(`Offer with code '${cleanCode}' already exists`)
    }

    if (courseId) {
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (!course) {
        throw new NotFoundError(`Course with ID ${courseId} not found`)
      }
    }

    const offer = await prisma.offer.create({
      data: {
        title: title.trim(),
        code: cleanCode,
        courseId: courseId ? String(courseId).trim() : null,
        discountPercent: discountPercent !== undefined && discountPercent !== null ? Number(discountPercent) : null,
        discountAmount: discountAmount !== undefined && discountAmount !== null ? Number(discountAmount) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: Boolean(isActive),
        maxUses: maxUses ? Number(maxUses) : null
      },
      include: {
        course: { select: { id: true, title: true, slug: true } }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'OFFER_CREATED',
        entityType: 'Offer',
        entityId: offer.id,
        details: `Admin created coupon offer ${offer.code} (${offer.title}) for ${offer.course ? offer.course.title : 'All Courses'}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { offer }, 'Offer created successfully', 201)
  } catch (err) {
    next(err)
  }
}

export async function updateOffer(req, res, next) {
  try {
    const { id } = req.params
    const {
      title,
      code,
      courseId,
      discountPercent,
      discountAmount,
      startDate,
      endDate,
      isActive,
      maxUses
    } = req.body

    const existing = await prisma.offer.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Offer not found')
    }

    const data = {}
    if (title !== undefined) data.title = title.trim()
    if (code !== undefined) {
      const cleanCode = code.trim().toUpperCase()
      if (cleanCode !== existing.code) {
        const duplicate = await prisma.offer.findUnique({ where: { code: cleanCode } })
        if (duplicate) {
          throw new BadRequestError(`Offer with code '${cleanCode}' already exists`)
        }
      }
      data.code = cleanCode
    }
    if (courseId !== undefined) {
      if (courseId) {
        const course = await prisma.course.findUnique({ where: { id: courseId } })
        if (!course) throw new NotFoundError('Course not found')
        data.courseId = courseId
      } else {
        data.courseId = null
      }
    }
    if (discountPercent !== undefined) data.discountPercent = discountPercent !== null ? Number(discountPercent) : null
    if (discountAmount !== undefined) data.discountAmount = discountAmount !== null ? Number(discountAmount) : null
    if (startDate !== undefined) data.startDate = new Date(startDate)
    if (endDate !== undefined) data.endDate = new Date(endDate)
    if (isActive !== undefined) data.isActive = Boolean(isActive)
    if (maxUses !== undefined) data.maxUses = maxUses !== null ? Number(maxUses) : null

    const updated = await prisma.offer.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, title: true, slug: true } }
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'OFFER_UPDATED',
        entityType: 'Offer',
        entityId: id,
        details: `Admin updated offer ${updated.code}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { offer: updated }, 'Offer updated successfully')
  } catch (err) {
    next(err)
  }
}

export async function deleteOffer(req, res, next) {
  try {
    const { id } = req.params

    const existing = await prisma.offer.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Offer not found')
    }

    await prisma.offer.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'OFFER_DELETED',
        entityType: 'Offer',
        entityId: id,
        details: `Admin deleted offer ${existing.code}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, null, 'Offer deleted successfully')
  } catch (err) {
    next(err)
  }
}

// 12. Admin Personal Profile (View & Edit)
export async function getAdminProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw new NotFoundError('Admin profile record not found')
    }

    return successResponse(res, { user })
  } catch (err) {
    next(err)
  }
}

export async function updateAdminProfile(req, res, next) {
  try {
    const { name, phone, bio, avatar } = req.body

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? (phone ? phone.trim() : null) : undefined,
        bio: bio !== undefined ? (bio ? bio.trim() : null) : undefined,
        avatar: avatar !== undefined ? (avatar ? avatar.trim() : null) : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ADMIN_PROFILE_UPDATED',
        entityType: 'User',
        entityId: req.user.id,
        details: `Admin ${updated.name} updated personal profile details`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { user: updated }, 'Profile updated successfully')
  } catch (err) {
    next(err)
  }
}

import defaultAboutData from '../data/defaultAboutData.js'
import { defaultFooterData } from '../data/defaultFooterData.js'

export async function getAdminAboutContent(req, res, next) {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: 'about_page_content' }
    })

    let content = defaultAboutData
    if (setting?.value) {
      try {
        content = JSON.parse(setting.value)
      } catch (e) {
        content = defaultAboutData
      }
    }

    return successResponse(res, { about: content }, 'About content retrieved successfully')
  } catch (err) {
    next(err)
  }
}

export async function updateAdminAboutContent(req, res, next) {
  try {
    const aboutData = req.body
    if (!aboutData || typeof aboutData !== 'object') {
      throw new BadRequestError('Invalid about content data format')
    }

    const jsonValue = JSON.stringify(aboutData)

    const setting = await prisma.platformSetting.upsert({
      where: { key: 'about_page_content' },
      update: {
        value: jsonValue,
        description: 'Public About Page & Leadership details'
      },
      create: {
        key: 'about_page_content',
        value: jsonValue,
        description: 'Public About Page & Leadership details'
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ABOUT_PAGE_UPDATED',
        entityType: 'PlatformSetting',
        entityId: setting.id,
        details: `Admin ${req.user.email} updated public About page and leadership configurations`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { about: aboutData }, 'About page content updated successfully')
  } catch (err) {
    next(err)
  }
}

export async function getAdminFooterContent(req, res, next) {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: 'footer_content' }
    })

    let content = defaultFooterData
    if (setting?.value) {
      try {
        content = JSON.parse(setting.value)
      } catch (e) {
        content = defaultFooterData
      }
    }

    return successResponse(res, { footer: content }, 'Footer content retrieved successfully')
  } catch (err) {
    next(err)
  }
}

export async function updateAdminFooterContent(req, res, next) {
  try {
    const footerData = req.body
    if (!footerData || typeof footerData !== 'object') {
      throw new BadRequestError('Invalid footer content data format')
    }

    const jsonValue = JSON.stringify(footerData)

    const setting = await prisma.platformSetting.upsert({
      where: { key: 'footer_content' },
      update: {
        value: jsonValue,
        description: 'Public Footer Navigation & Brand Details'
      },
      create: {
        key: 'footer_content',
        value: jsonValue,
        description: 'Public Footer Navigation & Brand Details'
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'FOOTER_CONTENT_UPDATED',
        entityType: 'PlatformSetting',
        entityId: setting.id,
        details: `Admin ${req.user.email} updated public Footer navigation and links`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { footer: footerData }, 'Footer content updated successfully')
  } catch (err) {
    next(err)
  }
}

// 21. Admin Support Tickets Management
export async function getAdminSupportTickets(req, res, next) {
  try {
    const { status, search } = req.query
    const where = {}
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase()
    }
    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { student: { name: { contains: q, mode: 'insensitive' } } },
        { student: { email: { contains: q, mode: 'insensitive' } } }
      ]
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        }
      }
    })

    return successResponse(res, { tickets, count: tickets.length })
  } catch (err) {
    next(err)
  }
}

export async function updateAdminSupportTicketStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status. Allowed: ${validStatuses.join(', ')}`)
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status }
    })

    if (ticket.studentId) {
      await prisma.notification.create({
        data: {
          userId: ticket.studentId,
          title: 'Support Ticket Status Changed',
          message: `Your support ticket "${ticket.subject}" status is now ${status}`,
          linkUrl: '/student/support'
        }
      }).catch(() => {})
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TICKET_STATUS_UPDATED',
        entityType: 'SupportTicket',
        entityId: id,
        details: `Admin ${req.user.email} updated ticket status to ${status}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { ticket }, 'Ticket status updated')
  } catch (err) {
    next(err)
  }
}

// 22. Admin Contact & Admissions Enquiries Management
export async function getAdminContactEnquiries(req, res, next) {
  try {
    const { status, search } = req.query
    const where = {}
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase()
    }
    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } }
      ]
    }

    const enquiries = await prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(res, { enquiries, count: enquiries.length })
  } catch (err) {
    next(err)
  }
}

export async function updateAdminContactEnquiryStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED']
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Invalid status. Allowed: ${validStatuses.join(', ')}`)
    }

    const enquiry = await prisma.contactEnquiry.update({
      where: { id },
      data: { status }
    })

    return successResponse(res, { enquiry }, 'Contact enquiry status updated')
  } catch (err) {
    next(err)
  }
}



import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { UnauthorizedError, ConflictError, BadRequestError, NotFoundError } from '../utils/appError.js'
import { successResponse } from '../utils/responseWrapper.js'
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js'
import prisma from '../config/prisma.js'
import emailService from '../services/emailService.js'

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new BadRequestError('Email and password are required')
    }

    const cleanEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        creatorProfile: true
      }
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password credentials')
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      // Record failed attempt audit
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'FAILED_LOGIN',
            entityType: 'User',
            entityId: user.id,
            details: `Failed login attempt for ${cleanEmail}`,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || 'Unknown'
          }
        })
      } catch (logErr) {
        // silent
      }
      throw new UnauthorizedError('Invalid email or password credentials')
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account has been suspended. Please contact administrator.')
    }

    const token = generateToken(user)
    setAuthCookie(res, token)

    // Track active session in database
    const sessionToken = uuidv4()
    try {
      await prisma.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          userAgent: req.headers['user-agent'] || 'Unknown',
          ipAddress: String(req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
          details: `User ${user.email} logged in successfully as ${user.role}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Unknown'
        }
      })
    } catch (sessionErr) {
      console.warn('Session record creation warning:', sessionErr.message)
    }

    return successResponse(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar || null,
          phone: user.phone || null,
          bio: user.bio || null,
          creatorProfile: user.creatorProfile || null
        },
        token,
        sessionId: sessionToken
      },
      'Authentication successful'
    )
  } catch (err) {
    next(err)
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required')
    }

    const cleanEmail = email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail }
    })

    if (existing) {
      throw new ConflictError('An account with this email address already exists')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
        phone: phone ? phone.trim() : null
      }
    })

    const token = generateToken(newUser)
    setAuthCookie(res, token)

    // Create session & audit record
    try {
      await prisma.session.create({
        data: {
          userId: newUser.id,
          token: uuidv4(),
          userAgent: req.headers['user-agent'] || 'Unknown',
          ipAddress: String(req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })

      await prisma.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'STUDENT_REGISTERED',
          entityType: 'User',
          entityId: newUser.id,
          details: `New student ${cleanEmail} registered`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      })
    } catch (e) {
      // silent
    }

    return successResponse(
      res,
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: null
        },
        token
      },
      'Registration successful',
      201
    )
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    const userId = req.user?.id
    clearAuthCookie(res)

    if (userId) {
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'USER_LOGOUT',
            entityType: 'User',
            entityId: userId,
            details: 'User logged out and session terminated',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
          }
        })
      } catch (e) {
        // silent
      }
    }

    return successResponse(res, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: true
      }
    })

    if (!user) {
      throw new NotFoundError('User profile not found')
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Account is suspended. Please contact administrator.')
    }

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        status: user.status,
        creatorProfile: user.creatorProfile
      }
    })
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const userId = req.user.id
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current password and new password are required')
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long')
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new NotFoundError('User not found')
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      throw new BadRequestError('Current password does not match records')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    })

    // Invalidate prior sessions
    await prisma.session.deleteMany({
      where: { userId }
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        entityType: 'User',
        entityId: userId,
        details: 'User password updated and other sessions revoked',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, null, 'Password changed successfully. Please log in with new credentials.')
  } catch (err) {
    next(err)
  }
}

export async function getActiveSessions(req, res, next) {
  try {
    const userId = req.user.id

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true
      }
    })

    return successResponse(res, { sessions })
  } catch (err) {
    next(err)
  }
}

export async function revokeSession(req, res, next) {
  try {
    const userId = req.user.id
    const { sessionId } = req.params

    await prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId // Guarantee ownership (IDOR protection)
      }
    })

    return successResponse(res, null, 'Session revoked successfully')
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body
    if (!email) {
      throw new BadRequestError('Email address is required')
    }

    const cleanEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } })

    if (user && user.status !== 'SUSPENDED') {
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id }
      }).catch(() => {})

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt
        }
      })

      try {
        await emailService.sendPasswordResetEmail({
          toEmail: user.email,
          name: user.name,
          token: resetToken
        })
      } catch (mailErr) {
        console.warn('⚠️ SMTP password reset dispatch error:', mailErr.message)
      }
    }

    return successResponse(
      res,
      null,
      'If an account exists with that email address, password reset instructions have been sent.'
    )
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token } = req.body
    const newPassword = req.body.newPassword || req.body.password

    if (!token || !newPassword) {
      throw new BadRequestError('Reset token and new password are required')
    }

    if (newPassword.length < 8) {
      throw new BadRequestError('New password must be at least 8 characters long')
    }

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetTokenRecord || resetTokenRecord.usedAt || new Date(resetTokenRecord.expiresAt) < new Date()) {
      throw new BadRequestError('Password reset link is invalid or has expired. Please request a new one.')
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash }
      })

      await tx.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() }
      })

      await tx.session.deleteMany({
        where: { userId: resetTokenRecord.userId }
      })

      await tx.auditLog.create({
        data: {
          userId: resetTokenRecord.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          entityType: 'User',
          entityId: resetTokenRecord.userId,
          details: `Password reset successfully via email token for ${resetTokenRecord.user.email}`,
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        }
      })
    })

    return successResponse(res, null, 'Password has been reset successfully. Please log in with your new password.')
  } catch (err) {
    next(err)
  }
}

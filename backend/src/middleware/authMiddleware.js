import { UnauthorizedError, ForbiddenError } from '../utils/appError.js'
import { verifyToken } from '../utils/token.js'
import prisma from '../config/prisma.js'

export async function requireAuth(req, res, next) {
  try {
    let token = null

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.apex_token) {
      token = req.cookies.apex_token
    }

    // 2. Check Authorization Bearer header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // 3. Check query param token (useful for streaming uploads / media downloads)
    if (!token && req.query && req.query.token) {
      token = req.query.token
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please sign in.')
    }

    const decoded = verifyToken(token)

    // Authoritative check: User must exist and not be suspended/inactive
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, status: true }
    })

    if (!user) {
      throw new UnauthorizedError('Account does not exist or has been removed.')
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Your account has been suspended. Please contact platform administration.')
    }

    if (user.status === 'INACTIVE') {
      throw new ForbiddenError('Your account is currently inactive.')
    }

    req.user = {
      ...decoded,
      role: user.role,
      status: user.status
    }

    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Session expired or invalid token. Please log in again.'))
    } else {
      next(err)
    }
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'))
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access forbidden: requires ${allowedRoles.join(' or ')} privilege. Current role: ${req.user.role}`
        )
      )
    }

    next()
  }
}

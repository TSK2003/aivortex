import { UnauthorizedError, ForbiddenError } from '../utils/appError.js'
import { verifyToken } from '../utils/token.js'

export function requireAuth(req, res, next) {
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

    if (!token) {
      throw new UnauthorizedError('Authentication required. Please sign in.')
    }

    const decoded = verifyToken(token)
    req.user = decoded
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

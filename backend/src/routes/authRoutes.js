import { Router } from 'express'
import {
  login,
  register,
  logout,
  me,
  changePassword,
  getActiveSessions,
  revokeSession
} from '../controllers/authController.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { validateRequest } from '../middleware/validate.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { loginSchema, registerSchema } from '../validators/authValidators.js'

const router = Router()

// Public Auth Endpoints with Rate Limiting & Validation
router.post('/login', authLimiter, validateRequest(loginSchema), login)
router.post('/student/login', authLimiter, validateRequest(loginSchema), login)
router.post('/creator/login', authLimiter, validateRequest(loginSchema), login)
router.post('/admin/login', authLimiter, validateRequest(loginSchema), login)
router.post('/register', authLimiter, validateRequest(registerSchema), register)
router.post('/student/signup', authLimiter, validateRequest(registerSchema), register)

// Authenticated Endpoints
router.post('/logout', requireAuth, logout)
router.get('/me', requireAuth, me)
router.post('/change-password', requireAuth, authLimiter, changePassword)
router.get('/sessions', requireAuth, getActiveSessions)
router.delete('/sessions/:sessionId', requireAuth, revokeSession)

export default router

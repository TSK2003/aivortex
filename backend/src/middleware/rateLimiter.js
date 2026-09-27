import rateLimit from 'express-rate-limit'
import { errorResponse } from '../utils/responseWrapper.js'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests from this IP, please try again in 15 minutes')
  }
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 429, 'AUTH_RATE_LIMIT_EXCEEDED', 'Too many authentication attempts. Please wait 15 minutes before retrying.')
  }
})

export const generalLimiter = apiLimiter

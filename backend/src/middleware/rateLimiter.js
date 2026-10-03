import rateLimit from 'express-rate-limit'
import { errorResponse } from '../utils/responseWrapper.js'

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
const isTest = process.env.NODE_ENV === 'test'

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : (isDev ? 2500 : 600), // Generous headroom for dev/test, strict for prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Retry-After', '60')
    return errorResponse(res, 429, 'RATE_LIMIT_EXCEEDED', 'Too many requests from this IP. Please wait a moment before trying again.')
  }
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : (isDev ? 200 : 30), // Max 30 attempts per 15 mins in production
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Retry-After', '60')
    return errorResponse(res, 429, 'AUTH_RATE_LIMIT_EXCEEDED', 'Too many authentication attempts. Please wait 15 minutes before retrying.')
  }
})

export const generalLimiter = apiLimiter


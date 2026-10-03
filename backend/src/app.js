import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env } from './config/env.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler } from './middleware/errorHandler.js'
import { NotFoundError } from './utils/appError.js'

import healthRoutes from './routes/healthRoutes.js'
import authRoutes from './routes/authRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import creatorRoutes from './routes/creatorRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import mediaRoutes from './routes/mediaRoutes.js'

const app = express()

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
)

// CORS Configuration
const allowedOrigins = [
  ...(env.CLIENT_URL ? env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://13.201.19.85'
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
)

// Cookie Parser
app.use(cookieParser(env.COOKIE_SECRET))

// Body Parsing (with rawBody capture for webhook verification)
app.use(express.json({
  limit: '500mb',
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))
app.use(express.urlencoded({ extended: true, limit: '500mb' }))

// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
}

// Global API Rate Limiter
app.use('/api', apiLimiter)

// Route Mounting
app.use('/health', healthRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/creator', creatorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api', notificationRoutes)

// Authenticated Media Delivery (replaces insecure express.static('/uploads'))
app.use('/api/media', mediaRoutes)

// Seamless backward-compatible gateway for direct /uploads/... requests
app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
    req.url = `/public/thumbnails${req.path}`
  } else {
    req.url = `/stream${req.path}`
  }
  return mediaRoutes(req, res, next)
})

// 404 Handler for Unmatched API Routes
app.use('/api', (req, res, next) => {
  next(new NotFoundError(`API endpoint ${req.method} ${req.originalUrl} not found`))
})

// Centralized Error Handling
app.use(errorHandler)

export default app

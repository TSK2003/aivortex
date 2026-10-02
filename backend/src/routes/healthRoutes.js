import { Router } from 'express'
import { successResponse, errorResponse } from '../utils/responseWrapper.js'
import prisma from '../config/prisma.js'

const router = Router()

// Liveness Probe: Verifies process is alive and responding
router.get('/', (req, res) => {
  return successResponse(res, {
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    service: 'aivortex API Engine'
  }, 'Service healthy')
})

router.get('/live', (req, res) => {
  return successResponse(res, {
    status: 'UP',
    timestamp: new Date().toISOString()
  }, 'Liveness check passed')
})

// Readiness Probe: Verifies critical dependencies (database connectivity)
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return successResponse(res, {
      status: 'READY',
      database: 'CONNECTED',
      timestamp: new Date().toISOString()
    }, 'Readiness check passed')
  } catch (error) {
    return res.status(503).json({
      success: false,
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    })
  }
})

export default router

import { Router } from 'express'
import { successResponse } from '../utils/responseWrapper.js'

const router = Router()

router.get('/', (req, res) => {
  return successResponse(res, {
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    service: 'aivortex API Engine'
  }, 'Service healthy')
})

export default router

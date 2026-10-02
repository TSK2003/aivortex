import app from './app.js'
import { env } from './config/env.js'

// ApexLearn API Server Entry Point
const PORT = parseInt(env.PORT, 10) || 3001

const server = app.listen(PORT, () => {
  console.log(`[INFO] ApexLearn API Server running on port ${PORT} [${env.NODE_ENV}]`)
  console.log(`[INFO] Health Check: http://localhost:${PORT}/api/health`)
})

// Graceful Shutdown
function handleShutdown(signal) {
  console.log(`\n[INFO] Received ${signal}. Shutting down ApexLearn server gracefully...`)
  server.close(() => {
    console.log('[INFO] HTTP server closed. Process terminating clean.')
    process.exit(0)
  })

  // Force close after 10s if connections remain stuck
  setTimeout(() => {
    console.error('[WARN] Forcefully terminating open connections after timeout.')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGINT', () => handleShutdown('SIGINT'))

export default server

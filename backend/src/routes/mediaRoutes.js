import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import {
  streamProtectedMedia,
  streamPublicThumbnail
} from '../controllers/secureMediaController.js'

const router = Router()

// Public thumbnails and course preview images (no auth required)
// These are referenced in the public catalog and must be accessible without login.
router.get('/public/thumbnails/:folder/:fileName', streamPublicThumbnail)
router.get('/public/thumbnails/:fileName', streamPublicThumbnail)

// All other media assets require authentication
// Video lessons, lesson resources, and protected uploads are served through this gateway.
router.get('/stream/:folder/:subFolder/:fileName', requireAuth, streamProtectedMedia)
router.get('/stream/:folder/:fileName', requireAuth, streamProtectedMedia)

export default router

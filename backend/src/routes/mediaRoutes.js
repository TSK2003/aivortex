import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import {
  streamProtectedMedia,
  streamPublicThumbnail,
  deleteMediaAsset
} from '../controllers/secureMediaController.js'

const router = Router()

// Public thumbnails and course preview images (no auth required)
router.get('/public/thumbnails/*', streamPublicThumbnail)
router.get('/public/thumbnails/:folder/:fileName', streamPublicThumbnail)
router.get('/public/thumbnails/:fileName', streamPublicThumbnail)

// Protected media delivery (Video lessons, lesson resources, course previews)
// Supports HTTP Range streaming for seeking and ?download=1 flag for downloading
router.get('/stream/*', requireAuth, streamProtectedMedia)
router.get('/stream/:folder/:subFolder/:fileName', requireAuth, streamProtectedMedia)
router.get('/stream/:folder/:fileName', requireAuth, streamProtectedMedia)

// Direct download route
router.get('/download/*', requireAuth, streamProtectedMedia)

// Media asset removal (Admins and Creators only)
router.delete('/stream/*', requireAuth, requireRole('ADMIN', 'CREATOR'), deleteMediaAsset)
router.delete('/delete/*', requireAuth, requireRole('ADMIN', 'CREATOR'), deleteMediaAsset)

export default router

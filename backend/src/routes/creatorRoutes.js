import { Router } from 'express'
import {
  getAssignedCourses,
  createPlaylist,
  uploadVideo,
  submitVideoForReview,
  getCreatorSubmissions,
  getCreatorProfile,
  requestProfileChange,
  getUploadPresignedUrl
} from '../controllers/creatorController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require CREATOR or ADMIN role
router.use(requireAuth, requireRole('CREATOR', 'ADMIN'))

// Assigned Courses & Playlists
router.get('/courses', getAssignedCourses)
router.post('/playlists', createPlaylist)

// Lessons & Submissions
router.post('/videos', uploadVideo)
router.post('/videos/presigned-url', getUploadPresignedUrl)
router.post('/videos/:lessonId/submit', submitVideoForReview)
router.get('/submissions', getCreatorSubmissions)

// Profile & Change Requests
router.get('/profile', getCreatorProfile)
router.post('/profile-request', requestProfileChange)

export default router

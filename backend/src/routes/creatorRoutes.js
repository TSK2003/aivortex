import { Router } from 'express'
import {
  getAssignedCourses,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  uploadVideo,
  updateLesson,
  deleteLesson,
  submitVideoForReview,
  getCreatorSubmissions,
  getCreatorProfile,
  getCreatorRequests,
  requestProfileChange,
  verifyEmailChange,
  completePasswordChange,
  getUploadPresignedUrl,
  uploadLocalVideo
} from '../controllers/creatorController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require CREATOR or ADMIN role
router.use(requireAuth, requireRole('CREATOR', 'ADMIN'))

// Assigned Courses & Playlists (Sections)
router.get('/courses', getAssignedCourses)
router.post('/playlists', createPlaylist)
router.patch('/playlists/:playlistId', updatePlaylist)
router.delete('/playlists/:playlistId', deletePlaylist)

// Lessons & Submissions
router.post('/videos', uploadVideo)
router.patch('/videos/:lessonId', updateLesson)
router.delete('/videos/:lessonId', deleteLesson)
router.post('/videos/presigned-url', getUploadPresignedUrl)
router.put('/videos/upload-local', uploadLocalVideo)
router.post('/videos/upload-local', uploadLocalVideo)
router.post('/videos/:lessonId/submit', submitVideoForReview)
router.get('/submissions', getCreatorSubmissions)

// Profile & Change Requests
router.get('/profile', getCreatorProfile)
router.get('/requests', getCreatorRequests)
router.post('/profile-request', requestProfileChange)
router.post('/verify-email-change', verifyEmailChange)
router.post('/complete-password-change', completePasswordChange)

export default router


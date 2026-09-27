import { Router } from 'express'
import {
  getAnalyticsOverview,
  getCreators,
  inviteCreator,
  updateCreatorStatus,
  getStudents,
  updateStudentStatus,
  getAdminCourses,
  createCourse,
  updateCourse,
  updatePricing,
  updatePublicControls,
  getVideoVerificationQueue,
  reviewVideo,
  publishLesson,
  unpublishLesson,
  getPayments,
  getEnrollments,
  getRequests,
  reviewRequest,
  broadcastAnnouncement,
  getReports,
  getAuditLogs,
  getActiveSessions,
  revokeSession
} from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require ADMIN role
router.use(requireAuth, requireRole('ADMIN'))

// Analytics & Overview
router.get('/overview', getAnalyticsOverview)

// Creators Management
router.get('/creators', getCreators)
router.post('/creators/invite', inviteCreator)
router.patch('/creators/:id/status', updateCreatorStatus)

// Students Management
router.get('/students', getStudents)
router.patch('/students/:id/status', updateStudentStatus)

// Course Management (Full CRUD)
router.get('/courses', getAdminCourses)
router.post('/courses', createCourse)
router.patch('/courses/:courseId', updateCourse)
router.patch('/courses/:courseId/pricing', updatePricing)
router.patch('/courses/:courseId/public-controls', updatePublicControls)

// Video Review & Publication Lifecycle (Separated!)
router.get('/video-verification', getVideoVerificationQueue)
router.post('/video-verification/:lessonId/review', reviewVideo)
router.patch('/video-verification/:lessonId/review', reviewVideo)
router.post('/lessons/:lessonId/publish', publishLesson)
router.patch('/lessons/:lessonId/publish', publishLesson)
router.post('/lessons/:lessonId/unpublish', unpublishLesson)
router.patch('/lessons/:lessonId/unpublish', unpublishLesson)

// Payments & Enrollments Audit
router.get('/payments', getPayments)
router.get('/enrollments', getEnrollments)

// Creator Profile Change Requests
router.get('/requests', getRequests)
router.patch('/requests/:id', reviewRequest)

// Broadcast Announcements
router.post('/announcements', broadcastAnnouncement)

// Reports & Analytics
router.get('/reports', getReports)

// Audit Logs
router.get('/audit-logs', getAuditLogs)

// Platform Security & Sessions
router.get('/security/sessions', getActiveSessions)
router.delete('/security/sessions/:sessionId', revokeSession)

export default router

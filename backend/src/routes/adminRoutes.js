import { Router } from 'express'
import {
  getAnalyticsOverview,
  getCreators,
  getCreatorById,
  createCreator,
  updateCreator,
  resetCreatorPassword,
  resendCreatorCredentials,
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
  revokeSession,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getAdminProfile,
  updateAdminProfile,
  getAdminAboutContent,
  updateAdminAboutContent,
  getAdminFooterContent,
  updateAdminFooterContent
} from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require ADMIN role
router.use(requireAuth, requireRole('ADMIN'))

// Analytics & Overview
router.get('/overview', getAnalyticsOverview)

// Admin Personal Profile
router.get('/profile', getAdminProfile)
router.patch('/profile', updateAdminProfile)

// Creators Management & Provisioning
router.get('/creators', getCreators)
router.post('/creators', createCreator)
router.get('/creators/:id', getCreatorById)
router.put('/creators/:id', updateCreator)
router.patch('/creators/:id/status', updateCreatorStatus)
router.post('/creators/:id/reset-password', resetCreatorPassword)
router.post('/creators/:id/resend-credentials', resendCreatorCredentials)
router.post('/creators/invite', inviteCreator)

// Students Management
router.get('/students', getStudents)
router.patch('/students/:id/status', updateStudentStatus)

// Course Management (Full CRUD)
router.get('/courses', getAdminCourses)
router.post('/courses', createCourse)
router.patch('/courses/:courseId', updateCourse)
router.patch('/courses/:courseId/pricing', updatePricing)
router.patch('/courses/:courseId/public-controls', updatePublicControls)

// Offer & Promotion Management (Full CRUD)
router.get('/offers', getOffers)
router.post('/offers', createOffer)
router.patch('/offers/:id', updateOffer)
router.delete('/offers/:id', deleteOffer)

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

// Public Page, About & Footer Management
router.get('/about', getAdminAboutContent)
router.put('/about', updateAdminAboutContent)
router.get('/footer', getAdminFooterContent)
router.put('/footer', updateAdminFooterContent)

export default router

import { Router } from 'express'
import {
  getDashboardStats,
  getMyCourses,
  toggleLessonProgress,
  getNote,
  saveNote,
  getStudentCertificates,
  getStudentPayments,
  updateProfile
} from '../controllers/studentController.js'
import {
  startVideoSession,
  heartbeatVideoSession
} from '../controllers/videoProtectionController.js'
import {
  getLessonQuiz,
  submitQuizAttempt,
  issueCertificateIfEligible
} from '../controllers/assessmentController.js'
import {
  createTicket,
  getMyTickets,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/supportNotificationController.js'
import {
  getStudentCourseReview,
  submitCourseReview
} from '../controllers/reviewController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// All routes require authentication & student or admin role
router.use(requireAuth, requireRole('STUDENT', 'ADMIN'))

// Course Reviews by Eligible Scholars
router.get('/courses/:courseId/review', getStudentCourseReview)
router.post('/courses/:courseId/review', submitCourseReview)

// Dashboard & Courses
router.get('/dashboard', getDashboardStats)
router.get('/courses', getMyCourses)
router.post('/courses/:courseId/lessons/:lessonId/progress', toggleLessonProgress)
router.patch('/courses/:courseId/lessons/:lessonId/progress', toggleLessonProgress)
router.post('/progress', toggleLessonProgress)
router.patch('/progress', toggleLessonProgress)

// Private Lesson Notes
router.get('/lessons/:lessonId/notes', getNote)
router.post('/lessons/:lessonId/notes', saveNote)

// Video Session Protection & Concurrency Enforcement
router.post('/video-session/start', startVideoSession)
router.post('/video-session/heartbeat', heartbeatVideoSession)

// Quizzes & Certificate Issuance
router.get('/lessons/:lessonId/quiz', getLessonQuiz)
router.post('/quizzes/:quizId/submit', submitQuizAttempt)
router.post('/courses/:courseId/issue-certificate', issueCertificateIfEligible)
router.get('/certificates', getStudentCertificates)

// Financials & Profile
router.get('/payments', getStudentPayments)
router.patch('/profile', updateProfile)

// Notifications & Support Tickets
router.get('/notifications', getNotifications)
router.patch('/notifications/mark-all-read', markAllNotificationsAsRead)
router.patch('/notifications/:id/read', markNotificationAsRead)
router.get('/support-tickets', getMyTickets)
router.post('/support-tickets', (req, res, next) => {
  if (!req.body.message && req.body.description) {
    req.body.message = req.body.description
  }
  return createTicket(req, res, next)
})

export default router

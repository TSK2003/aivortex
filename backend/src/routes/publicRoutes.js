import { Router } from 'express'
import {
  getCourses,
  getCourseBySlug,
  verifyCertificate,
  getDomainProjects,
  getLiveSessions,
  submitContactEnquiry,
  getActiveOffers,
  validateOfferCode,
  getAboutContent,
  getFooterContent
} from '../controllers/publicController.js'
import {
  getCourseReviews,
  getFeaturedReviews
} from '../controllers/reviewController.js'
import {
  getPublicProjects,
  getPublicProjectCategories
} from '../controllers/projectController.js'
import {
  getPublicLiveSessions,
  rsvpLiveSession
} from '../controllers/liveSessionController.js'
import { generalLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Public About Page & Footer Details
router.get('/about', getAboutContent)
router.get('/footer', getFooterContent)

// Public Reviews & Testimonials
router.get('/reviews/featured', getFeaturedReviews)
router.get('/courses/:courseId/reviews', getCourseReviews)

// Public Catalog & Details
router.get('/courses', getCourses)
router.get('/courses/:slug', getCourseBySlug)

// Public Active Offers & Coupon Verification
router.get('/offers', getActiveOffers)
router.post('/offers/validate', generalLimiter, validateOfferCode)

// Public Credential Verification
router.get('/certificates/:code', generalLimiter, verifyCertificate)

// Dynamic Admin-Managed Domain Projects & Categories
router.get('/projects/categories', getPublicProjectCategories)
router.get('/projects', getPublicProjects)

// Dynamic Admin-Managed Live Masterclasses & RSVP
router.get('/live-sessions', getPublicLiveSessions)
router.post('/live-sessions/:id/rsvp', generalLimiter, rsvpLiveSession)

// Contact & Admissions Enquiry
router.post('/contact', generalLimiter, submitContactEnquiry)

export default router

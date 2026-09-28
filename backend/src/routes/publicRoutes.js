import { Router } from 'express'
import {
  getCourses,
  getCourseBySlug,
  verifyCertificate,
  getDomainProjects,
  getLiveSessions,
  submitContactEnquiry,
  getActiveOffers,
  validateOfferCode
} from '../controllers/publicController.js'
import { generalLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Public Catalog & Details
router.get('/courses', getCourses)
router.get('/courses/:slug', getCourseBySlug)

// Public Active Offers & Coupon Verification
router.get('/offers', getActiveOffers)
router.post('/offers/validate', generalLimiter, validateOfferCode)

// Public Credential Verification
router.get('/certificates/:code', generalLimiter, verifyCertificate)

// Preserved Domain Projects & Live Masterclasses
router.get('/projects', getDomainProjects)
router.get('/live-sessions', getLiveSessions)

// Contact & Admissions Enquiry
router.post('/contact', generalLimiter, submitContactEnquiry)

export default router

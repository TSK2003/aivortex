import { Router } from 'express'
import {
  createCheckoutOrder,
  verifyCheckoutPayment,
  handleWebhook
} from '../controllers/paymentController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

// Webhook endpoint (unauthenticated, cryptographically signed by Razorpay)
router.post('/webhook', handleWebhook)

// Student Authenticated Payment Endpoints
router.post('/orders', requireAuth, createCheckoutOrder)
router.post('/create-order', requireAuth, createCheckoutOrder)
router.post('/verify', requireAuth, verifyCheckoutPayment)

export default router

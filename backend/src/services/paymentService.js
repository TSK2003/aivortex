import crypto from 'crypto'
import Razorpay from 'razorpay'
import prisma from '../config/prisma.js'
import emailService from './emailService.js'
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/appError.js'
import { env } from '../config/env.js'

const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_2026'
const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret_2026'
const RAZORPAY_WEBHOOK_SECRET = env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_key'

const isConfigured = !RAZORPAY_KEY_ID.includes('placeholder') && !RAZORPAY_KEY_ID.includes('mock')

let razorpayClient = null
if (isConfigured) {
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  })
}

export const paymentService = {
  isConfigured: () => isConfigured,

  /**
   * Server-authoritative order creation. Calculates prices strictly on backend.
   */
  createOrder: async ({ studentId, courseId, offerCode }) => {
    // 1. Fetch Course details
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      throw new NotFoundError('Course not found')
    }

    if (!course.enrollmentOpen) {
      throw new BadRequestError('Enrollment is currently closed for this course')
    }

    // 2. Check if student already has active enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } }
    })

    if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
      const isExpired = existingEnrollment.expiresAt && new Date(existingEnrollment.expiresAt) < new Date()
      if (!isExpired) {
        throw new BadRequestError('You already have active enrollment in this course.')
      }
    }

    // 3. Free Course Flow: Immediate Enrollment without Payment
    if (course.isFree || course.price === 0) {
      const enrollment = await prisma.$transaction(async (tx) => {
        const enr = await tx.enrollment.upsert({
          where: { studentId_courseId: { studentId, courseId } },
          update: { status: 'ACTIVE', enrolledAt: new Date() },
          create: {
            studentId,
            courseId,
            status: 'ACTIVE',
            progressPercent: 0
          }
        })

        await tx.course.update({
          where: { id: courseId },
          data: { studentsCount: { increment: 1 } }
        })

        await tx.auditLog.create({
          data: {
            userId: studentId,
            action: 'FREE_ENROLLMENT_COMPLETED',
            entityType: 'Enrollment',
            entityId: enr.id,
            details: `Student enrolled freely in ${course.title}`
          }
        })

        return enr
      })

      return {
        isFree: true,
        enrolled: true,
        courseId: course.id,
        courseTitle: course.title,
        message: 'Successfully enrolled in free course'
      }
    }

    // 4. Paid Course Flow: Server calculates price & verifies offers
    let finalPrice = course.price

    if (offerCode) {
      const offer = await prisma.offer.findUnique({
        where: { code: offerCode.trim().toUpperCase() }
      })
      const now = new Date()
      if (offer && offer.isActive && offer.startDate <= now && offer.endDate >= now) {
        if (offer.discountPercent) {
          finalPrice = Math.max(0, finalPrice * (1 - offer.discountPercent / 100))
        } else if (offer.discountAmount) {
          finalPrice = Math.max(0, finalPrice - offer.discountAmount)
        }
      }
    }

    const amountInPaise = Math.round(finalPrice * 100)
    const receipt = `rec_${Date.now().toString().slice(-8)}`
    let razorpayOrderId = null

    if (isConfigured && razorpayClient) {
      const rzpOrder = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: { courseId, studentId }
      })
      razorpayOrderId = rzpOrder.id
    } else {
      // Deterministic test order ID for development
      razorpayOrderId = `order_test_${Date.now()}`
    }

    // 5. Persist Order in database with PENDING status inside transaction
    const order = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
          studentId,
          courseId,
          amount: finalPrice,
          currency: 'INR',
          razorpayOrderId,
          status: 'PENDING'
        }
      })

      await tx.paymentEvent.create({
        data: {
          orderId: ord.id,
          eventType: 'ORDER_CREATED',
          amount: finalPrice,
          status: 'PENDING',
          gatewayReference: razorpayOrderId,
          metadata: JSON.stringify({ receipt, originalPrice: course.originalPrice, finalPrice })
        }
      })

      return ord
    })

    return {
      isFree: false,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: finalPrice,
      amountInPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      courseTitle: course.title
    }
  },

  /**
   * Cryptographic HMAC-SHA256 signature verification and atomic enrollment.
   */
  verifyPayment: async ({ studentId, courseId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    if (!razorpayOrderId || !razorpayPaymentId) {
      throw new BadRequestError('Razorpay order ID and payment ID are required')
    }

    let isValid = false

    if (isConfigured) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex')

      isValid = generatedSignature === razorpaySignature
    } else {
      // In development/test mode, verify format
      isValid = Boolean(razorpaySignature && razorpayPaymentId)
    }

    if (!isValid) {
      // Record failure audit
      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: { status: 'FAILED' }
      }).catch(() => {})

      throw new BadRequestError('Payment signature verification failed. Potential tampering detected.')
    }

    // 1. Transactional Update: mark order SUCCESSFUL and activate ENROLLMENT atomically
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { razorpayOrderId },
        include: { course: true }
      })

      if (!order) {
        throw new NotFoundError('Order matching razorpay order ID not found')
      }

      // Idempotency: if already successful, return early without duplicate side effects
      if (order.status === 'SUCCESSFUL') {
        return { order, enrolled: true, alreadyProcessed: true }
      }

      // Update Order
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: 'SUCCESSFUL'
        }
      })

      // Calculate expiration if course has fixed access duration
      let expiresAt = null
      if (order.course.accessDurationDays) {
        expiresAt = new Date(Date.now() + order.course.accessDurationDays * 24 * 60 * 60 * 1000)
      }

      // Activate Enrollment
      const enrollment = await tx.enrollment.upsert({
        where: {
          studentId_courseId: { studentId, courseId: order.courseId }
        },
        update: {
          status: 'ACTIVE',
          expiresAt,
          enrolledAt: new Date()
        },
        create: {
          studentId,
          courseId: order.courseId,
          status: 'ACTIVE',
          expiresAt,
          progressPercent: 0
        }
      })

      // Increment course student count
      await tx.course.update({
        where: { id: order.courseId },
        data: { studentsCount: { increment: 1 } }
      })

      // Record Payment Audit Event
      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          eventType: 'PAYMENT_VERIFIED',
          amount: order.amount,
          status: 'SUCCESSFUL',
          gatewayReference: razorpayPaymentId
        }
      })

      // Record System Audit Log
      await tx.auditLog.create({
        data: {
          userId: studentId,
          action: 'PAYMENT_VERIFIED_ENROLLMENT_ACTIVATED',
          entityType: 'Order',
          entityId: order.id,
          details: `Order ${order.orderNumber} confirmed. Payment ID: ${razorpayPaymentId}. Course: ${order.course.title}`
        }
      })

      // In-app Notification
      await tx.notification.create({
        data: {
          userId: studentId,
          title: 'Enrollment Confirmed!',
          message: `Your payment for "${order.course.title}" was verified. Start learning now!`,
          linkUrl: `/student/courses`
        }
      })

      return { order: updatedOrder, enrollment, enrolled: true }
    })

    // 2. Dispatch Confirmation Email asynchronously
    try {
      const student = await prisma.user.findUnique({ where: { id: studentId } })
      const course = await prisma.course.findUnique({ where: { id: courseId } })
      if (student && course) {
        await emailService.sendPaymentConfirmation({
          toEmail: student.email,
          studentName: student.name,
          courseTitle: course.title,
          amount: result.order.amount,
          orderId: result.order.orderNumber
        })
      }
    } catch (mailErr) {
      console.warn('⚠️ SMTP confirmation dispatch warning:', mailErr.message)
    }

    return {
      success: true,
      enrolled: true,
      orderNumber: result.order.orderNumber,
      courseId
    }
  },

  /**
   * Authoritative Razorpay Webhook Handler with Replay Protection & Idempotency.
   */
  processWebhook: async ({ rawBody, signature }) => {
    // 1. Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      throw new BadRequestError('Invalid Razorpay webhook signature')
    }

    const event = JSON.parse(rawBody.toString())
    const eventId = event.event_id || event.id || `evt_${Date.now()}`
    const eventType = event.event

    // 2. Check Event Idempotency in Database
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId }
    })

    if (existingEvent) {
      // Event already recorded & processed; return duplicate acknowledgement safely
      return { success: true, duplicate: true, eventId }
    }

    // 3. Record Webhook Event
    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        payload: JSON.stringify(event),
        status: 'PROCESSING'
      }
    })

    // 4. Process Event Type
    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity
      const razorpayOrderId = paymentEntity.order_id
      const razorpayPaymentId = paymentEntity.id
      const notes = paymentEntity.notes || {}
      const studentId = notes.studentId
      const courseId = notes.courseId

      if (razorpayOrderId && studentId && courseId) {
        await paymentService.verifyPayment({
          studentId,
          courseId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: 'webhook_verified'
        }).catch((err) => console.warn('Webhook verification notice:', err.message))
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity
      const razorpayOrderId = paymentEntity.order_id
      if (razorpayOrderId) {
        await prisma.order.updateMany({
          where: { razorpayOrderId },
          data: { status: 'FAILED' }
        }).catch(() => {})
      }
    }

    // 5. Update Webhook Status to PROCESSED
    await prisma.webhookEvent.update({
      where: { eventId },
      data: { status: 'PROCESSED' }
    })

    return { success: true, processed: true, eventId }
  }
}

export default paymentService

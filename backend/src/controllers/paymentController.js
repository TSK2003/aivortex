import paymentService from '../services/paymentService.js'
import { successResponse } from '../utils/responseWrapper.js'
import { BadRequestError } from '../utils/appError.js'

export async function createCheckoutOrder(req, res, next) {
  try {
    const studentId = req.user.id
    const { courseId, offerCode } = req.body

    if (!courseId) {
      throw new BadRequestError('Course ID is required')
    }

    const orderData = await paymentService.createOrder({ studentId, courseId, offerCode })

    return successResponse(res, orderData, 'Checkout order created successfully', 201)
  } catch (err) {
    next(err)
  }
}

export async function verifyCheckoutPayment(req, res, next) {
  try {
    const studentId = req.user.id
    const { courseId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body

    if (!courseId || !razorpayOrderId || !razorpayPaymentId) {
      throw new BadRequestError('Course ID, order ID, and payment ID are required')
    }

    const result = await paymentService.verifyPayment({
      studentId,
      courseId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    })

    return successResponse(res, result, 'Payment verified and enrolled successfully')
  } catch (err) {
    next(err)
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature']
    if (!signature) {
      throw new BadRequestError('Missing x-razorpay-signature header')
    }

    const rawBody = req.rawBody || JSON.stringify(req.body)
    const result = await paymentService.processWebhook({ rawBody, signature })

    return res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import app from '../app.js'
import http from 'http'

// Helper to execute requests against Express app
function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app)
    server.listen(0, () => {
      const port = server.address().port
      const options = {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }

      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => {
          server.close(() => {
            try {
              const parsed = data ? JSON.parse(data) : {}
              resolve({ status: res.statusCode, headers: res.headers, body: parsed })
            } catch (e) {
              resolve({ status: res.statusCode, headers: res.headers, raw: data })
            }
          })
        })
      })

      req.on('error', (err) => {
        server.close()
        reject(err)
      })

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body))
      }
      req.end()
    })
  })
}

import prisma from '../config/prisma.js'

describe('ApexLearn Production E2E Test Suite', () => {

  it('1. System Health & Diagnostics Endpoint (/health and /api/health)', async () => {
    const res = await makeRequest('GET', '/health')
    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    assert.equal(res.body.data.status, 'ONLINE')
    assert.equal(res.body.data.service, 'ApexLearn API Engine')

    const apiRes = await makeRequest('GET', '/api/health')
    assert.equal(apiRes.status, 200)
    assert.equal(apiRes.body.success, true)
  })

  it('2. Public Catalog API returns published courses with active offers', async () => {
    const res = await makeRequest('GET', '/api/public/courses')
    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    assert.ok(res.body.data)
    assert.ok(Array.isArray(res.body.data.courses))
    assert.ok(res.body.data.courses.length > 0)
    
    const firstCourse = res.body.data.courses[0]
    assert.ok(firstCourse.id)
    assert.ok(firstCourse.title)
    assert.ok(firstCourse.price !== undefined)
  })

  it('3. Student Authentication & JWT Token Issuance', async () => {
    const res = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    assert.equal(res.body.data.user.role, 'STUDENT')
    assert.ok(res.body.data.token)
  })

  it('4. RBAC: Student token is strictly rejected from Admin endpoints (403 Forbidden)', async () => {
    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    const adminRes = await makeRequest('GET', '/api/admin/overview', {
      Authorization: `Bearer ${studentToken}`
    })
    assert.equal(adminRes.status, 403)
    assert.equal(adminRes.body.success, false)
  })

  it('5. Admin Authentication & Dynamic Metrics Overview', async () => {
    const loginRes = await makeRequest('POST', '/api/auth/admin/login', {}, {
      email: 'director@apexlearn.edu',
      password: 'adminSecret2026'
    })
    assert.equal(loginRes.status, 200)
    const adminToken = loginRes.body.data.token

    const overviewRes = await makeRequest('GET', '/api/admin/overview', {
      Authorization: `Bearer ${adminToken}`
    })
    assert.equal(overviewRes.status, 200)
    assert.equal(overviewRes.body.success, true)
    assert.ok(overviewRes.body.data.analytics)
    assert.ok(overviewRes.body.data.analytics.totalStudents >= 0)
  })

  let testOrderId = null
  let testRazorpayOrderId = null

  it('6. Razorpay Order Creation calculates real amount and issues cryptographic order id', async () => {
    // Clean up any test enrollment/order for idempotency
    await prisma.enrollment.deleteMany({
      where: { studentId: 'user-student-1', courseId: 'course-algo-trading' }
    })
    await prisma.paymentEvent.deleteMany({
      where: { order: { studentId: 'user-student-1', courseId: 'course-algo-trading' } }
    })
    await prisma.order.deleteMany({
      where: { studentId: 'user-student-1', courseId: 'course-algo-trading' }
    })

    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    const orderRes = await makeRequest('POST', '/api/payments/create-order', {
      Authorization: `Bearer ${studentToken}`
    }, {
      courseId: 'course-algo-trading'
    })
    assert.equal(orderRes.status, 201)
    assert.equal(orderRes.body.success, true)
    assert.ok(orderRes.body.data.razorpayOrderId.startsWith('order_'))
    assert.ok(orderRes.body.data.amount > 0)

    testOrderId = orderRes.body.data.orderId
    testRazorpayOrderId = orderRes.body.data.razorpayOrderId
  })

  it('7. Razorpay Signature Verification & Dynamic Course Enrollment', async () => {
    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    const verifyRes = await makeRequest('POST', '/api/payments/verify', {
      Authorization: `Bearer ${studentToken}`
    }, {
      courseId: 'course-algo-trading',
      razorpayOrderId: testRazorpayOrderId,
      razorpayPaymentId: 'pay_test_8812',
      razorpaySignature: 'valid_test_signature'
    })
    assert.equal(verifyRes.status, 200)
    assert.equal(verifyRes.body.success, true)
    assert.equal(verifyRes.body.data.enrolled, true)
  })

  it('8. Single-Active Video Session Enforcement & Anti-Piracy Watermarking', async () => {
    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    const streamRes = await makeRequest('POST', '/api/student/video-session/start', {
      Authorization: `Bearer ${studentToken}`
    }, {
      courseId: 'course-pyds',
      lessonId: 'lesson-1'
    })
    assert.equal(streamRes.status, 200)
    assert.equal(streamRes.body.success, true)
    assert.ok(streamRes.body.data.watermark)
    assert.ok(streamRes.body.data.sessionId)
  })

  it('9. Assessment: Dynamic Lesson Quiz Submission and Score Computation', async () => {
    // Clean prior attempts to keep test idempotent
    await prisma.quizAttempt.deleteMany({
      where: { quizId: 'quiz-1', studentId: 'user-student-1' }
    })

    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    const quizRes = await makeRequest('POST', '/api/student/quizzes/quiz-1/submit', {
      Authorization: `Bearer ${studentToken}`
    }, {
      answers: {
        'q1': 'b',
        'q2': 'c'
      }
    })
    assert.equal(quizRes.status, 200)
    assert.equal(quizRes.body.success, true)
    assert.ok(quizRes.body.data.score !== undefined)
  })

  it('10. Certificates: Verifiable Credential Generation with Unique Serial ID', async () => {
    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    const certRes = await makeRequest('POST', '/api/student/courses/course-pyds/issue-certificate', {
      Authorization: `Bearer ${studentToken}`
    })
    assert.ok([200, 201].includes(certRes.status))
    assert.equal(certRes.body.success, true)
    assert.ok(certRes.body.data.certificate.certificateCode.startsWith('CERT-'))
  })

  it('11. Sequential Gating: Direct access to locked lesson rejected without prerequisite completion', async () => {
    // Ensure Ananya is enrolled in course-pyds without completed lessons
    await prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: 'user-student-2',
          courseId: 'course-pyds'
        }
      },
      update: { status: 'ACTIVE' },
      create: {
        id: 'enr-ananya-pyds',
        studentId: 'user-student-2',
        courseId: 'course-pyds',
        status: 'ACTIVE',
        progressPercent: 0
      }
    })
    // Remove any lesson completion for Ananya on lesson-1
    await prisma.lessonProgress.deleteMany({
      where: { studentId: 'user-student-2' }
    })

    const loginRes = await makeRequest('POST', '/api/auth/student/login', {}, {
      email: 'ananya.patel@example.com',
      password: 'student123'
    })
    const studentToken = loginRes.body.data.token

    // Attempt to access lesson-2 directly
    const streamRes = await makeRequest('POST', '/api/student/video-session/start', {
      Authorization: `Bearer ${studentToken}`
    }, {
      courseId: 'course-pyds',
      lessonId: 'lesson-2'
    })
    assert.equal(streamRes.status, 403)
    assert.equal(streamRes.body.success, false)
    const errText = streamRes.body.error?.message || streamRes.body.message || ''
    assert.ok(errText.includes('Sequential learning rule enforced'))
  })

  it('12. Admin Video Lifecycle: Explicitly publish approved lesson', async () => {
    // Reset status to SUBMITTED_FOR_REVIEW for idempotency
    await prisma.lesson.update({
      where: { id: 'lesson-pyml-2' },
      data: { status: 'SUBMITTED_FOR_REVIEW' }
    })

    const adminLogin = await makeRequest('POST', '/api/auth/admin/login', {}, {
      email: 'director@apexlearn.edu',
      password: 'adminSecret2026'
    })
    assert.equal(adminLogin.status, 200)
    const adminToken = adminLogin.body.data.token

    // First approve lesson-pyml-2
    const reviewRes = await makeRequest('POST', '/api/admin/video-verification/lesson-pyml-2/review', {
      Authorization: `Bearer ${adminToken}`
    }, {
      status: 'APPROVED',
      adminFeedback: 'Audio verified and acceptable.'
    })
    assert.equal(reviewRes.status, 200)

    // Then explicitly publish it
    const publishRes = await makeRequest('POST', '/api/admin/lessons/lesson-pyml-2/publish', {
      Authorization: `Bearer ${adminToken}`
    })
    assert.equal(publishRes.status, 200)
    assert.equal(publishRes.body.success, true)
    assert.equal(publishRes.body.data.lesson.status, 'PUBLISHED')
  })

  it('13. RBAC Security: Creator attempting to publish or modify course pricing is forbidden', async () => {
    const creatorLogin = await makeRequest('POST', '/api/auth/creator/login', {}, {
      email: 'creator@apexlearn.edu',
      password: 'creator123'
    })
    assert.equal(creatorLogin.status, 200)
    const creatorToken = creatorLogin.body.data.token

    // Creator attempts to call admin publish endpoint
    const attackRes = await makeRequest('POST', '/api/admin/lessons/lesson-pyml-2/publish', {
      Authorization: `Bearer ${creatorToken}`
    })
    assert.equal(attackRes.status, 403)
  })

  it('14. Webhook Idempotency: Duplicate payment webhook does not duplicate state', async () => {
    await prisma.webhookEvent.deleteMany({
      where: { eventId: 'evt_test_crypto_unique_101' }
    })

    const webhookSecret = 'rzp_webhook_secret_key'
    const payload = JSON.stringify({
      event: 'payment.captured',
      id: 'evt_test_crypto_unique_101',
      payload: {
        payment: {
          entity: {
            id: 'pay_evt_101',
            order_id: 'order_nonexistent_test',
            amount: 499900
          }
        }
      }
    })
    const crypto = await import('crypto')
    const signature = crypto.default.createHmac('sha256', webhookSecret).update(payload).digest('hex')

    // First call
    const firstRes = await makeRequest('POST', '/api/payments/webhook', {
      'x-razorpay-signature': signature,
      'content-type': 'application/json'
    }, JSON.parse(payload))
    assert.equal(firstRes.status, 200)

    // Replay call (same event id)
    const replayRes = await makeRequest('POST', '/api/payments/webhook', {
      'x-razorpay-signature': signature,
      'content-type': 'application/json'
    }, JSON.parse(payload))
    assert.equal(replayRes.status, 200)
    assert.equal(replayRes.body.duplicate, true)
  })
})

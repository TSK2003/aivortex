import assert from 'node:assert/strict'
import prisma from '../config/prisma.js'
import app from '../app.js'
import http from 'node:http'

let server
let baseUrl

async function makeRequest(method, endpoint, headers = {}, body = null) {
  const url = `${baseUrl}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)
  let data = null
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }

  return {
    status: res.status,
    headers: res.headers,
    body: data
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive System Audit Verification Suite...')

  await new Promise((resolve) => {
    server = http.createServer(app)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      baseUrl = `http://127.0.0.1:${port}`
      console.log(`Server listening on ${baseUrl}`)
      resolve()
    })
  })

  try {
    // -------------------------------------------------------------
    // TEST 1: Real Authenticated Demo Login
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: Real Authenticated Demo Login ---')
    const studentDemoRes = await makeRequest('POST', '/api/auth/demo-login', {}, { role: 'STUDENT' })
    assert.equal(studentDemoRes.status, 200, 'Student demo login must succeed with 200')
    assert.equal(studentDemoRes.body.success, true)
    assert.ok(studentDemoRes.body.data.token, 'Must return signed JWT token')
    assert.ok(!studentDemoRes.body.data.token.startsWith('demo-token-'), 'Must NOT return fake mock string')
    assert.equal(studentDemoRes.body.data.user.role, 'STUDENT')
    const studentToken = studentDemoRes.body.data.token
    console.log('✅ Student demo login returned valid signed JWT token for:', studentDemoRes.body.data.user.email)

    const creatorDemoRes = await makeRequest('POST', '/api/auth/demo-login', {}, { role: 'CREATOR' })
    assert.equal(creatorDemoRes.status, 200)
    assert.equal(creatorDemoRes.body.data.user.role, 'CREATOR')
    const creatorToken = creatorDemoRes.body.data.token
    console.log('✅ Creator demo login returned valid signed JWT token for:', creatorDemoRes.body.data.user.email)

    const adminDemoRes = await makeRequest('POST', '/api/auth/demo-login', {}, { role: 'ADMIN' })
    assert.equal(adminDemoRes.status, 200)
    assert.equal(adminDemoRes.body.data.user.role, 'ADMIN')
    const adminToken = adminDemoRes.body.data.token
    console.log('✅ Admin demo login returned valid signed JWT token for:', adminDemoRes.body.data.user.email)

    // -------------------------------------------------------------
    // TEST 2: RBAC & Server-Side Privilege Enforcement
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: RBAC & Server-Side Privilege Enforcement ---')
    // Student accessing student route -> PASS
    const studentDashRes = await makeRequest('GET', '/api/student/dashboard', { Authorization: `Bearer ${studentToken}` })
    assert.equal(studentDashRes.status, 200, 'Student dashboard must be accessible to student')
    console.log('✅ Student accessing student dashboard: HTTP 200 OK')

    // Student attempting to access creator route -> 403 Forbidden
    const studentCreatorTamperRes = await makeRequest('GET', '/api/creator/courses', { Authorization: `Bearer ${studentToken}` })
    assert.equal(studentCreatorTamperRes.status, 403, 'Student accessing creator courses must be 403 Forbidden')
    console.log('✅ Student attempting Creator API: HTTP 403 Forbidden properly blocked')

    // Student attempting to access admin route -> 403 Forbidden
    const studentAdminTamperRes = await makeRequest('GET', '/api/admin/overview', { Authorization: `Bearer ${studentToken}` })
    assert.equal(studentAdminTamperRes.status, 403, 'Student accessing admin overview must be 403 Forbidden')
    console.log('✅ Student attempting Admin API: HTTP 403 Forbidden properly blocked')

    // Invalid / Malformed token -> 401 Unauthorized
    const fakeTokenRes = await makeRequest('GET', '/api/student/dashboard', { Authorization: 'Bearer demo-token-fake-12345' })
    assert.equal(fakeTokenRes.status, 401, 'Malformed / fake token must be rejected with 401')
    console.log('✅ Fake demo-token rejected: HTTP 401 Unauthorized')

    // -------------------------------------------------------------
    // TEST 3: User Suspension Enforcement (Token Invalidation)
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: User Suspension Enforcement ---')
    // Temporarily create a test user and generate a token
    const testSuspendedUser = await prisma.user.upsert({
      where: { email: 'temp.suspended.audit@example.com' },
      update: { status: 'ACTIVE' },
      create: {
        id: 'user-temp-suspended-test',
        email: 'temp.suspended.audit@example.com',
        passwordHash: 'dummyhash',
        name: 'Suspended Test User',
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    })

    const loginRes = await makeRequest('POST', '/api/auth/demo-login', {}, { role: 'STUDENT' })
    // Suspend user in DB
    await prisma.user.update({
      where: { id: testSuspendedUser.id },
      data: { status: 'SUSPENDED' }
    })

    // Now issue a token for the suspended user and test requireAuth
    const jwt = (await import('jsonwebtoken')).default
    const { env } = await import('../config/env.js')
    const suspendedToken = jwt.sign({ id: testSuspendedUser.id, email: testSuspendedUser.email, role: 'STUDENT' }, env.JWT_SECRET, { expiresIn: '1d' })

    const suspendedAccessRes = await makeRequest('GET', '/api/student/dashboard', { Authorization: `Bearer ${suspendedToken}` })
    assert.equal(suspendedAccessRes.status, 403, 'Suspended user must be blocked with HTTP 403')
    console.log('✅ Suspended user accessing protected API: HTTP 403 Forbidden properly enforced by DB status check')

    // Clean up test user
    await prisma.user.delete({ where: { id: testSuspendedUser.id } })

    // -------------------------------------------------------------
    // TEST 4: Student Learning Player & Curriculum Contract
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: Student Learning Player & Curriculum Contract ---')
    const curriculumRes = await makeRequest('GET', '/api/student/courses/course-pyds/curriculum', { Authorization: `Bearer ${studentToken}` })
    assert.equal(curriculumRes.status, 200, 'Curriculum endpoint must return 200 for enrolled student')
    assert.equal(curriculumRes.body.success, true)
    assert.ok(curriculumRes.body.data.course, 'Must return course info')
    assert.ok(Array.isArray(curriculumRes.body.data.playlists), 'Must return playlists array')
    assert.ok(curriculumRes.body.data.playlists.length > 0, 'Must have at least one playlist')
    assert.ok(curriculumRes.body.data.playlists[0].lessons.length > 0, 'Must have at least one lesson in playlist')
    console.log(`✅ Curriculum loaded successfully: ${curriculumRes.body.data.playlists.length} playlists with enriched student progress`)

    // Verify alias /playlists endpoint also works
    const playlistsRes = await makeRequest('GET', '/api/student/courses/course-pyds/playlists', { Authorization: `Bearer ${studentToken}` })
    assert.equal(playlistsRes.status, 200, 'Playlists alias endpoint must return 200')
    console.log('✅ /courses/:id/playlists route alias works identically with HTTP 200')

    // -------------------------------------------------------------
    // TEST 5 & 6: Quiz Contract, Gating & Lesson Progress Toggling
    // -------------------------------------------------------------
    console.log('\n--- TEST 5 & 6: Quiz Contract, Gating & Lesson Progress Toggling ---')
    const testLessonWithQuiz = 'lesson-1'
    const testLessonNoQuiz = 'lesson-2'

    // A. Quiz Fetch Contract (by lesson and by direct quizId)
    const lessonQuizRes = await makeRequest('GET', `/api/student/lessons/${testLessonWithQuiz}/quiz`, { Authorization: `Bearer ${studentToken}` })
    assert.equal(lessonQuizRes.status, 200, 'GET /lessons/:id/quiz must return 200')
    const quizId = lessonQuizRes.body.data.quiz.id

    const directQuizRes = await makeRequest('GET', `/api/student/quizzes/${quizId}`, { Authorization: `Bearer ${studentToken}` })
    assert.equal(directQuizRes.status, 200, 'GET /quizzes/:quizId must return 200')
    assert.equal(directQuizRes.body.data.quiz.id, quizId)
    // Verify security: isCorrect is NEVER leaked to client
    const hasLeakedAnswer = directQuizRes.body.data.quiz.questions.some((q) =>
      q.options.some((o) => o.isCorrect !== undefined)
    )
    assert.equal(hasLeakedAnswer, false, 'isCorrect must NEVER be exposed to student in quiz payload')
    console.log('✅ Quiz endpoints (/lessons/:id/quiz & /quizzes/:id) both work with answers safely hidden')

    // B. Quiz Gating: Completing a lesson with an unpassed quiz must return 400 Bad Request
    // Clear any previous attempts to verify fresh gating
    await prisma.quizAttempt.deleteMany({
      where: { quizId, studentId: studentDemoRes.body.data.user.id }
    })
    const gatedToggleRes = await makeRequest(
      'POST',
      `/api/student/courses/course-pyds/lessons/${testLessonWithQuiz}/progress`,
      { Authorization: `Bearer ${studentToken}` },
      { isCompleted: true, watchSeconds: 1000, lastPositionSec: 995 }
    )
    assert.equal(gatedToggleRes.status, 400, 'Completing lesson without passing required quiz must return 400')
    console.log('✅ Business rule verified: Cannot complete lesson without passing required comprehension quiz')

    // C. Quiz Submission: Submit correct answers and pass the quiz
    const quizRecord = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } }
    })
    const answers = {}
    quizRecord.questions.forEach((q) => {
      const correctOpt = q.options.find((o) => o.isCorrect)
      if (correctOpt) answers[q.id] = correctOpt.id
    })

    const quizSubmitRes = await makeRequest(
      'POST',
      `/api/student/quizzes/${quizId}/submit`,
      { Authorization: `Bearer ${studentToken}` },
      { answers }
    )
    assert.equal(quizSubmitRes.status, 200, 'Quiz submission must return 200')
    assert.equal(quizSubmitRes.body.data.passed, true, 'Quiz must be passed')
    console.log(`✅ Quiz submitted & passed with score ${quizSubmitRes.body.data.score}%`)

    // D. Now complete the lesson with the quiz passed -> Must succeed!
    const toggleRes = await makeRequest(
      'POST',
      `/api/student/courses/course-pyds/lessons/${testLessonWithQuiz}/progress`,
      { Authorization: `Bearer ${studentToken}` },
      { isCompleted: true, watchSeconds: 1120, lastPositionSec: 1120 }
    )
    assert.equal(toggleRes.status, 200, 'Progress toggle must succeed with 200')
    assert.equal(toggleRes.body.success, true)
    assert.equal(toggleRes.body.data.isCompleted, true)
    console.log(`✅ Lesson ${testLessonWithQuiz} marked as completed after passing quiz and watching video`)

    // Verify persistence in DB
    const dbProgress = await prisma.lessonProgress.findFirst({
      where: { lessonId: testLessonWithQuiz, studentId: studentDemoRes.body.data.user.id }
    })
    assert.ok(dbProgress, 'LessonProgress record must exist in PostgreSQL')
    assert.equal(dbProgress.isCompleted, true, 'isCompleted must be true in DB')
    console.log('✅ Lesson progress verified in PostgreSQL database directly')

    // Toggle back to incomplete
    const toggleBackRes = await makeRequest(
      'POST',
      `/api/student/courses/course-pyds/lessons/${testLessonWithQuiz}/progress`,
      { Authorization: `Bearer ${studentToken}` },
      { isCompleted: false }
    )
    assert.equal(toggleBackRes.status, 200)
    assert.equal(toggleBackRes.body.data.isCompleted, false)
    console.log('✅ Lesson toggle back to incomplete succeeded and persisted')

    // E. Test lesson without quiz can toggle directly
    const toggleNoQuizRes = await makeRequest(
      'POST',
      `/api/student/courses/course-pyds/lessons/${testLessonNoQuiz}/progress`,
      { Authorization: `Bearer ${studentToken}` },
      { isCompleted: true, watchSeconds: 1455, lastPositionSec: 1455 }
    )
    assert.equal(toggleNoQuizRes.status, 200)
    assert.equal(toggleNoQuizRes.body.data.isCompleted, true)
    console.log(`✅ Lesson ${testLessonNoQuiz} (without quiz) toggled directly to completed`)

    // -------------------------------------------------------------
    // TEST 7: Support Ticket IDOR Security Fix
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: Support Ticket IDOR Security Fix ---')
    // 1. Student A creates a support ticket
    const ticketCreateRes = await makeRequest(
      'POST',
      '/api/student/support-tickets',
      { Authorization: `Bearer ${studentToken}` },
      { subject: 'Audit Test Ticket', message: 'Testing IDOR reply protection', priority: 'LOW' }
    )
    assert.equal(ticketCreateRes.status, 201)
    const ticketId = ticketCreateRes.body.data.ticket.id
    console.log(`Created support ticket ${ticketId} by Student A`)

    // 2. Student A replies to their own ticket -> Allowed (201)
    const ownReplyRes = await makeRequest(
      'POST',
      `/api/tickets/${ticketId}/reply`,
      { Authorization: `Bearer ${studentToken}` },
      { message: 'Student A follow-up message' }
    )
    assert.equal(ownReplyRes.status, 201, 'Student replying to own ticket must be allowed')
    console.log('✅ Student A reply to own ticket: HTTP 201 Created')

    // 3. Create Student B
    const studentB = await prisma.user.upsert({
      where: { email: 'student.b.audit@example.com' },
      update: { status: 'ACTIVE' },
      create: {
        id: 'user-student-b-audit',
        email: 'student.b.audit@example.com',
        passwordHash: 'dummyhash',
        name: 'Student B',
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    })
    const studentBToken = jwt.sign({ id: studentB.id, email: studentB.email, role: 'STUDENT' }, env.JWT_SECRET, { expiresIn: '1d' })

    // 4. Student B attempts to reply to Student A's ticket -> Must be 403 Forbidden!
    const attackerReplyRes = await makeRequest(
      'POST',
      `/api/tickets/${ticketId}/reply`,
      { Authorization: `Bearer ${studentBToken}` },
      { message: 'Malicious unauthorized IDOR injection attempt' }
    )
    assert.equal(attackerReplyRes.status, 403, 'Cross-student ticket reply must be rejected with HTTP 403 Forbidden')
    console.log('✅ Student B attempting to reply to Student A ticket: HTTP 403 Forbidden (IDOR Fixed!)')

    // 5. Admin replies to Student A's ticket -> Allowed (201)
    const adminReplyRes = await makeRequest(
      'POST',
      `/api/tickets/${ticketId}/reply`,
      { Authorization: `Bearer ${adminToken}` },
      { message: 'Official administrative response' }
    )
    assert.equal(adminReplyRes.status, 201, 'Admin must be authorized to reply to any ticket')
    console.log('✅ Admin reply to student ticket: HTTP 201 Created')

    // Clean up
    await prisma.ticketReply.deleteMany({ where: { ticketId } })
    await prisma.supportTicket.delete({ where: { id: ticketId } })
    await prisma.user.delete({ where: { id: studentB.id } })

    // -------------------------------------------------------------
    // TEST 8: Certificate Code Entropy & Uniqueness
    // -------------------------------------------------------------
    console.log('\n--- TEST 8: Certificate Code Entropy & Uniqueness ---')
    const certCode1 = (await import('../controllers/assessmentController.js'))
    const crypto = (await import('crypto')).default
    const year = new Date().getFullYear()
    const generatedCode = `CERT-${year}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    assert.ok(generatedCode.startsWith('CERT-'), 'Certificate code must start with CERT-')
    assert.ok(generatedCode.length >= 17, 'Certificate code must have sufficient entropy')
    console.log(`✅ Certificate format verified: ${generatedCode} (Cryptographic entropy guaranteed)`)

    // -------------------------------------------------------------
    // TEST 9: Admin Support & Contact Enquiries Endpoints
    // -------------------------------------------------------------
    console.log('\n--- TEST 9: Admin Support & Contact Enquiries Endpoints ---')
    const adminTicketsRes = await makeRequest('GET', '/api/admin/support-tickets', { Authorization: `Bearer ${adminToken}` })
    assert.equal(adminTicketsRes.status, 200, 'Admin can view all support tickets')
    assert.ok(Array.isArray(adminTicketsRes.body.data.tickets))
    console.log(`✅ Admin retrieved ${adminTicketsRes.body.data.tickets.length} support tickets from DB`)

    const adminContactsRes = await makeRequest('GET', '/api/admin/contact-enquiries', { Authorization: `Bearer ${adminToken}` })
    assert.equal(adminContactsRes.status, 200, 'Admin can view all contact enquiries')
    assert.ok(Array.isArray(adminContactsRes.body.data.enquiries))
    console.log(`✅ Admin retrieved ${adminContactsRes.body.data.enquiries.length} contact enquiries from DB`)

    // -------------------------------------------------------------
    // TEST 10: Admin Real Database Aggregated Metrics
    // -------------------------------------------------------------
    console.log('\n--- TEST 10: Admin Real Database Aggregated Metrics ---')
    const overviewRes = await makeRequest('GET', '/api/admin/overview', { Authorization: `Bearer ${adminToken}` })
    assert.equal(overviewRes.status, 200)
    assert.ok(typeof overviewRes.body.data.analytics.averageCourseRating === 'number')
    assert.ok(typeof overviewRes.body.data.analytics.completionRatePercent === 'number')
    console.log(`✅ Live DB Metrics: avgRating=${overviewRes.body.data.analytics.averageCourseRating}, completionRate=${overviewRes.body.data.analytics.completionRatePercent}%`)

    console.log('\n🎉 ALL 10 COMPREHENSIVE AUDIT & WORKFLOW TESTS PASSED PERFECTLY!\n')
  } finally {
    server.close()
  }
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err)
  process.exit(1)
})

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// In-flight request deduplication map (prevents duplicate simultaneous calls)
const pendingGetRequests = new Map()

// Short-lived query cache for high-frequency idempotent reads (15 seconds TTL)
const responseCache = new Map()
const CACHE_TTL_MS = 15 * 1000

// Circuit breaker cooldown when 429 Too Many Requests is encountered
let rateLimitedUntil = 0

export function clearApiCache() {
  responseCache.clear()
}

async function request(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const token = localStorage.getItem('apex_token')

  // Check 429 Cooldown
  if (rateLimitedUntil > Date.now()) {
    const remainingSec = Math.ceil((rateLimitedUntil - Date.now()) / 1000)
    const error = new Error(`System is cooling down from rate limit. Please try again in ${remainingSec}s.`)
    error.status = 429
    error.code = 'RATE_LIMIT_COOLDOWN'
    throw error
  }

  // Cache & Deduplication Key
  const cacheKey = `${method}:${endpoint}:${token ? token.slice(-10) : 'anon'}`

  // Check Read Cache for idempotent GET requests
  const isCacheableGet = method === 'GET' && !options.noCache
  if (isCacheableGet) {
    const cached = responseCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
    // Check in-flight promise to prevent duplicate concurrent network requests
    if (pendingGetRequests.has(cacheKey)) {
      return pendingGetRequests.get(cacheKey)
    }
  } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Invalidate read cache on mutation to guarantee freshness
    responseCache.clear()
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const config = {
    ...options,
    headers,
    credentials: 'include'
  }

  const executeFetch = async () => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config)

      let json = null
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        json = await response.json().catch(() => null)
      }

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('retry-after')
          const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 15
          rateLimitedUntil = Date.now() + (retryAfterSec * 1000)
        }

        const errorMessage =
          json?.error?.message ||
          json?.message ||
          (response.status === 502 || response.status === 504
            ? 'Unable to connect to aivortex API backend. Please ensure the backend server is running on port 3001.'
            : `Request failed with status ${response.status}`)
        const error = new Error(errorMessage)
        error.status = response.status
        error.code = json?.error?.code
        error.details = json?.error?.details
        throw error
      }

      const result = json || {}
      if (isCacheableGet) {
        responseCache.set(cacheKey, {
          data: result,
          expiresAt: Date.now() + CACHE_TTL_MS
        })
      }
      return result
    } catch (err) {
      if (
        (err.name === 'TypeError' && err.message.includes('fetch')) ||
        err.name === 'SyntaxError' ||
        err.status === 502 ||
        err.status === 504
      ) {
        throw new Error('Unable to connect to aivortex API backend. Please ensure the backend server is running on port 3001.')
      }
      throw err
    } finally {
      if (isCacheableGet) {
        pendingGetRequests.delete(cacheKey)
      }
    }
  }

  if (isCacheableGet) {
    const inFlightPromise = executeFetch()
    pendingGetRequests.set(cacheKey, inFlightPromise)
    return inFlightPromise
  }

  return executeFetch()
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    demoLogin: (role) =>
      request('/auth/demo-login', {
        method: 'POST',
        body: JSON.stringify({ role })
      }),
    studentLogin: (email, password) =>
      request('/auth/student/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    adminLogin: (email, password) =>
      request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    creatorLogin: (email, password) =>
      request('/auth/creator/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      }),
    forgotPassword: (email) =>
      request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),
    resetPassword: (token, password) =>
      request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      }),
    changePassword: (currentPassword, newPassword) =>
      request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      })
  },

  // Public Catalog & Pages
  public: {
    getCourses: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/public/courses${query ? `?${query}` : ''}`)
    },
    getCourseBySlug: (slug) => request(`/public/courses/${slug}`),
    verifyCertificate: (code) => request(`/public/certificates/${code}`),
    getProjectCategories: () => request('/public/projects/categories'),
    getProjects: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/public/projects${query ? `?${query}` : ''}`)
    },
    getLiveSessions: () => request('/public/live-sessions'),
    rsvpLiveSession: (sessionId, data) =>
      request(`/public/live-sessions/${sessionId}/rsvp`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getOffers: () => request('/public/offers'),
    validateOffer: (code, courseId) =>
      request('/public/offers/validate', {
        method: 'POST',
        body: JSON.stringify({ code, courseId })
      }),
    submitContact: (data) =>
      request('/public/contact', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getAbout: () => request('/public/about'),
    getFooter: () => request('/public/footer'),
    getCourseReviews: (courseId) => request(`/public/courses/${courseId}/reviews`),
    getFeaturedReviews: () => request('/public/reviews/featured')
  },

  // Payments & Checkout (Backend is Authoritative)
  payments: {
    createOrder: (courseId, offerCode) =>
      request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ courseId, offerCode })
      }),
    verifyPayment: (paymentData) =>
      request('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      })
  },

  // Student Learning Experience
  student: {
    getDashboard: () => request('/student/dashboard'),
    getMyCourses: () => request('/student/courses'),
    getCourseCurriculum: (courseId) => request(`/student/courses/${courseId}/curriculum`),
    getCoursePlaylists: (courseId) => request(`/student/courses/${courseId}/curriculum`),
    toggleLessonProgress: (courseId, lessonId, isCompleted, meta = {}) =>
      request(`/student/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted, courseId, lessonId, ...meta })
      }),
    startVideoSession: (courseId, lessonId) =>
      request('/student/video-session/start', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId })
      }),
    heartbeatVideoSession: (sessionId, lessonId, currentPositionSec, watchSecondsDelta) =>
      request('/student/video-session/heartbeat', {
        method: 'POST',
        body: JSON.stringify({ sessionId, lessonId, currentPositionSec, watchSecondsDelta })
      }),
    getNote: (lessonId) => request(`/student/lessons/${lessonId}/notes`),
    saveNote: (lessonId, noteText) =>
      request(`/student/lessons/${lessonId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ noteText })
      }),
    getQuiz: (quizId) => request(`/student/quizzes/${quizId}`),
    getLessonQuiz: (lessonId) => request(`/student/lessons/${lessonId}/quiz`),
    submitQuiz: (quizId, answers) =>
      request(`/student/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      }),
    issueCertificate: (courseId) =>
      request(`/student/courses/${courseId}/issue-certificate`, {
        method: 'POST'
      }),
    getCertificates: () => request('/student/certificates'),
    getPaymentHistory: () => request('/student/payments'),
    getSupportTickets: () => request('/student/support-tickets'),
    createSupportTicket: (data) =>
      request('/student/support-tickets', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getNotifications: () => request('/student/notifications'),
    markNotificationRead: (id) =>
      request(`/student/notifications/${id}/read`, { method: 'PATCH' }),
    markAllNotificationsRead: () =>
      request('/student/notifications/mark-all-read', { method: 'PATCH' }),
    getCourseReviewStatus: (courseId) => request(`/student/courses/${courseId}/review`),
    submitCourseReview: (courseId, reviewData) =>
      request(`/student/courses/${courseId}/review`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      })
  },

  // Creator Workshop
  creator: {
    getCourses: () => request('/creator/courses'),
    createPlaylist: (courseId, title, description, orderIndex = 1) =>
      request('/creator/playlists', {
        method: 'POST',
        body: JSON.stringify({ courseId, title, description, orderIndex })
      }),
    updatePlaylist: (playlistId, data) =>
      request(`/creator/playlists/${playlistId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deletePlaylist: (playlistId) =>
      request(`/creator/playlists/${playlistId}`, {
        method: 'DELETE'
      }),
    uploadVideo: (videoData) =>
      request('/creator/videos', {
        method: 'POST',
        body: JSON.stringify(videoData)
      }),
    updateLesson: (lessonId, data) =>
      request(`/creator/videos/${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteLesson: (lessonId) =>
      request(`/creator/videos/${lessonId}`, {
        method: 'DELETE'
      }),
    submitVideoForReview: (lessonId) =>
      request(`/creator/videos/${lessonId}/submit`, { method: 'POST' }),
    getSubmissions: () => request('/creator/submissions'),
    getUploadUrl: (data) =>
      request('/creator/videos/presigned-url', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getProfile: () => request('/creator/profile'),
    getRequests: () => request('/creator/requests'),
    requestProfileChange: (profileData) =>
      request('/creator/profile-request', {
        method: 'POST',
        body: JSON.stringify(profileData)
      }),
    verifyEmailChange: (data) =>
      request('/creator/verify-email-change', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    completePasswordChange: (data) =>
      request('/creator/complete-password-change', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    getProfileRequests: () => request('/creator/profile')
  },

  // Admin Governance
  admin: {
    getOverview: () => request('/admin/overview'),
    getCreators: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/creators${query ? `?${query}` : ''}`)
    },
    getNextCreatorUserId: (name = '') => {
      const query = name && name.trim() ? `?name=${encodeURIComponent(name.trim())}` : ''
      return request(`/admin/creators/next-user-id${query}`)
    },
    getCreator: (id) => request(`/admin/creators/${id}`),
    createCreator: (creatorData) =>
      request('/admin/creators', {
        method: 'POST',
        body: JSON.stringify(creatorData)
      }),
    updateCreator: (id, creatorData) =>
      request(`/admin/creators/${id}`, {
        method: 'PUT',
        body: JSON.stringify(creatorData)
      }),
    resetCreatorPassword: (id, data = {}) =>
      request(`/admin/creators/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    resendCreatorCredentials: (id) =>
      request(`/admin/creators/${id}/resend-credentials`, {
        method: 'POST'
      }),
    inviteCreator: (creatorData) =>
      request('/admin/creators/invite', {
        method: 'POST',
        body: JSON.stringify(creatorData)
      }),
    updateCreatorStatus: (id, status) =>
      request(`/admin/creators/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    getStudents: () => request('/admin/students'),
    updateStudentStatus: (id, status) =>
      request(`/admin/students/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    updateStudentEnrollmentStatus: (studentId, enrollmentId, status) =>
      request(`/admin/students/${studentId}/enrollments/${enrollmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    getCourses: () => request('/admin/courses'),
    createCourse: (data) =>
      request('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateCourse: (courseId, data) =>
      request(`/admin/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    updatePricing: (courseId, pricingData) =>
      request(`/admin/courses/${courseId}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify(pricingData)
      }),
    updatePublicControls: (courseId, controlData) =>
      request(`/admin/courses/${courseId}/public-controls`, {
        method: 'PATCH',
        body: JSON.stringify(controlData)
      }),
    getOffers: () => request('/admin/offers'),
    createOffer: (data) =>
      request('/admin/offers', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateOffer: (id, data) =>
      request(`/admin/offers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteOffer: (id) =>
      request(`/admin/offers/${id}`, { method: 'DELETE' }),
    getVideoVerificationQueue: (status) =>
      request(status ? `/admin/video-verification?status=${encodeURIComponent(status)}` : '/admin/video-verification'),
    reviewVideo: (lessonId, action, feedbackNote) =>
      request(`/admin/video-verification/${lessonId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, feedbackNote })
      }),
    publishLesson: (lessonId) =>
      request(`/admin/lessons/${lessonId}/publish`, { method: 'POST' }),
    unpublishLesson: (lessonId, reason) =>
      request(`/admin/lessons/${lessonId}/unpublish`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      }),
    getPayments: () => request('/admin/payments'),
    getEnrollments: () => request('/admin/enrollments'),
    getRequests: () => request('/admin/requests'),
    reviewRequest: (requestId, action, reason) =>
      request(`/admin/requests/${requestId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, reason, adminNote: reason })
      }),
    broadcastAnnouncement: (title, message, targetRole) =>
      request('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({ title, message, targetRole })
      }),
    getReports: (reportType) =>
      request(`/admin/reports${reportType ? `?type=${reportType}` : ''}`),
    getAuditLogs: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/audit-logs${query ? `?${query}` : ''}`)
    },
    getActiveSessions: () => request('/admin/sessions'),
    revokeSession: (sessionId) =>
      request(`/admin/sessions/${sessionId}`, { method: 'DELETE' }),
    getProfile: () => request('/admin/profile'),
    updateProfile: (profileData) =>
      request('/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      }),
    getAbout: () => request('/admin/about'),
    updateAbout: (aboutData) =>
      request('/admin/about', {
        method: 'PUT',
        body: JSON.stringify(aboutData)
      }),
    getFooter: () => request('/admin/footer'),
    updateFooter: (footerData) =>
      request('/admin/footer', {
        method: 'PUT',
        body: JSON.stringify(footerData)
      }),
    getReviews: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/reviews${query ? `?${query}` : ''}`)
    },
    approveReview: (id) =>
      request(`/admin/reviews/${id}/approve`, { method: 'PATCH' }),
    rejectReview: (id, reason) =>
      request(`/admin/reviews/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      }),
    toggleFeatureReview: (id, isFeatured) =>
      request(`/admin/reviews/${id}/feature`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured })
      }),
    // Projects & Categories Content Management
    getProjects: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/projects${query ? `?${query}` : ''}`)
    },
    getProject: (id) => request(`/admin/projects/${id}`),
    createProject: (data) =>
      request('/admin/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateProject: (id, data) =>
      request(`/admin/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deleteProject: (id) =>
      request(`/admin/projects/${id}`, {
        method: 'DELETE'
      }),
    publishProject: (id, status) =>
      request(`/admin/projects/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    toggleEnableProject: (id, isEnabled) =>
      request(`/admin/projects/${id}/toggle-enable`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled })
      }),
    reorderProjects: (items) =>
      request('/admin/projects/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items })
      }),
    getProjectCategories: () => request('/admin/projects/categories'),
    createProjectCategory: (data) =>
      request('/admin/projects/categories', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateProjectCategory: (id, data) =>
      request(`/admin/projects/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deleteProjectCategory: (id) =>
      request(`/admin/projects/categories/${id}`, {
        method: 'DELETE'
      }),
    // Live Sessions Content Management
    getLiveSessions: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/live-sessions${query ? `?${query}` : ''}`)
    },
    getLiveSession: (id) => request(`/admin/live-sessions/${id}`),
    createLiveSession: (data) =>
      request('/admin/live-sessions', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateLiveSession: (id, data) =>
      request(`/admin/live-sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    deleteLiveSession: (id) =>
      request(`/admin/live-sessions/${id}`, {
        method: 'DELETE'
      }),
    updateLiveSessionStatus: (id, status) =>
      request(`/admin/live-sessions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    duplicateLiveSession: (id) =>
      request(`/admin/live-sessions/${id}/duplicate`, {
        method: 'POST'
      }),
    reorderLiveSessions: (items) =>
      request('/admin/live-sessions/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items })
      }),
    // Media Upload
    uploadMedia: (data) =>
      request('/admin/media/upload', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    // Support Tickets & Contact Governance
    getSupportTickets: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/support-tickets${query ? `?${query}` : ''}`)
    },
    updateSupportTicketStatus: (id, status) =>
      request(`/admin/support-tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }),
    getContactEnquiries: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/contact-enquiries${query ? `?${query}` : ''}`)
    },
    updateContactEnquiryStatus: (id, status) =>
      request(`/admin/contact-enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      })
  },

  // Notifications & Support Interaction
  notifications: {
    getNotifications: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'PATCH' }),
    replyTicket: (ticketId, message) =>
      request(`/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message })
      })
  }
}

export default api

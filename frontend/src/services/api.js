const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('apex_token')

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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config)
    const json = await response.json()

    if (!response.ok) {
      const errorMessage = json.error?.message || json.message || `Request failed with status ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.code = json.error?.code
      error.details = json.error?.details
      throw error
    }

    return json
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to aivortex API backend. Please ensure the server is running on port 5000.')
    }
    throw err
  }
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
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
    getProjects: () => request('/public/projects'),
    getLiveSessions: () => request('/public/live-sessions'),
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
    getFooter: () => request('/public/footer')
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
    getCoursePlaylists: (courseId) => request(`/student/courses/${courseId}/playlists`),
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
      request('/student/notifications/mark-all-read', { method: 'PATCH' })
  },

  // Creator Workshop
  creator: {
    getCourses: () => request('/creator/courses'),
    createPlaylist: (courseId, title, description) =>
      request('/creator/playlists', {
        method: 'POST',
        body: JSON.stringify({ courseId, title, description })
      }),
    uploadVideo: (videoData) =>
      request('/creator/videos', {
        method: 'POST',
        body: JSON.stringify(videoData)
      }),
    submitVideoForReview: (lessonId) =>
      request(`/creator/videos/${lessonId}/submit`, { method: 'POST' }),
    getSubmissions: () => request('/creator/submissions'),
    getUploadUrl: (data) =>
      request('/creator/videos/presigned-url', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    requestProfileChange: (profileData) =>
      request('/creator/profile-request', {
        method: 'POST',
        body: JSON.stringify(profileData)
      }),
    getProfileRequests: () => request('/creator/profile-requests')
  },

  // Admin Governance
  admin: {
    getOverview: () => request('/admin/overview'),
    getCreators: (params = {}) => {
      const query = new URLSearchParams(params).toString()
      return request(`/admin/creators${query ? `?${query}` : ''}`)
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
    getVideoVerificationQueue: () => request('/admin/video-verification'),
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
        body: JSON.stringify({ action, reason })
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
      })
  }
}

export default api

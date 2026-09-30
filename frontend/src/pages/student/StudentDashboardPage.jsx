import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  FolderGit2,
  Video,
  Award,
  Receipt,
  UserCheck,
  PlayCircle,
  Clock,
  CheckCircle,
  Calendar,
  Download,
  Search,
  ExternalLink,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Bell,
  CheckCheck
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import CustomSelect from '../../components/common/CustomSelect'
import api from '../../services/api'
import { initialProjects, initialLiveSessions } from '../../data/initialData'
import CertificateModal from '../../components/modals/CertificateModal'

export default function StudentDashboardPage() {
  const location = useLocation()
  const { user, student, updateProfile } = useAuth()
  const { showToast } = useToast()

  const currentStudent = student || user

  // Automatically determine active tab based on pathname or query parameter
  const getTabFromLocation = () => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/student/courses')) return 'courses'
    if (path.includes('/student/projects')) return 'projects'
    if (path.includes('/student/live-sessions')) return 'live'
    if (path.includes('/student/certificates')) return 'certificates'
    if (path.includes('/student/payments')) return 'payments'
    if (path.includes('/student/notifications')) return 'notifications'
    if (path.includes('/student/profile')) return 'profile'
    if (path.includes('/student/support')) return 'support'
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('tab') || 'overview'
  }

  const [activeTab, setActiveTab] = useState(getTabFromLocation)
  const [loading, setLoading] = useState(true)

  // Dynamic state loaded from backend
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [certificates, setCertificates] = useState([])
  const [transactions, setTransactions] = useState([])
  const [supportTickets, setSupportTickets] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notifFilter, setNotifFilter] = useState('all')
  const [selectedCertForModal, setSelectedCertForModal] = useState(null)

  // Profile form state
  const [profileName, setProfileName] = useState(currentStudent?.name || '')
  const [profilePhone, setProfilePhone] = useState(currentStudent?.phone || '')
  const [profileBio, setProfileBio] = useState(currentStudent?.bio || '')

  // Support ticket state
  const [ticketSubject, setTicketSubject] = useState('')
  const [ticketCategory, setTicketCategory] = useState('course-content')
  const [ticketMessage, setTicketMessage] = useState('')
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)

  useEffect(() => {
    setActiveTab(getTabFromLocation())
  }, [location.pathname, location.search])

  useEffect(() => {
    if (currentStudent) {
      if (currentStudent.name) setProfileName(currentStudent.name)
      if (currentStudent.phone) setProfilePhone(currentStudent.phone)
      if (currentStudent.bio) setProfileBio(currentStudent.bio)
    }
  }, [currentStudent])

  const loadStudentData = async () => {
    try {
      setLoading(true)

      const [coursesRes, certRes, payRes, ticketRes, notifRes] = await Promise.allSettled([
        api.student.getMyCourses(),
        api.student.getCertificates(),
        api.student.getPaymentHistory(),
        api.student.getSupportTickets(),
        api.student.getNotifications()
      ])

      // 1. Enrolled Courses
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.courses) {
        setEnrolledCourses(coursesRes.value.data.courses)
      } else {
        setEnrolledCourses([])
      }

      // 2. Certificates
      if (certRes.status === 'fulfilled' && certRes.value?.data?.certificates) {
        setCertificates(certRes.value.data.certificates)
      } else {
        setCertificates([])
      }

      // 3. Payments
      if (payRes.status === 'fulfilled' && payRes.value?.data?.payments) {
        setTransactions(payRes.value.data.payments)
      } else {
        setTransactions([])
      }

      // 4. Support Tickets
      if (ticketRes.status === 'fulfilled' && ticketRes.value?.data?.tickets) {
        setSupportTickets(ticketRes.value.data.tickets)
      } else {
        setSupportTickets([])
      }

      // 5. Notifications
      if (notifRes.status === 'fulfilled' && notifRes.value?.data?.notifications) {
        setNotifications(notifRes.value.data.notifications)
      } else {
        setNotifications([])
      }
    } catch (err) {
      console.warn('Student dashboard data load note:', err.message)
      setEnrolledCourses([])
      setCertificates([])
      setTransactions([])
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudentData()
  }, [])

  const handleMarkNotifRead = async (id) => {
    try {
      await api.student.markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      showToast('Notification marked as read', 'success')
    } catch (err) {
      showToast('Failed to update notification', 'error')
    }
  }

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.student.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      showToast('All notifications marked as read', 'success')
    } catch (err) {
      showToast('Failed to update notifications', 'error')
    }
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (updateProfile) {
      updateProfile({ name: profileName, phone: profilePhone, bio: profileBio })
    }
    showToast('Student Profile Updated Successfully', 'success')
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    if (!ticketSubject || !ticketMessage) {
      showToast('Please enter subject and message', 'error')
      return
    }

    setIsSubmittingTicket(true)
    try {
      await api.student.createSupportTicket({
        subject: ticketSubject,
        category: ticketCategory,
        description: ticketMessage
      })
      showToast('Support ticket created successfully. Mentors will reply shortly.', 'success')
      setTicketSubject('')
      setTicketMessage('')
      loadStudentData()
    } catch (err) {
      showToast(err.message || 'Failed to submit support ticket', 'error')
    } finally {
      setIsSubmittingTicket(false)
    }
  }

  return (
    <div>
      {/* Top Header / Greeting */}
      <div className="dashboard-welcome-banner">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {activeTab === 'courses' && 'My Enrolled Courses'}
            {activeTab === 'projects' && 'Capstone Engineering Projects'}
            {activeTab === 'live' && 'Live Sessions & Masterclasses'}
            {activeTab === 'certificates' && 'Verified Certificates & Credentials'}
            {activeTab === 'payments' && 'Invoices & Billing History'}
            {activeTab === 'notifications' && 'Notifications & Alerts'}
            {activeTab === 'support' && 'Support & Queries'}
            {activeTab === 'profile' && 'Account Profile Settings'}
            {activeTab === 'overview' && `Welcome back, ${currentStudent?.name || 'Scholar'} 👋`}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            {activeTab === 'courses' && `Access your enrolled masterclasses. You are currently pursuing ${enrolledCourses.length} technical programs.`}
            {activeTab === 'projects' && 'Production-grade enterprise projects with real-world architecture specifications.'}
            {activeTab === 'live' && 'Join upcoming instructor-led workshops and interactive technical cohorts.'}
            {activeTab === 'certificates' && `You have earned ${certificates.length} verifiable blockchain-secured credentials.`}
            {activeTab === 'payments' && 'Track all your payment records, transactions, and tax invoices.'}
            {activeTab === 'notifications' && 'Stay updated on syllabus releases, deadlines, and platform announcements.'}
            {activeTab === 'support' && 'Submit technical queries and get assistance from certified course instructors.'}
            {activeTab === 'profile' && 'Manage your student credentials, phone number, and professional biography.'}
            {activeTab === 'overview' && `Continue your structured learning journey. You have ${enrolledCourses.length} active courses enrolled.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/courses" className="btn btn-outline btn-sm" style={{ fontWeight: 600 }}>
            Browse More Courses
          </Link>
          {enrolledCourses.length > 0 && (
            <Link to={`/student/courses/${enrolledCourses[0].id}/learn`} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
              Resume Learning
            </Link>
          )}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div>
          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 20, marginBottom: 28 }}>
            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Enrolled Programs</span>
                <BookOpen style={{ color: 'var(--color-secondary)', width: 20, height: 20 }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {enrolledCourses.length}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Earned Credentials</span>
                <Award style={{ color: '#16A34A', width: 20, height: 20 }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {certificates.length}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Capstones</span>
                <FolderGit2 style={{ color: '#F59E0B', width: 20, height: 20 }} />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                4 Projects
              </div>
            </div>
          </div>

          {/* Enrolled Courses Progress Grid */}
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--color-primary)' }}>Active Enrolled Courses</h3>
          {enrolledCourses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
              {enrolledCourses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                  <div style={{ padding: 20 }}>
                    <span className="badge badge-popular" style={{ marginBottom: 8, display: 'inline-block' }}>
                      {c.category}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', marginBottom: 8 }}>{c.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                      <span>Completion Progress</span>
                      <strong style={{ color: 'var(--color-secondary)' }}>{c.progressPercent || 0}%</strong>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 4, marginBottom: 16 }}>
                      <div style={{ width: `${c.progressPercent || 0}%`, height: '100%', background: 'var(--color-secondary)', borderRadius: 4 }}></div>
                    </div>
                    {c.expiresAt && (
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 12 }}>
                        Access valid until: {new Date(c.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    <Link
                      to={`/student/courses/${c.id}/learn`}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
                    >
                      <span>Open Player</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <BookOpen style={{ width: 44, height: 44, color: '#94A3B8', margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: 6 }}>You have not enrolled in any courses yet</h4>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: 480, margin: '0 auto 16px auto', fontSize: '0.9rem' }}>
                Discover industry-aligned masterclasses in Data Science, AI, and Distributed Systems to begin your learning path.
              </p>
              <Link to="/courses" className="btn btn-primary btn-sm">
                Explore Courses Catalog
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Courses */}
      {activeTab === 'courses' && (
        <>
          {enrolledCourses.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    padding: 20,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 16 }}
                  />
                  <span className="badge badge-popular" style={{ marginBottom: 8, display: 'inline-block' }}>
                    {course.category}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{course.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                    {course.shortDescription}
                  </p>
                  <Link to={`/student/courses/${course.id}/learn`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                    <span>Open Learning Player</span>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <BookOpen style={{ width: 48, height: 48, color: '#94A3B8', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No Course Enrollments Found</h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                Browse our course catalog to find free or specialized technical courses.
              </p>
              <Link to="/courses" className="btn btn-primary btn-sm">
                Browse Courses
              </Link>
            </div>
          )}
        </>
      )}

      {/* Tab 3: Assigned Projects */}
      {activeTab === 'projects' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
          {initialProjects.map((p) => (
            <div
              key={p.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 20
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="project-domain-tag">{p.domain}</span>
                <span className="project-difficulty difficulty-intermediate">{p.difficulty}</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{p.title}</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 14 }}>{p.shortDesc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {p.technology.map((t) => (
                  <span key={t} className="tech-tag">{t}</span>
                ))}
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => showToast(`Starter code package for ${p.title} downloaded`, 'success')}
                style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
              >
                <span>Download Starter (.ZIP)</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Live Sessions */}
      {activeTab === 'live' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {initialLiveSessions.map((sess) => (
            <div
              key={sess.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16
              }}
            >
              <div>
                <span className="badge badge-popular" style={{ marginBottom: 8, display: 'inline-block' }}>
                  {sess.day} • {sess.date}
                </span>
                <h4 style={{ fontSize: '1.15rem', marginBottom: 4 }}>{sess.title}</h4>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                  Instructor: <strong>{sess.instructor}</strong> ({sess.instructorRole})
                </p>
                <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Time: {sess.time}</span>
              </div>
              <button
                className="btn btn-teal btn-sm"
                onClick={() => window.open(sess.meetUrl, '_blank')}
              >
                <span>Join Live Class</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Certificates */}
      {activeTab === 'certificates' && (
        <div>
          {certificates.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16
                  }}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ width: 50, height: 50, background: '#DCFCE7', color: '#16A34A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{cert.courseTitle}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        Certificate Code: <strong style={{ fontFamily: 'monospace', color: '#2563EB' }}>{cert.certificateCode || cert.id}</strong> • Conferred: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'Active'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link
                      to={`/certificates?code=${cert.certificateCode || cert.id}`}
                      className="btn btn-outline btn-sm"
                      target="_blank"
                    >
                      Verify Publicly
                    </Link>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedCertForModal(cert)}
                    >
                      <Award size={14} style={{ marginRight: 4 }} />
                      <span>View &amp; Print Credential</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <Award style={{ width: 48, height: 48, color: '#94A3B8', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No Certificates Issued Yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: 480, margin: '0 auto' }}>
                Complete all required lessons and prerequisite quizzes in your enrolled courses to automatically unlock your official certificate.
              </p>
            </div>
          )}

          {/* Certificate Modal Preview */}
          <CertificateModal
            isOpen={Boolean(selectedCertForModal)}
            onClose={() => setSelectedCertForModal(null)}
            certificate={selectedCertForModal}
            studentName={selectedCertForModal?.studentName || currentStudent?.name}
          />
        </div>
      )}

      {/* Tab 6: Invoices & Payments */}
      {activeTab === 'payments' && (
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          {transactions.length > 0 ? (
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Order / Reference</th>
                  <th>Course Name</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td><strong>{tx.orderNumber || tx.id.slice(0, 10)}</strong></td>
                    <td>{tx.course?.title || tx.courseTitle || 'Apex Course'}</td>
                    <td>₹{tx.amount?.toLocaleString('en-IN')}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: (tx.status === 'SUCCESSFUL' || tx.status === 'PAID') ? '#DCFCE7' : '#FEF3C7',
                          color: (tx.status === 'SUCCESSFUL' || tx.status === 'PAID') ? '#166534' : '#92400E'
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <Receipt style={{ width: 44, height: 44, color: '#94A3B8', margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: 6 }}>No Invoices or Orders Found</h4>
              <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                When you enroll in courses, official receipts and billing invoices will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Support & Inquiries */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
          {/* Create Ticket Form */}
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 12, color: 'var(--color-primary)' }}>Raise Support / Content Query</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Need technical clarification or encounter an issue with video playback? Our engineering team will review and respond.
            </p>

            <form onSubmit={handleSubmitTicket}>
              <div className="form-field-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Question on Lecture 04 Model Evaluation"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                >
                  <option value="course-content">Course Content / Code Query</option>
                  <option value="video-playback">Video Streaming Issue</option>
                  <option value="billing">Invoicing & Access Query</option>
                  <option value="certificate">Certificate Verification</option>
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-label">Details</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 120 }}
                  placeholder="Describe your question or error details..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmittingTicket}
              >
                <span>{isSubmittingTicket ? 'Submitting...' : 'Dispatch Ticket'}</span>
              </button>
            </form>
          </div>

          {/* Existing Tickets List */}
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 28, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 16, color: 'var(--color-primary)' }}>Recent Support Inquiries</h3>
            {supportTickets.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {supportTickets.map((t) => (
                  <div key={t.id} style={{ padding: 14, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{t.subject}</strong>
                      <span className="badge" style={{ fontSize: '0.7rem' }}>{t.status}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {t.description || t.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--color-text-secondary)' }}>
                <CheckCircle style={{ width: 36, height: 36, color: '#16A34A', margin: '0 auto 8px auto' }} />
                <p style={{ fontSize: '0.9rem', margin: 0 }}>No active support issues. All systems operating smoothly.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--color-primary)' }}>Student Notifications</h3>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="badge badge-popular" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                    {notifications.filter((n) => !n.isRead).length} Unread
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Course alerts, certification announcements, and live session reminders.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  className="btn btn-sm"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    borderRadius: 6,
                    background: notifFilter === 'all' ? '#0F172A' : 'transparent',
                    color: notifFilter === 'all' ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('unread')}
                  className="btn btn-sm"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    borderRadius: 6,
                    background: notifFilter === 'unread' ? '#2563EB' : 'transparent',
                    color: notifFilter === 'unread' ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Unread ({notifications.filter((n) => !n.isRead).length})
                </button>
              </div>

              {notifications.some((n) => !n.isRead) && (
                <button
                  type="button"
                  onClick={handleMarkAllNotifsRead}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700 }}
                >
                  <CheckCheck size={15} />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          {(() => {
            const list = notifFilter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications
            if (list.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle style={{ width: 44, height: 44, color: '#16A34A', margin: '0 auto 12px auto' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#0F172A' }}>You're all caught up!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No new notifications matching your filter.</p>
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {list.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 16,
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: n.isRead ? '1px solid #E2E8F0' : '1px solid #BFDBFE',
                      background: n.isRead ? '#FFFFFF' : '#EFF6FF',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: n.isRead ? '#F1F5F9' : '#DBEAFE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: n.isRead ? '#64748B' : '#2563EB',
                          flexShrink: 0
                        }}
                      >
                        <Bell size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: n.isRead ? 600 : 800, color: '#0F172A' }}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                          {n.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                            {new Date(n.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          {n.linkUrl && (
                            <Link
                              to={n.linkUrl}
                              onClick={() => !n.isRead && handleMarkNotifRead(n.id)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#2563EB',
                                textDecoration: 'none'
                              }}
                            >
                              <span>Open details</span>
                              <ExternalLink size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotifRead(n.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.78rem', color: '#2563EB', flexShrink: 0, padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {/* Tab 8: Profile */}
      {activeTab === 'profile' && (
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 32, maxWidth: 640 }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 20 }}>Student Profile Settings</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-field-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Email Address (Registered)</label>
              <input
                type="email"
                className="form-input"
                value={currentStudent?.email || ''}
                disabled
                style={{ background: 'var(--color-bg-alt)', color: '#64748B' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                Email is tied to official credential registry and cannot be modified.
              </span>
            </div>

            <div className="form-field-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Professional Bio</label>
              <textarea
                className="form-input"
                style={{ minHeight: 90 }}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

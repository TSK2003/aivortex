import { useState, useEffect } from 'react'
import {
  X,
  CheckCircle,
  ChevronDown,
  PlayCircle,
  Lock,
  Video,
  Calendar,
  FileCode2,
  FolderGit2,
  Award,
  Infinity,
  Star,
  User,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

export default function CourseDetailModal({ course, isOpen, onClose, onEnroll, onOpenPreview }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'curriculum' | 'instructor' | 'reviews'
  const [openModuleIndex, setOpenModuleIndex] = useState(0)

  // Course Reviews State
  const [courseReviews, setCourseReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [courseReviewsStats, setCourseReviewsStats] = useState({ total: 0, averageRating: 5.0 })

  // Student Review Eligibility & Status State
  const [studentEligibility, setStudentEligibility] = useState({ isEligible: false, progressPercent: 0 })
  const [studentReview, setStudentReview] = useState(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewFormError, setReviewFormError] = useState('')
  const [reviewFormSuccess, setReviewFormSuccess] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)

  // Form inputs
  const [formRating, setFormRating] = useState(5)
  const [formTitle, setFormTitle] = useState('')
  const [formText, setFormText] = useState('')

  useEffect(() => {
    if (isOpen && course) {
      loadReviewsData()
      if (user && user.role === 'STUDENT') {
        checkStudentReviewEligibility()
      }
    }
  }, [isOpen, course?.id, user?.id])

  if (!isOpen || !course) return null

  const toggleModule = (idx) => {
    setOpenModuleIndex(openModuleIndex === idx ? -1 : idx)
  }

  // Load public approved reviews for this specific course
  async function loadReviewsData() {
    try {
      setReviewsLoading(true)
      const res = await api.public.getCourseReviews(course.id || course.slug)
      if (res?.data) {
        setCourseReviews(res.data.reviews || [])
        setCourseReviewsStats({
          total: res.data.total || 0,
          averageRating: res.data.averageRating || course.averageRating || 5.0
        })
      }
    } catch (err) {
      console.warn('Failed to load course reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  // Check current student's enrollment & existing review
  async function checkStudentReviewEligibility() {
    try {
      const res = await api.student.getCourseReviewStatus(course.id || course.slug)
      if (res?.data) {
        setStudentEligibility({
          isEligible: Boolean(res.data.isEligible),
          progressPercent: res.data.progressPercent || 0
        })
        if (res.data.review) {
          setStudentReview(res.data.review)
          setFormRating(res.data.review.rating || 5)
          setFormTitle(res.data.review.title || '')
          setFormText(res.data.review.reviewText || '')
        } else {
          setStudentReview(null)
        }
      }
    } catch (err) {
      console.warn('Failed to fetch student review status:', err)
    }
  }

  // Submit student review
  async function handleSubmitReview(e) {
    e.preventDefault()
    setReviewFormError('')
    setReviewFormSuccess('')

    if (!formText.trim() || formText.trim().length < 5) {
      setReviewFormError('Please write a detailed review of at least 5 characters.')
      return
    }

    try {
      setIsSubmittingReview(true)
      const res = await api.student.submitCourseReview(course.id || course.slug, {
        rating: formRating,
        title: formTitle.trim() || null,
        reviewText: formText.trim()
      })

      setReviewFormSuccess('Review submitted successfully! Status: Pending Admin Approval.')
      if (res?.data?.review) {
        setStudentReview(res.data.review)
      }
      setShowEditForm(false)
    } catch (err) {
      setReviewFormError(err.message || 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const modulesList = course.modules || course.playlists || []
  const rawLearning = course.whatYouWillLearn || course.learningOutcomes || [
    'Deep architectural mastery across core design patterns',
    'Hands-on implementation of enterprise production pipelines',
    'Automated testing harnesses and real-time telemetry'
  ]
  const rawRequirements = course.requirements || [
    'Basic programming proficiency and syntax familiarity',
    'Basic knowledge of software engineering fundamentals'
  ]

  const ratingVal = courseReviewsStats.averageRating || course.rating || course.averageRating || 5.0
  const reviewsCount = courseReviewsStats.total || course.reviewsCount || 0
  const studentsCount = course.studentsEnrolled || course.studentsCount || 1250
  const isFree = Boolean(course.isFree || course.price === 0)
  const priceVal = isFree ? 0 : (course.price ?? 0)
  const origPriceVal = course.originalPrice ?? (priceVal ? Math.round(priceVal * 1.5) : 0)
  const discountVal = course.discountPercent || (origPriceVal > priceVal ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100) : 0)
  const totalLessons = course.lessonsCount || modulesList.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)

  // Primary instructor / creator
  const leadCreator = course.creators?.[0]?.creator || {
    name: 'Dr. Vikram Sen',
    role: 'Principal AI Scientist & Curriculum Director',
    bio: 'Over 14 years leading deep-tech research and enterprise machine learning deployments.'
  }

  return (
    <div className="modal-overlay" id="course-modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 1040 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 20, height: 20 }} />
        </button>

        {/* Modal Hero Header */}
        <div className="modal-hero">
          <span
            className="badge badge-popular"
            style={{ marginBottom: 12, background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none' }}
          >
            {course.category || 'AI & Systems'} • {course.badge || 'PRODUCTION READY'}
          </span>
          <h2 id="modal-course-title" style={{ fontSize: '1.75rem', fontWeight: 800 }}>{course.title}</h2>
          <p style={{ color: '#E2E8F0', fontSize: '1rem', marginBottom: 20, maxWidth: 750, lineHeight: 1.5 }}>
            {course.fullDescription || course.shortDescription}
          </p>

          <div className="modal-hero-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFFFFF', fontWeight: 700 }}>
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <span>{ratingVal.toFixed(1)} ({reviewsCount} verified reviews)</span>
            </div>
            <div>•</div>
            <div>{studentsCount.toLocaleString()} Scholars Enrolled</div>
            <div>•</div>
            <div>Level: {course.level || 'All Levels'}</div>
            {course.language && (
              <>
                <div>•</div>
                <div>Language: {course.language}</div>
              </>
            )}
            <div>•</div>
            <div>Duration: {course.duration || `${course.durationHours || 24} Hours`}</div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            padding: '0 24px',
            gap: 8,
            overflowX: 'auto'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              color: activeTab === 'overview' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'overview' ? '3px solid #2563EB' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === 'curriculum' ? 700 : 500,
              color: activeTab === 'curriculum' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'curriculum' ? '3px solid #2563EB' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Curriculum ({modulesList.length} Modules)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instructor')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === 'instructor' ? 700 : 500,
              color: activeTab === 'instructor' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'instructor' ? '3px solid #2563EB' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            Instructor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === 'reviews' ? 700 : 500,
              color: activeTab === 'reviews' ? '#2563EB' : '#64748B',
              borderBottom: activeTab === 'reviews' ? '3px solid #2563EB' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Star size={16} fill={activeTab === 'reviews' ? '#2563EB' : 'transparent'} color={activeTab === 'reviews' ? '#2563EB' : '#64748B'} />
            Reviews ({reviewsCount})
          </button>
        </div>

        {/* Modal Body Grid */}
        <div className="modal-content-grid" style={{ padding: '24px' }}>
          {/* Left Main Column */}
          <div>
            {/* ============================================================= */}
            {/* TAB 1: OVERVIEW */}
            {/* ============================================================= */}
            {activeTab === 'overview' && (
              <div>
                {/* What you will learn */}
                <div className="dashboard-card" style={{ marginBottom: 24, padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                  <h3 style={{ marginBottom: 16, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>What You Will Learn</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    {rawLearning.map((item, i) => {
                      const text = typeof item === 'string' ? item : item.text || item.title || ''
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: '#334155' }}>
                          <CheckCircle style={{ width: 18, height: 18, color: '#16A34A', flexShrink: 0, marginTop: 2 }} />
                          <span>{text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Course Requirements */}
                <div className="dashboard-card" style={{ marginBottom: 24, padding: 22, borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                  <h4 style={{ marginBottom: 12, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>Prerequisites & Requirements</h4>
                  <ul style={{ paddingLeft: 20, fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {rawRequirements.map((req, i) => {
                      const text = typeof req === 'string' ? req : req.text || req.title || ''
                      return <li key={i}>{text}</li>
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: CURRICULUM */}
            {/* ============================================================= */}
            {activeTab === 'curriculum' && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>Course Curriculum</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {modulesList.length} Modules • {totalLessons} Lessons
                  </span>
                </div>

                <div className="curriculum-accordion">
                  {modulesList.map((module, idx) => (
                    <div key={module.id || idx} className="accordion-item" style={{ border: '1px solid #E2E8F0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                      <button
                        className="accordion-header"
                        onClick={() => toggleModule(idx)}
                        type="button"
                        style={{ background: openModuleIndex === idx ? '#F8FAFC' : '#FFFFFF', padding: '14px 18px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', cursor: 'pointer' }}
                      >
                        <span style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>{module.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {(module.lessons || []).length} lessons
                          </span>
                          <ChevronDown
                            style={{
                              transform: openModuleIndex === idx ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s',
                              color: '#64748B',
                              width: 18,
                              height: 18
                            }}
                          />
                        </div>
                      </button>
                      {openModuleIndex === idx && (
                        <div className="accordion-content" style={{ padding: '8px 18px 14px 18px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9' }}>
                          {(module.lessons || []).map((lesson) => (
                            <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F8FAFC' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {lesson.isPreview ? (
                                  <PlayCircle style={{ width: 16, height: 16, color: '#2563EB', flexShrink: 0 }} />
                                ) : (
                                  <Lock style={{ width: 16, height: 16, color: '#94A3B8', flexShrink: 0 }} />
                                )}
                                <span style={{ fontWeight: 500, fontSize: '0.875rem', color: '#334155' }}>{lesson.title}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {lesson.isPreview && (
                                  <span
                                    className="preview-pill"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onOpenPreview && onOpenPreview(lesson)
                                    }}
                                    style={{
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      padding: '3px 10px',
                                      background: '#EFF6FF',
                                      color: '#1D4ED8',
                                      borderRadius: 6,
                                      fontWeight: 600
                                    }}
                                  >
                                    Preview Free
                                  </span>
                                )}
                                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{lesson.duration || '20:00'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 3: INSTRUCTOR */}
            {/* ============================================================= */}
            {activeTab === 'instructor' && (
              <div style={{ marginBottom: 24, padding: 24, background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    {leadCreator.name ? leadCreator.name.slice(0, 2).toUpperCase() : 'DR'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {leadCreator.name}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginTop: 3 }}>
                      {leadCreator.role || 'Curriculum Director & Faculty Lead'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
                      Verified Instructor • AIVORTEX Academic Panel
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {leadCreator.bio || 'Leading advanced technical curriculum development and industry-backed research programs.'}
                </p>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 4: REVIEWS & TESTIMONIALS (Course-Wise Isolated) */}
            {/* ============================================================= */}
            {activeTab === 'reviews' && (
              <div style={{ marginBottom: 24 }}>
                {/* Score & Verification Summary */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    padding: '20px 24px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                      {ratingVal.toFixed(1)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < Math.round(ratingVal) ? '#F59E0B' : '#E2E8F0'}
                            color={i < Math.round(ratingVal) ? '#F59E0B' : '#CBD5E1'}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                        Based on {reviewsCount} verified learner reviews
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: '0.8rem',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontWeight: 600
                    }}
                  >
                    <CheckCircle2 size={16} color="#16A34A" />
                    <span>Verified Reviews • Only Enrolled Scholars Can Review</span>
                  </div>
                </div>

                {/* Student Submission Card */}
                {user?.role === 'STUDENT' && (
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      padding: '22px 24px',
                      marginBottom: 24
                    }}
                  >
                    {studentEligibility.isEligible ? (
                      <>
                        {/* Status Alert if review already submitted */}
                        {studentReview && !showEditForm ? (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                                Your Course Review
                              </h4>
                              {studentReview.status === 'PENDING' && (
                                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <Clock size={13} />
                                  Pending Admin Approval
                                </span>
                              )}
                              {studentReview.status === 'APPROVED' && (
                                <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <CheckCircle2 size={13} />
                                  Approved & Published
                                </span>
                              )}
                              {studentReview.status === 'REJECTED' && (
                                <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <AlertCircle size={13} />
                                  Changes Requested / Rejected
                                </span>
                              )}
                            </div>

                            {studentReview.status === 'REJECTED' && studentReview.rejectionReason && (
                              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', color: '#B91C1C', marginBottom: 14 }}>
                                <strong>Admin Feedback:</strong> {studentReview.rejectionReason}
                              </div>
                            )}

                            <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                              <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={16}
                                    fill={i < studentReview.rating ? '#F59E0B' : '#E2E8F0'}
                                    color={i < studentReview.rating ? '#F59E0B' : '#CBD5E1'}
                                  />
                                ))}
                              </div>
                              {studentReview.title && (
                                <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A', marginBottom: 4 }}>
                                  {studentReview.title}
                                </div>
                              )}
                              <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                                &ldquo;{studentReview.reviewText}&rdquo;
                              </p>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => setShowEditForm(true)}
                                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                              >
                                Edit Review
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Review Submission Form */
                          <form onSubmit={handleSubmitReview}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0F172A' }}>
                              {studentReview ? 'Update Your Review' : 'Write a Course Review'}
                            </h4>
                            <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0 0 16px 0' }}>
                              Share your learning feedback. Your review will be reviewed by academic administrators prior to publication.
                            </p>

                            {reviewFormSuccess && (
                              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
                                {reviewFormSuccess}
                              </div>
                            )}

                            {reviewFormError && (
                              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
                                {reviewFormError}
                              </div>
                            )}

                            {/* Interactive Star Picker */}
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Rating <span style={{ color: '#DC2626' }}>*</span>
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormRating(star)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 2,
                                      display: 'flex'
                                    }}
                                  >
                                    <Star
                                      size={26}
                                      fill={star <= formRating ? '#F59E0B' : '#E2E8F0'}
                                      color={star <= formRating ? '#F59E0B' : '#CBD5E1'}
                                      style={{ transition: 'transform 0.1s' }}
                                    />
                                  </button>
                                ))}
                                <span style={{ marginLeft: 10, fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                                  {formRating === 5 && '★★★★★ (Excellent)'}
                                  {formRating === 4 && '★★★★☆ (Very Good)'}
                                  {formRating === 3 && '★★★☆☆ (Good)'}
                                  {formRating === 2 && '★★☆☆☆ (Fair)'}
                                  {formRating === 1 && '★☆☆☆☆ (Poor)'}
                                </span>
                              </div>
                            </div>

                            {/* Optional Review Title */}
                            <div style={{ marginBottom: 14 }}>
                              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Review Title <span style={{ fontWeight: 400, color: '#94A3B8' }}>(Optional)</span>
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="e.g. Phenomenal projects and real production depth"
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                              />
                            </div>

                            {/* Review Text */}
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Detailed Feedback <span style={{ color: '#DC2626' }}>*</span>
                              </label>
                              <textarea
                                rows={4}
                                className="form-input"
                                value={formText}
                                onChange={(e) => setFormText(e.target.value)}
                                placeholder="Explain how this course helped your skills, what stood out, and your experience with projects and mentors..."
                                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', lineHeight: 1.5 }}
                                required
                              />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                              {showEditForm && (
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => setShowEditForm(false)}
                                >
                                  Cancel
                                </button>
                              )}
                              <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmittingReview || !formText.trim()}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                              >
                                <Send size={14} />
                                <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review for Approval'}</span>
                              </button>
                            </div>
                          </form>
                        )}
                      </>
                    ) : (
                      /* Not enrolled notice */
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.875rem', color: '#64748B' }}>
                          Only verified scholars enrolled in <strong>{course.title}</strong> are eligible to submit course reviews.
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => onEnroll && onEnroll(course)}
                        >
                          Enroll in Course to Share Feedback
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Non-student logged in / Anonymous view */}
                {!user && (
                  <div style={{ background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 10, padding: '14px 18px', marginBottom: 20, textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
                    Are you enrolled in this program? Sign in with your scholar account to leave your review.
                  </div>
                )}

                {/* Approved Reviews List */}
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px 0', color: '#0F172A' }}>
                  Verified Scholar Feedback ({courseReviews.length})
                </h4>

                {reviewsLoading ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
                    Loading verified scholar reviews...
                  </div>
                ) : courseReviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {courseReviews.map((rev) => {
                      const reviewerName = rev.student?.name || 'Verified Scholar'
                      const reviewerInitials = reviewerName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                      const revDate = rev.createdAt
                        ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'Recent'

                      return (
                        <div
                          key={rev.id}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: 10,
                            border: '1px solid #E2E8F0',
                            padding: '16px 20px',
                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {rev.student?.avatar ? (
                                <img
                                  src={rev.student.avatar}
                                  alt={reviewerName}
                                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {reviewerInitials}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                                  {reviewerName}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                                  Verified Scholar • {revDate}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 2 }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < rev.rating ? '#F59E0B' : '#E2E8F0'}
                                  color={i < rev.rating ? '#F59E0B' : '#CBD5E1'}
                                />
                              ))}
                            </div>
                          </div>

                          {rev.title && (
                            <h5 style={{ margin: '0 0 6px 0', fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>
                              {rev.title}
                            </h5>
                          )}

                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                            &ldquo;{rev.reviewText}&rdquo;
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: 12,
                      padding: '36px 20px',
                      textAlign: 'center'
                    }}
                  >
                    <MessageSquare size={32} style={{ color: '#94A3B8', margin: '0 auto 10px auto' }} />
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', margin: '0 0 6px 0' }}>
                      No verified reviews approved yet
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: 420, margin: '0 auto' }}>
                      Reviews submitted by enrolled scholars appear here once approved by our academic administrators.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sticky Purchase Card */}
          <div>
            <div className="modal-purchase-card" style={{ position: 'sticky', top: 20 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Total Investment</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                <span className="purchase-card-price">
                  {isFree ? 'FREE' : `₹${priceVal.toLocaleString('en-IN')}`}
                </span>
                {!isFree && origPriceVal > priceVal && (
                  <span style={{ textDecoration: 'line-through', color: '#94A3B8', fontSize: '1.1rem' }}>
                    ₹{origPriceVal.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {!isFree && discountVal > 0 && (
                <div style={{ display: 'inline-block', fontSize: '0.8rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 700, marginBottom: 20 }}>
                  Special {discountVal}% Discount Applied
                </div>
              )}

              <button
                className="btn btn-primary btn-lg btn-enroll-now-modal"
                style={{ width: '100%', marginBottom: 12 }}
                onClick={() => onEnroll && onEnroll(course)}
              >
                <span>{isFree ? 'Enroll in Free Course' : 'Enroll in Course'}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                256-Bit SSL Encrypted Razorpay Checkout
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>This Course Includes:</h5>
                <ul className="purchase-features-list">
                  <li className="purchase-feature-item">
                    <Video style={{ width: 16, height: 16, color: 'var(--color-secondary)' }} />
                    <span>{course.duration || `${course.durationHours || 24} Hours`} on-demand video lessons</span>
                  </li>
                  <li className="purchase-feature-item">
                    <Calendar style={{ width: 16, height: 16, color: 'var(--color-accent)' }} />
                    <span>Live Saturday & Sunday mentoring sessions</span>
                  </li>
                  <li className="purchase-feature-item">
                    <FileCode2 style={{ width: 16, height: 16, color: 'var(--color-secondary)' }} />
                    <span>Downloadable Jupyter notebooks & datasets</span>
                  </li>
                  <li className="purchase-feature-item">
                    <FolderGit2 style={{ width: 16, height: 16, color: 'var(--color-secondary)' }} />
                    <span>Domain-based portfolio projects</span>
                  </li>
                  <li className="purchase-feature-item">
                    <Award style={{ width: 16, height: 16, color: '#D97706' }} />
                    <span>Official verifiable Certificate of Completion</span>
                  </li>
                  <li className="purchase-feature-item">
                    <Infinity style={{ width: 16, height: 16, color: 'var(--color-secondary)' }} />
                    <span>Lifetime course access & future updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { X, CheckCircle, ChevronDown, PlayCircle, Lock, ShieldCheck, Video, Calendar, FileCode2, FolderGit2, Award, Infinity } from 'lucide-react'

export default function CourseDetailModal({ course, isOpen, onClose, onEnroll, onOpenPreview }) {
  const [openModuleIndex, setOpenModuleIndex] = useState(0)

  if (!isOpen || !course) return null

  const toggleModule = (idx) => {
    setOpenModuleIndex(openModuleIndex === idx ? -1 : idx)
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
  const ratingVal = course.rating || course.averageRating || 4.9
  const reviewsCount = course.reviewsCount || 480
  const studentsCount = course.studentsEnrolled || course.studentsCount || 1250
  const isFree = Boolean(course.isFree || course.price === 0)
  const priceVal = isFree ? 0 : (course.price ?? 0)
  const origPriceVal = course.originalPrice ?? (priceVal ? Math.round(priceVal * 1.5) : 0)
  const discountVal = course.discountPercent || (origPriceVal > priceVal ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100) : 0)
  const totalLessons = course.lessonsCount || modulesList.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)

  return (
    <div className="modal-overlay" id="course-modal-overlay" onClick={onClose}>
      <div className="modal-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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
          <h2 id="modal-course-title">{course.title}</h2>
          <p style={{ color: '#E2E8F0', fontSize: '1.05rem', marginBottom: 20, maxWidth: 750 }}>
            {course.fullDescription || course.shortDescription}
          </p>

          <div className="modal-hero-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FFFFFF', fontWeight: 700 }}>
              <span>Rating: {ratingVal} ({reviewsCount.toLocaleString()} ratings)</span>
            </div>
            <div>•</div>
            <div>{studentsCount.toLocaleString()} Students Enrolled</div>
            <div>•</div>
            <div>Level: {course.level || 'All Levels'}</div>
            {course.language && (
              <>
                <div>•</div>
                <div>Language: {course.language}</div>
              </>
            )}
            <div>•</div>
            <div>Total Duration: {course.duration || `${course.durationHours || 24} Hours`}</div>
          </div>
        </div>

        {/* Modal Body Grid */}
        <div className="modal-content-grid">
          {/* Left Main Column */}
          <div>
            {/* What you will learn */}
            <div className="dashboard-card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1.2rem' }}>What You Will Learn</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                {rawLearning.map((item, i) => {
                  const text = typeof item === 'string' ? item : item.text || item.title || ''
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem' }}>
                      <CheckCircle style={{ width: 18, height: 18, color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                      <span>{text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontSize: '1.2rem' }}>Course Curriculum</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {modulesList.length} Modules • {totalLessons} Lessons
                </span>
              </div>

              <div className="curriculum-accordion">
                {modulesList.map((module, idx) => (
                  <div key={module.id || idx} className="accordion-item">
                    <button
                      className="accordion-header"
                      onClick={() => toggleModule(idx)}
                      type="button"
                    >
                      <span>{module.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                          {(module.lessons || []).length} lessons
                        </span>
                        <ChevronDown
                          className="accordion-icon"
                          style={{
                            transform: openModuleIndex === idx ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s'
                          }}
                        />
                      </div>
                    </button>
                    <div className={`accordion-content ${openModuleIndex === idx ? 'open' : ''}`}>
                      {(module.lessons || []).map((lesson) => (
                        <div key={lesson.id} className="lesson-row">
                          <div className="lesson-left">
                            {lesson.isPreview ? (
                              <PlayCircle style={{ width: 16, height: 16, color: 'var(--color-secondary)' }} />
                            ) : (
                              <Lock style={{ width: 16, height: 16, color: '#94A3B8' }} />
                            )}
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{lesson.title}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {lesson.isPreview && (
                              <span
                                className="preview-pill btn-open-preview"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onOpenPreview && onOpenPreview(lesson)
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                Preview Free
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lesson.duration || '20:00'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Requirements */}
            <div className="dashboard-card">
              <h4 style={{ marginBottom: 12, fontSize: '1.05rem' }}>Prerequisites & Requirements</h4>
              <ul style={{ paddingLeft: 20, fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rawRequirements.map((req, i) => {
                  const text = typeof req === 'string' ? req : req.text || req.title || ''
                  return <li key={i}>{text}</li>
                })}
              </ul>
            </div>
          </div>

          {/* Right Sticky Purchase Card */}
          <div>
            <div className="modal-purchase-card">
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

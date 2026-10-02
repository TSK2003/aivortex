import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Star } from 'lucide-react'

export default function Testimonials() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchFeatured() {
      try {
        setLoading(true)
        const res = await api.public.getFeaturedReviews()
        if (isMounted && res?.data?.reviews) {
          setReviews(res.data.reviews)
        }
      } catch (err) {
        console.warn('Failed to load featured reviews:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchFeatured()
    return () => {
      isMounted = false
    }
  }, [])

  // If loading, show a neat skeleton
  if (loading) {
    return (
      <section className="section section-alt" id="testimonials" style={{ padding: '44px 0 52px 0' }}>
        <div className="container">
          <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 28px auto' }}>
            <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
              REAL STORIES FROM <span className="highlight-blue" style={{ color: '#2563EB' }}>OUR LEARNERS</span>
            </h2>
            <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
              Hear directly from data scientists, machine learning engineers, and developers who advanced their engineering careers with aivortex.
            </p>
          </div>
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 28 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 8,
                  padding: '28px',
                  border: '1px solid #E2E8F0',
                  height: 200,
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // If no approved + featured reviews exist, hide the section on production without showing fake testimonials
  if (!reviews || reviews.length === 0) {
    return null
  }

  return (
    <section className="section section-alt" id="testimonials" style={{ padding: '44px 0 52px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 28px auto' }}>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            REAL STORIES FROM <span className="highlight-blue" style={{ color: '#2563EB' }}>OUR LEARNERS</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Hear directly from data scientists, machine learning engineers, and developers who advanced their engineering careers with aivortex.
          </p>
        </div>

        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 28 }}>
          {reviews.map((item) => {
            const studentName = item.student?.name || 'Verified Scholar'
            const initials = studentName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            const courseTitle = item.course?.title || 'Academic Program'

            return (
              <div
                key={item.id}
                className="testimonial-card"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 8,
                  padding: '28px',
                  border: '1px solid #E2E8F0',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>VERIFIED REVIEW</span>
                      <span>•</span>
                      <span>{item.rating || 5}.0 / 5.0</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(item.rating || 5)].map((_, idx) => (
                        <Star key={idx} size={14} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                  </div>

                  {item.title && (
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 10, lineHeight: 1.4 }}>
                      {item.title}
                    </h4>
                  )}

                  <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 24 }}>
                    &ldquo;{item.reviewText}&rdquo;
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                  {item.student?.avatar ? (
                    <img
                      src={item.student.avatar}
                      alt={studentName}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>{studentName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>Verified Learner</div>
                    <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: 2 }}>
                      Alumnus: {courseTitle}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


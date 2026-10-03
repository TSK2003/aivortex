import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react'
import CustomSelect from '../../components/common/CustomSelect'
import api from '../../services/api'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Course Admissions & Technical Inquiries',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const topicOptions = [
    'Course Admissions & Technical Inquiries',
    'Payment / Invoicing Support',
    'Creator Instructor Application',
    'Corporate / University Licensing'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.public.submitContact(formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: 'Course Admissions & Technical Inquiries', message: '' })
    } catch (err) {
      setError(err?.message || 'Failed to dispatch inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 36px auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <Mail size={14} style={{ marginRight: 6 }} />
            24/7 Academic & Technical Support
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 16 }}>
            Connect with Us
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Have questions about syllabus depth, corporate enrollment, creator partnerships, or system access? Our engineering advisory team is here to assist.
          </p>
        </div>

        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 32 }}>
          {/* Contact Details Card */}
          <div
            className="card"
            style={{
              borderRadius: 8,
              padding: 'clamp(20px, 4vw, 36px)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20 }}>
                Campus & Operations
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>Headquarters</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                      Indiranagar<br />
                      Bangalore, Karnataka, India
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>Direct Inquiries</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <a
                        href="mailto:support@aivortex.in"
                        style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#2563EB' }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'inherit' }}
                      >
                        support@aivortex.in
                      </a>
                      <a
                        href="mailto:aivortexgroup@gmail.com"
                        style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#2563EB' }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'inherit' }}
                      >
                        aivortexgroup@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>Hotline</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                      <a
                        href="tel:+918904656669"
                        style={{ color: 'inherit', textDecoration: 'none', display: 'block', transition: 'color 0.2s ease' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#2563EB' }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'inherit' }}
                      >
                        +91 8904656669
                      </a>
                      <div>24/7 Availability</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32, padding: 16, borderRadius: 12, background: 'var(--color-bg-subtle)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary)' }}>Enterprise & University Cohorts</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                Custom curriculum licensing and multi-seat corporate invoicing available upon request.
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div
            className="card"
            style={{
              borderRadius: 8,
              padding: 'clamp(20px, 4vw, 36px)',
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 20 }}>
              Write us a Query
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                  Inquiry Dispatched Successfully!
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  A senior counselor has received your note and will follow up within 4 business hours.
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', color: '#EF4444', fontSize: '0.85rem', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Karthick Subramanian"
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="karthick@example.com"
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)' }}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                    Topic
                  </label>
                  <CustomSelect
                    options={topicOptions}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>
                    Message Details
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your current tech stack, target goals, or questions regarding the curriculum..."
                    className="form-control"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)', resize: 'vertical' }}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading ? (
                    <span>Sending Inquiry...</span>
                  ) : (
                    <>
                      <Send size={16} style={{ marginRight: 8 }} />
                      <span>Submit Query</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowLeft, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function StudentSignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      showToast('Please fill all required fields', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      const res = await signup(name, email, password)
      if (res?.success) {
        showToast(`Welcome to ApexLearn, ${name}! Your student account is active.`, 'success')
        navigate('/student/dashboard')
      } else {
        showToast(res?.error || 'Registration failed. Please try again.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page-container">
      <div className="student-auth-layout">
        {/* Visual Brand Side (Left) */}
        <div className="auth-visual-side">
          <div>
            <Link to="/portal" className="auth-brand-header">
              <div
                className="brand-icon"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                <GraduationCap style={{ width: 22, height: 22 }} />
              </div>
              <div>
                ApexLearn
                <span className="brand-name-sub" style={{ color: '#38BDF8' }}>STUDENT PORTAL</span>
              </div>
            </Link>
          </div>

          <div className="auth-testimonial-box">
            <div style={{ color: '#38BDF8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', marginBottom: 12 }}>
              VERIFIED STUDENT REVIEW
            </div>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#F8FAFC', marginBottom: 16, fontStyle: 'italic' }}>
              &ldquo;ApexLearn gave me the exact hands-on experience and verifiable credentials to transition into a full-time Machine Learning Engineer.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                style={{ width: 42, height: 42, borderRadius: '50%', border: '2px solid #38BDF8' }}
                alt="Rahul Sharma"
              />
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>Rahul Sharma</strong>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Student Scholar • Python for Data Science</div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#94A3B8',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 20
            }}
          >
            <span>© 2026 ApexLearn Institute</span>
            <Link to="/" style={{ color: '#CBD5E1' }}>Back to Home</Link>
          </div>
        </div>

        {/* Form Side (Right) */}
        <div className="auth-form-side">
          <div className="auth-card-inner">
            <div style={{ marginBottom: 20 }}>
              <Link
                to="/portal"
                className="auth-back-link"
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
                <span>Back to Portal Selection</span>
              </Link>
            </div>

            <div className="auth-title-group">
              <div
                style={{
                  fontFamily: 'var(--font-family-heading)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: 'var(--color-secondary)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 4
                }}
              >
                APEXLEARN
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>
                CREATE ACCOUNT
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Join thousands of engineers mastering production-grade AI & Data Science.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-field-group">
                <label className="form-label">Full Legal Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••••••• (min 8 chars)"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 12 }}
                disabled={isSubmitting}
              >
                <ShieldCheck style={{ width: 18, height: 18 }} />
                <span>{isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE STUDENT ACCOUNT'}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Already registered?{' '}
              <Link to="/student/login" style={{ color: 'var(--color-secondary)', fontWeight: 700 }}>
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

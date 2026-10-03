import { useState } from 'react'
import { X, GraduationCap, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { studentLogin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Please enter both email and password', 'error')
      return
    }
    const success = studentLogin(email, password)
    if (success) {
      showToast('Signed in successfully!', 'success')
      onClose()
      navigate('/student/dashboard')
    }
  }

  return (
    <div className="modal-overlay" id="auth-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 440, padding: 32 }}
        role="dialog"
        aria-label="Student Sign In"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            className="brand-icon"
            style={{ width: 44, height: 44, margin: '0 auto 12px auto', background: 'var(--color-primary)' }}
          >
            <GraduationCap style={{ width: 24, height: 24, color: '#FFFFFF' }} />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: 4 }}>Student Sign In</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Access your courses, learning progress, & projects.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-field-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul.sharma@example.com"
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
              placeholder="••••••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }}>
            <span>Sign In</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/student/signup" onClick={onClose} style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  )
}

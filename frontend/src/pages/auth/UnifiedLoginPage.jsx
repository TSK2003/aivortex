import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowRight, ShieldCheck, Video, UserCheck, Lock, Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLoginSuccess = (user) => {
    const role = (user?.role || '').toLowerCase()
    if (role === 'creator') {
      showToast(`Welcome to Creator Studio, ${user.name || 'Dr. Alex Rivera'}!`, 'success')
      navigate('/creator/dashboard')
    } else if (role === 'admin') {
      showToast(`Welcome to Admin Control Center, ${user.name || 'Dr. Vikram Sen'}!`, 'success')
      navigate('/admin/dashboard')
    } else {
      showToast(`Welcome back, ${user.name || 'Rahul'}!`, 'success')
      navigate('/student/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      showToast('Please enter both email and password', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await login(email, password)
      if (res?.success && res?.user) {
        handleLoginSuccess(res.user)
      } else {
        showToast(res?.error || 'Login failed. Please verify credentials.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDemoSignIn = async (demoEmail, demoPassword) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsSubmitting(true)
    try {
      const res = await login(demoEmail, demoPassword)
      if (res?.success && res?.user) {
        handleLoginSuccess(res.user)
      } else {
        showToast(res?.error || 'Login failed.', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Login encountered an issue', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0F172A 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <GraduationCap size={24} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              ApexLearn
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-secondary)', letterSpacing: '0.04em' }}>
              INSTITUTE OF TECH & AI
            </div>
          </div>
        </Link>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
          padding: '36px 32px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 6 }}>
            Sign In to ApexLearn
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Enter your credentials. You will automatically be routed to your authorized portal (Student, Creator, or Admin).
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-field-group" style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com or name@apexlearn.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  paddingLeft: 38,
                  background: '#FFFFFF',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  height: 44,
                  fontSize: '0.9rem'
                }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
            </div>
          </div>

          <div className="form-field-group" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
                Password
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault()
                  showToast('Password reset link sent to your email address', 'info')
                }}
                style={{ fontSize: '0.775rem', color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  paddingLeft: 38,
                  background: '#FFFFFF',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  height: 44,
                  fontSize: '0.9rem'
                }}
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{ width: '100%', height: 46, fontSize: '0.95rem', fontWeight: 700 }}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '28px 0 20px 0',
            gap: 12,
            color: 'var(--color-text-tertiary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}></div>
          <span>Or 1-Click Demo Login</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }}></div>
        </div>

        {/* 1-Click Demo Badges Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Demo Student */}
          <button
            type="button"
            onClick={() => handleDemoSignIn('rahul.sharma@example.com', 'student123')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem'
                }}
              >
                STUDENT
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1E40AF' }}>
                  Rahul Sharma
                </div>
                <div style={{ fontSize: '0.75rem', color: '#60A5FA' }}>
                  rahul.sharma@example.com • student123
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>Login</span>
          </button>

          {/* Demo Creator */}
          <button
            type="button"
            onClick={() => handleDemoSignIn('creator@apexlearn.edu', 'creator123')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem'
                }}
              >
                CREATOR
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#166534' }}>
                  Dr. Alex Rivera
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4ADE80' }}>
                  creator@apexlearn.edu • creator123
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16A34A' }}>Login</span>
          </button>

          {/* Demo Admin */}
          <button
            type="button"
            onClick={() => handleDemoSignIn('director@apexlearn.edu', 'adminSecret2026')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 12,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.7rem'
                }}
              >
                ADMIN
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991B1B' }}>
                  Dr. Vikram Sen
                </div>
                <div style={{ fontSize: '0.75rem', color: '#F87171' }}>
                  director@apexlearn.edu • adminSecret2026
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>Login</span>
          </button>
        </div>

        {/* Footer Link */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/student/signup" style={{ color: 'var(--color-secondary)', fontWeight: 700, textDecoration: 'none' }}>
            Register as Student
          </Link>
        </div>
      </div>

      {/* Back to Home Link */}
      <div style={{ marginTop: 20 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to ApexLearn Public Website</span>
        </Link>
      </div>
    </div>
  )
}

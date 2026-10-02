import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import BrandLogo from '../../components/common/BrandLogo'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { api } from '../../services/api'

export default function UnifiedLoginPage() {
  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const enrollParam = searchParams.get('enroll')
  const resetTokenParam = searchParams.get('resetToken')

  const [mode, setMode] = useState(resetTokenParam ? 'reset' : 'login') // 'login' | 'forgot' | 'reset'

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  // Reset password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const { login, user: existingUser, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (resetTokenParam) {
      setMode('reset')
    }
  }, [resetTokenParam])

  // If already authenticated, redirect to appropriate role dashboard or preserved target
  useEffect(() => {
    if (isAuthenticated && existingUser && mode === 'login') {
      const role = (existingUser?.role || '').toLowerCase()
      if (role === 'creator') {
        navigate('/creator/dashboard', { replace: true })
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        if (redirectParam) {
          navigate(redirectParam + (enrollParam ? '?enroll=true' : ''), { replace: true })
        } else {
          navigate('/student/dashboard', { replace: true })
        }
      }
    }
  }, [isAuthenticated, existingUser, mode, navigate, redirectParam, enrollParam])

  const handleLoginSuccess = (user) => {
    const role = (user?.role || '').toLowerCase()
    if (role === 'creator') {
      showToast(`Welcome to Creator Studio, ${user.name}!`, 'success')
      navigate('/creator/dashboard')
    } else if (role === 'admin') {
      showToast(`Welcome to Admin Control Center, ${user.name}!`, 'success')
      navigate('/admin/dashboard')
    } else {
      showToast(`Welcome back, ${user.name}!`, 'success')
      if (redirectParam) {
        navigate(redirectParam + (enrollParam ? '?enroll=true' : ''))
      } else {
        navigate('/student/dashboard')
      }
    }
  }

  const handleLoginSubmit = async (e) => {
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    if (!forgotEmail) {
      showToast('Please enter your account email address', 'error')
      return
    }

    setForgotLoading(true)
    try {
      await api.auth.forgotPassword(forgotEmail)
      setForgotSuccess(true)
      showToast('If an account with that email exists, reset instructions have been dispatched.', 'success')
    } catch (err) {
      showToast(err.message || 'Unable to request password reset', 'error')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      showToast('Please enter and confirm your new password', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setResetLoading(true)
    try {
      await api.auth.resetPassword(resetTokenParam, newPassword)
      setResetSuccess(true)
      showToast('Password reset successfully. You may now sign in with your new password.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to reset password. Link may be expired.', 'error')
    } finally {
      setResetLoading(false)
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
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          <BrandLogo size="lg" />
        </Link>
      </div>

      {/* Main Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 8px)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px 32px',
          boxSizing: 'border-box'
        }}
      >
        {/* LOGIN MODE */}
        {mode === 'login' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 6 }}>
                Sign In to aivortex
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Enter your credentials to access your account.
              </p>
              {redirectParam && (
                <div
                  style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1D4ED8',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  Please sign in to proceed with your course enrollment.
                </div>
              )}
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-field-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
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
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setForgotSuccess(false)
                      setMode('forgot')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '0.775rem',
                      color: 'var(--color-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Forgot Password?
                  </button>
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

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Don&apos;t have an account?{' '}
              <Link
                to={redirectParam ? `/student/signup?redirect=${encodeURIComponent(redirectParam)}${enrollParam ? '&enroll=true' : ''}` : '/student/signup'}
                style={{ color: 'var(--color-secondary)', fontWeight: 700, textDecoration: 'none' }}
              >
                Register as Student
              </Link>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <KeyRound size={24} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 6 }}>
                Reset Your Password
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Enter the email address associated with your aivortex account to receive a secure recovery link.
              </p>
            </div>

            {forgotSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 12,
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    marginBottom: 20
                  }}
                >
                  <CheckCircle2 size={24} style={{ color: '#16A34A', margin: '0 auto 8px auto', display: 'block' }} />
                  <strong>Instructions Dispatched</strong>
                  <p style={{ marginTop: 6, margin: 0 }}>
                    If an account with that email exists, an email with password reset instructions has been sent. Please check your inbox and spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="btn btn-primary"
                  style={{ width: '100%', height: 44, fontWeight: 700 }}
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="form-field-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Account Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
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

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={forgotLoading}
                  style={{ width: '100%', height: 46, fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <span>{forgotLoading ? 'Sending Recovery Link...' : 'Send Recovery Email'}</span>
                </button>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* RESET PASSWORD MODE (from email token) */}
        {mode === 'reset' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <Lock size={24} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 6 }}>
                Create New Password
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Your identity has been verified via your reset link. Enter your new account password below.
              </p>
            </div>

            {resetSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 12,
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    marginBottom: 20
                  }}
                >
                  <CheckCircle2 size={24} style={{ color: '#16A34A', margin: '0 auto 8px auto', display: 'block' }} />
                  <strong>Password Updated Successfully</strong>
                  <p style={{ marginTop: 6, margin: 0 }}>
                    Your password has been securely changed and all previous sessions invalidated. You can now sign in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/portal')
                    setMode('login')
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', height: 44, fontWeight: 700 }}
                >
                  Sign In with New Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <div className="form-field-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    New Password (min. 8 characters)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
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

                <div className="form-field-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
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
                  disabled={resetLoading}
                  style={{ width: '100%', height: 46, fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <span>{resetLoading ? 'Securing Password...' : 'Save New Password'}</span>
                </button>

                <div style={{ marginTop: 20, textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/portal')
                      setMode('login')
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Cancel and Return to Sign In
                  </button>
                </div>
              </form>
            )}
          </>
        )}
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
          <span>Back to aivortex Public Website</span>
        </Link>
      </div>
    </div>
  )
}

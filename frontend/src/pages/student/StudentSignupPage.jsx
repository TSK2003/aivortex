import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import BrandLogo from '../../components/common/BrandLogo'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import './StudentSignupPage.css'

export default function StudentSignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [searchParams] = useSearchParams()
  const redirectParam = searchParams.get('redirect')
  const enrollParam = searchParams.get('enroll')

  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      showToast('Please fill all required fields', 'error')
      return
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await signup(name.trim(), email.trim(), password)
      if (res?.success) {
        showToast(`Welcome to aivortex, ${name}! Your account is active.`, 'success')
        if (redirectParam) {
          navigate(redirectParam + (enrollParam ? '?enroll=true' : ''))
        } else {
          navigate('/student/dashboard')
        }
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
    <div className="student-signup-page">
      {/* Brand Header */}
      <div className="signup-brand-header">
        <Link to="/" title="aivortex Home">
          <BrandLogo size="lg" />
        </Link>
      </div>

      {/* Main Card */}
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Create an account</h1>
          <p className="signup-subtitle">
            Enter your details below to get started with aivortex.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form" noValidate>
          {/* Full Name */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="name-input">
              Full Name
            </label>
            <div className="signup-input-wrap">
              <input
                id="name-input"
                type="text"
                className="signup-input"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Email */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="email-input">
              Email Address
            </label>
            <div className="signup-input-wrap">
              <input
                id="email-input"
                type="email"
                className="signup-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="password-input">
              Password
            </label>
            <div className="signup-input-wrap">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                className="signup-input"
                style={{ paddingRight: 40 }}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="signup-eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Terms Note */}
          <p className="signup-terms-note">
            By creating an account, you agree to our{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>
            .
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            className="signup-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Card Footer Switch */}
        <div className="signup-card-footer">
          Already have an account?{' '}
          <Link to="/student/login">
            Sign in
          </Link>
        </div>
      </div>

      {/* Page Outer Footer */}
      <footer className="signup-page-footer">
        <div className="signup-page-footer-links">
          <Link to="/terms">Terms</Link>
          <span>•</span>
          <Link to="/privacy">Privacy</Link>
          <span>•</span>
          <Link to="/contact">Support</Link>
          <span>•</span>
          <Link to="/">Home</Link>
        </div>
        <span>© 2026 aivortex. All rights reserved.</span>
      </footer>
    </div>
  )
}

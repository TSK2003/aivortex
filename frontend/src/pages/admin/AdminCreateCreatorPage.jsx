import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users,
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
  Mail,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  User,
  UserCheck,
  Camera,
  Trash2,
  Phone,
  ChevronDown
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import {
  INTERNATIONAL_COUNTRY_CODES,
  formatToE164,
  validateInternationalPhone
} from '../../utils/formatters'

export default function AdminCreateCreatorPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Section 1: Profile State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91')
  const [nationalPhone, setNationalPhone] = useState('')
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const countryDropdownRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setIsCountryDropdownOpen(false)
      }
    }
    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isCountryDropdownOpen])

  const selectedCountry = useMemo(() => {
    return (
      INTERNATIONAL_COUNTRY_CODES.find((c) => c.dialCode === phoneCountryCode) ||
      INTERNATIONAL_COUNTRY_CODES[0]
    )
  }, [phoneCountryCode])

  const filteredCountryCodes = useMemo(() => {
    if (!countrySearch.trim()) return INTERNATIONAL_COUNTRY_CODES
    const q = countrySearch.toLowerCase().trim()
    return INTERNATIONAL_COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    )
  }, [countrySearch])

  const handleCountryCodeChange = (newCode) => {
    setPhoneCountryCode(newCode)
    setIsCountryDropdownOpen(false)
    setCountrySearch('')
    const formatted = nationalPhone.trim() ? formatToE164(newCode, nationalPhone) : ''
    setPhone(formatted)
    if (nationalPhone.trim()) {
      const err = validateInternationalPhone(newCode, nationalPhone)
      setErrors((prev) => ({ ...prev, phone: err || null }))
    } else {
      setErrors((prev) => ({ ...prev, phone: null }))
    }
  }

  const handleNationalPhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9+\s\-()]/g, '').slice(0, 25)
    setNationalPhone(val)
    const formatted = val.trim() ? formatToE164(phoneCountryCode, val) : ''
    setPhone(formatted)
    if (val.trim()) {
      const err = validateInternationalPhone(phoneCountryCode, val)
      setErrors((prev) => ({ ...prev, phone: err || null }))
    } else {
      setErrors((prev) => ({ ...prev, phone: null }))
    }
  }
  const [avatar, setAvatar] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [bio, setBio] = useState('')
  const [organization, setOrganization] = useState('')

  // Neutral creator initials helper
  const getCreatorInitials = (nameStr) => {
    if (!nameStr || typeof nameStr !== 'string') return ''
    const cleaned = nameStr.trim().replace(/^(dr\.|dr|prof\.|prof|mr\.|mr|mrs\.|mrs|ms\.|ms|er\.|er)\s+/i, '').trim()
    const target = cleaned || nameStr.trim()
    const parts = target.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return ''
  }

  // Section 2: Credentials State
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Credential Delivery (Always automatic)
  const sendEmail = true

  // UI & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [copiedKey, setCopiedKey] = useState(null)
  const [createdResult, setCreatedResult] = useState(null)

  const [isGeneratingUserId, setIsGeneratingUserId] = useState(false)

  // Auto-generate sequential Creator User ID (e.g. Banu -> CR-BAN-001)
  const handleGenerateUserId = async () => {
    try {
      setIsGeneratingUserId(true)
      const res = await api.admin.getNextCreatorUserId(name.trim())
      if (res?.data?.userId) {
        setUserId(res.data.userId)
      } else {
        const prefix = name.trim()
          ? name.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
          : 'FAC'
        setUserId(`CR-${prefix || 'FAC'}-001`)
      }
      if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }))
    } catch (err) {
      console.warn('Failed to fetch sequential User ID from server, using local fallback', err)
      const prefix = name.trim()
        ? name.trim().split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
        : 'FAC'
      setUserId(`CR-${prefix || 'FAC'}-001`)
      if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }))
    } finally {
      setIsGeneratingUserId(false)
    }
  }

  // Auto-generate strong initial password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let rand = ''
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const specialChars = '!@#$%^&*'
    const spec = specialChars.charAt(Math.floor(Math.random() * specialChars.length))
    const generated = `Aivortex${rand}${spec}${Math.floor(10 + Math.random() * 90)}`
    setPassword(generated)
    setConfirmPassword(generated)
    setShowPassword(true)
    setShowConfirmPassword(true)
    setErrors((prev) => ({ ...prev, password: null, confirmPassword: null }))
  }

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: '#9B9DA3' }
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { score: 25, label: 'Weak', color: '#2D2F33' }
    if (score === 3) return { score: 50, label: 'Moderate', color: '#4B4D52' }
    if (score === 4) return { score: 75, label: 'Strong', color: '#2D2F33' }
    return { score: 100, label: 'Excellent', color: '#2D2F33' }
  }, [password])

  // Validation
  const validateForm = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Full name is required'
    const emailVal = email.trim()
    if (!emailVal) {
      errs.email = 'Email address is required'
    } else {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
      const parts = emailVal.split('@')
      const domain = parts[1] || ''
      const domainParts = domain.split('.')
      const tld = domainParts[domainParts.length - 1] || ''

      if (!emailRegex.test(emailVal) || parts.length !== 2 || domainParts.length < 2 || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
        errs.email = 'Please enter a valid email address with a proper domain (e.g. name@company.com)'
      } else if (['example.com', 'example.org', 'test.com', 'invalid.com'].includes(domain.toLowerCase())) {
        errs.email = 'Please enter an active, non-test email address that can receive mail'
      }
    }
    if (!specialization.trim()) {
      errs.specialization = 'Professional title or specialization is required'
    }
    if (nationalPhone.trim()) {
      const pErr = validateInternationalPhone(phoneCountryCode, nationalPhone)
      if (pErr) errs.phone = pErr
    }
    // Proper password length validation
    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long'
    } else if (password.length > 32) {
      errs.password = 'Password cannot exceed 32 characters'
    }

    // Confirm password validation
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required'
    } else if (password && confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match'
    }

    return errs
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const validationErrors = validateForm()
    setErrors(validationErrors)
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    showToast('Copied to clipboard', 'info')
    setTimeout(() => setCopiedKey(null), 2500)
  }

  // Submit Handler: Create & Activate Creator
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setTouched({
        name: true,
        email: true,
        specialization: true,
        password: true,
        confirmPassword: true,
        phone: true
      })
      showToast('Please correct the highlighted form errors before proceeding.', 'error')
      return
    }

    try {
      setIsSubmitting(true)

      const finalPhone = nationalPhone.trim()
        ? formatToE164(phoneCountryCode, nationalPhone)
        : null

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: finalPhone,
        avatar: avatar ? avatar.trim() : null,
        specialization: specialization.trim(),
        bio: bio ? bio.trim() : null,
        organization: organization ? organization.trim() : null,
        userId: userId ? userId.trim() : null,
        password: password.trim(),
        status: 'ACTIVE',
        sendEmail
      }

      const res = await api.admin.createCreator(payload)

      if (res.data) {
        setCreatedResult({
          creator: res.data.creator,
          password: password.trim() || res.data.tempPasswordGenerated || 'AivortexCreator2026!',
          emailStatus: res.data.emailStatus
        })
        showToast(
          'Creator account created successfully. Login credentials sent to registered email.',
          'success'
        )
      }
    } catch (err) {
      const msg = err.message || 'Unable to create creator account. Please try again.'
      showToast(msg, 'error')
      if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('domain') || msg.toLowerCase().includes('mail') || msg.toLowerCase().includes('credential')) {
        setErrors((prev) => ({ ...prev, email: msg }))
      } else if (msg.toLowerCase().includes('id')) {
        setErrors((prev) => ({ ...prev, userId: msg }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // If Creator was successfully created, show confirmation summary card
  if (createdResult) {
    const { creator, password: initialPassword, emailStatus } = createdResult
    return (
      <div style={{ maxWidth: 840, margin: '20px auto 120px auto', padding: '0 20px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            padding: 40,
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#EFEFEF',
              color: '#2D2F33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15171A', marginBottom: 8 }}>
            Creator Account Created Successfully!
          </h2>
          <p style={{ color: '#6B6D73', fontSize: '0.9rem', maxWidth: 560, margin: '0 auto 24px auto' }}>
            The account for <strong>{creator.name}</strong> is now created and ready for portal access.
          </p>

          {/* Credential Email Delivery Notice Banner */}
          <div
            style={{
              maxWidth: 640,
              margin: '0 auto 24px auto',
              padding: '14px 18px',
              borderRadius: 8,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left'
            }}
          >
            <Mail size={20} style={{ color: '#059669', flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem', color: '#065F46', fontWeight: 600 }}>
              Login credentials (User ID and initial password) have been automatically dispatched to <strong>{creator.email}</strong>.
            </div>
          </div>

          {/* Credentials Display Card */}
          <div
            style={{
              background: '#F8F8F8',
              border: '1px solid #E2E8F0',
              borderRadius: 8,
              padding: 24,
              textAlign: 'left',
              marginBottom: 28
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={18} style={{ color: '#15171A' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#15171A' }}>
                  Account Credentials
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  CREATOR USER ID
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#15171A', background: '#FFFFFF', padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', flex: 1 }}>
                    {creator.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(creator.id, 'id')}
                    className="btn btn-outline btn-sm"
                    style={{ height: 34, padding: '0 10px' }}
                    title="Copy User ID"
                  >
                    {copiedKey === 'id' ? <Check size={14} style={{ color: '#2D2F33' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  REGISTERED EMAIL
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#15171A', background: '#FFFFFF', padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {creator.email}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(creator.email, 'email')}
                    className="btn btn-outline btn-sm"
                    style={{ height: 34, padding: '0 10px' }}
                    title="Copy Email"
                  >
                    {copiedKey === 'email' ? <Check size={14} style={{ color: '#2D2F33' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  INITIAL PASSWORD
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15171A', background: '#FFFFFF', padding: '8px 14px', borderRadius: 8, border: '1px solid #CBD5E1', flex: 1 }}>
                    {initialPassword}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(initialPassword, 'pw')}
                    className="btn btn-outline btn-sm"
                    style={{ height: 38, padding: '0 14px', fontWeight: 600 }}
                  >
                    {copiedKey === 'pw' ? <Check size={16} style={{ color: '#2D2F33' }} /> : <Copy size={16} />}
                    <span style={{ marginLeft: 6 }}>Copy Password</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Dispatch Info Note */}
            <div
              style={{
                marginTop: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <Mail size={18} style={{ color: '#059669' }} />
              <div style={{ fontSize: '0.8125rem', color: '#065F46', flex: 1 }}>
                <strong>Invitation Dispatched:</strong> An onboarding email containing portal access details and credentials was sent to <strong>{creator.email}</strong>.
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setCreatedResult(null)
                setName('')
                setEmail('')
                setPhone('')
                setNationalPhone('')
                setSpecialization('')
                setBio('')
                setOrganization('')
                setAvatar('')
                setUserId('')
                setPassword('')
                setConfirmPassword('')
                setErrors({})
                setTouched({})
              }}
              style={{ height: 44, padding: '0 24px', fontWeight: 600 }}
            >
              Provision Another Creator
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/admin/creators')}
              style={{ height: 44, padding: '0 28px', fontWeight: 700 }}
            >
              Go to Creator Management
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 0 120px 0', maxWidth: 1280, margin: '0 auto' }}>
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB & PAGE HEADER */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: 24 }}>
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8125rem',
            color: '#6B6D73',
            marginBottom: 12
          }}
        >
          <Link
            to="/admin/creators"
            style={{
              color: '#6B6D73',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#15171A')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B6D73')}
          >
            <ArrowLeft size={14} />
            <span>Creator Management</span>
          </Link>
          <ChevronRight size={14} style={{ color: '#D5D5D8' }} />
          <span style={{ color: '#15171A', fontWeight: 700 }}>Create Creator</span>
        </nav>

        <div style={{ paddingBottom: 20, borderBottom: '1px solid #E2E8F0' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#15171A',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            Create Creator Account
          </h1>
          <p style={{ color: '#6B6D73', fontSize: '0.9375rem', margin: 0 }}>
            Create and provision a new creator account for the platform.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN GRID (Form Sections + Live Preview & Checklist) */}
      {/* ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 28,
          alignItems: 'start'
        }}
      >
        {/* ========================================================================= */}
        {/* LEFT COLUMN: FORM SECTIONS */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* SECTION 1 — CREATOR PROFILE */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: 28,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#F4F4F5',
                  color: '#15171A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0 }}>
                  Section 1 — Creator Profile
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#6B6D73', margin: '2px 0 0 0' }}>
                  Instructor identity, public credentials, and academic background.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* Full Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Full Name <span style={{ color: '#2D2F33' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alex Rivera"
                  className="form-input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }))
                  }}
                  onBlur={() => handleBlur('name')}
                  style={{
                    width: '100%',
                    height: 44,
                    borderColor: touched.name && errors.name ? '#2D2F33' : '#D5D5D8'
                  }}
                  required
                />
                {touched.name && errors.name && (
                  <p style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Email Address <span style={{ color: '#2D2F33' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. creator@aivortex.com"
                  className="form-input"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                  }}
                  onBlur={() => handleBlur('email')}
                  style={{
                    width: '100%',
                    height: 44,
                    borderColor: touched.email && errors.email ? '#2D2F33' : '#D5D5D8'
                  }}
                  required
                />
                {touched.email && errors.email && (
                  <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <span>Login credentials (User ID and initial password) will be automatically sent to this email upon account creation.</span>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Country Code Selector */}
                  <div style={{ position: 'relative' }} ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                      style={{
                        height: 44,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '0 10px',
                        background: '#F8F8F8',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#15171A',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                        flexShrink: 0
                      }}
                      aria-label="Select Country Code"
                    >
                      <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{selectedCountry.flag}</span>
                      <span>{selectedCountry.dialCode}</span>
                      <ChevronDown
                        size={14}
                        style={{
                          color: '#6B6D73',
                          transition: 'transform 0.2s',
                          transform: isCountryDropdownOpen ? 'rotate(180deg)' : 'none'
                        }}
                      />
                    </button>

                    {isCountryDropdownOpen && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: 4,
                          width: 250,
                          maxHeight: 230,
                          overflowY: 'auto',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: 8,
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                          zIndex: 100,
                          padding: '6px 0'
                        }}
                      >
                        <div style={{ padding: '0 8px 6px 8px', borderBottom: '1px solid #F1F5F9' }}>
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search country or code..."
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            style={{
                              width: '100%',
                              height: 32,
                              padding: '0 8px',
                              fontSize: '0.78rem',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        {filteredCountryCodes.map((c) => (
                          <div
                            key={c.code}
                            onClick={() => handleCountryCodeChange(c.dialCode)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 12px',
                              fontSize: '0.8125rem',
                              cursor: 'pointer',
                              background: c.dialCode === selectedCountry.dialCode ? '#F4F4F5' : 'transparent',
                              color: c.dialCode === selectedCountry.dialCode ? '#15171A' : '#2D2F33',
                              fontWeight: c.dialCode === selectedCountry.dialCode ? 600 : 400
                            }}
                            onMouseEnter={(e) => {
                              if (c.dialCode !== selectedCountry.dialCode) e.currentTarget.style.background = '#F8F8F8'
                            }}
                            onMouseLeave={(e) => {
                              if (c.dialCode !== selectedCountry.dialCode) e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{c.flag}</span>
                              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.name}</span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600, marginLeft: 8 }}>
                              {c.dialCode}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* National Phone Input */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone
                      size={14}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: touched.phone && errors.phone ? '#2D2F33' : '#9B9DA3',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="tel"
                      className="form-input"
                      value={nationalPhone}
                      onChange={handleNationalPhoneChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder={selectedCountry.placeholder || '98765 00002'}
                      style={{
                        width: '100%',
                        height: 44,
                        paddingLeft: 34,
                        borderColor: touched.phone && errors.phone ? '#2D2F33' : '#D5D5D8',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                </div>

                {touched.phone && errors.phone ? (
                  <p style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.phone}
                  </p>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: '#9B9DA3', marginTop: 4, display: 'block' }}>
                    Select country code and enter a valid phone number.
                  </span>
                )}
              </div>

              {/* Professional Title / Specialization */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Professional Title / Specialization <span style={{ color: '#2D2F33' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead AI Engineer & LLM Specialist"
                  className="form-input"
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value)
                    if (errors.specialization) setErrors((prev) => ({ ...prev, specialization: null }))
                  }}
                  onBlur={() => handleBlur('specialization')}
                  style={{
                    width: '100%',
                    height: 44,
                    borderColor: touched.specialization && errors.specialization ? '#2D2F33' : '#D5D5D8'
                  }}
                  required
                />
                {touched.specialization && errors.specialization && (
                  <p style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.specialization}
                  </p>
                )}
              </div>

              {/* Organization / Affiliation */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Organization / Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aivortex AI Research Labs"
                  className="form-input"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  style={{ width: '100%', height: 44 }}
                />
              </div>

              {/* Profile Photo Upload & URL */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Profile Photo
                </label>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 8 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#F2F2F2',
                      color: '#2D2F33',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      border: '2px solid #E2E8F0',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      getCreatorInitials(name) || <User size={22} style={{ color: '#6B6D73' }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#FFFFFF',
                          color: '#15171A',
                          border: '1px solid #CBD5E1',
                          borderRadius: 8,
                          padding: '7px 14px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F4F4F5'
                          e.currentTarget.style.borderColor = '#D5D5D8'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF'
                          e.currentTarget.style.borderColor = '#D5D5D8'
                        }}
                      >
                        <Camera size={14} />
                        <span>{avatar ? 'Change Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (!file.type.startsWith('image/')) {
                              showToast('Please select a valid image file', 'error')
                              return
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              showToast('Image size must be less than 2MB', 'error')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = (loadEvt) => {
                              setAvatar(loadEvt.target?.result || '')
                              showToast('Profile image selected', 'info')
                            }
                            reader.readAsDataURL(file)
                          }}
                        />
                      </label>

                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: '#FFFFFF',
                            color: '#15171A',
                            border: '1px solid #E4E4E7',
                            borderRadius: 8,
                            padding: '7px 12px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EFEFEF'
                            e.currentTarget.style.borderColor = '#D5D5D8'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.borderColor = '#E4E4E7'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B6D73', lineHeight: 1.4 }}>
                      Supported formats: JPG, PNG, WebP. Maximum size: 2MB. If no photo is selected, initials avatar will be displayed.
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#2D2F33' }}>
                  Biography & Background
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize academic tenure, industry leadership, or research focus..."
                  className="form-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          </section>

          {/* SECTION 2 — ACCOUNT CREDENTIALS */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: 28,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid #F1F5F9'
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#F4F4F5',
                  color: '#2D2F33',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0 }}>
                  Section 2 — Account Credentials
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#6B6D73', margin: '2px 0 0 0' }}>
                  Assign or generate Creator User ID and Password.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Creator User ID */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2D2F33', margin: 0 }}>
                    Creator User ID
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateUserId}
                    disabled={isGeneratingUserId}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isGeneratingUserId ? '#9B9DA3' : '#15171A',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: isGeneratingUserId ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <RefreshCw size={12} style={{ animation: isGeneratingUserId ? 'spin 1s linear infinite' : 'none' }} />
                    <span>{isGeneratingUserId ? 'Generating...' : 'Generate User ID'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. CR-BAN-001 or Auto-Generated"
                  className="form-input"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }))
                  }}
                  style={{ width: '100%', height: 44, fontFamily: 'monospace' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#6B6D73', marginTop: 4, marginBottom: 0 }}>
                  Leave blank to auto-generate sequentially (e.g. CR-BAN-001), or specify a custom identifier.
                </p>
                {errors.userId && (
                  <p style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4 }}>
                    {errors.userId}
                  </p>
                )}
              </div>

              {/* Password * */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2D2F33', margin: 0 }}>
                    Password <span style={{ color: '#2D2F33' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#15171A',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Generate Password</span>
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter or generate initial password"
                    className="form-input"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => {
                      const val = e.target.value
                      setPassword(val)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                      if (confirmPassword && val !== confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
                      } else if (confirmPassword && val === confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: null }))
                      }
                    }}
                    onBlur={() => handleBlur('password')}
                    style={{
                      width: '100%',
                      height: 44,
                      paddingRight: 40,
                      borderColor: touched.password && errors.password ? '#2D2F33' : '#D5D5D8',
                      fontFamily: showPassword ? 'monospace' : 'inherit'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6B6D73',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 3, fontWeight: 600 }}>
                      <span style={{ color: '#6B6D73' }}>Password Strength:</span>
                      <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                    <div style={{ height: 4, width: '100%', background: '#E4E4E7', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${passwordStrength.score}%`,
                          background: passwordStrength.color,
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                <p style={{ fontSize: '0.75rem', color: '#6B6D73', marginTop: 6, marginBottom: 0 }}>
                  Minimum 8 characters. Treated as the creator's initial account password.
                </p>
                {touched.password && errors.password && (
                  <p style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password * */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2D2F33', margin: 0 }}>
                    Confirm Password <span style={{ color: '#2D2F33' }}>*</span>
                  </label>
                  {password && confirmPassword && password === confirmPassword && (
                    <span style={{ color: '#2D2F33', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={13} /> Passwords match
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter initial password"
                    className="form-input"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => {
                      const val = e.target.value
                      setConfirmPassword(val)
                      if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }))
                      if (password && val !== password) {
                        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }))
                      } else if (password && val === password) {
                        setErrors((prev) => ({ ...prev, confirmPassword: null }))
                      }
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    style={{
                      width: '100%',
                      height: 44,
                      paddingRight: 40,
                      borderColor: touched.confirmPassword && errors.confirmPassword ? '#2D2F33' : '#D5D5D8',
                      fontFamily: showConfirmPassword ? 'monospace' : 'inherit'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6B6D73',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#6B6D73', marginTop: 6, marginBottom: 0 }}>
                  Re-enter initial password to verify match.
                </p>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </section>
        </form>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PREVIEW CARD & PROVISIONING CHECKLIST */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'sticky', top: 24 }}>
          {/* Live Preview Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6B6D73', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
              Profile Card Preview
            </h3>

            <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: '#F2F2F2',
                  color: '#2D2F33',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  margin: '0 auto 12px auto',
                  border: '3px solid #E4E4E7',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
                  overflow: 'hidden'
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Instructor"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  getCreatorInitials(name) || <User size={28} style={{ color: '#6B6D73' }} />
                )}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15171A', margin: '0 0 4px 0' }}>
                {name.trim() || 'Dr. Instructor Name'}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#15171A', fontWeight: 600, margin: '0 0 10px 0' }}>
                {specialization.trim() || 'Specialization / Faculty Role'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#F2F2F2',
                    color: '#5A5C62',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'monospace'
                  }}
                >
                  ID: {userId.trim() || 'AUTO-ASSIGN'}
                </span>
              </div>
            </div>

            <div style={{ paddingTop: 16, fontSize: '0.8125rem', color: '#5A5C62', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <span style={{ color: '#9B9DA3', fontSize: '0.75rem', display: 'block' }}>Email:</span>
                <span style={{ fontWeight: 600, color: '#15171A' }}>{email.trim() || 'instructor@aivortex.com'}</span>
              </div>
              {organization && (
                <div>
                  <span style={{ color: '#9B9DA3', fontSize: '0.75rem', display: 'block' }}>Affiliation:</span>
                  <span style={{ fontWeight: 600, color: '#15171A' }}>{organization.trim()}</span>
                </div>
              )}
              {bio && (
                <div>
                  <span style={{ color: '#9B9DA3', fontSize: '0.75rem', display: 'block' }}>Bio:</span>
                  <p style={{ margin: '2px 0 0 0', lineHeight: 1.4, color: '#6B6D73' }}>{bio.trim()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Provisioning Checklist */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15171A', margin: '0 0 14px 0' }}>
              Provisioning Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {name.trim() ? <CheckCircle2 size={16} style={{ color: '#2D2F33' }} /> : <AlertCircle size={16} style={{ color: '#D5D5D8' }} />}
                <span style={{ color: name.trim() ? '#15171A' : '#6B6D73', fontWeight: name.trim() ? 600 : 400 }}>
                  Instructor name provided
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {email.trim() && !errors.email ? <CheckCircle2 size={16} style={{ color: '#2D2F33' }} /> : <AlertCircle size={16} style={{ color: '#D5D5D8' }} />}
                <span style={{ color: email.trim() ? '#15171A' : '#6B6D73', fontWeight: email.trim() ? 600 : 400 }}>
                  Valid institutional email
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {specialization.trim() ? <CheckCircle2 size={16} style={{ color: '#2D2F33' }} /> : <AlertCircle size={16} style={{ color: '#D5D5D8' }} />}
                <span style={{ color: specialization.trim() ? '#15171A' : '#6B6D73', fontWeight: specialization.trim() ? 600 : 400 }}>
                  Specialization & faculty title
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {userId.trim() ? <CheckCircle2 size={16} style={{ color: '#2D2F33' }} /> : <CheckCircle2 size={16} style={{ color: '#9B9DA3' }} />}
                <span style={{ color: '#15171A', fontWeight: 600 }}>
                  {userId.trim() ? `User ID: ${userId.trim()}` : 'User ID: Auto Sequential'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {password.trim() && confirmPassword.trim() && password === confirmPassword ? (
                  <CheckCircle2 size={16} style={{ color: '#2D2F33' }} />
                ) : (
                  <AlertCircle size={16} style={{ color: '#D5D5D8' }} />
                )}
                <span style={{ color: password.trim() ? '#15171A' : '#6B6D73', fontWeight: password.trim() ? 600 : 400 }}>
                  {password.trim() && confirmPassword.trim() && password === confirmPassword
                    ? 'Initial password configured & confirmed'
                    : (password.trim() ? 'Password confirmation required' : 'Initial password required')}
                </span>
              </div>


              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: '#10B981' }} />
                <span style={{ color: '#15171A', fontWeight: 600 }}>
                  Automatic credential delivery to registered email
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STICKY BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      <div className="admin-sticky-action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8125rem', color: '#6B6D73' }}>
            Complete the profile and credentials to create the creator account.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/admin/creators')}
            disabled={isSubmitting}
            style={{ height: 42, padding: '0 20px', fontWeight: 600 }}
          >
            Cancel
          </button>

          <button
            type="button"
            id="btn-create-activate-creator"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              height: 42,
              padding: '0 26px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <UserCheck size={16} />
            <span>{isSubmitting ? 'Creating Creator...' : 'Create Creator'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

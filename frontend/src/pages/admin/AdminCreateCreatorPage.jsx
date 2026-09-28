import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
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
  ExternalLink
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'

const AVATAR_PRESETS = [
  { label: 'Dr. Rivera (AI Lead)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Prof. Chen (ML)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Dr. Sarah (Data Science)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { label: 'Marcus (DevOps)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' }
]

export default function AdminCreateCreatorPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Section 1: Profile State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0].url)
  const [specialization, setSpecialization] = useState('')
  const [bio, setBio] = useState('')
  const [organization, setOrganization] = useState('')

  // Section 2: Credentials State
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Section 3: Status State
  const [status, setStatus] = useState('ACTIVE')

  // Section 4: Delivery State
  const [sendEmail, setSendEmail] = useState(true)

  // UI & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [copiedKey, setCopiedKey] = useState(null)
  const [createdResult, setCreatedResult] = useState(null)

  // Auto-generate unique Creator User ID
  const handleGenerateUserId = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const prefix = name.trim()
      ? name.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase()
      : 'FAC'
    const generated = `CR-${prefix}-${randomSuffix}`
    setUserId(generated)
    if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }))
  }

  // Auto-generate strong temporary password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let rand = ''
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const specialChars = '!@#$%^&*'
    const spec = specialChars.charAt(Math.floor(Math.random() * specialChars.length))
    const generated = `Apex${rand}${spec}${Math.floor(10 + Math.random() * 90)}`
    setPassword(generated)
    setShowPassword(true)
    if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
  }

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', color: '#94A3B8' }
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { score: 25, label: 'Weak', color: '#EF4444' }
    if (score === 3) return { score: 50, label: 'Moderate', color: '#F59E0B' }
    if (score === 4) return { score: 75, label: 'Strong', color: '#10B981' }
    return { score: 100, label: 'Excellent', color: '#059669' }
  }, [password])

  // Validation
  const validateForm = () => {
    const errs = {}
    if (!name.trim()) errs.name = 'Full name is required'
    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address'
      }
    }
    if (!specialization.trim()) {
      errs.specialization = 'Professional title or specialization is required'
    }
    if (password && password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
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

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setTouched({
        name: true,
        email: true,
        specialization: true,
        password: true
      })
      showToast('Please correct the highlighted form errors before proceeding.', 'error')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        avatar: avatar ? avatar.trim() : null,
        specialization: specialization.trim(),
        bio: bio ? bio.trim() : null,
        organization: organization ? organization.trim() : null,
        userId: userId ? userId.trim() : null,
        password: password ? password.trim() : null,
        status,
        sendEmail
      }

      const res = await api.admin.createCreator(payload)

      if (res.data) {
        setCreatedResult({
          creator: res.data.creator,
          tempPassword: res.data.tempPasswordGenerated || password || 'ApexCreator2026!',
          emailStatus: res.data.emailStatus
        })
        showToast(res.message || 'Creator account provisioned successfully', 'success')
      }
    } catch (err) {
      const msg = err.message || 'Unable to provision creator account. Please try again.'
      showToast(msg, 'error')
      if (msg.toLowerCase().includes('email')) {
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
    const { creator, tempPassword, emailStatus } = createdResult
    return (
      <div style={{ maxWidth: 840, margin: '20px auto 120px auto', padding: '0 20px' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #E2E8F0',
            padding: 40,
            boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
            Creator Account Provisioned!
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', maxWidth: 560, margin: '0 auto 28px auto' }}>
            The curriculum faculty account for <strong>{creator.name}</strong> has been initialized and activated on the platform.
          </p>

          {/* Credentials Display Card */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: 24,
              textAlign: 'left',
              marginBottom: 28
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={18} style={{ color: '#2563EB' }} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                  Onboarding Credentials
                </span>
              </div>
              <span
                style={{
                  background: creator.status === 'ACTIVE' ? '#DCFCE7' : '#FEF3C7',
                  color: creator.status === 'ACTIVE' ? '#166534' : '#92400E',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20
                }}
              >
                STATUS: {creator.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  CREATOR USER ID
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', background: '#FFFFFF', padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', flex: 1 }}>
                    {creator.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(creator.id, 'id')}
                    className="btn btn-outline btn-sm"
                    style={{ height: 34, padding: '0 10px' }}
                  >
                    {copiedKey === 'id' ? <Check size={14} style={{ color: '#16A34A' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  REGISTERED EMAIL
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', background: '#FFFFFF', padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {creator.email}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(creator.email, 'email')}
                    className="btn btn-outline btn-sm"
                    style={{ height: 34, padding: '0 10px' }}
                  >
                    {copiedKey === 'email' ? <Check size={14} style={{ color: '#16A34A' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  INITIAL TEMPORARY PASSWORD
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <code style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563EB', background: '#FFFFFF', padding: '8px 14px', borderRadius: 8, border: '1px solid #CBD5E1', flex: 1 }}>
                    {tempPassword}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(tempPassword, 'pw')}
                    className="btn btn-outline btn-sm"
                    style={{ height: 38, padding: '0 14px', fontWeight: 600 }}
                  >
                    {copiedKey === 'pw' ? <Check size={16} style={{ color: '#16A34A' }} /> : <Copy size={16} />}
                    <span style={{ marginLeft: 6 }}>Copy Password</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email Dispatch Info */}
            <div
              style={{
                marginTop: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: emailStatus?.sent ? '#EFF6FF' : '#FFFBEB',
                border: `1px solid ${emailStatus?.sent ? '#BFDBFE' : '#FDE68A'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}
            >
              <Mail size={18} style={{ color: emailStatus?.sent ? '#2563EB' : '#D97706' }} />
              <div style={{ fontSize: '0.8125rem', color: '#1E293B', flex: 1 }}>
                {emailStatus?.sent ? (
                  <span>
                    <strong>Invitation Dispatched:</strong> An onboarding email containing portal access details and these temporary credentials was sent to <strong>{creator.email}</strong>.
                  </span>
                ) : (
                  <span>
                    <strong>Email Delivery Notice:</strong> Account created successfully. Credentials were logged locally; please share the temporary credentials with the instructor directly.
                  </span>
                )}
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
                setSpecialization('')
                setBio('')
                setOrganization('')
                setUserId('')
                setPassword('')
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
              Go to Creator Directory
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
            color: '#64748B',
            marginBottom: 12
          }}
        >
          <Link
            to="/admin/creators"
            style={{
              color: '#64748B',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            <ArrowLeft size={14} />
            <span>Creator Management</span>
          </Link>
          <ChevronRight size={14} style={{ color: '#CBD5E1' }} />
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Create Creator</span>
        </nav>

        <div style={{ paddingBottom: 20, borderBottom: '1px solid #E2E8F0' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            Create Creator Account
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>
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
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
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
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 28,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
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
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 1 — Creator Profile
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Instructor identity, public credentials, and academic background.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {/* Full Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
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
                    borderColor: touched.name && errors.name ? '#EF4444' : '#CBD5E1'
                  }}
                  required
                />
                {touched.name && errors.name && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
                  Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. creator@apexlearn.edu"
                  className="form-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
                  }}
                  onBlur={() => handleBlur('email')}
                  style={{
                    width: '100%',
                    height: 44,
                    borderColor: touched.email && errors.email ? '#EF4444' : '#CBD5E1'
                  }}
                  required
                />
                {touched.email && errors.email && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 00002"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', height: 44 }}
                />
              </div>

              {/* Professional Title / Specialization */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
                  Professional Title / Specialization <span style={{ color: '#EF4444' }}>*</span>
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
                    borderColor: touched.specialization && errors.specialization ? '#EF4444' : '#CBD5E1'
                  }}
                  required
                />
                {touched.specialization && errors.specialization && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.specialization}
                  </p>
                )}
              </div>

              {/* Organization / Affiliation */}
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
                  Organization / Affiliation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex AI Research Labs"
                  className="form-input"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  style={{ width: '100%', height: 44 }}
                />
              </div>

              {/* Profile Photo URL & Presets */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
                  Profile Photo URL
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt="Avatar Preview"
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }}
                  />
                  <input
                    type="url"
                    placeholder="https://..."
                    className="form-input"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    style={{ flex: 1, height: 44 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', alignSelf: 'center', fontWeight: 600 }}>Presets:</span>
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      style={{
                        background: avatar === p.url ? '#EFF6FF' : '#F8FAFC',
                        border: `1px solid ${avatar === p.url ? '#2563EB' : '#E2E8F0'}`,
                        color: avatar === p.url ? '#2563EB' : '#475569',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 6, color: '#1E293B' }}>
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
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 28,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
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
                  background: '#F0FDF4',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 2 — Account Credentials
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Assign or generate system identifiers and secure initial access credentials.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Creator User ID */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', margin: 0 }}>
                    Creator User ID
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateUserId}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Generate User ID</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. CR-001 or Auto-Generated"
                  className="form-input"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    if (errors.userId) setErrors((prev) => ({ ...prev, userId: null }))
                  }}
                  style={{ width: '100%', height: 44, fontFamily: 'monospace' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
                  Leave blank to auto-generate a system UUID, or specify a custom identifier (e.g. CR-001).
                </p>
                {errors.userId && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4 }}>
                    {errors.userId}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', margin: 0 }}>
                    Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Sparkles size={12} />
                    <span>Generate Secure Password</span>
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter or generate initial password"
                    className="form-input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }))
                    }}
                    style={{
                      width: '100%',
                      height: 44,
                      paddingRight: 40,
                      borderColor: touched.password && errors.password ? '#EF4444' : '#CBD5E1',
                      fontFamily: showPassword ? 'monospace' : 'inherit'
                    }}
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
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: 3, fontWeight: 600 }}>
                      <span style={{ color: '#64748B' }}>Password Strength:</span>
                      <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                    <div style={{ height: 4, width: '100%', background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
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

                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 6 }}>
                  Passwords are encrypted using bcrypt salt hashing before storage in PostgreSQL.
                </p>
                {touched.password && errors.password && (
                  <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4 }}>
                    {errors.password}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 3 — ACCOUNT STATUS */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 28,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
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
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 3 — Account Status
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Determine initial login authorization and portal access rights.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div
                onClick={() => setStatus('ACTIVE')}
                style={{
                  border: `2px solid ${status === 'ACTIVE' ? '#2563EB' : '#E2E8F0'}`,
                  background: status === 'ACTIVE' ? '#EFF6FF' : '#FFFFFF',
                  borderRadius: 12,
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <input
                    type="radio"
                    checked={status === 'ACTIVE'}
                    onChange={() => setStatus('ACTIVE')}
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    Active (Recommended)
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, paddingLeft: 24 }}>
                  Account is immediately activated. The instructor can log in to Creator Studio and build curriculum right away.
                </p>
              </div>

              <div
                onClick={() => setStatus('INACTIVE')}
                style={{
                  border: `2px solid ${status === 'INACTIVE' ? '#D97706' : '#E2E8F0'}`,
                  background: status === 'INACTIVE' ? '#FFFBEB' : '#FFFFFF',
                  borderRadius: 12,
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <input
                    type="radio"
                    checked={status === 'INACTIVE'}
                    onChange={() => setStatus('INACTIVE')}
                    style={{ accentColor: '#D97706' }}
                  />
                  <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                    Inactive (Hold Access)
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, paddingLeft: 24 }}>
                  Account profile is provisioned in advance, but portal login access is blocked until manually activated by Admin.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4 — CREDENTIAL DELIVERY */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 28,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
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
                  background: '#F3E8FF',
                  color: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mail size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 4 — Credential Delivery
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '2px 0 0 0' }}>
                  Dispatch onboarding instructions and credentials to the instructor.
                </p>
              </div>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                padding: 18
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#1E293B',
                  fontSize: '0.9rem'
                }}
              >
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    marginTop: 2,
                    accentColor: '#2563EB',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    Send account credentials via email
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: 400 }}>
                    Recipient: <strong>{email.trim() || 'Creator’s registered email address'}</strong>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '4px 0 0 0', fontWeight: 400 }}>
                    Includes temporary password, studio access link, and curriculum guidelines.
                  </p>
                </div>
              </label>
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
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
              Profile Card Preview
            </h3>

            <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
              <img
                src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt="Instructor"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 12px auto',
                  border: '3px solid #EFF6FF',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }}
              />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                {name.trim() || 'Dr. Instructor Name'}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 600, margin: '0 0 10px 0' }}>
                {specialization.trim() || 'Specialization / Faculty Role'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#F1F5F9',
                    color: '#475569',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'monospace'
                  }}
                >
                  ID: {userId.trim() || 'AUTO-ASSIGN'}
                </span>
                <span
                  style={{
                    background: status === 'ACTIVE' ? '#DCFCE7' : '#FEF3C7',
                    color: status === 'ACTIVE' ? '#166534' : '#92400E',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {status}
                </span>
              </div>
            </div>

            <div style={{ paddingTop: 16, fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Email:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{email.trim() || 'instructor@apexlearn.edu'}</span>
              </div>
              {organization && (
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Affiliation:</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{organization.trim()}</span>
                </div>
              )}
              {bio && (
                <div>
                  <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Bio:</span>
                  <p style={{ margin: '2px 0 0 0', lineHeight: 1.4, color: '#64748B' }}>{bio.trim()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Provisioning Checklist */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: 24,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
            }}
          >
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0' }}>
              Provisioning Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {name.trim() ? <CheckCircle2 size={16} style={{ color: '#16A34A' }} /> : <AlertCircle size={16} style={{ color: '#CBD5E1' }} />}
                <span style={{ color: name.trim() ? '#0F172A' : '#64748B', fontWeight: name.trim() ? 600 : 400 }}>
                  Instructor name provided
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {email.trim() && !errors.email ? <CheckCircle2 size={16} style={{ color: '#16A34A' }} /> : <AlertCircle size={16} style={{ color: '#CBD5E1' }} />}
                <span style={{ color: email.trim() ? '#0F172A' : '#64748B', fontWeight: email.trim() ? 600 : 400 }}>
                  Valid institutional email
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {specialization.trim() ? <CheckCircle2 size={16} style={{ color: '#16A34A' }} /> : <AlertCircle size={16} style={{ color: '#CBD5E1' }} />}
                <span style={{ color: specialization.trim() ? '#0F172A' : '#64748B', fontWeight: specialization.trim() ? 600 : 400 }}>
                  Specialization & faculty title
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {userId.trim() ? <CheckCircle2 size={16} style={{ color: '#16A34A' }} /> : <CheckCircle2 size={16} style={{ color: '#94A3B8' }} />}
                <span style={{ color: '#0F172A', fontWeight: 600 }}>
                  {userId.trim() ? `User ID: ${userId.trim()}` : 'System ID: Auto UUID'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {password.trim() ? <CheckCircle2 size={16} style={{ color: '#16A34A' }} /> : <CheckCircle2 size={16} style={{ color: '#94A3B8' }} />}
                <span style={{ color: '#0F172A', fontWeight: 600 }}>
                  {password.trim() ? 'Temporary password set' : 'Auto-generated temporary password'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: sendEmail ? '#2563EB' : '#94A3B8' }} />
                <span style={{ color: '#0F172A', fontWeight: 600 }}>
                  {sendEmail ? 'Email dispatch enabled' : 'Manual credential handover'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status === 'ACTIVE' ? '#10B981' : '#F59E0B'
            }}
          />
          <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>
            Provisioning Creator in {status} mode
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
            id="btn-create-creator-final"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              height: 42,
              padding: '0 26px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <span>{isSubmitting ? 'Creating Creator...' : 'Create Creator'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

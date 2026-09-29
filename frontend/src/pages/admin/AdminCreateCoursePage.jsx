import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  BookOpen,
  IndianRupee,
  Users,
  FileText,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  HelpCircle,
  Image as ImageIcon,
  Clock,
  Award,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'

export default function AdminCreateCoursePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  // Form State
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('Data Science')
  const [level, setLevel] = useState('Beginner to Intermediate')
  const [duration, setDuration] = useState('30 Hours')
  const [language, setLanguage] = useState('English')
  const [shortDescription, setShortDescription] = useState('')
  const [fullDescription, setFullDescription] = useState('')

  // Pricing & Access State
  const [price, setPrice] = useState(4999)
  const [originalPrice, setOriginalPrice] = useState(9999)
  const [isFree, setIsFree] = useState(false)
  const [accessDurationDays, setAccessDurationDays] = useState(365)
  const [certificateEnabled, setCertificateEnabled] = useState(true)

  // Faculty State
  const [creatorId, setCreatorId] = useState('')
  const [creators, setCreators] = useState([])
  const [loadingCreators, setLoadingCreators] = useState(false)

  // Media & Metadata State
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  )
  const [badge, setBadge] = useState('Bestseller')
  const [isFeatured, setIsFeatured] = useState(false)

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingAction, setSubmittingAction] = useState(null) // 'DRAFT' | 'PUBLISHED'
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Fetch available faculty instructors from PostgreSQL
  useEffect(() => {
    let isMounted = true
    const loadCreators = async () => {
      try {
        setLoadingCreators(true)
        const res = await api.admin.getCreators()
        if (isMounted && res.data?.creators) {
          setCreators(res.data.creators)
        }
      } catch (err) {
        console.warn('Could not load creators list:', err.message)
      } finally {
        if (isMounted) setLoadingCreators(false)
      }
    }
    loadCreators()
    return () => {
      isMounted = false
    }
  }, [])

  // Auto-generate URL slug when title changes (if slug not manually edited)
  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)
    if (!touched.slug || !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generated)
    }
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: null }))
    }
  }

  // Calculate dynamic discount percentage
  const discountPercent = useMemo(() => {
    if (isFree) return 100
    const orig = Number(originalPrice) || 0
    const cur = Number(price) || 0
    if (orig <= 0 || cur >= orig) return 0
    return Math.round(((orig - cur) / orig) * 100)
  }, [isFree, price, originalPrice])

  // Find currently selected instructor details
  const selectedCreator = useMemo(() => {
    return creators.find((c) => c.id === creatorId) || null
  }, [creators, creatorId])

  // Form Validation
  const validateForm = () => {
    const errs = {}
    if (!title.trim()) {
      errs.title = 'Course title is required'
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters'
    }

    if (!shortDescription.trim()) {
      errs.shortDescription = 'Short description is required for catalog preview'
    } else if (shortDescription.trim().length < 15) {
      errs.shortDescription = 'Short description should be at least 15 characters'
    }

    if (!isFree) {
      if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
        errs.price = 'Offer price must be a valid non-negative amount'
      }
      if (originalPrice !== '' && Number(originalPrice) < Number(price)) {
        errs.originalPrice = 'Original price cannot be lower than the offer price'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Form Submission (Draft vs Publish)
  const handleSubmit = async (targetStatus = 'PUBLISHED') => {
    if (!validateForm()) {
      showToast('Please check the required fields highlighted in red.', 'error')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSubmittingAction(targetStatus)
    setIsSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        category,
        level,
        duration: duration.trim() || '30 Hours',
        language: language.trim() || 'English',
        thumbnail: thumbnail.trim(),
        price: isFree ? 0 : Number(price),
        originalPrice: isFree ? 0 : Number(originalPrice || price),
        discountPercent: isFree ? 100 : discountPercent,
        isFree: Boolean(isFree),
        isFeatured: Boolean(isFeatured),
        badge: badge ? badge.trim() : undefined,
        status: targetStatus,
        accessDurationDays: accessDurationDays ? Number(accessDurationDays) : null,
        certificateEnabled: Boolean(certificateEnabled),
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim() || shortDescription.trim(),
        creatorIds: creatorId ? [creatorId] : []
      }

      const res = await api.admin.createCourse(payload)
      const createdTitle = res.data?.course?.title || title.trim()

      if (targetStatus === 'PUBLISHED') {
        showToast(`Course "${createdTitle}" created and published successfully!`, 'success')
      } else {
        showToast(`Course "${createdTitle}" saved as DRAFT successfully!`, 'success')
      }

      navigate('/admin/courses')
    } catch (err) {
      showToast(err.message || 'Failed to create course. Please review the inputs.', 'error')
    } finally {
      setIsSubmitting(false)
      setSubmittingAction(null)
    }
  }

  // Thumbnail Preset Quick Options
  const thumbnailPresets = [
    {
      label: 'AI & Data Science',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Neural Networks & LLMs',
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Quantitative Finance',
      url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Cloud & Infrastructure',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
    }
  ]

  return (
    <div style={{ padding: '0 0 120px 0', maxWidth: 1380, margin: '0 auto' }}>
      {/* ========================================================================= */}
      {/* 1. BREADCRUMB & PAGE HEADER */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: 24 }}>
        {/* Breadcrumb Navigation */}
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
            to="/admin/courses"
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
            <span>Course Management</span>
          </Link>
          <ChevronRight size={14} style={{ color: '#CBD5E1' }} />
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Create Course</span>
        </nav>

        {/* Header Title */}
        <div
          style={{
            paddingBottom: 20,
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            Create New Course
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>
            Create and configure a new academic course for the platform curriculum.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN TWO-COLUMN CONTENT GRID */}
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
        {/* LEFT COLUMN: THE STRUCTURED SECTIONS */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* SECTION 1 — BASIC INFORMATION */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                <BookOpen size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 1 — Basic Information
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Core academic naming, categorization, and preview taxonomy.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Course Title (Full Width) */}
              <div className="form-field-group">
                <label
                  htmlFor="input-course-title"
                  className="form-label"
                  style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>
                    Course Title <span style={{ color: '#EF4444' }}>*</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                    {title.length}/100 characters
                  </span>
                </label>
                <input
                  id="input-course-title"
                  type="text"
                  className={`form-input ${errors.title ? 'form-input-error' : ''}`}
                  placeholder="e.g. Distributed LLM Fine-Tuning & Quantization Masterclass"
                  value={title}
                  onChange={handleTitleChange}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                  maxLength={100}
                  style={errors.title ? { borderColor: '#EF4444', background: '#FEF2F2' } : {}}
                  required
                />
                {errors.title && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#EF4444',
                      fontSize: '0.75rem',
                      marginTop: 4,
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.title}</span>
                  </div>
                )}
              </div>

              {/* URL Slug & Academic Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="form-field-group">
                  <label htmlFor="input-course-slug" className="form-label" style={{ fontWeight: 700 }}>
                    URL Slug
                  </label>
                  <input
                    id="input-course-slug"
                    type="text"
                    className="form-input"
                    placeholder="e.g. distributed-llm-fine-tuning"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value)
                      setTouched((p) => ({ ...p, slug: true }))
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                    Path identifier for public course URL. Auto-generated from title.
                  </span>
                </div>

                <div className="form-field-group">
                  <label htmlFor="select-course-category" className="form-label" style={{ fontWeight: 700 }}>
                    Academic Category
                  </label>
                  <select
                    id="select-course-category"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Data Science">Data Science</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Deep Learning">Deep Learning</option>
                    <option value="Generative AI">Generative AI</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Quantitative Finance">Quantitative Finance</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                    Assigns academic classification in platform catalog.
                  </span>
                </div>
              </div>

              {/* Level & Language & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div className="form-field-group">
                  <label htmlFor="select-course-level" className="form-label" style={{ fontWeight: 700 }}>
                    Difficulty Level
                  </label>
                  <select
                    id="select-course-level"
                    className="form-input"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Beginner to Intermediate">Beginner to Intermediate</option>
                    <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                    <option value="Advanced / Specialized">Advanced / Specialized</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label htmlFor="select-course-language" className="form-label" style={{ fontWeight: 700 }}>
                    Instruction Language
                  </label>
                  <select
                    id="select-course-language"
                    className="form-input"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bilingual (English/Hindi)">Bilingual (English/Hindi)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label htmlFor="input-course-duration" className="form-label" style={{ fontWeight: 700 }}>
                    Program Duration
                  </label>
                  <input
                    id="input-course-duration"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 32 Hours"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="form-field-group">
                <label
                  htmlFor="input-short-desc"
                  className="form-label"
                  style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>
                    Short Description <span style={{ color: '#EF4444' }}>*</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                    {shortDescription.length}/300 characters
                  </span>
                </label>
                <textarea
                  id="input-short-desc"
                  className="form-input"
                  style={{
                    minHeight: 80,
                    lineHeight: 1.5,
                    resize: 'vertical',
                    ...(errors.shortDescription ? { borderColor: '#EF4444', background: '#FEF2F2' } : {})
                  }}
                  placeholder="Summary for catalog card (1-2 clear sentences summarizing student takeaways)..."
                  value={shortDescription}
                  onChange={(e) => {
                    setShortDescription(e.target.value)
                    if (errors.shortDescription) {
                      setErrors((prev) => ({ ...prev, shortDescription: null }))
                    }
                  }}
                  maxLength={300}
                  required
                />
                {errors.shortDescription && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#EF4444',
                      fontSize: '0.75rem',
                      marginTop: 4,
                      fontWeight: 600
                    }}
                  >
                    <AlertCircle size={13} />
                    <span>{errors.shortDescription}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECTION 2 — COURSE PRICING & ACCESS */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IndianRupee size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 2 — Course Pricing & Access
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Configure tuition fees, scholarship waivers, and enrollment duration.
                </span>
              </div>
            </div>

            {/* Free Course Toggle Banner */}
            <div
              style={{
                background: isFree ? '#F0FDF4' : '#F8FAFC',
                border: '1px solid',
                borderColor: isFree ? '#BBF7D0' : '#E2E8F0',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Free Course (100% Scholarship)</span>
                  {isFree && (
                    <span
                      style={{
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        padding: '1px 8px',
                        borderRadius: 9999
                      }}
                    >
                      FREE ENROLLMENT ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>
                  When enabled, all students can enroll instantly without payment gateway verification.
                </div>
              </div>

              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: isFree ? '#059669' : '#475569'
                }}
              >
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setIsFree(checked)
                    if (checked) {
                      setErrors((prev) => ({ ...prev, price: null, originalPrice: null }))
                    }
                  }}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <span>Enable Free Course</span>
              </label>
            </div>

            {/* Pricing Fields Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 20 }}>
              {/* Offer Price */}
              <div className="form-field-group">
                <label htmlFor="input-offer-price" className="form-label" style={{ fontWeight: 700 }}>
                  Offer Price (₹) {!isFree && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748B',
                      fontWeight: 700
                    }}
                  >
                    ₹
                  </span>
                  <input
                    id="input-offer-price"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    style={{
                      paddingLeft: 30,
                      ...(isFree ? { background: '#F1F5F9', cursor: 'not-allowed', color: '#94A3B8' } : {}),
                      ...(errors.price ? { borderColor: '#EF4444', background: '#FEF2F2' } : {})
                    }}
                    value={isFree ? 0 : price}
                    onChange={(e) => {
                      setPrice(e.target.value)
                      if (errors.price) setErrors((p) => ({ ...p, price: null }))
                    }}
                    disabled={isFree}
                    placeholder="4999"
                  />
                </div>
                {errors.price && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, display: 'block', fontWeight: 600 }}>
                    {errors.price}
                  </span>
                )}
              </div>

              {/* Original Price */}
              <div className="form-field-group">
                <label htmlFor="input-orig-price" className="form-label" style={{ fontWeight: 700 }}>
                  Original Price (₹) (MRP)
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748B',
                      fontWeight: 700
                    }}
                  >
                    ₹
                  </span>
                  <input
                    id="input-orig-price"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    style={{
                      paddingLeft: 30,
                      ...(isFree ? { background: '#F1F5F9', cursor: 'not-allowed', color: '#94A3B8' } : {}),
                      ...(errors.originalPrice ? { borderColor: '#EF4444', background: '#FEF2F2' } : {})
                    }}
                    value={isFree ? 0 : originalPrice}
                    onChange={(e) => {
                      setOriginalPrice(e.target.value)
                      if (errors.originalPrice) setErrors((p) => ({ ...p, originalPrice: null }))
                    }}
                    disabled={isFree}
                    placeholder="9999"
                  />
                </div>
                {errors.originalPrice && (
                  <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: 4, display: 'block', fontWeight: 600 }}>
                    {errors.originalPrice}
                  </span>
                )}
              </div>

              {/* Access Duration */}
              <div className="form-field-group">
                <label htmlFor="input-access-days" className="form-label" style={{ fontWeight: 700 }}>
                  Access Duration (Days)
                </label>
                <input
                  id="input-access-days"
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="365 (Leave blank for lifetime)"
                  value={accessDurationDays}
                  onChange={(e) => setAccessDurationDays(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                  Default: 365 days. Set 0 for perpetual access.
                </span>
              </div>
            </div>

            {/* Dynamic Discount & Certificate Options */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
                padding: '14px 16px',
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0'
              }}
            >
              {/* Discount Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600 }}>Calculated Discount:</span>
                <span
                  style={{
                    background: discountPercent > 0 ? '#ECFDF5' : '#F1F5F9',
                    color: discountPercent > 0 ? '#059669' : '#64748B',
                    border: '1px solid',
                    borderColor: discountPercent > 0 ? '#A7F3D0' : '#E2E8F0',
                    padding: '2px 10px',
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {isFree ? '100% OFF (Free)' : discountPercent > 0 ? `${discountPercent}% OFF` : 'No Discount'}
                </span>
                {!isFree && originalPrice > price && (
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                    Students save ₹{(Number(originalPrice) - Number(price)).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Certificate Checkbox */}
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={certificateEnabled}
                  onChange={(e) => setCertificateEnabled(e.target.checked)}
                  style={{ width: 17, height: 17, cursor: 'pointer' }}
                />
                <Award size={16} style={{ color: '#2563EB' }} />
                <span>Issue Certificate upon Completion</span>
              </label>
            </div>
          </section>

          {/* SECTION 3 — FACULTY / INSTRUCTOR */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                  background: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 3 — Assign Faculty Instructor
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Designate an accredited professor or researcher leading this program.
                </span>
              </div>
            </div>

            <div className="form-field-group">
              <label htmlFor="select-course-instructor" className="form-label" style={{ fontWeight: 700 }}>
                Lead Academic Instructor
              </label>
              <select
                id="select-course-instructor"
                className="form-input"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                disabled={loadingCreators}
              >
                <option value="">-- Choose Instructor --</option>
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email}) {c.headline ? `• ${c.headline}` : ''}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                {loadingCreators
                  ? 'Loading registered faculty members...'
                  : `${creators.length} verified instructor(s) currently registered in database.`}
              </span>
            </div>

            {/* Selected Instructor Profile Snippet */}
            {selectedCreator && (
              <div
                style={{
                  marginTop: 16,
                  padding: '16px',
                  background: '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1rem',
                    flexShrink: 0
                  }}
                >
                  {selectedCreator.name ? selectedCreator.name.slice(0, 2).toUpperCase() : 'FC'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.9375rem', color: '#0F172A' }}>{selectedCreator.name}</strong>
                    <span
                      style={{
                        background: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '1px 8px',
                        borderRadius: 9999,
                        border: '1px solid #A7F3D0'
                      }}
                    >
                      Verified Faculty
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>{selectedCreator.email}</div>
                  {selectedCreator.headline && (
                    <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: 2 }}>
                      {selectedCreator.headline}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 4 — COURSE DESCRIPTION / SYLLABUS */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                <FileText size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 4 — Course Description / Syllabus
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Full curriculum breakdown, module structure, and prerequisite requirements.
                </span>
              </div>
            </div>

            <div className="form-field-group">
              <label
                htmlFor="input-full-syllabus"
                className="form-label"
                style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Full Syllabus Description</span>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Supports detailed markdown & formatted text</span>
              </label>
              <textarea
                id="input-full-syllabus"
                className="form-input"
                style={{
                  minHeight: 180,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Comprehensive syllabus overview:&#10;&#10;Module 1: Architecture & Theoretical Foundations&#10;Module 2: Practical Implementation & Lab Exercises&#10;Module 3: Optimization, Quantization & Scaling&#10;Module 4: Capstone Evaluation & Production Deployment"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                Students review this detailed breakdown on the public enrollment syllabus tab before registration.
              </span>
            </div>
          </section>

          {/* SECTION 5 — MEDIA & CATALOG DISPLAY */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                  background: '#FDF2F8',
                  color: '#DB2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Section 5 — Media & Catalog Discovery
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  Thumbnail banner, promotional catalog badge, and homepage featuring.
                </span>
              </div>
            </div>

            {/* Thumbnail URL input & quick presets */}
            <div className="form-field-group" style={{ marginBottom: 20 }}>
              <label htmlFor="input-thumbnail-url" className="form-label" style={{ fontWeight: 700 }}>
                Course Thumbnail Asset URL
              </label>
              <input
                id="input-thumbnail-url"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                style={{ marginBottom: 8 }}
              />

              {/* Quick Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Quick presets:</span>
                {thumbnailPresets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '2px 10px', fontSize: '0.75rem' }}
                    onClick={() => setThumbnail(p.url)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Badge & Featured Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
              <div className="form-field-group">
                <label htmlFor="select-course-badge" className="form-label" style={{ fontWeight: 700 }}>
                  Promotional Catalog Badge
                </label>
                <select
                  id="select-course-badge"
                  className="form-input"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                >
                  <option value="">None (Standard)</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Trending">Trending</option>
                  <option value="New Release">New Release</option>
                  <option value="Executive Masterclass">Executive Masterclass</option>
                  <option value="Highest Rated">Highest Rated</option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#F8FAFC',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  marginTop: 6
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0F172A'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <span>Feature on Homepage Hero & Top Carousels</span>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY LIVE CATALOG PREVIEW & CHECKLIST */}
        {/* ========================================================================= */}
        <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live Catalog Card Preview */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                Catalog Card Preview
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: isFree ? '#059669' : '#2563EB',
                  background: isFree ? '#ECFDF5' : '#EFF6FF',
                  padding: '1px 6px',
                  borderRadius: 4
                }}
              >
                {isFree ? 'FREE TIER' : 'PREMIUM'}
              </span>
            </div>

            {/* Thumbnail Box */}
            <div style={{ position: 'relative', width: '100%', height: 160, background: '#1E293B', overflow: 'hidden' }}>
              <img
                src={thumbnail}
                alt="Course Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                }}
              />
              {badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid #FDE68A',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {badge}
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6
                }}
              >
                {duration || '30 Hours'}
              </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}
                >
                  {category}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#64748B' }}>• {level}</span>
              </div>

              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 8px 0',
                  lineHeight: 1.3
                }}
              >
                {title || 'Untitled Academic Course'}
              </h4>

              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#64748B',
                  lineHeight: 1.4,
                  margin: '0 0 12px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {shortDescription || 'Short description preview will appear here as you type in Section 1.'}
              </p>

              {/* Faculty Name */}
              <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 12 }}>
                Instructor: <strong>{selectedCreator ? selectedCreator.name : 'Unassigned'}</strong>
              </div>

              {/* Price & Certificate Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid #F1F5F9'
                }}
              >
                <div>
                  {isFree ? (
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>FREE</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {Number(originalPrice) > Number(price) && (
                        <span style={{ fontSize: '0.8125rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                          ₹{Number(originalPrice).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {certificateEnabled && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.6875rem',
                      color: '#059669',
                      fontWeight: 700
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Certificate</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Validation Checklist Card */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0' }}>
              Publishing Readiness
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: title.trim().length >= 5 ? '#10B981' : '#CBD5E1' }} />
                <span style={{ color: title.trim().length >= 5 ? '#0F172A' : '#64748B' }}>
                  Course title defined (min. 5 chars)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2
                  size={16}
                  style={{ color: shortDescription.trim().length >= 15 ? '#10B981' : '#CBD5E1' }}
                />
                <span style={{ color: shortDescription.trim().length >= 15 ? '#0F172A' : '#64748B' }}>
                  Short description provided
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2
                  size={16}
                  style={{
                    color: isFree || (price !== '' && Number(price) >= 0) ? '#10B981' : '#CBD5E1'
                  }}
                />
                <span
                  style={{
                    color: isFree || (price !== '' && Number(price) >= 0) ? '#0F172A' : '#64748B'
                  }}
                >
                  Tuition price configured
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: creatorId ? '#10B981' : '#CBD5E1' }} />
                <span style={{ color: creatorId ? '#0F172A' : '#64748B' }}>
                  {creatorId ? 'Faculty assigned' : 'Faculty instructor assigned (optional)'}
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
              background: '#F59E0B'
            }}
          />
          <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 600 }}>
            Creating Academic Course in {submittingAction === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'} mode
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/admin/courses')}
            disabled={isSubmitting}
            style={{ height: 42, padding: '0 20px', fontWeight: 600 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            style={{
              height: 42,
              padding: '0 20px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Save size={16} />
            <span>{submittingAction === 'DRAFT' ? 'Saving Draft...' : 'Save as Draft'}</span>
          </button>
          <button
            type="button"
            id="btn-create-course-final"
            className="btn btn-primary"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
            style={{
              height: 42,
              padding: '0 24px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <span>{submittingAction === 'PUBLISHED' ? 'Creating Course...' : 'Create Course'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

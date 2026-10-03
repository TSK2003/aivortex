import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link, useParams, useSearchParams } from 'react-router-dom'
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
  ExternalLink,
  Loader2,
  Video,
  Upload,
  Trash2,
  Play,
  Film,
  X,
  UserCheck,
  Plus
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import CustomSelect from '../../components/common/CustomSelect'

export const COURSE_LANGUAGE_OPTIONS = [
  {
    value: 'English',
    label: 'English',
    sublabel: 'Course is taught in English.'
  },
  {
    value: 'Tamil',
    label: 'Tamil',
    sublabel: 'Course is taught in Tamil.'
  },
  {
    value: 'Thanglish',
    label: 'Thanglish',
    sublabel: 'Course is taught using Tamil written in English/Tamil-English mixed style.'
  },
  {
    value: 'Hindi',
    label: 'Hindi',
    sublabel: 'Course is taught in Hindi.'
  },
  {
    value: 'Bilingual (English/Tamil)',
    label: 'Bilingual (English/Tamil)',
    sublabel: 'Course uses both English and Tamil.'
  },
  {
    value: 'Bilingual (English/Hindi)',
    label: 'Bilingual (English/Hindi)',
    sublabel: 'Course uses both English and Hindi.'
  },
  {
    value: 'Bilingual (Tamil/Thanglish)',
    label: 'Bilingual (Tamil/Thanglish)',
    sublabel: 'Course uses both Tamil and Thanglish.'
  },
  {
    value: 'Multilingual',
    label: 'Multilingual',
    sublabel: 'Course uses more than two supported languages.'
  }
]

export const COURSE_LANGUAGE_MAP = COURSE_LANGUAGE_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.sublabel
  return acc
}, {})

export default function AdminCreateCoursePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { courseId: routeCourseId } = useParams()
  const [searchParams] = useSearchParams()
  const editCourseId = routeCourseId || searchParams.get('id') || searchParams.get('edit')
  const isEditMode = Boolean(editCourseId)
  const [isLoadingCourse, setIsLoadingCourse] = useState(false)

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

  // Faculty State (Optional Multi-Select)
  const [selectedCreatorIds, setSelectedCreatorIds] = useState([])
  const [creators, setCreators] = useState([])
  const [loadingCreators, setLoadingCreators] = useState(false)

  // Media & Metadata State
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  )
  const [thumbnailStatus, setThumbnailStatus] = useState('loading') // 'idle' | 'loading' | 'loaded' | 'error'
  const [thumbnailError, setThumbnailError] = useState(null)
  const [previewVideoUrl, setPreviewVideoUrl] = useState('')
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoDuration, setVideoDuration] = useState(null)
  const [videoError, setVideoError] = useState(null)
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

  // Load existing course data if editing
  useEffect(() => {
    if (!editCourseId) return
    let isMounted = true
    const loadCourseData = async () => {
      try {
        setIsLoadingCourse(true)
        const res = await api.admin.getCourses()
        const found = res.data?.courses?.find((c) => c.id === editCourseId || c.slug === editCourseId)
        if (found && isMounted) {
          setTitle(found.title || '')
          setSlug(found.slug || '')
          setCategory(found.category || 'Data Science')
          setLevel(found.level || 'Beginner to Intermediate')
          setDuration(found.duration || '30 Hours')
          setLanguage(found.language || 'English')
          setShortDescription(found.shortDescription || '')
          setFullDescription(found.fullDescription || '')
          setPrice(found.price ?? 4999)
          setOriginalPrice(found.originalPrice ?? 9999)
          setIsFree(Boolean(found.isFree))
          setAccessDurationDays(found.accessDurationDays || 365)
          setCertificateEnabled(found.certificateEnabled !== false)
          setThumbnail(found.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80')
          setPreviewVideoUrl(found.previewVideoUrl || found.demoVideoUrl || '')
          setBadge(found.badge || 'Bestseller')
          setIsFeatured(Boolean(found.isFeatured))
          if (found.creators && found.creators.length > 0) {
            const ids = found.creators.map((c) => c.creatorId || c.creator?.id || c.id).filter(Boolean)
            setSelectedCreatorIds(ids)
          } else {
            setSelectedCreatorIds([])
          }
        }
      } catch (err) {
        console.warn('Could not load course for editing:', err.message)
      } finally {
        if (isMounted) setIsLoadingCourse(false)
      }
    }
    loadCourseData()
    return () => {
      isMounted = false
    }
  }, [editCourseId])

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

  // Find currently selected instructors details
  const selectedCreatorsList = useMemo(() => {
    return creators.filter((c) => selectedCreatorIds.includes(c.id))
  }, [creators, selectedCreatorIds])

  const handleToggleCreator = (cId) => {
    if (!cId) return
    setSelectedCreatorIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    )
  }

  const handleRemoveCreator = (cId) => {
    setSelectedCreatorIds((prev) => prev.filter((id) => id !== cId))
  }

  const handleSelectAllCreators = () => {
    setSelectedCreatorIds(creators.map((c) => c.id))
  }

  const handleClearCreators = () => {
    setSelectedCreatorIds([])
  }

  // Helper to validate thumbnail URL format
  const validateThumbnailUrl = (url) => {
    if (!url || !url.trim()) return null
    const trimmed = url.trim()
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/api/media/')) return null
    if (!/^https:\/\//i.test(trimmed)) {
      return 'Please enter a valid HTTPS image URL or upload an image.'
    }
    try {
      const parsed = new URL(trimmed)
      if (parsed.protocol !== 'https:' || !parsed.hostname || !parsed.hostname.includes('.')) {
        return 'Please enter a valid HTTPS image URL.'
      }
      return null
    } catch {
      return 'Please enter a valid HTTPS image URL.'
    }
  }

  // Handle Thumbnail File Upload
  const handleThumbnailUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, or WebP).', 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit.', 'error')
      return
    }

    setIsUploadingThumbnail(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64Data = reader.result
        const res = await api.admin.uploadMedia({
          imageBase64: base64Data,
          folder: 'courses',
          fileName: file.name
        })
        if (res?.data?.url) {
          setThumbnail(res.data.url)
          setThumbnailStatus('loaded')
          setThumbnailError(null)
          if (errors.thumbnail) {
            setErrors((prev) => ({ ...prev, thumbnail: undefined }))
          }
          showToast('Course thumbnail uploaded successfully!', 'success')
        }
      } catch (err) {
        showToast(err.message || 'Failed to upload thumbnail.', 'error')
      } finally {
        setIsUploadingThumbnail(false)
      }
    }
    reader.readAsDataURL(file)
  }

  // Handle Preview Video File Upload
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['video/mp4', 'video/webm']
    const isMp4OrWebm = validTypes.includes(file.type) || file.name.endsWith('.mp4') || file.name.endsWith('.webm')

    if (!isMp4OrWebm) {
      showToast('Only MP4 and WebM formats are supported for Course Preview Video.', 'error')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('Video size exceeds 50MB limit. Please upload a short preview video (15–60s).', 'error')
      return
    }

    // Client-side duration detection using HTML5 video
    const tempUrl = URL.createObjectURL(file)
    const tempVideo = document.createElement('video')
    tempVideo.preload = 'metadata'
    tempVideo.src = tempUrl
    tempVideo.onloadedmetadata = () => {
      URL.revokeObjectURL(tempUrl)
      const durationSecs = Math.round(tempVideo.duration)
      setVideoDuration(durationSecs)
      if (durationSecs > 90) {
        showToast(`Video duration is ${durationSecs}s. Recommended duration is 15s to 60s for card preview.`, 'warning')
      }
    }

    setIsUploadingVideo(true)
    setVideoError(null)

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64Data = reader.result
        const res = await api.admin.uploadMedia({
          videoBase64: base64Data,
          folder: 'courses',
          fileName: file.name
        })
        if (res?.data?.url) {
          setPreviewVideoUrl(res.data.url)
          showToast('Course Preview Video uploaded successfully!', 'success')
        }
      } catch (err) {
        setVideoError(err.message || 'Failed to upload preview video.')
        showToast(err.message || 'Failed to upload preview video.', 'error')
      } finally {
        setIsUploadingVideo(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveThumbnail = () => {
    setThumbnail('')
    setThumbnailStatus('idle')
    setThumbnailError(null)
    showToast('Course thumbnail removed.', 'info')
  }

  const handleRemoveVideo = () => {
    setPreviewVideoUrl('')
    setVideoDuration(null)
    setVideoError(null)
    showToast('Course Preview Video removed.', 'info')
  }

  // Pre-load and verify thumbnail image URL
  useEffect(() => {
    const trimmed = thumbnail?.trim()
    if (!trimmed) {
      setThumbnailStatus('idle')
      setThumbnailError(null)
      return
    }

    const formatErr = validateThumbnailUrl(trimmed)
    if (formatErr) {
      setThumbnailStatus('error')
      setThumbnailError(formatErr)
      return
    }

    setThumbnailStatus('loading')
    setThumbnailError(null)

    let isMounted = true
    const img = new Image()

    img.onload = () => {
      if (isMounted) {
        setThumbnailStatus('loaded')
        setThumbnailError(null)
      }
    }

    img.onerror = () => {
      if (isMounted) {
        setThumbnailStatus('error')
        setThumbnailError('Unable to load this image. Please check the URL or use another image.')
      }
    }

    img.src = trimmed

    return () => {
      isMounted = false
      img.onload = null
      img.onerror = null
    }
  }, [thumbnail])

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

    if (thumbnail && thumbnail.trim()) {
      const thumbErr = validateThumbnailUrl(thumbnail)
      if (thumbErr) {
        errs.thumbnail = thumbErr
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
        previewVideoUrl: previewVideoUrl ? previewVideoUrl.trim() : null,
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
        creatorIds: selectedCreatorIds
      }

      if (isEditMode) {
        await api.admin.updateCourse(editCourseId, payload)
        showToast(`Course "${payload.title}" updated successfully!`, 'success')
      } else {
        const res = await api.admin.createCourse(payload)
        const createdTitle = res.data?.course?.title || title.trim()

        if (targetStatus === 'PUBLISHED') {
          showToast(`Course "${createdTitle}" created and published successfully!`, 'success')
        } else {
          showToast(`Course "${createdTitle}" saved as DRAFT successfully!`, 'success')
        }
      }

      navigate('/admin/courses')
    } catch (err) {
      showToast(err.message || 'Failed to save course. Please review the inputs.', 'error')
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
            color: '#6B6D73',
            marginBottom: 12
          }}
        >
          <Link
            to="/admin/courses"
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
            <span>Course Management</span>
          </Link>
          <ChevronRight size={14} style={{ color: '#D5D5D8' }} />
          <span style={{ color: '#15171A', fontWeight: 700 }}>
            {isEditMode ? 'Edit Course' : 'Create Course'}
          </span>
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
              color: '#15171A',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            {isEditMode ? 'Edit Academic Course' : 'Create New Course'}
          </h1>
          <p style={{ color: '#6B6D73', fontSize: '0.9375rem', margin: 0 }}>
            {isEditMode
              ? 'Update curriculum parameters, instruction language, pricing tiers, and assigned faculty instructors.'
              : 'Create and configure a new academic course for the platform curriculum.'}
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
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                <BookOpen size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0 }}>
                  Section 1 — Basic Information
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#6B6D73' }}>
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
                    Course Title <span style={{ color: '#2D2F33' }}>*</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 500 }}>
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
                  style={errors.title ? { borderColor: '#2D2F33', background: '#EFEFEF' } : {}}
                  required
                />
                {errors.title && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#2D2F33',
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
                  <span style={{ fontSize: '0.75rem', color: '#9B9DA3', marginTop: 4, display: 'block' }}>
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
                  <span style={{ fontSize: '0.75rem', color: '#9B9DA3', marginTop: 4, display: 'block' }}>
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
                  <label htmlFor="select-course-language" className="form-label" style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    Instruction Language
                  </label>
                  <CustomSelect
                    id="select-course-language"
                    options={COURSE_LANGUAGE_OPTIONS}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    buttonStyle={{
                      height: 42,
                      borderRadius: 8,
                      borderColor: '#D5D5D8',
                      fontSize: '0.875rem'
                    }}
                    menuStyle={{
                      minWidth: '100%',
                      width: '100%',
                      maxWidth: '380px'
                    }}
                  />
                  {COURSE_LANGUAGE_MAP[language] && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: '#6B6D73',
                        marginTop: 5,
                        lineHeight: 1.35
                      }}
                    >
                      {COURSE_LANGUAGE_MAP[language]}
                    </span>
                  )}
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
                    Short Description <span style={{ color: '#2D2F33' }}>*</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 500 }}>
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
                    ...(errors.shortDescription ? { borderColor: '#2D2F33', background: '#EFEFEF' } : {})
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
                      color: '#2D2F33',
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
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                <IndianRupee size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0 }}>
                  Section 2 — Course Pricing & Access
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#6B6D73' }}>
                  Configure tuition fees, scholarship waivers, and enrollment duration.
                </span>
              </div>
            </div>

            {/* Free Course Toggle Banner */}
            <div
              style={{
                background: isFree ? '#F4F4F5' : '#F8F8F8',
                border: '1px solid',
                borderColor: isFree ? '#E4E4E7' : '#E4E4E7',
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
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#15171A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Free Course (100% Scholarship)</span>
                  {isFree && (
                    <span
                      style={{
                        background: '#2D2F33',
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
                <div style={{ fontSize: '0.8125rem', color: '#6B6D73', marginTop: 2 }}>
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
                  color: isFree ? '#2D2F33' : '#5A5C62'
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
                  Offer Price (₹) {!isFree && <span style={{ color: '#2D2F33' }}>*</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6B6D73',
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
                      ...(isFree ? { background: '#F2F2F2', cursor: 'not-allowed', color: '#9B9DA3' } : {}),
                      ...(errors.price ? { borderColor: '#2D2F33', background: '#EFEFEF' } : {})
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
                  <span style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'block', fontWeight: 600 }}>
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
                      color: '#6B6D73',
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
                      ...(isFree ? { background: '#F2F2F2', cursor: 'not-allowed', color: '#9B9DA3' } : {}),
                      ...(errors.originalPrice ? { borderColor: '#2D2F33', background: '#EFEFEF' } : {})
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
                  <span style={{ color: '#2D2F33', fontSize: '0.75rem', marginTop: 4, display: 'block', fontWeight: 600 }}>
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
                <span style={{ fontSize: '0.75rem', color: '#9B9DA3', marginTop: 4, display: 'block' }}>
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
                background: '#F8F8F8',
                borderRadius: 10,
                border: '1px solid #E2E8F0'
              }}
            >
              {/* Discount Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: '#6B6D73', fontWeight: 600 }}>Calculated Discount:</span>
                <span
                  style={{
                    background: discountPercent > 0 ? '#F4F4F5' : '#F2F2F2',
                    color: discountPercent > 0 ? '#2D2F33' : '#6B6D73',
                    border: '1px solid',
                    borderColor: discountPercent > 0 ? '#E4E4E7' : '#E4E4E7',
                    padding: '2px 10px',
                    borderRadius: 9999,
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {isFree ? '100% OFF (Free)' : discountPercent > 0 ? `${discountPercent}% OFF` : 'No Discount'}
                </span>
                {!isFree && originalPrice > price && (
                  <span style={{ fontSize: '0.75rem', color: '#2D2F33', fontWeight: 600 }}>
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
                  color: '#4B4D52',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={certificateEnabled}
                  onChange={(e) => setCertificateEnabled(e.target.checked)}
                  style={{ width: 17, height: 17, cursor: 'pointer' }}
                />
                <Award size={16} style={{ color: '#15171A' }} />
                <span>Issue Certificate upon Completion</span>
              </label>
            </div>
          </section>

          {/* SECTION 3 — FACULTY / INSTRUCTOR */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                <Users size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0 }}>
                    Section 3 — Course Faculty & Instructors
                  </h2>
                  <span
                    style={{
                      background: '#F4F4F5',
                      color: '#4B4D52',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      border: '1px solid #E4E4E7'
                    }}
                  >
                    Optional
                  </span>
                </div>
                <span style={{ fontSize: '0.8125rem', color: '#6B6D73', marginTop: 2, display: 'block' }}>
                  Assign one or more faculty instructors to this course, or leave unassigned. You can also assign individual creators to specific lectures when creating the curriculum.
                </span>
              </div>
            </div>

            <div className="form-field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="select-course-instructor" className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  Select Instructors ({selectedCreatorIds.length} assigned)
                </label>
                {creators.length > 0 && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {selectedCreatorIds.length < creators.length && (
                      <button
                        type="button"
                        onClick={handleSelectAllCreators}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '0.75rem',
                          color: '#2563EB',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Select All ({creators.length})
                      </button>
                    )}
                    {selectedCreatorIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearCreators}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '0.75rem',
                          color: '#DC2626',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                )}
              </div>

              <select
                id="select-course-instructor"
                className="form-input"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleToggleCreator(e.target.value)
                  }
                }}
                disabled={loadingCreators}
              >
                <option value="">
                  {selectedCreatorIds.length === 0
                    ? '-- Choose an Instructor to Add (Optional) --'
                    : '-- Add Another Instructor --'}
                </option>
                {creators.map((c) => {
                  const isSelected = selectedCreatorIds.includes(c.id)
                  return (
                    <option key={c.id} value={c.id}>
                      {isSelected ? '✓ ' : '+ '} {c.name} ({c.email}) {c.headline ? `• ${c.headline}` : ''}
                    </option>
                  )
                })}
              </select>

              <span style={{ fontSize: '0.75rem', color: '#9B9DA3', marginTop: 4, display: 'block' }}>
                {loadingCreators
                  ? 'Loading registered faculty members...'
                  : `${creators.length} verified instructor(s) available. Select any instructor above to add or remove.`}
              </span>
            </div>

            {/* Selected Instructors List */}
            {selectedCreatorsList.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15171A', marginBottom: 8 }}>
                  Assigned Instructors ({selectedCreatorsList.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {selectedCreatorsList.map((sc) => (
                    <div
                      key={sc.id}
                      style={{
                        padding: '12px 14px',
                        background: '#F8F9FA',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                            flexShrink: 0
                          }}
                        >
                          {sc.name ? sc.name.slice(0, 2).toUpperCase() : 'FC'}
                        </div>
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong
                              style={{
                                fontSize: '0.875rem',
                                color: '#15171A',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {sc.name}
                            </strong>
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#6B6D73',
                              marginTop: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {sc.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCreator(sc.id)}
                        title="Remove instructor from course"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#6B6D73',
                          flexShrink: 0,
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#DC2626'
                          e.currentTarget.style.borderColor = '#FCA5A5'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6B6D73'
                          e.currentTarget.style.borderColor = '#E2E8F0'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  padding: '16px 20px',
                  background: '#FAFAFA',
                  borderRadius: 10,
                  border: '1px dashed #CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    flexShrink: 0
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    No instructors assigned to this course yet
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>
                    This is completely optional. You can create the course without an instructor, and assign specific creators directly to lectures later.
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* SECTION 4 — COURSE DESCRIPTION / SYLLABUS */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '28px',
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
                  background: '#EFEFEF',
                  color: '#4B4D52',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0 }}>
                  Section 4 — Course Description / Syllabus
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#6B6D73' }}>
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
                <span style={{ fontSize: '0.75rem', color: '#6B6D73' }}>Supports detailed markdown & formatted text</span>
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
              <span style={{ fontSize: '0.75rem', color: '#9B9DA3', marginTop: 4, display: 'block' }}>
                Students review this detailed breakdown on the public enrollment syllabus tab before registration.
              </span>
            </div>
          </section>

          {/* SECTION 5 — MEDIA & CATALOG DISPLAY */}
          <section
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Header: Section 5 — COURSE MEDIA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 24,
                paddingBottom: 14,
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
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A', margin: 0, letterSpacing: '-0.02em' }}>
                  COURSE MEDIA
                </h2>
                <span style={{ fontSize: '0.8125rem', color: '#6B6D73' }}>
                  Upload and manage promotional Course Thumbnail and Course Preview Video for the public catalog.
                </span>
              </div>
            </div>

            {/* Hidden File Inputs for Thumbnail & Video */}
            <input
              id="thumbnail-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailUpload}
              style={{ display: 'none' }}
            />
            <input
              id="video-file-input"
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoUpload}
              style={{ display: 'none' }}
            />

            {/* FIELD 1: COURSE THUMBNAIL */}
            <div
              style={{
                marginBottom: 26,
                padding: 20,
                background: '#F8F8F8',
                borderRadius: 8,
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15171A', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <ImageIcon size={18} style={{ color: '#15171A' }} />
                    Course Thumbnail
                  </label>
                  <div style={{ fontSize: '0.8125rem', color: '#6B6D73', marginTop: 2 }}>
                    Default cover image displayed across the public courses directory and course cards.
                  </div>
                </div>

                {/* Thumbnail Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline-blue btn-sm"
                    onClick={() => document.getElementById('thumbnail-file-input')?.click()}
                    disabled={isUploadingThumbnail}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', padding: '6px 12px' }}
                  >
                    {isUploadingThumbnail ? (
                      <>
                        <Loader2 size={14} className="spinner-spin" /> Uploading...
                      </>
                    ) : thumbnail ? (
                      <>
                        <Upload size={14} /> Replace Thumbnail
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> Upload Thumbnail
                      </>
                    )}
                  </button>

                  {thumbnail && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleRemoveThumbnail}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.8125rem',
                        padding: '6px 12px',
                        color: '#2D2F33',
                        borderColor: '#E4E4E7'
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail Preview Area */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 480,
                  height: 200,
                  borderRadius: 10,
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#15171A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #CBD5E1',
                  marginBottom: 14
                }}
              >
                {thumbnailStatus === 'loading' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#9B9DA3' }}>
                    <Loader2 size={30} className="spinner-spin" style={{ color: '#9B9DA3' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Loading image preview...</span>
                  </div>
                )}

                {thumbnailStatus === 'loaded' && thumbnail && (
                  <img
                    src={thumbnail}
                    alt="Course Thumbnail Asset Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                )}

                {thumbnailStatus === 'error' && (
                  <div style={{ padding: '0 20px', textAlign: 'center', color: '#9B9DA3' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px', color: '#2D2F33' }} />
                    <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.4 }}>
                      {thumbnailError || 'Unable to load this image. Please check the URL or upload another image.'}
                    </p>
                  </div>
                )}

                {thumbnailStatus === 'idle' && (
                  <div
                    onClick={() => document.getElementById('thumbnail-file-input')?.click()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      color: '#6B6D73',
                      cursor: 'pointer',
                      padding: 20,
                      textAlign: 'center'
                    }}
                  >
                    <Upload size={32} style={{ color: '#9B9DA3' }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#15171A' }}>Click to upload a course thumbnail image</span>
                    <span style={{ fontSize: '0.75rem', color: '#9B9DA3' }}>PNG, JPG, or WebP up to 10MB</span>
                  </div>
                )}
              </div>

              {/* Direct URL input / Quick Presets */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600 }}>Quick presets:</span>
                  {thumbnailPresets.map((p) => {
                    const isSelected = thumbnail === p.url
                    return (
                      <button
                        key={p.label}
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: 6,
                          borderColor: isSelected ? '#15171A' : undefined,
                          backgroundColor: isSelected ? '#F4F4F5' : undefined,
                          color: isSelected ? '#15171A' : undefined,
                          fontWeight: isSelected ? 700 : 500
                        }}
                        onClick={() => {
                          setThumbnail(p.url)
                          if (errors.thumbnail) {
                            setErrors((prev) => ({ ...prev, thumbnail: undefined }))
                          }
                        }}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* FIELD 2: COURSE PREVIEW VIDEO */}
            <div
              style={{
                marginBottom: 24,
                padding: 20,
                background: '#F8F8F8',
                borderRadius: 8,
                border: '1px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15171A', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <Film size={18} style={{ color: '#15171A' }} />
                    Course Preview Video
                  </label>
                  <div style={{ fontSize: '0.8125rem', color: '#6B6D73', marginTop: 2 }}>
                    Short marketing/promo overview video (15s – 60s) played on course card hover.
                  </div>
                </div>

                {/* Video Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline-blue btn-sm"
                    onClick={() => document.getElementById('video-file-input')?.click()}
                    disabled={isUploadingVideo}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', padding: '6px 12px' }}
                  >
                    {isUploadingVideo ? (
                      <>
                        <Loader2 size={14} className="spinner-spin" /> Uploading Video...
                      </>
                    ) : previewVideoUrl ? (
                      <>
                        <Upload size={14} /> Replace Video
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> Upload Preview Video
                      </>
                    )}
                  </button>

                  {previewVideoUrl && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleRemoveVideo}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.8125rem',
                        padding: '6px 12px',
                        color: '#2D2F33',
                        borderColor: '#E4E4E7'
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Helper Text Prompt Requirement 4 & 21 */}
              <div
                style={{
                  background: '#F4F4F5',
                  border: '1px solid #E4E4E7',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}
              >
                <Sparkles size={16} style={{ color: '#15171A', marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.8125rem', color: '#15171A', lineHeight: 1.5 }}>
                  <strong>Admin Guidance:</strong> Upload a short course preview video. This video will play when users hover over the course card on the public Courses page.
                  <div style={{ fontSize: '0.75rem', color: '#4B4D52', marginTop: 2 }}>
                    Supported formats: <strong>MP4</strong>, <strong>WebM</strong> • Recommended duration: <strong>15s – 60s</strong> • Maximum size: <strong>50MB</strong>.
                    <br />
                    <em>(Notice: This is a promotional preview video only — separate from protected student course lecture videos).</em>
                  </div>
                </div>
              </div>

              {/* Video Preview Player (Section 19) */}
              {previewVideoUrl ? (
                <div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 480,
                      height: 240,
                      borderRadius: 10,
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#0B0F19',
                      border: '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <video
                      src={previewVideoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#2D2F33',
                        background: '#EFEFEF',
                        padding: '3px 10px',
                        borderRadius: 6
                      }}
                    >
                      <CheckCircle2 size={13} /> Preview Video Configured
                    </span>

                    {videoDuration && (
                      <span style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600 }}>
                        Duration: ~{videoDuration} seconds
                      </span>
                    )}

                    <span style={{ fontSize: '0.75rem', color: '#9B9DA3' }}>
                      Stored at: {previewVideoUrl.length > 40 ? previewVideoUrl.slice(0, 40) + '...' : previewVideoUrl}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById('video-file-input')?.click()}
                  style={{
                    width: '100%',
                    maxWidth: 480,
                    height: 160,
                    borderRadius: 10,
                    border: '2px dashed #CBD5E1',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: 8,
                    padding: 20,
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isUploadingVideo ? (
                    <>
                      <Loader2 size={32} className="spinner-spin" style={{ color: '#15171A' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5A5C62' }}>
                        Uploading preview video to server...
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9B9DA3' }}>Please wait</span>
                    </>
                  ) : (
                    <>
                      <Film size={34} style={{ color: '#9B9DA3' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#15171A' }}>
                        Click to select and upload a Course Preview Video
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6B6D73' }}>
                        MP4 or WebM • 15s to 60s promo overview • Max 50MB
                      </span>
                    </>
                  )}
                </div>
              )}
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
                  background: '#F8F8F8',
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
                    color: '#15171A'
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
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                background: '#F8F8F8',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#5A5C62', textTransform: 'uppercase' }}>
                Catalog Card Preview
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: isFree ? '#2D2F33' : '#15171A',
                  background: isFree ? '#F4F4F5' : '#F4F4F5',
                  padding: '1px 6px',
                  borderRadius: 4
                }}
              >
                {isFree ? 'FREE TIER' : 'PREMIUM'}
              </span>
            </div>

            {/* Thumbnail Box */}
            <div style={{ position: 'relative', width: '100%', height: 160, background: '#2D2F33', overflow: 'hidden' }}>
              {thumbnailStatus === 'loading' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#15171A', color: '#9B9DA3' }}>
                  <Loader2 size={24} className="spinner-spin" style={{ color: '#9B9DA3', marginBottom: 6 }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>Loading preview...</span>
                </div>
              )}

              {thumbnailStatus === 'loaded' && thumbnail && (
                <img
                  src={thumbnail}
                  alt={title || 'Course Preview'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}

              {thumbnailStatus === 'error' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#15171A', color: '#9B9DA3', padding: 12, textAlign: 'center' }}>
                  <AlertCircle size={24} style={{ color: '#2D2F33', marginBottom: 6 }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9B9DA3' }}>Image unavailable</span>
                </div>
              )}

              {thumbnailStatus === 'idle' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#2D2F33', color: '#9B9DA3' }}>
                  <ImageIcon size={26} style={{ color: '#6B6D73', marginBottom: 4 }} />
                  <span style={{ fontSize: '0.6875rem' }}>No thumbnail provided</span>
                </div>
              )}
              {badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    background: '#EFEFEF',
                    color: '#4B4D52',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid #E4E4E7',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {badge}
                </div>
              )}
              {previewVideoUrl && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    background: 'rgba(139, 92, 246, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: '#FFFFFF',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Play size={10} fill="#FFFFFF" /> Video Preview
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: '#15171A',
                    background: '#F4F4F5',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}
                >
                  {category}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#0D9488',
                    background: '#F0FDFA',
                    border: '1px solid #E4E4E7',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}
                >
                  {language || 'English'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: '#6B6D73' }}>• {level}</span>
              </div>

              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#15171A',
                  margin: '0 0 8px 0',
                  lineHeight: 1.3
                }}
              >
                {title || 'Untitled Academic Course'}
              </h4>

              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#6B6D73',
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
              <div style={{ fontSize: '0.75rem', color: '#5A5C62', marginBottom: 12 }}>
                Instructor(s): <strong>{selectedCreatorsList.length > 0 ? selectedCreatorsList.map(c => c.name).join(', ') : 'Unassigned (Optional)'}</strong>
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
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2D2F33' }}>FREE</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15171A' }}>
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {Number(originalPrice) > Number(price) && (
                        <span style={{ fontSize: '0.8125rem', color: '#9B9DA3', textDecoration: 'line-through' }}>
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
                      color: '#2D2F33',
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
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#15171A', margin: '0 0 12px 0' }}>
              Publishing Readiness
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: title.trim().length >= 5 ? '#2D2F33' : '#D5D5D8' }} />
                <span style={{ color: title.trim().length >= 5 ? '#15171A' : '#6B6D73' }}>
                  Course title defined (min. 5 chars)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2
                  size={16}
                  style={{ color: shortDescription.trim().length >= 15 ? '#2D2F33' : '#D5D5D8' }}
                />
                <span style={{ color: shortDescription.trim().length >= 15 ? '#15171A' : '#6B6D73' }}>
                  Short description provided
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2
                  size={16}
                  style={{
                    color: isFree || (price !== '' && Number(price) >= 0) ? '#2D2F33' : '#D5D5D8'
                  }}
                />
                <span
                  style={{
                    color: isFree || (price !== '' && Number(price) >= 0) ? '#15171A' : '#6B6D73'
                  }}
                >
                  Tuition price configured
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: selectedCreatorIds.length > 0 ? '#10B981' : '#94A3B8' }} />
                <span style={{ color: selectedCreatorIds.length > 0 ? '#15171A' : '#6B6D73' }}>
                  {selectedCreatorIds.length > 0 ? `${selectedCreatorIds.length} Faculty assigned` : 'Course faculty (optional)'}
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
              background: '#4B4D52'
            }}
          />
          <span style={{ fontSize: '0.8125rem', color: '#5A5C62', fontWeight: 600 }}>
            {isEditMode ? 'Editing' : 'Creating'} Academic Course in {submittingAction === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'} mode
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
            <span>
              {submittingAction === 'PUBLISHED'
                ? (isEditMode ? 'Updating Course...' : 'Creating Course...')
                : (isEditMode ? 'Save & Update' : 'Create Course')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

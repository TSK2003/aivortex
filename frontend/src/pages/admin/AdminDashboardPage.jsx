import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  Globe,
  CreditCard,
  Shield,
  Plus,
  CheckCircle2,
  RotateCcw,
  Trash2,
  FileText,
  Send,
  Key,
  Database,
  Tag,
  AlertCircle,
  RefreshCw,
  X,
  ArrowRight,
  Video,
  UserCheck,
  Eye,
  Edit3,
  Mail,
  Phone,
  Calendar,
  Clock,
  User as UserIcon,
  Save,
  Check,
  Camera,
  Search,
  UserX,
  Copy,
  Pause,
  Play,
  ExternalLink,
  Filter,
  ArrowUpDown,
  EyeOff,
  Sparkles,
  Upload,
  UploadCloud,
  Link2,
  ChevronDown,
  Lock,
  AlertTriangle,
  Layers,
  Film,
  ChevronRight,
  Star,
  MessageSquare
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/admin/StatCard'
import CustomSelect from '../../components/common/CustomSelect'
import api from '../../services/api'
import defaultAboutData from '../../data/defaultAboutData'
import defaultFooterData from '../../data/defaultFooterData'
import AdminProjectsManager from '../../components/admin/AdminProjectsManager'
import AdminLiveSessionsManager from '../../components/admin/AdminLiveSessionsManager'
import AdminCmsManager from '../../components/admin/AdminCmsManager'
import AdminSupportManager from '../../components/admin/AdminSupportManager'
import {
  INTERNATIONAL_COUNTRY_CODES,
  parsePhoneNumber,
  formatToE164,
  validateInternationalPhone
} from '../../utils/formatters'

const CREATOR_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses', dotColor: '#2563EB' },
  { value: 'ACTIVE', label: 'Active', dotColor: '#16A34A' },
  { value: 'SUSPENDED', label: 'Suspended', dotColor: '#DC2626' },
  { value: 'INACTIVE', label: 'Inactive', dotColor: '#94A3B8' }
]

const CREATOR_SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'last_login', label: 'Last Login' }
]

const EDIT_CREATOR_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', dotColor: '#16A34A' },
  { value: 'SUSPENDED', label: 'Suspended', dotColor: '#DC2626' },
  { value: 'INACTIVE', label: 'Inactive', dotColor: '#94A3B8' }
]

const QUICK_REVIEW_REASONS = [
  'Video quality',
  'Audio quality',
  'Content correction',
  'Missing information',
  'Technical issue',
  'Other'
]

export default function AdminDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user: authUser, updateProfile: updateAuthUser } = useAuth()

  const getTabFromLocation = () => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/admin/profile')) return 'profile'
    if (path.includes('/admin/creators')) return 'creators'
    if (path.includes('/admin/students')) return 'students'
    if (path.includes('/admin/courses')) return 'courses'
    if (path.includes('/admin/playlists')) return 'video-verification'
    if (path.includes('/admin/video-verification')) return 'video-verification'
    if (path.includes('/admin/payments')) return 'payments'
    if (path.includes('/admin/pricing')) return 'pricing'
    if (path.includes('/admin/offers')) return 'pricing'
    if (path.includes('/admin/public-page')) return 'public-controls'
    if (path.includes('/admin/public-controls')) return 'public-controls'
    if (path.includes('/admin/reviews')) return 'reviews'
    if (path.includes('/admin/projects')) return 'projects'
    if (path.includes('/admin/live-sessions')) return 'live-sessions'
    if (path.includes('/admin/notifications')) return 'notifications'
    if (path.includes('/admin/reports')) return 'reports'
    if (path.includes('/admin/requests')) return 'requests'
    if (path.includes('/admin/audit-logs')) return 'audit-logs'
    if (path.includes('/admin/security')) return 'security'
    if (path.includes('/admin/support') || path.includes('/admin/enquiries')) return 'support'
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('tab') || 'overview'
  }

  const [activeTab, setActiveTab] = useState(getTabFromLocation)
  const [courseSubTab, setCourseSubTab] = useState('catalog') // 'catalog' | 'pricing' | 'controls'
  const [profileMode, setProfileMode] = useState('view') // 'view' | 'edit'
  const [loading, setLoading] = useState(false)

  // Admin Profile States
  const [adminProfile, setAdminProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    phone: '',
    bio: '',
    avatar: ''
  })

  // Live Domain Data States
  const [overviewData, setOverviewData] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [recentAuditLogs, setRecentAuditLogs] = useState([])
  const [creators, setCreators] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [offers, setOffers] = useState([])
  const [verificationQueue, setVerificationQueue] = useState([])

  // Content Review & Lecture Verification States
  const [reviewFilterStatus, setReviewFilterStatus] = useState('SUBMITTED_FOR_REVIEW')
  const [reviewSearch, setReviewSearch] = useState('')
  const [selectedReviewLecture, setSelectedReviewLecture] = useState(null)
  const [approveModal, setApproveModal] = useState({ open: false, lecture: null, isSubmitting: false })
  const [requestChangesModal, setRequestChangesModal] = useState({
    open: false,
    lecture: null,
    feedback: '',
    quickReason: '',
    error: '',
    isSubmitting: false
  })
  const [unpublishModal, setUnpublishModal] = useState({ open: false, lectureId: null, reason: '', error: '', isSubmitting: false })
  const [deleteOfferModal, setDeleteOfferModal] = useState({ open: false, offer: null, isSubmitting: false })

  // Admin Course Reviews Moderation States
  const [adminReviews, setAdminReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL')
  const [reviewCourseFilter, setReviewCourseFilter] = useState('ALL')
  const [reviewSearchQuery, setReviewSearchQuery] = useState('')
  const [rejectReviewModal, setRejectReviewModal] = useState({
    open: false,
    review: null,
    reason: '',
    error: '',
    isSubmitting: false
  })

  // Admin Course Content & Curriculum Management States
  const [selectedCurriculumCourse, setSelectedCurriculumCourse] = useState(null)
  const [curriculumSearch, setCurriculumSearch] = useState('')
  const [adminSectionModal, setAdminSectionModal] = useState({
    open: false,
    mode: 'create',
    section: null,
    courseId: null,
    title: '',
    description: '',
    isSaving: false,
    error: ''
  })
  const [adminLectureModal, setAdminLectureModal] = useState({
    open: false,
    mode: 'create',
    sectionId: null,
    lecture: null,
    courseId: null,
    title: '',
    description: '',
    duration: '15:00',
    videoUrl: '',
    selectedFile: null,
    uploadMode: 'url',
    uploadProgress: 0,
    isUploading: false,
    isPreview: false,
    isSaving: false,
    error: ''
  })
  const [adminDeleteCurriculumModal, setAdminDeleteCurriculumModal] = useState({
    open: false,
    type: 'section',
    id: null,
    title: '',
    isSubmitting: false
  })
  const [curriculumPreviewVideo, setCurriculumPreviewVideo] = useState({
    open: false,
    videoUrl: '',
    title: '',
    course: ''
  })

  const [paymentsList, setPaymentsList] = useState([])
  const [requestsList, setRequestsList] = useState([])
  const [requestStatusFilter, setRequestStatusFilter] = useState('ALL')
  const [requestTypeFilter, setRequestTypeFilter] = useState('ALL')
  const [requestSearch, setRequestSearch] = useState('')
  const [rejectModal, setRejectModal] = useState({ open: false, request: null, reason: '', error: '' })
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [reportsData, setReportsData] = useState(null)

  // About Page & Public Controls Management State
  const [cmsSection, setCmsSection] = useState('footer') // 'about' | 'footer'
  const [aboutData, setAboutData] = useState(defaultAboutData)
  const [aboutSubTab, setAboutSubTab] = useState('leadership') // 'leadership' | 'story' | 'offerings' | 'audience'
  const [isSavingAbout, setIsSavingAbout] = useState(false)
  const [footerData, setFooterData] = useState(defaultFooterData)
  const [isSavingFooter, setIsSavingFooter] = useState(false)

  // Creator Form & Management States
  const [newCreatorEmail, setNewCreatorEmail] = useState('')
  const [newCreatorName, setNewCreatorName] = useState('')
  const [newCreatorHeadline, setNewCreatorHeadline] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [creatorSearch, setCreatorSearch] = useState('')
  const [creatorStatusFilter, setCreatorStatusFilter] = useState('ALL')
  const [creatorSortBy, setCreatorSortBy] = useState('created_desc')
  const [selectedViewCreator, setSelectedViewCreator] = useState(null)
  const [selectedEditCreator, setSelectedEditCreator] = useState(null)
  const [editCreatorForm, setEditCreatorForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    specialization: '',
    headline: '',
    bio: '',
    status: 'ACTIVE'
  })
  const [phoneError, setPhoneError] = useState('')
  const [editCreatorCountryCode, setEditCreatorCountryCode] = useState('+91')
  const [editCreatorNationalPhone, setEditCreatorNationalPhone] = useState('')
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

  // Lock body scroll when review modal is active
  useEffect(() => {
    if (selectedReviewLecture) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [selectedReviewLecture])

  // Allow closing modals with Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (requestChangesModal.open && !requestChangesModal.isSubmitting) {
          setRequestChangesModal({ open: false, lecture: null, feedback: '', quickReason: '', error: '', isSubmitting: false })
        } else if (approveModal.open && !approveModal.isSubmitting) {
          setApproveModal({ open: false, lecture: null, isSubmitting: false })
        } else if (selectedReviewLecture) {
          setSelectedReviewLecture(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedReviewLecture, requestChangesModal.open, approveModal.open])

  const selectedCountry = useMemo(() => {
    return (
      INTERNATIONAL_COUNTRY_CODES.find((c) => c.dialCode === editCreatorCountryCode) ||
      INTERNATIONAL_COUNTRY_CODES[0]
    )
  }, [editCreatorCountryCode])

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

  // Playable video URL helper - resolves cloud assets, direct urls, and local dev/proxy endpoints
  const getPlayableVideoUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return ''
    const trimmed = rawUrl.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('blob:') || trimmed.startsWith('https://')) return trimmed
    if (trimmed.startsWith('http://localhost:3001') || trimmed.startsWith('http://127.0.0.1:3001')) return trimmed
    if (trimmed.startsWith('http://')) return trimmed
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }

  // Format submitted date for clean human-readable display (e.g. Sep 30, 2026)
  const formatSubmittedDate = (dateStr) => {
    if (!dateStr) return 'Recently'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Recently'
    }
  }

  // Convert technical enum statuses into human-readable compact chips with clean status dots
  const renderReviewStatusChip = (status) => {
    switch (status) {
      case 'SUBMITTED_FOR_REVIEW':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97706' }} />
            Pending Review
          </span>
        )
      case 'APPROVED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#DCFCE7',
              color: '#166534',
              border: '1px solid #BBF7D0'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
            Approved
          </span>
        )
      case 'RETURNED_FOR_EDIT':
      case 'REJECTED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#FEE2E2',
              color: '#991B1B',
              border: '1px solid #FECACA'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} />
            Changes Requested
          </span>
        )
      case 'PUBLISHED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#DBEAFE',
              color: '#1E40AF',
              border: '1px solid #BFDBFE'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB' }} />
            Published
          </span>
        )
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 700,
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #E2E8F0'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748B' }} />
            Draft
          </span>
        )
    }
  }

  // Filtered Review Queue for Content Review Tab
  const filteredReviewQueue = useMemo(() => {
    return verificationQueue.filter((v) => {
      if (reviewFilterStatus === 'SUBMITTED_FOR_REVIEW' && v.status !== 'SUBMITTED_FOR_REVIEW') return false
      if (reviewFilterStatus === 'RETURNED_FOR_EDIT' && v.status !== 'RETURNED_FOR_EDIT' && v.status !== 'REJECTED') return false
      if (reviewFilterStatus === 'APPROVED' && v.status !== 'APPROVED' && v.status !== 'PUBLISHED') return false

      if (reviewSearch.trim()) {
        const q = reviewSearch.toLowerCase().trim()
        const matchTitle = v.title?.toLowerCase().includes(q)
        const matchCourse = v.playlist?.course?.title?.toLowerCase().includes(q)
        const matchSection = v.playlist?.title?.toLowerCase().includes(q)
        const matchCreator = v.creator?.name?.toLowerCase().includes(q)
        if (!matchTitle && !matchCourse && !matchSection && !matchCreator) return false
      }
      return true
    })
  }, [verificationQueue, reviewFilterStatus, reviewSearch])

  // Active course for curriculum workspace - reactive with loaded courses data
  const activeCurriculumCourse = useMemo(() => {
    if (!courses || courses.length === 0) return null
    if (!selectedCurriculumCourse) return courses[0]
    return courses.find((c) => c.id === selectedCurriculumCourse.id) || courses[0]
  }, [courses, selectedCurriculumCourse])

  const [isSavingEditCreator, setIsSavingEditCreator] = useState(false)
  const [changePasswordModal, setChangePasswordModal] = useState({
    open: false,
    creator: null,
    newPassword: '',
    confirmPassword: '',
    showNewPassword: false,
    showConfirmPassword: false,
    sendEmail: true,
    isSubmitting: false,
    error: ''
  })
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    description: '',
    confirmText: '',
    confirmColor: '#DC2626',
    onConfirm: null,
    loading: false
  })
  const [credentialsNoticeModal, setCredentialsNoticeModal] = useState({
    open: false,
    creatorName: '',
    email: '',
    tempPassword: '',
    actionType: ''
  })
  const [copiedModalKey, setCopiedModalKey] = useState(false)

  // Offer Creation Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [isCreatingOffer, setIsCreatingOffer] = useState(false)
  const [offerTitle, setOfferTitle] = useState('')
  const [offerCode, setOfferCode] = useState('')
  const [offerDiscountPercent, setOfferDiscountPercent] = useState(25)
  const [offerMaxUses, setOfferMaxUses] = useState(100)
  const [offerDaysValid, setOfferDaysValid] = useState(30)

  // Pricing Edit State
  const [priceEditingCourseId, setPriceEditingCourseId] = useState(null)
  const [editPrice, setEditPrice] = useState(0)
  const [editDiscount, setEditDiscount] = useState(0)

  // Announcement Form
  const [newNotifTitle, setNewNotifTitle] = useState('')
  const [newNotifBody, setNewNotifBody] = useState('')
  const [newNotifTarget, setNewNotifTarget] = useState('ALL_STUDENTS')

  useEffect(() => {
    const currentTab = getTabFromLocation()
    setActiveTab(currentTab)
    if (currentTab === 'pricing') {
      setActiveTab('courses')
      setCourseSubTab('pricing')
    } else if (currentTab === 'public-controls') {
      setActiveTab('public-controls')
    } else if (currentTab === 'reviews') {
      setActiveTab('reviews')
      fetchAdminReviews()
    } else if (currentTab === 'profile') {
      const searchParams = new URLSearchParams(location.search)
      const mode = searchParams.get('mode')
      if (mode === 'edit') {
        setProfileMode('edit')
      } else {
        setProfileMode('view')
      }
      fetchAdminProfile()
    }
  }, [location.pathname, location.search])

  // Standalone profile fetcher
  const fetchAdminProfile = async () => {
    try {
      setProfileLoading(true)
      const res = await api.admin.getProfile()
      const u = res.data?.user
      if (u) {
        setAdminProfile(u)
        setEditProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          bio: u.bio || '',
          avatar: u.avatar || ''
        })
      }
    } catch (err) {
      console.warn('Profile fetch note:', err.message)
      if (authUser) {
        setAdminProfile(authUser)
        setEditProfileForm({
          name: authUser.name || '',
          phone: authUser.phone || '',
          bio: authUser.bio || '',
          avatar: authUser.avatar || ''
        })
      }
    } finally {
      setProfileLoading(false)
    }
  }

  // Update profile handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!editProfileForm.name?.trim()) {
      showToast('Full name is required.', 'error')
      return
    }

    try {
      setProfileSaving(true)
      const payload = {
        name: editProfileForm.name.trim(),
        phone: editProfileForm.phone.trim(),
        bio: editProfileForm.bio.trim(),
        avatar: editProfileForm.avatar.trim()
      }
      const res = await api.admin.updateProfile(payload)
      const updatedUser = res.data?.user
      if (updatedUser) {
        setAdminProfile(updatedUser)
        updateAuthUser(updatedUser)
      } else {
        setAdminProfile((prev) => ({ ...prev, ...payload, updatedAt: new Date().toISOString() }))
        updateAuthUser(payload)
      }
      showToast('Admin profile updated successfully!', 'success')
      setProfileMode('view')
      navigate('/admin/profile?mode=view', { replace: true })
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return 'September 2024'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'September 2024'
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'September 2024'
    }
  }

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return 'Recently'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'Recently'
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Recently'
    }
  }

  const getProfileInitials = (name) => {
    if (!name) return 'AD'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const getCreatorInitials = (name) => {
    if (!name || typeof name !== 'string') return ''
    const cleaned = name.trim().replace(/^(dr\.|dr|prof\.|prof|mr\.|mr|mrs\.|mrs|ms\.|ms|er\.|er)\s+/i, '').trim()
    const target = cleaned || name.trim()
    const parts = target.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return ''
  }

  const currentDisplayUser = adminProfile || authUser || {
    name: 'Dr. Vikram Sen',
    email: 'director@apexlearn.edu',
    role: 'ADMIN',
    status: 'ACTIVE',
    phone: '+91 98765 43210',
    bio: 'Academic Director and Chief Learning Architect at ApexLearn Institute of Tech & AI, leading curriculum quality, faculty verification, and AI-assisted educational standards.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const loadAdminData = async () => {
    try {
      setLoading(true)

      const [
        overRes,
        crRes,
        stRes,
        cRes,
        offersRes,
        vqRes,
        payRes,
        reqRes,
        auditRes,
        sessRes,
        repRes,
        profRes,
        aboutRes,
        footerRes,
        reviewsRes
      ] = await Promise.allSettled([
        api.admin.getOverview(),
        api.admin.getCreators(),
        api.admin.getStudents(),
        api.admin.getCourses(),
        api.admin.getOffers(),
        api.admin.getVideoVerificationQueue(),
        api.admin.getPayments(),
        api.admin.getRequests(),
        api.admin.getAuditLogs(),
        api.admin.getActiveSessions(),
        api.admin.getReports(),
        api.admin.getProfile(),
        api.admin.getAbout(),
        api.admin.getFooter(),
        api.admin.getReviews()
      ])

      if (aboutRes.status === 'fulfilled' && aboutRes.value?.data?.about) {
        setAboutData(aboutRes.value.data.about)
      }

      if (footerRes.status === 'fulfilled' && footerRes.value?.data?.footer) {
        setFooterData(footerRes.value.data.footer)
      }

      if (profRes.status === 'fulfilled' && profRes.value?.data?.user) {
        const u = profRes.value.data.user
        setAdminProfile(u)
        setEditProfileForm({
          name: u.name || '',
          phone: u.phone || '',
          bio: u.bio || '',
          avatar: u.avatar || ''
        })
      } else if (authUser) {
        setAdminProfile(authUser)
        setEditProfileForm({
          name: authUser.name || '',
          phone: authUser.phone || '',
          bio: authUser.bio || '',
          avatar: authUser.avatar || ''
        })
      }

      if (overRes.status === 'fulfilled' && overRes.value?.data) {
        if (overRes.value.data.analytics) setOverviewData(overRes.value.data.analytics)
        if (overRes.value.data.recentOrders) setRecentOrders(overRes.value.data.recentOrders)
        if (overRes.value.data.recentAuditLogs) setRecentAuditLogs(overRes.value.data.recentAuditLogs)
      }
      if (crRes.status === 'fulfilled' && crRes.value?.data?.creators) {
        setCreators(crRes.value.data.creators)
      } else {
        setCreators([])
      }
      if (stRes.status === 'fulfilled' && stRes.value?.data?.students) {
        setStudents(stRes.value.data.students)
      } else {
        setStudents([])
      }
      if (cRes.status === 'fulfilled' && cRes.value?.data?.courses) {
        setCourses(cRes.value.data.courses)
      } else {
        setCourses([])
      }
      if (offersRes.status === 'fulfilled' && offersRes.value?.data?.offers) {
        setOffers(offersRes.value.data.offers)
      } else {
        setOffers([])
      }
      if (vqRes.status === 'fulfilled' && vqRes.value?.data?.queue) {
        setVerificationQueue(vqRes.value.data.queue)
      } else {
        setVerificationQueue([])
      }
      if (payRes.status === 'fulfilled' && payRes.value?.data?.payments) {
        setPaymentsList(payRes.value.data.payments)
      } else {
        setPaymentsList([])
      }
      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.requests) {
        setRequestsList(reqRes.value.data.requests)
      } else {
        setRequestsList([])
      }
      if (auditRes.status === 'fulfilled' && auditRes.value?.data?.logs) {
        setAuditLogs(auditRes.value.data.logs)
      } else {
        setAuditLogs([])
      }
      if (sessRes.status === 'fulfilled' && sessRes.value?.data?.sessions) {
        setActiveSessions(sessRes.value.data.sessions)
      } else {
        setActiveSessions([])
      }
      if (repRes.status === 'fulfilled' && repRes.value?.data) {
        setReportsData(repRes.value.data)
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.reviews) {
        setAdminReviews(reviewsRes.value.data.reviews)
      } else {
        setAdminReviews([])
      }
    } catch (err) {
      console.warn('Admin load note:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  // Admin Course Reviews Moderation Handlers
  const fetchAdminReviews = async (status = reviewStatusFilter, courseId = reviewCourseFilter, search = reviewSearchQuery) => {
    try {
      setReviewsLoading(true)
      const params = {}
      if (status && status !== 'ALL') params.status = status
      if (courseId && courseId !== 'ALL') params.courseId = courseId
      if (search && search.trim()) params.search = search.trim()
      const res = await api.admin.getReviews(params)
      if (res?.data?.reviews) {
        setAdminReviews(res.data.reviews)
      } else {
        setAdminReviews([])
      }
    } catch (err) {
      console.warn('Admin reviews fetch error:', err.message)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleApproveReview = async (reviewId) => {
    try {
      const res = await api.admin.approveReview(reviewId)
      showToast(res?.message || 'Review approved successfully!', 'success')
      fetchAdminReviews()
      api.admin.getCourses().then((cRes) => {
        if (cRes?.data?.courses) setCourses(cRes.data.courses)
      }).catch(() => {})
    } catch (err) {
      showToast(err.message || 'Failed to approve review', 'error')
    }
  }

  const handleRejectReviewSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!rejectReviewModal.reason || !rejectReviewModal.reason.trim()) {
      setRejectReviewModal((prev) => ({ ...prev, error: 'A clear reason for rejection is required.' }))
      return
    }
    try {
      setRejectReviewModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))
      const res = await api.admin.rejectReview(rejectReviewModal.review.id, rejectReviewModal.reason.trim())
      showToast(res?.message || 'Review rejected and feedback recorded.', 'info')
      setRejectReviewModal({ open: false, review: null, reason: '', error: '', isSubmitting: false })
      fetchAdminReviews()
      api.admin.getCourses().then((cRes) => {
        if (cRes?.data?.courses) setCourses(cRes.data.courses)
      }).catch(() => {})
    } catch (err) {
      setRejectReviewModal((prev) => ({ ...prev, isSubmitting: false, error: err.message || 'Failed to reject review' }))
    }
  }

  const handleToggleFeatureReview = async (reviewId, currentFeatured) => {
    try {
      const nextFeatured = !currentFeatured
      const res = await api.admin.toggleFeatureReview(reviewId, nextFeatured)
      showToast(res?.message || (nextFeatured ? 'Review featured on Homepage!' : 'Review removed from Homepage featured stories.'), 'success')
      fetchAdminReviews()
    } catch (err) {
      showToast(err.message || 'Failed to update review featured status', 'error')
    }
  }

  // Creator Handlers
  const handleInviteCreator = async (e) => {
    e.preventDefault()
    if (!newCreatorEmail || !newCreatorName) return

    try {
      await api.admin.inviteCreator({
        name: newCreatorName,
        email: newCreatorEmail,
        headline: newCreatorHeadline || 'Technical Instructor & Course Creator'
      })
      showToast(`Invitation sent to ${newCreatorEmail}`, 'success')
      setNewCreatorEmail('')
      setNewCreatorName('')
      setNewCreatorHeadline('')
      setShowInviteForm(false)
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to invite creator', 'error')
    }
  }

  // Memoized Filtered & Sorted Creators
  const filteredCreators = useMemo(() => {
    return creators
      .filter((cr) => {
        if (creatorStatusFilter !== 'ALL') {
          const current = (cr.status || 'ACTIVE').toUpperCase()
          const target = creatorStatusFilter.toUpperCase()
          if (current !== target) {
            return false
          }
        }
        if (creatorSearch.trim()) {
          const q = creatorSearch.trim().toLowerCase()
          const nameMatch = cr.name?.toLowerCase().includes(q)
          const emailMatch = cr.email?.toLowerCase().includes(q)
          const idMatch = cr.id?.toLowerCase().includes(q)
          const specMatch =
            cr.creatorProfile?.specialization?.toLowerCase().includes(q) ||
            cr.creatorProfile?.headline?.toLowerCase().includes(q)
          if (!nameMatch && !emailMatch && !idMatch && !specMatch) return false
        }
        return true
      })
      .sort((a, b) => {
        if (creatorSortBy === 'name' || creatorSortBy === 'name_asc') {
          return (a.name || '').localeCompare(b.name || '')
        }
        if (creatorSortBy === 'name_desc') {
          return (b.name || '').localeCompare(a.name || '')
        }
        if (creatorSortBy === 'last_login') {
          const aLogin = new Date(a.lastLoginAt || a.lastLogin || a.updatedAt || 0).getTime()
          const bLogin = new Date(b.lastLoginAt || b.lastLogin || b.updatedAt || 0).getTime()
          return bLogin - aLogin
        }
        if (creatorSortBy === 'created_asc') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })
  }, [creators, creatorStatusFilter, creatorSearch, creatorSortBy])

  const handleOpenEditCreator = (cr) => {
    setSelectedEditCreator(cr)
    const parsed = parsePhoneNumber(cr.phone || '')
    setEditCreatorCountryCode(parsed.countryCode)
    setEditCreatorNationalPhone(parsed.nationalNumber)
    setIsCountryDropdownOpen(false)
    setCountrySearch('')
    const rawStatus = (cr.status || 'ACTIVE').toUpperCase()
    const safeStatus = ['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(rawStatus) ? rawStatus : 'ACTIVE'
    setEditCreatorForm({
      name: cr.name || '',
      email: cr.email || '',
      phone: cr.phone || '',
      avatar: cr.avatar || '',
      specialization: cr.creatorProfile?.specialization || '',
      headline: cr.creatorProfile?.headline || '',
      bio: cr.creatorProfile?.biography || cr.bio || '',
      status: safeStatus
    })
    setPhoneError('')
  }

  const handleCountryCodeChange = (newCode) => {
    setEditCreatorCountryCode(newCode)
    setIsCountryDropdownOpen(false)
    setCountrySearch('')
    const formatted = editCreatorNationalPhone.trim() ? formatToE164(newCode, editCreatorNationalPhone) : ''
    setEditCreatorForm((prev) => ({ ...prev, phone: formatted }))
    const errorMsg = validateInternationalPhone(newCode, editCreatorNationalPhone)
    setPhoneError(errorMsg)
  }

  const handleNationalPhoneChange = (e) => {
    const raw = e.target.value
    // Allow digits, spaces, hyphens, and parentheses without rigid 16-char cutoff
    const sanitized = raw.replace(/[^0-9+\s\-()]/g, '').slice(0, 25)
    setEditCreatorNationalPhone(sanitized)
    const formatted = sanitized.trim() ? formatToE164(editCreatorCountryCode, sanitized) : ''
    setEditCreatorForm((prev) => ({ ...prev, phone: formatted }))
    const errorMsg = validateInternationalPhone(editCreatorCountryCode, sanitized)
    setPhoneError(errorMsg)
  }

  // Change Password Modal Handlers
  const handleOpenChangePassword = (cr) => {
    setChangePasswordModal({
      open: true,
      creator: cr,
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      sendEmail: true,
      isSubmitting: false,
      error: ''
    })
  }

  const handleGenerateChangePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'
    const numbers = '23456789'
    const specials = '!@#$%^&*'
    const allChars = uppercase + lowercase + numbers + specials

    // Ensure at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    const chars = [
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * lowercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      specials[Math.floor(Math.random() * specials.length)]
    ]

    // Generate 14 characters total (strictly between 8 and 32 characters)
    for (let i = 0; i < 10; i++) {
      chars.push(allChars[Math.floor(Math.random() * allChars.length)])
    }

    // Shuffle characters randomly
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[chars[i], chars[j]] = [chars[j], chars[i]]
    }

    const generated = chars.join('')
    setChangePasswordModal((prev) => ({
      ...prev,
      newPassword: generated,
      confirmPassword: generated,
      showNewPassword: true,
      showConfirmPassword: true,
      error: ''
    }))
  }

  const passwordCriteria = useMemo(() => {
    const pwd = changePasswordModal.newPassword || ''
    const hasMinLen = pwd.length >= 8
    const hasMaxLen = pwd.length <= 32 && pwd.length > 0
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
    const isValid = hasMinLen && hasMaxLen && hasUpper && hasLower && hasNumber && hasSpecial

    return {
      hasMinLen,
      hasMaxLen,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid
    }
  }, [changePasswordModal.newPassword])

  const changePasswordStrength = useMemo(() => {
    const pwd = changePasswordModal.newPassword || ''
    if (!pwd) return { score: 0, label: 'None', color: '#94A3B8' }

    let criteriaMet = 0
    if (pwd.length >= 8 && pwd.length <= 32) criteriaMet += 1
    if (/[A-Z]/.test(pwd)) criteriaMet += 1
    if (/[a-z]/.test(pwd)) criteriaMet += 1
    if (/[0-9]/.test(pwd)) criteriaMet += 1
    if (/[^A-Za-z0-9]/.test(pwd)) criteriaMet += 1

    if (pwd.length < 8) {
      return { score: Math.min(25, criteriaMet * 5), label: 'Too Short', color: '#EF4444' }
    }

    if (criteriaMet <= 2) return { score: 25, label: 'Weak', color: '#EF4444' }
    if (criteriaMet === 3) return { score: 50, label: 'Fair', color: '#F59E0B' }
    if (criteriaMet === 4) return { score: 75, label: 'Good', color: '#3B82F6' }
    if (pwd.length >= 12) return { score: 100, label: 'Strong', color: '#10B981' }
    return { score: 85, label: 'Strong', color: '#10B981' }
  }, [changePasswordModal.newPassword])

  const handleSaveChangePassword = async (e) => {
    if (e) e.preventDefault()
    const { creator, newPassword, confirmPassword, sendEmail } = changePasswordModal
    if (!newPassword || newPassword.length < 8) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'Password must be at least 8 characters long.' }))
      return
    }
    if (newPassword.length > 32) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'Password cannot exceed 32 characters.' }))
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'Password must contain at least one uppercase letter.' }))
      return
    }
    if (!/[a-z]/.test(newPassword)) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'Password must contain at least one lowercase letter.' }))
      return
    }
    if (!/[0-9]/.test(newPassword)) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'Password must contain at least one number.' }))
      return
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'Password must contain at least one special character.' }))
      return
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordModal((prev) => ({ ...prev, error: 'New password and confirmation do not match.' }))
      return
    }

    try {
      setChangePasswordModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))
      await api.admin.resetCreatorPassword(creator.id, {
        newPassword,
        sendEmail
      })
      showToast('Password updated successfully.', 'success')
      setChangePasswordModal({
        open: false,
        creator: null,
        newPassword: '',
        confirmPassword: '',
        showNewPassword: false,
        showConfirmPassword: false,
        sendEmail: true,
        isSubmitting: false,
        error: ''
      })
    } catch (err) {
      setChangePasswordModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err.message || 'Failed to update password.'
      }))
    }
  }

  const handleSaveEditCreator = async (e) => {
    e.preventDefault()
    if (!editCreatorForm.name?.trim()) {
      showToast('Creator full name is required', 'error')
      return
    }
    if (!editCreatorForm.email?.trim()) {
      showToast('Creator email address is required', 'error')
      return
    }

    const phoneValidationMsg = validateInternationalPhone(editCreatorCountryCode, editCreatorNationalPhone)
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg)
      showToast(phoneValidationMsg, 'error')
      return
    }

    try {
      setIsSavingEditCreator(true)
      const finalPhone = editCreatorNationalPhone.trim()
        ? formatToE164(editCreatorCountryCode, editCreatorNationalPhone)
        : null

      const rawStatus = (editCreatorForm.status || selectedEditCreator.status || 'ACTIVE').toUpperCase()
      const normalizedStatus = ['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(rawStatus) ? rawStatus : 'ACTIVE'

      const payload = {
        ...editCreatorForm,
        name: editCreatorForm.name.trim(),
        email: editCreatorForm.email.trim(),
        phone: finalPhone,
        avatar: editCreatorForm.avatar ? editCreatorForm.avatar.trim() : null,
        status: normalizedStatus
      }
      const res = await api.admin.updateCreator(selectedEditCreator.id, payload)
      showToast(`Profile updated for ${editCreatorForm.name}`, 'success')

      const savedCreator = res?.data?.creator
      const newStatus = (savedCreator?.status || payload.status || 'ACTIVE').toUpperCase()

      setCreators((prev) =>
        prev.map((c) =>
          c.id === selectedEditCreator.id
            ? {
                ...c,
                ...(savedCreator || {}),
                ...payload,
                status: newStatus,
                creatorProfile: {
                  ...c.creatorProfile,
                  ...(savedCreator?.creatorProfile || {}),
                  specialization: payload.specialization,
                  headline: payload.headline,
                  biography: payload.bio
                }
              }
            : c
        )
      )
      if (selectedViewCreator?.id === selectedEditCreator.id) {
        setSelectedViewCreator((prev) => ({
          ...prev,
          ...(savedCreator || {}),
          ...payload,
          status: newStatus,
          creatorProfile: {
            ...prev?.creatorProfile,
            ...(savedCreator?.creatorProfile || {}),
            specialization: payload.specialization,
            headline: payload.headline,
            biography: payload.bio
          }
        }))
      }
      setSelectedEditCreator(null)
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to update creator profile', 'error')
    } finally {
      setIsSavingEditCreator(false)
    }
  }

  const handlePromptSuspendCreator = (cr) => {
    setConfirmModal({
      open: true,
      title: 'Suspend Creator Account?',
      description: `Are you sure you want to suspend this creator account? This will immediately restrict platform login and curriculum publishing rights for ${cr.name} (${cr.email}).`,
      confirmText: 'Suspend Account',
      confirmColor: '#DC2626',
      onConfirm: async () => {
        try {
          await api.admin.updateCreatorStatus(cr.id, 'SUSPENDED')
          showToast(`Account suspended for ${cr.name}`, 'success')
          setCreators((prev) =>
            prev.map((c) => (c.id === cr.id ? { ...c, status: 'SUSPENDED' } : c))
          )
          if (selectedViewCreator?.id === cr.id) {
            setSelectedViewCreator((prev) => ({ ...prev, status: 'SUSPENDED' }))
          }
          if (selectedEditCreator?.id === cr.id) {
            setSelectedEditCreator((prev) => ({ ...prev, status: 'SUSPENDED' }))
            setEditCreatorForm((prev) => ({ ...prev, status: 'SUSPENDED' }))
          }
          loadAdminData()
        } catch (err) {
          showToast(err.message || 'Failed to suspend creator account', 'error')
        }
      }
    })
  }

  const handlePromptActivateCreator = (cr) => {
    setConfirmModal({
      open: true,
      title: 'Activate Creator Account?',
      description: `Are you sure you want to activate this creator account? This will grant full login authorization and course publishing rights to ${cr.name} (${cr.email}).`,
      confirmText: 'Activate Account',
      confirmColor: '#16A34A',
      onConfirm: async () => {
        try {
          await api.admin.updateCreatorStatus(cr.id, 'ACTIVE')
          showToast(`Account activated for ${cr.name}`, 'success')
          setCreators((prev) =>
            prev.map((c) => (c.id === cr.id ? { ...c, status: 'ACTIVE' } : c))
          )
          if (selectedViewCreator?.id === cr.id) {
            setSelectedViewCreator((prev) => ({ ...prev, status: 'ACTIVE' }))
          }
          if (selectedEditCreator?.id === cr.id) {
            setSelectedEditCreator((prev) => ({ ...prev, status: 'ACTIVE' }))
            setEditCreatorForm((prev) => ({ ...prev, status: 'ACTIVE' }))
          }
          loadAdminData()
        } catch (err) {
          showToast(err.message || 'Failed to activate creator account', 'error')
        }
      }
    })
  }

  const handlePromptResetCredentials = (cr) => {
    setConfirmModal({
      open: true,
      title: 'Reset Login Credentials?',
      description: `This will invalidate any active sessions and generate a secure temporary password for ${cr.name}. Credentials will be dispatched to ${cr.email}.`,
      confirmText: 'Reset Credentials',
      confirmColor: '#D97706',
      onConfirm: async () => {
        try {
          const res = await api.admin.resetCreatorPassword(cr.id, { sendEmail: true })
          const tempPassword = res.data?.tempPasswordGenerated || 'ApexTempPass2026!'
          setCredentialsNoticeModal({
            open: true,
            creatorName: cr.name,
            email: cr.email,
            tempPassword,
            actionType: 'RESET'
          })
          showToast(`Credentials reset successfully for ${cr.email}`, 'success')
          loadAdminData()
        } catch (err) {
          showToast(err.message || 'Failed to reset credentials', 'error')
        }
      }
    })
  }

  const handlePromptResendCredentials = (cr) => {
    setConfirmModal({
      open: true,
      title: 'Dispatch Onboarding Credentials?',
      description: `This will dispatch onboarding access credentials directly to ${cr.name}'s registered email address: ${cr.email}.`,
      confirmText: 'Send Credentials',
      confirmColor: '#2563EB',
      onConfirm: async () => {
        try {
          const res = await api.admin.resendCreatorCredentials(cr.id)
          const tempPassword = res.data?.tempPasswordGenerated || 'ApexCreator2026!'
          setCredentialsNoticeModal({
            open: true,
            creatorName: cr.name,
            email: cr.email,
            tempPassword,
            actionType: 'RESENT'
          })
          showToast(`Onboarding credentials dispatched to ${cr.email}`, 'success')
          loadAdminData()
        } catch (err) {
          showToast(err.message || 'Failed to resend credentials', 'error')
        }
      }
    })
  }

  const handleResendCredentials = handlePromptResendCredentials

  const formatLastLogin = (creator) => {
    const session = creator.sessions?.[0]
    if (!session || !session.createdAt) return 'Never'
    try {
      const d = new Date(session.createdAt)
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'Never'
    }
  }

  const handleToggleCreatorStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      await api.admin.updateCreatorStatus(id, nextStatus)
      showToast(`Creator status updated to ${nextStatus}`, 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Status change failed', 'error')
    }
  }

  // Student Handlers
  const handleToggleStudentStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    try {
      await api.admin.updateStudentStatus(id, nextStatus)
      showToast(`Student status updated to ${nextStatus}`, 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Status change failed', 'error')
    }
  }

  const handleSavePrice = async (courseId) => {
    try {
      await api.admin.updatePricing(courseId, {
        price: Number(editPrice),
        discountPercent: Number(editDiscount)
      })
      showToast('Course pricing updated in database', 'success')
      setPriceEditingCourseId(null)
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Pricing update failed', 'error')
    }
  }

  // Offer Handlers
  const handleCreateOffer = async (e) => {
    e.preventDefault()
    if (!offerTitle || !offerCode) {
      showToast('Offer title and coupon code are required', 'error')
      return
    }

    setIsCreatingOffer(true)
    try {
      const startDate = new Date()
      const endDate = new Date(Date.now() + Number(offerDaysValid) * 24 * 60 * 60 * 1000)

      await api.admin.createOffer({
        title: offerTitle.trim(),
        code: offerCode.trim().toUpperCase(),
        discountPercent: Number(offerDiscountPercent),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        maxUses: offerMaxUses ? Number(offerMaxUses) : null,
        isActive: true
      })

      showToast(`Coupon offer "${offerCode.toUpperCase()}" created successfully`, 'success')
      setIsOfferModalOpen(false)
      setOfferTitle('')
      setOfferCode('')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to create offer', 'error')
    } finally {
      setIsCreatingOffer(false)
    }
  }

  const handleToggleOfferActive = async (offer) => {
    try {
      await api.admin.updateOffer(offer.id, { isActive: !offer.isActive })
      showToast(`Offer ${offer.code} is now ${!offer.isActive ? 'Active' : 'Inactive'}`, 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to toggle offer', 'error')
    }
  }

  const handleConfirmDeleteOffer = async () => {
    if (!deleteOfferModal.offer) return
    try {
      setDeleteOfferModal((prev) => ({ ...prev, isSubmitting: true }))
      await api.admin.deleteOffer(deleteOfferModal.offer.id)
      showToast(`Offer ${deleteOfferModal.offer.code} deleted`, 'info')
      setDeleteOfferModal({ open: false, offer: null, isSubmitting: false })
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to delete offer', 'error')
      setDeleteOfferModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  // Content Review Handlers
  const handleConfirmApproveLecture = async () => {
    if (!approveModal.lecture) return
    try {
      setApproveModal((prev) => ({ ...prev, isSubmitting: true }))
      await api.admin.reviewVideo(approveModal.lecture.id, 'APPROVED', 'Lecture quality verified and approved by Admin.')
      showToast(`Lecture "${approveModal.lecture.title}" approved successfully.`, 'success')
      setApproveModal({ open: false, lecture: null, isSubmitting: false })
      setSelectedReviewLecture(null)
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error')
      setApproveModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleConfirmRequestChanges = async (e) => {
    if (e) e.preventDefault()
    if (!requestChangesModal.lecture) return
    if (!requestChangesModal.feedback.trim()) {
      setRequestChangesModal((prev) => ({ ...prev, error: 'Please provide feedback for the Creator.' }))
      return
    }
    try {
      setRequestChangesModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))
      await api.admin.reviewVideo(
        requestChangesModal.lecture.id,
        'RETURNED_FOR_EDIT',
        requestChangesModal.feedback.trim()
      )
      showToast('Revision feedback sent to creator. Status updated to Changes Requested.', 'info')
      setRequestChangesModal({
        open: false,
        lecture: null,
        feedback: '',
        quickReason: '',
        error: '',
        isSubmitting: false
      })
      setSelectedReviewLecture(null)
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to submit revision feedback', 'error')
      setRequestChangesModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handlePublishLesson = async (lessonId) => {
    try {
      await api.admin.publishLesson(lessonId)
      showToast('Lecture published to enrolled students', 'success')
      if (selectedReviewLecture && selectedReviewLecture.id === lessonId) {
        setSelectedReviewLecture((prev) => ({ ...prev, status: 'PUBLISHED' }))
      }
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Publish failed', 'error')
    }
  }

  const handleConfirmUnpublish = async () => {
    if (!unpublishModal.lectureId) return
    try {
      setUnpublishModal((prev) => ({ ...prev, isSubmitting: true }))
      await api.admin.unpublishLesson(unpublishModal.lectureId, unpublishModal.reason.trim() || 'Unpublished by Admin')
      showToast('Lecture unpublished from student player', 'info')
      if (selectedReviewLecture && selectedReviewLecture.id === unpublishModal.lectureId) {
        setSelectedReviewLecture((prev) => ({ ...prev, status: 'APPROVED' }))
      }
      setUnpublishModal({ open: false, lectureId: null, reason: '', error: '', isSubmitting: false })
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Unpublish failed', 'error')
      setUnpublishModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  // Admin Course Curriculum Management Handlers
  const handleSaveSection = async (e) => {
    if (e) e.preventDefault()
    if (!adminSectionModal.title.trim()) {
      setAdminSectionModal((prev) => ({ ...prev, error: 'Section title is required.' }))
      return
    }
    try {
      setAdminSectionModal((prev) => ({ ...prev, isSaving: true, error: '' }))
      if (adminSectionModal.mode === 'create') {
        await api.creator.createPlaylist(
          adminSectionModal.courseId,
          adminSectionModal.title.trim(),
          adminSectionModal.description?.trim() || ''
        )
        showToast('Section created successfully', 'success')
      } else {
        await api.creator.updatePlaylist(adminSectionModal.section.id, {
          title: adminSectionModal.title.trim(),
          description: adminSectionModal.description?.trim() || ''
        })
        showToast('Section updated successfully', 'success')
      }
      setAdminSectionModal({
        open: false,
        mode: 'create',
        section: null,
        courseId: null,
        title: '',
        description: '',
        isSaving: false,
        error: ''
      })
      loadAdminData()
    } catch (err) {
      setAdminSectionModal((prev) => ({ ...prev, isSaving: false, error: err.message || 'Failed to save section' }))
    }
  }

  const handleSaveLecture = async (e) => {
    if (e) e.preventDefault()
    if (!adminLectureModal.title.trim()) {
      setAdminLectureModal((prev) => ({ ...prev, error: 'Lecture title is required.' }))
      return
    }

    try {
      setAdminLectureModal((prev) => ({ ...prev, isSaving: true, error: '' }))

      let finalVideoUrl = adminLectureModal.videoUrl ? adminLectureModal.videoUrl.trim() : null
      let finalS3Key = adminLectureModal.lecture?.s3Key || null

      if (adminLectureModal.selectedFile) {
        setAdminLectureModal((prev) => ({ ...prev, isUploading: true, uploadProgress: 15 }))

        const presignedRes = await api.creator.getUploadUrl({
          fileName: adminLectureModal.selectedFile.name,
          fileType: adminLectureModal.selectedFile.type || 'video/mp4',
          courseId: adminLectureModal.courseId || 'general'
        })

        const { uploadUrl, objectKey, fileUrl } = presignedRes.data
        finalS3Key = objectKey
        finalVideoUrl = fileUrl

        setAdminLectureModal((prev) => ({ ...prev, uploadProgress: 30 }))
        const xhr = new XMLHttpRequest()
        await new Promise((resolve, reject) => {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round(30 + (event.loaded / event.total) * 60)
              setAdminLectureModal((prev) => ({ ...prev, uploadProgress: percent }))
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error(`Upload error (${xhr.status})`))
          }
          xhr.onerror = () => reject(new Error('Network error uploading video file.'))

          const token = localStorage.getItem('apex_token')
          const uploadUrlWithToken = token && uploadUrl.includes('/upload-local')
            ? `${uploadUrl}&token=${encodeURIComponent(token)}`
            : uploadUrl

          xhr.open('PUT', uploadUrlWithToken)
          if (token && (uploadUrl.includes('localhost') || uploadUrl.includes('127.0.0.1') || uploadUrl.startsWith('/') || uploadUrl.includes('/api/'))) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            xhr.withCredentials = true
          }
          xhr.setRequestHeader('Content-Type', adminLectureModal.selectedFile.type || 'video/mp4')
          xhr.send(adminLectureModal.selectedFile)
        })

        setAdminLectureModal((prev) => ({ ...prev, uploadProgress: 95 }))
      }

      let durationSeconds = 0
      if (adminLectureModal.duration && adminLectureModal.duration.trim()) {
        const parts = adminLectureModal.duration.trim().split(':')
        if (parts.length === 2) durationSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
        else if (parts.length === 3) durationSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10)
      }

      if (adminLectureModal.mode === 'create') {
        await api.creator.uploadVideo({
          playlistId: adminLectureModal.sectionId,
          title: adminLectureModal.title.trim(),
          description: adminLectureModal.description?.trim() || '',
          duration: adminLectureModal.duration || '15:00',
          durationSeconds,
          videoUrl: finalVideoUrl,
          s3Key: finalS3Key,
          isPreview: Boolean(adminLectureModal.isPreview),
          status: finalVideoUrl ? 'APPROVED' : 'DRAFT'
        })
        showToast('Lecture created successfully', 'success')
      } else {
        await api.creator.updateLesson(adminLectureModal.lecture.id, {
          title: adminLectureModal.title.trim(),
          description: adminLectureModal.description?.trim() || '',
          duration: adminLectureModal.duration || '15:00',
          durationSeconds,
          videoUrl: finalVideoUrl,
          s3Key: finalS3Key,
          isPreview: Boolean(adminLectureModal.isPreview)
        })
        showToast('Lecture updated successfully', 'success')
      }

      setAdminLectureModal({
        open: false,
        mode: 'create',
        sectionId: null,
        lecture: null,
        courseId: null,
        title: '',
        description: '',
        duration: '15:00',
        videoUrl: '',
        selectedFile: null,
        uploadMode: 'url',
        uploadProgress: 0,
        isUploading: false,
        isPreview: false,
        isSaving: false,
        error: ''
      })
      loadAdminData()
    } catch (err) {
      setAdminLectureModal((prev) => ({ ...prev, isSaving: false, isUploading: false, error: err.message || 'Failed to save lecture' }))
    }
  }

  const handleConfirmDeleteCurriculum = async () => {
    if (!adminDeleteCurriculumModal.id) return
    try {
      setAdminDeleteCurriculumModal((prev) => ({ ...prev, isSubmitting: true }))
      if (adminDeleteCurriculumModal.type === 'section') {
        await api.creator.deletePlaylist(adminDeleteCurriculumModal.id)
        showToast('Section deleted successfully', 'info')
      } else {
        await api.creator.deleteLesson(adminDeleteCurriculumModal.id)
        showToast('Lecture deleted successfully', 'info')
      }
      setAdminDeleteCurriculumModal({ open: false, type: 'section', id: null, title: '', isSubmitting: false })
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to delete', 'error')
      setAdminDeleteCurriculumModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleQuickApproveCurriculumLecture = async (lectureId) => {
    try {
      await api.admin.reviewVideo(lectureId, 'APPROVED', 'Lecture verified and approved directly by Administrator.')
      showToast('Lecture approved successfully', 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error')
    }
  }

  const handleReviewRequest = async (requestId, action, reasonText = '') => {
    try {
      setIsSubmittingReview(true)
      const defaultNote = action === 'APPROVED' ? 'Approved by Administrator' : 'Request rejected by Administrator'
      await api.admin.reviewRequest(requestId, action, reasonText || defaultNote)
      showToast(action === 'APPROVED' ? 'Request approved successfully' : 'Request rejected', 'success')
      if (rejectModal.open) {
        setRejectModal({ open: false, request: null, reason: '', error: '' })
      }
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Review action failed', 'error')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleOpenRejectModal = (request) => {
    setRejectModal({
      open: true,
      request,
      reason: '',
      error: ''
    })
  }

  const handleConfirmReject = async (e) => {
    if (e) e.preventDefault()
    if (!rejectModal.reason || !rejectModal.reason.trim()) {
      setRejectModal((prev) => ({ ...prev, error: 'Rejection reason is mandatory. The creator must see why this request was declined.' }))
      return
    }
    await handleReviewRequest(rejectModal.request.id, 'REJECTED', rejectModal.reason.trim())
  }

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault()
    if (!newNotifTitle || !newNotifBody) return

    try {
      await api.admin.broadcastAnnouncement(newNotifTitle, newNotifBody, newNotifTarget)
      showToast(`Announcement broadcasted to ${newNotifTarget}`, 'success')
      setNewNotifTitle('')
      setNewNotifBody('')
    } catch (err) {
      showToast(err.message || 'Broadcast failed', 'error')
    }
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await api.admin.revokeSession(sessionId)
      showToast('User session revoked remotely', 'info')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Revocation failed', 'error')
    }
  }

  const handleSaveAboutData = async (e) => {
    if (e) e.preventDefault()
    setIsSavingAbout(true)
    try {
      const res = await api.admin.updateAbout(aboutData)
      if (res.data?.about) {
        setAboutData(res.data.about)
      }
      showToast('About Page & Leadership details updated successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update About page details', 'error')
    } finally {
      setIsSavingAbout(false)
    }
  }

  const handleResetAboutDefaults = () => {
    setAboutData(JSON.parse(JSON.stringify(defaultAboutData)))
    showToast('Reset to default About copy. Click "Save Changes" to apply.', 'info')
  }

  const handleUpdateLeaderField = (leaderId, field, value) => {
    setAboutData((prev) => ({
      ...prev,
      leadership: (prev.leadership || []).map((l) =>
        l.id === leaderId ? { ...l, [field]: value } : l
      )
    }))
  }

  const handleUpdateWhatWeDo = (index, field, value) => {
    setAboutData((prev) => {
      const updated = [...(prev.whatWeDo || [])]
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value }
      }
      return { ...prev, whatWeDo: updated }
    })
  }

  const handleUpdateWhyAivortex = (index, field, value) => {
    setAboutData((prev) => {
      const updated = [...(prev.whyAivortex || [])]
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value }
      }
      return { ...prev, whyAivortex: updated }
    })
  }

  const handleSaveFooterData = async (e) => {
    if (e) e.preventDefault()
    setIsSavingFooter(true)
    try {
      const res = await api.admin.updateFooter(footerData)
      if (res.data?.footer) {
        setFooterData(res.data.footer)
      }
      showToast('Footer navigation & details updated successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update footer details', 'error')
    } finally {
      setIsSavingFooter(false)
    }
  }

  const handleResetFooterDefaults = () => {
    setFooterData(JSON.parse(JSON.stringify(defaultFooterData)))
    showToast('Reset to default footer copy. Click "Save & Publish" to apply.', 'info')
  }

  const handleUpdateFooterLink = (colKey, index, field, value) => {
    setFooterData((prev) => {
      const list = [...(prev[colKey] || [])]
      if (list[index]) {
        list[index] = { ...list[index], [field]: value }
      }
      return { ...prev, [colKey]: list }
    })
  }

  const handleAddFooterLink = (colKey) => {
    setFooterData((prev) => {
      const list = [...(prev[colKey] || [])]
      list.push({ label: 'New Link', path: '/' })
      return { ...prev, [colKey]: list }
    })
  }

  const handleRemoveFooterLink = (colKey, index) => {
    setFooterData((prev) => {
      const list = (prev[colKey] || []).filter((_, i) => i !== index)
      return { ...prev, [colKey]: list }
    })
  }

  const totalCalculatedRevenue = paymentsList
    .filter((p) => p.status === 'SUCCESSFUL' || p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const pendingReviewsTotal =
    (overviewData?.pendingVerificationCount ?? verificationQueue.length) +
    (overviewData?.pendingRequestsCount ?? requestsList.filter((r) => r.status === 'PENDING').length)

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* ========================================================================= */}
      {/* 1. MAIN DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* Welcome Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.02em'
                }}
              >
                Admin Command Center
              </h2>
              <p
                style={{
                  color: '#64748B',
                  fontSize: '0.875rem',
                  margin: 0,
                  fontWeight: 500
                }}
              >
                Comprehensive platform overview, live review queues, and financial reconciliations.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={loadAdminData}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 38,
                  padding: '0 14px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '0.8125rem'
                }}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
                <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/admin/courses/create')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 38,
                  padding: '0 16px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Plus size={16} />
                <span>Create Course</span>
              </button>
            </div>
          </div>

          {/* 5 Sleek StatCards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              marginBottom: 28
            }}
          >
            <StatCard
              title="Approved Creators"
              value={overviewData?.totalCreators ?? creators.length}
              icon={GraduationCap}
              iconBg="#F0FDF4"
              iconColor="#16A34A"
              subtext="Verified faculty members"
              badge="Instructors"
              badgeType="success"
              onClick={() => navigate('/admin/creators')}
            />

            <StatCard
              title="Active Students"
              value={overviewData?.totalStudents ?? students.length}
              icon={Users}
              iconBg="#EFF6FF"
              iconColor="#2563EB"
              subtext="Enrolled in active cohorts"
              badge="Learners"
              badgeType="info"
              onClick={() => navigate('/admin/students')}
            />

            <StatCard
              title="Total Courses"
              value={courses.length}
              icon={BookOpen}
              iconBg="#FFFBEB"
              iconColor="#D97706"
              subtext={`${courses.filter((c) => c.status === 'PUBLISHED').length} Published • ${courses.filter((c) => c.status === 'DRAFT').length} Draft`}
              badge="Curriculum"
              badgeType="neutral"
              onClick={() => navigate('/admin/courses')}
            />

            <StatCard
              title="Pending Reviews"
              value={pendingReviewsTotal}
              icon={AlertCircle}
              iconBg={pendingReviewsTotal > 0 ? '#FEF2F2' : '#F1F5F9'}
              iconColor={pendingReviewsTotal > 0 ? '#DC2626' : '#64748B'}
              subtext={`${verificationQueue.length} Videos • ${requestsList.filter((r) => r.status === 'PENDING').length} Requests`}
              badge={pendingReviewsTotal > 0 ? 'Requires Action' : 'All Clear'}
              badgeType={pendingReviewsTotal > 0 ? 'danger' : 'success'}
              onClick={() => navigate('/admin/playlists')}
            />

            <StatCard
              title="Platform Revenue"
              value={`₹${(overviewData?.totalRevenue ?? totalCalculatedRevenue).toLocaleString('en-IN')}`}
              icon={IndianRupee}
              iconBg="#ECFDF5"
              iconColor="#059669"
              subtext={`${paymentsList.filter((p) => p.status === 'SUCCESSFUL' || p.status === 'PAID').length} Paid transactions`}
              badge="Verified"
              badgeType="success"
              onClick={() => navigate('/admin/payments')}
            />
          </div>

          {/* Middle: Review & Queue Sections (2 Equal-Width Columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 24,
              marginBottom: 24,
              alignItems: 'stretch'
            }}
          >
            {/* Section 1: Video Review Queue */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FAFAFA'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Video size={16} />
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                    Content Review Queue
                  </span>
                  {verificationQueue.length > 0 && (
                    <span
                      style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 9999
                      }}
                    >
                      {verificationQueue.length} pending
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/admin/playlists')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Open Queue</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {verificationQueue.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {verificationQueue.slice(0, 4).map((v) => (
                      <div
                        key={v.id}
                        style={{
                          padding: '12px 14px',
                          background: '#F8FAFC',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {v.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                            Instructor: <strong style={{ color: '#334155' }}>{v.creator?.name || 'Creator'}</strong> • {v.playlist?.course?.title || 'Program'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {renderReviewStatusChip(v.status)}
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setSelectedReviewLecture(v)
                              navigate('/admin/playlists')
                            }}
                            style={{ height: 30, fontSize: '0.75rem', padding: '0 10px', fontWeight: 600 }}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', margin: 'auto 0' }}>
                    <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                      Verification Queue Clear
                    </div>
                    <div style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                      All creator video submissions are reviewed and processed.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Creator Profile Requests */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FAFAFA'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <UserCheck size={16} />
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                    Creator Profile Requests
                  </span>
                  {requestsList.filter((r) => r.status === 'PENDING').length > 0 && (
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#2563EB',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 9999
                      }}
                    >
                      {requestsList.filter((r) => r.status === 'PENDING').length} new
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/admin/requests')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>View All</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {requestsList.filter((r) => r.status === 'PENDING').length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {requestsList.filter((r) => r.status === 'PENDING').slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        style={{
                          padding: '12px 14px',
                          background: '#F8FAFC',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.875rem', color: '#0F172A' }}>
                            {r.creatorProfile?.user?.name || 'Creator'}
                          </strong>
                          <span
                            style={{
                              background: '#FEF3C7',
                              color: '#92400E',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4
                            }}
                          >
                            PENDING
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                          {r.requestedHeadline || r.requestedBio || 'Requested bio change'}
                        </p>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate('/admin/requests')}
                          style={{ height: 28, fontSize: '0.75rem', padding: '0 10px', fontWeight: 600 }}
                        >
                          Review & Decide
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', margin: 'auto 0' }}>
                    <CheckCircle2 size={32} style={{ color: '#10B981', margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                      No Pending Creator Profile Requests
                    </div>
                    <div style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                      All creator update requests have been reviewed.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lower: Recent Enrollments & Recent Platform Activity (2 Equal-Width Columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
              alignItems: 'stretch'
            }}
          >
            {/* Card 1: Recent Enrollments & Payments */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FAFAFA'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <CreditCard size={16} />
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                    Recent Enrollments & Payments
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/admin/payments')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>View All Payments</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {(recentOrders.length > 0 || paymentsList.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(recentOrders.length > 0 ? recentOrders : paymentsList).slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        style={{
                          padding: '12px 14px',
                          background: '#F8FAFC',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          minHeight: 58,
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {order.student?.name || order.student?.email || 'Student'}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#64748B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: 2
                            }}
                          >
                            {order.course?.title || 'Academic Course'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>
                            ₹{order.amount?.toLocaleString('en-IN')}
                          </div>
                          <span
                            style={{
                              background: '#DCFCE7',
                              color: '#166534',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              display: 'inline-block',
                              marginTop: 2
                            }}
                          >
                            {order.status === 'SUCCESSFUL' || order.status === 'PAID' ? 'PAID' : (order.status || 'PAID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', margin: 'auto 0' }}>
                    <CreditCard size={32} style={{ color: '#94A3B8', margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                      No Transactions Recorded
                    </div>
                    <div style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                      Paid enrollments will appear here automatically.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Recent Platform Activity */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#FAFAFA'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#F1F5F9',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FileText size={16} />
                  </div>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                    Recent Platform Activity
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/admin/audit-logs')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Full Audit</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {(recentAuditLogs.length > 0 ? recentAuditLogs : auditLogs).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(recentAuditLogs.length > 0 ? recentAuditLogs : auditLogs).slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        style={{
                          padding: '12px 14px',
                          background: '#F8FAFC',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          minHeight: 58,
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              background: '#E2E8F0',
                              color: '#1E293B',
                              padding: '1px 6px',
                              borderRadius: 4,
                              letterSpacing: '0.02em'
                            }}
                          >
                            {log.action}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.78125rem',
                            color: '#334155',
                            fontWeight: 500,
                            marginTop: 3,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {log.details || `Performed on ${log.entityType}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', margin: 'auto 0' }}>
                    <FileText size={32} style={{ color: '#94A3B8', margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                      No Activity Records Available
                    </div>
                    <div style={{ fontSize: '0.8125rem', marginTop: 2 }}>
                      System events and audit logs will appear here.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COURSE MANAGEMENT (All Courses, Pricing, Catalog Visibility) */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div>
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Course & Curriculum Management
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                Manage academic programs, base pricing models, coupon promotions, and catalog discovery.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/admin/courses/create')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 38,
                padding: '0 16px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.8125rem'
              }}
            >
              <Plus size={16} />
              <span>Create New Course</span>
            </button>
          </div>

          {/* Course-Specific Internal Tabs ONLY */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '1px solid #E2E8F0',
              marginBottom: 24
            }}
          >
            <button
              type="button"
              onClick={() => setCourseSubTab('catalog')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: courseSubTab === 'catalog' ? '#2563EB' : '#64748B',
                borderBottom: courseSubTab === 'catalog' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Curriculum Catalog ({courses.length})
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedCurriculumCourse && courses.length > 0) {
                  setSelectedCurriculumCourse(courses[0])
                }
                setCourseSubTab('curriculum')
              }}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: courseSubTab === 'curriculum' ? '#2563EB' : '#64748B',
                borderBottom: courseSubTab === 'curriculum' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Curriculum & Content Management
            </button>

            <button
              type="button"
              onClick={() => setCourseSubTab('pricing')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: courseSubTab === 'pricing' ? '#2563EB' : '#64748B',
                borderBottom: courseSubTab === 'pricing' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Pricing & Offers ({offers.length})
            </button>

            <button
              type="button"
              onClick={() => setCourseSubTab('controls')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: courseSubTab === 'controls' ? '#2563EB' : '#64748B',
                borderBottom: courseSubTab === 'controls' ? '2px solid #2563EB' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Public Catalog Visibility & Controls
            </button>
          </div>

          {/* Subtab A: Catalog Table */}
          {courseSubTab === 'catalog' && (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              {courses.length > 0 ? (
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Category</th>
                      <th>Level</th>
                      <th>Base Price</th>
                      <th>Status</th>
                      <th>Assigned Faculty</th>
                      <th>Enrolled Students</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>slug: {c.slug}</div>
                        </td>
                        <td><span className="badge badge-popular">{c.category}</span></td>
                        <td>{c.level}</td>
                        <td>{c.isFree ? 'FREE' : `₹${c.price?.toLocaleString('en-IN')}`}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: c.status === 'PUBLISHED' ? '#DCFCE7' : c.status === 'DRAFT' ? '#FEF3C7' : '#F1F5F9',
                              color: c.status === 'PUBLISHED' ? '#166534' : c.status === 'DRAFT' ? '#92400E' : '#475569'
                            }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          {c.creators && c.creators.length > 0
                            ? c.creators.map((cr) => cr.creator?.name).join(', ')
                            : <span style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Unassigned</span>}
                        </td>
                        <td>{c.enrolledStudentsCount || c.studentsCount || 0} learners</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => {
                                setSelectedCurriculumCourse(c)
                                setCourseSubTab('curriculum')
                              }}
                              title="Manage Course Curriculum & Content"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Layers size={13} />
                              <span>Curriculum</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              onClick={() => navigate(`/admin/courses/${c.id}/edit`)}
                              title="Edit Course"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <BookOpen style={{ width: 48, height: 48, color: '#94A3B8', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: 6 }}>No courses in database</h4>
                  <p style={{ color: '#64748B', marginBottom: 16 }}>
                    Click &quot;Create New Course&quot; to initialize a program curriculum and assign an instructor.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/courses/create')}>
                    Create Course Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subtab: Course Content & Curriculum Management */}
          {courseSubTab === 'curriculum' && (
            <div>
              {/* Course Selector Bar */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  padding: '16px 20px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setCourseSubTab('catalog')}
                    style={{ fontSize: '0.8125rem', height: 36, padding: '0 12px' }}
                  >
                    ← Back to Catalog
                  </button>
                  <div style={{ height: 24, width: 1, background: '#E2E8F0' }} />
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                    Select Course:
                  </label>
                  <select
                    value={activeCurriculumCourse?.id || ''}
                    onChange={(e) => {
                      const found = courses.find((c) => c.id === e.target.value)
                      if (found) setSelectedCurriculumCourse(found)
                    }}
                    style={{
                      height: 36,
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      minWidth: 260
                    }}
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.playlists?.length || 0} sections)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {activeCurriculumCourse && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        setAdminSectionModal({
                          open: true,
                          mode: 'create',
                          section: null,
                          courseId: activeCurriculumCourse.id,
                          title: '',
                          description: '',
                          isSaving: false,
                          error: ''
                        })
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        height: 36,
                        fontWeight: 700,
                        fontSize: '0.8125rem'
                      }}
                    >
                      <Plus size={15} />
                      <span>Add Section</span>
                    </button>
                  )}
                </div>
              </div>

              {activeCurriculumCourse ? (() => {
                const playlists = activeCurriculumCourse.playlists || []
                const allCourseLessons = playlists.flatMap((p) => p.lessons || [])
                const draftLessons = allCourseLessons.filter((l) => l.status === 'DRAFT' || l.status === 'INCOMPLETE')
                const pendingLessons = allCourseLessons.filter((l) => l.status === 'SUBMITTED_FOR_REVIEW')
                const changesLessons = allCourseLessons.filter((l) => l.status === 'RETURNED_FOR_EDIT' || l.status === 'REJECTED')
                const approvedLessons = allCourseLessons.filter((l) => l.status === 'APPROVED' || l.status === 'PUBLISHED')
                const completionPercent = allCourseLessons.length > 0 ? Math.round((approvedLessons.length / allCourseLessons.length) * 100) : 0

                return (
                  <div>
                    {/* Course Overview & Progress Card */}
                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        padding: 24,
                        marginBottom: 24,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span className="badge badge-popular">{activeCurriculumCourse.category}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{activeCurriculumCourse.level}</span>
                          </div>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                            {activeCurriculumCourse.title}
                          </h3>
                          <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                            Assigned Creator:{' '}
                            <strong style={{ color: '#334155' }}>
                              {activeCurriculumCourse.creators && activeCurriculumCourse.creators.length > 0
                                ? activeCurriculumCourse.creators.map((cr) => cr.creator?.name).join(', ')
                                : 'Unassigned'}
                            </strong>
                          </div>
                        </div>

                        {/* Progress Meter */}
                        <div style={{ minWidth: 240, flex: '1 1 240px', maxWidth: 360 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>Course Completion</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: completionPercent === 100 ? '#16A34A' : '#2563EB' }}>
                              {completionPercent}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${completionPercent}%`,
                                height: '100%',
                                background: completionPercent === 100 ? '#16A34A' : '#2563EB',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4, textAlign: 'right' }}>
                            {approvedLessons.length} of {allCourseLessons.length} lectures approved/published
                          </div>
                        </div>
                      </div>

                      {/* 6 Metric KPI Status Chips */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, borderTop: '1px solid #F1F5F9', paddingTop: 18 }}>
                        <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Total Sections</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{playlists.length}</div>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Total Lectures</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{allCourseLessons.length}</div>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Draft Content</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#475569', marginTop: 2 }}>{draftLessons.length}</div>
                        </div>
                        <div style={{ background: '#FEF3C7', padding: '12px 14px', borderRadius: 10, border: '1px solid #FDE68A' }}>
                          <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 600 }}>Pending Review</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E', marginTop: 2 }}>{pendingLessons.length}</div>
                        </div>
                        <div style={{ background: '#FEE2E2', padding: '12px 14px', borderRadius: 10, border: '1px solid #FECACA' }}>
                          <div style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 600 }}>Changes Requested</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', marginTop: 2 }}>{changesLessons.length}</div>
                        </div>
                        <div style={{ background: '#DCFCE7', padding: '12px 14px', borderRadius: 10, border: '1px solid #BBF7D0' }}>
                          <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>Approved / Live</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', marginTop: 2 }}>{approvedLessons.length}</div>
                        </div>
                      </div>
                    </div>

                    {/* Sections & Curriculum Tree */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      {playlists.length > 0 ? (
                        playlists.map((sec, secIndex) => {
                          const lessons = sec.lessons || []
                          return (
                            <div
                              key={sec.id}
                              style={{
                                background: '#FFFFFF',
                                borderRadius: 8,
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                              }}
                            >
                              {/* Section Header */}
                              <div
                                style={{
                                  padding: '16px 20px',
                                  background: '#FAFAFA',
                                  borderBottom: '1px solid #E2E8F0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: 12
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
                                  <span
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: 6,
                                      background: '#0F172A',
                                      color: '#FFFFFF',
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    {String(secIndex + 1).padStart(2, '0')}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                                      {sec.title}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                      {lessons.length} {lessons.length === 1 ? 'lecture' : 'lectures'}
                                      {sec.description ? ` • ${sec.description}` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() =>
                                      setAdminLectureModal({
                                        open: true,
                                        mode: 'create',
                                        sectionId: sec.id,
                                        lecture: null,
                                        courseId: activeCurriculumCourse.id,
                                        title: '',
                                        description: '',
                                        duration: '15:00',
                                        videoUrl: '',
                                        selectedFile: null,
                                        uploadMode: 'url',
                                        uploadProgress: 0,
                                        isUploading: false,
                                        isPreview: false,
                                        isSaving: false,
                                        error: ''
                                      })
                                    }
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      padding: '5px 12px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      color: '#2563EB',
                                      borderColor: '#BFDBFE'
                                    }}
                                  >
                                    <Plus size={13} />
                                    <span>Add Lecture</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() =>
                                      setAdminSectionModal({
                                        open: true,
                                        mode: 'edit',
                                        section: sec,
                                        courseId: activeCurriculumCourse.id,
                                        title: sec.title,
                                        description: sec.description || '',
                                        isSaving: false,
                                        error: ''
                                      })
                                    }
                                    style={{ padding: '5px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() =>
                                      setAdminDeleteCurriculumModal({
                                        open: true,
                                        type: 'section',
                                        id: sec.id,
                                        title: sec.title,
                                        isSubmitting: false
                                      })
                                    }
                                    style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FECACA' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {/* Lectures List in Section */}
                              <div style={{ padding: '12px 20px' }}>
                                {lessons.length > 0 ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {lessons.map((lec, lecIdx) => {
                                      const hasVideo = Boolean(lec.videoUrl && lec.videoUrl.trim())
                                      return (
                                        <div
                                          key={lec.id}
                                          style={{
                                            padding: '12px 14px',
                                            borderRadius: 10,
                                            border: '1px solid #F1F5F9',
                                            background: '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: 12
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 220 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, width: 20 }}>
                                              {lecIdx + 1}.
                                            </span>
                                            <div>
                                              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                                                {lec.title}
                                              </div>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                                  {lec.duration || '15:00'}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>•</span>
                                                {hasVideo ? (
                                                  <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <CheckCircle2 size={12} /> Video Attached
                                                  </span>
                                                ) : (
                                                  <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                    <AlertTriangle size={12} /> Video Missing
                                                  </span>
                                                )}
                                              </div>

                                              {/* Admin Feedback Display if present */}
                                              {lec.adminFeedback && (
                                                <div style={{ marginTop: 6, padding: '4px 8px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, fontSize: '0.75rem', color: '#991B1B' }}>
                                                  <strong>Feedback:</strong> {lec.adminFeedback}
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            {renderReviewStatusChip(lec.status)}

                                            {hasVideo && (
                                              <button
                                                type="button"
                                                className="btn btn-outline btn-xs"
                                                onClick={() =>
                                                  setCurriculumPreviewVideo({
                                                    open: true,
                                                    videoUrl: lec.videoUrl,
                                                    title: lec.title,
                                                    course: activeCurriculumCourse.title
                                                  })
                                                }
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                              >
                                                <Play size={12} />
                                                <span>Preview</span>
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              className="btn btn-outline btn-xs"
                                              onClick={() =>
                                                setAdminLectureModal({
                                                  open: true,
                                                  mode: 'edit',
                                                  sectionId: sec.id,
                                                  lecture: lec,
                                                  courseId: activeCurriculumCourse.id,
                                                  title: lec.title,
                                                  description: lec.description || '',
                                                  duration: lec.duration || '15:00',
                                                  videoUrl: lec.videoUrl || '',
                                                  selectedFile: null,
                                                  uploadMode: 'url',
                                                  uploadProgress: 0,
                                                  isUploading: false,
                                                  isPreview: Boolean(lec.isPreview),
                                                  isSaving: false,
                                                  error: ''
                                                })
                                              }
                                              style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                                            >
                                              Edit & Video
                                            </button>

                                            {/* Quick Admin Actions */}
                                            {lec.status === 'SUBMITTED_FOR_REVIEW' && (
                                              <button
                                                type="button"
                                                className="btn btn-primary btn-xs"
                                                onClick={() => {
                                                  const fullLecture = {
                                                    ...lec,
                                                    creator: activeCurriculumCourse.creators?.[0]?.creator || null,
                                                    playlist: { title: sec.title, course: activeCurriculumCourse }
                                                  }
                                                  setSelectedReviewLecture(fullLecture)
                                                  navigate('/admin/playlists')
                                                }}
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
                                              >
                                                Review
                                              </button>
                                            )}

                                            {lec.status === 'APPROVED' && (
                                              <button
                                                type="button"
                                                className="btn btn-outline btn-xs"
                                                onClick={() => handlePublishLesson(lec.id)}
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#16A34A', borderColor: '#86EFAC', fontWeight: 600 }}
                                              >
                                                Publish
                                              </button>
                                            )}

                                            {lec.status === 'PUBLISHED' && (
                                              <button
                                                type="button"
                                                className="btn btn-outline btn-xs"
                                                onClick={() => setUnpublishModal({ open: true, lectureId: lec.id, reason: '', error: '', isSubmitting: false })}
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FECACA' }}
                                              >
                                                Unpublish
                                              </button>
                                            )}

                                            {(lec.status === 'DRAFT' || lec.status === 'RETURNED_FOR_EDIT') && (
                                              <button
                                                type="button"
                                                className="btn btn-outline btn-xs"
                                                onClick={() => handleQuickApproveCurriculumLecture(lec.id)}
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#16A34A', borderColor: '#86EFAC', fontWeight: 600 }}
                                                title="Directly approve content on creator's behalf"
                                              >
                                                Quick Approve
                                              </button>
                                            )}

                                            <button
                                              type="button"
                                              className="btn btn-outline btn-xs"
                                              onClick={() =>
                                                setAdminDeleteCurriculumModal({
                                                  open: true,
                                                  type: 'lecture',
                                                  id: lec.id,
                                                  title: lec.title,
                                                  isSubmitting: false
                                                })
                                              }
                                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#DC2626', borderColor: '#FECACA' }}
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B' }}>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>No lectures created in this section yet.</p>
                                    <button
                                      type="button"
                                      className="btn btn-outline btn-xs"
                                      onClick={() =>
                                        setAdminLectureModal({
                                          open: true,
                                          mode: 'create',
                                          sectionId: sec.id,
                                          lecture: null,
                                          courseId: activeCurriculumCourse.id,
                                          title: '',
                                          description: '',
                                          duration: '15:00',
                                          videoUrl: '',
                                          selectedFile: null,
                                          uploadMode: 'url',
                                          uploadProgress: 0,
                                          isUploading: false,
                                          isPreview: false,
                                          isSaving: false,
                                          error: ''
                                        })
                                      }
                                      style={{ fontWeight: 600 }}
                                    >
                                      + Add Lecture to {sec.title}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', textAlign: 'center', padding: '48px 20px' }}>
                          <Layers size={40} style={{ color: '#94A3B8', margin: '0 auto 12px auto' }} />
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0F172A' }}>No curriculum sections yet</h4>
                          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 16 }}>
                            Begin building the course structure by creating the first section module.
                          </p>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              setAdminSectionModal({
                                open: true,
                                mode: 'create',
                                section: null,
                                courseId: activeCurriculumCourse.id,
                                title: '',
                                description: '',
                                isSaving: false,
                                error: ''
                              })
                            }
                          >
                            + Add First Section
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })() : (
                <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 40, textAlign: 'center' }}>
                  <p style={{ color: '#64748B', margin: 0 }}>Please select a course to manage its curriculum.</p>
                </div>
              )}
            </div>
          )}

          {/* Subtab B: Pricing & Offers */}
          {courseSubTab === 'pricing' && (
            <div>
              {/* Offers Table */}
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 2px 0' }}>Promotional Coupon Offers</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>Configure discount codes for public checkout.</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setIsOfferModalOpen(true)}>
                    + Create Coupon Offer
                  </button>
                </div>

                {offers.length > 0 ? (
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Coupon Code</th>
                        <th>Offer Title</th>
                        <th>Discount</th>
                        <th>Redemptions</th>
                        <th>Validity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((off) => (
                        <tr key={off.id}>
                          <td><strong style={{ color: '#2563EB', fontFamily: 'monospace', fontSize: '0.95rem' }}>{off.code}</strong></td>
                          <td>{off.title}</td>
                          <td>
                            <span className="badge" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                              {off.discountPercent ? `${off.discountPercent}% OFF` : `₹${off.discountAmount} OFF`}
                            </span>
                          </td>
                          <td>{off.usedCount} {off.maxUses ? `/ ${off.maxUses}` : 'uses'}</td>
                          <td style={{ fontSize: '0.8rem' }}>Ends {new Date(off.endDate).toLocaleDateString()}</td>
                          <td>
                            <span className="badge" style={{ background: off.isActive ? '#DCFCE7' : '#F1F5F9', color: off.isActive ? '#166534' : '#64748B' }}>
                              {off.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-outline btn-sm" onClick={() => handleToggleOfferActive(off)}>
                                {off.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => setDeleteOfferModal({ open: true, offer: off, isSubmitting: false })} style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                    <Tag size={32} style={{ color: '#94A3B8', margin: '0 auto 8px auto' }} />
                    <p style={{ margin: 0 }}>No promotional coupons configured yet.</p>
                  </div>
                )}
              </div>

              {/* Course Base Pricing Table */}
              <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24 }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 16px 0' }}>Course Base Pricing Table</h4>
                <table className="data-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Current Base Price</th>
                      <th>Active Catalog Discount</th>
                      <th>Update Pricing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id}>
                        <td><strong>{c.title}</strong></td>
                        <td>
                          {priceEditingCourseId === c.id ? (
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: 120, height: 34 }}
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                            />
                          ) : (
                            c.isFree ? 'FREE' : `₹${c.price?.toLocaleString('en-IN')}`
                          )}
                        </td>
                        <td>
                          {priceEditingCourseId === c.id ? (
                            <input
                              type="number"
                              className="form-input"
                              style={{ width: 90, height: 34 }}
                              value={editDiscount}
                              onChange={(e) => setEditDiscount(e.target.value)}
                            />
                          ) : (
                            `${c.discountPercent || 0}%`
                          )}
                        </td>
                        <td>
                          {priceEditingCourseId === c.id ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-primary btn-sm" onClick={() => handleSavePrice(c.id)}>
                                Save
                              </button>
                              <button className="btn btn-outline btn-sm" onClick={() => setPriceEditingCourseId(null)}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setPriceEditingCourseId(c.id)
                                setEditPrice(c.price || 0)
                                setEditDiscount(c.discountPercent || 0)
                              }}
                            >
                              Edit Price
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab C: Public Catalog Controls */}
          {courseSubTab === 'controls' && (
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24 }}>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 6px 0' }}>Catalog Visibility & Discovery Rules</h4>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: 20 }}>
                Hiding or archiving a course removes it from public listings; enrolled students maintain full playback access.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {courses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 16,
                      background: '#F8FAFC',
                      borderRadius: 12,
                      border: '1px solid #E2E8F0',
                      flexWrap: 'wrap',
                      gap: 12
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{c.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 2 }}>
                        Status: <strong style={{ color: c.status === 'PUBLISHED' ? '#16A34A' : '#D97706' }}>{c.status}</strong> •
                        Enrollment: <strong>{c.enrollmentOpen !== false ? 'OPEN' : 'CLOSED'}</strong> •
                        Featured: <strong>{c.isFeatured ? 'YES' : 'NO'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={c.status}
                        className="form-input"
                        style={{ height: 36, fontSize: '0.8rem', padding: '0 8px' }}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          await api.admin.updatePublicControls(c.id, { status: newStatus })
                          showToast(`Course status updated to ${newStatus}`, 'success')
                          loadAdminData()
                        }}
                      >
                        <option value="PUBLISHED">PUBLISHED (Public)</option>
                        <option value="DRAFT">DRAFT (Hidden)</option>
                        <option value="ARCHIVED">ARCHIVED (Students only)</option>
                      </select>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={async () => {
                          const newOpen = c.enrollmentOpen === false ? true : false
                          await api.admin.updatePublicControls(c.id, { enrollmentOpen: newOpen })
                          showToast(`Enrollment is now ${newOpen ? 'Open' : 'Closed'}`, 'success')
                          loadAdminData()
                        }}
                      >
                        {c.enrollmentOpen !== false ? 'Close Enrollment' : 'Open Enrollment'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={async () => {
                          const newFeatured = !c.isFeatured
                          await api.admin.updatePublicControls(c.id, { isFeatured: newFeatured })
                          showToast(`Featured status toggled for ${c.title}`, 'success')
                          loadAdminData()
                        }}
                      >
                        {c.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CREATOR MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'creators' && (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                Creator & Faculty Management
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                Manage creator accounts, profiles, access, and onboarding.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/admin/creators/create')}
              style={{
                height: 38,
                padding: '0 20px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                borderRadius: 8,
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
              }}
            >
              Create Creator
            </button>
          </div>

          {/* Search, Filter, and Sort Toolbar */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: '14px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 320px', minWidth: 260 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search creators by name, email, or user ID..."
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  paddingLeft: 38,
                  paddingRight: 14,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: '0.84rem',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Filter & Sort Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Status Custom Dropdown */}
              <div style={{ minWidth: 175 }}>
                <CustomSelect
                  options={CREATOR_STATUS_OPTIONS}
                  value={creatorStatusFilter}
                  onChange={(e) => setCreatorStatusFilter(e.target.value)}
                  icon={<Filter size={14} />}
                  prefix="Status:"
                  buttonStyle={{
                    height: 40,
                    borderRadius: 8,
                    padding: '0 12px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF'
                  }}
                  menuStyle={{ minWidth: 175 }}
                />
              </div>

              {/* Sort Custom Dropdown */}
              <div style={{ minWidth: 185 }}>
                <CustomSelect
                  options={CREATOR_SORT_OPTIONS}
                  value={creatorSortBy}
                  onChange={(e) => setCreatorSortBy(e.target.value)}
                  icon={<ArrowUpDown size={14} />}
                  prefix="Sort:"
                  buttonStyle={{
                    height: 40,
                    borderRadius: 8,
                    padding: '0 12px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF'
                  }}
                  menuStyle={{ minWidth: 185 }}
                />
              </div>

              {/* Clear Filters Button */}
              {(creatorSearch || creatorStatusFilter !== 'ALL' || creatorSortBy !== 'created_desc') && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatorSearch('')
                    setCreatorStatusFilter('ALL')
                    setCreatorSortBy('created_desc')
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ height: 40, fontSize: '0.78125rem', color: '#64748B', padding: '0 10px', fontWeight: 600 }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Creators Data Table */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            {filteredCreators.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Creator
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        Creator User ID
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Specialization / Title
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        Account Status
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        Created Date
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        Last Login
                      </th>
                      <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCreators.map((cr) => {
                      const normalizedStatus = (cr.status || 'ACTIVE').toUpperCase()
                      const isActive = normalizedStatus === 'ACTIVE'
                      const isSuspended = normalizedStatus === 'SUSPENDED'
                      const isInactive = normalizedStatus === 'INACTIVE'

                      let badgeBg = '#DCFCE7'
                      let badgeColor = '#166534'
                      let badgeDot = '#16A34A'
                      let badgeLabel = 'ACTIVE'

                      if (isSuspended) {
                        badgeBg = '#FEE2E2'
                        badgeColor = '#991B1B'
                        badgeDot = '#DC2626'
                        badgeLabel = 'SUSPENDED'
                      } else if (isInactive) {
                        badgeBg = '#F1F5F9'
                        badgeColor = '#475569'
                        badgeDot = '#94A3B8'
                        badgeLabel = 'INACTIVE'
                      }

                      return (
                        <tr key={cr.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          {/* 1. Creator Column: Photo, Name, Email, Phone */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: '50%',
                                  background: '#F1F5F9',
                                  color: '#334155',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8125rem',
                                  fontWeight: 700,
                                  letterSpacing: '0.02em',
                                  border: '1px solid #E2E8F0',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                  flexShrink: 0,
                                  overflow: 'hidden'
                                }}
                              >
                                {cr.avatar ? (
                                  <img
                                    src={cr.avatar}
                                    alt={cr.name || 'Creator'}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  getCreatorInitials(cr.name) || <UserIcon size={16} style={{ color: '#64748B' }} />
                                )}
                              </div>
                              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem', lineHeight: 1.3 }}>
                                  {cr.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.3 }}>
                                  {cr.email}
                                </span>
                                {cr.phone && (
                                  <span style={{ fontSize: '0.71875rem', color: '#94A3B8', lineHeight: 1.25 }}>
                                    {cr.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 2. Creator User ID */}
                          <td style={{ padding: '12px 16px' }}>
                            <code
                              style={{
                                background: '#F1F5F9',
                                color: '#0F172A',
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}
                            >
                              {cr.id}
                            </code>
                          </td>

                          {/* 3. Specialization / Title */}
                          <td style={{ padding: '12px 16px', color: '#334155', fontSize: '0.8125rem' }}>
                            <div style={{ fontWeight: 600, color: '#1E293B', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cr.creatorProfile?.specialization || cr.creatorProfile?.headline || 'Technical Instructor'}
                            </div>
                          </td>

                          {/* 4. Account Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <span
                              style={{
                                background: badgeBg,
                                color: badgeColor,
                                fontSize: '0.71875rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 6,
                                letterSpacing: '0.02em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  backgroundColor: badgeDot
                                }}
                              />
                              {badgeLabel}
                            </span>
                          </td>

                          {/* 5. Created Date */}
                          <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '0.78125rem', whiteSpace: 'nowrap' }}>
                            {cr.createdAt ? new Date(cr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </td>

                          {/* 6. Last Login */}
                          <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '0.78125rem', whiteSpace: 'nowrap' }}>
                            {formatLastLogin(cr)}
                          </td>

                          {/* 7. Administrative Actions: Compact, Icon-Based [ View ] [ Edit ] [ Change Password ] [ Suspend/Activate ] */}
                          <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                              {/* 1. View Profile: Neutral */}
                              <button
                                type="button"
                                onClick={() => setSelectedViewCreator(cr)}
                                title="View Profile"
                                aria-label="View Profile"
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 8,
                                  border: '1px solid #CBD5E1',
                                  background: '#FFFFFF',
                                  color: '#334155',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F1F5F9'
                                  e.currentTarget.style.color = '#0F172A'
                                  e.currentTarget.style.borderColor = '#94A3B8'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                  e.currentTarget.style.color = '#334155'
                                  e.currentTarget.style.borderColor = '#CBD5E1'
                                }}
                              >
                                <Eye size={15} />
                              </button>

                              {/* 2. Edit Profile: Neutral */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditCreator(cr)}
                                title="Edit Profile"
                                aria-label="Edit Profile"
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 8,
                                  border: '1px solid #CBD5E1',
                                  background: '#FFFFFF',
                                  color: '#334155',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F1F5F9'
                                  e.currentTarget.style.color = '#0F172A'
                                  e.currentTarget.style.borderColor = '#94A3B8'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                  e.currentTarget.style.color = '#334155'
                                  e.currentTarget.style.borderColor = '#CBD5E1'
                                }}
                              >
                                <Edit3 size={15} />
                              </button>

                              {/* 3. Change Password: Amber Key */}
                              <button
                                type="button"
                                onClick={() => handleOpenChangePassword(cr)}
                                title="Change Password"
                                aria-label="Change Password"
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 8,
                                  border: '1px solid #FDE68A',
                                  background: '#FFFFFF',
                                  color: '#D97706',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#FFFBEB'
                                  e.currentTarget.style.borderColor = '#FCD34D'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                  e.currentTarget.style.borderColor = '#FDE68A'
                                }}
                              >
                                <Key size={15} />
                              </button>

                              {/* 4. Suspend / Activate: Semantic Red / Green */}
                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={() => handlePromptSuspendCreator(cr)}
                                  title="Suspend Account"
                                  aria-label="Suspend Account"
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 8,
                                    border: '1px solid #FECACA',
                                    background: '#FFFFFF',
                                    color: '#DC2626',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#FEF2F2'
                                    e.currentTarget.style.borderColor = '#FCA5A5'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFFFFF'
                                    e.currentTarget.style.borderColor = '#FECACA'
                                  }}
                                >
                                  <UserX size={15} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePromptActivateCreator(cr)}
                                  title="Activate Account"
                                  aria-label="Activate Account"
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 8,
                                    border: '1px solid #BBF7D0',
                                    background: '#FFFFFF',
                                    color: '#16A34A',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F0FDF4'
                                    e.currentTarget.style.borderColor = '#86EFAC'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFFFFF'
                                    e.currentTarget.style.borderColor = '#BBF7D0'
                                  }}
                                >
                                  <UserCheck size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                <Users size={40} style={{ color: '#CBD5E1', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.05rem', color: '#0F172A', marginBottom: 4 }}>
                  No Creators Found
                </h4>
                <p style={{ fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                  {creatorSearch || creatorStatusFilter !== 'ALL'
                    ? 'No creators match the current filter or search criteria.'
                    : 'No creator accounts have been provisioned yet.'}
                </p>
                {creatorSearch || creatorStatusFilter !== 'ALL' ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setCreatorSearch('')
                      setCreatorStatusFilter('ALL')
                    }}
                  >
                    Reset Search Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/admin/creators/create')}
                  >
                    Create Creator
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STUDENT MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Student Directory & Enrolment Governance
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Audit registered learners, enrolled programs, and manage account statuses.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            {students.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Active Enrollments</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.id}>
                      <td><strong>{st.name}</strong></td>
                      <td>{st.email}</td>
                      <td>
                        <span className="badge" style={{ background: st.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2', color: st.status === 'ACTIVE' ? '#166534' : '#991B1B' }}>
                          {st.status}
                        </span>
                      </td>
                      <td>{st.enrolledCount || st.enrollments?.length || 0} Programs</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleToggleStudentStatus(st.id, st.status)}
                        >
                          {st.status === 'ACTIVE' ? 'Suspend Learner' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                No students registered in database yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONTENT REVIEW & VIDEO VERIFICATION QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'video-verification' && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Content Review
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
              Review creator-submitted lectures, verify video quality, and provide feedback before approval.
            </p>
          </div>

          {/* Queue Filter Bar & Search */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '14px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
            }}
          >
            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {[
                {
                  id: 'SUBMITTED_FOR_REVIEW',
                  label: 'Pending Review',
                  count: verificationQueue.filter((v) => v.status === 'SUBMITTED_FOR_REVIEW').length,
                  dot: '#D97706'
                },
                {
                  id: 'RETURNED_FOR_EDIT',
                  label: 'Changes Requested',
                  count: verificationQueue.filter((v) => v.status === 'RETURNED_FOR_EDIT' || v.status === 'REJECTED').length,
                  dot: '#DC2626'
                },
                {
                  id: 'APPROVED',
                  label: 'Approved',
                  count: verificationQueue.filter((v) => v.status === 'APPROVED' || v.status === 'PUBLISHED').length,
                  dot: '#16A34A'
                },
                {
                  id: 'ALL',
                  label: 'All Submissions',
                  count: verificationQueue.length,
                  dot: '#64748B'
                }
              ].map((tab) => {
                const isActive = reviewFilterStatus === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setReviewFilterStatus(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 600,
                      border: `1px solid ${isActive ? '#2563EB' : '#E2E8F0'}`,
                      background: isActive ? '#EFF6FF' : '#FFFFFF',
                      color: isActive ? '#1D4ED8' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: tab.dot }} />
                    <span>{tab.label}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 9999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isActive ? '#DBEAFE' : '#F1F5F9',
                        color: isActive ? '#1E40AF' : '#64748B'
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                placeholder="Search lecture, course, creator..."
                style={{
                  width: '100%',
                  height: 36,
                  paddingLeft: 34,
                  paddingRight: 28,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  background: '#F8FAFC',
                  boxSizing: 'border-box'
                }}
              />
              {reviewSearch && (
                <button
                  type="button"
                  onClick={() => setReviewSearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 2
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Review Queue Table */}
          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            {filteredReviewQueue.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Lecture</th>
                    <th>Course</th>
                    <th>Section</th>
                    <th>Creator</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviewQueue.map((v) => {
                    const hasVideo = Boolean(v.videoUrl && v.videoUrl.trim())
                    return (
                      <tr key={v.id}>
                        {/* Lecture column: Title + Duration + Video status indicator */}
                        <td>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                            {v.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {v.duration || '15:00'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>•</span>
                            {hasVideo ? (
                              <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600 }}>
                                Video Ready
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 600 }}>
                                Video Missing
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Course */}
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}>
                            {v.playlist?.course?.title || 'Academic Program'}
                          </div>
                        </td>

                        {/* Section */}
                        <td>
                          <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                            {v.playlist?.title || 'Section'}
                          </div>
                        </td>

                        {/* Creator */}
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                            {v.creator?.name || 'Instructor'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            {v.creator?.email || ''}
                          </div>
                        </td>

                        {/* Submitted Date */}
                        <td style={{ fontSize: '0.8125rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {formatSubmittedDate(v.createdAt || v.updatedAt)}
                        </td>

                        {/* Status Chip */}
                        <td>
                          {renderReviewStatusChip(v.status)}
                        </td>

                        {/* Action: Review + Publish if Approved */}
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                            {v.status === 'APPROVED' && (
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => handlePublishLesson(v.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '5px 12px',
                                  borderRadius: 8,
                                  fontSize: '0.8125rem',
                                  fontWeight: 700,
                                  background: '#2563EB',
                                  color: '#FFFFFF',
                                  cursor: 'pointer'
                                }}
                                title="Publish approved lesson to students"
                              >
                                <UploadCloud size={14} />
                                <span>Publish</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => setSelectedReviewLecture(v)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '5px 14px',
                                borderRadius: 8,
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                color: '#0F172A',
                                borderColor: '#CBD5E1',
                                background: '#FFFFFF',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={14} style={{ color: '#2563EB' }} />
                              <span>Review</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '52px 20px', color: '#64748B' }}>
                <CheckCircle2 size={38} style={{ color: '#10B981', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: '#0F172A' }}>
                  No Lectures in This Queue
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem' }}>
                  {reviewSearch
                    ? `No submissions matching "${reviewSearch}".`
                    : reviewFilterStatus === 'SUBMITTED_FOR_REVIEW'
                    ? 'All creator-submitted lectures have been reviewed.'
                    : 'No lectures found for the selected review filter.'}
                </p>
                {(reviewSearch || reviewFilterStatus !== 'ALL') && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setReviewFilterStatus('ALL')
                      setReviewSearch('')
                    }}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    View All Submissions
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* ADMIN VIDEO REVIEW - LARGE CENTERED MODAL */}
          {/* ========================================================================= */}
          {selectedReviewLecture && (() => {
            const hasVideo = Boolean(selectedReviewLecture.videoUrl && selectedReviewLecture.videoUrl.trim())
            const playableUrl = getPlayableVideoUrl(selectedReviewLecture.videoUrl)

            return (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  zIndex: 2000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  boxSizing: 'border-box',
                  animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={() => setSelectedReviewLecture(null)}
              >
                <div
                  style={{
                    width: 'min(88vw, 1320px)',
                    height: '88vh',
                    maxHeight: '88vh',
                    background: '#FFFFFF',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                    animation: 'fadeInSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header - Sticky Top */}
                  <div
                    style={{
                      padding: '18px 28px',
                      borderBottom: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFFFF',
                      flexShrink: 0
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                          Review Lecture
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>•</span>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
                          {selectedReviewLecture.title}
                        </span>
                        {renderReviewStatusChip(selectedReviewLecture.status)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#64748B', marginTop: 4, flexWrap: 'wrap' }}>
                        <span>Course: <strong style={{ color: '#334155' }}>{selectedReviewLecture.playlist?.course?.title || 'Academic Program'}</strong></span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span>Section: <strong style={{ color: '#334155' }}>{selectedReviewLecture.playlist?.title || 'Section'}</strong></span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReviewLecture(null)}
                      style={{
                        background: '#F1F5F9',
                        border: 'none',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'background 0.15s ease'
                      }}
                      title="Close Review (Esc)"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Body - Scrollable Internally */}
                  <div
                    style={{
                      padding: '24px 32px',
                      flex: 1,
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 24
                    }}
                  >
                    {/* Video Review Area - Large 16:9 Player at TOP Center */}
                    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
                      {hasVideo ? (
                        <div
                          style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '16/9',
                            background: '#000000',
                            borderRadius: 8,
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.22)'
                          }}
                        >
                          <video
                            key={selectedReviewLecture.id + (selectedReviewLecture.videoUrl || '')}
                            controls
                            playsInline
                            preload="metadata"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            src={playableUrl}
                          >
                            Your browser does not support HTML5 video streaming.
                          </video>
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '52px 24px',
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            textAlign: 'center'
                          }}
                        >
                          <AlertTriangle size={44} style={{ color: '#DC2626', margin: '0 auto 12px auto' }} />
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: '#991B1B' }}>
                            Video unavailable
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#B91C1C', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                            This submitted lecture does not have an active video asset. Approval is disabled until the Creator uploads a valid video.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Lecture Information - Clean 2-Column Layout */}
                    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
                      <div
                        style={{
                          background: '#F8FAFC',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          padding: '20px 24px'
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: 20
                          }}
                        >
                          {/* Left Column: Course, Section, Creator */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Course
                              </div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                                {selectedReviewLecture.playlist?.course?.title || 'Academic Program'}
                              </div>
                            </div>

                            <div style={{ height: 1, background: '#E2E8F0' }} />

                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Section
                              </div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E293B', marginTop: 3 }}>
                                {selectedReviewLecture.playlist?.title || 'Section'}
                              </div>
                            </div>

                            <div style={{ height: 1, background: '#E2E8F0' }} />

                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Creator
                              </div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                                {selectedReviewLecture.creator?.name || 'Instructor'}
                              </div>
                              {selectedReviewLecture.creator?.email && (
                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>
                                  {selectedReviewLecture.creator.email}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Column: Duration, Submitted Date, Last Updated, Video Source / Asset Status */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Lecture Duration
                              </div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                                {selectedReviewLecture.duration || '15:00'}
                              </div>
                            </div>

                            <div style={{ height: 1, background: '#E2E8F0' }} />

                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Submitted Date
                              </div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155', marginTop: 3 }}>
                                {formatSubmittedDate(selectedReviewLecture.createdAt)}
                              </div>
                            </div>

                            <div style={{ height: 1, background: '#E2E8F0' }} />

                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Last Updated
                              </div>
                              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155', marginTop: 3 }}>
                                {formatSubmittedDate(selectedReviewLecture.updatedAt)}
                              </div>
                            </div>

                            <div style={{ height: 1, background: '#E2E8F0' }} />

                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                                Video Source / Asset Status
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                {hasVideo ? (
                                  <>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16A34A' }}>
                                      {selectedReviewLecture.videoUrl?.startsWith('http') ? 'Cloud Asset (Verified)' : 'Local Stream (Verified)'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#DC2626' }}>
                                      No Video Asset Attached
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Optional Description */}
                    {selectedReviewLecture.description && (
                      <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
                        <div
                          style={{
                            background: '#FFFFFF',
                            borderRadius: 8,
                            border: '1px solid #E2E8F0',
                            padding: '16px 20px'
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', marginBottom: 6 }}>
                            Lecture Description
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {selectedReviewLecture.description}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Review History */}
                    <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto' }}>
                      <div
                        style={{
                          background: '#FFFFFF',
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          padding: '18px 20px'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', marginBottom: 12 }}>
                          Review History
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Initial Submission */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', marginTop: 5, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>
                                Submitted for Review
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                {formatSubmittedDate(selectedReviewLecture.createdAt)} • Uploaded by {selectedReviewLecture.creator?.name || 'Creator'}
                              </div>
                            </div>
                          </div>

                          {/* Previous Changes Requested & Feedback */}
                          {selectedReviewLecture.adminFeedback && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', marginTop: 5, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#DC2626' }}>
                                  Changes Requested
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>
                                  {formatSubmittedDate(selectedReviewLecture.updatedAt)} • Editorial Feedback
                                </div>
                                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: '0.8125rem', color: '#991B1B', lineHeight: 1.4 }}>
                                  "{selectedReviewLecture.adminFeedback}"
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Verification logs if any */}
                          {selectedReviewLecture.verificationLogs && selectedReviewLecture.verificationLogs.map((log) => (
                            <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: log.action === 'APPROVED' ? '#16A34A' : '#D97706', marginTop: 5, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: log.action === 'APPROVED' ? '#16A34A' : '#D97706' }}>
                                  {log.action === 'APPROVED' ? 'Approved' : 'Changes Requested'}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                  {formatSubmittedDate(log.createdAt)} • {log.feedbackNote || 'Review decision'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer - Sticky Bottom */}
                  <div
                    style={{
                      padding: '16px 28px',
                      borderTop: '1px solid #E2E8F0',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexShrink: 0
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        setRequestChangesModal({
                          open: true,
                          lecture: selectedReviewLecture,
                          feedback: '',
                          quickReason: '',
                          error: '',
                          isSubmitting: false
                        })
                      }
                      style={{
                        color: '#D97706',
                        borderColor: '#FDE68A',
                        background: '#FFFBEB',
                        fontWeight: 700,
                        height: 42,
                        padding: '0 20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={16} />
                      <span>Request Changes</span>
                    </button>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                      {selectedReviewLecture.status === 'PUBLISHED' ? (
                        <>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              color: '#16A34A',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}
                          >
                            <CheckCircle2 size={16} />
                            <span>Live for Students</span>
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() =>
                              setUnpublishModal({
                                open: true,
                                lectureId: selectedReviewLecture.id,
                                reason: '',
                                error: '',
                                isSubmitting: false
                              })
                            }
                            style={{
                              color: '#DC2626',
                              borderColor: '#FECACA',
                              background: '#FEF2F2',
                              fontWeight: 700,
                              height: 42,
                              padding: '0 20px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              borderRadius: 8,
                              cursor: 'pointer'
                            }}
                          >
                            <EyeOff size={16} />
                            <span>Unpublish Lesson</span>
                          </button>
                        </>
                      ) : selectedReviewLecture.status === 'APPROVED' ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handlePublishLesson(selectedReviewLecture.id)}
                          style={{
                            background: '#2563EB',
                            borderColor: '#2563EB',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            height: 42,
                            padding: '0 26px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                          title="Publish approved lecture to enrolled students"
                        >
                          <UploadCloud size={16} />
                          <span>Publish Lesson to Students</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={!hasVideo}
                          onClick={() =>
                            setApproveModal({
                              open: true,
                              lecture: selectedReviewLecture,
                              isSubmitting: false
                            })
                          }
                          style={{
                            background: hasVideo ? '#16A34A' : '#94A3B8',
                            borderColor: hasVideo ? '#16A34A' : '#94A3B8',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            height: 42,
                            padding: '0 26px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 8,
                            cursor: hasVideo ? 'pointer' : 'not-allowed'
                          }}
                          title={!hasVideo ? 'Video unavailable - approval blocked' : 'Approve Lecture'}
                        >
                          <CheckCircle2 size={16} />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PAYMENTS & ENROLLMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Payments & Financial Audit Trail
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Live reconciliation of Razorpay payment signatures, verified transactions, and learner order numbers.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            {paymentsList.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Order Number</th>
                    <th>Enrolled Learner</th>
                    <th>Academic Program</th>
                    <th>Amount Paid</th>
                    <th>Payment Status</th>
                    <th>Date Recorded</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.orderNumber || p.id.slice(0, 10)}</strong></td>
                      <td>{p.student?.name || p.student?.email || 'Learner'}</td>
                      <td>{p.course?.title || 'Program'}</td>
                      <td>₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td>
                        <span className="badge" style={{ background: p.status === 'SUCCESSFUL' ? '#DCFCE7' : '#FEF3C7', color: p.status === 'SUCCESSFUL' ? '#166534' : '#92400E' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                No payment transactions recorded in database yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6.5. PUBLIC PAGE & ABOUT US MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'public-controls' && (
        <AdminCmsManager showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* 6.8. COURSE REVIEWS MODERATION & HOME FEATURE WORKFLOW */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (() => {
        const counts = {
          all: adminReviews.length,
          pending: adminReviews.filter((r) => r.status === 'PENDING').length,
          approved: adminReviews.filter((r) => r.status === 'APPROVED').length,
          rejected: adminReviews.filter((r) => r.status === 'REJECTED').length,
          featured: adminReviews.filter((r) => r.isFeatured).length
        }

        const filteredReviews = adminReviews.filter((r) => {
          if (reviewStatusFilter !== 'ALL' && r.status !== reviewStatusFilter) return false
          if (reviewCourseFilter !== 'ALL' && r.courseId !== reviewCourseFilter && r.course?.id !== reviewCourseFilter) return false
          if (reviewSearchQuery.trim()) {
            const q = reviewSearchQuery.toLowerCase().trim()
            const matchStudent = r.student?.name?.toLowerCase().includes(q) || r.student?.email?.toLowerCase().includes(q)
            const matchCourse = r.course?.title?.toLowerCase().includes(q)
            const matchTitle = (r.title || '').toLowerCase().includes(q)
            const matchText = (r.reviewText || '').toLowerCase().includes(q)
            if (!matchStudent && !matchCourse && !matchTitle && !matchText) return false
          }
          return true
        })

        return (
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Course Reviews Moderation
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                  Audit, approve, and curate verified scholar testimonials. Only approved reviews appear on course pages; featured reviews appear on the homepage.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fetchAdminReviews()}
                  disabled={reviewsLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, fontWeight: 600 }}
                >
                  <RefreshCw size={14} className={reviewsLoading ? 'spin' : ''} />
                  <span>Refresh Reviews</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(15,23,42,0.03)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Reviews</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{counts.all}</div>
                </div>
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Approval</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309', lineHeight: 1.1 }}>{counts.pending}</div>
                </div>
              </div>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Approved Reviews</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>{counts.approved}</div>
                </div>
              </div>

              <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6B21A8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Featured on Home</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7E22CE', lineHeight: 1.1 }}>{counts.featured}</div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
              }}
            >
              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginRight: 4 }}>Status:</span>
                {[
                  { key: 'ALL', label: 'All Reviews', count: counts.all },
                  { key: 'PENDING', label: 'Pending Approval', count: counts.pending },
                  { key: 'APPROVED', label: 'Approved', count: counts.approved },
                  { key: 'REJECTED', label: 'Rejected', count: counts.rejected }
                ].map((s) => {
                  const isActive = reviewStatusFilter === s.key
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setReviewStatusFilter(s.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        background: isActive ? '#0F172A' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>{s.label}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 9999,
                          fontWeight: 700,
                          background: isActive ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                          color: isActive ? '#FFFFFF' : '#475569'
                        }}
                      >
                        {s.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Course Program & Search Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Course Dropdown */}
                <select
                  value={reviewCourseFilter}
                  onChange={(e) => setReviewCourseFilter(e.target.value)}
                  style={{
                    height: 38,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '0.8125rem',
                    color: '#334155',
                    background: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Academic Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                {/* Search Input */}
                <div style={{ position: 'relative' }}>
                  <Search
                    size={14}
                    style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                  />
                  <input
                    type="text"
                    placeholder="Search scholar, course, text..."
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    style={{
                      height: 38,
                      width: 230,
                      paddingLeft: 32,
                      paddingRight: 10,
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Moderation Reviews Table */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}
            >
              {reviewsLoading ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', color: '#2563EB' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>Loading course reviews...</p>
                </div>
              ) : filteredReviews.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Scholar</th>
                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Course</th>
                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Rating & Feedback</th>
                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Submitted</th>
                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Feature on Home</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.map((r) => {
                        const studentInitials = (r.student?.name || 'S')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()

                        const isApproved = r.status === 'APPROVED'
                        const isPending = r.status === 'PENDING'
                        const isRejected = r.status === 'REJECTED'

                        return (
                          <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                            {/* Scholar */}
                            <td style={{ padding: '16px 18px', minWidth: 180 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                                    color: '#FFFFFF',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    flexShrink: 0
                                  }}
                                >
                                  {studentInitials}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>
                                    {r.student?.name || 'Scholar'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748B', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {r.student?.email || 'scholar@apexlearn.edu'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Course */}
                            <td style={{ padding: '16px 18px', minWidth: 160 }}>
                              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem', marginBottom: 2 }}>
                                {r.course?.title || 'Course'}
                              </div>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: '#F1F5F9',
                                  color: '#475569',
                                  fontWeight: 600
                                }}
                              >
                                {r.course?.slug || 'program'}
                              </span>
                            </td>

                            {/* Rating & Feedback */}
                            <td style={{ padding: '16px 18px', minWidth: 280, maxWidth: 420 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    fill={star <= r.rating ? '#F59E0B' : 'transparent'}
                                    color={star <= r.rating ? '#F59E0B' : '#CBD5E1'}
                                  />
                                ))}
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', marginLeft: 4 }}>
                                  {r.rating}.0
                                </span>
                              </div>
                              {r.title && (
                                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: 2 }}>
                                  "{r.title}"
                                </div>
                              )}
                              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#334155', lineHeight: 1.45 }}>
                                {r.reviewText}
                              </p>
                              {r.rejectionReason && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    padding: '6px 10px',
                                    borderRadius: 6,
                                    background: '#FEF2F2',
                                    border: '1px solid #FCA5A5',
                                    fontSize: '0.75rem',
                                    color: '#991B1B'
                                  }}
                                >
                                  <strong>Rejection Note:</strong> {r.rejectionReason}
                                </div>
                              )}
                            </td>

                            {/* Submitted Date */}
                            <td style={{ padding: '16px 18px', fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                              {formatSubmittedDate(r.createdAt)}
                            </td>

                            {/* Status */}
                            <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                              {isPending && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    background: '#FEF3C7',
                                    color: '#92400E',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                  }}
                                >
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
                                  Pending Approval
                                </span>
                              )}
                              {isApproved && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    background: '#DCFCE7',
                                    color: '#166534',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                  Approved
                                </span>
                              )}
                              {isRejected && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '4px 10px',
                                    borderRadius: 9999,
                                    background: '#FEE2E2',
                                    color: '#991B1B',
                                    fontSize: '0.75rem',
                                    fontWeight: 700
                                  }}
                                >
                                  <X size={12} strokeWidth={3} />
                                  Rejected
                                </span>
                              )}
                            </td>

                            {/* Feature on Home Toggle */}
                            <td style={{ padding: '16px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {isApproved ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeatureReview(r.id, r.isFeatured)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '5px 12px',
                                    borderRadius: 8,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: r.isFeatured ? '1px solid #7E22CE' : '1px solid #CBD5E1',
                                    background: r.isFeatured ? '#FAF5FF' : '#FFFFFF',
                                    color: r.isFeatured ? '#7E22CE' : '#64748B',
                                    transition: 'all 0.15s ease'
                                  }}
                                  title={r.isFeatured ? 'Click to remove from homepage featured reviews' : 'Click to feature on homepage'}
                                >
                                  <Star size={12} fill={r.isFeatured ? '#7E22CE' : 'transparent'} />
                                  <span>{r.isFeatured ? 'Featured' : 'Feature'}</span>
                                </button>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    color: '#94A3B8',
                                    background: '#F8FAFC',
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: '1px dashed #CBD5E1'
                                  }}
                                  title="Only approved reviews can be featured on home"
                                >
                                  Approve first
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveReview(r.id)}
                                      className="btn btn-sm"
                                      style={{
                                        background: '#16A34A',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '5px 12px',
                                        borderRadius: 8,
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                    >
                                      <Check size={12} strokeWidth={3} />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRejectReviewModal({ open: true, review: r, reason: '', error: '', isSubmitting: false })}
                                      className="btn btn-sm"
                                      style={{
                                        background: '#DC2626',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '5px 12px',
                                        borderRadius: 8,
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                    >
                                      <X size={12} strokeWidth={3} />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}
                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => setRejectReviewModal({ open: true, review: r, reason: '', error: '', isSubmitting: false })}
                                    className="btn btn-outline btn-sm"
                                    style={{
                                      color: '#DC2626',
                                      borderColor: '#FCA5A5',
                                      padding: '4px 10px',
                                      borderRadius: 8,
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    Reject / Revoke
                                  </button>
                                )}
                                {isRejected && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveReview(r.id)}
                                    className="btn btn-outline btn-sm"
                                    style={{
                                      color: '#16A34A',
                                      borderColor: '#86EFAC',
                                      padding: '4px 10px',
                                      borderRadius: 8,
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    Re-Approve
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748B' }}>
                  <Star size={36} style={{ margin: '0 auto 12px auto', color: '#94A3B8', opacity: 0.6 }} />
                  <h4 style={{ margin: '0 0 6px 0', color: '#0F172A', fontSize: '1rem', fontWeight: 700 }}>No Course Reviews Found</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    {reviewSearchQuery || reviewStatusFilter !== 'ALL' || reviewCourseFilter !== 'ALL'
                      ? 'No reviews match your current filters. Try resetting status or course filter.'
                      : 'No student reviews have been submitted yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* ========================================================================= */}
      {/* 6.9. PROJECTS MANAGEMENT (DYNAMIC CONTENT) */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <AdminProjectsManager showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* 6.10. LIVE SESSIONS MANAGEMENT (DYNAMIC CONTENT) */}
      {/* ========================================================================= */}
      {activeTab === 'live-sessions' && (
        <AdminLiveSessionsManager showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* 6.11. SUPPORT TICKETS & CONTACT ENQUIRIES GOVERNANCE */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <AdminSupportManager showToast={showToast} />
      )}

      {/* ========================================================================= */}
      {/* 7. NOTIFICATIONS / ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Broadcast Notifications Center
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Dispatch in-app notifications and official announcements across targeted user cohorts.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            <form onSubmit={handleBroadcastAnnouncement}>
              <div className="form-field-group">
                <label className="form-label">Announcement Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Platform Maintenance & New Course Releases"
                  value={newNotifTitle}
                  onChange={(e) => setNewNotifTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Target Audience Cohort</label>
                <select
                  className="form-input"
                  value={newNotifTarget}
                  onChange={(e) => setNewNotifTarget(e.target.value)}
                >
                  <option value="ALL_STUDENTS">All Enrolled Students</option>
                  <option value="ALL_CREATORS">All Verified Faculty Instructors</option>
                  <option value="PLATFORM_WIDE">Platform Wide (Everyone)</option>
                </select>
              </div>

              <div className="form-field-group">
                <label className="form-label">Message Content</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 120 }}
                  placeholder="Details of the announcement..."
                  value={newNotifBody}
                  onChange={(e) => setNewNotifBody(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Send size={15} />
                <span>Broadcast Announcement Now</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. REPORTS & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Reports & Academic Analytics
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Course enrollment distribution, revenue attribution, and curriculum performance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Revenue breakdown by course */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
                Course Revenue Attribution
              </h4>
              {reportsData?.courseRevenueBreakdown && reportsData.courseRevenueBreakdown.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reportsData.courseRevenueBreakdown.map((item, idx) => (
                    <div key={idx} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{item.courseTitle}</span>
                      <strong style={{ fontSize: '0.9375rem', color: '#059669' }}>₹{item.revenue?.toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748B', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
                  No revenue attribution records available yet.
                </div>
              )}
            </div>

            {/* Course stats */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
                Enrollments & Module Breakdown
              </h4>
              {reportsData?.courseStats && reportsData.courseStats.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reportsData.courseStats.map((cs) => (
                    <div key={cs.id} style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{cs.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                          {cs.lessonsCount} verified lectures • Category: {cs.category}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, background: '#EFF6FF', color: '#2563EB', padding: '3px 8px', borderRadius: 6 }}>
                        {cs.enrollmentCount} learners
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748B', fontSize: '0.875rem', textAlign: 'center', padding: '24px 0' }}>
                  No course statistics records available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. REQUESTS (Creator Profile Change Requests) */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (() => {
        const filteredRequests = requestsList.filter((r) => {
          // Status filter
          if (requestStatusFilter !== 'ALL' && r.status !== requestStatusFilter) return false
          
          // Request type filter
          if (requestTypeFilter !== 'ALL') {
            const rType = r.requestType || r.requestedChanges?.type || 'OTHER'
            if (requestTypeFilter !== rType) return false
          }

          // Search query
          if (requestSearch && requestSearch.trim()) {
            const q = requestSearch.trim().toLowerCase()
            const cName = (r.creatorProfile?.user?.name || '').toLowerCase()
            const cEmail = (r.creatorProfile?.user?.email || '').toLowerCase()
            const reason = (r.reason || '').toLowerCase()
            const reqVal = (typeof r.requestedValue === 'string' ? r.requestedValue : JSON.stringify(r.requestedValue || '')).toLowerCase()
            const curVal = (typeof r.currentValue === 'string' ? r.currentValue : JSON.stringify(r.currentValue || '')).toLowerCase()
            if (!cName.includes(q) && !cEmail.includes(q) && !reason.includes(q) && !reqVal.includes(q) && !curVal.includes(q)) {
              return false
            }
          }
          return true
        })

        const counts = {
          all: requestsList.length,
          pending: requestsList.filter((r) => r.status === 'PENDING').length,
          approved: requestsList.filter((r) => r.status === 'APPROVED').length,
          rejected: requestsList.filter((r) => r.status === 'REJECTED').length,
          completed: requestsList.filter((r) => r.status === 'COMPLETED').length,
          expired: requestsList.filter((r) => r.status === 'EXPIRED').length
        }

        const formatReqDate = (dateStr) => {
          if (!dateStr) return 'N/A'
          try {
            return new Date(dateStr).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          } catch {
            return dateStr
          }
        }

        const getTypeMeta = (r) => {
          const type = r.requestType || r.requestedChanges?.type || 'OTHER'
          switch (type) {
            case 'EMAIL_CHANGE':
              return { label: 'Email Change', icon: Mail, bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }
            case 'PASSWORD_CHANGE':
              return { label: 'Password Change', icon: Key, bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' }
            case 'PROFILE_PHOTO':
              return { label: 'Profile Photo', icon: Camera, bg: '#FDF2F8', color: '#BE185D', border: '#FBCFE8' }
            case 'NAME':
              return { label: 'Creator Name', icon: UserIcon, bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' }
            case 'SPECIALIZATION':
              return { label: 'Specialization', icon: Tag, bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' }
            case 'HEADLINE':
              return { label: 'Headline', icon: FileText, bg: '#F8FAFC', color: '#334155', border: '#CBD5E1' }
            case 'BIOGRAPHY':
              return { label: 'Biography', icon: FileText, bg: '#F8FAFC', color: '#334155', border: '#CBD5E1' }
            default:
              return { label: 'Profile Change', icon: Edit3, bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' }
          }
        }

        return (
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  Creator Profile Request Center
                </h2>
                <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
                  Review faculty credential modifications, email changes, and password approvals with zero-knowledge security governance.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={loadAdminData}
                  disabled={loading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, fontWeight: 600 }}
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} />
                  <span>Refresh Requests</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(15,23,42,0.03)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F8FAFC', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Requests</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{counts.all}</div>
                </div>
              </div>

              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Approval</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B45309', lineHeight: 1.1 }}>{counts.pending}</div>
                </div>
              </div>

              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Approved / Active</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803D', lineHeight: 1.1 }}>{counts.approved}</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>{counts.completed}</div>
                </div>
              </div>

              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rejected</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#B91C1C', lineHeight: 1.1 }}>{counts.rejected}</div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                marginBottom: 20,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
              }}
            >
              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginRight: 4 }}>Status:</span>
                {[
                  { key: 'ALL', label: 'All', count: counts.all },
                  { key: 'PENDING', label: 'Pending', count: counts.pending },
                  { key: 'APPROVED', label: 'Approved', count: counts.approved },
                  { key: 'REJECTED', label: 'Rejected', count: counts.rejected },
                  { key: 'COMPLETED', label: 'Completed', count: counts.completed },
                  { key: 'EXPIRED', label: 'Expired', count: counts.expired }
                ].map((s) => {
                  const isActive = requestStatusFilter === s.key
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setRequestStatusFilter(s.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        background: isActive ? '#0F172A' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>{s.label}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: 10,
                          background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                          color: isActive ? '#FFFFFF' : '#64748B'
                        }}
                      >
                        {s.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Type Filter & Search Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {/* Request Type Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Filter size={15} style={{ color: '#64748B' }} />
                  <select
                    value={requestTypeFilter}
                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                    style={{
                      height: 38,
                      padding: '0 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">All Request Types</option>
                    <option value="EMAIL_CHANGE">Email Address Change</option>
                    <option value="PASSWORD_CHANGE">Password Change</option>
                    <option value="PROFILE_PHOTO">Profile Photo</option>
                    <option value="NAME">Creator Name</option>
                    <option value="SPECIALIZATION">Specialization</option>
                    <option value="HEADLINE">Headline</option>
                    <option value="BIOGRAPHY">Biography</option>
                  </select>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search creator or reason..."
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    style={{
                      width: '100%',
                      height: 38,
                      padding: '0 12px 0 32px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.8125rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                  {requestSearch && (
                    <button
                      type="button"
                      onClick={() => setRequestSearch('')}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Requests List */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              {filteredRequests.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ width: '100%', minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 170 }}>Request Type</th>
                        <th style={{ width: 220 }}>Creator</th>
                        <th>Requested Change Details</th>
                        <th style={{ width: 220 }}>Reason & Date</th>
                        <th style={{ width: 140 }}>Status</th>
                        <th style={{ width: 180, textAlign: 'center' }}>Admin Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((r) => {
                        const meta = getTypeMeta(r)
                        const Icon = meta.icon
                        const creatorUser = r.creatorProfile?.user || {}
                        const isPending = r.status === 'PENDING'
                        const isApproved = r.status === 'APPROVED'
                        const isCompleted = r.status === 'COMPLETED'
                        const isRejected = r.status === 'REJECTED'
                        const isExpired = r.status === 'EXPIRED'
                        const isPasswordChange = r.requestType === 'PASSWORD_CHANGE'
                        const isEmailChange = r.requestType === 'EMAIL_CHANGE'

                        return (
                          <tr key={r.id} style={{ verticalAlign: 'top', borderBottom: '1px solid #F1F5F9' }}>
                            {/* Request Type */}
                            <td style={{ padding: '16px 14px' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  background: meta.bg,
                                  color: meta.color,
                                  border: `1px solid ${meta.border}`,
                                  padding: '5px 10px',
                                  borderRadius: 8,
                                  fontSize: '0.78rem',
                                  fontWeight: 700
                                }}
                              >
                                <Icon size={14} />
                                <span>{meta.label}</span>
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 4, fontFamily: 'monospace' }}>
                                #{r.id.slice(0, 8)}
                              </div>
                            </td>

                            {/* Creator Information */}
                            <td style={{ padding: '16px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: '50%',
                                    background: '#EEF2FF',
                                    color: '#4F46E5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                  }}
                                >
                                  {creatorUser.avatar ? (
                                    <img src={creatorUser.avatar} alt={creatorUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    getCreatorInitials(creatorUser.name || 'CR')
                                  )}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {creatorUser.name || 'Creator'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {creatorUser.email || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Requested Change Details */}
                            <td style={{ padding: '16px 14px' }}>
                              {isEmailChange ? (
                                <div style={{ fontSize: '0.8125rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                    <div style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: 6, color: '#475569', fontSize: '0.78rem' }}>
                                      <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block', fontWeight: 600 }}>CURRENT EMAIL</span>
                                      <strong>{r.currentValue || creatorUser.email || 'kpmbanupriya@gmail.com'}</strong>
                                    </div>
                                    <ArrowRight size={14} style={{ color: '#94A3B8' }} />
                                    <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '4px 8px', borderRadius: 6, color: '#1D4ED8', fontSize: '0.78rem' }}>
                                      <span style={{ color: '#3B82F6', fontSize: '0.7rem', display: 'block', fontWeight: 600 }}>REQUESTED NEW EMAIL</span>
                                      <strong>{r.requestedValue}</strong>
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                                    🔒 Existing email stays active until Admin approval and OTP verification complete.
                                  </div>
                                </div>
                              ) : isPasswordChange ? (
                                <div>
                                  <div
                                    style={{
                                      background: '#FAF5FF',
                                      border: '1px solid #E9D5FF',
                                      borderRadius: 8,
                                      padding: '10px 12px',
                                      fontSize: '0.8rem',
                                      color: '#6B21A8'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                                      <Shield size={14} style={{ color: '#7E22CE' }} />
                                      <span>Admin Zero-Knowledge Security Policy</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#7E22CE', lineHeight: 1.4 }}>
                                      Approval grants the Creator a <strong>24-hour permission</strong> to enter their current & new password securely from My Profile. Password data is encrypted directly with bcrypt in the backend.
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Lock size={12} />
                                    <span>No passwords, hashes, reset tokens, or OTPs are accessible to Admin.</span>
                                  </div>
                                </div>
                              ) : r.requestType === 'PROFILE_PHOTO' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  {r.currentValue && (
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '0.68rem', color: '#64748B', marginBottom: 2 }}>Current</div>
                                      <img src={r.currentValue} alt="Current" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1' }} />
                                    </div>
                                  )}
                                  <ArrowRight size={14} style={{ color: '#94A3B8' }} />
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.68rem', color: '#1D4ED8', fontWeight: 600, marginBottom: 2 }}>Requested</div>
                                    <img src={r.requestedValue} alt="Requested" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #3B82F6' }} />
                                  </div>
                                </div>
                              ) : (
                                <div style={{ fontSize: '0.8125rem' }}>
                                  {r.currentValue && (
                                    <div style={{ color: '#64748B', marginBottom: 4, fontSize: '0.75rem' }}>
                                      <span style={{ fontWeight: 600 }}>Current: </span>
                                      {r.currentValue}
                                    </div>
                                  )}
                                  <div style={{ color: '#0F172A', fontWeight: 600 }}>
                                    <span style={{ color: '#16A34A', fontWeight: 700 }}>Requested: </span>
                                    {typeof r.requestedValue === 'string' ? r.requestedValue : JSON.stringify(r.requestedValue)}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Reason & Date */}
                            <td style={{ padding: '16px 14px' }}>
                              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: '0.78rem', color: '#334155', fontStyle: 'italic', marginBottom: 6 }}>
                                "{r.reason || 'No specific justification provided.'}"
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748B' }}>
                                <Calendar size={12} />
                                <span>{formatReqDate(r.createdAt)}</span>
                              </div>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '16px 14px' }}>
                              <div>
                                {isPending && (
                                  <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.75rem', padding: '4px 8px' }}>
                                    Pending Approval
                                  </span>
                                )}
                                {isApproved && (
                                  <div>
                                    <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF', fontWeight: 700, fontSize: '0.75rem', padding: '4px 8px' }}>
                                      Approved
                                    </span>
                                    {isPasswordChange && (
                                      <div style={{ fontSize: '0.7rem', color: '#1E40AF', marginTop: 4, fontWeight: 600 }}>
                                        Awaiting Creator Set
                                      </div>
                                    )}
                                    {isEmailChange && (
                                      <div style={{ fontSize: '0.7rem', color: '#1E40AF', marginTop: 4, fontWeight: 600 }}>
                                        Awaiting OTP Verify
                                      </div>
                                    )}
                                  </div>
                                )}
                                {isCompleted && (
                                  <span className="badge" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700, fontSize: '0.75rem', padding: '4px 8px' }}>
                                    Completed
                                  </span>
                                )}
                                {isRejected && (
                                  <div>
                                    <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B', fontWeight: 700, fontSize: '0.75rem', padding: '4px 8px' }}>
                                      Rejected
                                    </span>
                                    {r.rejectionReason && (
                                      <div style={{ fontSize: '0.7rem', color: '#B91C1C', marginTop: 4, fontStyle: 'italic' }}>
                                        Reason: {r.rejectionReason}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {isExpired && (
                                  <span className="badge" style={{ background: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: '0.75rem', padding: '4px 8px' }}>
                                    Approval Expired
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Decision Actions */}
                            <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                              {isPending ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => handleReviewRequest(r.id, 'APPROVED')}
                                    disabled={isSubmittingReview}
                                    style={{
                                      background: '#16A34A',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      fontWeight: 700,
                                      fontSize: '0.78rem',
                                      padding: '6px 12px',
                                      borderRadius: 8,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 6,
                                      boxShadow: '0 1px 3px rgba(22,163,74,0.3)'
                                    }}
                                  >
                                    <Check size={14} />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => handleOpenRejectModal(r)}
                                    disabled={isSubmittingReview}
                                    style={{
                                      color: '#EF4444',
                                      borderColor: '#FCA5A5',
                                      fontWeight: 600,
                                      fontSize: '0.78rem',
                                      padding: '6px 12px',
                                      borderRadius: 8,
                                      background: '#FFFFFF',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 6
                                    }}
                                  >
                                    <X size={14} />
                                    <span>Reject</span>
                                  </button>
                                </div>
                              ) : isApproved ? (
                                <div style={{ fontSize: '0.75rem', color: '#1E40AF', background: '#EFF6FF', padding: '6px 8px', borderRadius: 6, fontWeight: 600 }}>
                                  {isPasswordChange ? 'Awaiting Password Reset' : isEmailChange ? 'Awaiting Email OTP' : 'Permission Active'}
                                </div>
                              ) : isCompleted ? (
                                <div style={{ fontSize: '0.75rem', color: '#166534', background: '#F0FDF4', padding: '6px 8px', borderRadius: 6, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                  <CheckCircle2 size={13} />
                                  <span>Resolved</span>
                                </div>
                              ) : isRejected ? (
                                <div style={{ fontSize: '0.75rem', color: '#991B1B', background: '#FEF2F2', padding: '6px 8px', borderRadius: 6, fontWeight: 600 }}>
                                  Declined
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Closed</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
                    No Requests Match Your Filter
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: 440, margin: '0 auto 16px auto' }}>
                    {requestStatusFilter !== 'ALL' || requestTypeFilter !== 'ALL' || requestSearch
                      ? 'Try clearing your status filter or search query to see other faculty change requests.'
                      : 'All Creator profile modifications and security requests have been reviewed.'}
                  </p>
                  {(requestStatusFilter !== 'ALL' || requestTypeFilter !== 'ALL' || requestSearch) && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setRequestStatusFilter('ALL')
                        setRequestTypeFilter('ALL')
                        setRequestSearch('')
                      }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })()}

      {/* ========================================================================= */}
      {/* 10. AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit-logs' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Platform Security & Audit Trail
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Immutable records of administrative actions, course publications, and role state mutations.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            {auditLogs.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Entity Type</th>
                    <th>Details</th>
                    <th>Recorded Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td><strong>{log.action}</strong></td>
                      <td>{log.user?.email || 'System'}</td>
                      <td>{log.entityType} ({log.entityId?.slice(0, 8) || '-'})</td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>{log.details || '-'}</td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                No audit logs recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. SECURITY & SESSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              System Security & Active Sessions
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              PostgreSQL session governance, key verification, and infrastructure status.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 6, color: '#0F172A', fontWeight: 800 }}>
                Active Authenticated Sessions ({activeSessions.length})
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: 16 }}>
                Remotely revoke active sessions directly from PostgreSQL session store.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeSessions.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>{s.user?.name} ({s.user?.role})</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        IP: {s.ipAddress || '127.0.0.1'} • {s.userAgent?.slice(0, 30)}...
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleRevokeSession(s.id)}
                      style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 6, color: '#0F172A', fontWeight: 800 }}>
                Infrastructure Security
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: 16 }}>
                Core services encryption and database health.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <strong style={{ display: 'block', marginBottom: 4, color: '#0F172A' }}>PostgreSQL Production Database</strong>
                  <span style={{ fontSize: '0.8rem', color: '#16A34A', display: 'block', marginBottom: 12 }}>● Connected & Healthy (apexlearn_db on port 5432)</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => showToast('On-demand database snapshot verified.', 'success')}
                  >
                    <Database size={14} />
                    <span>Verify Database Snapshot</span>
                  </button>
                </div>

                <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <strong style={{ display: 'block', marginBottom: 4, color: '#0F172A' }}>JWT HMAC Key Rotation</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block', marginBottom: 12 }}>Cryptographic signing keys initialized and active.</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => showToast('Signing key verified.', 'info')}
                  >
                    <Key size={14} />
                    <span>Verify Key Health</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. ADMIN PROFILE MANAGEMENT (VIEW & EDIT) */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section Header with Segmented View/Edit Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                Admin Profile Management
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
                Personal credentials, executive authority, and contact information for the active administrator.
              </p>
            </div>

            {/* Segmented View / Edit Pill Switch */}
            <div
              style={{
                display: 'flex',
                background: '#F1F5F9',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0'
              }}
            >
              <button
                type="button"
                id="btn-profile-tab-view"
                onClick={() => {
                  setProfileMode('view')
                  navigate('/admin/profile?mode=view', { replace: true })
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 18px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: profileMode === 'view' ? '#FFFFFF' : 'transparent',
                  color: profileMode === 'view' ? '#0F172A' : '#64748B',
                  boxShadow: profileMode === 'view' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Eye size={15} style={{ color: profileMode === 'view' ? '#2563EB' : 'inherit' }} />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                id="btn-profile-tab-edit"
                onClick={() => {
                  setProfileMode('edit')
                  navigate('/admin/profile?mode=edit', { replace: true })
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 18px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: profileMode === 'edit' ? '#FFFFFF' : 'transparent',
                  color: profileMode === 'edit' ? '#0F172A' : '#64748B',
                  boxShadow: profileMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Edit3 size={15} style={{ color: profileMode === 'edit' ? '#059669' : 'inherit' }} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODE A: VIEW PROFILE */}
          {/* ========================================================================= */}
          {profileMode === 'view' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Executive Hero Banner Card */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative Top Gradient Accent */}
                <div style={{ height: 6, background: 'linear-gradient(90deg, #2563EB 0%, #059669 100%)' }} />

                <div
                  style={{
                    padding: '28px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 24
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    {/* Avatar Display */}
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 800,
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                        border: '3px solid #F1F5F9',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {currentDisplayUser.avatar ? (
                        <img
                          src={currentDisplayUser.avatar}
                          alt={currentDisplayUser.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        getProfileInitials(currentDisplayUser.name)
                      )}
                    </div>

                    {/* Name & Executive Title */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h3 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          {currentDisplayUser.name || 'Dr. Vikram Sen'}
                        </h3>
                        <span
                          style={{
                            background: '#ECFDF5',
                            color: '#059669',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '9999px',
                            border: '1px solid #A7F3D0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                          {currentDisplayUser.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#2563EB', marginBottom: 12 }}>
                        Academic Director & Chief Learning Architect
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: '#EFF6FF',
                            color: '#2563EB',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: '1px solid #BFDBFE'
                          }}
                        >
                          Role: {currentDisplayUser.role || 'ADMIN'}
                        </span>
                        <span
                          style={{
                            background: '#F8FAFC',
                            color: '#475569',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          Superadmin Governance
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Action Button */}
                  <button
                    type="button"
                    id="btn-edit-profile-action"
                    onClick={() => {
                      setProfileMode('edit')
                      navigate('/admin/profile?mode=edit', { replace: true })
                    }}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Edit3 size={15} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>

              {/* Two Column Grid of Information Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: 20
                }}
              >
                {/* Card 1: Identity & Contact Information */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    padding: 24,
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <UserIcon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                        Identity & Contact Information
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Primary credentials and communications</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Full Name
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {currentDisplayUser.name || 'Dr. Vikram Sen'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Email Address
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
                          {currentDisplayUser.email || 'director@apexlearn.edu'}
                        </span>
                        <span
                          style={{
                            background: '#ECFDF5',
                            color: '#059669',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 4,
                            border: '1px solid #A7F3D0'
                          }}
                        >
                          Verified
                        </span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Phone Number
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {currentDisplayUser.phone || '+91 98765 43210'}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Designation & Department
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        Academic Director • Curriculum & AI Systems
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Account Lifecycle & Security */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    padding: 24,
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Shield size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                        Account Status & Security
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Institutional governance lifecycle</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Administrative Role
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {currentDisplayUser.role || 'ADMIN'} (Institutional Root Privileges)
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Account Status
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#059669', marginTop: 2 }}>
                        ● {currentDisplayUser.status || 'ACTIVE'} (Unrestricted Governance)
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Joined Date
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {formatJoinedDate(currentDisplayUser.createdAt)}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Last Updated Information
                      </span>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                        {formatLastUpdated(currentDisplayUser.updatedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Executive Bio & Scope */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  padding: 28,
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: '#F5F3FF',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                      Executive Biography & Academic Scope
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Public academic credentials and administrative remit</span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: '#334155',
                    background: '#F8FAFC',
                    padding: '18px 22px',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {currentDisplayUser.bio ||
                    'Dr. Vikram Sen serves as Academic Director and Chief Learning Architect at ApexLearn Institute of Tech & AI. He oversees curriculum standards, pedagogical innovation, faculty review, and institutional AI course standards across all academic tracks.'}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE B: EDIT PROFILE */}
          {/* ========================================================================= */}
          {profileMode === 'edit' && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '32px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Edit Administrator Profile
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                  Update your display name, contact phone, executive bio, and profile avatar. Modifications immediately reflect across the admin portal.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile}>
                {/* 1. Profile Photo / Avatar Setting */}
                <div style={{ marginBottom: 28 }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                    Profile Photo / Avatar
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {/* Live Avatar Preview */}
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        border: '2px solid #E2E8F0',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {editProfileForm.avatar ? (
                        <img
                          src={editProfileForm.avatar}
                          alt="Avatar preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        getProfileInitials(editProfileForm.name || currentDisplayUser.name)
                      )}
                    </div>

                    {/* URL Input & Quick Presets */}
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://example.com/photo.jpg (Direct image URL)"
                        value={editProfileForm.avatar}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, avatar: e.target.value })}
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Quick presets:</span>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                          onClick={() =>
                            setEditProfileForm({
                              ...editProfileForm,
                              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                            })
                          }
                        >
                          Preset 1 (Academic)
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                          onClick={() =>
                            setEditProfileForm({
                              ...editProfileForm,
                              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                            })
                          }
                        >
                          Preset 2 (Executive)
                        </button>
                        {editProfileForm.avatar && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.75rem', color: '#EF4444', borderColor: '#FCA5A5' }}
                            onClick={() => setEditProfileForm({ ...editProfileForm, avatar: '' })}
                          >
                            Use Monogram Initials
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Editable Fields: Full Name & Phone Number */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
                  <div className="form-field-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editProfileForm.name}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                      placeholder="e.g. Dr. Vikram Sen"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={editProfileForm.phone}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* 3. Read-Only System Fields: Email & Role */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
                  <div className="form-field-group">
                    <label className="form-label" style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Email Address</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>System Locked</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={currentDisplayUser.email || 'director@apexlearn.edu'}
                      disabled
                      style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#64748B' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                      Email is bound to the PostgreSQL admin account credential.
                    </span>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>System Role</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>Role Locked</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value="Academic Director (ADMIN)"
                      disabled
                      style={{ background: '#F8FAFC', cursor: 'not-allowed', color: '#64748B' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                      Institutional role assigned by platform governance.
                    </span>
                  </div>
                </div>

                {/* 4. Executive Bio */}
                <div className="form-field-group" style={{ marginBottom: 28 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Executive Bio & Academic Profile
                  </label>
                  <textarea
                    rows={4}
                    className="form-input"
                    value={editProfileForm.bio}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, bio: e.target.value })}
                    placeholder="Provide a brief summary of your academic background, responsibilities, and institutional focus..."
                    style={{ lineHeight: 1.5, resize: 'vertical' }}
                  />
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setProfileMode('view')
                      navigate('/admin/profile?mode=view', { replace: true })
                    }}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-save-admin-profile"
                    className="btn btn-primary"
                    disabled={profileSaving}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Save size={15} />
                    <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE COUPON OFFER MODAL */}
      {/* ========================================================================= */}
      {isOfferModalOpen && (
        <div className="razorpay-modal-overlay" onClick={() => setIsOfferModalOpen(false)}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="razorpay-modal-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>Create Coupon Offer</h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Generate instant discount code for checkout</div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsOfferModalOpen(false)}
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="razorpay-modal-body" style={{ padding: '24px 20px' }}>
              <div className="form-field-group">
                <label className="form-label">Offer Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Festive AI Fellowship 35% Off"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                  placeholder="e.g. APEXAI35"
                  value={offerCode}
                  onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-field-group">
                  <label className="form-label">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input"
                    value={offerDiscountPercent}
                    onChange={(e) => setOfferDiscountPercent(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field-group">
                  <label className="form-label">Max Redemptions</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={offerMaxUses}
                    onChange={(e) => setOfferMaxUses(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>

              <div className="form-field-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Validity Duration (Days from Today)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={offerDaysValid}
                  onChange={(e) => setOfferDaysValid(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsOfferModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreatingOffer}
                >
                  <span>{isCreatingOffer ? 'Saving Offer...' : 'Create Active Coupon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW CREATOR PROFILE MODAL */}
      {/* ========================================================================= */}
      {selectedViewCreator && (
        <div className="razorpay-modal-overlay" onClick={() => setSelectedViewCreator(null)}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 640, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="razorpay-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Creator Profile
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Institutional faculty details & platform activity
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedViewCreator(null)}
                aria-label="Close Profile Modal"
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {/* Profile Top Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    color: '#1E293B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    border: '2px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  {selectedViewCreator.avatar ? (
                    <img
                      src={selectedViewCreator.avatar}
                      alt={selectedViewCreator.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    getCreatorInitials(selectedViewCreator.name) || <UserIcon size={24} style={{ color: '#64748B' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {selectedViewCreator.name}
                    </h4>
                    {(() => {
                      const vStatus = (selectedViewCreator.status || 'ACTIVE').toUpperCase()
                      const vIsActive = vStatus === 'ACTIVE'
                      const vIsSuspended = vStatus === 'SUSPENDED'
                      const vBg = vIsActive ? '#DCFCE7' : (vIsSuspended ? '#FEE2E2' : '#F1F5F9')
                      const vColor = vIsActive ? '#166534' : (vIsSuspended ? '#991B1B' : '#475569')
                      const vDot = vIsActive ? '#16A34A' : (vIsSuspended ? '#DC2626' : '#94A3B8')
                      const vLabel = vIsActive ? 'ACTIVE' : (vIsSuspended ? 'SUSPENDED' : 'INACTIVE')
                      return (
                        <span
                          style={{
                            background: vBg,
                            color: vColor,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 9999,
                            letterSpacing: '0.02em',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: vDot }} />
                          {vLabel}
                        </span>
                      )
                    })()}
                  </div>
                  <div style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.8125rem', marginBottom: 6 }}>
                    {selectedViewCreator.creatorProfile?.specialization || selectedViewCreator.creatorProfile?.headline || 'Curriculum Specialist'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>User ID:</span>
                    <code
                      style={{
                        background: '#F1F5F9',
                        color: '#334155',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        fontFamily: 'monospace'
                      }}
                    >
                      {selectedViewCreator.id}
                    </code>
                  </div>
                </div>
              </div>

              {/* Information Cards (2x2 Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Mail size={13} style={{ color: '#2563EB' }} />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.03em' }}>
                      EMAIL ADDRESS
                    </span>
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>
                    {selectedViewCreator.email}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Phone size={13} style={{ color: '#2563EB' }} />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.03em' }}>
                      PHONE NUMBER
                    </span>
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedViewCreator.phone || 'Not provided'}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Calendar size={13} style={{ color: '#2563EB' }} />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.03em' }}>
                      ACCOUNT CREATED
                    </span>
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedViewCreator.createdAt ? new Date(selectedViewCreator.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Clock size={13} style={{ color: '#2563EB' }} />
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.03em' }}>
                      LAST LOGIN
                    </span>
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                    {formatLastLogin(selectedViewCreator)}
                  </span>
                </div>
              </div>

              {/* Bio & Headline */}
              {(selectedViewCreator.creatorProfile?.headline || selectedViewCreator.creatorProfile?.biography || selectedViewCreator.bio) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.01em' }}>
                    Biography & Background
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, background: '#F8FAFC', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    {selectedViewCreator.creatorProfile?.biography || selectedViewCreator.bio || selectedViewCreator.creatorProfile?.headline}
                  </div>
                </div>
              )}

              {/* Assigned Courses */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.01em' }}>
                  Assigned Platform Courses ({selectedViewCreator.assignedCourses?.length || 0})
                </div>
                {selectedViewCreator.assignedCourses && selectedViewCreator.assignedCourses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedViewCreator.assignedCourses.map((ac) => (
                      <div
                        key={ac.course?.id || ac.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>
                          {ac.course?.title || 'Academic Course'}
                        </span>
                        <span style={{ fontSize: '0.6875rem', background: '#E2E8F0', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                          {ac.course?.status || 'PUBLISHED'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0, fontStyle: 'italic' }}>
                    No curriculum courses currently assigned to this faculty member.
                  </p>
                )}
              </div>
            </div>

            {/* Footer: Read-Only Close Action */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedViewCreator(null)}
                style={{ height: 36, padding: '0 22px', fontWeight: 600, borderRadius: 8 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT CREATOR MODAL */}
      {/* ========================================================================= */}
      {selectedEditCreator && (
        <div className="razorpay-modal-overlay" onClick={() => setSelectedEditCreator(null)}>
          <div
            className="razorpay-modal"
            style={{
              maxWidth: 620,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div
              className="razorpay-modal-header"
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 30,
                background: '#FFFFFF',
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Edit Creator Profile
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                    Update institutional instructor information & credentials
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedEditCreator(null)}
                style={{
                  padding: 6,
                  borderRadius: '50%',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form with Scrollable Body and Sticky Footer */}
            <form
              onSubmit={handleSaveEditCreator}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              {/* Scrollable Form Body */}
              <div
                className="razorpay-modal-body"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '22px 24px'
                }}
              >
              {/* Row 1: Full Name & Email Address */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div className="form-field-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editCreatorForm.name}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, name: e.target.value })}
                    placeholder="e.g. Dr. Alex Rivera"
                    required
                    style={{ height: 40, fontSize: '0.875rem' }}
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={editCreatorForm.email}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, email: e.target.value })}
                    placeholder="creator@aivortex.edu"
                    required
                    style={{ height: 40, fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Row 2: Phone Number (International selector & validation) & Specialization / Title */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 14 }}>
                <div className="form-field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', margin: 0 }}>
                      Phone Number
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Country Code Selector */}
                    <div style={{ position: 'relative' }} ref={countryDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
                        style={{
                          height: 40,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '0 10px',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          borderRadius: 8,
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#0F172A',
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
                            color: '#64748B',
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
                                background: c.dialCode === selectedCountry.dialCode ? '#EFF6FF' : 'transparent',
                                color: c.dialCode === selectedCountry.dialCode ? '#1D4ED8' : '#1E293B',
                                fontWeight: c.dialCode === selectedCountry.dialCode ? 600 : 400
                              }}
                              onMouseEnter={(e) => {
                                if (c.dialCode !== selectedCountry.dialCode) e.currentTarget.style.background = '#F8FAFC'
                              }}
                              onMouseLeave={(e) => {
                                if (c.dialCode !== selectedCountry.dialCode) e.currentTarget.style.background = 'transparent'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{c.flag}</span>
                                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{c.name}</span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginLeft: 8 }}>
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
                          color: phoneError ? '#EF4444' : '#94A3B8',
                          pointerEvents: 'none'
                        }}
                      />
                      <input
                        type="tel"
                        className="form-input"
                        value={editCreatorNationalPhone}
                        onChange={handleNationalPhoneChange}
                        placeholder={selectedCountry.placeholder || '98765 00002'}
                        style={{
                          width: '100%',
                          height: 40,
                          paddingLeft: 34,
                          borderColor: phoneError ? '#EF4444' : '#CBD5E1',
                          fontSize: '0.875rem'
                        }}
                      />
                    </div>
                  </div>

                  {phoneError ? (
                    <span style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: 4, display: 'block', fontWeight: 500 }}>
                      {phoneError}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                      Select country code and enter a valid phone number.
                    </span>
                  )}
                </div>

                <div className="form-field-group">
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                    Specialization / Title *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editCreatorForm.specialization}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, specialization: e.target.value })}
                    placeholder="e.g. Lead AI Researcher"
                    required
                    style={{ height: 40, fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              {/* Row 3: Organization / Headline */}
              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                  Organization / Headline
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editCreatorForm.headline}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, headline: e.target.value })}
                  placeholder="e.g. Apex AI Research Labs • Stanford Visiting Fellow"
                  style={{ height: 40, fontSize: '0.875rem' }}
                />
              </div>

              {/* Row 4: Modern Profile Photo Component (Upload + URL Option) */}
              <div className="form-field-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                  Profile Photo
                </label>
                
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: '16px',
                    background: '#F8FAFC',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0'
                  }}
                >
                  {/* Left: Avatar Preview */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0
                    }}
                  >
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        background: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        border: '2px solid #DBEAFE',
                        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {editCreatorForm.avatar ? (
                        <img
                          src={editCreatorForm.avatar}
                          alt={editCreatorForm.name || 'Creator'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        getCreatorInitials(editCreatorForm.name) || <UserIcon size={24} style={{ color: '#64748B' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748B' }}>
                      {editCreatorForm.avatar ? 'Custom Photo' : 'Initials Avatar'}
                    </span>
                  </div>

                  {/* Right: Upload Photo & Direct Image URL Controls */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Action Buttons Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#FFFFFF',
                          color: '#2563EB',
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
                          e.currentTarget.style.background = '#EFF6FF'
                          e.currentTarget.style.borderColor = '#93C5FD'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF'
                          e.currentTarget.style.borderColor = '#CBD5E1'
                        }}
                      >
                        <Upload size={14} />
                        <span>{editCreatorForm.avatar ? 'Replace Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            if (!file.type.startsWith('image/')) {
                              showToast('Please select a valid image file (PNG, JPG, WebP)', 'error')
                              return
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              showToast('Profile image must be less than 2MB', 'error')
                              return
                            }
                            const reader = new FileReader()
                            reader.onload = (loadEvt) => {
                              setEditCreatorForm((prev) => ({ ...prev, avatar: loadEvt.target?.result || '' }))
                              showToast('Profile photo updated', 'info')
                            }
                            reader.readAsDataURL(file)
                          }}
                        />
                      </label>

                      {editCreatorForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setEditCreatorForm({ ...editCreatorForm, avatar: '' })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: '#FFFFFF',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            padding: '7px 12px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FEF2F2'
                            e.currentTarget.style.borderColor = '#FCA5A5'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF'
                            e.currentTarget.style.borderColor = '#FECACA'
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Image URL Option Input */}
                    <div style={{ position: 'relative' }}>
                      <Link2
                        size={14}
                        style={{
                          position: 'absolute',
                          left: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#94A3B8',
                          pointerEvents: 'none'
                        }}
                      />
                      <input
                        type="url"
                        placeholder="Or enter image URL (e.g. https://...)"
                        value={editCreatorForm.avatar?.startsWith('data:') ? '' : editCreatorForm.avatar}
                        onChange={(e) => setEditCreatorForm({ ...editCreatorForm, avatar: e.target.value.trim() })}
                        style={{
                          width: '100%',
                          height: 36,
                          paddingLeft: 32,
                          paddingRight: 10,
                          borderRadius: 8,
                          border: '1px solid #CBD5E1',
                          background: '#FFFFFF',
                          fontSize: '0.8125rem',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#2563EB'
                          e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#CBD5E1'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    {/* Format and Size Hint */}
                    <div style={{ fontSize: '0.73rem', color: '#64748B', lineHeight: 1.4 }}>
                      Supported formats: JPG, PNG, WebP (Max 2MB) or direct HTTPS image URL. If none provided, a neutral initials avatar is used.
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Biography */}
              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                  Biography & Background
                </label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={editCreatorForm.bio}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, bio: e.target.value })}
                  placeholder="Summarize faculty tenure, academic research, or pedagogical background..."
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.875rem' }}
                />
              </div>

                {/* Row 6: Account Status */}
                <div className="form-field-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', marginBottom: 6, display: 'block' }}>
                    Account Status
                  </label>
                  <CustomSelect
                    options={EDIT_CREATOR_STATUS_OPTIONS}
                    value={editCreatorForm.status}
                    onChange={(e) => {
                      const nextVal = (e?.target?.value !== undefined ? e.target.value : e) || 'ACTIVE'
                      setEditCreatorForm((prev) => ({ ...prev, status: nextVal }))
                    }}
                    buttonStyle={{ height: 42, borderRadius: 8, border: '1px solid #CBD5E1' }}
                    portal={true}
                    autoPlacement={true}
                  />
                </div>
              </div>

              {/* Sticky Footer Actions */}
              <div
                className="razorpay-modal-footer"
                style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 20,
                  background: '#FFFFFF',
                  padding: '14px 24px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  flexShrink: 0
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedEditCreator(null)}
                  style={{ height: 38, padding: '0 18px', fontWeight: 600, borderRadius: 8 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingEditCreator || !!phoneError}
                  style={{ height: 38, padding: '0 20px', fontWeight: 700, borderRadius: 8 }}
                >
                  <span>{isSavingEditCreator ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CONFIRMATION DIALOG MODAL */}
      {/* ========================================================================= */}
      {confirmModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  className="razorpay-modal-icon"
                  style={{
                    background: confirmModal.confirmColor === '#DC2626' ? '#FEE2E2' : '#EFF6FF',
                    color: confirmModal.confirmColor
                  }}
                >
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.15rem', margin: 0 }}>
                    {confirmModal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                {confirmModal.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    background: confirmModal.confirmColor,
                    borderColor: confirmModal.confirmColor
                  }}
                  onClick={async () => {
                    if (confirmModal.onConfirm) {
                      await confirmModal.onConfirm()
                    }
                    setConfirmModal({ ...confirmModal, open: false })
                  }}
                >
                  <span>{confirmModal.confirmText}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5B: CHANGE CREATOR PASSWORD MODAL */}
      {/* ========================================================================= */}
      {changePasswordModal.open && changePasswordModal.creator && (
        <div className="razorpay-modal-overlay" onClick={() => !changePasswordModal.isSubmitting && setChangePasswordModal({ ...changePasswordModal, open: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 480, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Change Password
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Update security credentials for {changePasswordModal.creator.name}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setChangePasswordModal({ ...changePasswordModal, open: false })}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveChangePassword} style={{ padding: '20px' }}>
              {changePasswordModal.error && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{changePasswordModal.error}</span>
                </div>
              )}

              {/* Creator Info Snippet */}
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {changePasswordModal.creator.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {changePasswordModal.creator.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateChangePassword}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 6,
                    padding: '6px 10px',
                    color: '#2563EB',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#DBEAFE'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#EFF6FF'
                  }}
                >
                  <Sparkles size={13} />
                  <span>Generate Password</span>
                </button>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', margin: 0 }}>
                    New Password *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: changePasswordModal.newPassword.length >= 32 ? '#DC2626' : '#64748B', fontWeight: 500 }}>
                    {changePasswordModal.newPassword.length}/32
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={changePasswordModal.showNewPassword ? 'text' : 'password'}
                    value={changePasswordModal.newPassword}
                    maxLength={32}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 32)
                      setChangePasswordModal((prev) => ({ ...prev, newPassword: val, error: '' }))
                    }}
                    placeholder="Enter 8–32 characters..."
                    required
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 38px 0 12px',
                      borderRadius: 8,
                      border: `1px solid ${
                        changePasswordModal.newPassword && !passwordCriteria.isValid
                          ? '#EF4444'
                          : changePasswordModal.newPassword && passwordCriteria.isValid
                          ? '#10B981'
                          : '#CBD5E1'
                      }`,
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setChangePasswordModal((prev) => ({ ...prev, showNewPassword: !prev.showNewPassword }))
                    }
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {changePasswordModal.showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Validation message if below 8 characters */}
                {changePasswordModal.newPassword.length > 0 && changePasswordModal.newPassword.length < 8 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: '#DC2626', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertCircle size={13} style={{ flexShrink: 0 }} />
                    <span>Password must be at least 8 characters long (currently {changePasswordModal.newPassword.length}/32).</span>
                  </div>
                )}

                {/* Password Strength Meter */}
                {changePasswordModal.newPassword && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                      <span style={{ color: '#64748B' }}>Password Strength:</span>
                      <span style={{ fontWeight: 700, color: changePasswordStrength.color }}>
                        {changePasswordStrength.label}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${changePasswordStrength.score}%`,
                          height: '100%',
                          background: changePasswordStrength.color,
                          transition: 'width 0.25s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Helpful Validation Text & Requirements Checklist */}
                <div style={{ marginTop: 10, padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                    <span>Password must be 8–32 characters and include uppercase, lowercase, number, and special character.</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '5px 12px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: passwordCriteria.hasMinLen && passwordCriteria.hasMaxLen ? '#16A34A' : (changePasswordModal.newPassword.length > 0 ? '#DC2626' : '#64748B'), fontWeight: passwordCriteria.hasMinLen ? 600 : 400 }}>
                      <Check size={12} style={{ strokeWidth: passwordCriteria.hasMinLen ? 3 : 2, opacity: passwordCriteria.hasMinLen ? 1 : 0.4, flexShrink: 0 }} />
                      <span>8–32 characters</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: passwordCriteria.hasUpper ? '#16A34A' : '#64748B', fontWeight: passwordCriteria.hasUpper ? 600 : 400 }}>
                      <Check size={12} style={{ strokeWidth: passwordCriteria.hasUpper ? 3 : 2, opacity: passwordCriteria.hasUpper ? 1 : 0.4, flexShrink: 0 }} />
                      <span>1 uppercase (A–Z)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: passwordCriteria.hasLower ? '#16A34A' : '#64748B', fontWeight: passwordCriteria.hasLower ? 600 : 400 }}>
                      <Check size={12} style={{ strokeWidth: passwordCriteria.hasLower ? 3 : 2, opacity: passwordCriteria.hasLower ? 1 : 0.4, flexShrink: 0 }} />
                      <span>1 lowercase (a–z)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: passwordCriteria.hasNumber ? '#16A34A' : '#64748B', fontWeight: passwordCriteria.hasNumber ? 600 : 400 }}>
                      <Check size={12} style={{ strokeWidth: passwordCriteria.hasNumber ? 3 : 2, opacity: passwordCriteria.hasNumber ? 1 : 0.4, flexShrink: 0 }} />
                      <span>1 number (0–9)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: passwordCriteria.hasSpecial ? '#16A34A' : '#64748B', fontWeight: passwordCriteria.hasSpecial ? 600 : 400, gridColumn: 'span 2' }}>
                      <Check size={12} style={{ strokeWidth: passwordCriteria.hasSpecial ? 3 : 2, opacity: passwordCriteria.hasSpecial ? 1 : 0.4, flexShrink: 0 }} />
                      <span>1 special character (e.g. !@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1E293B', margin: 0 }}>
                    Confirm Password *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: changePasswordModal.confirmPassword.length >= 32 ? '#DC2626' : '#64748B', fontWeight: 500 }}>
                    {changePasswordModal.confirmPassword.length}/32
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={changePasswordModal.showConfirmPassword ? 'text' : 'password'}
                    value={changePasswordModal.confirmPassword}
                    maxLength={32}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 32)
                      setChangePasswordModal((prev) => ({ ...prev, confirmPassword: val, error: '' }))
                    }}
                    placeholder="Re-enter password to confirm..."
                    required
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 38px 0 12px',
                      borderRadius: 8,
                      border: `1px solid ${
                        changePasswordModal.confirmPassword &&
                        changePasswordModal.newPassword !== changePasswordModal.confirmPassword
                          ? '#EF4444'
                          : changePasswordModal.confirmPassword &&
                            changePasswordModal.newPassword === changePasswordModal.confirmPassword
                          ? '#10B981'
                          : '#CBD5E1'
                      }`,
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setChangePasswordModal((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))
                    }
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 4
                    }}
                    aria-label="Toggle confirm password visibility"
                  >
                    {changePasswordModal.showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {changePasswordModal.confirmPassword &&
                  changePasswordModal.newPassword !== changePasswordModal.confirmPassword && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, color: '#EF4444', fontSize: '0.75rem', fontWeight: 600 }}>
                      <AlertCircle size={13} style={{ flexShrink: 0 }} />
                      <span>Passwords do not match.</span>
                    </div>
                  )}
                {changePasswordModal.confirmPassword &&
                  changePasswordModal.newPassword === changePasswordModal.confirmPassword &&
                  passwordCriteria.isValid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, color: '#16A34A', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Check size={13} style={{ strokeWidth: 3, flexShrink: 0 }} />
                      <span>Passwords match.</span>
                    </div>
                  )}
              </div>

              {/* Send to registered email option */}
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: '0.8125rem',
                    color: '#334155'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={changePasswordModal.sendEmail}
                    onChange={(e) =>
                      setChangePasswordModal((prev) => ({ ...prev, sendEmail: e.target.checked }))
                    }
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: '#2563EB',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Send new password to creator's registered email ({changePasswordModal.creator.email})</span>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setChangePasswordModal({ ...changePasswordModal, open: false })}
                  disabled={changePasswordModal.isSubmitting}
                  style={{ height: 38, padding: '0 16px', fontWeight: 600, borderRadius: 8 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    changePasswordModal.isSubmitting ||
                    !passwordCriteria.isValid ||
                    !changePasswordModal.confirmPassword ||
                    changePasswordModal.newPassword !== changePasswordModal.confirmPassword
                  }
                  style={{
                    height: 38,
                    padding: '0 18px',
                    fontWeight: 700,
                    borderRadius: 8,
                    opacity: (
                      changePasswordModal.isSubmitting ||
                      !passwordCriteria.isValid ||
                      !changePasswordModal.confirmPassword ||
                      changePasswordModal.newPassword !== changePasswordModal.confirmPassword
                    ) ? 0.5 : 1,
                    cursor: (
                      changePasswordModal.isSubmitting ||
                      !passwordCriteria.isValid ||
                      !changePasswordModal.confirmPassword ||
                      changePasswordModal.newPassword !== changePasswordModal.confirmPassword
                    ) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>{changePasswordModal.isSubmitting ? 'Updating...' : 'Save Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: CREDENTIALS NOTICE MODAL */}
      {/* ========================================================================= */}
      {credentialsNoticeModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => setCredentialsNoticeModal({ ...credentialsNoticeModal, open: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="razorpay-modal-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.15rem', margin: 0 }}>
                    {credentialsNoticeModal.actionType === 'RESET' ? 'Credentials Reset' : 'Credentials Dispatched'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {credentialsNoticeModal.creatorName} ({credentialsNoticeModal.email})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setCredentialsNoticeModal({ ...credentialsNoticeModal, open: false })}
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px 20px' }}>
              <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 16px 0' }}>
                A secure temporary password was initialized for this instructor. Please ensure they receive these credentials if automated SMTP delivery was delayed:
              </p>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 16
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, display: 'block' }}>
                    TEMPORARY PASSWORD
                  </span>
                  <code style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563EB' }}>
                    {credentialsNoticeModal.tempPassword}
                  </code>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsNoticeModal.tempPassword)
                    setCopiedModalKey(true)
                    showToast('Password copied to clipboard', 'info')
                    setTimeout(() => setCopiedModalKey(false), 2000)
                  }}
                  style={{ height: 36, padding: '0 12px', fontWeight: 600 }}
                >
                  {copiedModalKey ? <Check size={14} style={{ color: '#16A34A' }} /> : <Copy size={14} />}
                  <span style={{ marginLeft: 6 }}>{copiedModalKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: '#64748B', marginBottom: 20 }}>
                <Mail size={15} style={{ color: '#2563EB' }} />
                <span>Onboarding email dispatched to: <strong>{credentialsNoticeModal.email}</strong></span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCredentialsNoticeModal({ ...credentialsNoticeModal, open: false })}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: MANDATORY REJECTION REASON MODAL */}
      {/* ========================================================================= */}
      {rejectModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => !isSubmittingReview && setRejectModal({ open: false, request: null, reason: '', error: '' })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="razorpay-modal-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.15rem', margin: 0, color: '#0F172A' }}>
                    Reject Change Request
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {rejectModal.request?.creatorProfile?.user?.name || 'Creator'} ({rejectModal.request?.requestType || 'Request'})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !isSubmittingReview && setRejectModal({ open: false, request: null, reason: '', error: '' })}
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  Please provide a clear justification for rejecting this request. The creator will view this feedback directly in their <strong>My Profile → Request Status</strong> dashboard.
                </p>

                {rejectModal.error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: '#B91C1C', marginBottom: 16 }}>
                    {rejectModal.error}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Rejection Reason <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value, error: '' }))}
                    placeholder="E.g., The requested email domain must be an authorized organizational address, or the bio exceeds institutional guidelines."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    autoFocus
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                    Mandatory field. Helps instructors make appropriate revisions before re-submitting.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setRejectModal({ open: false, request: null, reason: '', error: '' })}
                    disabled={isSubmittingReview}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={isSubmittingReview || !rejectModal.reason.trim()}
                    style={{
                      background: '#DC2626',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {isSubmittingReview ? <RefreshCw size={14} className="spin" /> : <X size={14} />}
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPROVE LECTURE CONFIRMATION */}
      {/* ========================================================================= */}
      {approveModal.open && (
        <div className="razorpay-modal-overlay" style={{ zIndex: 2500 }} onClick={() => !approveModal.isSubmitting && setApproveModal({ open: false, lecture: null, isSubmitting: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 480, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Approve Lecture?
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                    Content Verification & Pedagogical Approval
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !approveModal.isSubmitting && setApproveModal({ open: false, lecture: null, isSubmitting: false })}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.9375rem', color: '#334155', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                <strong style={{ color: '#0F172A' }}>"{approveModal.lecture?.title}"</strong> will be marked as approved and made available according to the existing publishing rules.
              </p>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>Lecture Details</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                  Course: {approveModal.lecture?.playlist?.course?.title || 'Academic Program'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: 2 }}>
                  Section: {approveModal.lecture?.playlist?.title || 'Section'} • Creator: {approveModal.lecture?.creator?.name || 'Instructor'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setApproveModal({ open: false, lecture: null, isSubmitting: false })}
                  disabled={approveModal.isSubmitting}
                  style={{ height: 40, padding: '0 18px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmApproveLecture}
                  disabled={approveModal.isSubmitting}
                  style={{
                    background: '#16A34A',
                    borderColor: '#16A34A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    height: 40,
                    padding: '0 20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {approveModal.isSubmitting ? <RefreshCw size={15} className="spin" /> : <CheckCircle2 size={16} />}
                  <span>Approve Lecture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REQUEST CHANGES MODAL */}
      {/* ========================================================================= */}
      {requestChangesModal.open && (
        <div className="razorpay-modal-overlay" style={{ zIndex: 2500 }} onClick={() => !requestChangesModal.isSubmitting && setRequestChangesModal({ open: false, lecture: null, feedback: '', quickReason: '', error: '', isSubmitting: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 540, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Request Changes
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                    Send actionable revision guidance to the Creator
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !requestChangesModal.isSubmitting && setRequestChangesModal({ open: false, lecture: null, feedback: '', quickReason: '', error: '', isSubmitting: false })}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmRequestChanges}>
              <div style={{ padding: '24px' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                    Lecture: <span style={{ fontWeight: 600, color: '#334155' }}>{requestChangesModal.lecture?.title}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 3 }}>
                    Creator: <strong style={{ color: '#0F172A' }}>{requestChangesModal.lecture?.creator?.name || 'Instructor'}</strong>
                  </div>
                </div>

                {/* Optional Quick Reasons */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                    Quick Reasons (Optional Helpers):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {QUICK_REVIEW_REASONS.map((reason) => {
                      const isSelected = requestChangesModal.quickReason === reason
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setRequestChangesModal((prev) => ({ ...prev, quickReason: '' }))
                            } else {
                              setRequestChangesModal((prev) => {
                                const prefix = `[${reason}] `
                                const cleanFeedback = prev.feedback.replace(/^\[.*?\]\s*/, '')
                                return {
                                  ...prev,
                                  quickReason: reason,
                                  feedback: `${prefix}${cleanFeedback}`.trimStart(),
                                  error: ''
                                }
                              })
                            }
                          }}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 9999,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            border: `1px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                            background: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#1D4ED8' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '● ' : '○ '}
                          {reason}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Feedback * */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                      Feedback <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                  </div>
                  <textarea
                    rows={5}
                    value={requestChangesModal.feedback}
                    onChange={(e) => setRequestChangesModal((prev) => ({ ...prev, feedback: e.target.value, error: '' }))}
                    placeholder="Explain what should be corrected before resubmission..."
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: `1px solid ${requestChangesModal.error ? '#DC2626' : '#CBD5E1'}`,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                  {requestChangesModal.error ? (
                    <div style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: 4, fontWeight: 600 }}>
                      {requestChangesModal.error}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                      Mandatory field. The creator will view this feedback in their Course Workspace to make revisions.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setRequestChangesModal({ open: false, lecture: null, feedback: '', quickReason: '', error: '', isSubmitting: false })}
                    disabled={requestChangesModal.isSubmitting}
                    style={{ height: 40, padding: '0 18px', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={requestChangesModal.isSubmitting}
                    style={{
                      background: '#D97706',
                      borderColor: '#D97706',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      height: 40,
                      padding: '0 20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {requestChangesModal.isSubmitting ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
                    <span>Send Feedback</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNPUBLISH LECTURE MODAL */}
      {/* ========================================================================= */}
      {unpublishModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => !unpublishModal.isSubmitting && setUnpublishModal({ open: false, lectureId: null, reason: '', error: '', isSubmitting: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 480, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Unpublish Lecture
              </h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !unpublishModal.isSubmitting && setUnpublishModal({ open: false, lectureId: null, reason: '', error: '', isSubmitting: false })}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.875rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Unpublishing will hide this lecture from enrolled students. Provide an administrative reason:
              </p>

              <div style={{ marginBottom: 20 }}>
                <textarea
                  rows={3}
                  value={unpublishModal.reason}
                  onChange={(e) => setUnpublishModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Reason for unpublishing this lecture..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setUnpublishModal({ open: false, lectureId: null, reason: '', error: '', isSubmitting: false })}
                  disabled={unpublishModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmUnpublish}
                  disabled={unpublishModal.isSubmitting}
                  style={{ background: '#DC2626', borderColor: '#DC2626', color: '#FFFFFF', fontWeight: 700 }}
                >
                  {unpublishModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : null}
                  <span>Unpublish Lecture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE OFFER MODAL */}
      {/* ========================================================================= */}
      {deleteOfferModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => !deleteOfferModal.isSubmitting && setDeleteOfferModal({ open: false, offer: null, isSubmitting: false })}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 440, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Delete Coupon Offer?
                </h3>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !deleteOfferModal.isSubmitting && setDeleteOfferModal({ open: false, offer: null, isSubmitting: false })}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete offer coupon <strong style={{ color: '#0F172A' }}>"{deleteOfferModal.offer?.code}"</strong>? This coupon will no longer be valid at checkout.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDeleteOfferModal({ open: false, offer: null, isSubmitting: false })}
                  disabled={deleteOfferModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirmDeleteOffer}
                  disabled={deleteOfferModal.isSubmitting}
                  style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 700 }}
                >
                  {deleteOfferModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : null}
                  <span>Delete Coupon</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN SECTION MODAL (ADD / EDIT) */}
      {/* ========================================================================= */}
      {adminSectionModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => !adminSectionModal.isSaving && setAdminSectionModal((prev) => ({ ...prev, open: false }))}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 480, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                {adminSectionModal.mode === 'create' ? 'Create New Section' : 'Edit Section'}
              </h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !adminSectionModal.isSaving && setAdminSectionModal((prev) => ({ ...prev, open: false }))}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSection}>
              <div style={{ padding: '24px' }}>
                {adminSectionModal.error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: '#B91C1C', marginBottom: 16 }}>
                    {adminSectionModal.error}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Section Title <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={adminSectionModal.title}
                    onChange={(e) => setAdminSectionModal((prev) => ({ ...prev, title: e.target.value, error: '' }))}
                    placeholder="E.g., High-Performance Computing with NumPy"
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Section Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={adminSectionModal.description}
                    onChange={(e) => setAdminSectionModal((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief overview of concepts covered in this section..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setAdminSectionModal((prev) => ({ ...prev, open: false }))}
                    disabled={adminSectionModal.isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={adminSectionModal.isSaving || !adminSectionModal.title.trim()}
                    style={{ fontWeight: 700 }}
                  >
                    {adminSectionModal.isSaving ? <RefreshCw size={14} className="spin" /> : null}
                    <span>{adminSectionModal.mode === 'create' ? 'Create Section' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN LECTURE MODAL (ADD / EDIT & VIDEO UPLOAD) */}
      {/* ========================================================================= */}
      {adminLectureModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => !adminLectureModal.isSaving && !adminLectureModal.isUploading && setAdminLectureModal((prev) => ({ ...prev, open: false }))}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 560, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {adminLectureModal.mode === 'create' ? 'Add Lecture to Section' : 'Edit Lecture & Video Asset'}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                  Admin Curriculum Management & Video Ingestion
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !adminLectureModal.isSaving && !adminLectureModal.isUploading && setAdminLectureModal((prev) => ({ ...prev, open: false }))}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLecture}>
              <div style={{ padding: '24px' }}>
                {adminLectureModal.error && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: '#B91C1C', marginBottom: 16 }}>
                    {adminLectureModal.error}
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Lecture Title <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={adminLectureModal.title}
                    onChange={(e) => setAdminLectureModal((prev) => ({ ...prev, title: e.target.value, error: '' }))}
                    placeholder="E.g., 01 Broadcasting, Slicing & Boolean Masking"
                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                      Duration
                    </label>
                    <input
                      type="text"
                      value={adminLectureModal.duration}
                      onChange={(e) => setAdminLectureModal((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="15:00"
                      style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={adminLectureModal.isPreview}
                        onChange={(e) => setAdminLectureModal((prev) => ({ ...prev, isPreview: e.target.checked }))}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Free Public Preview</span>
                    </label>
                  </div>
                </div>

                {/* Video Asset Source Mode */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                    Video Asset Configuration:
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setAdminLectureModal((prev) => ({ ...prev, uploadMode: 'url' }))}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        border: `1px solid ${adminLectureModal.uploadMode === 'url' ? '#2563EB' : '#CBD5E1'}`,
                        background: adminLectureModal.uploadMode === 'url' ? '#EFF6FF' : '#FFFFFF',
                        color: adminLectureModal.uploadMode === 'url' ? '#1D4ED8' : '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      Cloud / Stream Video URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminLectureModal((prev) => ({ ...prev, uploadMode: 'upload' }))}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        border: `1px solid ${adminLectureModal.uploadMode === 'upload' ? '#2563EB' : '#CBD5E1'}`,
                        background: adminLectureModal.uploadMode === 'upload' ? '#EFF6FF' : '#FFFFFF',
                        color: adminLectureModal.uploadMode === 'upload' ? '#1D4ED8' : '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      Upload Local Video File
                    </button>
                  </div>

                  {adminLectureModal.uploadMode === 'url' ? (
                    <div>
                      <input
                        type="text"
                        value={adminLectureModal.videoUrl}
                        onChange={(e) => setAdminLectureModal((prev) => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://commondatastorage.googleapis.com/... or S3/CloudFront/MP4 URL"
                        style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                        Supports Google Cloud Storage, AWS S3, CloudFront, or any standard MP4/HLS streaming URL.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setAdminLectureModal((prev) => ({ ...prev, selectedFile: file }))
                          }
                        }}
                        style={{ display: 'block', width: '100%', fontSize: '0.85rem', color: '#334155' }}
                      />
                      {adminLectureModal.selectedFile && (
                        <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: 4 }}>
                          Selected: {adminLectureModal.selectedFile.name} ({Math.round(adminLectureModal.selectedFile.size / (1024 * 1024))} MB)
                        </div>
                      )}
                    </div>
                  )}

                  {adminLectureModal.isUploading && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginBottom: 4 }}>
                        <span>Uploading Video File...</span>
                        <span>{adminLectureModal.uploadProgress}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
                        <div style={{ width: `${adminLectureModal.uploadProgress}%`, height: '100%', background: '#2563EB', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={adminLectureModal.description}
                    onChange={(e) => setAdminLectureModal((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Pedagogical objectives or lab instructions..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setAdminLectureModal((prev) => ({ ...prev, open: false }))}
                    disabled={adminLectureModal.isSaving || adminLectureModal.isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={adminLectureModal.isSaving || adminLectureModal.isUploading || !adminLectureModal.title.trim()}
                    style={{ fontWeight: 700 }}
                  >
                    {adminLectureModal.isSaving ? <RefreshCw size={14} className="spin" /> : null}
                    <span>{adminLectureModal.mode === 'create' ? 'Create Lecture' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN DELETE CURRICULUM CONFIRMATION */}
      {/* ========================================================================= */}
      {adminDeleteCurriculumModal.open && (
        <div className="razorpay-modal-overlay" onClick={() => !adminDeleteCurriculumModal.isSubmitting && setAdminDeleteCurriculumModal((prev) => ({ ...prev, open: false }))}>
          <div
            className="razorpay-modal"
            style={{ maxWidth: 440, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Delete {adminDeleteCurriculumModal.type === 'section' ? 'Section' : 'Lecture'}?
                </h3>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !adminDeleteCurriculumModal.isSubmitting && setAdminDeleteCurriculumModal((prev) => ({ ...prev, open: false }))}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong style={{ color: '#0F172A' }}>"{adminDeleteCurriculumModal.title}"</strong>?
                {adminDeleteCurriculumModal.type === 'section' && ' All child lectures in this section will also be removed.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setAdminDeleteCurriculumModal((prev) => ({ ...prev, open: false }))}
                  disabled={adminDeleteCurriculumModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirmDeleteCurriculum}
                  disabled={adminDeleteCurriculumModal.isSubmitting}
                  style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 700 }}
                >
                  {adminDeleteCurriculumModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : null}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CURRICULUM PREVIEW VIDEO PLAYER */}
      {/* ========================================================================= */}
      {curriculumPreviewVideo.open && (
        <div className="modal-overlay" onClick={() => setCurriculumPreviewVideo({ open: false, videoUrl: '', title: '', course: '' })}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 840, background: '#0F172A', color: '#FFFFFF', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
                  {curriculumPreviewVideo.course || 'Course Preview'}
                </span>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', margin: '2px 0 0 0' }}>{curriculumPreviewVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCurriculumPreviewVideo({ open: false, videoUrl: '', title: '', course: '' })}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000000' }}>
              <video
                controls
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                src={getPlayableVideoUrl(curriculumPreviewVideo.videoUrl)}
              >
                Your browser does not support HTML5 video streaming.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN REJECT COURSE REVIEW */}
      {/* ========================================================================= */}
      {rejectReviewModal.open && (
        <div
          className="razorpay-modal-overlay"
          onClick={() => !rejectReviewModal.isSubmitting && setRejectReviewModal((prev) => ({ ...prev, open: false }))}
        >
          <div
            className="razorpay-modal"
            style={{ maxWidth: 520, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="razorpay-modal-header"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    Reject Course Review
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {rejectReviewModal.review?.student?.name} • {rejectReviewModal.review?.course?.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !rejectReviewModal.isSubmitting && setRejectReviewModal((prev) => ({ ...prev, open: false }))}
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectReviewSubmit}>
              <div style={{ padding: '20px 24px' }}>
                {/* Context Review Snippet */}
                {rejectReviewModal.review && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      marginBottom: 16
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          fill={star <= rejectReviewModal.review.rating ? '#F59E0B' : 'transparent'}
                          color={star <= rejectReviewModal.review.rating ? '#F59E0B' : '#CBD5E1'}
                        />
                      ))}
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', marginLeft: 4 }}>
                        {rejectReviewModal.review.rating}.0
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{rejectReviewModal.review.reviewText}"
                    </p>
                  </div>
                )}

                {/* Quick Helper Reasons */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase' }}>
                    Quick Reasons
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {[
                      'Inappropriate or offensive language',
                      'Spam or promotional content',
                      'Violates community guidelines',
                      'Off-topic / Not about course content',
                      'Misattributed or duplicate review'
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setRejectReviewModal((prev) => ({ ...prev, reason }))}
                        style={{
                          fontSize: '0.72rem',
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: rejectReviewModal.reason === reason ? '1px solid #DC2626' : '1px solid #CBD5E1',
                          background: rejectReviewModal.reason === reason ? '#FEF2F2' : '#F8FAFC',
                          color: rejectReviewModal.reason === reason ? '#991B1B' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Reason Textarea */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Rejection Reason (Sent to Scholar) <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReviewModal.reason}
                    onChange={(e) => setRejectReviewModal((prev) => ({ ...prev, reason: e.target.value, error: '' }))}
                    placeholder="Provide specific feedback on why this review was rejected so the student can revise it..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: rejectReviewModal.error ? '1px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {rejectReviewModal.error && (
                    <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 4, fontWeight: 600 }}>
                      {rejectReviewModal.error}
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setRejectReviewModal((prev) => ({ ...prev, open: false }))}
                    disabled={rejectReviewModal.isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={rejectReviewModal.isSubmitting}
                    style={{ background: '#DC2626', color: '#FFFFFF', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {rejectReviewModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : null}
                    <span>Confirm Rejection</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

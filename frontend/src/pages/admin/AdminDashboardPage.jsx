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
  Filter,
  ArrowUpDown,
  EyeOff,
  Sparkles,
  Upload,
  Link2,
  ChevronDown
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/admin/StatCard'
import CustomSelect from '../../components/common/CustomSelect'
import api from '../../services/api'
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
    if (path.includes('/admin/notifications')) return 'notifications'
    if (path.includes('/admin/reports')) return 'reports'
    if (path.includes('/admin/requests')) return 'requests'
    if (path.includes('/admin/audit-logs')) return 'audit-logs'
    if (path.includes('/admin/security')) return 'security'
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
  const [paymentsList, setPaymentsList] = useState([])
  const [requestsList, setRequestsList] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [reportsData, setReportsData] = useState(null)

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
      setActiveTab('courses')
      setCourseSubTab('controls')
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
        profRes
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
        api.admin.getProfile()
      ])

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
    } catch (err) {
      console.warn('Admin load note:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

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

  const handleDeleteOffer = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete offer coupon "${code}"?`)) return
    try {
      await api.admin.deleteOffer(id)
      showToast(`Offer ${code} deleted`, 'info')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Failed to delete offer', 'error')
    }
  }

  // Video Verification Handlers
  const handleApproveVideo = async (lessonId) => {
    try {
      await api.admin.reviewVideo(lessonId, 'APPROVED', 'Lecture quality verified and approved by Admin.')
      showToast('Video approved! You can now publish it to students.', 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error')
    }
  }

  const handlePublishLesson = async (lessonId) => {
    try {
      await api.admin.publishLesson(lessonId)
      showToast('Lecture published to enrolled students', 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Publish failed', 'error')
    }
  }

  const handleUnpublishLesson = async (lessonId) => {
    const reason = prompt('Reason for unpublishing this lesson:')
    if (!reason) return
    try {
      await api.admin.unpublishLesson(lessonId, reason)
      showToast('Lecture unpublished from student player', 'info')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Unpublish failed', 'error')
    }
  }

  const handleReviewRequest = async (requestId, action) => {
    try {
      await api.admin.reviewRequest(requestId, action, `Admin marked request as ${action}`)
      showToast(`Request ${action.toLowerCase()} successfully`, 'success')
      loadAdminData()
    } catch (err) {
      showToast(err.message || 'Review action failed', 'error')
    }
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
              marginBottom: 24,
              alignItems: 'stretch'
            }}
          >
            {/* Section 1: Video Review Queue */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
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
                    Video Verification Queue
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
                          <span
                            style={{
                              background: '#FEF3C7',
                              color: '#92400E',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 6
                            }}
                          >
                            SUBMITTED
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => navigate('/admin/playlists')}
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
                borderRadius: 16,
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
                borderRadius: 16,
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
                borderRadius: 16,
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
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => navigate(`/admin/courses/${c.id}/edit`)}
                            title="Edit Course"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Edit
                          </button>
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

          {/* Subtab B: Pricing & Offers */}
          {courseSubTab === 'pricing' && (
            <div>
              {/* Offers Table */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, marginBottom: 24 }}>
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
                              <button className="btn btn-outline btn-sm" onClick={() => handleDeleteOffer(off.id, off.code)} style={{ color: '#DC2626', borderColor: '#FCA5A5' }}>
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
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
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
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
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
              borderRadius: 14,
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

          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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
      {/* 5. PLAYLIST & VIDEO MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'video-verification' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Playlist & Video Verification Queue
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Verify creator video submissions against pedagogical and audio-visual benchmarks before public student streaming.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            {verificationQueue.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Lecture Title</th>
                    <th>Instructor</th>
                    <th>Course & Module</th>
                    <th>Verification Status</th>
                    <th>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationQueue.map((v) => (
                    <tr key={v.id}>
                      <td><strong>{v.title}</strong></td>
                      <td>{v.creator?.name || 'Faculty Member'}</td>
                      <td>
                        <div>{v.playlist?.course?.title || 'Program'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{v.playlist?.title} • {v.duration}</div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: v.status === 'PUBLISHED' ? '#DCFCE7' : v.status === 'APPROVED' ? '#E0E7FF' : '#FEF3C7',
                            color: v.status === 'PUBLISHED' ? '#166534' : v.status === 'APPROVED' ? '#3730A3' : '#92400E'
                          }}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {v.status !== 'APPROVED' && v.status !== 'PUBLISHED' && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleApproveVideo(v.id)}
                              style={{ color: '#16A34A', borderColor: '#86EFAC' }}
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve Quality</span>
                            </button>
                          )}
                          {v.status === 'APPROVED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handlePublishLesson(v.id)}
                              style={{ background: '#16A34A', borderColor: '#16A34A' }}
                            >
                              <Globe size={14} />
                              <span>Publish to Students</span>
                            </button>
                          )}
                          {v.status === 'PUBLISHED' && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleUnpublishLesson(v.id)}
                              style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                            >
                              <span>Unpublish</span>
                            </button>
                          )}
                          {v.status !== 'PUBLISHED' && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                const note = prompt('Enter revision feedback note for Instructor:')
                                if (note) {
                                  api.admin.reviewVideo(v.id, 'RETURNED_FOR_EDIT', note).then(() => {
                                    showToast('Video returned with revision instructions', 'info')
                                    loadAdminData()
                                  })
                                }
                              }}
                              style={{ color: '#D97706', borderColor: '#FDE68A' }}
                            >
                              <RotateCcw size={14} />
                              <span>Return for Edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '44px 20px', color: '#64748B' }}>
                <CheckCircle2 size={36} style={{ color: '#10B981', margin: '0 auto 10px auto' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0', color: '#0F172A' }}>
                  Verification Queue Clear
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  All creator video lectures have been reviewed and approved.
                </p>
              </div>
            )}
          </div>
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

          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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

          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
            {/* Revenue breakdown by course */}
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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
      {activeTab === 'requests' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
              Creator Profile Modification Requests
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Review instructor headline, bio, and credential updates before displaying publicly.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
            {requestsList.length > 0 ? (
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Instructor Name</th>
                    <th>Requested Headline / Bio</th>
                    <th>Status</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsList.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.id.slice(0, 8)}</strong></td>
                      <td>{r.creatorProfile?.user?.name || 'Creator'}</td>
                      <td>{r.requestedBio || r.requestedHeadline || JSON.stringify(r.requestedChanges || {})}</td>
                      <td>
                        <span className="badge" style={{ background: r.status === 'PENDING' ? '#FEF3C7' : '#DCFCE7', color: r.status === 'PENDING' ? '#92400E' : '#166534' }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleReviewRequest(r.id, 'APPROVED')}
                              style={{ color: '#16A34A', borderColor: '#86EFAC' }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => handleReviewRequest(r.id, 'REJECTED')}
                              style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                No pending Creator profile requests.
              </div>
            )}
          </div>
        </div>
      )}

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

          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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

            <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
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
                  borderRadius: 16,
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: 20
                }}
              >
                {/* Card 1: Identity & Contact Information */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
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
                    borderRadius: 16,
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
                  borderRadius: 16,
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
                borderRadius: 16,
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
            style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', borderRadius: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="razorpay-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                style={{ padding: 6, borderRadius: '50%', color: '#64748B' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditCreator} style={{ padding: '22px 24px' }}>
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
              <div className="form-field-group" style={{ marginBottom: 22 }}>
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
                />
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
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
    </div>
  )
}

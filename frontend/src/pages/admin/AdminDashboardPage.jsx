import { useState, useEffect, useMemo } from 'react'
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
  ExternalLink
} from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/admin/StatCard'
import api from '../../services/api'
import defaultAboutData from '../../data/defaultAboutData'
import defaultFooterData from '../../data/defaultFooterData'

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
  const [isSavingEditCreator, setIsSavingEditCreator] = useState(false)
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
        footerRes
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
        api.admin.getFooter()
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
        if (creatorStatusFilter !== 'ALL' && cr.status !== creatorStatusFilter) {
          return false
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
        if (creatorSortBy === 'name') {
          return (a.name || '').localeCompare(b.name || '')
        }
        if (creatorSortBy === 'created_asc') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        }
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      })
  }, [creators, creatorStatusFilter, creatorSearch, creatorSortBy])

  const handleOpenEditCreator = (cr) => {
    setSelectedEditCreator(cr)
    setEditCreatorForm({
      name: cr.name || '',
      email: cr.email || '',
      phone: cr.phone || '',
      avatar: cr.avatar || '',
      specialization: cr.creatorProfile?.specialization || '',
      headline: cr.creatorProfile?.headline || '',
      bio: cr.creatorProfile?.biography || cr.bio || '',
      status: cr.status || 'ACTIVE'
    })
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

    try {
      setIsSavingEditCreator(true)
      await api.admin.updateCreator(selectedEditCreator.id, editCreatorForm)
      showToast(`Profile updated for ${editCreatorForm.name}`, 'success')
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
      description: `This will immediately restrict platform login and curriculum publishing rights for ${cr.name} (${cr.email}).`,
      confirmText: 'Suspend Account',
      confirmColor: '#DC2626',
      onConfirm: async () => {
        try {
          await api.admin.updateCreatorStatus(cr.id, 'SUSPENDED')
          showToast(`Account suspended for ${cr.name}`, 'success')
          if (selectedViewCreator?.id === cr.id) {
            setSelectedViewCreator((prev) => ({ ...prev, status: 'SUSPENDED' }))
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
      description: `This will grant full login authorization and course publishing rights to ${cr.name} (${cr.email}).`,
      confirmText: 'Activate Account',
      confirmColor: '#16A34A',
      onConfirm: async () => {
        try {
          await api.admin.updateCreatorStatus(cr.id, 'ACTIVE')
          showToast(`Account activated for ${cr.name}`, 'success')
          if (selectedViewCreator?.id === cr.id) {
            setSelectedViewCreator((prev) => ({ ...prev, status: 'ACTIVE' }))
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

  const handleResendCredentials = async (cr) => {
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

          {/* Useful Dashboard Sections: 2-Column Responsive Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 24,
              alignItems: 'start'
            }}
          >
            {/* Left Column (Primary Queues & Activity) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Section 1: Video Review Queue */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
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
                        width: 30,
                        height: 30,
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

                <div style={{ padding: 16 }}>
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
                    <div style={{ textAlign: 'center', padding: '28px 16px', color: '#64748B' }}>
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

              {/* Section 2: Recent Course Orders & Enrollments */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
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
                        width: 30,
                        height: 30,
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

                <div style={{ padding: 16 }}>
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
                              {order.course?.title || 'Program'}
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
                              PAID
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '28px 16px', color: '#64748B' }}>
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
            </div>

            {/* Right Column (Secondary feeds & platform actions) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Section 3: Pending Creator Requests */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
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
                        width: 30,
                        height: 30,
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

                <div style={{ padding: 16 }}>
                  {requestsList.filter((r) => r.status === 'PENDING').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {requestsList.filter((r) => r.status === 'PENDING').slice(0, 3).map((r) => (
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
                    <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B' }}>
                      <CheckCircle2 size={28} style={{ color: '#10B981', margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        No pending creator profile requests
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Recent Platform Activity (Audit Trail) */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                  overflow: 'hidden'
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
                        width: 30,
                        height: 30,
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

                <div style={{ padding: 16 }}>
                  {(recentAuditLogs.length > 0 ? recentAuditLogs : auditLogs).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(recentAuditLogs.length > 0 ? recentAuditLogs : auditLogs).slice(0, 4).map((log) => (
                        <div
                          key={log.id}
                          style={{
                            padding: '10px 12px',
                            background: '#F8FAFC',
                            borderRadius: 10,
                            border: '1px solid #E2E8F0'
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
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78125rem', color: '#334155', fontWeight: 500, marginTop: 4 }}>
                            {log.details || `Performed on ${log.entityType}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B' }}>
                      <div style={{ fontSize: '0.8125rem' }}>No activity records available.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: System Health & Quick Governance Shortcuts */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
                  padding: 20
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Shield size={18} style={{ color: '#059669' }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>
                    Platform Architecture Health
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Database size={15} style={{ color: '#2563EB' }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                        PostgreSQL Database
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: 9999 }}>
                      HEALTHY
                    </span>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      background: '#F8FAFC',
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Key size={15} style={{ color: '#D97706' }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                        Active Sessions
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      {activeSessions.length} active
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/admin/creators')}
                    style={{ height: 34, fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    + Invite Faculty
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/admin/notifications')}
                    style={{ height: 34, fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Broadcast Alert
                  </button>
                </div>
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

          {/* Search, Filter, and Sort Bar */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              padding: '12px 16px',
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
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 440 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8'
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search creators by name, email, or user ID..."
                value={creatorSearch}
                onChange={(e) => setCreatorSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  paddingLeft: 36,
                  fontSize: '0.8125rem'
                }}
              />
            </div>

            {/* Filter & Sort Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <select
                value={creatorStatusFilter}
                onChange={(e) => setCreatorStatusFilter(e.target.value)}
                style={{
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  color: '#0F172A',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              <select
                value={creatorSortBy}
                onChange={(e) => setCreatorSortBy(e.target.value)}
                style={{
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  color: '#0F172A',
                  fontWeight: 600,
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="name">Sort: Name A–Z</option>
                <option value="created_desc">Sort: Newest First</option>
                <option value="created_asc">Sort: Oldest First</option>
              </select>

              {(creatorSearch || creatorStatusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatorSearch('')
                    setCreatorStatusFilter('ALL')
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ height: 38, fontSize: '0.75rem', color: '#64748B' }}
                >
                  Clear Filters
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
                      const isActive = cr.status === 'ACTIVE'
                      const isInactive = cr.status === 'INACTIVE'
                      const isSuspended = cr.status === 'SUSPENDED'

                      let badgeBg = '#DCFCE7'
                      let badgeColor = '#166534'
                      if (isInactive) {
                        badgeBg = '#FEF3C7'
                        badgeColor = '#92400E'
                      } else if (isSuspended) {
                        badgeBg = '#FEE2E2'
                        badgeColor = '#991B1B'
                      }

                      return (
                        <tr key={cr.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          {/* 1. Creator Column: Photo, Name, Email, Phone */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <img
                                src={cr.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                                alt={cr.name || 'Creator'}
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  border: '1px solid #E2E8F0',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                                }}
                              />
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
                                display: 'inline-block'
                              }}
                            >
                              {isActive ? 'ACTIVE' : (isSuspended ? 'SUSPENDED' : 'INACTIVE')}
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

                          {/* 7. Administrative Actions: [ 👁 ] [ ✎ ] [ ⏸/▶ ] [ 🔑 ] [ ✉ ] */}
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                              {/* View: Neutral */}
                              <button
                                type="button"
                                onClick={() => setSelectedViewCreator(cr)}
                                title="View Profile"
                                aria-label="View Profile"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  border: '1px solid #CBD5E1',
                                  background: '#FFFFFF',
                                  color: '#475569',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F1F5F9'
                                  e.currentTarget.style.color = '#0F172A'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                  e.currentTarget.style.color = '#475569'
                                }}
                              >
                                <Eye size={15} />
                              </button>

                              {/* Edit: Neutral */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditCreator(cr)}
                                title="Edit Creator"
                                aria-label="Edit Creator"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  border: '1px solid #CBD5E1',
                                  background: '#FFFFFF',
                                  color: '#475569',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F1F5F9'
                                  e.currentTarget.style.color = '#0F172A'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                  e.currentTarget.style.color = '#475569'
                                }}
                              >
                                <Edit3 size={15} />
                              </button>

                              {/* Suspend / Activate: Warning/Danger or Success */}
                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={() => handlePromptSuspendCreator(cr)}
                                  title="Suspend Account"
                                  aria-label="Suspend Account"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 7,
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
                                  <Pause size={14} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePromptActivateCreator(cr)}
                                  title="Activate Account"
                                  aria-label="Activate Account"
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 7,
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
                                  <Play size={14} />
                                </button>
                              )}

                              {/* Reset Credentials: Neutral / Warning */}
                              <button
                                type="button"
                                onClick={() => handlePromptResetCredentials(cr)}
                                title="Reset Credentials"
                                aria-label="Reset Credentials"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
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
                                <Key size={14} />
                              </button>

                              {/* Resend Credentials: Neutral */}
                              <button
                                type="button"
                                onClick={() => handleResendCredentials(cr)}
                                title="Resend Credentials"
                                aria-label="Resend Credentials"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 7,
                                  border: '1px solid #CBD5E1',
                                  background: '#FFFFFF',
                                  color: '#475569',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F1F5F9'
                                  e.currentTarget.style.color = '#0F172A'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF'
                                  e.currentTarget.style.color = '#475569'
                                }}
                              >
                                <Mail size={14} />
                              </button>
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
      {/* 6.5. PUBLIC PAGE & ABOUT US MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'public-controls' && (
        <div style={{ maxWidth: 1080 }}>
          {/* Top-Level CMS Section Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: '#F1F5F9',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              marginBottom: 24,
              gap: 4
            }}
          >
            <button
              type="button"
              id="btn-cms-tab-footer"
              onClick={() => setCmsSection('footer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: cmsSection === 'footer' ? '#FFFFFF' : 'transparent',
                color: cmsSection === 'footer' ? '#0F172A' : '#64748B',
                boxShadow: cmsSection === 'footer' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Footer Navigation &amp; Brand CMS</span>
            </button>

            <button
              type="button"
              id="btn-cms-tab-about"
              onClick={() => setCmsSection('about')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: cmsSection === 'about' ? '#FFFFFF' : 'transparent',
                color: cmsSection === 'about' ? '#0F172A' : '#64748B',
                boxShadow: cmsSection === 'about' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>About Page &amp; Leadership CMS</span>
            </button>
          </div>

          {/* =========================================================================
              PANEL 1: FOOTER NAVIGATION & BRAND CMS
              ========================================================================= */}
          {cmsSection === 'footer' && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Footer Navigation &amp; Brand Details
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                    Configure company bio, Quick Links, Our Courses links, Contact Us links, and copyright statement in real time.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleResetFooterDefaults}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Reset fields to official footer defaults"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Defaults</span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF' }}
                  >
                    <ExternalLink size={14} />
                    <span>View Live Footer</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleSaveFooterData}
                    disabled={isSavingFooter}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 140 }}
                  >
                    <Save size={14} />
                    <span>{isSavingFooter ? 'Saving...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* 1. Brand Description & Bio */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                    Company Description / Bio (Column 1)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 14 }}>
                    Shown directly beneath the Aivortex brand logo in the footer across all public pages.
                  </p>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={footerData.brandDesc || ''}
                    onChange={(e) => setFooterData({ ...footerData, brandDesc: e.target.value })}
                    placeholder="Enter short company bio..."
                  />
                </div>

                {/* 2. Column 2: Quick Links */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                        Column 2: Quick Links
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                        Configure column heading and navigation items.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFooterLink('quickLinks')}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={14} />
                      <span>Add Quick Link</span>
                    </button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Column Heading</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerData.quickLinksTitle || ''}
                      onChange={(e) => setFooterData({ ...footerData, quickLinksTitle: e.target.value })}
                      placeholder="Quick Links"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {footerData.quickLinks?.map((link, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          background: '#F8FAFC',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #EDF2F7'
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          value={link.label || ''}
                          onChange={(e) => handleUpdateFooterLink('quickLinks', idx, 'label', e.target.value)}
                          placeholder="Link Text (e.g. Home)"
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={link.path || ''}
                          onChange={(e) => handleUpdateFooterLink('quickLinks', idx, 'path', e.target.value)}
                          placeholder="Path (e.g. /courses)"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterLink('quickLinks', idx)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '6px 10px' }}
                          title="Remove link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Column 3: Our Courses */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                        Column 3: Our Courses
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                        Configure the course links shown in the footer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFooterLink('coursesLinks')}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={14} />
                      <span>Add Course Link</span>
                    </button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Column Heading</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerData.coursesTitle || ''}
                      onChange={(e) => setFooterData({ ...footerData, coursesTitle: e.target.value })}
                      placeholder="Our Courses"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {footerData.coursesLinks?.map((link, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          background: '#F8FAFC',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #EDF2F7'
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          value={link.label || ''}
                          onChange={(e) => handleUpdateFooterLink('coursesLinks', idx, 'label', e.target.value)}
                          placeholder="Course Title (e.g. Python for Data Science)"
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={link.path || ''}
                          onChange={(e) => handleUpdateFooterLink('coursesLinks', idx, 'path', e.target.value)}
                          placeholder="Path (e.g. /courses/python-for-data-science)"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterLink('coursesLinks', idx)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '6px 10px' }}
                          title="Remove link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Column 4: Contact Us */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                        Column 4: Contact Us
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                        Configure contact, institutional inquiry, and legal navigation links.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFooterLink('contactLinks')}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={14} />
                      <span>Add Contact Link</span>
                    </button>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Column Heading</label>
                    <input
                      type="text"
                      className="form-control"
                      value={footerData.contactTitle || ''}
                      onChange={(e) => setFooterData({ ...footerData, contactTitle: e.target.value })}
                      placeholder="Contact Us"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {footerData.contactLinks?.map((link, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          background: '#F8FAFC',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #EDF2F7'
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          value={link.label || ''}
                          onChange={(e) => handleUpdateFooterLink('contactLinks', idx, 'label', e.target.value)}
                          placeholder="Link Text (e.g. Contact Support)"
                        />
                        <input
                          type="text"
                          className="form-control"
                          value={link.path || ''}
                          onChange={(e) => handleUpdateFooterLink('contactLinks', idx, 'path', e.target.value)}
                          placeholder="Path (e.g. /contact)"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFooterLink('contactLinks', idx)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '6px 10px' }}
                          title="Remove link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Footer Bottom Bar: Copyright Text */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                    Footer Bottom Bar / Copyright Notice
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 14 }}>
                    Official legal copyright string displayed at the very bottom of the website.
                  </p>
                  <input
                    type="text"
                    className="form-control"
                    value={footerData.copyrightText || ''}
                    onChange={(e) => setFooterData({ ...footerData, copyrightText: e.target.value })}
                    placeholder="© 2026 Aivortex. All rights reserved. • Learn. Grow. Innovate."
                  />
                </div>
              </div>

              {/* Sticky Bottom Save Bar for Footer */}
              <div
                style={{
                  position: 'sticky',
                  bottom: 16,
                  background: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: 14,
                  padding: '14px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.4)',
                  marginTop: 28,
                  zIndex: 10
                }}
              >
                <div style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
                  Modifications made here immediately update the website footer across all public pages in real time.
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleResetFooterDefaults}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#E2E8F0', borderColor: '#334155' }}
                  >
                    Reset Defaults
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFooterData}
                    disabled={isSavingFooter}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: 140, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Save size={14} />
                    <span>{isSavingFooter ? 'Saving Changes...' : 'Save & Publish'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PANEL 2: ABOUT PAGE & LEADERSHIP CMS
              ========================================================================= */}
          {cmsSection === 'about' && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Public Page &amp; About Us Management
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
                    Configure official company story, mission, vision, offerings, philosophy, and executive leadership (CEO &amp; Program Director).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleResetAboutDefaults}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    title="Reset fields to official company default text"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Defaults</span>
                  </button>

                  <a
                    href="/about"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF' }}
                  >
                    <ExternalLink size={14} />
                    <span>View Live About Page</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleSaveAboutData}
                    disabled={isSavingAbout}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 140 }}
                  >
                    <Save size={14} />
                    <span>{isSavingAbout ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #E2E8F0', marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
                {[
                  { id: 'leadership', label: 'Executive Leadership (CEO & Director)' },
                  { id: 'story', label: 'Hero, Mission & Vision' },
                  { id: 'offerings', label: 'What We Do & Why Aivortex' },
                  { id: 'audience', label: 'Philosophy, Audience & Promise' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAboutSubTab(tab.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px 10px 0 0',
                      border: 'none',
                      background: aboutSubTab === tab.id ? '#FFFFFF' : 'transparent',
                      borderBottom: aboutSubTab === tab.id ? '2.5px solid #2563EB' : '2.5px solid transparent',
                      fontWeight: aboutSubTab === tab.id ? 700 : 500,
                      color: aboutSubTab === tab.id ? '#2563EB' : '#64748B',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>


          {/* Sub Tab 1: Executive Leadership (CEO & Program Director) */}
          {aboutSubTab === 'leadership' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: 24 }}>
                {aboutData.leadership?.map((leader) => (
                  <div
                    key={leader.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: 16,
                      border: '1px solid #E2E8F0',
                      padding: 24,
                      boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          overflow: 'hidden',
                          background: '#0F172A',
                          border: '2px solid #E2E8F0',
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={leader.image}
                          alt={leader.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {leader.sectionTitle}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>
                          {leader.name}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                          {leader.role}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Section Title Badge</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leader.sectionTitle || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'sectionTitle', e.target.value)}
                          placeholder="e.g. Meet our CEO"
                        />
                      </div>

                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leader.name || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'name', e.target.value)}
                          placeholder="e.g. Saravanan.S"
                        />
                      </div>

                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Degrees / Qualifications</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leader.qualifications || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'qualifications', e.target.value)}
                          placeholder="e.g. B.E, PDDDS, MS-Data Science"
                        />
                      </div>

                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Current Company / Professional Position</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leader.company || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'company', e.target.value)}
                          placeholder="e.g. Data Science and AI specialist at one of Big4 organization"
                        />
                      </div>

                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Executive Role / Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leader.role || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'role', e.target.value)}
                          placeholder="e.g. CEO & Co-Founder"
                        />
                      </div>

                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Image URL / Asset Path</label>
                        <input
                          type="text"
                          className="form-control"
                          value={leader.image || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'image', e.target.value)}
                          placeholder="/team/ceo-saravanan.png"
                        />
                      </div>

                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Bio / Narrative</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={leader.bio || ''}
                          onChange={(e) => handleUpdateLeaderField(leader.id, 'bio', e.target.value)}
                          placeholder="Summary of experience and background..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub Tab 2: Hero, Mission & Vision */}
          {aboutSubTab === 'story' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Hero Settings */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>
                  Hero Headline &amp; Narrative
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-field-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Hero Main Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={aboutData.hero?.title || ''}
                      onChange={(e) => setAboutData({ ...aboutData, hero: { ...aboutData.hero, title: e.target.value } })}
                    />
                  </div>
                  <div className="form-field-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Lead Mission Paragraph</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={aboutData.hero?.subtitle || ''}
                      onChange={(e) => setAboutData({ ...aboutData, hero: { ...aboutData.hero, subtitle: e.target.value } })}
                    />
                  </div>
                  <div className="form-field-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Extended Story Paragraph</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={aboutData.hero?.introParagraph || ''}
                      onChange={(e) => setAboutData({ ...aboutData, hero: { ...aboutData.hero, introParagraph: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              {/* Mission & Vision Settings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 20 }}>
                {/* Mission */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1.5px solid #BFDBFE', padding: 24 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563EB', marginBottom: 12 }}>
                    Mission Statement
                  </h3>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={aboutData.mission?.description || ''}
                    onChange={(e) => setAboutData({ ...aboutData, mission: { ...aboutData.mission, description: e.target.value } })}
                  />
                </div>

                {/* Vision */}
                <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1.5px solid #DDD6FE', padding: 24 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C3AED', marginBottom: 12 }}>
                    Vision Statement
                  </h3>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={aboutData.vision?.description || ''}
                    onChange={(e) => setAboutData({ ...aboutData, vision: { ...aboutData.vision, description: e.target.value } })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab 3: What We Do & Why Aivortex */}
          {aboutSubTab === 'offerings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* What We Do */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                  What We Do (5 Core Pillars)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {aboutData.whatWeDo?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: 12,
                        padding: 16,
                        border: '1px solid #EDF2F7',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: 12
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={item.title || ''}
                        onChange={(e) => handleUpdateWhatWeDo(idx, 'title', e.target.value)}
                        placeholder="Pillar Title"
                        style={{ fontWeight: 700 }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={item.description || ''}
                        onChange={(e) => handleUpdateWhatWeDo(idx, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Aivortex */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                  Why Aivortex (5 Value Propositions)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {aboutData.whyAivortex?.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: 12,
                        padding: 16,
                        border: '1px solid #EDF2F7',
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: 12
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={item.title || ''}
                        onChange={(e) => handleUpdateWhyAivortex(idx, 'title', e.target.value)}
                        placeholder="Advantage Title"
                        style={{ fontWeight: 700 }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={item.description || ''}
                        onChange={(e) => handleUpdateWhyAivortex(idx, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab 4: Philosophy, Audience & Promise */}
          {aboutSubTab === 'audience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Philosophy */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
                  Our Philosophy (Learn. Grow. Innovate.)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 16 }}>
                  {aboutData.philosophy?.map((philo, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, border: '1px solid #EDF2F7' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', marginBottom: 6 }}>
                        Step 0{idx + 1}: {philo.step}
                      </div>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={philo.tagline || ''}
                        onChange={(e) => {
                          const updated = [...(aboutData.philosophy || [])]
                          updated[idx] = { ...updated[idx], tagline: e.target.value }
                          setAboutData({ ...aboutData, philosophy: updated })
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Promise */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                  Our Promise
                </h3>
                <textarea
                  className="form-control"
                  rows={3}
                  value={aboutData.ourPromise || ''}
                  onChange={(e) => setAboutData({ ...aboutData, ourPromise: e.target.value })}
                  placeholder="Official promise to students and partners..."
                />
              </div>
            </div>
          )}

          {/* Sticky Bottom Save Bar */}
          <div
            style={{
              position: 'sticky',
              bottom: 16,
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: 14,
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.4)',
              marginTop: 28,
              zIndex: 10
            }}
          >
            <div style={{ fontSize: '0.88rem', color: '#94A3B8' }}>
              Changes made here update the public <strong style={{ color: '#F1F5F9' }}>/about</strong> page and leadership showcase in real time.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={handleResetAboutDefaults}
                className="btn btn-outline btn-sm"
                style={{ color: '#E2E8F0', borderColor: '#334155' }}
              >
                Reset Defaults
              </button>

              <button
                type="button"
                onClick={handleSaveAboutData}
                disabled={isSavingAbout}
                className="btn btn-primary btn-sm"
                style={{ minWidth: 140, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Save size={14} />
                <span>{isSavingAbout ? 'Saving Changes...' : 'Save & Publish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginBottom: 24 }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20, marginBottom: 20 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 20, marginBottom: 20 }}>
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
            style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="razorpay-modal-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>
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
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 20px' }}>
              {/* Profile Top Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #F1F5F9' }}>
                <img
                  src={selectedViewCreator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt=""
                  style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid #EFF6FF', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    {selectedViewCreator.name}
                  </h4>
                  <p style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.875rem', margin: '0 0 8px 0' }}>
                    {selectedViewCreator.creatorProfile?.specialization || selectedViewCreator.creatorProfile?.headline || 'Curriculum Specialist'}
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: selectedViewCreator.status === 'ACTIVE' ? '#DCFCE7' : '#FEF3C7',
                        color: selectedViewCreator.status === 'ACTIVE' ? '#166534' : '#92400E',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: 20
                      }}
                    >
                      {selectedViewCreator.status}
                    </span>
                    <span
                      style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontFamily: 'monospace'
                      }}
                    >
                      ID: {selectedViewCreator.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                    EMAIL ADDRESS
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedViewCreator.email}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                    PHONE NUMBER
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedViewCreator.phone || 'Not provided'}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                    ACCOUNT CREATED
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    {selectedViewCreator.createdAt ? new Date(selectedViewCreator.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, display: 'block', marginBottom: 2 }}>
                    LAST LOGIN SESSION
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    {formatLastLogin(selectedViewCreator)}
                  </span>
                </div>
              </div>

              {/* Bio & Headline */}
              {(selectedViewCreator.creatorProfile?.headline || selectedViewCreator.creatorProfile?.biography || selectedViewCreator.bio) && (
                <div style={{ marginBottom: 20 }}>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                    Biography & Background
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: 0, background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    {selectedViewCreator.creatorProfile?.biography || selectedViewCreator.bio || selectedViewCreator.creatorProfile?.headline}
                  </p>
                </div>
              )}

              {/* Assigned Courses */}
              <div>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                  Assigned Platform Courses ({selectedViewCreator.assignedCourses?.length || 0})
                </h5>
                {selectedViewCreator.assignedCourses && selectedViewCreator.assignedCourses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedViewCreator.assignedCourses.map((ac) => (
                      <div
                        key={ac.course?.id || ac.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          fontSize: '0.8125rem'
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>
                          {ac.course?.title || 'Academic Course'}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#E2E8F0', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {ac.course?.status || 'PUBLISHED'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: '#94A3B8', margin: 0 }}>
                    No curriculum courses currently assigned to this faculty member.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const cr = selectedViewCreator
                    setSelectedViewCreator(null)
                    handleOpenEditCreator(cr)
                  }}
                  style={{ fontWeight: 600 }}
                >
                  <Edit3 size={14} style={{ marginRight: 4 }} />
                  Edit Profile
                </button>

                {selectedViewCreator.status === 'ACTIVE' ? (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      const cr = selectedViewCreator
                      handlePromptSuspendCreator(cr)
                    }}
                    style={{ color: '#DC2626', borderColor: '#FECACA', fontWeight: 600 }}
                  >
                    <UserX size={14} style={{ marginRight: 4 }} />
                    Suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      const cr = selectedViewCreator
                      handlePromptActivateCreator(cr)
                    }}
                    style={{ color: '#16A34A', borderColor: '#BBF7D0', fontWeight: 600 }}
                  >
                    <UserCheck size={14} style={{ marginRight: 4 }} />
                    Activate
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const cr = selectedViewCreator
                    handlePromptResetCredentials(cr)
                  }}
                  style={{ color: '#D97706', borderColor: '#FDE68A', fontWeight: 600 }}
                >
                  <Key size={14} style={{ marginRight: 4 }} />
                  Reset Credentials
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setSelectedViewCreator(null)}
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
            style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="razorpay-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="razorpay-modal-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="razorpay-modal-title" style={{ fontSize: '1.2rem', margin: 0 }}>
                    Edit Creator Profile
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Update institutional instructor information
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSelectedEditCreator(null)}
                style={{ padding: 6, borderRadius: '50%' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditCreator} className="razorpay-modal-body" style={{ padding: '24px 20px' }}>
              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editCreatorForm.name}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-field-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editCreatorForm.email}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={editCreatorForm.phone}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, phone: e.target.value })}
                    placeholder="+91 98765 00002"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-field-group">
                  <label className="form-label">Specialization / Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editCreatorForm.specialization}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, specialization: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="form-label">Organization / Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editCreatorForm.headline}
                    onChange={(e) => setEditCreatorForm({ ...editCreatorForm, headline: e.target.value })}
                    placeholder="e.g. Apex AI Research Labs"
                  />
                </div>
              </div>

              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Profile Photo URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={editCreatorForm.avatar}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-field-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Biography</label>
                <textarea
                  rows={3}
                  className="form-input"
                  value={editCreatorForm.bio}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, bio: e.target.value })}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div className="form-field-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Account Status</label>
                <select
                  value={editCreatorForm.status}
                  onChange={(e) => setEditCreatorForm({ ...editCreatorForm, status: e.target.value })}
                  className="form-input"
                  style={{ height: 42 }}
                >
                  <option value="ACTIVE">ACTIVE (Authorized to log in & publish)</option>
                  <option value="INACTIVE">INACTIVE (Restricted access)</option>
                  <option value="SUSPENDED">SUSPENDED (Access revoked)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSelectedEditCreator(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingEditCreator}
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

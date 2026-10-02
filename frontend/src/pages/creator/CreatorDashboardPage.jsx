import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  ListVideo,
  MessageSquare,
  Users,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileVideo,
  Check,
  ArrowLeft,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  UploadCloud,
  Send,
  Eye,
  FileText,
  Layers,
  FolderOpen,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  UserCheck,
  Sparkles,
  Filter,
  Search,
  X,
  ArrowRight,
  Info,
  EyeOff,
  Mail,
  Lock,
  Key,
  Shield,
  User,
  GraduationCap,
  BarChart2,
  SlidersHorizontal,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  CreditCard,
  Paperclip,
  Smile
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'
import VideoModal from '../../components/modals/VideoModal'

const INITIAL_CREATOR_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'AIVORTEX Admin',
    senderInitial: 'A',
    avatarBg: '#2563EB',
    dateDisplay: 'Jul 29',
    timestamp: 'Jul 29, 2024, 10:24 AM',
    subject: 'Lecture Approved',
    badge: 'Approval',
    badgeType: 'success',
    badgeColor: '#16A34A',
    badgeBg: '#DCFCE7',
    category: 'admin',
    preview: 'Great news! Your lecture "3.2 Model Evaluation" has been approved.',
    body: `Hi Karthick,\n\nGreat news! Your lecture "3.2 Model Evaluation" in KAR-101: Data Science has been approved and is now live on the platform.\n\nYour content helps learners build real-world skills, and we appreciate your contribution to AIVORTEX.\n\nKeep up the great work!\n\nBest,\nThe AIVORTEX Team`,
    courseCard: {
      code: 'KAR-101: Data Science',
      lecture: 'Lecture 3.2: Model Evaluation',
      status: 'Approved'
    },
    history: [
      {
        sender: 'You',
        timestamp: 'Jul 28, 2024, 4:12 PM',
        text: 'Thank you! Let me know if any further changes are needed.'
      },
      {
        sender: 'AIVORTEX Admin',
        timestamp: 'Jul 28, 2024, 11:03 AM',
        text: "We've reviewed your updated lecture. It looks great and is now approved."
      }
    ]
  },
  {
    id: 'msg-2',
    sender: 'Review Team',
    senderInitial: 'R',
    avatarBg: '#8B5CF6',
    dateDisplay: 'Jul 28',
    timestamp: 'Jul 28, 2024, 2:15 PM',
    subject: 'Changes Requested',
    badge: 'Review Feedback',
    badgeType: 'warning',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    category: 'review',
    preview: 'We have reviewed your lecture "2.4 Data Preprocessing" and have some...',
    body: `Hi Karthick,\n\nWe have reviewed your lecture "2.4 Data Preprocessing" in KAR-101: Data Science.\n\nFeedback notes:\n1. The audio level softens between 04:15 and 05:30.\n2. Please ensure the code snippet on slide 6 matches the GitHub repository example.\n\nOnce corrected, please submit for final verification.\n\nBest,\nThe Review Team`,
    courseCard: {
      code: 'KAR-101: Data Science',
      lecture: 'Lecture 2.4: Data Preprocessing',
      status: 'Changes Requested'
    },
    history: []
  },
  {
    id: 'msg-3',
    sender: 'AIVORTEX Admin',
    senderInitial: 'A',
    avatarBg: '#2563EB',
    dateDisplay: 'Jul 25',
    timestamp: 'Jul 25, 2024, 9:30 AM',
    subject: 'New Course Assignment',
    badge: 'Course Update',
    badgeType: 'info',
    badgeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    category: 'admin',
    preview: "You've been assigned to a new course: GEN-201: Machine Learning.",
    body: `Hello Karthick,\n\nYou have been assigned to develop content for a new course: GEN-201: Machine Learning.\n\nThe course blueprint and syllabus outline have been configured in your Course Workspace. Please review the curriculum sections and begin drafting initial lectures.\n\nBest,\nThe AIVORTEX Team`,
    courseCard: {
      code: 'GEN-201: Machine Learning',
      lecture: 'Module 1: Introduction to ML',
      status: 'Assigned'
    },
    history: []
  },
  {
    id: 'msg-4',
    sender: 'Support',
    senderInitial: 'S',
    avatarBg: '#6366F1',
    dateDisplay: 'Jul 24',
    timestamp: 'Jul 24, 2024, 11:20 AM',
    subject: 'Account Verification',
    badge: 'Support',
    badgeType: 'purple',
    badgeColor: '#7C3AED',
    badgeBg: '#F3E8FF',
    category: 'support',
    preview: 'Your creator profile has been verified successfully. You now have access to...',
    body: `Hi Karthick,\n\nYour creator profile and credentials have been verified successfully. You now have full access to published analytics, curriculum management, and payouts.\n\nFeel free to contact support if you need any assistance.\n\nBest regards,\nAIVORTEX Support Team`,
    history: []
  },
  {
    id: 'msg-5',
    sender: 'AIVORTEX Admin',
    senderInitial: 'A',
    avatarBg: '#2563EB',
    dateDisplay: 'Jul 22',
    timestamp: 'Jul 22, 2024, 4:00 PM',
    subject: 'Payout Processed',
    badge: 'Earnings',
    badgeType: 'info',
    badgeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    category: 'admin',
    preview: 'Your payout of $840 has been processed and sent to your bank account.',
    body: `Hello Karthick,\n\nYour monthly payout of $840.00 has been processed and sent to your bank account (Bank Transfer ending in **** 4582).\n\nReference ID: PRT789456.\n\nThank you for creating exceptional learning content!\n\nBest,\nAIVORTEX Admin & Finance`,
    history: []
  },
  {
    id: 'msg-6',
    sender: 'Review Team',
    senderInitial: 'R',
    avatarBg: '#8B5CF6',
    dateDisplay: 'Jul 20',
    timestamp: 'Jul 20, 2024, 3:45 PM',
    subject: 'Lecture Under Review',
    badge: 'Review Feedback',
    badgeType: 'warning',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    category: 'review',
    preview: 'Your lecture "4.1 Neural Networks Introduction" is now under review.',
    body: `Hi Karthick,\n\nYour lecture "4.1 Neural Networks Introduction" in AI-301: Deep Learning is currently under QA review. We will notify you as soon as our instructional review is complete.\n\nBest,\nThe Review Team`,
    courseCard: {
      code: 'AI-301: Deep Learning',
      lecture: 'Lecture 4.1: Neural Networks Introduction',
      status: 'Pending Review'
    },
    history: []
  },
  {
    id: 'msg-7',
    sender: 'Support',
    senderInitial: 'S',
    avatarBg: '#6366F1',
    dateDisplay: 'Jul 18',
    timestamp: 'Jul 18, 2024, 10:15 AM',
    subject: 'Help with Video Upload',
    badge: 'Support',
    badgeType: 'purple',
    badgeColor: '#7C3AED',
    badgeBg: '#F3E8FF',
    category: 'support',
    preview: 'Here are the steps to resolve the upload issue you reported...',
    body: `Hi Karthick,\n\nHere are the steps to resolve the upload issue you reported. Our local stream processing is active and allows direct video chunk streaming with automatic recovery.\n\nIf you experience any issues, please do not hesitate to reach out.\n\nAIVORTEX Support`,
    history: []
  },
  {
    id: 'msg-8',
    sender: 'AIVORTEX Admin',
    senderInitial: 'A',
    avatarBg: '#2563EB',
    dateDisplay: 'Jul 15',
    timestamp: 'Jul 15, 2024, 9:00 AM',
    subject: 'Welcome to AIVORTEX!',
    badge: 'Course Update',
    badgeType: 'info',
    badgeColor: '#2563EB',
    badgeBg: '#DBEAFE',
    category: 'review',
    preview: "We're excited to have you on board as a creator. Here are some resources...",
    body: `Hi Karthick,\n\nWe're excited to have you on board as an instructor and course creator at AIVORTEX!\n\nHere are a few quick tips to help you get started:\n- Review our Creator Quality Guidelines\n- Plan your syllabus with short, engaging 10-15 minute lectures\n- Responding promptly to review feedback ensures faster publishing.\n\nBest,\nThe AIVORTEX Team`,
    history: []
  }
]

export default function CreatorDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { creator, user } = useAuth()
  const { showToast } = useToast()

  const currentCreator = creator || user

  // Determine current active view based on URL route
  const getActiveView = () => {
    const path = location.pathname.toLowerCase()
    if (params.courseId || path.includes('/creator/courses/')) return 'workspace'
    if (path.includes('/creator/courses')) return 'courses'
    if (path.includes('/creator/analytics')) return 'analytics'
    if (path.includes('/creator/earnings')) return 'earnings'
    if (path.includes('/creator/messages')) return 'messages'
    if (path.includes('/creator/library') || path.includes('/creator/content')) return 'library'
    if (path.includes('/creator/feedback') || path.includes('/creator/review')) return 'feedback'
    if (path.includes('/creator/profile') || path.includes('/creator/settings')) return 'profile'
    return 'dashboard'
  }

  const [activeView, setActiveView] = useState(getActiveView)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Primary data states
  const [assignedCourses, setAssignedCourses] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [creatorProfile, setCreatorProfile] = useState(null)

  // Active course workspace state
  const [activeCourseId, setActiveCourseId] = useState(params.courseId || null)
  const [workspaceTab, setWorkspaceTab] = useState('overview') // 'overview' | 'curriculum' | 'lectures' | 'review-status'

  // Modals & form dialog states
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionDesc, setSectionDesc] = useState('')
  const [isSubmittingSection, setIsSubmittingSection] = useState(false)

  const [renameSectionModal, setRenameSectionModal] = useState({ isOpen: false, section: null, title: '', desc: '' })
  const [deleteSectionModal, setDeleteSectionModal] = useState({ isOpen: false, section: null })

  // Scoped Lecture Creator / Editor state
  const [lectureModal, setLectureModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    lectureId: null,
    courseId: '',
    playlistId: '',
    title: '',
    description: '',
    duration: '15:00',
    orderIndex: 1,
    videoUrl: '',
    s3Key: null,
    thumbnail: '',
    resources: '',
    notes: '',
    status: 'DRAFT',
    selectedFile: null,
    uploadProgress: 0,
    isUploading: false,
    isSaving: false
  })

  // Video Preview Modal state
  const [previewVideo, setPreviewVideo] = useState({
    isOpen: false,
    videoUrl: '',
    title: '',
    course: ''
  })

  // Delete lecture confirmation
  const [deleteLessonModal, setDeleteLessonModal] = useState({ isOpen: false, lesson: null })

  // My Courses search, filter & sort state
  const [courseSearch, setCourseSearch] = useState('')
  const [courseFilterStatus, setCourseFilterStatus] = useState('ALL') // 'ALL' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'CHANGES_REQUESTED'
  const [courseSort, setCourseSort] = useState('recently_assigned') // 'recently_assigned' | 'recently_updated' | 'name' | 'progress'

  // Content Library filter state
  const [libraryFilterCourse, setLibraryFilterCourse] = useState('ALL')
  const [libraryFilterStatus, setLibraryFilterStatus] = useState('ALL')
  const [librarySearch, setLibrarySearch] = useState('')

  // Review & Feedback filter state
  const [reviewFilterStatus, setReviewFilterStatus] = useState('ALL') // 'ALL' | 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED'

  // Profile Change Request form state
  const [activeReqCategory, setActiveReqCategory] = useState('EMAIL_CHANGE')
  const [reqEmail, setReqEmail] = useState('')
  const [reqEmailReason, setReqEmailReason] = useState('')
  const [reqPasswordReason, setReqPasswordReason] = useState('')
  const [reqPhotoUrl, setReqPhotoUrl] = useState('')
  const [reqPhotoReason, setReqPhotoReason] = useState('')
  const [reqName, setReqName] = useState('')
  const [reqNameReason, setReqNameReason] = useState('')
  const [reqSpec, setReqSpec] = useState('')
  const [reqSpecReason, setReqSpecReason] = useState('')
  const [profileHeadline, setProfileHeadline] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profileSupportingUrl, setProfileSupportingUrl] = useState('')
  const [profileJustification, setProfileJustification] = useState('')
  const [isSubmittingProfileReq, setIsSubmittingProfileReq] = useState(false)

  // Verify Email Modal State
  const [verifyEmailModalOpen, setVerifyEmailModalOpen] = useState(false)
  const [activeEmailReq, setActiveEmailReq] = useState(null)
  const [emailOtpInput, setEmailOtpInput] = useState('')
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)

  // Set New Password Modal State
  const [setPasswordModalOpen, setSetPasswordModalOpen] = useState(false)
  const [activePasswordReq, setActivePasswordReq] = useState(null)
  const [currPasswordInput, setCurrPasswordInput] = useState('')
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [showCurrPass, setShowCurrPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfPass, setShowConfPass] = useState(false)
  const [isSettingPassword, setIsSettingPassword] = useState(false)

  // Process UI: Analytics state
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('Last 30 days')
  const [analyticsTimeframeOpen, setAnalyticsTimeframeOpen] = useState(false)
  const [contentProgressTimeframe, setContentProgressTimeframe] = useState('Last 30 days')
  const [contentProgressTimeframeOpen, setContentProgressTimeframeOpen] = useState(false)

  // Process UI: Earnings state
  const [earningsTimeframe, setEarningsTimeframe] = useState('Last 6 months')
  const [earningsTimeframeOpen, setEarningsTimeframeOpen] = useState(false)
  const [revenueCourseTimeframe, setRevenueCourseTimeframe] = useState('Last 6 months')
  const [revenueCourseTimeframeOpen, setRevenueCourseTimeframeOpen] = useState(false)
  const [topCoursesTimeframe, setTopCoursesTimeframe] = useState('Last 6 months')
  const [topCoursesTimeframeOpen, setTopCoursesTimeframeOpen] = useState(false)

  // Process UI: Messages state
  const [messageTab, setMessageTab] = useState('all') // 'all' | 'admin' | 'review' | 'support'
  const [messageSearch, setMessageSearch] = useState('')
  const [messageSort, setMessageSort] = useState('newest') // 'newest' | 'oldest'
  const [selectedMessageId, setSelectedMessageId] = useState('msg-1')
  const [replyText, setReplyText] = useState('')
  const [messagesList, setMessagesList] = useState(INITIAL_CREATOR_MESSAGES)
  const [showThreadHistory, setShowThreadHistory] = useState(true)
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [newMessageRecipient, setNewMessageRecipient] = useState('AIVORTEX Admin')
  const [newMessageCategory, setNewMessageCategory] = useState('Course Update')
  const [newMessageSubject, setNewMessageSubject] = useState('')
  const [newMessageBody, setNewMessageBody] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  // Sync active view when URL changes
  useEffect(() => {
    const view = getActiveView()
    setActiveView(view)
    if (params.courseId) {
      setActiveCourseId(params.courseId)
    }
  }, [location.pathname, params.courseId])

  // Fetch all Creator data from backend
  const loadAllData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      else setRefreshing(true)

      const [coursesRes, subsRes, profileRes] = await Promise.allSettled([
        api.creator.getCourses(),
        api.creator.getSubmissions(),
        api.creator.getProfile()
      ])

      if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value?.data?.courses)) {
        setAssignedCourses(coursesRes.value.data.courses)
      } else {
        setAssignedCourses([])
      }

      if (subsRes.status === 'fulfilled' && subsRes.value?.data?.submissions) {
        setSubmissions(subsRes.value.data.submissions)
      } else {
        setSubmissions([])
      }

      if (profileRes.status === 'fulfilled' && profileRes.value?.data?.profile) {
        setCreatorProfile(profileRes.value.data.profile)
      }
    } catch (err) {
      console.warn('Creator data loading issue:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // Currently active course in workspace
  const activeCourse = useMemo(() => {
    if (!activeCourseId) return assignedCourses[0] || null
    return assignedCourses.find((c) => c.id === activeCourseId) || assignedCourses[0] || null
  }, [assignedCourses, activeCourseId])

  // Derive course code helper (e.g. KAR-101, WEB-201, CLD-301)
  const getCourseCode = (course) => {
    if (!course) return 'CRS-101'
    if (course.courseCode) return course.courseCode
    if (course.code) return course.code

    if (course.slug) {
      const cleanSlug = course.slug.toLowerCase().trim()
      const match = cleanSlug.match(/^([a-z]{2,5})[-_]?(\d{3,4})$/)
      if (match) {
        return `${match[1].toUpperCase()}-${match[2]}`
      }
      const parts = cleanSlug.split(/[-_]+/).filter(Boolean)
      if (parts.length >= 2) {
        const numPart = parts.find((p) => /^\d+$/.test(p))
        if (numPart) {
          return `${parts[0].slice(0, 3).toUpperCase()}-${numPart}`
        }
        return `${parts[0].slice(0, 3).toUpperCase()}-101`
      }
      return `${cleanSlug.slice(0, 3).toUpperCase()}-101`
    }
    const idPrefix = course.id ? course.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() : 'CRS'
    return `${idPrefix || 'CRS'}-101`
  }

  // Format section display helper to prevent duplication (e.g. [Section 1] section1)
  const formatSectionDisplay = (section, index) => {
    const num = String(index + 1).padStart(2, '0')
    const rawTitle = section?.title || ''
    const cleanTitle = rawTitle
      .replace(/^section\s*\d*\s*[:\-–—]?\s*/i, '')
      .replace(/^section\d+\s*[:\-–—]?\s*/i, '')
      .trim()
    const displayTitle = cleanTitle || rawTitle || `Module ${index + 1}`
    return { num, displayTitle, sectionNumber: index + 1 }
  }

  // Calculate course completion progress & status
  const getCourseMetrics = (course) => {
    if (!course) return { progress: 0, status: 'Not Started', sectionsCount: 0, lessonsCount: 0, pendingCount: 0, changesCount: 0, approvedCount: 0, draftCount: 0, incompleteCount: 0 }

    const sections = course.playlists || []
    const sectionsCount = sections.length

    // Aggregate all unique lectures for this course
    const lessonMap = new Map()
    sections.forEach((s) => {
      (s.lessons || []).forEach((l) => lessonMap.set(l.id, l))
    })
    if (course.lessons && Array.isArray(course.lessons)) {
      course.lessons.forEach((l) => lessonMap.set(l.id, l))
    }
    const sectionIds = new Set(sections.map((s) => s.id))
    submissions.forEach((s) => {
      if (s.courseId === course.id || (s.playlistId && sectionIds.has(s.playlistId)) || (s.playlist?.courseId === course.id)) {
        const existing = lessonMap.get(s.id) || {}
        lessonMap.set(s.id, { ...s, ...existing })
      }
    })

    const lessons = Array.from(lessonMap.values())
    const lessonsCount = lessons.length

    let pendingCount = 0
    let changesCount = 0
    let approvedCount = 0
    let draftCount = 0
    let incompleteCount = 0

    lessons.forEach((l) => {
      const hasVideo = Boolean((l.videoUrl && l.videoUrl.trim()) || l.s3Key)
      if (l.status === 'APPROVED' || l.status === 'PUBLISHED') {
        approvedCount++
      } else if (l.status === 'SUBMITTED_FOR_REVIEW') {
        pendingCount++
      } else if (l.status === 'RETURNED_FOR_EDIT' || l.status === 'REJECTED') {
        changesCount++
      } else if (l.status === 'INCOMPLETE' || !hasVideo) {
        incompleteCount++
      } else {
        draftCount++
      }
    })

    const progress = lessonsCount > 0 ? Math.round((approvedCount / lessonsCount) * 100) : 0

    let status = 'Not Started'
    if (lessonsCount === 0 && sectionsCount === 0) {
      status = 'Not Started'
    } else if (lessonsCount > 0 && approvedCount === lessonsCount) {
      status = 'Completed'
    } else if (changesCount > 0) {
      status = 'Changes Requested'
    } else if (pendingCount > 0 && pendingCount === lessonsCount) {
      status = 'Under Review'
    } else if (pendingCount > 0 && draftCount === 0 && incompleteCount === 0) {
      status = 'Under Review'
    } else if (pendingCount > 0 && (draftCount > 0 || incompleteCount > 0)) {
      status = 'In Progress'
    } else {
      status = 'In Progress'
    }

    return {
      progress,
      status,
      sectionsCount,
      lessonsCount,
      pendingCount,
      changesCount,
      approvedCount,
      draftCount,
      incompleteCount
    }
  }

  // Calculate global Creator KPIs across all courses & submissions
  const globalKPIs = useMemo(() => {
    const totalAssigned = assignedCourses.length

    // Aggregate all lessons across assigned courses
    const allCourseLessons = assignedCourses.flatMap((c) => c.playlists?.flatMap((p) => p.lessons || []) || [])

    // Also include lessons from submissions that might not yet be in assignedCourses tree
    const lessonMap = new Map()
    allCourseLessons.forEach((l) => lessonMap.set(l.id, l))
    submissions.forEach((s) => {
      if (!lessonMap.has(s.id)) lessonMap.set(s.id, s)
    })

    const allLessons = Array.from(lessonMap.values())

    let draftCount = 0
    let pendingCount = 0
    let changesCount = 0
    let approvedCount = 0

    allLessons.forEach((l) => {
      if (l.status === 'DRAFT' || l.status === 'UPLOADED' || l.status === 'INCOMPLETE') draftCount++
      else if (l.status === 'SUBMITTED_FOR_REVIEW') pendingCount++
      else if (l.status === 'RETURNED_FOR_EDIT' || l.status === 'REJECTED') changesCount++
      else if (l.status === 'APPROVED' || l.status === 'PUBLISHED') approvedCount++
    })

    return {
      totalAssigned,
      draftCount,
      pendingCount,
      changesCount,
      approvedCount,
      allLessons
    }
  }, [assignedCourses, submissions])

  // Format Status Badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
      case 'Completed':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            <CheckCircle2 size={12} /> {status === 'Completed' ? 'Completed' : 'Approved'}
          </span>
        )
      case 'SUBMITTED_FOR_REVIEW':
      case 'Under Review':
        return (
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, background: '#EDE9FE', color: '#6D28D9', border: '1px solid #DDD6FE' }}>
            <Clock size={12} /> Under Review
          </span>
        )
      case 'RETURNED_FOR_EDIT':
      case 'REJECTED':
      case 'Changes Requested':
        return (
          <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}>
            <AlertTriangle size={12} /> Changes Requested
          </span>
        )
      case 'Partially Under Review':
        return (
          <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, background: '#E0E7FF', color: '#3730A3', border: '1px solid #C7D2FE' }}>
            Partially Under Review
          </span>
        )
      case 'In Progress':
        return (
          <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            In Progress
          </span>
        )
      case 'INCOMPLETE':
      case 'Incomplete':
        return (
          <span className="badge" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            <AlertCircle size={12} /> Incomplete
          </span>
        )
      case 'UPLOADED':
      case 'READY_FOR_REVIEW':
      case 'Ready for Review':
        return (
          <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            Ready for Review
          </span>
        )
      case 'DRAFT':
      case 'Draft':
        return (
          <span className="badge" style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            Draft
          </span>
        )
      default:
        return (
          <span className="badge" style={{ background: '#F8FAFC', color: '#64748B', border: '1px solid #E2E8F0', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
            {status || 'Not Started'}
          </span>
        )
    }
  }

  // Helper to calculate total course duration across playlists/lessons
  const getCourseDuration = (course) => {
    if (!course) return null
    const sections = course.playlists || []
    let totalSeconds = 0
    sections.forEach((s) => {
      (s.lessons || []).forEach((l) => {
        if (l.durationSeconds) {
          totalSeconds += l.durationSeconds
        } else if (l.duration && l.duration.includes(':')) {
          const parts = l.duration.split(':').map(Number)
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            totalSeconds += parts[0] * 60 + parts[1]
          } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
            totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2]
          }
        }
      })
    })

    if (totalSeconds <= 0) return null
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }
    return `${minutes}m`
  }

  // Helper to render compact status chips in course cards
  const renderCourseCardStatus = (status) => {
    let bg = '#F1F5F9'
    let color = '#475569'
    let border = '#E2E8F0'
    let dotColor = '#64748B'
    let label = status || 'Not Started'

    switch (status) {
      case 'In Progress':
        bg = '#EFF6FF'
        color = '#1D4ED8'
        border = '#DBEAFE'
        dotColor = '#2563EB'
        break
      case 'Under Review':
      case 'Partially Under Review':
        bg = '#FFFBEB'
        color = '#B45309'
        border = '#FDE68A'
        dotColor = '#D97706'
        label = 'Under Review'
        break
      case 'Approved':
      case 'Completed':
      case 'PUBLISHED':
        bg = '#DCFCE7'
        color = '#15803D'
        border = '#BBF7D0'
        dotColor = '#16A34A'
        label = 'Approved'
        break
      case 'Changes Requested':
      case 'RETURNED_FOR_EDIT':
        bg = '#FEE2E2'
        color = '#B91C1C'
        border = '#FECACA'
        dotColor = '#DC2626'
        label = 'Changes Requested'
        break
      case 'Not Started':
      default:
        bg = '#F1F5F9'
        color = '#475569'
        border = '#E2E8F0'
        dotColor = '#64748B'
        label = 'Not Started'
        break
    }

    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 700,
          background: bg,
          color: color,
          border: `1px solid ${border}`,
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <span>{label}</span>
      </span>
    )
  }

  // Course Filter Counts
  const courseFilterCounts = useMemo(() => {
    let inProgress = 0
    let underReview = 0
    let approved = 0
    let changesRequested = 0

    assignedCourses.forEach((c) => {
      const metrics = getCourseMetrics(c)
      if (metrics.status === 'In Progress' || metrics.status === 'Not Started') inProgress++
      else if (metrics.status === 'Under Review' || metrics.status === 'Partially Under Review') underReview++
      else if (metrics.status === 'Approved' || metrics.status === 'Completed') approved++
      else if (metrics.status === 'Changes Requested') changesRequested++
    })

    return {
      all: assignedCourses.length,
      inProgress,
      underReview,
      approved,
      changesRequested
    }
  }, [assignedCourses, submissions])

  // Filtered & Sorted Courses for My Courses view
  const filteredCourses = useMemo(() => {
    let result = [...assignedCourses]

    // Search filter
    if (courseSearch.trim()) {
      const q = courseSearch.trim().toLowerCase()
      result = result.filter((c) => {
        const title = (c.title || '').toLowerCase()
        const code = getCourseCode(c).toLowerCase()
        const cat = (c.category || '').toLowerCase()
        const desc = (c.shortDescription || c.description || '').toLowerCase()
        return title.includes(q) || code.includes(q) || cat.includes(q) || desc.includes(q)
      })
    }

    // Status filter
    if (courseFilterStatus !== 'ALL') {
      result = result.filter((c) => {
        const metrics = getCourseMetrics(c)
        if (courseFilterStatus === 'IN_PROGRESS') return metrics.status === 'In Progress' || metrics.status === 'Not Started'
        if (courseFilterStatus === 'UNDER_REVIEW') return metrics.status === 'Under Review' || metrics.status === 'Partially Under Review'
        if (courseFilterStatus === 'APPROVED') return metrics.status === 'Approved' || metrics.status === 'Completed'
        if (courseFilterStatus === 'CHANGES_REQUESTED') return metrics.status === 'Changes Requested'
        return true
      })
    }

    // Sort
    result.sort((a, b) => {
      if (courseSort === 'recently_assigned') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
      if (courseSort === 'recently_updated') {
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      }
      if (courseSort === 'name') {
        return (a.title || '').localeCompare(b.title || '')
      }
      if (courseSort === 'progress') {
        return getCourseMetrics(b).progress - getCourseMetrics(a).progress
      }
      return 0
    })

    return result
  }, [assignedCourses, courseSearch, courseFilterStatus, courseSort, submissions])

  // Navigation handlers
  const handleOpenWorkspace = (course) => {
    setActiveCourseId(course.id)
    setWorkspaceTab('overview')
    navigate(`/creator/courses/${course.id}`)
  }

  const handleBackToCourses = () => {
    setActiveCourseId(null)
    navigate('/creator/courses')
  }

  // Section Management Handlers
  const handleCreateSection = async (e) => {
    e.preventDefault()
    if (!sectionTitle.trim() || !activeCourse) return

    try {
      setIsSubmittingSection(true)
      const currentSectionsCount = activeCourse.playlists ? activeCourse.playlists.length : 0

      // Automatically strip redundant prefixes like "Section 1:" if entered by mistake
      let cleanedTitle = sectionTitle.trim()
        .replace(/^section\s*\d*\s*[:\-–—]?\s*/i, '')
        .replace(/^section\d+\s*[:\-–—]?\s*/i, '')
        .trim()
      if (!cleanedTitle) cleanedTitle = sectionTitle.trim()

      await api.creator.createPlaylist(
        activeCourse.id,
        cleanedTitle,
        sectionDesc.trim(),
        currentSectionsCount + 1
      )
      showToast(`Section ${currentSectionsCount + 1} "${cleanedTitle}" created successfully`, 'success')
      setSectionTitle('')
      setSectionDesc('')
      setIsAddSectionOpen(false)
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to create section', 'error')
    } finally {
      setIsSubmittingSection(false)
    }
  }

  const handleRenameSection = async (e) => {
    e.preventDefault()
    if (!renameSectionModal.section || !renameSectionModal.title.trim()) return

    try {
      let cleanedTitle = renameSectionModal.title.trim()
        .replace(/^section\s*\d*\s*[:\-–—]?\s*/i, '')
        .replace(/^section\d+\s*[:\-–—]?\s*/i, '')
        .trim()
      if (!cleanedTitle) cleanedTitle = renameSectionModal.title.trim()

      await api.creator.updatePlaylist(renameSectionModal.section.id, {
        title: cleanedTitle,
        description: renameSectionModal.desc.trim()
      })
      showToast('Section details updated', 'success')
      setRenameSectionModal({ isOpen: false, section: null, title: '', desc: '' })
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to update section', 'error')
    }
  }

  const handleDeleteSection = async () => {
    if (!deleteSectionModal.section) return
    const lessons = deleteSectionModal.section.lessons || []
    const hasApproved = lessons.some((l) => l.status === 'APPROVED' || l.status === 'PUBLISHED' || l.status === 'SUBMITTED_FOR_REVIEW')
    if (hasApproved) {
      showToast('Cannot delete section with lectures under review or approved', 'error')
      setDeleteSectionModal({ isOpen: false, section: null })
      return
    }

    try {
      await api.creator.deletePlaylist(deleteSectionModal.section.id)
      showToast('Section and associated draft lessons deleted', 'info')
      setDeleteSectionModal({ isOpen: false, section: null })
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to delete section', 'error')
    }
  }

  const handleReorderSection = async (section, direction) => {
    if (!activeCourse || !activeCourse.playlists) return
    const sections = [...activeCourse.playlists].sort((a, b) => a.orderIndex - b.orderIndex)
    const currentIndex = sections.findIndex((s) => s.id === section.id)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const targetSection = sections[targetIndex]
    const tempOrder = section.orderIndex
    const newOrder = targetSection.orderIndex

    try {
      await Promise.all([
        api.creator.updatePlaylist(section.id, { orderIndex: newOrder }),
        api.creator.updatePlaylist(targetSection.id, { orderIndex: tempOrder })
      ])
      await loadAllData(true)
    } catch (err) {
      showToast('Failed to reorder sections', 'error')
    }
  }

  // Scoped Lecture Management Handlers
  const handleOpenLectureModal = (mode, targetSection, targetLesson = null) => {
    if (!activeCourse) return

    if (mode === 'edit' && targetLesson) {
      const hasVid = Boolean((targetLesson.videoUrl && targetLesson.videoUrl.trim()) || targetLesson.s3Key)
      setLectureModal({
        isOpen: true,
        mode: 'edit',
        lectureId: targetLesson.id,
        courseId: activeCourse.id,
        playlistId: targetLesson.playlistId || targetSection?.id || '',
        title: targetLesson.title || '',
        description: targetLesson.description || '',
        duration: targetLesson.duration || '',
        orderIndex: targetLesson.orderIndex || 1,
        videoUrl: targetLesson.videoUrl || '',
        s3Key: targetLesson.s3Key || null,
        thumbnail: '',
        resources: '',
        notes: targetLesson.adminFeedback || '',
        status: targetLesson.status || (hasVid ? 'DRAFT' : 'INCOMPLETE'),
        selectedFile: null,
        uploadProgress: 0,
        isUploading: false,
        isSaving: false
      })
    } else {
      const lessonsInSec = targetSection?.lessons ? targetSection.lessons.length : 0
      setLectureModal({
        isOpen: true,
        mode: 'create',
        lectureId: null,
        courseId: activeCourse.id,
        playlistId: targetSection?.id || (activeCourse.playlists?.[0]?.id || ''),
        title: '',
        description: '',
        duration: '',
        orderIndex: lessonsInSec + 1,
        videoUrl: '',
        s3Key: null,
        thumbnail: '',
        resources: '',
        notes: '',
        status: 'INCOMPLETE',
        selectedFile: null,
        uploadProgress: 0,
        isUploading: false,
        isSaving: false
      })
    }
  }

  const handleSaveLecture = async (targetAction = 'DRAFT') => {
    // targetAction: 'DRAFT' | 'SUBMIT'
    if (!lectureModal.title.trim()) {
      showToast('Please provide a lecture title', 'error')
      return
    }
    if (!lectureModal.playlistId) {
      showToast('Please select a target curriculum section', 'error')
      return
    }

    const hasVideoInput = Boolean(
      lectureModal.selectedFile ||
      (lectureModal.videoUrl && lectureModal.videoUrl.trim()) ||
      lectureModal.s3Key
    )

    if (targetAction === 'SUBMIT' && !hasVideoInput) {
      showToast('Upload a lecture video before submitting for review.', 'error')
      return
    }

    try {
      setLectureModal((prev) => ({ ...prev, isSaving: true }))

      let finalVideoUrl = lectureModal.videoUrl ? lectureModal.videoUrl.trim() : null
      let finalS3Key = lectureModal.s3Key

      // 1. If a new video file was selected, upload directly to S3 via presigned URL
      if (lectureModal.selectedFile) {
        setLectureModal((prev) => ({ ...prev, isUploading: true, uploadProgress: 10 }))

        const presignedRes = await api.creator.getUploadUrl({
          fileName: lectureModal.selectedFile.name,
          fileType: lectureModal.selectedFile.type || 'video/mp4',
          courseId: activeCourse?.id || 'general'
        })

        const { uploadUrl, objectKey, fileUrl } = presignedRes.data
        finalS3Key = objectKey
        finalVideoUrl = fileUrl

        // Upload to S3 with progress
        setLectureModal((prev) => ({ ...prev, uploadProgress: 25 }))
        const xhr = new XMLHttpRequest()
        await new Promise((resolve, reject) => {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round(25 + (event.loaded / event.total) * 65)
              setLectureModal((prev) => ({ ...prev, uploadProgress: percent }))
            }
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else reject(new Error(`Upload error (${xhr.status})`))
          }
          xhr.onerror = () => reject(new Error('Network error uploading video. Check your connection or server status.'))

          const token = localStorage.getItem('apex_token')
          const uploadUrlWithToken = token && uploadUrl.includes('/upload-local')
            ? `${uploadUrl}&token=${encodeURIComponent(token)}`
            : uploadUrl

          xhr.open('PUT', uploadUrlWithToken)
          if (token && (uploadUrl.includes('localhost') || uploadUrl.includes('127.0.0.1') || uploadUrl.startsWith('/') || uploadUrl.includes('/api/'))) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            xhr.withCredentials = true
          }
          xhr.setRequestHeader('Content-Type', lectureModal.selectedFile.type || 'video/mp4')
          xhr.send(lectureModal.selectedFile)
        })

        setLectureModal((prev) => ({ ...prev, uploadProgress: 95 }))
      }

      // Calculate duration seconds
      let durationSeconds = 0
      if (lectureModal.duration && lectureModal.duration.trim()) {
        const durationParts = lectureModal.duration.trim().split(':')
        if (durationParts.length === 2) {
          durationSeconds = parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10)
        } else if (durationParts.length === 3) {
          durationSeconds = parseInt(durationParts[0], 10) * 3600 + parseInt(durationParts[1], 10) * 60 + parseInt(durationParts[2], 10)
        }
      }

      const hasFinalVideo = Boolean(finalVideoUrl || finalS3Key)

      let determinedStatus = 'DRAFT'
      if (!hasFinalVideo) {
        determinedStatus = 'INCOMPLETE'
      } else if (targetAction === 'SUBMIT') {
        determinedStatus = 'SUBMITTED_FOR_REVIEW'
      } else {
        determinedStatus = 'DRAFT'
      }

      const lessonData = {
        playlistId: lectureModal.playlistId,
        title: lectureModal.title.trim(),
        description: lectureModal.description.trim(),
        duration: lectureModal.duration ? lectureModal.duration.trim() : '',
        durationSeconds: durationSeconds || 0,
        orderIndex: Number(lectureModal.orderIndex) || 1,
        videoUrl: finalVideoUrl,
        s3Key: finalS3Key,
        status: determinedStatus
      }

      let savedLessonId = lectureModal.lectureId

      if (lectureModal.mode === 'edit' && lectureModal.lectureId) {
        await api.creator.updateLesson(lectureModal.lectureId, lessonData)
        if (targetAction === 'SUBMIT' && hasFinalVideo) {
          await api.creator.submitVideoForReview(lectureModal.lectureId)
          showToast(`Lesson "${lessonData.title}" submitted to Admin Verification Queue`, 'success')
        } else {
          showToast(hasFinalVideo ? 'Lesson draft saved successfully' : 'Lesson saved as Incomplete (Upload a video before submitting for review)', 'success')
        }
      } else {
        const createRes = await api.creator.uploadVideo(lessonData)
        savedLessonId = createRes?.data?.lesson?.id
        if (targetAction === 'SUBMIT' && savedLessonId && hasFinalVideo) {
          await api.creator.submitVideoForReview(savedLessonId)
          showToast(`Lesson "${lessonData.title}" submitted for Admin Review!`, 'success')
        } else {
          showToast(hasFinalVideo ? 'New lecture added to curriculum section as Draft' : 'New lecture saved as Incomplete (Upload a video to submit for review)', 'success')
        }
      }

      setLectureModal({
        isOpen: false,
        mode: 'create',
        lectureId: null,
        courseId: '',
        playlistId: '',
        title: '',
        description: '',
        duration: '',
        orderIndex: 1,
        videoUrl: '',
        s3Key: null,
        thumbnail: '',
        resources: '',
        notes: '',
        status: 'INCOMPLETE',
        selectedFile: null,
        uploadProgress: 0,
        isUploading: false,
        isSaving: false
      })
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to save lecture', 'error')
    } finally {
      setLectureModal((prev) => ({ ...prev, isSaving: false, isUploading: false, uploadProgress: 0 }))
    }
  }

  const handleDeleteLesson = async () => {
    if (!deleteLessonModal.lesson) return
    try {
      await api.creator.deleteLesson(deleteLessonModal.lesson.id)
      showToast('Lesson deleted from curriculum', 'info')
      setDeleteLessonModal({ isOpen: false, lesson: null })
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to delete lesson', 'error')
    }
  }

  const handleSubmitForReviewDirect = async (lesson) => {
    if (!lesson) return
    const lessonId = typeof lesson === 'object' ? lesson.id : lesson
    const target = typeof lesson === 'object' ? lesson : null

    if (target && !target.videoUrl && !target.s3Key) {
      showToast('Upload a lecture video before submitting for review.', 'error')
      return
    }

    try {
      await api.creator.submitVideoForReview(lessonId)
      showToast('Lecture submitted to Admin Verification Queue', 'success')
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to submit lecture', 'error')
    }
  }

  // 1. Profile Change Request submission handler (Universal for all request types)
  const handleSubmitChangeRequest = async (e, category) => {
    if (e && e.preventDefault) e.preventDefault()
    const type = category || activeReqCategory

    let payload = { requestType: type }

    if (type === 'EMAIL_CHANGE') {
      if (!reqEmail.trim()) {
        showToast('Please enter requested new email address', 'error')
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(reqEmail.trim())) {
        showToast('Please provide a valid email address format', 'error')
        return
      }
      if (reqEmail.trim().toLowerCase() === (currentCreator?.email || '').toLowerCase()) {
        showToast('New email must be different from current email', 'error')
        return
      }
      if (!reqEmailReason.trim()) {
        showToast('Please provide a reason for the email change request', 'error')
        return
      }
      payload.requestedValue = reqEmail.trim().toLowerCase()
      payload.reason = reqEmailReason.trim()
    } else if (type === 'PASSWORD_CHANGE') {
      // SECURITY: Do NOT send any password values here! Only request permission!
      if (!reqPasswordReason.trim()) {
        showToast('Please provide a reason for the password change request', 'error')
        return
      }
      payload.reason = reqPasswordReason.trim()
    } else if (type === 'PROFILE_PHOTO') {
      if (!reqPhotoUrl.trim()) {
        showToast('Please provide new profile photo URL or image', 'error')
        return
      }
      payload.requestedValue = reqPhotoUrl.trim()
      payload.reason = reqPhotoReason.trim() || 'Profile photo update'
    } else if (type === 'NAME') {
      if (!reqName.trim()) {
        showToast('Please enter requested display name', 'error')
        return
      }
      payload.requestedValue = reqName.trim()
      payload.reason = reqNameReason.trim() || 'Display name correction'
    } else if (type === 'SPECIALIZATION') {
      if (!reqSpec.trim()) {
        showToast('Please enter requested specialization', 'error')
        return
      }
      payload.requestedValue = reqSpec.trim()
      payload.reason = reqSpecReason.trim() || 'Specialization update'
    } else {
      // HEADLINE_BIO / PROFILE_DATA
      if (!profileHeadline.trim() && !profileBio.trim()) {
        showToast('Please provide requested headline or biography updates', 'error')
        return
      }
      payload.requestType = 'PROFILE_DATA'
      payload.requestedHeadline = profileHeadline.trim() || undefined
      payload.requestedBio = profileBio.trim() || undefined
      payload.supportingUrl = profileSupportingUrl.trim() || undefined
      payload.reason = profileJustification.trim() || 'Creator profile credential update'
    }

    try {
      setIsSubmittingProfileReq(true)
      await api.creator.requestProfileChange(payload)
      showToast('Change request submitted to Admin for approval', 'success')

      // Clear relevant form inputs
      if (type === 'EMAIL_CHANGE') {
        setReqEmail('')
        setReqEmailReason('')
      } else if (type === 'PASSWORD_CHANGE') {
        setReqPasswordReason('')
      } else if (type === 'PROFILE_PHOTO') {
        setReqPhotoUrl('')
        setReqPhotoReason('')
      } else if (type === 'NAME') {
        setReqName('')
        setReqNameReason('')
      } else if (type === 'SPECIALIZATION') {
        setReqSpec('')
        setReqSpecReason('')
      } else {
        setProfileHeadline('')
        setProfileBio('')
        setProfileSupportingUrl('')
        setProfileJustification('')
      }

      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to submit change request', 'error')
    } finally {
      setIsSubmittingProfileReq(false)
    }
  }

  // Alias for backward compatibility
  const handleProfileChangeRequest = (e) => handleSubmitChangeRequest(e, 'HEADLINE_BIO')

  // 2. Verify Email OTP submit handler
  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault()
    if (!emailOtpInput.trim()) {
      showToast('Please enter the 6-digit verification code', 'error')
      return
    }

    try {
      setIsVerifyingEmail(true)
      const res = await api.creator.verifyEmailChange({
        requestId: activeEmailReq.id,
        otp: emailOtpInput.trim()
      })
      showToast('Email address verified and updated successfully!', 'success')
      setVerifyEmailModalOpen(false)
      setActiveEmailReq(null)
      setEmailOtpInput('')

      // Update cached user in localStorage if matching
      try {
        const saved = localStorage.getItem('apex_user')
        if (saved) {
          const parsed = JSON.parse(saved)
          parsed.email = res.data?.newEmail || activeEmailReq.requestedValue
          localStorage.setItem('apex_user', JSON.stringify(parsed))
        }
      } catch {}

      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Verification failed. Please check the OTP code.', 'error')
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  // 3. Complete Password Change submit handler
  const handleCompletePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!currPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      showToast('All password fields are required', 'error')
      return
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showToast('New password and confirmation password do not match', 'error')
      return
    }
    if (newPasswordInput.length < 8) {
      showToast('New password must be at least 8 characters long', 'error')
      return
    }

    try {
      setIsSettingPassword(true)
      await api.creator.completePasswordChange({
        requestId: activePasswordReq.id,
        currentPassword: currPasswordInput,
        newPassword: newPasswordInput,
        confirmPassword: confirmPasswordInput
      })
      showToast('Password updated securely and successfully!', 'success')
      setSetPasswordModalOpen(false)
      setActivePasswordReq(null)
      setCurrPasswordInput('')
      setNewPasswordInput('')
      setConfirmPasswordInput('')
      await loadAllData(true)
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error')
    } finally {
      setIsSettingPassword(false)
    }
  }

  // RENDER SUB-VIEWS

  // ==================================================
  // 1. CREATOR DASHBOARD VIEW
  // ==================================================
  const renderDashboardView = () => {
    // Recent Admin feedback items
    const feedbackItems = submissions.filter((s) => s.adminFeedback || s.status === 'RETURNED_FOR_EDIT')

    // Recent activity list
    const recentActivity = []
    submissions.slice(0, 5).forEach((s) => {
      const courseTitle = s.playlist?.course?.title || 'Assigned Course'
      if (s.status === 'APPROVED') {
        recentActivity.push({
          id: `app-${s.id}`,
          title: `Video Approved: "${s.title}"`,
          desc: `Approved by Admin for course ${courseTitle}`,
          time: new Date(s.updatedAt || Date.now()).toLocaleDateString(),
          icon: CheckCircle2,
          color: '#10B981'
        })
      } else if (s.status === 'RETURNED_FOR_EDIT') {
        recentActivity.push({
          id: `ret-${s.id}`,
          title: `Admin Requested Changes: "${s.title}"`,
          desc: s.adminFeedback || 'Revisions required on audio/video standards',
          time: new Date(s.updatedAt || Date.now()).toLocaleDateString(),
          icon: AlertTriangle,
          color: '#D97706'
        })
      } else if (s.status === 'SUBMITTED_FOR_REVIEW') {
        recentActivity.push({
          id: `sub-${s.id}`,
          title: `Lecture Submitted for Review: "${s.title}"`,
          desc: `In verification queue for ${courseTitle}`,
          time: new Date(s.updatedAt || Date.now()).toLocaleDateString(),
          icon: Clock,
          color: '#2563EB'
        })
      }
    })

    if (assignedCourses[0]) {
      recentActivity.push({
        id: `crs-${assignedCourses[0].id}`,
        title: `Course Assigned: "${assignedCourses[0].title}"`,
        desc: `Curriculum authoring active • ${assignedCourses[0].category}`,
        time: new Date(assignedCourses[0].createdAt || Date.now()).toLocaleDateString(),
        icon: BookOpen,
        color: '#6366F1'
      })
    }

    return (
      <div className="creator-container">
        {/* Top Section */}
        <div className="creator-top-header">
          <div>
            <h1>Creator Dashboard</h1>
            <p>Welcome back, {currentCreator?.name || 'Creator'} • Manage your assigned courses and content production workflow.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              <span>Sync</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/creator/courses')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <BookOpen size={14} />
              <span>Go to My Courses</span>
            </button>
          </div>
        </div>

        {/* 5 Compact KPI Cards in One Row */}
        <div className="creator-kpi-grid">
          <div className="creator-kpi-card">
            <div className="creator-kpi-header">
              <span className="creator-kpi-label">Assigned Courses</span>
              <div className="creator-kpi-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <BookOpen size={18} />
              </div>
            </div>
            <div className="creator-kpi-val">{globalKPIs.totalAssigned}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Assigned for authoring</div>
          </div>

          <div className="creator-kpi-card">
            <div className="creator-kpi-header">
              <span className="creator-kpi-label">Draft Lectures</span>
              <div className="creator-kpi-icon" style={{ background: '#F8FAFC', color: '#475569' }}>
                <FileVideo size={18} />
              </div>
            </div>
            <div className="creator-kpi-val">{globalKPIs.draftCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>In-progress drafts</div>
          </div>

          <div className="creator-kpi-card">
            <div className="creator-kpi-header">
              <span className="creator-kpi-label">Pending Review</span>
              <div className="creator-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="creator-kpi-val" style={{ color: globalKPIs.pendingCount > 0 ? '#D97706' : '#0F172A' }}>
              {globalKPIs.pendingCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Awaiting verification</div>
          </div>

          <div className="creator-kpi-card">
            <div className="creator-kpi-header">
              <span className="creator-kpi-label">Changes Requested</span>
              <div className="creator-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="creator-kpi-val" style={{ color: globalKPIs.changesCount > 0 ? '#DC2626' : '#0F172A' }}>
              {globalKPIs.changesCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Requires revisions</div>
          </div>

          <div className="creator-kpi-card">
            <div className="creator-kpi-header">
              <span className="creator-kpi-label">Approved Content</span>
              <div className="creator-kpi-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="creator-kpi-val" style={{ color: '#059669' }}>{globalKPIs.approvedCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Verified & published</div>
          </div>
        </div>

        {/* 2-Column Split: Assigned Courses / Continue Working (Left) & Recent Admin Feedback (Right) */}
        <div className="creator-two-col-grid">
          {/* LEFT: Assigned Courses / Continue Working */}
          <div className="creator-card">
            <div className="creator-card-header">
              <h3>Assigned Courses / Continue Working</h3>
              <Link to="/creator/courses" style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                View All ({assignedCourses.length})
              </Link>
            </div>
            <div className="creator-card-body" style={{ padding: 0 }}>
              {assignedCourses.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <BookOpen size={36} style={{ color: '#94A3B8', margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>No Courses Assigned</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: 400, margin: '0 auto' }}>
                    Once an Administrator assigns a course, it will appear here and you can begin building its curriculum and lectures.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {assignedCourses.slice(0, 3).map((course, idx) => {
                    const metrics = getCourseMetrics(course)
                    const code = getCourseCode(course)
                    return (
                      <div
                        key={course.id}
                        style={{
                          padding: '16px 20px',
                          borderBottom: idx < assignedCourses.length - 1 ? '1px solid #E2E8F0' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', background: '#F1F5F9', color: '#475569', borderRadius: 4 }}>
                              {code}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{course.category}</span>
                            {renderStatusBadge(metrics.status)}
                          </div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {course.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.78rem', color: '#64748B' }}>
                            <span>{metrics.sectionsCount} Sections</span>
                            <span>•</span>
                            <span>{metrics.lessonsCount} Lectures</span>
                            <span>•</span>
                            <span>{metrics.progress}% Completed</span>
                          </div>
                          {/* Progress bar */}
                          <div style={{ width: '100%', height: 5, background: '#E2E8F0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                            <div style={{ width: `${metrics.progress}%`, height: '100%', background: '#2563EB', transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenWorkspace(course)}
                          style={{ flexShrink: 0, fontWeight: 700 }}
                        >
                          Open Workspace
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Recent Admin Feedback */}
          <div className="creator-card">
            <div className="creator-card-header">
              <h3>Recent Admin Feedback</h3>
              <Link to="/creator/feedback" style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                Review Queue
              </Link>
            </div>
            <div className="creator-card-body">
              {feedbackItems.length === 0 ? (
                <div style={{ padding: '24px 10px', textAlign: 'center', color: '#64748B' }}>
                  <MessageSquare size={32} style={{ color: '#CBD5E1', margin: '0 auto 10px auto' }} />
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>No review feedback pending. Submit lectures to receive editorial review.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {feedbackItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: item.status === 'RETURNED_FOR_EDIT' ? '#FEF2F2' : '#F8FAFC',
                        border: `1px solid ${item.status === 'RETURNED_FOR_EDIT' ? '#FECACA' : '#E2E8F0'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: item.status === 'RETURNED_FOR_EDIT' ? '#991B1B' : '#0F172A' }}>
                          {item.title}
                        </span>
                        {renderStatusBadge(item.status)}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                        "{item.adminFeedback || 'Please revise according to syllabus standards.'}"
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                          {item.playlist?.course?.title || 'Curriculum Course'}
                        </span>
                        {item.status === 'RETURNED_FOR_EDIT' && (
                          <button
                            className="btn btn-outline btn-xs"
                            onClick={() => {
                              const course = assignedCourses.find((c) => c.id === item.playlist?.course?.id)
                              if (course) {
                                handleOpenWorkspace(course)
                                setWorkspaceTab('curriculum')
                              } else {
                                navigate('/creator/feedback')
                              }
                            }}
                            style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', borderColor: '#FCA5A5' }}
                          >
                            Fix & Resubmit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Below that: Recent Activity */}
        <div className="creator-card">
          <div className="creator-card-header">
            <h3>Recent Content Activity</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Production timeline</span>
          </div>
          <div className="creator-card-body" style={{ padding: 0 }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>
                No recent activity recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentActivity.map((act, i) => {
                  const Icon = act.icon
                  return (
                    <div
                      key={act.id || i}
                      style={{
                        padding: '14px 20px',
                        borderBottom: i < recentActivity.length - 1 ? '1px solid #F1F5F9' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: act.color,
                            flexShrink: 0
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{act.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{act.desc}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', flexShrink: 0 }}>{act.time}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==================================================
  // 2. MY COURSES — MAIN WORKSPACE VIEW
  // ==================================================
  const renderMyCoursesView = () => {
    return (
      <div className="creator-container" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Banner Section matching Reference Image */}
        <div className="creator-courses-banner">
          {/* Subtle curved texture wave lines */}
          <svg
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              height: '100%',
              width: '500px',
              pointerEvents: 'none',
              opacity: 0.18
            }}
            viewBox="0 0 500 200"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 50 160 C 180 50, 320 220, 500 70"
              stroke="rgba(96, 165, 250, 0.45)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 10 185 C 160 80, 290 230, 500 110"
              stroke="rgba(96, 165, 250, 0.35)"
              strokeWidth="1.2"
              fill="none"
            />
            <path
              d="M 90 140 C 210 40, 350 200, 500 50"
              stroke="rgba(147, 197, 253, 0.3)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 130 175 C 240 70, 380 210, 500 95"
              stroke="rgba(59, 130, 246, 0.35)"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>

          <div className="creator-courses-banner-text">
            <div className="creator-courses-banner-tag">MY COURSES</div>
            <h1 className="creator-courses-banner-title">My Assigned Courses</h1>
            <p className="creator-courses-banner-desc">
              Create and manage your courses, build engaging content, and track your progress.
            </p>
          </div>

          <div className="creator-courses-search-box">
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
              className="creator-courses-search-input"
              placeholder="Search by course name, code or subject..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
            {courseSearch && (
              <button
                type="button"
                onClick={() => setCourseSearch('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Compact Filters & Sort Row */}
        <div className="creator-courses-filters-row">
          <div className="creator-courses-filter-tabs">
            <button
              type="button"
              className={`creator-courses-filter-tab ${courseFilterStatus === 'ALL' ? 'active' : ''}`}
              onClick={() => setCourseFilterStatus('ALL')}
            >
              <FileText size={14} />
              <span>All {courseFilterCounts.all > 0 ? `(${courseFilterCounts.all})` : ''}</span>
            </button>

            <button
              type="button"
              className={`creator-courses-filter-tab ${courseFilterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setCourseFilterStatus('IN_PROGRESS')}
            >
              <Clock size={14} />
              <span>In Progress {courseFilterCounts.inProgress > 0 ? `(${courseFilterCounts.inProgress})` : ''}</span>
            </button>

            <button
              type="button"
              className={`creator-courses-filter-tab ${courseFilterStatus === 'UNDER_REVIEW' ? 'active' : ''}`}
              onClick={() => setCourseFilterStatus('UNDER_REVIEW')}
            >
              <AlertCircle size={14} />
              <span>Under Review {courseFilterCounts.underReview > 0 ? `(${courseFilterCounts.underReview})` : ''}</span>
            </button>

            <button
              type="button"
              className={`creator-courses-filter-tab ${courseFilterStatus === 'APPROVED' ? 'active' : ''}`}
              onClick={() => setCourseFilterStatus('APPROVED')}
            >
              <CheckCircle2 size={14} />
              <span>Approved {courseFilterCounts.approved > 0 ? `(${courseFilterCounts.approved})` : ''}</span>
            </button>

            <button
              type="button"
              className={`creator-courses-filter-tab ${courseFilterStatus === 'CHANGES_REQUESTED' ? 'active' : ''}`}
              onClick={() => setCourseFilterStatus('CHANGES_REQUESTED')}
            >
              <RotateCcw size={14} />
              <span>Changes Requested {courseFilterCounts.changesRequested > 0 ? `(${courseFilterCounts.changesRequested})` : ''}</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="creator-courses-sort-control">
              <SlidersHorizontal size={14} style={{ color: '#64748B' }} />
              <span>Sort by</span>
              <select
                className="creator-courses-sort-select"
                value={courseSort}
                onChange={(e) => setCourseSort(e.target.value)}
              >
                <option value="recently_assigned">Recently Assigned</option>
                <option value="recently_updated">Recently Updated</option>
                <option value="name">Course Name</option>
                <option value="progress">Progress</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              title="Refresh courses"
              style={{
                width: 32,
                height: 32,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B'
              }}
            >
              <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Course Cards or Empty State */}
        {assignedCourses.length === 0 ? (
          <div className="creator-card" style={{ padding: '60px 24px', textAlign: 'center', borderRadius: 12 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#64748B'
              }}
            >
              <BookOpen size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              No Courses Assigned
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
              Once an Administrator assigns a course, it will appear here and you can begin building its curriculum and lectures.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="creator-card" style={{ padding: '50px 24px', textAlign: 'center', borderRadius: 12 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                color: '#94A3B8'
              }}
            >
              <Search size={26} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              No matching courses found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: 420, margin: '0 auto 16px auto' }}>
              No assigned courses matched your search query or filter selection.
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setCourseSearch('')
                setCourseFilterStatus('ALL')
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredCourses.map((course) => {
              const metrics = getCourseMetrics(course)
              const code = getCourseCode(course)
              const duration = getCourseDuration(course) || course.duration || (course.durationHours ? `${course.durationHours}h` : null)
              const assignedDate = new Date(course.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })

              // Progress bar fill color based on status
              let progressBarColor = '#2563EB'
              if (metrics.status === 'Under Review' || metrics.status === 'Partially Under Review') {
                progressBarColor = '#F59E0B'
              } else if (metrics.status === 'Approved' || metrics.status === 'Completed') {
                progressBarColor = '#10B981'
              } else if (metrics.status === 'Changes Requested') {
                progressBarColor = '#EF4444'
              }

              return (
                <div key={course.id} className="creator-course-card">
                  {/* LEFT: Thumbnail */}
                  <div className="creator-course-card-thumb">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          const fallback = e.target.parentElement.querySelector('.thumb-fallback')
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className="thumb-fallback"
                      style={{
                        display: course.thumbnail ? 'none' : 'flex',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #0A1128 0%, #1E293B 100%)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 6,
                        color: '#94A3B8'
                      }}
                    >
                      <BookOpen size={28} style={{ color: '#60A5FA', opacity: 0.9 }} />
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#94A3B8',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {course.category || 'Course'}
                      </span>
                    </div>
                  </div>

                  {/* CENTER: Code Badge, Title, Description, Metadata */}
                  <div className="creator-course-card-body">
                    {/* Course Code Badge - strictly single line */}
                    <div className="creator-course-card-code-badge" style={{ whiteSpace: 'nowrap' }}>
                      <BookOpen size={11} />
                      <span>{code}</span>
                    </div>

                    {/* Course Title - strongest text in card */}
                    <h3 className="creator-course-card-title" title={course.title}>
                      {course.title}
                    </h3>

                    {/* Short Description */}
                    <p className="creator-course-card-desc">
                      {course.shortDescription ||
                        (course.fullDescription ? course.fullDescription.replace(/<[^>]*>?/gm, '') : '') ||
                        'Create and manage your assigned course content, upload video lectures, and track approval progress.'}
                    </p>

                    {/* Metadata Row */}
                    <div className="creator-course-card-meta">
                      {course.category && (
                        <span className="creator-course-card-meta-item">
                          <GraduationCap size={14} />
                          <span>{course.category}</span>
                        </span>
                      )}
                      <span className="creator-course-card-meta-item">
                        <BarChart2 size={14} />
                        <span>{course.level || 'Intermediate'}</span>
                      </span>
                      <span className="creator-course-card-meta-item">
                        <BookOpen size={14} />
                        <span>{metrics.lessonsCount} {metrics.lessonsCount === 1 ? 'Lecture' : 'Lectures'}</span>
                      </span>
                      {duration && (
                        <span className="creator-course-card-meta-item">
                          <Clock size={14} />
                          <span>{duration}</span>
                        </span>
                      )}
                      {course.createdAt && (
                        <span className="creator-course-card-meta-item" style={{ color: '#94A3B8' }}>
                          <span>• Assigned {assignedDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: Status, Progress, and Action */}
                  <div className="creator-course-card-right">
                    <div className="creator-course-card-progress-block">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
                        {renderCourseCardStatus(metrics.status)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                          {metrics.progress}% Complete
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 6,
                          background: '#E2E8F0',
                          borderRadius: 3,
                          overflow: 'hidden',
                          marginBottom: 6
                        }}
                      >
                        <div
                          style={{
                            width: `${metrics.progress}%`,
                            height: '100%',
                            background: progressBarColor,
                            borderRadius: 3,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {metrics.lessonsCount > 0
                          ? `${metrics.approvedCount} of ${metrics.lessonsCount} lectures approved`
                          : 'No lectures added yet'}
                      </div>
                    </div>

                    <div className="creator-course-card-actions">
                      <button
                        type="button"
                        className="btn creator-course-btn-workspace"
                        onClick={() => handleOpenWorkspace(course)}
                      >
                        <span>Open Workspace</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ==================================================
  // 3. COURSE WORKSPACE VIEW
  // ==================================================
  const renderCourseWorkspaceView = () => {
    if (!activeCourse) {
      return (
        <div className="creator-container">
          <div className="creator-card" style={{ padding: 40, textAlign: 'center' }}>
            <p>Course not found. Return to My Courses.</p>
            <button className="btn btn-secondary btn-sm" onClick={handleBackToCourses}>
              Back to My Courses
            </button>
          </div>
        </div>
      )
    }

    const metrics = getCourseMetrics(activeCourse)
    const code = getCourseCode(activeCourse)
    const sections = activeCourse.playlists || []

    const creatorDisplayName =
      currentCreator?.fullName ||
      currentCreator?.name ||
      creatorProfile?.fullName ||
      creatorProfile?.name ||
      activeCourse?.creators?.[0]?.creator?.fullName ||
      activeCourse?.creator?.fullName ||
      'Banu'

    return (
      <div className="creator-container" style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Workspace Clean Header Card */}
        <div className="creator-workspace-header-card">
          <div style={{ marginBottom: 14 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleBackToCourses}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 8px',
                fontWeight: 600,
                color: '#475569',
                fontSize: '0.85rem'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back to My Courses</span>
            </button>
          </div>

          <div className="creator-workspace-header-main">
            {/* Left: Code badge + Title + Metadata Chips */}
            <div className="creator-workspace-header-left">
              <div className="creator-workspace-header-title-row">
                <span className="creator-workspace-code-badge">
                  {code}
                </span>
                <h1 className="creator-workspace-header-title">
                  {activeCourse.title}
                </h1>
              </div>

              {/* Compact Information Chips */}
              <div className="creator-workspace-meta-row">
                <span className="creator-workspace-meta-pill">
                  <BookOpen size={14} />
                  <span>{activeCourse.category || 'General'}</span>
                </span>

                <span className="creator-workspace-meta-pill">
                  <User size={14} />
                  <span>{creatorDisplayName}</span>
                </span>

                {renderCourseCardStatus(metrics.status)}
              </div>
            </div>

            {/* Subtle Vertical Divider */}
            <div className="creator-workspace-header-divider" />

            {/* Right: Course Progress */}
            <div className="creator-workspace-progress-block">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 6
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  Course Progress
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  {metrics.progress}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: '#E2E8F0',
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 6
                }}
              >
                <div
                  style={{
                    width: `${metrics.progress}%`,
                    height: '100%',
                    background: '#2563EB',
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>
                {metrics.approvedCount} of {metrics.lessonsCount} lectures approved
              </div>
            </div>
          </div>
        </div>

        {/* Course Workspace Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 20, background: '#FFFFFF', borderRadius: '8px 8px 0 0', padding: '0 16px' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'curriculum', label: 'Curriculum', icon: Layers, badge: metrics.sectionsCount },
            { id: 'lectures', label: 'Lectures', icon: FileVideo, badge: metrics.lessonsCount },
            { id: 'review-status', label: 'Review Status', icon: MessageSquare, badge: metrics.pendingCount + metrics.changesCount }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = workspaceTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setWorkspaceTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #2563EB' : '3px solid transparent',
                  color: isActive ? '#2563EB' : '#64748B',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: isActive ? '#EFF6FF' : '#F1F5F9',
                      color: isActive ? '#2563EB' : '#64748B'
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* WORKSPACE TAB 1: OVERVIEW */}
        {workspaceTab === 'overview' && (
          <div className="creator-workspace-grid">
            {/* Left 70%: Course Info, Guidelines, Next Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Next Action Box */}
              <div
                style={{
                  padding: '18px 22px',
                  borderRadius: 10,
                  background: metrics.changesCount > 0 ? '#FEF2F2' : metrics.sectionsCount === 0 ? '#EFF6FF' : '#F0FDF4',
                  border: `1px solid ${metrics.changesCount > 0 ? '#FECACA' : metrics.sectionsCount === 0 ? '#BFDBFE' : '#BBF7D0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: metrics.changesCount > 0 ? '#DC2626' : metrics.sectionsCount === 0 ? '#2563EB' : '#059669',
                      flexShrink: 0
                    }}
                  >
                    {metrics.changesCount > 0 ? <AlertTriangle size={20} /> : metrics.sectionsCount === 0 ? <Plus size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                      Next Action Required
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: 2 }}>
                      {metrics.sectionsCount === 0
                        ? 'Create your first curriculum section to structure the syllabus.'
                        : metrics.changesCount > 0
                        ? `${metrics.changesCount} lecture(s) require changes requested by Admin.`
                        : metrics.draftCount > 0
                        ? `${metrics.draftCount} draft lecture(s) ready for video upload or submission.`
                        : metrics.pendingCount > 0
                        ? `${metrics.pendingCount} lecture(s) currently under Admin editorial verification.`
                        : 'Curriculum is fully approved and ready for publication.'}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (metrics.sectionsCount === 0) setIsAddSectionOpen(true)
                    else if (metrics.changesCount > 0) setWorkspaceTab('review-status')
                    else setWorkspaceTab('curriculum')
                  }}
                  style={{ flexShrink: 0, fontWeight: 700 }}
                >
                  {metrics.sectionsCount === 0 ? '+ Add First Section' : metrics.changesCount > 0 ? 'Address Feedback' : 'Go to Curriculum'}
                </button>
              </div>

              {/* Course Information Card */}
              <div className="creator-card">
                <div className="creator-card-header">
                  <h3>Course Information</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Assigned Program Details</span>
                </div>
                <div className="creator-card-body">
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>
                      Description
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#1E293B', lineHeight: 1.5, margin: 0 }}>
                      {activeCourse.shortDescription || activeCourse.fullDescription || 'Comprehensive curriculum program designed for technical mastery.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>
                        Target Audience / Level
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
                        {activeCourse.level || 'Beginner to Intermediate'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>
                        Expected Duration
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
                        {activeCourse.duration || `${activeCourse.durationHours || 12} Hours`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 2 }}>
                        Instruction Language
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
                        {activeCourse.language || 'English'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Instructions Card */}
              <div className="creator-card">
                <div className="creator-card-header">
                  <h3>Admin Production Guidelines & Instructions</h3>
                  <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700, background: '#EFF6FF', padding: '2px 8px', borderRadius: 4 }}>
                    Quality SOP
                  </span>
                </div>
                <div className="creator-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', flexShrink: 0 }}>
                        1
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Section / Playlist Structure</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                          Organize lessons into modular sections (5-10 lectures per section). Every section must represent a single conceptual milestone.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', flexShrink: 0 }}>
                        2
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Video Quality & Duration</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                          Standard 1080p resolution (minimum 30fps) with clear narration and normalized audio. Optimal duration per lecture is 10 to 25 minutes.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', flexShrink: 0 }}>
                        3
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Verification & Publication Flow</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>
                          Save lectures as Draft until fully recorded. Use "Submit for Review" when complete. An Administrator will verify content quality prior to student availability.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 30%: Progress Summary & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="creator-card">
                <div className="creator-card-header">
                  <h3>Production Summary</h3>
                </div>
                <div className="creator-card-body" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Curriculum Sections</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{metrics.sectionsCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Total Lectures</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>{metrics.lessonsCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Drafts</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>{metrics.draftCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Pending Review</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: metrics.pendingCount > 0 ? '#D97706' : '#64748B' }}>
                        {metrics.pendingCount}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Changes Requested</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: metrics.changesCount > 0 ? '#DC2626' : '#64748B' }}>
                        {metrics.changesCount}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Approved Content</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>{metrics.approvedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="creator-card">
                <div className="creator-card-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="creator-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsAddSectionOpen(true)}
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                  >
                    <Plus size={15} />
                    <span>Add Section</span>
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={sections.length === 0}
                    onClick={() => handleOpenLectureModal('create', sections[0])}
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                  >
                    <FileVideo size={15} />
                    <span>Add Lecture to Section</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE TAB 2: CURRICULUM BUILDER */}
        {workspaceTab === 'curriculum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Toolbar for Curriculum Builder */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '16px 20px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Curriculum Builder
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '3px 0 0 0' }}>
                  Build and organize your course sections, lectures, and video content.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddSectionOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
              >
                <Plus size={14} />
                <span>Add Section</span>
              </button>
            </div>

            {/* Hierarchical Curriculum Sections Tree */}
            {sections.length === 0 ? (
              <div className="creator-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Layers size={36} style={{ color: '#94A3B8', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  No Curriculum Sections Yet
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: 400, margin: '0 auto 16px auto' }}>
                  Create your first section (e.g. Introduction to Data Science) to begin structuring lectures.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsAddSectionOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto', background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
                >
                  <Plus size={14} />
                  <span>Add First Section</span>
                </button>
              </div>
            ) : (
              <div className="curriculum-tree" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {sections
                  .slice()
                  .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                  .map((section, sIdx) => {
                    const sectionLessons = (section.lessons || []).slice().sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                    const { num, displayTitle } = formatSectionDisplay(section, sIdx)

                    return (
                      <div key={section.id} className="curriculum-section-block" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                        {/* Section Header */}
                        <div className="curriculum-section-head" style={{ padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <button
                                className="btn-ghost"
                                disabled={sIdx === 0}
                                onClick={() => handleReorderSection(section, 'up')}
                                style={{ padding: 2, height: 16, lineHeight: 1 }}
                                title="Move Section Up"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                className="btn-ghost"
                                disabled={sIdx === sections.length - 1}
                                onClick={() => handleReorderSection(section, 'down')}
                                style={{ padding: 2, height: 16, lineHeight: 1 }}
                                title="Move Section Down"
                              >
                                <ChevronDown size={13} />
                              </button>
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.04em', minWidth: 24 }}>
                              {num}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                                {displayTitle}
                              </h4>
                              {section.description && (
                                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {section.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginRight: 4 }}>
                              {sectionLessons.length} {sectionLessons.length === 1 ? 'lecture' : 'lectures'}
                            </span>
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => handleOpenLectureModal('create', section)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#0F172A', borderColor: '#CBD5E1' }}
                            >
                              <Plus size={12} />
                              <span>Add Lecture</span>
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setRenameSectionModal({ isOpen: true, section, title: section.title, desc: section.description || '' })}
                              title="Edit Section"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#475569' }}
                            >
                              <Pencil size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setDeleteSectionModal({ isOpen: true, section })}
                              title="Delete Section"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EF4444' }}
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Nested Lectures List */}
                        <div className="curriculum-lectures-list" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {sectionLessons.length === 0 ? (
                            /* Compact Empty Section State */
                            <div style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: 6, border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                                <span style={{ fontWeight: 600, color: '#334155' }}>Section {sIdx + 1} — {displayTitle}</span>
                                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 2 }}>
                                  No lectures yet. Add your first lecture to this section.
                                </div>
                              </div>
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => handleOpenLectureModal('create', section)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A', flexShrink: 0 }}
                              >
                                <Plus size={12} />
                                <span>Add Lecture</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              {sectionLessons.map((lesson, lIdx) => {
                                const hasVideo = Boolean((lesson.videoUrl && lesson.videoUrl.trim()) || lesson.s3Key)
                                const isIncomplete = lesson.status === 'INCOMPLETE' || !hasVideo

                                return (
                                  <div
                                    key={lesson.id}
                                    className="curriculum-lecture-item"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '10px 14px',
                                      background: isIncomplete ? '#FFFDF5' : '#FAFAFC',
                                      border: isIncomplete ? '1px solid #FEF3C7' : '1px solid #F1F5F9',
                                      borderRadius: 6,
                                      gap: 12
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', width: 20, textAlign: 'center', flexShrink: 0 }}>
                                        {lIdx + 1}.
                                      </span>
                                      <div
                                        style={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: 6,
                                          background: hasVideo ? '#EFF6FF' : '#FEF3C7',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: hasVideo ? '#2563EB' : '#D97706',
                                          flexShrink: 0
                                        }}
                                      >
                                        {hasVideo ? <Play size={13} fill="#2563EB" color="#2563EB" /> : <AlertCircle size={14} />}
                                      </div>
                                      <div style={{ minWidth: 0 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {lesson.title}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>
                                          {hasVideo ? (
                                            <>
                                              <span>{lesson.duration || 'Video uploaded'}</span>
                                              {lesson.s3Key && <span style={{ color: '#059669' }}>• Cloud Asset</span>}
                                            </>
                                          ) : (
                                            <span style={{ color: '#D97706', fontWeight: 600 }}>Video not uploaded</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                      {renderStatusBadge(isIncomplete ? 'INCOMPLETE' : lesson.status)}

                                      {/* Preview Button only if playable video exists */}
                                      {hasVideo && lesson.videoUrl && (
                                        <button
                                          className="btn btn-outline btn-xs"
                                          onClick={() => setPreviewVideo({ isOpen: true, videoUrl: lesson.videoUrl, title: lesson.title, course: activeCourse.title })}
                                          title="Preview Lecture Video"
                                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                        >
                                          <Play size={11} />
                                          <span>Preview</span>
                                        </button>
                                      )}

                                      {/* Edit / Continue Editing Action */}
                                      <button
                                        className="btn btn-outline btn-xs"
                                        onClick={() => handleOpenLectureModal('edit', section, lesson)}
                                        title={isIncomplete ? 'Upload video to complete lecture' : 'Edit Lecture Details'}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                      >
                                        <Pencil size={11} />
                                        <span>{isIncomplete ? 'Continue Editing' : 'Edit'}</span>
                                      </button>

                                      {/* Submit for Review Button (Only if valid video uploaded and in editable state) */}
                                      {hasVideo && (lesson.status === 'DRAFT' || lesson.status === 'UPLOADED' || lesson.status === 'RETURNED_FOR_EDIT') && (
                                        <button
                                          className="btn btn-primary btn-xs"
                                          onClick={() => handleSubmitForReviewDirect(lesson)}
                                          title="Submit for Admin Review"
                                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
                                        >
                                          <Send size={11} />
                                          <span>Submit</span>
                                        </button>
                                      )}

                                      {/* Delete action */}
                                      {lesson.status !== 'PUBLISHED' && lesson.status !== 'APPROVED' && (
                                        <button
                                          className="btn btn-ghost btn-xs"
                                          onClick={() => setDeleteLessonModal({ isOpen: true, lesson })}
                                          title="Delete Lecture"
                                          style={{ color: '#EF4444' }}
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* WORKSPACE TAB 3: LECTURES LIST VIEW */}
        {workspaceTab === 'lectures' && (
          <div className="creator-card">
            <div className="creator-card-header">
              <h3>All Course Lectures ({metrics.lessonsCount})</h3>
              <button
                className="btn btn-primary btn-sm"
                disabled={sections.length === 0}
                onClick={() => handleOpenLectureModal('create', sections[0])}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
              >
                <Plus size={13} />
                <span>Add Lecture</span>
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Lecture Title</th>
                    <th style={{ padding: '12px 14px' }}>Section / Playlist</th>
                    <th style={{ padding: '12px 14px' }}>Duration</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px' }}>Admin Feedback</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.flatMap((s) => (s.lessons || []).map((l) => ({ ...l, sectionTitle: s.title, section: s }))).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                        No lectures found in this course. Create sections and add lectures to build your curriculum.
                      </td>
                    </tr>
                  ) : (
                    sections.flatMap((s) => (s.lessons || []).map((l) => ({ ...l, sectionTitle: s.title, section: s }))).map((lec) => {
                      const hasVideo = Boolean((lec.videoUrl && lec.videoUrl.trim()) || lec.s3Key)
                      const isIncomplete = lec.status === 'INCOMPLETE' || !hasVideo

                      return (
                        <tr key={lec.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {hasVideo ? (
                                <FileVideo size={16} color="#2563EB" />
                              ) : (
                                <AlertCircle size={16} color="#D97706" />
                              )}
                              <span>{lec.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {lec.sectionTitle}
                          </td>
                          <td style={{ padding: '12px 14px', color: hasVideo ? '#64748B' : '#D97706', fontSize: '0.8rem', fontWeight: hasVideo ? 500 : 600 }}>
                            {hasVideo ? (lec.duration || 'Uploaded') : 'No video'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {renderStatusBadge(isIncomplete ? 'INCOMPLETE' : lec.status)}
                          </td>
                          <td style={{ padding: '12px 14px', maxWidth: 220 }}>
                            {lec.adminFeedback ? (
                              <span style={{ fontSize: '0.78rem', color: '#DC2626' }}>{lec.adminFeedback}</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              {hasVideo && lec.videoUrl && (
                                <button
                                  className="btn btn-outline btn-xs"
                                  onClick={() => setPreviewVideo({ isOpen: true, videoUrl: lec.videoUrl, title: lec.title, course: activeCourse.title })}
                                >
                                  Preview
                                </button>
                              )}
                              <button
                                className="btn btn-outline btn-xs"
                                onClick={() => handleOpenLectureModal('edit', lec.section, lec)}
                              >
                                {isIncomplete ? 'Continue Editing' : 'Edit'}
                              </button>
                              {hasVideo && (lec.status === 'DRAFT' || lec.status === 'UPLOADED' || lec.status === 'RETURNED_FOR_EDIT') && (
                                <button
                                  className="btn btn-primary btn-xs"
                                  onClick={() => handleSubmitForReviewDirect(lec)}
                                  style={{ background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}
                                >
                                  Submit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WORKSPACE TAB 4: REVIEW STATUS */}
        {workspaceTab === 'review-status' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Visual Stepper */}
            <div className="review-stepper">
              <div className="review-step completed">
                <div className="review-step-circle">1</div>
                <span>Draft</span>
              </div>
              <div className="review-step-arrow">→</div>
              <div className={`review-step ${metrics.pendingCount > 0 ? 'active' : 'completed'}`}>
                <div className="review-step-circle">2</div>
                <span>Submitted</span>
              </div>
              <div className="review-step-arrow">→</div>
              <div className={`review-step ${metrics.pendingCount > 0 ? 'active' : metrics.approvedCount > 0 ? 'completed' : ''}`}>
                <div className="review-step-circle">3</div>
                <span>Under Review</span>
              </div>
              <div className="review-step-arrow">→</div>
              <div className={`review-step ${metrics.approvedCount === metrics.lessonsCount && metrics.lessonsCount > 0 ? 'completed' : metrics.changesCount > 0 ? 'active' : ''}`}>
                <div className="review-step-circle">4</div>
                <span>{metrics.changesCount > 0 ? 'Changes Requested' : 'Approved'}</span>
              </div>
            </div>

            {/* List of reviewed or pending lectures in this course */}
            <div className="creator-card">
              <div className="creator-card-header">
                <h3>Verification & Review Queue</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Real-time admin review status for this course</span>
              </div>
              <div className="creator-card-body">
                {sections.flatMap((s) => (s.lessons || []).map((l) => ({ ...l, sectionTitle: s.title, section: s }))).filter((l) => l.status !== 'DRAFT').length === 0 ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
                    <Clock size={36} style={{ color: '#CBD5E1', margin: '0 auto 12px auto' }} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      No lectures have been submitted for review yet in this course.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {sections
                      .flatMap((s) => (s.lessons || []).map((l) => ({ ...l, sectionTitle: s.title, section: s })))
                      .filter((l) => l.status !== 'DRAFT')
                      .map((lec) => (
                        <div
                          key={lec.id}
                          style={{
                            padding: '16px 20px',
                            borderRadius: 8,
                            background: lec.status === 'RETURNED_FOR_EDIT' ? '#FEF2F2' : '#FFFFFF',
                            border: `1px solid ${lec.status === 'RETURNED_FOR_EDIT' ? '#FCA5A5' : '#E2E8F0'}`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{lec.title}</span>
                              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>in {lec.sectionTitle}</span>
                            </div>
                            {renderStatusBadge(lec.status)}
                          </div>

                          {lec.adminFeedback && (
                            <div
                              style={{
                                padding: '12px 14px',
                                background: '#FFFFFF',
                                border: '1px solid #FECACA',
                                borderRadius: 6,
                                margin: '8px 0',
                                fontSize: '0.82rem',
                                color: '#991B1B'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
                                <AlertTriangle size={14} /> Admin Feedback:
                              </div>
                              <p style={{ margin: 0 }}>{lec.adminFeedback}</p>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              Updated {new Date(lec.updatedAt || Date.now()).toLocaleDateString()}
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {lec.videoUrl && (
                                <button
                                  className="btn btn-outline btn-xs"
                                  onClick={() => setPreviewVideo({ isOpen: true, videoUrl: lec.videoUrl, title: lec.title, course: activeCourse.title })}
                                >
                                  Preview Video
                                </button>
                              )}
                              {lec.status === 'RETURNED_FOR_EDIT' && (
                                <>
                                  <button
                                    className="btn btn-secondary btn-xs"
                                    onClick={() => handleOpenLectureModal('edit', lec.section, lec)}
                                  >
                                    Edit Content
                                  </button>
                                  <button
                                    className="btn btn-primary btn-xs"
                                    onClick={() => handleSubmitForReviewDirect(lec.id)}
                                  >
                                    Resubmit for Review
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==================================================
  // 4. CONTENT LIBRARY VIEW
  // ==================================================
  const renderContentLibraryView = () => {
    // Flatten all lectures across assigned courses
    const allContent = assignedCourses.flatMap((course) =>
      (course.playlists || []).flatMap((playlist) =>
        (playlist.lessons || []).map((lesson) => ({
          ...lesson,
          courseTitle: course.title,
          courseId: course.id,
          sectionTitle: playlist.title,
          sectionId: playlist.id,
          section: playlist
        }))
      )
    )

    // Filter
    const filteredContent = allContent.filter((item) => {
      if (libraryFilterCourse !== 'ALL' && item.courseId !== libraryFilterCourse) return false
      if (libraryFilterStatus !== 'ALL' && item.status !== libraryFilterStatus) return false
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase()
        const matchesTitle = item.title?.toLowerCase().includes(q)
        const matchesCourse = item.courseTitle?.toLowerCase().includes(q)
        const matchesSection = item.sectionTitle?.toLowerCase().includes(q)
        if (!matchesTitle && !matchesCourse && !matchesSection) return false
      }
      return true
    })

    return (
      <div className="creator-container">
        <div className="creator-top-header">
          <div>
            <h1>Content Library</h1>
            <p>Master directory of all video lectures, syllabus modules, and course assets you have created.</p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
            {filteredContent.length} Assets Found
          </span>
        </div>

        {/* Filter Bar */}
        <div className="creator-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 240, flex: 1 }}>
              <Search size={16} style={{ color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search content by title, course, or section..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                value={libraryFilterCourse}
                onChange={(e) => setLibraryFilterCourse(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem', background: '#FFFFFF' }}
              >
                <option value="ALL">All Courses</option>
                {assignedCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>

              <select
                value={libraryFilterStatus}
                onChange={(e) => setLibraryFilterStatus(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem', background: '#FFFFFF' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="UPLOADED">Ready for Review</option>
                <option value="SUBMITTED_FOR_REVIEW">Under Review</option>
                <option value="RETURNED_FOR_EDIT">Changes Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="creator-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 18px' }}>Content</th>
                  <th style={{ padding: '12px 14px' }}>Course</th>
                  <th style={{ padding: '12px 14px' }}>Section</th>
                  <th style={{ padding: '12px 14px' }}>Type</th>
                  <th style={{ padding: '12px 14px' }}>Updated</th>
                  <th style={{ padding: '12px 14px' }}>Review Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                      No content items match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContent.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
                          Duration: {item.duration || '15:00'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 14px', color: '#334155', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.courseTitle}
                      </td>
                      <td style={{ padding: '14px 14px', color: '#475569', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.sectionTitle}
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 6px', background: '#F1F5F9', color: '#475569', borderRadius: 4 }}>
                          Video Lecture
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px', color: '#64748B', fontSize: '0.8rem' }}>
                        {new Date(item.updatedAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        {renderStatusBadge(item.status)}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {item.videoUrl && (
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => setPreviewVideo({ isOpen: true, videoUrl: item.videoUrl, title: item.title, course: item.courseTitle })}
                              title="Preview"
                            >
                              <Play size={11} style={{ marginRight: 3 }} /> Preview
                            </button>
                          )}
                          <button
                            className="btn btn-outline btn-xs"
                            disabled={item.status === 'APPROVED' || item.status === 'PUBLISHED'}
                            title={item.status === 'APPROVED' || item.status === 'PUBLISHED' ? 'Approved content cannot be edited without Admin revision request' : 'Edit Lecture'}
                            onClick={() => {
                              setActiveCourseId(item.courseId)
                              handleOpenLectureModal('edit', item.section, item)
                            }}
                          >
                            <Pencil size={11} style={{ marginRight: 3 }} /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ==================================================
  // 5. REVIEW & FEEDBACK VIEW
  // ==================================================
  const renderReviewFeedbackView = () => {
    // Filter submissions
    const filteredSubmissions = submissions.filter((sub) => {
      if (reviewFilterStatus === 'ALL') return true
      if (reviewFilterStatus === 'PENDING') return sub.status === 'SUBMITTED_FOR_REVIEW'
      if (reviewFilterStatus === 'CHANGES_REQUESTED') return sub.status === 'RETURNED_FOR_EDIT' || sub.status === 'REJECTED'
      if (reviewFilterStatus === 'APPROVED') return sub.status === 'APPROVED' || sub.status === 'PUBLISHED'
      return true
    })

    return (
      <div className="creator-container">
        <div className="creator-top-header">
          <div>
            <h1>Review & Admin Feedback</h1>
            <p>Track video verification states, review admin editorial feedback, and resubmit revised lectures.</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => loadAllData(true)}
            disabled={refreshing}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Review Timeline Visual Stepper */}
        <div className="review-stepper" style={{ marginBottom: 20 }}>
          <div className="review-step completed">
            <div className="review-step-circle">✓</div>
            <span>Draft</span>
          </div>
          <div className="review-step-arrow">→</div>
          <div className="review-step completed">
            <div className="review-step-circle">✓</div>
            <span>Submitted</span>
          </div>
          <div className="review-step-arrow">→</div>
          <div className="review-step active">
            <div className="review-step-circle">3</div>
            <span>Under Review</span>
          </div>
          <div className="review-step-arrow">→</div>
          <div className="review-step">
            <div className="review-step-circle">4</div>
            <span>Changes Requested / Approved</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'ALL', label: 'All Reviews' },
            { id: 'PENDING', label: 'Pending Review' },
            { id: 'CHANGES_REQUESTED', label: 'Changes Requested' },
            { id: 'APPROVED', label: 'Approved' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setReviewFilterStatus(pill.id)}
              className={reviewFilterStatus === pill.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              style={{ fontWeight: 700 }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Submissions & Feedback Cards */}
        <div className="creator-card">
          <div className="creator-card-body" style={{ padding: 0 }}>
            {filteredSubmissions.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                <MessageSquare size={36} style={{ color: '#CBD5E1', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  No Items in this Review Filter
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
                  Lectures submitted for Admin verification will appear here with feedback notes.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredSubmissions.map((sub, i) => {
                  const courseTitle = sub.playlist?.course?.title || 'Course'
                  const sectionTitle = sub.playlist?.title || 'Section'
                  const isChangesReq = sub.status === 'RETURNED_FOR_EDIT' || sub.status === 'REJECTED'

                  return (
                    <div
                      key={sub.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: i < filteredSubmissions.length - 1 ? '1px solid #E2E8F0' : 'none',
                        background: isChangesReq ? '#FEF2F2' : '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                            {sub.title}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            {courseTitle} • {sectionTitle}
                          </div>
                        </div>
                        {renderStatusBadge(sub.status)}
                      </div>

                      {/* Admin Feedback Box */}
                      {sub.adminFeedback && (
                        <div
                          style={{
                            padding: '14px 18px',
                            background: '#FFFFFF',
                            border: '1px solid #FECACA',
                            borderRadius: 8,
                            margin: '12px 0',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>
                            <AlertTriangle size={15} />
                            <span>Admin Feedback Note:</span>
                          </div>
                          <p style={{ margin: 0, color: '#7F1D1D', lineHeight: 1.5 }}>
                            "{sub.adminFeedback}"
                          </p>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 6 }}>
                            Requested On: {new Date(sub.updatedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: isChangesReq ? '1px solid #FEE2E2' : '1px solid #F8FAFC' }}>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                          Submitted: {new Date(sub.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {sub.videoUrl && (
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => setPreviewVideo({ isOpen: true, videoUrl: sub.videoUrl, title: sub.title, course: courseTitle })}
                            >
                              <Play size={12} style={{ marginRight: 4 }} /> Preview Video
                            </button>
                          )}
                          {isChangesReq && (
                            <>
                              <button
                                className="btn btn-secondary btn-xs"
                                onClick={() => {
                                  const course = assignedCourses.find((c) => c.id === sub.playlist?.courseId)
                                  if (course) {
                                    setActiveCourseId(course.id)
                                    handleOpenLectureModal('edit', sub.playlist, sub)
                                  } else {
                                    showToast('Opening lecture editor...', 'info')
                                    handleOpenLectureModal('edit', sub.playlist, sub)
                                  }
                                }}
                              >
                                Edit Content
                              </button>
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => handleSubmitForReviewDirect(sub.id)}
                              >
                                Resubmit for Review
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==================================================
  // 6. PROFILE VIEW (with in-page Change Request Status)
  // ==================================================
  const renderProfileView = () => {
    const profileRequests = creatorProfile?.requests || []

    const getRequestTypeInfo = (type) => {
      switch (type) {
        case 'EMAIL_CHANGE':
          return { label: 'Email Address', icon: Mail, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' }
        case 'PASSWORD_CHANGE':
          return { label: 'Password Change', icon: Lock, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' }
        case 'PROFILE_PHOTO':
          return { label: 'Profile Photo', icon: Users, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' }
        case 'NAME':
          return { label: 'Display Name', icon: User, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' }
        case 'SPECIALIZATION':
          return { label: 'Specialization', icon: GraduationCap, color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' }
        case 'HEADLINE':
        case 'BIOGRAPHY':
        case 'PROFILE_DATA':
        default:
          return { label: 'Headline & Biography', icon: FileText, color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' }
      }
    }

    return (
      <div className="creator-container" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
        {/* Top Header */}
        <div className="creator-top-header" style={{ marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Creator Profile & Account
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Manage your personal credentials, public accreditation details, and submit verified change requests.
            </p>
          </div>
        </div>

        {/* ==================================================
            1. PERSONAL INFORMATION
        ================================================== */}
        <div className="creator-card" style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <div className="creator-card-header" style={{ padding: '16px 22px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} style={{ color: '#2563EB' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>PERSONAL INFORMATION</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Live Platform Credentials
            </span>
          </div>
          <div className="creator-card-body" style={{ padding: '22px' }}>
            {/* Top row: Avatar, Name, Email, Role */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22, flexWrap: 'wrap' }}>
              {/* Profile Photo */}
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--color-secondary, #2563EB)',
                  color: '#FFFFFF',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  border: '3px solid #EFF6FF'
                }}
              >
                {currentCreator?.avatar ? (
                  <img
                    src={currentCreator.avatar}
                    alt={currentCreator?.name || 'Creator'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  currentCreator?.name?.charAt(0)?.toUpperCase() || 'C'
                )}
              </div>

              {/* Name & Email & Role */}
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {currentCreator?.name || 'Creator'}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #DBEAFE'
                    }}
                  >
                    Role: Course Creator & Instructor
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Mail size={14} style={{ color: '#64748B' }} />
                  <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>
                    {currentCreator?.email || 'creator@apexlearn.com'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#16A34A', background: '#DCFCE7', padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginLeft: 4 }}>
                    Active Login Email
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0 0 0' }}>
                  Until any requested email or password changes are approved and completed, your current credentials remain active.
                </p>
              </div>
            </div>

            {/* Grid: Specialization, Headline, Biography */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, paddingTop: 18, borderTop: '1px solid #F1F5F9' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Specialization
                </label>
                <div style={{ fontSize: '0.92rem', color: '#0F172A', marginTop: 4, fontWeight: 600 }}>
                  {creatorProfile?.specialization || 'Technical Instructor'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Headline
                </label>
                <div style={{ fontSize: '0.92rem', color: '#0F172A', marginTop: 4, fontWeight: 600 }}>
                  {creatorProfile?.headline || 'Senior Curriculum Author & Tech Lead'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Biography
              </label>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, marginTop: 6, margin: '6px 0 0 0' }}>
                {creatorProfile?.biography || 'No biography recorded on profile.'}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            2. PROFILE CHANGE REQUESTS
        ================================================== */}
        <div className="creator-card" style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <div className="creator-card-header" style={{ padding: '16px 22px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} style={{ color: '#D97706' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>PROFILE CHANGE REQUESTS</h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#B45309', background: '#FEF3C7', padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>
              Requires Admin Approval
            </span>
          </div>

          <div className="creator-card-body" style={{ padding: '22px' }}>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 18, lineHeight: 1.5, margin: '0 0 18px 0' }}>
              Select a category to request an update. All modifications—including email, password, and public instructor bio—require Admin verification before taking effect.
            </p>

            {/* Category Selector Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { id: 'EMAIL_CHANGE', label: 'Email Address', icon: Mail },
                { id: 'PASSWORD_CHANGE', label: 'Password Change', icon: Lock },
                { id: 'PROFILE_PHOTO', label: 'Profile Photo', icon: Users },
                { id: 'NAME', label: 'Name', icon: User },
                { id: 'SPECIALIZATION', label: 'Specialization', icon: GraduationCap },
                { id: 'HEADLINE_BIO', label: 'Headline & Biography', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeReqCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveReqCategory(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: `1px solid ${isActive ? '#2563EB' : '#E2E8F0'}`,
                      background: isActive ? '#EFF6FF' : '#FFFFFF',
                      color: isActive ? '#2563EB' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* CATEGORY 1: EMAIL CHANGE */}
            {activeReqCategory === 'EMAIL_CHANGE' && (
              <form onSubmit={(e) => handleSubmitChangeRequest(e, 'EMAIL_CHANGE')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Current Email Address
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    {currentCreator?.email || 'kpmbanupriya@gmail.com'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4 }}>
                    Your current email address remains active for login until Admin approves AND you verify the new email via OTP.
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Requested New Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. banu@aivortex.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reason for Change *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Updating to official institutional/domain email address"
                    value={reqEmailReason}
                    onChange={(e) => setReqEmailReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmittingProfileReq || !reqEmail.trim() || !reqEmailReason.trim()}
                    style={{ fontWeight: 700, padding: '9px 20px' }}
                  >
                    {isSubmittingProfileReq ? 'Submitting...' : 'Submit Email Change Request'}
                  </button>
                </div>
              </form>
            )}

            {/* CATEGORY 2: PASSWORD CHANGE */}
            {activeReqCategory === 'PASSWORD_CHANGE' && (
              <form onSubmit={(e) => handleSubmitChangeRequest(e, 'PASSWORD_CHANGE')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '14px', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Lock size={16} style={{ color: '#7C3AED' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#5B21B6' }}>
                      Security Notice — Password Change Authorization
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6D28D9', margin: 0, lineHeight: 1.5 }}>
                    Admin approval is required before changing your password. For maximum security, <strong>do NOT enter any new password now</strong>.
                    Once Admin grants approval, a secure "Set New Password" button will be unlocked in your Request Status table below.
                    Admin will <strong>NEVER</strong> receive, view, or store your actual password.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Request Type
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Password Change"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem', background: '#F8FAFC', color: '#475569', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reason for Change *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Routine 90-day security rotation / Credential refresh"
                    value={reqPasswordReason}
                    onChange={(e) => setReqPasswordReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4 }}>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmittingProfileReq || !reqPasswordReason.trim()}
                    style={{ fontWeight: 700, padding: '9px 20px', background: '#7C3AED', borderColor: '#6D28D9' }}
                  >
                    {isSubmittingProfileReq ? 'Submitting...' : 'Request Password Change'}
                  </button>
                </div>
              </form>
            )}

            {/* CATEGORY 3: PROFILE PHOTO */}
            {activeReqCategory === 'PROFILE_PHOTO' && (
              <form onSubmit={(e) => handleSubmitChangeRequest(e, 'PROFILE_PHOTO')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Requested New Photo (HTTPS URL or Data URI) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://... image link or data URL"
                    value={reqPhotoUrl}
                    onChange={(e) => setReqPhotoUrl(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reason for Photo Update
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Official academic headshot refresh"
                    value={reqPhotoReason}
                    onChange={(e) => setReqPhotoReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingProfileReq || !reqPhotoUrl.trim()}
                  style={{ alignSelf: 'flex-start', fontWeight: 700, padding: '9px 20px' }}
                >
                  {isSubmittingProfileReq ? 'Submitting...' : 'Submit Photo Change Request'}
                </button>
              </form>
            )}

            {/* CATEGORY 4: NAME */}
            {activeReqCategory === 'NAME' && (
              <form onSubmit={(e) => handleSubmitChangeRequest(e, 'NAME')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>
                      Current Display Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentCreator?.name || 'Creator'}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem', background: '#F8FAFC' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Requested New Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Banu Priya"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reason for Name Change *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Legal name update or title qualification"
                    value={reqNameReason}
                    onChange={(e) => setReqNameReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingProfileReq || !reqName.trim() || !reqNameReason.trim()}
                  style={{ alignSelf: 'flex-start', fontWeight: 700, padding: '9px 20px' }}
                >
                  {isSubmittingProfileReq ? 'Submitting...' : 'Submit Name Change Request'}
                </button>
              </form>
            )}

            {/* CATEGORY 5: SPECIALIZATION */}
            {activeReqCategory === 'SPECIALIZATION' && (
              <form onSubmit={(e) => handleSubmitChangeRequest(e, 'SPECIALIZATION')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>
                      Current Specialization
                    </label>
                    <input
                      type="text"
                      disabled
                      value={creatorProfile?.specialization || 'Technical Instructor'}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem', background: '#F8FAFC' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Requested Specialization *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Systems & AI/ML Architecture"
                      value={reqSpec}
                      onChange={(e) => setReqSpec(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reason for Specialization Update
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aligning with newly assigned course curriculum"
                    value={reqSpecReason}
                    onChange={(e) => setReqSpecReason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingProfileReq || !reqSpec.trim()}
                  style={{ alignSelf: 'flex-start', fontWeight: 700, padding: '9px 20px' }}
                >
                  {isSubmittingProfileReq ? 'Submitting...' : 'Submit Specialization Change Request'}
                </button>
              </form>
            )}

            {/* CATEGORY 6: HEADLINE & BIOGRAPHY */}
            {activeReqCategory === 'HEADLINE_BIO' && (
              <form onSubmit={(e) => handleSubmitChangeRequest(e, 'HEADLINE_BIO')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Requested Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Systems Architect & Senior Cloud Computing Instructor"
                    value={profileHeadline}
                    onChange={(e) => setProfileHeadline(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Requested Biography
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide your updated professional background, published research, or degrees..."
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Supporting Portfolio / LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/... or personal portfolio"
                      value={profileSupportingUrl}
                      onChange={(e) => setProfileSupportingUrl(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Reason for Change
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual accreditation bio refresh"
                      value={profileJustification}
                      onChange={(e) => setProfileJustification(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingProfileReq || (!profileHeadline.trim() && !profileBio.trim())}
                  style={{ alignSelf: 'flex-start', fontWeight: 700, padding: '9px 20px' }}
                >
                  {isSubmittingProfileReq ? 'Submitting...' : 'Submit Profile Changes Request'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ==================================================
            3. REQUEST STATUS TABLE
        ================================================== */}
        <div className="creator-card" style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <div className="creator-card-header" style={{ padding: '16px 22px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: '#2563EB' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>REQUEST STATUS</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
              Live Audit & Action Center
            </span>
          </div>

          <div className="creator-card-body" style={{ padding: 0 }}>
            {profileRequests.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8' }}>
                <UserCheck size={36} style={{ color: '#CBD5E1', margin: '0 auto 12px auto' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569', margin: '0 0 4px 0' }}>No Change Requests Found</h4>
                <p style={{ fontSize: '0.82rem', margin: 0 }}>Use the form above to submit credential or profile modification requests.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Request Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Requested Change</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Submitted Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700 }}>Admin Response</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileRequests.map((req, i) => {
                      const typeInfo = getRequestTypeInfo(req.requestType)
                      const Icon = typeInfo.icon

                      // Build friendly representation of requested change
                      let changeDisplay = ''
                      if (req.requestType === 'EMAIL_CHANGE') {
                        changeDisplay = `${req.currentValue || currentCreator?.email} → ${req.requestedValue}`
                      } else if (req.requestType === 'PASSWORD_CHANGE') {
                        changeDisplay = 'Password Rotation Authorization'
                      } else if (req.requestType === 'NAME') {
                        changeDisplay = `${req.currentValue || currentCreator?.name} → ${req.requestedValue}`
                      } else if (req.requestType === 'PROFILE_PHOTO') {
                        changeDisplay = 'Updated Profile Photo'
                      } else if (req.requestType === 'SPECIALIZATION') {
                        changeDisplay = `Specialization: "${req.requestedValue}"`
                      } else {
                        changeDisplay = req.requestedHeadline ? `Headline: "${req.requestedHeadline}"` : (req.requestedBio ? 'Biography update' : 'Profile information')
                      }

                      const isPending = req.status === 'PENDING'
                      const isApproved = req.status === 'APPROVED'
                      const isRejected = req.status === 'REJECTED'
                      const isCompleted = req.status === 'COMPLETED'
                      const isExpired = req.status === 'EXPIRED'

                      return (
                        <tr key={req.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          {/* 1. Request Type */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  background: typeInfo.bg,
                                  color: typeInfo.color,
                                  border: `1px solid ${typeInfo.border}`,
                                  flexShrink: 0
                                }}
                              >
                                <Icon size={14} />
                              </span>
                              <span style={{ fontWeight: 700, color: '#0F172A' }}>
                                {typeInfo.label}
                              </span>
                            </div>
                          </td>

                          {/* 2. Requested Change */}
                          <td style={{ padding: '14px 16px', maxWidth: 280 }}>
                            <div style={{ fontWeight: 600, color: '#1E293B', wordBreak: 'break-word' }}>
                              {changeDisplay}
                            </div>
                            {req.reason && (
                              <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 2 }}>
                                Reason: {req.reason}
                              </div>
                            )}
                          </td>

                          {/* 3. Submitted Date */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: '#64748B', fontSize: '0.8rem' }}>
                            {new Date(req.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>

                          {/* 4. Status */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {isPending && (
                              <span className="badge badge-amber" style={{ fontWeight: 700 }}>
                                Pending Admin Approval
                              </span>
                            )}
                            {isApproved && (
                              <span className="badge badge-success" style={{ fontWeight: 700 }}>
                                Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                                Rejected
                              </span>
                            )}
                            {isCompleted && (
                              <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 700 }}>
                                Completed
                              </span>
                            )}
                            {isExpired && (
                              <span className="badge" style={{ background: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1', fontWeight: 700 }}>
                                Approval Expired
                              </span>
                            )}
                          </td>

                          {/* 5. Admin Response */}
                          <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                            {isRejected ? (
                              <div style={{ color: '#DC2626', fontSize: '0.78rem', background: '#FEF2F2', padding: '4px 8px', borderRadius: 4, border: '1px solid #FCA5A5' }}>
                                <strong>Reason:</strong> {req.rejectionReason || req.adminNote || 'No explanation provided'}
                              </div>
                            ) : req.adminNote ? (
                              <div style={{ color: '#475569', fontSize: '0.78rem', background: '#F8FAFC', padding: '4px 8px', borderRadius: 4 }}>
                                {req.adminNote}
                              </div>
                            ) : isPending ? (
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Awaiting Admin review</span>
                            ) : isApproved && req.requestType === 'PASSWORD_CHANGE' ? (
                              <span style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>Approved (Valid for 24h)</span>
                            ) : isApproved && req.requestType === 'EMAIL_CHANGE' ? (
                              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Approved (OTP sent to new email)</span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>-</span>
                            )}
                          </td>

                          {/* 6. Action */}
                          <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {/* Action for Approved Email Change: Verify Email */}
                            {req.requestType === 'EMAIL_CHANGE' && isApproved && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => {
                                  setActiveEmailReq(req)
                                  setEmailOtpInput('')
                                  setVerifyEmailModalOpen(true)
                                }}
                                style={{
                                  background: '#16A34A',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  padding: '5px 12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <CheckCircle2 size={13} />
                                <span>Verify Email</span>
                              </button>
                            )}

                            {/* Action for Approved Password Change: Set New Password */}
                            {req.requestType === 'PASSWORD_CHANGE' && isApproved && (
                              <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => {
                                  setActivePasswordReq(req)
                                  setCurrPasswordInput('')
                                  setNewPasswordInput('')
                                  setConfirmPasswordInput('')
                                  setSetPasswordModalOpen(true)
                                }}
                                style={{
                                  background: '#7C3AED',
                                  color: '#FFFFFF',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  padding: '5px 12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <Key size={13} />
                                <span>Set New Password</span>
                              </button>
                            )}

                            {/* Pending State */}
                            {isPending && (
                              <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> Waiting for Admin
                              </span>
                            )}

                            {/* Completed State */}
                            {isCompleted && (
                              <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Check size={13} /> Completed
                              </span>
                            )}

                            {/* Rejected State */}
                            {isRejected && (
                              <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 700 }}>
                                Declined
                              </span>
                            )}

                            {/* Expired State */}
                            {isExpired && (
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => setActiveReqCategory(req.requestType === 'PASSWORD_CHANGE' ? 'PASSWORD_CHANGE' : 'EMAIL_CHANGE')}
                                style={{ fontSize: '0.72rem' }}
                              >
                                Request Again
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==================================================
  // PROCESS UI VIEW 1: ANALYTICS
  // ==================================================
  const renderAnalyticsView = () => {
    const timeframeOptions = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time']

    const recentActivity = [
      {
        date: 'Jul 29, 2024',
        course: 'KAR-101: Data Science',
        activity: 'Lecture 3.2 submitted',
        status: 'Pending Review',
        statusType: 'warning'
      },
      {
        date: 'Jul 28, 2024',
        course: 'KAR-101: Data Science',
        activity: 'Lecture 2.4 approved',
        status: 'Approved',
        statusType: 'success'
      },
      {
        date: 'Jul 27, 2024',
        course: 'GEN-201: Machine Learning',
        activity: 'Lecture 1.1 updated',
        status: 'Changes Requested',
        statusType: 'danger'
      },
      {
        date: 'Jul 25, 2024',
        course: 'AI-301: Deep Learning',
        activity: 'Section 4 completed',
        status: 'Approved',
        statusType: 'success'
      },
      {
        date: 'Jul 23, 2024',
        course: 'GEN-201: Machine Learning',
        activity: 'Lecture 3.3 submitted',
        status: 'Pending Review',
        statusType: 'warning'
      }
    ]

    const progressTimeline = [
      { label: 'Jul 1', approved: 12, pending: 6, changes: 2 },
      { label: 'Jul 8', approved: 18, pending: 10, changes: 3 },
      { label: 'Jul 15', approved: 24, pending: 8, changes: 4 },
      { label: 'Jul 22', approved: 28, pending: 12, changes: 3 },
      { label: 'Jul 29', approved: 32, pending: 6, changes: 4 }
    ]

    return (
      <div className="creator-container" style={{ padding: '0 4px 40px 4px' }}>
        {/* Top Header */}
        <div className="creator-view-header">
          <div>
            <h1 className="creator-view-header-title">Analytics</h1>
            <p className="creator-view-header-sub">Track your content progress, review status and overall performance.</p>
          </div>
          <div className="creator-timeframe-dropdown">
            <button
              type="button"
              className="creator-timeframe-btn"
              onClick={() => setAnalyticsTimeframeOpen(!analyticsTimeframeOpen)}
            >
              <Calendar size={15} style={{ color: '#2563EB' }} />
              <span>{analyticsTimeframe}</span>
              <ChevronDown size={14} style={{ color: '#64748B' }} />
            </button>
            {analyticsTimeframeOpen && (
              <div className="creator-dropdown-menu">
                {timeframeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`creator-dropdown-item ${analyticsTimeframe === opt ? 'active' : ''}`}
                    onClick={() => {
                      setAnalyticsTimeframe(opt)
                      setAnalyticsTimeframeOpen(false)
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6 Metric KPI Cards */}
        <div className="creator-analytics-grid">
          {/* Card 1: Total Courses Assigned */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Total Courses Assigned</div>
            <div className="creator-stat-value">5</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill up">
                <TrendingUp size={12} /> 25%
              </span>
              <span>+1 from last month</span>
            </div>
          </div>

          {/* Card 2: Total Sections */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <FileText size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Total Sections</div>
            <div className="creator-stat-value">18</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill up">
                <TrendingUp size={12} /> 12%
              </span>
              <span>+2 from last month</span>
            </div>
          </div>

          {/* Card 3: Total Lectures */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Play size={20} fill="#2563EB" />
              </div>
            </div>
            <div className="creator-stat-label">Total Lectures</div>
            <div className="creator-stat-value">42</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill up">
                <TrendingUp size={12} /> 20%
              </span>
              <span>+7 from last month</span>
            </div>
          </div>

          {/* Card 4: Pending Review */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C' }}>
                <Clock size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Pending Review</div>
            <div className="creator-stat-value">6</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill down">
                <TrendingDown size={12} /> 14%
              </span>
              <span>-3 from last month</span>
            </div>
          </div>

          {/* Card 5: Approved Lectures */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Approved Lectures</div>
            <div className="creator-stat-value">32</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill up">
                <TrendingUp size={12} /> 28%
              </span>
              <span>+7 from last month</span>
            </div>
          </div>

          {/* Card 6: Changes Requested */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Changes Requested</div>
            <div className="creator-stat-value">4</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill down" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                <TrendingUp size={12} /> 33%
              </span>
              <span>-2 from last month</span>
            </div>
          </div>
        </div>

        {/* Overall Completion Rate Card */}
        <div className="creator-completion-card">
          <div className="creator-radial-wrap">
            <svg width="76" height="76" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#E2E8F0"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="#2563EB"
                strokeWidth="7"
                strokeDasharray="201.06"
                strokeDashoffset="48.25"
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="creator-radial-val">76%</div>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
              Course content completion
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: 10 }}>
              You've completed 32 of 42 lectures
            </div>
            <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ width: '76%', height: '100%', background: '#2563EB', borderRadius: 9999 }} />
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16A34A', fontWeight: 800, fontSize: '1rem' }}>
              <TrendingUp size={16} /> 12%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>
              from last month
            </div>
          </div>
        </div>

        {/* Two-Column Charts: Content Progress Over Time & Lecture Status Breakdown */}
        <div className="creator-charts-two-col">
          {/* Left: Content Progress Over Time Grouped Bar Chart */}
          <div className="creator-chart-card">
            <div className="creator-chart-card-head">
              <h2 className="creator-chart-card-title">Content Progress Over Time</h2>
              <div className="creator-timeframe-dropdown">
                <button
                  type="button"
                  className="creator-timeframe-btn"
                  onClick={() => setContentProgressTimeframeOpen(!contentProgressTimeframeOpen)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <span>{contentProgressTimeframe}</span>
                  <ChevronDown size={12} />
                </button>
                {contentProgressTimeframeOpen && (
                  <div className="creator-dropdown-menu">
                    {timeframeOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="creator-dropdown-item"
                        onClick={() => {
                          setContentProgressTimeframe(opt)
                          setContentProgressTimeframeOpen(false)
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, fontSize: '0.75rem', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
                <span>Approved</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#93C5FD' }} />
                <span>Pending Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
                <span>Changes Requested</span>
              </div>
            </div>

            {/* Grouped Bar Chart Visualization */}
            <div style={{ position: 'relative', height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 30, paddingBottom: 24, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, width: 25, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8', textAlign: 'right' }}>
                <span>40</span>
                <span>30</span>
                <span>20</span>
                <span>10</span>
                <span>0</span>
              </div>

              <div style={{ position: 'absolute', left: 30, right: 0, top: 0, height: 1, borderTop: '1px dashed #F1F5F9' }} />
              <div style={{ position: 'absolute', left: 30, right: 0, top: '25%', height: 1, borderTop: '1px dashed #F1F5F9' }} />
              <div style={{ position: 'absolute', left: 30, right: 0, top: '50%', height: 1, borderTop: '1px dashed #F1F5F9' }} />
              <div style={{ position: 'absolute', left: 30, right: 0, top: '75%', height: 1, borderTop: '1px dashed #F1F5F9' }} />

              {progressTimeline.map((item) => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 150 }}>
                    <div
                      title={`Approved: ${item.approved}`}
                      style={{
                        width: 10,
                        height: `${(item.approved / 40) * 100}%`,
                        background: '#3B82F6',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    <div
                      title={`Pending Review: ${item.pending}`}
                      style={{
                        width: 10,
                        height: `${(item.pending / 40) * 100}%`,
                        background: '#93C5FD',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    <div
                      title={`Changes Requested: ${item.changes}`}
                      style={{
                        width: 10,
                        height: `${(item.changes / 40) * 100}%`,
                        background: '#F97316',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Lecture Status Breakdown Donut Chart */}
          <div className="creator-chart-card">
            <div className="creator-chart-card-head">
              <h2 className="creator-chart-card-title">Lecture Status Breakdown</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 0' }}>
              <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="140" height="140" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    stroke="#F97316"
                    strokeWidth="20"
                    strokeDasharray="32.67 294.05"
                    strokeDashoffset="-294.05"
                    fill="none"
                    transform="rotate(-90 80 80)"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    stroke="#60A5FA"
                    strokeWidth="20"
                    strokeDasharray="45.74 280.98"
                    strokeDashoffset="-248.31"
                    fill="none"
                    transform="rotate(-90 80 80)"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    stroke="#2563EB"
                    strokeWidth="20"
                    strokeDasharray="248.31 78.41"
                    strokeDashoffset="0"
                    fill="none"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>42</div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', marginTop: 3 }}>Total Lectures</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563EB', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>Approved</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>32 (76%)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#60A5FA', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>Pending Review</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>6 (14%)</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#F97316', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>Changes Requested</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>4 (10%)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Course Activity Table */}
        <div className="creator-card">
          <div className="creator-card-header">
            <h3>Recent Course Activity</h3>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}>
              View All
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Course</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Activity</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>{row.date}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#0F172A', fontWeight: 600 }}>{row.course}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#334155' }}>{row.activity}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: row.statusType === 'success' ? '#DCFCE7' : row.statusType === 'danger' ? '#FEE2E2' : '#FEF3C7',
                          color: row.statusType === 'success' ? '#16A34A' : row.statusType === 'danger' ? '#DC2626' : '#D97706'
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ==================================================
  // PROCESS UI VIEW 2: EARNINGS
  // ==================================================
  const renderEarningsView = () => {
    const timeframeOptions = ['Last 30 days', 'Last 6 months', 'Last 12 months', 'All time']

    const courseRevenues = [
      { code: 'KAR-101', name: 'Data Science', amount: 650, share: '26%' },
      { code: 'GEN-201', name: 'Machine Learning', amount: 480, share: '19%' },
      { code: 'AI-301', name: 'Deep Learning', amount: 420, share: '17%' },
      { code: 'WEB-101', name: 'Web Development', amount: 320, share: '13%' },
      { code: 'DS-101', name: 'Data Analysis', amount: 240, share: '10%' }
    ]

    const payoutHistory = [
      { date: 'Jul 15, 2024', amount: '$840', status: 'Paid', method: 'Bank Transfer (**** 4582)', ref: 'PRT789456' },
      { date: 'Jun 15, 2024', amount: '$620', status: 'Paid', method: 'Bank Transfer (**** 4582)', ref: 'PRT654321' },
      { date: 'May 15, 2024', amount: '$560', status: 'Paid', method: 'Bank Transfer (**** 4582)', ref: 'PRT987123' },
      { date: 'Apr 15, 2024', amount: '$480', status: 'Paid', method: 'Bank Transfer (**** 4582)', ref: 'PRT456789' }
    ]

    return (
      <div className="creator-container" style={{ padding: '0 4px 40px 4px' }}>
        {/* Top Header */}
        <div className="creator-view-header">
          <div>
            <h1 className="creator-view-header-title">Earnings</h1>
            <p className="creator-view-header-sub">Track your earnings, payouts and course performance.</p>
          </div>
          <div className="creator-timeframe-dropdown">
            <button
              type="button"
              className="creator-timeframe-btn"
              onClick={() => setEarningsTimeframeOpen(!earningsTimeframeOpen)}
            >
              <Calendar size={15} style={{ color: '#2563EB' }} />
              <span>{earningsTimeframe}</span>
              <ChevronDown size={14} style={{ color: '#64748B' }} />
            </button>
            {earningsTimeframeOpen && (
              <div className="creator-dropdown-menu">
                {timeframeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`creator-dropdown-item ${earningsTimeframe === opt ? 'active' : ''}`}
                    onClick={() => {
                      setEarningsTimeframe(opt)
                      setEarningsTimeframeOpen(false)
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="creator-earnings-grid">
          {/* Card 1: Total Earnings */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: '50%' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Total Earnings</div>
            <div className="creator-stat-value">$2,480</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill up">
                <TrendingUp size={12} /> 18%
              </span>
              <span>+$360 from previous period</span>
            </div>
          </div>

          {/* Card 2: This Month */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: '50%' }}>
                <Calendar size={20} />
              </div>
            </div>
            <div className="creator-stat-label">This Month</div>
            <div className="creator-stat-value">$520</div>
            <div className="creator-stat-footer">
              <span className="creator-trend-pill up">
                <TrendingUp size={12} /> 24%
              </span>
              <span>+$100 from last month</span>
            </div>
          </div>

          {/* Card 3: Pending Payout */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C', borderRadius: '50%' }}>
                <Clock size={20} />
              </div>
            </div>
            <div className="creator-stat-label">Pending Payout</div>
            <div className="creator-stat-value">$320</div>
            <div className="creator-stat-footer">
              <span>Next payout: Aug 15, 2024</span>
            </div>
          </div>

          {/* Card 4: Last Payout */}
          <div className="creator-stat-card">
            <div className="creator-stat-top">
              <div className="creator-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB', borderRadius: '50%' }}>
                <CreditCard size={20} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: '#DCFCE7', color: '#16A34A' }}>
                Paid
              </span>
            </div>
            <div className="creator-stat-label">Last Payout</div>
            <div className="creator-stat-value">$840</div>
            <div className="creator-stat-footer">
              <span>Paid on Jul 15, 2024</span>
            </div>
          </div>
        </div>

        {/* Revenue by Course Card */}
        <div className="creator-chart-card">
          <div className="creator-chart-card-head">
            <h2 className="creator-chart-card-title">Revenue by Course</h2>
            <div className="creator-timeframe-dropdown">
              <button
                type="button"
                className="creator-timeframe-btn"
                onClick={() => setRevenueCourseTimeframeOpen(!revenueCourseTimeframeOpen)}
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <span>{revenueCourseTimeframe}</span>
                <ChevronDown size={12} />
              </button>
              {revenueCourseTimeframeOpen && (
                <div className="creator-dropdown-menu">
                  {timeframeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className="creator-dropdown-item"
                      onClick={() => {
                        setRevenueCourseTimeframe(opt)
                        setRevenueCourseTimeframeOpen(false)
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ position: 'relative', height: 230, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingLeft: 40, paddingBottom: 36, borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 36, width: 35, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', textAlign: 'right' }}>
              <span>$800</span>
              <span>$600</span>
              <span>$400</span>
              <span>$200</span>
              <span>$0</span>
            </div>

            <div style={{ position: 'absolute', left: 40, right: 0, top: 0, height: 1, borderTop: '1px dashed #F1F5F9' }} />
            <div style={{ position: 'absolute', left: 40, right: 0, top: '25%', height: 1, borderTop: '1px dashed #F1F5F9' }} />
            <div style={{ position: 'absolute', left: 40, right: 0, top: '50%', height: 1, borderTop: '1px dashed #F1F5F9' }} />
            <div style={{ position: 'absolute', left: 40, right: 0, top: '75%', height: 1, borderTop: '1px dashed #F1F5F9' }} />

            {courseRevenues.map((course) => {
              const heightPercent = (course.amount / 800) * 100
              return (
                <div key={course.code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1, width: 80 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>${course.amount}</span>
                  <div
                    title={`${course.code} ${course.name}: $${course.amount}`}
                    style={{
                      width: 44,
                      height: `${heightPercent * 1.5}px`,
                      maxHeight: 150,
                      background: '#3B82F6',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease, background 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#2563EB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#3B82F6')}
                  />
                  <div style={{ textAlign: 'center', marginTop: 2 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>{course.code}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', whiteSpace: 'nowrap' }}>{course.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Two-Column: Earnings Summary & Top Performing Courses */}
        <div className="creator-charts-two-col">
          {/* Left: Earnings Summary */}
          <div className="creator-card">
            <div className="creator-card-header">
              <h3>Earnings Summary</h3>
            </div>
            <div className="creator-card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <DollarSign size={16} style={{ color: '#2563EB' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>Total Earnings</span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>$2,480</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={16} style={{ color: '#2563EB' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>This Month</span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>$520</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock size={16} style={{ color: '#EA580C' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>Pending Payout</span>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>$320</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CreditCard size={16} style={{ color: '#2563EB' }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>Last Payout</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Jul 15, 2024</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>$840</span>
                </div>

                {/* Policy Alert Notice */}
                <div
                  style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginTop: 6
                  }}
                >
                  <Info size={16} style={{ color: '#2563EB', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.78rem', color: '#1E40AF', lineHeight: 1.5 }}>
                    Payouts are processed on the 15th of each month once your balance reaches $50 or more.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Top Performing Courses */}
          <div className="creator-card">
            <div className="creator-card-header">
              <h3>Top Performing Courses</h3>
              <div className="creator-timeframe-dropdown">
                <button
                  type="button"
                  className="creator-timeframe-btn"
                  onClick={() => setTopCoursesTimeframeOpen(!topCoursesTimeframeOpen)}
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                >
                  <span>{topCoursesTimeframe}</span>
                  <ChevronDown size={11} />
                </button>
                {topCoursesTimeframeOpen && (
                  <div className="creator-dropdown-menu">
                    {timeframeOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className="creator-dropdown-item"
                        onClick={() => {
                          setTopCoursesTimeframe(opt)
                          setTopCoursesTimeframeOpen(false)
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="creator-card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {courseRevenues.map((course) => (
                  <div key={course.code} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0F172A' }}>
                        {course.code}: {course.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0F172A' }}>${course.amount}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', width: 30, textAlign: 'right' }}>{course.share}</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ width: course.share, height: '100%', background: '#3B82F6', borderRadius: 9999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payout History Table */}
        <div className="creator-card">
          <div className="creator-card-header">
            <h3>Payout History</h3>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563EB', cursor: 'pointer' }}>
              View All
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Payment Method</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#0F172A', fontWeight: 600 }}>{row.date}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#0F172A', fontWeight: 700 }}>{row.amount}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: '#DCFCE7',
                          color: '#16A34A'
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#64748B' }}>{row.method}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#64748B', fontFamily: 'monospace' }}>{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ==================================================
  // PROCESS UI VIEW 3: MESSAGES
  // ==================================================
  const renderMessagesView = () => {
    const filteredMessages = messagesList.filter((msg) => {
      if (messageTab === 'admin' && msg.category !== 'admin') return false
      if (messageTab === 'review' && msg.category !== 'review') return false
      if (messageTab === 'support' && msg.category !== 'support') return false

      if (messageSearch.trim()) {
        const query = messageSearch.toLowerCase()
        return (
          msg.subject.toLowerCase().includes(query) ||
          msg.preview.toLowerCase().includes(query) ||
          msg.sender.toLowerCase().includes(query)
        )
      }
      return true
    })

    const sortedMessages = [...filteredMessages].sort((a, b) => {
      if (messageSort === 'oldest') return a.id.localeCompare(b.id)
      return b.id.localeCompare(a.id)
    })

    const selectedMessage = messagesList.find((m) => m.id === selectedMessageId) || sortedMessages[0] || null

    const handleSendReply = () => {
      if (!replyText.trim() || !selectedMessage) return
      const newHistoryItem = {
        sender: 'You',
        timestamp: 'Just now',
        text: replyText.trim()
      }
      const updatedMessages = messagesList.map((m) => {
        if (m.id === selectedMessage.id) {
          return {
            ...m,
            history: [...(m.history || []), newHistoryItem]
          }
        }
        return m
      })
      setMessagesList(updatedMessages)
      setReplyText('')
      showToast('Reply sent successfully', 'success')
    }

    return (
      <div className="creator-container" style={{ padding: '0 4px 40px 4px' }}>
        {/* Header */}
        <div className="creator-view-header">
          <div>
            <h1 className="creator-view-header-title">Messages</h1>
            <p className="creator-view-header-sub">Stay connected with the AIVORTEX team.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsNewMessageModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              background: '#2563EB',
              color: '#FFFFFF'
            }}
          >
            <Plus size={16} />
            <span>New Message</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="creator-msg-tabs">
          <button
            type="button"
            className={`creator-msg-tab ${messageTab === 'all' ? 'active' : ''}`}
            onClick={() => setMessageTab('all')}
          >
            All (8)
          </button>
          <button
            type="button"
            className={`creator-msg-tab ${messageTab === 'admin' ? 'active' : ''}`}
            onClick={() => setMessageTab('admin')}
          >
            Admin (3)
          </button>
          <button
            type="button"
            className={`creator-msg-tab ${messageTab === 'review' ? 'active' : ''}`}
            onClick={() => setMessageTab('review')}
          >
            Review Feedback (3)
          </button>
          <button
            type="button"
            className={`creator-msg-tab ${messageTab === 'support' ? 'active' : ''}`}
            onClick={() => setMessageTab('support')}
          >
            Support (2)
          </button>
        </div>

        {/* Two-Column Messenger Layout */}
        <div className="creator-msg-split">
          {/* Left Column: Thread List */}
          <div className="creator-msg-sidebar">
            <div className="creator-msg-filter-bar">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: '0.8125rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    background: '#FFFFFF',
                    outline: 'none'
                  }}
                />
              </div>
              <select
                value={messageSort}
                onChange={(e) => setMessageSort(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.8125rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  background: '#FFFFFF',
                  color: '#475569',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            <div className="creator-msg-list">
              {sortedMessages.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
                  No messages found
                </div>
              ) : (
                sortedMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id
                  return (
                    <div
                      key={msg.id}
                      className={`creator-msg-item ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedMessageId(msg.id)}
                    >
                      <div className="creator-msg-avatar" style={{ background: msg.avatarBg }}>
                        {msg.senderInitial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{msg.sender}</span>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{msg.dateDisplay}</span>
                        </div>
                        <h4 className="creator-msg-preview-title">{msg.subject}</h4>
                        <p className="creator-msg-preview-snippet">{msg.preview}</p>
                        <span
                          className="creator-msg-badge"
                          style={{
                            background: msg.badgeBg,
                            color: msg.badgeColor
                          }}
                        >
                          {msg.badge}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Thread Details */}
          {selectedMessage ? (
            <div className="creator-msg-pane">
              {/* Message Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="creator-msg-avatar" style={{ background: selectedMessage.avatarBg, width: 42, height: 42, fontSize: '1rem' }}>
                    {selectedMessage.senderInitial}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A' }}>{selectedMessage.sender}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 1 }}>{selectedMessage.timestamp}</div>
                  </div>
                </div>
                <span
                  className="creator-msg-badge"
                  style={{
                    background: selectedMessage.badgeBg,
                    color: selectedMessage.badgeColor,
                    padding: '4px 12px',
                    fontSize: '0.75rem'
                  }}
                >
                  {selectedMessage.badge}
                </span>
              </div>

              {/* Message Title */}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '20px 0 14px 0' }}>
                {selectedMessage.subject}
              </h2>

              {/* Message Body */}
              <div style={{ fontSize: '0.875rem', lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line', marginBottom: 20 }}>
                {selectedMessage.body}
              </div>

              {/* Attached Course/Lecture Card (if present) */}
              {selectedMessage.courseCard && (
                <div className="creator-course-badge-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 6,
                        background: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#60A5FA'
                      }}
                    >
                      <Play size={18} fill="#60A5FA" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        {selectedMessage.courseCard.code}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                        {selectedMessage.courseCard.lecture}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 9999,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: selectedMessage.courseCard.status === 'Approved' ? '#DCFCE7' : selectedMessage.courseCard.status === 'Changes Requested' ? '#FEE2E2' : '#EFF6FF',
                      color: selectedMessage.courseCard.status === 'Approved' ? '#16A34A' : selectedMessage.courseCard.status === 'Changes Requested' ? '#DC2626' : '#2563EB'
                    }}
                  >
                    {selectedMessage.courseCard.status}
                  </span>
                </div>
              )}

              {/* Collapsible Previous Messages */}
              {selectedMessage.history && selectedMessage.history.length > 0 && (
                <div style={{ marginTop: 'auto', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }}>
                    <button
                      type="button"
                      onClick={() => setShowThreadHistory(!showThreadHistory)}
                      style={{
                        background: '#F1F5F9',
                        border: 'none',
                        borderRadius: 9999,
                        padding: '4px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748B',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>{selectedMessage.history.length} previous messages</span>
                      {showThreadHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {showThreadHistory && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedMessage.history.map((msg, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            background: msg.sender === 'You' ? '#EFF6FF' : '#F8FAFC',
                            border: `1px solid ${msg.sender === 'You' ? '#BFDBFE' : '#E2E8F0'}`,
                            alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: msg.sender === 'You' ? '#1E40AF' : '#0F172A' }}>
                              {msg.sender}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{msg.timestamp}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#334155' }}>{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reply Box */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 'auto',
                  background: '#FFFFFF'
                }}
              >
                <textarea
                  rows={2}
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748B' }}>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }} title="Attach file">
                      <Paperclip size={16} />
                    </button>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }} title="Insert emoji">
                      <Smile size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    style={{
                      background: replyText.trim() ? '#2563EB' : '#94A3B8',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>Send</span>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="creator-msg-pane" style={{ alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <MessageSquare size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==================================================
  // MODAL: NEW MESSAGE COMPOSER
  // ==================================================
  const renderNewMessageModal = () => {
    if (!isNewMessageModalOpen) return null

    const handleCreateMessage = (e) => {
      e.preventDefault()
      if (!newMessageSubject.trim() || !newMessageBody.trim()) {
        showToast('Please provide both subject and message body', 'warning')
        return
      }
      setIsSendingMessage(true)
      setTimeout(() => {
        const newMsgId = `msg-${Date.now()}`
        const initial = newMessageRecipient.includes('Review') ? 'R' : newMessageRecipient.includes('Support') ? 'S' : 'A'
        const color = initial === 'R' ? '#8B5CF6' : initial === 'S' ? '#6366F1' : '#2563EB'
        const categoryKey = initial === 'R' ? 'review' : initial === 'S' ? 'support' : 'admin'

        const newMsg = {
          id: newMsgId,
          sender: newMessageRecipient,
          senderInitial: initial,
          avatarBg: color,
          dateDisplay: 'Today',
          timestamp: 'Just now',
          subject: newMessageSubject.trim(),
          badge: newMessageCategory,
          badgeType: 'info',
          badgeColor: color,
          badgeBg: '#EFF6FF',
          category: categoryKey,
          preview: newMessageBody.trim().slice(0, 75) + '...',
          body: newMessageBody.trim(),
          history: []
        }

        setMessagesList([newMsg, ...messagesList])
        setSelectedMessageId(newMsgId)
        setIsNewMessageModalOpen(false)
        setNewMessageSubject('')
        setNewMessageBody('')
        setIsSendingMessage(false)
        showToast('Message sent to ' + newMessageRecipient, 'success')
      }, 300)
    }

    return (
      <div className="modal-overlay" onClick={() => setIsNewMessageModalOpen(false)}>
        <div className="modal-dialog" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>New Message</h3>
            <button
              type="button"
              onClick={() => setIsNewMessageModalOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateMessage} style={{ padding: '20px' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Recipient
              </label>
              <select
                className="form-control"
                value={newMessageRecipient}
                onChange={(e) => setNewMessageRecipient(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              >
                <option value="AIVORTEX Admin">AIVORTEX Admin</option>
                <option value="Review Team">Review Team</option>
                <option value="Support">AIVORTEX Support</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Category
              </label>
              <select
                className="form-control"
                value={newMessageCategory}
                onChange={(e) => setNewMessageCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              >
                <option value="Course Update">Course Update</option>
                <option value="Review Feedback">Review Feedback</option>
                <option value="Support">Support Request</option>
                <option value="Earnings">Earnings & Payouts</option>
                <option value="General">General Inquiry</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Subject
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Question regarding Lecture 3.2 review"
                value={newMessageSubject}
                onChange={(e) => setNewMessageSubject(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Message
              </label>
              <textarea
                rows={4}
                className="form-control"
                placeholder="Write your message here..."
                value={newMessageBody}
                onChange={(e) => setNewMessageBody(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.875rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsNewMessageModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 6 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSendingMessage}
                style={{ padding: '8px 18px', borderRadius: 6, background: '#2563EB', color: '#FFFFFF', fontWeight: 600 }}
              >
                {isSendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Dynamic View Router */}
      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#64748B' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 16px auto', color: '#2563EB' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Loading Creator Portal...</h3>
        </div>
      ) : activeView === 'workspace' ? (
        renderCourseWorkspaceView()
      ) : activeView === 'courses' ? (
        renderMyCoursesView()
      ) : activeView === 'analytics' ? (
        renderAnalyticsView()
      ) : activeView === 'earnings' ? (
        renderEarningsView()
      ) : activeView === 'messages' ? (
        renderMessagesView()
      ) : activeView === 'library' ? (
        renderContentLibraryView()
      ) : activeView === 'feedback' ? (
        renderReviewFeedbackView()
      ) : activeView === 'profile' ? (
        renderProfileView()
      ) : (
        renderDashboardView()
      )}

      {/* ==================================================
          MODAL 1: ADD SECTION MODAL
      ================================================== */}
      {isAddSectionOpen && (
        <div className="modal-overlay" onClick={() => setIsAddSectionOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', background: '#0F172A', color: '#FFFFFF', borderRadius: 4 }}>
                  Section {(activeCourse?.playlists?.length || 0) + 1}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Add Section
                </h3>
              </div>
              <button className="btn-ghost" onClick={() => setIsAddSectionOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSection}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Section Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Data Science"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 4 }}>
                    Section number is automatically assigned from order.
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Section Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of what students will achieve in this section..."
                    value={sectionDesc}
                    onChange={(e) => setSectionDesc(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsAddSectionOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmittingSection || !sectionTitle.trim()} style={{ background: '#0F172A', color: '#FFFFFF', borderColor: '#0F172A' }}>
                  {isSubmittingSection ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 2: RENAME SECTION MODAL
      ================================================== */}
      {renameSectionModal.isOpen && (
        <div className="modal-overlay" onClick={() => setRenameSectionModal({ isOpen: false, section: null, title: '', desc: '' })}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Rename Section
              </h3>
              <button className="btn-ghost" onClick={() => setRenameSectionModal({ isOpen: false, section: null, title: '', desc: '' })}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRenameSection}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Section Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={renameSectionModal.title}
                    onChange={(e) => setRenameSectionModal((prev) => ({ ...prev, title: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Section Description
                  </label>
                  <textarea
                    rows={3}
                    value={renameSectionModal.desc}
                    onChange={(e) => setRenameSectionModal((prev) => ({ ...prev, desc: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setRenameSectionModal({ isOpen: false, section: null, title: '', desc: '' })}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 3: DELETE SECTION CONFIRMATION
      ================================================== */}
      {deleteSectionModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteSectionModal({ isOpen: false, section: null })}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <AlertTriangle size={40} style={{ color: '#EF4444', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                Delete Curriculum Section?
              </h3>
              {(() => {
                const lessons = deleteSectionModal.section?.lessons || []
                const lectureCount = lessons.length
                const hasApprovedOrReview = lessons.some((l) => l.status === 'APPROVED' || l.status === 'PUBLISHED' || l.status === 'SUBMITTED_FOR_REVIEW')

                if (hasApprovedOrReview) {
                  return (
                    <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, marginBottom: 18, textAlign: 'left', fontSize: '0.82rem', color: '#991B1B' }}>
                      <strong>Deletion Restricted:</strong> This section contains lectures currently under review or approved. Sections with reviewed content cannot be deleted without Admin authorization.
                    </div>
                  )
                }

                if (lectureCount > 0) {
                  return (
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                      This section contains <strong>{lectureCount} {lectureCount === 1 ? 'lecture' : 'lectures'}</strong>. Deleting the section will also remove its draft content.
                    </p>
                  )
                }

                return (
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 20px 0' }}>
                    Are you sure you want to delete <strong>"{deleteSectionModal.section?.title}"</strong>?
                  </p>
                )
              })()}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteSectionModal({ isOpen: false, section: null })}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={deleteSectionModal.section?.lessons?.some((l) => l.status === 'APPROVED' || l.status === 'PUBLISHED' || l.status === 'SUBMITTED_FOR_REVIEW')}
                  onClick={handleDeleteSection}
                >
                  Delete Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 4: SCOPED LECTURE CREATOR & VIDEO UPLOAD
      ================================================== */}
      {lectureModal.isOpen && (() => {
        const hasVideoReady = Boolean(
          lectureModal.selectedFile ||
          (lectureModal.videoUrl && lectureModal.videoUrl.trim()) ||
          lectureModal.s3Key
        )

        return (
          <div className="modal-overlay" onClick={() => setLectureModal((prev) => ({ ...prev, isOpen: false }))}>
            <div
              className="modal-dialog"
              style={{
                maxWidth: 680,
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Clean Modal Header with Permanently Fixed X Button (Breadcrumb line removed) */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {lectureModal.mode === 'edit' ? 'Edit Lecture Module' : 'Create New Lecture Module'}
                </h3>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setLectureModal((prev) => ({ ...prev, isOpen: false }))}
                  style={{
                    padding: 6,
                    borderRadius: 6,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1 }}>
                {/* Target Section & Order */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Curriculum Section *
                    </label>
                    <select
                      value={lectureModal.playlistId}
                      onChange={(e) => setLectureModal((prev) => ({ ...prev, playlistId: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem', background: '#FFFFFF' }}
                    >
                      {activeCourse?.playlists?.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Lecture Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lectureModal.orderIndex}
                      onChange={(e) => setLectureModal((prev) => ({ ...prev, orderIndex: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Title & Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Lecture Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asynchronous I/O and Non-Blocking Events"
                      value={lectureModal.title}
                      onChange={(e) => setLectureModal((prev) => ({ ...prev, title: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Duration (mm:ss)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12:35"
                      value={lectureModal.duration}
                      onChange={(e) => setLectureModal((prev) => ({ ...prev, duration: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Lecture Objective / Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Summary of concepts covered in this video lecture..."
                    value={lectureModal.description}
                    onChange={(e) => setLectureModal((prev) => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem' }}
                  />
                </div>

                {/* Video Upload Area (Mandatory for Review) */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 16, background: '#FAFAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                      Lecture Video Asset (Required for Review Submission)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>MP4, MOV, WebM (Max 500 MB)</span>
                  </div>

                  <div
                    style={{
                      border: `2px dashed ${hasVideoReady ? '#10B981' : '#CBD5E1'}`,
                      borderRadius: 6,
                      padding: '20px 16px',
                      textAlign: 'center',
                      background: hasVideoReady ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('lecture-file-input')?.click()}
                  >
                    <UploadCloud size={32} style={{ color: hasVideoReady ? '#10B981' : '#2563EB', margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      {lectureModal.selectedFile
                        ? `Selected: ${lectureModal.selectedFile.name} (${Math.round(lectureModal.selectedFile.size / (1024 * 1024))} MB)`
                        : lectureModal.videoUrl
                        ? `Video configured: ${lectureModal.videoUrl.slice(0, 45)}...`
                        : 'Choose Video File or Drag and Drop'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>
                      Direct presigned AWS S3 streaming upload
                    </div>
                    <input
                      id="lecture-file-input"
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm']
                          const allowedExts = ['.mp4', '.mov', '.webm']
                          const hasValidExt = allowedExts.some((ext) => file.name.toLowerCase().endsWith(ext))
                          if (!allowedTypes.includes(file.type) && !hasValidExt) {
                            showToast('Only .mp4, .mov, and .webm video files are allowed', 'error')
                            return
                          }
                          if (file.size > 500 * 1024 * 1024) {
                            showToast('File size exceeds 500 MB limit', 'error')
                            return
                          }
                          setLectureModal((prev) => ({ ...prev, selectedFile: file }))
                        }
                      }}
                    />
                  </div>

                  {/* Upload Progress Bar */}
                  {lectureModal.isUploading && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
                        <span style={{ color: '#2563EB' }}>Uploading video to S3...</span>
                        <span style={{ color: '#0F172A' }}>{lectureModal.uploadProgress}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${lectureModal.uploadProgress}%`, height: '100%', background: '#2563EB', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  )}

                  {/* S3 Storage Asset Info */}
                  {(lectureModal.s3Key || lectureModal.videoUrl) ? (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                        <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                            S3 Private Storage: {lectureModal.s3Key || 'Configured Video Asset'}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: '#DCFCE7' }}>
                        Verified
                      </span>
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertCircle size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                      <span>Select a valid .mp4, .mov, or .webm video file up to 500 MB for secure presigned S3 upload.</span>
                    </div>
                  )}
                </div>

                {/* Supporting Resources & Review Notes */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Supporting Resources & External Links
                  </label>
                  <input
                    type="text"
                    placeholder="GitHub repo URL, slides PDF link, or reference materials..."
                    value={lectureModal.resources}
                    onChange={(e) => setLectureModal((prev) => ({ ...prev, resources: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  {hasVideoReady && lectureModal.videoUrl ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setPreviewVideo({ isOpen: true, videoUrl: lectureModal.videoUrl, title: lectureModal.title, course: activeCourse?.title })}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Play size={13} />
                      <span>Preview Video</span>
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#B45309', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <AlertCircle size={15} />
                      <span>Upload a lecture video before submitting for review.</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setLectureModal((prev) => ({ ...prev, isOpen: false }))}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={lectureModal.isSaving || lectureModal.isUploading}
                    onClick={() => handleSaveLecture('DRAFT')}
                  >
                    {lectureModal.isSaving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={lectureModal.isSaving || lectureModal.isUploading || !hasVideoReady}
                    onClick={() => handleSaveLecture('SUBMIT')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: hasVideoReady ? '#0F172A' : '#94A3B8', color: '#FFFFFF', borderColor: hasVideoReady ? '#0F172A' : '#94A3B8' }}
                    title={!hasVideoReady ? 'Upload a lecture video before submitting for review.' : 'Submit for Admin Review'}
                  >
                    <Send size={13} />
                    <span>Submit for Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ==================================================
          MODAL 5: DELETE LECTURE CONFIRMATION
      ================================================== */}
      {deleteLessonModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteLessonModal({ isOpen: false, lesson: null })}>
          <div className="modal-dialog" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Trash2 size={40} style={{ color: '#EF4444', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Delete Lecture Module?
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 20px 0' }}>
                Are you sure you want to delete <strong>"{deleteLessonModal.lesson?.title}"</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeleteLessonModal({ isOpen: false, lesson: null })}>
                  Cancel
                </button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteLesson}>
                  Delete Lecture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 7: VERIFY EMAIL OTP MODAL
      ================================================== */}
      {verifyEmailModalOpen && activeEmailReq && (
        <div className="modal-overlay" onClick={() => setVerifyEmailModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={20} style={{ color: '#16A34A' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Verify New Email Address
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVerifyEmailModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVerifyEmailSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Requested Target Email
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                    {activeEmailReq.requestedValue}
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Admin has approved your email change request. Please enter the 6-digit verification code dispatched to your new email inbox or notifications.
                </p>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    6-Digit Verification Code (OTP) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={emailOtpInput}
                    onChange={(e) => setEmailOtpInput(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      letterSpacing: '8px',
                      textAlign: 'center',
                      background: '#FFFFFF'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748B', background: '#EFF6FF', padding: '10px 12px', borderRadius: 6, border: '1px solid #DBEAFE' }}>
                  🔒 <strong>Active Email Safety:</strong> Your current email remains active for account access until you successfully submit this verification code.
                </div>
              </div>

              <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setVerifyEmailModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isVerifyingEmail || emailOtpInput.trim().length !== 6}
                  style={{ background: '#16A34A', borderColor: '#15803D', fontWeight: 700 }}
                >
                  {isVerifyingEmail ? 'Verifying...' : 'Verify & Update Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 8: SET NEW PASSWORD MODAL
      ================================================== */}
      {setPasswordModalOpen && activePasswordReq && (
        <div className="modal-overlay" onClick={() => setSetPasswordModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={20} style={{ color: '#7C3AED' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Set New Account Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSetPasswordModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCompletePasswordSubmit}>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '12px 14px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#5B21B6', marginBottom: 2 }}>
                    🔒 Admin Zero-Knowledge Security Policy
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6D28D9', margin: 0, lineHeight: 1.45 }}>
                    Admin approved your request and granted 24-hour permission to update your password.
                    Admin will <strong>NEVER</strong> view, receive, or store your actual password.
                  </p>
                </div>

                {/* Current Password */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Current Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrPass ? 'text' : 'password'}
                      required
                      placeholder="Enter your current password"
                      value={currPasswordInput}
                      onChange={(e) => setCurrPasswordInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 38px 9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrPass(!showCurrPass)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      {showCurrPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 38px 9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPasswordInput && (
                    <div style={{ fontSize: '0.72rem', color: newPasswordInput.length >= 8 ? '#16A34A' : '#EF4444', marginTop: 4, fontWeight: 600 }}>
                      {newPasswordInput.length >= 8 ? '✓ Minimum 8 characters met' : '✗ Password must be at least 8 characters'}
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Confirm New Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfPass ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      style={{ width: '100%', padding: '9px 38px 9px 12px', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.875rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfPass(!showConfPass)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPasswordInput && (
                    <div style={{ fontSize: '0.72rem', color: confirmPasswordInput === newPasswordInput ? '#16A34A' : '#EF4444', marginTop: 4, fontWeight: 600 }}>
                      {confirmPasswordInput === newPasswordInput ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSetPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={
                    isSettingPassword ||
                    !currPasswordInput ||
                    !newPasswordInput ||
                    newPasswordInput.length < 8 ||
                    newPasswordInput !== confirmPasswordInput
                  }
                  style={{ background: '#7C3AED', borderColor: '#6D28D9', fontWeight: 700 }}
                >
                  {isSettingPassword ? 'Updating...' : 'Update Password Securely'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL 6: VIDEO PREVIEW PLAYER
      ================================================== */}
      <VideoModal
        isOpen={previewVideo.isOpen}
        videoUrl={previewVideo.videoUrl}
        title={previewVideo.title}
        course={previewVideo.course}
        onClose={() => setPreviewVideo({ isOpen: false, videoUrl: '', title: '', course: '' })}
      />

      {/* ==================================================
          MODAL 7: NEW MESSAGE COMPOSER MODAL
      ================================================== */}
      {renderNewMessageModal()}
    </div>
  )
}

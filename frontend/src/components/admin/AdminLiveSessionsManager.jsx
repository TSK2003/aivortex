import { useState, useEffect, useMemo } from 'react'
import {
  Video,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Check,
  X,
  RefreshCw,
  Clock,
  Calendar,
  Users,
  Copy,
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Sparkles,
  Link,
  User,
  Info
} from 'lucide-react'
import api from '../../services/api'

export default function AdminLiveSessionsManager({ showToast }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | UPCOMING | COMPLETED | CANCELLED | DRAFT | HIDDEN
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [sessionModal, setSessionModal] = useState({
    open: false,
    mode: 'create', // create | edit
    session: null,
    isSubmitting: false,
    error: ''
  })

  const [previewSession, setPreviewSession] = useState(null)

  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    session: null,
    isSubmitting: false
  })

  // Session Form State
  const [formState, setFormState] = useState({
    title: '',
    sessionDate: '',
    scheduledAt: '',
    startTime: '11:00 AM',
    endTime: '01:30 PM',
    timezone: 'IST',
    duration: '2.5 Hours',
    speakerName: '',
    speakerRole: '',
    speakerPhoto: '',
    totalSeats: 50,
    registeredSeats: 0,
    shortDescription: '',
    detailedDescription: '',
    agenda: [
      'Live architectural blueprint and system decomposition',
      'Production code walkthrough with real-world enterprise edge cases',
      'Interactive Q&A and code review with lead architects'
    ],
    tagsInput: 'Architecture, Production AI, System Design',
    ctaText: 'RSVP for Free Live Masterclass',
    registrationUrl: '',
    meetingUrl: '',
    isRegistrationOpen: true,
    status: 'UPCOMING',
    orderIndex: 0
  })

  const [newAgendaItem, setNewAgendaItem] = useState('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Load Sessions
  const loadSessions = async () => {
    try {
      setLoading(true)
      const res = await api.admin.getLiveSessions()
      if (res.data?.sessions) {
        setSessions(res.data.sessions)
      } else {
        setSessions([])
      }
    } catch (err) {
      console.warn('Admin live sessions load error:', err.message)
      showToast?.(err.message || 'Failed to load live sessions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  // Metrics
  const metrics = useMemo(() => {
    const total = sessions.length
    const upcoming = sessions.filter((s) => s.status === 'UPCOMING' || s.dynamicStatus === 'UPCOMING' || s.dynamicStatus === 'REGISTRATION_OPEN').length
    const completed = sessions.filter((s) => s.status === 'COMPLETED' || s.dynamicStatus === 'COMPLETED').length
    const cancelled = sessions.filter((s) => s.status === 'CANCELLED' || s.dynamicStatus === 'CANCELLED').length
    const draft = sessions.filter((s) => s.status === 'DRAFT').length
    const totalRegistered = sessions.reduce((acc, s) => acc + (Number(s.registeredSeats) || 0), 0)
    const totalSeats = sessions.reduce((acc, s) => acc + (Number(s.totalSeats) || 0), 0)
    return { total, upcoming, completed, cancelled, draft, totalRegistered, totalSeats }
  }, [sessions])

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Status Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'UPCOMING') {
          if (s.status !== 'UPCOMING' && s.dynamicStatus !== 'UPCOMING' && s.dynamicStatus !== 'REGISTRATION_OPEN') return false
        } else if (statusFilter === 'COMPLETED') {
          if (s.status !== 'COMPLETED' && s.dynamicStatus !== 'COMPLETED') return false
        } else if (statusFilter === 'CANCELLED') {
          if (s.status !== 'CANCELLED' && s.dynamicStatus !== 'CANCELLED') return false
        } else if (statusFilter === 'DRAFT') {
          if (s.status !== 'DRAFT') return false
        } else if (s.status !== statusFilter && s.dynamicStatus !== statusFilter) {
          return false
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = (s.title || '').toLowerCase().includes(q)
        const matchSpeaker = (s.speakerName || s.speakerRole || '').toLowerCase().includes(q)
        const matchDesc = (s.shortDescription || s.description || '').toLowerCase().includes(q)
        const matchDate = (s.sessionDate || '').toLowerCase().includes(q)
        if (!matchTitle && !matchSpeaker && !matchDesc && !matchDate) return false
      }

      return true
    })
  }, [sessions, statusFilter, searchQuery])

  // Open Create Modal
  const handleOpenCreateModal = () => {
    // Default scheduled date to next Saturday 11:00 AM
    const nextSat = new Date()
    nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7 || 7))
    nextSat.setHours(11, 0, 0, 0)
    const dateFormatted = nextSat.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

    setFormState({
      title: '',
      sessionDate: dateFormatted,
      scheduledAt: nextSat.toISOString().slice(0, 16),
      startTime: '11:00 AM',
      endTime: '01:30 PM',
      timezone: 'IST',
      duration: '2.5 Hours',
      speakerName: '',
      speakerRole: 'Principal AI Architect',
      speakerPhoto: '',
      totalSeats: 50,
      registeredSeats: 0,
      shortDescription: '',
      detailedDescription: '',
      agenda: [
        'Live system architecture blueprint and decomposition',
        'Deep-dive code walkthrough with production scaling patterns',
        'Interactive Q&A and architecture critique with participants'
      ],
      tagsInput: 'Generative AI, System Design, Production MLOps',
      ctaText: 'RSVP for Free Live Masterclass',
      registrationUrl: '',
      meetingUrl: '',
      isRegistrationOpen: true,
      status: 'UPCOMING',
      orderIndex: sessions.length
    })
    setNewAgendaItem('')
    setSessionModal({
      open: true,
      mode: 'create',
      session: null,
      isSubmitting: false,
      error: ''
    })
  }

  // Open Edit Modal
  const handleOpenEditModal = (session) => {
    let agendaArr = []
    if (Array.isArray(session.agendaList)) {
      agendaArr = session.agendaList
    } else if (Array.isArray(session.agenda)) {
      agendaArr = session.agenda
    } else if (typeof session.agenda === 'string') {
      try {
        const parsed = JSON.parse(session.agenda)
        agendaArr = Array.isArray(parsed) ? parsed : [session.agenda]
      } catch {
        agendaArr = session.agenda.split('\n').filter(Boolean)
      }
    }

    let tagsStr = ''
    if (Array.isArray(session.tagsList)) {
      tagsStr = session.tagsList.join(', ')
    } else if (typeof session.tags === 'string') {
      try {
        const parsed = JSON.parse(session.tags)
        tagsStr = Array.isArray(parsed) ? parsed.join(', ') : session.tags
      } catch {
        tagsStr = session.tags
      }
    }

    setFormState({
      title: session.title || '',
      sessionDate: session.sessionDate || '',
      scheduledAt: session.scheduledAt ? new Date(session.scheduledAt).toISOString().slice(0, 16) : '',
      startTime: session.startTime || '11:00 AM',
      endTime: session.endTime || '01:30 PM',
      timezone: session.timezone || 'IST',
      duration: session.duration || '2.5 Hours',
      speakerName: session.speakerName || session.instructor || '',
      speakerRole: session.speakerRole || '',
      speakerPhoto: session.speakerPhoto || '',
      totalSeats: session.totalSeats || 50,
      registeredSeats: session.registeredSeats || 0,
      shortDescription: session.shortDescription || session.description || '',
      detailedDescription: session.detailedDescription || '',
      agenda: agendaArr.length > 0 ? agendaArr : ['Interactive architectural deep-dive'],
      tagsInput: tagsStr,
      ctaText: session.ctaText || 'RSVP for Free Live Masterclass',
      registrationUrl: session.registrationUrl || '',
      meetingUrl: session.meetingUrl || '',
      isRegistrationOpen: session.isRegistrationOpen ?? true,
      status: session.status || 'UPCOMING',
      orderIndex: session.orderIndex ?? 0
    })
    setNewAgendaItem('')
    setSessionModal({
      open: true,
      mode: 'edit',
      session,
      isSubmitting: false,
      error: ''
    })
  }

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingPhoto(true)
      const res = await api.admin.uploadMedia({ file, category: 'speakers' })
      if (res.data?.url) {
        setFormState((prev) => ({ ...prev, speakerPhoto: res.data.url }))
        showToast?.('Speaker photo uploaded successfully!', 'success')
      }
    } catch (err) {
      console.warn('Speaker photo upload failed:', err.message)
      showToast?.(err.message || 'Failed to upload photo', 'error')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // Agenda Management
  const handleAddAgendaItem = () => {
    if (!newAgendaItem.trim()) return
    setFormState((prev) => ({
      ...prev,
      agenda: [...prev.agenda, newAgendaItem.trim()]
    }))
    setNewAgendaItem('')
  }

  const handleRemoveAgendaItem = (index) => {
    setFormState((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((_, i) => i !== index)
    }))
  }

  const handleMoveAgendaItem = (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= formState.agenda.length) return
    const updated = [...formState.agenda]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setFormState((prev) => ({ ...prev, agenda: updated }))
  }

  // Submit Session Form (Create / Edit)
  const handleSubmitSession = async (e) => {
    e.preventDefault()

    // Validations (Requirement 17)
    if (!formState.title.trim()) {
      setSessionModal((prev) => ({ ...prev, error: 'Session Title is required.' }))
      return
    }
    if (!formState.sessionDate.trim() && !formState.scheduledAt) {
      setSessionModal((prev) => ({ ...prev, error: 'Session Date is required.' }))
      return
    }
    if (!formState.startTime.trim()) {
      setSessionModal((prev) => ({ ...prev, error: 'Start Time is required.' }))
      return
    }
    if (!formState.endTime.trim()) {
      setSessionModal((prev) => ({ ...prev, error: 'End Time is required.' }))
      return
    }
    if (!formState.speakerName.trim()) {
      setSessionModal((prev) => ({ ...prev, error: 'Speaker / Instructor name is required.' }))
      return
    }
    if (Number(formState.totalSeats) <= 0) {
      setSessionModal((prev) => ({ ...prev, error: 'Total Seats must be a positive number greater than 0.' }))
      return
    }
    if (formState.registrationUrl.trim() && !formState.registrationUrl.startsWith('http://') && !formState.registrationUrl.startsWith('https://')) {
      setSessionModal((prev) => ({ ...prev, error: 'Registration URL must be a valid URL starting with http:// or https://' }))
      return
    }

    try {
      setSessionModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))

      const payload = {
        title: formState.title.trim(),
        sessionDate: formState.sessionDate.trim(),
        scheduledAt: formState.scheduledAt ? new Date(formState.scheduledAt).toISOString() : new Date().toISOString(),
        startTime: formState.startTime.trim(),
        endTime: formState.endTime.trim(),
        timezone: formState.timezone.trim() || 'IST',
        duration: formState.duration.trim() || '2.5 Hours',
        speakerName: formState.speakerName.trim(),
        speakerRole: formState.speakerRole.trim(),
        speakerPhoto: formState.speakerPhoto.trim(),
        totalSeats: parseInt(formState.totalSeats, 10) || 50,
        registeredSeats: parseInt(formState.registeredSeats, 10) || 0,
        shortDescription: formState.shortDescription.trim(),
        detailedDescription: formState.detailedDescription.trim(),
        agenda: formState.agenda,
        tags: formState.tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        ctaText: formState.ctaText.trim() || 'RSVP for Free Live Masterclass',
        registrationUrl: formState.registrationUrl.trim(),
        meetingUrl: formState.meetingUrl.trim(),
        isRegistrationOpen: formState.isRegistrationOpen,
        status: formState.status,
        orderIndex: parseInt(formState.orderIndex, 10) || 0
      }

      if (sessionModal.mode === 'create') {
        const res = await api.admin.createLiveSession(payload)
        if (res.data?.session) {
          showToast?.('Live Session created successfully!', 'success')
        }
      } else {
        const res = await api.admin.updateLiveSession(sessionModal.session.id, payload)
        if (res.data?.session) {
          showToast?.('Live Session updated successfully!', 'success')
        }
      }

      setSessionModal({ open: false, mode: 'create', session: null, isSubmitting: false, error: '' })
      loadSessions()
    } catch (err) {
      setSessionModal((prev) => ({ ...prev, isSubmitting: false, error: err.message || 'Operation failed' }))
    }
  }

  // Duplicate Session
  const handleDuplicateSession = async (session) => {
    try {
      const res = await api.admin.duplicateLiveSession(session.id)
      if (res.success) {
        showToast?.(`Duplicated "${session.title}" as Draft.`, 'success')
        loadSessions()
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to duplicate session', 'error')
    }
  }

  // Quick Status Update
  const handleUpdateStatus = async (sessionId, status) => {
    try {
      const res = await api.admin.updateLiveSessionStatus(sessionId, status)
      if (res.success) {
        showToast?.(`Session status updated to ${status}`, 'success')
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, status, dynamicStatus: status } : s))
        )
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to update status', 'error')
    }
  }

  // Reorder Sessions
  const handleMoveOrder = async (session, direction) => {
    const currentIndex = sessions.findIndex((s) => s.id === session.id)
    const targetIndex = currentIndex + direction
    if (targetIndex < 0 || targetIndex >= sessions.length) return

    const reordered = [...sessions]
    const temp = reordered[currentIndex]
    reordered[currentIndex] = reordered[targetIndex]
    reordered[targetIndex] = temp

    // Assign new orderIndex
    const items = reordered.map((s, idx) => ({ id: s.id, orderIndex: idx }))
    setSessions(reordered.map((s, idx) => ({ ...s, orderIndex: idx })))

    try {
      await api.admin.reorderLiveSessions(items)
      showToast?.('Session order saved', 'success')
    } catch (err) {
      showToast?.(err.message || 'Failed to save reorder', 'error')
      loadSessions()
    }
  }

  // Delete Session
  const handleDeleteSession = async () => {
    if (!deleteConfirmModal.session) return
    try {
      setDeleteConfirmModal((prev) => ({ ...prev, isSubmitting: true }))
      await api.admin.deleteLiveSession(deleteConfirmModal.session.id)
      showToast?.('Live Session deleted successfully.', 'success')
      setDeleteConfirmModal({ open: false, session: null, isSubmitting: false })
      loadSessions()
    } catch (err) {
      showToast?.(err.message || 'Failed to delete session', 'error')
      setDeleteConfirmModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  // Computed Seats for Form
  const formSeatsLeft = Math.max(0, (parseInt(formState.totalSeats, 10) || 0) - (parseInt(formState.registeredSeats, 10) || 0))

  return (
    <div className="admin-live-sessions-manager" style={{ padding: '24px 0' }}>
      {/* Header & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Video size={24} color="#2563EB" />
            Live Sessions Management
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary, #64748B)', fontSize: '0.9rem' }}>
            Schedule interactive weekend masterclasses, manage speakers, dynamic agenda items, and track live RSVP capacities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadSessions}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Refresh sessions list"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
          >
            <Plus size={16} />
            Create Live Session
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards — compact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          {
            label: 'Total Masterclasses',
            value: metrics.total,
            color: 'var(--color-primary, #0F172A)',
            bg: 'var(--color-surface, #FFFFFF)'
          },
          {
            label: 'Upcoming / Active',
            value: metrics.upcoming,
            color: '#16A34A',
            bg: '#F0FDF4'
          },
          {
            label: 'RSVPs / Total Seats',
            value: (
              <span>
                {metrics.totalRegistered}
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748B', marginLeft: 3 }}>/ {metrics.totalSeats}</span>
              </span>
            ),
            color: '#2563EB',
            bg: '#EFF6FF'
          },
          {
            label: 'Draft / Concluded',
            value: (
              <span>
                {metrics.draft}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94A3B8', marginLeft: 4 }}>draft</span>
                <span style={{ color: '#CBD5E1', margin: '0 4px' }}>·</span>
                {metrics.completed}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#94A3B8', marginLeft: 4 }}>past</span>
              </span>
            ),
            color: 'var(--color-primary, #0F172A)',
            bg: 'var(--color-surface, #FFFFFF)'
          }
        ].map((card, i) => (
          <div
            key={i}
            className="card"
            style={{
              padding: '14px 18px',
              borderRadius: 8,
              border: '1px solid var(--color-border, #E2E8F0)',
              background: card.bg,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: card.color === 'var(--color-primary, #0F172A)' ? '#64748B' : card.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {card.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, lineHeight: 1.1 }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search Bar — compact single row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16
        }}
      >
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All ${metrics.total}` },
            { id: 'UPCOMING', label: `Upcoming ${metrics.upcoming}` },
            { id: 'COMPLETED', label: `Completed ${metrics.completed}` },
            { id: 'CANCELLED', label: `Cancelled ${metrics.cancelled}` },
            { id: 'DRAFT', label: `Draft ${metrics.draft}` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: statusFilter === tab.id ? '1.5px solid #2563EB' : '1.5px solid transparent',
                cursor: 'pointer',
                background: statusFilter === tab.id ? '#EFF6FF' : 'var(--color-bg-subtle, #F1F5F9)',
                color: statusFilter === tab.id ? '#2563EB' : 'var(--color-text-secondary, #64748B)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search sessions or speaker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 34px',
              borderRadius: 8,
              border: '1px solid var(--color-border, #CBD5E1)',
              fontSize: '0.85rem',
              outline: 'none',
              background: 'var(--color-surface, #FFFFFF)',
              color: 'var(--color-text, #0F172A)'
            }}
          />
        </div>
      </div>
      {/* Sessions Table */}
      <div className="card" style={{ borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-bg-subtle, #F8FAFC)',
                  borderBottom: '2px solid var(--color-border, #E2E8F0)'
                }}
              >
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '4%', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '30%' }}>Session</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '16%', whiteSpace: 'nowrap' }}>Date &amp; Time</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '18%' }}>Speaker</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '10%', whiteSpace: 'nowrap' }}>Seats</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '10%' }}>Status</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', width: '12%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-secondary, #64748B)' }}>
                    <RefreshCw size={22} className="spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#2563EB' }} />
                    Loading masterclasses…
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-secondary, #64748B)' }}>
                    No live sessions found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, idx) => {
                  const seatsLeft = Math.max(0, (session.totalSeats || 0) - (session.registeredSeats || 0))
                  const fillPct = Math.min(100, Math.round(((session.registeredSeats || 0) / (session.totalSeats || 1)) * 100))
                  const isFull = seatsLeft <= 0 || session.dynamicStatus === 'FULL'
                  const isCompleted = session.status === 'COMPLETED' || session.dynamicStatus === 'COMPLETED'
                  const isCancelled = session.status === 'CANCELLED' || session.dynamicStatus === 'CANCELLED'
                  const isLive = session.dynamicStatus === 'LIVE'
                  const isDraft = session.status === 'DRAFT'

                  const speakerName = session.speakerName || session.instructor || 'Lead Architect'
                  const speakerRole = session.speakerRole || 'Staff AI Specialist'

                  // Seat color
                  const seatColor = isFull ? '#DC2626' : seatsLeft <= 10 ? '#D97706' : '#16A34A'
                  const barColor  = isFull ? '#DC2626' : seatsLeft <= 10 ? '#F59E0B' : '#2563EB'

                  // Status pill config
                  const statusConfig = isLive
                    ? { label: 'Live Now', dot: '#16A34A', text: '#15803D', bg: '#DCFCE7' }
                    : isCancelled
                    ? { label: 'Cancelled', dot: '#DC2626', text: '#991B1B', bg: '#FEE2E2' }
                    : isCompleted
                    ? { label: 'Completed', dot: '#94A3B8', text: '#475569', bg: '#F1F5F9' }
                    : isDraft
                    ? { label: 'Draft', dot: '#F59E0B', text: '#B45309', bg: '#FEF3C7' }
                    : isFull
                    ? { label: 'Seats Full', dot: '#DC2626', text: '#991B1B', bg: '#FEE2E2' }
                    : { label: 'Upcoming', dot: '#16A34A', text: '#15803D', bg: '#DCFCE7' }

                  // Agenda count
                  const agendaCount = Array.isArray(session.agendaList)
                    ? session.agendaList.length
                    : Array.isArray(session.agenda)
                    ? session.agenda.length
                    : 3

                  // Icon-button shared style
                  const iconBtn = (color = '#334155', bgColor = 'transparent', borderColor = '#E2E8F0') => ({
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    color,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'opacity 0.15s ease'
                  })

                  return (
                    <tr
                      key={session.id}
                      style={{
                        borderBottom: '1px solid var(--color-border, #E2E8F0)',
                        background: 'var(--color-surface, #FFFFFF)',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface, #FFFFFF)' }}
                    >
                      {/* # — drag handle + number badge */}
                      <td style={{ padding: '16px 10px 16px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {/* Drag handle (visual only — acts as reorder trigger) */}
                          <span
                            title="Drag to reorder (use arrows to change order)"
                            style={{ color: '#CBD5E1', cursor: 'grab', lineHeight: 1, fontSize: '1rem', letterSpacing: '-1px', userSelect: 'none' }}
                          >
                            ⋮⋮
                          </span>
                          {/* Number badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 24,
                              height: 24,
                              borderRadius: 6,
                              background: '#F1F5F9',
                              color: '#475569',
                              fontWeight: 700,
                              fontSize: '0.78rem'
                            }}
                          >
                            {idx + 1}
                          </span>
                        </div>
                      </td>

                      {/* Session — thumbnail + title + desc + chips */}
                      <td style={{ padding: '16px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: 68,
                              height: 50,
                              borderRadius: 8,
                              flexShrink: 0,
                              overflow: 'hidden',
                              background: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            {session.thumbnail ? (
                              <img
                                src={session.thumbnail}
                                alt={session.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Video size={20} color="rgba(255,255,255,0.5)" />
                            )}
                          </div>

                          {/* Text content */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                color: 'var(--color-primary, #0F172A)',
                                fontSize: '0.88rem',
                                lineHeight: 1.35,
                                marginBottom: 3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {session.title}
                            </div>
                            <div
                              style={{
                                fontSize: '0.76rem',
                                color: '#64748B',
                                marginBottom: 6,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.45
                              }}
                            >
                              {session.shortDescription || session.description || 'Interactive deep dive masterclass.'}
                            </div>
                            {/* Chips */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#2563EB',
                                  fontWeight: 600,
                                  background: '#EFF6FF',
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  border: '1px solid #BFDBFE',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {agendaCount} Agenda {agendaCount === 1 ? 'Item' : 'Items'}
                              </span>
                              {session.meetingUrl && (
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    color: '#059669',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    background: '#ECFDF5',
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                    border: '1px solid #A7F3D0',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <Link size={10} />
                                  Link set
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time — 2-line compact */}
                      <td style={{ padding: '16px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Calendar size={13} color="#2563EB" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--color-text, #1E293B)', whiteSpace: 'nowrap' }}>
                            {session.sessionDate
                              ? session.sessionDate
                              : session.scheduledAt
                              ? new Date(session.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                              : 'TBD'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                          <span style={{ fontSize: '0.77rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {session.startTime} – {session.endTime}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 2, paddingLeft: 19 }}>
                          {session.timezone || 'IST'}
                        </div>
                      </td>

                      {/* Speaker */}
                      <td style={{ padding: '16px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                          {/* Avatar */}
                          {session.speakerPhoto ? (
                            <img
                              src={session.speakerPhoto}
                              alt={speakerName}
                              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0, marginTop: 1 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                                color: '#2563EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.88rem',
                                flexShrink: 0,
                                border: '2px solid #BFDBFE',
                                marginTop: 1
                              }}
                            >
                              {speakerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {/* Name + Role */}
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: '0.84rem',
                                color: 'var(--color-text, #0F172A)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 160
                              }}
                            >
                              {speakerName}
                            </div>
                            <div
                              style={{
                                fontSize: '0.74rem',
                                color: '#64748B',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxWidth: 160
                              }}
                            >
                              {speakerRole}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Seats */}
                      <td style={{ padding: '16px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.83rem', color: 'var(--color-text, #1E293B)' }}>
                            {session.registeredSeats || 0} / {session.totalSeats || 50}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: 5, background: '#E2E8F0', borderRadius: 9999, overflow: 'hidden', marginBottom: 5 }}>
                          <div
                            style={{
                              width: `${fillPct}%`,
                              height: '100%',
                              background: barColor,
                              borderRadius: 9999,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: seatColor }}>
                          {isFull ? 'Full' : `${seatsLeft} left`}
                        </div>
                      </td>

                      {/* Status pill */}
                      <td style={{ padding: '16px 14px', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: statusConfig.text,
                            background: statusConfig.bg,
                            padding: '3px 9px',
                            borderRadius: '999px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig.dot, flexShrink: 0 }} />
                          {statusConfig.label}
                        </span>
                      </td>

                      {/* Actions — icon buttons with tooltips */}
                      <td style={{ padding: '16px 14px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setPreviewSession(session)}
                            style={iconBtn('#334155', 'transparent', '#E2E8F0')}
                            title="View Session"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(session)}
                            style={iconBtn('#2563EB', '#EFF6FF', '#BFDBFE')}
                            title="Edit Session"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#DBEAFE' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#EFF6FF' }}
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateSession(session)}
                            style={iconBtn('#334155', 'transparent', '#E2E8F0')}
                            title="Duplicate Session"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                          >
                            <Copy size={14} />
                          </button>

                          {/* End / Publish / Reopen */}
                          {session.status === 'UPCOMING' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                              style={{
                                height: 30,
                                padding: '0 8px',
                                borderRadius: 7,
                                border: '1px solid #E2E8F0',
                                background: 'transparent',
                                color: '#475569',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                              title="Mark as Completed"
                            >
                              End
                            </button>
                          ) : session.status === 'DRAFT' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(session.id, 'UPCOMING')}
                              style={{
                                height: 30,
                                padding: '0 8px',
                                borderRadius: 7,
                                border: '1px solid #A7F3D0',
                                background: '#ECFDF5',
                                color: '#065F46',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}
                              title="Publish Session"
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(session.id, 'UPCOMING')}
                              style={{
                                height: 30,
                                padding: '0 8px',
                                borderRadius: 7,
                                border: '1px solid #E2E8F0',
                                background: 'transparent',
                                color: '#2563EB',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                              title="Reactivate Session"
                            >
                              Reopen
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmModal({ open: true, session, isSubmitting: false })}
                            style={iconBtn('#DC2626', 'transparent', '#FCA5A5')}
                            title="Delete Session"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* CREATE / EDIT SESSION MODAL */}
      {sessionModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 840,
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 8,
              padding: 28,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--color-border, #E2E8F0)', paddingBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)', margin: 0 }}>
                  {sessionModal.mode === 'create' ? 'Create Live Architectural Session' : 'Edit Live Session'}
                </h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary, #64748B)', fontSize: '0.85rem' }}>
                  Manage session dates, dynamic agenda, speaker info, and live RSVP seat capacities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSessionModal({ open: false, mode: 'create', session: null, isSubmitting: false, error: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {sessionModal.error && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #F87171',
                  color: '#991B1B',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 18,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <AlertCircle size={18} />
                <span>{sessionModal.error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSession}>
              {/* Row 1: Session Title */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Agent Orchestration: Production Raft & Event Loops"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--color-border, #CBD5E1)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    background: 'var(--color-surface, #FFFFFF)',
                    color: 'var(--color-text, #0F172A)'
                  }}
                />
              </div>

              {/* Row 2: Date, Start Time, End Time, Timezone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Display Date *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saturday, Oct 18, 2026"
                    value={formState.sessionDate}
                    onChange={(e) => setFormState({ ...formState, sessionDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: 'var(--color-surface, #FFFFFF)',
                      color: 'var(--color-text, #0F172A)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Date & Time (Scheduled) *
                  </label>
                  <input
                    type="datetime-local"
                    value={formState.scheduledAt}
                    onChange={(e) => setFormState({ ...formState, scheduledAt: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: 'var(--color-surface, #FFFFFF)',
                      color: 'var(--color-text, #0F172A)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:00 AM"
                    value={formState.startTime}
                    onChange={(e) => setFormState({ ...formState, startTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: 'var(--color-surface, #FFFFFF)',
                      color: 'var(--color-text, #0F172A)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    End Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01:30 PM"
                    value={formState.endTime}
                    onChange={(e) => setFormState({ ...formState, endTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: 'var(--color-surface, #FFFFFF)',
                      color: 'var(--color-text, #0F172A)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Timezone
                  </label>
                  <input
                    type="text"
                    placeholder="IST / UTC / EST"
                    value={formState.timezone}
                    onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: 'var(--color-surface, #FFFFFF)',
                      color: 'var(--color-text, #0F172A)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Duration Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2.5 Hours"
                    value={formState.duration}
                    onChange={(e) => setFormState({ ...formState, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: 'var(--color-surface, #FFFFFF)',
                      color: 'var(--color-text, #0F172A)'
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Speaker Information */}
              <div style={{ background: 'var(--color-bg-subtle, #F8FAFC)', padding: 16, borderRadius: 8, marginBottom: 18, border: '1px solid var(--color-border, #E2E8F0)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} color="#2563EB" />
                  Speaker & Instructor Information
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                      Speaker Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jennifer Wu"
                      value={formState.speakerName}
                      onChange={(e) => setFormState({ ...formState, speakerName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--color-border, #CBD5E1)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                      Speaker Designation / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Principal AI Infrastructure Architect"
                      value={formState.speakerRole}
                      onChange={(e) => setFormState({ ...formState, speakerRole: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid var(--color-border, #CBD5E1)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                      Speaker Photo
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Photo URL or upload below"
                        value={formState.speakerPhoto}
                        onChange={(e) => setFormState({ ...formState, speakerPhoto: e.target.value })}
                        style={{
                          flexGrow: 1,
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--color-border, #CBD5E1)',
                          fontSize: '0.85rem'
                        }}
                      />
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '8px 12px',
                          borderRadius: 6,
                          background: '#EFF6FF',
                          border: '1px solid #2563EB',
                          color: '#2563EB',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: isUploadingPhoto ? 'wait' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Upload size={13} />
                        {isUploadingPhoto ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Seats Capacity Management (Requirement 9) */}
              <div style={{ background: '#F0FDF4', padding: 16, borderRadius: 8, marginBottom: 18, border: '1px solid #BBF7D0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="#16A34A" />
                  Seats Capacity & Registration Management
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4, color: '#166534' }}>
                      Total Seats *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formState.totalSeats}
                      onChange={(e) => setFormState({ ...formState, totalSeats: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #86EFAC',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4, color: '#166534' }}>
                      Registered Seats
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.registeredSeats}
                      onChange={(e) => setFormState({ ...formState, registeredSeats: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px solid #86EFAC',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}
                    />
                  </div>

                  <div style={{ padding: '8px 14px', background: '#DCFCE7', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803D' }}>Calculated Seats Left</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: formSeatsLeft === 0 ? '#DC2626' : '#166534' }}>
                      {formSeatsLeft === 0 ? '0 (FULL)' : `${formSeatsLeft} seats available`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      id="regOpenToggle"
                      checked={formState.isRegistrationOpen}
                      onChange={(e) => setFormState({ ...formState, isRegistrationOpen: e.target.checked })}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="regOpenToggle" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', cursor: 'pointer' }}>
                      Registration Open
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 5: Dynamic Session Agenda (Requirement 6) */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text, #1E293B)', margin: 0 }}>
                    Session Agenda Items ({formState.agenda.length})
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748B)' }}>
                    Add, edit, reorder or delete key agenda items
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {formState.agenda.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-bg-subtle, #F8FAFC)',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid var(--color-border, #E2E8F0)'
                      }}
                    >
                      <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.82rem', minWidth: 20 }}>
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...formState.agenda]
                          updated[index] = e.target.value
                          setFormState({ ...formState, agenda: updated })
                        }}
                        style={{
                          flexGrow: 1,
                          border: 'none',
                          background: 'transparent',
                          fontSize: '0.88rem',
                          color: 'var(--color-text, #0F172A)',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleMoveAgendaItem(index, -1)}
                        disabled={index === 0}
                        style={{ border: 'none', background: 'none', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 0.8 }}
                        title="Move up"
                      >
                        <MoveUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveAgendaItem(index, 1)}
                        disabled={index === formState.agenda.length - 1}
                        style={{ border: 'none', background: 'none', cursor: index === formState.agenda.length - 1 ? 'default' : 'pointer', opacity: index === formState.agenda.length - 1 ? 0.3 : 0.8 }}
                        title="Move down"
                      >
                        <MoveDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAgendaItem(index)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                        title="Delete agenda item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new agenda item input */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter agenda point (e.g. Distributed consensus failure scenario analysis)..."
                    value={newAgendaItem}
                    onChange={(e) => setNewAgendaItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddAgendaItem()
                      }
                    }}
                    style={{
                      flexGrow: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.86rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddAgendaItem}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Row 6: Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview for the session card..."
                    value={formState.shortDescription}
                    onChange={(e) => setFormState({ ...formState, shortDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Detailed Description / Prerequisites
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detailed session topics, setup requirements, and takeaways..."
                    value={formState.detailedDescription}
                    onChange={(e) => setFormState({ ...formState, detailedDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Row 7: CTA, Links & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formState.ctaText}
                    onChange={(e) => setFormState({ ...formState, ctaText: e.target.value })}
                    placeholder="e.g. RSVP for Free Live Masterclass"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Meeting Link (Google Meet / Zoom)
                  </label>
                  <input
                    type="url"
                    value={formState.meetingUrl}
                    onChange={(e) => setFormState({ ...formState, meetingUrl: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem',
                      background: 'var(--color-surface, #FFFFFF)'
                    }}
                  >
                    <option value="UPCOMING">Upcoming (Published)</option>
                    <option value="DRAFT">Draft</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1E293B)' }}>
                    Display Order Index
                  </label>
                  <input
                    type="number"
                    value={formState.orderIndex}
                    onChange={(e) => setFormState({ ...formState, orderIndex: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border, #CBD5E1)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--color-border, #E2E8F0)', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setSessionModal({ open: false, mode: 'create', session: null, isSubmitting: false, error: '' })}
                  className="btn btn-secondary"
                  disabled={sessionModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sessionModal.isSubmitting}
                  style={{ minWidth: 140, fontWeight: 700 }}
                >
                  {sessionModal.isSubmitting ? (
                    <RefreshCw size={15} className="spin" />
                  ) : sessionModal.mode === 'create' ? (
                    'Create Session'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL (Requirement 13) */}
      {previewSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 18,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            {/* Preview Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={14} /> Public Card Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewSession(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Public Card Representation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-secondary" style={{ fontWeight: 600 }}>
                {previewSession.sessionDate || 'Upcoming Weekend'}
              </span>

              {previewSession.status === 'CANCELLED' ? (
                <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, background: '#FEE2E2', padding: '3px 10px', borderRadius: 9999 }}>
                  Cancelled
                </span>
              ) : previewSession.status === 'COMPLETED' ? (
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, background: '#F1F5F9', padding: '3px 10px', borderRadius: 9999 }}>
                  Concluded
                </span>
              ) : (previewSession.totalSeats - previewSession.registeredSeats <= 0) ? (
                <span style={{ fontSize: '0.75rem', color: '#991B1B', fontWeight: 700, background: '#FEE2E2', padding: '3px 10px', borderRadius: 9999 }}>
                  Seats Full
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: 700, background: '#FEE2E2', padding: '3px 10px', borderRadius: 9999 }}>
                  {Math.max(0, (previewSession.totalSeats || 50) - (previewSession.registeredSeats || 0))} seats left
                </span>
              )}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary, #0F172A)', marginBottom: 12, lineHeight: 1.4 }}>
              {previewSession.title}
            </h3>

            {/* Speaker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {previewSession.speakerPhoto ? (
                <img
                  src={previewSession.speakerPhoto}
                  alt={previewSession.speakerName}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '1.1rem' }}>
                  {(previewSession.speakerName || 'L').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text, #0F172A)' }}>
                  {previewSession.speakerName || previewSession.instructor || 'Lead Architect'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  {previewSession.speakerRole || 'Staff AI Specialist'}
                </div>
              </div>
            </div>

            {/* Time & Duration */}
            <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} />
              <span>
                {previewSession.startTime && previewSession.endTime
                  ? `${previewSession.startTime} - ${previewSession.endTime} ${previewSession.timezone || 'IST'}`
                  : (previewSession.duration || '2.5 Hours')}
              </span>
            </div>

            {/* Agenda List */}
            <div style={{ background: 'var(--color-bg-subtle, #F8FAFC)', borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text, #1E293B)', textTransform: 'uppercase', marginBottom: 8 }}>
                Key Session Agenda:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, margin: 0, padding: 0 }}>
                {(previewSession.agendaList || previewSession.agenda || [
                  'Live architectural blueprint and system decomposition',
                  'Production code walkthrough with edge cases',
                  'Interactive Q&A and code review'
                ]).map((item, idx) => (
                  <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary, #475569)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>•</span>
                    <span>{typeof item === 'string' ? item : item.title || JSON.stringify(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
              onClick={() => setPreviewSession(null)}
            >
              {previewSession.ctaText || 'RSVP for Free Live Masterclass'}
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Requirement 15) */}
      {deleteConfirmModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
                  Delete Live Session?
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  This session will be permanently removed.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text, #334155)', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to delete <strong>"{deleteConfirmModal.session?.title}"</strong>? Any student RSVPs associated with this session will also be cleared. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmModal({ open: false, session: null, isSubmitting: false })}
                disabled={deleteConfirmModal.isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSession}
                disabled={deleteConfirmModal.isSubmitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {deleteConfirmModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

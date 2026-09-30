import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  Video,
  UserCheck,
  CreditCard,
  Radio,
  ExternalLink,
  Check
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function NotificationMenu({
  pendingVideosCount = 0,
  pendingRequestsCount = 0,
  recentOrdersCount = 0,
  notifications = []
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [readIds, setReadIds] = useState(new Set())
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const totalActionItems =
    pendingVideosCount + pendingRequestsCount + (notifications.filter((n) => !n.isRead).length || 0)

  const unreadCount = Math.max(0, totalActionItems - readIds.size)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Build dynamic notification list based on live domain state
  const items = []

  if (pendingVideosCount > 0) {
    items.push({
      id: 'pending-videos',
      icon: Video,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
      title: 'Video Verification Queue',
      message: `${pendingVideosCount} lecture video${pendingVideosCount > 1 ? 's' : ''} submitted for admin quality review.`,
      time: 'Action Required',
      link: '/admin/playlists',
      type: 'warning'
    })
  }

  if (pendingRequestsCount > 0) {
    items.push({
      id: 'pending-requests',
      icon: UserCheck,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      title: 'Creator Profile Requests',
      message: `${pendingRequestsCount} creator change request${pendingRequestsCount > 1 ? 's' : ''} awaiting approval.`,
      time: 'Action Required',
      link: '/admin/requests',
      type: 'info'
    })
  }

  if (recentOrdersCount > 0) {
    items.push({
      id: 'recent-orders',
      icon: CreditCard,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: 'Course Enrollments',
      message: `${recentOrdersCount} new successful enrollment payment${recentOrdersCount > 1 ? 's' : ''} recorded.`,
      time: 'Live Audit',
      link: '/admin/payments',
      type: 'success'
    })
  }

  // Add any broadcast/user notifications if passed
  notifications.forEach((n, idx) => {
    items.push({
      id: n.id || `notif-${idx}`,
      icon: Radio,
      iconBg: '#F3E8FF',
      iconColor: '#9333EA',
      title: n.title || 'Platform Announcement',
      message: n.message || n.body || '',
      time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent',
      link: '/admin/notifications',
      type: 'announcement'
    })
  })

  // Fallback item if no active queues
  if (items.length === 0) {
    items.push({
      id: 'all-clear',
      icon: CheckCircle2,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: 'All Systems Operational',
      message: 'All video reviews and profile requests have been processed.',
      time: 'Just now',
      link: '/admin/dashboard',
      type: 'success'
    })
  }

  const handleMarkAllRead = (e) => {
    e.stopPropagation()
    const allIds = new Set(items.map((i) => i.id))
    setReadIds(allIds)
  }

  const handleItemClick = (item) => {
    setReadIds((prev) => new Set([...prev, item.id]))
    setIsOpen(false)
    if (item.link) {
      navigate(item.link)
    }
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Admin Notifications"
        title="Admin Notifications"
        style={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          background: isOpen ? 'var(--color-bg-subtle, #F1F5F9)' : 'var(--color-bg-card, #FFFFFF)',
          border: '1px solid var(--color-border, #E2E8F0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text, #334155)',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.15s ease',
          outline: 'none',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)'
          e.currentTarget.style.borderColor = 'var(--color-border-hover, #CBD5E1)'
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'var(--color-bg-card, #FFFFFF)'
            e.currentTarget.style.borderColor = 'var(--color-border, #E2E8F0)'
          }
        }}
      >
        <Bell size={19} strokeWidth={2.2} />

        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 800,
              minWidth: 18,
              height: 18,
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--color-header-bg, #FFFFFF)',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.4)',
              transition: 'border-color 0.3s ease'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            background: 'var(--color-bg-card, #FFFFFF)',
            borderRadius: '14px',
            border: '1px solid var(--color-border, #E2E8F0)',
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
              : '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border, #E2E8F0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-bg-subtle, #F8FAFC)',
              transition: 'background-color 0.3s ease, border-color 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-text, #0F172A)', transition: 'color 0.3s ease' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
                    color: isDark ? '#60A5FA' : '#2563EB',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.35)' : '#BFDBFE'}`,
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary, #64748B)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: 0,
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3B82F6')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary, #64748B)')}
              >
                <Check size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Items list */}
          <div className="notification-scroll-list" style={{ maxHeight: 340, overflowY: 'auto' }}>
            {items.map((item) => {
              const Icon = item.icon
              const isRead = readIds.has(item.id)

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    borderBottom: '1px solid var(--color-border, #F1F5F9)',
                    cursor: 'pointer',
                    background: isDark ? (isRead ? '#111827' : '#141E30') : (isRead ? '#FFFFFF' : '#F8FAFC'),
                    transition: 'background-color 0.3s ease, border-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#162032' : '#F1F5F9')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isDark ? (isRead ? '#111827' : '#141E30') : (isRead ? '#FFFFFF' : '#F8FAFC'))
                  }
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: isDark ? 'rgba(59, 130, 246, 0.15)' : item.iconBg,
                      color: isDark ? '#60A5FA' : item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    <Icon size={17} strokeWidth={2.2} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                        marginBottom: 2
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--color-text, #0F172A)',
                          fontWeight: 700,
                          lineHeight: 1.3,
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {item.title}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--color-text-tertiary, #94A3B8)',
                          fontWeight: 500,
                          flexShrink: 0,
                          transition: 'color 0.3s ease'
                        }}
                      >
                        {item.time}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.78125rem',
                        color: 'var(--color-text-secondary, #475569)',
                        margin: 0,
                        lineHeight: 1.4,
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {item.message}
                    </p>
                  </div>

                  {!isRead && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#3B82F6',
                        marginTop: 8,
                        flexShrink: 0
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 18px',
              borderTop: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
              background: isDark ? '#0D1424' : '#FFFFFF',
              textAlign: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/admin/notifications')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: isDark ? '#60A5FA' : '#2563EB',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Broadcast & Notification Center</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Check, 
  CheckCheck, 
  BookOpen, 
  Award, 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  RefreshCw,
  Info
} from 'lucide-react'
import api from '../../services/api'

function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const diffMs = Date.now() - new Date(dateString).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getNotificationIcon(title = '', message = '') {
  const text = (title + ' ' + message).toLowerCase()
  if (text.includes('certificate') || text.includes('verified') || text.includes('credential')) {
    return <Award size={16} style={{ color: '#F59E0B' }} />
  }
  if (text.includes('module') || text.includes('course') || text.includes('lesson')) {
    return <BookOpen size={16} style={{ color: '#2563EB' }} />
  }
  if (text.includes('live') || text.includes('cohort') || text.includes('session') || text.includes('schedule')) {
    return <Calendar size={16} style={{ color: '#8B5CF6' }} />
  }
  if (text.includes('welcome') || text.includes('congratulations')) {
    return <Sparkles size={16} style={{ color: '#10B981' }} />
  }
  return <Info size={16} style={{ color: '#64748B' }} />
}

import { useAuth } from '../../contexts/AuthContext'

export default function NotificationDropdown() {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    if (!isAuthenticated || user?.role !== 'STUDENT') return
    try {
      setLoading(true)
      const res = await api.student.getNotifications()
      if (res && res.data && Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications)
      } else if (res && Array.isArray(res.notifications)) {
        setNotifications(res.notifications)
      }
    } catch (err) {
      // Graceful error logging without spamming
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'STUDENT') return
    fetchNotifications()

    // Poll every 60 seconds only if tab is currently visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchNotifications()
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated, user?.role])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkOneRead = async (e, id) => {
    e.stopPropagation()
    try {
      await api.student.markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.student.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.student.markNotificationRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
      } catch (err) {
        console.error('Failed to mark notification read:', err)
      }
    }
    setIsOpen(false)
    if (notif.linkUrl) {
      navigate(notif.linkUrl)
    }
  }

  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        type="button"
        id="student-notification-bell-btn"
        className="btn-ghost"
        onClick={() => {
          setIsOpen((prev) => !prev)
          if (!isOpen) fetchNotifications()
        }}
        aria-label="Notifications"
        title="Notifications"
        style={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #E2E8F0',
          background: isOpen ? '#EFF6FF' : '#FFFFFF',
          color: isOpen ? '#2563EB' : '#475569',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#CBD5E1'
          e.currentTarget.style.color = '#1E293B'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E2E8F0'
          e.currentTarget.style.color = isOpen ? '#2563EB' : '#475569'
        }}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            id="notification-badge-count"
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.68rem',
              fontWeight: 800,
              minWidth: 18,
              height: 18,
              borderRadius: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
              animation: 'pulse 2s infinite'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          id="student-notification-panel"
          className="notification-panel"
          style={{
            right: 0,
            zIndex: 99999
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px 12px 18px',
              borderBottom: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    border: '1px solid #BFDBFE'
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={fetchNotifications}
                title="Refresh"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 6
                }}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 6px',
                    borderRadius: 6
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '8px 16px',
              borderBottom: '1px solid #F1F5F9',
              background: '#FFFFFF'
            }}
          >
            <button
              type="button"
              onClick={() => setFilter('all')}
              style={{
                background: filter === 'all' ? '#0F172A' : '#F1F5F9',
                color: filter === 'all' ? '#FFFFFF' : '#64748B',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              style={{
                background: filter === 'unread' ? '#2563EB' : '#F1F5F9',
                color: filter === 'unread' ? '#FFFFFF' : '#64748B',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="notification-scroll-list">
            {displayedNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '42px 20px', color: '#94A3B8' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                    color: '#64748B'
                  }}
                >
                  <Check size={22} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: 4 }}>
                  All caught up!
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  {filter === 'unread'
                    ? 'No unread notifications right now.'
                    : 'You have no new notifications right now.'}
                </div>
              </div>
            ) : (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`notification-card ${notif.isRead ? '' : 'unread'}`}
                >
                  {/* Category Icon */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: notif.isRead ? '#F1F5F9' : '#DBEAFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2
                    }}
                  >
                    {getNotificationIcon(notif.title, notif.message)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
                      <span
                        style={{
                          fontWeight: notif.isRead ? 600 : 800,
                          fontSize: '0.86rem',
                          color: notif.isRead ? '#334155' : '#0F172A',
                          lineHeight: 1.3
                        }}
                      >
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: notif.isRead ? '#64748B' : '#475569',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {notif.message}
                    </p>

                    {notif.linkUrl && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 6,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#2563EB'
                        }}
                      >
                        <span>View details</span>
                        <ExternalLink size={11} />
                      </div>
                    )}
                  </div>

                  {/* Unread Action */}
                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkOneRead(e, notif.id)}
                      title="Mark as read"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: 6,
                        borderRadius: 6,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#2563EB'
                        e.currentTarget.style.background = '#DBEAFE'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94A3B8'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: '#2563EB',
                          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)'
                        }}
                      />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #F1F5F9',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/student/support')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              Need help? File a support ticket &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

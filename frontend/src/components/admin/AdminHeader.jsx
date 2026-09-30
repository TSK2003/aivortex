import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, Eye, Edit, Settings, LogOut, ChevronDown } from 'lucide-react'
import NotificationMenu from './NotificationMenu'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminHeader({
  onToggleSidebar,
  pendingVideosCount = 0,
  pendingRequestsCount = 0,
  recentOrdersCount = 0,
  notifications = [],
  onLogout
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleTheme, isDark } = useTheme()
  const { user, logout } = useAuth()

  // Dynamic title based on current pathname
  const getPageTitle = () => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/admin/profile')) return 'Admin Profile'
    if (path.includes('/admin/creators')) return 'Creator Management'
    if (path.includes('/admin/students')) return 'Student Management'
    if (path.includes('/admin/courses/create')) return 'Create Course'
    if (path.includes('/admin/courses')) return 'Course Management'
    if (path.includes('/admin/playlists')) return 'Playlist & Video Management'
    if (path.includes('/admin/payments')) return 'Payments & Enrollments'
    if (path.includes('/admin/public-page') || path.includes('/admin/public-controls')) return 'Public Pages & Footer CMS'
    if (path.includes('/admin/notifications')) return 'Broadcast Notifications'
    if (path.includes('/admin/reports')) return 'Reports & Analytics'
    if (path.includes('/admin/requests')) return 'Creator Requests'
    if (path.includes('/admin/audit-logs')) return 'System Audit Logs'
    if (path.includes('/admin/security')) return 'Security & Sessions'
    return 'Admin Portal'
  }

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileOpen])

  // Get User Initials
  const getInitials = (name) => {
    if (!name) return 'AD'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const adminName = user?.name || 'Dr. Vikram Sen'
  const adminEmail = user?.email || 'director@apexlearn.edu'
  const adminRole = user?.role || 'ADMIN'

  return (
    <header
      className="dashboard-topbar admin-header"
      style={{
        height: '64px',
        background: 'var(--color-header-bg, #FFFFFF)',
        borderBottom: '1px solid var(--color-border, #E2E8F0)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Left side: [Hamburger] [Admin Portal] [LIVE] */}
      <div className="admin-header-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          style={{
            width: 38,
            height: 38,
            borderRadius: '9px',
            background: 'transparent',
            border: '1px solid var(--color-border, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text, #334155)',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)'
            e.currentTarget.style.borderColor = 'var(--color-border-hover, #CBD5E1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'var(--color-border, #E2E8F0)'
          }}
        >
          <Menu size={19} />
        </button>

        <div className="admin-header-title-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className="topbar-title admin-header-main-title"
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--color-text, #0F172A)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              transition: 'color 0.3s ease'
            }}
          >
            Admin Portal
          </span>

          {getPageTitle() !== 'Admin Portal' && (
            <span className="admin-header-breadcrumb" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#CBD5E1', fontSize: '0.875rem' }}>/</span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569'
                }}
              >
                {getPageTitle()}
              </span>
            </span>
          )}

          <span
            className="admin-header-live-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'var(--color-success-bg, #ECFDF5)',
              color: 'var(--color-success, #059669)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '9999px',
              border: '1px solid var(--color-success, #A7F3D0)',
              lineHeight: 1,
              transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
              }}
            />
            LIVE
          </span>
        </div>
      </div>

      {/* Right side: Theme Toggle & Notifications */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Light / Dark Theme Toggle Button with Fluid Morphing Icons */}
        <button
          type="button"
          id="admin-theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`admin-theme-toggle-btn ${isDark ? 'is-dark' : 'is-light'}`}
        >
          <div className="theme-toggle-track">
            <Sun size={19} strokeWidth={2.2} className="theme-icon sun-icon" />
            <Moon size={19} strokeWidth={2.2} className="theme-icon moon-icon" />
          </div>
        </button>

        {/* Notification Bell */}
        <NotificationMenu
          pendingVideosCount={pendingVideosCount}
          pendingRequestsCount={pendingRequestsCount}
          recentOrdersCount={recentOrdersCount}
          notifications={notifications}
        />

        {/* Vertical Divider */}
        <div style={{ width: 1, height: 26, background: '#E2E8F0' }} />

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px 4px 4px',
              background: profileOpen ? '#F1F5F9' : 'transparent',
              border: '1px solid',
              borderColor: profileOpen ? '#CBD5E1' : 'transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!profileOpen) e.currentTarget.style.background = '#F8FAFC'
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) e.currentTarget.style.background = 'transparent'
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={adminName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                getInitials(adminName)
              )}
            </div>

            <div className="admin-user-meta" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  lineHeight: 1.2
                }}
              >
                {adminName}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#64748B',
                  fontWeight: 600,
                  lineHeight: 1.1
                }}
              >
                Academic Director
              </span>
            </div>

            <ChevronDown
              size={15}
              style={{
                color: '#94A3B8',
                transition: 'transform 0.2s ease',
                transform: profileOpen ? 'rotate(180deg)' : 'none'
              }}
            />
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 250,
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}
            >
              {/* Profile Card Header */}
              <div
                style={{
                  padding: '14px 16px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0'
                }}
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0F172A' }}>
                  {adminName}
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
                  title={adminEmail}
                >
                  {adminEmail}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span
                    style={{
                      background: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '1px solid #BFDBFE'
                    }}
                  >
                    Academic Director • {adminRole}
                  </span>
                </div>
              </div>

              {/* Dropdown Menu Items */}
              <div style={{ padding: '6px 8px' }}>
                {/* 1. View Profile */}
                <button
                  type="button"
                  id="admin-menu-view-profile"
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/admin/profile?mode=view')
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Eye size={15} style={{ color: '#2563EB' }} />
                  <span>View Profile</span>
                </button>

                {/* 2. Edit Profile */}
                <button
                  type="button"
                  id="admin-menu-edit-profile"
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/admin/profile?mode=edit')
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Edit size={15} style={{ color: '#059669' }} />
                  <span>Edit Profile</span>
                </button>

                {/* 3. Settings */}
                <button
                  type="button"
                  id="admin-menu-settings"
                  onClick={() => {
                    setProfileOpen(false)
                    navigate('/admin/security')
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#334155',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Settings size={15} style={{ color: '#64748B' }} />
                  <span>Settings</span>
                </button>
              </div>

              {/* 4. Logout Option */}
              <div
                style={{
                  padding: '6px 8px',
                  borderTop: '1px solid #E2E8F0'
                }}
              >
                <button
                  type="button"
                  id="admin-menu-logout"
                  onClick={async () => {
                    setProfileOpen(false)
                    if (onLogout) {
                      await onLogout()
                    } else if (logout) {
                      await logout()
                      navigate('/login')
                    }
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Active Session status */}
        <div style={{ width: 1, height: 22, background: 'var(--color-border, #E2E8F0)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Session</span>
      </div>
    </header>
  )
}

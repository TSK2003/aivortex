import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  ChevronDown,
  Settings,
  LogOut,
  Eye,
  Edit,
  Sun,
  Moon
} from 'lucide-react'
import NotificationMenu from './NotificationMenu'
import { useTheme } from '../../contexts/ThemeContext'

export default function AdminHeader({
  onToggleSidebar,
  user,
  onLogout,
  pendingVideosCount = 0,
  pendingRequestsCount = 0,
  recentOrdersCount = 0,
  notifications = []
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const navigate = useNavigate()
  const { theme, toggleTheme, isDark } = useTheme()

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
  const adminRoleTitle =
    user?.role === 'SUPERADMIN' ? 'Super Administrator' : (user?.title || 'Academic Director')

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className="topbar-title"
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

          <span
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

      {/* Right side: Theme Toggle, Notifications & Profile */}
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
        <div className="header-divider" style={{ width: 1, height: 26, background: 'var(--color-border, #E2E8F0)', transition: 'background-color 0.3s ease' }} />

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
              background: profileOpen ? 'var(--color-bg-subtle, #F1F5F9)' : 'transparent',
              border: '1px solid',
              borderColor: profileOpen ? 'var(--color-border, #CBD5E1)' : 'transparent',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!profileOpen) e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)'
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

            <div className="admin-profile-text" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--color-text, #0F172A)',
                  lineHeight: 1.2,
                  transition: 'color 0.3s ease'
                }}
              >
                {adminName}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--color-text-secondary, #64748B)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  transition: 'color 0.3s ease'
                }}
              >
                {adminRoleTitle}
              </span>
            </div>

            <ChevronDown
              size={15}
              style={{
                color: 'var(--color-text-tertiary, #94A3B8)',
                transition: 'transform 0.2s ease, color 0.3s ease',
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
                background: 'var(--color-bg-card, #FFFFFF)',
                borderRadius: '12px',
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
              {/* Profile Card Header - Clickable to View Profile */}
              <div
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/admin/profile?mode=view')
                }}
                style={{
                  padding: '14px 16px',
                  background: 'var(--color-bg-subtle, #F8FAFC)',
                  borderBottom: '1px solid var(--color-border, #E2E8F0)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, border-color 0.3s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#162032' : '#F1F5F9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)')}
                title="Click to view profile"
              >
                <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text, #0F172A)', transition: 'color 0.3s ease' }}>
                  {adminName}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-secondary, #64748B)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: 2,
                    transition: 'color 0.3s ease'
                  }}
                  title={adminEmail}
                >
                  {adminEmail}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span
                    style={{
                      background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
                      color: isDark ? '#60A5FA' : '#2563EB',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE'}`,
                      transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                    }}
                  >
                    {adminRoleTitle} • {adminRole}
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
                    color: 'var(--color-text, #334155)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease, color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#1A2438' : '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Eye size={15} style={{ color: '#3B82F6' }} />
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
                    color: 'var(--color-text, #334155)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease, color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#1A2438' : '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Edit size={15} style={{ color: '#10B981' }} />
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
                    color: 'var(--color-text, #334155)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease, color 0.3s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#1A2438' : '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Settings size={15} style={{ color: 'var(--color-text-secondary, #64748B)', transition: 'color 0.3s ease' }} />
                  <span>Settings</span>
                </button>
              </div>

              {/* 4. Logout Option */}
              <div
                style={{
                  padding: '6px 8px',
                  borderTop: '1px solid var(--color-border, #E2E8F0)',
                  transition: 'border-color 0.3s ease'
                }}
              >
                <button
                  type="button"
                  id="admin-menu-logout"
                  onClick={async () => {
                    setProfileOpen(false)
                    if (onLogout) await onLogout()
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
                    color: '#F87171',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

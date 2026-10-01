import { useLocation } from 'react-router-dom'
import {
  Menu,
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
  const { toggleTheme, isDark } = useTheme()
  const location = useLocation()

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
    if (path.includes('/admin/projects')) return 'Projects Management'
    if (path.includes('/admin/live-sessions')) return 'Live Sessions Management'
    if (path.includes('/admin/reviews')) return 'Course Reviews'
    if (path.includes('/admin/notifications')) return 'Broadcast Notifications'
    if (path.includes('/admin/reports')) return 'Reports & Analytics'
    if (path.includes('/admin/requests')) return 'Creator Requests'
    if (path.includes('/admin/audit-logs')) return 'System Audit Logs'
    if (path.includes('/admin/security')) return 'Security & Sessions'
    return 'Admin Portal'
  }

  // No profile state needed in header — account control is in sidebar footer only

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

      {/* Right side: Theme Toggle & Notifications only — account is in sidebar footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Light / Dark Theme Toggle */}
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

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: 'var(--color-border, #E2E8F0)' }} />

        {/* Active Session Indicator */}
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #64748B)', fontWeight: 600, whiteSpace: 'nowrap' }}>
          Active Session
        </span>
      </div>
    </header>
  )
}

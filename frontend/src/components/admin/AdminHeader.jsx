import { Menu, Sun, Moon } from 'lucide-react'
import NotificationMenu from './NotificationMenu'
import { useTheme } from '../../contexts/ThemeContext'

export default function AdminHeader({
  onToggleSidebar,
  pendingVideosCount = 0,
  pendingRequestsCount = 0,
  recentOrdersCount = 0,
  notifications = []
}) {
  const { toggleTheme, isDark } = useTheme()

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

        {/* Active Session status */}
        <div style={{ width: 1, height: 22, background: 'var(--color-border, #E2E8F0)' }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Session</span>
      </div>
    </header>
  )
}

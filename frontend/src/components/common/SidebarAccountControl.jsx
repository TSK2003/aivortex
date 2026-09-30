import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  User,
  Settings,
  LogOut
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export default function SidebarAccountControl({
  user,
  role = 'creator',
  collapsed = false,
  onLogout
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()
  const { isDark } = useTheme()

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  // Derive user identity values
  const displayName = user?.name || (role === 'admin' ? 'Administrator' : 'Creator')
  const displayEmail = user?.email || (role === 'admin' ? 'admin@apexlearn.com' : 'creator@apexlearn.com')
  const roleLabel =
    role === 'admin'
      ? (user?.role === 'SUPERADMIN' ? 'Super Administrator' : 'Administrator')
      : 'Creator'

  const userPhoto = user?.avatar || user?.profilePhoto || user?.photo || user?.image
  const initial = displayName.charAt(0).toUpperCase()

  const handleToggle = () => {
    setOpen((prev) => !prev)
  }

  const handleViewProfile = () => {
    setOpen(false)
    if (role === 'admin') {
      navigate('/admin/profile?mode=view')
    } else {
      navigate('/creator/profile')
    }
  }

  const handleSettings = () => {
    setOpen(false)
    if (role === 'admin') {
      navigate('/admin/security')
    } else {
      navigate('/creator/profile')
    }
  }

  const handleLogoutClick = async () => {
    setOpen(false)
    if (onLogout) {
      await onLogout()
    }
  }

  return (
    <div
      ref={containerRef}
      className={`sidebar-account-control ${collapsed ? 'collapsed' : ''}`}
      style={{
        position: 'relative',
        padding: collapsed ? '10px 8px' : '10px 12px',
        borderTop: `1px solid var(--color-border, ${isDark ? '#334155' : '#E2E8F0'})`,
        marginTop: 'auto',
        flexShrink: 0
      }}
    >
      {/* Compact Account Row Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
        title={collapsed ? `${displayName} (${roleLabel})` : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          width: '100%',
          padding: collapsed ? '6px 4px' : '6px 8px',
          borderRadius: '8px',
          border: `1px solid ${open ? (isDark ? '#334155' : '#CBD5E1') : 'transparent'}`,
          background: open
            ? (isDark ? '#1E293B' : '#F1F5F9')
            : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          gap: collapsed ? 0 : 10,
          boxSizing: 'border-box',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = isDark ? '#1E293B' : '#F8FAFC'
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            borderRadius: '50%',
            background: role === 'admin' ? '#0F172A' : '#2563EB',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8125rem',
            flexShrink: 0,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}
        >
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            initial
          )}
        </div>

        {/* User Name & Role (Expanded Mode Only) */}
        {!collapsed && (
          <div style={{ minWidth: 0, flex: 1, textAlign: 'left', overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: isDark ? '#F8FAFC' : '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}
              title={displayName}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: isDark ? '#94A3B8' : '#64748B',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: 2,
                lineHeight: 1.1
              }}
            >
              {roleLabel}
            </div>
          </div>
        )}

        {/* Subtle chevron indicator (Expanded Mode Only) */}
        {!collapsed && (
          <div
            style={{
              color: isDark ? '#64748B' : '#94A3B8',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.15s ease, color 0.15s ease',
              transform: open ? 'rotate(-90deg)' : 'none'
            }}
          >
            <ChevronRight size={15} />
          </div>
        )}
      </div>

      {/* Account Popover (Opens Upward Above Account Row) */}
      {open && (
        <div
          role="menu"
          aria-label="User Account Menu"
          style={{
            position: 'absolute',
            bottom: collapsed ? '4px' : 'calc(100% + 8px)',
            left: collapsed ? 'calc(100% + 10px)' : '10px',
            right: collapsed ? 'auto' : '10px',
            width: collapsed ? '240px' : 'auto',
            minWidth: '220px',
            maxWidth: '260px',
            background: isDark ? '#1E293B' : '#FFFFFF',
            border: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
            borderRadius: '10px',
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
              : '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            zIndex: 1050,
            overflow: 'hidden',
            animation: 'popoverUp 0.15s ease'
          }}
        >
          {/* Popover Header with User Details */}
          <div
            style={{
              padding: '12px 14px',
              background: isDark ? '#162032' : '#F8FAFC',
              borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {displayName}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: role === 'admin' ? (isDark ? '#0F172A' : '#F1F5F9') : '#EFF6FF',
                  color: role === 'admin' ? (isDark ? '#93C5FD' : '#334155') : '#2563EB',
                  border: `1px solid ${isDark ? '#334155' : '#CBD5E1'}`,
                  flexShrink: 0
                }}
              >
                {roleLabel}
              </span>
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: isDark ? '#94A3B8' : '#64748B',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: 3
              }}
              title={displayEmail}
            >
              {displayEmail}
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '6px' }}>
            {/* 1. View Profile */}
            <button
              type="button"
              role="menuitem"
              onClick={handleViewProfile}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: isDark ? '#E2E8F0' : '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#263449' : '#F1F5F9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <User size={15} style={{ color: '#2563EB' }} />
              <span>View Profile</span>
            </button>

            {/* 2. Account Settings */}
            <button
              type="button"
              role="menuitem"
              onClick={handleSettings}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: isDark ? '#E2E8F0' : '#334155',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#263449' : '#F1F5F9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <Settings size={15} style={{ color: isDark ? '#94A3B8' : '#64748B' }} />
              <span>Account Settings</span>
            </button>

            {/* Divider */}
            <div style={{ height: 1, background: isDark ? '#334155' : '#E2E8F0', margin: '4px 0' }} />

            {/* 3. Log Out */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogoutClick}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'transparent',
                border: 'none',
                color: isDark ? '#F87171' : '#DC2626',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

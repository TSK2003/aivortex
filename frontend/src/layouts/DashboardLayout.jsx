import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import NotificationDropdown from '../components/common/NotificationDropdown'
import BrandLogo from '../components/common/BrandLogo'
import api from '../services/api'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ListVideo,
  CreditCard,
  Globe,
  Bell,
  BarChart3,
  MessageSquare,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  FolderGit2,
  Video,
  Award,
  Sparkles,
  Settings,
  Star,
  ChevronDown,
  User
} from 'lucide-react'

/**
 * DashboardLayout provides the structured sidebar + topbar layout used by
 * Admin, Creator, and Student portals.
 */

const NAVIGATION_CONFIG = {
  admin: [
    {
      title: 'MAIN',
      items: [
        { path: '/admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
      ]
    },
    {
      title: 'ACADEMIC MANAGEMENT',
      items: [
        { path: '/admin/creators', label: 'Faculty & Creators', icon: Users },
        { path: '/admin/students', label: 'Enrolled Students', icon: GraduationCap },
        { path: '/admin/courses', label: 'Curriculum & Courses', icon: BookOpen },
        { path: '/admin/playlists', label: 'Lecture Verification', icon: ListVideo, badgeKey: 'pendingVideos' },
        { path: '/admin/payments', label: 'Orders & Payments', icon: CreditCard },
      ]
    },
    {
      title: 'PLATFORM CONTENT',
      items: [
        { path: '/admin/public-page', label: 'Public Portal CMS', icon: Globe },
        { path: '/admin/projects', label: 'Domain Projects', icon: FolderGit2 },
        { path: '/admin/live-sessions', label: 'Live Masterclasses', icon: Video },
        { path: '/admin/reviews', label: 'Learner Reviews', icon: Star },
        { path: '/admin/notifications', label: 'Announcements', icon: Bell },
      ]
    },
    {
      title: 'ANALYTICS & GOVERNANCE',
      items: [
        { path: '/admin/reports', label: 'Executive Analytics', icon: BarChart3 },
        { path: '/admin/requests', label: 'Profile Requests', icon: MessageSquare, badgeKey: 'pendingRequests' },
        { path: '/admin/support', label: 'Support & Inquiries', icon: MessageSquare },
        { path: '/admin/audit-logs', label: 'Audit Log Trail', icon: FileText },
        { path: '/admin/security', label: 'Security & Auth', icon: Shield },
      ]
    }
  ],
  creator: [
    {
      title: 'STUDIO',
      items: [
        { path: '/creator/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { path: '/creator/courses', label: 'My Curriculum Tracks', icon: BookOpen },
      ]
    },
    {
      title: 'WORKSHOP',
      items: [
        { path: '/creator/messages', label: 'Editorial Feedback', icon: MessageSquare, badgeKey: 'feedbackCount' },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { path: '/creator/profile', label: 'Creator Profile', icon: Settings },
      ]
    }
  ],
  student: [
    {
      title: 'LEARNING',
      items: [
        { path: '/student/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { path: '/student/courses', label: 'Enrolled Courses', icon: BookOpen },
        { path: '/student/projects', label: 'Capstone Projects', icon: FolderGit2 },
        { path: '/student/live-sessions', label: 'Live Masterclasses', icon: Video },
      ]
    },
    {
      title: 'ACADEMIC & BILLING',
      items: [
        { path: '/student/certificates', label: 'Verified Certificates', icon: GraduationCap },
        { path: '/student/payments', label: 'Invoices & Billing', icon: CreditCard },
        { path: '/student/notifications', label: 'Notifications', icon: Bell },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { path: '/student/support', label: 'Support & Queries', icon: MessageSquare },
        { path: '/student/profile', label: 'Account Profile', icon: Users },
      ]
    }
  ]
}

export default function DashboardLayout({ role = 'student' }) {
  const { user, logout, isAdmin, isCreator } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Close topbar user dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [userMenuOpen])

  // Live domain metrics for admin notification bell & sidebar badges
  const [adminMetrics, setAdminMetrics] = useState({
    pendingVideos: 0,
    pendingRequests: 0,
    recentOrders: 0
  })

  // Live creator metrics for feedback/changes requested badge
  const [creatorMetrics, setCreatorMetrics] = useState({
    feedbackCount: 0
  })

  // Load metrics once on role change — NOT on every route change to prevent request storms
  useEffect(() => {
    let isMounted = true
    if (role === 'admin') {
      api.admin.getOverview()
        .then((res) => {
          if (isMounted && res?.data?.analytics) {
            setAdminMetrics({
              pendingVideos: res.data.analytics.pendingVerificationCount || 0,
              pendingRequests: res.data.analytics.pendingRequestsCount || 0,
              recentOrders: res.data.recentOrders?.length || 0
            })
          }
        })
        .catch(() => {})
    } else if (role === 'creator') {
      api.creator.getSubmissions()
        .then((res) => {
          if (isMounted && res?.data?.submissions) {
            const subs = res.data.submissions
            const changesReq = subs.filter((s) => s.status === 'RETURNED_FOR_EDIT').length
            setCreatorMetrics({ feedbackCount: changesReq })
          }
        })
        .catch(() => {})
    }
    return () => {
      isMounted = false
    }
  }, [role])

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }

  const roleLabel =
    role === 'admin' ? 'Admin Portal' : role === 'creator' ? 'Creator Studio' : 'Student Portal'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const currentNavSections = NAVIGATION_CONFIG[role] || NAVIGATION_CONFIG.student

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : (role === 'admin' ? 'A' : role === 'creator' ? 'C' : 'S')
  const roleBadgeColor = role === 'admin' ? '#DC2626' : role === 'creator' ? '#7C3AED' : '#2563EB'
  const roleBadgeBg = role === 'admin' ? '#FEE2E2' : role === 'creator' ? '#EDE9FE' : '#EFF6FF'

  return (
    <div className={`dashboard-layout dashboard-layout-${role}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Shared Standardized Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Sidebar Header: Menu Button is placed LEFT TO THE LOGO */}
        <div
          className="sidebar-header"
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            padding: sidebarCollapsed ? '0 10px' : '0 16px',
            gap: sidebarCollapsed ? 0 : 12,
            borderBottom: '1px solid var(--color-border)',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          {/* Menu Button: Positioned Left to the Logo */}
          <button
            type="button"
            id="sidebar-menu-toggle-btn"
            className="sidebar-menu-btn"
            onClick={handleToggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle Navigation Sidebar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              border: '1px solid var(--color-border, #CBD5E1)',
              display: sidebarCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              color: '#0F172A',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Menu size={18} />
          </button>

          {/* Logo Area: When shrinked/collapsed, show ONLY the "A" logo emblem */}
          <button
            type="button"
            onClick={sidebarCollapsed ? handleToggleSidebar : undefined}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: sidebarCollapsed ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              overflow: 'hidden'
            }}
            title={sidebarCollapsed ? "Click to expand sidebar" : "aivortex"}
          >
            <BrandLogo
              size="sm"
              showName={!sidebarCollapsed}
              showTagline={!sidebarCollapsed}
              theme={isDark ? 'dark' : 'light'}
            />
          </button>

          {/* Mobile close button */}
          {sidebarOpen && (
            <button
              type="button"
              className="btn-ghost sidebar-close-mobile"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close Sidebar"
              style={{ marginLeft: 'auto', display: 'flex' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Sections: When collapsed, shows ONLY centered icons */}
        <nav
          className="sidebar-nav"
          style={{
            padding: sidebarCollapsed ? '14px 6px' : '14px 8px',
            flex: 1,
            overflowY: 'auto'
          }}
        >
          {currentNavSections.map((section, sIndex) => (
            <div
              key={section.title || `sec-${sIndex}`}
              style={{
                marginBottom: sidebarCollapsed ? 8 : 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                alignItems: sidebarCollapsed ? 'center' : 'stretch'
              }}
            >
              {section.title && (
                sidebarCollapsed ? (
                  sIndex > 0 ? (
                    <div
                      style={{
                        width: 28,
                        height: 1,
                        background: 'var(--color-border, #E2E8F0)',
                        margin: '6px auto',
                        opacity: 0.7
                      }}
                      aria-hidden="true"
                    />
                  ) : null
                ) : (
                  <div
                    className="sidebar-section-header"
                    style={{
                      paddingTop: sIndex === 0 ? '4px' : '8px',
                      paddingBottom: '4px',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#94A3B8',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {section.title}
                  </div>
                )
              )}
              {section.items.map((item) => {
                const Icon = item.icon
                const badgeValue = item.badgeKey
                  ? (role === 'admin' ? adminMetrics[item.badgeKey] : creatorMetrics[item.badgeKey])
                  : 0

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setSidebarOpen(false)}
                    title={item.label}
                    style={{
                      height: 40,
                      width: sidebarCollapsed ? 44 : 'auto',
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                      gap: sidebarCollapsed ? 0 : 10,
                      padding: sidebarCollapsed ? 0 : '0 12px',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    {Icon && <Icon size={19} className="sidebar-nav-icon" style={{ flexShrink: 0 }} />}
                    {!sidebarCollapsed && (
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    )}
                    {badgeValue > 0 && (
                      sidebarCollapsed ? (
                        <span
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#F59E0B'
                          }}
                          title={`${badgeValue} pending`}
                        />
                      ) : (
                        <span className="sidebar-badge badge-amber" style={{ padding: '2px 7px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                          {badgeValue}
                        </span>
                      )
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-alt, #F8FAFC)' }}>
        {/* Standardized Enterprise Top Header */}
        <header
          className="dashboard-topbar"
          style={{
            height: '64px',
            background: 'var(--color-header-bg, #FFFFFF)',
            borderBottom: '1px solid var(--color-border, #E2E8F0)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Left Side: Mobile toggle + Portal Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn-ghost mobile-sidebar-toggle"
              onClick={handleToggleSidebar}
              aria-label="Toggle Navigation Sidebar"
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                border: '1px solid var(--color-border, #E2E8F0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                cursor: 'pointer'
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="topbar-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                {roleLabel}
              </h1>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: roleBadgeBg,
                  color: roleBadgeColor,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                {role}
              </span>
            </div>
          </div>

          {/* Right Side: Quick Portal Switchers, Notifications, Profile Name & Button in Top-Right Corner */}
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Quick Switch for Admin to view student / creator portals */}
            {isAdmin && (
              <div style={{ display: 'none', gap: 6, '@media (min-width: 768px)': { display: 'flex' } }}>
                <button
                  type="button"
                  onClick={() => navigate(role === 'admin' ? '/student/dashboard' : '/admin/dashboard')}
                  className="btn btn-outline"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    height: 30
                  }}
                >
                  {role === 'admin' ? 'View as Student' : 'Admin Portal'}
                </button>
              </div>
            )}

            <NotificationDropdown />

            <div style={{ width: 1, height: 24, background: '#E2E8F0' }} />

            {/* Profile Name and Button moved to Top-Right Corner with Proper View */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                id="topbar-profile-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: userMenuOpen ? '#F1F5F9' : '#FFFFFF',
                  border: '1px solid',
                  borderColor: userMenuOpen ? '#CBD5E1' : '#E2E8F0',
                  borderRadius: 8,
                  padding: '5px 12px 5px 6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                {/* Avatar with Role Theme */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: role === 'admin' ? '#0F172A' : role === 'creator' ? '#7C3AED' : '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  {initial}
                </div>

                {/* Profile Name & Role Subtitle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text, #0F172A)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || (role === 'admin' ? 'Dr. Vikram Sen' : role === 'creator' ? 'Creator' : 'Student')}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B' }}>
                    {role === 'admin' ? 'Administrator' : role === 'creator' ? 'Course Creator' : 'Student'}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  style={{
                    color: '#64748B',
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    marginLeft: 2
                  }}
                />
              </button>

              {/* Top-Right Profile Dropdown Menu */}
              {userMenuOpen && (
                <div
                  id="topbar-profile-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 240,
                    background: '#FFFFFF',
                    borderRadius: 8,
                    boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1))',
                    border: '1px solid #E2E8F0',
                    padding: 8,
                    zIndex: 1000,
                    animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* User Profile Header */}
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid #E2E8F0', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: roleBadgeBg,
                          color: roleBadgeColor,
                          textTransform: 'uppercase'
                        }}
                      >
                        {role === 'admin' ? 'Platform Administrator' : role === 'creator' ? 'Instructor / Creator' : 'Enrolled Student'}
                      </span>
                    </div>
                  </div>

                  {/* Profile and Settings Links */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      if (role === 'admin') navigate('/admin/profile?mode=view')
                      else if (role === 'creator') navigate('/creator/profile')
                      else navigate('/student/profile')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: '#334155',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={15} style={{ color: '#64748B' }} />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      if (role === 'admin') navigate('/admin/security')
                      else if (role === 'creator') navigate('/creator/profile')
                      else navigate('/student/profile')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: '#334155',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={15} style={{ color: '#64748B' }} />
                    <span>Settings & Security</span>
                  </button>

                  <div style={{ height: 1, background: '#E2E8F0', margin: '6px 0' }} />

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setUserMenuOpen(false)
                      await handleLogout()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: '#DC2626',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEE2E2'
                      e.currentTarget.style.borderColor = '#F87171'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FEF2F2'
                      e.currentTarget.style.borderColor = '#FECACA'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LogOut size={14} style={{ color: '#DC2626' }} />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main
          className="dashboard-content"
          style={{
            flex: 1,
            padding: '24px 28px',
            maxWidth: 'var(--width-content-max, 1280px)',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}


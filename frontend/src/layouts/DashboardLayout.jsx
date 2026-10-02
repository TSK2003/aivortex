import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import NotificationDropdown from '../components/common/NotificationDropdown'
import BrandLogo from '../components/common/BrandLogo'
import api from '../services/api'
import AdminHeader from '../components/admin/AdminHeader'
import SidebarAccountControl from '../components/common/SidebarAccountControl'
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
  Star
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
        { path: '/creator/analytics', label: 'Performance Analytics', icon: BarChart3 },
        { path: '/creator/earnings', label: 'Earnings & Payouts', icon: CreditCard },
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

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Shared Standardized Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid var(--color-border)' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <BrandLogo size="sm" theme={isDark ? 'dark' : 'light'} />
          </a>
          <button
            type="button"
            className="btn-ghost sidebar-close-mobile"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav" style={{ padding: '14px 8px', flex: 1, overflowY: 'auto' }}>
          {currentNavSections.map((section, sIndex) => (
            <div
              key={section.title || `sec-${sIndex}`}
              style={{
                marginBottom: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {section.title && (
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
                      borderRadius: 6,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '0 12px',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease, color 0.15s ease'
                    }}
                  >
                    {Icon && <Icon size={18} className="sidebar-nav-icon" style={{ flexShrink: 0 }} />}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {badgeValue > 0 && (
                      <span className="sidebar-badge badge-amber" style={{ padding: '2px 7px', borderRadius: 9999, fontSize: '0.72rem', fontWeight: 700 }}>
                        {badgeValue}
                      </span>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Standardized Account Control for ALL roles */}
        <SidebarAccountControl
          user={user}
          role={role}
          collapsed={sidebarCollapsed}
          onLogout={handleLogout}
        />
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
                  background: role === 'admin' ? '#FEE2E2' : role === 'creator' ? '#EDE9FE' : '#EFF6FF',
                  color: role === 'admin' ? '#DC2626' : role === 'creator' ? '#7C3AED' : '#2563EB',
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

          {/* Right Side: Quick Portal Switchers, Notifications, Session */}
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

            <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />

            <span
              className="topbar-session-badge"
              style={{
                fontSize: '0.75rem',
                color: '#64748B',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              Active
            </span>
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


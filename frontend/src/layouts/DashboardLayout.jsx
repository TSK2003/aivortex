import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import AdminHeader from '../components/admin/AdminHeader'
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
} from 'lucide-react'

/**
 * DashboardLayout provides the structured sidebar + topbar layout used by
 * Admin, Creator, and Student portals.
 */

const ADMIN_NAV_SECTIONS = [
  {
    title: 'MAIN',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { path: '/admin/creators', label: 'Creator Management', icon: Users },
      { path: '/admin/students', label: 'Student Management', icon: GraduationCap },
      { path: '/admin/courses', label: 'Course Management', icon: BookOpen },
      { path: '/admin/playlists', label: 'Playlist & Video Management', icon: ListVideo, badgeKey: 'pendingVideos' },
      { path: '/admin/payments', label: 'Payments & Enrollments', icon: CreditCard },
    ]
  },
  {
    title: 'CONTENT / PLATFORM',
    items: [
      { path: '/admin/public-page', label: 'Public Page Management', icon: Globe },
      { path: '/admin/notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    title: 'ANALYTICS',
    items: [
      { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { path: '/admin/requests', label: 'Requests', icon: MessageSquare, badgeKey: 'pendingRequests' },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
      { path: '/admin/security', label: 'Security & Settings', icon: Shield },
    ]
  }
]

const CREATOR_NAV = [
  { path: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/creator/upload', label: 'Upload Section', icon: ListVideo },
  { path: '/creator/profile', label: 'Profile', icon: Users },
]

const STUDENT_NAV = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/courses', label: 'My Courses', icon: BookOpen },
  { path: '/student/certificates', label: 'Certificates', icon: GraduationCap },
  { path: '/student/payments', label: 'Payments', icon: CreditCard },
  { path: '/student/support', label: 'Help & Support', icon: MessageSquare },
  { path: '/student/profile', label: 'My Profile', icon: Users },
]

export default function DashboardLayout({ role = 'student' }) {
  const { user, logout } = useAuth()
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

  useEffect(() => {
    if (role === 'admin') {
      api.admin.getOverview()
        .then((res) => {
          if (res?.data?.analytics) {
            setAdminMetrics({
              pendingVideos: res.data.analytics.pendingVerificationCount || 0,
              pendingRequests: res.data.analytics.pendingRequestsCount || 0,
              recentOrders: res.data.recentOrders?.length || 0
            })
          }
        })
        .catch(() => {})
    }
  }, [role, location.pathname])

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }

  const roleLabel =
    role === 'admin' ? 'Admin Portal' : role === 'creator' ? 'Creator Portal' : 'Student Portal'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <a href="/" className="brand-logo" style={{ textDecoration: 'none' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>ApexLearn</div>
              <span className="brand-name-sub" style={{ fontSize: '0.65rem', color: 'var(--color-secondary)', fontWeight: 700, letterSpacing: '0.08em' }}>INSTITUTE OF TECH & AI</span>
            </div>
          </a>
          <button
            className="btn-ghost sidebar-close-mobile"
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User card (displayed only for student/creator, admin profile is exclusively in the top-right header) */}
        {role !== 'admin' && (
          <div className="sidebar-user-card">
            <div
              className="sidebar-user-avatar"
              style={{
                width: 38,
                height: 38,
                minWidth: 38,
                minHeight: 38,
                maxWidth: 38,
                maxHeight: 38,
                borderRadius: '50%',
                aspectRatio: '1 / 1',
                flexShrink: 0,
                background: 'var(--color-secondary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                lineHeight: 1,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || role.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info" style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div className="sidebar-user-name" title={user?.name || roleLabel}>
                {user?.name || roleLabel}
              </div>
              <div className="sidebar-user-role" title={user?.email || `${role}@apexlearn.com`}>
                {user?.email || `${role}@apexlearn.com`}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className="sidebar-nav"
          style={role === 'admin' ? { paddingTop: '16px', paddingBottom: '20px' } : undefined}
        >
          {role === 'admin' ? (
            // Admin Organised Sections: MAIN, MANAGEMENT, CONTENT, ANALYTICS, SYSTEM
            ADMIN_NAV_SECTIONS.map((section, sIndex) => (
              <div key={section.title} style={{ marginBottom: 8 }}>
                <div
                  className="sidebar-section-header"
                  style={sIndex === 0 ? { paddingTop: '4px' } : undefined}
                >
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const badgeValue = item.badgeKey ? adminMetrics[item.badgeKey] : 0

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `sidebar-nav-item ${isActive ? 'active' : ''}`
                      }
                      onClick={() => setSidebarOpen(false)}
                      title={item.label}
                    >
                      {Icon && <Icon size={18} className="sidebar-nav-icon" style={{ flexShrink: 0 }} />}
                      <span>{item.label}</span>
                      {badgeValue > 0 && (
                        <span className={`sidebar-badge ${item.badgeKey === 'pendingVideos' ? 'badge-amber' : ''}`}>
                          {badgeValue}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            ))
          ) : (
            // Student & Creator Nav
            (role === 'creator' ? CREATOR_NAV : STUDENT_NAV).map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {Icon && <Icon size={18} className="sidebar-nav-icon" style={{ flexShrink: 0 }} />}
                  <span>{item.label}</span>
                </NavLink>
              )
            })
          )}
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 'auto', padding: '14px', borderTop: '1px solid var(--color-border, #E2E8F0)' }}>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              color: '#DC2626',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
              boxSizing: 'border-box'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626',
                  flexShrink: 0
                }}
              >
                <LogOut size={15} />
              </div>
              <span className="sidebar-logout-text" style={{ letterSpacing: '0.01em' }}>Log Out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="dashboard-main">
        {/* Topbar: Use AdminHeader for Admin role; default topbar for student & creator */}
        {role === 'admin' ? (
          <AdminHeader
            onToggleSidebar={handleToggleSidebar}
            user={user}
            onLogout={handleLogout}
            pendingVideosCount={adminMetrics.pendingVideos}
            pendingRequestsCount={adminMetrics.pendingRequests}
            recentOrdersCount={adminMetrics.recentOrders}
          />
        ) : (
          <header className="dashboard-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                className="btn-ghost mobile-sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <h1 className="topbar-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                {roleLabel}
              </h1>
            </div>
            <div className="topbar-actions">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Session</span>
            </div>
          </header>
        )}

        {/* Page content */}
        <div className="dashboard-content" style={role === 'admin' ? { padding: '28px 32px', maxWidth: '1600px', width: '100%', boxSizing: 'border-box' } : undefined}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

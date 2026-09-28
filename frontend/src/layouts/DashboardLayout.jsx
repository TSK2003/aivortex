import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import NotificationDropdown from '../components/common/NotificationDropdown'
import BrandLogo from '../components/common/BrandLogo'
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
  ArrowRight,
  Menu,
  X,
  FolderGit2,
  Video,
  Award,
  Sparkles
} from 'lucide-react'

/**
 * DashboardLayout provides the sidebar + topbar layout used by
 * Admin, Creator, and Student dashboards.
 * Mirrors the existing dashboard.css sidebar/topbar structure.
 */

const ADMIN_NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/creators', label: 'Creator Management', icon: Users },
  { path: '/admin/students', label: 'Student Management', icon: GraduationCap },
  { path: '/admin/courses', label: 'Course Management', icon: BookOpen },
  { path: '/admin/playlists', label: 'Playlist & Video Mgmt', icon: ListVideo },
  { path: '/admin/payments', label: 'Payments & Enrollments', icon: CreditCard },
  { path: '/admin/public-page', label: 'Public Page Management', icon: Globe },
  { path: '/admin/notifications', label: 'Notifications', icon: Bell },
  { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/admin/requests', label: 'Requests', icon: MessageSquare },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/admin/security', label: 'Security & Settings', icon: Shield },
]

const CREATOR_NAV = [
  { path: '/creator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/creator/upload', label: 'Upload Section', icon: ListVideo },
  { path: '/creator/profile', label: 'Profile', icon: Users },
]

const STUDENT_NAV = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/courses', label: 'My Courses', icon: BookOpen },
  { path: '/student/projects', label: 'Capstone Projects', icon: FolderGit2 },
  { path: '/student/live-sessions', label: 'Live Sessions', icon: Video },
  { path: '/student/certificates', label: 'Certificates', icon: GraduationCap },
  { path: '/student/payments', label: 'Invoices & Billing', icon: CreditCard },
  { path: '/student/notifications', label: 'Notifications', icon: Bell },
  { path: '/student/support', label: 'Support & Queries', icon: MessageSquare },
  { path: '/student/profile', label: 'Account Profile', icon: Users },
]

export default function DashboardLayout({ role = 'student' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems =
    role === 'admin' ? ADMIN_NAV : role === 'creator' ? CREATOR_NAV : STUDENT_NAV

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
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <BrandLogo size="sm" />
          </a>
          <button
            className="btn-ghost sidebar-close-mobile"
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'none' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User card */}
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

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
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
          })}
        </nav>

        {/* Student Academic Standing & Quick Support Card */}
        {role === 'student' && (
          <div
            style={{
              margin: '12px 14px 10px 14px',
              padding: '14px',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
              borderRadius: '12px',
              border: '1px solid #DBEAFE',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.04)',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: '#DBEAFE',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Award size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                  Verified Scholar
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                  Institute of Tech & AI
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTop: '1px solid #E2E8F0',
                fontSize: '0.72rem',
                color: '#64748B'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
                Academic Track
              </span>
              <span style={{ fontWeight: 700, color: '#2563EB' }}>Active</span>
            </div>
          </div>
        )}

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
              <span style={{ letterSpacing: '0.01em' }}>Log Out</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="dashboard-main">
        {/* Topbar */}
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
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <NotificationDropdown />
            <div style={{ width: 1, height: 22, background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Active Session</span>
          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

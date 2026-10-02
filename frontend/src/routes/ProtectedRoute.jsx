import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute — Route Guard for Role-Based Access Control (RBAC)
 * Validates authentication status and checks allowed roles.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px auto' }}></div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Verifying Security Permissions...</p>
        </div>
      </div>
    )
  }

  // Direct localStorage fallback to prevent race condition during router navigation
  let storedUser = null
  try {
    const raw = localStorage.getItem('apex_user')
    if (raw) storedUser = JSON.parse(raw)
  } catch {
    storedUser = null
  }

  const currentUser = user || storedUser
  const isAuth = isAuthenticated || Boolean(currentUser)

  // Normalize role from context, user object, or localStorage
  const effectiveRole = (role || currentUser?.role || '').toLowerCase()
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase())

  if (!isAuth || !effectiveRole) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user role is not allowed for this route, redirect to their authorized dashboard
  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(effectiveRole)) {
    // Admins have universal preview access to student and creator routes
    if (effectiveRole === 'admin') {
      return children
    }

    let fallbackDashboard = '/student/dashboard'
    if (effectiveRole === 'creator') fallbackDashboard = '/creator/dashboard'
    else if (effectiveRole === 'admin') fallbackDashboard = '/admin/dashboard'

    // Prevent redirect loop if already on fallback path
    if (location.pathname.startsWith(fallbackDashboard)) {
      return children
    }

    return <Navigate to={fallbackDashboard} replace />
  }

  return children
}

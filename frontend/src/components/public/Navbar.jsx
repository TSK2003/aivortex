import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BrandLogo from '../common/BrandLogo'
import {
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  User,
  Video,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react'

/**
 * Navbar — Streamlined & Visually Crisp Navigation
 * Eliminates horizontal wrapping, guarantees clear visual hierarchy,
 * and provides one-click portal switching for Student, Creator, and Admin.
 */
export default function Navbar() {
  const { isAuthenticated, user, isStudent, isCreator, isAdmin, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollDirection, setScrollDirection] = useState('none')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const userRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0

          // Smooth Apple Dynamic Island hysteresis transition
          setScrolled((prev) => {
            if (currentScrollY > 24) return true
            if (currentScrollY < 10) return false
            return prev
          })

          if (Math.abs(currentScrollY - lastScrollY.current) > 6) {
            setScrollDirection(currentScrollY > lastScrollY.current ? 'down' : 'up')
            lastScrollY.current = currentScrollY
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus and drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
    { to: '/projects', label: 'Projects' },
    { to: '/live-sessions', label: 'Live Sessions' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard'
    if (isCreator) return '/creator/dashboard'
    return '/student/dashboard'
  }

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', color: '#DC2626', bg: '#FEE2E2' }
    if (isCreator) return { label: 'Creator', color: '#7C3AED', bg: '#EDE9FE' }
    return { label: 'Student', color: '#2563EB', bg: '#EFF6FF' }
  }

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (document.body) document.body.scrollTop = 0
  }

  const roleInfo = getRoleBadge()

  return (
    <header
      id="site-header"
      className={`site-header ${scrolled ? 'scrolled' : ''} ${scrollDirection === 'down' ? 'scroll-down' : 'scroll-up'}`}
    >
      <div className="container header-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>

        {/* Brand Logo with Smooth Dynamic Scale */}
        <Link
          to="/"
          id="header-brand-link"
          style={{
            flexShrink: 0,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            transform: scrolled ? 'scale(0.92)' : 'scale(1)',
            transformOrigin: 'left center',
            transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={handleNavClick}
        >
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-wrap" style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', margin: '0 16px' }}>
          <ul className="nav-menu" style={{ display: 'flex', alignItems: 'center', gap: scrolled ? 'clamp(8px, 1.1vw, 18px)' : 'clamp(10px, 1.3vw, 22px)', margin: 0, padding: 0, transition: 'gap 0.35s ease' }}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  end={link.to === '/'}
                  style={{
                    fontSize: scrolled ? '0.84rem' : '0.875rem',
                    fontWeight: 500,
                    transition: 'font-size 0.35s ease, color 0.2s ease'
                  }}
                  onClick={handleNavClick}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Side Actions */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: scrolled ? 8 : 10, flexShrink: 0, transition: 'gap 0.35s ease' }}>

          {/* Authenticated vs Guest Actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* User Dropdown Avatar */}
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: `2px solid ${roleInfo.color}`,
                      background: roleInfo.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                    title={user?.name || user?.email}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown
                    size={13}
                    style={{
                      color: 'var(--color-text-secondary)',
                      transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: 220,
                      background: '#FFFFFF',
                      borderRadius: 8,
                      boxShadow: 'var(--shadow-dropdown)',
                      border: '1px solid #E2E8F0',
                      padding: 8,
                      zIndex: 1000,
                      animation: 'fadeInMenu 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}>{user?.name || 'User'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.email}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: roleInfo.bg,
                            color: roleInfo.color,
                            display: 'inline-block',
                          }}
                        >
                          {roleInfo.label.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        color: 'var(--color-text)',
                        textDecoration: 'none',
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LayoutDashboard size={14} />
                      <span>My Dashboard</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        color: '#DC2626',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        cursor: 'pointer',
                        borderRadius: 6,
                        fontWeight: 700,
                        marginTop: 6,
                        transition: 'all 0.2s ease',
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
                        <div style={{ width: 22, height: 22, borderRadius: 4, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LogOut size={13} style={{ color: '#DC2626' }} />
                        </div>
                        <span>Log Out</span>
                      </div>
                      <ArrowRight size={14} style={{ color: '#DC2626', strokeWidth: 2.5 }} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="header-guest-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: scrolled ? 8 : 10,
                transition: 'gap 0.3s ease'
              }}
            >
              <Link
                to="/login"
                className="btn btn-outline-blue btn-sm"
                id="header-btn-login"
                style={{
                  padding: scrolled ? '6px 16px' : '7px 18px',
                  fontWeight: 600,
                  fontSize: scrolled ? '0.82rem' : '0.85rem',
                  borderRadius: scrolled ? 9999 : 6,
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={handleNavClick}
              >
                Login
              </Link>
              <Link
                to="/courses"
                className="btn btn-primary btn-sm"
                id="header-btn-get-started"
                style={{
                  padding: scrolled ? '6px 16px' : '7px 18px',
                  fontWeight: 600,
                  fontSize: scrolled ? '0.82rem' : '0.85rem',
                  borderRadius: scrolled ? 9999 : 6,
                  boxShadow: scrolled ? '0 4px 12px rgba(37, 99, 235, 0.28)' : '0 2px 6px rgba(37, 99, 235, 0.15)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={handleNavClick}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            id="mobile-menu-toggle"
            className="mobile-menu-btn"
            aria-label="Toggle Navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        id="mobile-drawer-overlay"
        className={`mobile-drawer-overlay ${drawerOpen ? 'active' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile Slide-out Drawer */}
      <div id="mobile-drawer" className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setDrawerOpen(false)}>
            <BrandLogo size="sm" />
          </Link>
          <button
            id="mobile-drawer-close"
            className="btn-ghost"
            style={{ fontSize: '1.25rem' }}
            onClick={() => setDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Public Navigation */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}>
            Navigation
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="mobile-nav-link"
                  style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}
                  onClick={() => {
                    setDrawerOpen(false)
                    handleNavClick()
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/faq"
                className="mobile-nav-link"
                style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}
                onClick={() => {
                  setDrawerOpen(false)
                  handleNavClick()
                }}
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Drawer Footer Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath()} className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setDrawerOpen(false); handleNavClick(); }}>
                Open Dashboard ({roleInfo.label})
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 6,
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <LogOut size={16} color="#DC2626" />
                  <span>Log Out</span>
                </div>
                <ArrowRight size={16} color="#DC2626" style={{ strokeWidth: 2.5 }} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ width: '100%' }} onClick={() => { setDrawerOpen(false); handleNavClick(); }}>
                Login
              </Link>
              <Link to="/courses" className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setDrawerOpen(false); handleNavClick(); }}>
                Explore Courses
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

import { Outlet } from 'react-router-dom'
import Navbar from '../components/public/Navbar'
import Footer from '../components/public/Footer'

/**
 * PublicLayout wraps all public-facing pages (Home, Courses, About, Contact, etc.)
 * with the site header/navigation and footer.
 */
export default function PublicLayout() {
  return (
    <div className="public-layout-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      {/* Spacer so page content starts cleanly below the fixed navbar */}
      <div className="site-header-spacer" style={{ height: 68, flexShrink: 0 }} aria-hidden="true" />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

import { Outlet } from 'react-router-dom'
import Navbar from '../components/public/Navbar'
import Footer from '../components/public/Footer'

/**
 * PublicLayout wraps all public-facing pages (Home, Courses, About, Contact, etc.)
 * with the site header/navigation and footer.
 */
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

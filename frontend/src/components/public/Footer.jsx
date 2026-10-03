import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import api from '../../services/api'
import defaultFooterData from '../../data/defaultFooterData'

export default function Footer() {
  const location = useLocation()
  const [footer, setFooter] = useState(defaultFooterData)

  useEffect(() => {
    let isMounted = true
    async function fetchFooter() {
      try {
        const res = await api.public.getFooter()
        if (isMounted && res.data?.footer) {
          setFooter(res.data.footer)
        }
      } catch (err) {
        console.warn('Using default footer data:', err.message)
      }
    }
    fetchFooter()
    return () => {
      isMounted = false
    }
  }, [])

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      if (document.body) document.body.scrollTop = 0
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      if (document.body) document.body.scrollTop = 0
    }
  }

  const handleLinkClick = (path) => (e) => {
    if (location.pathname === path) {
      e.preventDefault()
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      if (document.body) document.body.scrollTop = 0
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      if (document.body) document.body.scrollTop = 0
    }
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-brand">
            <Link to="/" onClick={handleHomeClick} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 12 }}>
              <BrandLogo size="md" animated={true} />
            </Link>
            <p className="footer-desc">
              {footer.brandDesc || defaultFooterData.brandDesc}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="footer-heading">{footer.quickLinksTitle || 'Quick Links'}</h4>
            <ul className="footer-links">
              {(footer.quickLinks || defaultFooterData.quickLinks).map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="footer-link"
                    onClick={link.path === '/' ? handleHomeClick : handleLinkClick(link.path)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Our Courses */}
          <div>
            <h4 className="footer-heading">{footer.coursesTitle || 'Our Courses'}</h4>
            <ul className="footer-links">
              {(footer.coursesLinks || defaultFooterData.coursesLinks).map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="footer-link"
                    onClick={handleLinkClick(link.path)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div>
            <h4 className="footer-heading">{footer.contactTitle || 'Contact Us'}</h4>
            <ul className="footer-links">
              {(footer.contactLinks || defaultFooterData.contactLinks).map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="footer-link"
                    onClick={handleLinkClick(link.path)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            {(footer.copyrightText || `© ${new Date().getFullYear()} Aivortex. All rights reserved. Learn. Grow. Innovate.`).replace(/\s*[•·]\s*/g, ' ')}
          </p>
        </div>
      </div>
    </footer>
  )
}

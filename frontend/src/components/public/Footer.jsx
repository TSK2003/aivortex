import { Link, useLocation } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import BrandLogo from '../common/BrandLogo'

export default function Footer() {
  const location = useLocation()

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
              <BrandLogo theme="dark" size="md" />
            </Link>
            <p className="footer-desc">
              A premier technical education platform empowering aspiring data scientists, AI engineers, and software developers through hands-on domain projects, live weekend cohorts, and verified certifications.
            </p>
            <div className="footer-cert-badge">
              <ShieldCheck style={{ width: 16, height: 16, color: 'var(--color-success)' }} />
              <span>ISO 9001:2015 Certified Educational Provider</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link" onClick={handleHomeClick}>Home</Link></li>
              <li><Link to="/courses" className="footer-link" onClick={handleLinkClick('/courses')}>Courses Catalog</Link></li>
              <li><Link to="/projects" className="footer-link" onClick={handleLinkClick('/projects')}>Domain Projects</Link></li>
              <li><Link to="/live-sessions" className="footer-link" onClick={handleLinkClick('/live-sessions')}>Live Weekend Cohorts</Link></li>
              <li><Link to="/certificates" className="footer-link" onClick={handleLinkClick('/certificates')}>Certificates & Verification</Link></li>
            </ul>
          </div>

          {/* Col 3: Learning Paths */}
          <div>
            <h4 className="footer-heading">Technology Paths</h4>
            <ul className="footer-links">
              <li><Link to="/courses/python-for-data-science" className="footer-link" onClick={handleLinkClick('/courses/python-for-data-science')}>Python for Data Science</Link></li>
              <li><Link to="/courses/deep-learning-neural-architectures" className="footer-link" onClick={handleLinkClick('/courses/deep-learning-neural-architectures')}>Artificial Intelligence & LLMs</Link></li>
              <li><Link to="/courses/python-for-machine-learning" className="footer-link" onClick={handleLinkClick('/courses/python-for-machine-learning')}>Applied Machine Learning</Link></li>
              <li><Link to="/courses/web-fullstack-development" className="footer-link" onClick={handleLinkClick('/courses/web-fullstack-development')}>Web & Full-Stack Development</Link></li>
              <li><Link to="/courses/cloud-mlops-infrastructure" className="footer-link" onClick={handleLinkClick('/courses/cloud-mlops-infrastructure')}>Cloud & MLOps Infrastructure</Link></li>
              <li><Link to="/courses/algorithmic-trading-python" className="footer-link" onClick={handleLinkClick('/courses/algorithmic-trading-python')}>Algorithmic Quant Trading</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & Security */}
          <div>
            <h4 className="footer-heading">Support & Legal</h4>
            <ul className="footer-links">
              <li><Link to="/login" className="footer-link" onClick={handleLinkClick('/login')}>Portal Login</Link></li>
              <li><Link to="/student/signup" className="footer-link" onClick={handleLinkClick('/student/signup')}>Student Registration</Link></li>
              <li><Link to="/about" className="footer-link" onClick={handleLinkClick('/about')}>About Us</Link></li>
              <li><Link to="/contact" className="footer-link" onClick={handleLinkClick('/contact')}>Contact Support</Link></li>
              <li><Link to="/privacy" className="footer-link" onClick={handleLinkClick('/privacy')}>Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link" onClick={handleLinkClick('/terms')}>Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © 2026 aivortex. All rights reserved. • Learn. Grow. Innovate.
          </p>
        </div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { GraduationCap, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-brand">
            <Link to="/" className="brand-logo footer-logo">
              <div className="brand-icon">
                <GraduationCap style={{ width: 20, height: 20 }} />
              </div>
              <div>
                ApexLearn
                <span className="brand-name-sub">INSTITUTE OF TECH & AI</span>
              </div>
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
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/courses" className="footer-link">Courses Catalog</Link></li>
              <li><Link to="/projects" className="footer-link">Domain Projects</Link></li>
              <li><Link to="/live-sessions" className="footer-link">Live Weekend Cohorts</Link></li>
              <li><Link to="/about" className="footer-link">About ApexLearn</Link></li>
              <li><Link to="/certificates" className="footer-link">Certificates & Verification</Link></li>
            </ul>
          </div>

          {/* Col 3: Learning Paths */}
          <div>
            <h4 className="footer-heading">Technology Paths</h4>
            <ul className="footer-links">
              <li><Link to="/courses" className="footer-link">Python for Data Science</Link></li>
              <li><Link to="/courses" className="footer-link">Artificial Intelligence & LLMs</Link></li>
              <li><Link to="/courses" className="footer-link">Applied Machine Learning</Link></li>
              <li><Link to="/courses" className="footer-link">Web & Full-Stack Development</Link></li>
              <li><Link to="/courses" className="footer-link">Cloud & MLOps Infrastructure</Link></li>
              <li><Link to="/courses" className="footer-link">Algorithmic Quant Trading</Link></li>
            </ul>
          </div>

          {/* Col 4: Support & Security */}
          <div>
            <h4 className="footer-heading">Support & Legal</h4>
            <ul className="footer-links">
              <li><Link to="/login" className="footer-link">Portal Login</Link></li>
              <li><Link to="/student/signup" className="footer-link">Student Registration</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Support</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © 2026 ApexLearn Institute of Technology & AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

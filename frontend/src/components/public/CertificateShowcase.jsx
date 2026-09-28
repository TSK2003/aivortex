import { useState } from 'react'
import BrandLogo from '../common/BrandLogo'

export default function CertificateShowcase({ onVerifyCert }) {
  const [certId, setCertId] = useState('CERT-PYDS-2026-9042')

  const handleVerify = (e) => {
    e.preventDefault()
    if (onVerifyCert && certId.trim()) {
      onVerifyCert(certId.trim())
    }
  }

  return (
    <section className="section" id="certificate" style={{ padding: '64px 0 80px 0' }}>
      <div className="container">
        <div className="certificate-showcase-grid">
          {/* Left: Certificate Mockup */}
          <div className="certificate-mockup" style={{ border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
            <div className="certificate-inner-border">
              <div className="cert-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <BrandLogo size="sm" />
              </div>
              <div className="cert-header">Certificate of Specialization & Excellence</div>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 8 }}>This is to proudly certify that</p>

              <div className="cert-name">Rahul Sharma</div>

              <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 4 }}>
                has successfully fulfilled all curriculum requirements for
              </p>
              <div className="cert-course">Python for Data Science Specialization</div>

              <div className="cert-seal" style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px auto', fontWeight: 800, fontSize: '0.7rem', color: '#2563EB', textAlign: 'center' }}>
                <img src="/company-logo-transparent.png" alt="aivortex" style={{ width: 24, height: 24, objectFit: 'contain' }} />
              </div>

              <div className="cert-meta-row">
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>Dr. Vikram Sen</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Lead AI Scientist</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                    ID: CERT-PYDS-2026-9042
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>
                    Digitally Signed & Verified
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>March 10, 2026</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Issued Date</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details & Verification Tool */}
          <div>
            <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 14 }}>
              SHOW WHAT YOU'VE <span className="highlight-blue" style={{ color: '#2563EB' }}>ACHIEVED</span>
            </h2>
            <p style={{ color: '#64748B', marginBottom: 28, fontSize: '1.05rem', lineHeight: 1.6 }}>
              Demonstrate your technical competence to tech recruiters and engineering managers with immutable, verifiable digital certificates.
            </p>

            <ul className="cert-features-list" style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>01</span>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>Verified Certificate ID</strong>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '4px 0 0 0', lineHeight: 1.5 }}>Each issued certificate contains a unique alphanumeric hash recognized globally.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>02</span>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>LinkedIn & Resume One-Click Share</strong>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '4px 0 0 0', lineHeight: 1.5 }}>Add directly to your LinkedIn licenses & certifications profile with one tap.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2563EB', marginTop: 2 }}>03</span>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>High-Resolution Vector Export</strong>
                  <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '4px 0 0 0', lineHeight: 1.5 }}>Download print-ready PDF and high-definition PNG format whenever needed.</p>
                </div>
              </li>
            </ul>

            {/* Instant ID Verification Box */}
            <form onSubmit={handleVerify} className="cert-verify-box" style={{ display: 'flex', gap: 10, background: '#FFFFFF', padding: 6, borderRadius: 12, border: '1px solid #CBD5E1' }}>
              <input
                type="text"
                id="cert-search-input"
                placeholder="Enter Certificate ID (e.g. CERT-PYDS-2026-9042)"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                style={{ flex: 1, border: 'none', padding: '10px 14px', fontSize: '0.9rem', outline: 'none' }}
              />
              <button
                type="submit"
                id="cert-verify-submit-btn"
                className="btn btn-primary btn-sm"
                style={{ padding: '8px 20px', fontWeight: 700 }}
              >
                Verify Certificate
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

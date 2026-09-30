import { useState } from 'react'
import AivortexCertificate from '../common/AivortexCertificate'
import CertificateModal from '../modals/CertificateModal'
import { Eye, ExternalLink } from 'lucide-react'

export default function CertificateShowcase({ onVerifyCert }) {
  const [certId, setCertId] = useState('AVT-2025-001')
  const [modalOpen, setModalOpen] = useState(false)

  const handleVerify = (e) => {
    e.preventDefault()
    if (onVerifyCert && certId.trim()) {
      onVerifyCert(certId.trim())
    }
  }

  return (
    <section className="section" id="certificate" style={{ padding: '64px 0 80px 0' }}>
      <div className="container">
        <div className="certificate-showcase-grid" style={{ alignItems: 'center' }}>
          {/* Left: Certificate Mockup */}
          <div style={{ position: 'relative' }}>
            <div
              className="certificate-interactive-card"
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.25)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => setModalOpen(true)}
              title="Click to expand high-resolution certificate"
            >
              <AivortexCertificate
                studentName="You"
                courseTitle="AI & Emerging Technologies Program"
                certificateCode="AVT-2025-001"
                issueDate="2025-09-26"
              />
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-outline btn-sm"
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.75rem',
                zIndex: 10
              }}
            >
              <Eye size={13} />
              <span>Expand & Print</span>
            </button>
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

      <CertificateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        studentName="You"
        courseTitle="AI & Emerging Technologies Program"
        certificateCode="AVT-2025-001"
        issueDate="2025-09-26"
      />
    </section>
  )
}

import { X, Printer } from 'lucide-react'

export default function CertVerifyModal({ certId, cert, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" id="cert-verify-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 600 }}
        role="dialog"
        aria-label="Certificate Verification"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ padding: 32, textAlign: 'center' }}>
          {cert ? (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: '#DCFCE7',
                  color: '#16A34A',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  fontSize: '2rem'
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>OK</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: 6 }}>
                Verified Authentic Credential
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                This certificate record exists in the immutable ApexLearn verification registry.
              </p>

              <div
                style={{
                  background: 'var(--color-bg-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 20,
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  marginBottom: 24
                }}
              >
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    Recipient
                  </div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{cert.studentName}</strong>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    Course Specialization
                  </div>
                  <strong style={{ color: 'var(--color-secondary)' }}>{cert.courseTitle}</strong>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 10
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Credential ID</div>
                    <strong style={{ fontFamily: 'monospace' }}>{cert.id}</strong>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Issued On</div>
                    <strong>{cert.issueDate}</strong>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ width: '100%' }}
              >
                <span>Print / Download Certificate</span>
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  display: 'inline-block',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.05em',
                  margin: '0 auto 16px auto'
                }}
              >
                NOT FOUND
              </div>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-error)', marginBottom: 6 }}>
                Credential Not Found
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                No record found matching the ID: <strong>&quot;{certId}&quot;</strong>. Please check the spelling or format.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 24 }}>
                Try searching with sample valid ID:{' '}
                <code style={{ background: '#E2E8F0', padding: '2px 6px', borderRadius: 4 }}>
                  CERT-PYDS-2026-9042
                </code>
              </p>
              <button className="btn btn-outline" onClick={onClose} style={{ width: '100%' }}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

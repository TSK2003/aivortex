import { X, Printer, ShieldCheck } from 'lucide-react'
import AivortexCertificate from '../common/AivortexCertificate'

export default function CertVerifyModal({ certId, cert, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" id="cert-verify-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 940, width: '95%' }}
        role="dialog"
        aria-label="Certificate Verification"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ padding: 24, textAlign: 'center' }}>
          {cert ? (
            <>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#DCFCE7',
                  color: '#166534',
                  borderRadius: 20,
                  padding: '6px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: 12
                }}
              >
                <ShieldCheck size={18} color="#16A34A" />
                <span>Verified Official Credential</span>
              </div>

              <div style={{ margin: '14px 0 20px 0', overflowX: 'auto' }}>
                <AivortexCertificate
                  studentName={cert.studentName}
                  courseTitle={cert.courseTitle}
                  certificateCode={cert.certificateCode || cert.id || certId}
                  issueDate={cert.issueDate}
                  isPrintTarget={true}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => window.print()}
                  style={{ minWidth: 200 }}
                >
                  <Printer size={16} />
                  <span>Print / Save as PDF</span>
                </button>
                <button className="btn btn-outline" onClick={onClose}>
                  Close
                </button>
              </div>
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

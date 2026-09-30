import React, { useState } from 'react'
import { X, Printer, Check, Copy, ExternalLink, ShieldCheck, Download } from 'lucide-react'
import AivortexCertificate from '../common/AivortexCertificate'

export default function CertificateModal({
  isOpen,
  onClose,
  certificate,
  studentName,
  courseTitle,
  certificateCode,
  issueDate
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Extract certificate attributes from props or certificate object
  const recipient =
    studentName ||
    certificate?.studentName ||
    certificate?.student?.name ||
    'Rahul Sharma'

  const title =
    courseTitle ||
    certificate?.courseTitle ||
    certificate?.course?.title ||
    'AI & Emerging Technologies Program'

  const code =
    certificateCode ||
    certificate?.certificateCode ||
    certificate?.id ||
    'AVT-2025-001'

  const date =
    issueDate ||
    certificate?.issueDate ||
    certificate?.createdAt ||
    '2025-09-26'

  const handlePrint = () => {
    window.print()
  }

  const handleCopyId = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog cert-modal-container"
        style={{
          width: '100%',
          maxWidth: '980px',
          background: '#0F172A',
          borderRadius: 16,
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          border: '1px solid #334155',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Official Aivortex Certificate"
      >
        {/* Top Control Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #1E293B',
            background: '#0B1120',
            color: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22C55E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFFFFF' }}>
                Official Verified Credential
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Format ID: {code}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleCopyId}
              type="button"
              className="btn btn-outline btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderColor: '#334155',
                color: '#E2E8F0',
                background: '#1E293B',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Copy Certificate ID"
            >
              {copied ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '0.78rem',
                padding: '6px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div
          style={{
            padding: '24px 20px',
            background: '#090D16',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflowX: 'auto'
          }}
        >
          <AivortexCertificate
            studentName={recipient}
            courseTitle={title}
            certificateCode={code}
            issueDate={date}
            isPrintTarget={true}
          />
        </div>

        {/* Bottom Helper Bar */}
        <div
          style={{
            padding: '12px 20px',
            background: '#0B1120',
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            To save as PDF, select <strong style={{ color: '#F1F5F9' }}>Save as PDF</strong> in your browser&apos;s print dialogue and set orientation to <strong style={{ color: '#F1F5F9' }}>Landscape</strong>.
          </div>
          <a
            href={`/certificates?code=${encodeURIComponent(code)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              color: '#38BDF8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <span>Public Verification Page</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  )
}

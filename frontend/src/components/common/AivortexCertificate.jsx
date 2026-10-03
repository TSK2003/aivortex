import React from 'react'
import './AivortexCertificate.css'

/**
 * AivortexCertificate Component
 * 
 * Exact 1:1 reproduction of the official Aivortex Certificate of Completion.
 * Features:
 * - Geometric faceted diagonal corner art (Top-Left & Bottom-Right)
 * - Inner precision frame border
 * - Authentic Aivortex chevron emblem & wordmark
 * - Serif 'CERTIFICATE OF COMPLETION' typography with gold divider accents
 * - Candidate Name ('You' or dynamic student name)
 * - Completion statement
 * - Course Specialization Title
 * - Executive Signatures:
 *    - Saravanan Srinivasan (CEO)
 *    - Rajkumar Periyasamy (Program Director)
 * - Completion date & Certificate ID
 */
export default function AivortexCertificate({
  studentName = 'Rahul Sharma',
  courseTitle = 'AI & Emerging Technologies Program',
  certificateCode = 'AVT-2025-001',
  issueDate = '2025-09-26',
  ceoName = 'SARAVANAN SRINIVASAN',
  directorName = 'RAJKUMAR PERIYASAMY',
  className = '',
  style = {},
  isPrintTarget = false,
  ...props
}) {
  // Format Date to: "26 SEP 2025"
  const formattedDate = (() => {
    try {
      if (!issueDate) return '26 SEP 2025'
      const d = new Date(issueDate)
      if (isNaN(d.getTime())) return String(issueDate).toUpperCase()
      const day = String(d.getDate()).padStart(2, '0')
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
      const year = d.getFullYear()
      return `${day} ${month} ${year}`
    } catch {
      return '26 SEP 2025'
    }
  })()

  // Clean Certificate Code
  const displayCertId = certificateCode || 'AVT-2025-001'

  return (
    <div
      className={`aivortex-cert-wrapper ${isPrintTarget ? 'aivortex-cert-print-target' : ''} ${className}`}
      style={style}
      {...props}
    >
      <div className="aivortex-cert-container">
        {/* ================================================================
            1. TOP-LEFT GEOMETRIC FACETED CORNER
            ================================================================ */}
        <svg
          className="cert-corner-artwork cert-corner-tl"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Main outermost dark facet */}
          <path d="M0 0H185L0 185V0Z" fill="#111827" />
          {/* Layered angular facet */}
          <path d="M0 0H135L0 135V0Z" fill="#1F2937" />
          {/* Inner faceted slice */}
          <path d="M0 0H90L0 90V0Z" fill="#0F172A" />
          {/* Crisp angled accent line */}
          <path d="M192 0L0 192" stroke="#CBD5E1" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M142 0L0 142" stroke="#94A3B8" strokeWidth="1" strokeOpacity="0.5" />
          {/* Tiny gold highlight line */}
          <path d="M96 0L0 96" stroke="#C5A880" strokeWidth="1" strokeOpacity="0.75" />
        </svg>

        {/* ================================================================
            2. BOTTOM-RIGHT GEOMETRIC FACETED CORNER
            ================================================================ */}
        <svg
          className="cert-corner-artwork cert-corner-br"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outermost dark facet */}
          <path d="M200 200H15L200 15V200Z" fill="#111827" />
          {/* Layered angular facet */}
          <path d="M200 200H65L200 65V200Z" fill="#1F2937" />
          {/* Inner faceted slice */}
          <path d="M200 200H110L200 110V200Z" fill="#0F172A" />
          {/* Crisp angled accent lines */}
          <path d="M8 200L200 8" stroke="#CBD5E1" strokeWidth="1.5" strokeOpacity="0.4" />
          <path d="M58 200L200 58" stroke="#94A3B8" strokeWidth="1" strokeOpacity="0.5" />
          {/* Tiny gold highlight line */}
          <path d="M104 200L200 104" stroke="#C5A880" strokeWidth="1" strokeOpacity="0.75" />
        </svg>

        {/* ================================================================
            3. INNER PRECISION BORDER
            ================================================================ */}
        <div className="cert-inner-frame" aria-hidden="true" />

        {/* ================================================================
            4. CERTIFICATE CONTENT
            ================================================================ */}
        <div className="cert-content">
          {/* Header Brand */}
          <div className="cert-brand-header">
            {/* Aivortex Vector Chevron Emblem */}
            <svg
              className="cert-brand-logo-icon"
              viewBox="0 0 46 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 35L22.8 5L27 14L19.5 35H13.5Z"
                fill="#111827"
              />
              <path
                d="M32.5 35L22.8 5L28 5L39 35H32.5Z"
                fill="#111827"
              />
            </svg>
            <div className="cert-brand-name">aivortex</div>
            <div className="cert-brand-tagline">LEARN. GROW. INNOVATE.</div>
          </div>

          {/* Title Block */}
          <div className="cert-title-section">
            <h1 className="cert-main-title">CERTIFICATE</h1>
            <div className="cert-sub-title-row">
              <span className="cert-gold-rule" />
              <span className="cert-sub-title">OF COMPLETION</span>
              <span className="cert-gold-rule" />
            </div>
          </div>

          {/* Recipient Block */}
          <div style={{ width: '100%' }}>
            <div className="cert-certifies-that">THIS CERTIFIES THAT</div>
            <div className="cert-recipient-name">{studentName || 'Candidate Name'}</div>
            <p className="cert-completion-statement">
              has successfully completed the learning program at Aivortex
              <br />
              and demonstrated dedication, consistency and a commitment to growth.
            </p>
          </div>

          {/* Course & Recognition Block */}
          <div style={{ width: '100%' }}>
            <div className="cert-completion-of-tag">COMPLETION OF</div>
            <div className="cert-course-title">{courseTitle || 'Curriculum Specialization'}</div>
            <p className="cert-recognition-text">
              This certificate is awarded in recognition of your hard work,
              <br />
              perseverance and successful completion of the program.
            </p>
          </div>

          {/* Signatures & Metadata Bottom Row */}
          <div className="cert-bottom-row">
            {/* CEO Signature */}
            <div className="cert-sig-block">
              <div className="cert-signature-hand">Saravanan Srinivasan</div>
              <div className="cert-sig-line" />
              <div className="cert-sig-name">{ceoName}</div>
              <div className="cert-sig-role">CEO</div>
            </div>

            {/* Center Meta: Date & Certificate ID */}
            <div className="cert-center-meta">
              <div className="cert-date-header-row">
                <span className="cert-date-gold-rule" />
                <span className="cert-date-label">DATE OF COMPLETION</span>
                <span className="cert-date-gold-rule" />
              </div>
              <div className="cert-date-value">{formattedDate}</div>
              <div className="cert-id-tag">
                CERTIFICATE ID: <span>{displayCertId}</span>
              </div>
            </div>

            {/* Program Director Signature */}
            <div className="cert-sig-block">
              <div className="cert-signature-hand">Rajkumar Periyasamy</div>
              <div className="cert-sig-line" />
              <div className="cert-sig-name">{directorName}</div>
              <div className="cert-sig-role">PROGRAM DIRECTOR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

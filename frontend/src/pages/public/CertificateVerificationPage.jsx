import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Award, CheckCircle2, XCircle, Search, ShieldCheck, Calendar, User, BookOpen, Lock, Globe, FileCheck, Printer } from 'lucide-react'
import api from '../../services/api'
import AivortexCertificate from '../../components/common/AivortexCertificate'

export default function CertificateVerificationPage() {
  const [searchParams] = useSearchParams()
  const [certId, setCertId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const sampleIds = [
    { id: 'AVT-2025-001', course: 'AI & Emerging Technologies Program' },
    { id: 'CERT-PYDS-2026-9042', course: 'Python for Data Science Specialization' }
  ]

  useEffect(() => {
    const codeParam = searchParams.get('code')
    if (codeParam) {
      setCertId(codeParam)
      runVerification(codeParam)
    }
  }, [searchParams])

  const runVerification = async (targetId) => {
    const idToVerify = targetId || certId
    if (!idToVerify.trim()) return

    setLoading(true)
    setSearched(true)
    setResult(null)

    try {
      // Authoritative backend certificate verification against PostgreSQL
      const response = await api.public.verifyCertificate(encodeURIComponent(idToVerify.trim().toUpperCase()))
      if (response && response.success && response.data?.certificate) {
        const cert = response.data.certificate
        setResult({
          valid: true,
          certificateId: cert.certificateCode,
          studentName: cert.studentName,
          courseTitle: cert.courseTitle,
          issuedAt: new Date(cert.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          status: cert.status,
          verifiedBy: 'aivortex Academic Accreditation Board'
        })
      } else {
        setResult({
          valid: false,
          error: 'No active credential matches this Certificate ID in the official registry.'
        })
      }
    } catch (err) {
      setResult({
        valid: false,
        error: err.message || 'No active credential matches this Certificate ID in the official registry.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = (e) => {
    e.preventDefault()
    runVerification(certId)
  }

  const handleSampleClick = (sampleId) => {
    setCertId(sampleId)
    runVerification(sampleId)
  }

  const verificationFeatures = [
    {
      title: 'Cryptographic Immutability',
      desc: 'Each certificate is anchored by an indelible serial hash linked directly to our academic registry.'
    },
    {
      title: 'Instant Enterprise Lookup',
      desc: 'Hiring partners and universities can validate completed competencies in real time without delays.'
    },
    {
      title: 'Accredited Curriculum',
      desc: 'Issued under strict evaluation criteria requiring proctored assignments and production capstones.'
    }
  ]

  return (
    <div className="certificate-verification-page" style={{ paddingTop: 36, paddingBottom: 56 }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 28px auto' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.25rem)', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Verify Credential Authenticity
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Validate the authenticity of certifications awarded by aivortex. Enter the unique Certificate ID printed on the document.
          </p>
        </div>

        {/* Verification Input Box */}
        <div
          className="card"
          style={{
            maxWidth: 640,
            margin: '0 auto 28px auto',
            padding: 'clamp(18px, 4vw, 28px)',
            borderRadius: 16,
            boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.06)',
            border: '1px solid var(--color-border)',
            background: '#FFFFFF'
          }}
        >
          <form onSubmit={handleVerify}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', marginBottom: 8 }}>
                Certificate ID / Serial Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CERT-PYDS-2026-9042"
                className="form-control"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  fontSize: '0.95rem',
                  borderRadius: 10,
                  border: '1.5px solid #CBD5E1',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Search size={18} />
              <span>{loading ? 'Querying Official Academic Registry...' : 'Verify Credential'}</span>
            </button>
          </form>

          {/* Sample quick test tags */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Sample Seeded Credential:
            </span>
            {sampleIds.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSampleClick(item.id)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  color: 'var(--color-primary)'
                }}
              >
                {item.id}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Result Card */}
        {searched && !loading && (
          <div style={{ maxWidth: 940, margin: '0 auto 36px auto' }}>
            {result?.valid ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1.5px solid #22C55E',
                  padding: 'clamp(20px, 3vw, 32px)',
                  boxShadow: '0 8px 30px -4px rgba(34, 197, 94, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16A34A',
                        flexShrink: 0
                      }}
                    >
                      <CheckCircle2 size={26} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', margin: 0 }}>
                        Authentic Credential Verified
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#15803D', margin: 0 }}>
                        Officially conferred by aivortex Academic Registry
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => window.print()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Printer size={16} />
                    <span>Print / Save as PDF</span>
                  </button>
                </div>

                {/* The Official Certificate Preview */}
                <div style={{ margin: '20px 0', overflowX: 'auto', background: '#F8FAFC', padding: 12, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <AivortexCertificate
                    studentName={result.studentName}
                    courseTitle={result.courseTitle}
                    certificateCode={result.certificateId}
                    issueDate={result.issuedAt}
                    isPrintTarget={true}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 14, background: '#F8FAFC', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Student Name</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{result.studentName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Program / Specialization</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{result.courseTitle}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Conferred Date</span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{result.issuedAt}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Certificate Serial</span>
                    <strong style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#2563EB' }}>{result.certificateId}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1.5px solid #EF4444',
                  padding: 28,
                  boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.12)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#DC2626'
                    }}
                  >
                    <XCircle size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                      Verification Failed
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#B91C1C', margin: 0 }}>
                      {result?.error || 'No matching active credential exists in the official aivortex registry.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 20, maxWidth: 960, margin: '40px auto 0 auto' }}>
          {verificationFeatures.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid var(--color-border)',
                padding: 20,
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--color-secondary)' }}>
                <ShieldCheck size={20} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>{item.title}</h4>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

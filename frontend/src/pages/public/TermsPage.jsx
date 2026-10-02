import { ShieldCheck, FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="terms-page" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <FileText size={14} style={{ marginRight: 6 }} />
            Legal Agreement
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 12 }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Effective for all enrolled students, creators, and platform visitors.
          </p>
        </div>

        <div className="card" style={{ padding: 40, borderRadius: 8, border: '1px solid var(--color-border)', lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: 24 }}>
            By registering for an account, accessing courses, or utilizing services offered by aivortex, you agree to be bound by these Terms of Service. If you do not agree, do not utilize the platform.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>2. Account Security & Single Session Policy</h2>
          <p style={{ marginBottom: 24 }}>
            You are responsible for maintaining the confidentiality of your login credentials. In accordance with platform security protocols, video streams are restricted to a single active session per student account. Concurrent playback across multiple IP addresses or browsers is strictly prohibited.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>3. Intellectual Property & Anti-Piracy Watermarking</h2>
          <p style={{ marginBottom: 24 }}>
            All course videos, source code repositories, quiz question banks, and learning materials are the exclusive proprietary property of aivortex and its respective course creators. Streaming content incorporates dynamic student watermarking. Unauthorized scraping, recording, or distribution of course videos will result in immediate account revocation and potential legal remedies.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>4. Payments & Refunds</h2>
          <p style={{ marginBottom: 24 }}>
            All payments are processed securely through Razorpay. Course enrollment fees are non-refundable once the enrollment is completed. To be eligible for the course completion certificate, learners must successfully complete the entire course, including all required modules and assessments.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>5. Certification Standards</h2>
          <p>
            Certificates of Completion are granted solely upon verifiable completion of curriculum requirements and successful passage of mandatory quizzes. aivortex reserves the right to withhold certification if academic dishonesty or automated answer submission is detected.
          </p>
        </div>
      </div>
    </div>
  )
}

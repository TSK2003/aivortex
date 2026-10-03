import { ShieldCheck, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="privacy-page" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="badge badge-primary" style={{ marginBottom: 12 }}>
            <Lock size={14} style={{ marginRight: 6 }} />
            Data Protection
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 12 }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
             Compliant with Indian DPDP Act and international standards.
          </p>
        </div>

        <div className="card" style={{ padding: 40, borderRadius: 8, border: '1px solid var(--color-border)', lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>1. Information We Collect</h2>
          <p style={{ marginBottom: 24 }}>
            We collect personal identity data (name, email address, password hashes), learning analytics (lesson completion, quiz attempts, timestamps, notes), payment event receipts via Razorpay (transaction references; we never store raw credit card numbers), and device telemetry necessary to ensure single-session video playback.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>2. How We Use Your Data</h2>
          <p style={{ marginBottom: 24 }}>
            Your information is used strictly to provision student access, maintain sequential progression, issue authentic verified certificates, notify you of course announcements, and maintain platform security. We never sell student data to third-party ad networks.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>3. Security & Storage</h2>
          <p style={{ marginBottom: 24 }}>
            All user authentication tokens and passwords use salted bcrypt/argon2 cryptographic hashes. Media assets are secured on private cloud object stores with time-limited signed access tokens.
          </p>

          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: 12 }}>4. Contact Us Regarding Your Data</h2>
          <p>    You may request a copy or deletion of your profile data by writing to aivortexgroup@gmail.com or filing a support ticket from your Student Dashboard.
          
          </p>
        </div>
      </div>
    </div>
  )
}

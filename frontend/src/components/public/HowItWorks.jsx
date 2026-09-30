const steps = [
  {
    num: '01',
    title: 'Choose Your Course',
    desc: 'Select from Python, Data Science, Machine Learning, AI, or Quantitative Trading tracks.'
  },
  {
    num: '02',
    title: 'Enroll & Start Learning',
    desc: 'Instant access to structured video lessons, downloadable notebooks, and weekend cohorts.'
  },
  {
    num: '03',
    title: 'Build Practical Projects',
    desc: 'Complete 10+ domain-specific portfolio projects with code review and live debugging.'
  },
  {
    num: '04',
    title: 'Earn Your Certificate',
    desc: 'Graduate with an industry-recognized, tamper-proof credential verified on the portal.'
  }
]

export default function HowItWorks() {
  return (
    <section className="section section-alt" id="how-it-works" style={{ padding: '44px 0 52px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 28px auto' }}>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            HOW IT <span className="highlight-blue" style={{ color: '#2563EB' }}>WORKS</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            A clear four-step pathway designed to take you from initial enrollment to verified graduation.
          </p>
        </div>

        <div className="how-it-works-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 24 }}>
          {steps.map((step) => (
            <div
              key={step.num}
              className="step-card"
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3.5vw, 24px)',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontSize: 'clamp(1.85rem, 5vw, 2.25rem)', fontWeight: 900, color: '#2563EB', lineHeight: 1, marginBottom: 16 }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

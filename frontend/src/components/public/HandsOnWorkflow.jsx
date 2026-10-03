const steps = [
  {
    num: '01',
    title: 'LEARN',
    desc: 'Master industry-relevant technologies through structured courses.',
    highlight: 'Structured Video Modules & Architecture Blueprints'
  },
  {
    num: '02',
    title: 'BUILD',
    desc: 'Apply your knowledge through practical real-world projects.',
    highlight: '10+ Production Repos & Real Datasets'
  },
  {
    num: '03',
    title: 'MASTER',
    desc: 'Strengthen your skills through live sessions, practice and certification.',
    highlight: 'Weekend Cohorts & Verifiable Credentials'
  }
]

export default function HandsOnWorkflow() {
  return (
    <section className="section section-alt" id="learning-journey" style={{ padding: '44px 0 52px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 28px auto' }}>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.35rem, 5.5vw, 2.25rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            LEARN <span className="accent-arrow" style={{ color: '#2563EB' }}>→</span> BUILD <span className="accent-arrow" style={{ color: '#2563EB' }}>→</span>{' '}
            <span className="highlight-blue" style={{ color: '#2563EB' }}>MASTER</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            A 3-stage engineering roadmap designed to bridge the gap between theoretical syntax and high-performance software execution.
          </p>
        </div>

        <div className="journey-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 28 }}>
          {steps.map((step) => (
            <div
              key={step.num}
              className="journey-card"
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3.5vw, 28px)',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 900, color: '#2563EB', lineHeight: 1, marginBottom: 16 }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>
                  {step.desc}
                </p>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid #F1F5F9', fontSize: '0.825rem', fontWeight: 600, color: '#2563EB' }}>
                {step.highlight}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

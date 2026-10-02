const benefits = [
  {
    title: 'Learn from Structured Courses',
    desc: 'Carefully scaffolded curricula from fundamental syntax to high-throughput production ML systems.'
  },
  {
    title: 'Build Practical Projects',
    desc: 'Write real code using actual company datasets rather than toy, clean classroom problems.'
  },
  {
    title: 'Attend Live Sessions',
    desc: 'Interactive weekend workshops every Saturday and Sunday for live code debugging and industry Q&A.'
  },
  {
    title: 'Work on Domain-Based Projects',
    desc: 'Choose from FinTech, Healthcare, Autonomous Vehicles, Quantitative Finance, and NLP domains.'
  },
  {
    title: 'Track Your Progress',
    desc: 'Intuitive student portal with module checklists, personal notes auto-save, and assignment tracking.'
  },
  {
    title: 'Earn Verified Certificates',
    desc: 'Showcase your credentials with tamper-proof certificate IDs verifiable directly on our portal.'
  }
]

export default function WhyLearnSection() {
  return (
    <section className="section" id="why-us" style={{ padding: '48px 0 54px 0' }}>
      <div className="container">
        <div className="why-learn-grid">
          {/* Left Visual & Metric Block */}
          <div className="why-learn-visual">
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>
              Engineering-First Technical Education
            </h3>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
              Most platforms teach syntax that gets forgotten within weeks. aivortex builds engineering muscle through continuous hands-on implementation, weekend live mentorship, and enterprise-grade portfolio projects.
            </p>

            <div className="why-learn-stat-grid">
              <div className="why-stat-box">
                <div className="why-stat-num">94%</div>
                <div className="why-stat-label">Course Completion Rate</div>
              </div>
              <div className="why-stat-box">
                <div className="why-stat-num">10+</div>
                <div className="why-stat-label">Domain Projects</div>
              </div>
              <div className="why-stat-box">
                <div className="why-stat-num">4.9 / 5</div>
                <div className="why-stat-label">Average Student Rating</div>
              </div>
              <div className="why-stat-box">
                <div className="why-stat-num">24/7</div>
                <div className="why-stat-label">Doubt Resolution</div>
              </div>
            </div>
          </div>

          {/* Right Content & Benefits */}
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 14 }}>
              Learning That Goes Beyond Watching Videos
            </h2>
            <p style={{ color: '#64748B', marginBottom: 28, fontSize: '1.05rem', lineHeight: 1.6 }}>
              We eliminate passive video consumption with an active engineering loop designed to transform knowledge into instinct.
            </p>

            <div className="benefits-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16, marginBottom: 0 }}>
              {benefits.map((b, i) => (
                <div
                  key={i}
                  className="why-benefit-card"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '3px 10px',
                      background: '#EFF6FF',
                      border: '1px solid #DBEAFE',
                      borderRadius: 6,
                      fontSize: '0.775rem',
                      fontWeight: 800,
                      color: '#2563EB',
                      letterSpacing: '0.04em',
                      marginBottom: 12
                    }}
                  >
                    0{i + 1}
                  </div>
                  <h4
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      lineHeight: 1.35,
                      margin: '0 0 8px 0',
                      wordBreak: 'normal',
                      overflowWrap: 'break-word',
                      hyphens: 'none'
                    }}
                  >
                    {b.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#64748B',
                      lineHeight: 1.55,
                      margin: 0
                    }}
                  >
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

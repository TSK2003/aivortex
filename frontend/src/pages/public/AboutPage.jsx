export default function AboutPage() {
  const pillars = [
    {
      num: '01',
      title: 'Production-First Pedagogy',
      desc: 'We discard toy notebooks and synthetic exercises. Every curriculum requires students to implement distributed architectures, handle runtime failures, configure telemetry, and deploy to real cloud infrastructure.'
    },
    {
      num: '02',
      title: 'Industry Veteran Creators',
      desc: 'Our curriculum is designed and instructed exclusively by engineering leaders actively building at top AI laboratories, cloud hyperscalers, and high-growth technology enterprises.'
    },
    {
      num: '03',
      title: 'Uncompromising Academic Integrity',
      desc: 'Sequential lesson unlocking, database-backed quiz enforcement, sandboxed code validation, and single-session video protection safeguard the standard of every awarded credential.'
    }
  ]

  const faculty = [
    {
      name: 'Dr. Anand Ramanathan',
      role: 'Academic Dean & Principal AI Architect',
      background: 'Ex-Meta AI, PhD in Distributed Systems from Carnegie Mellon. Specializes in LLM inference acceleration and tensor parallelism.'
    },
    {
      name: 'Meera Deshmukh',
      role: 'Curriculum Director & GenAI Lead',
      background: 'Head of Applied AI Research. Leading pioneer in stateful multi-agent systems, LangGraph architectures, and agentic memory systems.'
    },
    {
      name: 'Karthik Subramanian',
      role: 'Cloud Systems Fellow',
      background: 'VP of Engineering with 16+ years architecting high-frequency financial ledgers, transactional databases, and event-driven microservices.'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Chief Learning Scientist',
      background: 'Spearheads our automated code evaluation benchmarks, anti-cheating telemetry, and objective competency certification standards.'
    }
  ]

  const standards = [
    {
      title: 'Verifiable Academic Ledger',
      desc: 'Every certificate is anchored by an immutable identifier verified via public lookup and authenticated cryptographic registry.'
    },
    {
      title: 'Sandboxed Execution Benchmarks',
      desc: 'Capstone repositories undergo automated test harnesses, load testing, and latency profiling before graduation clearance.'
    },
    {
      title: 'Direct Industry Mentorship',
      desc: 'Students receive direct feedback, code reviews, and live architectural design audits from practicing senior engineers.'
    }
  ]

  return (
    <div className="about-page" style={{ paddingTop: 36, paddingBottom: 56 }}>
      <div className="container">
        
        {/* Institutional Header */}
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 32px auto' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            About ApexLearn
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Institutional Mission, Governance & Academic Standards
          </p>
        </div>

        {/* Mission & Vision Statement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div
            className="card"
            style={{
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-border)',
              background: '#FFFFFF'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Institutional Mission
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 10 }}>
              Bridging the Theory-Production Divide
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              ApexLearn was established as an independent institute to bridge the chasm between superficial syntax tutorials and the demanding realities of production engineering. We educate engineers to construct reliable, scalable, and resilient systems capable of handling enterprise workloads.
            </p>
          </div>

          <div
            className="card"
            style={{
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--color-border)',
              background: '#FFFFFF'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Engineering Vision
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 10 }}>
              Standardizing Modern AI Architecture
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              We envision a global software ecosystem where developers are empowered not merely as prompt consumers, but as systems architects who understand GPU kernel memory, asynchronous queue mechanics, distributed consensus, and model serving telemetry.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 24px auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 8 }}>
              Core Pedagogical Pillars
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Engineered from first principles to cultivate autonomous problem-solving and rigorous engineering craftsmanship.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {pillars.map((pillar) => (
              <div
                key={pillar.num}
                className="card"
                style={{
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid var(--color-border)',
                  background: '#FFFFFF'
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563EB', marginBottom: 10, lineHeight: 1 }}>
                  {pillar.num}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty & Academic Advisory */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 24px auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 8 }}>
              Academic Advisory Board
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Our faculty comprises experienced technical directors, principal researchers, and systems architects.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {faculty.map((member, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid var(--color-border)',
                  background: '#FFFFFF'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: 14 }}>
                  {member.name.charAt(0)}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>
                  {member.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, marginBottom: 12 }}>
                  {member.role}
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {member.background}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Standards & Accreditation */}
        <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '40px 32px', border: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: 700, marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 8 }}>
              Academic Governance & Quality Assurance
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
              To ensure industry credibility, every credential issued by ApexLearn is backed by rigorous programmatic verification.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {standards.map((std, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8 }}>
                  {std.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {std.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

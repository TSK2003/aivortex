import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function ExploreTracksSection() {
  const pathways = [
    {
      step: '01',
      title: 'Full Course Catalog',
      desc: 'Structured masterclasses across Production AI, Full-Stack, Distributed Systems, and MLOps Infrastructure.',
      link: '/courses',
      cta: 'Explore All Courses'
    },
    {
      step: '02',
      title: 'Domain Capstone Projects',
      desc: 'Architectural repositories featuring production codebases, automated CI test suites, and Docker deployment configs.',
      link: '/projects',
      cta: 'Explore Projects'
    },
    {
      step: '03',
      title: 'Live Weekend Cohorts',
      desc: 'Direct interactive masterclasses every Saturday & Sunday with senior architects for live debugging and system design.',
      link: '/live-sessions',
      cta: 'View Live Schedule'
    },
    {
      step: '04',
      title: 'Credential Verification',
      desc: 'Tamper-proof academic verification engine for validating credentials awarded by aivortex.',
      link: '/certificates',
      cta: 'Verify Credentials'
    }
  ]

  return (
    <section className="section section-alt" id="explore-pathways" style={{ padding: '44px 0 52px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 28px auto' }}>
          <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            CHOOSE YOUR <span className="highlight-blue" style={{ color: '#2563EB' }}>LEARNING PATH</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Select a pathway to build deep conceptual competence, hands-on production engineering, and verified credentials.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {pathways.map((item) => (
            <div
              key={item.step}
              className="card"
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '28px 24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563EB', lineHeight: 1, marginBottom: 16 }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.6, marginBottom: 24 }}>
                  {item.desc}
                </p>
              </div>

              <Link
                to={item.link}
                className="btn btn-outline-blue btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 600, padding: '10px 16px' }}
              >
                <span>{item.cta}</span>
                <ArrowRight size={14} style={{ marginLeft: 6 }} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

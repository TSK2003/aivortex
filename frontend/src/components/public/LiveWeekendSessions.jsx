import { initialLiveSessions } from '../../data/initialData'

/**
 * LiveWeekendSessions — Clean, Professional Live Cohort Cards
 * Free of clutter icons with proper card alignment and clear typography.
 */
export default function LiveWeekendSessions({ sessions = initialLiveSessions, onJoinSession }) {
  return (
    <section className="section section-alt" id="live" style={{ padding: '64px 0 80px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 48px auto' }}>
          <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            LEARN LIVE. <span className="highlight-blue" style={{ color: '#2563EB' }}>BUILD TOGETHER.</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Interactive live mentoring sessions every Saturday & Sunday. Connect directly with senior industry practitioners, debug complex code in real time, and collaborate with peers.
          </p>
        </div>

        <div className="live-sessions-timeline" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              className="live-card"
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                padding: '28px 32px',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                  {session.day} Live Session
                </span>
                {session.isLiveNow ? (
                  <span style={{ background: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6, border: '1px solid #BFDBFE' }}>
                    ● LIVE NOW
                  </span>
                ) : (
                  <span style={{ background: '#F8FAFC', color: '#64748B', fontWeight: 600, fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                    Upcoming Cohort
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#2563EB', fontWeight: 600 }}>
                {session.date} • {session.time}
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                {session.title}
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                {session.description}
              </p>

              <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
                Course: <strong style={{ color: '#0F172A' }}>{session.courseName}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 16, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img
                    src={session.instructorAvatar}
                    alt={session.instructor}
                    style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>{session.instructor}</div>
                    <div style={{ fontSize: '0.775rem', color: '#64748B' }}>{session.instructorRole}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn ${session.isLiveNow ? 'btn-teal' : 'btn-primary'} btn-sm`}
                  onClick={() => onJoinSession ? onJoinSession(session) : window.open(session.meetUrl, '_blank')}
                  style={{ padding: '8px 20px', fontWeight: 700, fontSize: '0.875rem' }}
                >
                  {session.isLiveNow ? 'Join Class Now' : 'Register Session'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

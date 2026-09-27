import { initialTestimonials } from '../../data/initialData'

export default function Testimonials({ testimonials = initialTestimonials }) {
  return (
    <section className="section section-alt" id="testimonials" style={{ padding: '44px 0 52px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 28px auto' }}>
          <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            REAL STORIES FROM <span className="highlight-blue" style={{ color: '#2563EB' }}>OUR LEARNERS</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Hear directly from data scientists, machine learning engineers, and developers who advanced their engineering careers with ApexLearn.
          </p>
        </div>

        <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28 }}>
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="testimonial-card"
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ color: '#2563EB', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 14 }}>
                  VERIFIED REVIEW • {item.rating}.0 / 5.0
                </div>
                <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 24 }}>
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                <img
                  src={item.avatar}
                  alt={item.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#0F172A' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{item.role}</div>
                  <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginTop: 2 }}>
                    Alumnus: {item.course}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import api from '../../services/api'
import defaultAboutData from '../../data/defaultAboutData'

export default function AboutPage() {
  const [data, setData] = useState(defaultAboutData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchAbout() {
      try {
        const res = await api.public.getAbout()
        if (isMounted && res.data?.about) {
          setData(res.data.about)
        }
      } catch (err) {
        console.warn('Using default about data:', err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchAbout()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="about-page" style={{ background: '#F8FAFC', color: '#0F172A', minHeight: '100vh', paddingBottom: 100 }}>
      
      {/* =====================================================================
          1. HERO SECTION: Clean, human, executive typography
          ===================================================================== */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', paddingTop: 64, paddingBottom: 64 }}>
        <div className="container" style={{ maxWidth: 1080 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            
            {/* Minimalist Corporate Eyebrow (No pill bubble, no sparkles) */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#475569',
                marginBottom: 18
              }}
            >
              <span style={{ width: 20, height: 1.5, background: '#2563EB', display: 'inline-block' }} />
              <span>About Aivortex</span>
              <span style={{ width: 20, height: 1.5, background: '#2563EB', display: 'inline-block' }} />
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.1rem, 4.5vw, 3.25rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.18,
                margin: '0 0 22px 0'
              }}
            >
              Empowering the Next Generation to{' '}
              <span style={{ color: '#1E40AF' }}>Learn, Build &amp; Innovate</span>
            </h1>

            {/* Core Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
                color: '#334155',
                lineHeight: 1.65,
                fontWeight: 500,
                marginBottom: 18
              }}
            >
              {data.hero?.subtitle ||
                'Aivortex is an AI-focused learning platform designed to help students, professionals, and aspiring technology enthusiasts build practical skills for the rapidly evolving digital world.'}
            </p>

            {/* Extended Brand Narrative */}
            <p
              style={{
                fontSize: '0.98rem',
                color: '#64748B',
                lineHeight: 1.75,
                margin: '0 auto',
                maxWidth: 780
              }}
            >
              {data.hero?.introParagraph ||
                'We believe that learning should go beyond textbooks and theory. At Aivortex, we combine AI, emerging technologies, practical projects, and industry-oriented learning to create an experience that helps learners understand concepts, apply them to real-world problems, and continuously grow their capabilities.'}
            </p>
          </div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: 1080, marginTop: 56 }}>

        {/* =====================================================================
            2. EXECUTIVE LEADERSHIP: Two identical, perfectly matched boxes
            ===================================================================== */}
        <section style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 32, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
                marginBottom: 4
              }}
            >
              Leadership
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Executive Leadership
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
              gap: 32,
              alignItems: 'stretch'
            }}
          >
            {data.leadership?.map((leader) => (
              <div
                key={leader.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                {/* Photo Frame - Exact same dimensions and framing for both leaders */}
                <div
                  style={{
                    width: '100%',
                    height: 380,
                    background: '#1E293B',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src={leader.image}
                    alt={leader.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      display: 'block'
                    }}
                  />
                </div>

                {/* Content Body - Symmetrically aligned with matching heights */}
                <div
                  style={{
                    padding: '28px 28px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Overline Badge */}
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#2563EB',
                      marginBottom: 6
                    }}
                  >
                    {leader.sectionTitle}
                  </div>

                  {/* Leader Name */}
                  <h3
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1.25,
                      margin: '0 0 6px 0'
                    }}
                  >
                    {leader.name}
                  </h3>

                  {/* Role */}
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#1E40AF',
                      marginBottom: 14
                    }}
                  >
                    {leader.role}
                  </div>

                  {/* Current Company / Organization */}
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: '#1E293B',
                      fontWeight: 600,
                      lineHeight: 1.45,
                      minHeight: 46,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#F8FAFC',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      marginBottom: 16
                    }}
                  >
                    {leader.company}
                  </div>

                  {/* Education & Credentials */}
                  <div
                    style={{
                      marginBottom: 16,
                      minHeight: 68,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      Credentials &amp; Education
                    </div>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: '#0F172A',
                        fontWeight: 600,
                        lineHeight: 1.45
                      }}
                    >
                      {leader.qualifications || '—'}
                    </div>
                  </div>

                  {/* Bio Narrative */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 16,
                      borderTop: '1px solid #F1F5F9'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: '#64748B',
                        marginBottom: 4
                      }}
                    >
                      Executive Focus
                    </div>
                    <p
                      style={{
                        fontSize: '0.86rem',
                        color: '#475569',
                        lineHeight: 1.6,
                        margin: 0
                      }}
                    >
                      {leader.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            3. MISSION & VISION: Exactly matched, identical symmetrical dual boxes
            ===================================================================== */}
        <section style={{ marginBottom: 72 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: 28,
              alignItems: 'stretch'
            }}
          >
            {/* Mission */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '36px 32px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563EB',
                  marginBottom: 10
                }}
              >
                Our Mission
              </div>
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                  marginBottom: 14
                }}
              >
                Practical Tech Education
              </h3>
              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.7, margin: 0, flex: 1 }}>
                {data.mission?.description ||
                  'Our mission is to make high-quality, practical technology education accessible and engaging for everyone. We aim to bridge the gap between what people learn and what the industry actually requires by providing hands-on learning experiences focused on real-world applications.'}
              </p>
            </div>

            {/* Vision */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '36px 32px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#2563EB',
                  marginBottom: 10
                }}
              >
                Our Vision
              </div>
              <h3
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                  marginBottom: 14
                }}
              >
                A Future-Ready Ecosystem
              </h3>
              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: 1.7, margin: 0, flex: 1 }}>
                {data.vision?.description ||
                  'We envision a world where anyone with curiosity and determination can develop the skills needed to participate in the technology-driven future. Aivortex strives to become a trusted learning ecosystem for Artificial Intelligence, Data Science, Cloud Computing, Software Development, and emerging technologies.'}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. WHAT WE DO: Clean structured disciplines
            ===================================================================== */}
        <section style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 32, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
                marginBottom: 4
              }}
            >
              Curriculum &amp; Domains
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                What We Do
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748B', margin: 0 }}>
                Practical, relevant, and future-ready technology education.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
              gap: 20
            }}
          >
            {data.whatWeDo?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: '24px 26px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#94A3B8',
                    marginBottom: 12
                  }}
                >
                  0{idx + 1}
                </div>
                <h3
                  style={{
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    lineHeight: 1.35,
                    marginBottom: 10
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: '#475569',
                    lineHeight: 1.65,
                    margin: 0
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            5. WHY AIVORTEX (No emojis, clean corporate value points)
            ===================================================================== */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            padding: '44px 36px',
            marginBottom: 72,
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ marginBottom: 32, borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
                marginBottom: 4
              }}
            >
              Pedagogical Principles
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Why Aivortex
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
              gap: 28
            }}
          >
            {data.whyAivortex?.map((pillar, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#2563EB',
                      display: 'inline-block'
                    }}
                  />
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: 0
                    }}
                  >
                    {pillar.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: '#475569',
                    lineHeight: 1.65,
                    margin: 0,
                    paddingLeft: 14
                  }}
                >
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            6. OUR PHILOSOPHY: Learn, Grow, Innovate
            ===================================================================== */}
        <section style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 32, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
                marginBottom: 4
              }}
            >
              Framework
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Our Philosophy
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 24
            }}
          >
            {data.philosophy?.map((philo, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  padding: '32px 28px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#2563EB',
                    marginBottom: 10
                  }}
                >
                  Phase 0{idx + 1}
                </div>
                <h3
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.01em',
                    margin: '0 0 10px 0'
                  }}
                >
                  {philo.step}
                </h3>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: '#475569',
                    lineHeight: 1.65,
                    margin: 0
                  }}
                >
                  {philo.tagline}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            7. WHO WE ARE FOR: Clean directory cards (No emojis)
            ===================================================================== */}
        <section style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 32, borderBottom: '1px solid #E2E8F0', paddingBottom: 16 }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
                marginBottom: 4
              }}
            >
              Audience
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Who We Are For
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
              gap: 16
            }}
          >
            {data.whoWeAreFor?.map((audience, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 12,
                  padding: '24px 20px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    marginBottom: 8
                  }}
                >
                  Profile 0{idx + 1}
                </div>
                <h3
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 6px 0',
                    lineHeight: 1.3
                  }}
                >
                  {audience.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: '#64748B',
                    lineHeight: 1.55,
                    margin: 0
                  }}
                >
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            8. OUR PROMISE & INSTITUTIONAL CALLOUT
            ===================================================================== */}
        <section
          style={{
            background: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 14,
            padding: '52px 40px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.2)'
          }}
        >
          <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                marginBottom: 12
              }}
            >
              Institutional Commitment
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                margin: '0 0 20px 0'
              }}
            >
              Our Promise
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.75,
                color: '#CBD5E1',
                marginBottom: 32,
                fontWeight: 400
              }}
            >
              {data.ourPromise ||
                "We don't just teach technology. We help people learn how to use technology to create. At Aivortex, every learning journey is an opportunity to learn something new, build something meaningful, and move one step closer to the future."}
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/courses"
                className="btn btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8
                }}
              >
                <span>Explore Industry Programs</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="btn btn-outline"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  borderColor: '#334155',
                  borderRadius: 8
                }}
              >
                <span>Institutional Inquiries</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

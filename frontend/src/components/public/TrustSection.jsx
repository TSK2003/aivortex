import { Shield, Clock, Award, HeadphonesIcon, Users, Target } from 'lucide-react'

/**
 * TrustSection — migrated from TrustSection.js
 * Displays trust metrics and value proposition cards.
 */
export default function TrustSection() {
  const trustItems = [
    {
      icon: Shield,
      title: 'Industry-Verified Curriculum',
      description: 'Every course is designed by senior engineers with 10+ years of real-world industry experience.',
      color: 'var(--color-secondary)',
    },
    {
      icon: Target,
      title: 'Project-First Learning',
      description: 'Build 2–4 portfolio-grade domain projects per course — not toy demos.',
      color: 'var(--color-accent)',
    },
    {
      icon: Clock,
      title: 'Self-Paced + Live Mentoring',
      description: 'Watch lessons at your own speed, then get your doubts cleared in live weekend sessions.',
      color: 'var(--color-highlight)',
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      description: 'Earn certificates with unique verification IDs that employers can validate online.',
      color: '#D97706',
    },
    {
      icon: HeadphonesIcon,
      title: 'Dedicated Student Support',
      description: 'Get priority technical support and course assistance from our student success team.',
      color: 'var(--color-success)',
    },
    {
      icon: Users,
      title: '10,000+ Learner Community',
      description: 'Join a thriving community of students, alumni, and mentors who support each other.',
      color: 'var(--color-electric)',
    },
  ]

  return (
    <section className="section" id="why-us">
      <div className="container">
        <div className="section-header text-center">
          <div className="section-badge teal">
            <Shield size={14} />
            <span>WHY APEXLEARN</span>
          </div>
          <h2 className="section-title">
            THE <span className="highlight-blue">APEXLEARN</span> ADVANTAGE
          </h2>
          <p className="section-subtitle">
            We&apos;re not just another course marketplace. We&apos;re an institute
            committed to your career transformation.
          </p>
        </div>

        <div className="trust-grid">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div className="trust-card" key={index}>
                <div className="trust-card-icon" style={{ color: item.color }}>
                  <Icon size={24} />
                </div>
                <h3 className="trust-card-title">{item.title}</h3>
                <p className="trust-card-desc">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

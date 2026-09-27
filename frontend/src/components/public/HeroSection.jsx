import { Link } from 'react-router-dom'

/**
 * HeroSection — Clean, High-Impact Architecture
 * Features full-bleed artwork, modern typography, crisp CTA buttons,
 * and elegant perk indicators without icon clutter.
 */
export default function HeroSection() {
  return (
    <section className="hero-section" id="home">
      {/* Full-bleed right-side hero artwork */}
      <div className="hero-image-bleed" aria-hidden="true">
        <img
          src="/assets/hero_student_cropped.png"
          alt="Technical Education at ApexLearn"
          className="hero-bleed-img"
          id="hero-artwork-img"
          loading="eager"
        />
        <div className="hero-image-fade"></div>
      </div>

      <div className="container">
        <div className="hero-grid">
          {/* Hero Content Left */}
          <div className="hero-content">
            <h1 className="hero-title">
              BUILD SKILLS.<br />
              BUILD PROJECTS.<br />
              <span className="highlight-blue">BUILD YOUR FUTURE.</span>
            </h1>

            <p className="hero-description">
              Learn industry-relevant technologies through expert-led courses, practical domain-based projects, live weekend learning sessions, and verified certifications designed for real-world engineering.
            </p>

            <div className="hero-cta-group">
              <Link to="/courses" className="btn btn-primary btn-lg" id="hero-btn-explore" style={{ fontWeight: 700 }}>
                Explore Courses
              </Link>
              <Link to="/courses" className="btn btn-outline-blue btn-lg" id="hero-btn-start" style={{ fontWeight: 700 }}>
                Start Learning
              </Link>
            </div>


          </div>
        </div>
      </div>
    </section>
  )
}

import CourseCard from './CourseCard'

/**
 * CourseCatalogSection — Renders the course grid on the homepage
 * without clutter badges or unnecessary icons.
 */
export default function CourseCatalogSection({ courses = [], onViewDetails, onEnroll }) {
  return (
    <section className="section section-alt" id="courses" style={{ padding: '64px 0 80px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 48px auto' }}>
          <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            LEARN <span className="highlight-blue" style={{ color: '#2563EB' }}>WHAT MATTERS</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Explore industry-crafted courses designed to help you build deep conceptual knowledge, complete portfolio projects, and earn verified tech credentials.
          </p>
        </div>

        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onViewDetails={onViewDetails}
              onEnroll={onEnroll}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

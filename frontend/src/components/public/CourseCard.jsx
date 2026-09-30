/**
 * CourseCard — Professional, Clean Card Architecture
 * Designed with precise alignment, no icon clutter, zero awkward wrapping,
 * and high-contrast responsive layout.
 */
export default function CourseCard({ course, onViewDetails, onSelectCourse, onEnroll }) {
  if (!course) return null

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(course)
    } else if (onSelectCourse) {
      onSelectCourse(course)
    }
  }

  const handleEnrollClick = () => {
    if (onEnroll) {
      onEnroll(course)
    }
  }

  const badgeClass = course.badge === 'BESTSELLER' ? 'badge-bestseller' : 'badge-popular'
  const ratingVal = course.rating || course.averageRating || 4.9
  const reviewsCount = course.reviewsCount || 480
  const studentsCount = course.studentsEnrolled || course.studentsCount || 1250
  const levelText = (course.level || 'All Levels').split(' ')[0]
  const durationText = course.duration || `${course.durationHours || 24} Hours`
  const isFree = Boolean(course.isFree || course.price === 0)
  const priceVal = isFree ? 0 : (course.price ?? 0)
  const origPriceVal = course.originalPrice ?? (priceVal ? Math.round(priceVal * 1.5) : 0)
  const discountVal = course.discountPercent || (origPriceVal > priceVal ? Math.round(((origPriceVal - priceVal) / origPriceVal) * 100) : 0)
  const defaultThumb = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'

  return (
    <div className="course-card" data-course-id={course.id}>
      <div className="course-card-thumb">
        <img
          src={course.thumbnail || defaultThumb}
          alt={course.title}
          loading="lazy"
          onError={(e) => { e.target.src = defaultThumb }}
        />
        {course.badge && (
          <div className="course-card-badge">
            <span className={`badge ${badgeClass}`}>{course.badge}</span>
          </div>
        )}
        <div className="course-card-category">{course.category || 'AI & Engineering'}</div>
      </div>

      <div className="course-card-body">
        <div className="card-top-content">
          <h3 className="course-card-title" title={course.title}>
            {course.title}
          </h3>
          <p className="course-card-desc">
            {course.shortDescription || course.fullDescription || ''}
          </p>

          <div className="course-rating-row">
            <span className="rating-score">Rating: {ratingVal}</span>
            <span className="rating-meta">({reviewsCount.toLocaleString()} reviews)</span>
            <span className="rating-divider">•</span>
            <span className="rating-enrolled">{studentsCount.toLocaleString()} enrolled</span>
          </div>

          <div className="course-card-meta">
            <span className="meta-text">{levelText}</span>
            {course.language && (
              <>
                <span className="meta-dot">•</span>
                <span className="meta-text">{course.language}</span>
              </>
            )}
            <span className="meta-dot">•</span>
            <span className="meta-text">{durationText}</span>
            <span className="meta-dot">•</span>
            <span className="meta-text">{course.projectsCount || 2} Projects</span>
            <span className="meta-dot">•</span>
            <span className="meta-text">Certificate</span>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="course-price-wrap">
            <div className="price-row">
              <span className="course-price">
                {isFree ? 'FREE' : `₹${priceVal.toLocaleString('en-IN')}`}
              </span>
              {!isFree && origPriceVal > priceVal && (
                <span className="course-original-price">₹{origPriceVal.toLocaleString('en-IN')}</span>
              )}
            </div>
            {!isFree && discountVal > 0 && (
              <span className="discount-pill">Save {discountVal}%</span>
            )}
          </div>

          <div className="card-cta-group">
            <button
              type="button"
              className="btn btn-outline-blue btn-sm btn-view-course"
              onClick={handleDetailsClick}
            >
              Details
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm btn-enroll-course"
              onClick={handleEnrollClick}
            >
              {isFree ? 'Enroll Free' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

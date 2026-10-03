import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Square, Loader2 } from 'lucide-react'

/**
 * CourseCard — Professional, Clean Card Architecture with Course Preview Video Support
 * Features:
 * - Shows thumbnail by default
 * - Plays muted preview video on hover inside the same card media area
 * - Smooth fade-in transition without layout shift or content movement
 * - Stops, resets currentTime to 0, and restores thumbnail on mouse leave
 * - Single active preview: hovering another course immediately stops previous video
 * - Touch & mobile-friendly preview toggle button
 * - Respects prefers-reduced-motion
 * - Graceful fallback to thumbnail on video error
 * - Fully preserves Details and Enroll button clickability and card navigation
 */
export default function CourseCard({ course, onViewDetails, onSelectCourse, onEnroll }) {
  if (!course) return null

  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [hasError, setHasError] = useState(false)

  const previewVideoUrl = course.previewVideoUrl || course.demoVideoUrl || null

  // Stop video playback and reset state
  const stopVideo = useCallback(() => {
    const video = videoRef.current
    if (video) {
      try {
        video.pause()
        video.currentTime = 0
      } catch (err) {
        // ignore pause abort errors
      }
    }
    setIsPlaying(false)
    setIsLoaded(false)
    setIsBuffering(false)
  }, [])

  // Single Active Video Management (Requirement 9)
  useEffect(() => {
    const handleOtherPlay = (e) => {
      if (e.detail !== course.id) {
        stopVideo()
      }
    }

    window.addEventListener('aivortex-preview-play', handleOtherPlay)
    return () => {
      window.removeEventListener('aivortex-preview-play', handleOtherPlay)
    }
  }, [course.id, stopVideo])

  // Play video with audio strictly muted (browser autoplay policy requirement 7)
  const startVideo = useCallback(() => {
    if (!previewVideoUrl || hasError) return
    const video = videoRef.current
    if (!video) return

    // Notify other cards across the page to stop playing
    window.dispatchEvent(new CustomEvent('aivortex-preview-play', { detail: course.id }))

    setIsBuffering(true)
    setIsPlaying(true)

    // Ensure video is muted and playsInline
    video.muted = true
    video.currentTime = 0

    // Lazy load source only when required (Requirement 10)
    if (!video.src) {
      video.src = previewVideoUrl
    }

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsBuffering(false)
        })
        .catch((err) => {
          // If aborted by mouse leave, ignore. If actual playback failure, fallback gracefully (Requirement 13)
          if (err.name !== 'AbortError') {
            setHasError(true)
            stopVideo()
          }
        })
    }
  }, [previewVideoUrl, hasError, course.id, stopVideo])

  // Desktop Hover Event Handlers (Requirements 7, 8, 16)
  const handleMouseEnter = () => {
    // Respect user's reduced-motion preference (Requirement 18)
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return
    }

    startVideo()
  }

  const handleMouseLeave = () => {
    stopVideo()
  }

  // Mobile / Touch / Reduced Motion Manual Toggle (Requirements 17 & 18)
  const handleMobilePreviewToggle = (e) => {
    e.stopPropagation()
    if (isPlaying) {
      stopVideo()
    } else {
      startVideo()
    }
  }

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
    <div
      className="course-card"
      data-course-id={course.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="course-card-thumb">
        {/* Course Thumbnail Image (Always visible as base poster) */}
        <img
          src={course.thumbnail || defaultThumb}
          alt={course.title}
          loading="lazy"
          onError={(e) => { e.target.src = defaultThumb }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />

        {/* Course Preview Video Layer (Plays inside same card area) */}
        {previewVideoUrl && !hasError && (
          <video
            ref={videoRef}
            muted
            playsInline
            loop
            preload="none"
            onPlaying={() => {
              setIsLoaded(true)
              setIsBuffering(false)
            }}
            onWaiting={() => setIsBuffering(true)}
            onError={() => {
              setHasError(true)
              stopVideo()
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isPlaying && isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}

        {/* Subtle Video Buffering/Loading Indicator */}
        {isPlaying && isBuffering && !isLoaded && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 3,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              padding: '4px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#FFFFFF',
              fontSize: '0.6875rem',
              fontWeight: 600,
              pointerEvents: 'none'
            }}
          >
            <Loader2 size={12} className="spinner-spin" style={{ color: '#38BDF8' }} />
            <span>Loading Preview...</span>
          </div>
        )}

        {/* Touch / Mobile / Reduced Motion Preview Control Button (Requirement 17 & 18) */}
        {previewVideoUrl && !hasError && (
          <button
            type="button"
            className="course-preview-touch-btn"
            onClick={handleMobilePreviewToggle}
            aria-label={isPlaying ? 'Stop course preview' : 'Play course preview'}
            title={isPlaying ? 'Stop preview' : 'Play course preview'}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 4,
              background: isPlaying ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(4px)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              pointerEvents: 'auto'
            }}
          >
            {isPlaying ? (
              <>
                <Square size={10} fill="#FFFFFF" /> Stop
              </>
            ) : (
              <>
                <Play size={10} fill="#FFFFFF" /> Preview
              </>
            )}
          </button>
        )}

        {/* Course Badge */}
        {course.badge && (
          <div className="course-card-badge" style={{ zIndex: 3 }}>
            <span className={`badge ${badgeClass}`}>{course.badge}</span>
          </div>
        )}

        {/* Course Category */}
        <div className="course-card-category" style={{ zIndex: 3 }}>
          {course.category || 'AI & Engineering'}
        </div>
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

import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Search, Filter, BookOpen, AlertCircle, RefreshCw, Sparkles, Tag } from 'lucide-react'
import CourseCard from '../../components/public/CourseCard'
import CustomSelect from '../../components/common/CustomSelect'
import CourseDetailModal from '../../components/modals/CourseDetailModal'
import VideoModal from '../../components/modals/VideoModal'
import PaymentModal from '../../components/modals/PaymentModal'
import api from '../../services/api'

export default function CoursesPage() {
  const { courseId: routeCourseId } = useParams()
  const [searchParams] = useSearchParams()
  const enrollParam = searchParams.get('enroll')

  const [courses, setCourses] = useState([])
  const [activeOffers, setActiveOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [selectedPriceType, setSelectedPriceType] = useState('All')
  const [sortBy, setSortBy] = useState('popularity')

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [courseToEnroll, setCourseToEnroll] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const categories = ['All', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Web Development', 'Trading', 'Cloud Computing']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const languages = ['All', 'English', 'Hindi', 'Tamil']
  const priceTypes = ['All', 'Paid Only', 'Free Only']
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' }
  ]

  const loadCatalogData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [coursesRes, offersRes] = await Promise.allSettled([
        api.public.getCourses(),
        api.public.getOffers()
      ])

      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data?.courses) {
        setCourses(coursesRes.value.data.courses)
      } else if (coursesRes.status === 'rejected') {
        throw new Error(coursesRes.reason?.message || 'Failed to load live courses from server')
      } else {
        setCourses([])
      }

      if (offersRes.status === 'fulfilled' && offersRes.value?.data?.offers) {
        setActiveOffers(offersRes.value.data.offers)
      }
    } catch (err) {
      console.error('Course catalog load failure:', err)
      setError(err.message || 'Unable to connect to course database')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCatalogData()
  }, [])

  // Auto-open course details or payment modal if navigated from course link or redirect intent
  useEffect(() => {
    if (courses.length > 0 && routeCourseId) {
      const target = courses.find((c) => c.slug === routeCourseId || c.id === routeCourseId)
      if (target) {
        if (enrollParam === 'true') {
          setCourseToEnroll(target)
          setIsPaymentModalOpen(true)
        } else {
          setSelectedCourse(target)
          setIsCourseModalOpen(true)
        }
      }
    }
  }, [courses, routeCourseId, enrollParam])

  const filteredCourses = useMemo(() => {
    return courses
      .filter((c) => {
        const matchesSearch =
          (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory =
          selectedCategory === 'All' || (c.category || '').toLowerCase() === selectedCategory.toLowerCase()
        const matchesLevel =
          selectedLevel === 'All' || (c.level || '').toLowerCase().includes(selectedLevel.toLowerCase())
        const matchesLanguage =
          selectedLanguage === 'All' || (c.language || 'English').toLowerCase() === selectedLanguage.toLowerCase()
        const matchesPrice =
          selectedPriceType === 'All' ||
          (selectedPriceType === 'Paid Only' && !c.isFree && c.price > 0) ||
          (selectedPriceType === 'Free Only' && (c.isFree || c.price === 0))

        return matchesSearch && matchesCategory && matchesLevel && matchesLanguage && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.averageRating || 0) - (a.averageRating || 0)
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0)
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0)
        return (b.studentsCount || 0) - (a.studentsCount || 0)
      })
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedLanguage, selectedPriceType, sortBy])

  const handleOpenCourse = (courseOrId) => {
    const foundCourse = typeof courseOrId === 'string'
      ? courses.find((c) => c.id === courseOrId || c.slug === courseOrId)
      : courseOrId
    setSelectedCourse(foundCourse || null)
    setIsCourseModalOpen(true)
  }

  const handleEnrollCourse = (courseOrId) => {
    const foundCourse = typeof courseOrId === 'string'
      ? courses.find((c) => c.id === courseOrId || c.slug === courseOrId)
      : courseOrId
    setIsCourseModalOpen(false)
    setCourseToEnroll(foundCourse || null)
    setIsPaymentModalOpen(true)
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div className="container">
        {/* Promotional Offers Banner if active offers exist */}
        {activeOffers.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
              borderRadius: 16,
              padding: '16px 24px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.3)',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Tag size={20} style={{ color: '#FDE047' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  {activeOffers[0].title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#E0E7FF' }}>
                  Use code <strong style={{ color: '#FDE047', letterSpacing: '0.05em' }}>{activeOffers[0].code}</strong> at checkout for {activeOffers[0].discountPercent ? `${activeOffers[0].discountPercent}% OFF` : `₹${activeOffers[0].discountAmount} OFF`}
                </div>
              </div>
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              LIMITED TIME PROMOTION
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="section-header text-center" style={{ marginBottom: 32, maxWidth: 760, margin: '0 auto 32px auto' }}>
          <h1 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 10 }}>
            EXPLORE ALL <span className="highlight-blue" style={{ color: '#2563EB' }}>COURSES</span>
          </h1>
          <p className="section-subtitle" style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.6 }}>
            Industry-aligned masterclasses engineered for technical mastery, portfolio building, and enterprise career advancement.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            marginBottom: 28,
            boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {/* Search Input */}
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 16,
                  height: 16,
                  color: '#94A3B8'
                }}
              />
              <input
                type="text"
                placeholder="Search by title, topic, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38, borderRadius: 10, border: '1.5px solid #CBD5E1', height: 44, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <CustomSelect
                options={categories}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                prefix="Category: "
              />
            </div>

            {/* Level Dropdown */}
            <div>
              <CustomSelect
                options={levels}
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                prefix="Level: "
              />
            </div>

            {/* Language Dropdown */}
            <div>
              <CustomSelect
                options={languages}
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                prefix="Language: "
              />
            </div>

            {/* Price Type Dropdown */}
            <div>
              <CustomSelect
                options={priceTypes}
                value={selectedPriceType}
                onChange={(e) => setSelectedPriceType(e.target.value)}
                prefix="Pricing: "
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <CustomSelect
                options={sortOptions}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                prefix="Sort: "
              />
            </div>
          </div>

          {/* Result Count and Active Filters */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            <span>Showing {filteredCourses.length} available programs</span>
            {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All' || selectedLanguage !== 'All' || selectedPriceType !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setSelectedLevel('All')
                  setSelectedLanguage('All')
                  setSelectedPriceType('All')
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              padding: '24px',
              borderRadius: 16,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              textAlign: 'center',
              marginBottom: 32
            }}
          >
            <AlertCircle size={36} style={{ color: '#DC2626', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>Unable to Load Courses</h3>
            <p style={{ fontSize: '0.9rem', color: '#7F1D1D', marginBottom: 16 }}>{error}</p>
            <button
              onClick={loadCatalogData}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                border: '4px solid #E2E8F0',
                borderTopColor: 'var(--color-secondary)',
                borderRadius: '50%',
                margin: '0 auto 16px auto',
                animation: 'spin 1s linear infinite'
              }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading catalog courses from verified database...</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onViewDetails={handleOpenCourse}
                onSelectCourse={handleOpenCourse}
                onEnroll={handleEnrollCourse}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <Filter style={{ width: 48, height: 48, color: '#94A3B8', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8, fontWeight: 700 }}>No courses match your filter criteria</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Try searching for different terms or reset your filter parameters.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedLevel('All')
                setSelectedLanguage('All')
                setSelectedPriceType('All')
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CourseDetailModal
        course={selectedCourse}
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onEnroll={handleEnrollCourse}
        onOpenPreview={(lesson) => {
          setPreviewVideo({ videoUrl: lesson.videoUrl, title: lesson.title, course: selectedCourse?.title })
          setIsVideoModalOpen(true)
        }}
      />

      <VideoModal
        videoUrl={previewVideo?.videoUrl || ''}
        title={previewVideo?.title || ''}
        course={previewVideo?.course || ''}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      <PaymentModal
        course={courseToEnroll}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(course) => {
          loadCatalogData()
        }}
      />
    </div>
  )
}

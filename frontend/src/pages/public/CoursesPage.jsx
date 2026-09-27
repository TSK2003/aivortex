import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, BookOpen } from 'lucide-react'
import CourseCard from '../../components/public/CourseCard'
import CustomSelect from '../../components/common/CustomSelect'
import CourseDetailModal from '../../components/modals/CourseDetailModal'
import VideoModal from '../../components/modals/VideoModal'
import PaymentModal from '../../components/modals/PaymentModal'
import api from '../../services/api'
import { initialCourses } from '../../data/initialData'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')
  const [sortBy, setSortBy] = useState('popularity')

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [courseToEnroll, setCourseToEnroll] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const categories = ['All', 'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Web Development', 'Trading']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']
  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' }
  ]

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        const res = await api.public.getCourses()
        if (res.data?.courses && res.data.courses.length > 0) {
          setCourses(res.data.courses)
        } else {
          setCourses(initialCourses)
        }
      } catch (err) {
        console.warn('Backend fetch note, using fallback catalog:', err.message)
        setCourses(initialCourses)
      } finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

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

        return matchesSearch && matchesCategory && matchesLevel
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0)
        if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0)
        if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0)
        return (b.studentsEnrolled || b.studentsCount || 0) - (a.studentsEnrolled || a.studentsCount || 0)
      })
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy])

  const handleOpenCourse = (courseOrId) => {
    const foundCourse = typeof courseOrId === 'string'
      ? courses.find((c) => c.id === courseOrId)
      : courseOrId
    setSelectedCourse(foundCourse || null)
    setIsCourseModalOpen(true)
  }

  const handleEnrollCourse = (courseOrId) => {
    const foundCourse = typeof courseOrId === 'string'
      ? courses.find((c) => c.id === courseOrId)
      : courseOrId
    setIsCourseModalOpen(false)
    setCourseToEnroll(foundCourse || null)
    setIsPaymentModalOpen(true)
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 64 }}>
      <div className="container">
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
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
                style={{ paddingLeft: 38, borderRadius: 10, border: '1.5px solid #CBD5E1', height: 44 }}
              />
            </div>

            {/* Custom Category Dropdown */}
            <div>
              <CustomSelect
                options={categories}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                prefix="Category: "
              />
            </div>

            {/* Custom Level Dropdown */}
            <div>
              <CustomSelect
                options={levels}
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                prefix="Level: "
              />
            </div>

            {/* Custom Sort Dropdown */}
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
            {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                  setSelectedLevel('All')
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

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
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading catalog courses...</p>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
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

        {!loading && filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <Filter style={{ width: 48, height: 48, color: '#94A3B8', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>No courses match your filter criteria</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Try searching for different terms or reset your filter parameters.
            </p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedLevel('All')
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
        onSuccess={(course) => console.log('Successfully enrolled in:', course.title)}
      />
    </div>
  )
}

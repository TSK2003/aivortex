import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  FileCode,
  Database,
  FileText,
  Download,
  Lock,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import api from '../../services/api'

export default function LearningPlayerPage() {
  const { courseId } = useParams()
  const { student, user } = useAuth()
  const { showToast } = useToast()

  const [course, setCourse] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [allLessons, setAllLessons] = useState([])
  const [activeLessonIndex, setActiveLessonIndex] = useState(0)
  const [completedLessonIds, setCompletedLessonIds] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState(null)

  // Video Session & Watermark
  const [sessionId, setSessionId] = useState(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState('')
  const [watermarkText, setWatermarkText] = useState('')
  const videoRef = useRef(null)
  const heartbeatTimerRef = useRef(null)
  const maxWatchedTimeRef = useRef(0)
  const wasPlayingBeforeFsRef = useRef(false)

  // Notes
  const [noteContent, setNoteContent] = useState('')
  const [noteSavedStatus, setNoteSavedStatus] = useState('All edits synced')
  const [isSavingNote, setIsSavingNote] = useState(false)

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)

  // Certificate Issuance State
  const [isIssuingCert, setIsIssuingCert] = useState(false)
  const [issuedCertificate, setIssuedCertificate] = useState(null)

  // 1. Initial Course & Curriculum Fetch
  useEffect(() => {
    async function loadCurriculum() {
      try {
        setLoading(true)
        setAccessError(null)

        // Fetch course playlists and published lessons from backend
        const res = await api.student.getCoursePlaylists(courseId)
        if (res.data?.course && res.data?.playlists) {
          setCourse(res.data.course)
          setPlaylists(res.data.playlists)

          const lessons = []
          const completedIds = []

          res.data.playlists.forEach((pl) => {
            if (pl.lessons && pl.lessons.length > 0) {
              pl.lessons.forEach((les) => {
                lessons.push({
                  ...les,
                  moduleTitle: pl.title,
                  playlistId: pl.id
                })
                if (les.isCompleted) {
                  completedIds.push(les.id)
                }
              })
            }
          })

          setAllLessons(lessons)
          setCompletedLessonIds(completedIds)
        } else {
          setAccessError('No active curriculum found for this course.')
        }
      } catch (err) {
        setAccessError(err.message || 'Failed to load course lessons. Please ensure you have an active enrollment.')
      } finally {
        setLoading(false)
      }
    }

    loadCurriculum()
  }, [courseId])

  const currentLesson = allLessons[activeLessonIndex] || allLessons[0]
  const isCompleted = currentLesson ? completedLessonIds.includes(currentLesson.id) : false

  // Reset maxWatchedTime when active lesson changes
  useEffect(() => {
    maxWatchedTimeRef.current = 0
  }, [currentLesson?.id])

  // 2. Fullscreen Continuity Listener (Rule 13)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Ensure playback state is smoothly maintained when entering/exiting fullscreen
      if (videoRef.current && wasPlayingBeforeFsRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 3. Start Video Session & Heartbeat for Active Lesson
  useEffect(() => {
    if (!currentLesson || !courseId) return

    let cancelled = false

    async function initSession() {
      try {
        setAccessError(null)
        setQuizResult(null)
        setQuizAnswers({})

        // Authoritative single-session creation & sequential gating check
        const sessionRes = await api.student.startVideoSession(courseId, currentLesson.id)

        if (cancelled) return

        if (sessionRes.success && sessionRes.data) {
          setSessionId(sessionRes.data.sessionId)
          setCurrentVideoUrl(sessionRes.data.videoUrl || currentLesson.videoUrl)
          setWatermarkText(sessionRes.data.watermark?.displayText || `${student?.name || 'Verified Scholar'} • APEX-2026`)

          // Restore last saved position if available
          if (sessionRes.data.lastPositionSec) {
            maxWatchedTimeRef.current = sessionRes.data.lastPositionSec
            if (videoRef.current) {
              videoRef.current.currentTime = sessionRes.data.lastPositionSec
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setAccessError(err.message || 'Access to this lesson is restricted.')
          setCurrentVideoUrl('')
        }
      }
    }

    initSession()

    // Load private note for active lesson
    api.student.getNote(currentLesson.id).then((res) => {
      if (!cancelled && res.data?.note) {
        setNoteContent(res.data.note.noteText || '')
      } else if (!cancelled) {
        setNoteContent('')
      }
    }).catch(() => {})

    // Load Quiz if current lesson has attached quizzes
    if (currentLesson.quizzes && currentLesson.quizzes.length > 0) {
      const quizId = currentLesson.quizzes[0].id
      api.student.getQuiz(quizId).then((res) => {
        if (!cancelled && res.data?.quiz) {
          setActiveQuiz(res.data.quiz)
        }
      }).catch(() => {})
    } else {
      setActiveQuiz(null)
    }

    return () => {
      cancelled = true
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
    }
  }, [currentLesson?.id, courseId])

  // 4. Heartbeat Timer (every 20s) to keep session active and save watch seconds
  useEffect(() => {
    if (!sessionId || !currentLesson) return

    heartbeatTimerRef.current = setInterval(async () => {
      try {
        const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0
        await api.student.heartbeatVideoSession(sessionId, currentLesson.id, currentTime, 20)
      } catch (err) {
        if (err.message && (err.message.includes('concurrent') || err.message.includes('session'))) {
          showToast('Another video session was started on your account. Playback paused.', 'error')
          if (videoRef.current) videoRef.current.pause()
        }
      }
    }, 20000)

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
        heartbeatTimerRef.current = null
      }
    }
  }, [sessionId, currentLesson?.id])

  // 5. Video Player Seek Control & Progress Tracking (Rule 12 & 13)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const current = videoRef.current.currentTime
    if (current > maxWatchedTimeRef.current) {
      maxWatchedTimeRef.current = current
    }
  }

  const handleSeeking = () => {
    if (!videoRef.current) return
    // If the lesson is not already completed, clamp forward seeking to maximum watched boundary
    if (!isCompleted) {
      const targetTime = videoRef.current.currentTime
      if (targetTime > maxWatchedTimeRef.current + 2) {
        videoRef.current.currentTime = maxWatchedTimeRef.current
        showToast('Fast-forwarding past unwatched lecture content is restricted.', 'warning')
      }
    }
  }

  const handleVideoEnded = async () => {
    if (!currentLesson || isCompleted) return
    try {
      // Send final heartbeat and mark complete
      const finalPosition = videoRef.current ? Math.floor(videoRef.current.currentTime) : currentLesson.durationSeconds
      if (sessionId) {
        await api.student.heartbeatVideoSession(sessionId, currentLesson.id, finalPosition, 5).catch(() => {})
      }
      await toggleLessonComplete(true)
    } catch (err) {
      console.warn('Auto-completion error:', err.message)
    }
  }

  const handlePlay = () => {
    wasPlayingBeforeFsRef.current = true
  }

  const handlePause = () => {
    wasPlayingBeforeFsRef.current = false
  }

  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null
  const nextLesson = activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null

  const totalLessonsCount = allLessons.length || 1
  const progressPercent = Math.min(100, Math.round((completedLessonIds.length / totalLessonsCount) * 100))

  // 6. Toggle Lesson Completion (Authoritative Backend Validation)
  const toggleLessonComplete = async (forceComplete = false) => {
    if (!currentLesson) return
    const newStatus = forceComplete ? true : !isCompleted

    try {
      await api.student.toggleLessonProgress(courseId, currentLesson.id, newStatus)

      if (newStatus) {
        if (!completedLessonIds.includes(currentLesson.id)) {
          setCompletedLessonIds((prev) => [...prev, currentLesson.id])
        }
        showToast('Lesson progress verified and marked as Completed!', 'success')
      } else {
        setCompletedLessonIds((prev) => prev.filter((id) => id !== currentLesson.id))
        showToast('Lesson marked as incomplete', 'info')
      }
    } catch (err) {
      showToast(err.message || 'Server rejected completion: Required watch time or quizzes not yet met.', 'error')
    }
  }

  // 7. Save Private Note
  const handleSaveNote = async () => {
    if (!currentLesson) return
    setIsSavingNote(true)
    setNoteSavedStatus('Saving...')

    try {
      await api.student.saveNote(currentLesson.id, noteContent)
      setNoteSavedStatus('All edits synced to database')
      showToast('Private notes saved securely', 'success')
    } catch (err) {
      setNoteSavedStatus('Sync error')
      showToast('Failed to save note to server', 'error')
    } finally {
      setIsSavingNote(false)
    }
  }

  // 8. Submit Quiz Answers
  const handleSubmitQuiz = async (e) => {
    e.preventDefault()
    if (!activeQuiz) return

    setIsSubmittingQuiz(true)
    try {
      const res = await api.student.submitQuiz(activeQuiz.id, quizAnswers)
      if (res.data) {
        setQuizResult(res.data)
        if (res.data.passed) {
          showToast(`Congratulations! You passed with score ${res.data.score}%`, 'success')
          if (!completedLessonIds.includes(currentLesson.id)) {
            toggleLessonComplete(true)
          }
        } else {
          showToast(`Score: ${res.data.score}%. Passing score is ${res.data.passingScore}%. Please review and retry.`, 'error')
        }
      }
    } catch (err) {
      showToast(err.message || 'Quiz submission failed', 'error')
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  // 9. Issue Certificate
  const handleClaimCertificate = async () => {
    setIsIssuingCert(true)
    try {
      const res = await api.student.issueCertificate(courseId)
      if (res.data?.certificate) {
        setIssuedCertificate(res.data.certificate)
        showToast(`Official Certificate Issued: ${res.data.certificate.certificateCode}`, 'success')
      }
    } catch (err) {
      showToast(err.message || 'Certificate criteria not yet fulfilled', 'error')
    } finally {
      setIsIssuingCert(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: '#FFFFFF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #334155', borderTopColor: '#38BDF8', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
          <h3>Initializing Learning Environment...</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Verifying course enrollment and streaming authorization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="learning-player-layout">
      {/* Left Curriculum Sidebar */}
      <aside className="player-sidebar">
        <div className="player-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Link to="/student/dashboard" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              <span>← Back to Dashboard</span>
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 700 }}>
              {progressPercent}% COMPLETE
            </span>
          </div>

          <h3 style={{ color: 'var(--color-primary)' }}>{course?.title || 'Course Curriculum'}</h3>
          <div className="progress-track" style={{ marginTop: 6, background: '#E2E8F0', height: 6, borderRadius: 4 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-secondary)', borderRadius: 4 }}></div>
          </div>

          {/* Certificate Claim Banner when 100% */}
          {progressPercent === 100 && (
            <div style={{ marginTop: 14, padding: 10, background: '#DCFCE7', borderRadius: 8, border: '1px solid #86EFAC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: '0.8rem' }}>
                <Award size={16} />
                <span>Course Completed!</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleClaimCertificate}
                disabled={isIssuingCert}
                style={{ width: '100%', marginTop: 8, fontSize: '0.75rem', height: 32 }}
              >
                {isIssuingCert ? 'Generating...' : (issuedCertificate ? 'Certificate Issued' : 'Claim Certificate')}
              </button>
            </div>
          )}
        </div>

        <div className="player-curriculum-list">
          {playlists.length > 0 ? (
            playlists.map((pl) => (
              <div key={pl.id}>
                <div className="player-module-title">{pl.title}</div>
                {pl.lessons?.map((les) => {
                  const completed = completedLessonIds.includes(les.id)
                  const isActive = currentLesson && les.id === currentLesson.id
                  return (
                    <div
                      key={les.id}
                      className={`player-lesson-item ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
                      onClick={() => {
                        const idx = allLessons.findIndex((l) => l.id === les.id)
                        if (idx !== -1) setActiveLessonIndex(idx)
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="lesson-check-icon">
                        {completed ? '✓' : ''}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {les.title}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                        {les.duration}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))
          ) : (
            <div style={{ padding: 16, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              No modules published for this course yet.
            </div>
          )}
        </div>
      </aside>

      {/* Center & Main Player Area */}
      <main className="player-main">
        {/* Video Canvas with Anti-Piracy Watermark Overlay */}
        <div className="player-video-canvas" style={{ background: '#0F172A', position: 'relative', overflow: 'hidden' }}>
          {accessError ? (
            <div style={{ minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: '#FFFFFF' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Lock size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Lesson Access Restricted</h3>
              <p style={{ color: '#94A3B8', maxWidth: 480, fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 20 }}>
                {accessError}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {prevLesson && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveLessonIndex(activeLessonIndex - 1)}
                    style={{ color: '#FFFFFF', borderColor: '#475569' }}
                  >
                    Return to Previous Lesson
                  </button>
                )}
                <Link to="/student/dashboard" className="btn btn-primary btn-sm">
                  Student Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                id="course-video-player"
                controls
                autoPlay
                controlsList="nodownload"
                poster={course?.thumbnail}
                src={currentVideoUrl || currentLesson?.videoUrl}
                key={currentLesson?.id}
                onTimeUpdate={handleTimeUpdate}
                onSeeking={handleSeeking}
                onEnded={handleVideoEnded}
                onPlay={handlePlay}
                onPause={handlePause}
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                Your browser does not support HTML5 video streaming.
              </video>

              {/* Subtly Animated Anti-Piracy Watermark Overlay */}
              {watermarkText && (
                <div
                  style={{
                    position: 'absolute',
                    top: '18%',
                    left: '22%',
                    color: 'rgba(255, 255, 255, 0.22)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 10,
                    letterSpacing: '0.08em',
                    textShadow: '0 0 2px rgba(0,0,0,0.4)'
                  }}
                >
                  {watermarkText}
                </div>
              )}
            </>
          )}
        </div>

        {/* Player Controls & Navigation Bar */}
        <div className="player-controls-bar">
          <div className="player-lesson-info">
            <h2>{currentLesson?.title}</h2>
            <p>{currentLesson?.moduleTitle} • Duration: {currentLesson?.duration}</p>
          </div>

          <div className="player-nav-buttons">
            <button
              className={`btn btn-outline btn-sm ${!prevLesson ? 'disabled' : ''}`}
              onClick={() => prevLesson && setActiveLessonIndex(activeLessonIndex - 1)}
              disabled={!prevLesson}
              style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            >
              <span>Previous</span>
            </button>

            <button
              className={`btn ${isCompleted ? 'btn-teal' : 'btn-primary'} btn-sm`}
              onClick={() => toggleLessonComplete()}
            >
              <span>{isCompleted ? '✓ Completed' : 'Mark as Complete'}</span>
            </button>

            <button
              className={`btn btn-outline btn-sm ${!nextLesson ? 'disabled' : ''}`}
              onClick={() => nextLesson && setActiveLessonIndex(activeLessonIndex + 1)}
              disabled={!nextLesson}
              style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            >
              <span>Next</span>
            </button>
          </div>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="player-tabs-bar">
          <button
            className={`player-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`player-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </button>
          {activeQuiz && (
            <button
              className={`player-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
            >
              Assessment Quiz
            </button>
          )}
          <button
            className={`player-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </button>
        </div>

        {/* Tab Panes */}
        <div className="player-tab-content">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="player-tab-pane active" id="player-pane-overview">
              <h3 style={{ color: 'var(--color-primary)', marginBottom: 8, fontSize: '1.15rem' }}>About this Lecture</h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.9rem' }}>
                {currentLesson?.description || course?.shortDescription || 'Core technical lecture covering hands-on implementation and system architecture.'}
              </p>
            </div>
          )}

          {/* Tab 2: Notes */}
          {activeTab === 'notes' && (
            <div className="player-tab-pane active" id="player-pane-notes">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', margin: 0 }}>Private Study Notes</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{noteSavedStatus}</span>
              </div>
              <textarea
                className="player-notes-textarea form-input"
                style={{ width: '100%', minHeight: 160, padding: 14, fontFamily: 'monospace', fontSize: '0.875rem' }}
                placeholder="Take lecture notes, jot down code snippets, or record timestamps..."
                value={noteContent}
                onChange={(e) => {
                  setNoteContent(e.target.value)
                  setNoteSavedStatus('Unsaved edits...')
                }}
              />
              <div style={{ marginTop: 12 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                >
                  {isSavingNote ? 'Syncing...' : 'Save Notes to Cloud'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Assessment Quiz */}
          {activeTab === 'quiz' && activeQuiz && (
            <div className="player-tab-pane active" id="player-pane-quiz">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ color: 'var(--color-primary)', fontSize: '1.15rem', margin: 0 }}>{activeQuiz.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Passing Score: {activeQuiz.passingScore}% • Max Attempts: {activeQuiz.maxAttempts}
                  </span>
                </div>
                {quizResult && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      background: quizResult.passed ? '#DCFCE7' : '#FEE2E2',
                      color: quizResult.passed ? '#166534' : '#991B1B'
                    }}
                  >
                    Score: {quizResult.score}% ({quizResult.passed ? 'PASSED' : 'FAILED'})
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitQuiz}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {activeQuiz.questions?.map((q, qIdx) => (
                    <div key={q.id} style={{ background: '#FFFFFF', padding: 18, borderRadius: 12, border: '1px solid var(--color-border)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)', marginBottom: 12 }}>
                        {qIdx + 1}. {q.question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options?.map((opt) => (
                          <label
                            key={opt.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '10px 14px',
                              borderRadius: 8,
                              background: quizAnswers[q.id] === opt.id ? '#EFF6FF' : '#F8FAFC',
                              border: quizAnswers[q.id] === opt.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            <input
                              type="radio"
                              name={`question_${q.id}`}
                              value={opt.id}
                              checked={quizAnswers[q.id] === opt.id}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt.id })}
                            />
                            <span>{opt.optionText}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20 }}>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={isSubmittingQuiz || Object.keys(quizAnswers).length === 0}
                  >
                    {isSubmittingQuiz ? 'Evaluating on Server...' : 'Submit Answers for Grading'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Resources */}
          {activeTab === 'resources' && (
            <div className="player-tab-pane active" id="player-pane-resources">
              <h3 style={{ color: 'var(--color-primary)', marginBottom: 12, fontSize: '1.15rem' }}>Downloadable Lecture Files</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                All source notebooks and starter datasets are authenticated for enrolled students.
              </p>

              <div className="resource-download-list">
                <div className="resource-item">
                  <div>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>01_lecture_starter_notebook.ipynb</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Jupyter Notebook • Includes complete exercises</div>
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => showToast('Starter notebook download initialized', 'success')}
                    style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
                  >
                    <span>Download .ipynb</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

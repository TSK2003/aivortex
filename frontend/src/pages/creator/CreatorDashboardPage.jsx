import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BookOpen,
  ListVideo,
  UploadCloud,
  FileCheck,
  MessageSquare,
  UserCheck,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import CustomSelect from '../../components/common/CustomSelect'
import api from '../../services/api'
import { initialCourses } from '../../data/initialData'

export default function CreatorDashboardPage() {
  const location = useLocation()
  const { creator, user } = useAuth()
  const { showToast } = useToast()

  const currentCreator = creator || user

  const getTabFromLocation = () => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/creator/upload')) return 'upload'
    if (path.includes('/creator/profile')) return 'profile-request'
    if (path.includes('/creator/playlists')) return 'playlists'
    if (path.includes('/creator/submissions')) return 'submissions'
    return 'courses'
  }

  const [activeTab, setActiveTab] = useState(getTabFromLocation)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setActiveTab(getTabFromLocation())
  }, [location.pathname])

  // Assigned courses & playlists state
  const [assignedCourses, setAssignedCourses] = useState([])
  const [playlists, setPlaylists] = useState([])

  // New Playlist Modal / Form
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [newPlaylistCourse, setNewPlaylistCourse] = useState('')

  // Video Upload Form State
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadPlaylist, setUploadPlaylist] = useState('')
  const [uploadOrder, setUploadOrder] = useState('1')
  const [uploadDuration, setUploadDuration] = useState('24:15')
  const [uploadVideoUrl, setUploadVideoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Submissions State
  const [submissions, setSubmissions] = useState([])

  // Profile Change Request State
  const [profileBioRequest, setProfileBioRequest] = useState('')
  const [profileCertRequest, setProfileCertRequest] = useState('')
  const [isSubmittingProfileReq, setIsSubmittingProfileReq] = useState(false)

  // Load live data from backend
  const loadCreatorData = async () => {
    try {
      setLoading(true)

      // 1. Fetch assigned courses
      const coursesRes = await api.creator.getCourses().catch(() => null)
      if (coursesRes?.data?.courses && coursesRes.data.courses.length > 0) {
        setAssignedCourses(coursesRes.data.courses)
        if (!newPlaylistCourse && coursesRes.data.courses[0]) {
          setNewPlaylistCourse(coursesRes.data.courses[0].id)
        }

        // Collect all playlists from assigned courses
        const plList = []
        coursesRes.data.courses.forEach((c) => {
          if (c.playlists) {
            c.playlists.forEach((pl) => {
              plList.push({
                ...pl,
                courseName: c.title,
                videosCount: pl.lessons ? pl.lessons.length : 0
              })
            })
          }
        })
        setPlaylists(plList)
        if (plList.length > 0 && !uploadPlaylist) {
          setUploadPlaylist(plList[0].id)
        }
      } else {
        // Fallback for visual continuity
        setAssignedCourses(initialCourses.slice(0, 2))
        setNewPlaylistCourse('course-pyds')
      }

      // 2. Fetch submissions queue
      const subRes = await api.creator.getSubmissions().catch(() => null)
      if (subRes?.data?.submissions) {
        setSubmissions(subRes.data.submissions)
      }
    } catch (err) {
      console.warn('Creator data fetch note:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCreatorData()
  }, [])

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!newPlaylistTitle || !newPlaylistCourse) return

    try {
      const res = await api.creator.createPlaylist(newPlaylistCourse, newPlaylistTitle, newPlaylistDescription)
      showToast('New Playlist Created Successfully in Database', 'success')
      setNewPlaylistTitle('')
      setNewPlaylistDescription('')
      loadCreatorData()
    } catch (err) {
      showToast(err.message || 'Failed to create playlist', 'error')
    }
  }

  const handleUploadVideo = async (e) => {
    e.preventDefault()
    if (!uploadTitle || !uploadPlaylist) return

    setIsUploading(true)
    try {
      const durationParts = uploadDuration.split(':')
      const durationSeconds = durationParts.length === 2
        ? parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10)
        : 1200

      const videoData = {
        playlistId: uploadPlaylist,
        title: uploadTitle,
        description: uploadDesc,
        duration: uploadDuration,
        durationSeconds,
        videoUrl: uploadVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        orderIndex: parseInt(uploadOrder, 10) || 1
      }

      await api.creator.uploadVideo(videoData)
      showToast('Video Uploaded. Ready for review submission!', 'success')
      setUploadTitle('')
      setUploadDesc('')
      setUploadVideoUrl('')
      loadCreatorData()
      setActiveTab('submissions')
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitForReview = async (lessonId) => {
    try {
      await api.creator.submitVideoForReview(lessonId)
      showToast('Video submitted to Admin Verification Queue', 'info')
      loadCreatorData()
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error')
    }
  }

  const handleProfileRequest = async (e) => {
    e.preventDefault()
    if (!profileBioRequest) return

    setIsSubmittingProfileReq(true)
    try {
      await api.creator.requestProfileChange({
        requestedChanges: {
          bio: profileBioRequest,
          certificationUrl: profileCertRequest
        },
        justification: 'Creator updated biography and industry credentials.'
      })
      showToast('Profile change request forwarded to Admin for approval', 'success')
      setProfileBioRequest('')
      setProfileCertRequest('')
    } catch (err) {
      showToast(err.message || 'Failed to submit profile request', 'error')
    } finally {
      setIsSubmittingProfileReq(false)
    }
  }

  return (
    <div>
      {/* Top Header */}
      <div
        className="dashboard-topbar"
        style={{
          marginBottom: 28,
          background: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Creator Studio — {currentCreator?.name || 'Dr. Alex Rivera'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Produce and manage curriculum content for assigned technical programs. Content requires Admin verification before publication.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab('upload')}
            style={{ fontWeight: 600 }}
          >
            Upload New Lecture
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('playlists')}
            style={{ fontWeight: 600 }}
          >
            New Playlist
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="player-tabs-bar"
        style={{
          marginBottom: 24,
          background: '#FFFFFF',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)'
        }}
      >
        <button
          className={`player-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          Assigned Courses ({assignedCourses.length})
        </button>
        <button
          className={`player-tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists ({playlists.length})
        </button>
        <button
          className={`player-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Video
        </button>
        <button
          className={`player-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          Review Queue ({submissions.length})
        </button>
        <button
          className={`player-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Admin Feedback
        </button>
        <button
          className={`player-tab-btn ${activeTab === 'profile-request' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile-request')}
        >
          Profile Change Request
        </button>
      </div>

      {/* Tab 1: Assigned Courses */}
      {activeTab === 'courses' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
          {assignedCourses.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              <div style={{ padding: 20 }}>
                <span className="badge badge-popular" style={{ marginBottom: 8, display: 'inline-block' }}>
                  {c.category} • Assigned Lead Creator
                </span>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}>{c.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                  {c.shortDescription}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {c.playlists?.length || c.modules?.length || 0} Modules • {c.lessonsCount || 0} Total Lessons
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setNewPlaylistCourse(c.id)
                      setActiveTab('playlists')
                    }}
                  >
                    <span>Manage Content</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Playlists */}
      {activeTab === 'playlists' && (
        <div>
          {/* Create Playlist Form */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              marginBottom: 24
            }}
          >
            <h4 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Create New Playlist / Module</h4>
            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px' }}>
                <CustomSelect
                  options={assignedCourses.map((c) => ({ value: c.id, label: c.title }))}
                  value={newPlaylistCourse}
                  onChange={(e) => setNewPlaylistCourse(e.target.value)}
                  placeholder="Select Course..."
                />
              </div>

              <input
                type="text"
                placeholder="Playlist Title (e.g. Module 05: Deep Learning Foundations)"
                className="form-input"
                style={{ flex: '2 1 300px' }}
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                required
              />

              <button type="submit" className="btn btn-primary">
                <span>Add Playlist</span>
              </button>
            </form>
          </div>

          {/* Existing Playlists Table */}
          <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Playlist Title</th>
                  <th>Assigned Course</th>
                  <th>Videos</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((pl) => (
                  <tr key={pl.id}>
                    <td><strong>{pl.title}</strong></td>
                    <td style={{ color: 'var(--color-secondary)' }}>{pl.courseName || pl.course?.title}</td>
                    <td>{pl.videosCount || (pl.lessons ? pl.lessons.length : 0)} lectures</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: pl.status === 'PUBLISHED' ? '#DCFCE7' : '#FEF3C7',
                          color: pl.status === 'PUBLISHED' ? '#166534' : '#92400E'
                        }}
                      >
                        {pl.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setUploadPlaylist(pl.id)
                          setActiveTab('upload')
                        }}
                      >
                        Upload to Playlist
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Upload Video */}
      {activeTab === 'upload' && (
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 32, maxWidth: 700 }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 6 }}>Upload Lecture Video</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
            Upload raw video footage with title and lesson order. Once uploaded, you can submit it to Admin for verification.
          </p>

          <form onSubmit={handleUploadVideo}>
            <div className="form-field-group">
              <label className="form-label">Target Playlist / Module</label>
              <CustomSelect
                options={playlists.map((p) => ({ value: p.id, label: `${p.courseName || 'Course'} > ${p.title}` }))}
                value={uploadPlaylist}
                onChange={(e) => setUploadPlaylist(e.target.value)}
                placeholder="Select Target Playlist..."
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Lecture Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 05 Hyperparameter Tuning with GridSearch & Optuna"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-field-group">
                <label className="form-label">Lesson Sequence Order</label>
                <input
                  type="number"
                  className="form-input"
                  value={uploadOrder}
                  onChange={(e) => setUploadOrder(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Estimated Duration</label>
                <input
                  type="text"
                  className="form-input"
                  value={uploadDuration}
                  onChange={(e) => setUploadDuration(e.target.value)}
                  placeholder="e.g. 24:15"
                  required
                />
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">Lecture Description & Takeaways</label>
              <textarea
                className="form-input"
                style={{ minHeight: 90 }}
                placeholder="Key concepts covered, packages required..."
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Video Stream URL / S3 Key</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://..."
                value={uploadVideoUrl}
                onChange={(e) => setUploadVideoUrl(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4, display: 'block' }}>
                Direct S3 storage or secure video URL
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 16 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading}
                style={{ padding: '12px 32px', fontSize: '0.95rem' }}
              >
                <span>{isUploading ? 'Registering Video...' : 'Upload Video to Studio'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Review Queue */}
      {activeTab === 'submissions' && (
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Lecture Title</th>
                <th>Course & Playlist</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td><strong>{sub.title}</strong></td>
                  <td>
                    <div>{sub.courseName || sub.playlist?.course?.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{sub.playlistName || sub.playlist?.title}</div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background:
                          sub.status === 'PUBLISHED'
                            ? '#DCFCE7'
                            : sub.status === 'APPROVED'
                            ? '#E0E7FF'
                            : sub.status === 'RETURNED_FOR_EDIT' || sub.status === 'RETURNED'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                        color:
                          sub.status === 'PUBLISHED'
                            ? '#166534'
                            : sub.status === 'APPROVED'
                            ? '#3730A3'
                            : sub.status === 'RETURNED_FOR_EDIT' || sub.status === 'RETURNED'
                            ? '#991B1B'
                            : '#92400E'
                      }}
                    >
                      {sub.status === 'APPROVED'
                        ? 'Approved (Pending Admin Publish)'
                        : sub.status === 'PUBLISHED'
                        ? 'Published to Students'
                        : sub.status === 'SUBMITTED_FOR_REVIEW'
                        ? 'Submitted for Review'
                        : sub.status}
                    </span>
                  </td>
                  <td>
                    {(sub.status === 'DRAFT' || sub.status === 'UPLOADED') && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSubmitForReview(sub.id)}
                      >
                        Submit for Review
                      </button>
                    )}
                    {sub.status === 'SUBMITTED_FOR_REVIEW' && (
                      <span style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 600 }}>
                        In Admin Review Queue
                      </span>
                    )}
                    {sub.status === 'APPROVED' && (
                      <span style={{ fontSize: '0.8rem', color: '#4338CA', fontWeight: 600 }}>
                        Approved by Admin
                      </span>
                    )}
                    {sub.status === 'PUBLISHED' && (
                      <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                        Active in Student Player
                      </span>
                    )}
                    {(sub.status === 'RETURNED_FOR_EDIT' || sub.status === 'RETURNED') && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setActiveTab('feedback')}
                        style={{ color: 'var(--color-error)' }}
                      >
                        View Feedback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Admin Feedback */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {submissions
            .filter((s) => s.adminFeedback || s.feedback)
            .map((s) => (
              <div
                key={s.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: 24
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem' }}>{s.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
                      {s.courseName || s.playlist?.course?.title}
                    </span>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: s.status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2',
                      color: s.status === 'APPROVED' ? '#166534' : '#991B1B'
                    }}
                  >
                    {s.status}
                  </span>
                </div>

                <div
                  style={{
                    background: 'var(--color-bg-alt)',
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--color-secondary)'
                  }}
                >
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Admin Review Note:</strong>
                  <p style={{ marginTop: 6, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    {s.adminFeedback || s.feedback}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tab 6: Profile Change Request */}
      {activeTab === 'profile-request' && (
        <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 32, maxWidth: 640 }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>Creator Profile Change Request</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
            In accordance with platform governance, all Creator profile and biography updates require approval from the Platform Admin.
          </p>

          <form onSubmit={handleProfileRequest}>
            <div className="form-field-group">
              <label className="form-label">Proposed Biography Update</label>
              <textarea
                className="form-input"
                style={{ minHeight: 120 }}
                value={profileBioRequest}
                onChange={(e) => setProfileBioRequest(e.target.value)}
                placeholder="Detail your new industry experience, publications, or credentials..."
                required
              />
            </div>

            <div className="form-field-group">
              <label className="form-label">Supporting Verification Link / Credentials</label>
              <input
                type="text"
                className="form-input"
                value={profileCertRequest}
                onChange={(e) => setProfileCertRequest(e.target.value)}
                placeholder="LinkedIn URL or credential verification link"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmittingProfileReq}
            >
              <span>{isSubmittingProfileReq ? 'Submitting to Admin...' : 'Submit Profile Change Request'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

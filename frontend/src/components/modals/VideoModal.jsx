import { X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function VideoModal({ videoUrl, title, course, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" id="video-preview-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: 860,
          background: '#0F172A',
          color: '#FFFFFF',
          padding: 0,
          overflow: 'hidden'
        }}
        role="dialog"
        aria-label="Video Preview"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 24px',
            background: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
              {course || 'Course Preview'}
            </span>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', marginTop: 2 }}>{title}</h3>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ position: 'static', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            background: '#000000',
            width: '100%',
            aspectRatio: '16/9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            id="modal-video-element"
            controls
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            src={videoUrl}
          >
            Your browser does not support HTML5 video.
          </video>
        </div>

        <div
          style={{
            padding: '20px 24px',
            background: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Enjoyed this free preview? Enroll in the full course to unlock all 40+ modules, live weekend cohorts, and downloadable Jupyter notebooks.
          </div>
          <Link to="/courses" className="btn btn-secondary btn-sm" onClick={onClose}>
            <span>Enroll in Full Course</span>
            <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>
    </div>
  )
}

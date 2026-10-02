import { Play } from 'lucide-react'
import { initialVideoPreviews } from '../../data/initialData'

export default function VideoPreviewSection({ previews = initialVideoPreviews, onOpenPreview }) {
  return (
    <section className="section" id="previews" style={{ padding: '64px 0 80px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 48px auto' }}>
          <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            SEE WHAT <span className="highlight-blue" style={{ color: '#2563EB' }}>YOU&apos;LL LEARN</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Explore sample lesson previews directly from our production curriculum. Free to watch before enrollment.
          </p>
        </div>

        <div className="video-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 24 }}>
          {previews.map((vid) => (
            <div
              key={vid.id}
              className="video-preview-card btn-trigger-preview-modal"
              onClick={() => onOpenPreview && onOpenPreview(vid)}
              style={{
                cursor: 'pointer',
                background: '#FFFFFF',
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="video-thumb-wrap" style={{ position: 'relative', height: 180, background: '#0F172A', overflow: 'hidden' }}>
                <img src={vid.thumb} alt={vid.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                  FREE PREVIEW
                </div>
                <div className="video-play-btn">
                  <Play style={{ width: 20, height: 20, fill: '#FFFFFF' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0, 0, 0, 0.8)', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                  {vid.duration}
                </div>
              </div>

              <div className="video-preview-info" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', marginBottom: 6 }}>
                  {vid.course}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.4, margin: 0 }}>
                  {vid.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


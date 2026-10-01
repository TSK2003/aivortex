import { X, CheckCircle2, Download, ExternalLink, Code2, Globe } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

export default function ProjectModal({ project, isOpen, onClose }) {
  const { showToast } = useToast()

  if (!isOpen || !project) return null

  const handleStarterDownload = () => {
    if (project.githubUrl) {
      window.open(project.githubUrl, '_blank', 'noopener,noreferrer')
    } else {
      showToast(`Starter pack repository prepared for "${project.title}".`, 'info')
    }
  }

  return (
    <div className="modal-overlay" id="project-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 740, borderRadius: 16 }}
        role="dialog"
        aria-label="Project Details"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ padding: 'clamp(18px, 4vw, 32px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span
              className="project-domain-tag"
              style={{
                background: 'var(--color-secondary-light, #EFF6FF)',
                color: 'var(--color-accent, #2563EB)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm, 6px)',
                fontWeight: 700,
                fontSize: '0.78rem'
              }}
            >
              {project.categoryLabel || project.categoryName || project.category || 'AI Engineering'}
            </span>
            <span className="project-difficulty difficulty-intermediate" style={{ fontWeight: 600 }}>
              {project.difficulty || 'Advanced'} Level • {project.duration || '4 Weeks'}
            </span>
            {project.badge && (
              <span className="badge badge-accent" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                {project.badge}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary, #0F172A)', marginBottom: 12, lineHeight: 1.3 }}>
            {project.title}
          </h2>
          <p style={{ color: 'var(--color-text-secondary, #475569)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
            {project.detailedDescription || project.description || project.summary}
          </p>

          {/* Architecture Details if present */}
          {project.architecture && (
            <div style={{ marginBottom: 24, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#1E293B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={16} color="#2563EB" />
                <span>System Architecture Blueprint</span>
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155', lineHeight: 1.55 }}>
                {project.architecture}
              </p>
            </div>
          )}

          {/* Deliverables */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: 'var(--color-primary, #0F172A)' }}>
              Project Objectives & Deliverables
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {((project.deliverables && project.deliverables.length > 0) ? project.deliverables : [
                'Production-grade implementation repository with test suite',
                'Comprehensive architecture documentation & API schemas',
                'Automated CI/CD deployment configuration'
              ]).map((obj, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem' }}>
                  <CheckCircle2
                    style={{ width: 16, height: 16, color: '#16A34A', flexShrink: 0, marginTop: 2 }}
                  />
                  <span>{typeof obj === 'string' ? obj : obj.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies & Skills */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: 'var(--color-primary, #0F172A)' }}>
              Technologies & Libraries
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {((project.tags && project.tags.length > 0) ? project.tags : ['Python', 'PyTorch', 'Docker']).map((tech, idx) => (
                <span
                  key={idx}
                  className="tech-tag"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    background: '#F1F5F9',
                    borderRadius: 6,
                    color: '#334155',
                    fontWeight: 600
                  }}
                >
                  {typeof tech === 'string' ? tech.trim() : tech}
                </span>
              ))}
            </div>
          </div>

          {/* Code & Demo Links Footer */}
          <div
            style={{
              background: 'var(--color-bg-alt, #F8FAFC)',
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: 'var(--radius-md, 10px)',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>Repository & Architecture Scaffolding</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary, #64748B)' }}>
                Access production pipelines, benchmark configurations, and implementation code.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Globe size={14} />
                  <span>Live Demo</span>
                </a>
              )}

              <button
                type="button"
                className="btn btn-primary btn-sm btn-download-project-starter"
                onClick={handleStarterDownload}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {project.githubUrl ? <ExternalLink size={14} /> : <Download size={14} />}
                <span>{project.githubUrl ? 'View GitHub Repo' : 'Download Starter Pack'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

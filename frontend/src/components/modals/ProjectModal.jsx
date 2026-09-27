import { X, CheckCircle2, Download } from 'lucide-react'

export default function ProjectModal({ project, isOpen, onClose }) {
  if (!isOpen || !project) return null

  return (
    <div className="modal-overlay" id="project-modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 720 }}
        role="dialog"
        aria-label="Project Details"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span
              className="project-domain-tag"
              style={{
                background: 'var(--color-secondary-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {project.domain || project.categoryLabel || project.category || 'Engineering'}
            </span>
            <span className="project-difficulty difficulty-intermediate">{project.difficulty || 'Advanced'} Level</span>
          </div>

          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: 12 }}>
            {project.title}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 24 }}>
            {project.fullDesc || project.architecture || project.description || project.summary}
          </p>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
              Project Objectives & Deliverables
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(project.objectives || project.deliverables || [project.objective || 'Complete production-grade codebase with test harness']).map((obj, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem' }}>
                  <CheckCircle2
                    style={{ width: 16, height: 16, color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }}
                  />
                  <span>{typeof obj === 'string' ? obj : obj.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10 }}>
              Technologies & Libraries
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(project.technology || project.tags || (typeof project.tools === 'string' ? project.tools.split(',') : ['Python', 'Docker'])).map((tech, idx) => (
                <span key={idx} className="tech-tag" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  {typeof tech === 'string' ? tech.trim() : tech}
                </span>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-bg-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dataset & Starter Jupyter Notebook</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Includes pre-cleaned CSV data & initial pipeline scaffolding
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm btn-download-project-starter"
              onClick={() => {
                if (project.githubUrl) {
                  window.open(project.githubUrl, '_blank')
                } else {
                  alert(`Starter pack for ${project.title} will be downloaded.`)
                }
              }}
            >
              <Download style={{ width: 14, height: 14 }} />
              <span>{project.githubUrl ? 'View GitHub Repository' : 'Download Starter Pack (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Sparkles, Terminal, Code, Cpu, ExternalLink, CheckCircle, ArrowRight, RefreshCw, FolderGit2 } from 'lucide-react'
import ProjectModal from '../../components/modals/ProjectModal'
import api from '../../services/api'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeModalProject, setActiveModalProject] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setLoading(true)
        const [catsRes, projsRes] = await Promise.allSettled([
          api.public.getProjectCategories(),
          api.public.getProjects()
        ])

        if (!isMounted) return

        if (catsRes.status === 'fulfilled' && catsRes.value?.data?.categories) {
          setCategories(catsRes.value.data.categories)
        }

        if (projsRes.status === 'fulfilled' && projsRes.value?.data?.projects) {
          setProjects(projsRes.value.data.projects)
        }
      } catch (err) {
        console.warn('ProjectsPage data fetch error:', err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((p) => (p.category === selectedCategory || p.categoryId === selectedCategory || p.categorySlug === selectedCategory))

  return (
    <div className="projects-page" style={{ paddingTop: 36, paddingBottom: 64 }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 28px auto' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5.5vw, 2.25rem)', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: 10 }}>
            Domain-Specific Production Projects
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Build and deploy enterprise-grade projects designed in collaboration with senior engineers from top AI labs and hyperscalers.
          </p>
        </div>

        {/* Dynamic Category Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 24, padding: '8px 20px', fontWeight: 600 }}
          >
            All Projects
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`btn btn-sm ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 24, padding: '8px 20px', fontWeight: 600 }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <RefreshCw size={28} className="spin" style={{ margin: '0 auto 14px auto', color: '#2563EB' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading production projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          /* Projects Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 24 }}>
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 16,
                  padding: 24,
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.2s ease',
                  background: 'var(--color-surface, #FFFFFF)'
                }}
              >
                {/* Thumbnail if provided */}
                {project.thumbnailUrl && (
                  <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: '#0F172A' }}>
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {project.categoryLabel || project.categoryName || project.category || 'AI Engineering'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    {project.duration || '4 Weeks'} • {project.difficulty || 'Advanced'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12, lineHeight: 1.4 }}>
                  {project.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20, flexGrow: 1 }}>
                  {project.summary || project.description}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'var(--color-bg-subtle, #F1F5F9)',
                          color: 'var(--color-text-secondary, #475569)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: 6
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <button
                  type="button"
                  className="btn btn-outline-blue"
                  style={{ width: '100%', justifyContent: 'center', fontWeight: 600, marginTop: 'auto' }}
                  onClick={() => setActiveModalProject(project)}
                >
                  {project.ctaText || 'View Architecture & Code'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <FolderGit2 size={36} style={{ margin: '0 auto 12px auto', color: '#94A3B8', opacity: 0.6 }} />
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
              No Projects Found
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              {selectedCategory !== 'all' ? 'No published projects in this category yet.' : 'Projects will be published shortly.'}
            </p>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {activeModalProject && (
        <ProjectModal
          project={activeModalProject}
          isOpen={Boolean(activeModalProject)}
          onClose={() => setActiveModalProject(null)}
        />
      )}
    </div>
  )
}

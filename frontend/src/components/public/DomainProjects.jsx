import { useState } from 'react'
import { initialProjects } from '../../data/initialData'

export default function DomainProjects({ projects = initialProjects, onSelectProject }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filteredProjects = projects.filter((proj) => {
    if (activeFilter === 'all') return true
    return proj.category.toLowerCase().includes(activeFilter.toLowerCase()) ||
           proj.domain.toLowerCase().includes(activeFilter.toLowerCase())
  })

  return (
    <section className="section" id="projects" style={{ padding: '64px 0 80px 0' }}>
      <div className="container">
        <div className="section-header text-center" style={{ maxWidth: 760, margin: '0 auto 40px auto' }}>
          <h2 className="section-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 12 }}>
            BUILD <span className="highlight-blue" style={{ color: '#2563EB' }}>REAL PROJECTS</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: 1.6 }}>
            Engineer hands-on domain projects designed to solve actual enterprise engineering challenges and build an unshakeable developer portfolio.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="project-filters" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Domains ({projects.length}+)
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'Data Science' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Data Science')}
          >
            Data Science
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'Machine Learning' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Machine Learning')}
          >
            Machine Learning
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'AI' ? 'active' : ''}`}
            onClick={() => setActiveFilter('AI')}
          >
            Artificial Intelligence
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'Trading' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Trading')}
          >
            Quantitative Trading
          </button>
          <button
            type="button"
            className={`filter-btn ${activeFilter === 'Python' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Python')}
          >
            Python & Scraping
          </button>
        </div>

        {/* Projects Grid */}
        <div className="project-grid" id="project-card-container">
          {filteredProjects.map((proj) => {
            const diffClass =
              proj.difficulty === 'Beginner'
                ? 'difficulty-beginner'
                : proj.difficulty === 'Intermediate'
                ? 'difficulty-intermediate'
                : 'difficulty-advanced'

            return (
              <div key={proj.id} className="project-card" data-category={proj.category}>
                <div className="project-card-header">
                  <span className="project-domain-tag">{proj.domain}</span>
                  <span className={`project-difficulty ${diffClass}`}>{proj.difficulty}</span>
                </div>

                <div className="project-card-body">
                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-desc">{proj.shortDesc}</p>

                  <div className="project-tech-tags">
                    {proj.technology.map((tech) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>

                  <div className="project-card-footer">
                    <div className="production-badge">
                      <span>Production Grade</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-blue btn-sm btn-view-project"
                      onClick={() => onSelectProject && onSelectProject(proj)}
                      style={{ fontWeight: 600 }}
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Sparkles, Terminal, Code, Cpu, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react'
import ProjectModal from '../../components/modals/ProjectModal'

const PROJECTS_DATA = [
  {
    id: 'proj-1',
    title: 'Autonomous Multi-Agent AI Workflow Engine',
    category: 'genai',
    categoryLabel: 'Generative AI',
    difficulty: 'Advanced',
    duration: '4 Weeks',
    badge: 'Capstone Project',
    summary: 'Build a distributed asynchronous multi-agent orchestrator utilizing LangGraph, vector stores, and tool execution pipelines.',
    tags: ['Python', 'LangChain', 'FastAPI', 'PostgreSQL', 'Docker'],
    architecture: 'Event-driven pub/sub architecture connecting LangGraph state machines with Redis message queues and PostgreSQL state persistence.',
    deliverables: [
      'Self-healing agent loop with automatic retry logic',
      'Dynamic tool execution sandbox with isolated runtime',
      'Production telemetry and token cost observability dashboard',
      'Full CI/CD automated test harness'
    ]
  },
  {
    id: 'proj-2',
    title: 'Enterprise RAG System with Hybrid Vector Search',
    category: 'genai',
    categoryLabel: 'Generative AI',
    difficulty: 'Intermediate',
    duration: '3 Weeks',
    badge: 'Industry Standard',
    summary: 'High-throughput document retrieval system combining BM25 sparse keyword search and dense embedding re-ranking.',
    tags: ['Python', 'Pinecone', 'Cohere Rerank', 'React', 'TypeScript'],
    architecture: 'Dual-path retrieval with late interaction ColBERT embeddings and reciprocal rank fusion for 99.4% context precision.',
    deliverables: [
      'Automated PDF, DOCX, and markdown chunking parser',
      'Contextual compression and reranking layer',
      'Hallucination prevention guardrails using TruLens',
      'Interactive chat UI with cited document viewer'
    ]
  },
  {
    id: 'proj-3',
    title: 'Real-time Edge Vision Quality Inspection',
    category: 'vision',
    categoryLabel: 'Computer Vision',
    difficulty: 'Advanced',
    duration: '4 Weeks',
    badge: 'Hardware Accelerated',
    summary: 'Sub-millisecond industrial defect detection deployed on edge accelerators using YOLOv10 and TensorRT optimization.',
    tags: ['PyTorch', 'TensorRT', 'OpenCV', 'C++', 'NVIDIA Jetson'],
    architecture: 'Pipeline model: GStreamer capture stream -> TensorRT FP16 engine -> CUDA post-processing -> WebSocket alert stream.',
    deliverables: [
      'Custom dataset annotation and synthetic augmentation pipeline',
      'INT8 quantization reducing latency to 4.2ms',
      'Industrial camera trigger synchronization daemon',
      'Real-time web monitoring console with defect heatmaps'
    ]
  },
  {
    id: 'proj-4',
    title: 'High-Frequency FinTech Payment Reconciliation Engine',
    category: 'fullstack',
    categoryLabel: 'Full-Stack & Cloud',
    difficulty: 'Intermediate',
    duration: '3 Weeks',
    badge: 'High Reliability',
    summary: 'Distributed transactional accounting ledger with idempotency keys, dual-entry reconciliation, and webhook dispatch.',
    tags: ['Node.js', 'PostgreSQL', 'Prisma', 'Razorpay', 'Redis'],
    architecture: 'ACID transaction boundary with optimistic locking and distributed distributed locks via Redlock.',
    deliverables: [
      'Zero-loss double-entry balance bookkeeping model',
      'Idempotent webhook listener with replay-attack protection',
      'Automated daily bank statement discrepancy auditor',
      'Exportable financial audit reporting suite'
    ]
  },
  {
    id: 'proj-5',
    title: 'Kubernetes Cloud-Native AI Model Serving Cluster',
    category: 'cloud',
    categoryLabel: 'Cloud & MLOps',
    difficulty: 'Advanced',
    duration: '4 Weeks',
    badge: 'Production Scale',
    summary: 'Autoscaling LLM inferencing cluster on AWS EKS with vLLM, spot instance interruption handling, and Prometheus metrics.',
    tags: ['Kubernetes', 'AWS EKS', 'Terraform', 'Prometheus', 'vLLM'],
    architecture: 'HPA autoscaler driven by queue depth metrics, directing traffic through Envoy gateway with continuous health probes.',
    deliverables: [
      'Complete Terraform infrastructure-as-code repository',
      'Custom Prometheus exporters for GPU memory & KV cache metrics',
      'Canary deployment controller for zero-downtime model updates',
      'Cost optimization policy reducing idle compute expenditure by 65%'
    ]
  }
]

import { useEffect } from 'react'
import api from '../../services/api'

export default function ProjectsPage() {
  const [projects, setProjects] = useState(PROJECTS_DATA)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeModalProject, setActiveModalProject] = useState(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        const res = await api.public.getProjects()
        if (res.data?.projects && res.data.projects.length > 0) {
          const normalized = res.data.projects.map((p, idx) => {
            const rawCat = (p.category || '').toLowerCase()
            let catId = 'fullstack'
            if (rawCat.includes('genai') || rawCat.includes('generative') || rawCat.includes('artificial') || rawCat.includes('nlp')) {
              catId = 'genai'
            } else if (rawCat.includes('vision') || rawCat.includes('image')) {
              catId = 'vision'
            } else if (rawCat.includes('cloud') || rawCat.includes('ops') || rawCat.includes('kubernetes')) {
              catId = 'cloud'
            } else if (rawCat.includes('trading') || rawCat.includes('finance') || rawCat.includes('quantitative') || rawCat.includes('machine learning')) {
              catId = 'fullstack'
            }

            const tagList = Array.isArray(p.tags) && p.tags.length > 0
              ? p.tags
              : (typeof p.tools === 'string' && p.tools.trim()
                  ? p.tools.split(',').map((t) => t.trim()).filter(Boolean)
                  : ['Python', 'PostgreSQL'])

            const deliverableList = Array.isArray(p.deliverables) && p.deliverables.length > 0
              ? p.deliverables
              : (p.objective ? [p.objective, 'Complete production repository with test suite', 'Architecture diagram & API benchmarks'] : [
                  'Production-grade implementation repository',
                  'Automated CI/CD validation test suite',
                  'Comprehensive architecture documentation'
                ])

            return {
              id: p.id || `proj-${idx}`,
              title: p.title || 'Domain Engineering Project',
              category: catId,
              categoryLabel: p.categoryLabel || p.category || 'Generative AI',
              difficulty: p.difficulty || 'Advanced',
              duration: p.duration || '4 Weeks',
              badge: p.badge || (p.isFeatured ? 'Capstone Project' : 'Industry Standard'),
              summary: p.summary || p.description || 'Enterprise architecture project.',
              tags: tagList,
              architecture: p.architecture || p.description || p.objective || '',
              deliverables: deliverableList,
              objectives: deliverableList,
              technology: tagList,
              domain: p.category || 'Computer Science',
              fullDesc: p.description || p.summary || '',
              datasetUrl: p.datasetUrl,
              githubUrl: p.githubUrl
            }
          })
          setProjects(normalized)
        }
      } catch (err) {
        console.warn('Backend projects note, using default catalog:', err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const categories = [
    { id: 'all', label: 'All Projects' },
    { id: 'genai', label: 'Generative AI' },
    { id: 'vision', label: 'Computer Vision' },
    { id: 'fullstack', label: 'Full-Stack AI' },
    { id: 'cloud', label: 'Cloud & MLOps' }
  ]

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((p) => p.category === selectedCategory)

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

        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 24, padding: '8px 20px', fontWeight: 600 }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 24 }}>
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
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                  {project.categoryLabel || project.category || 'AI Engineering'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                  {project.duration || '4 Weeks'} • {project.difficulty || 'Advanced'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 12 }}>
                {project.title}
              </h3>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20, flexGrow: 1 }}>
                {project.summary || project.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {(project.tags || []).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--color-bg-subtle)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <button
                type="button"
                className="btn btn-outline-blue"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}
                onClick={() => setActiveModalProject(project)}
              >
                View Architecture & Code
              </button>
            </div>
          ))}
        </div>
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

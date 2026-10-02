import { useState, useEffect, useMemo } from 'react'
import {
  FolderGit2,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Upload,
  Globe,
  Tag,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Sparkles
} from 'lucide-react'
import api from '../../services/api'
import ProjectModal from '../modals/ProjectModal'

export default function AdminProjectsManager({ showToast }) {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL | PUBLISHED | DRAFT | HIDDEN
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [projectModal, setProjectModal] = useState({
    open: false,
    mode: 'create', // create | edit
    project: null,
    isSubmitting: false,
    error: ''
  })

  const [categoryModal, setCategoryModal] = useState({
    open: false,
    isSubmitting: false,
    editingCategory: null,
    name: '',
    slug: '',
    description: '',
    error: ''
  })

  const [previewProject, setPreviewProject] = useState(null)

  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    project: null,
    isSubmitting: false
  })

  // Project Form State
  const [formState, setFormState] = useState({
    title: '',
    slug: '',
    categoryId: '',
    category: 'genai',
    categoryLabel: 'Generative AI',
    difficulty: 'Advanced',
    duration: '4 Weeks',
    badge: 'Capstone Project',
    description: '',
    detailedDescription: '',
    architecture: '',
    tagsInput: 'Python, PyTorch, LangChain, Docker',
    deliverables: [
      'Self-healing agent loop with automatic retry logic',
      'Dynamic tool execution sandbox with isolated runtime',
      'Production telemetry and token cost observability dashboard',
      'Full CI/CD automated test harness'
    ],
    architectureUrl: '',
    githubUrl: '',
    demoUrl: '',
    thumbnailUrl: '',
    ctaText: 'View Architecture & Code',
    orderIndex: 0,
    status: 'PUBLISHED',
    isEnabled: true,
    isFeatured: false
  })

  const [newDeliverableInput, setNewDeliverableInput] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true)
      const [projsRes, catsRes] = await Promise.allSettled([
        api.admin.getProjects(),
        api.admin.getProjectCategories()
      ])

      if (projsRes.status === 'fulfilled' && projsRes.value?.data?.projects) {
        setProjects(projsRes.value.data.projects)
      } else {
        setProjects([])
      }

      if (catsRes.status === 'fulfilled' && catsRes.value?.data?.categories) {
        setCategories(catsRes.value.data.categories)
      } else {
        setCategories([])
      }
    } catch (err) {
      console.warn('Admin projects load error:', err.message)
      showToast?.(err.message || 'Failed to load projects', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Metrics
  const counts = useMemo(() => {
    return {
      all: projects.length,
      published: projects.filter((p) => p.status === 'PUBLISHED').length,
      draft: projects.filter((p) => p.status === 'DRAFT').length,
      hidden: projects.filter((p) => p.status === 'HIDDEN').length,
      categories: categories.length
    }
  }, [projects, categories])

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      if (categoryFilter !== 'ALL' && p.categoryId !== categoryFilter && p.categorySlug !== categoryFilter && p.category !== categoryFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = (p.title || '').toLowerCase().includes(q)
        const matchCat = (p.categoryLabel || p.categoryName || p.category || '').toLowerCase().includes(q)
        const matchDesc = (p.description || '').toLowerCase().includes(q)
        const matchTags = (p.tools || (Array.isArray(p.tagsList) ? p.tagsList.join(' ') : '')).toLowerCase().includes(q)
        if (!matchTitle && !matchCat && !matchDesc && !matchTags) return false
      }
      return true
    })
  }, [projects, statusFilter, categoryFilter, searchQuery])

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const defaultCat = categories[0] || { id: '', slug: 'genai', name: 'Generative AI' }
    setFormState({
      title: '',
      slug: '',
      categoryId: defaultCat.id || '',
      category: defaultCat.slug || 'genai',
      categoryLabel: defaultCat.name || 'Generative AI',
      difficulty: 'Advanced',
      duration: '4 Weeks',
      badge: 'Capstone Project',
      description: '',
      detailedDescription: '',
      architecture: '',
      tagsInput: 'Python, PyTorch, Docker',
      deliverables: [
        'Production implementation repository with test harness',
        'Architecture specification and benchmark logs',
        'Automated CI/CD deployment configuration'
      ],
      architectureUrl: '',
      githubUrl: '',
      demoUrl: '',
      thumbnailUrl: '',
      ctaText: 'View Architecture & Code',
      orderIndex: projects.length,
      status: 'PUBLISHED',
      isEnabled: true,
      isFeatured: false
    })
    setNewDeliverableInput('')
    setProjectModal({
      open: true,
      mode: 'create',
      project: null,
      isSubmitting: false,
      error: ''
    })
  }

  // Open Edit Modal
  const handleOpenEditModal = (project) => {
    let deliverableList = []
    if (project.deliverablesList && project.deliverablesList.length > 0) {
      deliverableList = project.deliverablesList
    } else if (project.deliverables) {
      try {
        deliverableList = typeof project.deliverables === 'string' && project.deliverables.startsWith('[')
          ? JSON.parse(project.deliverables)
          : project.deliverables.split('\n').filter(Boolean)
      } catch {
        deliverableList = project.deliverables.split('\n').filter(Boolean)
      }
    }

    let tagsStr = ''
    if (Array.isArray(project.tagsList) && project.tagsList.length > 0) {
      tagsStr = project.tagsList.join(', ')
    } else if (project.tools) {
      tagsStr = project.tools
    }

    setFormState({
      title: project.title || '',
      slug: project.slug || '',
      categoryId: project.categoryId || '',
      category: project.categorySlug || project.category || 'genai',
      categoryLabel: project.categoryName || project.categoryLabel || 'Generative AI',
      difficulty: project.difficulty || 'Advanced',
      duration: project.duration || '4 Weeks',
      badge: project.badge || 'Capstone Project',
      description: project.description || '',
      detailedDescription: project.detailedDescription || project.description || '',
      architecture: project.architecture || '',
      tagsInput: tagsStr,
      deliverables: deliverableList.length > 0 ? deliverableList : ['Production implementation repository'],
      architectureUrl: project.architectureUrl || '',
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      thumbnailUrl: project.thumbnailUrl || '',
      ctaText: project.ctaText || 'View Architecture & Code',
      orderIndex: project.orderIndex ?? 0,
      status: project.status || 'PUBLISHED',
      isEnabled: project.isEnabled ?? true,
      isFeatured: project.isFeatured ?? false
    })
    setNewDeliverableInput('')
    setProjectModal({
      open: true,
      mode: 'edit',
      project,
      isSubmitting: false,
      error: ''
    })
  }

  // Handle Image Upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast?.('Please upload a valid image file (PNG, JPG, WebP)', 'error')
      return
    }

    try {
      setIsUploadingImage(true)
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64Data = reader.result
          const res = await api.admin.uploadMedia({
            imageBase64: base64Data,
            folder: 'projects',
            fileName: file.name
          })
          if (res?.data?.url) {
            setFormState((prev) => ({ ...prev, thumbnailUrl: res.data.url }))
            showToast?.('Project thumbnail uploaded successfully', 'success')
          }
        } catch (uploadErr) {
          showToast?.(uploadErr.message || 'Image upload failed', 'error')
        } finally {
          setIsUploadingImage(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setIsUploadingImage(false)
      showToast?.('Failed to process image file', 'error')
    }
  }

  // Add / Remove Deliverable
  const handleAddDeliverable = () => {
    if (!newDeliverableInput.trim()) return
    setFormState((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverableInput.trim()]
    }))
    setNewDeliverableInput('')
  }

  const handleRemoveDeliverable = (index) => {
    setFormState((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }))
  }

  // Submit Project Form
  const handleSubmitProjectForm = async (e) => {
    e.preventDefault()

    if (!formState.title.trim()) {
      setProjectModal((prev) => ({ ...prev, error: 'Project title is required' }))
      return
    }

    if (!formState.description.trim()) {
      setProjectModal((prev) => ({ ...prev, error: 'Project description is required' }))
      return
    }

    const tagArray = formState.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title: formState.title.trim(),
      slug: formState.slug.trim() || undefined,
      categoryId: formState.categoryId || null,
      category: formState.category,
      categoryLabel: formState.categoryLabel,
      difficulty: formState.difficulty,
      duration: formState.duration,
      badge: formState.badge,
      description: formState.description.trim(),
      detailedDescription: formState.detailedDescription?.trim() || formState.description.trim(),
      architecture: formState.architecture.trim(),
      tags: tagArray,
      deliverables: formState.deliverables,
      architectureUrl: formState.architectureUrl.trim() || null,
      githubUrl: formState.githubUrl.trim() || null,
      demoUrl: formState.demoUrl.trim() || null,
      thumbnailUrl: formState.thumbnailUrl.trim() || null,
      ctaText: formState.ctaText.trim() || 'View Architecture & Code',
      orderIndex: Number(formState.orderIndex) || 0,
      status: formState.status,
      isEnabled: formState.isEnabled,
      isFeatured: formState.isFeatured
    }

    try {
      setProjectModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))
      if (projectModal.mode === 'create') {
        const res = await api.admin.createProject(payload)
        showToast?.(res?.message || 'Project created successfully!', 'success')
      } else {
        const res = await api.admin.updateProject(projectModal.project.id, payload)
        showToast?.(res?.message || 'Project updated successfully!', 'success')
      }
      setProjectModal({ open: false, mode: 'create', project: null, isSubmitting: false, error: '' })
      loadData()
    } catch (err) {
      setProjectModal((prev) => ({ ...prev, isSubmitting: false, error: err.message || 'Failed to save project' }))
    }
  }

  // Toggle Publish
  const handleTogglePublish = async (project) => {
    try {
      const nextStatus = project.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
      await api.admin.publishProject(project.id, nextStatus)
      showToast?.(`Project status updated to ${nextStatus}`, 'success')
      loadData()
    } catch (err) {
      showToast?.(err.message || 'Failed to update project status', 'error')
    }
  }

  // Toggle Enable
  const handleToggleEnable = async (project) => {
    try {
      const nextEnabled = !project.isEnabled
      await api.admin.toggleEnableProject(project.id, nextEnabled)
      showToast?.(`Project ${nextEnabled ? 'enabled' : 'disabled'} successfully`, 'success')
      loadData()
    } catch (err) {
      showToast?.(err.message || 'Failed to toggle project state', 'error')
    }
  }

  // Delete Project Confirmation
  const handleConfirmDeleteProject = async () => {
    if (!deleteConfirmModal.project) return
    try {
      setDeleteConfirmModal((prev) => ({ ...prev, isSubmitting: true }))
      await api.admin.deleteProject(deleteConfirmModal.project.id)
      showToast?.(`Project "${deleteConfirmModal.project.title}" permanently deleted.`, 'success')
      setDeleteConfirmModal({ open: false, project: null, isSubmitting: false })
      loadData()
    } catch (err) {
      showToast?.(err.message || 'Failed to delete project', 'error')
      setDeleteConfirmModal((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!categoryModal.name.trim()) {
      setCategoryModal((prev) => ({ ...prev, error: 'Category name is required' }))
      return
    }

    try {
      setCategoryModal((prev) => ({ ...prev, isSubmitting: true, error: '' }))
      if (categoryModal.editingCategory) {
        await api.admin.updateProjectCategory(categoryModal.editingCategory.id, {
          name: categoryModal.name.trim(),
          slug: categoryModal.slug.trim() || undefined,
          description: categoryModal.description.trim()
        })
        showToast?.('Category updated successfully', 'success')
      } else {
        await api.admin.createProjectCategory({
          name: categoryModal.name.trim(),
          slug: categoryModal.slug.trim() || undefined,
          description: categoryModal.description.trim(),
          orderIndex: categories.length
        })
        showToast?.('Category created successfully', 'success')
      }
      setCategoryModal({ open: false, isSubmitting: false, editingCategory: null, name: '', slug: '', description: '', error: '' })
      loadData()
    } catch (err) {
      setCategoryModal((prev) => ({ ...prev, isSubmitting: false, error: err.message || 'Failed to save category' }))
    }
  }

  const handleDeleteCategory = async (cat) => {
    try {
      await api.admin.deleteProjectCategory(cat.id)
      showToast?.(`Category "${cat.name}" removed/disabled.`, 'info')
      loadData()
    } catch (err) {
      showToast?.(err.message || 'Failed to delete category', 'error')
    }
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#15171A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Projects Management Center
          </h2>
          <p style={{ color: '#6B6D73', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
            Author, publish, curate domain-specific capstones, and configure public category filters in real time.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setCategoryModal({ open: true, isSubmitting: false, editingCategory: null, name: '', slug: '', description: '', error: '' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, fontWeight: 600 }}
          >
            <Tag size={15} />
            <span>Manage Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadData}
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 14px', borderRadius: 10, fontWeight: 600 }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleOpenCreateModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 10, fontWeight: 700 }}
          >
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#F8F8F8', color: '#5A5C62', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderGit2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Projects</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15171A', lineHeight: 1.1 }}>{counts.all}</div>
          </div>
        </div>

        <div style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#EFEFEF', color: '#2D2F33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#15171A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Published & Live</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D2F33', lineHeight: 1.1 }}>{counts.published}</div>
          </div>
        </div>

        <div style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#EFEFEF', color: '#4B4D52', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#4B4D52', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Draft Projects</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4B4D52', lineHeight: 1.1 }}>{counts.draft}</div>
          </div>
        </div>

        <div style={{ background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: '#EFEFEF', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#15171A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Domains</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15171A', lineHeight: 1.1 }}>{counts.categories}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B6D73', marginRight: 4 }}>Status:</span>
          {[
            { key: 'ALL', label: 'All Projects', count: counts.all },
            { key: 'PUBLISHED', label: 'Published', count: counts.published },
            { key: 'DRAFT', label: 'Drafts', count: counts.draft },
            { key: 'HIDDEN', label: 'Hidden', count: counts.hidden }
          ].map((s) => {
            const isActive = statusFilter === s.key
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#15171A' : '#F2F2F2',
                  color: isActive ? '#FFFFFF' : '#5A5C62',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>{s.label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 9999,
                    fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#E4E4E7',
                    color: isActive ? '#FFFFFF' : '#5A5C62'
                  }}
                >
                  {s.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Category & Search Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: '0.8125rem',
              color: '#4B4D52',
              background: '#FFFFFF',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories / Domains</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <div style={{ position: 'relative' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9B9DA3' }}
            />
            <input
              type="text"
              placeholder="Search title, tech, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: 38,
                width: 230,
                paddingLeft: 32,
                paddingRight: 10,
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {loading ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B6D73' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', color: '#15171A' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading projects...</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Project</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Domain / Category</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Level & Duration</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Enabled</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Order</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => {
                  const isPublished = p.status === 'PUBLISHED'
                  const isDraft = p.status === 'DRAFT'
                  const isHidden = p.status === 'HIDDEN'

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9', verticalAlign: 'middle' }}>
                      {/* Project Title & Summary */}
                      <td style={{ padding: '16px 18px', minWidth: 260, maxWidth: 360 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.thumbnailUrl ? (
                            <img
                              src={p.thumbnailUrl}
                              alt=""
                              style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0' }}
                            />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F4F4F5', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <FolderGit2 size={20} />
                            </div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 700, color: '#15171A', fontSize: '0.875rem', lineHeight: 1.3 }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B6D73', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                              {p.summary || p.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Domain / Category */}
                      <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 6,
                            background: '#F4F4F5',
                            color: '#15171A',
                            border: '1px solid #E4E4E7'
                          }}
                        >
                          {p.categoryName || p.categoryLabel || p.category}
                        </span>
                      </td>

                      {/* Level & Duration */}
                      <td style={{ padding: '16px 18px', fontSize: '0.8125rem', color: '#4B4D52', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{p.difficulty || 'Advanced'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B6D73' }}>{p.duration || '4 Weeks'}</div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 18px', whiteSpace: 'nowrap' }}>
                        {isPublished && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 9999,
                              background: '#15803D',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                            Published
                          </span>
                        )}
                        {isDraft && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 9999,
                              background: '#B45309',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
                            Draft
                          </span>
                        )}
                        {isHidden && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 10px',
                              borderRadius: 9999,
                              background: '#6B7280',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            Hidden
                          </span>
                        )}
                      </td>

                      {/* Enabled Toggle */}
                      <td style={{ padding: '16px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleEnable(p)}
                          style={{
                            border: 'none',
                            background: p.isEnabled ? '#2D2F33' : '#D5D5D8',
                            width: 38,
                            height: 22,
                            borderRadius: 12,
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            padding: 2
                          }}
                          title={p.isEnabled ? 'Click to disable' : 'Click to enable'}
                        >
                          <span
                            style={{
                              display: 'block',
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              transform: p.isEnabled ? 'translateX(16px)' : 'translateX(0px)',
                              transition: 'transform 0.2s ease'
                            }}
                          />
                        </button>
                      </td>

                      {/* Order */}
                      <td style={{ padding: '16px 18px', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#6B6D73' }}>
                        {p.orderIndex ?? 0}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewProject(p)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#15171A', borderColor: '#E4E4E7' }}
                            title="Preview Project"
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#15171A' }}
                            title="Edit Project"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Publish Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(p)}
                            className="btn btn-outline btn-sm"
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: isPublished ? '#4B4D52' : '#15171A',
                              borderColor: isPublished ? '#E4E4E7' : '#E4E4E7'
                            }}
                          >
                            {isPublished ? 'Unpublish' : 'Publish'}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmModal({ open: true, project: p, isSubmitting: false })}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#15171A', borderColor: '#E4E4E7' }}
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6B6D73' }}>
            <FolderGit2 size={36} style={{ margin: '0 auto 12px auto', color: '#9B9DA3', opacity: 0.6 }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#15171A', fontSize: '1rem', fontWeight: 700 }}>No Projects Found</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'No projects match your current filters.'
                : 'Get started by creating your first domain-specific capstone project.'}
            </p>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT PROJECT */}
      {/* ========================================================================= */}
      {projectModal.open && (
        <div
          className="razorpay-modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => !projectModal.isSubmitting && setProjectModal((prev) => ({ ...prev, open: false }))}
        >
          <div
            className="razorpay-modal"
            style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 8, boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F4F4F5', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderGit2 size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#15171A' }}>
                  {projectModal.mode === 'create' ? 'Create New Project' : 'Edit Project'}
                </h3>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !projectModal.isSubmitting && setProjectModal((prev) => ({ ...prev, open: false }))}
                style={{ padding: 6, borderRadius: '50%', color: '#6B6D73' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProjectForm}>
              <div style={{ padding: '24px' }}>
                {projectModal.error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#EFEFEF', border: '1px solid #D5D5D8', color: '#15171A', fontSize: '0.85rem', marginBottom: 18 }}>
                    {projectModal.error}
                  </div>
                )}

                {/* Title & Slug */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Project Title <span style={{ color: '#15171A' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Autonomous Multi-Agent AI Workflow Engine"
                      value={formState.title}
                      onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      URL Slug (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. autonomous-multi-agent-workflow-engine"
                      value={formState.slug}
                      onChange={(e) => setFormState((prev) => ({ ...prev, slug: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                {/* Category, Difficulty, Duration, Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Domain Category <span style={{ color: '#15171A' }}>*</span>
                    </label>
                    <select
                      value={formState.categoryId || formState.category}
                      onChange={(e) => {
                        const val = e.target.value
                        const matched = categories.find((c) => c.id === val || c.slug === val)
                        if (matched) {
                          setFormState((prev) => ({
                            ...prev,
                            categoryId: matched.id,
                            category: matched.slug,
                            categoryLabel: matched.name
                          }))
                        }
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.id || c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Difficulty Level
                    </label>
                    <select
                      value={formState.difficulty}
                      onChange={(e) => setFormState((prev) => ({ ...prev, difficulty: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Project Duration
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4 Weeks"
                      value={formState.duration}
                      onChange={(e) => setFormState((prev) => ({ ...prev, duration: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Badge Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Capstone Project"
                      value={formState.badge}
                      onChange={(e) => setFormState((prev) => ({ ...prev, badge: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                    Short Summary (Public Card) <span style={{ color: '#15171A' }}>*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief 1-2 sentence overview of the capstone project..."
                    value={formState.description}
                    onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                {/* Detailed Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                    Detailed Description / Objectives
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Comprehensive explanation of what scholars will build, key architectural trade-offs, and industrial context..."
                    value={formState.detailedDescription}
                    onChange={(e) => setFormState((prev) => ({ ...prev, detailedDescription: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                {/* System Architecture Blueprint */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                    System Architecture Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Event-driven pub/sub architecture connecting LangGraph state machines with Redis message queues and PostgreSQL persistence."
                    value={formState.architecture}
                    onChange={(e) => setFormState((prev) => ({ ...prev, architecture: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                {/* Technology & Skills Tags */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                    Technology / Skills Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Python, PyTorch, LangChain, PostgreSQL, Docker"
                    value={formState.tagsInput}
                    onChange={(e) => setFormState((prev) => ({ ...prev, tagsInput: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {formState.tagsInput.split(',').map((t, idx) => {
                      const trimmed = t.trim()
                      if (!trimmed) return null
                      return (
                        <span key={idx} style={{ fontSize: '0.72rem', background: '#F2F2F2', color: '#5A5C62', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {trimmed}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Deliverables Management */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                    Key Deliverables & Milestones
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      placeholder="Add a milestone (e.g. Production telemetry and token cost observability dashboard)"
                      value={newDeliverableInput}
                      onChange={(e) => setNewDeliverableInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDeliverable() } }}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleAddDeliverable}
                      style={{ fontWeight: 600 }}
                    >
                      Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {formState.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          background: '#F8F8F8',
                          borderRadius: 6,
                          border: '1px solid #E2E8F0',
                          fontSize: '0.82rem'
                        }}
                      >
                        <span style={{ color: '#4B4D52' }}>• {item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(idx)}
                          style={{ border: 'none', background: 'none', color: '#15171A', cursor: 'pointer', padding: 2 }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Links: GitHub, Demo, Architecture */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      GitHub Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formState.githubUrl}
                      onChange={(e) => setFormState((prev) => ({ ...prev, githubUrl: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Live Demo Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formState.demoUrl}
                      onChange={(e) => setFormState((prev) => ({ ...prev, demoUrl: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      placeholder="View Architecture & Code"
                      value={formState.ctaText}
                      onChange={(e) => setFormState((prev) => ({ ...prev, ctaText: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                {/* Thumbnail / Image Upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                    Project Thumbnail / Header Image
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="https://... or upload local file"
                      value={formState.thumbnailUrl}
                      onChange={(e) => setFormState((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                    <label
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', height: 40, whiteSpace: 'nowrap' }}
                    >
                      <Upload size={14} />
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleThumbnailUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                  </div>
                  {formState.thumbnailUrl && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={formState.thumbnailUrl}
                        alt="Preview"
                        style={{ width: 80, height: 45, borderRadius: 6, objectFit: 'cover', border: '1px solid #E2E8F0' }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormState((prev) => ({ ...prev, thumbnailUrl: '' }))}
                        style={{ border: 'none', background: 'none', color: '#15171A', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Display Order, Status & Enabled */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20, background: '#F8F8F8', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Display Order Index
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formState.orderIndex}
                      onChange={(e) => setFormState((prev) => ({ ...prev, orderIndex: parseInt(e.target.value, 10) || 0 }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#4B4D52', marginBottom: 6 }}>
                      Publication Status
                    </label>
                    <select
                      value={formState.status}
                      onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="HIDDEN">Hidden</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 700, color: '#4B4D52', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formState.isEnabled}
                        onChange={(e) => setFormState((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                        style={{ width: 16, height: 16 }}
                      />
                      <span>Project Enabled (Live)</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setProjectModal((prev) => ({ ...prev, open: false }))}
                    disabled={projectModal.isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={projectModal.isSubmitting}
                    style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    {projectModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : null}
                    <span>{projectModal.mode === 'create' ? 'Create Project' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CATEGORY MANAGEMENT */}
      {/* ========================================================================= */}
      {categoryModal.open && (
        <div
          className="razorpay-modal-overlay"
          style={{ zIndex: 3000 }}
          onClick={() => !categoryModal.isSubmitting && setCategoryModal((prev) => ({ ...prev, open: false }))}
        >
          <div
            className="razorpay-modal"
            style={{ maxWidth: 620, maxHeight: '85vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: 8, boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F4F4F5', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={18} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#15171A' }}>
                  Project Categories & Public Filter Tabs
                </h3>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => !categoryModal.isSubmitting && setCategoryModal((prev) => ({ ...prev, open: false }))}
                style={{ padding: 6, borderRadius: '50%', color: '#6B6D73' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {categoryModal.error && (
                <div style={{ padding: '8px 12px', borderRadius: 6, background: '#EFEFEF', border: '1px solid #D5D5D8', color: '#15171A', fontSize: '0.82rem', marginBottom: 16 }}>
                  {categoryModal.error}
                </div>
              )}

              {/* Add / Edit Category Form */}
              <form onSubmit={handleSaveCategory} style={{ background: '#F8F8F8', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 20 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15171A', marginBottom: 12 }}>
                  {categoryModal.editingCategory ? `Edit Category: ${categoryModal.editingCategory.name}` : 'Add New Category'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <input
                    type="text"
                    required
                    placeholder="Category Name (e.g. Robotics AI)"
                    value={categoryModal.name}
                    onChange={(e) => setCategoryModal((prev) => ({ ...prev, name: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Slug (e.g. robotics)"
                    value={categoryModal.slug}
                    onChange={(e) => setCategoryModal((prev) => ({ ...prev, slug: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Optional description..."
                  value={categoryModal.description}
                  onChange={(e) => setCategoryModal((prev) => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem', marginBottom: 12 }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  {categoryModal.editingCategory && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCategoryModal((prev) => ({ ...prev, editingCategory: null, name: '', slug: '', description: '' }))}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={categoryModal.isSubmitting}
                    style={{ fontWeight: 700 }}
                  >
                    {categoryModal.editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6B6D73', textTransform: 'uppercase', marginBottom: 10 }}>
                Existing Categories ({categories.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((c) => (
                  <div
                    key={c.id || c.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 2px rgba(15,23,42,0.02)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#15171A' }}>
                        {c.name} <span style={{ fontSize: '0.75rem', color: '#6B6D73', fontWeight: 500 }}>({c.slug})</span>
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '0.75rem', color: '#6B6D73', marginTop: 2 }}>{c.description}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setCategoryModal((prev) => ({
                          ...prev,
                          editingCategory: c,
                          name: c.name,
                          slug: c.slug,
                          description: c.description || ''
                        }))}
                        style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDeleteCategory(c)}
                        style={{ padding: '3px 8px', fontSize: '0.72rem', color: '#15171A', borderColor: '#E4E4E7' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmModal.open && (
        <div
          className="razorpay-modal-overlay"
          style={{ zIndex: 3100 }}
          onClick={() => !deleteConfirmModal.isSubmitting && setDeleteConfirmModal({ open: false, project: null, isSubmitting: false })}
        >
          <div
            className="razorpay-modal"
            style={{ maxWidth: 440, background: '#FFFFFF', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EFEFEF', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#15171A' }}>
                  Delete Project?
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#6B6D73' }}>
                  This action cannot be undone.
                </span>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: '#4B4D52', lineHeight: 1.5 }}>
                Are you sure you want to permanently remove <strong style={{ color: '#15171A' }}>"{deleteConfirmModal.project?.title}"</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setDeleteConfirmModal({ open: false, project: null, isSubmitting: false })}
                  disabled={deleteConfirmModal.isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={handleConfirmDeleteProject}
                  disabled={deleteConfirmModal.isSubmitting}
                  style={{ background: '#15171A', color: '#FFFFFF', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {deleteConfirmModal.isSubmitting ? <RefreshCw size={14} className="spin" /> : null}
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROJECT PREVIEW */}
      {/* ========================================================================= */}
      {previewProject && (
        <ProjectModal
          project={{
            ...previewProject,
            tags: previewProject.tagsList || previewProject.tags,
            deliverables: previewProject.deliverablesList || previewProject.deliverables
          }}
          isOpen={Boolean(previewProject)}
          onClose={() => setPreviewProject(null)}
        />
      )}
    </div>
  )
}

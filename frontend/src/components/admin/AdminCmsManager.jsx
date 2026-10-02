import { useState, useEffect, useMemo } from 'react'
import {
  Layout,
  Globe,
  FileText,
  Users,
  Sliders,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Save,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Upload,
  MoveUp,
  MoveDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  Link as LinkIcon,
  Info,
  ChevronRight,
  Image as ImageIcon,
  Compass,
  Award,
  HelpCircle,
  Layers,
  User
} from 'lucide-react'
import api from '../../services/api'
import defaultAboutData from '../../data/defaultAboutData'
import defaultFooterData from '../../data/defaultFooterData'

export default function AdminCmsManager({ showToast }) {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState('footer') // 'footer' | 'about' | 'leadership' | 'home'

  // Loading & Sync States
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  const [saveStatus, setSaveStatus] = useState('PUBLISHED') // 'PUBLISHED' | 'UNSAVED' | 'DRAFT_SAVED'

  // Content States
  const [aboutData, setAboutData] = useState(defaultAboutData)
  const [footerData, setFooterData] = useState(defaultFooterData)
  const [homeSections, setHomeSections] = useState({
    heroBadge: 'Practical AI & System Engineering Platform',
    heroHeadline: 'Learn Production-Grade AI by Building Industry Blueprints',
    heroSubheadline: 'Master Generative AI, Computer Vision, MLOps, and Full-Stack Engineering with hands-on capstone projects and live weekend architectural masterclasses.',
    primaryCtaText: 'Explore Projects & Catalog',
    secondaryCtaText: 'Join Next Live Cohort',
    stats: [
      { value: '100%', label: 'Hands-on Production Code' },
      { value: '4+', label: 'Industry Specialization Domains' },
      { value: '25k+', label: 'Lines of Architectural Blueprints' },
      { value: 'Zero', label: 'Fluff or Toy Notebooks' }
    ],
    showStats: true,
    showProjects: true,
    showLiveSessions: true,
    showTestimonials: true
  })

  // Sub-tabs
  const [aboutSubTab, setAboutSubTab] = useState('hero') // 'hero' | 'mission' | 'offerings' | 'philosophy'
  const [footerSubTab, setFooterSubTab] = useState('brand') // 'brand' | 'quickLinks' | 'coursesLinks' | 'contactLinks' | 'social'

  // Modals
  const [previewModal, setPreviewModal] = useState({ open: false, type: 'about' })
  const [restoreConfirmModal, setRestoreConfirmModal] = useState({ open: false, target: 'about' })
  const [unsavedWarningModal, setUnsavedWarningModal] = useState({ open: false, pendingTab: null })
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ open: false, title: '', onConfirm: null })

  // Editor Modals for Specific Items
  const [leaderModal, setLeaderModal] = useState({ open: false, leader: null, isNew: false })
  const [linkModal, setLinkModal] = useState({ open: false, colKey: 'quickLinks', link: null, index: -1 })
  const [pillarModal, setPillarModal] = useState({ open: false, type: 'whatWeDo', item: null, index: -1 })
  const [heroEditModal, setHeroEditModal] = useState(false)
  const [missionEditModal, setMissionEditModal] = useState({ open: false, type: 'mission' })
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  // Photo URL toggle in leader modal
  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false)

  // Initial Load from API
  const loadCmsData = async () => {
    try {
      setLoading(true)
      const [aboutRes, footerRes] = await Promise.allSettled([
        api.admin.getAbout(),
        api.admin.getFooter()
      ])

      if (aboutRes.status === 'fulfilled' && aboutRes.value?.data?.about) {
        const fetchedAbout = aboutRes.value.data.about
        setAboutData(fetchedAbout)
        if (fetchedAbout.homeSections) {
          setHomeSections(fetchedAbout.homeSections)
        }
      }

      if (footerRes.status === 'fulfilled' && footerRes.value?.data?.footer) {
        setFooterData(footerRes.value.data.footer)
      }

      setIsDirty(false)
      setSaveStatus('PUBLISHED')
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      console.warn('Failed to load CMS data:', err.message)
      showToast?.('Using default cached CMS data', 'info')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCmsData()
  }, [])

  // Mark content as dirty
  const markDirty = () => {
    setIsDirty(true)
    setSaveStatus('UNSAVED')
  }

  // Handle Tab Switch with Unsaved Safety
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return
    if (isDirty) {
      setUnsavedWarningModal({ open: true, pendingTab: newTab })
      return
    }
    setActiveTab(newTab)
  }

  // Save / Publish All Content
  const handlePublishAll = async () => {
    try {
      setIsSaving(true)
      const payloadAbout = {
        ...aboutData,
        homeSections
      }

      const [aboutRes, footerRes] = await Promise.all([
        api.admin.updateAbout(payloadAbout),
        api.admin.updateFooter(footerData)
      ])

      if (aboutRes?.data?.about) setAboutData(aboutRes.data.about)
      if (footerRes?.data?.footer) setFooterData(footerRes.data.footer)

      setIsDirty(false)
      setSaveStatus('PUBLISHED')
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      showToast?.('All public page content & footer published live successfully!', 'success')
    } catch (err) {
      console.error('Failed to publish CMS:', err)
      showToast?.(err.message || 'Failed to publish changes', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Save Draft (Local & State)
  const handleSaveDraft = () => {
    setSaveStatus('DRAFT_SAVED')
    showToast?.('Draft saved locally. Click "Publish Changes" to push live.', 'info')
  }

  // Discard Unsaved Changes
  const handleDiscardChanges = () => {
    loadCmsData()
    showToast?.('Unsaved modifications discarded.', 'info')
  }

  // Restore Defaults
  const handleRestoreDefaults = async (target) => {
    if (target === 'about') {
      setAboutData(JSON.parse(JSON.stringify(defaultAboutData)))
    } else if (target === 'footer') {
      setFooterData(JSON.parse(JSON.stringify(defaultFooterData)))
    }
    markDirty()
    setRestoreConfirmModal({ open: false, target: 'about' })
    showToast?.(`Restored default ${target === 'about' ? 'About & Leadership' : 'Footer'} content. Click Publish to apply.`, 'info')
  }

  // Photo Upload Handler
  const handlePhotoUpload = async (file, onComplete) => {
    if (!file) return
    try {
      setIsUploadingPhoto(true)
      const res = await api.admin.uploadMedia({ file, category: 'team' })
      if (res.data?.url) {
        onComplete(res.data.url)
        showToast?.('Photo uploaded successfully!', 'success')
      }
    } catch (err) {
      showToast?.(err.message || 'Photo upload failed', 'error')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  // Reordering Helpers
  const moveArrayItem = (list, index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= list.length) return list
    const updated = [...list]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    return updated
  }

  // Leadership Helpers
  const handleSaveLeader = (leaderObj) => {
    setAboutData((prev) => {
      const list = [...(prev.leadership || [])]
      if (leaderModal.isNew) {
        list.push({ ...leaderObj, id: `leader-${Date.now()}` })
      } else {
        const idx = list.findIndex((l) => l.id === leaderObj.id)
        if (idx !== -1) list[idx] = leaderObj
        else list.push(leaderObj)
      }
      return { ...prev, leadership: list }
    })
    markDirty()
    setLeaderModal({ open: false, leader: null, isNew: false })
    showToast?.('Leadership profile saved to draft.', 'success')
  }

  const handleDeleteLeader = (leaderId) => {
    setAboutData((prev) => ({
      ...prev,
      leadership: (prev.leadership || []).filter((l) => l.id !== leaderId)
    }))
    markDirty()
    setDeleteConfirmModal({ open: false, title: '', onConfirm: null })
    showToast?.('Leader removed from list.', 'info')
  }

  // Footer Link Helpers
  const handleSaveFooterLink = (colKey, linkObj, index) => {
    setFooterData((prev) => {
      const list = [...(prev[colKey] || [])]
      if (index === -1) {
        list.push(linkObj)
      } else {
        list[index] = linkObj
      }
      return { ...prev, [colKey]: list }
    })
    markDirty()
    setLinkModal({ open: false, colKey: 'quickLinks', link: null, index: -1 })
    showToast?.('Footer link saved to draft.', 'success')
  }

  const handleDeleteFooterLink = (colKey, index) => {
    setFooterData((prev) => {
      const list = (prev[colKey] || []).filter((_, i) => i !== index)
      return { ...prev, [colKey]: list }
    })
    markDirty()
    setDeleteConfirmModal({ open: false, title: '', onConfirm: null })
    showToast?.('Link removed.', 'info')
  }

  // Pillar / Offering Helpers
  const handleSavePillar = (type, itemObj, index) => {
    setAboutData((prev) => {
      const list = [...(prev[type] || [])]
      if (index === -1) {
        list.push(itemObj)
      } else {
        list[index] = itemObj
      }
      return { ...prev, [type]: list }
    })
    markDirty()
    setPillarModal({ open: false, type: 'whatWeDo', item: null, index: -1 })
    showToast?.('Content block saved to draft.', 'success')
  }

  const handleDeletePillar = (type, index) => {
    setAboutData((prev) => ({
      ...prev,
      [type]: (prev[type] || []).filter((_, i) => i !== index)
    }))
    markDirty()
    setDeleteConfirmModal({ open: false, title: '', onConfirm: null })
    showToast?.('Item removed.', 'info')
  }

  return (
    <div className="admin-cms-manager" style={{ padding: '24px 0', minHeight: '100vh', position: 'relative' }}>
      {/* =========================================================================
          1. ENTERPRISE PAGE HEADER
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: '1px solid var(--color-border, #E2E8F0)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)', margin: 0 }}>
              Public Pages &amp; Footer CMS
            </h1>

            {/* Status Indicator */}
            {saveStatus === 'PUBLISHED' && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#2D2F33',
                  background: '#EFEFEF',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D2F33' }} />
                Published (Live)
              </span>
            )}
            {saveStatus === 'UNSAVED' && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#4B4D52',
                  background: '#EFEFEF',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4B4D52' }} />
                Unsaved Changes
              </span>
            )}
            {saveStatus === 'DRAFT_SAVED' && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#15171A',
                  background: '#EFEFEF',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#15171A' }} />
                Draft Saved
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: 'var(--color-text-secondary, #64748B)', fontSize: '0.88rem' }}>
            Manage public website content, branding, leadership information, and footer navigation. Last synced: {lastSavedTime}
          </p>
        </div>

        {/* Header Right Actions: Preview · Open Live Site · Publish Changes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Preview — outlined secondary */}
          <button
            type="button"
            onClick={() => setPreviewModal({ open: true, type: activeTab })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-border, #CBD5E1)',
              background: 'transparent',
              color: 'var(--color-text, #334155)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <Eye size={15} />
            Preview{' '}
            {activeTab === 'footer' ? 'Footer'
              : activeTab === 'about' ? 'About'
              : activeTab === 'leadership' ? 'Leadership'
              : 'Home'}
          </button>

          {/* Open Live Site — subtle secondary with external link icon */}
          <a
            href={activeTab === 'about' || activeTab === 'leadership' ? '/about' : '/'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-border, #CBD5E1)',
              background: 'transparent',
              color: 'var(--color-text-secondary, #64748B)',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle, #F8FAFC)'; e.currentTarget.style.color = 'var(--color-text, #334155)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary, #64748B)' }}
            title="Open live public page in new tab"
          >
            <ExternalLink size={14} />
            Open Live Site
          </a>

          {/* Publish Changes — dark navy primary */}
          <button
            type="button"
            onClick={handlePublishAll}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 18px',
              borderRadius: 8,
              border: 'none',
              background: isSaving ? '#9B9DA3' : '#15171A',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
            }}
            onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.background = '#2D2F33' }}
            onMouseLeave={(e) => { if (!isSaving) e.currentTarget.style.background = '#15171A' }}
          >
            <Save size={14} />
            {isSaving ? 'Publishing…' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. WORKSPACE TOP NAVIGATION TABS
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'var(--color-bg-subtle, #F1F5F9)',
          padding: 6,
          borderRadius: 8,
          border: '1px solid var(--color-border, #E2E8F0)',
          marginBottom: 28,
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'footer', label: 'Footer & Brand', icon: Globe },
          { id: 'about', label: 'About Page', icon: FileText },
          { id: 'leadership', label: 'Leadership', icon: Users },
          { id: 'home', label: 'Home Page Sections', icon: Layout }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                background: isActive ? 'var(--color-surface, #FFFFFF)' : 'transparent',
                color: isActive ? 'var(--color-primary, #0F172A)' : 'var(--color-text-secondary, #64748B)',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} color={isActive ? '#15171A' : '#6B6D73'} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* =========================================================================
          3. TAB 1: FOOTER & BRAND CMS WORKSPACE
          ========================================================================= */}
      {activeTab === 'footer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border, #E2E8F0)', paddingBottom: 10, overflowX: 'auto' }}>
            {[
              { id: 'brand', label: 'Brand & Organization Bio' },
              { id: 'quickLinks', label: 'Quick Links' },
              { id: 'coursesLinks', label: 'Our Courses Links' },
              { id: 'contactLinks', label: 'Contact & Legal Links' },
              { id: 'copyright', label: 'Copyright & Social' }
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setFooterSubTab(sub.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: footerSubTab === sub.id ? '#F4F4F5' : 'transparent',
                  color: footerSubTab === sub.id ? '#15171A' : 'var(--color-text-secondary, #64748B)',
                  fontWeight: footerSubTab === sub.id ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub 1: Brand Info */}
          {footerSubTab === 'brand' && (
            <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                    Brand Information &amp; Bio
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                    Displayed in the primary footer column below the Aivortex logo across all public pages.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Organization Description / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={footerData.brandDesc || ''}
                    onChange={(e) => {
                      setFooterData({ ...footerData, brandDesc: e.target.value })
                      markDirty()
                    }}
                    placeholder="Enter short company bio..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={footerData.contactEmail || 'director@apexlearn.edu'}
                      onChange={(e) => {
                        setFooterData({ ...footerData, contactEmail: e.target.value })
                        markDirty()
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={footerData.contactPhone || '+91 98765 43210'}
                      onChange={(e) => {
                        setFooterData({ ...footerData, contactPhone: e.target.value })
                        markDirty()
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                      Physical Headquarters / Address
                    </label>
                    <input
                      type="text"
                      value={footerData.address || 'Bengaluru, Karnataka, India'}
                      onChange={(e) => {
                        setFooterData({ ...footerData, address: e.target.value })
                        markDirty()
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub 2, 3, 4: Link Tables */}
          {(footerSubTab === 'quickLinks' || footerSubTab === 'coursesLinks' || footerSubTab === 'contactLinks') && (() => {
            const colKey = footerSubTab
            const titleKey = colKey === 'quickLinks' ? 'quickLinksTitle' : colKey === 'coursesLinks' ? 'coursesTitle' : 'contactTitle'
            const links = footerData[colKey] || []

            return (
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                      {colKey === 'quickLinks' ? 'Quick Links (Column 2)' : colKey === 'coursesLinks' ? 'Our Courses (Column 3)' : 'Contact & Legal (Column 4)'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                      Manage column title and clickable navigation routes.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setLinkModal({ open: true, colKey, link: { label: '', path: '/' }, index: -1 })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                  >
                    <Plus size={15} />
                    Add Link
                  </button>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Column Display Title
                  </label>
                  <input
                    type="text"
                    value={footerData[titleKey] || ''}
                    onChange={(e) => {
                      setFooterData({ ...footerData, [titleKey]: e.target.value })
                      markDirty()
                    }}
                    style={{ width: '100%', maxWidth: 360, padding: '8px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #E2E8F0', color: '#5A5C62' }}>
                        <th style={{ padding: '10px 14px', width: 60 }}>Order</th>
                        <th style={{ padding: '10px 14px' }}>Label</th>
                        <th style={{ padding: '10px 14px' }}>Path / URL</th>
                        <th style={{ padding: '10px 14px', width: 140, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map((link, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '10px 14px', color: '#9B9DA3', fontWeight: 700 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span>{idx + 1}</span>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => {
                                    const updated = moveArrayItem(links, idx, -1)
                                    setFooterData({ ...footerData, [colKey]: updated })
                                    markDirty()
                                  }}
                                  style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 0.8, padding: 1 }}
                                >
                                  <MoveUp size={11} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === links.length - 1}
                                  onClick={() => {
                                    const updated = moveArrayItem(links, idx, 1)
                                    setFooterData({ ...footerData, [colKey]: updated })
                                    markDirty()
                                  }}
                                  style={{ border: 'none', background: 'none', cursor: idx === links.length - 1 ? 'default' : 'pointer', opacity: idx === links.length - 1 ? 0.3 : 0.8, padding: 1 }}
                                >
                                  <MoveDown size={11} />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{link.label}</td>
                          <td style={{ padding: '10px 14px', color: '#15171A', fontFamily: 'monospace', fontSize: '0.84rem' }}>{link.path}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => setLinkModal({ open: true, colKey, link, index: idx })}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px' }}
                                title="Edit Link"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    open: true,
                                    title: `Delete link "${link.label}"?`,
                                    onConfirm: () => handleDeleteFooterLink(colKey, idx)
                                  })
                                }
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', color: '#15171A' }}
                                title="Delete Link"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* Sub 5: Copyright */}
          {footerSubTab === 'copyright' && (
            <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--color-primary, #0F172A)' }}>
                Footer Copyright Statement
              </h3>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={footerData.copyrightText || ''}
                  onChange={(e) => {
                    setFooterData({ ...footerData, copyrightText: e.target.value })
                    markDirty()
                  }}
                  placeholder="e.g. © 2026 Aivortex. All rights reserved. Learn. Grow. Innovate."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          {/* ─── ADVANCED SETTINGS ─── */}
          <div
            style={{
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: 12,
              padding: '16px 20px',
              background: 'var(--color-bg-subtle, #F8FAFC)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #334155)', marginBottom: 2 }}>
                  Advanced Settings
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  Restore the system default content for the Footer &amp; Brand section.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestoreConfirmModal({ open: true, target: 'footer' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: '1px solid #D5D5D8',
                  background: 'transparent',
                  color: '#15171A',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#EFEFEF' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <RotateCcw size={13} />
                Restore Default Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. TAB 2: ABOUT PAGE CMS WORKSPACE
          ========================================================================= */}
      {activeTab === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border, #E2E8F0)', paddingBottom: 10, overflowX: 'auto' }}>
            {[
              { id: 'hero', label: 'Hero Headline & Narrative' },
              { id: 'mission', label: 'Mission & Vision' },
              { id: 'offerings', label: 'What We Do & Why Aivortex' },
              { id: 'philosophy', label: 'Philosophy, Audience & Promise' }
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setAboutSubTab(sub.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: aboutSubTab === sub.id ? '#F4F4F5' : 'transparent',
                  color: aboutSubTab === sub.id ? '#15171A' : 'var(--color-text-secondary, #64748B)',
                  fontWeight: aboutSubTab === sub.id ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub 1: Hero Section */}
          {aboutSubTab === 'hero' && (
            <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                    Hero Section
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                    Public header shown at the top of the About page.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setHeroEditModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Edit3 size={14} />
                  Edit Hero Content
                </button>
              </div>

              {/* Public Preview Card */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 28, textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5C62', marginBottom: 12 }}>
                  <span style={{ width: 16, height: 1.5, background: '#15171A' }} />
                  About Aivortex
                  <span style={{ width: 16, height: 1.5, background: '#15171A' }} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15171A', margin: '0 0 14px 0' }}>
                  {aboutData.hero?.title || defaultAboutData.hero.title}
                </h2>
                <p style={{ fontSize: '0.98rem', color: '#4B4D52', lineHeight: 1.6, fontWeight: 500, marginBottom: 14 }}>
                  {aboutData.hero?.subtitle || defaultAboutData.hero.subtitle}
                </p>
                <p style={{ fontSize: '0.88rem', color: '#6B6D73', lineHeight: 1.7, margin: 0 }}>
                  {aboutData.hero?.introParagraph || defaultAboutData.hero.introParagraph}
                </p>
              </div>
            </div>
          )}

          {/* Sub 2: Mission & Vision */}
          {aboutSubTab === 'mission' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))', gap: 20 }}>
              {/* Mission Card */}
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1.5px solid #E4E4E7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={18} color="#15171A" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#15171A' }}>
                      {aboutData.mission?.title || 'Our Mission'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setMissionEditModal({ open: true, type: 'mission' })}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4B4D52', lineHeight: 1.65, margin: 0 }}>
                  {aboutData.mission?.description || defaultAboutData.mission.description}
                </p>
              </div>

              {/* Vision Card */}
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1.5px solid #E4E4E7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#2D2F33" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#2D2F33' }}>
                      {aboutData.vision?.title || 'Our Vision'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setMissionEditModal({ open: true, type: 'vision' })}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#4B4D52', lineHeight: 1.65, margin: 0 }}>
                  {aboutData.vision?.description || defaultAboutData.vision.description}
                </p>
              </div>
            </div>
          )}

          {/* Sub 3: What We Do & Why Aivortex */}
          {aboutSubTab === 'offerings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* What We Do */}
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                      What We Do (Core Pillars)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                      Repeatable core curriculum and project focus areas.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setPillarModal({ open: true, type: 'whatWeDo', item: { title: '', description: '' }, index: -1 })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={14} /> Add Pillar
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {(aboutData.whatWeDo || []).map((pillar, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8F8F8',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15171A', background: '#F4F4F5', padding: '2px 8px', borderRadius: 4 }}>
                            Pillar 0{idx + 1}
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => setPillarModal({ open: true, type: 'whatWeDo', item: pillar, index: idx })}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B6D73', padding: 2 }}
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmModal({
                                  open: true,
                                  title: `Delete pillar "${pillar.title}"?`,
                                  onConfirm: () => handleDeletePillar('whatWeDo', idx)
                                })
                              }
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15171A', padding: 2 }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <h4 style={{ margin: '4px 0 6px 0', fontSize: '0.96rem', fontWeight: 700, color: '#15171A' }}>{pillar.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B6D73', lineHeight: 1.5 }}>{pillar.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Aivortex */}
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                      Why Aivortex (Value Propositions)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                      Key differentiators and institutional advantages.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setPillarModal({ open: true, type: 'whyAivortex', item: { title: '', description: '' }, index: -1 })}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={14} /> Add Value Prop
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {(aboutData.whyAivortex || []).map((val, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8F8F8',
                        borderRadius: 10,
                        border: '1px solid #E2E8F0',
                        padding: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2D2F33', background: '#EFEFEF', padding: '2px 8px', borderRadius: 4 }}>
                            Advantage 0{idx + 1}
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              onClick={() => setPillarModal({ open: true, type: 'whyAivortex', item: val, index: idx })}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B6D73', padding: 2 }}
                              title="Edit"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmModal({
                                  open: true,
                                  title: `Delete value proposition "${val.title}"?`,
                                  onConfirm: () => handleDeletePillar('whyAivortex', idx)
                                })
                              }
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#15171A', padding: 2 }}
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <h4 style={{ margin: '4px 0 6px 0', fontSize: '0.96rem', fontWeight: 700, color: '#15171A' }}>{val.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#6B6D73', lineHeight: 1.5 }}>{val.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub 4: Philosophy, Audience & Promise */}
          {aboutSubTab === 'philosophy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Philosophy 3-Step */}
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--color-primary, #0F172A)' }}>
                  Our Philosophy (Learn. Grow. Innovate.)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  {(aboutData.philosophy || []).map((ph, idx) => (
                    <div key={idx} style={{ background: '#F8F8F8', borderRadius: 10, padding: 16, border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15171A', marginBottom: 6 }}>
                        Step 0{idx + 1}: {ph.step}
                      </div>
                      <textarea
                        rows={2}
                        value={ph.tagline || ''}
                        onChange={(e) => {
                          const updated = [...(aboutData.philosophy || [])]
                          updated[idx] = { ...updated[idx], tagline: e.target.value }
                          setAboutData({ ...aboutData, philosophy: updated })
                          markDirty()
                        }}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Our Promise */}
              <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--color-primary, #0F172A)' }}>
                  Our Promise
                </h3>
                <textarea
                  rows={3}
                  value={aboutData.ourPromise || ''}
                  onChange={(e) => {
                    setAboutData({ ...aboutData, ourPromise: e.target.value })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          {/* ─── ADVANCED SETTINGS ─── */}
          <div
            style={{
              border: '1px solid var(--color-border, #E2E8F0)',
              borderRadius: 12,
              padding: '16px 20px',
              background: 'var(--color-bg-subtle, #F8FAFC)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text, #334155)', marginBottom: 2 }}>
                  Advanced Settings
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  Restore the system default content for the About Page section.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRestoreConfirmModal({ open: true, target: 'about' })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 7,
                  border: '1px solid #D5D5D8',
                  background: 'transparent',
                  color: '#15171A',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#EFEFEF' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <RotateCcw size={13} />
                Restore Default Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. TAB 3: EXECUTIVE LEADERSHIP CMS WORKSPACE (Requirement 6 & 7)
          ========================================================================= */}
      {activeTab === 'leadership' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header & Add Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                Executive Leadership Profiles
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: 'var(--color-text-secondary, #64748B)' }}>
                Manage executive leadership cards displayed publicly on the About page.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                setLeaderModal({
                  open: true,
                  isNew: true,
                  leader: {
                    id: '',
                    sectionTitle: 'Meet Our Leadership',
                    name: '',
                    role: '',
                    qualifications: '',
                    company: '',
                    bio: '',
                    image: '',
                    status: 'PUBLISHED'
                  }
                })
              }
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
            >
              <Plus size={16} />
              Add Leadership Member
            </button>
          </div>

          {/* Leadership Profile Cards Grid (Requirement 6) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 24 }}>
            {(aboutData.leadership || []).map((leader, index) => (
              <div
                key={leader.id || index}
                className="card"
                style={{
                  borderRadius: 8,
                  border: '1px solid var(--color-border, #E2E8F0)',
                  overflow: 'hidden',
                  background: 'var(--color-surface, #FFFFFF)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Photo & Badge Preview */}
                <div style={{ display: 'flex', gap: 20, padding: 20, background: '#F8F8F8', borderBottom: '1px solid #E2E8F0' }}>
                  <div
                    style={{
                      width: 100,
                      height: 115,
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: '#15171A',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0
                    }}
                  >
                    {leader.image ? (
                      <img
                        src={leader.image}
                        alt={leader.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B9DA3' }}>
                        <User size={32} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15171A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {leader.sectionTitle || 'Leadership'}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2D2F33', background: '#EFEFEF', padding: '1px 7px', borderRadius: 4 }}>
                        Published
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15171A', margin: '0 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {leader.name}
                    </h3>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#15171A', marginBottom: 2 }}>
                      {leader.role}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B6D73', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {leader.company}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 20, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase', marginBottom: 4 }}>
                      Qualifications
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#15171A', marginBottom: 12 }}>
                      {leader.qualifications || 'Professional Degrees'}
                    </div>

                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase', marginBottom: 4 }}>
                      Public Narrative
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#5A5C62', lineHeight: 1.5, margin: 0 }}>
                      {leader.bio || 'Executive biography and industry experience.'}
                    </p>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => {
                          const updated = moveArrayItem(aboutData.leadership, index, -1)
                          setAboutData({ ...aboutData, leadership: updated })
                          markDirty()
                        }}
                        style={{ border: '1px solid #CBD5E1', background: '#FFFFFF', padding: '5px 8px', borderRadius: 6, cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                        title="Move Up"
                      >
                        <MoveUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={index === aboutData.leadership.length - 1}
                        onClick={() => {
                          const updated = moveArrayItem(aboutData.leadership, index, 1)
                          setAboutData({ ...aboutData, leadership: updated })
                          markDirty()
                        }}
                        style={{ border: '1px solid #CBD5E1', background: '#FFFFFF', padding: '5px 8px', borderRadius: 6, cursor: index === aboutData.leadership.length - 1 ? 'default' : 'pointer', opacity: index === aboutData.leadership.length - 1 ? 0.3 : 1 }}
                        title="Move Down"
                      >
                        <MoveDown size={13} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setLeaderModal({ open: true, leader, isNew: false })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Edit3 size={13} />
                        Edit Profile
                      </button>

                      {aboutData.leadership.length > 2 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            setDeleteConfirmModal({
                              open: true,
                              title: `Delete leader profile "${leader.name}"?`,
                              onConfirm: () => handleDeleteLeader(leader.id)
                            })
                          }
                          style={{ color: '#15171A' }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          6. TAB 4: HOME PAGE SECTIONS WORKSPACE
          ========================================================================= */}
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Hero Section Copy */}
          <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--color-primary, #0F172A)' }}>
              Public Home: Hero Section Copy
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Eyebrow Badge Text
                </label>
                <input
                  type="text"
                  value={homeSections.heroBadge || ''}
                  onChange={(e) => {
                    setHomeSections({ ...homeSections, heroBadge: e.target.value })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Main Headline
                </label>
                <input
                  type="text"
                  value={homeSections.heroHeadline || ''}
                  onChange={(e) => {
                    setHomeSections({ ...homeSections, heroHeadline: e.target.value })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                  Subheading Narrative
                </label>
                <textarea
                  rows={2}
                  value={homeSections.heroSubheadline || ''}
                  onChange={(e) => {
                    setHomeSections({ ...homeSections, heroSubheadline: e.target.value })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Primary CTA Text
                  </label>
                  <input
                    type="text"
                    value={homeSections.primaryCtaText || ''}
                    onChange={(e) => {
                      setHomeSections({ ...homeSections, primaryCtaText: e.target.value })
                      markDirty()
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 6 }}>
                    Secondary CTA Text
                  </label>
                  <input
                    type="text"
                    value={homeSections.secondaryCtaText || ''}
                    onChange={(e) => {
                      setHomeSections({ ...homeSections, secondaryCtaText: e.target.value })
                      markDirty()
                    }}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="card" style={{ padding: 24, borderRadius: 8, border: '1px solid var(--color-border, #E2E8F0)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 14px 0', color: 'var(--color-primary, #0F172A)' }}>
              Public Home: Statistics Strip (4 Key Metrics)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {(homeSections.stats || []).map((st, idx) => (
                <div key={idx} style={{ background: '#F8F8F8', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B6D73', marginBottom: 4 }}>
                    Metric 0{idx + 1} Value
                  </label>
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => {
                      const updated = [...(homeSections.stats || [])]
                      updated[idx] = { ...updated[idx], value: e.target.value }
                      setHomeSections({ ...homeSections, stats: updated })
                      markDirty()
                    }}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.9rem', fontWeight: 800, marginBottom: 8 }}
                  />
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B6D73', marginBottom: 4 }}>
                    Label
                  </label>
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const updated = [...(homeSections.stats || [])]
                      updated[idx] = { ...updated[idx], label: e.target.value }
                      setHomeSections({ ...homeSections, stats: updated })
                      markDirty()
                    }}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.82rem' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. COMPACT FLOATING STICKY ACTION BAR (Requirement 18)
          Only appears when unsaved changes exist!
          ========================================================================= */}
      {isDirty && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            borderRadius: 9999,
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            zIndex: 900
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4B4D52', display: 'inline-block' }} />
            Unsaved changes detected
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handleDiscardChanges}
              style={{
                background: 'none',
                border: 'none',
                color: '#9B9DA3',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '4px 8px'
              }}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              style={{
                background: '#4B4D52',
                border: 'none',
                color: '#F8F8F8',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 9999
              }}
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublishAll}
              disabled={isSaving}
              style={{
                background: '#15171A',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '6px 16px',
                borderRadius: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Save size={13} />
              {isSaving ? 'Publishing...' : 'Publish Changes'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          8. LEADERSHIP PROFILE EDITOR MODAL (Requirement 6 & 7)
          2-Column Professional Layout: Left Photo (30%), Right Fields (70%)
          ========================================================================= */}
      {leaderModal.open && leaderModal.leader && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 860,
              height: '88vh',
              maxHeight: 720,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 8,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}
          >
            {/* ── STICKY MODAL HEADER ── */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border, #E2E8F0)',
                background: 'var(--color-surface, #FFFFFF)',
                flexShrink: 0
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary, #0F172A)' }}>
                  {leaderModal.isNew ? 'Add Leadership Profile' : `Edit: ${leaderModal.leader.name}`}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#6B6D73' }}>
                  Manage executive qualifications, position, and public photo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLeaderModal({ open: false, leader: null, isNew: false })}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B6D73', padding: 6, borderRadius: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <form
              id="leader-profile-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveLeader(leaderModal.leader)
              }}
              style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 220px) 1fr', gap: 24 }}>
                {/* LEFT: Profile Photo Area */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  {/* Section Label */}
                  <div style={{ width: '100%', fontSize: '0.72rem', fontWeight: 700, color: '#5A5C62', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                    Profile Photo
                  </div>

                  {/* Photo Preview Box */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      maxHeight: 220,
                      borderRadius: 10,
                      background: '#15171A',
                      overflow: 'hidden',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0
                    }}
                  >
                    {leaderModal.leader.image ? (
                      <img
                        src={leaderModal.leader.image}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6B6D73', gap: 6 }}>
                        <User size={40} />
                        <span style={{ fontSize: '0.72rem', color: '#9B9DA3' }}>No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Replace / Upload Photo Button */}
                  <label
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 8,
                      border: '1px solid #15171A',
                      background: '#F4F4F5',
                      color: '#15171A',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      cursor: isUploadingPhoto ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Upload size={13} />
                    {isUploadingPhoto
                      ? 'Uploading…'
                      : leaderModal.leader.image
                        ? 'Replace Photo'
                        : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handlePhotoUpload(file, (url) => {
                            setLeaderModal((prev) => ({ ...prev, leader: { ...prev.leader, image: url } }))
                          })
                        }
                      }}
                      disabled={isUploadingPhoto}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Remove Photo (only when photo exists) */}
                  {leaderModal.leader.image && (
                    <button
                      type="button"
                      onClick={() => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, image: '' } })}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #D5D5D8',
                        background: 'transparent',
                        color: '#15171A',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EFEFEF' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      Remove Photo
                    </button>
                  )}

                  {/* URL Toggle (hidden by default) */}
                  <button
                    type="button"
                    onClick={() => setShowPhotoUrlInput(!showPhotoUrlInput)}
                    style={{ background: 'none', border: 'none', color: '#9B9DA3', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    {showPhotoUrlInput ? 'Hide URL input' : 'Use URL instead'}
                  </button>

                  {showPhotoUrlInput && (
                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg"
                      value={leaderModal.leader.image || ''}
                      onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, image: e.target.value } })}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.78rem' }}
                    />
                  )}
                </div>

                {/* RIGHT: Grouped Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* BASIC INFORMATION */}
                  <div style={{ background: '#F8F8F8', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15171A', textTransform: 'uppercase', marginBottom: 10 }}>
                      Basic Information
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Full Name *</label>
                        <input
                          type="text"
                          required
                          value={leaderModal.leader.name}
                          onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, name: e.target.value } })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Role / Title *</label>
                        <input
                          type="text"
                          required
                          value={leaderModal.leader.role}
                          onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, role: e.target.value } })}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Degrees &amp; Qualifications</label>
                      <input
                        type="text"
                        value={leaderModal.leader.qualifications || ''}
                        onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, qualifications: e.target.value } })}
                        placeholder="e.g. B.E, PDDDS, MS-Data Science"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* PROFESSIONAL POSITION */}
                  <div style={{ background: '#F8F8F8', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2D2F33', textTransform: 'uppercase', marginBottom: 10 }}>
                      Professional Position
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Company / Industry Position</label>
                      <input
                        type="text"
                        value={leaderModal.leader.company || ''}
                        onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, company: e.target.value } })}
                        placeholder="e.g. Data Science specialist at Big4"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* BIO */}
                  <div style={{ background: '#F8F8F8', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5A5C62', textTransform: 'uppercase', marginBottom: 10 }}>
                      Public Profile &amp; Bio
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Biography</label>
                      <textarea
                        rows={3}
                        value={leaderModal.leader.bio || ''}
                        onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, bio: e.target.value } })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* DISPLAY SETTINGS */}
                  <div style={{ background: '#F8F8F8', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2D2F33', textTransform: 'uppercase', marginBottom: 10 }}>
                      Display Settings
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Section Badge Label</label>
                      <input
                        type="text"
                        value={leaderModal.leader.sectionTitle || ''}
                        onChange={(e) => setLeaderModal({ ...leaderModal, leader: { ...leaderModal.leader, sectionTitle: e.target.value } })}
                        placeholder="e.g. Meet our CEO"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* ── STICKY MODAL FOOTER ── */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                padding: '14px 24px',
                borderTop: '1px solid var(--color-border, #E2E8F0)',
                background: 'var(--color-surface, #FFFFFF)',
                flexShrink: 0
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setLeaderModal({ open: false, leader: null, isNew: false })
                  setShowPhotoUrlInput(false)
                }}
              >
                Cancel
              </button>
              <button type="submit" form="leader-profile-form" className="btn btn-primary" style={{ fontWeight: 700, minWidth: 120 }}>
                <Check size={15} style={{ marginRight: 6 }} />
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          9. EDIT HERO MODAL
          ========================================================================= */}
      {heroEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Edit About Page Hero</h3>
              <button type="button" onClick={() => setHeroEditModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Main Headline</label>
                <input
                  type="text"
                  value={aboutData.hero?.title || ''}
                  onChange={(e) => {
                    setAboutData({ ...aboutData, hero: { ...aboutData.hero, title: e.target.value } })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Subtitle</label>
                <textarea
                  rows={3}
                  value={aboutData.hero?.subtitle || ''}
                  onChange={(e) => {
                    setAboutData({ ...aboutData, hero: { ...aboutData.hero, subtitle: e.target.value } })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Extended Narrative</label>
                <textarea
                  rows={4}
                  value={aboutData.hero?.introParagraph || ''}
                  onChange={(e) => {
                    setAboutData({ ...aboutData, hero: { ...aboutData.hero, introParagraph: e.target.value } })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setHeroEditModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. EDIT MISSION / VISION MODAL
          ========================================================================= */}
      {missionEditModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 600,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Edit {missionEditModal.type === 'mission' ? 'Mission Statement' : 'Vision Statement'}
              </h3>
              <button type="button" onClick={() => setMissionEditModal({ open: false, type: 'mission' })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Title</label>
                <input
                  type="text"
                  value={aboutData[missionEditModal.type]?.title || ''}
                  onChange={(e) => {
                    setAboutData({
                      ...aboutData,
                      [missionEditModal.type]: { ...aboutData[missionEditModal.type], title: e.target.value }
                    })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Statement Description</label>
                <textarea
                  rows={4}
                  value={aboutData[missionEditModal.type]?.description || ''}
                  onChange={(e) => {
                    setAboutData({
                      ...aboutData,
                      [missionEditModal.type]: { ...aboutData[missionEditModal.type], description: e.target.value }
                    })
                    markDirty()
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={() => setMissionEditModal({ open: false, type: 'mission' })}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. EDIT FOOTER LINK MODAL
          ========================================================================= */}
      {linkModal.open && linkModal.link && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {linkModal.index === -1 ? 'Add Footer Link' : 'Edit Footer Link'}
              </h3>
              <button type="button" onClick={() => setLinkModal({ open: false, colKey: 'quickLinks', link: null, index: -1 })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Display Label *</label>
                <input
                  type="text"
                  required
                  value={linkModal.link.label}
                  onChange={(e) => setLinkModal({ ...linkModal, link: { ...linkModal.link, label: e.target.value } })}
                  placeholder="e.g. Domain Projects"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Path / URL *</label>
                <input
                  type="text"
                  required
                  value={linkModal.link.path}
                  onChange={(e) => setLinkModal({ ...linkModal, link: { ...linkModal.link, path: e.target.value } })}
                  placeholder="e.g. /projects or https://..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setLinkModal({ open: false, colKey: 'quickLinks', link: null, index: -1 })}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSaveFooterLink(linkModal.colKey, linkModal.link, linkModal.index)}
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          12. EDIT PILLAR / OFFERING MODAL
          ========================================================================= */}
      {pillarModal.open && pillarModal.item && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {pillarModal.index === -1 ? 'Add Content Item' : 'Edit Content Item'}
              </h3>
              <button type="button" onClick={() => setPillarModal({ open: false, type: 'whatWeDo', item: null, index: -1 })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Title *</label>
                <input
                  type="text"
                  required
                  value={pillarModal.item.title}
                  onChange={(e) => setPillarModal({ ...pillarModal, item: { ...pillarModal.item, title: e.target.value } })}
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>Description *</label>
                <textarea
                  rows={3}
                  required
                  value={pillarModal.item.description}
                  onChange={(e) => setPillarModal({ ...pillarModal, item: { ...pillarModal.item, description: e.target.value } })}
                  placeholder="Summary of this pillar or advantage..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPillarModal({ open: false, type: 'whatWeDo', item: null, index: -1 })}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSavePillar(pillarModal.type, pillarModal.item, pillarModal.index)}
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          13. LIVE PREVIEW MODAL (Requirement 16)
          ========================================================================= */}
      {previewModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 960,
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 18,
              padding: 28,
              background: '#FFFFFF',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#15171A" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#15171A' }}>
                  Live Public Preview
                </h3>
              </div>
              <button type="button" onClick={() => setPreviewModal({ open: false, type: 'about' })} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Preview Body according to active type */}
            <div style={{ background: '#F8F8F8', padding: 24, borderRadius: 8, border: '1px solid #E2E8F0' }}>
              {previewModal.type === 'leadership' ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15171A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Leadership</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15171A', margin: '4px 0 0 0' }}>Executive Leadership</h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    {(aboutData.leadership || []).map((l, idx) => (
                      <div key={idx} style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <div style={{ height: 260, background: '#15171A' }}>
                          {l.image && <img src={l.image} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />}
                        </div>
                        <div style={{ padding: 20 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#15171A', textTransform: 'uppercase' }}>{l.sectionTitle}</div>
                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0 4px 0' }}>{l.name}</h4>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15171A', marginBottom: 4 }}>{l.role}</div>
                          <div style={{ fontSize: '0.78rem', color: '#6B6D73', marginBottom: 10 }}>{l.company}</div>
                          <p style={{ fontSize: '0.82rem', color: '#5A5C62', lineHeight: 1.5, margin: 0 }}>{l.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : previewModal.type === 'footer' ? (
                <div style={{ background: '#15171A', color: '#F8F8F8', padding: 28, borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 24 }}>
                    <div>
                      <h4 style={{ color: '#FFFFFF', margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 800 }}>AIVORTEX</h4>
                      <p style={{ fontSize: '0.82rem', color: '#9B9DA3', lineHeight: 1.6 }}>{footerData.brandDesc}</p>
                    </div>
                    <div>
                      <h5 style={{ color: '#FFFFFF', margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 700 }}>{footerData.quickLinksTitle}</h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: '#9B9DA3' }}>
                        {(footerData.quickLinks || []).map((l, i) => (
                          <li key={i}>{l.label}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 style={{ color: '#FFFFFF', margin: '0 0 10px 0', fontSize: '0.88rem', fontWeight: 700 }}>{footerData.coursesTitle}</h5>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: '#9B9DA3' }}>
                        {(footerData.coursesLinks || []).slice(0, 5).map((l, i) => (
                          <li key={i}>{l.label}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #1E293B', paddingTop: 14, fontSize: '0.78rem', color: '#6B6D73', textAlign: 'center' }}>
                    {footerData.copyrightText}
                  </div>
                </div>
              ) : (
                /* About Page Preview */
                <div style={{ background: '#FFFFFF', padding: 28, borderRadius: 12 }}>
                  <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 32px auto' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15171A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>About Aivortex</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 12px 0' }}>{aboutData.hero?.title}</h2>
                    <p style={{ fontSize: '0.95rem', color: '#4B4D52', lineHeight: 1.6 }}>{aboutData.hero?.subtitle}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ padding: 18, borderRadius: 10, background: '#F4F4F5', border: '1px solid #E4E4E7' }}>
                      <h4 style={{ color: '#15171A', margin: '0 0 8px 0', fontWeight: 800 }}>{aboutData.mission?.title}</h4>
                      <p style={{ fontSize: '0.84rem', color: '#2D2F33', lineHeight: 1.6, margin: 0 }}>{aboutData.mission?.description}</p>
                    </div>
                    <div style={{ padding: 18, borderRadius: 10, background: '#F4F4F5', border: '1px solid #E4E4E7' }}>
                      <h4 style={{ color: '#2D2F33', margin: '0 0 8px 0', fontWeight: 800 }}>{aboutData.vision?.title}</h4>
                      <p style={{ fontSize: '0.84rem', color: '#2D2F33', lineHeight: 1.6, margin: 0 }}>{aboutData.vision?.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          14. UNSAVED CHANGES SAFETY MODAL (Requirement 17)
          No window.confirm or window.alert!
          ========================================================================= */}
      {unsavedWarningModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFEFEF', color: '#4B4D52', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
                  Unsaved Changes
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  You have unsaved edits in this workspace.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4B4D52', lineHeight: 1.5, marginBottom: 20 }}>
              Would you like to stay and publish your changes, save a local draft, or discard your unsaved modifications?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setUnsavedWarningModal({ open: false, pendingTab: null })}
              >
                Stay
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  handleDiscardChanges()
                  setActiveTab(unsavedWarningModal.pendingTab)
                  setUnsavedWarningModal({ open: false, pendingTab: null })
                }}
                style={{ color: '#15171A' }}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  await handlePublishAll()
                  setActiveTab(unsavedWarningModal.pendingTab)
                  setUnsavedWarningModal({ open: false, pendingTab: null })
                }}
              >
                Publish &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          15. RESTORE DEFAULTS MODAL (Requirement 19)
          ========================================================================= */}
      {restoreConfirmModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFEFEF', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RotateCcw size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
                  Restore Default Content?
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  This will replace current draft content with system defaults.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4B4D52', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to restore the official default copy for {restoreConfirmModal.target === 'about' ? 'About & Leadership' : 'Footer'}? You can still review the draft before publishing live.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRestoreConfirmModal({ open: false, target: 'about' })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleRestoreDefaults(restoreConfirmModal.target)}
                style={{ background: '#15171A', borderColor: '#15171A' }}
              >
                Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          16. DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {deleteConfirmModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: 16
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: 420,
              borderRadius: 8,
              padding: 24,
              background: 'var(--color-surface, #FFFFFF)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFEFEF', color: '#15171A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary, #0F172A)' }}>
                  Confirm Deletion
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary, #64748B)' }}>
                  This action will remove the item from draft.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4B4D52', lineHeight: 1.5, marginBottom: 20 }}>
              {deleteConfirmModal.title || 'Are you sure you want to delete this item?'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmModal({ open: false, title: '', onConfirm: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={deleteConfirmModal.onConfirm}
                style={{ background: '#15171A', borderColor: '#15171A' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

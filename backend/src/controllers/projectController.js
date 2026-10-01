import prisma from '../config/prisma.js'

/**
 * Public: Get active project categories
 * GET /api/public/projects/categories
 */
export async function getPublicProjectCategories(req, res) {
  try {
    const categories = await prisma.projectCategory.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' }
    })

    return res.json({
      success: true,
      data: { categories }
    })
  } catch (error) {
    console.error('getPublicProjectCategories error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch categories' })
  }
}

/**
 * Public: Get published & enabled projects
 * GET /api/public/projects
 */
export async function getPublicProjects(req, res) {
  try {
    const { category } = req.query

    const where = {
      status: 'PUBLISHED',
      isEnabled: true
    }

    if (category && category !== 'all' && category !== 'ALL') {
      where.OR = [
        { category: category },
        { categoryId: category },
        { categoryRel: { slug: category } }
      ]
    }

    const projects = await prisma.domainProject.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      include: {
        categoryRel: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    const formatted = projects.map((p) => {
      let tagList = []
      if (p.tags) {
        try {
          tagList = typeof p.tags === 'string' && p.tags.startsWith('[') ? JSON.parse(p.tags) : p.tags.split(',').map((t) => t.trim()).filter(Boolean)
        } catch {
          tagList = p.tags.split(',').map((t) => t.trim()).filter(Boolean)
        }
      } else if (p.tools) {
        tagList = p.tools.split(',').map((t) => t.trim()).filter(Boolean)
      }

      let deliverableList = []
      if (p.deliverables) {
        try {
          deliverableList = typeof p.deliverables === 'string' && p.deliverables.startsWith('[') ? JSON.parse(p.deliverables) : p.deliverables.split('\n').map((d) => d.trim()).filter(Boolean)
        } catch {
          deliverableList = p.deliverables.split('\n').map((d) => d.trim()).filter(Boolean)
        }
      }

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.categoryRel?.slug || p.category,
        categoryLabel: p.categoryRel?.name || p.categoryLabel || p.category,
        categoryId: p.categoryId,
        difficulty: p.difficulty || 'Advanced',
        duration: p.duration || '4 Weeks',
        badge: p.badge || (p.isFeatured ? 'Capstone Project' : 'Industry Standard'),
        summary: p.description || p.detailedDescription || '',
        description: p.description || '',
        detailedDescription: p.detailedDescription || p.description || '',
        architecture: p.architecture || p.description || '',
        tags: tagList,
        deliverables: deliverableList,
        architectureUrl: p.architectureUrl,
        githubUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        thumbnailUrl: p.thumbnailUrl,
        ctaText: p.ctaText || 'View Architecture & Code',
        orderIndex: p.orderIndex,
        status: p.status,
        isEnabled: p.isEnabled,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }
    })

    return res.json({
      success: true,
      data: {
        projects: formatted,
        total: formatted.length
      }
    })
  } catch (error) {
    console.error('getPublicProjects error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch public projects' })
  }
}

/**
 * Admin: Get all projects with filters
 * GET /api/admin/projects
 */
export async function getAdminProjects(req, res) {
  try {
    const { status, categoryId, search } = req.query

    const where = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (categoryId && categoryId !== 'ALL') {
      where.OR = [
        { categoryId: categoryId },
        { category: categoryId }
      ]
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { detailedDescription: { contains: q, mode: 'insensitive' } },
            { categoryLabel: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } }
          ]
        }
      ]
    }

    const projects = await prisma.domainProject.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
      include: {
        categoryRel: {
          select: { id: true, name: true, slug: true }
        }
      }
    })

    const formatted = projects.map((p) => {
      let tagList = []
      if (p.tags) {
        try {
          tagList = typeof p.tags === 'string' && p.tags.startsWith('[') ? JSON.parse(p.tags) : p.tags.split(',').map((t) => t.trim()).filter(Boolean)
        } catch {
          tagList = p.tags.split(',').map((t) => t.trim()).filter(Boolean)
        }
      } else if (p.tools) {
        tagList = p.tools.split(',').map((t) => t.trim()).filter(Boolean)
      }

      let deliverableList = []
      if (p.deliverables) {
        try {
          deliverableList = typeof p.deliverables === 'string' && p.deliverables.startsWith('[') ? JSON.parse(p.deliverables) : p.deliverables.split('\n').map((d) => d.trim()).filter(Boolean)
        } catch {
          deliverableList = p.deliverables.split('\n').map((d) => d.trim()).filter(Boolean)
        }
      }

      return {
        ...p,
        tagsList: tagList,
        deliverablesList: deliverableList,
        categorySlug: p.categoryRel?.slug || p.category,
        categoryName: p.categoryRel?.name || p.categoryLabel || p.category
      }
    })

    return res.json({
      success: true,
      data: {
        projects: formatted,
        total: formatted.length
      }
    })
  } catch (error) {
    console.error('getAdminProjects error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch admin projects' })
  }
}

/**
 * Admin: Get single project by ID
 * GET /api/admin/projects/:id
 */
export async function getAdminProjectById(req, res) {
  try {
    const { id } = req.params
    const project = await prisma.domainProject.findUnique({
      where: { id },
      include: { categoryRel: true }
    })

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    return res.json({
      success: true,
      data: { project }
    })
  } catch (error) {
    console.error('getAdminProjectById error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch project' })
  }
}

/**
 * Admin: Create a project
 * POST /api/admin/projects
 */
export async function createAdminProject(req, res) {
  try {
    const {
      title,
      slug,
      categoryId,
      category,
      categoryLabel,
      difficulty,
      duration,
      badge,
      description,
      detailedDescription,
      architecture,
      tags,
      deliverables,
      architectureUrl,
      githubUrl,
      demoUrl,
      thumbnailUrl,
      ctaText,
      orderIndex,
      status,
      isEnabled,
      isFeatured
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Project title is required' })
    }

    const generatedSlug = (slug && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : title.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') + '-' + Date.now().toString().slice(-4)

    // Check slug collision
    const existing = await prisma.domainProject.findUnique({ where: { slug: generatedSlug } })
    const finalSlug = existing ? `${generatedSlug}-${Date.now().toString().slice(-4)}` : generatedSlug

    let resolvedCategory = category || 'genai'
    let resolvedCategoryLabel = categoryLabel || 'Generative AI'
    let catId = categoryId || null

    if (catId) {
      const cat = await prisma.projectCategory.findUnique({ where: { id: catId } })
      if (cat) {
        resolvedCategory = cat.slug
        resolvedCategoryLabel = cat.name
      }
    } else if (category) {
      const cat = await prisma.projectCategory.findFirst({
        where: { OR: [{ slug: category }, { name: { equals: category, mode: 'insensitive' } }] }
      })
      if (cat) {
        catId = cat.id
        resolvedCategory = cat.slug
        resolvedCategoryLabel = cat.name
      }
    }

    // Format tags & deliverables as JSON strings
    const finalTags = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? tags : '')
    const finalDeliverables = Array.isArray(deliverables) ? JSON.stringify(deliverables) : (typeof deliverables === 'string' ? deliverables : '')

    const project = await prisma.domainProject.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        category: resolvedCategory,
        categoryLabel: resolvedCategoryLabel,
        categoryId: catId,
        difficulty: difficulty || 'Advanced',
        duration: duration || '4 Weeks',
        badge: badge || 'Capstone Project',
        description: description?.trim() || '',
        detailedDescription: detailedDescription?.trim() || description?.trim() || '',
        objective: detailedDescription?.trim() || description?.trim() || '',
        architecture: architecture?.trim() || '',
        tools: Array.isArray(tags) ? tags.join(', ') : (typeof tags === 'string' ? tags : 'Python, PyTorch'),
        tags: finalTags,
        deliverables: finalDeliverables,
        architectureUrl: architectureUrl || null,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        ctaText: ctaText || 'View Architecture & Code',
        orderIndex: Number.isInteger(orderIndex) ? orderIndex : 0,
        status: status || 'PUBLISHED',
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        isFeatured: Boolean(isFeatured)
      },
      include: { categoryRel: true }
    })

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    })
  } catch (error) {
    console.error('createAdminProject error:', error)
    return res.status(500).json({ success: false, error: 'Failed to create project: ' + error.message })
  }
}

/**
 * Admin: Update a project
 * PUT /api/admin/projects/:id
 */
export async function updateAdminProject(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.domainProject.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const {
      title,
      slug,
      categoryId,
      category,
      categoryLabel,
      difficulty,
      duration,
      badge,
      description,
      detailedDescription,
      architecture,
      tags,
      deliverables,
      architectureUrl,
      githubUrl,
      demoUrl,
      thumbnailUrl,
      ctaText,
      orderIndex,
      status,
      isEnabled,
      isFeatured
    } = req.body

    const updateData = {}

    if (title !== undefined) updateData.title = title.trim()
    if (slug !== undefined && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      if (cleanSlug !== existing.slug) {
        const slugExists = await prisma.domainProject.findUnique({ where: { slug: cleanSlug } })
        if (slugExists && slugExists.id !== id) {
          return res.status(400).json({ success: false, error: 'Project slug is already in use' })
        }
        updateData.slug = cleanSlug
      }
    }

    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await prisma.projectCategory.findUnique({ where: { id: categoryId } })
        if (cat) {
          updateData.categoryId = cat.id
          updateData.category = cat.slug
          updateData.categoryLabel = cat.name
        }
      } else {
        updateData.categoryId = null
      }
    } else if (category !== undefined) {
      updateData.category = category
      if (categoryLabel !== undefined) updateData.categoryLabel = categoryLabel
    }

    if (difficulty !== undefined) updateData.difficulty = difficulty
    if (duration !== undefined) updateData.duration = duration
    if (badge !== undefined) updateData.badge = badge
    if (description !== undefined) updateData.description = description
    if (detailedDescription !== undefined) {
      updateData.detailedDescription = detailedDescription
      updateData.objective = detailedDescription
    }
    if (architecture !== undefined) updateData.architecture = architecture
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags
      updateData.tools = Array.isArray(tags) ? tags.join(', ') : tags
    }
    if (deliverables !== undefined) {
      updateData.deliverables = Array.isArray(deliverables) ? JSON.stringify(deliverables) : deliverables
    }
    if (architectureUrl !== undefined) updateData.architectureUrl = architectureUrl
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl
    if (demoUrl !== undefined) updateData.demoUrl = demoUrl
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl
    if (ctaText !== undefined) updateData.ctaText = ctaText
    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex)
    if (status !== undefined) updateData.status = status
    if (isEnabled !== undefined) updateData.isEnabled = Boolean(isEnabled)
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)

    const updated = await prisma.domainProject.update({
      where: { id },
      data: updateData,
      include: { categoryRel: true }
    })

    return res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updated }
    })
  } catch (error) {
    console.error('updateAdminProject error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update project: ' + error.message })
  }
}

/**
 * Admin: Delete a project
 * DELETE /api/admin/projects/:id
 */
export async function deleteAdminProject(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.domainProject.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    await prisma.domainProject.delete({ where: { id } })

    return res.json({
      success: true,
      message: `Project "${existing.title}" permanently deleted.`
    })
  } catch (error) {
    console.error('deleteAdminProject error:', error)
    return res.status(500).json({ success: false, error: 'Failed to delete project' })
  }
}

/**
 * Admin: Publish / unpublish project
 * PATCH /api/admin/projects/:id/publish
 */
export async function togglePublishAdminProject(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    const existing = await prisma.domainProject.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const nextStatus = status || (existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
    const updated = await prisma.domainProject.update({
      where: { id },
      data: { status: nextStatus }
    })

    return res.json({
      success: true,
      message: `Project status updated to ${nextStatus}`,
      data: { project: updated }
    })
  } catch (error) {
    console.error('togglePublishAdminProject error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update publish status' })
  }
}

/**
 * Admin: Toggle enable/disable project
 * PATCH /api/admin/projects/:id/toggle-enable
 */
export async function toggleEnableAdminProject(req, res) {
  try {
    const { id } = req.params
    const { isEnabled } = req.body

    const existing = await prisma.domainProject.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    const nextEnabled = isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled
    const updated = await prisma.domainProject.update({
      where: { id },
      data: { isEnabled: nextEnabled }
    })

    return res.json({
      success: true,
      message: `Project ${nextEnabled ? 'enabled' : 'disabled'} successfully`,
      data: { project: updated }
    })
  } catch (error) {
    console.error('toggleEnableAdminProject error:', error)
    return res.status(500).json({ success: false, error: 'Failed to toggle project state' })
  }
}

/**
 * Admin: Reorder projects
 * PATCH /api/admin/projects/reorder
 */
export async function reorderAdminProjects(req, res) {
  try {
    const { items } = req.body // array of { id, orderIndex }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid items array' })
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.domainProject.update({
          where: { id: item.id },
          data: { orderIndex: Number(item.orderIndex) }
        })
      )
    )

    return res.json({
      success: true,
      message: 'Projects reordered successfully'
    })
  } catch (error) {
    console.error('reorderAdminProjects error:', error)
    return res.status(500).json({ success: false, error: 'Failed to reorder projects' })
  }
}

/**
 * Admin: Get all categories
 * GET /api/admin/projects/categories
 */
export async function getAdminCategories(req, res) {
  try {
    const categories = await prisma.projectCategory.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    })

    return res.json({
      success: true,
      data: { categories }
    })
  } catch (error) {
    console.error('getAdminCategories error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch categories' })
  }
}

/**
 * Admin: Create category
 * POST /api/admin/projects/categories
 */
export async function createAdminCategory(req, res) {
  try {
    const { name, slug, description, orderIndex, isActive } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required' })
    }

    const cleanSlug = (slug && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')

    const existing = await prisma.projectCategory.findFirst({
      where: { OR: [{ slug: cleanSlug }, { name: { equals: name.trim(), mode: 'insensitive' } }] }
    })

    if (existing) {
      return res.status(400).json({ success: false, error: 'Category with this name or slug already exists' })
    }

    const category = await prisma.projectCategory.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        orderIndex: Number.isInteger(orderIndex) ? orderIndex : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    })
  } catch (error) {
    console.error('createAdminCategory error:', error)
    return res.status(500).json({ success: false, error: 'Failed to create category' })
  }
}

/**
 * Admin: Update category
 * PUT /api/admin/projects/categories/:id
 */
export async function updateAdminCategory(req, res) {
  try {
    const { id } = req.params
    const { name, slug, description, orderIndex, isActive } = req.body

    const existing = await prisma.projectCategory.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    const updateData = {}
    if (name !== undefined && name.trim()) updateData.name = name.trim()
    if (slug !== undefined && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      updateData.slug = cleanSlug
    }
    if (description !== undefined) updateData.description = description
    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex)
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    const updated = await prisma.projectCategory.update({
      where: { id },
      data: updateData
    })

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category: updated }
    })
  } catch (error) {
    console.error('updateAdminCategory error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update category' })
  }
}

/**
 * Admin: Delete / disable category
 * DELETE /api/admin/projects/categories/:id
 */
export async function deleteAdminCategory(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.projectCategory.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } }
    })

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    // If projects are assigned, soft disable instead of hard deleting to preserve referential integrity
    if (existing._count?.projects > 0) {
      const updated = await prisma.projectCategory.update({
        where: { id },
        data: { isActive: false }
      })
      return res.json({
        success: true,
        message: `Category "${existing.name}" has ${existing._count.projects} assigned projects; disabled instead of deleted.`,
        data: { category: updated }
      })
    }

    await prisma.projectCategory.delete({ where: { id } })

    return res.json({
      success: true,
      message: `Category "${existing.name}" permanently deleted.`
    })
  } catch (error) {
    console.error('deleteAdminCategory error:', error)
    return res.status(500).json({ success: false, error: 'Failed to delete category' })
  }
}

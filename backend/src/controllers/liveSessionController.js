import prisma from '../config/prisma.js'

/**
 * Helper to compute live dynamic status & seats for a session
 */
export function computeSessionDynamicState(session) {
  const now = new Date()
  const start = session.scheduledAt ? new Date(session.scheduledAt) : null
  const duration = session.durationMinutes || 120
  const end = start ? new Date(start.getTime() + duration * 60 * 1000) : null

  const totalSeats = session.totalSeats || 50
  const registeredSeats = session.registeredSeats || 0
  const seatsLeft = Math.max(0, totalSeats - registeredSeats)

  let dynamicStatus = session.status || 'UPCOMING'

  // If session is manually cancelled or hidden or draft, keep admin override
  if (session.status === 'CANCELLED' || session.status === 'HIDDEN' || session.status === 'DRAFT') {
    dynamicStatus = session.status
  } else if (end && now > end) {
    // Session is completed past end time
    dynamicStatus = 'COMPLETED'
  } else if (start && end && now >= start && now <= end) {
    // Session is happening right now
    dynamicStatus = 'LIVE'
  } else if (seatsLeft <= 0) {
    // All seats filled
    dynamicStatus = 'FULL'
  } else if (session.isRegistrationOpen) {
    dynamicStatus = 'REGISTRATION_OPEN'
  } else {
    dynamicStatus = 'UPCOMING'
  }

  // Parse agenda & tags
  let agendaList = []
  if (session.agenda) {
    try {
      agendaList = typeof session.agenda === 'string' && session.agenda.startsWith('[')
        ? JSON.parse(session.agenda)
        : session.agenda.split('\n').map((a) => a.trim()).filter(Boolean)
    } catch {
      agendaList = session.agenda.split('\n').map((a) => a.trim()).filter(Boolean)
    }
  }

  let tagList = []
  if (session.tags) {
    try {
      tagList = typeof session.tags === 'string' && session.tags.startsWith('[')
        ? JSON.parse(session.tags)
        : session.tags.split(',').map((t) => t.trim()).filter(Boolean)
    } catch {
      tagList = session.tags.split(',').map((t) => t.trim()).filter(Boolean)
    }
  }

  return {
    ...session,
    dynamicStatus,
    seatsLeft,
    totalSeats,
    registeredSeats,
    agendaList,
    tagsList: tagList,
    isCompleted: dynamicStatus === 'COMPLETED',
    isLive: dynamicStatus === 'LIVE',
    isFull: dynamicStatus === 'FULL' || seatsLeft <= 0,
    canRsvp: dynamicStatus === 'REGISTRATION_OPEN' && seatsLeft > 0
  }
}

/**
 * Public: Get published live sessions with dynamic date states and live seats
 * GET /api/public/live-sessions
 */
export async function getPublicLiveSessions(req, res) {
  try {
    const rawSessions = await prisma.liveSession.findMany({
      where: {
        status: { notIn: ['DRAFT', 'HIDDEN'] }
      },
      orderBy: [{ orderIndex: 'asc' }, { scheduledAt: 'asc' }]
    })

    const computed = rawSessions.map(computeSessionDynamicState)

    return res.json({
      success: true,
      data: {
        sessions: computed,
        total: computed.length
      }
    })
  } catch (error) {
    console.error('getPublicLiveSessions error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch live sessions' })
  }
}

/**
 * Public: RSVP to a live session
 * POST /api/public/live-sessions/:id/rsvp
 */
export async function rsvpLiveSession(req, res) {
  try {
    const { id } = req.params
    const { email, name } = req.body

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required for RSVP' })
    }

    const cleanEmail = email.trim().toLowerCase()

    const session = await prisma.liveSession.findUnique({ where: { id } })
    if (!session) {
      return res.status(404).json({ success: false, error: 'Live session not found' })
    }

    const state = computeSessionDynamicState(session)

    if (state.dynamicStatus === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'This session has already concluded.' })
    }

    if (state.dynamicStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'This session has been cancelled.' })
    }

    if (state.seatsLeft <= 0) {
      return res.status(400).json({ success: false, error: 'All seats for this session are currently full.' })
    }

    // Check if user already RSVP'd
    const existingRsvp = await prisma.liveSessionRsvp.findUnique({
      where: {
        sessionId_email: {
          sessionId: id,
          email: cleanEmail
        }
      }
    })

    if (existingRsvp) {
      return res.json({
        success: true,
        alreadyRegistered: true,
        message: `You are already registered for "${session.title}"! Calendar invite was sent to ${cleanEmail}.`,
        data: {
          session: computeSessionDynamicState(session),
          seatsLeft: state.seatsLeft
        }
      })
    }

    // Create RSVP and increment registered seats
    const [rsvp, updatedSession] = await prisma.$transaction([
      prisma.liveSessionRsvp.create({
        data: {
          sessionId: id,
          email: cleanEmail,
          name: name ? name.trim() : null
        }
      }),
      prisma.liveSession.update({
        where: { id },
        data: {
          registeredSeats: { increment: 1 }
        }
      })
    ])

    const updatedState = computeSessionDynamicState(updatedSession)

    return res.status(201).json({
      success: true,
      message: `RSVP confirmed for "${session.title}"! Meeting invitation and calendar invite sent to ${cleanEmail}.`,
      data: {
        rsvp,
        session: updatedState,
        seatsLeft: updatedState.seatsLeft
      }
    })
  } catch (error) {
    console.error('rsvpLiveSession error:', error)
    return res.status(500).json({ success: false, error: 'Failed to process RSVP: ' + error.message })
  }
}

/**
 * Admin: Get all live sessions with filters
 * GET /api/admin/live-sessions
 */
export async function getAdminLiveSessions(req, res) {
  try {
    const { status, search } = req.query

    const where = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { speakerName: { contains: q, mode: 'insensitive' } },
        { speakerRole: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } }
      ]
    }

    const sessions = await prisma.liveSession.findMany({
      where,
      orderBy: [{ orderIndex: 'asc' }, { scheduledAt: 'desc' }],
      include: {
        _count: {
          select: { rsvps: true }
        }
      }
    })

    const computed = sessions.map((s) => {
      const c = computeSessionDynamicState(s)
      return {
        ...c,
        totalRsvps: s._count?.rsvps || s.registeredSeats
      }
    })

    return res.json({
      success: true,
      data: {
        sessions: computed,
        total: computed.length
      }
    })
  } catch (error) {
    console.error('getAdminLiveSessions error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch admin live sessions' })
  }
}

/**
 * Admin: Get single live session with RSVP details
 * GET /api/admin/live-sessions/:id
 */
export async function getAdminLiveSessionById(req, res) {
  try {
    const { id } = req.params
    const session = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!session) {
      return res.status(404).json({ success: false, error: 'Live session not found' })
    }

    const state = computeSessionDynamicState(session)

    return res.json({
      success: true,
      data: { session: state }
    })
  } catch (error) {
    console.error('getAdminLiveSessionById error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch live session' })
  }
}

/**
 * Admin: Create a live session
 * POST /api/admin/live-sessions
 */
export async function createAdminLiveSession(req, res) {
  try {
    const {
      title,
      slug,
      sessionDate,
      scheduledAt,
      startTime,
      endTime,
      timezone,
      duration,
      durationMinutes,
      speakerName,
      speakerRole,
      speakerPhoto,
      totalSeats,
      registeredSeats,
      shortDescription,
      detailedDescription,
      agenda,
      tags,
      ctaText,
      registrationUrl,
      meetingUrl,
      recordingUrl,
      isRegistrationOpen,
      orderIndex,
      status
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Session title is required' })
    }

    if (!speakerName || !speakerName.trim()) {
      return res.status(400).json({ success: false, error: 'Speaker / Instructor name is required' })
    }

    const numTotalSeats = parseInt(totalSeats, 10)
    if (isNaN(numTotalSeats) || numTotalSeats < 1) {
      return res.status(400).json({ success: false, error: 'Total seats must be a positive number' })
    }

    // Determine scheduledAt Date object
    let scheduledDate
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt)
    } else {
      scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 1 week from now
    }

    if (isNaN(scheduledDate.getTime())) {
      scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    const cleanDateStr = sessionDate || scheduledDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const finalAgenda = Array.isArray(agenda)
      ? JSON.stringify(agenda.filter((a) => a && a.trim()))
      : (typeof agenda === 'string' ? agenda : '')

    const finalTags = Array.isArray(tags)
      ? JSON.stringify(tags.filter((t) => t && t.trim()))
      : (typeof tags === 'string' ? tags : '')

    const generatedSlug = (slug && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : title.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') + '-' + Date.now().toString().slice(-4)

    const session = await prisma.liveSession.create({
      data: {
        title: title.trim(),
        slug: generatedSlug,
        sessionDate: cleanDateStr,
        scheduledAt: scheduledDate,
        startTime: startTime || '6:00 PM',
        endTime: endTime || '8:30 PM',
        timezone: timezone || 'IST',
        duration: duration || '2.5 Hours',
        durationMinutes: parseInt(durationMinutes, 10) || 150,
        speakerName: speakerName.trim(),
        instructorName: speakerName.trim(),
        speakerRole: speakerRole?.trim() || 'Principal AI Architect',
        speakerPhoto: speakerPhoto || null,
        totalSeats: numTotalSeats,
        registeredSeats: parseInt(registeredSeats, 10) || 0,
        shortDescription: shortDescription?.trim() || '',
        detailedDescription: detailedDescription?.trim() || shortDescription?.trim() || '',
        description: shortDescription?.trim() || '',
        agenda: finalAgenda,
        tags: finalTags,
        ctaText: ctaText || 'RSVP for Free Live Masterclass',
        registrationUrl: registrationUrl || null,
        meetingUrl: meetingUrl || null,
        recordingUrl: recordingUrl || null,
        isRegistrationOpen: isRegistrationOpen !== undefined ? Boolean(isRegistrationOpen) : true,
        orderIndex: Number.isInteger(orderIndex) ? orderIndex : 0,
        status: status || 'UPCOMING'
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Live session created successfully',
      data: { session: computeSessionDynamicState(session) }
    })
  } catch (error) {
    console.error('createAdminLiveSession error:', error)
    return res.status(500).json({ success: false, error: 'Failed to create live session: ' + error.message })
  }
}

/**
 * Admin: Update a live session
 * PUT /api/admin/live-sessions/:id
 */
export async function updateAdminLiveSession(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.liveSession.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Live session not found' })
    }

    const {
      title,
      slug,
      sessionDate,
      scheduledAt,
      startTime,
      endTime,
      timezone,
      duration,
      durationMinutes,
      speakerName,
      speakerRole,
      speakerPhoto,
      totalSeats,
      registeredSeats,
      shortDescription,
      detailedDescription,
      agenda,
      tags,
      ctaText,
      registrationUrl,
      meetingUrl,
      recordingUrl,
      isRegistrationOpen,
      orderIndex,
      status
    } = req.body

    const updateData = {}

    if (title !== undefined && title.trim()) updateData.title = title.trim()
    if (slug !== undefined) updateData.slug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
    if (sessionDate !== undefined) updateData.sessionDate = sessionDate
    if (scheduledAt !== undefined) {
      const d = new Date(scheduledAt)
      if (!isNaN(d.getTime())) updateData.scheduledAt = d
    }
    if (startTime !== undefined) updateData.startTime = startTime
    if (endTime !== undefined) updateData.endTime = endTime
    if (timezone !== undefined) updateData.timezone = timezone
    if (duration !== undefined) updateData.duration = duration
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes, 10)
    if (speakerName !== undefined && speakerName.trim()) {
      updateData.speakerName = speakerName.trim()
      updateData.instructorName = speakerName.trim()
    }
    if (speakerRole !== undefined) updateData.speakerRole = speakerRole.trim()
    if (speakerPhoto !== undefined) updateData.speakerPhoto = speakerPhoto
    if (totalSeats !== undefined) updateData.totalSeats = Math.max(1, parseInt(totalSeats, 10) || 50)
    if (registeredSeats !== undefined) updateData.registeredSeats = Math.max(0, parseInt(registeredSeats, 10) || 0)
    if (shortDescription !== undefined) {
      updateData.shortDescription = shortDescription
      updateData.description = shortDescription
    }
    if (detailedDescription !== undefined) updateData.detailedDescription = detailedDescription
    if (agenda !== undefined) {
      updateData.agenda = Array.isArray(agenda) ? JSON.stringify(agenda) : agenda
    }
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags
    }
    if (ctaText !== undefined) updateData.ctaText = ctaText
    if (registrationUrl !== undefined) updateData.registrationUrl = registrationUrl
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl
    if (isRegistrationOpen !== undefined) updateData.isRegistrationOpen = Boolean(isRegistrationOpen)
    if (orderIndex !== undefined) updateData.orderIndex = Number(orderIndex)
    if (status !== undefined) updateData.status = status

    const updated = await prisma.liveSession.update({
      where: { id },
      data: updateData
    })

    return res.json({
      success: true,
      message: 'Live session updated successfully',
      data: { session: computeSessionDynamicState(updated) }
    })
  } catch (error) {
    console.error('updateAdminLiveSession error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update live session: ' + error.message })
  }
}

/**
 * Admin: Delete a live session
 * DELETE /api/admin/live-sessions/:id
 */
export async function deleteAdminLiveSession(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.liveSession.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Live session not found' })
    }

    await prisma.liveSession.delete({ where: { id } })

    return res.json({
      success: true,
      message: `Live session "${existing.title}" permanently deleted.`
    })
  } catch (error) {
    console.error('deleteAdminLiveSession error:', error)
    return res.status(500).json({ success: false, error: 'Failed to delete live session' })
  }
}

/**
 * Admin: Update session status
 * PATCH /api/admin/live-sessions/:id/status
 */
export async function updateAdminLiveSessionStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' })
    }

    const existing = await prisma.liveSession.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Live session not found' })
    }

    const updated = await prisma.liveSession.update({
      where: { id },
      data: { status }
    })

    return res.json({
      success: true,
      message: `Live session status updated to ${status}`,
      data: { session: computeSessionDynamicState(updated) }
    })
  } catch (error) {
    console.error('updateAdminLiveSessionStatus error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update session status' })
  }
}

/**
 * Admin: Duplicate existing live session
 * POST /api/admin/live-sessions/:id/duplicate
 */
export async function duplicateAdminLiveSession(req, res) {
  try {
    const { id } = req.params
    const existing = await prisma.liveSession.findUnique({ where: { id } })
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Live session not found' })
    }

    const newTitle = `${existing.title} (Copy)`
    const newSlug = `${existing.slug || 'session'}-copy-${Date.now().toString().slice(-4)}`
    const nextWeekDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const duplicated = await prisma.liveSession.create({
      data: {
        title: newTitle,
        slug: newSlug,
        sessionDate: nextWeekDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
        scheduledAt: nextWeekDate,
        startTime: existing.startTime,
        endTime: existing.endTime,
        timezone: existing.timezone,
        duration: existing.duration,
        durationMinutes: existing.durationMinutes,
        speakerName: existing.speakerName,
        instructorName: existing.instructorName,
        speakerRole: existing.speakerRole,
        speakerPhoto: existing.speakerPhoto,
        totalSeats: existing.totalSeats,
        registeredSeats: 0,
        shortDescription: existing.shortDescription,
        detailedDescription: existing.detailedDescription,
        description: existing.description,
        agenda: existing.agenda,
        tags: existing.tags,
        ctaText: existing.ctaText,
        registrationUrl: existing.registrationUrl,
        meetingUrl: existing.meetingUrl,
        recordingUrl: null,
        isRegistrationOpen: true,
        orderIndex: (existing.orderIndex || 0) + 1,
        status: 'DRAFT'
      }
    })

    return res.status(201).json({
      success: true,
      message: `Duplicated session created as Draft: "${duplicated.title}"`,
      data: { session: computeSessionDynamicState(duplicated) }
    })
  } catch (error) {
    console.error('duplicateAdminLiveSession error:', error)
    return res.status(500).json({ success: false, error: 'Failed to duplicate session: ' + error.message })
  }
}

/**
 * Admin: Reorder live sessions
 * PATCH /api/admin/live-sessions/reorder
 */
export async function reorderAdminLiveSessions(req, res) {
  try {
    const { items } = req.body // array of { id, orderIndex }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid items array' })
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.liveSession.update({
          where: { id: item.id },
          data: { orderIndex: Number(item.orderIndex) }
        })
      )
    )

    return res.json({
      success: true,
      message: 'Live sessions reordered successfully'
    })
  } catch (error) {
    console.error('reorderAdminLiveSessions error:', error)
    return res.status(500).json({ success: false, error: 'Failed to reorder live sessions' })
  }
}

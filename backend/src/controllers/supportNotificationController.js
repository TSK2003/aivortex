import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/appError.js'

export async function createTicket(req, res, next) {
  try {
    const studentId = req.user.id
    const { subject, message, priority = 'MEDIUM' } = req.body

    if (!subject || !message) {
      throw new BadRequestError('Ticket subject and message are required')
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        studentId,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        status: 'OPEN'
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: studentId,
        action: 'SUPPORT_TICKET_CREATED',
        entityType: 'SupportTicket',
        entityId: ticket.id,
        details: `Student filed support ticket "${subject}"`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    })

    return successResponse(res, { ticket }, 'Support ticket created successfully', 201)
  } catch (err) {
    next(err)
  }
}

export async function getMyTickets(req, res, next) {
  try {
    const studentId = req.user.id

    const tickets = await prisma.supportTicket.findMany({
      where: { studentId },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, role: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(res, { tickets, count: tickets.length })
  } catch (err) {
    next(err)
  }
}

export async function replyToTicket(req, res, next) {
  try {
    const { ticketId } = req.params
    const { message } = req.body
    const userId = req.user.id

    if (!message || !message.trim()) {
      throw new BadRequestError('Reply message cannot be empty')
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    })

    if (!ticket) {
      throw new NotFoundError('Ticket not found')
    }

    // IDOR Protection: Only the ticket creator or an ADMIN can view/reply
    if (ticket.studentId !== userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You are not authorized to view or reply to this support ticket')
    }

    const reply = await prisma.$transaction(async (tx) => {
      const r = await tx.ticketReply.create({
        data: {
          ticketId,
          userId,
          message: message.trim()
        },
        include: {
          user: { select: { id: true, name: true, role: true } }
        }
      })

      // Update ticket status
      if (req.user.role === 'ADMIN') {
        await tx.supportTicket.update({
          where: { id: ticketId },
          data: { status: 'IN_PROGRESS' }
        })
      }

      return r
    })

    return successResponse(res, { reply }, 'Reply posted', 201)
  } catch (err) {
    next(err)
  }
}

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30
    })

    return successResponse(res, { notifications, count: notifications.length })
  } catch (err) {
    next(err)
  }
}

export async function markNotificationAsRead(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user.id

    const updated = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    })

    return successResponse(res, { updated: updated.count > 0 }, 'Notification marked as read')
  } catch (err) {
    next(err)
  }
}

export async function markAllNotificationsAsRead(req, res, next) {
  try {
    const userId = req.user.id

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })

    return successResponse(res, { count: result.count }, 'All notifications marked as read')
  } catch (err) {
    next(err)
  }
}

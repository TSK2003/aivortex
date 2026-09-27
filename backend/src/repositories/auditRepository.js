import { prisma } from '../config/database.js'

export const auditRepository = {
  async logEvent({ userId, role, action, module, targetId, ipAddress, userAgent, details, status = 'SUCCESS' }) {
    if (!prisma) {
      console.log(`[AUDIT LOG] [${status}] ${role || 'ANON'}:${action} on ${module} (${targetId || 'N/A'})`)
      return null
    }
    return prisma.auditLog.create({
      data: {
        userId,
        role,
        action,
        module,
        targetId,
        ipAddress,
        userAgent,
        details,
        status
      }
    }).catch(err => {
      console.error('[AUDIT LOG ERROR]', err.message)
      return null
    })
  },

  async listLogs(limit = 100, offset = 0) {
    if (!prisma) return []
    return prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
  }
}

import { prisma } from '../config/database.js'

export const courseRepository = {
  async findPublished(filters = {}) {
    if (!prisma) return []
    const where = {
      status: 'PUBLISHED',
      visibility: 'PUBLISHED',
      ...filters
    }
    return prisma.course.findMany({
      where,
      include: {
        category: true,
        offers: {
          where: { isActive: true }
        },
        playlists: {
          include: {
            lessons: {
              where: { verificationStatus: 'PUBLISHED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  async findById(id) {
    if (!prisma) return null
    return prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        offers: true,
        playlists: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                resources: true,
                quizzes: true
              }
            }
          }
        }
      }
    })
  },

  async create(courseData) {
    if (!prisma) return null
    return prisma.course.create({
      data: courseData
    })
  },

  async update(id, data) {
    if (!prisma) return null
    return prisma.course.update({
      where: { id },
      data
    })
  },

  async delete(id) {
    if (!prisma) return null
    return prisma.course.delete({
      where: { id }
    })
  }
}

import { prisma } from '../config/database.js'

export const userRepository = {
  async findByEmail(email) {
    if (!prisma) return null
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        creatorProfile: true,
        adminProfile: true,
      }
    })
  },

  async findById(id) {
    if (!prisma) return null
    return prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        creatorProfile: true,
        adminProfile: true,
      }
    })
  },

  async create(userData) {
    if (!prisma) return null
    return prisma.user.create({
      data: userData
    })
  },

  async update(id, data) {
    if (!prisma) return null
    return prisma.user.update({
      where: { id },
      data
    })
  },

  async listByRole(role) {
    if (!prisma) return []
    return prisma.user.findMany({
      where: { role },
      include: {
        studentProfile: true,
        creatorProfile: true,
      }
    })
  }
}

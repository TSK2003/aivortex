import { prisma } from '../config/database.js'

export const enrollmentRepository = {
  async findByStudentAndCourse(studentId, courseId) {
    if (!prisma) return null
    return prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      },
      include: {
        course: true,
        lessonProgress: true,
      }
    })
  },

  async listByStudent(studentId) {
    if (!prisma) return []
    return prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            playlists: {
              include: {
                lessons: true
              }
            }
          }
        },
        lessonProgress: true
      },
      orderBy: { enrolledAt: 'desc' }
    })
  },

  async create(data) {
    if (!prisma) return null
    return prisma.enrollment.create({
      data
    })
  },

  async update(id, data) {
    if (!prisma) return null
    return prisma.enrollment.update({
      where: { id },
      data
    })
  }
}

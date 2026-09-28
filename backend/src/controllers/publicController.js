import prisma from '../config/prisma.js'
import { successResponse } from '../utils/responseWrapper.js'
import { NotFoundError, BadRequestError } from '../utils/appError.js'
import s3Service from '../services/s3Service.js'

// 1. Public Courses Catalog with Multi-Filters & Sorting
export async function getCourses(req, res, next) {
  try {
    const { category, level, search, isFree, sort = 'popular', page = 1, limit = 20 } = req.query

    const where = {
      status: 'PUBLISHED'
    }

    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' }
    }

    if (level && level !== 'All') {
      where.level = { contains: level, mode: 'insensitive' }
    }

    if (isFree !== undefined && isFree !== 'all') {
      where.isFree = isFree === 'true' || isFree === true
    }

    if (search && search.trim()) {
      const term = search.trim()
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { shortDescription: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } }
      ]
    }

    let orderBy = { studentsCount: 'desc' }
    if (sort === 'rating') orderBy = { averageRating: 'desc' }
    if (sort === 'price-low') orderBy = { price: 'asc' }
    if (sort === 'price-high') orderBy = { price: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          requirements: { orderBy: { orderIndex: 'asc' } },
          learningOutcomes: { orderBy: { orderIndex: 'asc' } },
          creators: {
            include: {
              creator: { select: { id: true, name: true, avatar: true } }
            }
          },
          playlists: {
            where: { status: 'PUBLISHED' },
            include: {
              lessons: {
                where: { status: 'PUBLISHED' },
                select: { id: true, title: true, duration: true, isPreview: true }
              }
            }
          }
        }
      }),
      prisma.course.count({ where })
    ])

    const formattedCourses = courses.map((c) => {
      let totalLessons = 0
      c.playlists.forEach((p) => {
        totalLessons += p.lessons.length
      })

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        shortDescription: c.shortDescription,
        category: c.category,
        level: c.level,
        duration: c.duration,
        language: c.language,
        thumbnail: c.thumbnail,
        originalPrice: c.originalPrice,
        price: c.price,
        discountPercent: c.discountPercent,
        isFree: c.isFree,
        isFeatured: c.isFeatured,
        badge: c.badge,
        averageRating: c.averageRating,
        reviewsCount: c.reviewsCount,
        studentsCount: c.studentsCount,
        hasDemo: !!c.demoLessonId,
        modulesCount: c.playlists.length,
        lessonsCount: totalLessons,
        requirements: c.requirements,
        learningOutcomes: c.learningOutcomes,
        instructors: c.creators.map((cr) => cr.creator)
      }
    })

    return successResponse(res, {
      courses: formattedCourses,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit))
    })
  } catch (err) {
    next(err)
  }
}

// 2. Public Course Details with Admin-Approved Demo & Syllabus
export async function getCourseBySlug(req, res, next) {
  try {
    const { slug } = req.params

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: 'PUBLISHED'
      },
      include: {
        requirements: { orderBy: { orderIndex: 'asc' } },
        learningOutcomes: { orderBy: { orderIndex: 'asc' } },
        creators: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
                creatorProfile: true
              }
            }
          }
        },
        playlists: {
          where: { status: 'PUBLISHED' },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { status: 'PUBLISHED' },
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                isPreview: true,
                isPublicDemo: true,
                orderIndex: true
              }
            }
          }
        }
      }
    })

    if (!course) {
      throw new NotFoundError(`Course '${slug}' was not found or is currently not publicly published.`)
    }

    // Check if an Admin-approved public demo video exists
    let demoVideo = null
    if (course.demoLessonId) {
      const demoLesson = await prisma.lesson.findUnique({
        where: { id: course.demoLessonId },
        select: {
          id: true,
          title: true,
          duration: true,
          videoUrl: true,
          s3Key: true,
          status: true
        }
      })

      if (demoLesson && ['APPROVED', 'PUBLISHED'].includes(demoLesson.status)) {
        let streamUrl = demoLesson.videoUrl
        if (demoLesson.s3Key) {
          streamUrl = await s3Service.getPresignedDownloadUrl(demoLesson.s3Key, 7200)
        }
        demoVideo = {
          lessonId: demoLesson.id,
          title: demoLesson.title,
          duration: demoLesson.duration,
          streamUrl
        }
      }
    }

    return successResponse(res, {
      course: {
        ...course,
        demoVideo
      }
    })
  } catch (err) {
    next(err)
  }
}

// 3. Verifiable Digital Credential Lookup (Authentic Database Check)
export async function verifyCertificate(req, res, next) {
  try {
    const { code } = req.params

    if (!code || !code.trim()) {
      throw new BadRequestError('Certificate verification code is required')
    }

    const cleanCode = code.trim().toUpperCase()

    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: cleanCode },
      include: {
        course: {
          select: { id: true, title: true, slug: true, duration: true }
        },
        student: {
          select: { name: true }
        }
      }
    })

    if (!certificate) {
      throw new NotFoundError(`No active credential matches Certificate Code '${cleanCode}' in the official registry.`)
    }

    return successResponse(
      res,
      {
        certificate: {
          certificateCode: certificate.certificateCode,
          studentName: certificate.studentName,
          courseTitle: certificate.courseTitle,
          issueDate: certificate.issueDate,
          status: certificate.status,
          verificationUrl: certificate.verificationUrl,
          accreditation: 'aivortex Academic Accreditation Board'
        }
      },
      'Certificate verified authentic'
    )
  } catch (err) {
    next(err)
  }
}

// 4. Domain Projects Showcase (Preserved Feature)
export async function getDomainProjects(req, res, next) {
  try {
    const projects = await prisma.domainProject.findMany({
      orderBy: { orderIndex: 'asc' }
    })
    return successResponse(res, { projects })
  } catch (err) {
    next(err)
  }
}

// 5. Live Weekend Sessions (Preserved Feature)
export async function getLiveSessions(req, res, next) {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: { status: { in: ['UPCOMING', 'LIVE'] } },
      orderBy: { scheduledAt: 'asc' }
    })
    return successResponse(res, { sessions })
  } catch (err) {
    next(err)
  }
}

// 6. Public Contact & Admissions Enquiry
export async function submitContactEnquiry(req, res, next) {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !message) {
      throw new BadRequestError('Name, email, and message are required')
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject ? subject.trim() : 'General Technical Inquiry',
        message: message.trim(),
        status: 'NEW'
      }
    })

    return successResponse(
      res,
      { enquiryId: enquiry.id },
      'Your inquiry has been registered. An academic counselor will contact you within 24 hours.',
      201
    )
  } catch (err) {
    next(err)
  }
}

// 7. Active Public Offers & Discount Validation
export async function getActiveOffers(req, res, next) {
  try {
    const now = new Date()
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      select: {
        id: true,
        title: true,
        code: true,
        discountPercent: true,
        discountAmount: true,
        endDate: true
      },
      orderBy: { discountPercent: 'desc' }
    })

    return successResponse(res, { offers })
  } catch (err) {
    next(err)
  }
}

export async function validateOfferCode(req, res, next) {
  try {
    const { code, courseId } = req.body

    if (!code) {
      throw new BadRequestError('Coupon code is required')
    }

    const cleanCode = code.trim().toUpperCase()
    const now = new Date()

    const offer = await prisma.offer.findUnique({
      where: { code: cleanCode }
    })

    if (!offer || !offer.isActive || offer.startDate > now || offer.endDate < now) {
      throw new BadRequestError('Invalid or expired coupon code')
    }

    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      throw new BadRequestError('This coupon code has reached its maximum redemptions')
    }

    let originalPrice = 0
    let finalPrice = 0

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, price: true, isFree: true }
      })

      if (!course) {
        throw new NotFoundError('Course not found')
      }

      originalPrice = course.price
      finalPrice = course.price

      if (!course.isFree) {
        if (offer.discountPercent) {
          finalPrice = Math.max(0, originalPrice * (1 - offer.discountPercent / 100))
        } else if (offer.discountAmount) {
          finalPrice = Math.max(0, originalPrice - offer.discountAmount)
        }
      }
    }

    return successResponse(res, {
      valid: true,
      offer: {
        id: offer.id,
        title: offer.title,
        code: offer.code,
        discountPercent: offer.discountPercent,
        discountAmount: offer.discountAmount,
        originalPrice,
        finalPrice: Math.round(finalPrice * 100) / 100
      }
    }, 'Coupon code applied successfully')
  } catch (err) {
    next(err)
  }
}


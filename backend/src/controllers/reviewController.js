import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Public: Get approved reviews for a specific course
 * GET /api/public/courses/:courseId/reviews
 */
export async function getCourseReviews(req, res) {
  try {
    const { courseId } = req.params

    // Find course by ID or slug
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      },
      select: { id: true, title: true, slug: true, averageRating: true, reviewsCount: true }
    })

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' })
    }

    const reviews = await prisma.courseReview.findMany({
      where: {
        courseId: course.id,
        status: 'APPROVED'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        title: true,
        reviewText: true,
        isFeatured: true,
        createdAt: true,
        student: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    })

    // Compute live average rating and count
    const totalCount = reviews.length
    const computedAvg =
      totalCount > 0
        ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount) * 10) / 10
        : course.averageRating || 5.0

    return res.json({
      success: true,
      data: {
        reviews,
        total: totalCount,
        averageRating: computedAvg,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug
        }
      }
    })
  } catch (error) {
    console.error('getCourseReviews error:', error)
    return res.status(500).json({ success: false, error: 'Failed to retrieve course reviews' })
  }
}

/**
 * Public: Get approved and featured reviews for Home page
 * GET /api/public/reviews/featured
 */
export async function getFeaturedReviews(req, res) {
  try {
    // Only Approved + Featured reviews appear on the Home Page
    const featuredReviews = await prisma.courseReview.findMany({
      where: {
        status: 'APPROVED',
        isFeatured: true
      },
      take: 6,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        rating: true,
        title: true,
        reviewText: true,
        createdAt: true,
        student: {
          select: {
            name: true,
            avatar: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    return res.json({
      success: true,
      data: {
        reviews: featuredReviews
      }
    })
  } catch (error) {
    console.error('getFeaturedReviews error:', error)
    return res.status(500).json({ success: false, error: 'Failed to retrieve featured testimonials' })
  }
}

/**
 * Student: Get current student's review & enrollment status for a course
 * GET /api/student/courses/:courseId/review
 */
export async function getStudentCourseReview(req, res) {
  try {
    const studentId = req.user.id
    const { courseId } = req.params

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      },
      select: { id: true, title: true }
    })

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' })
    }

    // Check enrollment eligibility
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: course.id
        }
      }
    })

    const existingReview = await prisma.courseReview.findFirst({
      where: {
        studentId,
        courseId: course.id
      }
    })

    return res.json({
      success: true,
      data: {
        isEligible: Boolean(enrollment),
        progressPercent: enrollment?.progressPercent || 0,
        review: existingReview || null
      }
    })
  } catch (error) {
    console.error('getStudentCourseReview error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch student review status' })
  }
}

/**
 * Student: Submit or update a course review
 * POST /api/student/courses/:courseId/review
 */
export async function submitCourseReview(req, res) {
  try {
    const studentId = req.user.id
    const { courseId } = req.params
    const { rating, title, reviewText } = req.body

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }]
      },
      select: { id: true, title: true }
    })

    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' })
    }

    // Check student enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId: course.id
        }
      }
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: 'Only enrolled scholars can submit a course review.'
      })
    }

    const numRating = parseInt(rating, 10)
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5 stars.' })
    }

    if (!reviewText || reviewText.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Review text must be at least 5 characters.' })
    }

    // Upsert review with PENDING status
    const existing = await prisma.courseReview.findFirst({
      where: {
        studentId,
        courseId: course.id
      }
    })

    let review
    if (existing) {
      review = await prisma.courseReview.update({
        where: { id: existing.id },
        data: {
          rating: numRating,
          title: title ? title.trim() : null,
          reviewText: reviewText.trim(),
          status: 'PENDING',
          rejectionReason: null
        }
      })
    } else {
      review = await prisma.courseReview.create({
        data: {
          studentId,
          courseId: course.id,
          rating: numRating,
          title: title ? title.trim() : null,
          reviewText: reviewText.trim(),
          status: 'PENDING'
        }
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Status: Pending Admin Approval',
      data: { review }
    })
  } catch (error) {
    console.error('submitCourseReview error:', error)
    return res.status(500).json({ success: false, error: 'Failed to submit review' })
  }
}

/**
 * Admin: Get all reviews with status & course filters
 * GET /api/admin/reviews
 */
export async function getAdminReviews(req, res) {
  try {
    const { status, courseId, search } = req.query

    const where = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (courseId && courseId !== 'ALL') {
      where.courseId = courseId
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { reviewText: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { student: { name: { contains: q, mode: 'insensitive' } } },
        { student: { email: { contains: q, mode: 'insensitive' } } },
        { course: { title: { contains: q, mode: 'insensitive' } } }
      ]
    }

    const reviews = await prisma.courseReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    })

    return res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length
      }
    })
  } catch (error) {
    console.error('getAdminReviews error:', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch admin reviews' })
  }
}

/**
 * Admin: Approve a review
 * PATCH /api/admin/reviews/:id/approve
 */
export async function approveReview(req, res) {
  try {
    const { id } = req.params

    const review = await prisma.courseReview.findUnique({
      where: { id }
    })

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' })
    }

    const updated = await prisma.courseReview.update({
      where: { id },
      data: {
        status: 'APPROVED',
        rejectionReason: null,
        approvedAt: new Date(),
        approvedBy: req.user.name || req.user.email
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    // Recalculate course average rating and review count
    const approvedReviews = await prisma.courseReview.findMany({
      where: { courseId: review.courseId, status: 'APPROVED' },
      select: { rating: true }
    })

    const count = approvedReviews.length
    const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0

    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        reviewsCount: count,
        averageRating: Math.round(avg * 10) / 10
      }
    })

    return res.json({
      success: true,
      message: 'Review approved successfully.',
      data: { review: updated }
    })
  } catch (error) {
    console.error('approveReview error:', error)
    return res.status(500).json({ success: false, error: 'Failed to approve review' })
  }
}

/**
 * Admin: Reject a review
 * PATCH /api/admin/reviews/:id/reject
 */
export async function rejectReview(req, res) {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'A clear reason for rejection is required.' })
    }

    const review = await prisma.courseReview.findUnique({
      where: { id }
    })

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' })
    }

    const updated = await prisma.courseReview.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason.trim(),
        isFeatured: false
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    // Recalculate course stats
    const approvedReviews = await prisma.courseReview.findMany({
      where: { courseId: review.courseId, status: 'APPROVED' },
      select: { rating: true }
    })

    const count = approvedReviews.length
    const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0

    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        reviewsCount: count,
        averageRating: Math.round(avg * 10) / 10
      }
    })

    return res.json({
      success: true,
      message: 'Review rejected.',
      data: { review: updated }
    })
  } catch (error) {
    console.error('rejectReview error:', error)
    return res.status(500).json({ success: false, error: 'Failed to reject review' })
  }
}

/**
 * Admin: Toggle Feature on Home
 * PATCH /api/admin/reviews/:id/feature
 */
export async function toggleFeatureReview(req, res) {
  try {
    const { id } = req.params
    const { isFeatured } = req.body

    const review = await prisma.courseReview.findUnique({
      where: { id }
    })

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' })
    }

    const shouldFeature = isFeatured !== undefined ? Boolean(isFeatured) : !review.isFeatured

    if (shouldFeature && review.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: 'Only approved reviews can be featured on the Public Home page.'
      })
    }

    const updated = await prisma.courseReview.update({
      where: { id },
      data: {
        isFeatured: shouldFeature
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } }
      }
    })

    return res.json({
      success: true,
      message: shouldFeature ? 'Review featured on Home page.' : 'Review removed from Home page.',
      data: { review: updated }
    })
  } catch (error) {
    console.error('toggleFeatureReview error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update featured status' })
  }
}

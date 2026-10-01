import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial Course Reviews and verified learners...')

  const defaultPassword = await bcrypt.hash('student123', 10)

  // Ensure learners exist
  const pooja = await prisma.user.upsert({
    where: { email: 'pooja.nair@example.com' },
    update: {},
    create: {
      id: 'student-pooja',
      email: 'pooja.nair@example.com',
      passwordHash: defaultPassword,
      name: 'Pooja Nair',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      status: 'ACTIVE'
    }
  })

  const karthik = await prisma.user.upsert({
    where: { email: 'karthik.ramanathan@example.com' },
    update: {},
    create: {
      id: 'student-karthik',
      email: 'karthik.ramanathan@example.com',
      passwordHash: defaultPassword,
      name: 'Karthik Ramanathan',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      status: 'ACTIVE'
    }
  })

  const shreya = await prisma.user.upsert({
    where: { email: 'shreya.kulkarni@example.com' },
    update: {},
    create: {
      id: 'student-shreya',
      email: 'shreya.kulkarni@example.com',
      passwordHash: defaultPassword,
      name: 'Shreya Kulkarni',
      role: 'STUDENT',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      status: 'ACTIVE'
    }
  })

  // Ensure enrollments exist for eligibility verification
  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: pooja.id, courseId: 'course-pyds' } },
    update: {},
    create: { studentId: pooja.id, courseId: 'course-pyds', progressPercent: 100, completedAt: new Date() }
  })

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: karthik.id, courseId: 'course-pyml' } },
    update: {},
    create: { studentId: karthik.id, courseId: 'course-pyml', progressPercent: 92, completedAt: new Date() }
  })

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: shreya.id, courseId: 'course-deep-learning' } },
    update: {},
    create: { studentId: shreya.id, courseId: 'course-deep-learning', progressPercent: 88, completedAt: new Date() }
  })

  // Seed Approved + Featured Reviews (Real Stories From Our Learners)
  await prisma.courseReview.upsert({
    where: { id: 'rev-pooja-pyds' },
    update: {
      status: 'APPROVED',
      isFeatured: true
    },
    create: {
      id: 'rev-pooja-pyds',
      studentId: pooja.id,
      courseId: 'course-pyds',
      rating: 5,
      title: 'Helped me crack my role at PhonePe within 4 months',
      reviewText: 'The domain projects and weekend live sessions set ApexLearn miles apart from ordinary video courses. Learning how to clean real, messy datasets and build end-to-end pipelines helped me crack my role at PhonePe within 4 months.',
      status: 'APPROVED',
      isFeatured: true,
      approvedAt: new Date(),
      approvedBy: 'Dr. Vikram Sen'
    }
  })

  await prisma.courseReview.upsert({
    where: { id: 'rev-karthik-pyml' },
    update: {
      status: 'APPROVED',
      isFeatured: true
    },
    create: {
      id: 'rev-karthik-pyml',
      studentId: karthik.id,
      courseId: 'course-pyml',
      rating: 5,
      title: 'Depth in feature engineering and real model deployment',
      reviewText: "What made the difference was the depth in feature engineering and model evaluation. The instructors don't just import libraries—they explain the mathematical intuition and deploy models as real APIs.",
      status: 'APPROVED',
      isFeatured: true,
      approvedAt: new Date(),
      approvedBy: 'Dr. Vikram Sen'
    }
  })

  await prisma.courseReview.upsert({
    where: { id: 'rev-shreya-dl' },
    update: {
      status: 'APPROVED',
      isFeatured: true
    },
    create: {
      id: 'rev-shreya-dl',
      studentId: shreya.id,
      courseId: 'course-deep-learning',
      rating: 5,
      title: 'Phenomenal PyTorch & Computer Vision modules',
      reviewText: 'The PyTorch and computer vision modules are phenomenal. Building the medical X-ray diagnostic model with Grad-CAM heatmaps gave me a standout project on my resume that impressed my interviewers immediately.',
      status: 'APPROVED',
      isFeatured: true,
      approvedAt: new Date(),
      approvedBy: 'Dr. Vikram Sen'
    }
  })

  // Seed additional course-specific reviews
  const rahul = await prisma.user.findFirst({ where: { email: 'rahul.sharma@example.com' } })
  if (rahul) {
    await prisma.courseReview.upsert({
      where: { id: 'rev-rahul-pyds' },
      update: {},
      create: {
        id: 'rev-rahul-pyds',
        studentId: rahul.id,
        courseId: 'course-pyds',
        rating: 5,
        title: 'Comprehensive Python Foundations',
        reviewText: 'Excellent curriculum pacing. The data wrangling modules using Pandas and real-world e-commerce transactions were exceptionally detailed and practical.',
        status: 'APPROVED',
        isFeatured: false,
        approvedAt: new Date(),
        approvedBy: 'Dr. Vikram Sen'
      }
    })
  }

  // Seed a pending review for testing the admin queue
  const ananya = await prisma.user.findFirst({ where: { email: 'ananya.patel@example.com' } })
  if (ananya) {
    await prisma.courseReview.upsert({
      where: { id: 'rev-ananya-pending' },
      update: {},
      create: {
        id: 'rev-ananya-pending',
        studentId: ananya.id,
        courseId: 'course-algo-trading',
        rating: 5,
        title: 'Outstanding Quantitative Backtesting Framework',
        reviewText: 'The module on event-driven backtesting and risk budgeting with Sharpe ratios gave me the exact quantitative skills I needed for asset management analytics.',
        status: 'PENDING',
        isFeatured: false
      }
    })
  }

  // Recalculate course statistics for updated courses
  const coursesToUpdate = ['course-pyds', 'course-pyml', 'course-deep-learning', 'course-algo-trading']
  for (const cid of coursesToUpdate) {
    const approvedReviews = await prisma.courseReview.findMany({
      where: { courseId: cid, status: 'APPROVED' },
      select: { rating: true }
    })
    const count = approvedReviews.length
    const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0
    await prisma.course.updateMany({
      where: { id: cid },
      data: {
        reviewsCount: count,
        averageRating: Math.round(avg * 10) / 10
      }
    })
  }

  console.log('Seeding finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import bcrypt from 'bcryptjs'
import prisma from '../src/config/prisma.js'

async function main() {
  const dbUrl = process.env.DATABASE_URL || ''
  const isProductionDb = dbUrl.includes('rds.amazonaws.com') ||
                         dbUrl.includes('supabase.co') ||
                         dbUrl.includes('neon.tech') ||
                         dbUrl.includes('railway.app') ||
                         (!dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1'))

  if ((process.env.NODE_ENV === 'production' || isProductionDb) && !process.env.ALLOW_SEED_OVERRIDE) {
    console.error('CRITICAL: Phase 0 development seed cannot be executed in production environment or against non-local database without ALLOW_SEED_OVERRIDE=true!')
    process.exit(1)
  }

  console.log('Starting ApexLearn Phase 0 Development Seed Execution...')

  // 1. Truncate all tables for deterministic state
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "User", 
        "Session",
        "CreatorProfile",
        "ProfileChangeRequest",
        "Course", 
        "CourseCreator",
        "CourseRequirement",
        "CourseLearningOutcome",
        "Playlist", 
        "Lesson", 
        "LessonResource",
        "VideoVerificationLog",
        "VideoStatusHistory",
        "Enrollment", 
        "LessonProgress",
        "StudentNote",
        "ActiveVideoSession",
        "Quiz", 
        "QuizQuestion",
        "QuizOption",
        "QuizAttempt",
        "Certificate",
        "Order",
        "PaymentEvent",
        "WebhookEvent",
        "Offer",
        "Notification",
        "AuditLog",
        "SupportTicket",
        "TicketReply",
        "ContactEnquiry",
        "DomainProject",
        "LiveSession",
        "PlatformSetting"
      CASCADE;
    `)
    console.log('Cleaned existing database records via CASCADE truncate.')
  } catch (err) {
    console.log('Database clean notice:', err.message)
  }

  const salt = await bcrypt.genSalt(10)
  const adminPassword = await bcrypt.hash('adminSecret2026', salt)
  const creatorPassword = await bcrypt.hash('creator123', salt)
  const studentPassword = await bcrypt.hash('student123', salt)

  // 2. Seed 1 Admin Authority
  const admin = await prisma.user.create({
    data: {
      id: 'user-admin-1',
      email: 'director@apexlearn.edu',
      passwordHash: adminPassword,
      name: 'Dr. Vikram Sen',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+91 98765 00001',
      bio: 'Platform Director and Principal AI Scientist at ApexLearn Institute.'
    }
  })
  console.log('Seeded 1 Administrator: Dr. Vikram Sen (user-admin-1)')

  // 3. Seed 5 Provisioned Creators (CR-TEC-001 to CR-BUS-005)
  const creator1 = await prisma.user.create({
    data: {
      id: 'CR-TEC-001',
      email: 'alex.rivera@creator.apexlearn.edu',
      passwordHash: creatorPassword,
      name: 'Dr. Alex Rivera',
      role: 'CREATOR',
      status: 'ACTIVE',
      phone: '+91 98765 00002',
      bio: 'Senior Machine Learning and Deep Learning Specialist with 12 years building production ML systems.',
      creatorProfile: {
        create: {
          headline: 'Lead AI Engineer and Deep Learning Architect',
          specialization: 'Generative AI and Large Language Models',
          biography: 'Over 12 years building high-throughput ML pipelines in production.',
          isVerified: true
        }
      }
    },
    include: { creatorProfile: true }
  })

  const creator2 = await prisma.user.create({
    data: {
      id: 'CR-SFT-002',
      email: 'sarah.jenkins@creator.apexlearn.edu',
      passwordHash: creatorPassword,
      name: 'Sarah Jenkins',
      role: 'CREATOR',
      status: 'ACTIVE',
      phone: '+91 98765 00003',
      bio: 'Principal Full Stack Engineer and Cloud Native Systems Architect.',
      creatorProfile: {
        create: {
          headline: 'Principal Full Stack Engineer and React Architect',
          specialization: 'Modern Full Stack Web Architecture and React Ecosystem',
          biography: 'Expert in high-scale distributed React and Node.js enterprise microservices.',
          isVerified: true
        }
      }
    },
    include: { creatorProfile: true }
  })

  const creator3 = await prisma.user.create({
    data: {
      id: 'CR-DAT-003',
      email: 'michael.chen@creator.apexlearn.edu',
      passwordHash: creatorPassword,
      name: 'Michael Chen',
      role: 'CREATOR',
      status: 'ACTIVE',
      phone: '+91 98765 00004',
      bio: 'Quantitative Analyst and Principal Data Scientist.',
      creatorProfile: {
        create: {
          headline: 'Principal Data Scientist and Quantitative Analyst',
          specialization: 'Data Analytics, Statistical Computing and Modern Python',
          biography: 'Specializes in computational modeling, exploratory data analysis and financial time series.',
          isVerified: true
        }
      }
    },
    include: { creatorProfile: true }
  })

  const creator4 = await prisma.user.create({
    data: {
      id: 'CR-AIM-004',
      email: 'elena.rostova@creator.apexlearn.edu',
      passwordHash: creatorPassword,
      name: 'Elena Rostova',
      role: 'CREATOR',
      status: 'ACTIVE',
      phone: '+91 98765 00005',
      bio: 'Automation Architect specializing in workflow orchestration and generative agents.',
      creatorProfile: {
        create: {
          headline: 'Generative AI and Enterprise Automation Specialist',
          specialization: 'Agentic Workflows and Process Automation',
          biography: 'Pioneering production automated workflows combining LLM reasoning with enterprise ERPs.',
          isVerified: true
        }
      }
    },
    include: { creatorProfile: true }
  })

  const creator5 = await prisma.user.create({
    data: {
      id: 'CR-BUS-005',
      email: 'david.kumar@creator.apexlearn.edu',
      passwordHash: creatorPassword,
      name: 'David Kumar',
      role: 'CREATOR',
      status: 'ACTIVE',
      phone: '+91 98765 00006',
      bio: 'Enterprise Cloud and Big Data Infrastructure Architect.',
      creatorProfile: {
        create: {
          headline: 'Big Data Architect and Cloud Systems Lead',
          specialization: 'Distributed Data Engineering, Spark, and Cloud Analytics',
          biography: 'Designing resilient, distributed data pipelines and analytical warehouses.',
          isVerified: true
        }
      }
    },
    include: { creatorProfile: true }
  })
  console.log('Seeded 5 Provisioned Creators (CR-TEC-001 to CR-BUS-005)')

  // 4. Seed 6 Courses (3 Free, 3 Paid)
  // Course 1: Full Stack Web Development (PAID) - Assigned to Creator 2 (Sarah Jenkins)
  const course1 = await prisma.course.create({
    data: {
      id: 'course-fullstack',
      slug: 'full-stack-web-development',
      title: 'Full Stack Web Development',
      shortDescription: 'Master modern full-stack web engineering with React, Node.js, Express, and PostgreSQL.',
      fullDescription: 'Comprehensive immersion into modern full-stack application development. Build resilient microservices, design relational schemas, secure REST APIs, and deploy enterprise web apps.',
      category: 'Software Engineering',
      level: 'Beginner to Advanced',
      duration: '45 Hours',
      durationHours: 45,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      originalPrice: 5999,
      price: 3999,
      discountPercent: 33,
      isFree: false,
      isFeatured: true,
      badge: 'BESTSELLER',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 3420,
      averageRating: 4.9,
      reviewsCount: 420,
      creators: {
        create: [{ creatorId: creator2.id }]
      },
      requirements: {
        create: [
          { text: 'Basic familiarity with computer operating systems', orderIndex: 1 },
          { text: 'No prior JavaScript or database experience required', orderIndex: 2 }
        ]
      },
      learningOutcomes: {
        create: [
          { text: 'Construct complete production web applications from database to UI', orderIndex: 1 },
          { text: 'Design and deploy scalable relational PostgreSQL database schemas', orderIndex: 2 },
          { text: 'Implement enterprise authentication and role-based access control', orderIndex: 3 }
        ]
      }
    }
  })

  // Course 2: Python Programming Fundamentals (FREE) - Assigned to Creator 3 (Michael Chen)
  const course2 = await prisma.course.create({
    data: {
      id: 'course-python',
      slug: 'python-programming-fundamentals',
      title: 'Python Programming Fundamentals',
      shortDescription: 'Core programming foundations, modern syntax, control flow, functions, and standard libraries.',
      fullDescription: 'A complete foundational guide to computational thinking with Python 3. Learn structured programming, object-oriented principles, algorithmic problem solving, and file management.',
      category: 'Programming',
      level: 'Beginner',
      duration: '20 Hours',
      durationHours: 20,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
      originalPrice: 0,
      price: 0,
      discountPercent: 0,
      isFree: true,
      isFeatured: true,
      badge: 'FOUNDATION',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 9240,
      averageRating: 4.8,
      reviewsCount: 1150,
      creators: {
        create: [{ creatorId: creator3.id }]
      },
      requirements: {
        create: [{ text: 'A computer with internet access', orderIndex: 1 }]
      },
      learningOutcomes: {
        create: [
          { text: 'Write clean, idiomatic Python code adhering to PEP 8 standards', orderIndex: 1 },
          { text: 'Master data structures including lists, dictionaries, tuples and sets', orderIndex: 2 }
        ]
      }
    }
  })

  // Course 3: React Frontend Engineering (FREE) - Assigned to Creator 2 (Sarah Jenkins)
  const course3 = await prisma.course.create({
    data: {
      id: 'course-react',
      slug: 'react-frontend-engineering',
      title: 'React Frontend Engineering',
      shortDescription: 'Build high-performance web applications using modern React, hooks, contexts, and state management.',
      fullDescription: 'In-depth frontend development with React 18. Master functional components, custom hooks, performance profiling, component composition, and responsive accessibility.',
      category: 'Software Engineering',
      level: 'Intermediate',
      duration: '24 Hours',
      durationHours: 24,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
      originalPrice: 0,
      price: 0,
      discountPercent: 0,
      isFree: true,
      isFeatured: false,
      badge: 'RECOMMENDED',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 4120,
      averageRating: 4.7,
      reviewsCount: 380,
      creators: {
        create: [{ creatorId: creator2.id }]
      },
      requirements: {
        create: [{ text: 'Solid understanding of core JavaScript and ES6 features', orderIndex: 1 }]
      },
      learningOutcomes: {
        create: [
          { text: 'Architect reusable component libraries with robust state management', orderIndex: 1 },
          { text: 'Optimize bundle size and render cycles in single page applications', orderIndex: 2 }
        ]
      }
    }
  })

  // Course 4: AI & Automation Fundamentals (FREE) - Assigned to Creator 4 (Elena Rostova)
  const course4 = await prisma.course.create({
    data: {
      id: 'course-ai-auto',
      slug: 'ai-automation-fundamentals',
      title: 'AI & Automation Fundamentals',
      shortDescription: 'Leverage generative AI tools, prompt engineering, and workflow orchestration to automate operations.',
      fullDescription: 'Learn to systematically integrate artificial intelligence into daily operational pipelines. Explore prompt frameworks, automated document extraction, and API integrations.',
      category: 'Artificial Intelligence',
      level: 'Beginner',
      duration: '18 Hours',
      durationHours: 18,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
      originalPrice: 0,
      price: 0,
      discountPercent: 0,
      isFree: true,
      isFeatured: true,
      badge: 'TRENDING',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 6510,
      averageRating: 4.9,
      reviewsCount: 780,
      creators: {
        create: [{ creatorId: creator4.id }]
      },
      requirements: {
        create: [{ text: 'No programming prerequisites required', orderIndex: 1 }]
      },
      learningOutcomes: {
        create: [
          { text: 'Design automated business workflows using LLM agents', orderIndex: 1 },
          { text: 'Formulate precise prompt architectures for complex analytical tasks', orderIndex: 2 }
        ]
      }
    }
  })

  // Course 5: Data Analytics with Python (PAID) - Assigned to Creator 5 (David Kumar)
  const course5 = await prisma.course.create({
    data: {
      id: 'course-data-analytics',
      slug: 'data-analytics-with-python',
      title: 'Data Analytics with Python',
      shortDescription: 'Master NumPy, Pandas, statistical data analysis, visualization, and actionable business insights.',
      fullDescription: 'Hands-on data analytics curriculum. Transform messy datasets into executive decision dashboards using Pandas, Seaborn, and statistical hypothesis testing.',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '32 Hours',
      durationHours: 32,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      originalPrice: 4999,
      price: 2999,
      discountPercent: 40,
      isFree: false,
      isFeatured: false,
      badge: 'CAREER TRACK',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 2840,
      averageRating: 4.8,
      reviewsCount: 310,
      creators: {
        create: [{ creatorId: creator5.id }]
      },
      requirements: {
        create: [{ text: 'Completion of Python Fundamentals or equivalent experience', orderIndex: 1 }]
      },
      learningOutcomes: {
        create: [
          { text: 'Perform end-to-end data cleaning, wrangling and exploratory analysis', orderIndex: 1 },
          { text: 'Build interactive visualizations and executive data reports', orderIndex: 2 }
        ]
      }
    }
  })

  // Course 6: Applied Machine Learning (PAID) - Assigned to Creator 1 (Dr. Alex Rivera)
  const course6 = await prisma.course.create({
    data: {
      id: 'course-applied-ml',
      slug: 'applied-machine-learning',
      title: 'Applied Machine Learning',
      shortDescription: 'Deep learning, supervised and unsupervised modeling, neural networks, and model deployment.',
      fullDescription: 'Master applied machine learning from mathematical foundations to production inference. Implement convolutional networks, transformers, and evaluation metrics using PyTorch.',
      category: 'Data Science',
      level: 'Advanced',
      duration: '40 Hours',
      durationHours: 40,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      originalPrice: 7999,
      price: 4999,
      discountPercent: 37,
      isFree: false,
      isFeatured: true,
      badge: 'FLAGSHIP',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 1980,
      averageRating: 4.9,
      reviewsCount: 240,
      creators: {
        create: [{ creatorId: creator1.id }]
      },
      requirements: {
        create: [
          { text: 'Solid programming proficiency in Python and basic linear algebra', orderIndex: 1 }
        ]
      },
      learningOutcomes: {
        create: [
          { text: 'Train, evaluate, and optimize deep neural networks in PyTorch', orderIndex: 1 },
          { text: 'Deploy containerized machine learning inference services to production', orderIndex: 2 }
        ]
      }
    }
  })
  console.log('Seeded 6 Courses (3 Free, 3 Paid) - Every one of the 5 creators has at least 1 course!')

  // 5. Seed Playlists & Lessons for ALL 6 COURSES and ALL 5 CREATORS
  // Video States: PUBLISHED, APPROVED, SUBMITTED_FOR_REVIEW, RETURNED_FOR_EDIT, DRAFT

  // Course 2 Playlists (Creator 3: Michael Chen)
  const plPy1 = await prisma.playlist.create({
    data: {
      id: 'playlist-py-1',
      courseId: course2.id,
      creatorId: creator3.id,
      title: 'Module 1: Syntax and Control Flow',
      description: 'Foundational syntax, variables, operators, and conditional branching.',
      orderIndex: 1
    }
  })

  const plPy2 = await prisma.playlist.create({
    data: {
      id: 'playlist-py-2',
      courseId: course2.id,
      creatorId: creator3.id,
      title: 'Module 2: Functions, Data Structures and Files',
      description: 'Functions, collections, file system operations, and error handling.',
      orderIndex: 2
    }
  })

  const lesPy1 = await prisma.lesson.create({
    data: {
      id: 'lesson-py-1',
      playlistId: plPy1.id,
      creatorId: creator3.id,
      title: '1. Introduction to Computational Thinking and Environment Setup',
      description: 'Configuring Python 3, virtual environments, and executing initial scripts.',
      duration: '12:40',
      durationSeconds: 760,
      videoUrl: '/uploads/courses/course-python/lesson-1.mp4',
      s3Key: 'courses/course-python/lesson-1.mp4',
      orderIndex: 1,
      isPreview: true,
      isPublicDemo: true,
      status: 'PUBLISHED'
    }
  })

  const lesPy2 = await prisma.lesson.create({
    data: {
      id: 'lesson-py-2',
      playlistId: plPy1.id,
      creatorId: creator3.id,
      title: '2. Variable Types, String Manipulation and Operators',
      description: 'Primitive datatypes, immutable strings, arithmetic operators and truthiness.',
      duration: '18:15',
      durationSeconds: 1095,
      videoUrl: '/uploads/courses/course-python/lesson-2.mp4',
      s3Key: 'courses/course-python/lesson-2.mp4',
      orderIndex: 2,
      status: 'PUBLISHED'
    }
  })

  const lesPy3 = await prisma.lesson.create({
    data: {
      id: 'lesson-py-3',
      playlistId: plPy2.id,
      creatorId: creator3.id,
      title: '3. Modular Functions, Scopes and Return Statements',
      description: 'Declaring pure functions, default arguments, *args, **kwargs, and closures.',
      duration: '22:10',
      durationSeconds: 1330,
      videoUrl: '/uploads/courses/course-python/lesson-3.mp4',
      s3Key: 'courses/course-python/lesson-3.mp4',
      orderIndex: 1,
      status: 'PUBLISHED'
    }
  })

  const lesPy4 = await prisma.lesson.create({
    data: {
      id: 'lesson-py-4',
      playlistId: plPy2.id,
      creatorId: creator3.id,
      title: '4. File I/O, Context Managers and Exception Handling',
      description: 'Reading structured text and CSV files, try/except blocks, and defensive coding.',
      duration: '19:30',
      durationSeconds: 1170,
      videoUrl: '/uploads/courses/course-python/lesson-4.mp4',
      s3Key: 'courses/course-python/lesson-4.mp4',
      orderIndex: 2,
      status: 'PUBLISHED'
    }
  })

  await prisma.course.update({
    where: { id: course2.id },
    data: { demoLessonId: lesPy1.id }
  })

  // Course 1 Playlists (Creator 2: Sarah Jenkins)
  const plFs1 = await prisma.playlist.create({
    data: {
      id: 'playlist-fs-1',
      courseId: course1.id,
      creatorId: creator2.id,
      title: 'Module 1: Modern JavaScript and Asynchronous Architecture',
      description: 'ES6+ specifications, event loop, promises, and DOM rendering.',
      orderIndex: 1
    }
  })

  const plFs2 = await prisma.playlist.create({
    data: {
      id: 'playlist-fs-2',
      courseId: course1.id,
      creatorId: creator2.id,
      title: 'Module 2: Server-Side Engineering with Node.js and Express',
      description: 'RESTful API contracts, middleware, error handling, and JWT authentication.',
      orderIndex: 2
    }
  })

  const plFs3 = await prisma.playlist.create({
    data: {
      id: 'playlist-fs-3',
      courseId: course1.id,
      creatorId: creator2.id,
      title: 'Module 3: Database Modeling and Persistence',
      description: 'PostgreSQL architecture, Prisma migrations, and transaction management.',
      orderIndex: 3
    }
  })

  const lesFs1 = await prisma.lesson.create({
    data: {
      id: 'lesson-fs-1',
      playlistId: plFs1.id,
      creatorId: creator2.id,
      title: '1. Event Loop Mechanics and Asynchronous JavaScript',
      description: 'Microtasks, macrotasks, Promises, and async/await under the V8 engine.',
      duration: '25:00',
      durationSeconds: 1500,
      videoUrl: '/uploads/courses/course-fullstack/lesson-1.mp4',
      s3Key: 'courses/course-fullstack/lesson-1.mp4',
      orderIndex: 1,
      isPreview: true,
      isPublicDemo: true,
      status: 'PUBLISHED'
    }
  })

  const lesFs2 = await prisma.lesson.create({
    data: {
      id: 'lesson-fs-2',
      playlistId: plFs1.id,
      creatorId: creator2.id,
      title: '2. DOM Manipulation and Component Lifecycle Fundamentals',
      description: 'Virtual DOM reconciliation, state immutability, and rendering pipelines.',
      duration: '20:30',
      durationSeconds: 1230,
      videoUrl: '/uploads/courses/course-fullstack/lesson-2.mp4',
      s3Key: 'courses/course-fullstack/lesson-2.mp4',
      orderIndex: 2,
      status: 'PUBLISHED'
    }
  })

  const lesFs3 = await prisma.lesson.create({
    data: {
      id: 'lesson-fs-3',
      playlistId: plFs2.id,
      creatorId: creator2.id,
      title: '3. Building RESTful APIs with Node.js and Express',
      description: 'Routing, middleware chains, JSON validation, and error envelopes.',
      duration: '30:15',
      durationSeconds: 1815,
      videoUrl: '/uploads/courses/course-fullstack/lesson-3.mp4',
      s3Key: 'courses/course-fullstack/lesson-3.mp4',
      orderIndex: 1,
      status: 'PUBLISHED'
    }
  })

  const lesFs4 = await prisma.lesson.create({
    data: {
      id: 'lesson-fs-4',
      playlistId: plFs2.id,
      creatorId: creator2.id,
      title: '4. Authentication, JWT Sessions, and Security Headers',
      description: 'Password hashing with bcrypt, stateless JWT issuance, and Helmet integration.',
      duration: '28:45',
      durationSeconds: 1725,
      videoUrl: '/uploads/courses/course-fullstack/lesson-4.mp4',
      s3Key: 'courses/course-fullstack/lesson-4.mp4',
      orderIndex: 2,
      status: 'APPROVED'
    }
  })

  const lesFs5 = await prisma.lesson.create({
    data: {
      id: 'lesson-fs-5',
      playlistId: plFs3.id,
      creatorId: creator2.id,
      title: '5. Relational Modeling with PostgreSQL and Foreign Keys',
      description: 'Designing normalized schemas, indexes, and referential cascade rules.',
      duration: '35:20',
      durationSeconds: 2120,
      videoUrl: '/uploads/courses/course-fullstack/lesson-5.mp4',
      s3Key: 'courses/course-fullstack/lesson-5.mp4',
      orderIndex: 1,
      status: 'SUBMITTED_FOR_REVIEW'
    }
  })

  const lesFs6 = await prisma.lesson.create({
    data: {
      id: 'lesson-fs-6',
      playlistId: plFs3.id,
      creatorId: creator2.id,
      title: '6. Enterprise Database Migrations with Prisma ORM',
      description: 'Generating migrations, seed scripts, and relation queries in production.',
      duration: '24:10',
      durationSeconds: 1450,
      videoUrl: '/uploads/courses/course-fullstack/lesson-6.mp4',
      s3Key: 'courses/course-fullstack/lesson-6.mp4',
      orderIndex: 2,
      status: 'RETURNED_FOR_EDIT',
      adminFeedback: 'Audio static detected between minutes 04:12 and 05:30. Re-record audio track and resubmit.'
    }
  })

  await prisma.course.update({
    where: { id: course1.id },
    data: { demoLessonId: lesFs1.id }
  })

  // Course 6 Playlists (Creator 1: Dr. Alex Rivera)
  const plMl1 = await prisma.playlist.create({
    data: {
      id: 'playlist-ml-1',
      courseId: course6.id,
      creatorId: creator1.id,
      title: 'Module 1: Mathematical Foundations and Optimization',
      description: 'Vector calculus, matrix decomposition, loss functions, and gradient descent.',
      orderIndex: 1
    }
  })

  const plMl2 = await prisma.playlist.create({
    data: {
      id: 'playlist-ml-2',
      courseId: course6.id,
      creatorId: creator1.id,
      title: 'Module 2: Deep Learning Architectures with PyTorch',
      description: 'Backpropagation, feedforward networks, convolutional layers, and regularizers.',
      orderIndex: 2
    }
  })

  const plMl3 = await prisma.playlist.create({
    data: {
      id: 'playlist-ml-3',
      courseId: course6.id,
      creatorId: creator1.id,
      title: 'Module 3: Sequence Modeling and Transformers',
      description: 'Attention mechanisms, multi-head self-attention, and LLM fine-tuning.',
      orderIndex: 3
    }
  })

  const lesMl1 = await prisma.lesson.create({
    data: {
      id: 'lesson-ml-1',
      playlistId: plMl1.id,
      creatorId: creator1.id,
      title: '1. Linear Algebra and Vector Spaces for Machine Learning',
      description: 'Dot products, eigenvalues, matrix transformations, and geometric intuition.',
      duration: '28:00',
      durationSeconds: 1680,
      videoUrl: '/uploads/courses/course-applied-ml/lesson-1.mp4',
      s3Key: 'courses/course-applied-ml/lesson-1.mp4',
      orderIndex: 1,
      isPreview: true,
      isPublicDemo: true,
      status: 'PUBLISHED'
    }
  })

  const lesMl2 = await prisma.lesson.create({
    data: {
      id: 'lesson-ml-2',
      playlistId: plMl1.id,
      creatorId: creator1.id,
      title: '2. Loss Formulations and Stochastic Gradient Descent',
      description: 'MSE, Cross-Entropy loss, learning rates, momentum, and Adam optimization.',
      duration: '32:40',
      durationSeconds: 1960,
      videoUrl: '/uploads/courses/course-applied-ml/lesson-2.mp4',
      s3Key: 'courses/course-applied-ml/lesson-2.mp4',
      orderIndex: 2,
      status: 'PUBLISHED'
    }
  })

  const lesMl3 = await prisma.lesson.create({
    data: {
      id: 'lesson-ml-3',
      playlistId: plMl2.id,
      creatorId: creator1.id,
      title: '3. Neural Network Architectures and Backpropagation',
      description: 'Multilayer perceptrons, activation functions, and computational graphs.',
      duration: '38:10',
      durationSeconds: 2290,
      videoUrl: '/uploads/courses/course-applied-ml/lesson-3.mp4',
      s3Key: 'courses/course-applied-ml/lesson-3.mp4',
      orderIndex: 1,
      status: 'APPROVED'
    }
  })

  const lesMl4 = await prisma.lesson.create({
    data: {
      id: 'lesson-ml-4',
      playlistId: plMl2.id,
      creatorId: creator1.id,
      title: '4. PyTorch Tensors, Autograd and Training Loops',
      description: 'Implementing custom datasets, DataLoader pipelines, and GPU training.',
      duration: '42:00',
      durationSeconds: 2520,
      videoUrl: '/uploads/courses/course-applied-ml/lesson-4.mp4',
      s3Key: 'courses/course-applied-ml/lesson-4.mp4',
      orderIndex: 2,
      status: 'SUBMITTED_FOR_REVIEW'
    }
  })

  const lesMl5 = await prisma.lesson.create({
    data: {
      id: 'lesson-ml-5',
      playlistId: plMl3.id,
      creatorId: creator1.id,
      title: '5. Transformer Self-Attention and Multi-Head Layers',
      description: 'Scaled dot-product attention, positional encodings, and encoder-decoder stacks.',
      duration: '45:10',
      durationSeconds: 2710,
      videoUrl: '/uploads/courses/course-applied-ml/lesson-5.mp4',
      s3Key: 'courses/course-applied-ml/lesson-5.mp4',
      orderIndex: 1,
      status: 'RETURNED_FOR_EDIT',
      adminFeedback: 'Slide 14 contains an equation typo in the softmax normalizer exponent. Correct and resubmit.'
    }
  })

  const lesMl6 = await prisma.lesson.create({
    data: {
      id: 'lesson-ml-6',
      playlistId: plMl3.id,
      creatorId: creator1.id,
      title: '6. Fine-Tuning Open Source LLMs with LoRA and PEFT',
      description: 'Parameter-efficient fine-tuning, quantization, and evaluation benchmarks.',
      duration: '50:00',
      durationSeconds: 3000,
      orderIndex: 2,
      status: 'DRAFT'
    }
  })

  await prisma.course.update({
    where: { id: course6.id },
    data: { demoLessonId: lesMl1.id }
  })

  // Course 4 Playlists (Creator 4: Elena Rostova)
  const plAi1 = await prisma.playlist.create({
    data: {
      id: 'playlist-ai-1',
      courseId: course4.id,
      creatorId: creator4.id,
      title: 'Module 1: Prompt Architecture and Enterprise LLM Workflows',
      description: 'Zero-shot, few-shot prompting, structured JSON schema outputs, and chain of thought.',
      orderIndex: 1
    }
  })

  const lesAi1 = await prisma.lesson.create({
    data: {
      id: 'lesson-ai-1',
      playlistId: plAi1.id,
      creatorId: creator4.id,
      title: '1. Fundamentals of Prompt Architecture and Tokenization',
      description: 'Understanding token limits, attention windows, and deterministic prompting.',
      duration: '15:20',
      durationSeconds: 920,
      videoUrl: '/uploads/courses/course-ai-auto/lesson-1.mp4',
      s3Key: 'courses/course-ai-auto/lesson-1.mp4',
      orderIndex: 1,
      isPreview: true,
      isPublicDemo: true,
      status: 'PUBLISHED'
    }
  })

  const lesAi2 = await prisma.lesson.create({
    data: {
      id: 'lesson-ai-2',
      playlistId: plAi1.id,
      creatorId: creator4.id,
      title: '2. Orchestrating Multi-Agent Business Automations',
      description: 'Connecting LLM agents to external APIs and enterprise databases.',
      duration: '22:45',
      durationSeconds: 1365,
      videoUrl: '/uploads/courses/course-ai-auto/lesson-2.mp4',
      s3Key: 'courses/course-ai-auto/lesson-2.mp4',
      orderIndex: 2,
      status: 'SUBMITTED_FOR_REVIEW'
    }
  })

  await prisma.course.update({
    where: { id: course4.id },
    data: { demoLessonId: lesAi1.id }
  })

  // Course 5 Playlists (Creator 5: David Kumar)
  const plDa1 = await prisma.playlist.create({
    data: {
      id: 'playlist-da-1',
      courseId: course5.id,
      creatorId: creator5.id,
      title: 'Module 1: High-Performance Data Ingestion and Pandas',
      description: 'Pandas dataframes, memory optimization, chunked ingestion, and parquet files.',
      orderIndex: 1
    }
  })

  const lesDa1 = await prisma.lesson.create({
    data: {
      id: 'lesson-da-1',
      playlistId: plDa1.id,
      creatorId: creator5.id,
      title: '1. Tabular Ingestion and Memory Profiling with Pandas',
      description: 'Vectorized series operations, index optimization, and dirty data handling.',
      duration: '26:15',
      durationSeconds: 1575,
      videoUrl: '/uploads/courses/course-data-analytics/lesson-1.mp4',
      s3Key: 'courses/course-data-analytics/lesson-1.mp4',
      orderIndex: 1,
      isPreview: true,
      isPublicDemo: true,
      status: 'PUBLISHED'
    }
  })

  const lesDa2 = await prisma.lesson.create({
    data: {
      id: 'lesson-da-2',
      playlistId: plDa1.id,
      creatorId: creator5.id,
      title: '2. Statistical Hypothesis Testing and Distribution Modeling',
      description: 'Confidence intervals, p-values, A/B testing frameworks, and regression modeling.',
      duration: '34:20',
      durationSeconds: 2060,
      orderIndex: 2,
      status: 'DRAFT'
    }
  })

  await prisma.course.update({
    where: { id: course5.id },
    data: { demoLessonId: lesDa1.id }
  })

  console.log('Seeded Playlists & Lessons for ALL 5 Creators across all operational states!')

  // 6. Seed 15 Diverse Students
  const studentData = [
    { id: 'student-01', name: 'Rahul Sharma', email: 'rahul.sharma@student.apexlearn.edu', phone: '+91 98765 43201', bio: 'Aspiring Data Scientist and ML Engineer.' },
    { id: 'student-02', name: 'Ananya Patel', email: 'ananya.patel@student.apexlearn.edu', phone: '+91 98765 43202', bio: 'Quantitative Analyst and React Developer.' },
    { id: 'student-03', name: 'David Kim', email: 'david.kim@student.apexlearn.edu', phone: '+91 98765 43203', bio: 'Computer Science Researcher.' },
    { id: 'student-04', name: 'Priya Nair', email: 'priya.nair@student.apexlearn.edu', phone: '+91 98765 43204', bio: 'Frontend UI/UX Specialist.' },
    { id: 'student-05', name: 'Liam Vance', email: 'liam.vance@student.apexlearn.edu', phone: '+91 98765 43205', bio: 'Enterprise Automation Engineer.' },
    { id: 'student-06', name: 'Sofia Rossi', email: 'sofia.rossi@student.apexlearn.edu', phone: '+91 98765 43206', bio: 'Full-stack software developer.' },
    { id: 'student-07', name: 'Carlos Gomez', email: 'carlos.gomez@student.apexlearn.edu', phone: '+91 98765 43207', bio: 'Backend Python developer.' },
    { id: 'student-08', name: 'Aisha Al-Mansoor', email: 'aisha.mansoor@student.apexlearn.edu', phone: '+91 98765 43208', bio: 'AI researcher and data analyst.' },
    { id: 'student-09', name: 'Marcus Becker', email: 'marcus.becker@student.apexlearn.edu', phone: '+91 98765 43209', bio: 'Junior web development intern.' },
    { id: 'student-10', name: 'Maya Lin', email: 'maya.lin@student.apexlearn.edu', phone: '+91 98765 43210', bio: 'Business intelligence analyst.' },
    { id: 'student-11', name: 'Rohan Mehta', email: 'rohan.mehta@student.apexlearn.edu', phone: '+91 98765 43211', bio: 'Enterprise software engineer.' },
    { id: 'student-12', name: 'Elena Vargas', email: 'elena.vargas@student.apexlearn.edu', phone: '+91 98765 43212', bio: 'Cloud integration developer.' },
    { id: 'student-13', name: 'James Wilson', email: 'james.wilson@student.apexlearn.edu', phone: '+91 98765 43213', bio: 'Systems automation programmer.' },
    { id: 'student-14', name: 'Fatima Zahra', email: 'fatima.zahra@student.apexlearn.edu', phone: '+91 98765 43214', bio: 'React and UI component designer.' },
    { id: 'student-15', name: 'Kevin Chen', email: 'kevin.chen@student.apexlearn.edu', phone: '+91 98765 43215', bio: 'Data science graduate student.' }
  ]

  const students = []
  for (const s of studentData) {
    const created = await prisma.user.create({
      data: {
        id: s.id,
        email: s.email,
        passwordHash: studentPassword,
        name: s.name,
        role: 'STUDENT',
        status: 'ACTIVE',
        phone: s.phone,
        bio: s.bio
      }
    })
    students.push(created)
  }
  console.log('Seeded 15 Diverse Student Accounts (student-01 to student-15)')

  // 7. Seed Enrollments & Progress
  // Student 01: 100% on Python Fundamentals (Completed)
  const enrollPy1 = await prisma.enrollment.create({
    data: {
      studentId: students[0].id,
      courseId: course2.id,
      status: 'ACTIVE',
      progressPercent: 100.0,
      completedAt: new Date(Date.now() - 86400000 * 5)
    }
  })

  const pyLessons = [lesPy1, lesPy2, lesPy3, lesPy4]
  for (const l of pyLessons) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollPy1.id,
        studentId: students[0].id,
        lessonId: l.id,
        isCompleted: true,
        watchSeconds: l.durationSeconds,
        lastPositionSec: l.durationSeconds,
        completedAt: new Date(Date.now() - 86400000 * 6)
      }
    })
  }

  // Student 02: 100% on Full Stack Web Dev
  const enrollFs2 = await prisma.enrollment.create({
    data: {
      studentId: students[1].id,
      courseId: course1.id,
      status: 'ACTIVE',
      progressPercent: 100.0,
      completedAt: new Date(Date.now() - 86400000 * 2)
    }
  })
  const fsPublished = [lesFs1, lesFs2, lesFs3]
  for (const l of fsPublished) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollFs2.id,
        studentId: students[1].id,
        lessonId: l.id,
        isCompleted: true,
        watchSeconds: l.durationSeconds,
        lastPositionSec: l.durationSeconds,
        completedAt: new Date(Date.now() - 86400000 * 3)
      }
    })
  }

  // Student 03: 100% on Applied Machine Learning
  const enrollMl3 = await prisma.enrollment.create({
    data: {
      studentId: students[2].id,
      courseId: course6.id,
      status: 'ACTIVE',
      progressPercent: 100.0,
      completedAt: new Date(Date.now() - 86400000 * 1)
    }
  })
  const mlPublished = [lesMl1, lesMl2]
  for (const l of mlPublished) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollMl3.id,
        studentId: students[2].id,
        lessonId: l.id,
        isCompleted: true,
        watchSeconds: l.durationSeconds,
        lastPositionSec: l.durationSeconds,
        completedAt: new Date(Date.now() - 86400000 * 2)
      }
    })
  }

  // Student 04: 75% on React
  await prisma.enrollment.create({
    data: {
      studentId: students[3].id,
      courseId: course3.id,
      status: 'ACTIVE',
      progressPercent: 75.0
    }
  })

  // Student 05: 50% on AI Automation
  await prisma.enrollment.create({
    data: {
      studentId: students[4].id,
      courseId: course4.id,
      status: 'ACTIVE',
      progressPercent: 50.0
    }
  })

  // Student 06: 40% on Full Stack
  await prisma.enrollment.create({
    data: {
      studentId: students[5].id,
      courseId: course1.id,
      status: 'ACTIVE',
      progressPercent: 40.0
    }
  })

  // Student 07: 25% on Python
  await prisma.enrollment.create({
    data: {
      studentId: students[6].id,
      courseId: course2.id,
      status: 'ACTIVE',
      progressPercent: 25.0
    }
  })

  // Student 08: 15% on Applied ML
  await prisma.enrollment.create({
    data: {
      studentId: students[7].id,
      courseId: course6.id,
      status: 'ACTIVE',
      progressPercent: 15.0
    }
  })

  // Student 09: 0% on React (Fresh free enrollment)
  await prisma.enrollment.create({
    data: {
      studentId: students[8].id,
      courseId: course3.id,
      status: 'ACTIVE',
      progressPercent: 0.0
    }
  })

  // Student 10: 0% on Data Analytics (Fresh paid enrollment)
  await prisma.enrollment.create({
    data: {
      studentId: students[9].id,
      courseId: course5.id,
      status: 'ACTIVE',
      progressPercent: 0.0
    }
  })
  console.log('Seeded Enrollments & Progress across 0%, partial (25-75%), and 100% completion')

  // 8. Seed Quizzes, Questions, and Attempts
  const quizPy = await prisma.quiz.create({
    data: {
      courseId: course2.id,
      title: 'Python Control Flow and Modular Functions Assessment',
      passingScore: 70,
      maxAttempts: 3,
      questions: {
        create: [
          {
            question: 'Which Python collection type maintains unique, unordered elements?',
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'List', isCorrect: false },
                { optionText: 'Tuple', isCorrect: false },
                { optionText: 'Set', isCorrect: true },
                { optionText: 'Dictionary Keys View', isCorrect: false }
              ]
            }
          },
          {
            question: 'What is the runtime complexity of accessing a dictionary value by key in Python?',
            orderIndex: 2,
            options: {
              create: [
                { optionText: 'O(1) on average', isCorrect: true },
                { optionText: 'O(n)', isCorrect: false },
                { optionText: 'O(log n)', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  })

  const quizFs = await prisma.quiz.create({
    data: {
      courseId: course1.id,
      title: 'Asynchronous Architecture and Express API Assessment',
      passingScore: 70,
      maxAttempts: 3,
      questions: {
        create: [
          {
            question: 'In the Node.js event loop, where do resolved Promise callbacks execute?',
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'Microtask Queue', isCorrect: true },
                { optionText: 'Macrotask Queue', isCorrect: false },
                { optionText: 'Timer Phase', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  })

  // Quiz Attempts: Student 01 passed, Student 02 passed, Student 05 failed
  await prisma.quizAttempt.create({
    data: {
      quizId: quizPy.id,
      studentId: students[0].id,
      score: 100.0,
      passed: true
    }
  })

  await prisma.quizAttempt.create({
    data: {
      quizId: quizFs.id,
      studentId: students[1].id,
      score: 100.0,
      passed: true
    }
  })

  await prisma.quizAttempt.create({
    data: {
      quizId: quizPy.id,
      studentId: students[4].id,
      score: 50.0,
      passed: false
    }
  })
  console.log('Seeded Quizzes and Quiz Attempts (Passing and Failed)')

  // 9. Seed Certificates (STRICTLY 100% Eligible Students Only)
  await prisma.certificate.create({
    data: {
      id: 'cert-python-01',
      certificateCode: 'CERT-2026-PY01',
      studentId: students[0].id,
      courseId: course2.id,
      studentName: 'Rahul Sharma',
      courseTitle: 'Python Programming Fundamentals',
      status: 'VALID',
      verificationUrl: '/certificates/CERT-2026-PY01',
      issueDate: new Date(Date.now() - 86400000 * 5)
    }
  })

  await prisma.certificate.create({
    data: {
      id: 'cert-fullstack-02',
      certificateCode: 'CERT-2026-FS02',
      studentId: students[1].id,
      courseId: course1.id,
      studentName: 'Ananya Patel',
      courseTitle: 'Full Stack Web Development',
      status: 'VALID',
      verificationUrl: '/certificates/CERT-2026-FS02',
      issueDate: new Date(Date.now() - 86400000 * 2)
    }
  })

  await prisma.certificate.create({
    data: {
      id: 'cert-ml-03',
      certificateCode: 'CERT-2026-ML03',
      studentId: students[2].id,
      courseId: course6.id,
      studentName: 'David Kim',
      courseTitle: 'Applied Machine Learning',
      status: 'VALID',
      verificationUrl: '/certificates/CERT-2026-ML03',
      issueDate: new Date(Date.now() - 86400000 * 1)
    }
  })
  console.log('Seeded 3 Digital Certificates for genuinely 100% completed eligible students only')

  // 10. Seed Commercial Orders & Payments
  const order1 = await prisma.order.create({
    data: {
      id: 'order-demo-001',
      orderNumber: 'DEMO_ORDER_001',
      razorpayOrderId: 'order_demo_rzp_001',
      razorpayPaymentId: 'pay_demo_success_001',
      studentId: students[0].id,
      courseId: course5.id,
      amount: 2999.00,
      currency: 'INR',
      status: 'SUCCESSFUL'
    }
  })
  await prisma.paymentEvent.create({
    data: {
      orderId: order1.id,
      eventType: 'payment.captured',
      amount: 2999.00,
      status: 'SUCCESSFUL',
      gatewayReference: 'pay_demo_success_001',
      metadata: 'Demo captured payment event'
    }
  })

  const order2 = await prisma.order.create({
    data: {
      id: 'order-demo-002',
      orderNumber: 'DEMO_ORDER_002',
      razorpayOrderId: 'order_demo_rzp_002',
      razorpayPaymentId: 'pay_demo_success_002',
      studentId: students[1].id,
      courseId: course1.id,
      amount: 3999.00,
      currency: 'INR',
      status: 'SUCCESSFUL'
    }
  })
  await prisma.paymentEvent.create({
    data: {
      orderId: order2.id,
      eventType: 'payment.captured',
      amount: 3999.00,
      status: 'SUCCESSFUL',
      gatewayReference: 'pay_demo_success_002',
      metadata: 'Demo captured payment event'
    }
  })

  const order3 = await prisma.order.create({
    data: {
      id: 'order-demo-003',
      orderNumber: 'DEMO_ORDER_003',
      razorpayOrderId: 'order_demo_rzp_003',
      razorpayPaymentId: 'pay_demo_success_003',
      studentId: students[2].id,
      courseId: course6.id,
      amount: 4999.00,
      currency: 'INR',
      status: 'SUCCESSFUL'
    }
  })
  await prisma.paymentEvent.create({
    data: {
      orderId: order3.id,
      eventType: 'payment.captured',
      amount: 4999.00,
      status: 'SUCCESSFUL',
      gatewayReference: 'pay_demo_success_003',
      metadata: 'Demo captured payment event'
    }
  })

  // Pending Order (Access Gated)
  await prisma.order.create({
    data: {
      id: 'order-demo-007',
      orderNumber: 'DEMO_ORDER_007',
      razorpayOrderId: 'order_demo_rzp_007',
      studentId: students[14].id,
      courseId: course5.id,
      amount: 2999.00,
      currency: 'INR',
      status: 'PENDING'
    }
  })

  // Failed Order (Access Denied)
  const orderFailed = await prisma.order.create({
    data: {
      id: 'order-demo-008',
      orderNumber: 'DEMO_ORDER_008',
      razorpayOrderId: 'order_demo_rzp_008',
      razorpayPaymentId: 'pay_demo_failed_008',
      studentId: students[7].id,
      courseId: course6.id,
      amount: 4999.00,
      currency: 'INR',
      status: 'FAILED'
    }
  })
  await prisma.paymentEvent.create({
    data: {
      orderId: orderFailed.id,
      eventType: 'payment.failed',
      amount: 4999.00,
      status: 'FAILED',
      gatewayReference: 'pay_demo_failed_008',
      metadata: 'Card authentication failed'
    }
  })
  console.log('Seeded Commercial Orders and Payments (SUCCESSFUL, PENDING, FAILED)')

  // 11. Seed Support Tickets & Replies
  const ticket1 = await prisma.supportTicket.create({
    data: {
      id: 'ticket-demo-101',
      studentId: students[6].id,
      subject: 'Video player buffering at high resolution',
      message: 'When streaming Lesson 2 on a 50Mbps connection, playback pauses every 30 seconds.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS'
    }
  })
  await prisma.ticketReply.create({
    data: {
      ticketId: ticket1.id,
      userId: admin.id,
      message: 'We are investigating CDN edge cache latencies for your region. Please try selecting 720p in the interim.'
    }
  })

  const ticket2 = await prisma.supportTicket.create({
    data: {
      id: 'ticket-demo-102',
      studentId: students[11].id,
      subject: 'Quiz score calculation question',
      message: 'Question 1 submitted answer was marked incorrect despite matching documentation.',
      priority: 'LOW',
      status: 'RESOLVED'
    }
  })
  await prisma.ticketReply.create({
    data: {
      ticketId: ticket2.id,
      userId: admin.id,
      message: 'Your explanation was reviewed by Dr. Vikram Sen and the rubric has been updated.'
    }
  })
  console.log('Seeded Student Support Tickets with Administrative Replies')

  // 12. Seed Creator Profile Change Requests
  await prisma.profileChangeRequest.create({
    data: {
      id: 'req-profile-01',
      creatorProfileId: creator1.creatorProfile.id,
      requestType: 'BIO_UPDATE',
      currentValue: creator1.creatorProfile.biography,
      requestedValue: 'Over 14 years building high-throughput ML pipelines in production across robotics and enterprise systems.',
      requestedBio: 'Over 14 years building high-throughput ML pipelines in production across robotics and enterprise systems.',
      reason: 'Updated academic credentials and new book publication.',
      status: 'APPROVED',
      adminNote: 'Approved after verification of updated credentials.',
      reviewedBy: admin.id,
      reviewedAt: new Date(Date.now() - 86400000 * 3)
    }
  })

  await prisma.profileChangeRequest.create({
    data: {
      id: 'req-profile-02',
      creatorProfileId: creator2.creatorProfile.id,
      requestType: 'HEADLINE_UPDATE',
      currentValue: creator2.creatorProfile.headline,
      requestedValue: 'Distinguished Full Stack Engineer and Systems Architect',
      requestedHeadline: 'Distinguished Full Stack Engineer and Systems Architect',
      reason: 'Promotion to distinguished faculty member.',
      status: 'PENDING'
    }
  })
  console.log('Seeded Creator Profile Change Requests (APPROVED and PENDING)')

  // 13. Seed Notifications (Zero Emojis!)
  await prisma.notification.createMany({
    data: [
      {
        userId: students[0].id,
        title: 'Welcome to ApexLearn',
        message: 'Your student account is active. Explore your enrolled courses and commence Module 1.',
        linkUrl: '/student/courses',
        isRead: true
      },
      {
        userId: students[0].id,
        title: 'Verified Certificate Issued',
        message: 'Congratulations. Your certificate CERT-2026-PY01 has been issued and verified.',
        linkUrl: '/student/certificates',
        isRead: false
      },
      {
        userId: creator2.id,
        title: 'Lesson Verification Feedback',
        message: 'Lesson 6 in Full Stack Web Development was returned for audio corrections.',
        linkUrl: '/creator/feedback',
        isRead: false
      }
    ]
  })
  console.log('Seeded Notifications (Adhering to Zero-Emoji Policy)')

  // 14. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATOR_PROVISIONED',
        entityType: 'User',
        entityId: creator1.id,
        details: 'Admin provisioned Creator Dr. Alex Rivera (CR-TEC-001).',
        ipAddress: '127.0.0.1'
      },
      {
        userId: admin.id,
        action: 'COURSE_PUBLISHED',
        entityType: 'Course',
        entityId: course1.id,
        details: 'Admin published Full Stack Web Development to the public catalog.',
        ipAddress: '127.0.0.1'
      },
      {
        userId: creator2.id,
        action: 'LESSON_SUBMITTED',
        entityType: 'Lesson',
        entityId: lesFs5.id,
        details: 'Creator submitted lesson for admin review.',
        ipAddress: '127.0.0.1'
      },
      {
        userId: admin.id,
        action: 'LESSON_RETURNED',
        entityType: 'Lesson',
        entityId: lesFs6.id,
        details: 'Admin returned lesson with feedback regarding audio noise.',
        ipAddress: '127.0.0.1'
      }
    ]
  })
  console.log('Seeded Enterprise System Audit Logs')

  // 15. Seed Promotional Offers
  await prisma.offer.create({
    data: {
      id: 'offer-apex50',
      title: 'ApexLearn 50% Launch Promotion',
      code: 'APEX50',
      discountPercent: 50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 30),
      isActive: true,
      maxUses: 500,
      usedCount: 28
    }
  })

  // Scenario L: Course-linked active promotional offer
  await prisma.offer.create({
    data: {
      id: 'offer-fs30',
      courseId: 'course-fullstack',
      title: 'Full Stack Web Development 30% Off',
      code: 'FS30',
      discountPercent: 30,
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000 * 30),
      isActive: true,
      maxUses: 200,
      usedCount: 12
    }
  })

  // Expired offer for validation testing
  await prisma.offer.create({
    data: {
      id: 'offer-expired',
      courseId: 'course-applied-ml',
      title: 'Early Bird ML Discount (Expired)',
      code: 'EXPIRED10',
      discountPercent: 10,
      startDate: new Date(Date.now() - 86400000 * 60),
      endDate: new Date(Date.now() - 86400000 * 10),
      isActive: true,
      maxUses: 100,
      usedCount: 45
    }
  })
  console.log('Seeded Promotional Offers (APEX50 platform-wide, FS30 course-linked, EXPIRED10 expired)')

  // 16. Seed Platform Settings
  const { defaultAboutData } = await import('../src/data/defaultAboutData.js')
  await prisma.platformSetting.upsert({
    where: { key: 'about_page_content' },
    update: { value: JSON.stringify(defaultAboutData) },
    create: {
      key: 'about_page_content',
      value: JSON.stringify(defaultAboutData),
      description: 'Public About Page and Leadership details'
    }
  })

  console.log('Phase 0 Development Seed successfully completed with 100% relational integrity!')
}

main()
  .catch((e) => {
    console.error('Phase 0 Seed execution failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

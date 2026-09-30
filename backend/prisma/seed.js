import bcrypt from 'bcryptjs'
import prisma from '../src/config/prisma.js'

async function main() {
  console.log('🌱 Starting ApexLearn database clean & seed...')

  // Truncate all tables cascading for clean deterministic state
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
    console.log('🧹 Cleaned existing database records.')
  } catch (err) {
    console.log('Note on clean:', err.message)
  }

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10)
  const adminPassword = await bcrypt.hash('adminSecret2026', salt)
  const creatorPassword = await bcrypt.hash('creator123', salt)
  const studentPassword = await bcrypt.hash('student123', salt)

  const admin = await prisma.user.create({
    data: {
      id: 'user-admin-1',
      email: 'director@apexlearn.edu',
      passwordHash: adminPassword,
      name: 'Dr. Vikram Sen',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+91 98765 00001',
      bio: 'Platform Director & Principal AI Scientist at ApexLearn Institute.'
    }
  })

  const creator = await prisma.user.create({
    data: {
      id: 'user-creator-1',
      email: 'creator@apexlearn.edu',
      passwordHash: creatorPassword,
      name: 'Dr. Alex Rivera',
      role: 'CREATOR',
      status: 'ACTIVE',
      phone: '+91 98765 00002',
      bio: 'Senior Machine Learning & Deep Learning Specialist.',
      creatorProfile: {
        create: {
          headline: 'Lead AI Engineer & Curriculum Architect',
          specialization: 'Generative AI & LLM Systems',
          biography: 'Over 12 years building high-throughput ML pipelines in production.',
          isVerified: true
        }
      }
    }
  })

  const student = await prisma.user.create({
    data: {
      id: 'user-student-1',
      email: 'rahul.sharma@example.com',
      passwordHash: studentPassword,
      name: 'Rahul Sharma',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '+91 98765 43210',
      bio: 'Aspiring Data Scientist & Machine Learning Engineer.'
    }
  })

  const student2 = await prisma.user.create({
    data: {
      id: 'user-student-2',
      email: 'ananya.patel@example.com',
      passwordHash: studentPassword,
      name: 'Ananya Patel',
      role: 'STUDENT',
      status: 'ACTIVE',
      phone: '+91 98765 43211',
      bio: 'Quantitative Analyst and Algorithmic Trading Researcher.'
    }
  })

  console.log('✅ Users seeded: Admin, Creator, 2 Students')

  // 2. Seed Courses
  // Course 1: Python for Data Science
  const coursePyds = await prisma.course.create({
    data: {
      id: 'course-pyds',
      slug: 'python-for-data-science',
      title: 'Python for Data Science',
      shortDescription: 'Master modern Python, NumPy, Pandas, Matplotlib, exploratory data analysis, and real-world datasets from scratch.',
      fullDescription: 'Become an industry-ready Data Scientist with our flagship Python for Data Science program. Learn to clean dirty data, run advanced analytics, build automated pipelines, and present executive data visualizations with Seaborn and Plotly. Includes 5 hands-on portfolio projects and weekend live debugging sessions.',
      category: 'Data Science',
      level: 'Beginner to Intermediate',
      duration: '38 Hours',
      durationHours: 38,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      originalPrice: 5999,
      price: 2999,
      discountPercent: 50,
      isFree: false,
      isFeatured: true,
      badge: 'BESTSELLER',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 8650,
      averageRating: 4.9,
      reviewsCount: 1420,
      requirements: {
        create: [
          { text: 'A computer (Windows, Mac, or Linux) with internet access', orderIndex: 1 },
          { text: 'No prior programming or math background required', orderIndex: 2 },
          { text: 'Willingness to write code and solve real-world problems daily', orderIndex: 3 }
        ]
      },
      learningOutcomes: {
        create: [
          { text: 'Write clean, idiomatic Python 3 code with complete fluency', orderIndex: 1 },
          { text: 'Perform exploratory data analysis using Pandas, NumPy, and Matplotlib', orderIndex: 2 },
          { text: 'Scrape and parse structured web data, APIs, and complex CSVs', orderIndex: 3 },
          { text: 'Build production-ready data pipelines and portfolio-grade capstones', orderIndex: 4 }
        ]
      }
    }
  })

  // Course 2: Python for Machine Learning
  const coursePyml = await prisma.course.create({
    data: {
      id: 'course-pyml',
      slug: 'python-for-machine-learning',
      title: 'Python for Machine Learning',
      shortDescription: 'Master Scikit-Learn, regression, classification, cross-validation, feature engineering, and model evaluation techniques.',
      fullDescription: 'A comprehensive engineering guide to classical and modern machine learning algorithms. Master regression, classification, tree ensembles, gradient boosting with XGBoost, and model deployment.',
      category: 'Machine Learning',
      level: 'Intermediate',
      duration: '45 Hours',
      durationHours: 45,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80',
      originalPrice: 6999,
      price: 3499,
      discountPercent: 50,
      isFree: false,
      isFeatured: true,
      badge: 'POPULAR',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 6420,
      averageRating: 4.88,
      reviewsCount: 980,
      requirements: {
        create: [
          { text: 'Basic familiarity with Python syntax', orderIndex: 1 },
          { text: 'High school level linear algebra and statistics', orderIndex: 2 }
        ]
      },
      learningOutcomes: {
        create: [
          { text: 'Train and evaluate Scikit-Learn supervised algorithms', orderIndex: 1 },
          { text: 'Tune hyperparameters using Optuna and GridSearchCV', orderIndex: 2 },
          { text: 'Deploy predictive models as low-latency microservices', orderIndex: 3 }
        ]
      }
    }
  })

  // Course 3: Deep Learning & Neural Architectures
  const courseDl = await prisma.course.create({
    data: {
      id: 'course-deep-learning',
      slug: 'deep-learning-neural-architectures',
      title: 'Deep Learning & Neural Architectures',
      shortDescription: 'Train deep neural networks, CNNs, Transformers, and diffusion models with PyTorch and CUDA acceleration.',
      fullDescription: 'From backpropagation fundamentals to fine-tuning massive generative AI models, explore the complete deep learning engineering spectrum with PyTorch.',
      category: 'Artificial Intelligence',
      level: 'Advanced',
      duration: '52 Hours',
      durationHours: 52,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
      originalPrice: 8999,
      price: 4499,
      discountPercent: 50,
      isFree: false,
      isFeatured: false,
      badge: 'ADVANCED',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 3200,
      averageRating: 4.95,
      reviewsCount: 512
    }
  })

  // Course 4: Algorithmic Trading with Python
  const courseAlgo = await prisma.course.create({
    data: {
      id: 'course-algo-trading',
      slug: 'algorithmic-trading-python',
      title: 'Quantitative Trading & Algorithmic Execution',
      shortDescription: 'Build backtesting engines, statistical arbitrage strategies, risk models, and WebSocket exchange connections.',
      fullDescription: 'Harness quantitative finance algorithms to backtest high-frequency strategies, compute Sharpe and Sortino ratios, and connect to live financial markets.',
      category: 'Trading',
      level: 'Intermediate to Advanced',
      duration: '40 Hours',
      durationHours: 40,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      originalPrice: 9999,
      price: 4999,
      discountPercent: 50,
      isFree: false,
      isFeatured: false,
      badge: 'FINTECH',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 2150,
      averageRating: 4.82,
      reviewsCount: 340
    }
  })

  // Course 5: Free Intro Course
  const courseFree = await prisma.course.create({
    data: {
      id: 'course-py-intro',
      slug: 'intro-to-python-programming',
      title: 'Introduction to Python & Computational Thinking',
      shortDescription: 'Free foundational workshop on Python syntax, algorithmic logic, functions, and terminal problem-solving.',
      fullDescription: 'Start your coding career completely free. Learn to install Python, run VS Code, write functions, loops, and solve fundamental algorithmic challenges.',
      category: 'Data Science',
      level: 'Beginner',
      duration: '8 Hours',
      durationHours: 8,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      originalPrice: 0,
      price: 0,
      discountPercent: 0,
      isFree: true,
      isFeatured: false,
      badge: 'FREE',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 14200,
      averageRating: 4.92,
      reviewsCount: 2840
    }
  })

  // Course 6: Modern Web & Full-Stack Development
  const courseWeb = await prisma.course.create({
    data: {
      id: 'course-web-dev',
      slug: 'web-fullstack-development',
      title: 'Web & Full-Stack Development',
      shortDescription: 'Master React, Node.js, Express, PostgreSQL, REST APIs, and modern frontend-backend architectures from scratch.',
      fullDescription: 'A complete professional engineering track for modern full-stack development. Build production-ready web applications with React 19, Node.js, Prisma ORM, PostgreSQL, authentication, and state management.',
      category: 'Web Development',
      level: 'Beginner to Advanced',
      duration: '42 Hours',
      durationHours: 42,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&q=80',
      originalPrice: 6999,
      price: 3499,
      discountPercent: 50,
      isFree: false,
      isFeatured: true,
      badge: 'FULL-STACK',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 5200,
      averageRating: 4.9,
      reviewsCount: 740,
      requirements: {
        create: [
          { text: 'A computer with code editor (VS Code recommended)', orderIndex: 1 },
          { text: 'Basic understanding of HTML and JavaScript basics', orderIndex: 2 }
        ]
      },
      learningOutcomes: {
        create: [
          { text: 'Build modular, performant single-page applications with React', orderIndex: 1 },
          { text: 'Design scalable RESTful APIs with Node.js and Express', orderIndex: 2 },
          { text: 'Model relational schemas with PostgreSQL and Prisma ORM', orderIndex: 3 },
          { text: 'Implement JWT authentication and secure session management', orderIndex: 4 }
        ]
      }
    }
  })

  // Course 7: Cloud & MLOps Infrastructure
  const courseCloud = await prisma.course.create({
    data: {
      id: 'course-cloud-devops',
      slug: 'cloud-mlops-infrastructure',
      title: 'Cloud & MLOps Infrastructure',
      shortDescription: 'Containerization with Docker, Kubernetes orchestration, CI/CD pipelines, Terraform, and scalable cloud deployments on AWS.',
      fullDescription: 'Master modern DevOps and MLOps infrastructure. Learn to containerize microservices, deploy distributed clusters on Kubernetes, automate continuous integration, and manage cloud resources as code.',
      category: 'Cloud Computing',
      level: 'Intermediate to Advanced',
      duration: '46 Hours',
      durationHours: 46,
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      originalPrice: 7999,
      price: 3999,
      discountPercent: 50,
      isFree: false,
      isFeatured: false,
      badge: 'DEVOPS & CLOUD',
      status: 'PUBLISHED',
      enrollmentOpen: true,
      certificateEnabled: true,
      studentsCount: 4100,
      averageRating: 4.87,
      reviewsCount: 620,
      requirements: {
        create: [
          { text: 'Basic Linux terminal navigation and shell commands', orderIndex: 1 },
          { text: 'Familiarity with Git and source control workflows', orderIndex: 2 }
        ]
      },
      learningOutcomes: {
        create: [
          { text: 'Build multi-stage Docker containers for microservices', orderIndex: 1 },
          { text: 'Deploy and scale Kubernetes pods, services, and ingress', orderIndex: 2 },
          { text: 'Automate build, test, and release with GitHub Actions CI/CD', orderIndex: 3 },
          { text: 'Provision AWS infrastructure declaratively using Terraform', orderIndex: 4 }
        ]
      }
    }
  })

  console.log('✅ 7 Courses seeded across Data Science, ML, AI, Web, Cloud, and Trading')

  // 3. Assign Creator to Courses
  await prisma.courseCreator.createMany({
    data: [
      { courseId: coursePyds.id, creatorId: creator.id },
      { courseId: coursePyml.id, creatorId: creator.id },
      { courseId: courseAlgo.id, creatorId: creator.id },
      { courseId: courseWeb.id, creatorId: creator.id },
      { courseId: courseCloud.id, creatorId: creator.id }
    ]
  })

  // Playlists for Web Course
  await prisma.playlist.create({
    data: {
      id: 'playlist-web-1',
      courseId: courseWeb.id,
      creatorId: creator.id,
      title: 'Module 1: Modern React & Full-Stack Architecture',
      description: 'Components, hooks, REST APIs, and database modeling.',
      orderIndex: 1,
      status: 'PUBLISHED',
      lessons: {
        create: [
          {
            id: 'lesson-web-1',
            title: '01 Full-Stack Architecture Overview',
            description: 'Client-server protocols, modern web stacks, and API communication.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: '18:40',
            durationSeconds: 1120,
            orderIndex: 1,
            status: 'PUBLISHED',
            isPreview: true
          },
          {
            id: 'lesson-web-2',
            title: '02 React 19 State, Hooks & Context',
            description: 'Managing deterministic application state across components.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: '22:15',
            durationSeconds: 1335,
            orderIndex: 2,
            status: 'PUBLISHED',
            isPreview: false
          }
        ]
      }
    }
  })

  // Playlists for Cloud Course
  await prisma.playlist.create({
    data: {
      id: 'playlist-cloud-1',
      courseId: courseCloud.id,
      creatorId: creator.id,
      title: 'Module 1: Docker Containerization Essentials',
      description: 'Images, layers, volumes, networks, and Docker Compose.',
      orderIndex: 1,
      status: 'PUBLISHED',
      lessons: {
        create: [
          {
            id: 'lesson-cloud-1',
            title: '01 Container Architecture & Docker Fundamentals',
            description: 'Containers vs Virtual Machines, Docker daemon, and image caching.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: '20:10',
            durationSeconds: 1210,
            orderIndex: 1,
            status: 'PUBLISHED',
            isPreview: true
          },
          {
            id: 'lesson-cloud-2',
            title: '02 Kubernetes Pods, Deployments & Services',
            description: 'Orchestrating microservices at scale with declarative YAML manifests.',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: '25:40',
            durationSeconds: 1540,
            orderIndex: 2,
            status: 'PUBLISHED',
            isPreview: false
          }
        ]
      }
    }
  })

  // 4. Seed Playlists and Lessons for course-pyds
  const playlist1 = await prisma.playlist.create({
    data: {
      id: 'playlist-1',
      courseId: coursePyds.id,
      creatorId: creator.id,
      title: 'Module 1: Python Core Foundations',
      description: 'Environment setup, fundamentals, syntax, control flow, and data structures.',
      orderIndex: 1,
      status: 'PUBLISHED',
      lessons: {
        create: [
          {
            id: 'lesson-1',
            creatorId: creator.id,
            title: '01 Introduction to Python 3 & Jupyter Lab',
            description: 'Tour of Python 3 runtime, virtual environments, and interactive Jupyter notebook execution.',
            duration: '18:40',
            durationSeconds: 1120,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            orderIndex: 1,
            isPreview: true,
            isPublicDemo: true,
            status: 'PUBLISHED'
          },
          {
            id: 'lesson-2',
            creatorId: creator.id,
            title: '02 Variables, Data Types & Dynamic Typing',
            description: 'Deep dive into Python primitive types, memory references, garbage collection, and type conversions.',
            duration: '24:15',
            durationSeconds: 1455,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            orderIndex: 2,
            isPreview: true,
            isPublicDemo: false,
            status: 'PUBLISHED'
          },
          {
            id: 'lesson-3',
            creatorId: creator.id,
            title: '03 Lists, Tuples, Dictionaries & Sets',
            description: 'Hash tables under the hood, dictionary comprehensions, tuple packing, and set union operations.',
            duration: '31:10',
            durationSeconds: 1870,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            orderIndex: 3,
            isPreview: false,
            isPublicDemo: false,
            status: 'PUBLISHED'
          }
        ]
      }
    }
  })

  // Set demo lesson ID on Course
  await prisma.course.update({
    where: { id: coursePyds.id },
    data: { demoLessonId: 'lesson-1' }
  })

  const playlist2 = await prisma.playlist.create({
    data: {
      id: 'playlist-2',
      courseId: coursePyds.id,
      creatorId: creator.id,
      title: 'Module 2: High-Performance Computing with NumPy',
      description: 'Strided memory arrays, broadcasting rules, SIMD vectorization, and matrix manipulation.',
      orderIndex: 2,
      status: 'PUBLISHED',
      lessons: {
        create: [
          {
            id: 'lesson-4',
            creatorId: creator.id,
            title: '04 Vectorized Operations & Memory Strides',
            description: 'Understand contiguous memory strides in C-order versus Fortran-order and eliminate slow Python for-loops.',
            duration: '22:50',
            durationSeconds: 1370,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            orderIndex: 1,
            isPreview: false,
            isPublicDemo: false,
            status: 'PUBLISHED'
          },
          {
            id: 'lesson-5',
            creatorId: creator.id,
            title: '05 Broadcasting, Slicing & Boolean Masking',
            description: 'Universal functions (ufuncs), broadcasting dimensions across arrays, and boolean filtering.',
            duration: '27:10',
            durationSeconds: 1630,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            orderIndex: 2,
            isPreview: false,
            isPublicDemo: false,
            status: 'PUBLISHED'
          }
        ]
      }
    }
  })

  // Seed Playlists and Lessons for course-pyml with verification queue items
  const playlistPyml1 = await prisma.playlist.create({
    data: {
      id: 'playlist-pyml-1',
      courseId: coursePyml.id,
      creatorId: creator.id,
      title: 'Module 1: Supervised Learning & Regression',
      description: 'Gradient descent, cost functions, ordinary least squares, and regularized regression.',
      orderIndex: 1,
      status: 'PUBLISHED',
      lessons: {
        create: [
          {
            id: 'lesson-pyml-1',
            creatorId: creator.id,
            title: '01 Linear & Polynomial Regression Mathematics',
            description: 'Analytical derivation of normal equations and convex optimization.',
            duration: '25:00',
            durationSeconds: 1500,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            orderIndex: 1,
            isPreview: true,
            status: 'PUBLISHED'
          },
          {
            id: 'lesson-pyml-2',
            creatorId: creator.id,
            title: '02 Advanced Feature Scaling & Normalization Pipelines',
            description: 'RobustScaler, QuantileTransformer, and preventing data leakage across train-test splits.',
            duration: '22:15',
            durationSeconds: 1335,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            orderIndex: 2,
            isPreview: false,
            status: 'SUBMITTED_FOR_REVIEW' // In Admin Review Queue!
          },
          {
            id: 'lesson-pyml-3',
            creatorId: creator.id,
            title: '03 Cross-Validation & Hyperparameter Tuning with Optuna',
            description: 'Bayesian optimization of model hyperparameters with tree-structured Parzen estimators.',
            duration: '28:40',
            durationSeconds: 1720,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            orderIndex: 3,
            isPreview: false,
            status: 'RETURNED_FOR_EDIT', // Returned for Creator revision!
            adminFeedback: 'Audio contains background electrical hum at 14:20. Please re-export audio track with noise suppression.'
          }
        ]
      }
    }
  })

  // Seed Playlist for course-algo-trading
  const playlistAlgo1 = await prisma.playlist.create({
    data: {
      id: 'playlist-algo-1',
      courseId: courseAlgo.id,
      creatorId: creator.id,
      title: 'Module 1: Real-Time Market Data Ingestion',
      description: 'Exchange WebSocket feeds, order book reconstruction, and tick-by-tick event loops.',
      orderIndex: 1,
      status: 'DRAFT',
      lessons: {
        create: [
          {
            id: 'lesson-algo-1',
            creatorId: creator.id,
            title: '01 WebSocket Live Market Ingestion with asyncio',
            description: 'Handling L2 order book delta snapshots and maintaining local state under low latency.',
            duration: '31:40',
            durationSeconds: 1900,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
            orderIndex: 1,
            isPreview: false,
            status: 'SUBMITTED_FOR_REVIEW' // In Admin Review Queue!
          }
        ]
      }
    }
  })

  console.log('✅ Playlists and Lessons seeded with Published, Submitted, and Returned states')

  // 5. Seed Quizzes with Questions and Options
  const quiz1 = await prisma.quiz.create({
    data: {
      id: 'quiz-1',
      courseId: coursePyds.id,
      lessonId: 'lesson-1',
      title: 'Comprehension Check: Python Runtime & Environments',
      passingScore: 70,
      maxAttempts: 3,
      questions: {
        create: [
          {
            question: 'What is the primary architectural advantage of NumPy arrays over standard Python lists?',
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'Contiguous C-order memory allocation and vectorized SIMD processing', isCorrect: true },
                { optionText: 'Dynamic type polymorphism per individual element', isCorrect: false },
                { optionText: 'Automatic multi-threaded asynchronous garbage collection', isCorrect: false }
              ]
            }
          },
          {
            question: 'When performing data manipulation in Pandas, why are chained transformations preferred over inplace mutations?',
            orderIndex: 2,
            options: {
              create: [
                { optionText: 'They avoid fragmented memory re-allocations and preserve immutable data provenance', isCorrect: true },
                { optionText: 'They automatically convert floating point values to 16-bit integers', isCorrect: false },
                { optionText: 'They execute 50x faster on standard GPUs', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  })

  const quiz4 = await prisma.quiz.create({
    data: {
      id: 'quiz-4',
      courseId: coursePyds.id,
      lessonId: 'lesson-4',
      title: 'NumPy Memory & Broadcasting Assessment',
      passingScore: 70,
      maxAttempts: 3,
      questions: {
        create: [
          {
            question: 'What does the `shape` tuple attribute of a NumPy ndarray represent?',
            orderIndex: 1,
            options: {
              create: [
                { optionText: 'The number of elements along each dimension of the array', isCorrect: true },
                { optionText: 'The total byte size of the allocated memory buffer', isCorrect: false },
                { optionText: 'The memory stride offset between adjacent rows', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('✅ Quizzes seeded with questions and validated correct options')

  // 6. Seed Student Enrollments & Learning Progress
  const enrollmentPyds = await prisma.enrollment.create({
    data: {
      id: `enr-${student.id}-${coursePyds.id}`,
      studentId: student.id,
      courseId: coursePyds.id,
      status: 'ACTIVE',
      progressPercent: 40
    }
  })

  await prisma.enrollment.create({
    data: {
      id: `enr-${student.id}-${coursePyml.id}`,
      studentId: student.id,
      courseId: coursePyml.id,
      status: 'ACTIVE',
      progressPercent: 15
    }
  })

  // Lesson Progress for Rahul
  await prisma.lessonProgress.create({
    data: {
      enrollmentId: enrollmentPyds.id,
      studentId: student.id,
      lessonId: 'lesson-1',
      isCompleted: true,
      watchSeconds: 1120,
      lastPositionSec: 1120,
      completedAt: new Date()
    }
  })

  await prisma.lessonProgress.create({
    data: {
      enrollmentId: enrollmentPyds.id,
      studentId: student.id,
      lessonId: 'lesson-2',
      isCompleted: true,
      watchSeconds: 1455,
      lastPositionSec: 1455,
      completedAt: new Date()
    }
  })

  // Student Note
  await prisma.studentNote.create({
    data: {
      studentId: student.id,
      lessonId: 'lesson-1',
      noteText: 'Key concept: Vectorized operations in NumPy minimize CPU memory overhead and leverage SIMD architecture.'
    }
  })

  // Quiz Attempt
  await prisma.quizAttempt.create({
    data: {
      quizId: quiz1.id,
      studentId: student.id,
      score: 100,
      passed: true
    }
  })

  // 7. Seed Sample Certificate
  await prisma.certificate.create({
    data: {
      certificateCode: 'CERT-PYDS-2026-9042',
      studentId: student.id,
      courseId: coursePyds.id,
      issueDate: new Date('2026-03-10'),
      studentName: 'Rahul Sharma',
      courseTitle: 'Python for Data Science Specialization',
      status: 'VALID',
      verificationUrl: '/certificates?code=CERT-PYDS-2026-9042'
    }
  })

  // Official Sample Reference Certificate matching client format
  await prisma.certificate.create({
    data: {
      certificateCode: 'AVT-2025-001',
      studentId: student.id,
      courseId: coursePyds.id,
      issueDate: new Date('2025-09-26'),
      studentName: 'You',
      courseTitle: 'AI & Emerging Technologies Program',
      status: 'VALID',
      verificationUrl: '/certificates?code=AVT-2025-001'
    }
  })

  // 8. Seed Verified Order
  await prisma.order.create({
    data: {
      id: 'ord-seed-1',
      orderNumber: 'ORD-2026-PYDS-01',
      studentId: student.id,
      courseId: coursePyds.id,
      amount: 2999,
      currency: 'INR',
      razorpayOrderId: 'order_seed_rzp_pyds',
      razorpayPaymentId: 'pay_seed_rzp_pyds',
      razorpaySignature: 'sig_seed_verified_hmac_sha256',
      status: 'SUCCESSFUL'
    }
  })

  // 9. Seed Domain Projects
  await prisma.domainProject.createMany({
    data: [
      {
        id: 'proj-1',
        title: 'Algorithmic High-Frequency Order Book Simulation',
        slug: 'hft-order-book-sim',
        category: 'Quantitative Finance',
        description: 'Construct a microsecond-level limit order book simulator in Python with WebSocket ingestion and market-maker execution models.',
        objective: 'Reconstruct Level 2 order books, compute bid-ask spreads, and simulate market impact of algorithmic orders.',
        tools: 'Python, NumPy, asyncio, WebSockets',
        githubUrl: 'https://github.com/apexlearn/hft-orderbook-sim',
        isFeatured: true,
        orderIndex: 1
      },
      {
        id: 'proj-2',
        title: 'Enterprise RAG Agent with Hybrid Dense-Sparse Retrieval',
        slug: 'enterprise-rag-agent',
        category: 'Artificial Intelligence',
        description: 'Build an end-to-end Retrieval-Augmented Generation agent capable of parsing financial 10-K reports with BM25 + embedding reranking.',
        objective: 'Implement reciprocal rank fusion, vector search, and structured response validation with LangChain and Pydantic.',
        tools: 'Python, PyTorch, FAISS, FastEmbed',
        githubUrl: 'https://github.com/apexlearn/enterprise-rag-agent',
        isFeatured: true,
        orderIndex: 2
      },
      {
        id: 'proj-3',
        title: 'Distributed Multi-GPU Image Segmentation Pipeline',
        slug: 'distributed-gpu-segmentation',
        category: 'Computer Vision',
        description: 'Train a deep U-Net architecture across multiple CUDA nodes with PyTorch Distributed Data Parallel (DDP).',
        objective: 'Benchmark gradient synchronization latency, mixed-precision FP16 training, and memory stride alignment.',
        tools: 'PyTorch, CUDA, TorchVision, Albumentations',
        githubUrl: 'https://github.com/apexlearn/gpu-segmentation-ddp',
        isFeatured: false,
        orderIndex: 3
      },
      {
        id: 'proj-4',
        title: 'Credit Default Risk Assessment with XGBoost & SHAP',
        slug: 'credit-default-risk-shap',
        category: 'Machine Learning',
        description: 'Analyze 500,000 credit records to predict loan default probability, calculate Shapley attribution values, and explain risk drivers.',
        objective: 'Handle imbalanced datasets with SMOTE, optimize ROC-AUC, and generate human-interpretable feature attribution dashboards.',
        tools: 'Scikit-Learn, XGBoost, SHAP, LightGBM',
        githubUrl: 'https://github.com/apexlearn/credit-default-risk',
        isFeatured: true,
        orderIndex: 4
      }
    ]
  })

  // 10. Seed Live Sessions
  await prisma.liveSession.createMany({
    data: [
      {
        id: 'live-1',
        title: 'Live Architecture Workshop: Building High-Throughput Streaming ML Pipelines',
        description: 'Live interactive coding masterclass on connecting Kafka brokers to PyTorch inference microservices.',
        instructorName: 'Dr. Alex Rivera',
        scheduledAt: new Date(Date.now() + 86400000 * 2), // 2 days from now
        durationMinutes: 120,
        meetingUrl: 'https://meet.google.com/apex-ml-live',
        status: 'UPCOMING'
      },
      {
        id: 'live-2',
        title: 'Weekend Live Debugging: Asynchronous WebSockets & Low-Latency Python',
        description: 'Real-time performance profiling with cProfile and tackling GIL bottlenecks.',
        instructorName: 'Dr. Vikram Sen',
        scheduledAt: new Date(Date.now() + 86400000 * 5), // 5 days from now
        durationMinutes: 90,
        meetingUrl: 'https://meet.google.com/apex-python-live',
        status: 'UPCOMING'
      }
    ]
  })

  // 11. Seed Support Ticket
  await prisma.supportTicket.create({
    data: {
      id: 'ticket-1',
      studentId: student.id,
      subject: 'NumPy broadcasting matrix dimension error in Lesson 4',
      message: 'When attempting to broadcast array of shape (3, 1) across (3, 4), getting ValueError. Can you clarify trailing dimension rules?',
      priority: 'MEDIUM',
      status: 'OPEN',
      replies: {
        create: [
          {
            userId: admin.id,
            message: 'In NumPy broadcasting, trailing axes must either have equal dimension or one of them must be 1. (3, 1) and (3, 4) matches along axis 0 and expands axis 1.'
          }
        ]
      }
    }
  })

  // 12. Seed Creator Profile Change Request
  const profile = await prisma.creatorProfile.findUnique({ where: { userId: creator.id } })
  if (profile) {
    await prisma.profileChangeRequest.create({
      data: {
        creatorProfileId: profile.id,
        requestedHeadline: 'Distinguished Fellow in AI & Large Language Models',
        requestedBio: 'Pioneered reinforcement learning from human feedback (RLHF) and production AI alignment systems over 14 years.',
        supportingUrl: 'https://linkedin.com/in/alex-rivera-ai-fellow',
        status: 'PENDING'
      }
    })
  }

  // 13. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'COURSE_PUBLISHED',
        entityType: 'Course',
        entityId: coursePyds.id,
        details: 'Admin Dr. Vikram Sen published Python for Data Science to the catalog.',
        ipAddress: '127.0.0.1'
      },
      {
        userId: creator.id,
        action: 'VIDEO_SUBMITTED',
        entityType: 'Lesson',
        entityId: 'lesson-pyml-2',
        details: 'Creator Dr. Alex Rivera submitted lesson 02 for admin review.',
        ipAddress: '127.0.0.1'
      }
    ]
  })

  // 14. Seed Notifications for Student
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: '🎉 Welcome to ApexLearn!',
        message: 'Your student account is active. Explore your enrolled courses and commence Module 1.',
        linkUrl: '/student/courses',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        userId: student.id,
        title: '📚 New Module Released',
        message: 'Module 2: Pandas Data Wrangling & Pipelines is now live for Python for Data Science.',
        linkUrl: '/student/courses',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000 * 18)
      },
      {
        userId: student.id,
        title: '🏆 Verified Certificate Ready',
        message: 'Congratulations! Your certificate CERT-PYDS-2026-9042 has been verified and issued.',
        linkUrl: '/student/certificates',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        userId: student.id,
        title: '🗓️ Upcoming Live Weekend Cohort',
        message: 'Join Dr. Vikram Sen this Saturday for Live Debugging: Asynchronous WebSockets.',
        linkUrl: '/live-sessions',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000 * 3)
      }
    ]
  })

  // 17. Seed Public About Page Content & Leadership
  const { defaultAboutData } = await import('../src/data/defaultAboutData.js')
  await prisma.platformSetting.upsert({
    where: { key: 'about_page_content' },
    update: { value: JSON.stringify(defaultAboutData) },
    create: {
      key: 'about_page_content',
      value: JSON.stringify(defaultAboutData),
      description: 'Public About Page & Leadership details'
    }
  })

  console.log('✅ Seed completed successfully with full relational integrity!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

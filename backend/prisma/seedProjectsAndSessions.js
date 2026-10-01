import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Project Categories, Domain Projects, and Live Sessions...')

  // 1. Project Categories
  const categoriesData = [
    {
      name: 'Generative AI',
      slug: 'genai',
      description: 'Autonomous agents, LLM orchestration, RAG architectures, and synthetic data generation.',
      orderIndex: 0,
      isActive: true
    },
    {
      name: 'Computer Vision',
      slug: 'vision',
      description: 'Industrial defect detection, TensorRT edge inference, and multi-camera streaming.',
      orderIndex: 1,
      isActive: true
    },
    {
      name: 'Full-Stack AI',
      slug: 'fullstack',
      description: 'Distributed accounting engines, microservices, asynchronous WebSockets, and FinTech integrations.',
      orderIndex: 2,
      isActive: true
    },
    {
      name: 'Cloud & MLOps',
      slug: 'cloud',
      description: 'Kubernetes autoscaling, vLLM serving clusters, Prometheus observability, and CI/CD pipelines.',
      orderIndex: 3,
      isActive: true
    }
  ]

  const categoryMap = {}
  for (const cat of categoriesData) {
    const upserted = await prisma.projectCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        orderIndex: cat.orderIndex,
        isActive: cat.isActive
      },
      create: cat
    })
    categoryMap[cat.slug] = upserted
    console.log(`✅ Category: ${upserted.name} (${upserted.slug})`)
  }

  // 2. Domain Projects
  const projectsData = [
    {
      id: 'proj-1',
      title: 'Autonomous Multi-Agent AI Workflow Engine',
      slug: 'autonomous-multi-agent-workflow-engine',
      category: 'genai',
      categoryLabel: 'Generative AI',
      categoryId: categoryMap['genai']?.id,
      difficulty: 'Advanced',
      duration: '4 Weeks',
      badge: 'Capstone Project',
      description: 'Build a distributed asynchronous multi-agent orchestrator utilizing LangGraph, vector stores, and tool execution pipelines.',
      detailedDescription: 'Build an enterprise-scale distributed agent orchestrator connecting LangGraph state machines with Redis message queues and PostgreSQL state persistence.',
      architecture: 'Event-driven pub/sub architecture connecting LangGraph state machines with Redis message queues and PostgreSQL state persistence.',
      tools: 'Python, LangChain, FastAPI, PostgreSQL, Docker',
      tags: JSON.stringify(['Python', 'LangChain', 'FastAPI', 'PostgreSQL', 'Docker']),
      deliverables: JSON.stringify([
        'Self-healing agent loop with automatic retry logic',
        'Dynamic tool execution sandbox with isolated runtime',
        'Production telemetry and token cost observability dashboard',
        'Full CI/CD automated test harness'
      ]),
      architectureUrl: 'https://github.com/aivortex-ai/agentic-orchestrator',
      githubUrl: 'https://github.com/aivortex-ai/agentic-orchestrator',
      demoUrl: 'https://agents-demo.aivortex.edu',
      thumbnailUrl: null,
      ctaText: 'View Architecture & Code',
      orderIndex: 0,
      status: 'PUBLISHED',
      isEnabled: true,
      isFeatured: true
    },
    {
      id: 'proj-2',
      title: 'Enterprise RAG System with Hybrid Vector Search',
      slug: 'enterprise-rag-hybrid-vector-search',
      category: 'genai',
      categoryLabel: 'Generative AI',
      categoryId: categoryMap['genai']?.id,
      difficulty: 'Intermediate',
      duration: '3 Weeks',
      badge: 'Industry Standard',
      description: 'High-throughput document retrieval system combining BM25 sparse keyword search and dense embedding re-ranking.',
      detailedDescription: 'High-throughput enterprise document retrieval system combining BM25 sparse keyword search, dense embedding re-ranking, and citation provenance.',
      architecture: 'Dual-path retrieval with late interaction ColBERT embeddings and reciprocal rank fusion for 99.4% context precision.',
      tools: 'Python, Pinecone, Cohere Rerank, React, TypeScript',
      tags: JSON.stringify(['Python', 'Pinecone', 'Cohere Rerank', 'React', 'TypeScript']),
      deliverables: JSON.stringify([
        'Automated PDF, DOCX, and markdown chunking parser',
        'Contextual compression and reranking layer',
        'Hallucination prevention guardrails using TruLens',
        'Interactive chat UI with cited document viewer'
      ]),
      architectureUrl: 'https://github.com/aivortex-ai/enterprise-rag-engine',
      githubUrl: 'https://github.com/aivortex-ai/enterprise-rag-engine',
      demoUrl: 'https://rag-demo.aivortex.edu',
      thumbnailUrl: null,
      ctaText: 'View Architecture & Code',
      orderIndex: 1,
      status: 'PUBLISHED',
      isEnabled: true,
      isFeatured: true
    },
    {
      id: 'proj-3',
      title: 'Real-time Edge Vision Quality Inspection',
      slug: 'real-time-edge-vision-inspection',
      category: 'vision',
      categoryLabel: 'Computer Vision',
      categoryId: categoryMap['vision']?.id,
      difficulty: 'Advanced',
      duration: '4 Weeks',
      badge: 'Hardware Accelerated',
      description: 'Sub-millisecond industrial defect detection deployed on edge accelerators using YOLOv10 and TensorRT optimization.',
      detailedDescription: 'Industrial manufacturing defect detection deployed on edge accelerators with CUDA acceleration and automated camera capture.',
      architecture: 'Pipeline model: GStreamer capture stream -> TensorRT FP16 engine -> CUDA post-processing -> WebSocket alert stream.',
      tools: 'PyTorch, TensorRT, OpenCV, C++, NVIDIA Jetson',
      tags: JSON.stringify(['PyTorch', 'TensorRT', 'OpenCV', 'C++', 'NVIDIA Jetson']),
      deliverables: JSON.stringify([
        'Custom dataset annotation and synthetic augmentation pipeline',
        'INT8 quantization reducing latency to 4.2ms',
        'Industrial camera trigger synchronization daemon',
        'Real-time web monitoring console with defect heatmaps'
      ]),
      architectureUrl: 'https://github.com/aivortex-ai/edge-vision-inspection',
      githubUrl: 'https://github.com/aivortex-ai/edge-vision-inspection',
      demoUrl: null,
      thumbnailUrl: null,
      ctaText: 'View Architecture & Code',
      orderIndex: 2,
      status: 'PUBLISHED',
      isEnabled: true,
      isFeatured: false
    },
    {
      id: 'proj-4',
      title: 'High-Frequency FinTech Payment Reconciliation Engine',
      slug: 'fintech-payment-reconciliation-engine',
      category: 'fullstack',
      categoryLabel: 'Full-Stack & Cloud',
      categoryId: categoryMap['fullstack']?.id,
      difficulty: 'Intermediate',
      duration: '3 Weeks',
      badge: 'High Reliability',
      description: 'Distributed transactional accounting ledger with idempotency keys, dual-entry reconciliation, and webhook dispatch.',
      detailedDescription: 'Distributed transactional accounting ledger with idempotency keys, dual-entry reconciliation, and webhook cryptographic validation.',
      architecture: 'ACID transaction boundary with optimistic locking and distributed locks via Redlock.',
      tools: 'Node.js, PostgreSQL, Prisma, Razorpay, Redis',
      tags: JSON.stringify(['Node.js', 'PostgreSQL', 'Prisma', 'Razorpay', 'Redis']),
      deliverables: JSON.stringify([
        'Zero-loss double-entry balance bookkeeping model',
        'Idempotent webhook listener with replay-attack protection',
        'Automated daily bank statement discrepancy auditor',
        'Exportable financial audit reporting suite'
      ]),
      architectureUrl: 'https://github.com/aivortex-ai/fintech-payment-engine',
      githubUrl: 'https://github.com/aivortex-ai/fintech-payment-engine',
      demoUrl: null,
      thumbnailUrl: null,
      ctaText: 'View Architecture & Code',
      orderIndex: 3,
      status: 'PUBLISHED',
      isEnabled: true,
      isFeatured: false
    },
    {
      id: 'proj-5',
      title: 'Kubernetes Cloud-Native AI Model Serving Cluster',
      slug: 'kubernetes-cloud-native-ai-serving',
      category: 'cloud',
      categoryLabel: 'Cloud & MLOps',
      categoryId: categoryMap['cloud']?.id,
      difficulty: 'Advanced',
      duration: '4 Weeks',
      badge: 'Production Scale',
      description: 'Autoscaling LLM inferencing cluster on AWS EKS with vLLM, spot instance interruption handling, and Prometheus metrics.',
      detailedDescription: 'Autoscaling LLM inferencing cluster on AWS EKS with vLLM, spot instance interruption handling, and Prometheus metrics.',
      architecture: 'HPA autoscaler driven by queue depth metrics, directing traffic through Envoy gateway with continuous health probes.',
      tools: 'Kubernetes, AWS EKS, Terraform, Prometheus, vLLM',
      tags: JSON.stringify(['Kubernetes', 'AWS EKS', 'Terraform', 'Prometheus', 'vLLM']),
      deliverables: JSON.stringify([
        'Complete Terraform infrastructure-as-code repository',
        'Custom Prometheus exporters for GPU memory & KV cache metrics',
        'Canary deployment controller for zero-downtime model updates',
        'Cost optimization policy reducing idle compute expenditure by 65%'
      ]),
      architectureUrl: 'https://github.com/aivortex-ai/k8s-ai-model-serving',
      githubUrl: 'https://github.com/aivortex-ai/k8s-ai-model-serving',
      demoUrl: null,
      thumbnailUrl: null,
      ctaText: 'View Architecture & Code',
      orderIndex: 4,
      status: 'PUBLISHED',
      isEnabled: true,
      isFeatured: true
    }
  ]

  for (const proj of projectsData) {
    const existing = await prisma.domainProject.findFirst({
      where: { OR: [{ id: proj.id }, { slug: proj.slug }] }
    })

    if (existing) {
      await prisma.domainProject.update({
        where: { id: existing.id },
        data: proj
      })
      console.log(`🔄 Updated Project: ${proj.title}`)
    } else {
      await prisma.domainProject.create({
        data: proj
      })
      console.log(`✅ Created Project: ${proj.title}`)
    }
  }

  // 3. Live Sessions
  // Let scheduledAt be upcoming weekend dates
  const nextSat = new Date()
  nextSat.setDate(nextSat.getDate() + ((6 - nextSat.getDay() + 7) % 7 || 7))
  nextSat.setHours(18, 0, 0, 0)

  const nextSun = new Date(nextSat)
  nextSun.setDate(nextSun.getDate() + 1)
  nextSun.setHours(11, 0, 0, 0)

  const followingSat = new Date(nextSat)
  followingSat.setDate(followingSat.getDate() + 7)
  followingSat.setHours(17, 0, 0, 0)

  const sessionsData = [
    {
      id: 'live-1',
      title: 'Deploying DeepSeek & Llama-3 at Enterprise Scale with vLLM',
      slug: 'deploying-deepseek-llama3-vllm',
      sessionDate: nextSat.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      scheduledAt: nextSat,
      startTime: '6:00 PM',
      endTime: '8:30 PM',
      timezone: 'IST',
      duration: '2.5 Hours',
      durationMinutes: 150,
      speakerName: 'Dr. Anand Ramanathan',
      instructorName: 'Dr. Anand Ramanathan',
      speakerRole: 'Principal AI Architect, Ex-Meta AI',
      speakerPhoto: null,
      totalSeats: 50,
      registeredSeats: 36, // 14 seats left
      shortDescription: 'Deep architectural dive into KV cache memory management, PagedAttention internals, and tensor parallelism across multi-GPU clusters.',
      detailedDescription: 'Learn to deploy large-parameter open weights foundation models in high-concurrency production setups with vLLM and TensorRT-LLM.',
      description: 'Deep architectural dive into KV cache memory management, PagedAttention internals, and tensor parallelism across multi-GPU clusters.',
      agenda: JSON.stringify([
        'KV Cache memory management and PagedAttention internals',
        'Continuous batching benchmarks vs standard HuggingFace pipelines',
        'Configuring multi-GPU tensor parallelism on AWS A100 clusters',
        'Live Q&A and code architecture walk-through'
      ]),
      tags: JSON.stringify(['Inference Optimization', 'vLLM', 'GPU Kernels']),
      ctaText: 'RSVP for Free Live Masterclass',
      meetingUrl: 'https://meet.google.com/aiv-masterclass-vllm',
      isRegistrationOpen: true,
      orderIndex: 0,
      status: 'UPCOMING'
    },
    {
      id: 'live-2',
      title: 'Building Production Agentic Swarms with LangGraph',
      slug: 'building-production-agentic-swarms-langgraph',
      sessionDate: nextSun.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      scheduledAt: nextSun,
      startTime: '11:00 AM',
      endTime: '1:30 PM',
      timezone: 'IST',
      duration: '2.5 Hours',
      durationMinutes: 150,
      speakerName: 'Meera Deshmukh',
      instructorName: 'Meera Deshmukh',
      speakerRole: 'Head of GenAI Research, Vortex Labs',
      speakerPhoto: null,
      totalSeats: 40,
      registeredSeats: 32, // 8 seats left
      shortDescription: 'Graph state schema design, human-in-the-loop interruption mechanisms, and persistence checkpointers with PostgreSQL.',
      detailedDescription: 'Hands-on architectural masterclass building reliable stateful multi-agent systems that handle tool errors and human approvals gracefully.',
      description: 'Graph state schema design, human-in-the-loop interruption mechanisms, and persistence checkpointers with PostgreSQL.',
      agenda: JSON.stringify([
        'Graph state schema design and conditional routing',
        'Human-in-the-loop interruption mechanics for critical approvals',
        'Persistence checkpointers with PostgreSQL transactions',
        'Production debugging and observability using LangSmith'
      ]),
      tags: JSON.stringify(['LangGraph', 'Stateful Agents', 'Human-in-the-Loop']),
      ctaText: 'RSVP for Free Live Masterclass',
      meetingUrl: 'https://meet.google.com/aiv-masterclass-agents',
      isRegistrationOpen: true,
      orderIndex: 1,
      status: 'UPCOMING'
    },
    {
      id: 'live-3',
      title: 'FinTech Payment Gateways & Microservices Architecture',
      slug: 'fintech-payment-gateways-microservices',
      sessionDate: followingSat.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
      scheduledAt: followingSat,
      startTime: '5:00 PM',
      endTime: '7:30 PM',
      timezone: 'IST',
      duration: '2.5 Hours',
      durationMinutes: 150,
      speakerName: 'Karthik Subramanian',
      instructorName: 'Karthik Subramanian',
      speakerRole: 'VP of Engineering, Apex Systems',
      speakerPhoto: null,
      totalSeats: 50,
      registeredSeats: 28, // 22 seats left
      shortDescription: 'Cryptographic HMAC signature verification, idempotent payment processing, and distributed reconciliation pipelines.',
      detailedDescription: 'Live code review and architecture debugging for production payments infrastructure handling millions of transactions.',
      description: 'Cryptographic HMAC signature verification, idempotent payment processing, and distributed reconciliation pipelines.',
      agenda: JSON.stringify([
        'Cryptographic HMAC signature verification and webhook security',
        'Idempotent payment processing preventing double-billing',
        'High-throughput reconciliation batch pipelines',
        'Live code review and architecture debugging'
      ]),
      tags: JSON.stringify(['Razorpay', 'Idempotency', 'Event Sourcing']),
      ctaText: 'RSVP for Free Live Masterclass',
      meetingUrl: 'https://meet.google.com/aiv-masterclass-fintech',
      isRegistrationOpen: true,
      orderIndex: 2,
      status: 'UPCOMING'
    }
  ]

  for (const s of sessionsData) {
    const existing = await prisma.liveSession.findFirst({
      where: { OR: [{ id: s.id }, { slug: s.slug }] }
    })

    if (existing) {
      await prisma.liveSession.update({
        where: { id: existing.id },
        data: s
      })
      console.log(`🔄 Updated Live Session: ${s.title}`)
    } else {
      await prisma.liveSession.create({
        data: s
      })
      console.log(`✅ Created Live Session: ${s.title}`)
    }
  }

  console.log('🎉 Project Categories, Domain Projects, and Live Sessions seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

# ApexLearn — Enterprise Online Course & LMS Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%7C%20Vite-blue.svg)]()
[![Backend](https://img.shields.io/badge/backend-Express%20%7C%20Node.js-green.svg)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20Prisma%206-indigo.svg)]()
[![Docker](https://img.shields.io/badge/docker-NONE%20(Pure%20Native)-red.svg)]()
[![Firebase](https://img.shields.io/badge/firebase-NONE%20(0%25%20Dependencies)-red.svg)]()

Production-grade, dynamic online course platform converted from client-approved static designs with zero visual regressions. Implements real PostgreSQL database persistence, backend-enforced RBAC (Admin, Creator, Student), Razorpay payment verification, AWS S3 presigned video security, single active video session enforcement, and automated certificate issuance.

---

## 🏛️ System Architecture

```
project_aivortex/
├── frontend/                     # React 19 + Vite + React Router v7
│   ├── src/
│   │   ├── components/           # Public sections, modals, cards, learning player
│   │   │   ├── public/           # Navbar, Footer, Hero, Catalog, Projects, Sessions, etc.
│   │   │   └── modals/           # CourseDetail, Video, Payment, Auth, Project, CertVerify
│   │   ├── layouts/              # PublicLayout, AuthLayout, DashboardLayout
│   │   ├── pages/                # Categorized by Role
│   │   │   ├── public/           # Home, Courses, Projects, LiveSessions, CertVerify, About, Contact, FAQ, Terms, Privacy
│   │   │   ├── student/          # Dashboard, LearningPlayer, Login, Signup
│   │   │   ├── creator/          # Dashboard, Playlists, Upload, Submissions, Profile, Login
│   │   │   └── admin/            # Dashboard, Creators, Students, Courses, Playlists, Verification, Payments, Audit
│   │   ├── routes/               # AppRoutes.jsx, ProtectedRoute.jsx (RBAC Guard)
│   │   ├── services/             # Axios API client with interceptors
│   │   ├── hooks/                # useAuth, useToast
│   │   ├── utils/                # Formatters, Constants
│   │   ├── styles/               # Preserved client-approved CSS (variables, main, components, dashboard, auth)
│   │   ├── contexts/             # AuthContext, ToastContext
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
├── backend/                      # Node.js + Express REST API (ES Modules)
│   ├── src/
│   │   ├── config/               # Prisma client, Database connection, Environment variables
│   │   ├── controllers/          # Auth, Public, Student, Creator, Admin, Payment, Video, Assessment, Notifications
│   │   ├── middleware/           # RBAC authMiddleware, ErrorHandler, RateLimiter, Validator
│   │   ├── routes/               # Modular REST endpoints
│   │   ├── services/             # PaymentService (Razorpay), S3Service (AWS), EmailService (SMTP)
│   │   ├── repositories/         # User, Course, Enrollment, Audit repositories
│   │   ├── modules/              # 18 Domain modules (auth, users, students, creators, courses, payments, etc.)
│   │   ├── validators/           # Zod schemas for input validation
│   │   ├── tests/                # Automated End-to-End API test suite
│   │   ├── app.js                # Express app setup, Helmet, CORS, Route mounting
│   │   └── server.js             # HTTP server entry
│   ├── prisma/
│   │   ├── schema.prisma         # 31 Normalized PostgreSQL models
│   │   ├── migrations/           # Versioned SQL migrations (20260926000000_init)
│   │   └── seed.js               # Dev seed generator
│   ├── .env.example
│   └── package.json
│
└── package.json                  # Root runner script
```

---

## 🚫 Critical Constraints Complied

1. **ABSOLUTELY NO DOCKER**: Runs directly on native Node.js and PostgreSQL. No Dockerfile, docker-compose, or container dependency.
2. **ZERO FIREBASE**: 100% eradicated. No Firebase SDKs, configuration, or imports exist in the active codebase.
3. **ZERO MOCK / LOCALSTORAGE IN PRODUCTION**: Relies on Prisma ORM and PostgreSQL transactions. No static array mutations as source of truth.
4. **100% DESIGN PRESERVATION**: All approved CSS variables, color palettes, micro-interactions, responsive grids, and typography are retained without alteration.

---

## 🔑 Default Credentials (Development / Evaluation)

| Role | Portal URL | Email | Password |
|---|---|---|---|
| **Admin** | `http://localhost:5173/admin/login` | `director@apexlearn.edu` | `adminSecret2026` |
| **Creator** | `http://localhost:5173/creator/login` | `creator@apexlearn.edu` | `creator123` |
| **Student** | `http://localhost:5173/student/login` | `rahul.sharma@example.com` | `student123` |

*Note: New students can also register immediately via the public signup page.*

---

## 🚀 Quick Start Guide (Native Node.js & PostgreSQL)

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **npm**: v9+
- **PostgreSQL**: Installed and running locally on port 5432 (or a remote PostgreSQL connection string)

### 2. Environment Configuration
Create `.env` inside `backend/`:
```bash
cp backend/.env.example backend/.env
```
Ensure `DATABASE_URL` matches your local PostgreSQL connection:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/apexlearn_db?schema=public"
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=apexlearn_super_secure_jwt_secret_key_2026_dev
```

### 3. Database Migration & Seeding
From the `backend/` directory:
```bash
# Apply migrations to PostgreSQL
npx prisma migrate deploy

# Seed initial admin, creators, students, courses, playlists, and lessons
node prisma/seed.js
```

### 4. Running the Application

In **Terminal 1** (Backend API):
```bash
cd backend
npm run dev
# Starts backend at http://localhost:3001
```

In **Terminal 2** (Frontend Client):
```bash
cd frontend
npm run dev
# Starts Vite dev server at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

ApexLearn includes a comprehensive native test runner suite verifying:
- API Health & Diagnostics
- Public Catalog & Offers
- Student Authentication & JWT Cookie Session
- Role-Based Access Control (RBAC 403 Forbidden enforcement)
- Admin Statistics & Platform Overview
- Real Razorpay Order Generation
- Cryptographic Signature Verification & Dynamic Enrollment
- Single-Active Video Session & Anti-Piracy Watermarking
- Dynamic Assessment Quiz Grading
- Verifiable Certificate Issuance

To run the test suite:
```bash
cd backend
npm test
```

Expected output:
```
✔ 1. System Health & Diagnostics Endpoint (/health and /api/health)
✔ 2. Public Catalog API returns published courses with active offers
✔ 3. Student Authentication & JWT Token Issuance
✔ 4. RBAC: Student token is strictly rejected from Admin endpoints (403 Forbidden)
✔ 5. Admin Authentication & Dynamic Metrics Overview
✔ 6. Razorpay Order Creation calculates real amount and issues cryptographic order id
✔ 7. Razorpay Signature Verification & Dynamic Course Enrollment
✔ 8. Single-Active Video Session Enforcement & Anti-Piracy Watermarking
✔ 9. Assessment: Dynamic Lesson Quiz Submission and Score Computation
✔ 10. Certificates: Verifiable Credential Generation with Unique Serial ID
ℹ tests 10 | pass 10 | fail 0
```

---

## 🔐 Core Security & Business Logic

### 1. Video Access Protection & Concurrency Enforcement
- **Storage**: AWS S3 private bucket. Videos are never exposed as public static URLs.
- **Signed URLs**: Backend generates 2-hour pre-signed streaming URLs only after verifying active student enrollment.
- **Single Active Session**: Playing a video invalidates any earlier streaming session for that student account, stopping account sharing.
- **Dynamic Watermark**: Video streams return a dynamic payload including the student's name, email, IP, and timestamp to deter screen recordings.

### 2. Video State Machine
```
[CREATOR UPLOADS] ──> UPLOADED ──> [ADMIN REVIEWS] ──┬──> APPROVED ──> [ADMIN PUBLISHES] ──> PUBLISHED
                                                     │
                                                     └──> RETURNED (Feedback given -> Creator corrects & resubmits)
```

### 3. Razorpay Payment Verification
- Server calculates price dynamically taking active discount offers into account.
- Order is registered with Razorpay and stored in `orders` table.
- When client submits payment signature, backend computes:
  ```javascript
  crypto.createHmac('sha256', secret).update(orderId + '|' + paymentId).digest('hex')
  ```
- If valid, enrollment is activated transactionally and an invoice email is dispatched via SMTP.

### 4. Sequential Learning & Assessments
- Lessons unlock sequentially.
- If a lesson requires a quiz, next lesson remains locked until student scores $\ge 70\%$.
- 100% course completion triggers database-validated certificate issuance with serial `CERT-[COURSE]-2026-[RANDOM]`.

---

## 📄 License & Attribution
Developed for ApexLearn Institute of Tech & AI. Proprietary and confidential.

# ApexLearn — Enterprise Online Course & LMS Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%7C%20Vite-blue.svg)]()
[![Backend](https://img.shields.io/badge/backend-Express%20%7C%20Node.js-green.svg)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20Prisma%206-indigo.svg)]()
[![Docker](https://img.shields.io/badge/docker-NONE%20(Pure%20Native)-red.svg)]()
[![Firebase](https://img.shields.io/badge/firebase-NONE%20(0%25%20Dependencies)-red.svg)]()

Production-grade, dynamic enterprise online course platform converted from client-approved static designs with zero visual regressions. Implements real PostgreSQL database persistence, backend-enforced RBAC (Admin, Creator, Student), Razorpay payment verification, AWS S3 presigned video security, single active video session enforcement, and automated certificate issuance.

---

## System Architecture

```
aivortex/
├── frontend/                     # React 19 + Vite + React Router v7
│   ├── src/
│   │   ├── components/           # Public sections, modals, cards, learning player
│   │   │   ├── public/           # Navbar, Footer, Hero, Catalog, Projects, Sessions, etc.
│   │   │   ├── common/           # StatusBadge, ErrorBoundary, Modal, Toast
│   │   │   └── modals/           # CourseDetail, Video, Payment, Auth, Project, CertVerify
│   │   ├── layouts/              # PublicLayout, AuthLayout, DashboardLayout
│   │   ├── pages/                # Categorized by Role
│   │   │   ├── public/           # Home, Courses, Projects, LiveSessions, CertVerify, About, Contact, FAQ, Terms, Privacy
│   │   │   ├── student/          # Dashboard, LearningPlayer, Login, Signup
│   │   │   ├── creator/          # Dashboard, Playlists, Upload, Submissions, Profile, Login
│   │   │   └── admin/            # Dashboard, Creators, Students, Courses, Playlists, Verification, Payments, Audit
│   │   ├── routes/               # AppRoutes.jsx (React.lazy code splitting), ProtectedRoute.jsx (RBAC Guard)
│   │   ├── services/             # Axios API client with interceptors
│   │   ├── hooks/                # useAuth, useToast
│   │   ├── utils/                # Formatters, Constants
│   │   ├── styles/               # Enterprise CSS Design System (variables, main, components, dashboard, auth)
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
│   │   ├── routes/               # Modular REST endpoints (health, auth, public, student, creator, admin, payment, media)
│   │   ├── services/             # PaymentService (Razorpay), S3Service (AWS), EmailService (SMTP)
│   │   ├── utils/                # AppError, ResponseWrapper, Formatters
│   │   ├── validators/           # Zod payload schemas
│   │   ├── app.js                # Express Application Configuration
│   │   └── server.js             # HTTP Server Bootstrap
│   ├── prisma/
│   │   ├── schema.prisma         # Relational schema (PostgreSQL)
│   │   ├── migrations/           # Version-controlled SQL migrations
│   │   └── seedPhase0.js         # Deterministic Phase 0 seed script
│   └── package.json
```

---

## Critical Constraints Complied

1. **ABSOLUTELY NO DOCKER**: Runs directly on native Node.js and PostgreSQL. No Dockerfile, docker-compose, or container dependency.
2. **ZERO FIREBASE**: 100% eradicated. No Firebase SDKs, configuration, or imports exist in the active codebase.
3. **ZERO MOCK / LOCALSTORAGE IN PRODUCTION**: Relies on Prisma ORM and PostgreSQL transactions. No static array mutations as source of truth.
4. **100% DESIGN PRESERVATION & ENTERPRISE DESIGN SYSTEM**: Section 5.1 enterprise color tokens, 8-pt spacing, WCAG 2.2 AA focus rings, and restrained radii.
5. **ZERO EMOJI POLICY**: Strictly enforced across all code, UI, logs, tests, seed data, and documentation.

---

## Default Evaluation Credentials (Seeded Accounts)

All accounts are deterministically pre-seeded in the database via `npm run prisma:seed`. Direct 1-click bypass login is strictly disabled to enforce authentic, end-to-end credential verification through real bcrypt password validation.

### Primary Role Accounts

| Role | Name | Email | Password | Primary Portal URL |
|---|---|---|---|---|
| **Platform Administrator** | Dr. Vikram Sen | `director@apexlearn.edu` | `adminSecret2026` | `http://localhost:5173/admin/login` |
| **Lead AI Instructor** | Dr. Alex Rivera | `alex.rivera@creator.apexlearn.edu` | `creator123` | `http://localhost:5173/creator/login` |
| **Full Stack Instructor** | Sarah Jenkins | `sarah.jenkins@creator.apexlearn.edu` | `creator123` | `http://localhost:5173/creator/login` |
| **Data Science Instructor** | Michael Chen | `michael.chen@creator.apexlearn.edu` | `creator123` | `http://localhost:5173/creator/login` |
| **Enrolled Student (Cert Holder)** | Rahul Sharma | `rahul.sharma@student.apexlearn.edu` | `student123` | `http://localhost:5173/student/login` |
| **Enrolled Student (Active)** | Ananya Patel | `ananya.patel@student.apexlearn.edu` | `student123` | `http://localhost:5173/student/login` |
| **Enrolled Student (Cert Holder)** | David Kim | `david.kim@student.apexlearn.edu` | `student123` | `http://localhost:5173/student/login` |

*Note: New students may also register an active account anytime at `http://localhost:5173/register`.*

---

## Quick Start Guide (Native Node.js & PostgreSQL)

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
COOKIE_SECRET=apexlearn_cookie_secret_key_2026_dev
```

### 3. Database Migration & Seeding
From the `backend/` directory:
```bash
# Apply version-controlled migrations
npx prisma migrate deploy

# Seed deterministic Phase 0 dataset
npm run prisma:seed
```

### 4. Running the Application

In **Terminal 1** (Backend API):
```bash
cd backend
npm start
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

## Quality Assurance & Verification Status

ApexLearn has completed all automated remediation phases (Phases 0 through 6) with 100% test pass rate across 197 automated test cases:
- **Phase 1 (Security / Media / API):** 21 / 21 verified
- **Phase 2 (Authority / Publishing / Commercial):** 29 / 29 verified
- **Phase 3 (Student Learning / Video / Progress):** 30 / 30 verified
- **Phase 4 (Admin / Public / Financial Governance):** 63 / 63 verified
- **Phase 5 (Enterprise UI/UX / Design System / Bundle):** 16 / 16 verified
- **Phase 6 (Final Production Audit & Security):** 38 / 38 verified
- **Combined Audit:** 197 / 197 verified passing

In accordance with project transition protocols, automated test artifacts have been cleaned up and the platform is handed off for **Manual QA Evaluation**.

Refer to:
- `PHASE_6_FINAL_PRODUCTION_AUDIT.md` for complete technical audit results
- `MANUAL_QA_HANDOFF.md` for manual QA handoff checklist and verification procedures

---

## Core Security & Business Logic

### 1. Video Access Protection & Concurrency Enforcement
- **Storage**: AWS S3 private bucket (or protected local fallback). Videos are never exposed as public static URLs.
- **Signed URLs**: Backend generates 2-hour pre-signed streaming URLs only after verifying active student enrollment.
- **Single Active Session**: Playing a video invalidates any earlier streaming session for that student account, stopping account sharing.
- **Dynamic Watermark**: Video streams return a dynamic payload including the student name, email, IP, and timestamp to deter screen recordings.

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
- If a lesson requires a quiz, next lesson remains locked until student scores >= 70%.
- 100% course completion triggers database-validated certificate issuance with verifiable serial ID.

---

## License & Attribution
Developed for ApexLearn Institute of Tech & AI. Proprietary and confidential.

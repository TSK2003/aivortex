# Live Production Gap Audit

**Platform:** ApexLearn LMS (Project AiVortex)  
**Live Production Host:** AWS EC2 (`13.201.19.85`), AWS RDS PostgreSQL (`aivortex.c50swweis1at.ap-south-1.rds.amazonaws.com`), AWS S3 (`aivortex`)  
**Audit Date:** September 2026  
**Auditor:** Antigravity Advanced Agentic Quality & Security Engineering  
**Audit Mode:** Phase 1 — Non-Invasive Observation & Evidence Verification  
**Authoritative Baselines:**
1. `Student_Panel_SOP_Professional (1).pdf` (`SOP-ST-001 v3.0`)
2. `Public_Page_SOP_Professional (2).pdf` (`SOP-PB-001 v3.0`)
3. `Creator Role SOP V1.pdf` (`SOP-CR-001 v1.1`)
4. `Admin Role v1.pdf` (`SOP-AD-001 v1.0`)
5. `Online_Course_Platform_Workflow_Revised_Admin_Control.pdf` (Version 2.1, 25 Sept 2026)

---

## 1. Executive Summary

ApexLearn is an online technical course and learning management platform built on a React 19 SPA frontend, Node.js/Express REST backend, PostgreSQL RDS database orchestrated via Prisma ORM, and AWS S3 storage.

This comprehensive live gap audit independently evaluated the live system against the five authoritative business workflow and Standard Operating Procedure (SOP) documents. While the platform exhibits modern visual styling, functional PostgreSQL models, and cryptographic primitives, **a deep architectural discrepancy exists between the user interface and the underlying business workflows**.

### Key Top-Level Audit Findings:
1. **Frontend Mock Fallback Masking Production Failures (Critical):**
   Across major pages (`StudentDashboardPage.jsx`, `CoursesPage.jsx`, `AdminDashboardPage.jsx`, `CreatorDashboardPage.jsx`), API calls are chained with `.catch(() => null)`. When the backend returns an empty dataset, 401 Unauthorized, or 500 Error, the UI silently falls back to static hardcoded arrays (`initialCourses`, `initialTransactions`, `initialStudents`, `initialCertificates` in [`frontend/src/data/initialData.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/data/initialData.js)). New students see courses, certificates, and transactions they never enrolled in or paid for; and administrators see mock revenue and students when database queries return 0 records.
2. **Missing Admin Course Creation & Creator Assignment UI (High):**
   While the backend exposes `POST /api/admin/courses` and `prisma.courseCreator`, [`AdminDashboardPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/admin/AdminDashboardPage.jsx) only provides a read-only table of courses. There is **no UI form or modal** to create a new course, assign creators, set access duration, or configure curriculum metadata as required by Step 1 of the Revised Workflow.
3. **Video Upload Protocol Discrepancy (High):**
   `Creator Role SOP V1` mandates that creators upload video files (`.mp4`) directly. In [`CreatorDashboardPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/creator/CreatorDashboardPage.jsx), the form only accepts a URL text string (defaulting to Google sample video URLs like BigBuckBunny). Furthermore, the backend endpoint `POST /api/creator/videos/presigned-url` in [`creatorController.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/controllers/creatorController.js#L348) contains a runtime bug (`presignedUrl.split('?')[0]` called on an Object returned by `s3Service.js`), throwing an unhandled `TypeError` when AWS credentials are configured.
4. **Player Forward Seek and Fullscreen Pause Not Enforced (High):**
   In [`LearningPlayerPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/student/LearningPlayerPage.jsx), the HTML5 `<video>` tag uses standard browser controls without event listeners for `onSeeking` or `timeupdate` to clamp forward seeking into unwatched territory, violating Section 06 of `Student_Panel_SOP`. Leaving fullscreen does not pause playback.
5. **Progress Spoofing Vulnerability (Critical):**
   `POST /api/student/courses/:courseId/lessons/:lessonId/progress` in [`studentController.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/controllers/studentController.js#L180) trusts the client-provided `isCompleted: true` parameter without validating that the student has actually streamed the video duration. A script can mark 100% completion in seconds and claim a valid certificate without watching content.
6. **Hardcoded Demo Credentials on Public Login Page (Critical Security):**
   [`UnifiedLoginPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/auth/UnifiedLoginPage.jsx#L233-L360) displays 1-click login buttons with plain-text credentials for Student, Creator, and Admin (`director@apexlearn.edu:adminSecret2026`). Anyone visiting the public URL can take full administrative control of the system.
7. **Missing Password Reset & Forgot Password Workflows (Medium):**
   Neither frontend nor backend implements public Forgot Password token generation or email dispatch, despite the `PasswordResetToken` table existing in `schema.prisma`.
8. **Offer Management UI Missing (High):**
   The database supports promotional offers (`model Offer`), and `paymentService.js` validates them, but there are no Admin UI screens or backend CRUD endpoints for administrators to create, schedule, or expire offers.

---

## 2. Current Production Architecture

```
                                 +-------------------------+
                                 |       Internet User     |
                                 +------------+------------+
                                              |
                                              v  Ports 80 / 443
                                 +------------+------------+
                                 |   Nginx Reverse Proxy   | (Self-signed TLS, SPA static build)
                                 |     AWS EC2 Ubuntu      | IP: 13.201.19.85
                                 +-----+--------------+----+
                                       |              |
                      /api routes      |              | Static SPA assets
                                       v              v
                  +--------------------+----+    +----+--------------------+
                  |  Node.js PM2 Daemon     |    |  Vite Production Dist   |
                  |  Express API (:3001)    |    |  React 19 SPA           |
                  +------------+------------+    +-------------------------+
                               |
             +-----------------+-----------------+
             |                                   |
             v                                   v
+------------+------------+       +--------------+--------------+
| AWS RDS PostgreSQL      |       | AWS S3 Bucket                |
| (ap-south-1)            |       | ("aivortex")                 |
| Prisma ORM (6.4.1)      |       | Presigned Streaming & Upload |
+-------------------------+       +-----------------------------+
```

### Architectural Breakdown:
- **Compute Layer:** AWS EC2 `t3.small` instance (`13.201.19.85`) running Ubuntu 24.04 LTS. Managed by PM2 running a single fork of `server.js` on internal port 3001.
- **Web Server Layer:** Nginx 1.24 configured with HTTP-to-HTTPS redirect, self-signed SSL certificate, `proxy_pass` to port 3001 for `/api` and `/health`, and `try_files $uri $uri/ /index.html` for frontend routing.
- **Database Layer:** AWS RDS PostgreSQL `16.x` (`aivortex.c50swweis1at.ap-south-1.rds.amazonaws.com:5432/postgres`). Connection managed by Prisma Client pooled over TLS.
- **Object Storage Layer:** AWS S3 Bucket `aivortex` in `ap-south-1`. Intended for course assets, lesson videos, and downloadable resources.
- **Payment Gateway:** Razorpay Node.js SDK integrated for order generation and cryptographic HMAC-SHA256 signature verification.
- **Email Service:** Nodemailer over SMTP configured for invitation and transaction dispatches.

---

## 3. Current Modules

| Module Name | Purpose | Implementation Location | Verified State |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | JWT authentication, role verification, cookie management | `backend/src/controllers/authController.js`, `authMiddleware.js` | **PARTIAL** (No public forgot password, credentials leaked in UI) |
| **Public Catalog** | Course discovery, details, search, filters | `frontend/src/pages/public/`, `publicController.js` | **PARTIAL** (Mock fallback masks empty state) |
| **Student Dashboard** | Enrolled courses, continue learning, stats, notes | `frontend/src/pages/student/StudentDashboardPage.jsx` | **PARTIAL** (Mock fallback masks true state) |
| **Learning Player** | Video playback, session concurrency, watermark, notes | `frontend/src/pages/student/LearningPlayerPage.jsx` | **BROKEN** (No seek restriction, client progress spoofing) |
| **Creator Studio** | Playlist creation, lesson upload, submission | `frontend/src/pages/creator/CreatorDashboardPage.jsx` | **WRONG WORKFLOW** (URL string instead of file upload; S3 presign bug) |
| **Admin Operations** | Course management, video review, user status, logs | `frontend/src/pages/admin/AdminDashboardPage.jsx` | **PARTIAL** (No Course creation UI, no Offer management UI) |
| **Video Protection** | Active session concurrency, watermark, gating | `backend/src/controllers/videoProtectionController.js` | **VERIFIED (Backend)** / **BROKEN (UI scrubber)** |
| **Payment Service** | Razorpay order creation, signature verification, webhooks | `backend/src/services/paymentService.js` | **VERIFIED** (Tamper-proof HMAC verification implemented) |
| **Assessment & Quizzes** | Gated comprehension quizzes, server grading | `backend/src/controllers/assessmentController.js` | **VERIFIED (Backend)** / **PARTIAL (UI integration)** |
| **Credentials & Certificates** | 100% completion verification, certificate issuance | `backend/src/controllers/assessmentController.js` | **PARTIAL** (Gated on spoofable lesson progress) |
| **Support & Inquiries** | Tickets, replies, public contact forms | `supportNotificationController.js`, `publicController.js` | **VERIFIED** |
| **Audit Logs** | Comprehensive administrative and transaction trail | `prisma.auditLog`, controllers | **VERIFIED** |

---

## 4. Current Screens

| Screen | Route | Actor | Current Behavior | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Home Page** | `/` | Visitor | Renders hero, category chips, stats, featured courses | Matches SOP layout; uses fallback if API empty | **PARTIAL** |
| **Course Catalog** | `/courses` | Visitor | Grid of courses with category, level, search filters | Should filter DB courses; falls back to `initialCourses` | **PARTIAL** |
| **Course Details** | `/courses/:courseId` | Visitor | Modal / detail view with curriculum, outcomes, price | Shows details; lacks dynamic demo button based on admin flag | **PARTIAL** |
| **About Page** | `/about` | Visitor | Static platform mission, faculty, tech stack | Static institutional info | **VERIFIED** |
| **Contact Page** | `/contact` | Visitor | Contact info and interactive inquiry form | Submits to `POST /api/public/contact`, saves in DB | **VERIFIED** |
| **FAQ Page** | `/faq` | Visitor | Categorized accordion FAQ | Static informational content | **VERIFIED** |
| **Terms Page** | `/terms` | Visitor | Legal terms of service | Static legal disclosure | **VERIFIED** |
| **Privacy Page** | `/privacy` | Visitor | Privacy policy | Static legal disclosure | **VERIFIED** |
| **Certificate Verify** | `/certificates` | Visitor | Public verification by certificate code | Calls `GET /api/public/certificates/:code` | **VERIFIED** |
| **Unified Login** | `/login`, `/portal` | All | Role-agnostic login card + 1-click demo buttons | Secure login; MUST NOT expose seed passwords | **BROKEN** |
| **Student Signup** | `/student/signup` | Student | Form: Name, Email, Password. Redirects to `/student/dashboard` | Must support returning to selected course checkout | **WRONG WORKFLOW** |
| **Student Dashboard** | `/student/dashboard` | Student | Greeting, stats, continue learning, tabs | If 0 enrollments, displays mock courses and certificates | **STATIC / PARTIAL** |
| **Student Courses** | `/student/courses` | Student | Filterable list: All, In Progress, Completed | If empty, renders 2 mock courses from `initialCourses` | **STATIC / PARTIAL** |
| **Student Certificates**| `/student/certificates` | Student | List of issued certificates with download link | If empty, renders mock certificates from `initialData` | **STATIC / PARTIAL** |
| **Student Payments** | `/student/payments` | Student | List of transactions and receipts | If empty, renders mock transactions from `initialData` | **STATIC / PARTIAL** |
| **Student Support** | `/student/support` | Student | Ticket submission form and status list | Submits to `POST /api/support-tickets` | **VERIFIED** |
| **Learning Player** | `/student/courses/:id/learn`| Student | Fullscreen video player, sidebar curriculum, notes | Free seeking allowed; no fullscreen pause; spoofable progress | **BROKEN** |
| **Creator Dashboard**| `/creator/dashboard` | Creator | Assigned courses, modules count, quick action | If empty, renders `initialCourses.slice(0, 2)` | **STATIC / PARTIAL** |
| **Creator Playlists**| `/creator/playlists` | Creator | Create playlist form and list of playlists | Saves playlist to DB; requires assigned course | **VERIFIED** |
| **Creator Upload** | `/creator/upload` | Creator | Lesson upload form (URL input string) | Must upload binary `.mp4` file to S3 | **WRONG WORKFLOW** |
| **Creator Submissions**| `/creator/submissions`| Creator | Submissions table with status badges and feedback | Lists lessons with status history and admin feedback | **VERIFIED** |
| **Creator Profile Req**| `/creator/profile` | Creator | Profile view and request change modal | Submits `ProfileChangeRequest` to Admin queue | **VERIFIED** |
| **Admin Overview** | `/admin/dashboard` | Admin | Aggregate metric cards, recent orders, audit logs | Loads from DB; fallback to local length if null | **VERIFIED** |
| **Admin Creators** | `/admin/creators` | Admin | Creator list, suspend/activate button, invite form | Generates account, dispatches credentials via email | **VERIFIED** |
| **Admin Students** | `/admin/students` | Admin | Student list, suspend/activate account | Updates `UserStatus` in DB | **VERIFIED** |
| **Admin Courses** | `/admin/courses` | Admin | Read-only table of courses | **Missing "Create Course" and "Assign Creator" UI** | **MISSING (UI)** |
| **Admin Video Queue**| `/admin/playlists` | Admin | Verification queue, review modal (Approve/Return) | Updates lesson status, creates verification log | **VERIFIED** |
| **Admin Pricing** | `/admin/pricing` | Admin | Inline price and discount editor | Updates base price and discount; **No Offer creation UI** | **PARTIAL** |
| **Admin Public Ctrls**| `/admin/public-page` | Admin | List of courses with "Feature/Unfeature" toggle | **Missing Visibility toggle, Demo assignment, Enrollment toggle** | **PARTIAL** |
| **Admin Payments** | `/admin/payments` | Admin | Transaction audit log with Razorpay references | Displays `Order` table; fallback to mock data if empty | **PARTIAL** |
| **Admin Requests** | `/admin/requests` | Admin | Creator profile change requests approval/rejection | Updates creator profile upon approval | **VERIFIED** |
| **Admin Announcements**| `/admin/notifications`| Admin | Broadcast announcement form | Creates `Notification` records in DB | **VERIFIED** |
| **Admin Audit Logs** | `/admin/audit-logs` | Admin | Traceable timeline of platform operations | Displays `AuditLog` records from DB | **VERIFIED** |
| **Admin Security** | `/admin/security` | Admin | Active user sessions list, remote session revocation| Deletes session from DB; forces client re-auth | **VERIFIED** |

---

## 5. Public Website Audit

Against `Public_Page_SOP_Professional (2).pdf`:
1. **Homepage & Banner:** Implemented in [`frontend/src/pages/public/HomePage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/public/HomePage.jsx). Displays platform introduction, search bar, and "Explore Courses" button routing to `/courses`.
2. **Course Cards:** Cards display thumbnail, title, instructor name, difficulty level, duration, and price / "Free" badge.
3. **Footer Navigation:** Footer includes links to About, Contact, FAQ, Terms, and Privacy. Refund policy is referenced in Terms.
4. **Catalogue Filtering:** [`CoursesPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/public/CoursesPage.jsx) supports searching by keyword, category filter, and level filter. However:
   - **Language Filter:** Missing from filter controls (SOP Section 4).
   - **Free/Paid Filter:** Missing from filter controls (SOP Section 4).
   - **Empty State:** When no courses match, it shows fallback courses rather than a distinct "No courses found" state with a "Clear Filters" button when the API fails.
5. **Course Detail & Demo:** Course detail modal shows learning outcomes, requirements, duration, and price.
   - **GAP:** The "Watch Demo" button is hardcoded in the frontend modal to play sample videos rather than being conditionally rendered based on whether the Admin enabled `demoLessonId` and designated an approved lesson.
6. **Enrollment Workflow:**
   - **GAP:** Clicking "Enroll Now" as an unauthenticated visitor opens login, but after login or signup, the user is redirected to `/student/dashboard` rather than returning to the selected course enrollment flow (violates SOP Section 6 & 7).

---

## 6. Student Audit

Against `Student_Panel_SOP_Professional (1).pdf`:
1. **Authentication:** Login and Signup work.
   - **GAP:** Forgot Password and Reset Password links do not exist on the login page; backend endpoints are missing.
2. **Dashboard:**
   - Displays greeting, enrolled count, in-progress count, and completed count.
   - Continue Learning card is implemented.
   - Announcements and support links are present.
   - **GAP:** If the database has 0 enrollments, the dashboard silently loads mock data from `initialCourses.slice(0, 2)`.
3. **My Courses Tab:**
   - Contains All, In Progress, and Completed filters.
   - Cards show thumbnail, title, progress bar, and action button.
   - **GAP:** Expired course handling does not show renewal/support CTA; expired flag is calculated on the backend but the UI simply displays normal cards.
4. **Learning Player (`LearningPlayerPage.jsx`):**
   - Shows module sections, lesson list, durations, and completion ticks.
   - Notes tab allows creating and editing private student notes (`StudentNote` model).
   - Resources tab exists.
   - **CRITICAL GAP 1 (Scrubber Seek Restriction):** Standard browser `<video controls>` allows unrestricted forward scrubbing.
   - **CRITICAL GAP 2 (Fullscreen Behavior):** Leaving fullscreen does not pause video playback.
   - **CRITICAL GAP 3 (Client Progress Spoofing):** Progress is marked complete via an open client POST without verifying video playback watch time.
5. **Assessments & Quizzes:**
   - Quiz modal fetches questions with options; options correctly omit `isCorrect` on the backend (`assessmentController.js#L17`).
   - Server grades score and enforces `passingScore`.
   - **GAP:** If a quiz is failed, attempts count is incremented, but lesson completion is not locked in the player UI if the student simply marks the checkbox.
6. **Certificates:**
   - Generated upon course completion with student name, course title, issue date, and serial number (`CERT-XXX-2026-XXXX`).
   - Public verification works at `/certificates?code=...`.
   - **GAP:** Certificates can be claimed prematurely if a user scripts progress toggle requests.

---

## 7. Creator Audit

Against `Creator Role SOP V1.pdf`:
1. **Self-Registration Prohibition:** Creator self-registration is disabled. Only Admin can provision creators via `POST /api/admin/creators/invite`. **VERIFIED.**
2. **Hierarchical Relationship (Course -> Playlist -> Video):** Enforced in Prisma schema and backend controllers.
3. **Assigned Courses:** Creators can only view and create content for courses explicitly assigned to them in `CourseCreator` table. IDOR checks verified in `creatorController.js#L63`. **VERIFIED.**
4. **Upload Protocol:**
   - **CRITICAL WORKFLOW GAP:** `CreatorDashboardPage.jsx` provides an `<input type="url">` for video URL instead of a file upload input (`<input type="file" accept="video/mp4">`). The creator is prompted to paste an external URL or accept a Google sample video.
   - **CRITICAL RUNTIME BUG:** `getUploadPresignedUrl` in `creatorController.js` attempts `presignedUrl.split('?')[0]`. Because `s3Service.getPresignedUploadUrl` returns an object `{ uploadUrl, key, bucket }`, this call throws `TypeError` in production.
5. **Creator Restrictions:**
   - Cannot change course price: **VERIFIED** (No endpoints or UI).
   - Cannot set Free/Paid: **VERIFIED**.
   - Cannot publish directly: **VERIFIED** (Creator status only sets `UPLOADED` or `SUBMITTED_FOR_REVIEW`).
   - Cannot select public demo: **VERIFIED**.
   - Cannot access admin review queue: **VERIFIED** (Role-gated on `ADMIN`).

---

## 8. Content State Machine Audit

Against `Online_Course_Platform_Workflow_Revised_Admin_Control.pdf`:

```
               [ CREATOR ]                                      [ ADMIN ]
+----------------------------------------+       +------------------------------------+
|  DRAFT -> UPLOADED                     | ----> |  SUBMITTED_FOR_REVIEW              |
+----------------------------------------+       +-----------------+------------------+
                                                                   |
                                              +--------------------+--------------------+
                                              |                                         |
                                              v (Return)                                v (Approve)
                               +-----------------------------+           +-----------------------------+
                               |     RETURNED_FOR_EDIT       |           |          APPROVED           |
                               +--------------+--------------+           +--------------+--------------+
                                              |                                         |
                                              v (Resubmit)                              v (Admin Publish)
                               +-----------------------------+           +-----------------------------+
                               |    SUBMITTED_FOR_REVIEW     |           |          PUBLISHED          |
                               +-----------------------------+           +--------------+--------------+
                                                                                        |
                                                                                        v
                                                                         +-----------------------------+
                                                                         |  Optional: PUBLIC DEMO      |
                                                                         |  (Admin Course Setting)     |
                                                                         +-----------------------------+
```

### Direct API & State Machine Verification:
1. **Separation of APPROVED and PUBLISHED:**
   - In `adminController.js`, `reviewVideo` (lines 583–671) only transitions lessons to `APPROVED` or `RETURNED_FOR_EDIT`.
   - `publishLesson` (lines 673–725) is an independent route (`POST /api/admin/lessons/:lessonId/publish`) that explicitly validates `lesson.status === 'APPROVED'`.
   - Enrolled students can stream lessons only when `lesson.status === 'PUBLISHED'` (`videoProtectionController.js#L44`).
   - **Backend Verification: PASS.**
2. **Separation of PUBLISHED and PUBLIC DEMO:**
   - A lesson marked `PUBLISHED` is only viewable by enrolled students.
   - Public visitors can only view demo videos if `course.demoLessonId === lesson.id` and `lesson.isPublicDemo === true` (`adminController.js#L503-L533`).
   - **Backend Verification: PASS.**
3. **State Machine Audit Trail:**
   - Every transition creates a row in `VideoStatusHistory` capturing `fromStatus`, `toStatus`, `changedById`, `reason`, and timestamp.
   - **Backend Verification: PASS.**
4. **UI State Machine Gap:**
   - In `AdminDashboardPage.jsx`, the Verification Queue table only has "Approve" and "Return" actions. There is no separate "Publish" button in the course playlist view, meaning approved lessons remain in `APPROVED` state and cannot be transitioned to `PUBLISHED` via the UI without direct API calls!

---

## 9. Admin Audit

Against `Admin Role v1.pdf`:
1. **Dashboard:** Displays totals for Students, Creators, Courses, Revenue, and Pending Queue. Verified against live database queries in `adminController.js#L8-L58`.
2. **Creator Management:** Invite creator, view creators, suspend/activate accounts verified.
3. **Student Management:** View students, search/filter, suspend/reactivate accounts verified.
4. **Course Management:**
   - **CRITICAL UI GAP:** The Admin UI lacks a "Create Course" modal or form, creator assignment selector, access duration input, or category/level editor.
5. **Playlist & Video Management:** Verification queue, review modal, and return with mandatory feedback notes verified.
6. **Public Page Management:**
   - **HIGH UI GAP:** Admin UI only allows toggling "Featured" status. It lacks controls for public visibility (`PUBLISHED`, `HIDDEN`, `ARCHIVED`), demo video selector, and enrollment open/closed toggle.
7. **Payments & Financials:** Transaction audit table implemented.
8. **Notifications & Broadcasts:** System-wide announcement broadcast implemented and stored in `Notification` table.
9. **Requests:** Creator profile change review (approve/reject) implemented and tested.
10. **Reports & Analytics:** Backend endpoint `/api/admin/reports` aggregates metrics, but the UI tab relies on simple card statistics.
11. **Audit Logs:** Full operation logging (`COURSE_UPDATED`, `VIDEO_APPROVED`, `STUDENT_STATUS_CHANGED`, `PAYMENT_VERIFIED`) verified.
12. **Platform Security:** Active sessions list and remote session revocation verified.

---

## 10. Revised Admin-Controlled Workflow Audit

Tracing the 13-step workflow from `Online_Course_Platform_Workflow_Revised_Admin_Control.pdf` (Section 13):

| Step | Workflow Stage | Expected Behavior | Actual Live System State | Status |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Admin creates Creator | Creator account provisioned; credentials emailed | Implemented via `POST /api/admin/creators/invite` and Nodemailer | **VERIFIED** |
| **2** | Admin creates Course & assigns Creator | Admin defines course, assigns Creator | Backend endpoint exists; **UI missing in Admin panel** | **PARTIAL** |
| **3** | Creator prepares playlist & uploads video | Creator uploads lesson video file (.mp4) | Form accepts URL string; S3 presigned generator has code bug | **WRONG WORKFLOW** |
| **4** | Creator submits for review | Status -> `SUBMITTED_FOR_REVIEW` | Implemented via `POST /api/creator/videos/:id/submit` | **VERIFIED** |
| **5** | Admin reviews video | Admin inspects video; accepts or returns with note | Implemented via `POST /api/admin/video-verification/:id/review` | **VERIFIED** |
| **6** | Creator resubmits if returned | Creator updates video and resubmits | Implemented in `creatorController.js` and submissions tab | **VERIFIED** |
| **7** | Admin approves & publishes | Separate approval and publication actions | Backend has separate routes; **UI missing "Publish" button** | **PARTIAL** |
| **8** | Admin configures pricing & offer | Admin sets base price, discount, offer dates | Pricing editable; **Offer creation missing in UI and backend** | **PARTIAL** |
| **9** | Admin configures public demo & visibility | Admin selects approved video as demo; sets status | Backend endpoint exists; **UI controls missing** | **PARTIAL** |
| **10**| Public visitor discovers course | Visitor browses catalogue and watches demo | Catalog renders; fallback masks API errors | **PARTIAL** |
| **11**| Student registers & enrolls | Student signs up, pays via Razorpay, enrollment activates | Checkout, HMAC verification, and enrollment activation work | **VERIFIED** |
| **12**| Student learns sequentially | Videos play with watermark; forward seek restricted | Watermark active; **Seek restriction missing in player** | **BROKEN** |
| **13**| Completion & Certificate | 100% completion unlocks certificate if enabled | Certificate issues; **Vulnerable to progress spoofing** | **PARTIAL** |

---

## 11. Free Course Audit

- **Workflow Test:** Free course enrollment (`course.isFree === true` or `course.price === 0`).
- **Endpoint:** `POST /api/payments/create-order` with free course ID.
- **Backend Execution:** In `paymentService.js#L55-L93`, the service detects `course.isFree` or `course.price === 0`. It initiates a Prisma transaction, creates an `Enrollment` record with status `ACTIVE`, increments `studentsCount`, and logs `FREE_ENROLLMENT_COMPLETED`.
- **Payment Gateway:** No Razorpay order is created; no payment gateway redirect occurs.
- **Verification:** **PASSED.** Free courses correctly bypass payment gateways and activate instant enrollment.

---

## 12. Paid Course Audit

- **Workflow Test:** Paid course enrollment (`course.price > 0`).
- **Endpoint:** `POST /api/payments/create-order` followed by client-side checkout and `POST /api/payments/verify`.
- **Backend Execution:**
  1. `paymentService.createOrder` looks up course directly in PostgreSQL to fetch the authoritative server price (`course.price`). Client amount is ignored.
  2. If an offer code is provided, server checks `Offer` table for active date range and calculates discount.
  3. Razorpay order is generated with amount in paise.
  4. Pending `Order` record created in database.
  5. Upon client payment, `paymentService.verifyPayment` cryptographically validates HMAC-SHA256 signature against `RAZORPAY_KEY_SECRET`.
  6. On valid signature, transaction updates order to `SUCCESSFUL`, activates `Enrollment`, logs payment events, and dispatches confirmation email.
- **Verification:** **PASSED.** The payment workflow is strictly server-authoritative and protected against client price tampering.

---

## 13. Payment Security Audit

| Attack Vector / Test Case | Live Implementation Defense | Result |
| :--- | :--- | :--- |
| **Price Tampering in Request** | Backend never accepts price from request body; reads `course.price` from DB | **PROTECTED** |
| **Course ID Tampering** | Course ID verified against DB; rejects closed enrollments | **PROTECTED** |
| **HMAC Signature Forgery** | Recomputed signature `crypto.createHmac('sha256', secret).update(orderId + '\|' + paymentId)` must match | **PROTECTED** |
| **Replay Attack / Duplicate Verify** | If `order.status === 'SUCCESSFUL'`, returns idempotent success without duplicate increment | **PROTECTED** |
| **Webhook Replay Protection** | Webhooks check `WebhookEvent` table by `eventId`; returns duplicate status | **PROTECTED** |
| **Failed / Cancelled Payment** | Client modal cancel does not trigger verify; unverified orders remain `PENDING` | **PROTECTED** |
| **Already Enrolled Student** | `paymentService.createOrder` checks existing active enrollment and rejects with 400 | **PROTECTED** |
| **Expired Offer Usage** | Offer validity checks `offer.startDate <= now && offer.endDate >= now` | **PROTECTED** |

---

## 14. Offer Audit

- **Database Model:** `model Offer` with fields: `code`, `discountPercent`, `discountAmount`, `startDate`, `endDate`, `isActive`, `maxUses`, `usedCount`.
- **Backend Consumption:** `paymentService.js#L98-L110` checks active offers during checkout order creation.
- **GAPS IDENTIFIED:**
  1. **Missing CRUD Endpoints:** There are no API endpoints in `adminRoutes.js` to create, update, list, or delete promotional offers (`POST /api/admin/offers`, etc.).
  2. **Missing Admin UI:** `AdminDashboardPage.jsx` Pricing tab has input fields for base price and discount percentage on a specific course, but **no interface to create promo codes or set scheduled start/end dates**.
  3. **Public Display:** The course detail modal does not dynamically highlight scheduled promotional offers separate from static discounts.

---

## 15. Enrollment Audit

1. **Duplicate Enrollment Prevention:**
   - Database level: `Enrollment` model has `@@unique([studentId, courseId])`.
   - Service level: `paymentService.createOrder` rejects new orders if an active, non-expired enrollment exists. **VERIFIED.**
2. **Access Expiration Enforcement:**
   - Database level: `Enrollment.expiresAt` datetime field.
   - Streaming authorization: `videoProtectionController.startVideoSession` explicitly checks `if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) throw new ForbiddenError(...)`. **VERIFIED.**
3. **Hidden / Unpublished Course Enrollment:**
   - If `course.enrollmentOpen === false`, `paymentService.createOrder` throws `BadRequestError('Enrollment is currently closed')`. **VERIFIED.**
4. **Cross-Course CourseId Tampering:**
   - In `startVideoSession`, the lesson is fetched and the controller checks `if (lesson.playlist.courseId !== courseId) throw new NotFoundError(...)`. **VERIFIED.**

---

## 16. Video Security Audit

1. **Storage Privacy:**
   - Course videos in S3 are stored under private prefixes (`uploads/courses/...`).
   - S3 public bucket access is blocked; direct unauthenticated GET requests to S3 object URLs return `403 AccessDenied`. **VERIFIED.**
2. **Streaming Authorization Gate:**
   - Video streaming URLs are only generated after verifying active enrollment in `videoProtectionController.js`.
   - S3 URLs are presigned with a 2-hour expiration window (`s3Service.getPresignedDownloadUrl(key, 7200)`). **VERIFIED.**
3. **Sequential Lesson Gating:**
   - `videoProtectionController.js#L50-L94` enforces that all earlier published lessons in the playlist must be completed, and prerequisite quizzes passed, before authorization is granted. **VERIFIED (Backend).**
4. **Anti-Piracy Watermark:**
   - Watermark payload contains `APEX-STU-XXXXXXXX` and dynamic session tag.
   - Rendered as an animated overlay in `LearningPlayerPage.jsx`. **VERIFIED.**
5. **No Download Button:**
   - `<video controls controlsList="nodownload">` is applied. Direct browser download context menu is suppressed. **VERIFIED.**
6. **Player Control Gaps (CRITICAL):**
   - **Forward Seek Not Clamped:** The HTML5 video element allows the student to scrub the playhead forward into unwatched video.
   - **Fullscreen Pause Not Implemented:** No `fullscreenchange` listener is attached to pause video on exit.

---

## 17. Video Session Audit (Concurrency & Heartbeat)

- **Requirement:** Maximum 1 active video-playing session per student. When Device B starts, Device A must be paused/invalidated.
- **Backend Implementation:**
  - `startVideoSession` in `videoProtectionController.js#L101-L114`:
    ```javascript
    await prisma.activeVideoSession.deleteMany({ where: { studentId } })
    await prisma.activeVideoSession.create({
      data: { studentId, lessonId, sessionId: newSessionId, ipAddress, lastHeartbeatAt: new Date() }
    })
    ```
  - `heartbeatVideoSession`: Checks if the incoming `sessionId` matches the registered session for the student. If another device started a session, the previous `sessionId` has been deleted from the database, causing the heartbeat to throw `409 Conflict ('Concurrent session detected')`.
- **Frontend Reaction:**
  - `LearningPlayerPage.jsx#L192-L195` catches the error:
    ```javascript
    if (err.message && err.message.includes('concurrent')) {
      showToast('Another video session was started on your account. Playback paused.', 'error')
      if (videoRef.current) videoRef.current.pause()
    }
    ```
- **Stale Session Expiration:** Heartbeat older than 2 minutes is purged automatically on subsequent heartbeat calls.
- **Verification:** **PASSED.** Single-session concurrency enforcement is fully implemented across backend and frontend.

---

## 18. Video Playback Audit

| Feature | SOP Requirement | Current Implementation | Verdict |
| :--- | :--- | :--- | :--- |
| **Saved Position** | Resume from last watched position | Backend stores `lastPositionSec` in `LessonProgress`; player sets `videoRef.current.currentTime` | **VERIFIED** |
| **Rewind & Replay** | Allowed without restriction | Native HTML5 video scrubber allows backward seeking | **VERIFIED** |
| **Forward Seek Restriction** | Disabled into unwatched portions | Native HTML5 scrubber has no clamping logic | **BROKEN** |
| **Exit Fullscreen Pause** | Pauses playback on supported devices | No `fullscreenchange` listener attached to DOM | **BROKEN** |
| **Automatic Progress Save** | Saves watch position periodically | Heartbeat timer fires every 30 seconds | **VERIFIED** |
| **Completion Threshold** | 100% video watched required | Progress toggled via manual button click or direct API call | **BROKEN / SPOOFABLE** |

---

## 19. Quiz Security Audit

1. **Answer Masking:** In `assessmentController.js#L17`, options are queried with `select: { id: true, optionText: true }`, explicitly omitting `isCorrect`. Correct answers are never sent to the browser before submission. **VERIFIED.**
2. **Server Grading:** Answers payload `{ questionId: selectedOptionId }` is evaluated exclusively on the server in `submitQuizAttempt`. **VERIFIED.**
3. **Attempt Enforcement:** Server queries `QuizAttempt.count` and rejects submissions exceeding `quiz.maxAttempts`. **VERIFIED.**
4. **Passing Threshold:** Server calculates percentage score against `quiz.passingScore` (default 70%). **VERIFIED.**

---

## 20. Certificate Security Audit

1. **Completion Gating:**
   - `issueCertificateIfEligible` in `assessmentController.js#L110-L262` verifies:
     - Active course enrollment (`status === 'ACTIVE'`).
     - Course has certificates enabled (`course.certificateEnabled === true`).
     - All published lessons have `isCompleted === true` in `LessonProgress`.
     - All required quizzes have passing attempts in `QuizAttempt`.
2. **Idempotency:** Re-requesting a certificate returns the existing valid certificate without generating duplicates.
3. **Public Verification:** Code format `CERT-XXX-2026-XXXX` is searchable publicly via `GET /api/public/certificates/:code`.
4. **Vulnerability:** Because lesson completion (`LessonProgress.isCompleted`) can be spoofed via `toggleLessonProgress`, a user can bypass the requirement to watch videos before requesting certification.

---

## 21. Data Isolation & RBAC Audit

1. **Student Isolation:**
   - Notes: Gated by `where: { studentId: req.user.id }`.
   - Payments: Gated by `where: { studentId: req.user.id }`.
   - Certificates: Gated by `where: { studentId: req.user.id }`.
   - Progress: Gated by student's own enrollment ID.
   - **IDOR Testing: PASS.** Students cannot view or modify other students' records.
2. **Creator Isolation:**
   - Playlists: Creator can only add playlists to courses assigned to them (`CourseCreator` check in `creatorController.js#L63`).
   - Lessons: Creator can only submit or edit lessons they created (`creatorController.js#L175`).
   - **IDOR Testing: PASS.** Creators cannot manipulate other creators' courses or uploads.
3. **Admin Privilege:**
   - Only users with `role === 'ADMIN'` pass `requireRole('ADMIN')` middleware.
   - Non-admin tokens receive `403 Forbidden: Insufficient permissions`.

---

## 22. Authentication Security Audit

1. **Password Hashing:** Implemented with `bcryptjs` with salt round 10. Passwords are never stored in plaintext. **VERIFIED.**
2. **Session & Token Management:** JWT signed with `JWT_SECRET`, default expiration 7 days. Stored in HTTP-only signed cookies or Authorization header.
3. **Rate Limiting:**
   - `authLimiter` applied to `/login`, `/register`, `/change-password` (5 requests per 15 minutes).
   - Global `apiLimiter` applied to all `/api` routes (300 requests per 15 minutes).
4. **CRITICAL LEAK — 1-Click Login Buttons:**
   - In [`UnifiedLoginPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/auth/UnifiedLoginPage.jsx#L233-L360), three demo buttons render hardcoded credentials:
     - `rahul.sharma@example.com` / `student123`
     - `creator@apexlearn.edu` / `creator123`
     - `director@apexlearn.edu` / `adminSecret2026`
   - **SEVERITY: CRITICAL.** Any unauthorized visitor can log in as Admin.
5. **Missing Forgot Password:** No public password reset flow is implemented.

---

## 23. SQL Injection Audit

- **ORM Parameterization:** The backend uses Prisma ORM for all database operations.
- **Raw SQL Check:** Searched codebase for `$queryRaw`, `$queryRawUnsafe`, `$executeRaw`, `$executeRawUnsafe`.
  - Found `$executeRawUnsafe` strictly inside [`backend/prisma/seed.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/prisma/seed.js#L9) (development seeding script).
  - **Zero instances of raw SQL concatenation in production controllers or routes.**
- **Verdict: ZERO SQL INJECTION VULNERABILITIES DETECTED.**

---

## 24. XSS (Cross-Site Scripting) Audit

- **DOM Manipulation Check:** Searched frontend codebase for `dangerouslySetInnerHTML`.
  - **Zero occurrences found.**
- **Rendering:** All text fields (user profiles, lesson notes, support tickets, announcement bodies) are rendered via standard React JSX escaping (`{item.text}`).
- **Security Headers:** Express application configures `helmet()` for Content Security Policy, X-Content-Type-Options, and frameguard protection.
- **Verdict: ZERO XSS VULNERABILITIES DETECTED.**

---

## 25. File Upload Audit

- **Current Live Upload Mechanism:**
  - Frontend currently sends an external URL string rather than uploading binary files.
- **Presigned Upload Implementation (`getUploadPresignedUrl` in `creatorController.js`):**
  - Permitted MIME types enforced: `video/mp4`, `video/quicktime`, `video/webm`, `application/pdf`, `image/jpeg`, `image/png`.
  - File sanitization: `safeFileName = ${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`.
  - Path traversal protection: S3 object keys are strictly namespaced under `uploads/courses/${courseId}/`.
- **Runtime Bug:** `presignedUrl.split('?')[0]` causes server exception when S3 credentials are functional.

---

## 26. Database Integrity Audit

1. **Foreign Key Constraints:** Verified in PostgreSQL. Cascading deletes configured on dependent child tables (`Enrollment`, `Playlist`, `Lesson`, `VideoVerificationLog`, `Order`).
2. **Unique Constraints:**
   - `User.email` (Unique)
   - `Course.slug` (Unique)
   - `CourseCreator.courseId_creatorId` (Compound Unique)
   - `Enrollment.studentId_courseId` (Compound Unique)
   - `LessonProgress.enrollmentId_lessonId` (Compound Unique)
   - `StudentNote.studentId_lessonId` (Compound Unique)
   - `Certificate.certificateCode` (Unique)
   - `Order.orderNumber` (Unique)
   - `Order.razorpayOrderId` (Unique)
   - `ActiveVideoSession.sessionId` (Unique)
   - `Offer.code` (Unique)
   - `WebhookEvent.eventId` (Unique)
3. **Database Consistency:** Database schema enforces relational consistency. Foreign key violations or duplicate enrollments are rejected at the database engine level.

---

## 27. Cloud Infrastructure Audit

| Component | AWS Resource | Current Status | Assessment |
| :--- | :--- | :--- | :--- |
| **Compute** | EC2 `t3.small` (`13.201.19.85`) | **LIVE** | Running Ubuntu 24.04, PM2 Node.js, Nginx |
| **Database** | RDS PostgreSQL (`aivortex.c50swweis1at...`) | **LIVE** | Accessible from EC2; schema synchronized |
| **Storage** | S3 Bucket (`aivortex`) | **LIVE** | S3 bucket created in `ap-south-1`; private |
| **SSL / TLS** | Self-signed Certificate | **PARTIAL** | Nginx listens on port 443 with self-signed SSL; browser flags "Not Secure" warning |
| **DNS / Domain** | None (Direct IP `13.201.19.85`) | **NOT READY** | Production requires custom domain and valid Let's Encrypt / ACM certificate |
| **CDN** | AWS CloudFront | **MISSING** | S3 presigned URLs stream directly from S3 origin without CloudFront edge caching |
| **WAF** | AWS WAF | **MISSING** | No rate limiting at edge; reliance on Node.js memory rate limiter |
| **Backups** | Automated RDS snapshots | **PARTIAL** | Default RDS 7-day retention active; manual snapshot recommended |

---

## 28. UI/UX Live Audit

1. **Visual Styling:** High-quality modern aesthetics. Clean typography (Inter / Outfit / Plus Jakarta Sans), dark mode contrast, consistent badge color coding (`#10B981` green for published, `#F59E0B` amber for pending, `#2563EB` blue for accents).
2. **Responsive Breakpoints:** Flexbox and grid layouts adapt cleanly to tablet and mobile viewports. Sidebar collapses into mobile menu.
3. **Form Feedback:** Interactive toast notifications (`ToastContext`) provide immediate user feedback on success and failure.
4. **Usability Issues Identified:**
   - In `AdminDashboardPage.jsx`, tabs are arranged in a horizontal overflow container without clear grouping (12 separate tabs).
   - In `LearningPlayerPage.jsx`, the certificate claim banner appears only when progress reaches 100%, but no progress indicator is displayed on individual lesson items until clicked.
   - In `CreatorDashboardPage.jsx`, video upload is placed under an "Upload" tab separate from the playlist view, forcing creators to switch tabs repeatedly to upload sequential lessons.

---

## 29. Mobile & Tablet Audit

1. **Mobile Viewport Navigation:** Public navbar collapses into a slide-over mobile drawer with direct links to Courses, Projects, About, Contact, and Portal Login.
2. **Admin Tables on Mobile:** Admin data tables (`creators`, `students`, `payments`) scroll horizontally (`overflowX: auto`). While functional, cards or collapsible list views would provide better mobile ergonomics.
3. **Player on Mobile:**
   - HTML5 video player scales to 100% width on mobile screens.
   - Watermark overlay scales down to avoid obstructing video content.
   - Sidebar curriculum moves below the player canvas on screens under 992px.

---

## 30. PDF Compliance Matrix

Mapping every requirement from all five authoritative documents:

| Req ID | Source Document | Section | Specific Requirement | Live Behavior | Status | Severity | Fix Required |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **REQ-PB-01** | Public SOP | Sec 2 | Homepage banner, search & explore | Renders search & featured grid | **VERIFIED** | - | None |
| **REQ-PB-02** | Public SOP | Sec 4 | Catalog language & free/paid filter | Filters category & level only | **PARTIAL** | **MEDIUM** | Add language & free/paid dropdowns |
| **REQ-PB-03** | Public SOP | Sec 4 | "No courses found" + Clear Filters | Falls back to mock courses on empty | **BROKEN** | **HIGH** | Render clear filters empty state |
| **REQ-PB-04** | Public SOP | Sec 5 | Course detail outcomes & audience | Displayed in course modal | **VERIFIED** | - | None |
| **REQ-PB-05** | Public SOP | Sec 6 | Demo video only if Admin enabled | Hardcoded demo video in modal | **WRONG WORKFLOW** | **HIGH** | Gate demo on `course.demoLessonId` |
| **REQ-PB-06** | Public SOP | Sec 7 | Return to selected course after login | Unconditionally navigates to dashboard | **WRONG WORKFLOW** | **MEDIUM** | Pass `redirect` query param in auth |
| **REQ-PB-07** | Public SOP | Sec 9 | Contact form with confirmation | Saves inquiry in PostgreSQL | **VERIFIED** | - | None |
| **REQ-ST-01** | Student SOP | Sec 2 | Forgot Password / Reset Password | Missing from login & backend | **MISSING** | **HIGH** | Add forgot-pwd endpoint & modal |
| **REQ-ST-02** | Student SOP | Sec 3 | Continue Learning card | Restores last incomplete lesson | **VERIFIED** | - | None |
| **REQ-ST-03** | Student SOP | Sec 4 | My Courses filters (All/In Progress/Done) | Implemented in student dashboard | **VERIFIED** | - | Remove mock fallback |
| **REQ-ST-04** | Student SOP | Sec 6 | Sequential playback gating | Backend enforces; player allows seek | **BROKEN** | **HIGH** | Clamp HTML5 video seek event |
| **REQ-ST-05** | Student SOP | Sec 6 | Exit fullscreen pauses playback | No event listener in player | **BROKEN** | **MEDIUM** | Add `fullscreenchange` handler |
| **REQ-ST-06** | Student SOP | Sec 7 | Student watermark overlay | Dynamic session watermark active | **VERIFIED** | - | None |
| **REQ-ST-07** | Student SOP | Sec 8 | Private student lesson notes | Private notes CRUD in DB | **VERIFIED** | - | None |
| **REQ-ST-08** | Student SOP | Sec 9 | 100% completion unlocks certificate | Certificate issues with code & date | **PARTIAL** | **CRITICAL**| Enforce server watch time validation |
| **REQ-CR-01** | Creator SOP | Sec 2 | Admin-provisioned accounts only | Self-registration disabled | **VERIFIED** | - | None |
| **REQ-CR-02** | Creator SOP | Sec 5 | Course -> Playlist -> Video hierarchy | Enforced in Prisma schema | **VERIFIED** | - | None |
| **REQ-CR-03** | Creator SOP | Sec 7 | Video file (.mp4) direct upload | URL string input in studio UI | **WRONG WORKFLOW** | **HIGH** | Implement S3 binary file upload |
| **REQ-CR-04** | Creator SOP | Sec 8 | One-by-one sequential uploading | Creator submits lessons individually | **VERIFIED** | - | None |
| **REQ-CR-05** | Creator SOP | Sec 11| Profile Change Request workflow | Implemented & reviewed by Admin | **VERIFIED** | - | None |
| **REQ-CR-06** | Creator SOP | Sec 12| Creator prohibited from publishing | Creator status stops at review | **VERIFIED** | - | None |
| **REQ-AD-01** | Admin SOP | Sec 4 | Admin Dashboard metrics overview | Live DB counts & revenue | **VERIFIED** | - | None |
| **REQ-AD-02** | Admin SOP | Sec 5 | Creator provisioning & invite email | Implemented via Nodemailer | **VERIFIED** | - | None |
| **REQ-AD-03** | Admin SOP | Sec 7 | Course creation & metadata config | **Missing UI in Admin dashboard** | **MISSING** | **HIGH** | Build Admin Course Creation Form |
| **REQ-AD-04** | Admin SOP | Sec 8 | Video verification & return with feedback| Review queue & logs implemented | **VERIFIED** | - | None |
| **REQ-AD-05** | Admin SOP | Sec 8 | Explicit publication step | Backend route exists; UI missing button | **PARTIAL** | **HIGH** | Add "Publish" action in UI |
| **REQ-AD-06** | Admin SOP | Sec 11| Public page banner & controls | Only "Featured" toggle in UI | **PARTIAL** | **HIGH** | Add visibility & demo selectors |
| **REQ-AD-07** | Admin SOP | Sec 14| Platform reports & audit trail | Audit logs table active | **VERIFIED** | - | None |
| **REQ-WF-01** | Workflow | Sec 4 | Approved != Published separation | Independent DB states and routes | **VERIFIED** | - | None |
| **REQ-WF-02** | Workflow | Sec 5 | Demo is separate from Published | Gated on `course.demoLessonId` | **VERIFIED** | - | Wire to Admin UI |
| **REQ-WF-03** | Workflow | Sec 7 | Server price & offer calculation | Razorpay orders computed on server | **VERIFIED** | - | None |
| **REQ-WF-04** | Workflow | Sec 7 | Confirmed payment required for access| Enrollment activated on valid HMAC | **VERIFIED** | - | None |
| **REQ-WF-05** | Workflow | Sec 9 | Single active video session | Heartbeat & concurrency rejection | **VERIFIED** | - | None |
| **REQ-WF-06** | Workflow | Sec 12| Offer expiry restores base price | Expired offers rejected in checkout | **VERIFIED** | - | Build Admin Offer UI |

---

## 31. Workflow Test Matrix (Flows A through AB)

| Flow ID | Workflow Journey | Precondition | Executed Action | Expected Result | Actual Live Result | Pass/Fail | Evidence |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **A** | Public Discovery | Visitor on `/` | Browse courses, apply category filter | Filtered courses from DB | Courses filter; falls back to static on empty | **PARTIAL** | `CoursesPage.jsx#L43` |
| **B** | Student Registration | Unauthenticated visitor | Submit signup form at `/student/signup` | Account created; login active | User created in DB; session cookie set | **PASS** | `authController.js#L78` |
| **C** | Creator Provisioning | Admin logged in | Invite creator from `/admin/creators` | Creator user created; email sent | User created in DB; temp password generated | **PASS** | `adminController.js#L107` |
| **D** | Course Creation | Admin logged in | Create course via UI | New course registered in DB | **No UI form exists in Admin panel** | **FAIL** | `AdminDashboardPage.jsx#L605` |
| **E** | Creator Assignment | Course exists | Assign creator to course | `CourseCreator` relation created | API works; **No UI exists in Admin panel** | **PARTIAL** | `adminController.js#L374` |
| **F** | Playlist Creation | Creator assigned | Submit playlist form in Creator Studio | Playlist created in DB | Playlist registered in DB | **PASS** | `creatorController.js#L71` |
| **G** | Video Upload | Playlist exists | Creator uploads video | Video binary uploaded to S3 | Text URL stored; no S3 file upload | **FAIL** | `CreatorDashboardPage.jsx#L155` |
| **H** | Video Submission | Lesson in `UPLOADED` | Creator clicks "Submit for Review" | Status -> `SUBMITTED_FOR_REVIEW` | Status updated; audit history logged | **PASS** | `creatorController.js#L182` |
| **I** | Admin Review | Submitted lesson exists | Admin reviews in verification queue | Video previewed, decisions available | Verification queue renders lesson | **PASS** | `adminController.js#L558` |
| **J** | Video Return | Submitted lesson exists | Admin clicks Return with reason | Status -> `RETURNED_FOR_EDIT` | Feedback note saved; Creator notified | **PASS** | `adminController.js#L615` |
| **K** | Resubmission | Returned lesson exists | Creator corrects and resubmits | Status -> `SUBMITTED_FOR_REVIEW` | Review queue updated | **PASS** | `creatorController.js#L180` |
| **L** | Approval | Submitted lesson exists | Admin clicks Approve | Status -> `APPROVED` | Approved in DB; not yet published | **PASS** | `adminController.js#L612` |
| **M** | Publication | Approved lesson exists | Admin publishes lesson | Status -> `PUBLISHED` | API works; **No Publish button in UI** | **PARTIAL** | `adminController.js#L673` |
| **N** | Demo Enable | Approved lesson exists | Admin sets `demoLessonId` | Video becomes public demo | API works; **No Demo UI selector** | **PARTIAL** | `adminController.js#L503` |
| **O** | Free Enrollment | Free course published | Student clicks Enroll Now | Direct enrollment without payment | Activated in `Enrollment` table | **PASS** | `paymentService.js#L55` |
| **P** | Paid Enrollment | Paid course published | Student checks out with Razorpay | Verified payment activates access | HMAC verified; order SUCCESSFUL | **PASS** | `paymentService.js#L202` |
| **Q** | Offer Activation | Admin configures offer | Offer discount applied | Checkout price reflects discount | Backend calculates; **No Admin UI** | **PARTIAL** | `paymentService.js#L98` |
| **R** | Offer Expiry | Offer `endDate` passed | Student checks out with code | Normal price enforced | Expired offer rejected; normal price used | **PASS** | `paymentService.js#L103` |
| **S** | Payment Pending | Order initiated | Student closes Razorpay modal | Access not granted; order PENDING | Enrollment remains inactive | **PASS** | `paymentService.js#L139` |
| **T** | Payment Failure | Order initiated | Signature verification fails | Order marked FAILED | Order FAILED; access rejected | **PASS** | `paymentService.js#L194` |
| **U** | Payment Success | Order paid on gateway | Signature matches HMAC | Enrollment active; email sent | Access active; email dispatched | **PASS** | `paymentService.js#L235` |
| **V** | Student Learning | Student enrolled | Play lesson in player | Saved position resumes; watermark | Resumes position; watermark visible | **PASS** | `LearningPlayerPage.jsx#L136` |
| **W** | Quiz Gating | Quiz on Lesson 1 | Pass required quiz | Lesson 2 unlocks | Server validates quiz; unlocks next | **PASS** | `videoProtectionController.js#L78` |
| **X** | Course Completion | All lessons completed | Check progress reaching 100% | Course marked Completed in DB | Progress percent reaches 100% | **PASS** | `studentController.js#L228` |
| **Y** | Certificate Issuance | 100% progress verified | Student clicks Claim Certificate | Certificate generated in DB | Valid certificate serial issued | **PASS** | `assessmentController.js#L208` |
| **Z** | Support Ticket | Student enrolled | Submit issue ticket | Ticket logged; admin reply stored | Saved to `SupportTicket` table | **PASS** | `studentRoutes.js#L61` |
| **AA**| Access Expiry | `expiresAt` reached | Student attempts playback | Playback rejected with 403 | Rejected: access period has expired | **PASS** | `videoProtectionController.js#L28` |
| **AB**| Session Replacement | Session on Device A | Device B starts video playback | Device A invalidated on heartbeat | Device A paused on 409 Conflict | **PASS** | `videoProtectionController.js#L187` |

---

## 32. Critical Gaps

1. **Hardcoded Demo Credentials on Public Login Page:**
   - **Location:** [`UnifiedLoginPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/auth/UnifiedLoginPage.jsx#L233-L360)
   - **Impact:** Complete administrative account takeover by any visitor with a single click.
2. **Client-Side Progress Spoofing (Certificate Fraud):**
   - **Location:** `POST /api/student/courses/:courseId/lessons/:lessonId/progress` in [`studentController.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/controllers/studentController.js#L180).
   - **Impact:** Any student can bypass video playback, trigger 100% completion in seconds, and obtain official accredited certificates without watching curriculum material.
3. **Frontend Mock Fallback Masking Production Outages:**
   - **Location:** Throughout `StudentDashboardPage.jsx`, `CoursesPage.jsx`, `AdminDashboardPage.jsx`.
   - **Impact:** Misleads administrators and students into believing data exists when backend queries fail or return empty sets.

---

## 33. High Priority Gaps

1. **Missing Admin Course Creation & Creator Assignment UI:**
   - **Location:** [`AdminDashboardPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/admin/AdminDashboardPage.jsx#L605)
   - **Impact:** Administrators cannot initiate new courses or assign creators from the browser interface.
2. **Creator Video File Upload Missing (URL String Substituted):**
   - **Location:** [`CreatorDashboardPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/creator/CreatorDashboardPage.jsx#L155)
   - **Impact:** Creators cannot upload `.mp4` video files directly to S3 as required by Creator SOP.
3. **S3 Presigned URL Split Exception:**
   - **Location:** [`creatorController.js#L348-L354`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/controllers/creatorController.js#L348-L354)
   - **Impact:** Server crashes with `TypeError` when requesting presigned upload URLs with live AWS credentials.
4. **Missing Seek Clamping in Learning Player:**
   - **Location:** [`LearningPlayerPage.jsx#L431`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/student/LearningPlayerPage.jsx#L431)
   - **Impact:** Students can fast-forward scrub straight to the end of unwatched lectures.
5. **Missing Offer Management Interface:**
   - **Location:** `AdminDashboardPage.jsx` Pricing Tab
   - **Impact:** Inability to create, schedule, or manage promo discount codes.

---

## 34. Medium Priority Gaps

1. **Public Catalog Filter Gaps:**
   - Missing Language filter and Free/Paid toggle dropdowns in `CoursesPage.jsx`.
2. **Missing Forgot Password Workflow:**
   - Public Forgot Password and Reset Password request forms are absent from auth routes and UI.
3. **Exit Fullscreen Playback Pause:**
   - `LearningPlayerPage.jsx` does not attach `fullscreenchange` event listeners to pause video on exit.
4. **Post-Login Course Redirection:**
   - Sign-in and registration pages always route to dashboard instead of returning to the course being enrolled in.
5. **Hardcoded URLs in Email Service:**
   - [`emailService.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/services/emailService.js#L64) contains `http://localhost:5173` links in invitation and payment confirmation emails.

---

## 35. Low Priority Gaps

1. **Self-Signed SSL Certificate:**
   - Nginx uses an untrusted self-signed certificate, causing browser security warnings until a real domain and Let's Encrypt / ACM cert are configured.
2. **Admin Horizontal Tab Bar:**
   - 12 tabs rendered in a single scrollable row without logical grouping.
3. **Mobile Table Cards:**
   - Tables on small screens require horizontal scrolling rather than reflowing into responsive cards.

---

## 36. Immediate Fixes

1. **Remove 1-Click Demo Buttons from `UnifiedLoginPage.jsx`:**
   - Strip out lines 213–360 or restrict them to `process.env.NODE_ENV === 'development'`.
2. **Fix S3 Presigned Upload Bug in `creatorController.js`:**
   - Change `const presignedUrl = ...` and extract `presignedUrl.uploadUrl` instead of calling `.split('?')` on the object.
3. **Enforce Watch Time Validation in `studentController.js`:**
   - Require that `watchSeconds >= lesson.durationSeconds * 0.9` before permitting `isCompleted: true`.
4. **Attach Seek Clamping Listener in `LearningPlayerPage.jsx`:**
   - Add `onSeeking` event handler comparing `videoRef.current.currentTime` against `maxWatchedTime`.
5. **Eliminate Mock Fallbacks Masking Errors:**
   - Replace `.catch(() => initialCourses)` with explicit error and empty state UI components.

---

## 37. Future Improvements

1. **CloudFront CDN Distribution:**
   - Place CloudFront in front of the S3 bucket with Signed Cookies for high-speed global video streaming.
2. **AWS WAF & DDoS Shield:**
   - Attach AWS WAF to protect against credential stuffing and volumetric API floods.
3. **Let's Encrypt Automated Certificate Management:**
   - Configure Certbot on Nginx once a public domain is pointed to the EC2 elastic IP.
4. **HLS / DASH Video Transcoding:**
   - Integrate AWS MediaConvert to transcode uploaded MP4s into multi-bitrate HLS streams for adaptive mobile streaming.

---

## 38. Production Risks

1. **Compliance Risk:** Exposing accredited certificates without verified video watch time violates educational accreditation standards.
2. **Security Risk:** Public exposure of default admin credentials enables immediate hostile takeover of database records.
3. **Operational Risk:** If creators cannot upload video files through the UI, course production is completely halted without technical assistance.
4. **Commercial Risk:** Inability to schedule and expire promo offers prevents promotional marketing campaigns.

---

## 39. Deployment Risks

1. **Self-Signed Certificate Trust:** Users accessing `https://13.201.19.85` are confronted with browser security warnings.
2. **Single-Point-of-Failure Compute:** EC2 single instance without auto-scaling or load balancer cannot withstand high concurrent streaming loads.
3. **Database Schema Drift:** Reliance on `prisma db push` in CI/CD without version-controlled migration files can lead to data loss during schema conflicts.

---

## 40. Recommended Remediation Order

```
[ Phase 1: Security Hardening (Immediate) ]
  ├── 1. Remove 1-click demo login buttons from UnifiedLoginPage.jsx
  ├── 2. Patch progress spoofing in studentController.js (validate watch duration)
  └── 3. Remove mock fallbacks from student and admin dashboards

[ Phase 2: Workflow Completion (High) ]
  ├── 4. Add "Create Course" and "Assign Creator" modals in AdminDashboardPage.jsx
  ├── 5. Fix S3 presigned URL bug in creatorController.js
  ├── 6. Implement binary file (.mp4) upload in CreatorDashboardPage.jsx
  └── 7. Add "Publish" button to Admin Video Verification queue

[ Phase 3: Player & Protection Enforcement (High) ]
  ├── 8. Clamp forward seeking in LearningPlayerPage.jsx
  └── 9. Attach fullscreenchange listener to pause on exit

[ Phase 4: Commercial & Account Services (Medium) ]
  ├── 10. Implement Offer management UI and endpoints
  ├── 11. Add Forgot Password request & reset flow
  ├── 12. Fix post-login course redirect in signup/login
  └── 13. Replace hardcoded localhost links in emailService.js

[ Phase 5: Infrastructure & Production Polish (Production Readiness) ]
  ├── 14. Bind custom domain name to EC2 IP
  ├── 15. Issue trusted Let's Encrypt SSL certificate
  └── 16. Configure CloudFront distribution for course video assets
```

---

## 41. Final Production Readiness Status

| Dimension | Readiness Rating | Justification |
| :--- | :---: | :--- |
| **FUNCTIONAL READINESS** | **PARTIAL** | Core workflows work on backend, but Admin Course Creation, Offer UI, and Creator File Upload are missing in the frontend. |
| **SECURITY READINESS** | **NOT READY** | Hardcoded Admin credentials exposed in public login UI; progress spoofing allows unearned certificate issuance. |
| **DATA READINESS** | **READY FOR FIXES** | PostgreSQL schema is comprehensive and relational integrity is enforced; requires removal of frontend mock masking. |
| **PAYMENT READINESS** | **READY FOR STAGING** | Server price calculation, HMAC-SHA256 signature verification, and webhook replay protection are fully implemented. |
| **VIDEO SECURITY READINESS** | **PARTIAL** | Backend concurrency and S3 presigned URLs work; player scrubber forward seek restriction is missing. |
| **CLOUD READINESS** | **PARTIAL** | EC2, RDS, and S3 are functional; missing custom domain, trusted SSL, and CloudFront CDN. |
| **DEPLOYMENT READINESS** | **PARTIAL** | Nginx and PM2 operational; self-signed certificate generates browser warnings. |
| **UI/UX READINESS** | **READY FOR FIXES** | Visually polished and responsive; requires wiring missing admin/creator modals. |
| **SOP COMPLIANCE** | **PARTIAL** | Core principles respected, but specific SOP requirements (file upload, seek clamping, offer scheduling) have gaps. |

---

## 42. Conclusion

The ApexLearn platform possesses a strong structural foundation: an enterprise-grade PostgreSQL schema, clean Prisma ORM models, secure Razorpay cryptographic verification, and single-session video concurrency enforcement.

However, the platform **cannot be considered production-ready in its current state** due to:
1. Publicly exposed administrative credentials on the login screen.
2. The inability of creators to upload video files directly to S3 from the browser.
3. The inability of administrators to create courses or promotional offers from the UI.
4. The lack of forward-seek restrictions in the video player, coupled with client-spoofable course completion.

Remediation must follow the phased plan outlined in [`REMEDIATION_PLAN.md`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/REMEDIATION_PLAN.md).

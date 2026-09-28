# Remediation Plan: ApexLearn Production Hardening

**Document ID:** REM-APEX-2026-V1  
**Target:** Live Production Deployment (`13.201.19.85` / RDS PostgreSQL / S3)  
**Baseline Reference:** [`LIVE_PRODUCTION_GAP_AUDIT.md`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/LIVE_PRODUCTION_GAP_AUDIT.md)  
**Execution Strategy:** Non-Disruptive Phased Rollout (Zero Downtime)

---

## 1. Executive Remediation Summary

This remediation plan establishes the detailed engineering specifications, affected files, database impacts, rollback strategies, and testing requirements to bring the live ApexLearn platform into full compliance with all five authoritative SOP documents and enterprise security standards.

Remediation is broken down into five strictly sequential phases:
- **Phase 1: Critical Security & Integrity Hardening** (Immediate)
- **Phase 2: Core Workflow Completion** (Creator Upload & Admin Operations)
- **Phase 3: Player Compliance & Anti-Piracy Enforcement** (Seek Clamping & Fullscreen)
- **Phase 4: Commercial, Marketing & Account Enhancements** (Offers & Auth)
- **Phase 5: Cloud & Infrastructure Production Readiness** (SSL & CDN)

---

## 2. Remediation Item Breakdown

### Item 1: Remove Hardcoded 1-Click Demo Credentials from Public Login

- **Priority:** **CRITICAL (P0)**
- **Gap:** [`UnifiedLoginPage.jsx`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/frontend/src/pages/auth/UnifiedLoginPage.jsx#L233-L360) displays one-click login buttons with plaintext seed credentials for Student, Creator, and Platform Director (`director@apexlearn.edu:adminSecret2026`).
- **Affected Module:** Authentication & RBAC
- **Affected Screen:** Unified Login (`/login`, `/portal`, `/admin/login`, `/creator/login`, `/student/login`)
- **Affected API:** `POST /api/auth/login`
- **Affected Database:** None (Client-side presentation leak)
- **Security Impact:** Complete administrative and creator account takeover by any public visitor.
- **Business Impact:** High legal, reputational, and compliance liability; potential data wiping or course vandalism.
- **Fix:**
  1. Remove the entire `1-Click Demo Badges Grid` (lines 213–360) from `UnifiedLoginPage.jsx` or conditionally gate behind `import.meta.env.DEV === true && window.location.hostname === 'localhost'`.
  2. In production builds, only render the standard email/password input fields.
- **Testing Required:**
  - Verify that the login card renders strictly email and password fields on production build.
  - Verify manual authentication works for all 3 roles.
  - Inspect DOM in browser devtools to ensure no credential strings remain in JavaScript chunks.
- **Rollback Risk:** Zero risk.
- **Recommended Order:** **1 (Execute immediately)**

---

### Item 2: Prevent Video Watch Time & Progress Spoofing

- **Priority:** **CRITICAL (P0)**
- **Gap:** `POST /api/student/courses/:courseId/lessons/:lessonId/progress` in [`studentController.js`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/controllers/studentController.js#L180) accepts `isCompleted: true` from the client without verifying whether the student actually watched the video lecture.
- **Affected Module:** Learning Progress & Credential Engine
- **Affected Screen:** Learning Player (`/student/courses/:courseId/learn`)
- **Affected API:** `POST /api/student/courses/:courseId/lessons/:lessonId/progress`
- **Affected Database:** `LessonProgress`, `Enrollment`, `Certificate`
- **Security Impact:** Bypasses learning requirements; enables automated certificate harvesting.
- **Business Impact:** Devalues platform certifications, violates accreditation policies, enables fraudulent completion claims.
- **Fix:**
  1. Update `toggleLessonProgress` in `studentController.js`:
     - Fetch lesson duration from `Lesson` table (`durationSeconds`).
     - If `isCompleted: true` is requested, verify that accumulated watch seconds in `LessonProgress` (`watchSeconds`) is at least 90% of `durationSeconds` (`watchSeconds >= lesson.durationSeconds * 0.9`).
     - Only allow `heartbeatVideoSession` to increment `watchSeconds` based on verified session heartbeats (maximum 30 seconds per valid heartbeat).
  2. Deny unauthorized manual completion overrides.
- **Testing Required:**
  - Fire a direct curl `POST /api/student/courses/.../progress` with `{ isCompleted: true, watchSeconds: 0 }`. Ensure it returns `400 Bad Request: Minimum watch threshold not met`.
  - Play a lesson legitimately through the player; ensure heartbeat accumulates watch time and completion triggers at 90%.
- **Rollback Risk:** Low risk (revert controller logic).
- **Recommended Order:** **2 (Execute immediately)**

---

### Item 3: Eliminate Frontend Mock Fallbacks Masking Production Errors

- **Priority:** **CRITICAL (P0)**
- **Gap:** `StudentDashboardPage.jsx`, `CoursesPage.jsx`, `AdminDashboardPage.jsx`, and `CreatorDashboardPage.jsx` use `.catch(() => null)` and fallback to hardcoded arrays in `initialData.js` when API calls return empty sets or fail.
- **Affected Module:** All Frontend Dashboard & Catalog Modules
- **Affected Screen:** All student, creator, admin, and catalog pages
- **Affected API:** All `/api/*` endpoints
- **Affected Database:** None (Frontend display masking)
- **Security Impact:** Masks authorization failures, database disconnections, and empty student state.
- **Business Impact:** Misleads users and admins into believing actions succeeded or data exists; new students see certificates/orders they never earned or purchased.
- **Fix:**
  1. Remove static fallback assignments (`initialCourses`, `initialCertificates`, `initialTransactions`) in `useEffect` fetch handlers across:
     - `StudentDashboardPage.jsx`
     - `CoursesPage.jsx`
     - `AdminDashboardPage.jsx`
     - `CreatorDashboardPage.jsx`
     - `LearningPlayerPage.jsx`
  2. Implement proper empty states:
     - "You have not enrolled in any courses yet. Explore Catalog."
     - "No certificates issued yet. Complete a course to earn your credential."
     - "No transactions recorded."
     - "No video submissions in verification queue."
  3. Display clear error banners when API calls fail with 401, 403, or 500 errors.
- **Testing Required:**
  - Register a new student and verify their dashboard displays 0 courses, 0 certificates, and 0 payments.
  - Temporarily stop backend and confirm user receives an informative network/server error banner rather than mock data.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **3 (Execute immediately)**

---

### Item 4: Add Admin Course Creation & Creator Assignment UI

- **Priority:** **HIGH (P1)**
- **Gap:** `AdminDashboardPage.jsx` has no button, modal, or form to create a new course (`POST /api/admin/courses`) or assign creators to a course (`prisma.courseCreator`).
- **Affected Module:** Course Management
- **Affected Screen:** Admin Courses Tab (`/admin/courses`)
- **Affected API:** `POST /api/admin/courses`, `PATCH /api/admin/courses/:courseId`
- **Affected Database:** `Course`, `CourseCreator`
- **Security Impact:** None (RBAC on endpoint is already verified).
- **Business Impact:** Administrators cannot create new courses or assign instructors from the browser interface; violates Step 1 & 2 of the Revised Workflow.
- **Fix:**
  1. Add a "+ Create New Course" button at the top of the Courses tab in `AdminDashboardPage.jsx`.
  2. Build a modal with fields matching `schema.prisma`:
     - Title, Slug (auto-generated), Category, Level, Language, Estimated Duration, Access Duration (days), Thumbnail URL.
     - Base Price, Discount %, Free vs Paid toggle.
     - Creator multi-select dropdown (populated from `GET /api/admin/creators`).
     - Certificate Enabled checkbox.
     - Learning Outcomes and Prerequisites text list inputs.
  3. Wire the submission handler to `api.admin.createCourse(payload)`.
- **Testing Required:**
  - Create a course titled "Advanced PyTorch Engineering" via the modal.
  - Assign Creator "Dr. Alex Rivera".
  - Verify course appears in database, Admin course table, and Creator's assigned courses list.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **4**

---

### Item 5: Fix S3 Presigned Upload Exception in Creator Controller

- **Priority:** **HIGH (P1)**
- **Gap:** In [`creatorController.js#L348-L354`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/controllers/creatorController.js#L348-L354), `presignedUrl.split('?')[0]` is called on the object `{ uploadUrl, key, bucket }` returned by `s3Service.getPresignedUploadUrl`, throwing `TypeError: presignedUrl.split is not a function`.
- **Affected Module:** Creator Video Ingestion & S3 Service
- **Affected Screen:** Creator Upload (`/creator/upload`)
- **Affected API:** `POST /api/creator/videos/presigned-url`
- **Affected Database:** None (Runtime logic error)
- **Security Impact:** None.
- **Business Impact:** 100% crash rate when requesting direct S3 upload URLs with active AWS credentials.
- **Fix:**
  1. Refactor `getUploadPresignedUrl` in `creatorController.js`:
     ```javascript
     const presignedResult = await s3Service.getPresignedUploadUrl(objectKey, fileType, 3600)
     const uploadUrl = presignedResult.uploadUrl || presignedResult
     const fileUrl = uploadUrl.split('?')[0]

     return successResponse(res, {
       uploadUrl,
       objectKey,
       fileUrl
     }, 'Presigned S3 upload URL generated')
     ```
- **Testing Required:**
  - Call `POST /api/creator/videos/presigned-url` with `{ fileName: "lesson01.mp4", fileType: "video/mp4", courseId: "course-123" }`.
  - Verify JSON response returns status 200 with valid `uploadUrl`, `objectKey`, and `fileUrl`.
- **Rollback Risk:** Zero risk.
- **Recommended Order:** **5**

---

### Item 6: Implement Binary Video File (.mp4) Upload in Creator Studio

- **Priority:** **HIGH (P1)**
- **Gap:** `CreatorDashboardPage.jsx` upload form has a text input for video URL instead of a file upload input (`<input type="file" accept="video/mp4">`), violating Section 7 of `Creator Role SOP V1`.
- **Affected Module:** Creator Studio
- **Affected Screen:** Creator Upload (`/creator/upload`)
- **Affected API:** `POST /api/creator/videos/presigned-url`, S3 `PUT`, `POST /api/creator/videos`
- **Affected Database:** `Lesson.videoUrl`, `Lesson.s3Key`
- **Security Impact:** None (Storage bucket is private; presigned URL enforces key and MIME type).
- **Business Impact:** Creators cannot upload real video files; platform depends on external demo video links.
- **Fix:**
  1. Replace `<input type="url">` in `CreatorDashboardPage.jsx` with `<input type="file" accept="video/mp4,video/quicktime,video/webm">`.
  2. Implement direct S3 upload handler:
     - On file selection, read file name, size, and MIME type.
     - Call `api.creator.getPresignedUploadUrl({ fileName, fileType, courseId })`.
     - Execute `fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': fileType }, body: file })` with upload progress indicator.
     - Upon upload completion, submit lesson metadata (`title`, `description`, `duration`, `s3Key: objectKey`, `videoUrl: fileUrl`) to `api.creator.uploadVideo(payload)`.
- **Testing Required:**
  - Select a local `.mp4` file (e.g. 50MB test video).
  - Observe progress bar upload directly to AWS S3 bucket `aivortex`.
  - Verify lesson record created in PostgreSQL with valid `s3Key`.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **6**

---

### Item 7: Add Explicit "Publish" Action in Admin Video Management

- **Priority:** **HIGH (P1)**
- **Gap:** `adminRoutes.js` contains `POST /api/admin/lessons/:lessonId/publish`, but `AdminDashboardPage.jsx` Verification Queue tab only provides "Approve" and "Return". Once approved, there is no UI button to transition the lesson from `APPROVED` to `PUBLISHED`.
- **Affected Module:** Content State Machine
- **Affected Screen:** Admin Verification Queue & Course Details (`/admin/playlists`, `/admin/courses`)
- **Affected API:** `POST /api/admin/lessons/:lessonId/publish`
- **Affected Database:** `Lesson.status`, `VideoStatusHistory`
- **Security Impact:** None.
- **Business Impact:** Blocks approved lessons from becoming viewable by enrolled students via standard UI operations; violates Step 7 of the Revised Workflow.
- **Fix:**
  1. In `AdminDashboardPage.jsx`, add an "Approved Lessons (Awaiting Publication)" section or expand the table.
  2. For lessons in `APPROVED` status, provide a green "Publish to Students" button calling `api.admin.publishLesson(lessonId)`.
  3. Add an "Unpublish / Retract" action for published lessons.
- **Testing Required:**
  - Transition a lesson: `SUBMITTED_FOR_REVIEW` -> click "Approve" -> status becomes `APPROVED`.
  - Click "Publish to Students" -> status becomes `PUBLISHED`.
  - Verify enrolled student can now stream the lesson.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **7**

---

### Item 8: Enforce Video Player Forward-Seek Clamping

- **Priority:** **HIGH (P1)**
- **Gap:** In `LearningPlayerPage.jsx`, standard HTML5 video controls allow students to scrub forward into unwatched video content, violating Section 06 of `Student_Panel_SOP`.
- **Affected Module:** Learning Player
- **Affected Screen:** Learning Player (`/student/courses/:courseId/learn`)
- **Affected API:** None (Client-side player event clamping)
- **Affected Database:** None
- **Security Impact:** Allows bypassing pedagogical sequencing.
- **Business Impact:** Non-compliance with approved Student SOP.
- **Fix:**
  1. In `LearningPlayerPage.jsx`, track `maxTimeWatched = useRef(0)`.
  2. Attach `onTimeUpdate` to update `maxTimeWatched.current = Math.max(maxTimeWatched.current, videoRef.current.currentTime)`.
  3. Attach `onSeeking` event listener:
     ```javascript
     const handleSeeking = () => {
       const delta = videoRef.current.currentTime - maxTimeWatched.current
       if (delta > 2) { // Allow max 2s buffer for network jitter
         videoRef.current.currentTime = maxTimeWatched.current
         showToast('Forward seeking is restricted on unwatched lecture content.', 'info')
       }
     }
     ```
  4. Allow free scrubbing backward (rewind and replay).
- **Testing Required:**
  - Start video at 00:00. Attempt to drag playhead to 10:00.
  - Verify playhead immediately snaps back to 00:00 and toast notification appears.
  - Let video play to 02:00. Rewind to 00:30 (allowed). Scrub forward to 01:50 (allowed). Attempt scrub to 05:00 (clamped to 02:00).
- **Rollback Risk:** Low risk.
- **Recommended Order:** **8**

---

### Item 9: Enforce Playback Pause on Leaving Fullscreen

- **Priority:** **MEDIUM (P2)**
- **Gap:** `LearningPlayerPage.jsx` does not detect fullscreen exit to pause playback as specified in Section 06 of `Student_Panel_SOP`.
- **Affected Module:** Learning Player
- **Affected Screen:** Learning Player (`/student/courses/:courseId/learn`)
- **Affected API:** None
- **Affected Database:** None
- **Security Impact:** None.
- **Business Impact:** Non-compliance with Student SOP playback controls.
- **Fix:**
  1. Add `fullscreenchange` and `webkitfullscreenchange` event listener in `LearningPlayerPage.jsx`.
  2. When `document.fullscreenElement === null` and video was actively playing, pause video playback and display a "Resume in Fullscreen" overlay button.
- **Testing Required:**
  - Enter fullscreen, play video, press ESC or exit fullscreen.
  - Verify video pauses immediately.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **9**

---

### Item 10: Implement Admin Offer Management UI & Endpoints

- **Priority:** **HIGH (P1)**
- **Gap:** The database has `model Offer`, but `adminRoutes.js` and `adminController.js` have no CRUD endpoints, and `AdminDashboardPage.jsx` has no interface to create, schedule, or expire promotional offers (violates Workflow Section 05 & 12).
- **Affected Module:** Commercial & Marketing Governance
- **Affected Screen:** Admin Pricing & Offers Tab (`/admin/pricing`)
- **Affected API:** `GET /api/admin/offers`, `POST /api/admin/offers`, `PATCH /api/admin/offers/:id`, `DELETE /api/admin/offers/:id`
- **Affected Database:** `Offer`
- **Security Impact:** None (Protected by `requireRole('ADMIN')`).
- **Business Impact:** Inability to run marketing campaigns, launch discounts, or time-limited promotions.
- **Fix:**
  1. Implement controller methods in `adminController.js` and mount routes in `adminRoutes.js`:
     - `getOffers`, `createOffer`, `updateOffer`, `deleteOffer`.
  2. In `AdminDashboardPage.jsx` Pricing & Offers tab:
     - Add an "Active Promotional Offers" card and table.
     - Add a "Create Promo Offer" form with fields: Code, Discount %, Discount Amount, Start Date/Time, End Date/Time, Max Uses.
- **Testing Required:**
  - Create offer `AI2026` with 25% discount valid for the next 48 hours.
  - Verify checkout calculates 25% off when code is entered.
  - Set end date to yesterday and verify checkout rejects the code with "Offer expired".
- **Rollback Risk:** Low risk.
- **Recommended Order:** **10**

---

### Item 11: Implement Public Forgot Password & Password Reset Workflows

- **Priority:** **HIGH (P1)**
- **Gap:** Public Forgot Password and Reset Password endpoints and UI forms are missing, violating Section 2 of `Student_Panel_SOP`.
- **Affected Module:** Authentication & Account Security
- **Affected Screen:** Unified Login (`/login`), Forgot Password Modal, Reset Password Page (`/reset-password?token=...`)
- **Affected API:** `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- **Affected Database:** `PasswordResetToken`
- **Security Impact:** Users locked out of accounts cannot regain access securely without manual DB intervention.
- **Business Impact:** High customer support burden, student churn.
- **Fix:**
  1. Add `forgotPassword` in `authController.js`:
     - Lookup user by email. If found, generate 32-byte cryptographically secure token (`crypto.randomBytes(32).toString('hex')`).
     - Store hash of token in `PasswordResetToken` table with 1-hour expiration.
     - Dispatch email via `emailService.sendPasswordReset({ toEmail, resetUrl })`.
     - Always return generic success to prevent email enumeration.
  2. Add `resetPassword` in `authController.js`:
     - Verify token exists and `expiresAt > new Date()` and `usedAt === null`.
     - Hash new password with `bcryptjs`.
     - Update user password and mark token as used in a transaction.
  3. Add "Forgot Password?" link on `UnifiedLoginPage.jsx` opening an email prompt modal.
  4. Create `/reset-password` page in frontend routes.
- **Testing Required:**
  - Request reset for registered student.
  - Follow email token link, submit new password.
  - Verify old password fails and new password succeeds.
  - Re-use the token and verify it is rejected as already used.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **11**

---

### Item 12: Preserve Course Enrollment Intent Across Login & Registration

- **Priority:** **MEDIUM (P2)**
- **Gap:** Unauthenticated visitors clicking "Enroll Now" are prompted to log in or register, but upon successful auth they are unconditionally redirected to `/student/dashboard` instead of returning to the selected course checkout (violates Public SOP Section 7).
- **Affected Module:** Public Catalog & Onboarding
- **Affected Screen:** Unified Login (`/login`), Student Signup (`/student/signup`)
- **Affected API:** None (Client-side routing state)
- **Affected Database:** None
- **Security Impact:** None.
- **Business Impact:** Checkout drop-off; friction during enrollment conversion.
- **Fix:**
  1. When "Enroll Now" is clicked by an unauthenticated visitor, navigate to `/login?redirect=/courses/${courseId}&enroll=true`.
  2. In `UnifiedLoginPage.jsx` and `StudentSignupPage.jsx`, read `useSearchParams()`.
  3. Upon successful login/signup:
     ```javascript
     const redirect = searchParams.get('redirect')
     if (redirect) {
       navigate(`${redirect}?enroll=true`)
     } else {
       navigate('/student/dashboard')
     }
     ```
  4. In `CoursesPage.jsx`, if `?enroll=true` is present in URL, automatically open the payment/enrollment modal for that course.
- **Testing Required:**
  - Visit `/courses/course-1-pyds` in incognito.
  - Click "Enroll Now" -> redirected to login.
  - Log in -> automatically returned to `/courses/course-1-pyds` with the enrollment checkout modal open.
- **Rollback Risk:** Zero risk.
- **Recommended Order:** **12**

---

### Item 13: Replace Hardcoded Localhost URLs in Email Service

- **Priority:** **MEDIUM (P2)**
- **Gap:** [`emailService.js#L64`](file:///d:/AESCION/Work/Projects/Aivortex/project_aivortex/backend/src/services/emailService.js#L64) and line 92 contain hardcoded `http://localhost:5173` links for creator invitation and student payment confirmations.
- **Affected Module:** Email Notification Service
- **Affected Screen:** None
- **Affected API:** Triggered by creator invite and payment verification
- **Affected Database:** None
- **Security Impact:** None.
- **Business Impact:** External users receiving real emails receive broken links pointing to their local machine.
- **Fix:**
  1. Use `env.CLIENT_URL` or `process.env.APP_URL || 'http://13.201.19.85'` dynamically in email templates.
- **Testing Required:**
  - Trigger creator invitation and inspect generated HTML body.
  - Confirm link points to `http://13.201.19.85/creator/login` instead of `localhost:5173`.
- **Rollback Risk:** Zero risk.
- **Recommended Order:** **13**

---

### Item 14: Implement Complete Public Page Controls in Admin Dashboard

- **Priority:** **HIGH (P1)**
- **Gap:** `AdminDashboardPage.jsx` Public Controls tab only allows toggling `isFeatured`. It does not allow changing Course Status (`PUBLISHED`, `HIDDEN`, `ARCHIVED`), selecting/disabling Public Demo Lesson, or toggling Enrollment Open/Closed.
- **Affected Module:** Public Page Governance
- **Affected Screen:** Admin Public Controls Tab (`/admin/public-controls`)
- **Affected API:** `PATCH /api/admin/courses/:courseId/public-controls`
- **Affected Database:** `Course.status`, `Course.demoLessonId`, `Course.enrollmentOpen`, `Lesson.isPublicDemo`
- **Security Impact:** None.
- **Business Impact:** Administrators cannot unpublish a course, close enrollments, or attach approved demo videos from the UI.
- **Fix:**
  1. Expand each course card in the Public Controls tab with:
     - Status selector: `PUBLISHED` (visible in catalog), `HIDDEN` (enrolled access only, hidden from catalog), `DRAFT` / `ARCHIVED`.
     - Enrollment Open / Closed toggle switch.
     - Public Demo Lesson selector: dropdown listing approved/published lessons from that course, plus "Disable Demo" option.
  2. Wire save handler to `api.admin.updatePublicControls(courseId, payload)`.
- **Testing Required:**
  - Select an approved lesson as Demo. Verify "Watch Demo" appears on public course detail modal.
  - Toggle course status from `PUBLISHED` to `HIDDEN`. Verify course disappears from public `/courses` catalog but remains accessible to already enrolled students.
- **Rollback Risk:** Low risk.
- **Recommended Order:** **14**

---

### Item 15: Configure Custom Domain, Let's Encrypt SSL & CloudFront CDN

- **Priority:** **HIGH (P1 Infrastructure)**
- **Gap:** System currently runs on direct IP `13.201.19.85` with an untrusted self-signed SSL certificate, causing browser warnings ("Not Secure"). Videos stream directly from S3 without CloudFront edge caching.
- **Affected Module:** Cloud Infrastructure & Deployment
- **Affected Screen:** All public and protected screens
- **Affected API:** All endpoints
- **Affected Database:** None
- **Security Impact:** Potential Man-in-the-Middle (MitM) risk when self-signed certificate is bypassed.
- **Business Impact:** Critical conversion blocker; students and corporate clients will not transact on a "Not Secure" browser warning.
- **Fix:**
  1. Point custom domain (e.g. `learn.aivortex.in` or similar) DNS A-record to `13.201.19.85`.
  2. Run `certbot --nginx -d <domain>` to issue a trusted, auto-renewing Let's Encrypt TLS certificate.
  3. Update Nginx configuration for HTTP/2 and modern cipher suites.
  4. Create an AWS CloudFront distribution pointing to S3 bucket `aivortex` with signed cookies / URLs for low-latency video streaming.
- **Testing Required:**
  - Navigate to domain in Chrome, Firefox, Safari, and Mobile.
  - Verify padlock icon is green / secure with zero browser warnings.
  - Verify Razorpay payment gateway functions seamlessly on HTTPS.
- **Rollback Risk:** Low risk (DNS / Nginx config can be reverted).
- **Recommended Order:** **15**

---

## 3. Remediation Tracking Summary Table

| Step | Action Item | Target File(s) | Complexity | Downtime Required |
| :---: | :--- | :--- | :---: | :---: |
| **01** | Remove 1-click demo login buttons | `frontend/src/pages/auth/UnifiedLoginPage.jsx` | Low | None |
| **02** | Validate watch time in progress endpoint | `backend/src/controllers/studentController.js` | Medium | None (PM2 reload) |
| **03** | Replace mock fallbacks with empty states | `frontend/src/pages/student/`, `admin/`, `public/` | Medium | None |
| **04** | Add Admin Course Creation Modal | `frontend/src/pages/admin/AdminDashboardPage.jsx` | Medium | None |
| **05** | Fix S3 presigned URL object split bug | `backend/src/controllers/creatorController.js` | Low | None (PM2 reload) |
| **06** | Implement binary MP4 upload in Creator Studio | `frontend/src/pages/creator/CreatorDashboardPage.jsx` | High | None |
| **07** | Add "Publish" action to Admin review queue | `frontend/src/pages/admin/AdminDashboardPage.jsx` | Low | None |
| **08** | Implement player seek clamping | `frontend/src/pages/student/LearningPlayerPage.jsx` | Medium | None |
| **09** | Attach exit fullscreen pause listener | `frontend/src/pages/student/LearningPlayerPage.jsx` | Low | None |
| **10** | Add Offer management UI and endpoints | `adminRoutes.js`, `adminController.js`, `AdminDashboardPage.jsx` | High | None (PM2 reload) |
| **11** | Implement Forgot/Reset password workflow | `authRoutes.js`, `authController.js`, `emailService.js`, UI | High | None (PM2 reload) |
| **12** | Preserve course redirect on login/signup | `UnifiedLoginPage.jsx`, `StudentSignupPage.jsx`, `CoursesPage.jsx` | Medium | None |
| **13** | Replace localhost URLs in email service | `backend/src/services/emailService.js` | Low | None (PM2 reload) |
| **14** | Expand Admin Public Controls interface | `frontend/src/pages/admin/AdminDashboardPage.jsx` | Medium | None |
| **15** | Domain setup, Let's Encrypt SSL, CloudFront | EC2 Nginx, AWS Console, DNS Provider | High | None (Brief Nginx reload) |

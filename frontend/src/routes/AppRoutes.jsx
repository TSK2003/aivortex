import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ErrorBoundary from '../components/common/ErrorBoundary'

/**
 * RouteLoader - Lightweight accessible enterprise loading state
 * Rendered when lazy-loaded page chunks are being fetched.
 */
function RouteLoader() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
        padding: '32px 16px'
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading workspace content"
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--color-border, #E2E8F0)',
          borderTopColor: 'var(--color-primary, #4F46E5)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted, #64748B)', fontWeight: 600 }}>
        Loading workspace...
      </span>
    </div>
  )
}

// Lazy-loaded Public Pages (Section 5.30)
const HomePage = lazy(() => import('../pages/public/HomePage'))
const CoursesPage = lazy(() => import('../pages/public/CoursesPage'))
const ProjectsPage = lazy(() => import('../pages/public/ProjectsPage'))
const LiveSessionsPage = lazy(() => import('../pages/public/LiveSessionsPage'))
const CertificateVerificationPage = lazy(() => import('../pages/public/CertificateVerificationPage'))
const AboutPage = lazy(() => import('../pages/public/AboutPage'))
const ContactPage = lazy(() => import('../pages/public/ContactPage'))
const FaqPage = lazy(() => import('../pages/public/FaqPage'))
const TermsPage = lazy(() => import('../pages/public/TermsPage'))
const PrivacyPage = lazy(() => import('../pages/public/PrivacyPage'))
const UnifiedLoginPage = lazy(() => import('../pages/auth/UnifiedLoginPage'))
const LogoAnimationPreviewPage = lazy(() => import('../pages/public/LogoAnimationPreviewPage'))

// Lazy-loaded Auth Pages
const StudentSignupPage = lazy(() => import('../pages/student/StudentSignupPage'))

// Lazy-loaded Role Dashboard Pages
const StudentDashboardPage = lazy(() => import('../pages/student/StudentDashboardPage'))
const CreatorDashboardPage = lazy(() => import('../pages/creator/CreatorDashboardPage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminCreateCoursePage = lazy(() => import('../pages/admin/AdminCreateCoursePage'))
const AdminCreateCreatorPage = lazy(() => import('../pages/admin/AdminCreateCreatorPage'))
const LearningPlayerPage = lazy(() => import('../pages/student/LearningPlayerPage'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* Public Pages with Full Header & Footer */}
        <Route
          element={
            <ErrorBoundary>
              <PublicLayout />
            </ErrorBoundary>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CoursesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/live-sessions" element={<LiveSessionsPage />} />
          <Route path="/certificates" element={<CertificateVerificationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/logo-intro" element={<LogoAnimationPreviewPage />} />
        </Route>

        {/* Fullscreen Video Learning Player (Student Only) */}
        <Route
          path="/student/courses/:courseId/learn"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <LearningPlayerPage />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        />

        {/* Unified Single Login & Registration */}
        <Route
          element={
            <ErrorBoundary>
              <AuthLayout />
            </ErrorBoundary>
          }
        >
          <Route path="/portal" element={<UnifiedLoginPage />} />
          <Route path="/login" element={<UnifiedLoginPage />} />
          <Route path="/student/login" element={<UnifiedLoginPage />} />
          <Route path="/creator/login" element={<UnifiedLoginPage />} />
          <Route path="/admin/login" element={<UnifiedLoginPage />} />
          <Route path="/student/signup" element={<StudentSignupPage />} />
          <Route path="/signup" element={<StudentSignupPage />} />
          <Route path="/register" element={<StudentSignupPage />} />
        </Route>

        {/* Student Portal (Protected) */}
        <Route
          path="/student"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={['student']}>
                <DashboardLayout role="student" />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="courses" element={<StudentDashboardPage />} />
          <Route path="projects" element={<StudentDashboardPage />} />
          <Route path="live-sessions" element={<StudentDashboardPage />} />
          <Route path="certificates" element={<StudentDashboardPage />} />
          <Route path="payments" element={<StudentDashboardPage />} />
          <Route path="notifications" element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentDashboardPage />} />
          <Route path="support" element={<StudentDashboardPage />} />
        </Route>

        {/* Creator Portal (Protected) */}
        <Route
          path="/creator"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={['creator']}>
                <DashboardLayout role="creator" />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        >
          <Route index element={<Navigate to="/creator/dashboard" replace />} />
          <Route path="dashboard" element={<CreatorDashboardPage />} />
          <Route path="courses" element={<CreatorDashboardPage />} />
          <Route path="courses/:courseId" element={<CreatorDashboardPage />} />
          <Route path="analytics" element={<Navigate to="/creator/dashboard" replace />} />
          <Route path="earnings" element={<Navigate to="/creator/dashboard" replace />} />
          <Route path="messages" element={<CreatorDashboardPage />} />
          <Route path="library" element={<CreatorDashboardPage />} />
          <Route path="content" element={<Navigate to="/creator/library" replace />} />
          <Route path="review" element={<Navigate to="/creator/feedback" replace />} />
          <Route path="feedback" element={<CreatorDashboardPage />} />
          <Route path="profile" element={<CreatorDashboardPage />} />
          <Route path="settings" element={<Navigate to="/creator/profile" replace />} />
          <Route path="playlists" element={<Navigate to="/creator/courses" replace />} />
          <Route path="upload" element={<Navigate to="/creator/courses" replace />} />
          <Route path="submissions" element={<Navigate to="/creator/feedback" replace />} />
          <Route path="profile-request" element={<Navigate to="/creator/profile" replace />} />
        </Route>

        {/* Admin Portal (Protected) */}
        <Route
          path="/admin"
          element={
            <ErrorBoundary>
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            </ErrorBoundary>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="creators/create" element={<AdminCreateCreatorPage />} />
          <Route path="creators" element={<AdminDashboardPage />} />
          <Route path="students" element={<AdminDashboardPage />} />
          <Route path="courses/create" element={<AdminCreateCoursePage />} />
          <Route path="courses/:courseId/edit" element={<AdminCreateCoursePage />} />
          <Route path="courses/edit" element={<AdminCreateCoursePage />} />
          <Route path="courses" element={<AdminDashboardPage />} />
          <Route path="playlists" element={<AdminDashboardPage />} />
          <Route path="video-verification" element={<AdminDashboardPage />} />
          <Route path="pricing" element={<AdminDashboardPage />} />
          <Route path="offers" element={<AdminDashboardPage />} />
          <Route path="public-page" element={<AdminDashboardPage />} />
          <Route path="public-controls" element={<AdminDashboardPage />} />
          <Route path="projects" element={<AdminDashboardPage />} />
          <Route path="live-sessions" element={<AdminDashboardPage />} />
          <Route path="reviews" element={<AdminDashboardPage />} />
          <Route path="payments" element={<AdminDashboardPage />} />
          <Route path="notifications" element={<AdminDashboardPage />} />
          <Route path="requests" element={<AdminDashboardPage />} />
          <Route path="reports" element={<AdminDashboardPage />} />
          <Route path="audit-logs" element={<AdminDashboardPage />} />
          <Route path="security" element={<AdminDashboardPage />} />
          <Route path="profile" element={<AdminDashboardPage />} />
          <Route path="support" element={<AdminDashboardPage />} />
          <Route path="enquiries" element={<AdminDashboardPage />} />
        </Route>

        {/* Global Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'

// Public Pages
import HomePage from '../pages/public/HomePage'
import CoursesPage from '../pages/public/CoursesPage'
import ProjectsPage from '../pages/public/ProjectsPage'
import LiveSessionsPage from '../pages/public/LiveSessionsPage'
import CertificateVerificationPage from '../pages/public/CertificateVerificationPage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'
import FaqPage from '../pages/public/FaqPage'
import TermsPage from '../pages/public/TermsPage'
import PrivacyPage from '../pages/public/PrivacyPage'
import UnifiedLoginPage from '../pages/auth/UnifiedLoginPage'
import LogoAnimationPreviewPage from '../pages/public/LogoAnimationPreviewPage'

// Auth & Role Pages
import StudentSignupPage from '../pages/student/StudentSignupPage'

// Role Dashboard Pages
import StudentDashboardPage from '../pages/student/StudentDashboardPage'
import CreatorDashboardPage from '../pages/creator/CreatorDashboardPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminCreateCoursePage from '../pages/admin/AdminCreateCoursePage'
import AdminCreateCreatorPage from '../pages/admin/AdminCreateCreatorPage'
import LearningPlayerPage from '../pages/student/LearningPlayerPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages with Full Header & Footer */}
      <Route element={<PublicLayout />}>
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
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <LearningPlayerPage />
          </ProtectedRoute>
        }
      />

      {/* Unified Single Login & Registration */}
      <Route element={<AuthLayout />}>
        <Route path="/portal" element={<UnifiedLoginPage />} />
        <Route path="/login" element={<UnifiedLoginPage />} />
        <Route path="/student/login" element={<UnifiedLoginPage />} />
        <Route path="/creator/login" element={<UnifiedLoginPage />} />
        <Route path="/admin/login" element={<UnifiedLoginPage />} />
        <Route path="/student/signup" element={<StudentSignupPage />} />
      </Route>

      {/* Student Portal (Protected) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout role="student" />
          </ProtectedRoute>
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
          <ProtectedRoute allowedRoles={['creator']}>
            <DashboardLayout role="creator" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/creator/dashboard" replace />} />
        <Route path="dashboard" element={<CreatorDashboardPage />} />
        <Route path="courses" element={<CreatorDashboardPage />} />
        <Route path="courses/:courseId" element={<CreatorDashboardPage />} />
        <Route path="analytics" element={<CreatorDashboardPage />} />
        <Route path="earnings" element={<CreatorDashboardPage />} />
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
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
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
  )
}

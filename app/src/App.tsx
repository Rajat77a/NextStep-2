import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import PortalNav from '@/components/shared/PortalNav';
import { PageTransitionProvider } from '@/contexts/PageTransitionContext';

// Landing
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));

// Auth
const AuthPage = React.lazy(() => import('@/pages/AuthPage'));
const AuthCallback = React.lazy(() => import('@/pages/AuthCallback'));

// Parent Portal
const ParentDashboard = React.lazy(() => import('@/pages/parent/ParentDashboard'));
const UploadReport = React.lazy(() => import('@/pages/parent/UploadReport'));
const ClarityCheck = React.lazy(() => import('@/pages/parent/ClarityCheck'));
const ConversationGuide = React.lazy(() => import('@/pages/parent/ConversationGuide'));
const TeacherQuestions = React.lazy(() => import('@/pages/parent/TeacherQuestions'));
const DayPlan = React.lazy(() => import('@/pages/parent/DayPlan'));
const ProgressTracking = React.lazy(() => import('@/pages/parent/ProgressTracking'));
const ParentSettings = React.lazy(() => import('@/pages/parent/ParentSettings'));

// Teacher Portal
const TeacherDashboard = React.lazy(() => import('@/pages/teacher/TeacherDashboard'));
const TeacherClasses = React.lazy(() => import('@/pages/teacher/TeacherClasses'));
const ClassPatterns = React.lazy(() => import('@/pages/teacher/ClassPatterns'));
const TeacherSettings = React.lazy(() => import('@/pages/teacher/TeacherSettings'));

// Admin Portal
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const ClassManagement = React.lazy(() => import('@/pages/admin/ClassManagement'));
const StudentRoster = React.lazy(() => import('@/pages/admin/StudentRoster'));
const TeacherManagement = React.lazy(() => import('@/pages/admin/TeacherManagement'));
const SubscriptionPage = React.lazy(() => import('@/pages/admin/SubscriptionPage'));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings'));

function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalNav />
      {/* desktop: offset for 68px collapsed sidebar | mobile: offset for top bar + bottom tab bar */}
      <div className="md:pl-[68px] pt-14 md:pt-0 pb-16 md:pb-0 min-h-screen bg-cream">
        {children}
      </div>
    </>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, loading, loggingOut } = useAuth();
  if (loading || loggingOut) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return <PortalLayout>{children}</PortalLayout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <PageTransitionProvider>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <AuthPage initialMode="login" />} />
          <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} replace /> : <AuthPage initialMode="signup" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Parent Portal */}
          <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />
          <Route path="/parent/upload" element={<ProtectedRoute allowedRoles={['parent']}><UploadReport /></ProtectedRoute>} />
          <Route path="/parent/clarity" element={<ProtectedRoute allowedRoles={['parent']}><ClarityCheck /></ProtectedRoute>} />
          <Route path="/parent/conversation" element={<ProtectedRoute allowedRoles={['parent']}><ConversationGuide /></ProtectedRoute>} />
          <Route path="/parent/questions" element={<ProtectedRoute allowedRoles={['parent']}><TeacherQuestions /></ProtectedRoute>} />
          <Route path="/parent/plan" element={<ProtectedRoute allowedRoles={['parent']}><DayPlan /></ProtectedRoute>} />
          <Route path="/parent/progress" element={<ProtectedRoute allowedRoles={['parent']}><ProgressTracking /></ProtectedRoute>} />
          <Route path="/parent/settings" element={<ProtectedRoute allowedRoles={['parent']}><ParentSettings /></ProtectedRoute>} />

          {/* Teacher Portal */}
          <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClasses /></ProtectedRoute>} />
          <Route path="/teacher/patterns" element={<ProtectedRoute allowedRoles={['teacher']}><ClassPatterns /></ProtectedRoute>} />
          <Route path="/teacher/settings" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherSettings /></ProtectedRoute>} />

          {/* Admin Portal */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><ClassManagement /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><StudentRoster /></ProtectedRoute>} />
          <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><TeacherManagement /></ProtectedRoute>} />
          <Route path="/admin/subscription" element={<ProtectedRoute allowedRoles={['admin']}><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </PageTransitionProvider>
  );
}

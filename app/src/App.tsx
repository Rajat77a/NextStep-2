import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import PortalNav from '@/components/shared/PortalNav';

// Landing
import LandingPage from '@/pages/LandingPage';

// Auth
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';

// Parent Portal
import ParentDashboard from '@/pages/parent/ParentDashboard';
import UploadReport from '@/pages/parent/UploadReport';
import ClarityCheck from '@/pages/parent/ClarityCheck';
import ConversationGuide from '@/pages/parent/ConversationGuide';
import TeacherQuestions from '@/pages/parent/TeacherQuestions';
import DayPlan from '@/pages/parent/DayPlan';
import ProgressTracking from '@/pages/parent/ProgressTracking';
import ParentSettings from '@/pages/parent/ParentSettings';

function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalNav />
      <div className="pt-16 md:pt-[72px] min-h-screen bg-cream">
        {children}
      </div>
    </>
  );
}

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <PortalLayout>{children}</PortalLayout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'parent' ? '/parent' : '/'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to={user.role === 'parent' ? '/parent' : '/'} replace />
            ) : (
              <SignupPage />
            )
          }
        />

        {/* Parent Portal */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/upload"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <UploadReport />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/clarity"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ClarityCheck />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/conversation"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ConversationGuide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/questions"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <TeacherQuestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/plan"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <DayPlan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/progress"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ProgressTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/settings"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentSettings />
            </ProtectedRoute>
          }
        />

        {/* Teacher and admin portals are hidden from the live app. */}
        <Route path="/teacher/*" element={<Navigate to="/" replace />} />
        <Route path="/admin/*" element={<Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

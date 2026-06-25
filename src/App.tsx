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

// Teacher Portal
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import TeacherClasses from '@/pages/teacher/TeacherClasses';
import ClassPatterns from '@/pages/teacher/ClassPatterns';
import TeacherSettings from '@/pages/teacher/TeacherSettings';

// Admin Portal
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ClassManagement from '@/pages/admin/ClassManagement';
import StudentRoster from '@/pages/admin/StudentRoster';
import TeacherManagement from '@/pages/admin/TeacherManagement';
import SubscriptionPage from '@/pages/admin/SubscriptionPage';
import AdminSettings from '@/pages/admin/AdminSettings';

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
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-cream flex items-center justify-center"><div className="w-8 h-8 border-2 border-coral border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <PortalLayout>{children}</PortalLayout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} replace /> : <SignupPage />} />

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
  );
}

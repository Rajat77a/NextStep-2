import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, ClipboardCheck, MessageCircle,
  HelpCircle, Calendar, TrendingUp, Users, BookOpen,
  Settings, LogOut, Menu, X, Bell, School, BarChart3, ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const parentNav: NavItem[] = [
  { label: 'Dashboard', path: '/parent', icon: <LayoutDashboard size={18} /> },
  { label: 'Upload Report', path: '/parent/upload', icon: <Upload size={18} /> },
  { label: 'Clarity Check', path: '/parent/clarity', icon: <ClipboardCheck size={18} /> },
  { label: 'Conversation', path: '/parent/conversation', icon: <MessageCircle size={18} /> },
  { label: 'Teacher Questions', path: '/parent/questions', icon: <HelpCircle size={18} /> },
  { label: '30-Day Plan', path: '/parent/plan', icon: <Calendar size={18} /> },
  { label: 'Progress', path: '/parent/progress', icon: <TrendingUp size={18} /> },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard', path: '/teacher', icon: <LayoutDashboard size={18} /> },
  { label: 'My Classes', path: '/teacher/classes', icon: <Users size={18} /> },
  { label: 'Class Patterns', path: '/teacher/patterns', icon: <BarChart3 size={18} /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Classes', path: '/admin/classes', icon: <BookOpen size={18} /> },
  { label: 'Students', path: '/admin/students', icon: <Users size={18} /> },
  { label: 'Teachers', path: '/admin/teachers', icon: <School size={18} /> },
  { label: 'Subscription', path: '/admin/subscription', icon: <Settings size={18} /> },
];

export default function PortalNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'parent' ? parentNav : user.role === 'teacher' ? teacherNav : adminNav;
  const portalPrefix = `/${user.role}`;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-[72px] bg-cream/95 backdrop-blur-md border-b border-light-gray">
        <div className="max-w-7xl mx-auto px-5 md:px-12 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to={portalPrefix} className="flex items-baseline gap-0.5">
            <span className="font-display text-xl md:text-2xl font-semibold text-charcoal tracking-tight">NextStep</span>
            <span className="text-coral text-[10px] font-body font-bold">●</span>
            <span className="font-body text-[11px] font-semibold text-charcoal tracking-wider">AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path ||
                (item.path !== portalPrefix && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-text px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-coral bg-coral/5'
                      : 'text-medium-gray hover:text-charcoal hover:bg-white/60'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {isActive && <motion.div layoutId="activeNav" className="absolute bottom-0 left-3 right-3 h-0.5 bg-coral rounded-full" />}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-white/60 transition-colors">
              <Bell size={18} className="text-charcoal" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center text-coral font-body font-semibold text-sm">
                  {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <ChevronDown size={14} className="hidden md:block text-medium-gray" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-modal border border-light-gray z-50 py-2"
                    >
                      <div className="px-4 py-2 border-b border-light-gray">
                        <p className="font-body font-medium text-sm text-charcoal">{user.fullName}</p>
                        <p className="font-body text-xs text-medium-gray">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-cream rounded-full text-[10px] font-body font-semibold uppercase tracking-wider text-medium-gray">
                          {user.role}
                        </span>
                      </div>
                      <button
                        onClick={() => { navigate(`/${user.role}/settings`); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm font-body text-charcoal hover:bg-cream transition-colors flex items-center gap-2"
                      >
                        <Settings size={14} /> Account Settings
                      </button>
                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm font-body text-coral hover:bg-coral/5 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-charcoal pt-20 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== portalPrefix && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-body text-lg transition-colors ${
                      isActive ? 'text-coral bg-coral/10' : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-white/10 mt-4 pt-4">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-coral font-body"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

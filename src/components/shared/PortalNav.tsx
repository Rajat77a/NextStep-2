import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, ClipboardCheck, MessageCircle,
  HelpCircle, Calendar, TrendingUp, Users, BookOpen,
  Settings, LogOut, Bell, School, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const parentNav: NavItem[] = [
  { label: 'Dashboard',         path: '/parent',              icon: <LayoutDashboard size={20} /> },
  { label: 'Upload Report',     path: '/parent/upload',       icon: <Upload size={20} /> },
  { label: 'Clarity Check',     path: '/parent/clarity',      icon: <ClipboardCheck size={20} /> },
  { label: 'Conversation',      path: '/parent/conversation', icon: <MessageCircle size={20} /> },
  { label: 'Ask Teacher',       path: '/parent/questions',    icon: <HelpCircle size={20} /> },
  { label: '30-Day Plan',       path: '/parent/plan',         icon: <Calendar size={20} /> },
  { label: 'Progress',          path: '/parent/progress',     icon: <TrendingUp size={20} /> },
];

const teacherNav: NavItem[] = [
  { label: 'Dashboard',     path: '/teacher',          icon: <LayoutDashboard size={20} /> },
  { label: 'My Classes',    path: '/teacher/classes',  icon: <Users size={20} /> },
  { label: 'Class Patterns',path: '/teacher/patterns', icon: <BarChart3 size={20} /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',    path: '/admin',                icon: <LayoutDashboard size={20} /> },
  { label: 'Classes',      path: '/admin/classes',        icon: <BookOpen size={20} /> },
  { label: 'Students',     path: '/admin/students',       icon: <Users size={20} /> },
  { label: 'Teachers',     path: '/admin/teachers',       icon: <School size={20} /> },
  { label: 'Subscription', path: '/admin/subscription',   icon: <Settings size={20} /> },
];

export default function PortalNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'parent' ? parentNav
                 : user.role === 'teacher' ? teacherNav
                 : adminNav;

  const portalPrefix = `/${user.role}`;
  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const isActive = (item: NavItem) =>
    location.pathname === item.path ||
    (item.path !== portalPrefix && location.pathname.startsWith(item.path));

  // Bottom 5 items for mobile tab bar
  const mobileItems = navItems.slice(0, 5);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 220 : 68 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="hidden md:flex fixed top-0 left-0 h-screen z-50 flex-col
                   bg-charcoal border-r border-white/5 overflow-hidden"
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
      >
        {/* Logo */}
        <Link
          to={portalPrefix}
          className="flex items-center gap-3 h-16 px-4 shrink-0 border-b border-white/5"
        >
          <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-white text-sm">N</span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-display font-semibold text-white text-lg whitespace-nowrap"
              >
                NextStep<span className="text-coral">.</span>AI
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto overflow-x-hidden">
          {navItems.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 group
                  ${active
                    ? 'bg-coral text-white shadow-lg shadow-coral/20'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                  }`}
              >
                {/* Active indicator dot */}
                {active && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full -ml-2"
                  />
                )}
                <span className="shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="font-body text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {!expanded && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-charcoal border border-white/10
                                  rounded-lg text-white text-xs font-body font-medium whitespace-nowrap
                                  opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                                  shadow-xl z-50">
                    {item.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4
                                    border-transparent border-r-charcoal" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/5 px-2 py-3 flex flex-col gap-1">
          {/* Bell */}
          <button className="relative flex items-center gap-3 h-11 px-3 rounded-xl
                             text-white/50 hover:text-white hover:bg-white/8 transition-all group">
            <Bell size={20} className="shrink-0" />
            <span className="absolute top-2 left-7 w-2 h-2 bg-coral rounded-full border border-charcoal" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-body text-sm whitespace-nowrap"
                >Notifications</motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate(`/${user.role}/settings`)}
            className="flex items-center gap-3 h-11 px-3 rounded-xl
                       text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <Settings size={20} className="shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="font-body text-sm whitespace-nowrap"
                >Settings</motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Profile row */}
          <div className="flex items-center gap-3 h-12 px-3 mt-1 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center shrink-0">
              <span className="text-white font-body font-bold text-xs">{initials}</span>
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-body text-sm font-medium text-white truncate">{user.fullName}</p>
                  <p className="font-body text-[10px] text-white/40 capitalize">{user.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {expanded && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg hover:bg-coral/20 text-white/40 hover:text-coral transition-all"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ── MOBILE TOP BAR (logo + profile only) ────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14
                         bg-charcoal flex items-center justify-between px-4
                         border-b border-white/5">
        <Link to={portalPrefix} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-coral flex items-center justify-center">
            <span className="font-display font-bold text-white text-xs">N</span>
          </div>
          <span className="font-display font-semibold text-white text-base">
            NextStep<span className="text-coral">.</span>AI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="relative p-2">
            <Bell size={18} className="text-white/60" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-coral rounded-full" />
          </button>
          <button
            onClick={() => navigate(`/${user.role}/settings`)}
            className="w-8 h-8 rounded-full bg-coral flex items-center justify-center"
          >
            <span className="text-white font-body font-bold text-xs">{initials}</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM TAB BAR ────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16
                      bg-charcoal border-t border-white/5 flex items-center
                      justify-around px-2"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {mobileItems.map(item => {
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobileActive"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-coral rounded-full"
                />
              )}
              <span className={active ? 'text-coral' : 'text-white/40'}>
                {item.icon}
              </span>
              <span className={`font-body text-[9px] font-medium leading-none ${active ? 'text-coral' : 'text-white/40'}`}>
                {item.label.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

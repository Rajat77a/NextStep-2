import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, ClipboardCheck, MessageCircle,
  HelpCircle, Calendar, TrendingUp, Users, BookOpen,
  Settings, LogOut, Bell, School, BarChart3, X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTransition } from '@/contexts/PageTransitionContext';
import TransitionLink from '@/components/shared/TransitionLink';

interface NavItem { label: string; path: string; icon: React.ReactNode }

const parentNav: NavItem[] = [
  { label: 'Dashboard',     path: '/parent',              icon: <LayoutDashboard size={19} /> },
  { label: 'Upload Report', path: '/parent/upload',       icon: <Upload size={19} /> },
  { label: 'Clarity Check', path: '/parent/clarity',      icon: <ClipboardCheck size={19} /> },
  { label: 'Conversation',  path: '/parent/conversation', icon: <MessageCircle size={19} /> },
  { label: 'Ask Teacher',   path: '/parent/questions',    icon: <HelpCircle size={19} /> },
  { label: '30-Day Plan',   path: '/parent/plan',         icon: <Calendar size={19} /> },
  { label: 'Progress',      path: '/parent/progress',     icon: <TrendingUp size={19} /> },
];
const teacherNav: NavItem[] = [
  { label: 'Dashboard',      path: '/teacher',          icon: <LayoutDashboard size={19} /> },
  { label: 'My Classes',     path: '/teacher/classes',  icon: <Users size={19} /> },
  { label: 'Class Patterns', path: '/teacher/patterns', icon: <BarChart3 size={19} /> },
];
const adminNav: NavItem[] = [
  { label: 'Dashboard',    path: '/admin',              icon: <LayoutDashboard size={19} /> },
  { label: 'Classes',      path: '/admin/classes',      icon: <BookOpen size={19} /> },
  { label: 'Students',     path: '/admin/students',     icon: <Users size={19} /> },
  { label: 'Teachers',     path: '/admin/teachers',     icon: <School size={19} /> },
  { label: 'Subscription', path: '/admin/subscription', icon: <Settings size={19} /> },
];

export default function PortalNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { navigateWithTransition } = usePageTransition();
  const [expanded, setExpanded] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return null;

  const navItems = user.role === 'parent' ? parentNav
                 : user.role === 'teacher' ? teacherNav : adminNav;
  const portalPrefix = `/${user.role}`;
  const initials = user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const isActive = (item: NavItem) =>
    location.pathname === item.path ||
    (item.path !== portalPrefix && location.pathname.startsWith(item.path));

  // Keep sidebar expanded while notif panel is open
  const sidebarExpanded = expanded || notifOpen;

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarExpanded ? 220 : 68 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { if (!notifOpen) setExpanded(false); }}
        className="hidden md:flex fixed top-0 left-0 h-screen z-50 flex-col bg-[#1a1a1f] overflow-visible"
        style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.25)' }}
      >
        {/* Logo */}
        <TransitionLink
          to={portalPrefix}
          className="flex items-center gap-3 h-[64px] px-[14px] shrink-0 border-b border-white/[0.06]"
        >
          <div className="w-9 h-9 rounded-xl bg-coral flex items-center justify-center shrink-0 shadow-lg shadow-coral/30">
            <span className="font-display font-bold text-white text-sm">N</span>
          </div>
          <AnimatePresence>
            {sidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="font-display font-semibold text-white text-[17px] whitespace-nowrap"
              >
                NextStep<span className="text-coral">.</span>AI
              </motion.span>
            )}
          </AnimatePresence>
        </TransitionLink>

        {/* Nav Items */}
        <nav className="flex-1 py-3 flex flex-col overflow-y-auto overflow-x-visible">
          {navItems.map(item => {
            const active = isActive(item);
            return (
              <div key={item.path} className="relative">
                {active && (
                  <motion.span
                    layoutId="activeStripe"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[24px] rounded-r-full bg-coral"
                  />
                )}
                <TransitionLink
                  to={item.path}
                  className="flex items-center gap-3 h-[46px] mx-2 px-3 rounded-lg
                             transition-colors duration-150 group select-none"
                >
                  <span
                    className={`shrink-0 transition-all duration-150 ${
                      active ? 'text-coral' : 'text-white/35 group-hover:text-white/75'
                    }`}
                    style={active ? { filter: 'drop-shadow(0 0 6px rgba(231,90,62,0.55))' } : {}}
                  >
                    {item.icon}
                  </span>
                  <AnimatePresence>
                    {sidebarExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.15 }}
                        className={`text-[13.5px] font-medium whitespace-nowrap transition-colors duration-150 ${
                          active ? 'text-white' : 'text-white/40 group-hover:text-white/80'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!sidebarExpanded && (
                    <span className="absolute left-full ml-4 px-2.5 py-1.5
                                     bg-[#2a2a32] border border-white/10 rounded-lg
                                     text-white/80 text-[12px] font-medium whitespace-nowrap
                                     opacity-0 group-hover:opacity-100 pointer-events-none
                                     transition-opacity duration-150 shadow-xl z-50">
                      {item.label}
                      <span className="absolute right-full top-1/2 -translate-y-1/2
                                       border-4 border-transparent border-r-[#2a2a32]" />
                    </span>
                  )}
                </TransitionLink>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.06] px-2 py-3 flex flex-col gap-0.5">

          {/* Notifications */}
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative w-full flex items-center gap-3 h-[46px] px-3 rounded-lg
                       text-white/35 hover:text-white/75 transition-colors duration-150 group"
          >
            <Bell size={19} className="shrink-0" />
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[13.5px] font-medium text-white/40 group-hover:text-white/80
                             transition-colors whitespace-nowrap"
                >
                  Notifications
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Settings */}
          <button
            onClick={() => navigateWithTransition(`/${user.role}/settings`)}
            className="w-full flex items-center gap-3 h-[46px] px-3 rounded-lg
                       text-white/35 hover:text-white/75 transition-colors duration-150 group"
          >
            <Settings size={19} className="shrink-0" />
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[13.5px] font-medium text-white/40 group-hover:text-white/80
                             transition-colors whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Profile row */}
          <div className="flex items-center gap-3 h-[52px] px-3 mt-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-[30px] h-[30px] rounded-full bg-coral/90 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-[11px]">{initials}</span>
            </div>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-[12.5px] font-medium text-white/90 truncate leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-white/30 capitalize leading-tight mt-0.5">{user.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {sidebarExpanded && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => logout()}
                  title="Sign out"
                  className="shrink-0 p-1.5 rounded-lg text-white/25 hover:text-coral hover:bg-coral/10 transition-all"
                >
                  <LogOut size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ── NOTIFICATION OVERLAY (renders outside sidebar so mouse events don't kill it) ── */}
      <AnimatePresence>
        {notifOpen && (
          <>
            {/* Backdrop — click anywhere to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setNotifOpen(false); setExpanded(false); }}
              className="fixed inset-0 z-[55] bg-black/20"
            />
            {/* Panel — positioned next to sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -12, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed z-[60] w-80 bg-[#22222a] border border-white/10
                         rounded-2xl shadow-2xl overflow-hidden"
              style={{ left: 232, bottom: 80 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <span className="text-white font-semibold text-[15px]">Notifications</span>
                <button
                  onClick={() => { setNotifOpen(false); setExpanded(false); }}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-5 py-12 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
                  <Bell size={22} className="text-white/20" />
                </div>
                <p className="text-white/60 text-[14px] font-medium">No notifications yet</p>
                <p className="text-white/30 text-[12px] mt-2 max-w-[200px] leading-relaxed">
                  Updates about report analysis, plan reminders, and more will appear here
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE TOP BAR ──────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14
                         bg-[#1a1a1f] flex items-center justify-between px-4
                         border-b border-white/[0.06]">
        <TransitionLink to={portalPrefix} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-coral flex items-center justify-center shadow-md shadow-coral/30">
            <span className="font-display font-bold text-white text-xs">N</span>
          </div>
          <span className="font-display font-semibold text-white text-[15px]">
            NextStep<span className="text-coral">.</span>AI
          </span>
        </TransitionLink>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-lg text-white/50 hover:text-white transition-colors"
          >
            <Bell size={18} />
          </button>
          <button
            onClick={() => navigateWithTransition(`/${user.role}/settings`)}
            className="w-8 h-8 rounded-full bg-coral/90 flex items-center justify-center shadow-md shadow-coral/30"
          >
            <span className="text-white font-semibold text-[11px]">{initials}</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE BOTTOM TABS ───────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16
                   bg-[#1a1a1f] border-t border-white/[0.06]
                   flex items-center justify-around px-1"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.slice(0, 5).map(item => {
          const active = isActive(item);
          return (
            <TransitionLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
            >
              {active && (
                <motion.span
                  layoutId="mobileActiveBar"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-coral"
                />
              )}
              <span
                className={`transition-all ${active ? 'text-coral' : 'text-white/30'}`}
                style={active ? { filter: 'drop-shadow(0 0 5px rgba(231,90,62,0.5))' } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[9px] font-medium ${active ? 'text-coral' : 'text-white/30'}`}>
                {item.label.split(' ')[0]}
              </span>
            </TransitionLink>
          );
        })}
      </nav>
    </>
  );
}

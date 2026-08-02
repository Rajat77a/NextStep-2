import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
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

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value?: string) {
  if (!value) return 'recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function buildNotifications(): NotificationItem[] {
  const cards = readStorage<any[]>('nsa_reportCards', []);
  const checks = readStorage<any[]>('nsa_clarityChecks', []);
  const lastReportCardId = window.localStorage.getItem('nsa_lastReportCardId');

  const sortedCards = cards
    .slice()
    .sort(
      (a, b) =>
        new Date(b?.createdAt || 0).getTime() -
        new Date(a?.createdAt || 0).getTime()
    );

  const latestCard = lastReportCardId
    ? sortedCards.find((card) => card?.id === lastReportCardId) || sortedCards[0]
    : sortedCards[0];

  if (!latestCard) {
    return [
      {
        id: 'upload-first-report',
        title: 'Upload your first report card',
        description: 'Add report card text to generate a clarity check.',
        to: '/parent/upload',
        icon: <Upload size={16} />,
      },
    ];
  }

  const clarityUrl = `/parent/clarity?reportCardId=${encodeURIComponent(latestCard.id)}`;
  const relatedCheck = checks.find((check) => check?.reportCardId === latestCard.id);

  const notifications: NotificationItem[] = [
    {
      id: `report-${latestCard.id}`,
      title: 'Report card saved',
      description: `${latestCard.term || 'Latest report'} was uploaded ${formatDate(
        latestCard.createdAt
      )}.`,
      to: clarityUrl,
      icon: <FileText size={16} />,
    },
  ];

  if (relatedCheck) {
    notifications.unshift({
      id: `clarity-${latestCard.id}`,
      title: 'Clarity check ready',
      description: 'Conversation support, questions, and plan are ready.',
      to: clarityUrl,
      icon: <CheckCircle2 size={16} />,
    });
  }

  return notifications;
}

export default function PortalNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);

  const notifications = useMemo(() => buildNotifications(), [location.pathname]);

  if (!user) return null;

  const displayName = user.fullName || user.email || 'Parent';
  const displayEmail = user.email || '';
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'P';

  const hasUnread = notifications.length > 0 && !notificationsSeen;

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotificationsOpen(false);
  };

  const handleLogout = async () => {
    closeMenus();
    await logout();
    navigate('/');
  };

  const openNotifications = () => {
    setProfileOpen(false);
    setNotificationsOpen((current) => {
      const next = !current;
      if (next) setNotificationsSeen(true);
      return next;
    });
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-stone bg-cream/95 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/parent" className="flex items-baseline gap-1" onClick={closeMenus}>
                <span className="font-serif text-2xl font-bold text-charcoal">
                  NextStep
                </span>
                <span className="text-coral font-bold text-sm">AI</span>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                {parentNav.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/parent' && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-coral text-white'
                          : 'text-charcoal/70 hover:text-charcoal hover:bg-white/60'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={openNotifications}
                  className="relative p-2 rounded-full hover:bg-white/60 transition-colors"
                  aria-label="Open notifications"
                >
                  <Bell size={18} className="text-charcoal" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full" />
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-stone overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-stone">
                        <p className="font-semibold text-charcoal">Notifications</p>
                        <p className="text-xs text-charcoal/55">
                          Latest parent portal activity
                        </p>
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((item) => (
                          <Link
                            key={item.id}
                            to={item.to}
                            onClick={closeMenus}
                            className="flex gap-3 px-4 py-4 hover:bg-soft-gray transition-colors border-b border-stone/70 last:border-b-0"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/10 text-coral">
                              {item.icon}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-charcoal">
                                {item.title}
                              </span>
                              <span className="block text-sm text-charcoal/65 leading-snug mt-0.5">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>

                      <Link
                        to="/parent/upload"
                        onClick={closeMenus}
                        className="block px-4 py-3 text-sm font-semibold text-coral hover:bg-soft-gray transition-colors"
                      >
                        Upload another report
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    setProfileOpen((current) => !current);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-white/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-coral text-white flex items-center justify-center font-bold text-sm">
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-charcoal leading-tight">
                      {displayName}
                    </p>
                    <p className="text-xs text-charcoal/55 leading-tight">Parent portal</p>
                  </div>
                  <ChevronDown size={16} className="text-charcoal/60" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-stone overflow-hidden"
                    >
                      <div className="px-4 py-4 border-b border-stone">
                        <p className="font-semibold text-charcoal">{displayName}</p>
                        <p className="text-sm text-charcoal/55 truncate">{displayEmail}</p>
                      </div>

                      <Link
                        to="/parent/settings"
                        onClick={closeMenus}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal hover:bg-soft-gray transition-colors"
                      >
                        <Settings size={17} />
                        Settings
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-coral hover:bg-soft-gray transition-colors"
                      >
                        <LogOut size={17} />
                        Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="lg:hidden p-2 rounded-full hover:bg-white/60 transition-colors"
              aria-label="Open menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 left-0 right-0 z-40 bg-cream border-b border-stone shadow-lg lg:hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {parentNav.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/parent' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenus}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-coral text-white'
                        : 'text-charcoal hover:bg-white/70'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-stone">
                <Link
                  to="/parent/upload"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-charcoal hover:bg-white/70"
                >
                  <Bell size={18} />
                  Notifications
                  {hasUnread && <span className="ml-auto w-2 h-2 bg-coral rounded-full" />}
                </Link>

                <Link
                  to="/parent/settings"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-charcoal hover:bg-white/70"
                >
                  <Settings size={18} />
                  Settings
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-coral hover:bg-white/70"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(profileOpen || notificationsOpen) && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 cursor-default"
          onClick={closeMenus}
        />
      )}
    </>
  );
}

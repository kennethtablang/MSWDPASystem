import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Check, Menu, Search, MessageSquare, ALargeSmall, ChevronDown, LogOut, UserCircle,
  Sun, Moon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  applyFontScale, getFontScale, cycleFontScale, applyTheme, getTheme,
} from '../utils/appearance';
import notify from '../utils/notify';
import usePreferences from '../hooks/usePreferences';
import Breadcrumbs from './ui/Breadcrumbs';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import ConfirmDialog from './ConfirmDialog';

function useDismissable() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  return { open, setOpen, ref };
}

export default function Header({ title, breadcrumbs, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { open: bellOpen, setOpen: setBellOpen, ref: bellRef } = useDismissable();
  const { open: profileOpen, setOpen: setProfileOpen, ref: profileRef } = useDismissable();
  const [search, setSearch] = useState('');
  const preferences = usePreferences();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Reflects what is actually on <html>, so "match device" shows the resolved
  // value rather than the word "system".
  const [isDark, setIsDark] = useState(
    () => document.documentElement.dataset.theme === 'dark',
  );

  const toggleTheme = () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setIsDark(next === 'dark');
    // Persisted to the account so the choice follows the user to another machine.
    api.put('/account/preferences', { ...preferences, theme: next })
      .then(() => qc.invalidateQueries({ queryKey: ['my-account'] }))
      .catch(() => { /* local change still applies for this session */ });
  };
  const isCitizen = user?.role === 'Citizen';

  useEffect(() => {
    applyFontScale(getFontScale());
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 60_000,
  });

  const unread = notifications.filter(n => !n.isRead);

  const seenNotificationIds = useRef(null);

  const markReadMutation = useMutation({
    mutationFn: (ids) => api.post('/notifications/mark-read', { ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleMarkAllRead = () => {
    if (unread.length === 0) return;
    markReadMutation.mutate(null);
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) markReadMutation.mutate([n.id]);
    if (n.relatedEntityType === 'AssistanceRequest' && n.relatedEntityId)
      navigate(`/assistance/${n.relatedEntityId}`);
    else if (n.relatedEntityType === 'Beneficiary' && n.relatedEntityId)
      navigate(`/beneficiaries/${n.relatedEntityId}`);
    setBellOpen(false);
  };

  // Raise a toast for notifications that arrived since the last poll, so a
  // coordinator sees an incoming request without watching the bell. The first
  // load is skipped — otherwise signing in would fire a toast per unread item.
  // Declared after handleNotificationClick because the toast action calls it.
  useEffect(() => {
    const currentIds = notifications.map(n => n.id);

    if (seenNotificationIds.current === null) {
      seenNotificationIds.current = new Set(currentIds);
      return;
    }

    const fresh = notifications.filter(
      n => !n.isRead && !seenNotificationIds.current.has(n.id),
    );
    seenNotificationIds.current = new Set(currentIds);

    // Respects the "Pop-up alerts" setting — the bell badge still updates either
    // way, this only governs whether a toast is raised.
    if (!preferences.showToastNotifications) return;

    // Several at once becomes one summary rather than a stack of toasts.
    if (fresh.length > 2) {
      notify.info(`${fresh.length} new notifications`, 'Open the bell menu to review them.');
      return;
    }
    fresh.forEach((n) => {
      notify.notification(n.title, n.message, () => handleNotificationClick(n));
    });
    // Re-running only on the notifications list; handleNotificationClick is
    // recreated each render and would otherwise retrigger the diff endlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, preferences.showToastNotifications]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/beneficiaries?search=${encodeURIComponent(q)}`);
    setSearch('');
  };

  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 bg-white dark:bg-gray-100 border-b border-gray-200">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">{title}</h2>
          <Breadcrumbs items={breadcrumbs} className="hidden sm:block" />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {!isCitizen && (
          <form onSubmit={submitSearch} role="search" className="hidden md:block relative">
            <Search size={15} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search beneficiaries…"
              aria-label="Search beneficiaries"
              className="w-52 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-1.5 text-sm text-gray-700 placeholder:text-gray-400 focus:bg-white dark:bg-gray-100 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
            />
          </form>
        )}

        <button
          onClick={cycleFontScale}
          aria-label="Adjust text size"
          title="Adjust text size"
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ALargeSmall size={20} />
        </button>

        {/* Quick theme switch. Settings holds the full three-way choice including
            "match device"; this toggles between light and dark directly. */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {!isCitizen && (
          <Link
            to="/messages"
            aria-label="Messages"
            title="Messages"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MessageSquare size={20} />
          </Link>
        )}

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(v => !v)}
            aria-label={`Notifications${unread.length > 0 ? ` (${unread.length} unread)` : ''}`}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unread.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center bg-accent-600 text-white text-[10px] font-bold rounded-full px-1">
                {unread.length > 9 ? '9+' : unread.length}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-white dark:bg-gray-100 rounded-xl shadow-card-hover border border-gray-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                {unread.length > 0 && (
                  <button onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-primary-700 hover:underline">
                    <Check size={12} aria-hidden="true" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 px-4 py-6 text-center">No notifications.</p>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-primary-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="mt-1.5 w-2 h-2 bg-primary-600 rounded-full shrink-0" />}
                        <div className={!n.isRead ? '' : 'ml-4'}>
                          <p className="text-sm font-medium text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            aria-label="Account menu"
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Avatar name={user?.fullName} size="sm" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[10rem] truncate">
              {user?.fullName}
            </span>
            <ChevronDown size={14} aria-hidden="true" className="text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-100 rounded-xl shadow-card-hover border border-gray-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                <Badge tone="primary" className="mt-1">{user?.role}</Badge>
              </div>
              {isCitizen && (
                <Link
                  to="/portal/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserCircle size={16} aria-hidden="true" className="text-gray-400" />
                  My Profile
                </Link>
              )}
              <button
                onClick={() => { setProfileOpen(false); setConfirmLogout(true); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-accent-700 hover:bg-accent-50 transition-colors"
              >
                <LogOut size={16} aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={async () => {
          setSigningOut(true);
          // logout() navigates on completion, so this component unmounts before
          // the flag would need resetting; reset on failure only.
          try {
            await logout();
          } finally {
            setSigningOut(false);
          }
        }}
        loading={signingOut}
        intent="logout"
        title="Sign out?"
        message="Are you really sure you want to sign out?"
        details={
          <>Any work you have not saved will be lost. You will need to sign in again to continue.</>
        }
        confirmLabel="Yes, sign out"
        cancelLabel="Stay signed in"
      />
    </header>
  );
}

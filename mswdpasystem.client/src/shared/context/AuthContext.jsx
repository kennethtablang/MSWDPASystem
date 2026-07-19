import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api, { AUTH_USER_UPDATED, storeAuthUser } from '../utils/api';
import useIdleTimeout from '../hooks/useIdleTimeout';
import IdleWarningDialog from '../components/IdleWarningDialog';

const AuthContext = createContext(null);

// Fallback used until /system-settings/app-config responds, and if an
// administrator ever stores an unusable value.
const DEFAULT_IDLE_MINUTES = 30;

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [idleMinutes, setIdleMinutes] = useState(DEFAULT_IDLE_MINUTES);

  const login = useCallback(async (userName, password) => {
    const { data } = await api.post('/auth/login', { userName, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    storeAuthUser(data);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(async (reason) => {
    // Guarded because `logout` is often wired straight to onClick, which would
    // otherwise pass a click event in as the reason and render it as a child.
    const notice = typeof reason === 'string' && reason.trim() ? reason : undefined;

    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    // Clear credentials only. A blanket localStorage.clear() also discarded the
    // "remember me" username, so it never survived a sign-out.
    ['accessToken', 'refreshToken', 'user', 'lastActivityAt']
      .forEach((k) => localStorage.removeItem(k));
    setUser(null);
    navigate('/login', notice ? { state: { notice } } : undefined);
  }, [navigate]);

  // FR-1.9: the inactivity window is an administrator-configurable parameter,
  // so it is read from the server rather than hard-coded in the client.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api.get('/system-settings/app-config')
      .then(({ data }) => {
        const minutes = Number(data?.sessionTimeoutMinutes);
        if (!cancelled && Number.isFinite(minutes) && minutes > 0) setIdleMinutes(minutes);
      })
      .catch(() => { /* keep the default window */ });
    return () => { cancelled = true; };
  }, [user]);

  const handleIdleTimeout = useCallback(() => {
    toast.warning('Signed out due to inactivity.');
    logout('Your session ended after a period of inactivity. Please sign in again.');
  }, [logout]);

  const { secondsLeft, isWarning, extend } = useIdleTimeout({
    timeoutMinutes: idleMinutes,
    warnSeconds: 60,
    onTimeout: handleIdleTimeout,
    enabled: !!user,
  });

  // Keep React state in sync when the stored identity is replaced outside of
  // React — notably the token-refresh interceptor in api.js.
  useEffect(() => {
    const onUserUpdated = (e) => setUser(e.detail);
    window.addEventListener(AUTH_USER_UPDATED, onUserUpdated);
    return () => window.removeEventListener(AUTH_USER_UPDATED, onUserUpdated);
  }, []);

  // Revalidate the cached identity against the server on load. The JWT can outlive
  // a role change, a module-permission change or a deactivation, so trusting
  // localStorage alone would leave a stale (and over-privileged) client.
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) return;

    let cancelled = false;
    api.get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        setUser(prev => {
          const merged = { ...prev, ...data };
          localStorage.setItem('user', JSON.stringify(merged));
          return merged;
        });
      })
      .catch(() => { /* 401 is handled by the api interceptor (refresh, then sign-out) */ });

    return () => { cancelled = true; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
      <IdleWarningDialog
        open={!!user && isWarning}
        secondsLeft={secondsLeft}
        onStay={extend}
        onSignOut={() => logout()}
      />
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context + hook intentionally co-located
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

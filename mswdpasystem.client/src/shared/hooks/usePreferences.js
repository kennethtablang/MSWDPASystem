import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { applyFontScale, applyTheme, applyDensity } from '../utils/appearance';

/**
 * The signed-in user's preferences, with defaults for anyone who has never
 * opened Settings.
 *
 * Defaults are duplicated from MyPreferencesDto on the server so a page reading
 * a preference never has to null-check every field.
 */
export const DEFAULT_PREFERENCES = {
  notifyOnAssistanceStatus: true,
  notifyOnNewMessage: true,
  notifyOnDuplicateFlag: true,
  showToastNotifications: true,
  fontScale: 'base',
  theme: 'system',
  density: 'comfortable',
  sidebarCollapsedByDefault: false,
  landingPage: '/dashboard',
  defaultPageSize: 20,
  defaultBarangay: null,
  autoStartQrCamera: false,
  maskSensitiveData: false,
  confirmBeforeLeaving: true,
};

export default function usePreferences() {
  const { isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ['my-account'],
    queryFn: () => api.get('/account').then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });

  return { ...DEFAULT_PREFERENCES, ...(data?.preferences ?? {}) };
}

/**
 * Re-applies appearance from the server copy once it loads.
 *
 * main.jsx applies whatever was cached locally before first paint; this corrects
 * it on a machine the user has not signed in on before, where localStorage is
 * empty but their saved preference is not.
 */
export function useSyncAppearance() {
  const prefs = usePreferences();
  const { fontScale, theme, density } = prefs;

  useEffect(() => {
    applyFontScale(fontScale);
    applyTheme(theme);
    applyDensity(density);
  }, [fontScale, theme, density]);
}

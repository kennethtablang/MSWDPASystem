/**
 * Text-size scaling. `index.css` defines html[data-font-scale="lg"|"xl"] rules;
 * the default ("base") means no attribute at all.
 *
 * Shared by the header quick-toggle and the Settings > Preferences page so both
 * read and write the same state.
 */
export const FONT_SCALES = [
  { value: 'base', label: 'Normal', previewClass: 'text-sm' },
  { value: 'lg', label: 'Large', previewClass: 'text-base' },
  { value: 'xl', label: 'Extra large', previewClass: 'text-lg' },
];

const STORAGE_KEY = 'fontScale';

export function applyFontScale(scale) {
  const normalized = scale === 'lg' || scale === 'xl' ? scale : 'base';

  if (normalized === 'base') delete document.documentElement.dataset.fontScale;
  else document.documentElement.dataset.fontScale = normalized;

  localStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function getFontScale() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'lg' || stored === 'xl' ? stored : 'base';
}

/** Advances to the next size, wrapping back to Normal. Used by the header toggle. */
export function cycleFontScale() {
  const order = FONT_SCALES.map((s) => s.value);
  const next = order[(order.indexOf(getFontScale()) + 1) % order.length];
  return applyFontScale(next);
}

// ---------------------------------------------------------------- theme ----

export const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match device' },
];

const THEME_KEY = 'theme';
const prefersDark = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

/**
 * Sets data-theme on <html>. "system" resolves to the device setting and stays
 * subscribed to it, so a device switching to dark at dusk follows without a reload.
 */
export function applyTheme(theme) {
  const normalized = THEMES.some((t) => t.value === theme) ? theme : 'system';
  const resolved = normalized === 'system' ? (prefersDark() ? 'dark' : 'light') : normalized;

  document.documentElement.dataset.theme = resolved;
  localStorage.setItem(THEME_KEY, normalized);
  return normalized;
}

export function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return THEMES.some((t) => t.value === stored) ? stored : 'system';
}

/**
 * Keeps "system" in step with the device. Returns an unsubscribe function.
 * Called once at start-up.
 */
export function watchSystemTheme() {
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!media) return () => {};

  const onChange = () => {
    if (getTheme() === 'system') applyTheme('system');
  };
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

// -------------------------------------------------------------- density ----

export const DENSITIES = [
  { value: 'comfortable', label: 'Comfortable', hint: 'Roomier rows, easier to read' },
  { value: 'compact', label: 'Compact', hint: 'More rows per screen' },
];

const DENSITY_KEY = 'density';

/** Sets data-density on <html>; index.css tightens table and list padding for "compact". */
export function applyDensity(density) {
  const normalized = density === 'compact' ? 'compact' : 'comfortable';
  document.documentElement.dataset.density = normalized;
  localStorage.setItem(DENSITY_KEY, normalized);
  return normalized;
}

export function getDensity() {
  return localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'comfortable';
}

/**
 * Applies everything that must be in place before first paint, from localStorage.
 * The server copy arrives later and re-applies if it differs.
 */
export function applyStoredAppearance() {
  applyFontScale(getFontScale());
  applyTheme(getTheme());
  applyDensity(getDensity());
}

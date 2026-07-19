import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Type } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Logo from '../../shared/components/ui/Logo';
import Button from '../../shared/components/ui/Button';
import PublicFooter from './PublicFooter';
import { applyTheme, cycleFontScale, getFontScale } from '../../shared/utils/appearance';
import { EASE } from '../../shared/motion/tokens';

const scaleLabels = { base: 'Normal', lg: 'Large', xl: 'Extra large' };

/**
 * Text-size and theme controls for visitors. The signed-in app exposes these
 * through Settings, but the public site has no account to hang them off — and
 * these are exactly the readers who most need them.
 */
function AppearanceControls({ className = '' }) {
  const [scale, setScale] = useState(getFontScale);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setScale(cycleFontScale())}
        title={`Text size: ${scaleLabels[scale]}`}
        aria-label={`Text size: ${scaleLabels[scale]}. Activate to change.`}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        <Type size={16} aria-hidden="true" />
        <span aria-hidden="true" className="text-xs font-semibold">
          {scale === 'base' ? 'A' : scale === 'lg' ? 'A+' : 'A++'}
        </span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      >
        {theme === 'dark' ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      </button>
    </div>
  );
}

const navLinks = [
  { href: '#programs', label: 'Programs' },
  { href: '#services', label: 'Services' },
  { href: '#news', label: 'News' },
  { href: '#faqs', label: 'FAQs' },
  { href: '#contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const reduced = useReducedMotion();
  const onLanding = location.pathname === '/';

  const linkHref = (href) => (onLanding ? href : `/${href}`);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:bg-white dark:focus:bg-gray-100 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-card focus:text-sm focus:font-medium focus:text-primary-800 dark:focus:text-primary-300"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-100/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" aria-label="MSWD Caba home" className="shrink-0">
            <Logo size={38} />
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Site navigation">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={linkHref(l.href)}
                className="group relative py-1 text-sm font-medium text-gray-600 hover:text-primary-800 dark:hover:text-primary-300 transition-colors"
              >
                {l.label}
                {/* Underline wipes in from the left on hover/focus. scaleX keeps
                    it on the compositor; the global reduced-motion rule in
                    index.css zeroes the duration rather than the effect. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary-700 transition-transform duration-200 ease-in-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <AppearanceControls className="mr-1 border-r border-gray-200 pr-2" />
            <Button as={Link} to="/login" variant="outline" size="sm">
              Sign In
            </Button>
            <Button as={Link} to="/register" variant="primary" size="sm">
              Create Account
            </Button>
          </div>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              key="mobile-nav"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white dark:bg-gray-100"
              aria-label="Site navigation"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={linkHref(l.href)}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button as={Link} to="/login" variant="outline" size="sm" className="flex-1">
                    Sign In
                  </Button>
                  <Button as={Link} to="/register" variant="primary" size="sm" className="flex-1">
                    Create Account
                  </Button>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <AppearanceControls />
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/*
        Page transition. `mode="wait"` would leave the main region empty for the
        length of the exit, which reads as a flash on fast navigations — so the
        incoming page simply fades up over the outgoing one.
      */}
      <main id="main-content" className="flex-1">
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <PublicFooter />
    </div>
  );
}

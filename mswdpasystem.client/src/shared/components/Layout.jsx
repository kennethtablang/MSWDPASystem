import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './Sidebar';
import Header from './Header';
import { resolveTitle, getBreadcrumbs } from '../config/navigation';
import usePreferences, { useSyncAppearance } from '../hooks/usePreferences';

export default function Layout() {
  const location = useLocation();
  const title = resolveTitle(location.pathname);
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const prefs = usePreferences();
  // Brings theme, text size and density into line with the server copy — matters
  // on a machine this user has not signed in on before.
  useSyncAppearance();

  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    // An explicit choice on this device wins; the preference only supplies the
    // starting point on a device that has never been toggled.
    if (stored !== null) return stored === '1';
    return prefs.sidebarCollapsedByDefault;
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem('sidebarCollapsed', c ? '0' : '1');
      return !c;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* The idle timer now lives in AuthContext so it reads the administrator's
          configured Session.TimeoutMinutes and covers the citizen portal too. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:top-2 focus:left-2 focus:bg-white dark:bg-gray-100 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-card focus:text-sm focus:font-medium focus:text-primary-800 dark:text-primary-300"
      >
        Skip to main content
      </a>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={drawerOpen}
        onMobileClose={() => setDrawerOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} breadcrumbs={breadcrumbs} onMenuClick={() => setDrawerOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto">
          {/* Full available width — this is a data-dense admin tool, so a centred
              max-width column wasted screen space on wide monitors. */}
          <div className="w-full p-4 sm:px-6 sm:py-5">
            {/*
              A short cross-fade on navigation. Deliberately subtle and fast: staff
              move through these pages all day, and anything longer would read as
              lag rather than polish. Honours prefers-reduced-motion via the global
              rule in index.css.
            */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

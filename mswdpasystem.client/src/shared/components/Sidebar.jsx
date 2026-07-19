import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNavForRole, getQuickActionsForRole } from '../config/navigation';
import useNavBadges from '../hooks/useNavBadges';
import { LogoMark } from './ui/Logo';

/** Pinned shortcuts to the highest-frequency front-desk tasks. */
function QuickActions({ actions, collapsed, onNavigate }) {
  if (!actions.length) return null;

  return (
    <div className={`px-3 pt-4 ${collapsed ? '' : 'pb-1'}`}>
      {!collapsed && (
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary-400">
          Quick Actions
        </p>
      )}
      <div className="space-y-1">
        {actions.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 rounded-lg border border-primary-700/70 bg-primary-800/40 text-sm font-medium text-primary-100 dark:text-primary-200 transition-colors hover:border-gold-400/60 hover:bg-primary-800 hover:text-white ${
              collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
            }`}
          >
            <Icon size={16} aria-hidden="true" className="shrink-0 text-gold-400" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </div>
      <div className={`border-t border-primary-800 ${collapsed ? 'mx-2 mt-3' : 'mt-4'}`} />
    </div>
  );
}

/** Count pill, or a dot when the sidebar is collapsed and text would not fit. */
function NavBadge({ count, collapsed }) {
  if (!count) return null;

  if (collapsed) {
    return (
      <span
        aria-hidden="true"
        className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-primary-900"
      />
    );
  }
  return (
    <span className="ml-auto shrink-0 rounded-full bg-gold-400 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-primary-950">
      {count > 99 ? '99+' : count}
    </span>
  );
}

function NavItems({ items, collapsed, onNavigate, badges }) {
  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden" aria-label="Main navigation">
      {items.map((item, i) => {
        const { to, icon: Icon, label, section, end, badge } = item;
        const count = badge ? badges[badge] : 0;
        const isFirst = i === 0;
        const showSection = isFirst || items[i - 1].section !== section;
        return (
          <div key={to}>
            {showSection && !collapsed && (
              <p
                className={`px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary-400 ${
                  isFirst ? 'pt-0' : 'pt-4'
                }`}
              >
                {section}
              </p>
            )}
            {showSection && collapsed && !isFirst && (
              <div className="my-3 mx-2 border-t border-primary-800" />
            )}
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              // Collapsed items show no text, so the label has to come from
              // aria-label (screen readers) and title (hover hint).
              aria-label={
                collapsed
                  ? `${label}${count ? ` (${count} pending)` : ''}`
                  : undefined
              }
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-primary-800 text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r before:bg-gold-400'
                    : 'text-primary-200 hover:bg-primary-800/60 hover:text-white'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              <NavBadge count={count} collapsed={collapsed} />
            </NavLink>
          </div>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const items = getNavForRole(user?.role, user?.allowedModules) ?? [];
  const quickActions = getQuickActionsForRole(user?.role, user?.allowedModules) ?? [];
  const badges = useNavBadges(user?.role);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const brand = (
    <div className={`flex items-center gap-3 border-b border-primary-800 ${collapsed ? 'justify-center px-2 py-4' : 'px-5 py-4'}`}>
      <LogoMark size={collapsed ? 32 : 38} />
      {!collapsed && (
        <div className="leading-tight min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-300">MSWD Caba</p>
          <p className="text-sm font-bold text-white truncate">Profiling &amp; Assistance</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col min-h-screen shrink-0 bg-gradient-to-b from-primary-950 to-primary-900 text-white transition-[width] duration-200 ${
          collapsed ? 'w-[4.5rem]' : 'w-64'
        }`}
      >
        {brand}
        <QuickActions actions={quickActions} collapsed={collapsed} />
        <NavItems items={items} collapsed={collapsed} badges={badges} />
        <div className="border-t border-primary-800 p-3 shrink-0">
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex items-center gap-3 rounded-lg text-sm text-primary-200 hover:bg-primary-800/60 hover:text-white transition-colors w-full ${
              collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'
            }`}
          >
            {collapsed ? <ChevronsRight size={18} aria-hidden="true" /> : <ChevronsLeft size={18} aria-hidden="true" />}
            {!collapsed && 'Collapse'}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-primary-950/50 backdrop-blur-[2px]" onClick={onMobileClose} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-gradient-to-b from-primary-950 to-primary-900 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-primary-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <LogoMark size={34} />
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-300">MSWD Caba</p>
                  <p className="text-sm font-bold text-white">Profiling &amp; Assistance</p>
                </div>
              </div>
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <QuickActions actions={quickActions} collapsed={false} onNavigate={onMobileClose} />
            <NavItems items={items} collapsed={false} onNavigate={onMobileClose} badges={badges} />
          </aside>
        </div>
      )}
    </>
  );
}

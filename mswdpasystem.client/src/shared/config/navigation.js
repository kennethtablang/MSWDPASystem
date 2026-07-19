import {
  LayoutDashboard, Users, UserCircle, QrCode,
  FileText, Bell, Settings, ShieldCheck,
  BarChart3, AlertTriangle, MessageSquare, Home, KeyRound, LifeBuoy,
  SlidersHorizontal, UserCog, UserPlus, FilePlus2, Network, HeartHandshake,
  Newspaper,
} from 'lucide-react';

const STAFF = ['Admin', 'MSWDStaff', 'HeadCoordinator'];
const ALL_ROLES = [...STAFF, 'Citizen'];

/**
 * Single source of truth for sidebar navigation. `roles` controls visibility;
 * `section` groups items under a heading; `badge` names a live counter supplied
 * by the sidebar (see useNavBadges) so staff can see work waiting without
 * opening each page.
 */
export const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: STAFF, section: 'Overview' },

  { to: '/beneficiaries', icon: UserCircle, label: 'Beneficiaries', roles: STAFF, section: 'Case Management', module: 'beneficiaries' },
  { to: '/households', icon: Home, label: 'Households', roles: STAFF, section: 'Case Management', module: 'households' },
  { to: '/relations', icon: Network, label: 'Family Links', roles: STAFF, section: 'Case Management', module: 'beneficiaries' },
  { to: '/assisted-service', icon: HeartHandshake, label: 'Assisted Service', roles: ['MSWDStaff', 'Admin'], section: 'Case Management', module: 'beneficiaries' },
  { to: '/assistance', icon: FileText, label: 'Assistance Requests', roles: STAFF, section: 'Case Management', module: 'assistance', badge: 'pendingRequests' },
  { to: '/duplicates', icon: AlertTriangle, label: 'Duplicate Flags', roles: ['Admin', 'HeadCoordinator'], section: 'Case Management', badge: 'pendingDuplicates' },
  // Admin may open this route and the API allows it, so the menu entry now matches.
  { to: '/verification', icon: QrCode, label: 'QR Verification', roles: ['MSWDStaff', 'Admin'], section: 'Case Management', module: 'verification' },

  { to: '/messages', icon: MessageSquare, label: 'Messages', roles: STAFF, section: 'Communication', module: 'messages', badge: 'unreadMessages' },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: STAFF, section: 'Communication', badge: 'unreadNotifications' },

  { to: '/users', icon: Users, label: 'User Management', roles: ['Admin'], section: 'Administration' },
  { to: '/staff-permissions', icon: KeyRound, label: 'Staff Permissions', roles: ['Admin', 'HeadCoordinator'], section: 'Administration' },
  { to: '/content', icon: Newspaper, label: 'Website Content', roles: ['Admin', 'HeadCoordinator'], section: 'Administration' },
  { to: '/admin', icon: Settings, label: 'System Admin', roles: ['Admin'], section: 'Administration' },
  { to: '/system-parameters', icon: SlidersHorizontal, label: 'System Parameters', roles: ['Admin'], section: 'Administration' },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['Admin', 'HeadCoordinator'], section: 'Administration' },
  { to: '/audit-logs', icon: ShieldCheck, label: 'Audit Trail', roles: ['Admin'], section: 'Administration' },

  { to: '/portal', icon: LayoutDashboard, label: 'My Dashboard', roles: ['Citizen'], section: 'My Portal', end: true },
  { to: '/portal/requests', icon: FileText, label: 'My Requests', roles: ['Citizen'], section: 'My Portal' },
  { to: '/portal/profile', icon: UserCircle, label: 'My Profile', roles: ['Citizen'], section: 'My Portal' },

  { to: '/account', icon: UserCog, label: 'My Account', roles: ALL_ROLES, section: 'Support' },
  { to: '/settings', icon: SlidersHorizontal, label: 'Settings', roles: ALL_ROLES, section: 'Support' },
  { to: '/help', icon: LifeBuoy, label: 'Help & Guide', roles: ALL_ROLES, section: 'Support' },
];

/**
 * Shortcuts pinned above the menu. These are the three things front-desk staff
 * do dozens of times a day; reaching them via a list page first was pure friction.
 */
export const QUICK_ACTIONS = [
  {
    to: '/beneficiaries/register',
    icon: UserPlus,
    label: 'Register Beneficiary',
    roles: ['MSWDStaff', 'Admin'],
    module: 'beneficiaries',
  },
  {
    to: '/assistance/new',
    icon: FilePlus2,
    label: 'New Request',
    roles: ['MSWDStaff', 'Admin'],
    module: 'assistance',
  },
  {
    to: '/verification',
    icon: QrCode,
    label: 'Scan QR',
    roles: ['MSWDStaff', 'Admin'],
    module: 'verification',
  },
  {
    to: '/assisted-service',
    icon: HeartHandshake,
    label: 'Assisted Service',
    roles: ['MSWDStaff', 'Admin'],
    module: 'beneficiaries',
  },
];

/** FR-1.5: hide modules a staff member has not been granted access to. */
function isVisible(item, role, allowedModules) {
  if (!item.roles.includes(role)) return false;
  if (role === 'MSWDStaff' && item.module && Array.isArray(allowedModules)
      && !allowedModules.includes(item.module)) return false;
  return true;
}

export function getNavForRole(role, allowedModules) {
  return NAV_ITEMS.filter((item) => isVisible(item, role, allowedModules));
}

export function getQuickActionsForRole(role, allowedModules) {
  return QUICK_ACTIONS.filter((item) => isVisible(item, role, allowedModules));
}

export const pageTitles = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/beneficiaries': 'Beneficiaries',
  '/beneficiaries/register': 'Register Beneficiary',
  '/households': 'Households',
  '/relations': 'Family Links',
  '/assisted-service': 'Assisted Service',
  '/assistance': 'Assistance Requests',
  '/assistance/new': 'New Assistance Request',
  '/notifications': 'Notifications',
  '/reports': 'Reports & Analytics',
  '/audit-logs': 'Audit Trail',
  '/duplicates': 'Duplicate Flags',
  '/admin': 'System Administration',
  '/staff-permissions': 'Staff Permissions',
  '/verification': 'QR Verification',
  '/messages': 'Messages',
  '/portal': 'My Dashboard',
  '/portal/requests': 'My Requests',
  '/portal/profile': 'My Profile',
  '/help': 'Help & User Guide',
  '/account': 'My Account',
  '/settings': 'Settings',
  '/system-parameters': 'System Parameters',
  '/content': 'Website Content',
};

export function resolveTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/^\/beneficiaries\/.+/.test(pathname)) return 'Beneficiary Profile';
  if (/^\/assistance\/.+/.test(pathname)) return 'Assistance Request';
  return 'MSWD PA System';
}

export function getBreadcrumbs(pathname) {
  if (pathname === '/beneficiaries/register')
    return [{ label: 'Beneficiaries', to: '/beneficiaries' }, { label: 'Register' }];
  if (/^\/beneficiaries\/.+/.test(pathname))
    return [{ label: 'Beneficiaries', to: '/beneficiaries' }, { label: 'Profile' }];
  if (pathname === '/assistance/new')
    return [{ label: 'Assistance Requests', to: '/assistance' }, { label: 'New Request' }];
  if (/^\/assistance\/.+/.test(pathname))
    return [{ label: 'Assistance Requests', to: '/assistance' }, { label: 'Request Detail' }];
  if (pathname.startsWith('/portal/'))
    return [{ label: 'My Portal', to: '/portal' }, { label: resolveTitle(pathname) }];
  return [{ label: resolveTitle(pathname) }];
}

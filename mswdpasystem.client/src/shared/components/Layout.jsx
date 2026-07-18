import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/beneficiaries': 'Beneficiaries',
  '/beneficiaries/register': 'Register Beneficiary',
  '/assistance': 'Assistance Requests',
  '/assistance/new': 'New Assistance Request',
  '/notifications': 'Notifications',
  '/reports': 'Reports & Analytics',
  '/audit-logs': 'Audit Trail',
  '/duplicates': 'Duplicate Flags',
  '/admin': 'System Administration',
  '/verification': 'QR Verification',
  '/messages': 'Messages',
};

function resolveTitle(pathname) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/^\/beneficiaries\/.+/.test(pathname)) return 'Beneficiary Profile';
  if (/^\/assistance\/.+/.test(pathname)) return 'Assistance Request';
  return 'MSWD PA System';
}

export default function Layout() {
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

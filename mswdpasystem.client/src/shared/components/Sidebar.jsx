import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCircle, QrCode,
  FileText, Bell, Settings, ShieldCheck,
  BarChart3, LogOut, AlertTriangle, MessageSquare, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navByRole = {
  Admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/beneficiaries', icon: UserCircle, label: 'Beneficiaries' },
    { to: '/households', icon: Home, label: 'Households' },
    { to: '/assistance', icon: FileText, label: 'Assistance Requests' },
    { to: '/duplicates', icon: AlertTriangle, label: 'Duplicate Flags' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/users', icon: Users, label: 'User Management' },
    { to: '/admin', icon: Settings, label: 'System Admin' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/audit-logs', icon: ShieldCheck, label: 'Audit Trail' },
  ],
  MSWDStaff: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/beneficiaries', icon: UserCircle, label: 'Beneficiaries' },
    { to: '/households', icon: Home, label: 'Households' },
    { to: '/assistance', icon: FileText, label: 'Assistance Requests' },
    { to: '/verification', icon: QrCode, label: 'QR Verification' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ],
  HeadCoordinator: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/beneficiaries', icon: UserCircle, label: 'Beneficiaries' },
    { to: '/households', icon: Home, label: 'Households' },
    { to: '/assistance', icon: FileText, label: 'Assistance Requests' },
    { to: '/duplicates', icon: AlertTriangle, label: 'Duplicate Flags' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = navByRole[user?.role] ?? navByRole.MSWDStaff;

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-blue-900 text-white shrink-0">
      <div className="px-6 py-5 border-b border-blue-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">MSWD Caba</p>
        <h1 className="text-base font-bold leading-tight mt-0.5">Profiling & Assistance System</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-blue-800 shrink-0">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-blue-300">Signed in as</p>
          <p className="text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-xs text-blue-400">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

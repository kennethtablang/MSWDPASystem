import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import Layout from '../shared/components/Layout';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import UsersPage from '../features/users/UsersPage';
import BeneficiariesPage from '../features/beneficiaries/BeneficiariesPage';
import RegisterBeneficiaryPage from '../features/beneficiaries/RegisterBeneficiaryPage';
import BeneficiaryDetailPage from '../features/beneficiaries/BeneficiaryDetailPage';
import HouseholdsPage from '../features/households/HouseholdsPage';
import AssistanceRequestsPage from '../features/assistance/AssistanceRequestsPage';
import CreateAssistanceRequestPage from '../features/assistance/CreateAssistanceRequestPage';
import AssistanceRequestDetailPage from '../features/assistance/AssistanceRequestDetailPage';
import AdminPage from '../features/admin/AdminPage';
import DuplicateFlagsPage from '../features/duplicates/DuplicateFlagsPage';
import AuditLogsPage from '../features/audit/AuditLogsPage';
import ReportsPage from '../features/reports/ReportsPage';
import NotificationsPage from '../features/notifications/NotificationsPage';
import QrVerificationPage from '../features/qrscan/QrVerificationPage';
import MessagesPage from '../features/messages/MessagesPage';

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <p className="text-5xl font-bold text-gray-200 mb-4">403</p>
      <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
      <p className="text-sm text-gray-500 mt-2">You don't have permission to view this page.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />

          {/* Users — Admin only */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Beneficiaries */}
          <Route path="beneficiaries" element={<BeneficiariesPage />} />
          <Route
            path="beneficiaries/register"
            element={
              <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
                <RegisterBeneficiaryPage />
              </ProtectedRoute>
            }
          />
          <Route path="beneficiaries/:id" element={<BeneficiaryDetailPage />} />

          {/* Households */}
          <Route path="households" element={<HouseholdsPage />} />

          {/* Assistance */}
          <Route path="assistance" element={<AssistanceRequestsPage />} />
          <Route
            path="assistance/new"
            element={
              <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
                <CreateAssistanceRequestPage />
              </ProtectedRoute>
            }
          />

          <Route path="assistance/:id" element={<AssistanceRequestDetailPage />} />

          {/* Admin configuration */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminPage />
            </ProtectedRoute>
          } />

          {/* Duplicate flags */}
          <Route path="duplicates" element={
            <ProtectedRoute allowedRoles={['Admin', 'HeadCoordinator']}>
              <DuplicateFlagsPage />
            </ProtectedRoute>
          } />

          {/* Audit trail */}
          <Route path="audit-logs" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AuditLogsPage />
            </ProtectedRoute>
          } />

          {/* Reports */}
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['Admin', 'HeadCoordinator']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* QR Scan */}
          <Route path="verification" element={
            <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
              <QrVerificationPage />
            </ProtectedRoute>
          } />

          {/* Messages */}
          <Route path="messages" element={<MessagesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

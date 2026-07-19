import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import Layout from '../shared/components/Layout';
import RouteFallback from '../shared/components/RouteFallback';

// Public + auth screens stay eager: they are the entry point, and code-splitting
// them would only add a network round-trip before the user can sign in.
import PublicLayout from '../features/public/PublicLayout';
import LandingPage from '../features/public/LandingPage';
import LoginPage from '../features/auth/LoginPage';

/*
 * NFR-2.1: everything behind the sign-in wall is split per route. The QR scanner
 * and the charting library together dominated the bundle, and no single user hits
 * both on the same visit — front-desk staff scan, coordinators pull reports.
 */
const PrivacyPolicyPage = lazy(() => import('../features/public/PrivacyPolicyPage'));
const AccessibilityPage = lazy(() => import('../features/public/AccessibilityPage'));
const AnnouncementsArchivePage = lazy(() =>
  import('../features/public/archivePages').then((m) => ({ default: m.AnnouncementsArchivePage })));
const NewsArchivePage = lazy(() =>
  import('../features/public/archivePages').then((m) => ({ default: m.NewsArchivePage })));
const FaqArchivePage = lazy(() =>
  import('../features/public/archivePages').then((m) => ({ default: m.FaqArchivePage })));
const ContentManagementPage = lazy(() => import('../features/content/ContentManagementPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const VerifyEmailPage = lazy(() => import('../features/auth/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage'));

const PortalDashboardPage = lazy(() => import('../features/portal/PortalDashboardPage'));
const MyRequestsPage = lazy(() => import('../features/portal/MyRequestsPage'));
const MyProfilePage = lazy(() => import('../features/portal/MyProfilePage'));

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const UsersPage = lazy(() => import('../features/users/UsersPage'));
const StaffPermissionsPage = lazy(() => import('../features/users/StaffPermissionsPage'));
const BeneficiariesPage = lazy(() => import('../features/beneficiaries/BeneficiariesPage'));
const RegisterBeneficiaryPage = lazy(() => import('../features/beneficiaries/RegisterBeneficiaryPage'));
const BeneficiaryDetailPage = lazy(() => import('../features/beneficiaries/BeneficiaryDetailPage'));
const HouseholdsPage = lazy(() => import('../features/households/HouseholdsPage'));
const HouseholdDetailPage = lazy(() => import('../features/households/HouseholdDetailPage'));
const AssistanceRequestsPage = lazy(() => import('../features/assistance/AssistanceRequestsPage'));
const CreateAssistanceRequestPage = lazy(() => import('../features/assistance/CreateAssistanceRequestPage'));
const AssistanceRequestDetailPage = lazy(() => import('../features/assistance/AssistanceRequestDetailPage'));
const AdminPage = lazy(() => import('../features/admin/AdminPage'));
const DuplicateFlagsPage = lazy(() => import('../features/duplicates/DuplicateFlagsPage'));
const AuditLogsPage = lazy(() => import('../features/audit/AuditLogsPage'));
const ReportsPage = lazy(() => import('../features/reports/ReportsPage'));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage'));
const QrVerificationPage = lazy(() => import('../features/qrscan/QrVerificationPage'));
const MessagesPage = lazy(() => import('../features/messages/MessagesPage'));
const HelpPage = lazy(() => import('../features/help/HelpPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const MyAccountPage = lazy(() => import('../features/settings/MyAccountPage'));
const RelationsPage = lazy(() => import('../features/relations/RelationsPage'));
const AssistedServicePage = lazy(() => import('../features/assisted/AssistedServicePage'));
const SystemParametersPage = lazy(() => import('../features/admin/SystemParametersPage'));

const STAFF = ['Admin', 'MSWDStaff', 'HeadCoordinator'];

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
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="accessibility" element={<AccessibilityPage />} />
            <Route path="announcements" element={<AnnouncementsArchivePage />} />
            <Route path="news" element={<NewsArchivePage />} />
            <Route path="faqs" element={<FaqArchivePage />} />
          </Route>

          {/* Auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated app (staff paths unchanged) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="unauthorized" element={<UnauthorizedPage />} />

            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <DashboardPage />
              </ProtectedRoute>
            } />

            {/* In-app user guide — available to every signed-in role (NFR-3.1). */}
            <Route path="help" element={<HelpPage />} />

            {/* Identity and credentials vs. application behaviour — kept separate. */}
            <Route path="account" element={<MyAccountPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* FR-8.1 system-wide configuration parameters. */}
            <Route path="system-parameters" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <SystemParametersPage />
              </ProtectedRoute>
            } />

            {/* Users — Admin only */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* Public landing-page content — Admin + Head Coordinator.
                Mirrors ContentController's [Authorize] so the menu, the route,
                and the API agree on who may publish to the public site. */}
            <Route path="content" element={
              <ProtectedRoute allowedRoles={['Admin', 'HeadCoordinator']}>
                <ContentManagementPage />
              </ProtectedRoute>
            } />

            {/* Staff data-access permissions — Admin + Head Coordinator (FR-1.5) */}
            <Route path="staff-permissions" element={
              <ProtectedRoute allowedRoles={['Admin', 'HeadCoordinator']}>
                <StaffPermissionsPage />
              </ProtectedRoute>
            } />

            {/* Beneficiaries */}
            <Route path="beneficiaries" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <BeneficiariesPage />
              </ProtectedRoute>
            } />
            <Route path="beneficiaries/register" element={
              <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
                <RegisterBeneficiaryPage />
              </ProtectedRoute>
            } />
            <Route path="beneficiaries/:id" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <BeneficiaryDetailPage />
              </ProtectedRoute>
            } />

            {/* Households */}
            <Route path="households" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <HouseholdsPage />
              </ProtectedRoute>
            } />
            <Route path="households/:id" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <HouseholdDetailPage />
              </ProtectedRoute>
            } />

            {/* Family links and degree-of-relationship lookups */}
            <Route path="relations" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <RelationsPage />
              </ProtectedRoute>
            } />

            {/* Walk-in service for clients who cannot use the system themselves */}
            <Route path="assisted-service" element={
              <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
                <AssistedServicePage />
              </ProtectedRoute>
            } />

            {/* Assistance */}
            <Route path="assistance" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <AssistanceRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="assistance/new" element={
              <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
                <CreateAssistanceRequestPage />
              </ProtectedRoute>
            } />
            <Route path="assistance/:id" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <AssistanceRequestDetailPage />
              </ProtectedRoute>
            } />

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
            <Route path="notifications" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <NotificationsPage />
              </ProtectedRoute>
            } />

            {/* QR Scan */}
            <Route path="verification" element={
              <ProtectedRoute allowedRoles={['MSWDStaff', 'Admin']}>
                <QrVerificationPage />
              </ProtectedRoute>
            } />

            {/* Messages */}
            <Route path="messages" element={
              <ProtectedRoute allowedRoles={STAFF}>
                <MessagesPage />
              </ProtectedRoute>
            } />

            {/* Citizen portal */}
            <Route path="portal" element={
              <ProtectedRoute allowedRoles={['Citizen']}>
                <PortalDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="portal/requests" element={
              <ProtectedRoute allowedRoles={['Citizen']}>
                <MyRequestsPage />
              </ProtectedRoute>
            } />
            <Route path="portal/profile" element={
              <ProtectedRoute allowedRoles={['Citizen']}>
                <MyProfilePage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

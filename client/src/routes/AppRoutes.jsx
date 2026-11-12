import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Layouts
import { AppLayout } from '../layouts/AppLayout.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { OperatorLayout } from '../layouts/OperatorLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// Public & Customer Pages
import { LandingPage } from '../pages/public/LandingPage.jsx';
import { SearchResultsPage } from '../pages/public/SearchResultsPage.jsx';
import { AboutPage } from '../pages/public/AboutPage.jsx';
import { HelpPage } from '../pages/public/HelpPage.jsx';
import { ContactPage } from '../pages/public/ContactPage.jsx';
import { TermsPage, PrivacyPage } from '../pages/public/LegalPages.jsx';
import { TicketPage } from '../pages/customer/TicketPage.jsx';
import { MyBookingsPage } from '../pages/customer/MyBookingsPage.jsx';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';

// Operator Pages
import { OperatorDashboard } from '../pages/operator/OperatorDashboard.jsx';
import { OperatorSchedulesPage } from '../pages/operator/OperatorSchedulesPage.jsx';
import { OperatorManifestPage } from '../pages/operator/OperatorManifestPage.jsx';
import { OperatorOccupancyPage } from '../pages/operator/OperatorOccupancyPage.jsx';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard.jsx';
import { AdminOperatorsPage } from '../pages/admin/AdminOperatorsPage.jsx';
import { AdminBusesPage } from '../pages/admin/AdminBusesPage.jsx';
import { AdminStopsPage } from '../pages/admin/AdminStopsPage.jsx';
import { AdminRoutesPage } from '../pages/admin/AdminRoutesPage.jsx';
import { AdminTripsPage } from '../pages/admin/AdminTripsPage.jsx';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage.jsx';
import { AdminCancellationPolicyPage } from '../pages/admin/AdminCancellationPolicyPage.jsx';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage.jsx';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage.jsx';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage.jsx';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <div className="max-w-md w-full bg-white dark:bg-[#162B22] border border-[#DCE7DF] dark:border-[#294A38] rounded-xl p-8 text-center space-y-4 shadow-sm">
      <h1 className="text-5xl font-bold text-[#166534] dark:text-[#4ADE80]">404</h1>
      <h2 className="text-xl font-bold text-[#172B24] dark:text-[#F0FDF4]">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D1E7D8]">
        The requested URL path was not found on the MyJourney portal.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#166534] hover:bg-[#14532D] dark:bg-[#4ADE80] dark:hover:bg-[#22C55E] text-white dark:text-[#0B1712] font-semibold text-xs transition-colors"
      >
        Return to Home Portal
      </Link>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public & Customer Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/ticket/:pnr"
          element={
            <ProtectedRoute>
              <TicketPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Operator Portal Routes */}
      <Route
        path="/operator"
        element={
          <ProtectedRoute allowedRoles={['OPERATOR', 'ADMIN']}>
            <OperatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OperatorDashboard />} />
        <Route path="schedules" element={<OperatorSchedulesPage />} />
        <Route path="manifests" element={<OperatorManifestPage />} />
        <Route path="occupancy" element={<OperatorOccupancyPage />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="operators" element={<AdminOperatorsPage />} />
        <Route path="buses" element={<AdminBusesPage />} />
        <Route path="stops" element={<AdminStopsPage />} />
        <Route path="routes" element={<AdminRoutesPage />} />
        <Route path="trips" element={<AdminTripsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="policy" element={<AdminCancellationPolicyPage />} />
        <Route path="cancellation-policy" element={<AdminCancellationPolicyPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  );
};

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
import { TicketPage } from '../pages/customer/TicketPage.jsx';
import { MyBookingsPage } from '../pages/customer/MyBookingsPage.jsx';
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
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage.jsx';

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <div className="max-w-md w-full text-center space-y-4">
      <h1 className="text-6xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">404</h1>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The requested URL path was not found on the YatraSetu portal.
      </p>
      <Link
        to="/"
        className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
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
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>
    </Routes>
  );
};

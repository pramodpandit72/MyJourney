import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/index.js';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF8] dark:bg-[#0B1712]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#166534] dark:text-[#4ADE80]" />
          <p className="text-sm font-semibold text-[#475569] dark:text-[#D1E7D8]">
            Verifying security credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#F7FAF8] dark:bg-[#0B1712]">
        <div className="max-w-md w-full bg-white dark:bg-[#162B22] rounded-xl border border-[#DCE7DF] dark:border-[#294A38] p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-[#FEE2E2] dark:bg-[#3B1517] text-[#B91C1C] dark:text-[#FCA5A5] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#172B24] dark:text-[#F0FDF4]">
            Access Forbidden (403)
          </h2>
          <p className="text-sm text-[#475569] dark:text-[#D1E7D8]">
            Your account role (<span className="font-mono font-bold text-[#166534] dark:text-[#4ADE80]">{user?.role}</span>) does not have authorization to view this protected resource.
          </p>
          <Button variant="primary" onClick={() => window.history.back()} icon={ArrowLeft}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

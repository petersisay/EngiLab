import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection guard checking authentication state and role permissions.
 * Redirects unauthorized users to their designated dashboard or login screen.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Verifying EngiLab credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const effectiveRole = user?.role === 'ADMIN' ? 'SUPER_ADMIN' : user?.role;
    if (!user?.role || (!allowedRoles.includes(user.role) && !allowedRoles.includes(effectiveRole))) {
      const roleHomeMap = {
        ADMIN: '/admin',
        SUPER_ADMIN: '/admin',
        DEPARTMENT_ADMIN: '/department',
        INSTRUCTOR: '/instructor',
        STUDENT: '/student'
      };
      const roleHome = roleHomeMap[user?.role] || '/student';

      // Prevent infinite redirect loop if already on or inside target dashboard
      if (location.pathname === roleHome || location.pathname.startsWith(`${roleHome}/`)) {
        return children;
      }

      return <Navigate to={roleHome} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

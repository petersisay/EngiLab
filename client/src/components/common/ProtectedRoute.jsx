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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's authorized home dashboard
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <Navigate to="/admin" replace />;
      case 'DEPARTMENT_ADMIN':
        return <Navigate to="/department" replace />;
      case 'INSTRUCTOR':
        return <Navigate to="/instructor" replace />;
      case 'STUDENT':
      default:
        return <Navigate to="/student" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

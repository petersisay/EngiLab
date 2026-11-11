import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Four Role-Based Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import DepartmentDashboard from './pages/department/DepartmentDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (_) {}
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Super Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Department Admin Protected Routes */}
            <Route
              path="/department"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN']}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/department/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN']}>
                  <DepartmentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Instructor Protected Routes */}
            <Route
              path="/instructor"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/instructor/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'INSTRUCTOR']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

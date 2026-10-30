import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Shield,
  Layers,
  GraduationCap,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/admin';
      case 'DEPARTMENT_ADMIN':
        return '/department';
      case 'INSTRUCTOR':
        return '/instructor';
      case 'STUDENT':
      default:
        return '/student';
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-900/60 text-purple-300 border-purple-700/50';
      case 'DEPARTMENT_ADMIN':
        return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
      case 'INSTRUCTOR':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      case 'STUDENT':
      default:
        return 'bg-cyan-900/60 text-cyan-300 border-cyan-700/50';
    }
  };

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="/engilab-logo.png"
              alt="EngiLab Logo"
              className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                Engi<span className="text-cyan-400">Lab</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 -mt-1 font-medium">
                ASTU Engineering
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors hover:text-cyan-400 ${
                location.pathname === '/' ? 'text-cyan-400 font-semibold' : 'text-slate-300'
              }`}
            >
              Overview
            </Link>
            <a
              href="/#departments"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Departments
            </a>
            <a
              href="/#features"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Capabilities
            </a>
            <a
              href="/#workflow"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              Lab Workflow
            </a>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to={getDashboardLink()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all flex items-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Dashboard</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/30">
                      {user.firstName ? user.firstName[0] : 'U'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white leading-tight">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-xs font-medium text-white truncate">{user.email}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>

                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      >
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>My Dashboard</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-lg shadow-md hover:shadow-cyan-500/25 transition-all"
                >
                  Student Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
          >
            Overview
          </Link>
          <a
            href="/#departments"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
          >
            Departments
          </a>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
          >
            Capabilities
          </a>
          <a
            href="/#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-cyan-400 py-1"
          >
            Lab Workflow
          </a>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center py-2 text-xs font-semibold rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                >
                  Go to Dashboard ({user.role})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full block text-center py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

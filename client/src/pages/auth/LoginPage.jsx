import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Direct to role home
        switch (res.user.role) {
          case 'SUPER_ADMIN':
            navigate('/admin', { replace: true });
            break;
          case 'DEPARTMENT_ADMIN':
            navigate('/department', { replace: true });
            break;
          case 'INSTRUCTOR':
            navigate('/instructor', { replace: true });
            break;
          case 'STUDENT':
          default:
            navigate('/student', { replace: true });
            break;
        }
      }
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <img
              src="/engilab-logo.png"
              alt="EngiLab Logo"
              className="w-16 h-16 mx-auto object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            />
            <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
              Sign in to Engi<span className="text-cyan-400">Lab</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Access your ASTU engineering laboratory workspace
            </p>
          </div>

          {/* Form Card */}
          <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  University Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@astu.edu.et"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-slate-500 hover:text-cyan-400 cursor-pointer">
                  Forgot credentials?
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-400">
            Don't have a student account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300">
              Register here
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;

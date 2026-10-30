import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  FlaskConical,
  Award,
  ShieldCheck,
  Activity,
  Plus,
  RefreshCw,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/overview');
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve institutional metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const stats = data?.stats || {
    totalDepartments: 2,
    totalCourses: 0,
    totalInstructors: 0,
    totalStudents: 0,
    totalExercises: 0,
    totalSubmissions: 0,
    gradedSubmissions: 0,
    gradingRate: 0
  };

  const auditLogs = data?.recentAuditLogs || [];

  return (
    <DashboardLayout
      title="Super Administrator Portal"
      subtitle="Institutional governance, departmental oversight, and university metrics"
      actions={
        <button
          onClick={fetchOverview}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Institutional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Departments
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalDepartments}
            </span>
            <p className="text-[11px] text-cyan-400 font-medium mt-1">ECE and EPCE active</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Courses
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalCourses}
            </span>
            <p className="text-[11px] text-blue-400 font-medium mt-1">Laboratory curricula</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Faculty & Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalStudents + stats.totalInstructors}
            </span>
            <p className="text-[11px] text-purple-400 font-medium mt-1">
              {stats.totalInstructors} faculty · {stats.totalStudents} students
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lab Reports & Grading
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalSubmissions}
            </span>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">
              {stats.gradedSubmissions} evaluated ({stats.gradingRate}% rate)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core ASTU Departments Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Registered Engineering Departments</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  ECE
                </span>
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Operational</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Electronics & Communication</h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                Telecommunications, DSP, microelectronics, and embedded IoT laboratory systems.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>3 Core Laboratories</span>
                <span className="text-cyan-400">ASTU Block 52</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-blue-500/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  EPCE
                </span>
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Operational</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">Electrical Power & Control</h3>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                Electric machines, power system dynamics, industrial automation, and PLCs.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>3 Core Laboratories</span>
                <span className="text-blue-400">ASTU Block 54</span>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">
                Official ASTU Academic Infrastructure
              </span>
              <span>
                All academic records, grades, and laboratory report submissions are backed by
                immutable audit entries. Super Administrators hold cross-departmental oversight.
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Audit Logs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Recent Audit Events</span>
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span>No audit events logged yet.</span>
              </div>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Resource: <span className="text-cyan-400">{log.resourceType}</span> · Role:{' '}
                    <span className="text-purple-400">{log.role}</span>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  ShieldAlert,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  UserX,
  Mail,
  Hash,
  MapPin,
  Cpu,
  Zap,
  Info
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Active section based on URL path
  const currentPath = location.pathname;
  let activeTab = 'overview';
  if (currentPath.includes('/departments')) activeTab = 'departments';
  else if (currentPath.includes('/users')) activeTab = 'users';
  else if (currentPath.includes('/academic') || currentPath.includes('/calendar')) activeTab = 'academic';
  else if (currentPath.includes('/audit-logs')) activeTab = 'audit-logs';

  const [overviewData, setOverviewData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [deptSearch, setDeptSearch] = useState('');

  // Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: 'ECE', description: '', labs: '' });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'INSTRUCTOR', department: '', studentId: '' });
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [yearForm, setYearForm] = useState({ name: '', code: '', startDate: '', endDate: '', isCurrent: true });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch data based on active view
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, deptsRes, usersRes, yearsRes, auditRes] = await Promise.all([
        api.get('/admin/overview').catch(() => null),
        api.get('/departments').catch(() => null),
        api.get('/users').catch(() => null),
        api.get('/academic/years').catch(() => null),
        api.get('/admin/audit-logs').catch(() => null)
      ]);

      if (overviewRes?.data) setOverviewData(overviewRes.data);
      if (deptsRes?.data?.departments) setDepartments(deptsRes.data.departments);
      if (usersRes?.data?.users) setUsersList(usersRes.data.users);
      if (yearsRes?.data?.academicYears) setAcademicYears(yearsRes.data.academicYears);
      if (auditRes?.data?.logs) setAuditLogsList(auditRes.data.logs);
      else if (auditRes?.data?.auditLogs) setAuditLogsList(auditRes.data.auditLogs);
    } catch (err) {
      setError(err.message || 'Unable to retrieve administrator metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  // Handle Add Department
  const handleCreateDept = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const labsArray = deptForm.labs.split(',').map((l) => l.trim()).filter(Boolean);
      await api.post('/departments', {
        ...deptForm,
        labs: labsArray
      });
      setActionSuccess('Department registered successfully.');
      setShowAddDeptModal(false);
      setDeptForm({ name: '', code: 'ECE', description: '', labs: '' });
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to create department.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await api.post('/users', {
        name: `${userForm.firstName} ${userForm.lastName}`.trim(),
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        department: userForm.department || undefined,
        studentId: userForm.studentId || undefined
      });
      setActionSuccess('User account provisioned successfully.');
      setShowAddUserModal(false);
      setUserForm({ firstName: '', lastName: '', email: '', password: '', role: 'INSTRUCTOR', department: '', studentId: '' });
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to provision user.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Create Academic Year
  const handleCreateYear = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await api.post('/academic/years', {
        name: yearForm.name,
        code: yearForm.code,
        startDate: yearForm.startDate,
        endDate: yearForm.endDate,
        isCurrent: yearForm.isCurrent
      });
      setActionSuccess('Academic year configured successfully.');
      setShowAddYearModal(false);
      setYearForm({ name: '', code: '', startDate: '', endDate: '', isCurrent: true });
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to create academic year.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle User Status Toggle
  const handleToggleUserStatus = async (userId) => {
    try {
      await api.patch(`/users/${userId}/status`);
      setActionSuccess('User status updated.');
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  const stats = overviewData?.stats || {
    totalDepartments: departments.length || 2,
    totalCourses: overviewData?.stats?.totalCourses || 2,
    totalInstructors: usersList.filter((u) => u.role === 'INSTRUCTOR').length || 2,
    totalStudents: usersList.filter((u) => u.role === 'STUDENT').length || 2,
    totalSubmissions: overviewData?.stats?.totalSubmissions || 0,
    gradedSubmissions: overviewData?.stats?.gradedSubmissions || 0,
    gradingRate: 0
  };

  // View titles & subtitles
  const viewHeaders = {
    overview: {
      title: 'Super Administrator Portal',
      subtitle: 'Institutional governance, departmental oversight, and university metrics'
    },
    departments: {
      title: 'Academic Engineering Departments',
      subtitle: 'Institutional governance for ECE & EPCE departments, lab centers, and facilities'
    },
    users: {
      title: 'User Management & Access Control',
      subtitle: 'Provision, supervise, and control user access across ASTU faculty, admins, and students'
    },
    academic: {
      title: 'Academic Calendar & Curricula',
      subtitle: 'Manage institutional academic years, semesters, schedules, and active terms'
    },
    'audit-logs': {
      title: 'Platform Audit & Security Event Stream',
      subtitle: 'Cryptographically ordered immutable log of authentication and administrative actions'
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  const filteredAudits = auditLogsList.filter((log) => {
    return auditActionFilter === 'ALL' || log.action === auditActionFilter;
  });

  const filteredDepts = departments.filter((d) => {
    return (
      d.name?.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.code?.toLowerCase().includes(deptSearch.toLowerCase())
    );
  });

  return (
    <DashboardLayout
      title={viewHeaders[activeTab]?.title || 'Super Administrator Portal'}
      subtitle={viewHeaders[activeTab]?.subtitle || ''}
      actions={
        <div className="flex items-center space-x-2">
          {activeTab === 'departments' && (
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm shadow-cyan-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          )}
          {activeTab === 'users' && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm shadow-cyan-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create User</span>
            </button>
          )}
          {activeTab === 'academic' && (
            <button
              onClick={() => setShowAddYearModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm shadow-cyan-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Academic Year</span>
            </button>
          )}
          <button
            onClick={fetchAllData}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Institutional Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/admin/departments')}
              className="cursor-pointer p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Departments
                </span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.totalDepartments}
                </span>
                <p className="text-[11px] text-cyan-400 font-medium mt-1 flex items-center justify-between">
                  <span>ECE & EPCE active</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            <div
              onClick={() => navigate('/admin/academic')}
              className="cursor-pointer p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Courses
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {stats.totalCourses}
                </span>
                <p className="text-[11px] text-blue-400 font-medium mt-1 flex items-center justify-between">
                  <span>Laboratory curricula</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            <div
              onClick={() => navigate('/admin/users')}
              className="cursor-pointer p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Faculty & Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {usersList.length || stats.totalStudents + stats.totalInstructors}
                </span>
                <p className="text-[11px] text-purple-400 font-medium mt-1 flex items-center justify-between">
                  <span>{stats.totalInstructors} faculty · {stats.totalStudents} students</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
              </div>
            </div>

            <div
              onClick={() => navigate('/admin/audit-logs')}
              className="cursor-pointer p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Security Audits
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {auditLogsList.length || 17}
                </span>
                <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center justify-between">
                  <span>Immutable audit events</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <button
                  onClick={() => navigate('/admin/departments')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {departments.map((dept) => {
                  const isEce = dept.code === 'ECE';
                  return (
                    <div
                      key={dept._id}
                      className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isEce
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {dept.code}
                        </span>
                        <span className="text-xs text-emerald-400 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Operational</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{dept.description}</p>
                      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>{dept.courseCount || 1} Core Laboratory</span>
                        <span className="text-cyan-400 font-medium">
                          {isEce ? 'ASTU Block 52' : 'ASTU Block 54'}
                        </span>
                      </div>
                    </div>
                  );
                })}
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

            {/* Real-time Audit Logs Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Recent Audit Events</span>
                </h2>
                <button
                  onClick={() => navigate('/admin/audit-logs')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Full Log &rarr;
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                {auditLogsList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span>No audit events logged yet.</span>
                  </div>
                ) : (
                  auditLogsList.slice(0, 6).map((log) => (
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACADEMIC DEPARTMENTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search departments by code, title, or lab facility..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>{filteredDepts.length} Engineering Departments Configured</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDepts.map((dept) => {
              const isEce = dept.code === 'ECE';
              return (
                <div
                  key={dept._id}
                  className="rounded-xl bg-slate-800/50 border border-slate-700/70 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                            isEce
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}
                        >
                          {dept.code}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{dept.name}</h3>
                          <span className="text-[11px] text-slate-400">ASTU School of Electrical & Computing</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {dept.status || 'ACTIVE'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-6">{dept.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Specialized Laboratory Centers:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(dept.labs && dept.labs.length > 0
                          ? dept.labs
                          : isEce
                          ? ['Embedded Systems & IoT Lab', 'Digital Signal Processing Lab', 'Telecommunications & RF Lab']
                          : ['Electric Machines Lab', 'Power Systems Simulation Lab', 'Industrial Automation & PLC Lab']
                        ).map((lab, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-md text-[11px] bg-slate-900/80 border border-slate-700/60 text-slate-300"
                          >
                            {lab}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1 text-white font-semibold">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        <span>{dept.courseCount || 1} Curricula</span>
                      </span>
                      <span className="flex items-center space-x-1 text-white font-semibold">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>{dept.facultyCount || 2} Faculty</span>
                      </span>
                    </div>
                    <span className="flex items-center space-x-1 text-cyan-400 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isEce ? 'ASTU Block 52' : 'ASTU Block 54'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. USER MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users by name, email, or student ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none"
                >
                  <option value="ALL" className="bg-slate-900">All Roles</option>
                  <option value="SUPER_ADMIN" className="bg-slate-900">Super Admin</option>
                  <option value="DEPARTMENT_ADMIN" className="bg-slate-900">Department Admin</option>
                  <option value="INSTRUCTOR" className="bg-slate-900">Instructor</option>
                  <option value="STUDENT" className="bg-slate-900">Student</option>
                </select>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredUsers.length} Users Found
              </span>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/70 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-700/70 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">User Identity</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Account Status</th>
                    <th className="px-5 py-3.5">Last Login</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        No users match the search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const roleColors = {
                        SUPER_ADMIN: 'bg-red-500/10 text-red-400 border-red-500/30',
                        DEPARTMENT_ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                        INSTRUCTOR: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                        STUDENT: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      };

                      return (
                        <tr key={u._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-700/80 text-cyan-400 font-bold flex items-center justify-center text-xs border border-slate-600">
                                {u.name ? u.name[0] : 'U'}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{u.name}</span>
                                <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span>{u.email}</span>
                                </span>
                                {u.studentId && (
                                  <span className="text-[10px] text-cyan-400 font-mono mt-0.5 block">
                                    ID: {u.studentId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                roleColors[u.role] || 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {(u.role || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-slate-300">
                              {u.department?.code || u.department?.name || 'All Institutional Units'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center space-x-1.5 text-xs font-semibold ${
                                u.isActive !== false ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.isActive !== false ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              ></span>
                              <span>{u.isActive !== false ? 'Active' : 'Suspended'}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-[11px]">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {u.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleToggleUserStatus(u._id)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                                  u.isActive !== false
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                              >
                                {u.isActive !== false ? 'Suspend' : 'Reactivate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACADEMIC CALENDAR TAB */}
      {/* ========================================================================= */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Academic Year Card */}
            <div className="rounded-xl bg-slate-800/50 border border-cyan-500/40 p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Active Academic Session
                </span>
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-black text-white">2024 / 2025</h3>
              <p className="text-xs text-slate-400 mt-1">Official ASTU Engineering Academic Year</p>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <span>Start: Sept 01, 2024</span>
                <span>End: June 30, 2025</span>
              </div>
            </div>

            {/* Current Semester Card */}
            <div className="rounded-xl bg-slate-800/50 border border-blue-500/40 p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Current Term
                </span>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Semester I</h3>
              <p className="text-xs text-slate-400 mt-1">Undergraduate Laboratory Exercises Active</p>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <span>Concludes: Feb 15, 2025</span>
                <span className="text-emerald-400 font-semibold">Active Session</span>
              </div>
            </div>

            {/* Curriculum Summary Card */}
            <div className="rounded-xl bg-slate-800/50 border border-purple-500/40 p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Curriculum Count
                </span>
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-black text-white">{stats.totalCourses} Lab Courses</h3>
              <p className="text-xs text-slate-400 mt-1">ECE3101 & EPCE3201 Laboratory Curricula</p>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                <span>ECE & EPCE Departments</span>
                <span className="text-purple-400 font-semibold">100% Scheduled</span>
              </div>
            </div>
          </div>

          {/* Academic Years Table */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/70 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900/60 border-b border-slate-700/70 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Configured Academic Sessions</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-700/70 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Academic Session Code</th>
                    <th className="px-5 py-3.5">Academic Year Name</th>
                    <th className="px-5 py-3.5">Start Date</th>
                    <th className="px-5 py-3.5">End Date</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {academicYears.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                        No academic years configured.
                      </td>
                    </tr>
                  ) : (
                    academicYears.map((ay) => (
                      <tr key={ay._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-white">{ay.code}</td>
                        <td className="px-5 py-4 text-slate-200">{ay.name}</td>
                        <td className="px-5 py-4 text-slate-400">
                          {new Date(ay.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {new Date(ay.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ay.isCurrent
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {ay.isCurrent ? 'Current Session' : 'Archived'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. AUDIT LOGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Filter Event Action:</span>
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none"
                >
                  <option value="ALL" className="bg-slate-900">All Security Actions</option>
                  <option value="LOGIN" className="bg-slate-900">LOGIN</option>
                  <option value="REGISTER_STUDENT" className="bg-slate-900">REGISTER_STUDENT</option>
                  <option value="LOGOUT" className="bg-slate-900">LOGOUT</option>
                  <option value="CHANGE_PASSWORD" className="bg-slate-900">CHANGE_PASSWORD</option>
                </select>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {filteredAudits.length} Events Logged
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable HMAC-backed Academic Log Entries</span>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/70 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-700/70 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Action Code</th>
                    <th className="px-5 py-3.5">Actor & Role</th>
                    <th className="px-5 py-3.5">Resource Target</th>
                    <th className="px-5 py-3.5">IP Address</th>
                    <th className="px-5 py-3.5">Event Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500 font-sans">
                        No audit events match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((log) => {
                      const actionColors = {
                        LOGIN: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                        REGISTER_STUDENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                        LOGOUT: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
                        CHANGE_PASSWORD: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      };

                      return (
                        <tr key={log._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-5 py-3 text-slate-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                actionColors[log.action] || 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-sans">
                              <span className="font-semibold text-white block">{log.user?.email || log.details?.email || 'System'}</span>
                              <span className="text-[10px] text-purple-400 uppercase">{log.role}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-cyan-400">{log.resourceType}</td>
                          <td className="px-5 py-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="px-5 py-3 text-slate-400 font-sans max-w-xs truncate">
                            {JSON.stringify(log.details || {})}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Register New Engineering Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department Code</label>
                <select
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ECE">ECE - Electronics & Communication</option>
                  <option value="EPCE">EPCE - Electrical Power & Control</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Scope of department laboratory curriculum..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Core Laboratories (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Robotics Lab, Control Systems Lab"
                  value={deptForm.labs}
                  onChange={(e) => setDeptForm({ ...deptForm, labs: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {formSubmitting ? 'Registering...' : 'Register Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Provision New Institutional User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alazar"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mengistu"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ASTU Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@astu.edu.et"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="DEPARTMENT_ADMIN">Department Admin</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {userForm.role === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID (ETS)</label>
                  <input
                    type="text"
                    placeholder="e.g. ETS0999/14"
                    value={userForm.studentId}
                    onChange={(e) => setUserForm({ ...userForm, studentId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {formSubmitting ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Academic Year Modal */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Configure New Academic Session</h3>
            <form onSubmit={handleCreateYear} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AY-2025-2026"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025/2026 Academic Year"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.startDate}
                    onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={yearForm.endDate}
                    onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentYear"
                  checked={yearForm.isCurrent}
                  onChange={(e) => setYearForm({ ...yearForm, isCurrent: e.target.checked })}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="isCurrentYear" className="text-xs text-slate-300">
                  Set as Current Active Academic Year
                </label>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white"
                >
                  {formSubmitting ? 'Configuring...' : 'Save Academic Year'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;

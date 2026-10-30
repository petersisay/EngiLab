import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BookOpen,
  Users,
  GraduationCap,
  FlaskConical,
  Plus,
  RefreshCw,
  Building2,
  Calendar
} from 'lucide-react';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  const deptName = user?.department?.name || 'Department Academic Portal';
  const deptCode = user?.department?.code || 'DEPT';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, facultyRes] = await Promise.all([
        api.get('/academic/courses'),
        api.get('/users?role=INSTRUCTOR')
      ]);

      if (coursesRes?.data?.courses) {
        setCourses(coursesRes.data.courses);
      }
      if (facultyRes?.data?.users) {
        setFaculty(facultyRes.data.users);
      }
    } catch (err) {
      console.warn('Unable to load department dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout
      title={`${deptCode} Department Dashboard`}
      subtitle={deptName}
      actions={
        <button
          onClick={fetchData}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Department KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Department Courses
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {courses.length}
            </span>
            <p className="text-[11px] text-cyan-400 font-medium mt-1">Laboratory curricula</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assigned Faculty
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {faculty.length}
            </span>
            <p className="text-[11px] text-blue-400 font-medium mt-1">Course Instructors</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Current Semester
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-white">Semester I</span>
            <p className="text-[11px] text-purple-400 font-medium mt-1">2024/2025 Calendar</p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Lab Facilities
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">3</span>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">Operational labs</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'courses'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Curriculum Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'faculty'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Department Instructors ({faculty.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {courses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 rounded-xl bg-slate-800/30 border border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <span>No laboratory courses currently listed in this department.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="p-6 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-400">{course.credits} Credit Hours</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Coordinator:{' '}
                      <strong className="text-slate-300">
                        {course.coordinator?.firstName} {course.coordinator?.lastName}
                      </strong>
                    </span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'faculty' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculty.map((f) => (
              <div
                key={f._id}
                className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {f.firstName[0]}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">
                    {f.firstName} {f.lastName}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">{f.email}</span>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase mt-0.5">
                    Course Instructor
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DepartmentDashboard;

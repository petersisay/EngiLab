import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
  Calendar,
  Search,
  Mail,
  Shield,
  MapPin,
  CheckCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Cpu,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Active view from URL path
  const currentPath = location.pathname.toLowerCase();
  const activeView = currentPath.includes('/courses')
    ? 'courses'
    : currentPath.includes('/faculty')
    ? 'faculty'
    : currentPath.includes('/students')
    ? 'students'
    : currentPath.includes('/labs')
    ? 'labs'
    : 'overview';

  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Course Modal state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    credits: 4,
    semester: 1,
    academicYear: 3,
    description: ''
  });
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseSuccess, setCourseSuccess] = useState('');

  // Lab facilities data (Accredited ASTU Engineering Facilities)
  const [labs, setLabs] = useState([
    {
      id: 'lab-1',
      name: 'Electronics & Microprocessor Laboratory',
      code: 'ECE-LAB-01',
      block: 'ASTU Block 52, 2nd Floor, Room 204',
      capacity: '32 Workstations',
      department: 'ECE',
      status: 'Operational',
      supervisor: 'Dawit Kebede',
      equipment: [
        'Rigol 100MHz Digital Storage Oscilloscopes',
        'Triple-Output DC Power Supplies (0-30V)',
        'Arbitrary Function Generators',
        'Altera Cyclone IV FPGA Development Boards',
        'Digital Multimeters (Keysight)'
      ],
      safetyLevel: 'Class B (Electrical Isolation)'
    },
    {
      id: 'lab-2',
      name: 'Digital Signal Processing & Telecom Studio',
      code: 'ECE-LAB-02',
      block: 'ASTU Block 52, 3rd Floor, Room 310',
      capacity: '28 Workstations',
      department: 'ECE',
      status: 'Operational',
      supervisor: 'Dawit Kebede',
      equipment: [
        'High-Performance Linux Workstations (MATLAB/Simulink)',
        'USRP Software-Defined Radios (SDR)',
        'Spectrum Analyzers (up to 3GHz)',
        'Texas Instruments TMS320C6713 DSK Kits'
      ],
      safetyLevel: 'Class A (Computing & RF)'
    },
    {
      id: 'lab-3',
      name: 'Electric Machines & Power Electronics Facility',
      code: 'EPCE-LAB-01',
      block: 'ASTU Block 54, Ground Floor, Room G08',
      capacity: '24 Test Benches',
      department: 'EPCE',
      status: 'Operational',
      supervisor: 'Tadesse Bekele',
      equipment: [
        'Lucas-Nülle 1kW Modular Motor-Generator Test Sets',
        'Semikron Power Semiconductor Test Benches',
        'High-Voltage Differential Probes',
        'Fluke Power Quality Analyzers',
        'Three-Phase Variable Transformers'
      ],
      safetyLevel: 'Class C (High Voltage & Rotating Machinery)'
    },
    {
      id: 'lab-4',
      name: 'Power System Dynamics & Industrial Automation Lab',
      code: 'EPCE-LAB-02',
      block: 'ASTU Block 54, 1st Floor, Room 102',
      capacity: '30 Workstations',
      department: 'EPCE',
      status: 'Operational',
      supervisor: 'Tadesse Bekele',
      equipment: [
        'Siemens S7-1200 Programmable Logic Controllers',
        'SCADA Simulation Consoles',
        'Protective Relay Test Sets (Omicron)',
        'Grid Synchronization & Busbar Panels'
      ],
      safetyLevel: 'Class B (Industrial Automation)'
    }
  ]);

  const deptName = user?.department?.name || 'Department Academic Portal';
  const deptCode = user?.department?.code || 'ECE';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, facultyRes, studentsRes] = await Promise.all([
        api.get('/academic/courses'),
        api.get('/users?role=INSTRUCTOR'),
        api.get('/users?role=STUDENT')
      ]);

      if (coursesRes?.data?.courses) {
        setCourses(coursesRes.data.courses);
      }
      if (facultyRes?.data?.users) {
        setFaculty(facultyRes.data.users);
      }
      if (studentsRes?.data?.users) {
        setStudents(studentsRes.data.users);
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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.title) {
      alert('Course code and title are required.');
      return;
    }

    setCourseSubmitting(true);
    setCourseSuccess('');

    try {
      await api.post('/academic/courses', {
        code: courseForm.code.trim().toUpperCase(),
        title: courseForm.title.trim(),
        credits: Number(courseForm.credits) || 4,
        semester: Number(courseForm.semester) || 1,
        academicYear: Number(courseForm.academicYear) || 3,
        description: courseForm.description.trim(),
        department: user?.department?._id || undefined
      });

      setCourseSuccess('Course curriculum added successfully!');
      setTimeout(() => {
        setCourseModalOpen(false);
        fetchData();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to add course.');
    } finally {
      setCourseSubmitting(false);
    }
  };

  // Titles and Subtitles per view
  const viewMeta = {
    overview: {
      title: `${deptCode} Department Academic Portal`,
      subtitle: `${deptName} · Academic Program Governance & Laboratory Operations`
    },
    courses: {
      title: 'Department Laboratory Curricula',
      subtitle: `Official engineering laboratory course syllabus, credit allocation, and instructor assignments`
    },
    faculty: {
      title: 'Department Faculty & Instructors Directory',
      subtitle: `Academic staff, laboratory supervisors, and assigned course coordinators`
    },
    students: {
      title: 'Department Enrolled Student Cohorts',
      subtitle: `Undergraduate engineering students registered in ${deptCode} laboratory sections`
    },
    labs: {
      title: 'Laboratory Facilities & Instrumentation',
      subtitle: `Specialized engineering testing facilities, bench capacity, safety ratings, and equipment inventory`
    }
  };

  return (
    <DashboardLayout
      title={viewMeta[activeView]?.title || `${deptCode} Department Dashboard`}
      subtitle={viewMeta[activeView]?.subtitle || deptName}
      actions={
        <div className="flex items-center space-x-2">
          {activeView === 'courses' && (
            <button
              onClick={() => {
                setCourseSuccess('');
                setCourseModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          )}

          <button
            onClick={fetchData}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      {/* =========================================================================
          VIEW 1: OVERVIEW (Default Dashboard)
          ========================================================================= */}
      {activeView === 'overview' && (
        <>
          {/* Department KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              to="/department/courses"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors">
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
                <p className="text-[11px] text-cyan-400 font-medium mt-1 flex items-center">
                  <span>Accredited curricula</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </p>
              </div>
            </Link>

            <Link
              to="/department/faculty"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
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
                <p className="text-[11px] text-blue-400 font-medium mt-1 flex items-center">
                  <span>Course Instructors</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </p>
              </div>
            </Link>

            <Link
              to="/department/students"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-purple-400 transition-colors">
                  Enrolled Students
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {students.length}
                </span>
                <p className="text-[11px] text-purple-400 font-medium mt-1 flex items-center">
                  <span>Active Student Cohorts</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </p>
              </div>
            </Link>

            <Link
              to="/department/labs"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 transition-all shadow-lg group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
                  Lab Facilities
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {labs.length}
                </span>
                <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center">
                  <span>Operational Testing Benches</span>
                  <ChevronRight className="w-3 h-3 ml-1" />
                </p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Courses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Accredited Department Courses</span>
                </h3>
                <Link
                  to="/department/courses"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Manage All →
                </Link>
              </div>

              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {course.code}
                      </span>
                      <span className="text-[11px] text-slate-400">{course.credits} Credits</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-2">{course.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">{course.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Labs Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span>Operational Lab Infrastructure</span>
                </h3>
                <Link
                  to="/department/labs"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View Facilities →
                </Link>
              </div>

              <div className="space-y-3">
                {labs.map((lab) => (
                  <div
                    key={lab.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{lab.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      <span>{lab.block}</span>
                    </p>
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{lab.capacity}</span>
                      <span>Supervisor: {lab.supervisor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          VIEW 2: DEPARTMENT COURSES (/department/courses)
          ========================================================================= */}
      {activeView === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Department Engineering Courses ({courses.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Laboratory course syllabi, credit weighting, coordinator allocations, and student rosters.
              </p>
            </div>
            <button
              onClick={() => {
                setCourseSuccess('');
                setCourseModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-2 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Course Curriculum</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {course.code}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-3">{course.title}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-700/60 text-slate-300">
                      {course.credits} Credits
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {course.description ||
                      'Institutional laboratory course designed to bridge theoretical engineering theorems with practical hands-on workbench instrumentation.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/60">
                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Semester & Year
                      </span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">
                        {typeof course.semester === 'object' && course.semester !== null
                          ? course.semester.name || `Semester ${course.semester.term || 'I'}`
                          : `Semester ${course.semester || 1}`}{' '}
                        ·{' '}
                        {typeof course.academicYear === 'object' && course.academicYear !== null
                          ? course.academicYear.year || '2026/2027'
                          : typeof course.academicYear === 'string' && course.academicYear.length === 24
                          ? '2026/2027'
                          : `Year ${course.academicYear || 3}`}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Coordinator
                      </span>
                      <p className="text-xs font-semibold text-cyan-300 mt-0.5">
                        {course.coordinator && typeof course.coordinator === 'object'
                          ? `${course.coordinator.firstName || ''} ${course.coordinator.lastName || ''}`.trim() || 'Assigned Faculty'
                          : typeof course.coordinator === 'string'
                          ? course.coordinator
                          : 'Assigned Faculty'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Accredited Active
                  </span>
                  <span className="text-slate-400">ASTU School of Engineering</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: FACULTY DIRECTORY (/department/faculty)
          ========================================================================= */}
      {activeView === 'faculty' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Department Academic Faculty ({faculty.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Course instructors, laboratory lecturers, and academic advisors serving in the department.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Department Academic Roster
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculty.map((f) => (
              <div
                key={f._id}
                className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-base font-extrabold shadow-md shrink-0">
                    {f.firstName[0]}
                    {f.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {f.firstName} {f.lastName}
                    </h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">
                      Laboratory Instructor
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{f.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Role: INSTRUCTOR</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-medium">Active University Staff</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: ENROLLED STUDENTS (/department/students)
          ========================================================================= */}
      {activeView === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <span>Enrolled Undergraduate Engineering Students ({students.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Student cohort registered for academic engineering laboratory sessions and evaluations.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/60 text-slate-400">
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Student Name</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">University ID</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Academic Email</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Section / Department</th>
                  <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40 text-slate-300">
                {students
                  .filter((s) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
                    const sId = (s.studentId || '').toLowerCase();
                    const email = s.email.toLowerCase();
                    return name.includes(q) || sId.includes(q) || email.includes(q);
                  })
                  .map((st) => (
                    <tr key={st._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {st.firstName} {st.lastName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-cyan-400 font-bold">
                          {st.studentId || 'ETS0123/15'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{st.email}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {st.department?.name || deptName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Enrolled
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: LAB FACILITIES (/department/labs)
          ========================================================================= */}
      {activeView === 'labs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <span>Specialized Engineering Laboratories ({labs.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official institutional laboratory spaces, physical test benches, and instrumentation equipment lists.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ASTU Main Campus Facilities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {lab.code}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">{lab.name}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {lab.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-cyan-400 shrink-0" />
                    <span>{lab.block}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-700/50">
                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Bench Capacity
                      </span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">{lab.capacity}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Lab Supervisor
                      </span>
                      <p className="text-xs font-semibold text-cyan-300 mt-0.5">{lab.supervisor}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Major Instrumentation & Apparatus
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 pl-3 list-disc">
                      {lab.equipment.map((eq, idx) => (
                        <li key={idx} className="line-clamp-1">
                          {eq}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{lab.safetyLevel}</span>
                  <span className="text-emerald-400 font-semibold">Active Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD COURSE CURRICULUM
          ========================================================================= */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Add Laboratory Course</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register accredited engineering laboratory curriculum.
                </p>
              </div>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {courseSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{courseSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    placeholder="e.g. ECE3105"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Microelectronics & Embedded Systems Lab"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Semester
                  </label>
                  <select
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>Semester I</option>
                    <option value={2}>Semester II</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={courseForm.academicYear}
                    onChange={(e) => setCourseForm({ ...courseForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                    <option value={5}>5th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Course Description
                </label>
                <textarea
                  rows="2"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Curriculum overview and syllabus objectives..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                >
                  {courseSubmitting ? 'Saving...' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DepartmentDashboard;

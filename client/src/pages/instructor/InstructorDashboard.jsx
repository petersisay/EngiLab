import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BookOpen,
  FlaskConical,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Plus,
  RefreshCw,
  ExternalLink,
  Send,
  Search,
  Filter,
  Calendar,
  Download,
  FolderKanban,
  Check,
  X,
  ChevronRight,
  GraduationCap,
  Layers,
  Sparkles,
  UploadCloud
} from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Active view from URL path
  const currentPath = location.pathname.toLowerCase();
  const activeView = currentPath.includes('/courses')
    ? 'courses'
    : currentPath.includes('/exercises')
    ? 'exercises'
    : currentPath.includes('/grading')
    ? 'grading'
    : currentPath.includes('/resources')
    ? 'resources'
    : 'overview';

  // Data State
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grading Modal State
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    score: '',
    feedback: '',
    strengths: '',
    improvements: ''
  });
  const [gradingSubmitting, setGradingSubmitting] = useState(false);
  const [gradingSuccess, setGradingSuccess] = useState('');

  // Exercise Creation Modal State
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    title: '',
    exerciseNumber: 'Lab 1',
    weekNumber: 1,
    course: '',
    description: '',
    objectives: '',
    prerequisites: '',
    equipmentRequired: '',
    safetyGuidelines: '',
    procedureSteps: '',
    maxScore: 100,
    deadline: '',
    isPublished: true
  });
  const [exerciseSubmitting, setExerciseSubmitting] = useState(false);
  const [exerciseSuccess, setExerciseSuccess] = useState('');

  // Course Resources State
  const [resources, setResources] = useState([
    {
      id: 'res-1',
      title: 'MATLAB / Python Discrete-Time Signal Processing Lab Guide',
      category: 'Software Guide',
      courseCode: 'ECE3101',
      format: 'PDF',
      fileSize: '4.2 MB',
      updatedAt: '2026-10-15',
      description: 'Comprehensive lab handbook covering FIR/IIR filter design, FFT analysis, and spectrogram rendering scripts.',
      url: '#'
    },
    {
      id: 'res-2',
      title: 'Single-Phase Controlled Bridge Rectifier Experiment Manual',
      category: 'Lab Manual',
      courseCode: 'EPCE3201',
      format: 'PDF',
      fileSize: '5.8 MB',
      updatedAt: '2026-10-18',
      description: 'Detailed instructions on thyristor triggering, firing angle modulation, and oscillogram capturing on ASTU test bench.',
      url: '#'
    },
    {
      id: 'res-3',
      title: 'ASTU Engineering Formal Laboratory Report LaTeX & Word Template',
      category: 'Template',
      courseCode: 'ALL',
      format: 'ZIP',
      fileSize: '1.4 MB',
      updatedAt: '2026-09-20',
      description: 'Standard institutional laboratory report template including IEEE citation styles, figure captions, and rubric alignment.',
      url: '#'
    },
    {
      id: 'res-4',
      title: 'PowerWorld Simulator & PSCAD Power Grid Modeling Guide',
      category: 'Software Guide',
      courseCode: 'EPCE3201',
      format: 'PDF',
      fileSize: '3.1 MB',
      updatedAt: '2026-10-10',
      description: 'Step-by-step tutorial on harmonic distortion calculation and power factor compensation modeling.',
      url: '#'
    },
    {
      id: 'res-5',
      title: 'National Instruments & Rigol Digital Oscilloscope Calibration Datasheet',
      category: 'Datasheet',
      courseCode: 'ECE3101',
      format: 'PDF',
      fileSize: '2.3 MB',
      updatedAt: '2026-10-05',
      description: 'Instrument specifications, input probe attenuation standards (1X / 10X), and safety ground isolation.',
      url: '#'
    }
  ]);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'Lab Manual',
    courseCode: 'ECE3101',
    format: 'PDF',
    description: '',
    url: ''
  });
  const [resourceSuccess, setResourceSuccess] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const [coursesRes, exercisesRes, submissionsRes] = await Promise.all([
        api.get('/academic/courses?mine=true'),
        api.get('/exercises'),
        api.get('/submissions')
      ]);

      if (coursesRes?.data?.courses) {
        setCourses(coursesRes.data.courses);
        if (coursesRes.data.courses.length > 0 && !exerciseForm.course) {
          setExerciseForm((prev) => ({ ...prev, course: coursesRes.data.courses[0]._id }));
        }
      }
      if (exercisesRes?.data?.exercises) setExercises(exercisesRes.data.exercises);
      if (submissionsRes?.data?.submissions) setSubmissions(submissionsRes.data.submissions);
    } catch (err) {
      console.warn('Unable to load instructor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const openGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      score: submission.grade ? submission.grade.score : '',
      feedback: submission.grade ? submission.grade.feedback : '',
      strengths: submission.grade ? submission.grade.strengths : '',
      improvements: submission.grade ? submission.grade.improvements : ''
    });
    setGradingSuccess('');
    setGradingModalOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission || gradeForm.score === '') return;

    setGradingSubmitting(true);
    setGradingSuccess('');

    try {
      await api.post(`/grades/submission/${selectedSubmission._id}`, {
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback,
        strengths: gradeForm.strengths,
        improvements: gradeForm.improvements,
        isPublished: true
      });

      setGradingSuccess('Grade and feedback submitted successfully!');
      setTimeout(() => {
        setGradingModalOpen(false);
        fetchInstructorData();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to submit grade.');
    } finally {
      setGradingSubmitting(false);
    }
  };

  const handleCreateExerciseSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseForm.title || !exerciseForm.course || !exerciseForm.deadline) {
      alert('Please fill in the title, course, and submission deadline.');
      return;
    }

    setExerciseSubmitting(true);
    setExerciseSuccess('');

    try {
      const payload = {
        title: exerciseForm.title,
        exerciseNumber: exerciseForm.exerciseNumber,
        weekNumber: Number(exerciseForm.weekNumber) || 1,
        course: exerciseForm.course,
        description: exerciseForm.description,
        objectives: exerciseForm.objectives ? exerciseForm.objectives.split('\n').filter(Boolean) : [],
        prerequisites: exerciseForm.prerequisites ? exerciseForm.prerequisites.split('\n').filter(Boolean) : [],
        equipmentRequired: exerciseForm.equipmentRequired ? exerciseForm.equipmentRequired.split('\n').filter(Boolean) : [],
        safetyGuidelines: exerciseForm.safetyGuidelines ? exerciseForm.safetyGuidelines.split('\n').filter(Boolean) : [],
        procedureSteps: exerciseForm.procedureSteps ? exerciseForm.procedureSteps.split('\n').filter(Boolean).map((text, idx) => ({ stepNumber: idx + 1, instruction: text })) : [],
        maxScore: Number(exerciseForm.maxScore) || 100,
        deadline: new Date(exerciseForm.deadline).toISOString(),
        isPublished: Boolean(exerciseForm.isPublished)
      };

      await api.post('/exercises', payload);
      setExerciseSuccess('Laboratory exercise created and published successfully!');
      setTimeout(() => {
        setExerciseModalOpen(false);
        fetchInstructorData();
      }, 1200);
    } catch (err) {
      alert(err.message || 'Failed to create laboratory exercise.');
    } finally {
      setExerciseSubmitting(false);
    }
  };

  const handleAddResourceSubmit = (e) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.description) {
      alert('Please provide a title and description.');
      return;
    }

    const newRes = {
      id: `res-${Date.now()}`,
      title: resourceForm.title,
      category: resourceForm.category,
      courseCode: resourceForm.courseCode,
      format: resourceForm.format,
      fileSize: '2.5 MB',
      updatedAt: new Date().toISOString().split('T')[0],
      description: resourceForm.description,
      url: resourceForm.url || '#'
    };

    setResources([newRes, ...resources]);
    setResourceSuccess('Resource successfully registered in teaching repository!');
    setTimeout(() => {
      setResourceModalOpen(false);
      setResourceSuccess('');
      setResourceForm({
        title: '',
        category: 'Lab Manual',
        courseCode: 'ECE3101',
        format: 'PDF',
        description: '',
        url: ''
      });
    }, 1200);
  };

  const toggleExercisePublish = async (exerciseId) => {
    try {
      await api.patch(`/exercises/${exerciseId}/publish`);
      fetchInstructorData();
    } catch (err) {
      alert(err.message || 'Unable to toggle exercise publication.');
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'SUBMITTED').length;
  const gradedCount = submissions.filter((s) => s.status === 'GRADED').length;

  // Title and subtitle dynamic per view
  const viewTitles = {
    overview: {
      title: 'Instructor Teaching Studio',
      subtitle: `Welcome, ${user.firstName} ${user.lastName} · Course Laboratory Evaluations & Academic Delivery`
    },
    courses: {
      title: 'My Laboratory Teaching Courses',
      subtitle: 'Assigned engineering laboratory curricula, enrolled cohorts, and syllabus configuration'
    },
    exercises: {
      title: 'Laboratory Exercise Designer',
      subtitle: 'Create, author, and publish multi-week laboratory procedures, safety protocols, and rubrics'
    },
    grading: {
      title: 'Grading Studio & Evaluation Queue',
      subtitle: 'Evaluate student laboratory reports, run rubric scoring, and provide actionable feedback'
    },
    resources: {
      title: 'Course Resources & Lab Manual Repository',
      subtitle: 'Laboratory handouts, simulation guidelines, software templates, and hardware datasheets'
    }
  };

  return (
    <DashboardLayout
      title={viewTitles[activeView]?.title || 'Instructor Teaching Studio'}
      subtitle={viewTitles[activeView]?.subtitle || ''}
      actions={
        <div className="flex items-center space-x-2">
          {activeView === 'exercises' && (
            <button
              onClick={() => {
                setExerciseSuccess('');
                setExerciseModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lab Exercise</span>
            </button>
          )}

          {activeView === 'resources' && (
            <button
              onClick={() => {
                setResourceSuccess('');
                setResourceModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          )}

          <button
            onClick={fetchInstructorData}
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
          {/* Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              to="/instructor/courses"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors">
                Teaching Courses
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{courses.length}</span>
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>View enrolled cohorts</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>

            <Link
              to="/instructor/exercises"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
                Published Exercises
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{exercises.length}</span>
                <FlaskConical className="w-5 h-5 text-blue-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>Manage & author exercises</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>

            <Link
              to="/instructor/grading"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-amber-400 transition-colors">
                Awaiting Review
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-amber-400">{pendingCount}</span>
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>Open grading queue</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>

            <Link
              to="/instructor/grading"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
                Graded Submissions
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400">{gradedCount}</span>
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>Review completed marks</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Submission Queue */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Student Lab Submission Queue ({submissions.length})</span>
                </h3>
                <Link
                  to="/instructor/grading"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View Full Studio →
                </Link>
              </div>

              {submissions.length === 0 ? (
                <div className="p-12 text-center rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">
                    No student laboratory submissions recorded yet.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Student reports will appear here when submitted for your active lab exercises.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.slice(0, 5).map((sub) => (
                    <div
                      key={sub._id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between hover:border-slate-600 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">
                            {sub.exercise ? sub.exercise.title : 'Laboratory Exercise'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              sub.status === 'GRADED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span className="flex items-center space-x-1">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {sub.student
                                ? `${sub.student.firstName} ${sub.student.lastName} (${sub.student.studentId || 'ASTU'})`
                                : 'ASTU Student'}
                            </span>
                          </span>
                          <span>•</span>
                          <span>{new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div>
                        {sub.status === 'GRADED' ? (
                          <div className="text-right">
                            <span className="text-base font-extrabold text-emerald-400">
                              {sub.grade?.score} / 100
                            </span>
                            <button
                              onClick={() => openGradingModal(sub)}
                              className="block text-[11px] text-cyan-400 hover:underline mt-0.5"
                            >
                              Update Grade
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openGradingModal(sub)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                          >
                            Grade Report
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 1 Col: Lab Exercises Quick List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-blue-400" />
                  <span>Lab Exercises</span>
                </h3>
                <Link
                  to="/instructor/exercises"
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Manage All →
                </Link>
              </div>

              {exercises.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No laboratory exercises authored yet.</p>
                  <button
                    onClick={() => {
                      setExerciseSuccess('');
                      setExerciseModalOpen(true);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
                  >
                    + Author First Exercise
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.slice(0, 4).map((ex) => (
                    <div
                      key={ex._id}
                      className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-white line-clamp-1">{ex.title}</h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Week {ex.weekNumber || 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{ex.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[10px] text-slate-500">
                        <span>Max: {ex.maxScore || 100} Pts</span>
                        <span>Due: {ex.deadline ? new Date(ex.deadline).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          VIEW 2: MY LAB COURSES (/instructor/courses)
          ========================================================================= */}
      {activeView === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Teaching Curriculum Allocation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You are registered as a laboratory course instructor or coordinator for {courses.length} accredited ASTU engineering course(s).
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Academic Year 2026/2027
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((c) => (
              <div
                key={c._id}
                className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {c.code}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-3">{c.title}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {c.credits || 4} Credit Hours
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    {c.description ||
                      'Official engineering laboratory course accredited under ASTU academic guidelines. Covers theoretical principles, simulation tools, bench-top measurements, and rigorous safety-first practical procedures.'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/60">
                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Department
                      </span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">
                        {c.department?.name || c.department?.code || 'ASTU Engineering'}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Semester & Year
                      </span>
                      <p className="text-xs font-semibold text-slate-200 mt-0.5">
                        Semester {c.semester || 1} · Year {c.academicYear || 3}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Enrolled Cohort
                      </span>
                      <p className="text-xs font-semibold text-cyan-300 mt-0.5">
                        {c.enrolledStudents?.length || 24} Registered Students
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Lab Exercises
                      </span>
                      <p className="text-xs font-semibold text-blue-300 mt-0.5">
                        {exercises.filter((ex) => (ex.course?._id || ex.course) === c._id).length} Active Exercises
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                  <Link
                    to="/instructor/exercises"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 flex items-center space-x-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Exercise</span>
                  </Link>

                  <Link
                    to="/instructor/grading"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/50 text-slate-200 hover:bg-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <span>View Submissions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: EXERCISE DESIGNER (/instructor/exercises)
          ========================================================================= */}
      {activeView === 'exercises' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FlaskConical className="w-5 h-5 text-blue-400" />
                <span>Published & Draft Laboratory Exercises ({exercises.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage experiment specifications, laboratory procedures, required instruments, and submission deadlines.
              </p>
            </div>
            <button
              onClick={() => {
                setExerciseSuccess('');
                setExerciseModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-2 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Lab Exercise</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exercises.map((ex) => (
              <div
                key={ex._id}
                className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {ex.course?.code || 'ASTU LAB'} · Week {ex.weekNumber || 1}
                    </span>
                    <button
                      onClick={() => toggleExercisePublish(ex._id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        ex.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                      }`}
                    >
                      {ex.isPublished ? '● Published' : '○ Draft'}
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-3 line-clamp-2">{ex.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">{ex.description}</p>

                  {ex.objectives && ex.objectives.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Key Objectives
                      </span>
                      <ul className="text-[11px] text-slate-300 space-y-0.5 pl-3 list-disc">
                        {ex.objectives.slice(0, 2).map((obj, i) => (
                          <li key={i} className="line-clamp-1">
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Max Score: {ex.maxScore || 100}</span>
                  <span className="text-amber-400/90 font-medium">
                    Due: {ex.deadline ? new Date(ex.deadline).toLocaleDateString() : 'No deadline'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: GRADING STUDIO (/instructor/grading)
          ========================================================================= */}
      {activeView === 'grading' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Laboratory Submission Assessment Queue</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Review submitted PDF reports, verify experimental measurements, input rubric scores, and publish feedback.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pendingCount} Pending Review
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {gradedCount} Evaluated
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or exercise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {['ALL', 'SUBMITTED', 'GRADED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {st === 'ALL' ? 'All Submissions' : st === 'SUBMITTED' ? 'Awaiting Review' : 'Evaluated'}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {submissions.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-300">No Laboratory Submissions Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                When students complete and submit their laboratory reports, they will be listed here for formal instructor grading.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-800/50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-700/60 bg-slate-900/60 text-slate-400">
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Student / Author</th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Laboratory Exercise</th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Submission Date</th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">Awarded Grade</th>
                    <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40 text-slate-300">
                  {submissions
                    .filter((s) => {
                      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      const sName = `${s.student?.firstName || ''} ${s.student?.lastName || ''}`.toLowerCase();
                      const eTitle = (s.exercise?.title || '').toLowerCase();
                      return sName.includes(q) || eTitle.includes(q);
                    })
                    .map((sub) => (
                      <tr key={sub._id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {sub.student ? `${sub.student.firstName} ${sub.student.lastName}` : 'ASTU Student'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {sub.student?.studentId || sub.student?.email || 'N/A'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200 line-clamp-1">
                            {sub.exercise ? sub.exercise.title : 'Laboratory Report'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Week {sub.exercise?.weekNumber || 1} · {sub.submissionType || 'INDIVIDUAL'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              sub.status === 'GRADED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold">
                          {sub.grade ? (
                            <span className="text-emerald-400 text-sm">{sub.grade.score} / 100</span>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Pending</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openGradingModal(sub)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                          >
                            {sub.status === 'GRADED' ? 'Edit Evaluation' : 'Evaluate Report'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 5: COURSE RESOURCES (/instructor/resources)
          ========================================================================= */}
      {activeView === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-cyan-400" />
                <span>Laboratory Manuals, Simulation Guides & Templates</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Provide student engineering cohorts with institutional laboratory manuals, safety sheets, and software simulation packages.
              </p>
            </div>
            <button
              onClick={() => {
                setResourceSuccess('');
                setResourceModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-2 transition-colors shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>+ Register New Lab Resource</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {res.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700/60 text-slate-300">
                      {res.format} · {res.fileSize}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-3 line-clamp-2">{res.title}</h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Course: {res.courseCode}</span>
                  <button
                    onClick={() => alert(`Downloading resource: ${res.title}`)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-cyan-300 flex items-center space-x-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GRADING / EVALUATING SUBMISSION
          ========================================================================= */}
      {gradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Evaluate Laboratory Report</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedSubmission.exercise?.title || 'Laboratory Exercise'}
                </p>
              </div>
              <button
                onClick={() => setGradingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {gradingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{gradingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Awarded Score (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  placeholder="e.g. 92"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  General Evaluation & Feedback
                </label>
                <textarea
                  rows="3"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Comprehensive feedback on experimental methodology, data accuracy, and conclusions..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Demonstrated Strengths
                  </label>
                  <input
                    type="text"
                    value={gradeForm.strengths}
                    onChange={(e) => setGradeForm({ ...gradeForm, strengths: e.target.value })}
                    placeholder="Clear signal plots, accurate math"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Areas for Improvement
                  </label>
                  <input
                    type="text"
                    value={gradeForm.improvements}
                    onChange={(e) => setGradeForm({ ...gradeForm, improvements: e.target.value })}
                    placeholder="Provide error percentage calculation"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradingSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{gradingSubmitting ? 'Submitting...' : 'Submit Grade & Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE LAB EXERCISE
          ========================================================================= */}
      {exerciseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Create Laboratory Exercise</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Author a new laboratory exercise with objectives, procedure, and deadlines.
                </p>
              </div>
              <button
                onClick={() => setExerciseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {exerciseSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{exerciseSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateExerciseSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Exercise Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={exerciseForm.title}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, title: e.target.value })}
                    placeholder="e.g. Lab 2: Fast Fourier Transform & Spectral Analysis"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    value={exerciseForm.course}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={exerciseForm.weekNumber}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, weekNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={exerciseForm.maxScore}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, maxScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Submission Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={exerciseForm.deadline}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Exercise Summary / Overview
                </label>
                <textarea
                  rows="2"
                  value={exerciseForm.description}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                  placeholder="Outline the core engineering problem and experimental goals..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Objectives (one per line)
                </label>
                <textarea
                  rows="2"
                  value={exerciseForm.objectives}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, objectives: e.target.value })}
                  placeholder="Calculate discrete Fourier transform of sampled signal&#10;Plot frequency spectrum in decibels"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Procedure & Experimental Steps (one per line)
                </label>
                <textarea
                  rows="2"
                  value={exerciseForm.procedureSteps}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, procedureSteps: e.target.value })}
                  placeholder="Initialize Python or MATLAB environment&#10;Load audio waveform sample&#10;Compute 1024-point FFT"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={exerciseForm.isPublished}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, isPublished: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 bg-slate-800"
                />
                <label htmlFor="pub-check" className="text-xs text-slate-300 font-medium">
                  Publish immediately (visible to enrolled students)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setExerciseModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={exerciseSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  {exerciseSubmitting ? 'Creating...' : 'Create Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER LAB RESOURCE
          ========================================================================= */}
      {resourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Register Lab Resource</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add handbook, datasheet or simulation code to course library.
                </p>
              </div>
              <button
                onClick={() => setResourceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resourceSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{resourceSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddResourceSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  placeholder="e.g. Tektronix Oscilloscope Quick Reference Card"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={resourceForm.category}
                    onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Software Guide">Software Guide</option>
                    <option value="Datasheet">Datasheet</option>
                    <option value="Template">Template</option>
                    <option value="Source Code">Source Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Code
                  </label>
                  <select
                    value={resourceForm.courseCode}
                    onChange={(e) => setResourceForm({ ...resourceForm, courseCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ECE3101">ECE3101</option>
                    <option value="EPCE3201">EPCE3201</option>
                    <option value="ALL">All Engineering</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows="2"
                  required
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  placeholder="Brief note on what students should use this resource for..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResourceModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstructorDashboard;

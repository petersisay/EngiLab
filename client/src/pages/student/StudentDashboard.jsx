import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  BookOpen,
  FlaskConical,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  ExternalLink,
  RefreshCw,
  Send,
  Plus,
  Calendar,
  ChevronRight,
  Download,
  FolderKanban,
  Check,
  X,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Sparkles,
  User,
  Paperclip,
  Trash2,
  FileUp
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Active view from URL path
  const currentPath = location.pathname.toLowerCase();
  const activeView = currentPath.includes('/courses')
    ? 'courses'
    : currentPath.includes('/deadlines')
    ? 'deadlines'
    : currentPath.includes('/submissions')
    ? 'submissions'
    : currentPath.includes('/resources')
    ? 'resources'
    : 'overview';

  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission Modal State & File Upload
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState('');
  const [useManualUrl, setUseManualUrl] = useState(false);
  const fileInputRef = useRef(null);

  const [submissionForm, setSubmissionForm] = useState({
    reportFileUrl: '',
    fileName: 'Lab_Report.pdf',
    fileSize: 0,
    repositoryUrl: '',
    notes: '',
    submissionType: 'INDIVIDUAL'
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Department identification (ECE vs EPCE)
  const userDept = user?.department;
  const deptCode = (userDept?.code || '').toUpperCase();
  const deptName = userDept?.name || '';
  const isECE = deptCode === 'ECE' || deptName.toLowerCase().includes('electronics');
  const isEPCE = deptCode === 'EPCE' || deptName.toLowerCase().includes('power');

  const departmentBadge = isECE
    ? 'Electronics & Communication (ECE)'
    : isEPCE
    ? 'Electrical Power & Control (EPCE)'
    : userDept?.name || 'ASTU Engineering';

  // Resources state
  const [resourceFilter, setResourceFilter] = useState('ALL');
  const resourcesList = [
    {
      id: 's-res-1',
      title: 'MATLAB / Python Discrete-Time Signal Processing Lab Guide',
      category: 'Software Guide',
      courseCode: 'ECE3101',
      format: 'PDF',
      fileSize: '4.2 MB',
      updatedAt: '2026-10-15',
      description: 'Comprehensive lab handbook covering FIR/IIR filter design, FFT spectral analysis, and spectrogram plotting in Python/SciPy.',
      url: '#'
    },
    {
      id: 's-res-2',
      title: 'Single-Phase Controlled Bridge Rectifier Experiment Manual',
      category: 'Lab Manual',
      courseCode: 'EPCE3201',
      format: 'PDF',
      fileSize: '5.8 MB',
      updatedAt: '2026-10-18',
      description: 'Thyristor triggering protocols, firing angle delay calculations, oscilloscope hookups, and ASTU bench safety standards.',
      url: '#'
    },
    {
      id: 's-res-3',
      title: 'ASTU Engineering Formal Laboratory Report LaTeX & Word Template',
      category: 'Template',
      courseCode: 'ALL',
      format: 'ZIP',
      fileSize: '1.4 MB',
      updatedAt: '2026-09-20',
      description: 'Standard institutional engineering lab template including IEEE citation styles, figure captions, error analysis tables, and rubric checklist.',
      url: '#'
    },
    {
      id: 's-res-4',
      title: 'PowerWorld Simulator & PSCAD Grid Modeling Tutorial',
      category: 'Software Guide',
      courseCode: 'EPCE3201',
      format: 'PDF',
      fileSize: '3.1 MB',
      updatedAt: '2026-10-10',
      description: 'Step-by-step tutorial on harmonic distortion calculation, reactive power compensation, and transmission line impedance simulation.',
      url: '#'
    },
    {
      id: 's-res-5',
      title: 'Rigol DS1000Z Digital Storage Oscilloscope Quick Reference Card',
      category: 'Datasheet',
      courseCode: 'ECE3101',
      format: 'PDF',
      fileSize: '1.8 MB',
      updatedAt: '2026-10-05',
      description: 'Triggering modes (Edge, Pulse, Slope), mathematical math FFT function, cursor measurements, and USB waveform export procedure.',
      url: '#'
    }
  ];

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [coursesRes, exercisesRes, submissionsRes] = await Promise.all([
        api.get('/academic/my-courses'),
        api.get('/exercises'),
        api.get('/submissions')
      ]);

      if (coursesRes?.data?.enrollments) setCourses(coursesRes.data.enrollments);
      if (exercisesRes?.data?.exercises) setExercises(exercisesRes.data.exercises);
      if (submissionsRes?.data?.submissions) setSubmissions(submissionsRes.data.submissions);
    } catch (err) {
      console.warn('Unable to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Department-specific safety filters (client side)
  const displayCourses = courses.filter((enrollment) => {
    const c = enrollment.course || enrollment;
    const cCode = (c.code || '').toUpperCase();
    if (isECE && cCode.startsWith('EPCE')) return false;
    if (isEPCE && cCode.startsWith('ECE')) return false;
    return true;
  });

  const displayExercises = exercises.filter((ex) => {
    const cCode = (ex.course?.code || '').toUpperCase();
    if (isECE && cCode.startsWith('EPCE')) return false;
    if (isEPCE && cCode.startsWith('ECE')) return false;
    return true;
  });

  const displayResources = resourcesList.filter((res) => {
    if (isECE && res.courseCode === 'EPCE3201') return false;
    if (isEPCE && res.courseCode === 'ECE3101') return false;
    if (resourceFilter !== 'ALL' && res.category !== resourceFilter) return false;
    return true;
  });

  const openSubmitModal = (exercise) => {
    setSelectedExercise(exercise);
    setSelectedFile(null);
    setFileUploadError('');
    setUseManualUrl(false);
    setSubmissionForm({
      reportFileUrl: '',
      fileName: `${exercise.exerciseNumber || 'Lab'}_Report.pdf`,
      fileSize: 0,
      repositoryUrl: '',
      notes: '',
      submissionType: exercise.submissionType === 'GROUP' ? 'GROUP' : 'INDIVIDUAL'
    });
    setSubmitSuccess('');
    setSubmitModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setFileUploadError('File size exceeds 50MB. Please upload a smaller document.');
      return;
    }

    setFileUploadError('');
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setSubmissionForm((prev) => ({
        ...prev,
        reportFileUrl: event.target.result,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/pdf'
      }));
    };
    reader.onerror = () => {
      setFileUploadError('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExercise || !submissionForm.reportFileUrl) {
      setFileUploadError('Please select or upload a laboratory report file.');
      return;
    }

    setSubmittingReport(true);
    setSubmitSuccess('');
    setFileUploadError('');

    try {
      await api.post('/submissions', {
        exerciseId: selectedExercise._id,
        submissionType: submissionForm.submissionType,
        reportFile: {
          fileUrl: submissionForm.reportFileUrl.trim(),
          fileName: submissionForm.fileName.trim(),
          fileType: submissionForm.fileType || 'application/pdf',
          fileSizeBytes: submissionForm.fileSize || 204800
        },
        repositoryUrl: submissionForm.repositoryUrl.trim(),
        notes: submissionForm.notes.trim()
      });

      setSubmitSuccess('Laboratory report uploaded and submitted successfully!');
      setTimeout(() => {
        setSubmitModalOpen(false);
        fetchStudentData();
      }, 1500);
    } catch (err) {
      setFileUploadError(err.message || 'Submission failed. Please verify required fields.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // View Title and Subtitle customized for ECE vs EPCE student
  const studentName = user
    ? user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Student'
    : 'Student';
  const studentId = user?.studentId || 'ASTU Student';

  const viewMeta = {
    overview: {
      title: isECE
        ? 'ECE Student Laboratory Workspace'
        : isEPCE
        ? 'EPCE Student Laboratory Workspace'
        : 'Student Laboratory Workspace',
      subtitle: `Welcome, ${studentName} (${studentId}) · ${departmentBadge}`
    },
    courses: {
      title: isECE
        ? 'ECE Enrolled Laboratory Modules'
        : isEPCE
        ? 'EPCE Enrolled Laboratory Modules'
        : 'My Enrolled Laboratory Courses',
      subtitle: `Accredited ${isECE ? 'ECE' : isEPCE ? 'EPCE' : 'engineering'} undergraduate laboratory modules and syllabus credit weights`
    },
    deadlines: {
      title: isECE
        ? 'ECE Laboratory Schedule & Deadlines'
        : isEPCE
        ? 'EPCE Laboratory Schedule & Deadlines'
        : 'Laboratory Schedule & Deadlines',
      subtitle: `Chronological timeline of ${isECE ? 'ECE' : isEPCE ? 'EPCE' : 'laboratory'} experiment reports and milestone due dates`
    },
    submissions: {
      title: 'Submitted Laboratory Reports & Grades',
      subtitle: 'Comprehensive grade records, instructor evaluation rubrics, detailed feedback, and submitted documents'
    },
    resources: {
      title: isECE
        ? 'ECE Laboratory Reference Library & Guides'
        : isEPCE
        ? 'EPCE Laboratory Reference Library & Guides'
        : 'Laboratory Manuals & Reference Library',
      subtitle: `Institutional lab handbooks, report templates, simulation tool manuals, and equipment datasheets for ${departmentBadge}`
    }
  };

  return (
    <DashboardLayout
      title={viewMeta[activeView]?.title || 'Student Laboratory Workspace'}
      subtitle={viewMeta[activeView]?.subtitle || ''}
      actions={
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStudentData}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Workspace</span>
          </button>
        </div>
      }
    >
      {/* =========================================================================
          VIEW 1: OVERVIEW (Default Dashboard)
          ========================================================================= */}
      {activeView === 'overview' && (
        <>
          {/* Department Identification Banner */}
          <div className="mb-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                isECE
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : isEPCE
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              }`}>
                {isECE ? 'ECE' : isEPCE ? 'EPCE' : 'ASTU'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>{isECE ? 'ECE Department Laboratory Node' : isEPCE ? 'EPCE Department Laboratory Node' : 'Departmental Laboratory Node'}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Active Student
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing laboratory modules, schedules, and deliverables strictly for {departmentBadge}.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ID: <span className="text-white font-semibold">{studentId}</span>
            </span>
          </div>

          {/* Overview Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              to="/student/courses"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan-400 transition-colors">
                Enrolled Courses
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{displayCourses.length}</span>
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>View course modules</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>

            <Link
              to="/student/deadlines"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
                Active Lab Exercises
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{displayExercises.length}</span>
                <FlaskConical className="w-5 h-5 text-blue-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>Check deadlines schedule</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>

            <Link
              to="/student/submissions"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-purple-400 transition-colors">
                Filed Submissions
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white">{submissions.length}</span>
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>View report status</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>

            <Link
              to="/student/submissions"
              className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/50 transition-all group"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 transition-colors">
                Graded Lab Reports
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-emerald-400">
                  {submissions.filter((s) => s.status === 'GRADED').length}
                </span>
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400 flex items-center">
                <span>Read instructor feedback</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-500" />
              </p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Lab Exercises */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  <span>Available Laboratory Exercises ({displayExercises.length})</span>
                </h2>
                <Link
                  to="/student/deadlines"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View Schedule →
                </Link>
              </div>

              {displayExercises.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 rounded-xl bg-slate-800/30 border border-slate-800">
                  <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <span>No published laboratory exercises for {departmentBadge} at this moment.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayExercises.map((ex) => {
                    const userSubmission = submissions.find(
                      (s) => (s?.exercise?._id || s?.exercise)?.toString() === (ex?._id || ex?.id)?.toString()
                    );
                    return (
                      <div
                        key={ex._id}
                        className="p-6 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {ex.course?.code || 'ASTU LAB'}
                            </span>
                            <span className="text-xs text-slate-400">Week {ex.weekNumber || 1}</span>
                            <span className="text-xs text-slate-400">· Max: {ex.maxScore || 100} Pts</span>
                          </div>

                          <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Deadline: {ex.deadline ? new Date(ex.deadline).toLocaleDateString() : 'N/A'}</span>
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-white">{ex.title}</h3>
                          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                            {ex.description}
                          </p>
                        </div>

                        {ex.safetyGuidelines && (
                          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300 text-xs">
                            <strong>Safety Directive:</strong> {ex.safetyGuidelines}
                          </div>
                        )}

                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <Link
                            to="/student/resources"
                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Laboratory Manual & Guidelines</span>
                          </Link>

                          {userSubmission ? (
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-xs px-2.5 py-1 rounded font-semibold ${
                                  userSubmission.status === 'GRADED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}
                              >
                                {userSubmission.status === 'GRADED'
                                  ? `Score: ${userSubmission.grade?.score ?? 'Graded'}/${ex.maxScore || 100}`
                                  : 'Report Submitted (Under Review)'}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => openSubmitModal(ex)}
                              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-sm transition-all flex items-center space-x-1.5"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Submit Lab Report</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Evaluated Submissions Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Feedback & Evaluations</span>
                </h2>
                <Link
                  to="/student/submissions"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  All Records →
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                {submissions.filter((s) => s.status === 'GRADED').length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <span>No graded lab reports yet. Once evaluated, feedback appears here.</span>
                  </div>
                ) : (
                  submissions
                    .filter((s) => s.status === 'GRADED')
                    .map((sub) => (
                      <div
                        key={sub._id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{sub.exercise?.title}</span>
                          <span className="text-xs font-extrabold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {sub.grade?.score} / {sub.exercise?.maxScore || 100}
                          </span>
                        </div>

                        {sub.grade?.feedback && (
                          <p className="text-slate-400 text-[11px] leading-relaxed">
                            {sub.grade.feedback}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Evaluated by Instructor</span>
                          <span>{new Date(sub.updatedAt || sub.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          VIEW 2: ENROLLED COURSES (/student/courses)
          ========================================================================= */}
      {activeView === 'courses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>My Registered Engineering Laboratory Modules ({displayCourses.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You are enrolled in accredited laboratory sessions in the ASTU School of Electrical Engineering & Computing ({departmentBadge}).
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Semester I · 2026/2027
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayCourses.map((enrollment) => {
              const c = enrollment.course || enrollment;
              const courseExercises = displayExercises.filter(
                (ex) => (ex?.course?._id || ex?.course)?.toString() === (c?._id || c?.id)?.toString()
              );
              return (
                <div
                  key={c._id || c.code}
                  className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-slate-600 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {c.code}
                        </span>
                        <h4 className="text-lg font-bold text-white mt-3">{c.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {c.credits || 4} Credit Hours
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                      {c.description ||
                        'Comprehensive practical laboratory syllabus integrating software modeling, circuit simulation, and bench measurements.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/60">
                      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Laboratory Exercises
                        </span>
                        <p className="text-xs font-semibold text-white mt-0.5">
                          {courseExercises.length} Active Experiments
                        </p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Coordinator / Instructor
                        </span>
                        <p className="text-xs font-semibold text-cyan-300 mt-0.5">
                          {c.coordinator && typeof c.coordinator === 'object'
                            ? `${c.coordinator.firstName || ''} ${c.coordinator.lastName || ''}`.trim() || 'Faculty Lecturer'
                            : typeof c.coordinator === 'string'
                            ? c.coordinator
                            : 'Faculty Lecturer'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                    <Link
                      to="/student/deadlines"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Check Lab Schedule</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/student/resources"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    >
                      Lab Manuals
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: LAB DEADLINES (/student/deadlines)
          ========================================================================= */}
      {activeView === 'deadlines' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>Upcoming Laboratory Deadlines & Submission Milestones</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Monitor target submission dates for individual and group laboratory experiment reports.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {displayExercises.length} Required Lab Deliverables
            </span>
          </div>

          <div className="space-y-4">
            {displayExercises.map((ex) => {
              const userSubmission = submissions.find(
                (s) => (s?.exercise?._id || s?.exercise)?.toString() === (ex?._id || ex?.id)?.toString()
              );
              const deadlineDate = ex.deadline ? new Date(ex.deadline) : null;
              const isPast = deadlineDate && deadlineDate < new Date();

              return (
                <div
                  key={ex._id}
                  className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {ex.course?.code || 'LAB'}
                      </span>
                      <span className="text-xs font-semibold text-slate-300">
                        Week {ex.weekNumber || 1} Deliverable
                      </span>
                      <span className="text-xs text-slate-500">• Max: {ex.maxScore || 100} Points</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{ex.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{ex.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-300 block">
                        Due: {deadlineDate ? deadlineDate.toLocaleDateString() : 'Continuous'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          isPast ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {isPast ? 'Submission Closed' : 'Active Window'}
                      </span>
                    </div>

                    {userSubmission ? (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Submitted</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => openSubmitModal(ex)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center space-x-1.5 shadow-sm"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Submit Report</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: SUBMISSIONS & GRADES (/student/submissions)
          ========================================================================= */}
      {activeView === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>My Submitted Reports & Instructor Evaluations ({submissions.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Formal laboratory reports submitted for review, instructor rubric grading, feedback, and scores.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {submissions.filter((s) => s.status === 'GRADED').length} Graded
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {submissions.filter((s) => s.status === 'SUBMITTED').length} Awaiting Review
              </span>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-300">No Submissions Recorded</h4>
              <p className="text-xs text-slate-500 mt-1">
                Select an active laboratory exercise from your dashboard or schedule to upload your formal report.
              </p>
              <Link
                to="/student/deadlines"
                className="mt-4 inline-block px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white"
              >
                View Available Lab Exercises
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {sub.exercise?.course?.code || 'ASTU LAB'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            sub.status === 'GRADED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {sub.status === 'GRADED' ? 'Evaluated' : 'Submitted (Awaiting Review)'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-2">
                        {sub.exercise ? sub.exercise.title : 'Laboratory Report'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submitted on {new Date(sub.submittedAt || sub.createdAt).toLocaleString()} · Type:{' '}
                        {sub.submissionType || 'INDIVIDUAL'}
                      </p>
                    </div>

                    {sub.grade && typeof sub.grade === 'object' ? (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Awarded Mark
                        </span>
                        <span className="text-2xl font-extrabold text-emerald-400">
                          {sub.grade.score ?? '—'} <span className="text-xs text-slate-400">/ 100</span>
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-right shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          Pending Review
                        </span>
                        <span className="text-xs text-slate-400">Instructor evaluation pending</span>
                      </div>
                    )}
                  </div>

                  {sub.grade && typeof sub.grade === 'object' && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-2 text-xs">
                      <span className="font-bold text-white block">Instructor Evaluation & Feedback</span>
                      <p className="text-slate-300 leading-relaxed">
                        {sub.grade.feedback || 'Well-structured laboratory report meeting experimental standards.'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
                        {sub.grade.strengths && (
                          <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <span className="font-bold text-emerald-400 block">Demonstrated Strengths</span>
                            <span className="text-slate-300 mt-0.5 block">{sub.grade.strengths}</span>
                          </div>
                        )}

                        {sub.grade.improvements && (
                          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <span className="font-bold text-amber-400 block">Areas for Improvement</span>
                            <span className="text-slate-300 mt-0.5 block">{sub.grade.improvements}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] text-slate-300 flex items-center space-x-1">
                        <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{sub.reportFile?.fileName || sub.fileName || 'Laboratory_Report.pdf'}</span>
                      </span>
                      {(sub.reportFile?.fileUrl || sub.fileUrl) && (
                        <a
                          href={sub.reportFile?.fileUrl || sub.fileUrl}
                          download={sub.reportFile?.fileName || sub.fileName || 'Lab_Report.pdf'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download / View</span>
                        </a>
                      )}
                    </div>
                    {sub.repositoryUrl && (
                      <a
                        href={sub.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center space-x-1 text-[11px]"
                      >
                        <span>Simulation Code Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 5: LAB RESOURCES (/student/resources)
          ========================================================================= */}
      {activeView === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FolderKanban className="w-5 h-5 text-cyan-400" />
                <span>Laboratory Handbooks, Software Guides & Templates</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Official ASTU engineering laboratory documentation, LaTeX templates, safety protocols, and software simulation manuals.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {['ALL', 'Lab Manual', 'Software Guide', 'Template', 'Datasheet'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setResourceFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    resourceFilter === cat
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'All Handbooks' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayResources.map((res) => (
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
                      onClick={() => alert(`Downloading ASTU Engineering Resource: ${res.title}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center space-x-1.5 transition-colors shadow-sm"
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
          MODAL: SUBMIT LAB REPORT
          ========================================================================= */}
      {submitModalOpen && selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Laboratory Report</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedExercise.title} · Week {selectedExercise.weekNumber || 1}
                </p>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {fileUploadError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{fileUploadError}</span>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.zip,.m,.py,.txt"
                className="hidden"
              />

              {/* File Upload Zone */}
              {!useManualUrl ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Upload Laboratory Report Document *</span>
                    <button
                      type="button"
                      onClick={() => setUseManualUrl(true)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      Paste cloud link instead
                    </button>
                  </label>

                  {selectedFile ? (
                    <div className="p-4 rounded-xl bg-slate-800/80 border border-cyan-500/40 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[240px]">
                            {selectedFile.name}
                          </p>
                          <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ready to upload</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 transition-colors"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setSubmissionForm((prev) => ({
                              ...prev,
                              reportFileUrl: '',
                              fileName: `${selectedExercise?.exerciseNumber || 'Lab'}_Report.pdf`,
                              fileSize: 0
                            }));
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handleFileChange({ target: { files: e.dataTransfer.files } });
                        }
                      }}
                      className="p-6 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer text-center space-y-2 transition-all group"
                    >
                      <FileUp className="w-8 h-8 text-cyan-400 mx-auto group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          Click to select laboratory report or drag and drop
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Supported: PDF (.pdf), Word (.docx), Archive (.zip), or Code (.py/.m) up to 50MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-600 group-hover:text-white transition-all"
                      >
                        Browse Local Files
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Report File Document URL or Cloud Link *</span>
                    <button
                      type="button"
                      onClick={() => setUseManualUrl(false)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      ← Upload local file instead
                    </button>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/... or https://astu.edu.et/reports/..."
                    value={submissionForm.reportFileUrl}
                    onChange={(e) =>
                      setSubmissionForm({ ...submissionForm, reportFileUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Document File Name
                  </label>
                  <input
                    type="text"
                    value={submissionForm.fileName}
                    onChange={(e) =>
                      setSubmissionForm({ ...submissionForm, fileName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Submission Mode
                  </label>
                  <select
                    value={submissionForm.submissionType}
                    onChange={(e) =>
                      setSubmissionForm({ ...submissionForm, submissionType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="INDIVIDUAL">Individual Student</option>
                    <option value="GROUP">Laboratory Group</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Simulation / Code Repository Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/astu-student/lab-dsp"
                  value={submissionForm.repositoryUrl}
                  onChange={(e) =>
                    setSubmissionForm({ ...submissionForm, repositoryUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Notes / Experimental Discrepancies
                </label>
                <textarea
                  rows="2"
                  placeholder="Notes for instructor regarding workbench equipment or test anomalies..."
                  value={submissionForm.notes}
                  onChange={(e) =>
                    setSubmissionForm({ ...submissionForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReport ? 'Uploading...' : 'Submit Final Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;

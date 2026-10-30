import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submission Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    reportFileUrl: '',
    fileName: 'Lab_Report.pdf',
    repositoryUrl: '',
    notes: '',
    submissionType: 'INDIVIDUAL'
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

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

  const openSubmitModal = (exercise) => {
    setSelectedExercise(exercise);
    setSubmissionForm({
      reportFileUrl: '',
      fileName: `${exercise.exerciseNumber || 'Lab'}_Report.pdf`,
      repositoryUrl: '',
      notes: '',
      submissionType: exercise.submissionType === 'GROUP' ? 'GROUP' : 'INDIVIDUAL'
    });
    setSubmitSuccess('');
    setSubmitModalOpen(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExercise || !submissionForm.reportFileUrl) return;

    setSubmittingReport(true);
    setSubmitSuccess('');

    try {
      await api.post('/submissions', {
        exerciseId: selectedExercise._id,
        submissionType: submissionForm.submissionType,
        reportFile: {
          fileUrl: submissionForm.reportFileUrl.trim(),
          fileName: submissionForm.fileName.trim(),
          fileType: 'application/pdf',
          fileSizeBytes: 204800
        },
        repositoryUrl: submissionForm.repositoryUrl.trim(),
        notes: submissionForm.notes.trim()
      });

      setSubmitSuccess('Laboratory report submitted successfully to course instructor!');
      setTimeout(() => {
        setSubmitModalOpen(false);
        fetchStudentData();
      }, 1500);
    } catch (err) {
      alert(err.message || 'Submission failed. Please verify required fields.');
    } finally {
      setSubmittingReport(false);
    }
  };

  return (
    <DashboardLayout
      title="Student Laboratory Workspace"
      subtitle={`Welcome, ${user.firstName} ${user.lastName} (${user.studentId || 'ASTU Student'}) · ${
        user.department?.code || 'Engineering'
      }`}
      actions={
        <button
          onClick={fetchStudentData}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      }
    >
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Enrolled Courses
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{courses.length}</span>
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Lab Exercises
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{exercises.length}</span>
            <FlaskConical className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Filed Submissions
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{submissions.length}</span>
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Graded Lab Reports
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              {submissions.filter((s) => s.status === 'GRADED').length}
            </span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Lab Exercises */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Available Laboratory Exercises ({exercises.length})</span>
            </h2>
          </div>

          {exercises.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 rounded-xl bg-slate-800/30 border border-slate-800">
              <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No published laboratory exercises at this moment.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {exercises.map((ex) => {
                const userSubmission = submissions.find(
                  (s) => s.exercise?._id?.toString() === ex._id.toString()
                );
                return (
                  <div
                    key={ex._id}
                    className="p-6 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {ex.course?.code || 'Course'}
                        </span>
                        <span className="text-xs text-slate-400">Week {ex.weekNumber}</span>
                        <span className="text-xs text-slate-400">· Max: {ex.maxScore} Pts</span>
                      </div>

                      <span className="text-xs font-medium text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Deadline: {new Date(ex.deadline).toLocaleDateString()}</span>
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
                      {ex.manualUrl ? (
                        <a
                          href={ex.manualUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Download Laboratory Manual</span>
                        </a>
                      ) : (
                        <span></span>
                      )}

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
                              ? `Score: ${userSubmission.grade?.score ?? 'Graded'}/${ex.maxScore}`
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
                      <p className="text-slate-300 italic">"{sub.grade.feedback}"</p>
                    )}

                    {sub.grade?.improvements && (
                      <div className="p-2 rounded bg-slate-800/80 text-[11px] text-amber-300">
                        <strong>Improve:</strong> {sub.grade.improvements}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Lab Report Submission Modal */}
      {submitModalOpen && selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">File Laboratory Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedExercise.title} · Due{' '}
                  {new Date(selectedExercise.deadline).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Report Document URL (PDF / Cloud Drive) *
                </label>
                <input
                  type="url"
                  required
                  value={submissionForm.reportFileUrl}
                  onChange={(e) =>
                    setSubmissionForm({ ...submissionForm, reportFileUrl: e.target.value })
                  }
                  placeholder="https://drive.google.com/... or https://storage.astu.edu.et/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Source Code / Simulation Repository (Optional)
                </label>
                <input
                  type="url"
                  value={submissionForm.repositoryUrl}
                  onChange={(e) =>
                    setSubmissionForm({ ...submissionForm, repositoryUrl: e.target.value })
                  }
                  placeholder="https://github.com/astu-student/dsp-lab1"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Submission Notes for Instructor
                </label>
                <textarea
                  rows="2"
                  value={submissionForm.notes}
                  onChange={(e) =>
                    setSubmissionForm({ ...submissionForm, notes: e.target.value })
                  }
                  placeholder="Summary of experimental findings, hardware issues faced, or test observations..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReport ? 'Filing Report...' : 'Confirm Submission'}</span>
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

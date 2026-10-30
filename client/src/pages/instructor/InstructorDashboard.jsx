import React, { useState, useEffect } from 'react';
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
  Send
} from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
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

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const [coursesRes, exercisesRes, submissionsRes] = await Promise.all([
        api.get('/academic/courses?mine=true'),
        api.get('/exercises'),
        api.get('/submissions')
      ]);

      if (coursesRes?.data?.courses) setCourses(coursesRes.data.courses);
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

  const pendingCount = submissions.filter((s) => s.status === 'SUBMITTED').length;
  const gradedCount = submissions.filter((s) => s.status === 'GRADED').length;

  return (
    <DashboardLayout
      title="Instructor Teaching Studio"
      subtitle={`Welcome, ${user.firstName} ${user.lastName} · Course Laboratory Evaluations`}
      actions={
        <button
          onClick={fetchInstructorData}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      }
    >
      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Teaching Courses
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{courses.length}</span>
            <BookOpen className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Published Exercises
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{exercises.length}</span>
            <FlaskConical className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Awaiting Review
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Graded Submissions
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{gradedCount}</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Student Lab Submission Queue ({submissions.length})</span>
            </h2>
          </div>

          {submissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 rounded-xl bg-slate-800/30 border border-slate-800">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>No student laboratory submissions recorded yet.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const isPending = sub.status === 'SUBMITTED';
                return (
                  <div
                    key={sub._id}
                    className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {sub.course?.code || 'Course'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            isPending
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {sub.status}
                        </span>
                        {sub.isLate && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                            Late Submission
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">
                        {sub.exercise?.title || 'Lab Exercise Report'}
                      </h3>

                      <p className="text-xs text-slate-400 flex items-center space-x-2">
                        <span>
                          By {sub.submittedBy?.firstName} {sub.submittedBy?.lastName} (
                          {sub.submittedBy?.studentId})
                        </span>
                        <span>·</span>
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {sub.reportFile?.fileUrl && (
                        <a
                          href={sub.reportFile.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/80 hover:bg-slate-700 text-slate-200 border border-slate-600 flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </a>
                      )}

                      <button
                        onClick={() => openGradingModal(sub)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isPending
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-sm shadow-cyan-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isPending ? 'Grade Report' : 'Edit Evaluation'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Exercises Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Lab Exercises</span>
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
            {exercises.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <FlaskConical className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span>No lab exercises registered.</span>
              </div>
            ) : (
              exercises.map((ex) => (
                <div
                  key={ex._id}
                  className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{ex.title}</span>
                    <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      Week {ex.weekNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{ex.description}</p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Max: {ex.maxScore} Pts</span>
                    <span>Due: {new Date(ex.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Interactive Grading Modal */}
      {gradingModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Evaluate Lab Submission</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedSubmission.exercise?.title} ·{' '}
                  <strong className="text-cyan-400">
                    {selectedSubmission.submittedBy?.firstName}{' '}
                    {selectedSubmission.submittedBy?.lastName}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setGradingModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {gradingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{gradingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Awarded Score (0 to {selectedSubmission.exercise?.maxScore || 100}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={selectedSubmission.exercise?.maxScore || 100}
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  placeholder="e.g. 88"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Overall Qualitative Feedback
                </label>
                <textarea
                  rows="3"
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Comprehensive feedback on experimental measurements, data analysis, and technical report clarity..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Demonstrated Strengths
                  </label>
                  <input
                    type="text"
                    value={gradeForm.strengths}
                    onChange={(e) => setGradeForm({ ...gradeForm, strengths: e.target.value })}
                    placeholder="e.g. Precise oscilloscope measurement"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                    Areas for Improvement
                  </label>
                  <input
                    type="text"
                    value={gradeForm.improvements}
                    onChange={(e) => setGradeForm({ ...gradeForm, improvements: e.target.value })}
                    placeholder="e.g. Expand error margin calculations"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradingSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{gradingSubmitting ? 'Submitting...' : 'Publish Evaluation'}</span>
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

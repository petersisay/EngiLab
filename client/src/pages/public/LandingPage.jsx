import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../services/api';
import {
  Cpu,
  Zap,
  FlaskConical,
  Award,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  GraduationCap,
  Users,
  Compass
} from 'lucide-react';

const LandingPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        if (response?.data?.departments) {
          setDepartments(response.data.departments);
        }
      } catch (err) {
        console.warn('Unable to load dynamic departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Animated Background Circuit Image with Light Green & Cyan Energy Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
          {/* Animated Floating Base Image with higher clarity and luminescence */}
          <img
            src="/engilab-hero-bg.png"
            alt="Engineering Lab Circuit Background"
            className="w-full h-full object-cover object-center opacity-45 mix-blend-screen animate-circuit-float filter brightness-125 contrast-110"
          />

          {/* Light-Green Engineering Workbench Dot Matrix Overlay */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'radial-gradient(rgba(52, 211, 153, 0.35) 1px, transparent 1px)',
              backgroundSize: '36px 36px'
            }}
          ></div>

          {/* Animated Light Green & Emerald Energy Auroras */}
          <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/25 to-teal-400/20 rounded-full blur-[100px] animate-aurora-green"></div>
          <div
            className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-green-400/20 to-emerald-600/15 rounded-full blur-[110px] animate-aurora-green"
            style={{ animationDelay: '4s' }}
          ></div>
          <div className="absolute bottom-10 left-1/3 w-[550px] h-[350px] bg-cyan-400/15 rounded-full blur-[100px] animate-aurora-cyan"></div>

          {/* Luminous Sweep Beam (Light pulse traveling across circuits) */}
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none overflow-hidden">
            <div className="w-48 h-full bg-gradient-to-r from-transparent via-emerald-400/15 to-transparent animate-sweep-beam"></div>
          </div>

          {/* Animated Laboratory Vector Circuit Traces & Oscilloscope Signal Waves */}
          <svg
            className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 800"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="greenSignalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="cyanSignalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#6ee7b7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Circuit Busbar Path 1 - Electrical Power & Signal Transmission */}
            <path
              d="M-50,220 L300,220 L420,340 L850,340 L950,240 L1500,240"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeOpacity="0.25"
            />
            <path
              d="M-50,220 L300,220 L420,340 L850,340 L950,240 L1500,240"
              fill="none"
              stroke="url(#greenSignalGrad)"
              strokeWidth="2.5"
              className="animate-signal-pulse"
            />

            {/* Circuit Busbar Path 2 - Control & Telecommunications */}
            <path
              d="M-50,560 L240,560 L380,420 L1020,420 L1150,550 L1500,550"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeOpacity="0.2"
            />
            <path
              d="M-50,560 L240,560 L380,420 L1020,420 L1150,550 L1500,550"
              fill="none"
              stroke="url(#cyanSignalGrad)"
              strokeWidth="2.5"
              className="animate-signal-pulse"
              style={{ animationDelay: '3s' }}
            />

            {/* Glowing Circuit Nodes */}
            <circle cx="300" cy="220" r="4.5" fill="#34d399" className="animate-node-pulse" />
            <circle
              cx="420"
              cy="340"
              r="3.5"
              fill="#6ee7b7"
              className="animate-node-pulse"
              style={{ animationDelay: '1.2s' }}
            />
            <circle
              cx="850"
              cy="340"
              r="4"
              fill="#34d399"
              className="animate-node-pulse"
              style={{ animationDelay: '2s' }}
            />
            <circle
              cx="950"
              cy="240"
              r="3.5"
              fill="#10b981"
              className="animate-node-pulse"
              style={{ animationDelay: '0.6s' }}
            />
            <circle
              cx="240"
              cy="560"
              r="4"
              fill="#6ee7b7"
              className="animate-node-pulse"
              style={{ animationDelay: '1.8s' }}
            />
            <circle
              cx="1020"
              cy="420"
              r="4.5"
              fill="#34d399"
              className="animate-node-pulse"
              style={{ animationDelay: '2.5s' }}
            />
          </svg>

          {/* Smooth Oscilloscope Wave at bottom representing DSP / AC Power Signal */}
          <div className="absolute -bottom-6 left-0 w-[200%] h-24 overflow-hidden opacity-35">
            <svg
              className="w-full h-full animate-wave-flow"
              viewBox="0 0 2880 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0,50 Q120,5 240,50 T480,50 T720,50 T960,50 T1200,50 T1440,50 T1680,50 T1920,50 T2160,50 T2400,50 T2640,50 T2880,50"
                stroke="url(#greenSignalGrad)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <path
                d="M0,50 Q120,95 240,50 T480,50 T720,50 T960,50 T1200,50 T1440,50 T1680,50 T1920,50 T2160,50 T2400,50 T2640,50 T2880,50"
                stroke="#34d399"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Vignette Gradient so text stays razor sharp */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/80 to-slate-950"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8 drop-shadow-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Adama Science and Technology University (ASTU)</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Engineering Laboratory{' '}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Learning & Management
            </span>{' '}
            Platform
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Centralized digital laboratory infrastructure for ASTU engineering students and
            faculty. Manage hands-on laboratory exercises, submit experimental reports, and track
            criterion-based grading across Electronics and Electrical Power disciplines.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>Get Started as Student</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Faculty & Student Sign In</span>
            </Link>
          </div>

          {/* Metric Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">2</span>
              <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mt-1">
                Engineering Depts
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">ECE and EPCE ASTU</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">4</span>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mt-1">
                Dedicated Dashboards
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Super, Dept, Inst, Student</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">100%</span>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1">
                Real Database State
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">No mock or fake stats</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">Cloud</span>
              <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mt-1">
                Persisted Submissions
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Individual & Group Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Departments Section */}
      <section id="departments" className="py-20 bg-slate-900/70 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              ASTU Academic Units
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Integrated Engineering Departments
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              Dedicated academic laboratory workspaces configured for the specific curricula and
              experimental instrumentation of our primary engineering disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ECE Department Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-xl group">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-105 transition-transform">
                <Cpu className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Department Code: ECE
              </span>
              <h3 className="mt-1 text-2xl font-bold text-white">
                Electronics and Communication Engineering
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Focusing on microelectronics, embedded systems, telecommunications, digital signal
                processing, and IoT architectures with rigorous experimental verification.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Core Laboratory Facilities:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    DSP & Audio Processing
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    Embedded Systems & Microcontrollers
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    Telecommunications & Antenna Systems
                  </span>
                </div>
              </div>
            </div>

            {/* EPCE Department Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-blue-500/40 transition-all shadow-xl group">
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-105 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Department Code: EPCE
              </span>
              <h3 className="mt-1 text-2xl font-bold text-white">
                Electrical Power and Control Engineering
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Specialized experimental investigations in electrical machines, renewable energy
                systems, power electronics conversion, industrial automation, and modern control.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Core Laboratory Facilities:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    Electrical Machines & Drives
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    Power Systems & High Voltage
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    PLC & Industrial Automation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section id="features" className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Modern Academic Workflow
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Complete Laboratory Lifecycle
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              From lab manual publication to rubric evaluation, EngiLab connects students and
              instructors with precision and institutional transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Digital Lab Manuals & Safety</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Clear laboratory procedures, required test equipment, safety directives, and
                downloadable simulation templates directly accessible per exercise.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Individual & Group Submissions</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Support for both individual and collaborative laboratory teams. Form groups, assign
                members, upload reports, and track team-wide submissions.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Criterion-Based Rubric Grading</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Instructors evaluate experiments against transparent rubrics with qualitative
                feedback, identified strengths, and actionable improvement pointers.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Four Role Dashboards</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Tailored interfaces for Super Admins, Department Chairs, Instructors, and Students
                providing exact jurisdiction and role-relevant controls.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Course Repository & Datasheets</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Component datasheets, MATLAB/Simulink scripts, KiCAD templates, and reference
                textbooks organized centrally per course offering.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Audit Tracking & Governance</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Every administrative action, grade entry, and submission is recorded in the
                institutional audit ledger for university compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Workflow Section */}
      <section id="workflow" className="py-20 bg-slate-900/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              End-to-End Execution
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              The Verified EngiLab Academic Pipeline
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-400">
              A structured 5-step workflow ensuring experimental integrity from curriculum setup to
              student mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative">
              <div className="text-2xl font-black text-cyan-400 mb-2">01</div>
              <h4 className="text-sm font-bold text-white">Course Setup</h4>
              <p className="mt-1 text-xs text-slate-400">
                Department Admins configure semester courses and assign course instructors.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative">
              <div className="text-2xl font-black text-blue-400 mb-2">02</div>
              <h4 className="text-sm font-bold text-white">Publish Exercise</h4>
              <p className="mt-1 text-xs text-slate-400">
                Instructor drafts objectives, safety rules, manual, and rubric criteria.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative">
              <div className="text-2xl font-black text-indigo-400 mb-2">03</div>
              <h4 className="text-sm font-bold text-white">Lab Submission</h4>
              <p className="mt-1 text-xs text-slate-400">
                Student or group conducts test and uploads report file before deadline.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative">
              <div className="text-2xl font-black text-purple-400 mb-2">04</div>
              <h4 className="text-sm font-bold text-white">Rubric Evaluation</h4>
              <p className="mt-1 text-xs text-slate-400">
                Instructor grades against criteria and writes constructive feedback.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 relative">
              <div className="text-2xl font-black text-emerald-400 mb-2">05</div>
              <h4 className="text-sm font-bold text-white">Progress Tracking</h4>
              <p className="mt-1 text-xs text-slate-400">
                Student inspects score, reviews improvement pointers, and tracks GPA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* University CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-slate-900 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GraduationCap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Begin Your Laboratory Session?
          </h2>
          <p className="mt-3 text-sm text-slate-300 max-w-2xl mx-auto">
            Log in with your ASTU university credentials or create your student profile to access
            all active ECE and EPCE laboratory courses.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md transition-all"
            >
              Sign In to Dashboard
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              Register as New Student
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

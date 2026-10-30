import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Cpu, Zap, Mail, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & University Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/engilab-logo.png"
                alt="EngiLab Logo"
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              />
              <span className="text-xl font-bold tracking-tight text-white">
                Engi<span className="text-cyan-400">Lab</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineering Laboratory Learning & Management Platform for Adama Science and
              Technology University (ASTU). Advancing experimental learning, report submissions,
              and academic tracking across applied engineering disciplines.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kebele 14, Adama, Oromia, Ethiopia</span>
            </div>
          </div>

          {/* Column 2: Supported Academic Departments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Academic Departments
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/#departments"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Electronics & Communication (ECE)</span>
                </a>
              </li>
              <li>
                <a
                  href="/#departments"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Electrical Power & Control (EPCE)</span>
                </a>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">
                  Mechanical Engineering (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed">
                  Civil Engineering (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#features" className="hover:text-cyan-400 transition-colors">
                  Digital Lab Manuals & Resources
                </a>
              </li>
              <li>
                <a href="/#workflow" className="hover:text-cyan-400 transition-colors">
                  Individual & Team Report Filing
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-cyan-400 transition-colors">
                  Criterion-Based Rubric Grading
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-cyan-400 transition-colors">
                  Department Progress Analytics
                </a>
              </li>
              <li>
                <a href="/#features" className="hover:text-cyan-400 transition-colors">
                  Institutional Security & Audit Logs
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional Links & Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-cyan-400 transition-colors">
                  Faculty & Staff Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-cyan-400 transition-colors">
                  ASTU Student Registration
                </Link>
              </li>
              <li>
                <a
                  href="https://www.astu.edu.et"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>ASTU Official Website</span>
                </a>
              </li>
              <li>
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] leading-tight text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
                  Institutional access protected by encrypted JWT sessions and role-based policies.
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EngiLab. Adama Science and Technology University. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span>ASTU Academic Platform</span>
            <span>ECE & EPCE Engineering Hub</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

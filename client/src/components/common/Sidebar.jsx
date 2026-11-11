import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  ShieldAlert,
  BookOpen,
  FileText,
  Award,
  FolderArchive,
  Clock,
  FlaskConical,
  GraduationCap
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user?.role || 'STUDENT';

  const getNavSections = () => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return [
          {
            title: 'Institutional Control',
            links: [
              { name: 'Overview', to: '/admin', icon: LayoutDashboard },
              { name: 'Academic Departments', to: '/admin/departments', icon: Building2 },
              { name: 'User Management', to: '/admin/users', icon: Users },
              { name: 'Academic Calendar', to: '/admin/academic', icon: Calendar },
              { name: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert }
            ]
          }
        ];

      case 'DEPARTMENT_ADMIN':
        return [
          {
            title: 'Department Operations',
            links: [
              { name: 'Overview', to: '/department', icon: LayoutDashboard },
              { name: 'Department Courses', to: '/department/courses', icon: BookOpen },
              { name: 'Faculty & Instructors', to: '/department/faculty', icon: Users },
              { name: 'Enrolled Students', to: '/department/students', icon: GraduationCap },
              { name: 'Lab Facilities', to: '/department/labs', icon: FlaskConical }
            ]
          }
        ];

      case 'INSTRUCTOR':
        return [
          {
            title: 'Instruction & Labs',
            links: [
              { name: 'Instructor Dashboard', to: '/instructor', icon: LayoutDashboard },
              { name: 'My Lab Courses', to: '/instructor/courses', icon: BookOpen },
              { name: 'Exercise Designer', to: '/instructor/exercises', icon: FlaskConical },
              { name: 'Grading Studio', to: '/instructor/grading', icon: Award },
              { name: 'Course Resources', to: '/instructor/resources', icon: FolderArchive }
            ]
          }
        ];

      case 'STUDENT':
      default:
        return [
          {
            title: 'Student Portal',
            links: [
              { name: 'My Dashboard', to: '/student', icon: LayoutDashboard },
              { name: 'Enrolled Courses', to: '/student/courses', icon: BookOpen },
              { name: 'Lab Deadlines', to: '/student/deadlines', icon: Clock },
              { name: 'Reports & Grades', to: '/student/submissions', icon: Award },
              { name: 'Lab Manuals & Tools', to: '/student/resources', icon: FolderArchive }
            ]
          }
        ];
    }
  };

  const sections = getNavSections();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        {/* User Card */}
        <div className="px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold border border-cyan-400/30">
              {(user.name?.[0] || user.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'EngiLab User'}
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">
                {(role || '').replace(/_/g, ' ')}
              </span>
            </div>
          </div>
          {user.department && (
            <p className="mt-2 text-[11px] text-slate-400 truncate">
              {user.department.name || user.department.code || 'Assigned Department'}
            </p>
          )}
        </div>

        {/* Navigation Section */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/admin' || link.to === '/department' || link.to === '/instructor' || link.to === '/student'}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* University badge footer */}
      <div className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[10px] text-slate-500 flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span>ASTU EngiLab Academic Node</span>
      </div>
    </aside>
  );
};

export default Sidebar;

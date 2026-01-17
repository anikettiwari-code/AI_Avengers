import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  BookOpen, Activity, BarChart3, Shield, GraduationCap,
  FileText, Award, ScanFace
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const links = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
      { icon: Users, label: 'User Management', path: '/admin/users' },
      { icon: Calendar, label: 'Timetable', path: '/admin/timetable' },
      { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'Overview', path: '/teacher' },
      { icon: Activity, label: 'Live Session', path: '/teacher/session' },
      { icon: ScanFace, label: 'Class Scanner', path: '/teacher/scan-class' }, // Added Link
      { icon: BookOpen, label: 'Course Mgmt', path: '/teacher/courses' },
      { icon: FileText, label: 'Grading', path: '/teacher/grading' },
    ],
    student: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/student' },
      { icon: Activity, label: 'Scan Attendance', path: '/student/scan' },
      { icon: BookOpen, label: 'My Courses', path: '/student/courses' },
      { icon: Award, label: 'Results', path: '/student/results' },
    ]
  };

  const currentLinks = links[user.role as keyof typeof links] || [];

  return (
    <div className="w-64 h-screen bg-white/80 backdrop-blur-xl border-r border-white/60 flex flex-col fixed left-0 top-0 z-50 shadow-2xl shadow-slate-200/50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Attendify</h1>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Professional</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
        {currentLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin' || link.path === '/teacher' || link.path === '/student'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary-50 text-primary-600 font-semibold shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <link.icon className={cn("w-5 h-5 transition-colors", ({ isActive }: any) => isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600")} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-primary-500/30">
          <p className="text-xs font-medium opacity-80 mb-1">Pro Plan</p>
          <p className="text-sm font-bold">Attendify Enterprise</p>
          <button className="mt-3 w-full py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors backdrop-blur-sm">
            View License
          </button>
        </div>
      </div>
    </div>
  );
};

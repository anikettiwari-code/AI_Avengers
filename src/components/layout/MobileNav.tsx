import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  BookOpen, Activity, BarChart3, Shield, Award,
  FileText, Scan
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const MobileNav = () => {
  const { user } = useAuth();

  if (!user) return null;

  const links = {
    admin: [
      { icon: LayoutDashboard, label: 'Home', path: '/admin' },
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: Calendar, label: 'Time', path: '/admin/timetable' },
      { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
    teacher: [
      { icon: LayoutDashboard, label: 'Home', path: '/teacher' },
      { icon: Activity, label: 'Session', path: '/teacher/session' },
      { icon: BookOpen, label: 'Courses', path: '/teacher/courses' },
      { icon: FileText, label: 'Grades', path: '/teacher/grading' },
    ],
    student: [
      { icon: LayoutDashboard, label: 'Home', path: '/student' },
      { icon: Scan, label: 'Scan', path: '/student/scan' },
      { icon: BookOpen, label: 'Courses', path: '/student/courses' },
      { icon: Award, label: 'Results', path: '/student/results' },
    ]
  };

  const currentLinks = links[user.role as keyof typeof links] || [];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center p-2">
        {currentLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin' || link.path === '/teacher' || link.path === '/student'}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[64px]",
              isActive 
                ? "text-primary-600" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <div className={({ isActive }: any) => cn(
                "p-1 rounded-lg transition-all",
                isActive ? "bg-primary-50" : "bg-transparent"
            )}>
                <link.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Simple breadcrumb logic
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathSegments.length > 0 
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      {/* Fixed Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px]"></div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-64 relative z-10 flex flex-col min-h-screen pb-20 md:pb-0">
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-white/60 sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <h2 className="text-lg md:text-xl font-semibold text-slate-800">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 rounded-full bg-white/60 border border-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 w-64 transition-all"
              />
            </div>

            <button className="relative p-2 rounded-full hover:bg-white/50 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

            <div className="flex items-center gap-3 cursor-pointer group relative">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
                {user?.name.charAt(0)}
              </div>
              
              {/* Dropdown */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/50 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Users, GraduationCap, School, TrendingUp, Plus, Save, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export const AdminDashboard = () => {
  const [showQuickAdd, setShowQuickAdd] = useState<'user' | 'course' | null>(null);

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget title="Total Students" value="2,543" change="+12%" icon={GraduationCap} color="blue" />
        <StatWidget title="Active Faculty" value="145" change="+3%" icon={Users} color="purple" />
        <StatWidget title="Departments" value="12" change="0%" icon={School} color="emerald" />
        <StatWidget title="Avg Attendance" value="94%" change="+5%" icon={TrendingUp} color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Attendance Trends</h3>
              <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1 outline-none">
                <option>This Semester</option>
                <option>Last Semester</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[65, 78, 82, 75, 88, 92, 95, 85, 80, 88, 92, 96].map((h, i) => (
                <div key={i} className="w-full bg-primary-100 rounded-t-lg relative group hover:bg-primary-200 transition-colors" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-400 uppercase font-medium">
              <span>Jan</span><span>Dec</span>
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions & Logs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions Widget */}
          <GlassCard className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowQuickAdd('user')}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/10"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Add User</span>
              </button>
              <button 
                onClick={() => setShowQuickAdd('course')}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center gap-2 transition-colors border border-white/10"
              >
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <School className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Add Course</span>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">System Logs</h3>
            <div className="space-y-6">
              {[1,2,3].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">System Backup Completed</p>
                    <p className="text-xs text-slate-400">2 hours ago • Automated</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal 
          type={showQuickAdd} 
          onClose={() => setShowQuickAdd(null)} 
        />
      )}
    </div>
  );
};

const StatWidget = ({ title, value, change, icon: Icon, color }: any) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <GlassCard hoverEffect>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-2">{value}</h4>
        </div>
        <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{change}</span>
        <span className="text-xs text-slate-400">vs last month</span>
      </div>
    </GlassCard>
  );
};

// Compact Quick Add Modal
const QuickAddModal = ({ type, onClose }: { type: 'user' | 'course', onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === 'user') {
        // Create User Logic (Simplified for Admin Quick Add)
        // Note: Real auth user creation usually requires Supabase Admin API or Client Signup
        // Here we insert into profiles directly for demo purposes or trigger a signup function
        const { error } = await supabase.from('profiles').insert({
           id: crypto.randomUUID(), // In real app, this comes from auth.users
           email: formData.email,
           name: formData.name,
           role: formData.role,
           roll_no: formData.roll_no
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert({
          code: formData.code,
          name: formData.name,
          schedule: formData.schedule,
          credits: parseInt(formData.credits || '3')
        });
        if (error) throw error;
      }
      onClose();
      alert(`${type === 'user' ? 'User' : 'Course'} added successfully!`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-sm bg-white p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 capitalize">Quick Add {type}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          {type === 'user' ? (
            <>
              <input name="name" placeholder="Full Name" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange} />
              <input name="email" type="email" placeholder="Email Address" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange} />
              <input name="roll_no" placeholder="ID / Roll No" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" onChange={handleChange} />
              <select name="role" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange}>
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </>
          ) : (
            <>
              <input name="code" placeholder="Course Code (e.g. CS-101)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange} />
              <input name="name" placeholder="Course Name" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange} />
              <input name="schedule" placeholder="Schedule (e.g. Mon 10am)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange} />
              <input name="credits" type="number" placeholder="Credits" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100" required onChange={handleChange} />
            </>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Record</>}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

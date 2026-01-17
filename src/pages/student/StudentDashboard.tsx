import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Scan, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Header */}
      <GlassCard className="bg-gradient-to-r from-primary-600 to-purple-600 text-white border-none">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xl font-bold backdrop-blur-sm">
            NS
          </div>
          <div>
            <h1 className="text-2xl font-bold">Narendra Suthar</h1>
            <p className="text-white/80 text-sm">Computer Science • Roll #45</p>
          </div>
        </div>
        <div className="mt-6 flex gap-8 border-t border-white/20 pt-4">
          <div>
            <p className="text-2xl font-bold">85%</p>
            <p className="text-xs text-white/70 uppercase">Avg Attendance</p>
          </div>
          <div>
            <p className="text-2xl font-bold">4</p>
            <p className="text-xs text-white/70 uppercase">Classes Today</p>
          </div>
        </div>
      </GlassCard>

      {/* Action Card */}
      <GlassCard className="border-l-4 border-l-emerald-500">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800">Class in Session</h3>
            <p className="text-sm text-slate-500">CS-301 • Room 304</p>
          </div>
          <Button onClick={() => navigate('/student/scan')} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30">
            <Scan className="w-4 h-4 mr-2" /> Mark Attendance
          </Button>
        </div>
      </GlassCard>

      {/* Today's Schedule */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Today's Timeline</h3>
        <div className="space-y-4">
          <TimelineItem 
            time="09:00 AM" 
            subject="Database Management" 
            status="Present" 
            room="Lab 1"
          />
          <TimelineItem 
            time="10:00 AM" 
            subject="Advanced AI" 
            status="Pending" 
            room="Room 304"
            active
          />
          <TimelineItem 
            time="12:00 PM" 
            subject="Software Engineering" 
            status="Upcoming" 
            room="Room 202"
          />
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ time, subject, status, room, active }: any) => (
  <GlassCard className={`p-4 flex items-center gap-4 ${active ? 'border-primary-200 bg-primary-50/50' : ''}`}>
    <div className="w-16 text-center">
      <p className="text-xs font-bold text-slate-500">{time}</p>
    </div>
    <div className="w-px h-10 bg-slate-200"></div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-800">{subject}</h4>
      <p className="text-xs text-slate-500">{room}</p>
    </div>
    <div>
      {status === 'Present' && <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Present</Badge>}
      {status === 'Pending' && <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" /> Active</Badge>}
      {status === 'Upcoming' && <Badge variant="neutral">Upcoming</Badge>}
    </div>
  </GlassCard>
);

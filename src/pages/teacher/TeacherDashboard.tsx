import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Clock, Calendar, ArrowRight, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../context/SessionContext';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { startSession } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
        const { data } = await supabase.from('courses').select('*').limit(3);
        if (data) setCourses(data);
        setLoading(false);
    };
    fetchMyCourses();
  }, []);

  const handleStartClass = async (courseId: string) => {
      await startSession(courseId);
      navigate('/teacher/session');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Good Morning, Professor</h1>
          <p className="text-slate-500 mt-1">Manage your classes and attendance.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary-600">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">{new Date().toDateString()}</p>
        </div>
      </div>

      {/* Active Session Card (Static for now, could be dynamic) */}
      <GlassCard className="border-l-4 border-l-primary-500">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="success">Ready to Start</Badge>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Start New Session</h2>
              <p className="text-slate-500">Select a course below to begin attendance.</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Upcoming Classes (Dynamic) */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Courses</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
              <Loader2 className="animate-spin text-primary-500" />
          ) : courses.length === 0 ? (
              <p className="text-slate-500">No courses found. Go to Course Mgmt to add one.</p>
          ) : (
              courses.map((course) => (
                <GlassCard key={course.id} hoverEffect>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-slate-600" />
                    </div>
                    <Badge>{course.schedule || 'TBA'}</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-slate-800">{course.code}: {course.name}</h4>
                  <p className="text-sm text-slate-500 mb-4">{course.credits} Credits</p>
                  
                  <Button className="w-full" onClick={() => handleStartClass(course.id)}>
                    Launch Class
                  </Button>
                </GlassCard>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

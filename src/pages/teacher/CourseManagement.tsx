import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileText, Video, Link as LinkIcon, Upload, MoreVertical, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Course {
    id: string;
    code: string;
    name: string;
    schedule: string;
    credits: number;
}

export const CourseManagement = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Course Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      const { error } = await supabase
        .from('courses')
        .insert({
            code: newCode,
            name: newName,
            schedule: newSchedule,
            teacher_id: user.id
        });
      
      if (!error) {
          setShowAddModal(false);
          setNewCode('');
          setNewName('');
          fetchCourses();
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
          <p className="text-slate-500 text-sm">Manage your curriculum and materials.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Course
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Course List */}
        <div className="space-y-4">
          {loading ? (
              <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-primary-500" /></div>
          ) : courses.length === 0 ? (
              <GlassCard className="text-center py-8 text-slate-500">No courses found. Add one!</GlassCard>
          ) : (
              courses.map(course => (
                <GlassCard key={course.id} hoverEffect className="cursor-pointer border-l-4 border-l-primary-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800">{course.code}</h3>
                      <p className="text-sm font-medium text-slate-600">{course.name}</p>
                    </div>
                    <Badge>{course.credits} Credits</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{course.schedule}</p>
                </GlassCard>
              ))
          )}
        </div>

        {/* Material Upload Area (Placeholder for now) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Course Materials</h3>
              <Button size="sm" variant="outline">
                <Upload className="w-4 h-4 mr-2" /> Upload File
              </Button>
            </div>
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                Select a course to view materials
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Simple Add Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <GlassCard className="w-full max-w-md bg-white">
                  <h2 className="text-xl font-bold mb-4">Add New Course</h2>
                  <form onSubmit={handleCreateCourse} className="space-y-4">
                      <input 
                        placeholder="Course Code (e.g. CS-101)" 
                        className="w-full p-2 border rounded"
                        value={newCode}
                        onChange={e => setNewCode(e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Course Name" 
                        className="w-full p-2 border rounded"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        required
                      />
                      <input 
                        placeholder="Schedule (e.g. Mon 10am)" 
                        className="w-full p-2 border rounded"
                        value={newSchedule}
                        onChange={e => setNewSchedule(e.target.value)}
                        required
                      />
                      <div className="flex justify-end gap-2 pt-4">
                          <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                          <Button type="submit">Create Course</Button>
                      </div>
                  </form>
              </GlassCard>
          </div>
      )}
    </div>
  );
};

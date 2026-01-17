import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { COURSES, PROGRESS } from '../../data/mockData';
import { BookOpen, Clock, BarChart } from 'lucide-react';

export const EnrolledCourses = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Learning Journey</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map(course => {
          const progress = PROGRESS.find(p => p.courseId === course.id) || { attendancePercentage: 0, overallGrade: 0 };
          
          return (
            <GlassCard key={course.id} hoverEffect className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <Badge>{course.credits} Credits</Badge>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1">{course.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{course.code} • {course.schedule}</p>
              
              <div className="mt-auto space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Attendance</span>
                    <span>{progress.attendancePercentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${progress.attendancePercentage < 75 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${progress.attendancePercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs">
                    <Clock className="w-3 h-3 mr-1" /> History
                  </Button>
                  <Button className="flex-1 text-xs">
                    <BarChart className="w-3 h-3 mr-1" /> Analytics
                  </Button>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

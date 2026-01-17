import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { COURSES, GRADES } from '../../data/mockData';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';

export const Results = () => {
  // Mock GPA Calculation
  const gpa = 3.8;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Cumulative GPA</p>
              <h2 className="text-4xl font-bold">{gpa}</h2>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Credits Earned</p>
              <h2 className="text-3xl font-bold text-slate-800">12<span className="text-lg text-slate-400 font-normal">/15</span></h2>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Pending Grades</p>
              <h2 className="text-3xl font-bold text-slate-800">2</h2>
            </div>
          </div>
        </GlassCard>
      </div>

      <h2 className="text-xl font-bold text-slate-800">Detailed Performance</h2>
      
      <div className="grid gap-6">
        {COURSES.map(course => {
          const courseGrades = GRADES.filter(g => g.courseId === course.id);
          if (courseGrades.length === 0) return null;

          return (
            <GlassCard key={course.id} className="p-0 overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">{course.name}</h3>
                  <p className="text-xs text-slate-500">{course.code}</p>
                </div>
                <Badge variant="info">In Progress</Badge>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 uppercase">
                      <th className="pb-2">Assessment</th>
                      <th className="pb-2">Weight</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2 text-right">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courseGrades.map(grade => (
                      <tr key={grade.id}>
                        <td className="py-3 font-medium text-slate-700">{grade.assessmentName}</td>
                        <td className="py-3 text-slate-500">{grade.weight}%</td>
                        <td className="py-3 font-bold text-slate-800">{grade.score}/{grade.maxScore}</td>
                        <td className="py-3 text-right">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            grade.score / grade.maxScore >= 0.9 ? 'bg-emerald-100 text-emerald-700' : 
                            grade.score / grade.maxScore >= 0.7 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {grade.score / grade.maxScore >= 0.9 ? 'Excellent' : grade.score / grade.maxScore >= 0.7 ? 'Good' : 'Poor'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

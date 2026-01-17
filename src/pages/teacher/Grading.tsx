import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { COURSES, MOCK_STUDENTS } from '../../data/mockData';
import { Save, Download, Search } from 'lucide-react';

export const Grading = () => {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Grading</h1>
          <p className="text-slate-500 text-sm">Input and publish assessment scores.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" /> Publish Grades
          </Button>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-white/30 items-center">
          <select 
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary-100"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {COURSES.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
          </select>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-primary-100 outline-none" 
              placeholder="Search student..." 
            />
          </div>
        </div>

        {/* Grading Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Midterm (30%)</th>
                <th className="px-6 py-4 font-medium">Project (20%)</th>
                <th className="px-6 py-4 font-medium">Final (50%)</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_STUDENTS.map((student, i) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{student.name}</div>
                    <div className="text-xs text-slate-500">{student.rollNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <input className="w-16 p-1 text-center border border-slate-200 rounded bg-white focus:ring-2 focus:ring-primary-100 outline-none" defaultValue={85 + i} />
                  </td>
                  <td className="px-6 py-4">
                    <input className="w-16 p-1 text-center border border-slate-200 rounded bg-white focus:ring-2 focus:ring-primary-100 outline-none" defaultValue={90 - i} />
                  </td>
                  <td className="px-6 py-4">
                    <input className="w-16 p-1 text-center border border-slate-200 rounded bg-white focus:ring-2 focus:ring-primary-100 outline-none" placeholder="-" />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {Math.floor((85 + i) * 0.3 + (90 - i) * 0.2)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="warning">Draft</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

import { User, Course, Material, Grade, StudentProgress } from '../types/models';

export const USERS = {
  ADMIN: { id: 'A-001', name: 'System Admin', email: 'admin@edu.os', role: 'admin' },
  TEACHER: { id: 'T-001', name: 'Prof. Albus', email: 'albus@edu.os', role: 'teacher' },
  STUDENT: { id: 'S-101', name: 'Narendra', email: 'narendra@edu.os', role: 'student' },
};

export const COURSES: Course[] = [
  { id: 'C-101', code: 'CS-301', name: 'Advanced AI', description: 'Neural Networks & Deep Learning', teacherId: 'T-001', schedule: 'Mon/Wed 10:00 AM', credits: 4 },
  { id: 'C-102', code: 'CS-302', name: 'Data Structures', description: 'Algorithms & Complexity', teacherId: 'T-001', schedule: 'Tue/Thu 12:00 PM', credits: 3 },
  { id: 'C-103', code: 'SE-201', name: 'Software Eng', description: 'Agile & DevOps', teacherId: 'T-002', schedule: 'Fri 09:00 AM', credits: 3 },
];

export const MATERIALS: Material[] = [
  { id: 'M-1', courseId: 'C-101', title: 'Lecture 1: Intro to NN', type: 'pdf', uploadDate: '2023-10-01', size: '2.4 MB' },
  { id: 'M-2', courseId: 'C-101', title: 'Backpropagation Demo', type: 'video', uploadDate: '2023-10-03', size: '150 MB' },
  { id: 'M-3', courseId: 'C-102', title: 'Sorting Algorithms Cheatsheet', type: 'pdf', uploadDate: '2023-10-05', size: '1.1 MB' },
];

export const GRADES: Grade[] = [
  { id: 'G-1', courseId: 'C-101', studentId: 'S-101', assessmentName: 'Midterm Exam', score: 85, maxScore: 100, weight: 30 },
  { id: 'G-2', courseId: 'C-101', studentId: 'S-101', assessmentName: 'Project Alpha', score: 92, maxScore: 100, weight: 20 },
  { id: 'G-3', courseId: 'C-102', studentId: 'S-101', assessmentName: 'Quiz 1', score: 18, maxScore: 20, weight: 10 },
];

export const PROGRESS: StudentProgress[] = [
  { studentId: 'S-101', courseId: 'C-101', attendancePercentage: 92, overallGrade: 88, status: 'passing' },
  { studentId: 'S-101', courseId: 'C-102', attendancePercentage: 75, overallGrade: 72, status: 'at-risk' },
];

// Re-export old mock data for compatibility if needed, or replace usages
export const MOCK_STUDENTS = [
  { id: 'S-102', name: 'Alice Chen', rollNo: '21CS002', status: 'present', time: '10:01 AM' },
  { id: 'S-103', name: 'Bob Smith', rollNo: '21CS003', status: 'present', time: '10:02 AM' },
  { id: 'S-104', name: 'Charlie D', rollNo: '21CS004', status: 'present', time: '10:05 AM' },
];

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  teacherId: string;
  schedule: string;
  credits: number;
}

export interface Material {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'video' | 'link';
  uploadDate: string;
  size?: string;
}

export interface Grade {
  id: string;
  courseId: string;
  studentId: string;
  assessmentName: string;
  score: number;
  maxScore: number;
  weight: number; // Percentage
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  attendancePercentage: number;
  overallGrade: number; // Calculated
  status: 'passing' | 'failing' | 'at-risk';
}

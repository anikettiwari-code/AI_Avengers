import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { NeuroScheduler } from './pages/admin/NeuroScheduler';
import { Settings } from './pages/admin/Settings';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { SessionView } from './pages/teacher/SessionView';
import { CourseManagement } from './pages/teacher/CourseManagement';
import { Grading } from './pages/teacher/Grading';
import { ClassroomScan } from './pages/teacher/ClassroomScan'; // Import New Page

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ScanAttendance } from './pages/student/ScanAttendance';
import { EnrolledCourses } from './pages/student/EnrolledCourses';
import { Results } from './pages/student/Results';

const ProtectedRoute = ({ role, children }: { role: string, children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><MainLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="timetable" element={<NeuroScheduler />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Teacher Routes */}
            <Route path="/teacher" element={<ProtectedRoute role="teacher"><MainLayout /></ProtectedRoute>}>
              <Route index element={<TeacherDashboard />} />
              <Route path="session" element={<SessionView />} />
              <Route path="scan-class" element={<ClassroomScan />} /> {/* New Route */}
              <Route path="courses" element={<CourseManagement />} />
              <Route path="grading" element={<Grading />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute role="student"><MainLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="scan" element={<ScanAttendance />} />
              <Route path="courses" element={<EnrolledCourses />} />
              <Route path="results" element={<Results />} />
            </Route>

          </Routes>
        </Router>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;

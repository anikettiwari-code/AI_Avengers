import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

type UserRole = 'student' | 'faculty';
type FaceIdStatus = 'not_set' | 'pending' | 'verified';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  user: {
    name: string;
    id: string;
    avatar: string;
  } | null;
  faceIdStatus: FaceIdStatus;
  setFaceIdStatus: (status: FaceIdStatus) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: 'student',
  setRole: () => {},
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  user: null,
  faceIdStatus: 'not_set',
  setFaceIdStatus: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('student');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Mocking the Face ID status state
  const [faceIdStatus, setFaceIdStatus] = useState<FaceIdStatus>('not_set');
  
  const rootSegment = useSegments()[0];
  const router = useRouter();

  const user = {
    name: role === 'student' ? 'Alisha Khan' : 'Dr. Sarah Williams',
    id: role === 'student' ? 'ST-2025-001' : 'FAC-CS-101',
    avatar: 'https://i.pravatar.cc/150?img=' + (role === 'student' ? '12' : '5'),
  };

  const login = () => {
    setIsAuthenticated(true);
    router.replace('/(app)/dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    if (!isAuthenticated && rootSegment !== '(auth)') {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && rootSegment === '(auth)') {
      router.replace('/(app)/dashboard');
    }
  }, [isAuthenticated, rootSegment]);

  return (
    <AuthContext.Provider value={{ 
      role, 
      setRole, 
      isAuthenticated, 
      login, 
      logout, 
      user,
      faceIdStatus,
      setFaceIdStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

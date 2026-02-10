import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '../utils/supabase';
import { Session, User } from '@supabase/supabase-js';

type UserRole = 'student' | 'faculty';
type FaceIdStatus = 'not_set' | 'pending' | 'verified';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, fullName: string, studentId: string) => Promise<{ error?: any }>;
  session: Session | null;
  userProfile: any | null;
  faceIdStatus: FaceIdStatus;
}

const AuthContext = createContext<AuthContextType>({
  role: 'student',
  setRole: () => { },
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({}),
  logout: async () => { },
  register: async () => ({}),
  session: null,
  userProfile: null,
  faceIdStatus: 'not_set',
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('student');
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const rootSegment = useSegments()[0];
  const router = useRouter();

  useEffect(() => {
    // 1. Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data);
        setRole(data.role || 'student');
      }
    } catch (e) {
      console.log('Error fetching profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const register = async (email: string, password: string, fullName: string, studentId: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
        }
      }
    });

    if (data?.user && !error) {
      // Create profile record (usually handled by DB triggers, but safer here if triggers aren't set)
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        student_id: studentId,
        email: email,
        role: 'student',
        is_active: false,
        face_enrolled: false,
      });
    }

    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = rootSegment === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(app)/dashboard');
    }
  }, [session, rootSegment, isLoading]);

  // Derive FaceIdStatus
  const faceIdStatus: FaceIdStatus = userProfile?.is_active
    ? 'verified'
    : userProfile?.face_enrolled
      ? 'pending'
      : 'not_set';

  return (
    <AuthContext.Provider value={{
      role,
      setRole,
      isAuthenticated: !!session,
      isLoading,
      login,
      logout,
      register,
      session,
      userProfile,
      faceIdStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

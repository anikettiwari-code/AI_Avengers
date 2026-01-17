import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { USERS } from '../data/mockData';

type UserRole = 'admin' | 'teacher' | 'student' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          // Check approval status
          if (profile.role !== 'admin' && profile.status === 'pending') {
             await supabase.auth.signOut();
             setUser(null);
          } else {
             setUser(profile as User);
          }
        }
      }
      setIsLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
         const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
         
         if (profile) {
            if (profile.role !== 'admin' && profile.status === 'pending') {
                // If user somehow logged in but is pending, kick them out
                if (event === 'SIGNED_IN') {
                    await supabase.auth.signOut();
                    setError("Account awaiting Admin Approval.");
                }
                setUser(null);
            } else {
                setUser(profile as User);
            }
         }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check for Super Admin (Env Variables Backdoor)
      const envAdminUser = import.meta.env.VITE_ADMIN_USERNAME;
      const envAdminPass = import.meta.env.VITE_ADMIN_PASSWORD;

      if (email === envAdminUser && pass === envAdminPass) {
        setUser(USERS.ADMIN as User);
        setIsLoading(false);
        return true;
      }

      // 2. Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch detailed profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (profileError) throw profileError;
        
        // 3. CHECK APPROVAL STATUS
        if (profile.role !== 'admin' && profile.status === 'pending') {
            await supabase.auth.signOut();
            throw new Error("Your account is pending Admin approval. Please contact the institute.");
        }

        if (profile.status === 'rejected') {
            await supabase.auth.signOut();
            throw new Error("Your account registration was rejected.");
        }
        
        setUser(profile as User);
        setIsLoading(false);
        return true;
      }

      return false;
    } catch (err: any) {
      console.error("Login Error:", err);
      // Fallback to mock data if Supabase fails (for demo stability)
      const foundUser = Object.values(USERS).find(u => u.email === email);
      if (foundUser) {
        setUser(foundUser as User);
        setIsLoading(false);
        return true;
      }

      setError(err.message || "Invalid credentials");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

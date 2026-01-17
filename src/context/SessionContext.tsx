import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Student {
  id: string;
  name: string;
  rollNo: string;
  status: string;
  time: string;
}

interface SessionContextType {
  activeSessionId: string | null;
  activeCourseId: string | null;
  attendees: Student[];
  startSession: (courseId: string) => Promise<void>;
  stopSession: () => Promise<void>;
  markAttendance: (studentId: string) => Promise<void>;
  qrCode: string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Student[]>([]);
  const [qrCode, setQrCode] = useState<string>('');

  // 1. Realtime Subscription to Attendance Logs
  useEffect(() => {
    if (!activeSessionId) return;

    // Fetch existing attendees first
    const fetchExisting = async () => {
        const { data } = await supabase
            .from('attendance_logs')
            .select('student_id, timestamp, profiles(name, roll_no)')
            .eq('session_id', activeSessionId);
        
        if (data) {
            const mapped = data.map((log: any) => ({
                id: log.student_id,
                name: log.profiles?.name || 'Unknown',
                rollNo: log.profiles?.roll_no || 'N/A',
                status: 'present',
                time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setAttendees(mapped);
        }
    };
    fetchExisting();

    // Subscribe to NEW inserts
    const channel = supabase
      .channel('public:attendance_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance_logs', filter: `session_id=eq.${activeSessionId}` },
        async (payload) => {
          console.log('Realtime Attendance:', payload);
          // Fetch profile details for the new ID
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, roll_no')
            .eq('id', payload.new.student_id)
            .single();

          const newStudent = {
            id: payload.new.student_id,
            name: profile?.name || 'Unknown',
            rollNo: profile?.roll_no || 'N/A',
            status: 'present',
            time: new Date(payload.new.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setAttendees(prev => [newStudent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId]);

  // 2. Dynamic QR Rotation
  useEffect(() => {
    let interval: any;
    if (activeSessionId) {
      interval = setInterval(async () => {
        const newHash = `SESSION-${activeSessionId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        setQrCode(newHash);
        
        // Update DB with new hash (optional, for strict validation)
        await supabase
            .from('active_sessions')
            .update({ qr_code_hash: newHash })
            .eq('id', activeSessionId);

      }, 5000); 
    }
    return () => clearInterval(interval);
  }, [activeSessionId]);

  const startSession = async (courseId: string) => {
    if (!user) return;

    try {
        // Create session in DB
        const { data, error } = await supabase
            .from('active_sessions')
            .insert({
                course_id: courseId,
                teacher_id: user.id,
                is_active: true
            })
            .select()
            .single();
        
        if (error) throw error;

        setActiveSessionId(data.id);
        setActiveCourseId(courseId);
        setAttendees([]);
        setQrCode(`SESSION-${data.id}-INIT`);
    } catch (err) {
        console.error("Failed to start session:", err);
    }
  };

  const stopSession = async () => {
    if (!activeSessionId) return;
    
    await supabase
        .from('active_sessions')
        .update({ is_active: false, end_time: new Date().toISOString() })
        .eq('id', activeSessionId);

    setActiveSessionId(null);
    setActiveCourseId(null);
    setQrCode('');
  };

  const markAttendance = async (studentId: string) => {
    // Determine the session ID. 
    // If student is marking, we need to find the active session for their enrolled course.
    // For this demo, we'll assume there is ONE active session globally or provided via QR scan.
    
    // In a real app, the QR code contains the Session ID.
    // Let's assume we are in "Demo Mode" where we grab the most recent active session if not provided.
    
    let targetSessionId = activeSessionId;

    if (!targetSessionId) {
        // Fetch any active session (for Student View demo)
        const { data } = await supabase
            .from('active_sessions')
            .select('id, course_id')
            .eq('is_active', true)
            .order('start_time', { ascending: false })
            .limit(1)
            .single();
        
        if (data) {
            targetSessionId = data.id;
        } else {
            console.error("No active session found");
            return;
        }
    }

    // Insert into DB (This triggers the Realtime subscription for the Teacher)
    const { error } = await supabase
        .from('attendance_logs')
        .insert({
            student_id: studentId,
            session_id: targetSessionId,
            course_id: 'DYNAMIC', // Ideally fetched from session
            method: 'FACE',
            verified: true
        });

    if (error) console.error("Attendance Mark Error:", error);
  };

  return (
    <SessionContext.Provider value={{ activeSessionId, activeCourseId, attendees, startSession, stopSession, markAttendance, qrCode }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within a SessionProvider');
  return context;
};

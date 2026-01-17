import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase URL or Key. Check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  roll_no?: string;
  avatar_url?: string;
  status?: 'pending' | 'approved' | 'rejected';
};

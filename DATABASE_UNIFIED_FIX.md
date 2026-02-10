-- 🚨 UNIFIED FIX SCRIPT 🚨
-- Run this in Supabase SQL Editor to fix ALL visibility issues.

-- 1. Helper Function: Safe Teacher Check (Prevents Infinite Loops)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher');
END;
$$;

-- 2. FIX PENDING APPROVALS (Teachers couldn't see them)
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can view pending approvals" ON pending_approvals;
DROP POLICY IF EXISTS "Teachers can update pending approvals" ON pending_approvals;

CREATE POLICY "Teachers can view pending approvals" ON pending_approvals
  FOR SELECT USING ( public.is_teacher() );

CREATE POLICY "Teachers can update pending approvals" ON pending_approvals
  FOR UPDATE USING ( public.is_teacher() );

-- 3. FIX PROFILES (Teachers couldn't see student details)
DROP POLICY IF EXISTS "Teachers can view all profiles" ON profiles;

CREATE POLICY "Teachers can view all profiles" ON profiles
  FOR SELECT USING ( public.is_teacher() );

-- 4. CREATE/FIX NOTIFICATIONS TABLE (App looks for 'notifications', not 'notices')
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', 
    audience TEXT DEFAULT 'all', 
    target_user_id UUID REFERENCES profiles(id), 
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View relevant notifications" ON notifications;
CREATE POLICY "View relevant notifications" ON notifications
    FOR SELECT USING (
        audience = 'all' 
        OR (audience = 'students' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'))
        OR (audience = 'teachers' AND public.is_teacher())
        OR target_user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Teachers can create notifications" ON notifications;
CREATE POLICY "Teachers can create notifications" ON notifications
    FOR INSERT WITH CHECK ( public.is_teacher() );

-- 5. FIX STORAGE (Selfies)
-- Ensure 'selfies' bucket exists (Manual step, but we make sure tables are linked)

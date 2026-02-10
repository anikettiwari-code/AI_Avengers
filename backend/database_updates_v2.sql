-- NEW FEATURES UPDATE (v2)
-- Run this after supabase_setup.sql and database_updates.sql

-- 1. NOTIFICATIONS SYSTEM
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'alert', 'success', 'warning'
    audience TEXT DEFAULT 'all', -- 'all', 'students', 'teachers', 'specific'
    target_user_id UUID REFERENCES profiles(id), -- If audience is 'specific'
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Everyone can view notifications targeted to them or 'all'
CREATE POLICY "View relevant notifications" ON notifications
    FOR SELECT USING (
        audience = 'all' 
        OR (audience = 'students' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'))
        OR (audience = 'teachers' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'))
        OR target_user_id = auth.uid()
    );

-- Teachers can create notifications
CREATE POLICY "Teachers can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
    );

-- 2. ENHANCE PROFILES (Add missing fields for editing)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update Profile Policies to allow Users to Edit specific fields
-- (Already covered by "Users can update own profile" in setup, but let's ensure it)

-- 3. SCHEDULE MANAGEMENT (Ensure classes table is robust)
-- (Already created in database_updates.sql, but we will ensure JSON structure is used)

-- 4. FIX STORAGE POLICIES (For Selfie Issue)
-- You must run this in the SQL Editor to ensure Storage works
-- Note: Storage policies are often separate from Table RLS. 
-- The bucket 'selfies' must be Public.

-- 5. RECURSION FIX for Profiles (If not applied yet)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher');
END;
$$;

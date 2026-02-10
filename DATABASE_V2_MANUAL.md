# 🗄️ Database Update v2 (New Features)

**Please run this script in Supabase SQL Editor to enable Notifications and Profile Editing.**

---

## Step 1: Open SQL Editor
1. Go to: **[Supabase Project Dashboard](https://muuvwvsaxucbhsftuvct.supabase.co)**
2. Click **SQL Editor** -> **New Query**.

## Step 2: Run This Script

```sql
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
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;

-- 3. RECURSION FIX (Crucial for Dashboard to work)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher');
END;
$$;

-- Drop old recursive policies if they exist and re-apply safe ones
DROP POLICY IF EXISTS "Teachers can view all profiles" ON profiles;

CREATE POLICY "Teachers can view all profiles" ON profiles
  FOR SELECT USING ( public.is_teacher() );
```

## Step 3: Create Storage (If not done)
1. Go to **Storage**.
2. Ensure **selfies** bucket exists and is Public.

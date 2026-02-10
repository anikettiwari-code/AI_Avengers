# 🗄️ Database Setup Instructions (Manual)

**Since we cannot automate the execution of SQL scripts on the Supabase dashboard, please follow these steps manually.**

---

## Step 1: Open Supabase Dashboard
1. Go to: **[Supabase Project Dashboard](https://muuvwvsaxucbhsftuvct.supabase.co)**
2. Click on **SQL Editor** in the left sidebar.

---

## Step 2: Run Base Schema Script
1. Click **New Query**.
2. Copy the code below and paste it into the SQL Editor.
3. Click **Run** (bottom right).

> **Note**: This script includes a special `is_teacher()` function to prevent infinite recursion errors in security policies.

```sql
-- 1. Enable the vector extension
create extension if not exists vector;

-- 2. Profiles table (links to auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  student_id text unique,
  email text,
  department text,
  is_active boolean default false,
  face_enrolled boolean default false,
  role text default 'student', -- 'student' or 'teacher'
  created_at timestamp with time zone default now()
);

-- 3. Pending Approvals table (Waiting for Teacher Review)
create table if not exists pending_approvals (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  student_id text,
  full_name text,
  embedding vector(512),
  selfie_url text, -- Path to image in Supabase Storage
  status text default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone default now()
);

-- 4. Active Embeddings table (For CCTV matching)
create table if not exists active_embeddings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  student_id text,
  embedding vector(512),
  created_at timestamp with time zone default now()
);

-- 5. Helper Function to Check Teacher Role (Prevents Recursion)
create or replace function public.is_teacher()
returns boolean
language plpgsql security definer
as $$
begin
  return exists (select 1 from profiles where id = auth.uid() and role = 'teacher');
end;
$$;

-- 6. Create a function to match faces (Cosine Similarity)
create or replace function match_students (
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
returns table (
  student_id text,
  profile_id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    active_embeddings.student_id,
    active_embeddings.profile_id,
    1 - (active_embeddings.embedding <=> query_embedding) as similarity
  from active_embeddings
  where 1 - (active_embeddings.embedding <=> query_embedding) > match_threshold
  order by active_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 7. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, student_id, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'student_id', 'unknown'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS Policies (Basic)
alter table profiles enable row level security;
alter table pending_approvals enable row level security;
alter table active_embeddings enable row level security;

-- CLEANUP: Drop existing policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Teachers can view all profiles" on profiles;
drop policy if exists "Teachers can view pending approvals" on pending_approvals;
drop policy if exists "Teachers can update pending approvals" on pending_approvals;
drop policy if exists "Students can insert pending approvals" on pending_approvals;
drop policy if exists "Students can view own pending approvals" on pending_approvals;

-- Profiles: Users can read their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Profiles: Users can insert their own profile (for signup)
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Profiles: Users can update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Profiles: Teachers can view all profiles (Uses is_teacher() to avoid recursion)
create policy "Teachers can view all profiles" on profiles
  for select using ( public.is_teacher() );

-- Pending Approvals: Teachers can view all pending requests
create policy "Teachers can view pending approvals" on pending_approvals
  for select using ( public.is_teacher() );

-- Pending Approvals: Teachers can update requests (approve/reject)
create policy "Teachers can update pending approvals" on pending_approvals
  for update using ( public.is_teacher() );

-- Pending Approvals: Students can insert their own requests
create policy "Students can insert pending approvals" on pending_approvals
  for insert with check (auth.uid() = profile_id);

-- Pending Approvals: Students can view their own requests
create policy "Students can view own pending approvals" on pending_approvals
  for select using (auth.uid() = profile_id);
```

---

## Step 3: Run Enhanced Schema Script
1. Click **New Query** again.
2. Copy the code below and paste it into the SQL Editor.
3. Click **Run**.

```sql
-- 1. Training Images table
CREATE TABLE IF NOT EXISTS training_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    quality_score FLOAT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    embedding VECTOR(512),
    used_for_training BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_student_images ON training_images(student_id);
CREATE INDEX IF NOT EXISTS idx_profile_images ON training_images(profile_id);

-- 2. Attendance Logs table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    class_id TEXT,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_score FLOAT,
    camera_id TEXT DEFAULT 'cctv_main',
    frame_url TEXT,
    verified BOOLEAN DEFAULT false,
    method TEXT DEFAULT 'face_recognition',
    marked_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_student_attendance ON attendance_logs(student_id, marked_at);
CREATE INDEX IF NOT EXISTS idx_class_attendance ON attendance_logs(class_id, marked_at);
CREATE INDEX IF NOT EXISTS idx_date_attendance ON attendance_logs(marked_at);

-- 3. Recognition Stats table
CREATE TABLE IF NOT EXISTS recognition_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE DEFAULT CURRENT_DATE,
    total_recognitions INT DEFAULT 0,
    successful_matches INT DEFAULT 0,
    failed_matches INT DEFAULT 0,
    avg_confidence FLOAT,
    avg_processing_time_ms INT,
    camera_id TEXT DEFAULT 'cctv_main',
    UNIQUE(date, camera_id)
);

-- 4. Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    division TEXT,
    teacher_id UUID REFERENCES profiles(id),
    schedule JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Class Enrollments table
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 6. Function: is_attendance_marked_today
CREATE OR REPLACE FUNCTION is_attendance_marked_today(p_student_id TEXT, p_class_id TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE marked BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM attendance_logs WHERE student_id = p_student_id AND class_id = p_class_id AND DATE(marked_at) = CURRENT_DATE) INTO marked;
    RETURN marked;
END;
$$;

-- 7. Function: get_attendance_stats
CREATE OR REPLACE FUNCTION get_attendance_stats(p_class_id TEXT, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (total_students INT, present_students INT, absent_students INT, attendance_percentage FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ce.student_id)::INT as total_students,
        COUNT(DISTINCT al.student_id)::INT as present_students,
        (COUNT(DISTINCT ce.student_id) - COUNT(DISTINCT al.student_id))::INT as absent_students,
        CASE WHEN COUNT(DISTINCT ce.student_id) > 0 THEN (COUNT(DISTINCT al.student_id)::FLOAT / COUNT(DISTINCT ce.student_id)::FLOAT * 100) ELSE 0 END as attendance_percentage
    FROM class_enrollments ce
    LEFT JOIN attendance_logs al ON ce.student_id = al.student_id AND al.class_id = p_class_id AND DATE(al.marked_at) = p_date
    WHERE ce.class_id::TEXT = p_class_id;
END;
$$;

-- RLS Policies
ALTER TABLE training_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Training Images
CREATE POLICY "Students can view own training images" ON training_images FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Teachers can view all training images" ON training_images FOR SELECT USING (public.is_teacher());

-- Attendance Logs
CREATE POLICY "Students can view own attendance" ON attendance_logs FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Teachers can view all attendance" ON attendance_logs FOR SELECT USING (public.is_teacher());
CREATE POLICY "Teachers can insert attendance" ON attendance_logs FOR INSERT WITH CHECK (public.is_teacher());

-- Classes
CREATE POLICY "Everyone can view classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage classes" ON classes FOR ALL USING (public.is_teacher());

-- Class Enrollments
CREATE POLICY "Everyone can view enrollments" ON class_enrollments FOR SELECT USING (true);
CREATE POLICY "Teachers can manage enrollments" ON class_enrollments FOR ALL USING (public.is_teacher());
```

---

## Step 4: Create Storage Bucket
1. Go to **Storage** in the left sidebar.
2. Click **Create a new bucket**.
3. Enter name: `selfies`
4. Toggle **Public bucket** to **ON** (Green).
5. Click **Save**.

---

## Step 5: Verify
Go to **Table Editor** and confirm you see 8 tables list.

**After completing this, restart the app in Expo via terminal (press 'r') to refresh the connection.**

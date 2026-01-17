-- Run this script in your Supabase SQL Editor to set up the database

-- 1. Create Profiles Table (Public User Data)
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  role text check (role in ('admin', 'teacher', 'student')),
  roll_no text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 3. Create Face Encodings Table (Stores the Biometric Vector)
create table if not exists face_encodings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  descriptor jsonb not null, -- Storing the 128-float vector as JSON
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table face_encodings enable row level security;

create policy "Teachers/Admins can view all face data." on face_encodings for select using (true);
create policy "Users can insert their own face data." on face_encodings for insert with check (auth.uid() = user_id);

-- 4. Create Attendance Logs
create table if not exists attendance_logs (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) not null,
  session_id text not null,
  course_id text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  method text check (method in ('FACE', 'QR', 'MANUAL')),
  verified boolean default false
);

alter table attendance_logs enable row level security;

create policy "Everyone can view attendance" on attendance_logs for select using (true);
create policy "Teachers and Students can insert" on attendance_logs for insert with check (true);

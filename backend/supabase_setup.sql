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

-- 5. Create a function to match faces (Cosine Similarity)
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

-- 6. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
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

-- CLEANUP: Drop existing policies to prevent "already exists" errors
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

-- Profiles: Service role or Teachers can view all
create policy "Teachers can view all profiles" on profiles
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'teacher'
    )
  );

-- Pending Approvals: Teachers can view all pending requests
create policy "Teachers can view pending approvals" on pending_approvals
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'teacher'
    )
  );

-- Pending Approvals: Teachers can update requests (approve/reject)
create policy "Teachers can update pending approvals" on pending_approvals
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'teacher'
    )
  );

-- Pending Approvals: Students can insert their own requests
create policy "Students can insert pending approvals" on pending_approvals
  for insert with check (auth.uid() = profile_id);

-- Pending Approvals: Students can view their own requests
create policy "Students can view own pending approvals" on pending_approvals
  for select using (auth.uid() = profile_id);

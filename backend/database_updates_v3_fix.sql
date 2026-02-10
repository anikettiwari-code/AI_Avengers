-- FIX FOR TEACHER APPROVALS NOT SHOWING
-- Run this in Supabase SQL Editor

-- 1. Ensure the helper function exists (Safety check)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher');
END;
$$;

-- 2. Fix Pending Approvals Policies (Use is_teacher() to avoid recursion/access issues)
DROP POLICY IF EXISTS "Teachers can view pending approvals" ON pending_approvals;
DROP POLICY IF EXISTS "Teachers can update pending approvals" ON pending_approvals;

CREATE POLICY "Teachers can view pending approvals" ON pending_approvals
  FOR SELECT USING ( public.is_teacher() );

CREATE POLICY "Teachers can update pending approvals" ON pending_approvals
  FOR UPDATE USING ( public.is_teacher() );

-- 3. Fix Active Embeddings Policies (Just in case)
DROP POLICY IF EXISTS "Teachers can view active embeddings" ON active_embeddings;

CREATE POLICY "Teachers can view active embeddings" ON active_embeddings
  FOR SELECT USING ( public.is_teacher() );

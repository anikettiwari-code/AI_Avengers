# 🔧 Fix: Teachers Not Seeing Approvals

There is a security policy issue preventing teachers from reading the `pending_approvals` list. 
Please run this SQL script to fix it.

## Instructions
1. Go to **Supabase Dashboard** -> **SQL Editor**.
2. **New Query**.
3. Copy & Paste the code below and click **Run**.

```sql
-- Fix RLS Policies for Teacher Access

-- 1. Helper function to check teacher role securely
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher');
END;
$$;

-- 2. Grant Teachers access to Pending Approvals
DROP POLICY IF EXISTS "Teachers can view pending approvals" ON pending_approvals;
DROP POLICY IF EXISTS "Teachers can update pending approvals" ON pending_approvals;

CREATE POLICY "Teachers can view pending approvals" ON pending_approvals
  FOR SELECT USING ( public.is_teacher() );

CREATE POLICY "Teachers can update pending approvals" ON pending_approvals
  FOR UPDATE USING ( public.is_teacher() );

-- 3. Grant Teachers access to Active Embeddings
DROP POLICY IF EXISTS "Teachers can view active embeddings" ON active_embeddings;

CREATE POLICY "Teachers can view active embeddings" ON active_embeddings
  FOR SELECT USING ( public.is_teacher() );
```

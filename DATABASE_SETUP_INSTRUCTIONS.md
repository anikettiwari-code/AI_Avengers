# Database Migration Instructions

## Step 1.1: Run Base Schema (supabase_setup.sql)

1. Open your browser and go to: https://supabase.com/dashboard/project/muuvwvsaxucbhsftuvct
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query" button
4. Copy the ENTIRE content from: backend/supabase_setup.sql
5. Paste it into the SQL Editor
6. Click "Run" button (or press Ctrl+Enter)
7. ✅ You should see: "Success. No rows returned"

## Step 1.2: Run Additional Schema (database_updates.sql)

1. Still in SQL Editor, click "New Query" again
2. Copy the ENTIRE content from: backend/database_updates.sql
3. Paste it into the SQL Editor
4. Click "Run" button
5. ✅ You should see: "Success. No rows returned"

## Step 1.3: Create Storage Bucket

1. Click "Storage" in the left sidebar
2. Click "New bucket" button
3. Enter bucket name: selfies
4. Set to "Public" bucket
5. Click "Create bucket"
6. ✅ You should see "selfies" in the bucket list

## Step 1.4: Verify Tables Created

1. Click "Table Editor" in the left sidebar
2. ✅ You should see these tables:
   - profiles
   - pending_approvals
   - active_embeddings
   - training_images (NEW)
   - attendance_logs (NEW)
   - recognition_stats (NEW)
   - classes (NEW)
   - class_enrollments (NEW)

## ✅ Database Setup Complete!

Once you see all 8 tables, you're ready for Step 2!

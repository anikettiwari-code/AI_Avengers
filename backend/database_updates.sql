-- Additional tables for enhanced face recognition system
-- Run this after supabase_setup.sql

-- 1. Training Images table - stores all enrollment photos
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

-- Create indexes for training_images
CREATE INDEX IF NOT EXISTS idx_student_images ON training_images(student_id);
CREATE INDEX IF NOT EXISTS idx_profile_images ON training_images(profile_id);


-- 2. Attendance Logs table - detailed attendance records
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
    method TEXT DEFAULT 'face_recognition', -- 'face_recognition', 'qr_code', 'manual'
    marked_by UUID REFERENCES profiles(id) -- Teacher who verified (if manual)
);

-- Create indexes for attendance_logs
CREATE INDEX IF NOT EXISTS idx_student_attendance ON attendance_logs(student_id, marked_at);
CREATE INDEX IF NOT EXISTS idx_class_attendance ON attendance_logs(class_id, marked_at);
CREATE INDEX IF NOT EXISTS idx_date_attendance ON attendance_logs(marked_at);

-- 3. Recognition Stats table - performance monitoring
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

-- 4. Classes table - for attendance tracking
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL, -- e.g., "10-A", "11-B"
    division TEXT,
    teacher_id UUID REFERENCES profiles(id),
    schedule JSONB, -- {"monday": ["09:00-10:00", "11:00-12:00"], ...}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Class Enrollments table - which students are in which class
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(class_id, student_id)
);

-- 6. Function to check if attendance already marked today
CREATE OR REPLACE FUNCTION is_attendance_marked_today(
    p_student_id TEXT,
    p_class_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    marked BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM attendance_logs
        WHERE student_id = p_student_id
        AND class_id = p_class_id
        AND DATE(marked_at) = CURRENT_DATE
    ) INTO marked;
    
    RETURN marked;
END;
$$;

-- 7. Function to get attendance statistics
CREATE OR REPLACE FUNCTION get_attendance_stats(
    p_class_id TEXT,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_students INT,
    present_students INT,
    absent_students INT,
    attendance_percentage FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ce.student_id)::INT as total_students,
        COUNT(DISTINCT al.student_id)::INT as present_students,
        (COUNT(DISTINCT ce.student_id) - COUNT(DISTINCT al.student_id))::INT as absent_students,
        CASE 
            WHEN COUNT(DISTINCT ce.student_id) > 0 
            THEN (COUNT(DISTINCT al.student_id)::FLOAT / COUNT(DISTINCT ce.student_id)::FLOAT * 100)
            ELSE 0
        END as attendance_percentage
    FROM class_enrollments ce
    LEFT JOIN attendance_logs al 
        ON ce.student_id = al.student_id 
        AND al.class_id = p_class_id
        AND DATE(al.marked_at) = p_date
    WHERE ce.class_id::TEXT = p_class_id;
END;
$$;

-- RLS Policies for new tables

-- CLEANUP: Drop existing policies to prevent "already exists" errors
drop policy if exists "Students can view own training images" on training_images;
drop policy if exists "Teachers can view all training images" on training_images;
drop policy if exists "Students can view own attendance" on attendance_logs;
drop policy if exists "Teachers can view all attendance" on attendance_logs;
drop policy if exists "Teachers can insert attendance" on attendance_logs;
drop policy if exists "Everyone can view classes" on classes;
drop policy if exists "Teachers can manage classes" on classes;
drop policy if exists "Everyone can view enrollments" on class_enrollments;
drop policy if exists "Teachers can manage enrollments" on class_enrollments;

-- Training Images
ALTER TABLE training_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own training images" ON training_images
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Teachers can view all training images" ON training_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
        )
    );

-- Attendance Logs
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own attendance" ON attendance_logs
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Teachers can view all attendance" ON attendance_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
        )
    );

CREATE POLICY "Teachers can insert attendance" ON attendance_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
        )
    );

-- Classes
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view classes" ON classes
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage classes" ON classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
        )
    );

-- Class Enrollments
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view enrollments" ON class_enrollments
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage enrollments" ON class_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
        )
    );

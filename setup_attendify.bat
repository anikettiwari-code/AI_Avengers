@echo off
echo ========================================
echo Attendify Setup Script
echo ========================================
echo.

echo Step 1: Navigating to backend folder...
cd /d C:\attendify\backend
echo Current directory: %CD%
echo.

echo Step 2: Installing Python dependencies...
echo This will take 10-15 minutes...
echo.
python -m pip install --upgrade pip
pip install deepface opencv-python fastapi uvicorn supabase python-dotenv tensorflow tf-keras

echo.
echo Step 3: Verifying installation...
python -c "import deepface; print('✅ DeepFace installed')"
python -c "import cv2; print('✅ OpenCV installed')"
python -c "import fastapi; print('✅ FastAPI installed')"
python -c "from supabase import create_client; print('✅ Supabase installed')"

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run database migrations in Supabase
echo 2. Start backend: uvicorn main:app --reload
echo 3. Test enrollment: python scripts\enroll_student.py --student-id TEST001 --name "Test Student"
echo.
pause

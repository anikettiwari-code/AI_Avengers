# Getting Started with Attendify Face Recognition

This guide will walk you through setting up and testing the face recognition system step by step.

---

## ⏱️ Estimated Time: 30-45 minutes

---

## Step 1: Database Setup (5 minutes)

### 1.1 Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 1.2 Run Base Schema
1. Open `backend/supabase_setup.sql` in a text editor
2. Copy all content
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. ✅ Should see "Success. No rows returned"

### 1.3 Run Additional Schema
1. Open `backend/database_updates.sql` in a text editor
2. Copy all content
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. ✅ Should see "Success. No rows returned"

### 1.4 Create Storage Bucket
1. Click "Storage" in left sidebar
2. Click "New bucket"
3. Name: `selfies`
4. Set to **Public**
5. Click "Create bucket"
6. ✅ Should see "selfies" bucket in list

### 1.5 Verify Tables Created
1. Click "Table Editor" in left sidebar
2. ✅ Should see these tables:
   - profiles
   - pending_approvals
   - active_embeddings
   - training_images
   - attendance_logs
   - recognition_stats
   - classes
   - class_enrollments

---

## Step 2: Backend Setup (10 minutes)

### 2.1 Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

⏳ This may take 5-10 minutes (downloading TensorFlow, DeepFace, etc.)

### 2.2 Configure Environment

```bash
# Create .env file
# Windows:
copy .env.example .env
# Mac/Linux:
cp .env.example .env

# Edit .env file with your Supabase credentials
notepad .env  # Windows
nano .env     # Mac/Linux
```

Add your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### 2.3 Test Backend

```bash
# Start FastAPI server
uvicorn main:app --reload
```

✅ Should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Open browser and go to: `http://localhost:8000`

✅ Should see:
```json
{
  "message": "Welcome to Attendify Hybrid AI Backend",
  "status": "online"
}
```

**Keep this terminal running!**

---

## Step 3: Test Student Enrollment (10 minutes)

### 3.1 Open New Terminal

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### 3.2 Enroll Test Student

```bash
python scripts/enroll_student.py --student-id TEST001 --name "Test Student"
```

### 3.3 Follow On-Screen Instructions

1. ✅ Camera window should open
2. ✅ Should see quality score (0-100) on screen
3. ✅ System will auto-capture when quality > 85
4. ✅ Will capture 7 photos total

**Tips**:
- Ensure good lighting
- Face camera directly
- Move closer if "Face too small"
- Hold still if "Image too blurry"

### 3.4 Verify Enrollment

After capturing 7 photos, should see:
```
✅ ENROLLMENT SUCCESSFUL!
Student: Test Student (TEST001)
Status: Pending teacher approval
Photos saved: 7
```

### 3.5 Check Database

1. Go to Supabase → Table Editor
2. Open `pending_approvals` table
3. ✅ Should see new row with:
   - student_id: TEST001
   - full_name: Test Student
   - status: pending
   - embedding: [array of 512 numbers]

---

## Step 4: Approve Student (2 minutes)

### 4.1 Manual Approval (for now)

Since frontend approval screen isn't built yet, we'll approve via API:

```bash
# Get the pending_id from Supabase (copy the UUID from pending_approvals table)

# Use curl or Postman to approve:
curl -X POST http://localhost:8000/api/v1/teacher/approve-biometrics \
  -H "Content-Type: application/json" \
  -d '{"pending_id": "paste-uuid-here"}'
```

Or use Python:
```bash
python -c "from utils.face_engine import face_engine; face_engine.approve_student('paste-uuid-here')"
```

### 4.2 Verify Approval

1. Go to Supabase → Table Editor
2. Open `active_embeddings` table
3. ✅ Should see TEST001 with embedding

---

## Step 5: Test CCTV Recognition (5 minutes)

### 5.1 Ensure Backend is Running

Check that `uvicorn main:app --reload` is still running from Step 2.

### 5.2 Run CCTV Agent

```bash
# In backend directory (new terminal if needed)
python cctv_agent.py
```

### 5.3 Test Recognition

1. ✅ Camera window should open
2. ✅ Should see "Attendify CCTV Mode" on screen
3. Stand in front of camera
4. Wait 3 seconds

✅ Should see in console:
```
Checking for faces...
MATCH FOUND: Student TEST001 (0.92)
```

✅ Should see on camera window:
```
MATCH: TEST001
```

### 5.4 Verify Attendance Marked

1. Go to Supabase → Table Editor
2. Open `attendance_logs` table
3. ✅ Should see new row with:
   - student_id: TEST001
   - confidence_score: ~0.85-0.95
   - marked_at: current timestamp
   - verified: true (if confidence > 85%)

---

## Step 6: Test Deduplication (2 minutes)

### 6.1 Try Marking Again

With CCTV agent still running, stand in front of camera again.

✅ Should see in console:
```
Checking for faces...
MATCH FOUND: Student TEST001 (0.92)
```

But NO new attendance record should be created (check database).

This is **deduplication** working - won't mark same student twice within 1 hour.

---

## Step 7: Enroll More Students (Optional)

### 7.1 Create CSV File

Create `my_students.csv`:
```csv
student_id,full_name,class,division
STUD001,John Doe,10,A
STUD002,Jane Smith,10,A
STUD003,Mike Johnson,10,B
```

### 7.2 Batch Enrollment

```bash
python scripts/enroll_student.py --csv my_students.csv
```

System will prompt for each student:
```
[1/3] Enrolling: John Doe (STUD001)
Press ENTER when John Doe is ready in front of camera...
```

---

## Step 8: Frontend Setup (Optional, 10 minutes)

### 8.1 Install Dependencies

```bash
cd frontend
npm install
```

### 8.2 Configure API URL

Edit `frontend/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 8.3 Start Frontend

```bash
npm start
```

### 8.4 Open in Expo Go

1. Install Expo Go app on phone
2. Scan QR code from terminal
3. ✅ App should open

---

## ✅ Success Checklist

- [ ] Database tables created in Supabase
- [ ] Storage bucket "selfies" created
- [ ] Backend running on http://localhost:8000
- [ ] Enrolled at least 1 test student
- [ ] Student approved and in active_embeddings
- [ ] CCTV agent recognizes student
- [ ] Attendance marked in database
- [ ] Deduplication prevents double-marking

---

## 🎯 Next Steps

Now that everything is working:

1. **Enroll Real Students**
   - Create CSV with student list
   - Run batch enrollment
   - Have teacher approve all

2. **Position CCTV Camera**
   - Near classroom entrance
   - 1.5-2 meters height
   - Good lighting

3. **Test in Real Classroom**
   - Have students enter one by one
   - Monitor recognition accuracy
   - Adjust threshold if needed

4. **Build Frontend Features**
   - Teacher approval screen
   - Student enrollment screen
   - Attendance dashboard

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'deepface'"
```bash
pip install deepface
```

### "Could not open camera"
- Check camera is not in use by another app
- Try different camera index: `CAMERA_SOURCE = 1`
- Check camera permissions

### "No face detected"
- Improve lighting
- Move closer to camera
- Ensure face is visible

### "Supabase connection error"
- Check .env file has correct credentials
- Verify Supabase project is active
- Check internet connection

### "Already marked"
- This is normal (deduplication)
- Wait 1 hour or change `dedup_window_hours` in attendance_marker.py

---

## 📞 Need Help?

1. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
2. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. Review error messages in console
4. Check Supabase logs

---

**Congratulations! 🎉**

You now have a working face recognition attendance system!

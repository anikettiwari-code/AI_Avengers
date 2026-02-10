# Complete Testing Guide - Attendify Face Recognition

## Prerequisites Check ✅

You have:
- ✅ Python 3.11.9 installed
- ✅ Supabase credentials configured in .env
- ⏭️ Need to install/verify backend dependencies

---

## Step 2: Install Backend Dependencies ⏱️ 10-15 minutes

### 2.1 Open PowerShell/Terminal

```powershell
cd d:\attendify_app_implementation_hsf5te_dualiteproject\backend
```

### 2.2 Install All Dependencies

```powershell
pip install -r requirements.txt
```

⏳ This will take 10-15 minutes as it downloads:
- TensorFlow (~500MB)
- DeepFace
- OpenCV
- FastAPI
- Supabase
- And other dependencies

### 2.3 Verify Installation

```powershell
python -c "import deepface; print('DeepFace:', deepface.__version__)"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import fastapi; print('FastAPI installed')"
python -c "from supabase import create_client; print('Supabase installed')"
```

✅ All should print without errors

---

## Step 3: Test Backend Server ⏱️ 2 minutes

### 3.1 Start Backend

```powershell
uvicorn main:app --reload
```

✅ You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 3.2 Test API

Open browser and go to: http://localhost:8000

✅ Should see:
```json
{
  "message": "Welcome to Attendify Hybrid AI Backend",
  "status": "online"
}
```

### 3.3 Check API Docs

Go to: http://localhost:8000/docs

✅ Should see Swagger UI with all API endpoints

**Keep this terminal running!**

---

## Step 4: Test Student Enrollment ⏱️ 10 minutes

### 4.1 Open NEW PowerShell/Terminal

```powershell
cd d:\attendify_app_implementation_hsf5te_dualiteproject\backend
```

### 4.2 Run Enrollment Script

```powershell
python scripts\enroll_student.py --student-id TEST001 --name "Test Student"
```

### 4.3 Follow On-Screen Instructions

The camera window will open. You'll see:

```
======================================================================
ENROLLING STUDENT
======================================================================
Student ID: TEST001
Name: Test Student
Photos to capture: 7
======================================================================

Will capture 7 photos
Press SPACE when ready for each photo
Press 'q' to quit
```

### 4.4 Photo Capture Process

The system will guide you through 7 poses:

1. **Photo 1**: Look straight at camera (neutral expression)
   - Wait for quality score to reach 85+/100
   - System will auto-capture

2. **Photo 2**: Turn slightly to the left
   - Auto-captures when quality is good

3. **Photo 3**: Turn slightly to the right

4. **Photo 4**: Smile naturally

5. **Photo 5**: Look down slightly

6. **Photo 6**: Look up slightly

7. **Photo 7**: Front face again (different expression)

**Tips for Good Photos**:
- ✅ Ensure good lighting (natural daylight is best)
- ✅ Face the camera directly
- ✅ Move closer if you see "Face too small"
- ✅ Hold still if you see "Image too blurry"
- ✅ Adjust lighting if "Too dark" or "Too bright"

### 4.5 Verify Success

After capturing 7 photos, you should see:

```
======================================================================
✅ ENROLLMENT SUCCESSFUL!
======================================================================
Student: Test Student (TEST001)
Status: Pending teacher approval
Photos saved: 7
======================================================================
```

### 4.6 Check Database

1. Go to Supabase Dashboard → Table Editor
2. Open `pending_approvals` table
3. ✅ You should see a new row with:
   - student_id: TEST001
   - full_name: Test Student
   - status: pending
   - embedding: [array of 512 numbers]
   - selfie_url: (may be null for now)

### 4.7 Check Photos Saved

```powershell
dir dataset\TEST001
```

✅ Should see 7 .jpg files

---

## Step 5: Approve Student ⏱️ 2 minutes

### 5.1 Get Pending ID

1. In Supabase → Table Editor → `pending_approvals`
2. Find the TEST001 row
3. Copy the `id` (UUID) value

### 5.2 Approve via Python

```powershell
python -c "from utils.face_engine import face_engine; face_engine.approve_student('PASTE-UUID-HERE')"
```

Replace `PASTE-UUID-HERE` with the actual UUID from step 5.1

✅ Should see no errors

### 5.3 Verify Approval

1. Go to Supabase → Table Editor → `active_embeddings`
2. ✅ Should see TEST001 with embedding

---

## Step 6: Test CCTV Recognition ⏱️ 5 minutes

### 6.1 Ensure Backend is Running

Check that `uvicorn main:app --reload` is still running from Step 3.

### 6.2 Run CCTV Agent

In a NEW terminal:

```powershell
cd d:\attendify_app_implementation_hsf5te_dualiteproject\backend
python cctv_agent.py
```

### 6.3 Camera Window Opens

✅ You should see:
- Camera feed
- "Attendify CCTV Mode" text
- Green box around detected face (if any)

### 6.4 Test Recognition

1. Stand in front of the camera
2. Wait 3 seconds (system checks every 3 seconds)

✅ Console should show:
```
Checking for faces...
MATCH FOUND: Student TEST001 (0.92)
```

✅ Camera window should show:
```
MATCH: TEST001
```

### 6.5 Verify Attendance Marked

1. Go to Supabase → Table Editor → `attendance_logs`
2. ✅ Should see a new row with:
   - student_id: TEST001
   - confidence_score: ~0.85-0.95
   - marked_at: current timestamp
   - verified: true (if confidence > 85%)
   - method: face_recognition

---

## Step 7: Test Deduplication ⏱️ 1 minute

### 7.1 Try Marking Again

With CCTV agent still running, stand in front of camera again.

✅ Console should show:
```
Checking for faces...
MATCH FOUND: Student TEST001 (0.92)
```

### 7.2 Check Database

Go to `attendance_logs` table

✅ Should still have only ONE record for TEST001 (no duplicate)

This proves **deduplication is working** - won't mark same student twice within 1 hour!

---

## Step 8: Enroll More Students (Optional) ⏱️ 5 min per student

### 8.1 Create CSV File

Create `my_students.csv` in the backend folder:

```csv
student_id,full_name,class,division
STUD001,John Doe,10,A
STUD002,Jane Smith,10,A
STUD003,Mike Johnson,10,B
```

### 8.2 Batch Enrollment

```powershell
python scripts\enroll_student.py --csv my_students.csv
```

System will prompt for each student:

```
[1/3] Enrolling: John Doe (STUD001)
----------------------------------------------------------------------
Press ENTER when John Doe is ready in front of camera (or Ctrl+C to skip)...
```

---

## ✅ Success Checklist

After completing all steps, verify:

- [ ] Backend dependencies installed
- [ ] Backend server running on http://localhost:8000
- [ ] Enrolled TEST001 student
- [ ] TEST001 approved and in `active_embeddings` table
- [ ] CCTV agent recognizes TEST001
- [ ] Attendance marked in `attendance_logs` table
- [ ] Deduplication prevents double-marking
- [ ] Photos saved in `dataset/TEST001/` folder

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'deepface'"
```powershell
pip install deepface
```

### "Could not open camera"
- Close other apps using camera (Zoom, Teams, etc.)
- Try different camera: Edit `cctv_agent.py`, change `CAMERA_SOURCE = 1`
- Check camera permissions in Windows Settings

### "No face detected"
- Improve lighting (open curtains, turn on lights)
- Move closer to camera
- Ensure face is visible and not covered

### "Face too small"
- Move closer to camera (within 1-2 meters)
- Ensure camera is at face level

### "Image too blurry"
- Hold still
- Check camera focus
- Clean camera lens

### "Supabase connection error"
- Check internet connection
- Verify .env file has correct credentials
- Check Supabase project is active

### "Already marked"
- This is NORMAL (deduplication working)
- Wait 1 hour to test again
- Or change `dedup_window_hours` in `utils/attendance_marker.py`

---

## 📊 Expected Results

### Enrollment Success Rate
- ✅ 95%+ photos should have quality > 70/100
- ✅ All 7 photos should be captured
- ✅ Embedding should be generated

### Recognition Accuracy
- ✅ 90-95% correct identification
- ✅ Confidence score 85-95%
- ✅ Recognition within 3 seconds

### Performance
- ✅ Enrollment: ~2-3 minutes per student
- ✅ Recognition: < 500ms per frame
- ✅ No lag in camera feed

---

## 🎯 Next Steps After Testing

Once everything works:

1. **Enroll Real Students**
   - Create CSV with student list
   - Set up enrollment station
   - Enroll 10-20 students

2. **Position CCTV Camera**
   - Near classroom entrance
   - 1.5-2 meters height
   - Good lighting

3. **Test in Classroom**
   - Have students enter one by one
   - Monitor accuracy
   - Adjust threshold if needed

4. **Build Frontend Features**
   - Teacher approval screen
   - Student enrollment screen
   - Attendance dashboard

---

## 📞 Need Help?

If you encounter issues:

1. Check error messages in console
2. Review IMPLEMENTATION_GUIDE.md
3. Check Supabase logs
4. Verify all dependencies installed

---

**Ready to start? Begin with Step 2!** 🚀

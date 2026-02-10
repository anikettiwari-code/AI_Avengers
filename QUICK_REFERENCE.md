# Attendify Face Recognition - Quick Reference

## 🚀 Quick Start

### 1. Database Setup
```sql
-- In Supabase SQL Editor, run these files in order:
1. supabase_setup.sql
2. database_updates.sql

-- Create storage bucket:
Go to Storage → Create bucket → Name: "selfies" → Public
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Edit .env with Supabase credentials
uvicorn main:app --reload
```

### 3. Enroll Students
```bash
# Single student
python scripts/enroll_student.py --student-id STUD001 --name "John Doe"

# Batch enrollment
python scripts/enroll_student.py --csv sample_students.csv
```

### 4. Run CCTV Agent
```bash
python cctv_agent.py
```

---

## 📝 Common Commands

### Enrollment
```bash
# Enroll with 10 photos
python scripts/enroll_student.py --student-id STUD001 --name "John Doe" --photos 10

# Use external camera
python scripts/enroll_student.py --student-id STUD001 --name "John Doe" --camera 1

# Re-enroll existing student
python scripts/enroll_student.py --student-id STUD001 --name "John Doe" --update
```

### Testing
```bash
# Test dataset builder
python -c "from utils.dataset_builder import DatasetBuilder; builder = DatasetBuilder(); builder.capture_student_photos('TEST001', 'Test Student', 5)"

# Test face engine
python -c "from utils.face_engine import face_engine; print(face_engine.get_embedding('dataset/TEST001/photo_1.jpg'))"

# Test attendance marker
python -c "from utils.attendance_marker import attendance_marker; print(attendance_marker.should_mark_attendance('TEST001', confidence=0.9))"
```

---

## 🔧 Configuration Quick Reference

### CCTV Agent (`cctv_agent.py`)
```python
API_URL = "http://localhost:8000/api/v1/attendance/match-face"
CAMERA_SOURCE = 0  # Webcam
CAMERA_SOURCE = 1  # External USB camera
CAMERA_SOURCE = "rtsp://192.168.1.100/stream"  # IP camera
RECOGNITION_INTERVAL = 3  # Check every 3 seconds
```

### Attendance Marker (`utils/attendance_marker.py`)
```python
min_confidence = 0.70  # 70% minimum to mark
dedup_window_hours = 1  # Don't mark twice in 1 hour
```

### Face Engine (`utils/face_engine.py`)
```python
model_name = "Facenet512"  # Pre-trained model
detector_backend = 'mtcnn'  # Face detector
match_threshold = 0.4  # Similarity threshold (0-1)
```

---

## 📊 API Endpoints

### Student Enrollment
```http
POST /api/v1/students/upload-biometrics
{
  "profile_id": "uuid",
  "student_id": "STUD001",
  "full_name": "John Doe",
  "image": "base64_string"
}
```

### Teacher Approval
```http
POST /api/v1/teacher/approve-biometrics
{
  "pending_id": "uuid"
}
```

### Face Matching (CCTV)
```http
POST /api/v1/attendance/match-face
{
  "image": "base64_string"
}
```

### Get Today's Attendance
```http
GET /api/v1/attendance/today?class_id=class_10a
```

---

## 🎯 Quality Standards

### Photo Requirements
- **Resolution**: Min 640x480, recommended 1280x720
- **Face Size**: Min 100x100 pixels
- **Brightness**: 50-200 (0-255 scale)
- **Sharpness**: Laplacian variance > 100
- **Quality Score**: > 70/100

### Enrollment Requirements
- **Minimum Photos**: 5 per student
- **Recommended**: 7-10 photos
- **Variations**: Different angles, expressions
- **Lighting**: Well-lit, no harsh shadows

---

## 🔍 Troubleshooting

### "No face detected"
- Improve lighting
- Ensure face is visible
- Move closer to camera

### "Face too small"
- Move closer to camera
- Use higher resolution
- Check camera focus

### "Multiple faces detected"
- Ensure only one person in frame
- Clear background

### "Already marked"
- Normal - deduplication working
- Wait 1 hour to mark again

### "Low confidence"
- Re-enroll with better photos
- Improve lighting
- Adjust threshold

---

## 📈 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Accuracy | > 95% | Correct identifications |
| False Positive | < 2% | Wrong identifications |
| Speed | < 500ms | Per frame processing |
| Concurrent | 20-30 | Students in one frame |
| Quality | > 70/100 | Photo quality score |

---

## 🗂️ File Structure

```
backend/
├── main.py                      # FastAPI app
├── cctv_agent.py               # CCTV capture agent
├── utils/
│   ├── face_engine.py          # Face recognition
│   ├── dataset_builder.py      # Photo capture
│   └── attendance_marker.py    # Attendance logic
├── scripts/
│   └── enroll_student.py       # Enrollment CLI
├── dataset/                     # Student photos
│   └── STUD001/
│       ├── photo_1.jpg
│       └── ...
├── supabase_setup.sql          # Base schema
└── database_updates.sql        # Additional tables
```

---

## 🎓 Enrollment Workflow

```
1. Student Registration
   ↓
2. Photo Capture (7 photos)
   - Front face (neutral)
   - Slight left turn
   - Slight right turn
   - Smiling
   - Looking down
   - Looking up
   - Front face (different expression)
   ↓
3. Quality Validation
   - Check face size, brightness, sharpness
   - Overall quality > 70/100
   ↓
4. Embedding Generation
   - Facenet512 creates 512-dim vector
   ↓
5. Save to pending_approvals
   - Awaiting teacher review
   ↓
6. Teacher Approval
   - Review photos in dashboard
   - Approve or reject
   ↓
7. Move to active_embeddings
   - Ready for recognition
```

---

## 📱 Frontend Integration

### Upload Biometrics (Student)
```typescript
const enrollFace = async (imageBase64: string) => {
  const response = await fetch(ENDPOINTS.STUDENTS.UPLOAD_BIOMETRICS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: user.id,
      student_id: user.student_id,
      full_name: user.full_name,
      image: imageBase64
    })
  });
  return response.json();
};
```

### Approve Biometrics (Teacher)
```typescript
const approveBiometrics = async (pendingId: string) => {
  const response = await fetch(ENDPOINTS.TEACHER.APPROVE_BIOMETRICS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pending_id: pendingId })
  });
  return response.json();
};
```

---

## 🔐 Security Checklist

- [ ] Obtain written consent from students/parents
- [ ] Configure HTTPS for production
- [ ] Enable RLS policies in Supabase
- [ ] Encrypt embeddings at rest
- [ ] Set up access control (teachers vs students)
- [ ] Regular security audits
- [ ] Data retention policy
- [ ] GDPR compliance

---

## ✅ Testing Checklist

### Component Testing
- [ ] Dataset builder captures photos
- [ ] Face engine generates embeddings
- [ ] Attendance marker checks deduplication
- [ ] Enrollment script works

### Integration Testing
- [ ] Full enrollment flow (capture → approve)
- [ ] CCTV recognition works
- [ ] Attendance marking works
- [ ] No duplicate entries

### Classroom Testing
- [ ] 10+ students enrolled
- [ ] Camera positioned correctly
- [ ] 90%+ detection rate
- [ ] < 2% false positives

---

## 📞 Support

For issues or questions:
1. Check IMPLEMENTATION_GUIDE.md
2. Review troubleshooting section
3. Check Supabase logs
4. Review backend console output

---

**Last Updated**: 2026-02-04  
**Version**: 1.0.0

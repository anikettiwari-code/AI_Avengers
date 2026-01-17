# AI Avengers - Face Verification Backend

Python FastAPI backend for YOLO-powered face detection and recognition.

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### 5. Run Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/enroll` | Enroll a new face |
| POST | `/api/verify` | Verify a face |
| POST | `/api/detect` | Detect faces in image |
| POST | `/api/scan-classroom` | Scan and identify all students |

## Usage Examples

### Enroll a Face

```bash
curl -X POST "http://localhost:8000/api/enroll" \
  -F "user_id=student123" \
  -F "name=John Doe" \
  -F "role=student" \
  -F "image=@face.jpg"
```

### Verify a Face

```bash
curl -X POST "http://localhost:8000/api/verify" \
  -F "image=@face.jpg"
```

### Scan Classroom

```bash
curl -X POST "http://localhost:8000/api/scan-classroom" \
  -F "image=@classroom.jpg"
```

## Tech Stack

- **FastAPI** - Modern Python web framework
- **YOLOv8** - Face detection (Ultralytics)
- **DeepFace** - Face recognition & embeddings
- **Supabase** - Database for storing face vectors
- **OpenCV** - Image processing

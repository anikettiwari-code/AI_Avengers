"""
AI Avengers - Face Verification Backend
FastAPI Application Entry Point
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

from services.face_service import FaceService
from models.schemas import (
    EnrollRequest, 
    VerifyRequest, 
    EnrollResponse, 
    VerifyResponse,
    HealthResponse
)

load_dotenv()

app = FastAPI(
    title="AI Avengers Face Verification API",
    description="YOLO-powered face detection and recognition for attendance",
    version="1.0.0"
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize face service
face_service = FaceService()


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="AI Avengers Face API is running",
        yolo_loaded=face_service.is_model_loaded()
    )


@app.post("/api/enroll", response_model=EnrollResponse)
async def enroll_face(
    user_id: str,
    name: str,
    role: str,
    image: UploadFile = File(...)
):
    """
    Enroll a new face for a user.
    - Detects face using YOLO
    - Extracts 128-dim embedding using DeepFace
    - Stores in Supabase
    """
    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Process and enroll
        result = await face_service.enroll_face(
            user_id=user_id,
            name=name,
            role=role,
            image_bytes=image_bytes
        )
        
        return EnrollResponse(
            success=True,
            message=f"Face enrolled successfully for {name}",
            user_id=user_id,
            embedding_stored=True
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrollment failed: {str(e)}")


@app.post("/api/verify", response_model=VerifyResponse)
async def verify_face(image: UploadFile = File(...)):
    """
    Verify a face against enrolled users.
    - Detects face using YOLO
    - Extracts embedding
    - Compares against all stored embeddings
    - Returns matched user or failure
    """
    try:
        image_bytes = await image.read()
        
        result = await face_service.verify_face(image_bytes)
        
        if result["matched"]:
            return VerifyResponse(
                matched=True,
                user_id=result["user_id"],
                name=result["name"],
                confidence=result["confidence"],
                message="Face verified successfully"
            )
        else:
            return VerifyResponse(
                matched=False,
                user_id=None,
                name=None,
                confidence=0.0,
                message="No matching face found"
            )
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")


@app.post("/api/detect")
async def detect_faces(image: UploadFile = File(...)):
    """
    Detect all faces in an image (for classroom scanning).
    Returns bounding boxes and count.
    """
    try:
        image_bytes = await image.read()
        faces = await face_service.detect_faces(image_bytes)
        
        return {
            "success": True,
            "face_count": len(faces),
            "faces": faces
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@app.post("/api/scan-classroom")
async def scan_classroom(image: UploadFile = File(...)):
    """
    Scan a classroom image and identify all enrolled students.
    - Detects all faces
    - Matches each against database
    - Returns list of identified students
    """
    try:
        image_bytes = await image.read()
        results = await face_service.scan_classroom(image_bytes)
        
        return {
            "success": True,
            "total_faces": results["total_faces"],
            "identified": results["identified"],
            "unknown": results["unknown"],
            "students": results["students"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classroom scan failed: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
from utils.face_engine import face_engine

app = FastAPI(title="Attendify Hybrid AI Backend")

# Data Models
class BiometricsUploadRequest(BaseModel):
    profile_id: str
    student_id: str
    full_name: str
    image: str  # Base64 string

class ApprovalRequest(BaseModel):
    pending_id: str

class MatchRequest(BaseModel):
    image: str  # Base64 string

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Attendify Hybrid AI Backend", "status": "online"}

@app.post("/api/v1/students/upload-biometrics")
async def upload_biometrics(request: BiometricsUploadRequest):
    result = face_engine.upload_biometrics(
        request.profile_id, 
        request.student_id, 
        request.full_name, 
        request.image
    )
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    if result:
        return {"status": "success", "message": "Biometrics uploaded and pending approval"}
    raise HTTPException(status_code=400, detail="Failed to upload biometrics. face not detected.")

@app.post("/api/v1/teacher/approve-biometrics")
async def approve_biometrics(request: ApprovalRequest):
    success = face_engine.approve_student(request.pending_id)
    if success:
        return {"status": "success", "message": "Student biometrics approved"}
    raise HTTPException(status_code=400, detail="Approval failed")

@app.post("/api/v1/attendance/match-face")
async def match_face(request: MatchRequest):
    match = face_engine.recognize_from_frame(request.image)
    if match:
        return {"status": "success", "match": match}
    return {"status": "not_found", "message": "No matching student discovered"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

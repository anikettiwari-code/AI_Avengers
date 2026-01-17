"""
Pydantic schemas for API requests and responses
"""

from pydantic import BaseModel
from typing import Optional, List


class EnrollRequest(BaseModel):
    user_id: str
    name: str
    role: str  # 'student', 'teacher', 'admin'


class EnrollResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    embedding_stored: bool


class VerifyRequest(BaseModel):
    pass  # Image is sent as file upload


class VerifyResponse(BaseModel):
    matched: bool
    user_id: Optional[str]
    name: Optional[str]
    confidence: float
    message: str


class FaceDetection(BaseModel):
    x: int
    y: int
    width: int
    height: int
    confidence: float


class StudentMatch(BaseModel):
    user_id: str
    name: str
    confidence: float
    box: FaceDetection


class ClassroomScanResponse(BaseModel):
    total_faces: int
    identified: int
    unknown: int
    students: List[StudentMatch]


class HealthResponse(BaseModel):
    status: str
    message: str
    yolo_loaded: bool

"""
Face Service - YOLO Detection + DeepFace Recognition
Handles face enrollment, verification, and classroom scanning
"""

import os
import io
import numpy as np
from typing import List, Dict, Any, Optional
from PIL import Image
import cv2
from dotenv import load_dotenv

# Lazy imports for heavy libraries
_yolo_model = None
_deepface = None
_supabase_client = None

load_dotenv()

FACE_DISTANCE_THRESHOLD = float(os.getenv("FACE_DISTANCE_THRESHOLD", "0.6"))
YOLO_CONFIDENCE = float(os.getenv("YOLO_CONFIDENCE_THRESHOLD", "0.5"))


def get_yolo_model():
    """Lazy load YOLO model"""
    global _yolo_model
    if _yolo_model is None:
        from ultralytics import YOLO
        # Use YOLOv8n-face or fall back to standard yolov8n
        try:
            _yolo_model = YOLO('yolov8n-face.pt')
        except:
            # Fallback to standard YOLO (detect person, then crop face region)
            _yolo_model = YOLO('yolov8n.pt')
        print("✅ YOLO model loaded")
    return _yolo_model


def get_deepface():
    """Lazy load DeepFace"""
    global _deepface
    if _deepface is None:
        from deepface import DeepFace
        _deepface = DeepFace
        print("✅ DeepFace loaded")
    return _deepface


def get_supabase():
    """Lazy load Supabase client"""
    global _supabase_client
    if _supabase_client is None:
        from supabase import create_client
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("Supabase credentials not found in environment")
        _supabase_client = create_client(url, key)
        print("✅ Supabase client initialized")
    return _supabase_client


class FaceService:
    """
    Face verification service using YOLO + DeepFace
    """
    
    def __init__(self):
        self._model_loaded = False
        
    def is_model_loaded(self) -> bool:
        return self._model_loaded
    
    def _load_models(self):
        """Ensure models are loaded"""
        if not self._model_loaded:
            get_yolo_model()
            get_deepface()
            self._model_loaded = True
    
    def _bytes_to_cv2(self, image_bytes: bytes) -> np.ndarray:
        """Convert image bytes to OpenCV format"""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image")
        return img
    
    def _bytes_to_pil(self, image_bytes: bytes) -> Image.Image:
        """Convert image bytes to PIL Image"""
        return Image.open(io.BytesIO(image_bytes))
    
    def _detect_faces_yolo(self, img: np.ndarray) -> List[Dict]:
        """
        Detect faces using YOLO
        Returns list of face bounding boxes
        """
        model = get_yolo_model()
        results = model(img, verbose=False)
        
        faces = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                conf = float(box.conf[0])
                if conf >= YOLO_CONFIDENCE:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    faces.append({
                        "x": x1,
                        "y": y1,
                        "width": x2 - x1,
                        "height": y2 - y1,
                        "confidence": conf
                    })
        
        return faces
    
    def _extract_embedding(self, img: np.ndarray) -> Optional[List[float]]:
        """
        Extract face embedding using DeepFace
        Returns 128-dim embedding vector
        """
        DeepFace = get_deepface()
        
        try:
            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Get embedding
            embedding_objs = DeepFace.represent(
                img_path=img_rgb,
                model_name="Facenet",  # 128-dim embeddings
                enforce_detection=False,
                detector_backend="skip"  # We already detected with YOLO
            )
            
            if embedding_objs and len(embedding_objs) > 0:
                return embedding_objs[0]["embedding"]
            
        except Exception as e:
            print(f"Embedding extraction error: {e}")
            
        return None
    
    def _calculate_distance(self, emb1: List[float], emb2: List[float]) -> float:
        """Calculate Euclidean distance between embeddings"""
        arr1 = np.array(emb1)
        arr2 = np.array(emb2)
        return float(np.linalg.norm(arr1 - arr2))
    
    async def enroll_face(
        self, 
        user_id: str, 
        name: str, 
        role: str,
        image_bytes: bytes
    ) -> Dict[str, Any]:
        """
        Enroll a user's face
        1. Detect face with YOLO
        2. Extract embedding with DeepFace
        3. Store in Supabase
        """
        self._load_models()
        
        # Convert image
        img = self._bytes_to_cv2(image_bytes)
        
        # Detect faces
        faces = self._detect_faces_yolo(img)
        
        if len(faces) == 0:
            raise ValueError("No face detected in image")
        
        if len(faces) > 1:
            raise ValueError("Multiple faces detected. Please upload image with single face.")
        
        # Crop face region
        face = faces[0]
        x, y, w, h = face["x"], face["y"], face["width"], face["height"]
        
        # Add padding
        pad = int(max(w, h) * 0.2)
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img.shape[1], x + w + pad)
        y2 = min(img.shape[0], y + h + pad)
        
        face_crop = img[y1:y2, x1:x2]
        
        # Extract embedding
        embedding = self._extract_embedding(face_crop)
        
        if embedding is None:
            raise ValueError("Could not extract face embedding")
        
        # Store in Supabase
        supabase = get_supabase()
        
        # Check if user exists
        existing = supabase.table("face_encodings").select("id").eq("user_id", user_id).execute()
        
        if existing.data:
            # Update existing
            supabase.table("face_encodings").update({
                "descriptor": embedding
            }).eq("user_id", user_id).execute()
        else:
            # Insert new
            supabase.table("face_encodings").insert({
                "user_id": user_id,
                "descriptor": embedding
            }).execute()
        
        return {
            "success": True,
            "user_id": user_id,
            "embedding_size": len(embedding)
        }
    
    async def verify_face(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Verify a face against all enrolled users
        Returns matched user or failure
        """
        self._load_models()
        
        # Convert image
        img = self._bytes_to_cv2(image_bytes)
        
        # Detect face
        faces = self._detect_faces_yolo(img)
        
        if len(faces) == 0:
            raise ValueError("No face detected")
        
        # Use largest face if multiple
        largest_face = max(faces, key=lambda f: f["width"] * f["height"])
        
        # Crop and extract embedding
        x, y, w, h = largest_face["x"], largest_face["y"], largest_face["width"], largest_face["height"]
        pad = int(max(w, h) * 0.2)
        x1, y1 = max(0, x - pad), max(0, y - pad)
        x2, y2 = min(img.shape[1], x + w + pad), min(img.shape[0], y + h + pad)
        
        face_crop = img[y1:y2, x1:x2]
        query_embedding = self._extract_embedding(face_crop)
        
        if query_embedding is None:
            raise ValueError("Could not extract face embedding")
        
        # Fetch all enrolled faces from Supabase
        supabase = get_supabase()
        result = supabase.table("face_encodings").select(
            "user_id, descriptor, profiles(name)"
        ).execute()
        
        if not result.data:
            return {"matched": False, "message": "No enrolled faces in database"}
        
        # Find best match
        best_match = None
        best_distance = float("inf")
        
        for record in result.data:
            stored_embedding = record["descriptor"]
            
            # Handle if stored as JSON string
            if isinstance(stored_embedding, str):
                import json
                stored_embedding = json.loads(stored_embedding)
            
            distance = self._calculate_distance(query_embedding, stored_embedding)
            
            if distance < best_distance:
                best_distance = distance
                best_match = record
        
        # Check if match is good enough
        if best_distance < FACE_DISTANCE_THRESHOLD:
            confidence = max(0, min(1, 1 - (best_distance / FACE_DISTANCE_THRESHOLD)))
            name = best_match.get("profiles", {}).get("name") if best_match.get("profiles") else None
            
            return {
                "matched": True,
                "user_id": best_match["user_id"],
                "name": name,
                "confidence": round(confidence * 100, 2),
                "distance": round(best_distance, 4)
            }
        
        return {"matched": False, "confidence": 0}
    
    async def detect_faces(self, image_bytes: bytes) -> List[Dict]:
        """Detect all faces in an image"""
        self._load_models()
        img = self._bytes_to_cv2(image_bytes)
        return self._detect_faces_yolo(img)
    
    async def scan_classroom(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Scan a classroom image and identify all students
        """
        self._load_models()
        
        img = self._bytes_to_cv2(image_bytes)
        faces = self._detect_faces_yolo(img)
        
        if len(faces) == 0:
            return {
                "total_faces": 0,
                "identified": 0,
                "unknown": 0,
                "students": []
            }
        
        # Fetch all enrolled faces
        supabase = get_supabase()
        enrolled = supabase.table("face_encodings").select(
            "user_id, descriptor, profiles(name)"
        ).execute()
        
        enrolled_data = enrolled.data if enrolled.data else []
        
        identified_students = []
        unknown_count = 0
        
        for face in faces:
            x, y, w, h = face["x"], face["y"], face["width"], face["height"]
            
            # Crop face
            pad = int(max(w, h) * 0.2)
            x1, y1 = max(0, x - pad), max(0, y - pad)
            x2, y2 = min(img.shape[1], x + w + pad), min(img.shape[0], y + h + pad)
            
            face_crop = img[y1:y2, x1:x2]
            embedding = self._extract_embedding(face_crop)
            
            if embedding is None:
                unknown_count += 1
                continue
            
            # Find match
            best_match = None
            best_distance = float("inf")
            
            for record in enrolled_data:
                stored_embedding = record["descriptor"]
                if isinstance(stored_embedding, str):
                    import json
                    stored_embedding = json.loads(stored_embedding)
                
                distance = self._calculate_distance(embedding, stored_embedding)
                if distance < best_distance:
                    best_distance = distance
                    best_match = record
            
            if best_distance < FACE_DISTANCE_THRESHOLD:
                name = best_match.get("profiles", {}).get("name") if best_match.get("profiles") else None
                confidence = max(0, min(1, 1 - (best_distance / FACE_DISTANCE_THRESHOLD)))
                
                identified_students.append({
                    "user_id": best_match["user_id"],
                    "name": name,
                    "confidence": round(confidence * 100, 2),
                    "box": face
                })
            else:
                unknown_count += 1
        
        return {
            "total_faces": len(faces),
            "identified": len(identified_students),
            "unknown": unknown_count,
            "students": identified_students
        }

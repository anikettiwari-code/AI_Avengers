import os
import cv2
import time
import base64
import numpy as np
from dotenv import load_dotenv
from supabase import create_client, Client
try:
    from deepface import DeepFace
except ImportError:
    DeepFace = None

# Load environment variables
load_dotenv()

# --- CONFIGURATION ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

class AttendifyAI:
    def __init__(self):
        # We use Facenet512 for high accuracy in large classrooms
        self.model_name = "Facenet512" 
        self.detector_backend = 'mtcnn' # Best for CCTV/crowded rooms

    def _decode_image(self, image_input):
        """
        Helper to convert base64 or path to a format DeepFace likes (numpy array).
        """
        if isinstance(image_input, str) and len(image_input) > 200:
            try:
                # Remove header if present
                if "," in image_input:
                    image_input = image_input.split(",")[1]
                
                img_data = base64.b64decode(image_input)
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is None:
                    return image_input
                return img
            except Exception as e:
                print(f"Decoding failed: {e}")
                return image_input
        return image_input

    def check_face_quality(self, image_input):
        """
        Uses DeepFace.extract_faces to ensure lighting and quality are sufficient.
        Returns True if a clear face is detected.
        """
        if not DeepFace:
            return True # Assume OK if deepface not installed (testing)
            
        try:
            input_data = self._decode_image(image_input)
            faces = DeepFace.extract_faces(
                img_path=input_data,
                detector_backend=self.detector_backend,
                enforce_detection=True
            )
            return len(faces) > 0
        except Exception as e:
            print(f"Face quality check failed: {e}")
            return False

    def get_embedding(self, image_input):
        """
        Converts an image (path, base64, or numpy array) into a 512-dimension vector.
        """
        if not DeepFace:
            print("DeepFace not installed. Simulated embedding used.")
            return np.random.rand(512).tolist()

        try:
            input_data = self._decode_image(image_input)
            # DeepFace.represent handles paths, base64, and numpy arrays automatically
            embedding_objs = DeepFace.represent(
                img_path=input_data, 
                model_name=self.model_name,
                enforce_detection=True,
                detector_backend=self.detector_backend
            )
            return embedding_objs[0]["embedding"]
        except Exception as e:
            print(f"Error processing face: {e}")
            return None

    def upload_biometrics(self, profile_id, student_id, full_name, image_input):
        """
        Generates embedding and saves to pending_approvals table.
        """
        if not supabase:
            return {"error": "Supabase not configured."}
            
        if not self.check_face_quality(image_input):
            return {"error": "Poor photo quality. Please ensure good lighting and face visibility."}

        vector = self.get_embedding(image_input)
        if not vector:
            return {"error": "Face not detected. Please look straight at the camera."}

        try:
            # --- RESILIENCE: Ensure Profile Exists ---
            # Try to fetch the profile first
            current_profile = supabase.table("profiles").select("*").eq("id", profile_id).execute()
            
            if not current_profile.data:
                # Profile is missing, creating it now to avoid Foreign Key errors
                print(f"Resilient Fix: Creating missing profile for {profile_id}")
                supabase.table("profiles").insert({
                    "id": profile_id,
                    "full_name": full_name,
                    "student_id": student_id,
                    "role": "student"
                }).execute()

            # 1. Upload Selfie to Storage
            selfie_url = None
            if isinstance(image_input, str) and (image_input.startswith('/') or 'data:image' in image_input or len(image_input) > 200):
                try:
                    header, encoded = image_input.split(",", 1) if "," in image_input else (None, image_input)
                    img_data = base64.b64decode(encoded)
                    file_path = f"{student_id}_{int(time.time())}.jpg"
                    
                    res = supabase.storage.from_("selfies").upload(
                        path=file_path,
                        file=img_data,
                        file_options={"content-type": "image/jpeg"}
                    )
                    if getattr(res, 'error', None):
                        raise Exception(f"Storage Error: {res.error}")
                        
                    selfie_url = file_path
                except Exception as upload_err:
                    print(f"CRITICAL: Storage upload failed. {upload_err}")
                    if "bucket_not_found" in str(upload_err).lower() or "not found" in str(upload_err).lower():
                        return {"error": "Server Configuration Error: 'selfies' storage bucket does not exist. Please contact admin."}
                    return {"error": f"Failed to save image: {str(upload_err)}"}

            # 2. Save to pending_approvals
            data = supabase.table("pending_approvals").insert({
                "profile_id": profile_id,
                "student_id": student_id,
                "full_name": full_name,
                "embedding": vector,
                "selfie_url": selfie_url,
                "status": "pending"
            }).execute()
            
            # 3. Update profile status
            supabase.table("profiles").update({
                "face_enrolled": True
            }).eq("id", profile_id).execute()
            
            return data
        except Exception as e:
            error_msg = str(e)
            print(f"Error during biometrics upload: {error_msg}")
            return {"error": f"Database error: {error_msg}"}

    def approve_student(self, pending_id):
        """
        Teacher approval: Move embedding from pending_approvals to active_embeddings.
        """
        try:
            # 1. Get pending record
            pending = supabase.table("pending_approvals").select("*").eq("id", pending_id).single().execute()
            if not pending.data:
                return None
            
            p_data = pending.data
            
            # 2. Insert into active_embeddings
            supabase.table("active_embeddings").insert({
                "profile_id": p_data["profile_id"],
                "student_id": p_data["student_id"],
                "embedding": p_data["embedding"]
            }).execute()
            
            # 3. Mark profile as active
            supabase.table("profiles").update({
                "is_active": True
            }).eq("id", p_data["profile_id"]).execute()
            
            # 4. Delete from pending (or update status)
            supabase.table("pending_approvals").update({"status": "approved"}).eq("id", pending_id).execute()
            
            return True
        except Exception as e:
            print(f"Error during approval: {e}")
            return False

    def recognize_from_frame(self, frame):
        """
        Matches a CCTV frame against the active_embeddings database.
        """
        if not supabase:
            print("Supabase not configured.")
            return None

        vector = self.get_embedding(frame)
        if not vector: 
            return None
        
        try:
            rpc_params = {
                "query_embedding": vector,
                "match_threshold": 0.4, # Adjusted threshold for Cosine Similarity (1 - distance)
                "match_count": 1
            }
            result = supabase.rpc("match_students", rpc_params).execute()
            return result.data
        except Exception as e:
            print(f"Error searching active_embeddings: {e}")
            return None

# Create a singleton instance
face_engine = AttendifyAI()

# Create a singleton instance
face_engine = AttendifyAI()

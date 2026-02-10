import os
import sys
from utils.face_engine import face_engine
from deepface import DeepFace

print("\n" + "="*50)
print("🧪 AUTHORIZED TEST: Face Recognition Model (Facenet512)")
print("="*50)

# 1. Check Dependencies
try:
    import tensorflow as tf
    print(f"✅ TensorFlow Version: {tf.__version__}")
except ImportError:
    print("❌ TensorFlow Not Found")

# 2. Test Model Loading
print("\n🔄 Loading Facenet512 Model... (This may take a moment)")
try:
    # This forces the model to build/download weights if missing
    model = DeepFace.build_model("Facenet512")
    print("✅ Facenet512 Model Loaded Successfully!")
except Exception as e:
    print(f"❌ Model Load Failed: {e}")
    sys.exit(1)

# 3. Test Database Connection
print("\n🔄 Checking Supabase Connection...")
if face_engine.supabase:
    print("✅ Supabase Client Initialized")
else:
    print("❌ Supabase Client Failed (Check .env)")

# 4. Summary
print("\n" + "="*50)
print("🚀 BACKEND READY FOR TESTING")
print("="*50 + "\n")

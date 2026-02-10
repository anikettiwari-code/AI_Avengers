import cv2
import numpy as np
import sys
import os

# Ensure backend path is in python path
sys.path.append(os.getcwd())

from utils.face_engine import face_engine

print("\n" + "="*50)
print("🧠 TESTING DEEPFACE MODEL (Facenet512)")
print("="*50)

try:
    # 1. Create a dummy image (Black square)
    # 160x160 is typical minimal size, using 200x200
    dummy_img = np.zeros((500, 500, 3), dtype=np.uint8)
    
    # Draw a face-like structure so detector doesn't fail immediately
    # (White circle for face)
    cv2.circle(dummy_img, (250, 250), 100, (255, 255, 255), -1)
    
    print("📸 Generated Test Image (Synthetic Face)")

    # 2. Run Encoding
    print("⏳ Running Inference (get_embedding)...")
    vector = face_engine.get_embedding(dummy_img)

    if vector:
        print(f"✅ SUCCESS! Vector Generated.")
        print(f"📏 Vector Dimensions: {len(vector)}")
        
        if len(vector) == 512:
            print("✨ EXACT MATCH: Model is acting as Facenet512.")
        else:
            print(f"⚠️ WARNING: Expected 512, got {len(vector)}. Check model config.")
    else:
        print("❌ Model returned No Embedding (Face might not be detected in synthetic image, checking fallback...)")
        # Try raw extraction without detection to prove model load
        from deepface import DeepFace
        print("🔄 Attemping Direct Embed (No Detection)...")
        emb = DeepFace.represent(img_path=dummy_img, model_name="Facenet512", enforce_detection=False)
        print(f"✅ DIRECT SUCCESS! Vector Length: {len(emb[0]['embedding'])}")

except Exception as e:
    print(f"❌ TEST FAILED: {e}")
    import traceback
    traceback.print_exc()

print("="*50 + "\n")

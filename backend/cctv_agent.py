import cv2
import requests
import base64
import time
import os

# Configuration
API_URL = "http://localhost:8000/api/v1/attendance/match-face"
# Use 0 for built-in webcam, or an RTSP/HTTP URL for a phone camera
CAMERA_SOURCE = 0 
RECOGNITION_INTERVAL = 3 # seconds

def encode_image(frame):
    _, buffer = cv2.imencode('.jpg', frame)
    return base64.b64encode(buffer).decode('utf-8')

def run_cctv_agent():
    print(f"Starting CCTV Agent from source: {CAMERA_SOURCE}")
    cap = cv2.VideoCapture(CAMERA_SOURCE)
    
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return

    last_check = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame.")
                break

            current_time = time.time()
            
            # Show the live feed
            display_frame = frame.copy()
            cv2.putText(display_frame, "Attendify CCTV Mode", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Periodically send frames for recognition
            if current_time - last_check >= RECOGNITION_INTERVAL:
                last_check = current_time
                print("Checking for faces...")
                
                try:
                    img_b64 = encode_image(frame)
                    response = requests.post(API_URL, json={"image": img_b64})
                    
                    if response.status_code == 200:
                        data = response.json()
                        if data["status"] == "success":
                            match = data["match"][0]
                            student_id = match["student_id"]
                            similarity = match["similarity"]
                            print(f"MATCH FOUND: Student {student_id} ({similarity:.2f})")
                            
                            # Draw overlay on the display frame
                            cv2.putText(display_frame, f"MATCH: {student_id}", (10, 70), 
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
                        else:
                            print("No match found.")
                    else:
                        print(f"API Error: {response.status_code}")
                except Exception as e:
                    print(f"Connection Error: {e}")

            cv2.imshow('Attendify Simulated CCTV', display_frame)

            # Exit on 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("CCTV Agent stopped.")

if __name__ == "__main__":
    run_cctv_agent()

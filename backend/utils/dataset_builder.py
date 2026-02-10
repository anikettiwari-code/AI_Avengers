"""
Dataset Builder for Student Enrollment
Captures multiple high-quality photos for face recognition training
"""

import cv2
import os
import time
import numpy as np
from pathlib import Path
from typing import Optional, List, Tuple
try:
    from deepface import DeepFace
except ImportError:
    DeepFace = None

class DatasetBuilder:
    def __init__(self, dataset_root: str = "dataset"):
        """
        Initialize dataset builder
        
        Args:
            dataset_root: Root directory to store student photos
        """
        self.dataset_root = Path(dataset_root)
        self.dataset_root.mkdir(exist_ok=True)
        
        # Quality thresholds
        self.min_face_size = 100  # Minimum face dimension in pixels
        self.min_brightness = 50  # Minimum average brightness
        self.max_brightness = 200  # Maximum average brightness
        self.min_quality_score = 70  # Minimum overall quality score (0-100)
        
    def check_photo_quality(self, frame: np.ndarray) -> Tuple[bool, float, str]:
        """
        Check if photo meets quality standards
        
        Returns:
            (is_good_quality, quality_score, feedback_message)
        """
        try:
            # Detect face using MTCNN
            if DeepFace:
                faces = DeepFace.extract_faces(
                    img_path=frame,
                    detector_backend='mtcnn',
                    enforce_detection=False
                )
            else:
                # Fallback to OpenCV Haar Cascade
                face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                detected = face_cascade.detectMultiScale(gray, 1.1, 4)
                faces = [{'facial_area': {'x': x, 'y': y, 'w': w, 'h': h}} 
                        for (x, y, w, h) in detected]
            
            if not faces or len(faces) == 0:
                return False, 0, "No face detected"
            
            if len(faces) > 1:
                return False, 0, "Multiple faces detected - only one person should be in frame"
            
            face = faces[0]
            facial_area = face.get('facial_area', {})
            
            # Check face size
            face_width = facial_area.get('w', 0)
            face_height = facial_area.get('h', 0)
            face_size = min(face_width, face_height)
            
            if face_size < self.min_face_size:
                return False, 30, f"Face too small ({face_size}px) - move closer to camera"
            
            # Extract face region
            x, y, w, h = (facial_area.get('x', 0), facial_area.get('y', 0), 
                         facial_area.get('w', 0), facial_area.get('h', 0))
            face_region = frame[y:y+h, x:x+w]
            
            # Check brightness
            gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray_face)
            
            if brightness < self.min_brightness:
                return False, 40, "Too dark - improve lighting"
            if brightness > self.max_brightness:
                return False, 40, "Too bright - reduce lighting"
            
            # Check blur (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
            
            if laplacian_var < 100:
                return False, 50, "Image too blurry - hold still"
            
            # Calculate overall quality score
            size_score = min(100, (face_size / 200) * 100)
            brightness_score = 100 - abs(brightness - 127) / 127 * 100
            sharpness_score = min(100, (laplacian_var / 500) * 100)
            
            quality_score = (size_score * 0.4 + brightness_score * 0.3 + sharpness_score * 0.3)
            
            if quality_score >= self.min_quality_score:
                return True, quality_score, "Good quality!"
            else:
                return False, quality_score, f"Quality too low ({quality_score:.0f}/100)"
                
        except Exception as e:
            return False, 0, f"Error: {str(e)}"
    
    def capture_student_photos(
        self, 
        student_id: str, 
        student_name: str, 
        num_photos: int = 7,
        camera_source: int = 0
    ) -> List[str]:
        """
        Capture multiple photos for a student
        
        Args:
            student_id: Unique student ID
            student_name: Full name of student
            num_photos: Number of photos to capture (default: 7)
            camera_source: Camera index (0 for default webcam)
            
        Returns:
            List of saved photo paths
        """
        # Create student directory
        student_dir = self.dataset_root / student_id
        student_dir.mkdir(exist_ok=True)
        
        # Open camera
        cap = cv2.VideoCapture(camera_source)
        if not cap.isOpened():
            raise Exception("Could not open camera")
        
        # Set camera resolution
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        saved_photos = []
        photo_count = 0
        
        # Instructions for different poses
        instructions = [
            "Look straight at camera (neutral expression)",
            "Turn slightly to the left",
            "Turn slightly to the right",
            "Smile naturally",
            "Look down slightly",
            "Look up slightly",
            "Front face again (different expression)"
        ]
        
        print(f"\n{'='*60}")
        print(f"Enrolling: {student_name} ({student_id})")
        print(f"{'='*60}")
        print(f"Will capture {num_photos} photos")
        print("Press SPACE when ready for each photo")
        print("Press 'q' to quit\n")
        
        current_instruction_idx = 0
        last_capture_time = 0
        min_capture_interval = 2  # Minimum 2 seconds between captures
        
        try:
            while photo_count < num_photos:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to grab frame")
                    break
                
                # Create display frame
                display_frame = frame.copy()
                h, w = display_frame.shape[:2]
                
                # Check quality
                is_good, quality_score, feedback = self.check_photo_quality(frame)
                
                # Draw instruction box
                instruction = instructions[min(current_instruction_idx, len(instructions)-1)]
                cv2.rectangle(display_frame, (10, 10), (w-10, 120), (0, 0, 0), -1)
                cv2.rectangle(display_frame, (10, 10), (w-10, 120), (0, 255, 0) if is_good else (0, 165, 255), 2)
                
                # Display text
                cv2.putText(display_frame, f"Student: {student_name}", (20, 35), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
                cv2.putText(display_frame, f"Photo {photo_count + 1}/{num_photos}: {instruction}", 
                           (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                cv2.putText(display_frame, f"Quality: {quality_score:.0f}/100 - {feedback}", 
                           (20, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 
                           (0, 255, 0) if is_good else (0, 165, 255), 2)
                
                # Draw quality indicator
                indicator_color = (0, 255, 0) if is_good else (0, 165, 255)
                cv2.circle(display_frame, (w - 40, 40), 20, indicator_color, -1)
                
                # Auto-capture if quality is excellent (>85) and enough time has passed
                current_time = time.time()
                if is_good and quality_score > 85 and (current_time - last_capture_time) > min_capture_interval:
                    # Save photo
                    photo_filename = f"photo_{photo_count + 1}_{int(time.time())}.jpg"
                    photo_path = student_dir / photo_filename
                    cv2.imwrite(str(photo_path), frame)
                    saved_photos.append(str(photo_path))
                    
                    print(f"✓ Captured photo {photo_count + 1}/{num_photos} - Quality: {quality_score:.0f}/100")
                    
                    photo_count += 1
                    current_instruction_idx += 1
                    last_capture_time = current_time
                    
                    # Flash effect
                    flash = np.ones_like(display_frame) * 255
                    cv2.addWeighted(display_frame, 0.5, flash, 0.5, 0, display_frame)
                
                cv2.imshow('Attendify - Student Enrollment', display_frame)
                
                # Handle key press
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("\nEnrollment cancelled by user")
                    break
                elif key == ord(' ') and is_good:
                    # Manual capture with spacebar
                    photo_filename = f"photo_{photo_count + 1}_{int(time.time())}.jpg"
                    photo_path = student_dir / photo_filename
                    cv2.imwrite(str(photo_path), frame)
                    saved_photos.append(str(photo_path))
                    
                    print(f"✓ Captured photo {photo_count + 1}/{num_photos} - Quality: {quality_score:.0f}/100")
                    
                    photo_count += 1
                    current_instruction_idx += 1
                    last_capture_time = current_time
        
        finally:
            cap.release()
            cv2.destroyAllWindows()
        
        print(f"\n{'='*60}")
        print(f"Enrollment complete! Saved {len(saved_photos)} photos")
        print(f"Location: {student_dir}")
        print(f"{'='*60}\n")
        
        return saved_photos
    
    def validate_dataset(self, student_id: str) -> dict:
        """
        Validate that a student's dataset meets requirements
        
        Returns:
            Dictionary with validation results
        """
        student_dir = self.dataset_root / student_id
        
        if not student_dir.exists():
            return {
                "valid": False,
                "error": "Student directory not found"
            }
        
        photos = list(student_dir.glob("*.jpg")) + list(student_dir.glob("*.png"))
        
        if len(photos) < 5:
            return {
                "valid": False,
                "error": f"Insufficient photos ({len(photos)}/5 minimum)"
            }
        
        # Check quality of each photo
        quality_scores = []
        for photo_path in photos:
            frame = cv2.imread(str(photo_path))
            is_good, score, _ = self.check_photo_quality(frame)
            quality_scores.append(score)
        
        avg_quality = np.mean(quality_scores)
        
        return {
            "valid": avg_quality >= 70,
            "num_photos": len(photos),
            "avg_quality": avg_quality,
            "quality_scores": quality_scores
        }


if __name__ == "__main__":
    # Test the dataset builder
    builder = DatasetBuilder()
    
    # Example usage
    print("Dataset Builder Test")
    print("This will capture 7 photos for a test student")
    
    student_id = input("Enter student ID (e.g., STUD001): ").strip()
    student_name = input("Enter student name: ").strip()
    
    if student_id and student_name:
        photos = builder.capture_student_photos(student_id, student_name, num_photos=7)
        
        # Validate
        validation = builder.validate_dataset(student_id)
        print(f"\nValidation Results: {validation}")

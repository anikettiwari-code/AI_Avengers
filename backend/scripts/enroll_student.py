"""
Student Enrollment Script
CLI tool for enrolling students into the face recognition system
"""

import argparse
import csv
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from utils.dataset_builder import DatasetBuilder
from utils.face_engine import face_engine
from dotenv import load_dotenv

load_dotenv()

class StudentEnroller:
    def __init__(self):
        self.builder = DatasetBuilder()
        
    def enroll_single_student(
        self, 
        student_id: str, 
        full_name: str, 
        num_photos: int = 7,
        camera_source: int = 0
    ) -> bool:
        """
        Enroll a single student
        
        Args:
            student_id: Unique student ID
            full_name: Full name of student
            num_photos: Number of photos to capture
            camera_source: Camera index
            
        Returns:
            True if successful, False otherwise
        """
        try:
            print(f"\n{'='*70}")
            print(f"ENROLLING STUDENT")
            print(f"{'='*70}")
            print(f"Student ID: {student_id}")
            print(f"Name: {full_name}")
            print(f"Photos to capture: {num_photos}")
            print(f"{'='*70}\n")
            
            # Capture photos
            photos = self.builder.capture_student_photos(
                student_id=student_id,
                student_name=full_name,
                num_photos=num_photos,
                camera_source=camera_source
            )
            
            if not photos or len(photos) < 5:
                print(f"❌ Failed: Not enough photos captured ({len(photos)}/5 minimum)")
                return False
            
            # Validate dataset
            validation = self.builder.validate_dataset(student_id)
            
            if not validation['valid']:
                print(f"❌ Failed: {validation.get('error', 'Unknown error')}")
                return False
            
            print(f"\n✓ Photos captured successfully!")
            print(f"  - Total photos: {validation['num_photos']}")
            print(f"  - Average quality: {validation['avg_quality']:.1f}/100")
            
            # Generate embeddings and upload to database
            print(f"\n📊 Generating face embeddings...")
            
            # Use the first (best quality) photo for embedding
            best_photo_idx = validation['quality_scores'].index(max(validation['quality_scores']))
            best_photo_path = photos[best_photo_idx]
            
            # For now, we'll use a dummy profile_id
            # In production, this should come from the authentication system
            profile_id = f"profile_{student_id}"
            
            # Upload biometrics
            result = face_engine.upload_biometrics(
                profile_id=profile_id,
                student_id=student_id,
                full_name=full_name,
                image_input=best_photo_path
            )
            
            if isinstance(result, dict) and "error" in result:
                print(f"❌ Failed to upload biometrics: {result['error']}")
                return False
            
            print(f"\n{'='*70}")
            print(f"✅ ENROLLMENT SUCCESSFUL!")
            print(f"{'='*70}")
            print(f"Student: {full_name} ({student_id})")
            print(f"Status: Pending teacher approval")
            print(f"Photos saved: {len(photos)}")
            print(f"{'='*70}\n")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error during enrollment: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def enroll_from_csv(self, csv_path: str, camera_source: int = 0) -> dict:
        """
        Enroll multiple students from a CSV file
        
        CSV Format:
        student_id,full_name,class,division
        STUD001,John Doe,10,A
        STUD002,Jane Smith,10,A
        
        Args:
            csv_path: Path to CSV file
            camera_source: Camera index
            
        Returns:
            Dictionary with enrollment results
        """
        if not os.path.exists(csv_path):
            print(f"❌ CSV file not found: {csv_path}")
            return {"success": 0, "failed": 0, "total": 0}
        
        results = {
            "success": 0,
            "failed": 0,
            "total": 0,
            "failed_students": []
        }
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                students = list(reader)
                
                results["total"] = len(students)
                
                print(f"\n{'='*70}")
                print(f"BATCH ENROLLMENT")
                print(f"{'='*70}")
                print(f"Total students to enroll: {len(students)}")
                print(f"{'='*70}\n")
                
                for idx, student in enumerate(students, 1):
                    student_id = student.get('student_id', '').strip()
                    full_name = student.get('full_name', '').strip()
                    
                    if not student_id or not full_name:
                        print(f"⚠️  Skipping row {idx}: Missing student_id or full_name")
                        results["failed"] += 1
                        results["failed_students"].append(student_id or f"Row {idx}")
                        continue
                    
                    print(f"\n[{idx}/{len(students)}] Enrolling: {full_name} ({student_id})")
                    print("-" * 70)
                    
                    input(f"Press ENTER when {full_name} is ready in front of camera (or Ctrl+C to skip)...")
                    
                    success = self.enroll_single_student(
                        student_id=student_id,
                        full_name=full_name,
                        camera_source=camera_source
                    )
                    
                    if success:
                        results["success"] += 1
                    else:
                        results["failed"] += 1
                        results["failed_students"].append(student_id)
                
                # Print summary
                print(f"\n{'='*70}")
                print(f"BATCH ENROLLMENT COMPLETE")
                print(f"{'='*70}")
                print(f"Total: {results['total']}")
                print(f"✅ Successful: {results['success']}")
                print(f"❌ Failed: {results['failed']}")
                
                if results["failed_students"]:
                    print(f"\nFailed students:")
                    for student_id in results["failed_students"]:
                        print(f"  - {student_id}")
                
                print(f"{'='*70}\n")
                
        except KeyboardInterrupt:
            print("\n\n⚠️  Batch enrollment interrupted by user")
        except Exception as e:
            print(f"\n❌ Error reading CSV: {str(e)}")
        
        return results


def main():
    parser = argparse.ArgumentParser(
        description='Enroll students into Attendify face recognition system',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Enroll single student
  python enroll_student.py --student-id STUD001 --name "John Doe"
  
  # Enroll with custom number of photos
  python enroll_student.py --student-id STUD001 --name "John Doe" --photos 10
  
  # Batch enrollment from CSV
  python enroll_student.py --csv students.csv
  
  # Use external camera
  python enroll_student.py --student-id STUD001 --name "John Doe" --camera 1

CSV Format:
  student_id,full_name,class,division
  STUD001,John Doe,10,A
  STUD002,Jane Smith,10,A
        """
    )
    
    # Single student enrollment
    parser.add_argument('--student-id', type=str, help='Student ID (e.g., STUD001)')
    parser.add_argument('--name', type=str, help='Full name of student')
    parser.add_argument('--photos', type=int, default=7, help='Number of photos to capture (default: 7)')
    
    # Batch enrollment
    parser.add_argument('--csv', type=str, help='Path to CSV file for batch enrollment')
    
    # Camera settings
    parser.add_argument('--camera', type=int, default=0, help='Camera source index (default: 0)')
    
    # Other options
    parser.add_argument('--update', action='store_true', help='Update existing student (re-enroll)')
    
    args = parser.parse_args()
    
    enroller = StudentEnroller()
    
    # Batch enrollment
    if args.csv:
        enroller.enroll_from_csv(args.csv, camera_source=args.camera)
    
    # Single student enrollment
    elif args.student_id and args.name:
        success = enroller.enroll_single_student(
            student_id=args.student_id,
            full_name=args.name,
            num_photos=args.photos,
            camera_source=args.camera
        )
        
        sys.exit(0 if success else 1)
    
    else:
        parser.print_help()
        print("\n❌ Error: Either provide --student-id and --name, or --csv")
        sys.exit(1)


if __name__ == "__main__":
    main()

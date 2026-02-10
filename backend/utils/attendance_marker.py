"""
Attendance Marker
Intelligent attendance marking with deduplication and business logic
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None


class AttendanceMarker:
    def __init__(self):
        """Initialize attendance marker"""
        self.supabase = supabase
        self.min_confidence = 0.70  # Minimum confidence to auto-mark (70%)
        self.dedup_window_hours = 1  # Don't mark same student twice within 1 hour
        
    def is_already_marked(
        self, 
        student_id: str, 
        class_id: Optional[str] = None,
        window_hours: int = 1
    ) -> bool:
        """
        Check if student attendance was already marked recently
        
        Args:
            student_id: Student ID
            class_id: Optional class ID
            window_hours: Time window in hours to check
            
        Returns:
            True if already marked, False otherwise
        """
        if not self.supabase:
            return False
        
        try:
            # Calculate time threshold
            threshold_time = datetime.now() - timedelta(hours=window_hours)
            
            query = self.supabase.table("attendance_logs").select("*").eq("student_id", student_id)
            
            if class_id:
                query = query.eq("class_id", class_id)
            
            query = query.gte("marked_at", threshold_time.isoformat())
            
            result = query.execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error checking attendance: {e}")
            return False
    
    def is_class_in_session(self, class_id: str) -> bool:
        """
        Check if a class is currently in session
        
        Args:
            class_id: Class ID
            
        Returns:
            True if class is in session, False otherwise
        """
        if not self.supabase:
            return True  # Assume yes if can't check
        
        try:
            # Get class schedule
            result = self.supabase.table("classes").select("schedule").eq("id", class_id).execute()
            
            if not result.data:
                return True  # If class not found, allow marking
            
            schedule = result.data[0].get("schedule", {})
            
            # Get current day and time
            now = datetime.now()
            day_name = now.strftime("%A").lower()  # monday, tuesday, etc.
            current_time = now.strftime("%H:%M")
            
            # Check if current day has classes
            day_schedule = schedule.get(day_name, [])
            
            if not day_schedule:
                return False  # No classes on this day
            
            # Check if current time falls within any class period
            for time_slot in day_schedule:
                if "-" in time_slot:
                    start_time, end_time = time_slot.split("-")
                    if start_time <= current_time <= end_time:
                        return True
            
            return False
            
        except Exception as e:
            print(f"Error checking class schedule: {e}")
            return True  # Default to allowing marking
    
    def is_student_enrolled(self, student_id: str, class_id: str) -> bool:
        """
        Check if student is enrolled in the class
        
        Args:
            student_id: Student ID
            class_id: Class ID
            
        Returns:
            True if enrolled, False otherwise
        """
        if not self.supabase:
            return True  # Assume yes if can't check
        
        try:
            result = self.supabase.table("class_enrollments")\
                .select("*")\
                .eq("student_id", student_id)\
                .eq("class_id", class_id)\
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error checking enrollment: {e}")
            return True  # Default to allowing marking
    
    def should_mark_attendance(
        self, 
        student_id: str, 
        class_id: Optional[str] = None,
        confidence: float = 1.0
    ) -> tuple[bool, str]:
        """
        Determine if attendance should be marked
        
        Args:
            student_id: Student ID
            class_id: Optional class ID
            confidence: Confidence score (0-1)
            
        Returns:
            (should_mark, reason)
        """
        # Check confidence
        if confidence < self.min_confidence:
            return False, f"Confidence too low ({confidence:.0%} < {self.min_confidence:.0%})"
        
        # Check if already marked
        if self.is_already_marked(student_id, class_id, self.dedup_window_hours):
            return False, f"Already marked within last {self.dedup_window_hours} hour(s)"
        
        # If class_id provided, check class-specific rules
        if class_id:
            # Check if student is enrolled
            if not self.is_student_enrolled(student_id, class_id):
                return False, "Student not enrolled in this class"
            
            # Check if class is in session
            if not self.is_class_in_session(class_id):
                return False, "Class not currently in session"
        
        return True, "OK"
    
    def mark_attendance(
        self,
        student_id: str,
        confidence: float,
        class_id: Optional[str] = None,
        camera_id: str = "cctv_main",
        frame_url: Optional[str] = None,
        profile_id: Optional[str] = None
    ) -> Dict:
        """
        Mark attendance for a student
        
        Args:
            student_id: Student ID
            confidence: Confidence score (0-1)
            class_id: Optional class ID
            camera_id: Camera identifier
            frame_url: Optional URL to captured frame
            profile_id: Optional profile ID
            
        Returns:
            Dictionary with result
        """
        if not self.supabase:
            return {"error": "Database not configured"}
        
        try:
            # Check if should mark
            should_mark, reason = self.should_mark_attendance(student_id, class_id, confidence)
            
            if not should_mark:
                return {
                    "status": "skipped",
                    "reason": reason,
                    "student_id": student_id
                }
            
            # Determine if needs verification
            verified = confidence >= 0.85  # Auto-verify if confidence > 85%
            
            # Insert attendance record
            data = {
                "student_id": student_id,
                "profile_id": profile_id,
                "class_id": class_id,
                "confidence_score": confidence,
                "camera_id": camera_id,
                "frame_url": frame_url,
                "verified": verified,
                "method": "face_recognition"
            }
            
            result = self.supabase.table("attendance_logs").insert(data).execute()
            
            # Update recognition stats
            self._update_stats(camera_id, success=True, confidence=confidence)
            
            return {
                "status": "success",
                "student_id": student_id,
                "confidence": confidence,
                "verified": verified,
                "marked_at": datetime.now().isoformat(),
                "record_id": result.data[0]["id"] if result.data else None
            }
            
        except Exception as e:
            print(f"Error marking attendance: {e}")
            self._update_stats(camera_id, success=False)
            return {"error": str(e)}
    
    def mark_multiple_students(
        self,
        matches: List[Dict],
        class_id: Optional[str] = None,
        camera_id: str = "cctv_main"
    ) -> List[Dict]:
        """
        Mark attendance for multiple students from one frame
        
        Args:
            matches: List of match dictionaries with student_id and confidence
            class_id: Optional class ID
            camera_id: Camera identifier
            
        Returns:
            List of results for each student
        """
        results = []
        
        for match in matches:
            student_id = match.get("student_id")
            confidence = match.get("similarity", match.get("confidence", 0))
            profile_id = match.get("profile_id")
            
            if not student_id:
                continue
            
            result = self.mark_attendance(
                student_id=student_id,
                confidence=confidence,
                class_id=class_id,
                camera_id=camera_id,
                profile_id=profile_id
            )
            
            results.append(result)
        
        return results
    
    def _update_stats(
        self, 
        camera_id: str, 
        success: bool = True, 
        confidence: float = 0,
        processing_time_ms: int = 0
    ):
        """
        Update recognition statistics
        
        Args:
            camera_id: Camera identifier
            success: Whether recognition was successful
            confidence: Confidence score
            processing_time_ms: Processing time in milliseconds
        """
        if not self.supabase:
            return
        
        try:
            today = datetime.now().date().isoformat()
            
            # Try to get existing stats for today
            result = self.supabase.table("recognition_stats")\
                .select("*")\
                .eq("date", today)\
                .eq("camera_id", camera_id)\
                .execute()
            
            if result.data:
                # Update existing record
                stats = result.data[0]
                
                new_total = stats["total_recognitions"] + 1
                new_successful = stats["successful_matches"] + (1 if success else 0)
                new_failed = stats["failed_matches"] + (0 if success else 1)
                
                # Calculate new average confidence
                old_avg = stats.get("avg_confidence", 0) or 0
                new_avg = ((old_avg * stats["total_recognitions"]) + confidence) / new_total
                
                # Calculate new average processing time
                old_time = stats.get("avg_processing_time_ms", 0) or 0
                new_time = ((old_time * stats["total_recognitions"]) + processing_time_ms) / new_total
                
                self.supabase.table("recognition_stats").update({
                    "total_recognitions": new_total,
                    "successful_matches": new_successful,
                    "failed_matches": new_failed,
                    "avg_confidence": new_avg,
                    "avg_processing_time_ms": int(new_time)
                }).eq("id", stats["id"]).execute()
            else:
                # Create new record
                self.supabase.table("recognition_stats").insert({
                    "date": today,
                    "camera_id": camera_id,
                    "total_recognitions": 1,
                    "successful_matches": 1 if success else 0,
                    "failed_matches": 0 if success else 1,
                    "avg_confidence": confidence,
                    "avg_processing_time_ms": processing_time_ms
                }).execute()
                
        except Exception as e:
            print(f"Error updating stats: {e}")
    
    def get_today_attendance(self, class_id: Optional[str] = None) -> List[Dict]:
        """
        Get today's attendance records
        
        Args:
            class_id: Optional class ID to filter by
            
        Returns:
            List of attendance records
        """
        if not self.supabase:
            return []
        
        try:
            today = datetime.now().date().isoformat()
            
            query = self.supabase.table("attendance_logs")\
                .select("*")\
                .gte("marked_at", today)
            
            if class_id:
                query = query.eq("class_id", class_id)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            print(f"Error getting attendance: {e}")
            return []


# Create singleton instance
attendance_marker = AttendanceMarker()

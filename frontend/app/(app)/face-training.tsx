import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, ChevronLeft, ScanFace, Camera as CameraIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../constants/apiConfig';

const { width } = Dimensions.get('window');
const CAMERA_SIZE = width * 0.85;

export default function FaceTrainingScreen() {
  const router = useRouter();
  const { userProfile, role, session } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(0); // 0: Intro, 1: Scanning, 2: Complete
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Security Check: Only Students allowed
  useEffect(() => {
    if (role !== 'student') {
      Alert.alert("Restricted", "This feature is for students only.");
      router.replace('/(app)/dashboard');
    }
  }, [role]);

  useEffect(() => {
    if (step === 1 && !permission?.granted) {
      requestPermission();
    }
  }, [step, permission]);

  // Web camera setup
  useEffect(() => {
    if (Platform.OS === 'web' && step === 1) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(stream => {
          const video = document.querySelector('video');
          if (video) {
            video.srcObject = stream;
            videoRef.current = video;
          }
        })
        .catch(err => console.log('Web camera error:', err));
    }
  }, [step]);

  const handleStart = () => {
    if (!permission) {
      requestPermission();
    }
    setStep(1);
  };

  const handleCapture = async () => {
    setIsCapturing(true);

    try {
      let base64Image: string | null = null;

      // Web: Use canvas to capture from video element
      if (Platform.OS === 'web') {
        const video = document.querySelector('video');
        if (video) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
          }
        }
      } else {
        // Native: Use expo-camera
        if (cameraRef.current) {
          const photo = await cameraRef.current.takePictureAsync({
            base64: true,
            quality: 0.7,
          });
          base64Image = photo?.base64 || null;
        }
      }

      if (!base64Image) throw new Error("Failed to capture image");

      // Get user data - use session metadata as fallback
      const profileId = userProfile?.id || session?.user?.id;
      const studentId = userProfile?.student_id || session?.user?.user_metadata?.student_id || 'unknown';
      const fullName = userProfile?.full_name || session?.user?.user_metadata?.full_name || 'Student';

      // Upload to Backend
      const response = await fetch(`${API_BASE_URL}/api/v1/students/upload-biometrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profileId,
          student_id: studentId,
          full_name: fullName,
          image: base64Image,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStep(2);
      } else {
        Alert.alert("Error", result.detail || "Failed to upload biometrics.");
        setIsCapturing(false);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "An error occurred during capture");
      setIsCapturing(false);
    }
  };

  if (role !== 'student') return null;

  if (!permission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (step === 1 && !permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.stepTitle}>Camera Access Needed</Text>
          <Text style={styles.stepDesc}>We need camera access to verify your identity.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>GRANT PERMISSION</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Biometric Setup</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {step === 0 && (
          <>
            <View style={styles.iconContainer}>
              <ScanFace size={80} color={Colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Face Registration</Text>
            <Text style={styles.stepDesc}>
              We need to learn your face to automate your attendance via classroom cameras.
              This is a one-time process.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>• Ensure good lighting</Text>
              <Text style={styles.infoText}>• Remove glasses/masks</Text>
              <Text style={styles.infoText}>• Look straight at the camera</Text>
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Align Face</Text>
            <Text style={styles.stepDesc}>Position your face within the circle.</Text>

            <View style={styles.cameraContainer}>
              <CameraView ref={cameraRef} style={styles.camera} facing="front">
                <View style={styles.cameraOverlay}>
                  <View style={[styles.scanCircle, isCapturing && styles.scanCircleActive]} />
                </View>
              </CameraView>

              {isCapturing && (
                <View style={styles.scanningLabel}>
                  <Text style={styles.scanningText}>UPLOADING...</Text>
                </View>
              )}
            </View>
          </>
        )}

        {step === 2 && (
          <View style={styles.successContainer}>
            <CheckCircle2 size={80} color={Colors.success} />
            <Text style={styles.successText}>Data Uploaded!</Text>
            <Text style={styles.successSubText}>
              Your face data has been sent to the Central CCTV Database.
              Please wait for faculty approval to finalize the registration.
            </Text>
          </View>
        )}
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {step === 0 && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleStart}>
            <Text style={styles.primaryBtnText}>START CAMERA</Text>
          </TouchableOpacity>
        )}

        {step === 1 && (
          <TouchableOpacity
            style={[styles.captureBtn, isCapturing && styles.captureBtnDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            <View style={styles.captureInner}>
              <CameraIcon size={28} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}

        {step === 2 && (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
            <Text style={styles.primaryBtnText}>RETURN TO PROFILE</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    maxWidth: '80%',
  },
  infoBox: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  // Camera Styles
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#E0E0E0',
    marginTop: 20,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanCircle: {
    width: CAMERA_SIZE - 40,
    height: CAMERA_SIZE - 40,
    borderRadius: (CAMERA_SIZE - 40) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  scanCircleActive: {
    borderColor: '#4CAF50',
    borderWidth: 4,
  },
  scanningLabel: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scanningText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Success
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -40,
  },
  successText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  successSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Footer
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captureBtnDisabled: {
    borderColor: '#CCC',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

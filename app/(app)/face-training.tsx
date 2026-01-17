import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, ChevronLeft, ScanFace, Camera as CameraIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const CAMERA_SIZE = width * 0.85;

export default function FaceTrainingScreen() {
  const router = useRouter();
  const { setFaceIdStatus, role } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState(0); // 0: Intro, 1: Scanning, 2: Complete
  const [isCapturing, setIsCapturing] = useState(false);

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

  const handleStart = () => {
    if (!permission) {
      requestPermission();
    }
    setStep(1);
  };

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate capture delay and processing
    setTimeout(() => {
      setIsCapturing(false);
      setStep(2);
      setFaceIdStatus('pending'); // Set global status to pending
    }, 2500);
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
              <CameraView style={styles.camera} facing="front">
                <View style={styles.cameraOverlay}>
                  <View style={[styles.scanCircle, isCapturing && styles.scanCircleActive]} />
                </View>
              </CameraView>
              
              {isCapturing && (
                <View style={styles.scanningLabel}>
                  <Text style={styles.scanningText}>SCANNING...</Text>
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
    backgroundColor: Colors.background,
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
    color: Colors.text,
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
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    borderColor: Colors.border,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
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
    borderColor: Colors.border,
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
    borderColor: Colors.success,
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
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  successSubText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Footer
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
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
    borderColor: Colors.primary,
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
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

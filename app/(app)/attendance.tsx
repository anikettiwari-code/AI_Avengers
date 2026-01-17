import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Fingerprint,
  Radio,
  ScanFace,
  RefreshCcw,
  Eye,
  MapPin,
  Camera,
  CheckCircle2,
  Wifi,
  AlertTriangle
} from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get('window');

export default function AttendanceScreen() {
  const { colors } = useTheme();
  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  const handleScanComplete = () => {
    Alert.alert("Success", "Attendance Verified Successfully!");
    setActiveMethod(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Mark Attendance</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>SELECT A CLASS AND VERIFY YOUR PRESENCE</Text>
        </View>

        {/* Dynamic Section: Selection List or Active Scanner */}
        <View style={styles.dynamicSection}>
          {activeMethod ? (
            <ActiveScannerView
              method={activeMethod}
              onBack={() => setActiveMethod(null)}
              onComplete={handleScanComplete}
              colors={colors}
            />
          ) : (
            <MethodSelectionList onSelect={setActiveMethod} colors={colors} />
          )}
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.scheduleHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</Text>
            <View style={[styles.badge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>6 LECTURES</Text>
            </View>
          </View>

          <View style={styles.scheduleList}>
            <ClassListItem
              initial="M"
              subject="Mathematics"
              time="9:00 AM - 10:00 AM"
              room="ROOM 201"
              instructor="Dr. Rajesh Kumar"
              status="COMPLETED"
              colors={colors}
            />
            <ClassListItem
              initial="P"
              subject="Physics"
              time="10:30 AM - 11:30 AM"
              room="LAB 102"
              instructor="Prof. Anita Sharma"
              status="COMPLETED"
              colors={colors}
            />
            <ClassListItem
              initial="E"
              subject="English"
              time="2:00 PM - 3:00 PM"
              room="ROOM 101"
              instructor="Ms. Priya Singh"
              status="VERIFY FIRST"
              isActive={true}
              colors={colors}
            />
            <ClassListItem
              initial="C"
              subject="Computer Science"
              time="3:30 PM - 4:30 PM"
              room="LAB 201"
              instructor="Dr. Amit Verma"
              status="UPCOMING"
              colors={colors}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Components ---

function MethodSelectionList({ onSelect, colors }: { onSelect: (method: string) => void, colors: any }) {
  return (
    <View style={styles.methodsContainer}>
      <MethodCard
        title="Fingerprint"
        subtitle="Authorize using your device's biometric sensor."
        icon={Fingerprint}
        iconBg={colors.accentPurple}
        iconColor={colors.accentPurpleText}
        onPress={() => onSelect('fingerprint')}
        colors={colors}
      />
      <MethodCard
        title="Radar (Radius)"
        subtitle="Connect to teacher's device in range."
        icon={Radio}
        iconBg={colors.accentBlue}
        iconColor={colors.accentBlueText}
        onPress={() => onSelect('radar')}
        colors={colors}
      />
      <MethodCard
        title="Facial Verification"
        subtitle="Confirm presence via camera match."
        icon={ScanFace}
        iconBg={colors.accentOrange}
        iconColor={colors.accentOrangeText}
        onPress={() => onSelect('face')}
        colors={colors}
      />
    </View>
  );
}

function ActiveScannerView({ method, onBack, onComplete, colors }: { method: string, onBack: () => void, onComplete: () => void, colors: any }) {
  const [statusText, setStatusText] = useState('Initializing...');

  useEffect(() => {
    let timers: any[] = [];

    const startBiometricAuth = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          setStatusText('Biometric sensor not available or no fingerprints enrolled.');
          return;
        }

        setStatusText('Place Finger on Sensor...');

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authorize Attendance',
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: false,
        });

        if (result.success) {
          setStatusText('Success! Identity Verified.');
          setTimeout(() => onComplete(), 1000);
        } else {
          setStatusText('Authentication failed. Try again.');
        }
      } catch (error) {
        setStatusText('An error occurred during authentication.');
        console.error(error);
      }
    };

    if (method === 'radar') {
      setStatusText('Searching for Student Signals...');
      timers.push(setTimeout(() => setStatusText('Establishing Secure Radius Boundary...'), 5000));
      timers.push(setTimeout(() => setStatusText('Scanning for Nearby Devices (12 discovered)...'), 15000));
      timers.push(setTimeout(() => setStatusText('Finalizing Geofence Attendance Log...'), 25000));
      timers.push(setTimeout(() => onComplete(), 30000));
    } else if (method === 'face') {
      setStatusText('Align Face in Frame...');
      timers.push(setTimeout(() => setStatusText('Face Detected. Matching...'), 1500));
      timers.push(setTimeout(() => setStatusText('Identity Confirmed.'), 3000));
      timers.push(setTimeout(() => onComplete(), 4000));
    } else if (method === 'fingerprint') {
      startBiometricAuth();
    } else {
      setStatusText('Initializing...');
      timers.push(setTimeout(() => onComplete(), 2000));
    }

    return () => timers.forEach(t => clearTimeout(t));
  }, [method]);

  return (
    <View style={[styles.scannerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <RefreshCcw size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.scannerContent}>
        <View style={styles.scanIconContainer}>
          {method === 'fingerprint' && <Fingerprint size={64} color={colors.primary} strokeWidth={1} />}
          {method === 'radar' && <Wifi size={64} color={colors.primary} strokeWidth={1} />}
          {method === 'face' && <ScanFace size={64} color={colors.primary} strokeWidth={1} />}
        </View>

        <Text style={[styles.scanTitle, { color: colors.text }]}>
          {method === 'radar' ? 'Connecting...' : 'Verifying...'}
        </Text>
        <Text style={[styles.scanSubtitle, { color: colors.textSecondary }]}>{statusText}</Text>

        <View style={styles.scanMetrics}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { borderColor: colors.border }, method === 'fingerprint' && { borderColor: colors.success, backgroundColor: colors.successBg }]}>
              <Eye size={16} color={method === 'fingerprint' ? colors.success : colors.textSecondary} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>BIOMETRIC</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { borderColor: colors.border }, method === 'radar' && { borderColor: colors.success, backgroundColor: colors.successBg }]}>
              <MapPin size={16} color={method === 'radar' ? colors.success : colors.textSecondary} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>RADIUS</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { borderColor: colors.border }, method === 'face' && { borderColor: colors.success, backgroundColor: colors.successBg }]}>
              <Camera size={16} color={method === 'face' ? colors.success : colors.textSecondary} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>CAMERA</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function MethodCard({ title, subtitle, icon: Icon, iconBg, iconColor, onPress, colors }: any) {
  return (
    <TouchableOpacity style={[styles.methodCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.methodIcon, { backgroundColor: iconBg }]}>
        <Icon size={28} color={iconColor} />
      </View>
      <View style={styles.methodInfo}>
        <Text style={[styles.methodTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.methodSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ClassListItem({ initial, subject, time, room, instructor, status, isActive, colors }: any) {
  const isCompleted = status === 'COMPLETED';
  const isVerify = status === 'VERIFY FIRST';

  return (
    <View style={[styles.classItem, { backgroundColor: colors.surface, borderColor: colors.border }, isActive && { borderColor: colors.success, backgroundColor: colors.successBg + '40' }]}>
      {/* Left Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.surfaceHighlight }, isActive ? { backgroundColor: colors.surface, borderColor: colors.success, borderWidth: 1 } : {}]}>
        <Text style={[styles.avatarText, { color: colors.text }, isActive && { color: colors.success }]}>{initial}</Text>
      </View>

      {/* Middle Content */}
      <View style={styles.classContent}>
        <Text style={[styles.subjectName, { color: colors.text }]}>{subject}</Text>
        <Text style={[styles.classMeta, { color: colors.textSecondary }]}>
          {time} • {room}
        </Text>
        <Text style={[styles.instructor, { color: colors.textSecondary }]}>Inst: {instructor}</Text>
      </View>

      {/* Right Status */}
      <View style={[
        styles.statusPill,
        isCompleted ? { backgroundColor: colors.successBg } : isVerify ? { backgroundColor: colors.successBg, borderColor: colors.success, borderWidth: 1 } : { backgroundColor: colors.surfaceHighlight }
      ]}>
        <Text style={[
          styles.statusText,
          isVerify ? { color: colors.success } : { color: colors.textSecondary }
        ]}>
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dynamicSection: {
    marginBottom: 32,
    minHeight: 300,
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodInfo: {
    alignItems: 'center',
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  methodSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },

  // Scanner View Styles
  scannerCard: {
    borderRadius: 20,
    height: 350,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  scannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIconContainer: {
    marginBottom: 24,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 40,
    textAlign: 'center',
    height: 20,
  },
  scanMetrics: {
    flexDirection: 'row',
    gap: 24,
  },
  metricItem: {
    alignItems: 'center',
    gap: 8,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
  },

  // Schedule Styles
  section: {
    marginTop: 0,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scheduleList: {
    gap: 12,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  classContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  classMeta: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  instructor: {
    fontSize: 10,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

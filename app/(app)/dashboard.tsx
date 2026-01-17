import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle2,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  Check,
  ShieldCheck,
  ScanFace,
  AlertCircle,
  X,
  Database,
  Server
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { role } = useAuth();
  const { colors } = useTheme();

  if (role === 'student') {
    return <StudentDashboard colors={colors} />;
  }
  return <FacultyDashboard colors={colors} />;
}

// --- Student Dashboard ---

function StudentDashboard({ colors }: { colors: any }) {
  const router = useRouter();
  const { faceIdStatus } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <DashboardHeader name="Alisha Khan" initials="AK" role="STUDENT" colors={colors} />

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome back!</Text>
          <Text style={[styles.dashboardLabel, { color: colors.textSecondary }]}>STUDENT OVERVIEW</Text>
        </View>

        {/* Action Required: Face Training (Only if not set) */}
        {faceIdStatus === 'not_set' && (
          <TouchableOpacity
            style={[styles.alertCard, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}
            activeOpacity={0.9}
            onPress={() => router.push('/(app)/face-training')}
          >
            <View style={[styles.alertIconBg, { backgroundColor: colors.warning }]}>
              <ScanFace size={24} color="#FFF" />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: colors.accentOrangeText }]}>Setup Face ID</Text>
              <Text style={[styles.alertDesc, { color: colors.text }]}>Register your face for automated CCTV attendance.</Text>
            </View>
            <AlertCircle size={20} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StudentStatCard
            label="TOTAL"
            value="45"
            subLabel="Classes"
            colors={colors}
          />
          <StudentStatCard
            label="ATTENDED"
            value="38"
            subLabel="Verified"
            icon={CheckCircle2}
            iconColor={colors.success}
            colors={colors}
          />
          <StudentStatCard
            label="RATE"
            value="84%"
            subLabel="+2.1%"
            valueColor={colors.success}
            colors={colors}
          />
        </View>

        {/* Overall Progress */}
        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Overall Progress</Text>
            <Text style={[styles.progressPercent, { color: colors.success }]}>84.4%</Text>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceHighlight }]}>
            <View style={[styles.progressBarFill, { width: '84.4%', backgroundColor: colors.success }]} />
          </View>

          <Text style={[styles.progressFooter, { color: colors.textSecondary }]}>38 OF 45 CLASSES COMPLETED</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Mark Attendance"
              icon={CheckCircle2}
              bg={colors.accentGreen}
              iconColor={colors.accentGreenText}
              colors={colors}
              onPress={() => router.push('/(app)/attendance')}
            />
            <QuickActionCard
              title="View Students"
              icon={Users}
              bg={colors.accentBlue}
              iconColor={colors.accentBlueText}
              colors={colors}
              onPress={() => router.push('/(app)/students')}
            />
            <QuickActionCard
              title="Generate Report"
              icon={FileText}
              bg={colors.accentOrange}
              iconColor={colors.accentOrangeText}
              colors={colors}
              onPress={() => router.push('/(app)/reports')}
            />
            <QuickActionCard
              title="Schedule"
              icon={CalendarIcon}
              bg={colors.accentPurple}
              iconColor={colors.accentPurpleText}
              colors={colors}
              onPress={() => router.push('/(app)/schedule')}
            />
          </View>
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Attendance</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/reports')}>
              <Text style={[styles.viewAllText, { color: colors.success }]}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attendanceList}>
            <AttendanceItem
              subject="Mathematics"
              time="9:00 AM • Kumar"
              initial="M"
              status="PRESENT"
              colors={colors}
            />
            <AttendanceItem
              subject="Physics"
              time="11:00 AM • Sharma"
              initial="P"
              status="PRESENT"
              colors={colors}
            />
            <AttendanceItem
              subject="Chemistry"
              time="2:00 PM • Verma"
              initial="C"
              status="PRESENT"
              colors={colors}
            />
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentStatCard({ label, value, subLabel, icon: Icon, iconColor, valueColor, colors }: any) {
  return (
    <View style={[styles.studentStatCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.studentStatHeader}>
        <Text style={[styles.studentStatLabel, { color: colors.textSecondary }]}>{label}</Text>
        {Icon && <Icon size={16} color={iconColor} />}
      </View>
      <Text style={[styles.studentStatValue, { color: valueColor || colors.text }]}>{value}</Text>
      <Text style={[styles.studentStatSub, { color: colors.textSecondary }]}>{subLabel}</Text>
    </View>
  );
}

function AttendanceItem({ subject, time, initial, status, colors }: any) {
  return (
    <View style={[styles.attendanceItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.attendanceLeft}>
        <View style={[styles.subjectIcon, { backgroundColor: colors.successBg }]}>
          <Text style={[styles.subjectInitial, { color: colors.success }]}>{initial}</Text>
        </View>
        <View>
          <Text style={[styles.subjectName, { color: colors.text }]}>{subject}</Text>
          <Text style={[styles.subjectTime, { color: colors.textSecondary }]}>{time}</Text>
        </View>
      </View>
      <View style={[styles.presentPill, { backgroundColor: colors.success }]}>
        <Text style={styles.presentText}>{status}</Text>
      </View>
    </View>
  );
}


// --- Faculty Dashboard ---

function FacultyDashboard({ colors }: { colors: any }) {
  const router = useRouter();
  const { faceIdStatus, setFaceIdStatus } = useAuth();
  const [hasPendingRequest, setHasPendingRequest] = useState(faceIdStatus === 'pending');

  React.useEffect(() => {
    setHasPendingRequest(faceIdStatus === 'pending');
  }, [faceIdStatus]);

  const handleApprove = () => {
    Alert.alert(
      "Database Updated",
      "Student face data has been added to the CCTV model successfully."
    );
    setFaceIdStatus('verified');
  };

  const handleReject = () => {
    Alert.alert("Rejected", "Request removed.");
    setFaceIdStatus('not_set');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <DashboardHeader name="Dr. Sarah Williams" initials="SW" role="FACULTY" colors={colors} />

        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome back, Sarah!</Text>
          <Text style={[styles.dashboardLabel, { color: colors.textSecondary }]}>FACULTY DASHBOARD</Text>
        </View>

        {/* Pending Approvals Section */}
        {hasPendingRequest && (
          <View style={[styles.approvalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.approvalHeader}>
              <View style={[styles.approvalIconBg, { backgroundColor: colors.accentBlue }]}>
                <Database size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.approvalTitle, { color: colors.text }]}>Incoming Biometric Data</Text>
                <Text style={[styles.approvalSub, { color: colors.textSecondary }]}>Alisha Khan • ST-2025-001</Text>
              </View>
            </View>

            <View style={styles.approvalMeta}>
              <Server size={12} color={colors.textSecondary} />
              <Text style={[styles.approvalMetaText, { color: colors.textSecondary }]}>Requesting addition to CCTV Attendance Model</Text>
            </View>

            <View style={styles.approvalActions}>
              <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: colors.errorBg }]} onPress={handleReject}>
                <X size={16} color={colors.error} />
                <Text style={[styles.rejectText, { color: colors.error }]}>Deny</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.approveBtn, { backgroundColor: colors.success }]} onPress={handleApprove}>
                <Check size={16} color="#FFF" />
                <Text style={styles.approveText}>Approve & Add to DB</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <StatCard
            icon={BookOpen}
            value="12"
            label="Total Classes"
            subLabel="This Semester"
            color={colors.primary}
            colors={colors}
          />
          <StatCard
            icon={Users}
            value="245"
            label="Students"
            subLabel="Enrolled"
            color={colors.primary}
            colors={colors}
          />
          <StatCard
            icon={TrendingUp}
            value="92%"
            label="Avg Rate"
            subLabel="+3.2% from last"
            color={colors.success}
            colors={colors}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              title="Mark Attendance"
              icon={CheckCircle2}
              bg={colors.accentGreen}
              iconColor={colors.accentGreenText}
              colors={colors}
              onPress={() => router.push('/(app)/attendance')}
            />
            <QuickActionCard
              title="View Students"
              icon={Users}
              bg={colors.accentBlue}
              iconColor={colors.accentBlueText}
              colors={colors}
              onPress={() => router.push('/(app)/students')}
            />
            <QuickActionCard
              title="Generate Report"
              icon={FileText}
              bg={colors.accentOrange}
              iconColor={colors.accentOrangeText}
              colors={colors}
              onPress={() => router.push('/(app)/reports')}
            />
            <QuickActionCard
              title="Schedule"
              icon={CalendarIcon}
              bg={colors.accentPurple}
              iconColor={colors.accentPurpleText}
              colors={colors}
              onPress={() => router.push('/(app)/schedule')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Classes</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/schedule')}>
              <Text style={[styles.viewAllText, { color: colors.success }]}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>
          <ClassCard title="Mathematics 101" time="9:00 AM" students="45 Students" attendance="42/45 Present (93%)" status="COMPLETED" statusColor={colors.success} colors={colors} />
          <ClassCard title="Physics 201" time="11:00 AM" students="38 Students" attendance="35/38 Present (92%)" status="COMPLETED" statusColor={colors.success} colors={colors} />
          <ClassCard title="Chemistry 301" time="2:00 PM" students="40 Students" status="UPCOMING" statusColor={colors.warning} colors={colors} />
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Shared Components ---

function DashboardHeader({ name, initials, role, colors }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
          <ShieldCheck size={20} color="#FFF" />
        </View>
        <Text style={[styles.brandName, { color: colors.primary }]}>Attendify</Text>
      </View>

      <TouchableOpacity style={[styles.profilePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{name}</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatCard({ icon: Icon, value, label, subLabel, color, colors }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Icon size={24} color={color} style={{ marginBottom: 12 }} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statSubLabel, { color: colors.textSecondary }]}>{subLabel}</Text>
    </View>
  );
}

function QuickActionCard({ title, icon: Icon, bg, iconColor, colors, onPress }: any) {
  return (
    <TouchableOpacity
      style={[styles.actionCard, { backgroundColor: colors.surface }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.actionIconContainer, { backgroundColor: bg }]}>
        <Icon size={28} color={iconColor} />
      </View>
      <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

function ClassCard({ title, time, students, attendance, status, statusColor, colors }: any) {
  const isCompleted = status === 'COMPLETED';
  return (
    <View style={[styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.classLeft}>
        <View style={[styles.classIcon, { backgroundColor: isCompleted ? colors.accentGreen : colors.accentOrange }]}>
          {isCompleted ? <Check size={20} color={colors.success} /> : <Clock size={20} color={colors.warning} />}
        </View>
        <View>
          <Text style={[styles.classTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.classMeta, { color: colors.textSecondary }]}>{time} • {students}</Text>
          {attendance && <Text style={[styles.classAttendance, { color: statusColor }]}>{attendance}</Text>}
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{status}</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  dashboardLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '47%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  classCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  classLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  classMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
  classAttendance: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Student Specific Styles
  studentStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  studentStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studentStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  studentStatValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  studentStatSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressFooter: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  attendanceList: {
    gap: 12,
  },
  attendanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  attendanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  subjectTime: {
    fontSize: 12,
  },
  presentPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  presentText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Alert Card
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 12,
  },

  // Approval Card (Faculty)
  approvalCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  approvalIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  approvalSub: {
    fontSize: 12,
  },
  approvalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 52, // Align with text
    gap: 6,
  },
  approvalMetaText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  approveText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  rejectText: {
    fontWeight: '700',
    fontSize: 12,
  },
});

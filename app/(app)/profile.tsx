import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Settings, 
  ChevronRight, 
  Sun, 
  Moon,
  LogOut,
  User,
  ScanFace,
  CheckCircle2,
  Clock
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { logout, role, faceIdStatus } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const router = useRouter();

  const profileData = {
    initials: role === 'student' ? 'AK' : 'SW',
    roleLabel: role === 'student' ? 'STUDENT' : 'FACULTY',
    name: role === 'student' ? 'Alisha Khan' : 'Dr. Sarah Williams',
    id: role === 'student' ? 'STU-2024-001' : 'FAC-CS-101',
    email: role === 'student' ? 'alisha.khan@attendify.edu' : 'sarah.williams@attendify.edu',
    department: 'Computer Science & Engineering'
  };

  const isStudent = role === 'student';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Header */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.success, shadowColor: colors.success }]}>
            <Text style={styles.avatarText}>{profileData.initials}</Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: colors.successBg }]}>
            <Text style={[styles.roleText, { color: colors.success }]}>{profileData.roleLabel}</Text>
          </View>
        </View>

        {/* Biometric Status (Student Only) */}
        {isStudent && (
          <View style={styles.biometricSection}>
             <TouchableOpacity 
              style={[
                styles.bioCard, 
                { backgroundColor: colors.surface, borderColor: colors.primary, shadowColor: colors.primary },
                faceIdStatus === 'verified' && { borderColor: colors.success, backgroundColor: colors.successBg },
                faceIdStatus === 'pending' && { borderColor: colors.warning, backgroundColor: colors.warningBg }
              ]}
              onPress={() => {
                if (faceIdStatus === 'not_set') {
                  router.push('/(app)/face-training');
                }
              }}
              activeOpacity={faceIdStatus === 'not_set' ? 0.7 : 1}
            >
              <View style={[styles.bioIconBg, { backgroundColor: colors.surfaceHighlight }]}>
                {faceIdStatus === 'verified' ? (
                  <CheckCircle2 size={24} color={colors.success} />
                ) : faceIdStatus === 'pending' ? (
                  <Clock size={24} color={colors.warning} />
                ) : (
                  <ScanFace size={24} color={colors.primary} />
                )}
              </View>
              <View style={styles.bioContent}>
                <Text style={[styles.bioTitle, { color: colors.text }]}>
                  {faceIdStatus === 'verified' ? 'Face ID Verified' : 
                   faceIdStatus === 'pending' ? 'Verification Pending' : 'Setup Face ID'}
                </Text>
                <Text style={[styles.bioDesc, { color: colors.textSecondary }]}>
                  {faceIdStatus === 'verified' ? 'You can now use automated attendance.' : 
                   faceIdStatus === 'pending' ? 'Waiting for faculty approval.' : 'Train camera for automated attendance.'}
                </Text>
              </View>
              {faceIdStatus === 'not_set' && <ChevronRight size={20} color={colors.textSecondary} />}
            </TouchableOpacity>
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.sectionHeader}>
          <User size={16} color={colors.text} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoField label="FULL NAME" value={profileData.name} colors={colors} />
          <Divider colors={colors} />
          <InfoField label="USER ID / ROLL NUMBER" value={profileData.id} colors={colors} />
          <Divider colors={colors} />
          <InfoField label="EMAIL" value={profileData.email} colors={colors} />
          <Divider colors={colors} />
          <InfoField label="DEPARTMENT" value={profileData.department} isLast colors={colors} />
        </View>

        {/* Settings */}
        <View style={styles.sectionHeader}>
          <Settings size={16} color={colors.text} style={styles.sectionIcon} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingItem label="Change Password" colors={colors} />
          <Divider colors={colors} />
          <SettingItem label="Notification Preferences" colors={colors} />
          <Divider colors={colors} />
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
            <View style={styles.toggleContainer}>
              {isDarkMode ? (
                <Moon size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              ) : (
                <Sun size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              )}
              <Switch
                trackColor={{ false: '#E0E0E0', true: colors.primary + '80' }}
                thumbColor={isDarkMode ? colors.primary : '#f4f3f4'}
                ios_backgroundColor="#E0E0E0"
                onValueChange={toggleTheme}
                value={isDarkMode}
              />
            </View>
          </View>
          
          <Divider colors={colors} />
          <SettingItem label="Privacy Settings" isLast colors={colors} />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.errorBg }]} 
          onPress={logout} 
          activeOpacity={0.8}
        >
          <LogOut size={18} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Attendify v1.1.0</Text>
          <Text style={[styles.footerSubText, { color: colors.textSecondary }]}>© 2024 Attendify. All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Helper Components ---

function InfoField({ label, value, isLast, colors }: { label: string, value: string, isLast?: boolean, colors: any }) {
  return (
    <View style={[styles.infoField, isLast && styles.noBottomPadding]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function SettingItem({ label, isLast, colors }: { label: string, isLast?: boolean, colors: any }) {
  return (
    <TouchableOpacity style={[styles.settingRow, isLast && styles.noBottomPadding]} activeOpacity={0.7}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <ChevronRight size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

function Divider({ colors }: { colors: any }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  
  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Biometric Section
  biometricSection: {
    marginBottom: 30,
  },
  bioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bioIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bioContent: {
    flex: 1,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  bioDesc: {
    fontSize: 12,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Cards
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Info Fields
  infoField: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Utilities
  divider: {
    height: 1,
  },
  noBottomPadding: {
    paddingBottom: 0,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 10,
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 10,
  },
});

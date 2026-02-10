import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Trash2, X } from 'lucide-react-native';

// Initial Mock Data
const INITIAL_STUDENTS = [
  { id: '1', name: 'Rahul Sharma', studentId: 'STU-2024-001', subject: 'Math 101', attendance: 92, initials: 'RS', color: '#4CAF50' },
  { id: '2', name: 'Priya Patel', studentId: 'STU-2024-002', subject: 'Math 101', attendance: 88, initials: 'PP', color: '#2E7D32' },
  { id: '3', name: 'Amit Kumar', studentId: 'STU-2024-003', subject: 'Math 101', attendance: 95, initials: 'AK', color: '#1B5E20' },
  { id: '4', name: 'Sneha Gupta', studentId: 'STU-2024-004', subject: 'Math 101', attendance: 76, initials: 'SG', color: '#FF9800' },
  { id: '5', name: 'Vikram Singh', studentId: 'STU-2024-005', subject: 'Math 101', attendance: 82, initials: 'VS', color: '#4CAF50' },
];

export default function StudentsScreen() {
  const { colors } = useTheme();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');

  const handleAddStudent = () => {
    if (!newName || !newId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newStudent = {
      id: Date.now().toString(),
      name: newName,
      studentId: newId,
      subject: 'Math 101',
      attendance: 0,
      initials: newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      color: colors.primary,
    };

    setStudents([newStudent, ...students]);
    setModalVisible(false);
    setNewName('');
    setNewId('');
    Alert.alert('Success', 'Student added successfully');
  };

  const handleRemoveStudent = (id: string) => {
    Alert.alert(
      'Remove Student',
      'Are you sure you want to remove this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: () => {
            setStudents(students.filter(s => s.id !== id));
          } 
        }
      ]
    );
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Students</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>MANAGE YOUR ENROLLED STUDENTS</Text>
        </View>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name or ID..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard value={students.length.toString()} label="Total Students" colors={colors} />
          <StatCard value="92%" label="Avg Attendance" valueColor={colors.success} colors={colors} />
          <StatCard value="12" label="Low Attendance" valueColor={colors.warning} colors={colors} />
        </View>

        {/* Student List */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>All Students ({filteredStudents.length})</Text>
          
          {filteredStudents.map((student) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              onRemove={() => handleRemoveStudent(student.id)}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>

      {/* Add Student Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Student</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]} 
                placeholder="e.g. John Doe" 
                placeholderTextColor={colors.textSecondary}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Student ID</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]} 
                placeholder="e.g. STU-2025-001" 
                placeholderTextColor={colors.textSecondary}
                value={newId}
                onChangeText={setNewId}
              />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddStudent}>
              <Text style={styles.saveBtnText}>Add Student</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatCard({ value, label, valueColor, colors }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: valueColor || colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function StudentCard({ student, onRemove, colors }: any) {
  const getBadgeColor = (percentage: number) => {
    if (percentage >= 90) return colors.successBg;
    if (percentage >= 75) return colors.warningBg;
    return colors.errorBg; 
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 90) return colors.success;
    if (percentage >= 75) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.studentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: student.color }]}>
        <Text style={styles.avatarText}>{student.initials}</Text>
      </View>
      
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
        <Text style={[styles.studentId, { color: colors.textSecondary }]}>{student.studentId}</Text>
        <Text style={[styles.studentSubject, { color: colors.text }]}>{student.subject}</Text>
      </View>

      <View style={styles.actions}>
        <View style={[styles.attendanceBadge, { backgroundColor: getBadgeColor(student.attendance) }]}>
          <Text style={[styles.attendanceText, { color: getTextColor(student.attendance) }]}>
            {student.attendance}%
          </Text>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Trash2 size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  listSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 12,
    marginBottom: 2,
  },
  studentSubject: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  saveBtn: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

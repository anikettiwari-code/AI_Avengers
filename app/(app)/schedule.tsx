import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X, Clock, MapPin } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const INITIAL_SCHEDULE = [
  {
    title: 'Saturday (17-01-2026)',
    data: [
      { id: '1', time: '07:30 - 08:15', subject: 'CL (TYCS A)', room: 'Room 703' },
      { id: '2', time: '07:30 - 08:15', subject: 'IR (TYCS B)', room: 'Room 704' },
      { id: '3', time: '08:15 - 09:00', subject: 'CCWS (TYCS A)', room: 'Room 703' },
      { id: '4', time: '08:15 - 09:00', subject: 'CL (TYCS B)', room: 'Room 704' },
      { id: '5', time: '08:15 - 09:00', subject: 'CN (SYCS A)', room: 'Room 705' },
      { id: '6', time: '09:00 - 09:45', subject: 'IR (TYCS A)', room: 'Room 703' },
      { id: '7', time: '09:00 - 09:45', subject: 'CCWS (TYCS B)', room: 'Room 704' },
      { id: '8', time: '09:00 - 09:45', subject: 'CEP (SYCS A)', room: 'Room 705' },
      { id: '9', time: '10:15 - 11:00', subject: 'B2-OOP-L3 (FYCS A)', room: 'Room 604' },
      { id: '10', time: '10:15 - 11:45', subject: 'B1-IoT-L6 (SYCS A)', room: 'Room 705' },
      { id: '11', time: '11:00 - 11:45', subject: 'B1-APP-L4 (FYCS A)', room: 'Room 604' },
      { id: '12', time: '12:00 - 01:30', subject: 'B2-WT-L4 / B1-DAA-L3 (FYCS A)', room: 'Room 604' },
    ],
  }
];

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const { role } = useAuth();
  const isFaculty = role === 'faculty';
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [isModalVisible, setModalVisible] = useState(false);

  // Form State
  const [day, setDay] = useState('Monday');
  const [time, setTime] = useState('');
  const [subject, setSubject] = useState('');
  const [room, setRoom] = useState('');

  const handleAddClass = () => {
    if (!time || !subject || !room) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newClass = {
      id: Date.now().toString(),
      time,
      subject,
      room
    };

    const dayIndex = schedule.findIndex(s => s.title === day);

    if (dayIndex >= 0) {
      const updatedSchedule = [...schedule];
      updatedSchedule[dayIndex].data.push(newClass);
      setSchedule(updatedSchedule);
    } else {
      setSchedule([...schedule, { title: day, data: [newClass] }]);
    }

    setModalVisible(false);
    resetForm();
    Alert.alert('Success', 'Class scheduled successfully');
  };

  const resetForm = () => {
    setTime('');
    setSubject('');
    setRoom('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Weekly Timetable</Text>
        {isFaculty && (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => setModalVisible(true)}>
            <Plus size={24} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      <SectionList
        sections={schedule}
        keyExtractor={(item, index) => item.id + index}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.dayHeader, { color: colors.primary }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.timeBadge, { backgroundColor: colors.accentGreen }]}>
              <Clock size={14} color={colors.primary} style={{ marginBottom: 4 }} />
              <Text style={[styles.timeText, { color: colors.primary }]}>{item.time}</Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.subject, { color: colors.text }]}>{item.subject}</Text>
              <View style={styles.roomRow}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text style={[styles.room, { color: colors.textSecondary }]}>{item.room}</Text>
              </View>
            </View>
          </View>
        )}
        stickySectionHeadersEnabled={false}
      />

      {/* Add Class Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Schedule New Class</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Day</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Monday"
                placeholderTextColor={colors.textSecondary}
                value={day}
                onChangeText={setDay}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Time Slot</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. 10:00 - 11:30"
                placeholderTextColor={colors.textSecondary}
                value={time}
                onChangeText={setTime}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Subject</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Advanced Algorithms"
                placeholderTextColor={colors.textSecondary}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Room / Lab</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Lab 302"
                placeholderTextColor={colors.textSecondary}
                value={room}
                onChangeText={setRoom}
              />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddClass}>
              <Text style={styles.saveBtnText}>Add to Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
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
  list: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  timeBadge: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 16,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  details: {
    flex: 1,
  },
  subject: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  room: {
    fontSize: 12,
    fontWeight: '500',
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

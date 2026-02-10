import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  Switch,
  Alert 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Plus, X, Bell } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const INITIAL_NOTICES = [
  {
    id: '1',
    type: 'EXAM',
    date: '2026-01-16 - 10:30 AM',
    title: 'Mid-Term Examination Schedule',
    description: 'The mid-term examinations will be held from February 1st to February 10th. Please check the detailed schedule.',
    isUrgent: true,
  },
  {
    id: '2',
    type: 'EVENT',
    date: '2026-01-15 - 3:00 PM',
    title: 'Workshop on Machine Learning',
    description: 'A two-day workshop on Machine Learning and AI will be conducted on January 20-21.',
    isUrgent: false,
  },
];

export default function NoticesScreen() {
  const { colors } = useTheme();
  const { role } = useAuth();
  const isFaculty = role === 'faculty';
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [isModalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GENERAL');
  const [isUrgent, setIsUrgent] = useState(false);

  const handlePostNotice = () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    const newNotice = {
      id: Date.now().toString(),
      type,
      date: format(new Date(), 'yyyy-MM-dd - h:mm a'),
      title,
      description,
      isUrgent
    };

    setNotices([newNotice, ...notices]);
    setModalVisible(false);
    resetForm();
    Alert.alert('Success', 'Notice posted successfully');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('GENERAL');
    setIsUrgent(false);
  };

  const urgentCount = notices.filter(n => n.isUrgent).length;
  const newCount = notices.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Campus Notices</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: colors.accentGreen }]}>
                <Text style={[styles.badgeText, { color: colors.accentGreenText }]}>{newCount} TOTAL</Text>
              </View>
              {urgentCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.errorBg }]}>
                  <Text style={[styles.badgeText, { color: colors.error }]}>{urgentCount} URGENT</Text>
                </View>
              )}
            </View>
          </View>
          
          {isFaculty && (
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={() => setModalVisible(true)}>
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Notices List */}
        <View style={styles.list}>
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} colors={colors} />
          ))}
        </View>

      </ScrollView>

      {/* Post Notice Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Post New Notice</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]} 
                placeholder="e.g. Holiday Announcement" 
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top', backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]} 
                placeholder="Enter details..." 
                placeholderTextColor={colors.textSecondary}
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={{ flex: 1, marginRight: 16 }}>
                 <Text style={[styles.label, { color: colors.textSecondary }]}>Type (EXAM/EVENT/GENERAL)</Text>
                 <TextInput 
                  style={[styles.input, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: colors.border }]} 
                  placeholder="GENERAL"
                  placeholderTextColor={colors.textSecondary} 
                  value={type}
                  onChangeText={setType}
                  autoCapitalize="characters"
                />
              </View>
              
              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Urgent?</Text>
                <Switch 
                  value={isUrgent} 
                  onValueChange={setIsUrgent}
                  trackColor={{ false: colors.border, true: colors.error }}
                />
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handlePostNotice}>
              <Text style={styles.saveBtnText}>Post Notice</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NoticeCard({ notice, colors }: any) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM': return colors.errorBg; 
      case 'EVENT': return colors.accentBlue; 
      default: return colors.surfaceHighlight; 
    }
  };

  const getTypeTextColor = (type: string) => {
    switch (type) {
      case 'EXAM': return colors.error;
      case 'EVENT': return colors.accentBlueText;
      default: return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={[styles.tag, { backgroundColor: getTypeColor(notice.type) }]}>
          <Text style={[styles.tagText, { color: getTypeTextColor(notice.type) }]}>
            {notice.type}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>{notice.date}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.textContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {notice.isUrgent && <Bell size={14} color={colors.error} fill={colors.error} />} {notice.title}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{notice.description}</Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
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
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
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
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
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
  rowGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

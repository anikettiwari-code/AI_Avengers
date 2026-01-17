import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Users, BookOpen, ArrowRight, Download, CheckCircle2 } from 'lucide-react-native';
import { Modal, ActivityIndicator } from 'react-native';

const INITIAL_REPORT_DATA = [
  { id: '1', title: 'CL', standard: 'TYCS', division: 'A', students: 45, classes: 24, percentage: 92, trend: 'up' },
  { id: '2', title: 'IR', standard: 'TYCS', division: 'B', students: 38, classes: 22, percentage: 88, trend: 'up' },
  { id: '3', title: 'CCWS', standard: 'TYCS', division: 'A', students: 42, classes: 20, percentage: 90, trend: 'up' },
  { id: '4', title: 'CL', standard: 'TYCS', division: 'B', students: 40, classes: 21, percentage: 85, trend: 'up' },
  { id: '5', title: 'CN', standard: 'SYCS', division: 'A', students: 50, classes: 18, percentage: 78, trend: 'up' },
  { id: '6', title: 'IR', standard: 'TYCS', division: 'A', students: 48, classes: 19, percentage: 82, trend: 'down' },
  { id: '7', title: 'CCWS', standard: 'TYCS', division: 'B', students: 44, classes: 22, percentage: 86, trend: 'up' },
  { id: '8', title: 'CEP', standard: 'SYCS', division: 'A', students: 46, classes: 20, percentage: 80, trend: 'up' },
  { id: '9', title: 'B2-OOP-L3', standard: 'FYCS', division: 'A', students: 30, classes: 12, percentage: 94, trend: 'up' },
  { id: '10', title: 'B1-IoT-L6', standard: 'SYCS', division: 'A', students: 35, classes: 15, percentage: 88, trend: 'up' },
  { id: '11', title: 'B1-APP-L4', standard: 'FYCS', division: 'A', students: 32, classes: 14, percentage: 85, trend: 'down' },
  { id: '12', title: 'B2-WT-L4 / B1-DAA-L3', standard: 'FYCS', division: 'A', students: 28, classes: 10, percentage: 91, trend: 'up' },
];

export default function ReportsScreen() {
  const { colors } = useTheme();
  const [timeFilter, setTimeFilter] = useState('Week');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const filteredData = INITIAL_REPORT_DATA.filter(item =>
    divisionFilter === 'ALL' || item.standard === divisionFilter
  );

  const handleExport = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setDownloadProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDownloading(false);
        }, 800);
      }
    }, 150);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>ATTENDANCE ANALYTICS & INSIGHTS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Time Filter */}
        <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {['Week', 'Month', 'Semester'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterBtn, timeFilter === filter && { backgroundColor: colors.primary }]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text style={[styles.filterText, { color: timeFilter === filter ? '#FFF' : colors.textSecondary }]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Division Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 14, marginBottom: 12 }]}>Filter by Standard</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillContainer}>
            {['ALL', 'FYCS', 'SYCS', 'TYCS'].map((div) => (
              <TouchableOpacity
                key={div}
                style={[
                  styles.divPill,
                  { borderColor: colors.border, backgroundColor: divisionFilter === div ? colors.primary : colors.surface }
                ]}
                onPress={() => setDivisionFilter(div)}
              >
                <Text style={[styles.divPillText, { color: divisionFilter === div ? '#FFF' : colors.text }]}>
                  {div}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analytics Cards */}
        <View style={styles.analyticsRow}>
          <AnalyticsCard
            icon={TrendingUp}
            value="90.2%"
            label="Overall Avg"
            color={colors.success}
            colors={colors}
          />
          <AnalyticsCard
            icon={Users}
            value="245"
            label="Total Students"
            color="#1976D2"
            colors={colors}
          />
          <AnalyticsCard
            icon={BookOpen}
            value="66"
            label="Classes Held"
            color={colors.warning}
            colors={colors}
          />
        </View>

        {/* Class-wise Attendance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Class-wise Attendance</Text>

          {filteredData.map((item) => (
            <ClassReportCard
              key={item.id}
              title={item.title}
              subtitle={`${item.standard} ${item.division} • ${item.students} Students • ${item.classes} Classes`}
              percentage={item.percentage}
              trend={item.trend}
              colors={colors}
            />
          ))}

          {filteredData.length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>No reports found for this filter.</Text>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: colors.surface, borderColor: colors.success }]}
          activeOpacity={0.8}
          onPress={handleExport}
        >
          <Download size={20} color={colors.success} style={{ marginRight: 8 }} />
          <Text style={[styles.exportBtnText, { color: colors.success }]}>Export Reports (CSV)</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Download Progress Modal */}
      <Modal transparent visible={isDownloading} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {downloadProgress < 1 ? (
              <>
                <ActivityIndicator size="large" color={colors.success} />
                <Text style={[styles.modalTitle, { color: colors.text, marginTop: 16 }]}>Downloading Report...</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Preparing CSV for Class-wise Attendance</Text>
                <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceHighlight, marginTop: 24, width: '100%' }]}>
                  <View style={[styles.progressBarFill, { width: `${downloadProgress * 100}%`, backgroundColor: colors.success }]} />
                </View>
              </>
            ) : (
              <>
                <View style={[styles.successCircle, { backgroundColor: colors.success }]}>
                  <CheckCircle2 size={32} color="#FFF" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text, marginTop: 16 }]}>Download Complete!</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Report saved to your local storage.</Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function AnalyticsCard({ icon: Icon, value, label, color, colors }: any) {
  return (
    <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon size={24} color={color} style={{ marginBottom: 12 }} />
      <Text style={[styles.analyticsValue, { color }]}>{value}</Text>
      <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ClassReportCard({ title, subtitle, percentage, trend, overrideColor, colors }: any) {
  let color = colors.error;
  if (percentage >= 90) color = colors.success;
  else if (percentage >= 75) color = colors.warning;

  if (overrideColor) color = overrideColor;

  return (
    <View style={[styles.reportCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reportHeader}>
        <View>
          <Text style={[styles.reportTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.reportSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
        {trend === 'up' ? (
          <TrendingUp size={20} color={colors.textSecondary} />
        ) : (
          <TrendingDown size={20} color={colors.error} />
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Avg Attendance</Text>
          <Text style={[styles.progressValue, { color }]}>{percentage}%</Text>
        </View>

        <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceHighlight }]}>
          <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>

      <TouchableOpacity style={styles.detailsBtn}>
        <Text style={[styles.detailsText, { color: colors.success }]}>View Detailed Report</Text>
        <ArrowRight size={16} color={colors.success} />
      </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  analyticsCard: {
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
  analyticsValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  reportCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 12,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pillContainer: {
    gap: 12,
  },
  divPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  divPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

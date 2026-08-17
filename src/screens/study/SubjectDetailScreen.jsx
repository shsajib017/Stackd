import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useMaterials from '../../hooks/useMaterials';
import useNotes from '../../hooks/useNotes';
import useStudySessions from '../../hooks/useStudySessions';
import useUIStore from '../../store/useUIStore';
import { getHotTopics } from '../../supabase/topics';
import { getDaysRemaining } from '../../utils/formatDate';

import StatCard from '../../components/common/StatCard';
import HotTopicsTab from '../../components/study/HotTopicsTab';
import MaterialsTab from '../../components/study/MaterialsTab';
import NotesTab from '../../components/study/NotesTab';
import ScheduleTab from '../../components/study/ScheduleTab';
import AppHeader from '../../components/common/AppHeader';

const TABS = ['Schedule', 'Notes', 'Materials', 'Hot Topics'];

/** Complete Subject Detail Screen with 4 functional tabs, metrics, and floating edit button. */
const SubjectDetailScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 80 + 16;
  const subject = route.params?.subject || {};
  const [activeTab, setActiveTab] = useState('Schedule');
  const [hotTopics, setHotTopics] = useState([]);
  const [hotTopicsLoading, setHotTopicsLoading] = useState(false);

  const { sessions, isLoading: sessionsLoading, fetchSessions, markComplete, deleteSession } = useStudySessions();
  const { notes, isLoading: notesLoading, fetchNotes } = useNotes(subject.id);
  const { materials, isLoading: materialsLoading, isUploading, fetchMaterials, uploadMaterial } = useMaterials(subject.id);

  const subjectSessions = useMemo(() => (sessions || []).filter((s) => s.subject_id === subject.id), [sessions, subject.id]);
  const completedCount = useMemo(() => subjectSessions.filter((s) => s.completed).length, [subjectSessions]);

  const refreshAllData = useCallback(async () => {
    if (!subject?.id) return;
    fetchSessions();
    fetchNotes(subject.id);
    fetchMaterials(subject.id);
    try {
      setHotTopicsLoading(true);
      const data = await getHotTopics(subject.id);
      setHotTopics(data || []);
    } catch {
      setHotTopics([]);
    } finally {
      setHotTopicsLoading(false);
    }
  }, [fetchMaterials, fetchNotes, fetchSessions, subject?.id]);

  useFocusEffect(useCallback(() => { refreshAllData(); }, [refreshAllData]));

  const daysLeft = useMemo(() => subject.exam_date ? getDaysRemaining(subject.exam_date) : null, [subject.exam_date]);
  const examStatLabel = daysLeft === null ? 'No date' : (daysLeft === 0 ? 'Today!' : `${daysLeft}d left`);

  const showToast = useUIStore((state) => state.showToast);

  const handleUpload = useCallback(async () => {
    try {
      const res = await uploadMaterial(subject.id);
      if (res) showToast('Material uploaded successfully! 📄', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload document', 'error');
    }
  }, [showToast, subject.id, uploadMaterial]);

  const handleOpenPomodoro = useCallback((session) => {
    navigation.navigate('PomodoroModal', { session });
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <AppHeader title={subject.name || 'Subject Details'} showBack onBack={() => navigation.goBack()} />
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statWrap}><StatCard icon="⏳" value={examStatLabel} label="Exam" color={colors.accent} /></View>
        <View style={styles.statWrap}><StatCard icon="🎯" value={`${completedCount}/${subjectSessions.length}`} label="Sessions" color={colors.primary} /></View>
        <View style={styles.statWrap}><StatCard icon="🎓" value={`${subject.credit_hours || 3} cr`} label="Credits" color={colors.success} /></View>
        <View style={styles.statWrap}><StatCard icon="⭐" value={`${subject.difficulty || 3}★`} label="Level" color={colors.accent} /></View>
      </View>

      {/* Tab Navigation Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity key={tab} style={[styles.tabItem, isActive && styles.tabItemActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content Panels */}
      {activeTab === 'Schedule' && (
        <ScheduleTab sessions={subjectSessions} subject={subject} onToggleComplete={markComplete} onDeleteSession={deleteSession} onOpenPomodoro={handleOpenPomodoro} navigation={navigation} isLoading={sessionsLoading} />
      )}
      {activeTab === 'Notes' && (
        <NotesTab notes={notes} subjectId={subject.id} navigation={navigation} isLoading={notesLoading} />
      )}
      {activeTab === 'Materials' && (
        <MaterialsTab materials={materials} subjectId={subject.id} onUpload={handleUpload} navigation={navigation} isLoading={materialsLoading} isUploading={isUploading} />
      )}
      {activeTab === 'Hot Topics' && (
        <HotTopicsTab hotTopics={hotTopics} subjectId={subject.id} navigation={navigation} isLoading={hotTopicsLoading} />
      )}

      {/* Floating Edit Subject Button */}
      {activeTab !== 'Notes' && (
        <TouchableOpacity
          style={[styles.editFab, { bottom: fabBottom }]}
          onPress={() => navigation.navigate('AddSubjectScreen', { subject, mode: 'edit' })}
          activeOpacity={0.85}
        >
          <Text style={styles.editFabIcon}>✏️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerBtn: { paddingHorizontal: spacing.sm },
  headerIcon: { fontSize: fontSizes.xl, color: colors.surface, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.md, paddingTop: spacing.md, marginBottom: spacing.xs },
  statWrap: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: spacing.md, marginVertical: spacing.sm, borderRadius: borderRadius.md, padding: 3, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  tabItem: { flex: 1, paddingVertical: spacing.xs + 3, alignItems: 'center', borderRadius: borderRadius.sm },
  tabItemActive: { backgroundColor: colors.primary },
  tabText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
  tabTextActive: { color: colors.surface },
  editFab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.md, zIndex: 10 },
  editFabIcon: { fontSize: 24 },
});

export default SubjectDetailScreen;

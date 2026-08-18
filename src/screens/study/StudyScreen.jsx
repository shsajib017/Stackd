import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useStudySessions from '../../hooks/useStudySessions';
import useStreak from '../../hooks/useStreak';
import usePomodoro from '../../hooks/usePomodoro';
import { getSubjects } from '../../supabase/subjects';

import AppHeader from '../../components/common/AppHeader';
import StreakBadge from '../../components/study/StreakBadge';
import ActivePomodoroCard from '../../components/study/ActivePomodoroCard';
import SessionItem from '../../components/study/SessionItem';
import SubjectCard from '../../components/study/SubjectCard';
import StudyWeekChart from '../../components/study/StudyWeekChart';
import SectionHeader from '../../components/common/SectionHeader';
import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import SideDrawer from '../../components/common/SideDrawer';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/** Full Study Hub Screen for scheduling, active timers, subjects, and weekly progress. */
const StudyScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const { sessions, weeklyStudyMinutes, isLoading: sessionsLoading, fetchSessions, markComplete } = useStudySessions();
  const { studyStreak, fetchStreaks, isLoading: streakLoading } = useStreak();
  const { isRunning, isBreak, formattedTime } = usePomodoro();

  const weeklyHours = Math.round((weeklyStudyMinutes || 0) / 60);

  const refreshData = useCallback(() => {
    fetchSessions();
    fetchStreaks();
    if (user?.id) {
      setSubjectsLoading(true);
      getSubjects(user.id).then((data) => setSubjects(data || [])).catch(() => setSubjects([])).finally(() => setSubjectsLoading(false));
    }
  }, [fetchSessions, fetchStreaks, user?.id]);

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  const subjectProgressMap = useMemo(() => {
    const map = {};
    subjects.forEach((sub) => {
      const subSessions = (sessions || []).filter((s) => s.subject_id === sub.id);
      if (sub.target_hours && sub.target_hours > 0) {
        const completedMins = subSessions.filter((s) => s.completed).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        map[sub.id] = Math.min(1, completedMins / (sub.target_hours * 60));
      } else if (subSessions.length > 0) {
        const completedCount = subSessions.filter((s) => s.completed).length;
        map[sub.id] = completedCount / subSessions.length;
      } else {
        map[sub.id] = 0;
      }
    });
    return map;
  }, [sessions, subjects]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todaySessions = useMemo(() => (sessions || []).filter((s) => s.date === todayStr), [sessions, todayStr]);

  const renderHeader = useCallback(() => (
    <View>
      {streakLoading ? <SkeletonCard height={70} style={styles.mb} /> : <StreakBadge streak={studyStreak || 0} />}

      {isRunning && (
        <ActivePomodoroCard
          isRunning={isRunning}
          isBreak={isBreak}
          formattedTime={formattedTime}
          onPress={() => navigation.navigate('PomodoroModal')}
        />
      )}

      <SectionHeader title="Today" actionLabel="+ Add" onAction={() => navigation.navigate('ScheduleScreen')} />
      {sessionsLoading ? (
        <SkeletonCard height={80} style={styles.mb} />
      ) : todaySessions.length === 0 ? (
        <EmptyState icon="📚" title="No sessions today" subtitle="Generate a schedule or add a session manually" actionLabel="Generate schedule" onAction={() => navigation.navigate('AutoScheduleScreen')} />
      ) : (
        todaySessions.map((item) => (
          <SessionItem
            key={item.id}
            session={item}
            subject={subjects.find((s) => s.id === item.subject_id)}
            onToggleComplete={() => markComplete(item.id)}
            onPress={() => navigation.navigate('PomodoroModal', { session: item, subjectId: item.subject_id, subjectName: item.subjects?.name })}
          />
        ))
      )}

      <SectionHeader title="My Subjects" actionLabel="Manage" onAction={() => navigation.navigate('SubjectsScreen')} style={styles.sectionMargin} />
      {subjectsLoading ? (
        <SkeletonCard height={110} style={styles.mb} />
      ) : subjects.length === 0 ? (
        <EmptyState icon="📖" title="No subjects yet" subtitle="Add your subjects to start tracking" actionLabel="Add subject" onAction={() => navigation.navigate('AddSubjectScreen')} />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubjectCard subject={item} progress={subjectProgressMap[item.id] || 0} onPress={() => navigation.navigate('SubjectDetailScreen', { subject: item })} />
          )}
          contentContainerStyle={styles.subjectsList}
        />
      )}

      <SectionHeader title="This week" style={styles.sectionMargin} />
      <StudyWeekChart sessions={sessions || []} />

      <SectionHeader title="Quick Actions" style={styles.sectionMargin} />
      <View style={styles.toolsRow}>
        <TouchableOpacity style={[styles.toolCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]} onPress={() => navigation.navigate('PomodoroModal')} activeOpacity={0.75}>
          <Text style={styles.toolIcon}>⏱️</Text>
          <Text style={[styles.toolTitle, { color: theme.colors.textPrimary }]}>Pomodoro</Text>
          <Text style={[styles.toolSub, { color: theme.colors.textSecondary }]}>Focus timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toolCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]} onPress={() => navigation.navigate('PYQUploadScreen')} activeOpacity={0.75}>
          <Text style={styles.toolIcon}>📚</Text>
          <Text style={[styles.toolTitle, { color: theme.colors.textPrimary }]}>PYQ Hub</Text>
          <Text style={[styles.toolSub, { color: theme.colors.textSecondary }]}>Previous papers</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [formattedTime, isBreak, isRunning, markComplete, navigation, sessions, sessionsLoading, streakLoading, studyStreak, subjectProgressMap, subjects, subjectsLoading, theme.borderRadius.lg, theme.colors.primary, theme.colors.surface, theme.colors.textPrimary, theme.colors.textSecondary, theme.colors.textTertiary, todaySessions]);

  return (
    <ScreenWrapper>
      <AppHeader
        title="Study"
        onMenuPress={() => setDrawerVisible(true)}
        rightElement={
          <View style={[styles.headerRightBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Text style={[styles.headerRightText, { color: theme.colors.primary }]}>⏱ {weeklyHours} hrs</Text>
          </View>
        }
      />
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 + 16, backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('ScheduleScreen')}
        activeOpacity={0.8}
      >
        <Text style={[styles.fabIcon, { color: '#FFFFFF' }]}>+</Text>
      </TouchableOpacity>

      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  headerRightBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  headerRightText: { fontSize: 10, fontWeight: '700' },
  scrollContent: { paddingVertical: 8, paddingBottom: 120 },
  sectionMargin: { marginTop: 16 },
  mb: { marginBottom: 8 },
  subjectsList: { gap: 8, paddingVertical: 4 },
  toolsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toolCard: { flex: 1, padding: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  toolIcon: { fontSize: 24, marginBottom: 4 },
  toolTitle: { fontSize: 13, fontWeight: '700' },
  toolSub: { fontSize: 10, marginTop: 2 },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5, zIndex: 99 },
  fabIcon: { fontSize: 28, fontWeight: 'bold', lineHeight: 30 },
});

export default StudyScreen;

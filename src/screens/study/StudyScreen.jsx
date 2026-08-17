import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
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

/** Full Study Hub Screen for scheduling, active timers, subjects, and weekly progress. */
const StudyScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
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
        <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('PomodoroModal')} activeOpacity={0.75}>
          <Text style={styles.toolIcon}>⏱️</Text><Text style={styles.toolTitle}>Pomodoro</Text><Text style={styles.toolSub}>Focus timer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('PyqHubScreen')} activeOpacity={0.75}>
          <Text style={styles.toolIcon}>📚</Text><Text style={styles.toolTitle}>PYQ Hub</Text><Text style={styles.toolSub}>Previous papers</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [formattedTime, isBreak, isRunning, markComplete, navigation, sessions, sessionsLoading, streakLoading, studyStreak, subjectProgressMap, subjects, subjectsLoading, todaySessions]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Study"
        onMenuPress={() => setDrawerVisible(true)}
        rightElement={
          <View style={styles.headerRightBadge}>
            <Text style={styles.headerRightText}>⏱ {weeklyHours} hrs</Text>
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

      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 80 + 16 }]} onPress={() => navigation.navigate('ScheduleScreen')} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRightBadge: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm + 2, paddingVertical: 4, borderRadius: borderRadius.full },
  headerRightText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xxl + 80 },
  sectionMargin: { marginTop: spacing.md },
  mb: { marginBottom: spacing.sm },
  subjectsList: { gap: spacing.sm, paddingVertical: spacing.xs },
  toolsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  toolCard: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  toolIcon: { fontSize: 24, marginBottom: 4 },
  toolTitle: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary },
  toolSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  fab: { position: 'absolute', right: spacing.md, width: 56, height: 56, borderRadius: borderRadius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 99 },
  fabIcon: { fontSize: 28, color: colors.surface, fontWeight: 'bold', lineHeight: 30 },
});

export default StudyScreen;

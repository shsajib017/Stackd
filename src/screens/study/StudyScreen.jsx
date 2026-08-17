import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useStudySessions from '../../hooks/useStudySessions';
import useStreak from '../../hooks/useStreak';
import { getSubjects } from '../../supabase/subjects';

import SubjectCard from '../../components/study/SubjectCard';
import SectionHeader from '../../components/common/SectionHeader';
import SideDrawer from '../../components/common/SideDrawer';

/** Study Tab Home Screen */
const StudyScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const { sessions, weeklyStudyMinutes, fetchSessions } = useStudySessions();
  const weeklyHours = Math.round((weeklyStudyMinutes || 0) / 60);
  const { fetchStreaks } = useStreak();

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.headerMenuBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
        >
          <Text style={styles.headerMenuIcon}>☰</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightBadge}><Text style={styles.headerRightText}>⏱ {weeklyHours}h this week</Text></View>
      ),
    });
  }, [navigation, weeklyHours]);

  const refreshData = useCallback(() => {
    fetchSessions();
    fetchStreaks();
  }, [fetchSessions, fetchStreaks]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
      if (user?.id) {
        getSubjects(user.id).then((data) => setSubjects(data || [])).catch(() => setSubjects([]));
      }
    }, [refreshData, user?.id])
  );

  const todaySessions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return (sessions || []).filter((s) => s.date === today);
  }, [sessions]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SectionHeader title="Today" actionLabel="+ Add" onAction={() => navigation.navigate('ScheduleScreen')} />
        {todaySessions.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No study sessions scheduled for today</Text></View>
        ) : (
          todaySessions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.todayCard} onPress={() => navigation.navigate('PomodoroModal', { subjectId: item.subject_id, subjectName: item.subjects?.name })} activeOpacity={0.75}>
              <View><Text style={styles.todayTitle}>{item.subjects?.name || 'Study Session'}</Text><Text style={styles.todaySub}>{item.duration_minutes || 25} mins</Text></View>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          ))
        )}

        <SectionHeader title="My Subjects" actionLabel="Manage" onAction={() => navigation.navigate('SubjectsScreen')} style={styles.sectionMargin} />
        {subjects.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No subjects added yet</Text></View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={subjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SubjectCard
                subject={item}
                progress={subjectProgressMap[item.id] || 0}
                onPress={() => navigation.navigate('SubjectDetailScreen', { subject: item })}
              />
            )}
            contentContainerStyle={styles.subjectsList}
          />
        )}

        <SectionHeader title="Quick Actions" style={styles.sectionMargin} />
        <View style={styles.toolsRow}>
          <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('PomodoroModal')} activeOpacity={0.75}>
            <Text style={styles.toolIcon}>⏱️</Text><Text style={styles.toolTitle}>Pomodoro</Text><Text style={styles.toolSub}>Focus timer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('PyqHubScreen')} activeOpacity={0.75}>
            <Text style={styles.toolIcon}>📚</Text><Text style={styles.toolTitle}>PYQ Hub</Text><Text style={styles.toolSub}>Previous papers</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Add Session Button */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 80 + 16 }]} onPress={() => navigation.navigate('ScheduleScreen')} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerMenuBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerMenuIcon: { fontSize: 24, color: colors.textPrimary, fontWeight: '700' },
  headerRightBadge: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm + 2, paddingVertical: 4, borderRadius: borderRadius.full, marginRight: spacing.xs },
  headerRightText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xxl + 80 },
  sectionMargin: { marginTop: spacing.lg },
  todayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, marginVertical: 3, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  todayTitle: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary },
  todaySub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  playIcon: { fontSize: fontSizes.md, color: colors.primary, fontWeight: '800' },
  subjectsList: { gap: spacing.sm, paddingVertical: spacing.xs },
  emptyCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginVertical: spacing.xs, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  emptyText: { color: colors.textTertiary, fontSize: fontSizes.sm, fontWeight: '600' },
  toolsRow: { flexDirection: 'row', gap: spacing.sm },
  toolCard: { flex: 1, backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  toolIcon: { fontSize: 24, marginBottom: 4 },
  toolTitle: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary },
  toolSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  fab: { position: 'absolute', right: spacing.md, width: 56, height: 56, borderRadius: borderRadius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 99 },
  fabIcon: { fontSize: 28, color: colors.surface, fontWeight: 'bold', lineHeight: 30 },
});

export default StudyScreen;

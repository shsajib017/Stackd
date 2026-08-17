import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import { formatDateForDB, formatDateShort } from '../../utils/formatDate';

import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import AddSessionSheet from '../../components/study/AddSessionSheet';
import DayTabsRow from '../../components/study/DayTabsRow';
import SessionItem from '../../components/study/SessionItem';
import WeekSummaryBar from '../../components/study/WeekSummaryBar';
import AppHeader from '../../components/common/AppHeader';

const getWeekDays = (baseDate = new Date()) => {
  const current = new Date(baseDate);
  const distanceToMonday = (current.getDay() + 6) % 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
};

/** Weekly Timetable & Study Schedule Screen. */
const ScheduleScreen = React.memo(({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddSheet, setShowAddSheet] = useState(false);

  const { sessions, isLoading, fetchSessions, addSession, markComplete } = useStudySessions();
  const subjects = useStudyStore((state) => state.subjects);
  const subjectsMap = useMemo(() => (subjects || []).reduce((acc, s) => { acc[s.id] = s; return acc; }, {}), [subjects]);

  const baseWeekDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(baseWeekDate), [baseWeekDate]);

  useFocusEffect(useCallback(() => { fetchSessions(); }, [fetchSessions]));

  const weekRangeLabel = useMemo(() => `${formatDateShort(weekDays[0])} - ${formatDateShort(weekDays[6])}`, [weekDays]);
  const weekDateStrs = useMemo(() => new Set(weekDays.map((d) => formatDateForDB(d))), [weekDays]);
  const weekSessions = useMemo(() => (sessions || []).filter((s) => weekDateStrs.has(s.date)), [sessions, weekDateStrs]);

  const sessionsCountMap = useMemo(() => {
    const map = {};
    (sessions || []).forEach((s) => { map[s.date] = (map[s.date] || 0) + 1; });
    return map;
  }, [sessions]);

  const selectedDateStr = useMemo(() => formatDateForDB(selectedDate), [selectedDate]);
  const selectedDaySessions = useMemo(() => (sessions || []).filter((s) => s.date === selectedDateStr), [selectedDateStr, sessions]);

  const selectedDayPlannedMinutes = useMemo(() => selectedDaySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0), [selectedDaySessions]);
  const selectedDayTimeLabel = useMemo(() => {
    const hrs = Math.floor(selectedDayPlannedMinutes / 60);
    const mins = selectedDayPlannedMinutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m planned` : `${mins}m planned`;
  }, [selectedDayPlannedMinutes]);

  const weekStats = useMemo(() => {
    const completed = weekSessions.filter((s) => s.completed).length;
    const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return { total: weekSessions.length, completed, totalMinutes };
  }, [weekSessions]);

  const handleToggleComplete = useCallback(async (sessionId) => {
    try { await markComplete(sessionId); } catch {}
  }, [markComplete]);

  const handleAddSession = useCallback(async (sessionData) => {
    await addSession(sessionData);
    fetchSessions();
  }, [addSession, fetchSessions]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.weekNavRow}>
        <TouchableOpacity onPress={() => setWeekOffset((p) => p - 1)} style={styles.weekArrowBtn}><Text style={styles.weekArrow}>‹</Text></TouchableOpacity>
        <View style={styles.weekCenter}>
          <Text style={styles.weekRangeText}>{weekRangeLabel}</Text>
          {weekOffset !== 0 ? (
            <TouchableOpacity onPress={() => { setWeekOffset(0); setSelectedDate(new Date()); }} style={styles.thisWeekPill}>
              <Text style={styles.thisWeekText}>This week</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => setWeekOffset((p) => p + 1)} style={styles.weekArrowBtn}><Text style={styles.weekArrow}>›</Text></TouchableOpacity>
      </View>
      <DayTabsRow days={weekDays} selectedDate={selectedDate} onSelectDay={setSelectedDate} sessionsByDate={sessionsCountMap} />
      <View style={styles.daySummaryHeader}>
        <View>
          <Text style={styles.daySummaryTitle}>{formatDateShort(selectedDate)} Sessions</Text>
          <Text style={styles.daySummaryTime}>{selectedDayTimeLabel}</Text>
        </View>
        <TouchableOpacity style={styles.addDayBtn} onPress={() => setShowAddSheet(true)} activeOpacity={0.8}>
          <Text style={styles.addDayBtnText}>+ Add session</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [selectedDate, selectedDayTimeLabel, sessionsCountMap, weekDays, weekOffset, weekRangeLabel]);

  const renderFooter = useCallback(() => (
    <View style={styles.footerSummary}>
      <Text style={styles.footerTitle}>Weekly Overview</Text>
      <WeekSummaryBar totalSessions={weekStats.total} completed={weekStats.completed} totalMinutes={weekStats.totalMinutes} />
      <TouchableOpacity style={styles.autoGenBanner} onPress={() => navigation.navigate('AutoScheduleScreen')} activeOpacity={0.8}>
        <Text style={styles.autoGenText}>✨ Need an optimal study plan? Auto-generate schedule →</Text>
      </TouchableOpacity>
    </View>
  ), [navigation, weekStats]);

  const renderEmptyOrLoading = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingBox}><SkeletonCard height={60} style={styles.mb} /><SkeletonCard height={60} /></View>
      );
    }
    return (
      <EmptyState icon="📅" title="No sessions on this day" subtitle="Add a session to keep up with your study goals" actionLabel="+ Add session" onAction={() => setShowAddSheet(true)} />
    );
  }, [isLoading]);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Schedule"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('AutoScheduleScreen')} style={styles.genBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={styles.genBtnText}>⚡ Generate</Text>
          </TouchableOpacity>
        }
      />
      <FlatList
        data={isLoading ? [] : selectedDaySessions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <SessionItem session={item} subject={subjectsMap[item.subject_id]} onToggleComplete={handleToggleComplete} onPress={(sess) => navigation.navigate('PomodoroModal', { session: sess })} />
        )}
        ListEmptyComponent={renderEmptyOrLoading}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <AddSessionSheet visible={showAddSheet} onClose={() => setShowAddSheet(false)} selectedDate={selectedDate} subjects={subjects} onAddSession={handleAddSession} />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerBtn: { paddingHorizontal: spacing.sm },
  headerBackIcon: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  genBtn: { backgroundColor: `${colors.accent}20`, paddingHorizontal: spacing.sm + 4, paddingVertical: 6, borderRadius: borderRadius.full, marginRight: spacing.xs },
  genBtnText: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.accent },
  weekNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  weekArrowBtn: { padding: spacing.xs },
  weekArrow: { fontSize: fontSizes.xxl, fontWeight: '800', color: colors.primary },
  weekCenter: { alignItems: 'center' },
  weekRangeText: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary },
  thisWeekPill: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.xs + 4, paddingVertical: 2, borderRadius: borderRadius.sm, marginTop: 2 },
  thisWeekText: { fontSize: fontSizes.xs - 2, fontWeight: '700', color: colors.primary },
  daySummaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.xs },
  daySummaryTitle: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.textPrimary },
  daySummaryTime: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.accent },
  addDayBtn: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: borderRadius.full },
  addDayBtnText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  listContent: { paddingBottom: 60 },
  loadingBox: { paddingHorizontal: spacing.md, marginVertical: spacing.sm },
  mb: { marginBottom: spacing.sm },
  footerSummary: { marginTop: spacing.md, paddingHorizontal: spacing.md },
  footerTitle: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
  autoGenBanner: { marginTop: spacing.sm, padding: spacing.sm + 2, backgroundColor: `${colors.primary}10`, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.primary}30`, alignItems: 'center' },
  autoGenText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
});

export default ScheduleScreen;

import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import { formatDateForDB, formatDateShort } from '../../utils/formatDate';

import EmptyState from '../../components/common/EmptyState';
import SkeletonCard from '../../components/common/SkeletonCard';
import AddSessionSheet from '../../components/study/AddSessionSheet';
import DayTabsRow from '../../components/study/DayTabsRow';
import SessionItem from '../../components/study/SessionItem';
import WeekSummaryBar from '../../components/study/WeekSummaryBar';
import ScreenWrapper from '../../components/common/ScreenWrapper';
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
  const { theme } = useTheme();
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
        <TouchableOpacity onPress={() => setWeekOffset((p) => p - 1)} style={styles.weekArrowBtn}>
          <Text style={[styles.weekArrow, { color: theme.colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.weekCenter}>
          <Text style={[styles.weekRangeText, { color: theme.colors.textPrimary }]}>{weekRangeLabel}</Text>
          {weekOffset !== 0 ? (
            <TouchableOpacity onPress={() => { setWeekOffset(0); setSelectedDate(new Date()); }} style={[styles.thisWeekPill, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Text style={[styles.thisWeekText, { color: theme.colors.primary }]}>This week</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity onPress={() => setWeekOffset((p) => p + 1)} style={styles.weekArrowBtn}>
          <Text style={[styles.weekArrow, { color: theme.colors.primary }]}>›</Text>
        </TouchableOpacity>
      </View>
      <DayTabsRow days={weekDays} selectedDate={selectedDate} onSelectDay={setSelectedDate} sessionsByDate={sessionsCountMap} />
      <View style={styles.daySummaryHeader}>
        <View>
          <Text style={[styles.daySummaryTitle, { color: theme.colors.textPrimary }]}>{formatDateShort(selectedDate)} Sessions</Text>
          <Text style={[styles.daySummaryTime, { color: theme.colors.accent }]}>{selectedDayTimeLabel}</Text>
        </View>
        <TouchableOpacity style={[styles.addDayBtn, { backgroundColor: `${theme.colors.primary}15` }]} onPress={() => setShowAddSheet(true)} activeOpacity={0.8}>
          <Text style={[styles.addDayBtnText, { color: theme.colors.primary }]}>+ Add session</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [selectedDate, selectedDayTimeLabel, sessionsCountMap, theme.colors.accent, theme.colors.primary, theme.colors.textPrimary, weekDays, weekOffset, weekRangeLabel]);

  const renderFooter = useCallback(() => (
    <View style={styles.footerSummary}>
      <Text style={[styles.footerTitle, { color: theme.colors.textSecondary }]}>Weekly Overview</Text>
      <WeekSummaryBar totalSessions={weekStats.total} completed={weekStats.completed} totalMinutes={weekStats.totalMinutes} />
      <TouchableOpacity
        style={[styles.autoGenBanner, { backgroundColor: `${theme.colors.primary}10`, borderColor: `${theme.colors.primary}30`, borderRadius: theme.borderRadius.md }]}
        onPress={() => navigation.navigate('AutoScheduleScreen')}
        activeOpacity={0.8}
      >
        <Text style={[styles.autoGenText, { color: theme.colors.primary }]}>✨ Need an optimal study plan? Auto-generate schedule →</Text>
      </TouchableOpacity>
    </View>
  ), [navigation, theme.borderRadius.md, theme.colors.primary, theme.colors.textSecondary, weekStats]);

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
    <ScreenWrapper>
      <AppHeader
        title="Schedule"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('AutoScheduleScreen')} style={[styles.genBtn, { backgroundColor: `${theme.colors.accent}20` }]} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={[styles.genBtnText, { color: theme.colors.accent }]}>⚡ Generate</Text>
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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  genBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 4 },
  genBtnText: { fontSize: 10, fontWeight: '800' },
  weekNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  weekArrowBtn: { padding: 4 },
  weekArrow: { fontSize: 24, fontWeight: '800' },
  weekCenter: { alignItems: 'center' },
  weekRangeText: { fontSize: 13, fontWeight: '800' },
  thisWeekPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  thisWeekText: { fontSize: 8, fontWeight: '700' },
  daySummaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  daySummaryTitle: { fontSize: 12, fontWeight: '800' },
  daySummaryTime: { fontSize: 10, fontWeight: '700' },
  addDayBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  addDayBtnText: { fontSize: 10, fontWeight: '700' },
  listContent: { paddingBottom: 60 },
  loadingBox: { marginVertical: 8 },
  mb: { marginBottom: 8 },
  footerSummary: { marginTop: 16 },
  footerTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  autoGenBanner: { marginTop: 8, padding: 10, borderWidth: 1, alignItems: 'center' },
  autoGenText: { fontSize: 10, fontWeight: '700' },
});

export default ScheduleScreen;

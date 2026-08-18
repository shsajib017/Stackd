import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useSchedule from '../../hooks/useSchedule';
import useStudySessions from '../../hooks/useStudySessions';
import useStudyStore from '../../store/useStudyStore';
import useUIStore from '../../store/useUIStore';
import { formatDate, getDaysRemaining } from '../../utils/formatDate';

import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import DailyHoursInput from '../../components/study/DailyHoursInput';
import SchedulePreview from '../../components/study/SchedulePreview';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const LENGTHS = [25, 45, 60];
const DEFAULT_HOURS = { monday: 4, tuesday: 4, wednesday: 4, thursday: 4, friday: 4, saturday: 2, sunday: 2 };

/** Automated AI-driven Timetable Generation Screen. */
const AutoScheduleScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const subjects = useStudyStore((state) => state.subjects);
  const showToast = useUIStore((state) => state.showToast);
  const { generateSchedule, applySchedule, isGenerating, generatedSessions } = useSchedule();
  const { fetchSessions } = useStudySessions();

  useFocusEffect(useCallback(() => { fetchSessions(); }, [fetchSessions]));

  const [availableHours, setAvailableHours] = useState(DEFAULT_HOURS);
  const [sessionLength, setSessionLength] = useState(45);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; });
  const [errorMessage, setErrorMessage] = useState(null);

  const subjectsMap = useMemo(() => (subjects || []).reduce((acc, s) => { acc[s.id] = s; return acc; }, {}), [subjects]);

  const nearestExamDays = useMemo(() => {
    let minDays = null;
    (subjects || []).forEach((s) => {
      if (s.exam_date) {
        const days = getDaysRemaining(s.exam_date);
        if (days >= 0 && (minDays === null || days < minDays)) minDays = days;
      }
    });
    return minDays;
  }, [subjects]);

  const handleHourChange = useCallback((dayKey, val) => {
    setAvailableHours((prev) => ({ ...prev, [dayKey]: val }));
  }, []);

  const handleGenerate = useCallback(() => {
    setErrorMessage(null);
    if (!subjects?.length) { setErrorMessage('Please add at least one subject first.'); return; }
    const totalHrs = Object.values(availableHours).reduce((sum, h) => sum + (h || 0), 0);
    if (totalHrs <= 0) { setErrorMessage('Please allocate study hours for at least one day.'); return; }
    generateSchedule(subjects, availableHours, sessionLength, startDate);
  }, [availableHours, generateSchedule, sessionLength, startDate, subjects]);

  const handleApply = useCallback(async () => {
    try {
      await applySchedule(generatedSessions);
      showToast('Schedule applied successfully! 🚀', 'success');
      navigation.navigate('ScheduleScreen');
    } catch (err) {
      showToast(err.message || 'Failed to apply schedule', 'error');
    }
  }, [applySchedule, generatedSessions, navigation, showToast]);

  return (
    <ScreenWrapper>
      <AppHeader title="Generate Schedule" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        {/* Intro Card */}
        <View style={[styles.introCard, { backgroundColor: `${theme.colors.primary}12`, borderColor: `${theme.colors.primary}30`, borderRadius: theme.borderRadius.lg }]}>
          <Text style={[styles.introTitle, { color: theme.colors.primary }]}>Smart Timetable Generator</Text>
          <Text style={[styles.introSub, { color: theme.colors.textPrimary }]}>Stackd intelligently balances study sessions prioritized by exam proximity and difficulty.</Text>
          <View style={styles.introBadgeRow}>
            <View style={[styles.introBadge, { backgroundColor: `${theme.colors.primary}18`, borderRadius: theme.borderRadius.sm }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primary }]}>📚 {subjects?.length || 0} Subjects</Text>
            </View>
            {nearestExamDays !== null && (
              <View style={[styles.introBadge, { backgroundColor: `${theme.colors.accent}18`, borderRadius: theme.borderRadius.sm }]}>
                <Text style={[styles.badgeText, { color: theme.colors.accent }]}>⏳ Exam in {nearestExamDays}d</Text>
              </View>
            )}
          </View>
        </View>

        {/* Subjects Overview */}
        {!subjects?.length ? (
          <EmptyState icon="📚" title="No subjects added yet" subtitle="Add your course subjects to generate a study timetable" actionLabel="Add subject" onAction={() => navigation.navigate('AddSubjectScreen')} style={styles.mb} />
        ) : (
          <View style={[styles.subjectsBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>Detected Subjects ({subjects.length})</Text>
            {subjects.map((sub) => (
              <View key={sub.id} style={styles.subRow}>
                <View style={[styles.subDot, { backgroundColor: sub.color || theme.colors.primary }]} />
                <Text style={[styles.subName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{sub.name}</Text>
                <Text style={[styles.subInfo, { color: theme.colors.textSecondary }]}>{sub.exam_date ? `Exam ${formatDate(sub.exam_date)}` : 'No exam date'} • {sub.difficulty || 3}★</Text>
              </View>
            ))}
          </View>
        )}

        <DailyHoursInput availableHours={availableHours} onChangeHours={handleHourChange} />

        <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Preferred Session Length</Text>
        <View style={styles.lengthRow}>
          {LENGTHS.map((len) => {
            const active = sessionLength === len;
            return (
              <TouchableOpacity
                key={len}
                style={[
                  styles.lengthPill,
                  { borderRadius: theme.borderRadius.md, backgroundColor: active ? theme.colors.primary : theme.colors.surface, borderColor: active ? theme.colors.primary : `${theme.colors.textTertiary}20` },
                ]}
                onPress={() => setSessionLength(len)}
              >
                <Text style={[styles.lengthText, { color: active ? theme.colors.surface : theme.colors.textPrimary }]}>{len} min</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>Start Date</Text>
        <View style={[styles.dateBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
          <Text style={[styles.dateBoxText, { color: theme.colors.textPrimary }]}>📅 Tomorrow ({formatDate(startDate)})</Text>
        </View>

        {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}

        {isGenerating ? (
          <View style={[styles.loadingBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md }]}>
            <ActivityIndicator color={theme.colors.primary} size="small" />
            <Text style={[styles.loadingText, { color: theme.colors.primary }]}>Building optimal schedule...</Text>
          </View>
        ) : (
          <Button label="Generate schedule" onPress={handleGenerate} fullWidth style={styles.genBtn} />
        )}

        {generatedSessions.length > 0 && (
          <View>
            <SchedulePreview sessions={generatedSessions} subjectsMap={subjectsMap} />
            <Button label="Apply to schedule" onPress={handleApply} fullWidth style={styles.applyBtn} />
            <Button label="Regenerate" variant="secondary" onPress={handleGenerate} fullWidth style={styles.regenBtn} />
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingVertical: 8, paddingBottom: 100 },
  introCard: { padding: 16, marginBottom: 16, borderWidth: 1 },
  introTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  introSub: { fontSize: 11, lineHeight: 18, marginBottom: 8 },
  introBadgeRow: { flexDirection: 'row', gap: 6 },
  introBadge: { paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  subjectsBox: { padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionHeader: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  subDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  subName: { fontSize: 12, fontWeight: '700', flex: 1, marginRight: 6 },
  subInfo: { fontSize: 9, fontWeight: '500' },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 4 },
  lengthRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  lengthPill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderWidth: 1 },
  lengthText: { fontSize: 11, fontWeight: '700' },
  dateBox: { padding: 16, borderWidth: 1, marginBottom: 16 },
  dateBoxText: { fontSize: 12, fontWeight: '600' },
  errorBanner: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  genBtn: { marginTop: 4 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, marginTop: 4 },
  loadingText: { fontSize: 12, fontWeight: '700' },
  applyBtn: { marginTop: 8 },
  regenBtn: { marginTop: 4 },
  mb: { marginBottom: 16 },
});

export default AutoScheduleScreen;

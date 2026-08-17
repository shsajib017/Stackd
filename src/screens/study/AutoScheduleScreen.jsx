import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
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

const LENGTHS = [25, 45, 60];
const DEFAULT_HOURS = { monday: 4, tuesday: 4, wednesday: 4, thursday: 4, friday: 4, saturday: 2, sunday: 2 };

/** Automated AI-driven Timetable Generation Screen. */
const AutoScheduleScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Generate Schedule',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 220 }]} showsVerticalScrollIndicator={false}>
      {/* Intro Card */}
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Smart Timetable Generator</Text>
        <Text style={styles.introSub}>Stackd intelligently balances study sessions prioritized by exam proximity and difficulty.</Text>
        <View style={styles.introBadgeRow}>
          <View style={styles.introBadge}><Text style={styles.badgeText}>📚 {subjects?.length || 0} Subjects</Text></View>
          {nearestExamDays !== null && (
            <View style={[styles.introBadge, styles.badgeOrange]}><Text style={[styles.badgeText, styles.textOrange]}>⏳ Exam in {nearestExamDays}d</Text></View>
          )}
        </View>
      </View>

      {/* Subjects Overview */}
      {!subjects?.length ? (
        <EmptyState icon="📚" title="No subjects added yet" subtitle="Add your course subjects to generate a study timetable" actionLabel="Add subject" onAction={() => navigation.navigate('AddSubjectScreen')} style={styles.mb} />
      ) : (
        <View style={styles.subjectsBox}>
          <Text style={styles.sectionHeader}>Detected Subjects ({subjects.length})</Text>
          {subjects.map((sub) => (
            <View key={sub.id} style={styles.subRow}>
              <View style={[styles.subDot, { backgroundColor: sub.color || colors.primary }]} />
              <Text style={styles.subName} numberOfLines={1}>{sub.name}</Text>
              <Text style={styles.subInfo}>{sub.exam_date ? `Exam ${formatDate(sub.exam_date)}` : 'No exam date'} • {sub.difficulty || 3}★</Text>
            </View>
          ))}
        </View>
      )}

      <DailyHoursInput availableHours={availableHours} onChangeHours={handleHourChange} />

      <Text style={styles.sectionLabel}>Preferred Session Length</Text>
      <View style={styles.lengthRow}>
        {LENGTHS.map((len) => {
          const active = sessionLength === len;
          return (
            <TouchableOpacity key={len} style={[styles.lengthPill, active && styles.lengthPillActive]} onPress={() => setSessionLength(len)}>
              <Text style={[styles.lengthText, active && styles.textWhite]}>{len} min</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Start Date</Text>
      <View style={styles.dateBox}><Text style={styles.dateBoxText}>📅 Tomorrow ({formatDate(startDate)})</Text></View>

      {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}

      {isGenerating ? (
        <View style={styles.loadingBox}><ActivityIndicator color={colors.primary} size="small" /><Text style={styles.loadingText}>Building optimal schedule...</Text></View>
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
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBtn: { paddingHorizontal: spacing.sm },
  headerBackIcon: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  content: { padding: spacing.md, paddingBottom: 100 },
  introCard: { backgroundColor: `${colors.primary}12`, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.primary}30` },
  introTitle: { fontSize: fontSizes.md + 1, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  introSub: { fontSize: fontSizes.xs, color: colors.textPrimary, lineHeight: 18, marginBottom: spacing.sm },
  introBadgeRow: { flexDirection: 'row', gap: spacing.xs },
  introBadge: { backgroundColor: `${colors.primary}18`, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  badgeOrange: { backgroundColor: `${colors.accent}18` },
  badgeText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  textOrange: { color: colors.accent },
  subjectsBox: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  sectionHeader: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs + 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  subDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs + 2 },
  subName: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary, flex: 1, marginRight: spacing.xs },
  subInfo: { fontSize: fontSizes.xs - 1, color: colors.textSecondary, fontWeight: '500' },
  sectionLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.xs },
  lengthRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  lengthPill: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  lengthPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  lengthText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textPrimary },
  textWhite: { color: colors.surface },
  dateBox: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.md },
  dateBoxText: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginBottom: spacing.sm },
  genBtn: { marginTop: spacing.xs },
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, marginTop: spacing.xs },
  loadingText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
  applyBtn: { marginTop: spacing.sm },
  regenBtn: { marginTop: spacing.xs },
  mb: { marginBottom: spacing.md },
});

export default AutoScheduleScreen;

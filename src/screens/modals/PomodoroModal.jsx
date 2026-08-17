import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useNotifications from '../../hooks/useNotifications';
import usePomodoro from '../../hooks/usePomodoro';
import useStudySessions from '../../hooks/useStudySessions';

import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusChip from '../../components/common/StatusChip';
import CircularTimer from '../../components/study/CircularTimer';

/** Fullscreen Pomodoro Focus Timer Modal. */
const PomodoroModal = React.memo(({ navigation, route }) => {
  const session = route.params?.session || {};
  const subjectName = session.subject_name || session.subjectName || session.topic || 'Focus Session';
  const subjectColor = session.color || session.subjectColor || colors.primary;
  const initialDuration = session.duration_minutes || session.durationMinutes || 25;

  const { seconds, totalSeconds, progress, isRunning, isBreak, completedSessions, formattedTime, start, pause, resume, skip } = usePomodoro(initialDuration);
  const { scheduleStudyReminder } = useNotifications();

  const [sessionNotes, setSessionNotes] = useState(session.notes || '');
  const [showExitModal, setShowExitModal] = useState(false);
  const [celebration, setCelebration] = useState(false);

  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    if (seconds === 0 && !isBreak) {
      setCelebration(true);
      const timer = setTimeout(() => { setCelebration(false); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isBreak, seconds]);

  const elapsedSeconds = useMemo(() => Math.max(0, totalSeconds - seconds), [seconds, totalSeconds]);
  const completedMinutes = useMemo(() => Math.max(1, Math.round(elapsedSeconds / 60)), [elapsedSeconds]);

  const handleConfirmExit = useCallback(() => {
    setShowExitModal(false);
    navigation.replace('SessionCompleteModal', {
      session,
      completedMinutes,
      notes: sessionNotes,
      isEarlyExit: true,
    });
  }, [completedMinutes, navigation, session, sessionNotes]);

  const handleFinishAll = useCallback(() => {
    navigation.replace('SessionCompleteModal', {
      session,
      completedMinutes: initialDuration,
      notes: sessionNotes,
      isEarlyExit: false,
    });
  }, [initialDuration, navigation, session, sessionNotes]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Tinted Top Header */}
      <View style={[styles.header, { backgroundColor: `${subjectColor}15` }]}>
        <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.exitBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.exitIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{subjectName}</Text>
        <TouchableOpacity onPress={handleFinishAll} style={styles.doneBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.doneBtnText, { color: subjectColor }]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Phase Indicator & Stats */}
      <View style={styles.phaseRow}>
        <StatusChip label={isBreak ? '☕ Rest Phase' : '🎯 Focus Phase'} type={isBreak ? 'success' : 'info'} size="md" />
        <Text style={styles.sessionCounter}>Session {completedSessions + 1} today</Text>
      </View>

      {/* SVG Circular Timer */}
      <View style={styles.timerWrap}>
        <CircularTimer progress={progress} formattedTime={formattedTime} ringColor={subjectColor} isBreak={isBreak} celebration={celebration} />
      </View>

      {/* Controls */}
      <View style={styles.controlRow}>
        <Button
          label={isRunning ? '❚❚  Pause' : '▶  Resume'}
          onPress={isRunning ? pause : resume}
          size="lg"
          style={[styles.playBtn, { backgroundColor: subjectColor }]}
        />
        <TouchableOpacity onPress={skip} style={styles.skipBtn} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipBtnText}>⏭ Skip to {isBreak ? 'Focus' : 'Break'}</Text>
        </TouchableOpacity>
      </View>

      {/* Slide-in Notes Drawer when Paused */}
      {!isRunning && (
        <View style={styles.notesDrawer}>
          <Text style={styles.drawerLabel}>📝 Session Notes (Saved on completion)</Text>
          <TextInput
            style={styles.notesInput}
            value={sessionNotes}
            onChangeText={setSessionNotes}
            placeholder="Add a note or formula about this session..."
            placeholderTextColor={colors.textTertiary}
            maxLength={140}
          />
        </View>
      )}

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        visible={showExitModal}
        title="Stop this session?"
        message="Your elapsed progress will be saved to your study log."
        confirmLabel="End session"
        cancelLabel="Continue"
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitModal(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  exitBtn: { padding: spacing.xs },
  exitIcon: { fontSize: fontSizes.lg, color: colors.textPrimary, fontWeight: '700' },
  headerTitle: { fontSize: fontSizes.md + 1, fontWeight: '800', color: colors.textPrimary, flex: 1, textAlign: 'center', marginHorizontal: spacing.sm },
  doneBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  doneBtnText: { fontSize: fontSizes.sm, fontWeight: '800' },
  phaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  sessionCounter: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary },
  timerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controlRow: { alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  playBtn: { width: 220, borderRadius: borderRadius.full },
  skipBtn: { paddingVertical: spacing.xs },
  skipBtnText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary },
  notesDrawer: { marginHorizontal: spacing.md, marginBottom: spacing.lg, backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  drawerLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.xs },
  notesInput: { fontSize: fontSizes.sm, color: colors.textPrimary, padding: 0 },
});

export default PomodoroModal;

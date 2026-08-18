import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useNotifications from '../../hooks/useNotifications';
import usePomodoro from '../../hooks/usePomodoro';

import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusChip from '../../components/common/StatusChip';
import CircularTimer from '../../components/study/CircularTimer';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/** Fullscreen Pomodoro Focus Timer Modal. */
const PomodoroModal = React.memo(({ navigation, route }) => {
  const { theme } = useTheme();
  const session = route.params?.session || {};
  const subjectName = session.subject_name || session.subjectName || session.topic || 'Focus Session';
  const subjectColor = session.color || session.subjectColor || theme.colors.primary;
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
    <ScreenWrapper noPadding={true} hasHeader={false} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        {/* Tinted Top Header */}
        <View style={[styles.header, { backgroundColor: `${subjectColor}15`, borderBottomColor: `${theme.colors.textTertiary}15` }]}>
          <TouchableOpacity onPress={() => setShowExitModal(true)} style={styles.exitBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.exitIcon, { color: theme.colors.textPrimary }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{subjectName}</Text>
          <TouchableOpacity onPress={handleFinishAll} style={styles.doneBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.doneBtnText, { color: subjectColor }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Phase Indicator & Stats */}
        <View style={styles.phaseRow}>
          <StatusChip label={isBreak ? '☕ Rest Phase' : '🎯 Focus Phase'} type={isBreak ? 'success' : 'info'} size="md" />
          <Text style={[styles.sessionCounter, { color: theme.colors.textSecondary }]}>Session {completedSessions + 1} today</Text>
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
            style={[styles.playBtn, { backgroundColor: subjectColor, borderRadius: theme.borderRadius.full }]}
          />
          <TouchableOpacity onPress={skip} style={styles.skipBtn} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.skipBtnText, { color: theme.colors.textSecondary }]}>⏭ Skip to {isBreak ? 'Focus' : 'Break'}</Text>
          </TouchableOpacity>
        </View>

        {/* Slide-in Notes Drawer when Paused */}
        {!isRunning && (
          <View style={[styles.notesDrawer, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.drawerLabel, { color: theme.colors.textSecondary }]}>📝 Session Notes (Saved on completion)</Text>
            <TextInput
              style={[styles.notesInput, { color: theme.colors.textPrimary }]}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="Add a note or formula about this session..."
              placeholderTextColor={theme.colors.textTertiary}
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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1 },
  exitBtn: { padding: 4 },
  exitIcon: { fontSize: 18, fontWeight: '700' },
  headerTitle: { fontSize: 15, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  doneBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  doneBtnText: { fontSize: 13, fontWeight: '800' },
  phaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16 },
  sessionCounter: { fontSize: 11, fontWeight: '700' },
  timerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controlRow: { alignItems: 'center', gap: 16, paddingHorizontal: 24, marginBottom: 16 },
  playBtn: { width: 220 },
  skipBtn: { paddingVertical: 4 },
  skipBtnText: { fontSize: 11, fontWeight: '700' },
  notesDrawer: { marginHorizontal: 16, marginBottom: 20, padding: 16, borderWidth: 1 },
  drawerLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
  notesInput: { fontSize: 12, padding: 0 },
});

export default PomodoroModal;

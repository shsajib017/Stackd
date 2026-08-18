import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useStreak from '../../hooks/useStreak';
import useStudySessions from '../../hooks/useStudySessions';
import useUIStore from '../../store/useUIStore';

import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import StatusChip from '../../components/common/StatusChip';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const RATING_LABELS = { 1: "Couldn't focus", 2: 'Distracted', 3: 'Moderate focus', 4: 'Good focus', 5: 'Deep focus 🚀' };

/** Bottom Sheet Modal for session logging, rating, and notes. */
const SessionCompleteModal = React.memo(({ navigation, route }) => {
  const { theme } = useTheme();
  const session = route.params?.session || {};
  const completedMinutes = route.params?.completedMinutes || session.duration_minutes || 25;
  const isEarlyExit = Boolean(route.params?.isEarlyExit);

  const subjectName = session.subject_name || session.subjectName || session.topic || 'Study Session';
  const subjectColor = session.color || session.subjectColor || theme.colors.primary;

  const showToast = useUIStore((state) => state.showToast);
  const { toggleSessionComplete } = useStudySessions();
  const { fetchStreaks } = useStreak();

  const [focusRating, setFocusRating] = useState(5);
  const [notes, setNotes] = useState(route.params?.notes || session.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      if (session.id) {
        await toggleSessionComplete(session.id, focusRating, notes.trim());
      }
      await fetchStreaks();
      showToast('Session logged! Great job 🎯', 'success');
      navigation.goBack();
    } catch {
      showToast('Session saved locally', 'info');
      navigation.goBack();
    } finally {
      setIsSaving(false);
    }
  }, [fetchStreaks, focusRating, navigation, notes, session.id, showToast, toggleSessionComplete]);

  const handleSkip = useCallback(async () => {
    if (session.id && !session.completed) {
      try { await toggleSessionComplete(session.id, null, notes.trim()); } catch {}
    }
    navigation.goBack();
  }, [navigation, notes, session.completed, session.id, toggleSessionComplete]);

  return (
    <ScreenWrapper noPadding={true} hasHeader={false} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{isEarlyExit ? 'Session Ended' : 'Session Complete! 🎉'}</Text>
              <View style={styles.subRow}>
                <View style={[styles.subDot, { backgroundColor: subjectColor }]} />
                <Text style={[styles.subName, { color: theme.colors.textSecondary }]}>{subjectName}</Text>
              </View>
            </View>

            {/* Time & Completion Summary */}
            <View style={[styles.statsCard, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}15` }]}>
              <View>
                <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>STUDY TIME</Text>
                <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{completedMinutes} min</Text>
              </View>
              <StatusChip
                label={isEarlyExit ? `${completedMinutes} min partial` : 'Full session ✓'}
                type={isEarlyExit ? 'warning' : 'success'}
                size="md"
              />
            </View>

            {/* Focus Rating */}
            <View style={[styles.ratingBox, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}15` }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>How was your focus?</Text>
              <StarRating rating={focusRating} onRatingChange={setFocusRating} size={34} />
              <Text style={[styles.ratingText, { color: theme.colors.accent }]}>{RATING_LABELS[focusRating] || 'Good'}</Text>
            </View>

            {/* Notes */}
            <View style={styles.notesBox}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Session Notes</Text>
              <TextInput
                style={[styles.notesInput, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20`, color: theme.colors.textPrimary }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add key formulas or revision thoughts..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                maxLength={300}
              />
            </View>

            {/* Buttons */}
            <Button label="Save session" onPress={handleSave} loading={isSaving} fullWidth style={styles.saveBtn} />
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.skipText, { color: theme.colors.textTertiary }]}>Skip</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { padding: 20, maxHeight: '92%' },
  header: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  subDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  subName: { fontSize: 12, fontWeight: '700' },
  statsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 16, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  ratingBox: { alignItems: 'center', padding: 16, marginBottom: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  ratingText: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  notesBox: { marginBottom: 16 },
  notesInput: { padding: 16, minHeight: 70, fontSize: 12, borderWidth: 1, textAlignVertical: 'top' },
  saveBtn: { marginTop: 4 },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 12, fontWeight: '700' },
});

export default SessionCompleteModal;

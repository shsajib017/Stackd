import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useStreak from '../../hooks/useStreak';
import useStudySessions from '../../hooks/useStudySessions';
import useUIStore from '../../store/useUIStore';

import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import StatusChip from '../../components/common/StatusChip';

const RATING_LABELS = { 1: "Couldn't focus", 2: 'Distracted', 3: 'Moderate focus', 4: 'Good focus', 5: 'Deep focus 🚀' };

/** Bottom Sheet Modal for session logging, rating, and notes. */
const SessionCompleteModal = React.memo(({ navigation, route }) => {
  const session = route.params?.session || {};
  const completedMinutes = route.params?.completedMinutes || session.duration_minutes || 25;
  const isEarlyExit = Boolean(route.params?.isEarlyExit);

  const subjectName = session.subject_name || session.subjectName || session.topic || 'Study Session';
  const subjectColor = session.color || session.subjectColor || colors.primary;

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
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.sheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{isEarlyExit ? 'Session Ended' : 'Session Complete! 🎉'}</Text>
            <View style={styles.subRow}>
              <View style={[styles.subDot, { backgroundColor: subjectColor }]} />
              <Text style={styles.subName}>{subjectName}</Text>
            </View>
          </View>

          {/* Time & Completion Summary */}
          <View style={styles.statsCard}>
            <View>
              <Text style={styles.statLabel}>STUDY TIME</Text>
              <Text style={styles.statValue}>{completedMinutes} min</Text>
            </View>
            <StatusChip
              label={isEarlyExit ? `${completedMinutes} min partial` : 'Full session ✓'}
              type={isEarlyExit ? 'warning' : 'success'}
              size="md"
            />
          </View>

          {/* Focus Rating */}
          <View style={styles.ratingBox}>
            <Text style={styles.sectionTitle}>How was your focus?</Text>
            <StarRating rating={focusRating} onRatingChange={setFocusRating} size={34} />
            <Text style={styles.ratingText}>{RATING_LABELS[focusRating] || 'Good'}</Text>
          </View>

          {/* Notes */}
          <View style={styles.notesBox}>
            <Text style={styles.sectionTitle}>Session Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add key formulas or revision thoughts..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={300}
            />
          </View>

          {/* Buttons */}
          <Button label="Save session" onPress={handleSave} loading={isSaving} fullWidth style={styles.saveBtn} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: `${colors.textPrimary}80`, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.lg, maxHeight: '90%' },
  header: { alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSizes.lg + 2, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  subRow: { flexDirection: 'row', alignItems: 'center' },
  subDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.xs },
  subName: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textSecondary },
  statsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}15` },
  statLabel: { fontSize: fontSizes.xs - 1, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase' },
  statValue: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  ratingBox: { alignItems: 'center', backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}15` },
  sectionTitle: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs },
  ratingText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.accent, marginTop: 2 },
  notesBox: { marginBottom: spacing.md },
  notesInput: { backgroundColor: colors.background, borderRadius: borderRadius.md, padding: spacing.md, minHeight: 70, fontSize: fontSizes.sm, color: colors.textPrimary, borderWidth: 1, borderColor: `${colors.textTertiary}20`, textAlignVertical: 'top' },
  saveBtn: { marginTop: spacing.xs },
  skipBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary },
});

export default SessionCompleteModal;

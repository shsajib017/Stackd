import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import Button from '../common/Button';

const DURATIONS = [25, 45, 60, 90];

/**
 * Bottom Sheet Modal for manually scheduling a study session on a selected date.
 */
const AddSessionSheet = React.memo(({ visible, onClose, selectedDate = new Date(), subjects = [], onAddSession }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || null);
  const [duration, setDuration] = useState(45);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    const sId = selectedSubjectId || subjects[0]?.id;
    if (!sId) return;
    try {
      setIsLoading(true);
      await onAddSession?.({
        subject_id: sId,
        duration_minutes: duration,
        date: formatDateForDB(selectedDate),
      });
      onClose?.();
    } catch {} finally {
      setIsLoading(false);
    }
  }, [duration, onAddSession, onClose, selectedDate, selectedSubjectId, subjects]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Schedule Study Session</Text>
          <Text style={styles.dateLabel}>📅 {formatDate(selectedDate)}</Text>

          <Text style={styles.sectionLabel}>Select Subject</Text>
          <View style={styles.subjectRow}>
            {subjects.map((sub) => {
              const active = (selectedSubjectId || subjects[0]?.id) === sub.id;
              return (
                <TouchableOpacity key={sub.id} style={[styles.subPill, active && { backgroundColor: sub.color || colors.primary }]} onPress={() => setSelectedSubjectId(sub.id)}>
                  <Text style={[styles.subText, active && styles.textWhite]}>{sub.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Duration</Text>
          <View style={styles.durRow}>
            {DURATIONS.map((mins) => {
              const active = duration === mins;
              return (
                <TouchableOpacity key={mins} style={[styles.durPill, active && styles.durPillActive]} onPress={() => setDuration(mins)}>
                  <Text style={[styles.durText, active && styles.textWhite]}>{mins} min</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button label="Add session" onPress={handleSave} loading={isLoading} fullWidth style={styles.btn} />
          <Button label="Cancel" variant="secondary" onPress={onClose} fullWidth style={styles.cancelBtn} />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: `${colors.textPrimary}80`, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg, padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: fontSizes.md + 2, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  dateLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary, marginBottom: spacing.md },
  sectionLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  subPill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: borderRadius.full, backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  subText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textPrimary },
  durRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  durPill: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.md, backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  durPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  durText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textPrimary },
  textWhite: { color: colors.surface },
  btn: { marginTop: spacing.xs },
  cancelBtn: { marginTop: spacing.xs },
});

export default AddSessionSheet;

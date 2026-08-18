import React, { useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatDate, formatDateForDB } from '../../utils/formatDate';
import Button from '../common/Button';

const DURATIONS = [25, 45, 60, 90];

/**
 * Bottom Sheet Modal for manually scheduling a study session on a selected date.
 */
const AddSessionSheet = React.memo(({ visible, onClose, selectedDate = new Date(), subjects = [], onAddSession }) => {
  const { theme } = useTheme();
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
      <View style={[styles.backdrop, { backgroundColor: `${theme.colors.textPrimary}80` }]}>
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.lg, borderTopRightRadius: theme.borderRadius.lg }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Schedule Study Session</Text>
          <Text style={[styles.dateLabel, { color: theme.colors.primary }]}>📅 {formatDate(selectedDate)}</Text>

          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Select Subject</Text>
          <View style={styles.subjectRow}>
            {subjects.map((sub) => {
              const active = (selectedSubjectId || subjects[0]?.id) === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.subPill,
                    {
                      backgroundColor: active ? (sub.color || theme.colors.primary) : theme.colors.background,
                      borderRadius: theme.borderRadius.full,
                      borderColor: `${theme.colors.textTertiary}20`,
                    },
                  ]}
                  onPress={() => setSelectedSubjectId(sub.id)}
                >
                  <Text style={[styles.subText, { color: active ? '#FFFFFF' : theme.colors.textPrimary }]}>{sub.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
          <View style={styles.durRow}>
            {DURATIONS.map((mins) => {
              const active = duration === mins;
              return (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.durPill,
                    {
                      backgroundColor: active ? theme.colors.primary : theme.colors.background,
                      borderColor: active ? theme.colors.primary : `${theme.colors.textTertiary}20`,
                      borderRadius: theme.borderRadius.md,
                    },
                  ]}
                  onPress={() => setDuration(mins)}
                >
                  <Text style={[styles.durText, { color: active ? '#FFFFFF' : theme.colors.textPrimary }]}>{mins} min</Text>
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
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: 24, paddingBottom: 32 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  dateLabel: { fontSize: 12, fontWeight: '600', marginBottom: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 16 },
  subPill: { paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1 },
  subText: { fontSize: 10, fontWeight: '700' },
  durRow: { flexDirection: 'row', gap: 4, marginBottom: 24 },
  durPill: { flex: 1, alignItems: 'center', paddingVertical: 8, borderWidth: 1 },
  durText: { fontSize: 10, fontWeight: '700' },
  btn: { marginTop: 4 },
  cancelBtn: { marginTop: 4 },
});

export default AddSessionSheet;

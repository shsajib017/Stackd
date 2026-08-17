import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

/**
 * 7-Day interactive study hours availability input.
 */
const DailyHoursInput = React.memo(({ availableHours = {}, onChangeHours }) => {
  const updateHours = (dayKey, delta) => {
    const current = availableHours[dayKey] ?? (dayKey === 'saturday' || dayKey === 'sunday' ? 2 : 4);
    const next = Math.max(0, Math.min(12, current + delta));
    onChangeHours?.(dayKey, next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>How many hours can you study per day?</Text>
      <View style={styles.list}>
        {DAYS.map(({ key, label }) => {
          const hours = availableHours[key] ?? (key === 'saturday' || key === 'sunday' ? 2 : 4);
          const isOff = hours === 0;

          return (
            <View key={key} style={styles.row}>
              <Text style={[styles.dayLabel, isOff && styles.dayOffText]}>{label}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, isOff && styles.btnDisabled]}
                  onPress={() => updateHours(key, -1)}
                  disabled={isOff}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.stepText}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.hoursValue, isOff && styles.hoursOff]}>
                  {hours === 0 ? 'Rest day' : `${hours} hrs`}
                </Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => updateHours(key, 1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.stepText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  sectionLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  list: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  dayLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  dayOffText: { color: colors.textTertiary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stepBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: `${colors.primary}12`, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.3 },
  stepText: { fontSize: 18, fontWeight: '800', color: colors.primary, lineHeight: 20 },
  hoursValue: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary, minWidth: 64, textAlign: 'center' },
  hoursOff: { color: colors.textTertiary, fontStyle: 'italic' },
});

export default DailyHoursInput;

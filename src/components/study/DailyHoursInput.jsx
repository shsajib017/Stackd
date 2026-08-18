import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

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
  const { theme } = useTheme();

  const updateHours = (dayKey, delta) => {
    const current = availableHours[dayKey] ?? (dayKey === 'saturday' || dayKey === 'sunday' ? 2 : 4);
    const next = Math.max(0, Math.min(12, current + delta));
    onChangeHours?.(dayKey, next);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>How many hours can you study per day?</Text>
      <View style={[styles.list, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
        {DAYS.map(({ key, label }) => {
          const hours = availableHours[key] ?? (key === 'saturday' || key === 'sunday' ? 2 : 4);
          const isOff = hours === 0;

          return (
            <View key={key} style={[styles.row, { borderBottomColor: `${theme.colors.textTertiary}15` }]}>
              <Text style={[styles.dayLabel, { color: theme.colors.textPrimary }, isOff && { color: theme.colors.textTertiary }]}>{label}</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: `${theme.colors.primary}12` }, isOff && styles.btnDisabled]}
                  onPress={() => updateHours(key, -1)}
                  disabled={isOff}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.stepText, { color: theme.colors.primary }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.hoursValue, { color: theme.colors.textPrimary }, isOff && { color: theme.colors.textTertiary }]}>
                  {hours === 0 ? 'Rest day' : `${hours} hrs`}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: `${theme.colors.primary}12` }]}
                  onPress={() => updateHours(key, 1)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.stepText, { color: theme.colors.primary }]}>+</Text>
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
  container: { marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  list: { padding: 8, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  dayLabel: { fontSize: 12, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.3 },
  stepText: { fontSize: 18, fontWeight: '800', lineHeight: 20 },
  hoursValue: { fontSize: 11, fontWeight: '700', minWidth: 64, textAlign: 'center' },
  hoursOff: { fontStyle: 'italic' },
});

export default DailyHoursInput;

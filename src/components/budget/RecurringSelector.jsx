import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

const INTERVALS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

/**
 * Reusable Recurring Expense Switch and Interval Selector.
 */
const RecurringSelector = React.memo(({ isRecurring, onToggle, interval, onIntervalChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Recurring expense</Text>
        <Switch
          value={isRecurring}
          onValueChange={onToggle}
          trackColor={{ false: colors.textTertiary, true: colors.primary }}
        />
      </View>

      {isRecurring && (
        <View style={styles.intervalRow}>
          {INTERVALS.map((item) => {
            const isSelected = interval === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => onIntervalChange(item.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, marginBottom: spacing.xs },
  switchLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  intervalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs, marginBottom: spacing.xs },
  pill: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, marginHorizontal: 3, borderRadius: borderRadius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}40` },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
  pillTextActive: { color: colors.surface },
});

export default RecurringSelector;

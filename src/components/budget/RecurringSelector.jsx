import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

const INTERVALS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

/**
 * Reusable Recurring Expense Switch and Interval Selector.
 */
const RecurringSelector = React.memo(({ isRecurring, onToggle, interval, onIntervalChange }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.switchRow,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            borderColor: `${theme.colors.textTertiary}30`,
          },
        ]}
      >
        <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>Recurring expense</Text>
        <Switch
          value={isRecurring}
          onValueChange={onToggle}
          trackColor={{ false: `${theme.colors.textTertiary}30`, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      </View>

      {isRecurring && (
        <View style={styles.intervalRow}>
          {INTERVALS.map((item) => {
            const isSelected = interval === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : `${theme.colors.textTertiary}30`,
                    borderRadius: theme.borderRadius.md,
                  },
                ]}
                onPress={() => onIntervalChange(item.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }, isSelected && styles.pillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: 8 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, marginBottom: 4 },
  switchLabel: { fontSize: 12, fontWeight: '600' },
  intervalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 4 },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 8, marginHorizontal: 3, borderWidth: 1 },
  pillText: { fontSize: 10, fontWeight: '700' },
  pillTextActive: { fontWeight: '800' },
});

export default RecurringSelector;

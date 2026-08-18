import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Weekly study completion and time investment summary bar.
 */
const WeekSummaryBar = React.memo(({ totalSessions = 0, completed = 0, totalMinutes = 0 }) => {
  const { theme } = useTheme();
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: `${theme.colors.textTertiary}20`,
        },
      ]}
    >
      <View style={styles.item}>
        <Text style={[styles.metric, { color: theme.colors.primary }]}>{totalSessions}</Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Sessions</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: `${theme.colors.textTertiary}20` }]} />
      <View style={styles.item}>
        <Text style={[styles.metric, { color: theme.colors.success }]}>{completed}</Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Completed</Text>
      </View>
      <View style={[styles.divider, { backgroundColor: `${theme.colors.textTertiary}20` }]} />
      <View style={styles.item}>
        <Text style={[styles.metric, { color: theme.colors.accent }]}>{timeStr}</Text>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Total Time</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, alignItems: 'center', marginTop: 16 },
  item: { flex: 1, alignItems: 'center' },
  metric: { fontSize: 14, fontWeight: '800' },
  label: { fontSize: 9, fontWeight: '600', marginTop: 2 },
  divider: { width: 1, height: 24 },
});

export default WeekSummaryBar;

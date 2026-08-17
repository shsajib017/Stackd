import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Weekly study completion and time investment summary bar.
 */
const WeekSummaryBar = React.memo(({ totalSessions = 0, completed = 0, totalMinutes = 0 }) => {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.metric}>{totalSessions}</Text>
        <Text style={styles.label}>Sessions</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={[styles.metric, styles.metricGreen]}>{completed}</Text>
        <Text style={styles.label}>Completed</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={[styles.metric, styles.metricAccent]}>{timeStr}</Text>
        <Text style={styles.label}>Total Time</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, alignItems: 'center', marginTop: spacing.md },
  item: { flex: 1, alignItems: 'center' },
  metric: { fontSize: fontSizes.md, fontWeight: '800', color: colors.primary },
  metricGreen: { color: colors.success },
  metricAccent: { color: colors.accent },
  label: { fontSize: fontSizes.xs - 1, fontWeight: '600', color: colors.textSecondary, marginTop: 2 },
  divider: { width: 1, height: 24, backgroundColor: `${colors.textTertiary}20` },
});

export default WeekSummaryBar;

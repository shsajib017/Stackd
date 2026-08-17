import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import { formatDateFull } from '../../utils/formatDate';
import StatusChip from '../common/StatusChip';

/**
 * Visual breakdown of auto-generated study timetable grouped by date.
 */
const SchedulePreview = React.memo(({ sessions = [], subjectsMap = {} }) => {
  const grouped = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.entries(map);
  }, [sessions]);

  const totalMinutes = useMemo(() => sessions.reduce((sum, s) => sum + (s.durationMinutes || s.duration_minutes || 45), 0), [sessions]);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const daysCount = grouped.length;

  if (!sessions.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.summaryBar}>
        <StatusChip label={`${sessions.length} sessions across ${daysCount} days`} type="success" icon="✨" size="md" />
        <Text style={styles.hoursText}>⏱ {totalHours} total hrs</Text>
      </View>

      {grouped.map(([dateStr, daySessions]) => (
        <View key={dateStr} style={styles.dayGroup}>
          <Text style={styles.dayHeader}>{formatDateFull(dateStr)}</Text>
          <View style={styles.dayCard}>
            {daySessions.map((item, idx) => {
              const sub = subjectsMap[item.subjectId || item.subject_id] || {};
              const dotColor = sub.color || colors.primary;
              const duration = item.durationMinutes || item.duration_minutes || 45;

              return (
                <View key={idx} style={[styles.sessionRow, idx < daySessions.length - 1 && styles.borderBtm]}>
                  <View style={[styles.colorDot, { backgroundColor: dotColor }]} />
                  <View style={styles.sessionInfo}>
                    <Text style={styles.subName} numberOfLines={1}>{item.subjectName || sub.name || 'Subject'}</Text>
                    <Text style={styles.topicName} numberOfLines={1}>{item.topic || 'Core Review'}</Text>
                  </View>
                  <Text style={styles.durationText}>{duration} min</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: spacing.md, marginBottom: spacing.md },
  summaryBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  hoursText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.primary },
  dayGroup: { marginBottom: spacing.sm },
  dayHeader: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  dayCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  borderBtm: { borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  sessionInfo: { flex: 1, marginRight: spacing.xs },
  subName: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  topicName: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 1 },
  durationText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
});

export default SchedulePreview;

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatDateFull } from '../../utils/formatDate';
import StatusChip from '../common/StatusChip';

/**
 * Visual breakdown of auto-generated study timetable grouped by date.
 */
const SchedulePreview = React.memo(({ sessions = [], subjectsMap = {} }) => {
  const { theme } = useTheme();

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
        <Text style={[styles.hoursText, { color: theme.colors.primary }]}>⏱ {totalHours} total hrs</Text>
      </View>

      {grouped.map(([dateStr, daySessions]) => (
        <View key={dateStr} style={styles.dayGroup}>
          <Text style={[styles.dayHeader, { color: theme.colors.textSecondary }]}>{formatDateFull(dateStr)}</Text>
          <View style={[styles.dayCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
            {daySessions.map((item, idx) => {
              const sub = subjectsMap[item.subjectId || item.subject_id] || {};
              const dotColor = sub.color || theme.colors.primary;
              const duration = item.durationMinutes || item.duration_minutes || 45;

              return (
                <View key={idx} style={[styles.sessionRow, { borderBottomColor: `${theme.colors.textTertiary}15` }, idx < daySessions.length - 1 && styles.borderBtm]}>
                  <View style={[styles.colorDot, { backgroundColor: dotColor }]} />
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.subName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.subjectName || sub.name || 'Subject'}</Text>
                    <Text style={[styles.topicName, { color: theme.colors.textSecondary }]} numberOfLines={1}>{item.topic || 'Core Review'}</Text>
                  </View>
                  <Text style={[styles.durationText, { color: theme.colors.primary }]}>{duration} min</Text>
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
  container: { marginTop: 16, marginBottom: 16 },
  summaryBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  hoursText: { fontSize: 11, fontWeight: '700' },
  dayGroup: { marginBottom: 8 },
  dayHeader: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  dayCard: { paddingHorizontal: 16, borderWidth: 1 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  borderBtm: { borderBottomWidth: 1 },
  colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  sessionInfo: { flex: 1, marginRight: 4 },
  subName: { fontSize: 12, fontWeight: '700' },
  topicName: { fontSize: 10, marginTop: 1 },
  durationText: { fontSize: 10, fontWeight: '700' },
});

export default SchedulePreview;

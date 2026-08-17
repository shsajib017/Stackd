import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * 7-Day Weekly Study Minutes Bar Chart with current day highlight.
 */
const StudyWeekChart = React.memo(({ sessions = [] }) => {
  // Current day index (0 = Mon, 6 = Sun)
  const todayDayIndex = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }, []);

  // Compute completed study minutes per day of the current week
  const weekData = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayDiff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), mondayDiff);

    const map = [0, 0, 0, 0, 0, 0, 0];

    (sessions || []).forEach((s) => {
      if (!s.completed || !s.date) return;
      const sDate = new Date(s.date);
      const diffDays = Math.floor((sDate - monday) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        map[diffDays] += Number(s.duration_minutes) || 0;
      }
    });

    return DAYS.map((dayName, idx) => ({
      day: dayName,
      minutes: map[idx],
      hours: (map[idx] / 60).toFixed(1),
      isToday: idx === todayDayIndex,
    }));
  }, [sessions, todayDayIndex]);

  const maxMinutes = useMemo(() => {
    const max = Math.max(...weekData.map((d) => d.minutes), 0);
    return max > 0 ? max : 60;
  }, [weekData]);

  const maxHours = (maxMinutes / 60).toFixed(1);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Daily study hours</Text>
        <Text style={styles.peakLabel}>Peak: {maxHours}h</Text>
      </View>

      <View style={styles.chartContainer}>
        {weekData.map((item) => {
          const heightPct = Math.min(100, Math.max(item.minutes > 0 ? 8 : 2, (item.minutes / maxMinutes) * 100));

          return (
            <View key={item.day} style={styles.column}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPct}%` },
                    item.isToday ? styles.barToday : (item.minutes > 0 ? styles.barActive : styles.barZero),
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, item.isToday && styles.dayLabelToday]}>
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  peakLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  barZero: {
    backgroundColor: `${colors.textTertiary}25`,
  },
  barActive: {
    backgroundColor: `${colors.accent}90`,
  },
  barToday: {
    backgroundColor: colors.primary,
  },
  dayLabel: {
    fontSize: fontSizes.xs - 2,
    fontWeight: '600',
    color: colors.textTertiary,
    marginTop: 4,
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '800',
  },
});

export default StudyWeekChart;

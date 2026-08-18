import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * 7-Day Weekly Study Minutes Bar Chart with current day highlight.
 */
const StudyWeekChart = React.memo(({ sessions = [] }) => {
  const { theme } = useTheme();

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
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.textTertiary}20`,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Daily study hours</Text>
        <Text style={[styles.peakLabel, { color: theme.colors.primary }]}>Peak: {maxHours}h</Text>
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
                    {
                      height: `${heightPct}%`,
                      borderRadius: theme.borderRadius.sm,
                      backgroundColor: item.isToday
                        ? theme.colors.primary
                        : item.minutes > 0
                        ? `${theme.colors.accent}90`
                        : `${theme.colors.textTertiary}25`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: theme.colors.textTertiary }, item.isToday && { color: theme.colors.primary, fontWeight: '800' }]}>
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
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '600',
  },
  peakLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 4,
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
  },
  dayLabel: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default StudyWeekChart;

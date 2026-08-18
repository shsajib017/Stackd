import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatDateForDB } from '../../utils/formatDate';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * 7-Day interactive horizontal tab row showing day names, dates, and session indicators.
 */
const DayTabsRow = React.memo(({ days = [], selectedDate, onSelectDay, sessionsByDate = {} }) => {
  const { theme } = useTheme();
  const selectedStr = selectedDate ? formatDateForDB(selectedDate) : null;
  const todayStr = formatDateForDB(new Date());

  return (
    <View style={styles.container}>
      {days.map((day) => {
        const dateStr = formatDateForDB(day);
        const isSelected = dateStr === selectedStr;
        const isToday = dateStr === todayStr;
        const hasSessions = (sessionsByDate[dateStr] || 0) > 0;

        return (
          <TouchableOpacity
            key={dateStr}
            style={[
              styles.dayPill,
              {
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                borderColor: isSelected || isToday ? theme.colors.primary : `${theme.colors.textTertiary}20`,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={() => onSelectDay?.(day)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dayName, { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }]}>
              {DAY_NAMES[day.getDay()]}
            </Text>
            <Text style={[styles.dayNumber, { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }]}>
              {day.getDate()}
            </Text>
            {hasSessions ? (
              <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
            ) : (
              <View style={styles.dotPlaceholder} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    marginHorizontal: 2,
    borderWidth: 1,
  },
  dayName: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 4,
  },
});

export default DayTabsRow;

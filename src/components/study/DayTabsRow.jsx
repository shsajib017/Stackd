import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import { formatDateForDB } from '../../utils/formatDate';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * 7-Day interactive horizontal tab row showing day names, dates, and session indicators.
 */
const DayTabsRow = React.memo(({ days = [], selectedDate, onSelectDay, sessionsByDate = {} }) => {
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
              isSelected && styles.dayPillSelected,
              isToday && !isSelected && styles.dayPillToday,
            ]}
            onPress={() => onSelectDay?.(day)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dayName, isSelected && styles.textSelected]}>
              {DAY_NAMES[day.getDay()]}
            </Text>
            <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>
              {day.getDate()}
            </Text>
            {hasSessions ? (
              <View style={[styles.dot, isSelected && styles.dotSelected]} />
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
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    marginHorizontal: 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
    ...shadows.sm,
  },
  dayPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayPillToday: {
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: fontSizes.xs - 1,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  textSelected: {
    color: colors.surface,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  dotSelected: {
    backgroundColor: colors.accent,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 4,
  },
});

export default DayTabsRow;

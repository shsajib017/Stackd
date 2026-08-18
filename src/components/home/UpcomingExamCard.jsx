import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatDateShort, getDaysRemaining } from '../../utils/formatDate';
import Badge from '../common/Badge';

/**
 * Upcoming exam item row with colored dot, name, date, and countdown badge.
 */
const UpcomingExamCard = React.memo(({
  subjectName,
  subjectColor,
  examDate,
}) => {
  const { theme } = useTheme();
  const color = subjectColor || theme.colors.primary;
  const daysLeft = useMemo(() => getDaysRemaining(examDate), [examDate]);
  const formattedDate = useMemo(() => formatDateShort(examDate), [examDate]);

  const badgeConfig = useMemo(() => {
    if (daysLeft === 0) return { label: 'Today', color: theme.colors.error };
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: theme.colors.error };
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: theme.colors.accent };
    return { label: `${daysLeft}d left`, color: theme.colors.primary };
  }, [daysLeft, theme.colors.accent, theme.colors.error, theme.colors.primary]);

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
      <View style={[styles.colorDot, { backgroundColor: color }]} />
      <View style={styles.info}>
        <Text style={[styles.subjectName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {subjectName}
        </Text>
        <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{formattedDate}</Text>
      </View>
      <Badge label={badgeConfig.label} color={badgeConfig.color} size="sm" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 3,
    borderWidth: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  subjectName: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 10,
    marginTop: 2,
  },
});

export default UpcomingExamCard;

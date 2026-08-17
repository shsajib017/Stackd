import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { formatDateShort, getDaysRemaining } from '../../utils/formatDate';
import Badge from '../common/Badge';

/**
 * Upcoming exam item row with colored dot, name, date, and countdown badge.
 *
 * @param {object} props
 * @param {string} props.subjectName - Name of the subject.
 * @param {string} [props.subjectColor=colors.primary] - Subject color code.
 * @param {string} props.examDate - Target exam ISO date string.
 */
const UpcomingExamCard = React.memo(({
  subjectName,
  subjectColor = colors.primary,
  examDate,
}) => {
  const daysLeft = useMemo(() => getDaysRemaining(examDate), [examDate]);
  const formattedDate = useMemo(() => formatDateShort(examDate), [examDate]);

  const badgeConfig = useMemo(() => {
    if (daysLeft === 0) return { label: 'Today', color: colors.error };
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, color: colors.error };
    if (daysLeft <= 7) return { label: `${daysLeft}d left`, color: colors.warning };
    return { label: `${daysLeft}d left`, color: colors.primary };
  }, [daysLeft]);

  return (
    <View style={styles.container}>
      <View style={[styles.colorDot, { backgroundColor: subjectColor }]} />
      <View style={styles.info}>
        <Text style={styles.subjectName} numberOfLines={1}>
          {subjectName}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
      <Badge label={badgeConfig.label} color={badgeConfig.color} size="sm" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  subjectName: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default UpcomingExamCard;

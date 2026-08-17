import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { getDaysRemaining } from '../../utils/formatDate';

/**
 * Exam countdown pill badge showing remaining days until target exam date.
 */
const ExamCountdown = React.memo(({ examDate, style }) => {
  if (!examDate) return null;

  const daysLeft = getDaysRemaining(examDate);
  const isUrgent = daysLeft >= 0 && daysLeft <= 7;
  const isPast = daysLeft < 0;

  let label = `${daysLeft}d to exam`;
  if (daysLeft === 0) label = 'Exam today!';
  else if (daysLeft === 1) label = 'Exam tomorrow!';
  else if (isPast) label = 'Exam ended';

  return (
    <View
      style={[
        styles.badge,
        isUrgent ? styles.urgentBadge : styles.normalBadge,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isUrgent ? styles.urgentText : styles.normalText,
        ]}
        numberOfLines={1}
      >
        {isUrgent ? '⚡ ' : '⏳ '}
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  normalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  urgentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  text: {
    fontSize: fontSizes.xs - 1,
    fontWeight: '800',
  },
  normalText: {
    color: colors.surface,
  },
  urgentText: {
    color: colors.error,
  },
});

export default ExamCountdown;

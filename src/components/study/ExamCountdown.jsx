import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { getDaysRemaining } from '../../utils/formatDate';

/**
 * Exam countdown pill badge showing remaining days until target exam date.
 */
const ExamCountdown = React.memo(({ examDate, style }) => {
  const { theme } = useTheme();
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
        { borderRadius: theme.borderRadius.full },
        isUrgent ? styles.urgentBadge : styles.normalBadge,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isUrgent ? { color: theme.colors.error } : styles.normalText,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  normalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  urgentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  text: {
    fontSize: 9,
    fontWeight: '800',
  },
  normalText: {
    color: '#FFFFFF',
  },
});

export default ExamCountdown;

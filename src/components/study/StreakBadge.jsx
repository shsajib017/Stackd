import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Badge displaying the active study streak and motivational message.
 */
const StreakBadge = React.memo(({ streak = 0, style }) => {
  const { theme, isDark } = useTheme();
  const hasStreak = streak > 0;

  const badgeBg = isDark ? '#382B1B' : '#FFF7E6';
  const badgeBorder = isDark ? '#61492B' : '#FDE1A6';
  const badgeActiveText = isDark ? '#FFB74D' : '#B45309';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
          borderRadius: theme.borderRadius.lg,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{hasStreak ? '🔥' : '✨'}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }, hasStreak && { color: badgeActiveText }]}>
          {hasStreak ? `${streak} Day Study Streak` : 'Start Your Streak Today!'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {hasStreak
            ? 'Keep the momentum going with today’s session.'
            : 'Complete a study session today to light the flame.'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  icon: {
    fontSize: 28,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});

export default StreakBadge;

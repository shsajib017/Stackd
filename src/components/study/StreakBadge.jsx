import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';

/**
 * Badge displaying the active study streak and motivational message.
 */
const StreakBadge = React.memo(({ streak = 0, style }) => {
  const hasStreak = streak > 0;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.icon}>{hasStreak ? '🔥' : '✨'}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {hasStreak ? `${streak} Day Study Streak` : 'Start Your Streak Today!'}
        </Text>
        <Text style={styles.subtitle}>
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
    backgroundColor: `${colors.accent}15`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
    ...shadows.sm,
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.sm + 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default StreakBadge;

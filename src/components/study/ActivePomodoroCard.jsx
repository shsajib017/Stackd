import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';

/**
 * Animated banner showing the currently running Pomodoro session countdown.
 */
const ActivePomodoroCard = React.memo(({ isRunning, isBreak, formattedTime, subjectName, onPress }) => {
  if (!isRunning) return null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        <View style={styles.pulseDot} />
        <View>
          <Text style={styles.phaseText}>
            {isBreak ? '☕ Break Time' : '🎯 Focus Session'}
          </Text>
          <Text style={styles.subjectText} numberOfLines={1}>
            {subjectName || 'Study Session in Progress'}
          </Text>
        </View>
      </View>

      <View style={styles.timerBadge}>
        <Text style={styles.timerText}>{formattedTime}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  phaseText: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subjectText: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '800',
    color: colors.surface,
  },
  timerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  timerText: {
    fontSize: fontSizes.md,
    fontWeight: '900',
    color: colors.surface,
  },
});

export default ActivePomodoroCard;

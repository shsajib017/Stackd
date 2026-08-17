import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import { formatDuration } from '../../utils/formatTime';

/**
 * Single study session card for today's schedule list.
 */
const SessionItem = React.memo(({ session, subject, onToggleComplete, onPress }) => {
  const isCompleted = Boolean(session.completed);
  const dotColor = subject?.color || colors.primary;
  const durationText = formatDuration(session.duration_minutes || 25);

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={() => onPress?.(session)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <View style={styles.textWrap}>
          <Text style={[styles.title, isCompleted && styles.completedText]} numberOfLines={1}>
            {subject?.name || session.notes || session.topic || 'Study Session'}
          </Text>
          <Text style={styles.subtitle}>
            ⏱ {durationText} {session.notes || session.topic ? `• ${session.notes || session.topic}` : ''}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
        onPress={() => onToggleComplete?.(session.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
    ...shadows.sm,
  },
  completedContainer: {
    opacity: 0.65,
    backgroundColor: `${colors.textTertiary}10`,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
});

export default SessionItem;

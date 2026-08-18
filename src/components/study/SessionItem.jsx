import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatDuration } from '../../utils/formatTime';

/**
 * Single study session card for today's schedule and subject schedule list.
 */
const SessionItem = React.memo(({ session, subject, onToggleComplete, onPress, onLongPress }) => {
  const { theme } = useTheme();
  const isCompleted = Boolean(session.completed);
  const dotColor = subject?.color || theme.colors.primary;
  const durationText = formatDuration(session.duration_minutes || 25);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: isCompleted ? `${theme.colors.success}40` : `${theme.colors.textTertiary}25`,
        },
      ]}
      onPress={() => onPress?.(session)}
      onLongPress={() => onLongPress?.(session)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: dotColor }, isCompleted && { opacity: 0.6 }]} />
        <View style={styles.textWrap}>
          <Text
            style={[
              styles.title,
              { color: isCompleted ? theme.colors.textSecondary : theme.colors.textPrimary },
              isCompleted && { textDecorationLine: 'line-through' },
            ]}
            numberOfLines={1}
          >
            {subject?.name || session.notes || session.topic || 'Study Session'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            ⏱ {durationText} {session.notes || session.topic ? `• ${session.notes || session.topic}` : ''}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: isCompleted ? theme.colors.success : theme.colors.primary,
            backgroundColor: isCompleted ? theme.colors.success : 'transparent',
          },
        ]}
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
    padding: 16,
    marginBottom: 6,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});

export default SessionItem;

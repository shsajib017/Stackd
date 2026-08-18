import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Animated banner showing the currently running Pomodoro session countdown.
 */
const ActivePomodoroCard = React.memo(({ isRunning, isBreak, formattedTime, subjectName, onPress }) => {
  const { theme } = useTheme();

  if (!isRunning) return null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.accent,
          borderRadius: theme.borderRadius.lg,
        },
      ]}
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

      <View style={[styles.timerBadge, { borderRadius: theme.borderRadius.full }]}>
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
    padding: 16,
    marginBottom: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  phaseText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default ActivePomodoroCard;

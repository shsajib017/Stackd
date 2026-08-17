import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../config/theme';

/**
 * Speed Dial Overlay and staggered action items for bottom navigation.
 */
const SpeedDialOverlay = React.memo(({ isOpen, onClose, onSelectAction, progress, bottomInset }) => {
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.45,
  }));

  const item1Style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 30 - 75 },
      { scale: withDelay(0, withSpring(progress.value)) },
    ],
  }));

  const item2Style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 30 - 130 },
      { scale: withDelay(40, withSpring(progress.value)) },
    ],
  }));

  const item3Style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 30 - 185 },
      { scale: withDelay(80, withSpring(progress.value)) },
    ],
  }));

  if (!isOpen) return null;

  return (
    <>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]} />
      </TouchableWithoutFeedback>

      <View style={[styles.speedDialContainer, { bottom: bottomInset + 85 }]}>
        <Animated.View style={[styles.dialItemWrapper, item3Style]}>
          <TouchableOpacity style={styles.dialButton} onPress={() => onSelectAction('StudyStack')}>
            <Text style={styles.dialEmoji}>📚</Text>
            <Text style={styles.dialText}>Start study</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.dialItemWrapper, item2Style]}>
          <TouchableOpacity style={styles.dialButton} onPress={() => onSelectAction('AddExpenseModal')}>
            <Text style={styles.dialEmoji}>💰</Text>
            <Text style={styles.dialText}>Add expense</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.dialItemWrapper, item1Style]}>
          <TouchableOpacity style={styles.dialButton} onPress={() => onSelectAction('LogMealModal')}>
            <Text style={styles.dialEmoji}>🍽️</Text>
            <Text style={styles.dialText}>Log meal</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.textPrimary,
    zIndex: 90,
  },
  speedDialContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  dialItemWrapper: {
    position: 'absolute',
  },
  dialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  dialEmoji: {
    fontSize: fontSizes.lg,
    marginRight: spacing.xs,
  },
  dialText: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default SpeedDialOverlay;

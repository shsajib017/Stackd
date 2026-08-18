import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../config/ThemeContext';

/**
 * Animated skeleton placeholder card with looping opacity shimmer effect.
 */
const SkeletonCard = React.memo(({
  width = '100%',
  height = 80,
  borderRadius,
  style,
}) => {
  const { theme } = useTheme();
  const radius = borderRadius ?? theme.borderRadius.md;
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.colors.surface,
        },
        animatedStyle,
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

export default SkeletonCard;

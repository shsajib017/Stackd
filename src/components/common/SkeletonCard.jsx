import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { borderRadius as defaultBorderRadius, colors } from '../../config/theme';

/**
 * Animated skeleton placeholder card with looping opacity shimmer effect.
 *
 * @param {object} props
 * @param {number|string} [props.width='100%'] - Skeleton width.
 * @param {number|string} [props.height=80] - Skeleton height.
 * @param {number} [props.borderRadius] - Corner border radius.
 * @param {object|array} [props.style] - Style overrides.
 */
const SkeletonCard = React.memo(({
  width = '100%',
  height = 80,
  borderRadius = defaultBorderRadius.md,
  style,
}) => {
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
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.textTertiary,
    overflow: 'hidden',
  },
});

export default SkeletonCard;

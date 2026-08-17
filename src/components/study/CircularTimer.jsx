import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, fontSizes } from '../../config/theme';

const SIZE = 210;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Animated SVG Circular Timer Progress Ring.
 */
const CircularTimer = React.memo(({ progress = 1, formattedTime = '25:00', ringColor = colors.primary, isBreak = false, celebration = false }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (celebration) {
      pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 400 }), withTiming(1, { duration: 400 })), 3, true);
    } else {
      pulse.value = 1;
    }
  }, [celebration, pulse]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
  const activeColor = celebration ? colors.success : isBreak ? colors.accent : ringColor;

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={`${colors.textTertiary}25`}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={activeColor}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={[styles.phaseLabel, { color: activeColor }]}>
          {celebration ? '🎉 Great work!' : isBreak ? '☕ BREAK' : '🎯 FOCUS'}
        </Text>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center', marginVertical: 18 },
  svg: { position: 'absolute' },
  content: { alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { fontSize: fontSizes.xs + 1, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  timeText: { fontSize: fontSizes.xxl + 4, fontWeight: '800', color: colors.textPrimary, letterSpacing: 1 },
});

export default CircularTimer;

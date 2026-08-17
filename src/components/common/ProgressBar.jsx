import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Visual progress bar component with track, active fill, and optional percentage label.
 *
 * @param {object} props
 * @param {number} props.progress - Progress ratio between 0 and 1.
 * @param {string} [props.color=colors.primary] - Progress fill color.
 * @param {number} [props.height=8] - Track height in pixels.
 * @param {boolean} [props.showLabel=false] - Display label above bar.
 * @param {string} [props.label] - Custom label text override.
 * @param {object|array} [props.style] - Style overrides.
 */
const ProgressBar = React.memo(({
  progress,
  color = colors.primary,
  height = 8,
  showLabel = false,
  label,
  style,
}) => {
  const clampedProgress = useMemo(() => {
    if (typeof progress !== 'number' || isNaN(progress)) return 0;
    return Math.min(Math.max(progress, 0), 1);
  }, [progress]);

  const percentageText = useMemo(() => {
    if (label !== undefined && label !== null) return label;
    return `${Math.round(clampedProgress * 100)}%`;
  }, [clampedProgress, label]);

  return (
    <View style={[styles.container, style]}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{percentageText}</Text>
        </View>
      ) : null}
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: color,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.xs,
  },
  labelText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  track: {
    width: '100%',
    backgroundColor: `${colors.textTertiary}40`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;

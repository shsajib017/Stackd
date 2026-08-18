import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Visual progress bar component with track, active fill, and optional percentage label.
 */
const ProgressBar = React.memo(({
  progress,
  color,
  height = 8,
  showLabel = false,
  label,
  style,
}) => {
  const { theme } = useTheme();
  const fillColor = color || theme.colors.primary;

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
          <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>{percentageText}</Text>
        </View>
      ) : null}
      <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: `${theme.colors.textTertiary}30` }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress * 100}%`,
              backgroundColor: fillColor,
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
    marginVertical: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

export default ProgressBar;

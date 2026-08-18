import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Compact circular progress badge showing completion percentage.
 */
const ProgressRing = React.memo(({ progress = 0, size = 42, color }) => {
  const { theme } = useTheme();
  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const textColor = color || theme.colors.surface;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: 'rgba(255, 255, 255, 0.35)',
        },
      ]}
    >
      <Text style={[styles.percentText, { color: textColor }]}>{percent}%</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  percentText: {
    fontSize: 9,
    fontWeight: '800',
  },
});

export default ProgressRing;

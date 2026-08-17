import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

export const SUBJECT_COLORS = [
  '#1B4D6A',
  '#E53935',
  '#F5A623',
  '#43A047',
  '#8E24AA',
  '#00ACC1',
  '#F4511E',
  '#546E7A',
];

/**
 * 8-Color Palette Picker for course subject accents.
 */
const SubjectColorPicker = React.memo(({ selectedColor = SUBJECT_COLORS[0], onColorChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subject color</Text>
      <View style={styles.paletteRow}>
        {SUBJECT_COLORS.map((col) => {
          const isSelected = selectedColor?.toLowerCase() === col.toLowerCase();
          return (
            <TouchableOpacity
              key={col}
              style={[styles.colorCircle, { backgroundColor: col }]}
              onPress={() => onColorChange?.(col)}
              activeOpacity={0.8}
            >
              {isSelected && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 2,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '900',
  },
});

export default SubjectColorPicker;

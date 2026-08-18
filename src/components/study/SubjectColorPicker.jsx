import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Subject color</Text>
      <View style={styles.paletteRow}>
        {SUBJECT_COLORS.map((col) => {
          const isSelected = selectedColor?.toLowerCase() === col.toLowerCase();
          return (
            <TouchableOpacity
              key={col}
              style={[styles.colorCircle, { backgroundColor: col, borderRadius: theme.borderRadius.full }]}
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
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default SubjectColorPicker;

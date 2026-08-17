import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚌',
  Books: '📚',
  Tuition: '🎓',
  Entertainment: '🎮',
  Other: '📦',
};

/**
 * Reusable Category Selector Grid.
 */
const CategorySelector = React.memo(({ categories = [], selected, onSelect }) => {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const isSelected = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, isSelected ? styles.pillActive : styles.pillInactive]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{CATEGORY_ICONS[cat] || '📦'}</Text>
            <Text style={[styles.text, isSelected && styles.textActive]}>{cat}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  pill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs + 2,
  },
  pillActive: { backgroundColor: colors.accent },
  pillInactive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}40` },
  icon: { fontSize: 18, marginRight: spacing.xs },
  text: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  textActive: { color: colors.surface, fontWeight: '800' },
});

export default CategorySelector;

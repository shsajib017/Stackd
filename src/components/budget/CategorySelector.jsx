import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const isSelected = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.pill,
              { borderRadius: theme.borderRadius.md },
              isSelected
                ? { backgroundColor: theme.colors.accent }
                : { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: `${theme.colors.textTertiary}30` },
            ]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.8}
          >
            <Text style={styles.icon}>{CATEGORY_ICONS[cat] || '📦'}</Text>
            <Text style={[styles.text, { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary }, isSelected && styles.textActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  pill: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  icon: { fontSize: 18, marginRight: 4 },
  text: { fontSize: 12, fontWeight: '600' },
  textActive: { fontWeight: '800' },
});

export default CategorySelector;

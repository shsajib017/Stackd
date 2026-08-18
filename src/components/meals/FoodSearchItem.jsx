import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Bangladeshi & Custom Food Search Result Card.
 */
const FoodSearchItem = React.memo(({ item, onSelect, isSelected = false }) => {
  const { theme } = useTheme();
  const price = item.avg_price_bdt ?? item.price ?? 0;
  const isCustom = Boolean(item.user_id || item.is_custom);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: `${theme.colors.textTertiary}20`,
        },
        isSelected && { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}12` },
      ]}
      onPress={() => onSelect?.(item)}
      activeOpacity={0.75}
    >
      <View style={styles.leftCol}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>{item.name || item.food_name}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: `${theme.colors.primary}12`, borderRadius: theme.borderRadius.sm }, isCustom && { backgroundColor: `${theme.colors.accent}15` }]}>
            <Text style={[styles.badgeText, { color: theme.colors.primary }, isCustom && { color: theme.colors.accent }]}>
              {isCustom ? '⭐ My Food' : item.category || 'General'}
            </Text>
          </View>
          {item.calories ? (
            <Text style={[styles.calorieText, { color: theme.colors.textTertiary }]}>🔥 {item.calories} kcal</Text>
          ) : null}
        </View>
      </View>
      <Text style={[styles.priceText, { color: theme.colors.accent }]}>৳{price}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 4, borderWidth: 1 },
  leftCol: { flex: 1, marginRight: 8 },
  name: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 8, fontWeight: '700' },
  calorieText: { fontSize: 9, fontWeight: '600' },
  priceText: { fontSize: 13, fontWeight: '800' },
});

export default FoodSearchItem;

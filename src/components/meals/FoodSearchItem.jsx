import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Bangladeshi & Custom Food Search Result Card.
 */
const FoodSearchItem = React.memo(({ item, onSelect, isSelected = false }) => {
  const price = item.avg_price_bdt ?? item.price ?? 0;
  const isCustom = Boolean(item.user_id || item.is_custom);

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect?.(item)}
      activeOpacity={0.75}
    >
      <View style={styles.leftCol}>
        <Text style={styles.name} numberOfLines={1}>{item.name || item.food_name}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isCustom && styles.customBadge]}>
            <Text style={[styles.badgeText, isCustom && styles.customBadgeText]}>
              {isCustom ? '⭐ My Food' : item.category || 'General'}
            </Text>
          </View>
          {item.calories ? (
            <Text style={styles.calorieText}>🔥 {item.calories} kcal</Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.priceText}>৳{price}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0, 0, 0, 0.025)', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.05)' },
  cardSelected: { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
  leftCol: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: { backgroundColor: `${colors.primary}12`, paddingHorizontal: spacing.xs + 2, paddingVertical: 2, borderRadius: borderRadius.sm },
  customBadge: { backgroundColor: `${colors.accent}15` },
  badgeText: { fontSize: fontSizes.xs - 2, fontWeight: '700', color: colors.primary },
  customBadgeText: { color: colors.accent },
  calorieText: { fontSize: fontSizes.xs - 1, color: colors.textTertiary, fontWeight: '600' },
  priceText: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.accent },
});

export default FoodSearchItem;

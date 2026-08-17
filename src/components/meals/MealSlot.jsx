import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import StatusChip from '../common/StatusChip';

/**
 * 3-State Meal Slot Card with solid opaque themes to prevent Android alpha rendering artifacts.
 */
const MealSlot = React.memo(({ mealType, emoji = '🍽️', meal, onLog, onDelete }) => {
  if (!meal) {
    return (
      <TouchableOpacity
        style={styles.emptySlot}
        onPress={() => onLog?.(mealType)}
        activeOpacity={0.7}
      >
        <View style={styles.leftRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.emptyTitle}>{mealType}</Text>
        </View>
        <View style={styles.addPill}>
          <Text style={styles.addPillText}>+ Log</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const isDorm = meal.source === 'dorm';

  return (
    <View style={[styles.slot, isDorm ? styles.dormSlot : styles.outsideSlot]}>
      <View style={styles.headerRow}>
        <View style={styles.leftRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.mealTypeLabel, isDorm ? styles.dormLabel : styles.outsideLabel]}>{mealType}</Text>
            <Text style={[styles.foodTitle, isDorm ? styles.dormTitle : styles.outsideTitle]} numberOfLines={1}>
              {isDorm ? '🏠 Dorm meal' : meal.food_name || 'Outside food'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete?.(meal)}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        {isDorm ? (
          <StatusChip label="Logged ✓" type="success" size="sm" />
        ) : (
          <View style={styles.outsideMeta}>
            <Text style={styles.priceTag}>৳{meal.price || 0}</Text>
            {meal.calories ? <Text style={styles.calorieTag}>🔥 {meal.calories} kcal</Text> : null}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  emptySlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1.5, borderColor: `${colors.textTertiary}40`, borderStyle: 'dashed', borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
  leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { backgroundColor: 'transparent' },
  emoji: { fontSize: 24, marginRight: spacing.sm },
  emptyTitle: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textSecondary },
  addPill: { backgroundColor: `${colors.primary}15`, paddingHorizontal: spacing.sm + 2, paddingVertical: 5, borderRadius: borderRadius.full },
  addPillText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  slot: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1 },
  dormSlot: { backgroundColor: '#EBF7EE', borderColor: '#BCE7C6' },
  outsideSlot: { backgroundColor: '#FFF7E6', borderColor: '#FDE1A6' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xs, backgroundColor: 'transparent' },
  mealTypeLabel: { fontSize: fontSizes.xs - 1, fontWeight: '700', textTransform: 'uppercase', backgroundColor: 'transparent' },
  dormLabel: { color: '#2E7D32' },
  outsideLabel: { color: '#D97706' },
  foodTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', marginTop: 1, backgroundColor: 'transparent' },
  dormTitle: { color: '#1B5E20' },
  outsideTitle: { color: '#B45309' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textTertiary },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2, backgroundColor: 'transparent' },
  outsideMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priceTag: { fontSize: fontSizes.sm, fontWeight: '800', color: '#D97706' },
  calorieTag: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
});

export default MealSlot;

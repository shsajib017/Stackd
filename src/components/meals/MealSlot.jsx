import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import StatusChip from '../common/StatusChip';

/**
 * 3-State Meal Slot Card with solid opaque themes to prevent Android alpha rendering artifacts.
 */
const MealSlot = React.memo(({ mealType, emoji = '🍽️', meal, onLog, onDelete }) => {
  const { theme, isDark } = useTheme();

  if (!meal) {
    return (
      <TouchableOpacity
        style={[
          styles.emptySlot,
          {
            backgroundColor: theme.colors.surface,
            borderColor: `${theme.colors.textTertiary}40`,
            borderRadius: theme.borderRadius.lg,
          },
        ]}
        onPress={() => onLog?.(mealType)}
        activeOpacity={0.7}
      >
        <View style={styles.leftRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.textSecondary }]}>{mealType}</Text>
        </View>
        <View style={[styles.addPill, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.full }]}>
          <Text style={[styles.addPillText, { color: theme.colors.primary }]}>+ Log</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const isDorm = meal.source === 'dorm';

  const dormBg = isDark ? '#1C3325' : '#EBF7EE';
  const dormBorder = isDark ? '#2E593E' : '#BCE7C6';
  const dormTextColor = isDark ? '#81C784' : '#1B5E20';

  const outsideBg = isDark ? '#382B1B' : '#FFF7E6';
  const outsideBorder = isDark ? '#61492B' : '#FDE1A6';
  const outsideTextColor = isDark ? '#FFB74D' : '#B45309';

  return (
    <View
      style={[
        styles.slot,
        {
          borderRadius: theme.borderRadius.lg,
          backgroundColor: isDorm ? dormBg : outsideBg,
          borderColor: isDorm ? dormBorder : outsideBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.leftRow}>
          <Text style={styles.emoji}>{emoji}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.mealTypeLabel, { color: isDorm ? dormTextColor : outsideTextColor }]}>{mealType}</Text>
            <Text style={[styles.foodTitle, { color: isDorm ? dormTextColor : outsideTextColor }]} numberOfLines={1}>
              {isDorm ? '🏠 Dorm meal' : meal.food_name || 'Outside food'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onDelete?.(meal)}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.deleteIcon, { color: theme.colors.textTertiary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        {isDorm ? (
          <StatusChip label="Logged ✓" type="success" size="sm" />
        ) : (
          <View style={styles.outsideMeta}>
            <Text style={[styles.priceTag, { color: outsideTextColor }]}>৳{meal.price || 0}</Text>
            {meal.calories ? <Text style={[styles.calorieTag, { color: theme.colors.textSecondary }]}>🔥 {meal.calories} kcal</Text> : null}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  emptySlot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderStyle: 'dashed', padding: 16, marginBottom: 8 },
  leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  textContainer: { backgroundColor: 'transparent' },
  emoji: { fontSize: 24, marginRight: 8 },
  emptyTitle: { fontSize: 13, fontWeight: '700' },
  addPill: { paddingHorizontal: 10, paddingVertical: 5 },
  addPillText: { fontSize: 10, fontWeight: '700' },
  slot: { padding: 16, marginBottom: 8, borderWidth: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, backgroundColor: 'transparent' },
  mealTypeLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', backgroundColor: 'transparent' },
  foodTitle: { fontSize: 13, fontWeight: '800', marginTop: 1, backgroundColor: 'transparent' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 12, fontWeight: '700' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2, backgroundColor: 'transparent' },
  outsideMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceTag: { fontSize: 12, fontWeight: '800' },
  calorieTag: { fontSize: 10, fontWeight: '700' },
});

export default MealSlot;

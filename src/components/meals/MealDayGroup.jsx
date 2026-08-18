import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { formatDateFull } from '../../utils/formatDate';

const MEAL_EMOJIS = { Breakfast: '🍳', Lunch: '🍛', Dinner: '🍲', Snacks: '🥪' };

/** Component rendering all meals logged on a specific date. */
const MealDayGroup = React.memo(({ date, meals = [] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.dateHeader}>{formatDateFull(date)}</Text>
      <View style={styles.card}>
        {meals.map((meal, idx) => {
          const isDorm = meal.source === 'dorm';
          const emoji = MEAL_EMOJIS[meal.meal_type] || '🍽️';
          const isLast = idx === meals.length - 1;

          return (
            <View key={meal.id || idx} style={[styles.mealRow, isLast && styles.noBorder]}>
              <View style={styles.leftCol}>
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>{meal.meal_type}</Text>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {isDorm ? 'Dorm meal' : (meal.food_name || 'Outside food')}
                  </Text>
                </View>
              </View>
              <View style={styles.rightCol}>
                {isDorm ? (
                  <View style={styles.dormBadge}><Text style={styles.dormText}>Dorm</Text></View>
                ) : (
                  <Text style={styles.priceText}>৳ {meal.price || 0}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  dateHeader: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.xs, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  noBorder: { borderBottomWidth: 0 },
  leftCol: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  emoji: { fontSize: fontSizes.md, marginRight: spacing.sm },
  mealInfo: { flex: 1 },
  mealType: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textTertiary, marginBottom: 1 },
  foodName: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  rightCol: { alignItems: 'flex-end' },
  priceText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.accent },
  dormBadge: { backgroundColor: `${colors.success}18`, paddingHorizontal: spacing.xs + 4, paddingVertical: 2, borderRadius: borderRadius.full },
  dormText: { fontSize: fontSizes.xs - 1, fontWeight: '700', color: colors.success },
});

export default MealDayGroup;

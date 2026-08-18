import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatDateFull } from '../../utils/formatDate';

const MEAL_EMOJIS = { Breakfast: '🍳', Lunch: '🍛', Dinner: '🍲', Snacks: '🥪' };

/** Component rendering all meals logged on a specific date. */
const MealDayGroup = React.memo(({ date, meals = [] }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>{formatDateFull(date)}</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
        {meals.map((meal, idx) => {
          const isDorm = meal.source === 'dorm';
          const emoji = MEAL_EMOJIS[meal.meal_type] || '🍽️';
          const isLast = idx === meals.length - 1;

          return (
            <View key={meal.id || idx} style={[styles.mealRow, { borderBottomColor: `${theme.colors.textTertiary}15` }, isLast && styles.noBorder]}>
              <View style={styles.leftCol}>
                <Text style={styles.emoji}>{emoji}</Text>
                <View style={styles.mealInfo}>
                  <Text style={[styles.mealType, { color: theme.colors.textTertiary }]}>{meal.meal_type}</Text>
                  <Text style={[styles.foodName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {isDorm ? 'Dorm meal' : (meal.food_name || 'Outside food')}
                  </Text>
                </View>
              </View>
              <View style={styles.rightCol}>
                {isDorm ? (
                  <View style={[styles.dormBadge, { backgroundColor: `${theme.colors.success}18`, borderRadius: theme.borderRadius.full }]}>
                    <Text style={[styles.dormText, { color: theme.colors.success }]}>Dorm</Text>
                  </View>
                ) : (
                  <Text style={[styles.priceText, { color: theme.colors.accent }]}>৳ {meal.price || 0}</Text>
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
  container: { marginBottom: 16 },
  dateHeader: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  card: { paddingHorizontal: 16, borderWidth: 1 },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  noBorder: { borderBottomWidth: 0 },
  leftCol: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  emoji: { fontSize: 14, marginRight: 8 },
  mealInfo: { flex: 1 },
  mealType: { fontSize: 10, fontWeight: '600', marginBottom: 1 },
  foodName: { fontSize: 12, fontWeight: '600' },
  rightCol: { alignItems: 'flex-end' },
  priceText: { fontSize: 12, fontWeight: '700' },
  dormBadge: { paddingHorizontal: 8, paddingVertical: 2 },
  dormText: { fontSize: 9, fontWeight: '700' },
});

export default MealDayGroup;

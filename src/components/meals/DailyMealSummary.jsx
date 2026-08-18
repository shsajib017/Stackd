import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import StatusChip from '../common/StatusChip';

/**
 * Daily Nutrition and Meal Spending Breakdown Summary Card.
 */
const DailyMealSummary = React.memo(({ meals = [], dailySpend = 0, budgetLimit = 400 }) => {
  const { theme } = useTheme();

  const { dormCount, outsideCount, totalCalories } = useMemo(() => {
    let dorm = 0;
    let outside = 0;
    let calories = 0;

    meals.forEach((m) => {
      if (m.source === 'dorm') dorm += 1;
      if (m.source === 'outside') {
        outside += 1;
        if (m.calories) calories += Number(m.calories) || 0;
      }
    });

    return { dormCount: dorm, outsideCount: outside, totalCalories: calories };
  }, [meals]);

  const isOverBudget = dailySpend > budgetLimit;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.textTertiary}20`,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Daily Summary</Text>
        <StatusChip
          label={isOverBudget ? 'Over food budget' : 'Within budget'}
          type={isOverBudget ? 'danger' : 'success'}
          size="sm"
        />
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statItem, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]}>
          <Text style={styles.statIcon}>🏠</Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{dormCount} {dormCount === 1 ? 'dorm meal' : 'dorm meals'}</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]}>
          <Text style={styles.statIcon}>🍜</Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{outsideCount} {outsideCount === 1 ? 'outside meal' : 'outside meals'}</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>Spent: ৳{dailySpend}</Text>
        </View>
        {totalCalories > 0 && (
          <View style={[styles.statItem, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{totalCalories} kcal</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 13, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
  statIcon: { fontSize: 12, marginRight: 4 },
  statText: { fontSize: 10, fontWeight: '700' },
});

export default DailyMealSummary;

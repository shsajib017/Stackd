import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import StatusChip from '../common/StatusChip';

/**
 * Daily Nutrition and Meal Spending Breakdown Summary Card.
 */
const DailyMealSummary = React.memo(({ meals = [], dailySpend = 0, budgetLimit = 400 }) => {
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
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily Summary</Text>
        <StatusChip
          label={isOverBudget ? 'Over food budget' : 'Within budget'}
          type={isOverBudget ? 'danger' : 'success'}
          size="sm"
        />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏠</Text>
          <Text style={styles.statText}>{dormCount} {dormCount === 1 ? 'dorm meal' : 'dorm meals'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🍜</Text>
          <Text style={styles.statText}>{outsideCount} {outsideCount === 1 ? 'outside meal' : 'outside meals'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statText}>Spent: ৳{dailySpend}</Text>
        </View>
        {totalCalories > 0 && (
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statText}>{totalCalories} kcal</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.sm },
  statIcon: { fontSize: fontSizes.sm, marginRight: 4 },
  statText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
});

export default DailyMealSummary;

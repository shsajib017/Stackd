import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';

/**
 * Combined activity streak card displaying total days and module indicators.
 *
 * @param {object} props
 * @param {number} props.streakCount - Current active consecutive days.
 * @param {boolean} props.hasExpenseToday - Expense logged today status.
 * @param {boolean} props.hasSessionToday - Study session completed today status.
 * @param {boolean} props.hasMealToday - Meal logged today status.
 */
const StreakCard = React.memo(({
  streakCount = 0,
  hasExpenseToday = false,
  hasSessionToday = false,
  hasMealToday = false,
}) => {
  const modules = [
    { icon: '💰', label: 'Budget', done: hasExpenseToday },
    { icon: '📚', label: 'Study', done: hasSessionToday },
    { icon: '🍽️', label: 'Meals', done: hasMealToday },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.streakCenter}>
        <Text style={styles.streakNumber}>{streakCount}</Text>
        <Text style={styles.streakLabel}>day streak 🔥</Text>
      </View>

      <View style={styles.indicatorsRow}>
        {modules.map((item) => (
          <View key={item.label} style={styles.indicatorItem}>
            <Text style={styles.indicatorIcon}>{item.icon}</Text>
            <View style={[styles.tickBadge, item.done ? styles.tickBadgeDone : styles.tickBadgePending]}>
              <Text style={styles.tickText}>{item.done ? '✓' : '○'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  streakCenter: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  streakNumber: {
    fontSize: fontSizes.xxxl + 8,
    fontWeight: '900',
    color: colors.primary,
    lineHeight: 48,
  },
  streakLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 2,
  },
  indicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    width: '100%',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: `${colors.textTertiary}30`,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  tickBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickBadgeDone: {
    backgroundColor: colors.success,
  },
  tickBadgePending: {
    backgroundColor: colors.textTertiary,
    opacity: 0.5,
  },
  tickText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default StreakCard;

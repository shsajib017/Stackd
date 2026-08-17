import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import ProgressBar from '../common/ProgressBar';

/**
 * Monthly budget summary card showing total expenditure vs limit and visual progress.
 *
 * @param {object} props
 * @param {number} props.spent - Amount spent this month.
 * @param {number} props.limit - Monthly spending limit.
 * @param {() => void} props.onPress - Navigation callback.
 */
const BudgetSummaryCard = React.memo(({ spent = 0, limit = 0, onPress }) => {
  const ratio = useMemo(() => {
    if (!limit || limit <= 0) return 0;
    return spent / limit;
  }, [limit, spent]);

  const progressColor = useMemo(() => {
    if (ratio > 0.9) return colors.error;
    if (ratio >= 0.7) return colors.warning;
    return colors.success;
  }, [ratio]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>💰</Text>
          <Text style={styles.title}>Budget</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </View>

      <Text style={styles.amountText}>
        ৳ {spent.toLocaleString()} <Text style={styles.amountLimit}>of ৳ {limit.toLocaleString()} this month</Text>
      </Text>

      <ProgressBar
        progress={ratio}
        color={progressColor}
        height={8}
        showLabel={false}
        style={styles.progressBar}
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs + 2,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  amountText: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  amountLimit: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  progressBar: {
    marginTop: spacing.xs,
  },
});

export default BudgetSummaryCard;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import { formatBDT } from '../../utils/formatCurrency';
import ProgressBar from '../common/ProgressBar';

/**
 * Compact horizontal savings goal card.
 *
 * @param {object} props
 * @param {string} props.title - Goal title.
 * @param {number} props.currentAmount - Current saved amount.
 * @param {number} props.targetAmount - Target amount.
 * @param {string} [props.emoji='🎯'] - Goal emoji icon.
 * @param {() => void} [props.onPress] - Press callback.
 */
const SavingsGoalCard = React.memo(({
  title,
  currentAmount = 0,
  targetAmount = 0,
  emoji = '🎯',
  onPress,
}) => {
  const progress = targetAmount > 0 ? Math.min(currentAmount / targetAmount, 1) : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.amountText}>
        {formatBDT(currentAmount)} <Text style={styles.targetText}>/ {formatBDT(targetAmount)}</Text>
      </Text>
      <ProgressBar progress={progress} color={colors.primary} height={6} showLabel={false} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  amountText: {
    fontSize: fontSizes.sm,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  targetText: {
    fontSize: fontSizes.xs,
    fontWeight: '400',
    color: colors.textSecondary,
  },
});

export default SavingsGoalCard;

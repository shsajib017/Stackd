import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatBDT } from '../../utils/formatCurrency';
import ProgressBar from '../common/ProgressBar';

/**
 * Compact horizontal savings goal card.
 */
const SavingsGoalCard = React.memo(({
  title,
  currentAmount = 0,
  targetAmount = 0,
  emoji = '🎯',
  onPress,
}) => {
  const { theme } = useTheme();
  const progress = targetAmount > 0 ? Math.min(currentAmount / targetAmount, 1) : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.textTertiary}20`,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
        {formatBDT(currentAmount)} <Text style={[styles.targetText, { color: theme.colors.textSecondary }]}>/ {formatBDT(targetAmount)}</Text>
      </Text>
      <ProgressBar progress={progress} color={theme.colors.primary} height={6} showLabel={false} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 160,
    padding: 16,
    marginRight: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  emoji: {
    fontSize: 18,
    marginRight: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  targetText: {
    fontSize: 10,
    fontWeight: '400',
  },
});

export default SavingsGoalCard;

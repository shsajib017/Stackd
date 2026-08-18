import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import ProgressBar from '../common/ProgressBar';

/**
 * Monthly budget summary card showing total expenditure vs limit and visual progress.
 */
const BudgetSummaryCard = React.memo(({ spent = 0, limit = 0, onPress }) => {
  const { theme } = useTheme();

  const ratio = useMemo(() => {
    if (!limit || limit <= 0) return 0;
    return spent / limit;
  }, [limit, spent]);

  const progressColor = useMemo(() => {
    if (ratio > 0.9) return theme.colors.error;
    if (ratio >= 0.7) return theme.colors.accent;
    return theme.colors.success;
  }, [ratio, theme.colors.accent, theme.colors.error, theme.colors.success]);

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
        <View style={styles.titleRow}>
          <Text style={styles.icon}>💰</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Budget</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>→</Text>
      </View>

      <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
        ৳ {spent.toLocaleString()} <Text style={[styles.amountLimit, { color: theme.colors.textSecondary }]}>of ৳ {limit.toLocaleString()} this month</Text>
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
    padding: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 4,
  },
  amountLimit: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    marginTop: 4,
  },
});

export default BudgetSummaryCard;

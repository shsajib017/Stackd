import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { formatBDT } from '../../utils/formatCurrency';
import ProgressBar from '../common/ProgressBar';

/**
 * Visual progress bar for an individual expense category spending vs limit.
 *
 * @param {object} props
 * @param {string} props.category - Category title/label.
 * @param {number} props.spent - Amount spent in this category.
 * @param {number} [props.limit] - Optional category budget limit.
 */
const CategoryBar = React.memo(({ category, spent = 0, limit }) => {
  const ratio = limit && limit > 0 ? Math.min(spent / limit, 1) : 0;
  const isOver = limit && limit > 0 && spent > limit;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryName}>{category}</Text>
        <Text style={styles.amountText}>
          {formatBDT(spent)}
          {limit ? <Text style={styles.limitText}> / {formatBDT(limit)}</Text> : null}
        </Text>
      </View>
      {limit && limit > 0 ? (
        <ProgressBar
          progress={ratio}
          color={isOver ? colors.error : colors.primary}
          height={6}
          showLabel={false}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  amountText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  limitText: {
    fontSize: fontSizes.xs,
    fontWeight: '400',
    color: colors.textSecondary,
  },
});

export default CategoryBar;

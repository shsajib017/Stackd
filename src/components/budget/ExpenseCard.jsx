import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import { formatBDT } from '../../utils/formatCurrency';
import { formatDateShort } from '../../utils/formatDate';

/**
 * Transaction row displaying category, note, date, and red expense amount.
 *
 * @param {object} props
 * @param {string} props.category - Expense category name.
 * @param {string} [props.note] - Optional description note.
 * @param {string} props.date - Expense date string.
 * @param {number} props.amount - Expense amount.
 * @param {() => void} [props.onPress] - Press callback.
 */
const ExpenseCard = React.memo(({
  category,
  note,
  date,
  amount,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.category} numberOfLines={1}>
          {note || category || 'Expense'}
        </Text>
        <Text style={styles.date}>{formatDateShort(date)}</Text>
      </View>
      <Text style={styles.amount}>-{formatBDT(amount)}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
  },
  left: {
    flex: 1,
    marginRight: spacing.sm,
  },
  category: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  date: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    color: colors.error,
  },
});

export default ExpenseCard;

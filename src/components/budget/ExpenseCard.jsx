import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatBDT } from '../../utils/formatCurrency';
import { formatDateShort } from '../../utils/formatDate';

/**
 * Transaction row displaying category, note, date, and red expense amount.
 */
const ExpenseCard = React.memo(({
  category,
  note,
  date,
  amount,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: `${theme.colors.textTertiary}20`,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={[styles.category, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {note || category || 'Expense'}
        </Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>{formatDateShort(date)}</Text>
      </View>
      <Text style={[styles.amount, { color: theme.colors.error }]}>-{formatBDT(amount)}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 3,
    borderWidth: 1,
  },
  left: {
    flex: 1,
    marginRight: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    fontSize: 10,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
  },
});

export default ExpenseCard;

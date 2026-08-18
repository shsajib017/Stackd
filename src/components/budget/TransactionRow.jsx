import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatBDT } from '../../utils/formatCurrency';
import { formatDateShort } from '../../utils/formatDate';

const EXPENSE_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };
const INCOME_ICONS = { Allowance: '💸', 'Part-time': '💼', Scholarship: '🎓', Other: '📦' };

/** Individual transaction row displaying category icon, title, date, and amount. */
const TransactionRow = React.memo(({
  transaction,
  type,
  onPress,
  onDelete,
}) => {
  const { theme } = useTheme();
  const isExpense = type === 'expense';
  const icon = isExpense
    ? EXPENSE_ICONS[transaction.category] || '💸'
    : INCOME_ICONS[transaction.source] || '💰';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: `${theme.colors.textTertiary}20`,
        },
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      onLongPress={onDelete}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.textTertiary}15` }]}>
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {transaction.note || (isExpense ? transaction.category : transaction.source)}
        </Text>
        <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
          {isExpense ? transaction.category : transaction.source} • {formatDateShort(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.cardAmount, { color: isExpense ? theme.colors.error : theme.colors.success }]}>
        {isExpense ? '-' : '+'}{formatBDT(transaction.amount)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
  },
  cardPressed: { opacity: 0.6 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  iconEmoji: { fontSize: 18 },
  cardInfo: { flex: 1, marginRight: 8 },
  cardTitle: { fontSize: 12, fontWeight: '700' },
  cardSub: { fontSize: 10, marginTop: 2 },
  cardAmount: { fontSize: 14, fontWeight: '800' },
});

export default TransactionRow;

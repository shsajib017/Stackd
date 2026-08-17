import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
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
  const isExpense = type === 'expense';
  const icon = isExpense
    ? EXPENSE_ICONS[transaction.category] || '💸'
    : INCOME_ICONS[transaction.source] || '💰';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onDelete}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {transaction.note || (isExpense ? transaction.category : transaction.source)}
        </Text>
        <Text style={styles.cardSub}>
          {isExpense ? transaction.category : transaction.source} • {formatDateShort(transaction.date)}
        </Text>
      </View>
      <Text style={[styles.cardAmount, isExpense ? styles.red : styles.green]}>
        {isExpense ? '-' : '+'}{formatBDT(transaction.amount)}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
  },
  cardPressed: { opacity: 0.6 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.textTertiary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconEmoji: { fontSize: 18 },
  cardInfo: { flex: 1, marginRight: spacing.sm },
  cardTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  cardSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  cardAmount: { fontSize: fontSizes.md, fontWeight: '800' },
  red: { color: colors.error },
  green: { color: colors.success },
});

export default TransactionRow;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatBDT } from '../../utils/formatCurrency';
import ProgressBar from '../common/ProgressBar';

/**
 * Visual progress bar for an individual expense category spending vs limit.
 */
const CategoryBar = React.memo(({ category, spent = 0, limit }) => {
  const { theme } = useTheme();
  const ratio = limit && limit > 0 ? Math.min(spent / limit, 1) : 0;
  const isOver = limit && limit > 0 && spent > limit;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.categoryName, { color: theme.colors.textPrimary }]}>{category}</Text>
        <Text style={[styles.amountText, { color: theme.colors.textPrimary }]}>
          {formatBDT(spent)}
          {limit ? <Text style={[styles.limitText, { color: theme.colors.textSecondary }]}> / {formatBDT(limit)}</Text> : null}
        </Text>
      </View>
      {limit && limit > 0 ? (
        <ProgressBar
          progress={ratio}
          color={isOver ? theme.colors.error : theme.colors.primary}
          height={6}
          showLabel={false}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  limitText: {
    fontSize: 10,
    fontWeight: '400',
  },
});

export default CategoryBar;

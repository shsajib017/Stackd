import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Combined activity streak card displaying total days and module indicators.
 */
const StreakCard = React.memo(({
  streakCount = 0,
  hasExpenseToday = false,
  hasSessionToday = false,
  hasMealToday = false,
}) => {
  const { theme } = useTheme();

  const modules = [
    { icon: '💰', label: 'Budget', done: hasExpenseToday },
    { icon: '📚', label: 'Study', done: hasSessionToday },
    { icon: '🍽️', label: 'Meals', done: hasMealToday },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.textTertiary}20`,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.streakCenter}>
        <Text style={[styles.streakNumber, { color: theme.colors.primary }]}>{streakCount}</Text>
        <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>day streak 🔥</Text>
      </View>

      <View style={[styles.indicatorsRow, { borderTopColor: `${theme.colors.textTertiary}20` }]}>
        {modules.map((item) => (
          <View key={item.label} style={styles.indicatorItem}>
            <Text style={styles.indicatorIcon}>{item.icon}</Text>
            <View
              style={[
                styles.tickBadge,
                item.done
                  ? { backgroundColor: theme.colors.success }
                  : { backgroundColor: `${theme.colors.textTertiary}50` },
              ]}
            >
              <Text style={[styles.tickText, { color: '#FFFFFF' }]}>{item.done ? '✓' : '○'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  streakCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 48,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  indicatorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  tickBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default StreakCard;

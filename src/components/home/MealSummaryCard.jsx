import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Meal tracking and outside food expense summary card.
 */
const MealSummaryCard = React.memo(({
  dormMealCount = 0,
  outsideSpent = 0,
  onPress,
}) => {
  const { theme } = useTheme();

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
          <Text style={styles.icon}>🍽️</Text>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Meals</Text>
        </View>
        <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>→</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.colors.textPrimary }]}>{dormMealCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>dorm meals today</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: `${theme.colors.textTertiary}30` }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.colors.textPrimary }]}>৳ {outsideSpent.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>spent on outside food</Text>
        </View>
      </View>
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default MealSummaryCard;

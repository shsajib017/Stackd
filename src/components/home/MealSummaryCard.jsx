import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';

/**
 * Meal tracking and outside food expense summary card.
 *
 * @param {object} props
 * @param {number} props.dormMealCount - Number of dorm meals logged today.
 * @param {number} props.outsideSpent - Total spent on outside food today.
 * @param {() => void} props.onPress - Navigation callback.
 */
const MealSummaryCard = React.memo(({
  dormMealCount = 0,
  outsideSpent = 0,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>🍽️</Text>
          <Text style={styles.title}>Meals</Text>
        </View>
        <Text style={styles.chevron}>→</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{dormMealCount}</Text>
          <Text style={styles.statLabel}>dorm meals today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>৳ {outsideSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>spent on outside food</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs + 2,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chevron: {
    fontSize: fontSizes.md,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: `${colors.textTertiary}40`,
    marginHorizontal: spacing.sm,
  },
  statNumber: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default MealSummaryCard;

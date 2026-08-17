import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../config/theme';
import { formatBDT } from '../../utils/formatCurrency';
import ProgressBar from './ProgressBar';

/** Active Goals section within SideDrawer */
const DrawerGoals = React.memo(({ goals, onSeeAllPress }) => {
  if (!goals || goals.length === 0) return null;

  const displayGoals = goals.slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Goals 🎯</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all goals →</Text>
        </TouchableOpacity>
      </View>

      {displayGoals.map((goal) => {
        const current = Number(goal.current_amount || 0);
        const target = Number(goal.target_amount || 1);
        const progress = target > 0 ? Math.min(current / target, 1) : 0;

        return (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalTop}>
              <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
              <Text style={styles.goalAmount}>{formatBDT(current)} of {formatBDT(target)}</Text>
            </View>
            <ProgressBar progress={progress} color={colors.accent} height={6} showLabel={false} />
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textTertiary}20`,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.textPrimary },
  seeAll: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  goalItem: { marginTop: spacing.xs + 2 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalTitle: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  goalAmount: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600' },
});

export default DrawerGoals;

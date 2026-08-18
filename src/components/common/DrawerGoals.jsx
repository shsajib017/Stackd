import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatBDT } from '../../utils/formatCurrency';
import ProgressBar from './ProgressBar';

/** Active Goals section within SideDrawer */
const DrawerGoals = React.memo(({ goals, onSeeAllPress }) => {
  const { theme } = useTheme();

  if (!goals || goals.length === 0) return null;

  const displayGoals = goals.slice(0, 2);

  return (
    <View style={[styles.container, { borderBottomColor: `${theme.colors.textTertiary}20` }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Active Goals 🎯</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See all goals →</Text>
        </TouchableOpacity>
      </View>

      {displayGoals.map((goal) => {
        const current = Number(goal.current_amount || 0);
        const target = Number(goal.target_amount || 1);
        const progress = target > 0 ? Math.min(current / target, 1) : 0;

        return (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalTop}>
              <Text style={[styles.goalTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{goal.title}</Text>
              <Text style={[styles.goalAmount, { color: theme.colors.textSecondary }]}>{formatBDT(current)} of {formatBDT(target)}</Text>
            </View>
            <ProgressBar progress={progress} color={theme.colors.accent} height={6} showLabel={false} />
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 12, fontWeight: '800' },
  seeAll: { fontSize: 10, fontWeight: '700' },
  goalItem: { marginTop: 6 },
  goalTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalTitle: { fontSize: 10, fontWeight: '700', flex: 1 },
  goalAmount: { fontSize: 10, fontWeight: '600' },
});

export default DrawerGoals;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import ProgressBar from '../common/ProgressBar';
import StatusChip from '../common/StatusChip';

/** Weekly Progress Summary for Goals Screen. */
const WeeklyProgress = React.memo(({ caloriesConsumed = 0, caloriesTarget = 14000, studyHours = 0, studyTarget = 28, budgetSpent = 0, budgetLimit = 2500 }) => {
  const { theme } = useTheme();
  const calRatio = caloriesTarget > 0 ? Math.min(caloriesConsumed / caloriesTarget, 1) : 0;
  const studyRatio = studyTarget > 0 ? Math.min(studyHours / studyTarget, 1) : 0;
  const budgetRatio = budgetLimit > 0 ? Math.min(budgetSpent / budgetLimit, 1) : 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
      <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>This Week's Progress</Text>

      {/* Calories */}
      <View style={styles.metricRow}>
        <View style={styles.labelRow}>
          <Text style={[styles.metricName, { color: theme.colors.textSecondary }]}>🍲 Calories ({caloriesConsumed}/{caloriesTarget} kcal)</Text>
          <StatusChip label={caloriesConsumed <= caloriesTarget ? 'On track' : 'Over'} type={caloriesConsumed <= caloriesTarget ? 'success' : 'warning'} size="sm" />
        </View>
        <ProgressBar progress={calRatio} color={theme.colors.accent} height={8} />
      </View>

      {/* Study */}
      <View style={styles.metricRow}>
        <View style={styles.labelRow}>
          <Text style={[styles.metricName, { color: theme.colors.textSecondary }]}>📚 Study ({studyHours}/{studyTarget} hrs)</Text>
          <StatusChip label={studyHours >= (studyTarget * 0.5) ? 'On track' : 'Behind'} type={studyHours >= (studyTarget * 0.5) ? 'success' : 'warning'} size="sm" />
        </View>
        <ProgressBar progress={studyRatio} color={theme.colors.primary} height={8} />
      </View>

      {/* Budget */}
      <View style={[styles.metricRow, styles.noMargin]}>
        <View style={styles.labelRow}>
          <Text style={[styles.metricName, { color: theme.colors.textSecondary }]}>💰 Food Spend (৳{budgetSpent}/৳{budgetLimit})</Text>
          <StatusChip label={budgetSpent <= budgetLimit ? 'On track' : 'Over'} type={budgetSpent <= budgetLimit ? 'success' : 'danger'} size="sm" />
        </View>
        <ProgressBar progress={budgetRatio} color={budgetSpent <= budgetLimit ? theme.colors.success : theme.colors.error} height={8} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1, marginTop: 16 },
  headerTitle: { fontSize: 13, fontWeight: '800', marginBottom: 8 },
  metricRow: { marginBottom: 10 },
  noMargin: { marginBottom: 0 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  metricName: { fontSize: 10, fontWeight: '700' },
});

export default WeeklyProgress;

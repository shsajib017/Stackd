import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import ProgressBar from '../common/ProgressBar';
import StatusChip from '../common/StatusChip';

/** Weekly Progress Summary for Goals Screen. */
const WeeklyProgress = React.memo(({ caloriesConsumed = 0, caloriesTarget = 14000, studyHours = 0, studyTarget = 28, budgetSpent = 0, budgetLimit = 2500 }) => {
  const calRatio = caloriesTarget > 0 ? Math.min(caloriesConsumed / caloriesTarget, 1) : 0;
  const studyRatio = studyTarget > 0 ? Math.min(studyHours / studyTarget, 1) : 0;
  const budgetRatio = budgetLimit > 0 ? Math.min(budgetSpent / budgetLimit, 1) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.headerTitle}>This Week's Progress</Text>

      {/* Calories */}
      <View style={styles.metricRow}>
        <View style={styles.labelRow}>
          <Text style={styles.metricName}>🍲 Calories ({caloriesConsumed}/{caloriesTarget} kcal)</Text>
          <StatusChip label={caloriesConsumed <= caloriesTarget ? 'On track' : 'Over'} type={caloriesConsumed <= caloriesTarget ? 'success' : 'warning'} size="sm" />
        </View>
        <ProgressBar progress={calRatio} color={colors.accent} height={8} />
      </View>

      {/* Study */}
      <View style={styles.metricRow}>
        <View style={styles.labelRow}>
          <Text style={styles.metricName}>📚 Study ({studyHours}/{studyTarget} hrs)</Text>
          <StatusChip label={studyHours >= (studyTarget * 0.5) ? 'On track' : 'Behind'} type={studyHours >= (studyTarget * 0.5) ? 'success' : 'warning'} size="sm" />
        </View>
        <ProgressBar progress={studyRatio} color={colors.primary} height={8} />
      </View>

      {/* Budget */}
      <View style={[styles.metricRow, styles.noMargin]}>
        <View style={styles.labelRow}>
          <Text style={styles.metricName}>💰 Food Spend (৳{budgetSpent}/৳{budgetLimit})</Text>
          <StatusChip label={budgetSpent <= budgetLimit ? 'On track' : 'Over'} type={budgetSpent <= budgetLimit ? 'success' : 'danger'} size="sm" />
        </View>
        <ProgressBar progress={budgetRatio} color={budgetSpent <= budgetLimit ? colors.success : colors.error} height={8} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginTop: spacing.md },
  headerTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.sm },
  metricRow: { marginBottom: spacing.sm + 2 },
  noMargin: { marginBottom: 0 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  metricName: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
});

export default WeeklyProgress;

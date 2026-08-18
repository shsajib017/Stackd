import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import Button from '../common/Button';
import StatusChip from '../common/StatusChip';
import BMIScaleBar from './BMIScaleBar';

const CHIP_MAP = { Underweight: 'info', Normal: 'success', Overweight: 'warning', Obese: 'danger' };

/** Full BMI Calculation & Nutrition Targets Result Card. */
const BMIResultCard = React.memo(({ bmi, category = 'Normal', calorieTarget = 2000, macroSplit = { protein: 25, carbs: 50, fat: 25 }, dietRecommendation, onApplyGoals, isApplying = false }) => {
  const chipType = CHIP_MAP[category] || 'neutral';

  return (
    <View style={styles.card}>
      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.bmiNumber}>{Number(bmi).toFixed(1)}</Text>
          <Text style={styles.bmiSub}>Body Mass Index</Text>
        </View>
        <StatusChip label={category} type={chipType} size="md" />
      </View>

      <BMIScaleBar bmi={bmi} />

      <View style={styles.targetSection}>
        <Text style={styles.targetLabel}>Your daily calorie target</Text>
        <Text style={styles.targetValue}>{calorieTarget} <Text style={styles.targetUnit}>kcal/day</Text></Text>
      </View>

      <View style={styles.macroSection}>
        <Text style={styles.sectionLabel}>Macro target split</Text>
        <View style={styles.macroLabels}>
          <Text style={[styles.macroTag, { color: '#3B82F6' }]}>Protein {macroSplit.protein}%</Text>
          <Text style={[styles.macroTag, { color: '#F59E0B' }]}>Carbs {macroSplit.carbs}%</Text>
          <Text style={[styles.macroTag, { color: '#10B981' }]}>Fat {macroSplit.fat}%</Text>
        </View>
        <View style={styles.macroBar}>
          <View style={[styles.macroSeg, { flex: macroSplit.protein, backgroundColor: '#3B82F6' }]} />
          <View style={[styles.macroSeg, { flex: macroSplit.carbs, backgroundColor: '#F59E0B' }]} />
          <View style={[styles.macroSeg, { flex: macroSplit.fat, backgroundColor: '#10B981' }]} />
        </View>
      </View>

      {dietRecommendation ? (
        <View style={styles.recBox}>
          <Text style={styles.recLabel}>Recommendation</Text>
          <Text style={styles.recText}>Based on your BMI we recommend: <Text style={styles.recBold}>{dietRecommendation}</Text></Text>
        </View>
      ) : null}

      <Button label="Apply these goals" variant="primary" fullWidth onPress={onApplyGoals} loading={isApplying} style={styles.applyBtn} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.md, borderWidth: 1, borderColor: `${colors.primary}30` },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiNumber: { fontSize: 48, fontWeight: '900', color: colors.textPrimary, lineHeight: 52 },
  bmiSub: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  targetSection: { marginVertical: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: `${colors.textTertiary}15` },
  targetLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600' },
  targetValue: { fontSize: fontSizes.xl + 4, fontWeight: '900', color: colors.accent, marginTop: 2 },
  targetUnit: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textTertiary },
  macroSection: { marginBottom: spacing.md },
  sectionLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.xs },
  macroLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroTag: { fontSize: fontSizes.xs - 1, fontWeight: '800' },
  macroBar: { flexDirection: 'row', height: 8, borderRadius: borderRadius.full, overflow: 'hidden' },
  macroSeg: { height: '100%' },
  recBox: { backgroundColor: `${colors.primary}10`, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.primary}25` },
  recLabel: { fontSize: fontSizes.xs - 1, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', marginBottom: 2 },
  recText: { fontSize: fontSizes.xs + 1, color: colors.textPrimary, lineHeight: 18 },
  recBold: { fontWeight: '800', color: colors.primary },
  applyBtn: { marginTop: spacing.xs },
});

export default BMIResultCard;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import Button from '../common/Button';
import StatusChip from '../common/StatusChip';
import BMIScaleBar from './BMIScaleBar';

const CHIP_MAP = { Underweight: 'info', Normal: 'success', Overweight: 'warning', Obese: 'danger' };

/** Full BMI Calculation & Nutrition Targets Result Card. */
const BMIResultCard = React.memo(({ bmi, category = 'Normal', calorieTarget = 2000, macroSplit = { protein: 25, carbs: 50, fat: 25 }, dietRecommendation, onApplyGoals, isApplying = false }) => {
  const { theme } = useTheme();
  const chipType = CHIP_MAP[category] || 'neutral';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, borderColor: `${theme.colors.primary}30` }]}>
      <View style={styles.scoreRow}>
        <View>
          <Text style={[styles.bmiNumber, { color: theme.colors.textPrimary }]}>{Number(bmi).toFixed(1)}</Text>
          <Text style={[styles.bmiSub, { color: theme.colors.textSecondary }]}>Body Mass Index</Text>
        </View>
        <StatusChip label={category} type={chipType} size="md" />
      </View>

      <BMIScaleBar bmi={bmi} />

      <View style={[styles.targetSection, { borderTopColor: `${theme.colors.textTertiary}15` }]}>
        <Text style={[styles.targetLabel, { color: theme.colors.textSecondary }]}>Your daily calorie target</Text>
        <Text style={[styles.targetValue, { color: theme.colors.accent }]}>{calorieTarget} <Text style={[styles.targetUnit, { color: theme.colors.textTertiary }]}>kcal/day</Text></Text>
      </View>

      <View style={styles.macroSection}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Macro target split</Text>
        <View style={styles.macroLabels}>
          <Text style={[styles.macroTag, { color: '#3B82F6' }]}>Protein {macroSplit.protein}%</Text>
          <Text style={[styles.macroTag, { color: '#F59E0B' }]}>Carbs {macroSplit.carbs}%</Text>
          <Text style={[styles.macroTag, { color: '#10B981' }]}>Fat {macroSplit.fat}%</Text>
        </View>
        <View style={[styles.macroBar, { borderRadius: theme.borderRadius.full }]}>
          <View style={[styles.macroSeg, { flex: macroSplit.protein, backgroundColor: '#3B82F6' }]} />
          <View style={[styles.macroSeg, { flex: macroSplit.carbs, backgroundColor: '#F59E0B' }]} />
          <View style={[styles.macroSeg, { flex: macroSplit.fat, backgroundColor: '#10B981' }]} />
        </View>
      </View>

      {dietRecommendation ? (
        <View style={[styles.recBox, { backgroundColor: `${theme.colors.primary}10`, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.primary}25` }]}>
          <Text style={[styles.recLabel, { color: theme.colors.primary }]}>Recommendation</Text>
          <Text style={[styles.recText, { color: theme.colors.textPrimary }]}>Based on your BMI we recommend: <Text style={[styles.recBold, { color: theme.colors.primary }]}>{dietRecommendation}</Text></Text>
        </View>
      ) : null}

      <Button label="Apply these goals" variant="primary" fullWidth onPress={onApplyGoals} loading={isApplying} style={styles.applyBtn} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: { padding: 24, marginTop: 16, borderWidth: 1 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bmiNumber: { fontSize: 48, fontWeight: '900', lineHeight: 52 },
  bmiSub: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  targetSection: { marginVertical: 8, paddingVertical: 8, borderTopWidth: 1 },
  targetLabel: { fontSize: 10, fontWeight: '600' },
  targetValue: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  targetUnit: { fontSize: 12, fontWeight: '600' },
  macroSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  macroLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroTag: { fontSize: 9, fontWeight: '800' },
  macroBar: { flexDirection: 'row', height: 8, overflow: 'hidden' },
  macroSeg: { height: '100%' },
  recBox: { padding: 16, marginBottom: 16, borderWidth: 1 },
  recLabel: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
  recText: { fontSize: 11, lineHeight: 18 },
  recBold: { fontWeight: '800' },
  applyBtn: { marginTop: 4 },
});

export default BMIResultCard;

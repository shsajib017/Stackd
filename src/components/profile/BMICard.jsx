import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import Button from '../common/Button';
import StatusChip from '../common/StatusChip';

const CHIP_TYPES = { Underweight: 'info', Normal: 'success', Overweight: 'warning', Obese: 'danger' };

/** BMI Summary & Recommendation Card for Profile Screen. */
const BMICard = React.memo(({ profile, onPress }) => {
  const hasBMI = Boolean(profile?.bmi && profile.bmi > 0);
  const category = profile?.bmi_category || 'Normal';
  const chipType = CHIP_TYPES[category] || 'neutral';

  if (!hasBMI) {
    return (
      <View style={styles.card}>
        <View style={styles.uncalcRow}>
          <Text style={styles.icon}>⚖️</Text>
          <View style={styles.uncalcText}>
            <Text style={styles.title}>Calculate your BMI</Text>
            <Text style={styles.subtitle}>Get personalized calorie and diet recommendations</Text>
          </View>
        </View>
        <Button label="Calculate BMI" variant="primary" size="sm" onPress={onPress} style={styles.calcBtn} />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Body Mass Index</Text>
          <Text style={styles.bmiValue}>{Number(profile.bmi).toFixed(1)}</Text>
        </View>
        <StatusChip label={category} type={chipType} size="sm" />
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.targetText}>Daily target: <Text style={styles.bold}>{profile.calorie_target || 2000} kcal</Text></Text>
        <Text style={styles.linkText}>Tap to recalculate →</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  uncalcRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  icon: { fontSize: 32, marginRight: spacing.md },
  uncalcText: { flex: 1 },
  title: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  calcBtn: { marginTop: spacing.xs },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '700', textTransform: 'uppercase' },
  bmiValue: { fontSize: fontSizes.xl + 4, fontWeight: '900', color: colors.textPrimary, marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs, borderTopWidth: 1, borderTopColor: `${colors.textTertiary}15`, paddingTop: spacing.xs + 2 },
  targetText: { fontSize: fontSizes.xs, color: colors.textSecondary },
  bold: { fontWeight: '800', color: colors.textPrimary },
  linkText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
});

export default BMICard;

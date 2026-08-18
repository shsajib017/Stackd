import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import Button from '../common/Button';
import StatusChip from '../common/StatusChip';

const CHIP_TYPES = { Underweight: 'info', Normal: 'success', Overweight: 'warning', Obese: 'danger' };

/** BMI Summary & Recommendation Card for Profile Screen. */
const BMICard = React.memo(({ profile, onPress }) => {
  const { theme } = useTheme();
  const hasBMI = Boolean(profile?.bmi && profile.bmi > 0);
  const category = profile?.bmi_category || 'Normal';
  const chipType = CHIP_TYPES[category] || 'neutral';

  if (!hasBMI) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            borderColor: `${theme.colors.textTertiary}20`,
          },
        ]}
      >
        <View style={styles.uncalcRow}>
          <Text style={styles.icon}>⚖️</Text>
          <View style={styles.uncalcText}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Calculate your BMI</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Get personalized calorie and diet recommendations</Text>
          </View>
        </View>
        <Button label="Calculate BMI" variant="primary" size="sm" onPress={onPress} style={styles.calcBtn} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.textTertiary}20`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Body Mass Index</Text>
          <Text style={[styles.bmiValue, { color: theme.colors.textPrimary }]}>{Number(profile.bmi).toFixed(1)}</Text>
        </View>
        <StatusChip label={category} type={chipType} size="sm" />
      </View>
      <View style={[styles.footerRow, { borderTopColor: `${theme.colors.textTertiary}15` }]}>
        <Text style={[styles.targetText, { color: theme.colors.textSecondary }]}>Daily target: <Text style={[styles.bold, { color: theme.colors.textPrimary }]}>{profile.calorie_target || 2000} kcal</Text></Text>
        <Text style={[styles.linkText, { color: theme.colors.primary }]}>Tap to recalculate →</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { padding: 16, borderWidth: 1 },
  uncalcRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 32, marginRight: 16 },
  uncalcText: { flex: 1 },
  title: { fontSize: 13, fontWeight: '800' },
  subtitle: { fontSize: 10, marginTop: 2, lineHeight: 16 },
  calcBtn: { marginTop: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  bmiValue: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, borderTopWidth: 1, paddingTop: 6 },
  targetText: { fontSize: 10 },
  bold: { fontWeight: '800' },
  linkText: { fontSize: 10, fontWeight: '700' },
});

export default BMICard;

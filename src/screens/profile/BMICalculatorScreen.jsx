import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useBMI from '../../hooks/useBMI';
import useUIStore from '../../store/useUIStore';
import { updateProfile } from '../../supabase/profiles';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';
import BMIResultCard from '../../components/profile/BMIResultCard';

const ACTIVITY_ITEMS = [
  { id: 'Sedentary', emoji: '🛋️', title: 'Sedentary', sub: 'Little or no exercise' },
  { id: 'Lightly active', emoji: '🚶', title: 'Lightly active', sub: 'Light exercise 1-3 days/week' },
  { id: 'Moderately active', emoji: '🏃', title: 'Moderately active', sub: 'Moderate exercise 3-5 days/week' },
  { id: 'Very active', emoji: '💪', title: 'Very active', sub: 'Hard exercise 6-7 days/week' },
  { id: 'Extra active', emoji: '🏋️', title: 'Extra active', sub: 'Very hard exercise, physical job' },
];

/** Full-featured Interactive BMI & Daily Calorie Recommendation Calculator. */
const BMICalculatorScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, setProfile } = useAuthStore();
  const showToast = useUIStore((state) => state.showToast);
  const { calculate, bmi, category, calorieTarget, macroSplit, dietRecommendation } = useBMI();

  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState(profile?.weight ? String(profile.weight) : '');
  const [height, setHeight] = useState(profile?.height ? String(profile.height) : '');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('21');
  const [gender, setGender] = useState('male');
  const [activityLevel, setActivityLevel] = useState('Sedentary');
  const [result, setResult] = useState(profile?.bmi ? { bmi: profile.bmi, category: profile.bmi_category, calorieTarget: profile.calorie_target, macroSplit: { protein: 25, carbs: 50, fat: 25 }, dietRecommendation: profile.goal_type || 'Maintain' } : null);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleUnitSwitch = (newUnit) => {
    if (newUnit === unit) return;
    if (newUnit === 'imperial' && weight) {
      setWeight(String(Math.round(Number(weight) * 2.205)));
      if (height) {
        const totalIn = Number(height) / 2.54;
        setFeet(String(Math.floor(totalIn / 12))); setInches(String(Math.round(totalIn % 12)));
      }
    } else if (newUnit === 'metric' && weight) {
      setWeight(String(Math.round(Number(weight) / 2.205)));
      if (feet || inches) setHeight(String(Math.round(((Number(feet) || 0) * 12 + (Number(inches) || 0)) * 2.54)));
    }
    setUnit(newUnit);
  };

  const handleCalculate = async () => {
    setError(null);
    let wKg = unit === 'imperial' ? Number(weight) / 2.205 : Number(weight);
    let hCm = unit === 'imperial' ? ((Number(feet) || 0) * 30.48) + ((Number(inches) || 0) * 2.54) : Number(height);
    if (!wKg || wKg <= 0 || !hCm || hCm <= 0 || !age || Number(age) <= 0) {
      setError('Please fill in valid weight, height, and age.'); return;
    }
    const res = await calculate({ weightKg: wKg, heightCm: hCm, age: Number(age), gender, activityLevel });
    setResult(res);
  };

  const handleApplyGoals = async () => {
    const userId = user?.id || profile?.id;
    if (!userId || !result) return;
    try {
      setIsApplying(true);
      const updated = await updateProfile(userId, {
        bmi: result.bmi,
        bmi_category: result.category,
        calorie_target: result.calorieTarget,
        goal_type: result.dietRecommendation || 'Maintain',
      });
      setProfile(updated);
      showToast('Goals updated ✓', 'success');
      navigation.navigate('GoalsScreen');
    } catch (err) {
      showToast(err.message || 'Failed to apply goals', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="BMI Calculator" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.unitRow}>
          <TouchableOpacity style={[styles.unitBtn, unit === 'metric' && styles.unitActive]} onPress={() => handleUnitSwitch('metric')}>
            <Text style={[styles.unitText, unit === 'metric' && styles.unitTextActive]}>Metric (kg, cm)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.unitBtn, unit === 'imperial' && styles.unitActive]} onPress={() => handleUnitSwitch('imperial')}>
            <Text style={[styles.unitText, unit === 'imperial' && styles.unitTextActive]}>Imperial (lbs, ft)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder={unit === 'metric' ? 'e.g. 65' : 'e.g. 145'} placeholderTextColor={colors.textTertiary} keyboardType="numeric" />

          {unit === 'metric' ? (
            <>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="e.g. 170" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
            </>
          ) : (
            <>
              <Text style={styles.label}>Height (ft / in)</Text>
              <View style={styles.splitRow}>
                <TextInput style={[styles.input, styles.splitInput]} value={feet} onChangeText={setFeet} placeholder="Feet (e.g. 5)" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
                <TextInput style={[styles.input, styles.splitInput]} value={inches} onChangeText={setInches} placeholder="Inches (e.g. 8)" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
              </View>
            </>
          )}

          <Text style={styles.label}>Age (years)</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="e.g. 20" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity style={[styles.genderPill, gender === 'male' && styles.genderActive]} onPress={() => setGender('male')}>
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.genderPill, gender === 'female' && styles.genderActive]} onPress={() => setGender('female')}>
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Activity Level</Text>
        <View style={styles.activityList}>
          {ACTIVITY_ITEMS.map((item) => {
            const isSelected = activityLevel === item.id;
            return (
              <TouchableOpacity key={item.id} style={[styles.actItem, isSelected && styles.actSelected]} onPress={() => setActivityLevel(item.id)} activeOpacity={0.7}>
                <Text style={styles.actEmoji}>{item.emoji}</Text>
                <View style={styles.actInfo}>
                  <Text style={[styles.actTitle, isSelected && styles.actTitleActive]}>{item.title}</Text>
                  <Text style={styles.actSub}>{item.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.errText}>{error}</Text> : null}
        <Button label="Calculate" variant="primary" fullWidth onPress={handleCalculate} style={styles.calcBtn} />

        {result && (
          <BMIResultCard
            bmi={result.bmi || bmi} category={result.category || category}
            calorieTarget={result.calorieTarget || calorieTarget} macroSplit={result.macroSplit || macroSplit}
            dietRecommendation={result.dietRecommendation || dietRecommendation}
            onApplyGoals={handleApplyGoals} isApplying={isApplying}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  unitRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.full, padding: 4, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}25` },
  unitBtn: { flex: 1, paddingVertical: spacing.xs + 2, alignItems: 'center', borderRadius: borderRadius.full },
  unitActive: { backgroundColor: colors.primary },
  unitText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textSecondary },
  unitTextActive: { color: colors.surface },
  formCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.md },
  label: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: fontSizes.sm, color: colors.textPrimary, marginBottom: spacing.xs },
  splitRow: { flexDirection: 'row', gap: spacing.sm },
  splitInput: { flex: 1 },
  pillsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  genderPill: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.md, backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30` },
  genderActive: { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
  genderText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textSecondary },
  genderTextActive: { color: colors.primary },
  sectionHeader: { fontSize: fontSizes.xs + 1, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs + 2, letterSpacing: 0.5 },
  activityList: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.md, overflow: 'hidden' },
  actItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  actSelected: { borderLeftWidth: 4, borderLeftColor: colors.primary, backgroundColor: `${colors.primary}08` },
  actEmoji: { fontSize: 24, marginRight: spacing.md },
  actInfo: { flex: 1 },
  actTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  actTitleActive: { color: colors.primary },
  actSub: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 1 },
  errText: { color: colors.error, fontSize: fontSizes.xs + 1, textAlign: 'center', marginBottom: spacing.sm, fontWeight: '600' },
  calcBtn: { marginTop: spacing.xs },
});

export default BMICalculatorScreen;

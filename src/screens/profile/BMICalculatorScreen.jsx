import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useBMI from '../../hooks/useBMI';
import useUIStore from '../../store/useUIStore';
import { updateProfile } from '../../supabase/profiles';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';
import BMIResultCard from '../../components/profile/BMIResultCard';
import ScreenWrapper from '../../components/common/ScreenWrapper';

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
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="BMI Calculator" showBack onBack={() => navigation.navigate('ProfileScreen')} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.unitRow, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}25` }]}>
            <TouchableOpacity style={[styles.unitBtn, unit === 'metric' && { backgroundColor: theme.colors.primary }]} onPress={() => handleUnitSwitch('metric')}>
              <Text style={[styles.unitText, { color: unit === 'metric' ? theme.colors.surface : theme.colors.textSecondary }]}>Metric (kg, cm)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.unitBtn, unit === 'imperial' && { backgroundColor: theme.colors.primary }]} onPress={() => handleUnitSwitch('imperial')}>
              <Text style={[styles.unitText, { color: unit === 'imperial' ? theme.colors.surface : theme.colors.textSecondary }]}>Imperial (lbs, ft)</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
              value={weight}
              onChangeText={setWeight}
              placeholder={unit === 'metric' ? 'e.g. 65' : 'e.g. 145'}
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />

            {unit === 'metric' ? (
              <>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Height (cm)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="e.g. 170"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numeric"
                />
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Height (ft / in)</Text>
                <View style={styles.splitRow}>
                  <TextInput
                    style={[styles.input, styles.splitInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
                    value={feet}
                    onChangeText={setFeet}
                    placeholder="Feet (e.g. 5)"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.splitInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
                    value={inches}
                    onChangeText={setInches}
                    placeholder="Inches (e.g. 8)"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Age (years)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 20"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />

            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Gender</Text>
            <View style={styles.pillsRow}>
              <TouchableOpacity
                style={[
                  styles.genderPill,
                  { backgroundColor: gender === 'male' ? `${theme.colors.primary}15` : theme.colors.background, borderColor: gender === 'male' ? theme.colors.primary : `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md },
                ]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderText, { color: gender === 'male' ? theme.colors.primary : theme.colors.textSecondary }]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderPill,
                  { backgroundColor: gender === 'female' ? `${theme.colors.primary}15` : theme.colors.background, borderColor: gender === 'female' ? theme.colors.primary : `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md },
                ]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderText, { color: gender === 'female' ? theme.colors.primary : theme.colors.textSecondary }]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>Activity Level</Text>
          <View style={[styles.activityList, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            {ACTIVITY_ITEMS.map((item) => {
              const isSelected = activityLevel === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.actItem,
                    { borderBottomColor: `${theme.colors.textTertiary}15` },
                    isSelected && { borderLeftWidth: 4, borderLeftColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}08` },
                  ]}
                  onPress={() => setActivityLevel(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actEmoji}>{item.emoji}</Text>
                  <View style={styles.actInfo}>
                    <Text style={[styles.actTitle, { color: isSelected ? theme.colors.primary : theme.colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.actSub, { color: theme.colors.textTertiary }]}>{item.sub}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={[styles.errText, { color: theme.colors.error }]}>{error}</Text> : null}
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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  content: { paddingVertical: 8 },
  unitRow: { flexDirection: 'row', borderRadius: 999, padding: 4, marginBottom: 16, borderWidth: 1 },
  unitBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 999 },
  unitText: { fontSize: 11, fontWeight: '700' },
  formCard: { padding: 16, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 4 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 12, marginBottom: 4 },
  splitRow: { flexDirection: 'row', gap: 8 },
  splitInput: { flex: 1 },
  pillsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  genderPill: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
  genderText: { fontSize: 12, fontWeight: '700' },
  sectionHeader: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  activityList: { borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  actItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  actEmoji: { fontSize: 24, marginRight: 16 },
  actInfo: { flex: 1 },
  actTitle: { fontSize: 12, fontWeight: '700' },
  actSub: { fontSize: 10, marginTop: 1 },
  errText: { fontSize: 11, textAlign: 'center', marginBottom: 16, fontWeight: '600' },
  calcBtn: { marginTop: 4 },
});

export default BMICalculatorScreen;

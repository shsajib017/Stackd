import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useBudgetStore from '../../store/useBudgetStore';
import useMeals from '../../hooks/useMeals';
import useStudySessions from '../../hooks/useStudySessions';
import useUIStore from '../../store/useUIStore';
import { updateProfile } from '../../supabase/profiles';
import { getMacroSplit } from '../../utils/bmiFormulas';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';
import StatusChip from '../../components/common/StatusChip';
import WeeklyProgress from '../../components/profile/WeeklyProgress';

const PRESETS = [1500, 1800, 2000, 2200, 2500];
const GOAL_OPTIONS = [
  { id: 'Lose weight', emoji: '⚖️', label: 'Lose weight', sub: 'Calorie deficit, more cardio' },
  { id: 'Maintain', emoji: '➡️', label: 'Maintain', sub: 'Balance intake and activity' },
  { id: 'Muscle gain', emoji: '💪', label: 'Muscle gain', sub: 'Calorie surplus, more protein' },
  { id: 'Eat healthier', emoji: '🥗', label: 'Eat healthier', sub: 'Focus on nutrition quality' },
  { id: 'Student budget', emoji: '🎓', label: 'Student budget', sub: 'Affordable and filling meals' },
];
const DIET_PILLS = ['Halal', 'Vegetarian', 'Vegan', 'High-Protein', 'Low-Carb'];

/** Academic, Nutrition, and Calorie Fitness Goals Screen. */
const GoalsScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, profile, setProfile } = useAuthStore();
  const monthlyLimit = useBudgetStore((s) => s.monthlyLimit);
  const showToast = useUIStore((state) => state.showToast);
  const { weeklyFoodSpend, todayMeals, fetchTodayMeals } = useMeals();
  const { weeklyStudyMinutes, fetchSessions } = useStudySessions();

  const [calorieTarget, setCalorieTarget] = useState(profile?.calorie_target || 2000);
  const [goalType, setGoalType] = useState(profile?.goal_type || 'Maintain');
  const [dietPrefs, setDietPrefs] = useState(profile?.diet_preferences || ['Halal']);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    fetchTodayMeals(); fetchSessions();
    if (profile) {
      setCalorieTarget(profile.calorie_target || 2000); setGoalType(profile.goal_type || 'Maintain');
      if (profile.diet_preferences) setDietPrefs(profile.diet_preferences);
    }
  }, [fetchSessions, fetchTodayMeals, profile]));

  const macroSplit = useMemo(() => getMacroSplit(goalType), [goalType]);
  const toggleDiet = (d) => setDietPrefs((prev) => (prev.includes(d) ? prev.filter((i) => i !== d) : [...prev, d]));

  const handleSave = async () => {
    const userId = user?.id || profile?.id;
    if (!userId) return;
    try {
      setIsSaving(true);
      const updated = await updateProfile(userId, {
        calorie_target: Number(calorieTarget) || 2000,
        goal_type: goalType,
      });
      setProfile({ ...(profile || {}), ...(updated || {}), calorie_target: Number(calorieTarget) || 2000, goal_type: goalType, diet_preferences: dietPrefs });
      showToast('Goals saved ✓', 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to save goals', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const weeklyCalories = useMemo(() => (todayMeals || []).reduce((acc, m) => acc + (Number(m.calories) || 0), 0) * 7, [todayMeals]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="My Goals" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
        {profile?.bmi ? (
          <View style={styles.bmiBanner}><StatusChip label="Goals set from your BMI results" type="info" size="sm" /></View>
        ) : null}

        {/* Daily Calorie Target */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily calorie target</Text>
          <Text style={styles.calHighlight}>{calorieTarget} <Text style={styles.calUnit}>kcal/day</Text></Text>
          <View style={styles.presetRow}>
            {PRESETS.map((p) => (
              <TouchableOpacity key={p} style={[styles.presetBtn, calorieTarget === p && styles.presetActive]} onPress={() => setCalorieTarget(p)}>
                <Text style={[styles.presetText, calorieTarget === p && styles.presetTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setCalorieTarget((prev) => Math.max(1000, Number(prev) - 50))}><Text style={styles.stepBtnText}>−</Text></TouchableOpacity>
            <TextInput style={styles.customCalInput} value={String(calorieTarget)} onChangeText={(t) => setCalorieTarget(Number(t) || 0)} keyboardType="numeric" />
            <TouchableOpacity style={styles.stepBtn} onPress={() => setCalorieTarget((prev) => Number(prev) + 50)}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        {/* Primary Goal */}
        <Text style={styles.sectionHeader}>My primary goal</Text>
        <View style={styles.goalList}>
          {GOAL_OPTIONS.map((g) => {
            const isSelected = goalType === g.id;
            return (
              <TouchableOpacity key={g.id} style={[styles.goalItem, isSelected && styles.goalSelected]} onPress={() => setGoalType(g.id)} activeOpacity={0.7}>
                <Text style={styles.goalEmoji}>{g.emoji}</Text>
                <View style={styles.goalInfo}><Text style={[styles.goalTitle, isSelected && styles.goalTitleActive]}>{g.label}</Text><Text style={styles.goalSub}>{g.sub}</Text></View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Macro Split Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macro split</Text>
          <Text style={styles.cardSub}>Auto-set based on your goal — adjust if needed</Text>
          <View style={styles.macroRow}>
            <Text style={[styles.macroTag, { color: '#3B82F6' }]}>Protein {macroSplit.protein}%</Text>
            <Text style={[styles.macroTag, { color: '#F59E0B' }]}>Carbs {macroSplit.carbs}%</Text>
            <Text style={[styles.macroTag, { color: '#10B981' }]}>Fat {macroSplit.fat}%</Text>
          </View>
          <View style={styles.macroTrack}>
            <View style={{ flex: macroSplit.protein, backgroundColor: '#3B82F6' }} />
            <View style={{ flex: macroSplit.carbs, backgroundColor: '#F59E0B' }} />
            <View style={{ flex: macroSplit.fat, backgroundColor: '#10B981' }} />
          </View>
        </View>

        {/* Dietary Preferences */}
        <Text style={styles.sectionHeader}>Dietary preferences</Text>
        <View style={styles.pillsWrap}>
          {DIET_PILLS.map((d) => {
            const active = dietPrefs.includes(d);
            return (
              <TouchableOpacity key={d} style={[styles.dietPill, active && styles.dietActive]} onPress={() => toggleDiet(d)} activeOpacity={0.8}>
                <Text style={[styles.dietText, active && styles.dietTextActive]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Weekly Progress */}
        <WeeklyProgress caloriesConsumed={weeklyCalories} caloriesTarget={calorieTarget * 7} studyHours={Math.round((weeklyStudyMinutes || 0) / 60)} studyTarget={(profile?.daily_study_hours || 4) * 7} budgetSpent={weeklyFoodSpend || 0} budgetLimit={Math.round((monthlyLimit || 10000) / 4)} />
        <Button label="Save goals" variant="primary" fullWidth onPress={handleSave} loading={isSaving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  bmiBanner: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.md },
  cardTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  calHighlight: { fontSize: fontSizes.xl + 4, fontWeight: '900', color: colors.accent, marginBottom: spacing.sm },
  calUnit: { fontSize: fontSizes.sm, color: colors.textTertiary, fontWeight: '600' },
  presetRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  presetBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: `${colors.textTertiary}25` },
  presetActive: { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
  presetText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
  presetTextActive: { color: colors.primary, fontWeight: '800' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  stepBtn: { width: 38, height: 38, borderRadius: borderRadius.md, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.primary },
  customCalInput: { flex: 1, backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.md, paddingVertical: 8, paddingHorizontal: spacing.md, fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  sectionHeader: { fontSize: fontSizes.xs + 1, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', marginBottom: spacing.xs + 2, letterSpacing: 0.5 },
  goalList: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20`, marginBottom: spacing.md, overflow: 'hidden' },
  goalItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  goalSelected: { borderLeftWidth: 4, borderLeftColor: colors.primary, backgroundColor: `${colors.primary}08` },
  goalEmoji: { fontSize: 24, marginRight: spacing.md },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  goalTitleActive: { color: colors.primary },
  goalSub: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 1 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroTag: { fontSize: fontSizes.xs - 1, fontWeight: '800' },
  macroTrack: { flexDirection: 'row', height: 8, borderRadius: borderRadius.full, overflow: 'hidden' },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  dietPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}25` },
  dietActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dietText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary },
  dietTextActive: { color: colors.surface },
  saveBtn: { marginTop: spacing.md },
});

export default GoalsScreen;

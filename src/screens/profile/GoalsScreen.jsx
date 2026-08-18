import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
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
import ScreenWrapper from '../../components/common/ScreenWrapper';

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
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="My Goals" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>
          {profile?.bmi ? (
            <View style={styles.bmiBanner}><StatusChip label="Goals set from your BMI results" type="info" size="sm" /></View>
          ) : null}

          {/* Daily Calorie Target */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Daily calorie target</Text>
            <Text style={[styles.calHighlight, { color: theme.colors.accent }]}>{calorieTarget} <Text style={[styles.calUnit, { color: theme.colors.textTertiary }]}>kcal/day</Text></Text>
            <View style={styles.presetRow}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.presetBtn,
                    { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}25`, borderRadius: theme.borderRadius.sm },
                    calorieTarget === p && { backgroundColor: `${theme.colors.primary}15`, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setCalorieTarget(p)}
                >
                  <Text style={[styles.presetText, { color: theme.colors.textSecondary }, calorieTarget === p && { color: theme.colors.primary, fontWeight: '800' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity style={[styles.stepBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.md }]} onPress={() => setCalorieTarget((prev) => Math.max(1000, Number(prev) - 50))}>
                <Text style={[styles.stepBtnText, { color: theme.colors.primary }]}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.customCalInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.md, color: theme.colors.textPrimary }]}
                value={String(calorieTarget)}
                onChangeText={(t) => setCalorieTarget(Number(t) || 0)}
                keyboardType="numeric"
              />
              <TouchableOpacity style={[styles.stepBtn, { backgroundColor: `${theme.colors.primary}15`, borderRadius: theme.borderRadius.md }]} onPress={() => setCalorieTarget((prev) => Number(prev) + 50)}>
                <Text style={[styles.stepBtnText, { color: theme.colors.primary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Goal */}
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>My primary goal</Text>
          <View style={[styles.goalList, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            {GOAL_OPTIONS.map((g) => {
              const isSelected = goalType === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.goalItem,
                    { borderBottomColor: `${theme.colors.textTertiary}15` },
                    isSelected && { borderLeftWidth: 4, borderLeftColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}08` },
                  ]}
                  onPress={() => setGoalType(g.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.goalEmoji}>{g.emoji}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: theme.colors.textPrimary }, isSelected && { color: theme.colors.primary }]}>{g.label}</Text>
                    <Text style={[styles.goalSub, { color: theme.colors.textTertiary }]}>{g.sub}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Macro Split Section */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Macro split</Text>
            <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>Auto-set based on your goal — adjust if needed</Text>
            <View style={styles.macroRow}>
              <Text style={[styles.macroTag, { color: '#3B82F6' }]}>Protein {macroSplit.protein}%</Text>
              <Text style={[styles.macroTag, { color: '#F59E0B' }]}>Carbs {macroSplit.carbs}%</Text>
              <Text style={[styles.macroTag, { color: '#10B981' }]}>Fat {macroSplit.fat}%</Text>
            </View>
            <View style={[styles.macroTrack, { borderRadius: theme.borderRadius.full }]}>
              <View style={{ flex: macroSplit.protein, backgroundColor: '#3B82F6' }} />
              <View style={{ flex: macroSplit.carbs, backgroundColor: '#F59E0B' }} />
              <View style={{ flex: macroSplit.fat, backgroundColor: '#10B981' }} />
            </View>
          </View>

          {/* Dietary Preferences */}
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>Dietary preferences</Text>
          <View style={styles.pillsWrap}>
            {DIET_PILLS.map((d) => {
              const active = dietPrefs.includes(d);
              return (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.dietPill,
                    { backgroundColor: active ? theme.colors.primary : theme.colors.surface, borderColor: active ? theme.colors.primary : `${theme.colors.textTertiary}25`, borderRadius: theme.borderRadius.full },
                  ]}
                  onPress={() => toggleDiet(d)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dietText, { color: active ? theme.colors.surface : theme.colors.textSecondary }, active && styles.dietTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Weekly Progress */}
          <WeeklyProgress caloriesConsumed={weeklyCalories} caloriesTarget={calorieTarget * 7} studyHours={Math.round((weeklyStudyMinutes || 0) / 60)} studyTarget={(profile?.daily_study_hours || 4) * 7} budgetSpent={weeklyFoodSpend || 0} budgetLimit={Math.round((monthlyLimit || 10000) / 4)} />
          <Button label="Save goals" variant="primary" fullWidth onPress={handleSave} loading={isSaving} style={styles.saveBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  content: { paddingVertical: 8 },
  bmiBanner: { marginBottom: 8, alignItems: 'flex-start' },
  card: { padding: 16, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  cardSub: { fontSize: 10, marginBottom: 8 },
  calHighlight: { fontSize: 24, fontWeight: '900', marginBottom: 8 },
  calUnit: { fontSize: 12, fontWeight: '600' },
  presetRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  presetBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderWidth: 1 },
  presetText: { fontSize: 10, fontWeight: '700' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  stepBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, fontWeight: '800' },
  customCalInput: { flex: 1, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  sectionHeader: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  goalList: { borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  goalItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  goalEmoji: { fontSize: 24, marginRight: 16 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: 12, fontWeight: '700' },
  goalSub: { fontSize: 10, marginTop: 1 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroTag: { fontSize: 9, fontWeight: '800' },
  macroTrack: { flexDirection: 'row', height: 8, overflow: 'hidden' },
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  dietPill: { paddingHorizontal: 16, paddingVertical: 6, borderWidth: 1 },
  dietText: { fontSize: 10, fontWeight: '700' },
  dietTextActive: { fontWeight: '800' },
  saveBtn: { marginTop: 16 },
});

export default GoalsScreen;

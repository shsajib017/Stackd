import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuth from '../../hooks/useAuth';
import { updateProfile as dbUpdateProfile } from '../../supabase/profiles';

const GOAL_OPTIONS = ['Lose weight', 'Maintain', 'Muscle gain'];

/**
 * Profile Setup onboarding screen for setting budget, study hours, and health goals.
 */
const ProfileSetupScreen = React.memo(({ navigation }) => {
  const { user, updateProfile: hookUpdateProfile } = useAuth();
  const [budgetLimit, setBudgetLimit] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [goalType, setGoalType] = useState('Maintain');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const updates = {
        monthly_budget_limit: budgetLimit ? parseFloat(budgetLimit) : 0,
        daily_study_hours: studyHours ? parseFloat(studyHours) : 0,
        goal_type: goalType,
      };
      if (typeof hookUpdateProfile === 'function') await hookUpdateProfile(user?.id, updates);
      else if (user?.id) await dbUpdateProfile(user.id, updates);
      navigation.replace('AppNavigator');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, [budgetLimit, goalType, hookUpdateProfile, navigation, studyHours, user?.id]);

  const handleSkip = useCallback(() => navigation.replace('AppNavigator'), [navigation]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>This helps us personalise your experience</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Budget Limit</Text>
            <View style={styles.prefixInputContainer}>
              <Text style={styles.prefix}>৳</Text>
              <TextInput
                style={styles.prefixInput} placeholder="e.g. 5000" placeholderTextColor={colors.textTertiary}
                value={budgetLimit} onChangeText={setBudgetLimit} keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Daily Study Hours Target</Text>
            <TextInput
              style={styles.input} placeholder="e.g. 4" placeholderTextColor={colors.textTertiary}
              value={studyHours} onChangeText={setStudyHours} keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Health & Fitness Goal</Text>
            <View style={styles.pillsRow}>
              {GOAL_OPTIONS.map((goal) => {
                const isActive = goalType === goal;
                return (
                  <TouchableOpacity
                    key={goal}
                    style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
                    onPress={() => setGoalType(goal)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>{goal}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={[styles.saveButton, loading && styles.buttonDisabled]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveButtonText}>Save and continue</Text>}
          </TouchableOpacity>
          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  header: { marginBottom: spacing.xl },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 22 },
  form: { width: '100%' },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.textTertiary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: fontSizes.md,
    color: colors.textPrimary, backgroundColor: colors.background,
  },
  prefixInputContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.textTertiary,
    borderRadius: borderRadius.md, backgroundColor: colors.background, paddingHorizontal: spacing.md,
  },
  prefix: { fontSize: fontSizes.lg, fontWeight: 'bold', color: colors.textPrimary, marginRight: spacing.xs },
  prefixInput: { flex: 1, paddingVertical: spacing.sm + 4, fontSize: fontSizes.md, color: colors.textPrimary },
  pillsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  pill: { flex: 1, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: colors.primary },
  pillInactive: { borderWidth: 1, borderColor: colors.textTertiary, backgroundColor: colors.surface },
  pillText: { fontSize: fontSizes.xs + 1, fontWeight: '600' },
  pillTextActive: { color: colors.surface, fontWeight: 'bold' },
  pillTextInactive: { color: colors.textPrimary },
  saveButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.7 },
  saveButtonText: { color: colors.surface, fontSize: fontSizes.lg, fontWeight: 'bold' },
  errorText: { fontSize: fontSizes.sm, color: colors.error, textAlign: 'center', marginTop: spacing.md },
  skipButton: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing.xs },
  skipText: { fontSize: fontSizes.md, color: colors.textSecondary, fontWeight: '600' },
});

export default ProfileSetupScreen;

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuth from '../../hooks/useAuth';
import { updateProfile as dbUpdateProfile } from '../../supabase/profiles';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const GOAL_OPTIONS = ['Lose weight', 'Maintain', 'Muscle gain'];

/**
 * Profile Setup onboarding screen for setting budget, study hours, and health goals.
 */
const ProfileSetupScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Set up your profile</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>This helps us personalise your experience</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Monthly Budget Limit</Text>
              <View style={[styles.prefixInputContainer, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}50`, borderRadius: theme.borderRadius.md }]}>
                <Text style={[styles.prefix, { color: theme.colors.textPrimary }]}>৳</Text>
                <TextInput
                  style={[styles.prefixInput, { color: theme.colors.textPrimary }]}
                  placeholder="e.g. 5000"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={budgetLimit}
                  onChangeText={setBudgetLimit}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Daily Study Hours Target</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}50`, borderRadius: theme.borderRadius.md },
                ]}
                placeholder="e.g. 4"
                placeholderTextColor={theme.colors.textTertiary}
                value={studyHours}
                onChangeText={setStudyHours}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Health & Fitness Goal</Text>
              <View style={styles.pillsRow}>
                {GOAL_OPTIONS.map((goal) => {
                  const isActive = goalType === goal;
                  return (
                    <TouchableOpacity
                      key={goal}
                      style={[
                        styles.pill,
                        isActive
                          ? { backgroundColor: theme.colors.primary }
                          : { borderWidth: 1, borderColor: `${theme.colors.textTertiary}50`, backgroundColor: theme.colors.surface },
                      ]}
                      onPress={() => setGoalType(goal)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          isActive ? { color: theme.colors.surface, fontWeight: 'bold' } : { color: theme.colors.textPrimary },
                        ]}
                      >
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={[styles.saveButtonText, { color: theme.colors.surface }]}>Save and continue</Text>}
            </TouchableOpacity>
            {Boolean(error) && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  prefixInputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 16 },
  prefix: { fontSize: 16, fontWeight: 'bold', marginRight: 4 },
  prefixInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  pillsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 11, fontWeight: '600' },
  saveButton: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 16, fontWeight: 'bold' },
  errorText: { fontSize: 12, textAlign: 'center', marginTop: 16 },
  skipButton: { alignItems: 'center', marginTop: 24, paddingVertical: 4 },
  skipText: { fontSize: 14, fontWeight: '600' },
});

export default ProfileSetupScreen;

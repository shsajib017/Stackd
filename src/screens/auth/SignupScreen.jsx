import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuth from '../../hooks/useAuth';

/**
 * User Account Registration Screen with student credentials and validation.
 */
const SignupScreen = React.memo(({ navigation }) => {
  const { signUp, isLoading } = useAuth();
  const [form, setForm] = useState({ name: '', university: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');

  const updateField = (field, val) => setForm((prev) => ({ ...prev, [field]: val }));

  const validate = useCallback(() => {
    const errs = {};
    setAuthError('');
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.university.trim()) errs.university = 'University is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!form.email.includes('@')) errs.email = 'Please enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSignup = useCallback(async () => {
    if (!validate()) return;
    try {
      setAuthError('');
      await signUp(form.email.trim(), form.password, form.name.trim(), form.university.trim());
      navigation.replace('ProfileSetupScreen');
    } catch (err) {
      setAuthError(err.message || 'Signup failed. Please try again.');
    }
  }, [form, navigation, signUp, validate]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={handleBack}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Stackd today</Text>
        </View>

        <View style={styles.form}>
          {[
            { label: 'Full Name', key: 'name', ph: 'e.g. Shakib Ahmed', cap: 'words' },
            { label: 'University / Institution', key: 'university', ph: 'e.g. Dhaka University', cap: 'words' },
            { label: 'Email', key: 'email', ph: 'student@university.edu', cap: 'none', type: 'email-address' },
            { label: 'Password', key: 'password', ph: 'At least 6 characters', sec: true },
            { label: 'Confirm Password', key: 'confirmPassword', ph: 'Re-enter password', sec: true },
          ].map(({ label, key, ph, cap, type, sec }) => (
            <View key={key} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, errors[key] ? styles.inputError : null]}
                placeholder={ph}
                placeholderTextColor={colors.textTertiary}
                value={form[key]}
                onChangeText={(v) => updateField(key, v)}
                autoCapitalize={cap || 'none'}
                keyboardType={type || 'default'}
                secureTextEntry={Boolean(sec)}
              />
              {Boolean(errors[key]) && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

          <TouchableOpacity style={[styles.signupButton, isLoading && styles.buttonDisabled]} onPress={handleSignup} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.signupButtonText}>Create account</Text>}
          </TouchableOpacity>

          {Boolean(authError) && <Text style={styles.globalErrorText}>{authError}</Text>}

          <TouchableOpacity style={styles.signinLink} onPress={handleBack}>
            <Text style={styles.signinPrompt}>Already have an account? <Text style={styles.signinHighlight}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  backButton: { alignSelf: 'flex-start', marginTop: spacing.md, marginBottom: spacing.md },
  backText: { fontSize: fontSizes.md, color: colors.primary, fontWeight: '600' },
  header: { marginBottom: spacing.lg },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary },
  form: { width: '100%' },
  inputGroup: { marginBottom: spacing.sm + 2 },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.textTertiary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: fontSizes.md,
    color: colors.textPrimary, backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: fontSizes.xs, color: colors.error, marginTop: 2 },
  signupButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.7 },
  signupButtonText: { color: colors.surface, fontSize: fontSizes.lg, fontWeight: 'bold' },
  globalErrorText: { fontSize: fontSizes.sm, color: colors.error, textAlign: 'center', marginTop: spacing.md },
  signinLink: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.md },
  signinPrompt: { fontSize: fontSizes.md, color: colors.textSecondary },
  signinHighlight: { color: colors.primary, fontWeight: 'bold' },
});

export default SignupScreen;

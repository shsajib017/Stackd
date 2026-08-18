import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuth from '../../hooks/useAuth';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/**
 * User Account Registration Screen with student credentials and validation.
 */
const SignupScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Join Stackd today</Text>
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
                <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: errors[key] ? theme.colors.error : `${theme.colors.textTertiary}50`, borderRadius: theme.borderRadius.md },
                  ]}
                  placeholder={ph}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={form[key]}
                  onChangeText={(v) => updateField(key, v)}
                  autoCapitalize={cap || 'none'}
                  keyboardType={type || 'default'}
                  secureTextEntry={Boolean(sec)}
                />
                {Boolean(errors[key]) && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors[key]}</Text>}
              </View>
            ))}

            <TouchableOpacity
              style={[
                styles.signupButton,
                { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={[styles.signupButtonText, { color: theme.colors.surface }]}>Create account</Text>}
            </TouchableOpacity>

            {Boolean(authError) && <Text style={[styles.globalErrorText, { color: theme.colors.error }]}>{authError}</Text>}

            <TouchableOpacity style={styles.signinLink} onPress={handleBack}>
              <Text style={[styles.signinPrompt, { color: theme.colors.textSecondary }]}>
                Already have an account? <Text style={[styles.signinHighlight, { color: theme.colors.primary }]}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingVertical: 16 },
  backButton: { alignSelf: 'flex-start', marginVertical: 8 },
  backText: { fontSize: 14, fontWeight: '600' },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  errorText: { fontSize: 10, marginTop: 2 },
  signupButton: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  signupButtonText: { fontSize: 16, fontWeight: 'bold' },
  globalErrorText: { fontSize: 12, textAlign: 'center', marginTop: 12 },
  signinLink: { alignItems: 'center', marginTop: 16, marginBottom: 16 },
  signinPrompt: { fontSize: 14 },
  signinHighlight: { fontWeight: 'bold' },
});

export default SignupScreen;

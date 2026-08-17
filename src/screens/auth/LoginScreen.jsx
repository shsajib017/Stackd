import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuth from '../../hooks/useAuth';

/**
 * User Login Screen with email/password authentication and validation.
 */
const LoginScreen = React.memo(({ navigation }) => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const validate = useCallback(() => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setAuthError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }
    return isValid;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    try {
      setAuthError('');
      await login(email.trim(), password);
      navigation.replace('AppNavigator');
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
    }
  }, [email, login, navigation, password, validate]);

  const goToForgotPassword = useCallback(() => navigation.navigate('ForgotPasswordScreen'), [navigation]);
  const goToSignup = useCallback(() => navigation.navigate('SignupScreen'), [navigation]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>Stackd</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {Boolean(emailError) && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {Boolean(passwordError) && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          <TouchableOpacity style={styles.forgotPassContainer} onPress={goToForgotPassword}>
            <Text style={styles.forgotPassText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.loginButtonText}>Sign in</Text>}
          </TouchableOpacity>

          {Boolean(authError) && <Text style={styles.globalErrorText}>{authError}</Text>}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} /><Text style={styles.dividerText}>— or —</Text><View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.signupLink} onPress={goToSignup}>
            <Text style={styles.signupPrompt}>
              Don't have an account? <Text style={styles.signupHighlight}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: fontSizes.xxxl, fontWeight: '900', color: colors.primary, marginBottom: spacing.sm, letterSpacing: 1 },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary },
  form: { width: '100%' },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.textTertiary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: fontSizes.md,
    color: colors.textPrimary, backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  errorText: { fontSize: fontSizes.xs, color: colors.error, marginTop: spacing.xs },
  forgotPassContainer: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotPassText: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '600' },
  loginButton: {
    backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  loginButtonText: { color: colors.surface, fontSize: fontSizes.lg, fontWeight: 'bold' },
  globalErrorText: { fontSize: fontSizes.sm, color: colors.error, textAlign: 'center', marginTop: spacing.md },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.textTertiary, opacity: 0.4 },
  dividerText: { marginHorizontal: spacing.md, color: colors.textSecondary, fontSize: fontSizes.sm },
  signupLink: { alignItems: 'center' },
  signupPrompt: { fontSize: fontSizes.md, color: colors.textSecondary },
  signupHighlight: { color: colors.primary, fontWeight: 'bold' },
});

export default LoginScreen;

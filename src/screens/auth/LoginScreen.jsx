import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuth from '../../hooks/useAuth';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/**
 * User Login Screen with email/password authentication and validation.
 */
const LoginScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.colors.primary }]}>Stackd</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Sign in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: emailError ? theme.colors.error : `${theme.colors.textTertiary}50`, borderRadius: theme.borderRadius.md },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {Boolean(emailError) && <Text style={[styles.errorText, { color: theme.colors.error }]}>{emailError}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: passwordError ? theme.colors.error : `${theme.colors.textTertiary}50`, borderRadius: theme.borderRadius.md },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {Boolean(passwordError) && <Text style={[styles.errorText, { color: theme.colors.error }]}>{passwordError}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotPassContainer} onPress={goToForgotPassword}>
              <Text style={[styles.forgotPassText, { color: theme.colors.primary }]}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={[styles.loginButtonText, { color: theme.colors.surface }]}>Sign in</Text>}
            </TouchableOpacity>

            {Boolean(authError) && <Text style={[styles.globalErrorText, { color: theme.colors.error }]}>{authError}</Text>}

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.textTertiary }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>— or —</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.textTertiary }]} />
            </View>

            <TouchableOpacity style={styles.signupLink} onPress={goToSignup}>
              <Text style={[styles.signupPrompt, { color: theme.colors.textSecondary }]}>
                Don't have an account? <Text style={[styles.signupHighlight, { color: theme.colors.primary }]}>Sign up</Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 32, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  errorText: { fontSize: 10, marginTop: 4 },
  forgotPassContainer: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPassText: { fontSize: 12, fontWeight: '600' },
  loginButton: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.7 },
  loginButtonText: { fontSize: 16, fontWeight: 'bold' },
  globalErrorText: { fontSize: 12, textAlign: 'center', marginTop: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, opacity: 0.3 },
  dividerText: { marginHorizontal: 16, fontSize: 12 },
  signupLink: { alignItems: 'center' },
  signupPrompt: { fontSize: 14 },
  signupHighlight: { fontWeight: 'bold' },
});

export default LoginScreen;

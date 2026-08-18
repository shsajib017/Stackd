import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuth from '../../hooks/useAuth';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/**
 * Forgot Password screen to trigger password recovery emails.
 */
const ForgotPasswordScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = useCallback(async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setError('');
      await resetPassword(email.trim());
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
  }, [email, resetPassword]);

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <ScreenWrapper>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Reset password</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Enter your email and we'll send you a reset link</Text>
      </View>

      {isSuccess ? (
        <View style={[styles.successCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={[styles.successTitle, { color: theme.colors.textPrimary }]}>Reset link sent to {email.trim()}</Text>
          <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>Check your inbox and follow the instructions to reset your password</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}50`, borderRadius: theme.borderRadius.md },
            ]}
            placeholder="student@university.edu"
            placeholderTextColor={theme.colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleReset}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={[styles.buttonText, { color: theme.colors.surface }]}>Send reset link</Text>}
          </TouchableOpacity>
          {Boolean(error) && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.backLink} onPress={handleBack}>
        <Text style={[styles.backLinkText, { color: theme.colors.primary }]}>Back to sign in</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginVertical: 12 },
  backText: { fontSize: 14, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, marginBottom: 20 },
  button: { paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  errorText: { fontSize: 12, textAlign: 'center', marginTop: 16 },
  successCard: { padding: 20, alignItems: 'center', marginVertical: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  successEmoji: { fontSize: 40, marginBottom: 8 },
  successTitle: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  successText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  backLink: { alignItems: 'center', marginTop: 24 },
  backLinkText: { fontSize: 14, fontWeight: '600' },
});

export default ForgotPasswordScreen;

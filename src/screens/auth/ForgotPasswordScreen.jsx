import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuth from '../../hooks/useAuth';

/**
 * Forgot Password screen to trigger password recovery emails.
 */
const ForgotPasswordScreen = React.memo(({ navigation }) => {
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}><Text style={styles.backText}>← Back</Text></TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
      </View>

      {isSuccess ? (
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Reset link sent to {email.trim()}</Text>
          <Text style={styles.successText}>Check your inbox and follow the instructions to reset your password</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input} placeholder="student@university.edu" placeholderTextColor={colors.textTertiary}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          />
          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleReset} disabled={isLoading} activeOpacity={0.85}>
            {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.buttonText}>Send reset link</Text>}
          </TouchableOpacity>
          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.backLink} onPress={handleBack}>
        <Text style={styles.backLinkText}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  backButton: { alignSelf: 'flex-start', marginBottom: spacing.lg },
  backText: { fontSize: fontSizes.md, color: colors.primary, fontWeight: '600' },
  header: { marginBottom: spacing.xl },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 22 },
  form: { width: '100%' },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.textTertiary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, fontSize: fontSizes.md,
    color: colors.textPrimary, backgroundColor: colors.background, marginBottom: spacing.lg,
  },
  button: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.surface, fontSize: fontSizes.lg, fontWeight: 'bold' },
  errorText: { fontSize: fontSizes.sm, color: colors.error, textAlign: 'center', marginTop: spacing.md },
  successCard: { backgroundColor: colors.background, padding: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', marginVertical: spacing.md },
  successEmoji: { fontSize: 40, marginBottom: spacing.sm },
  successTitle: { fontSize: fontSizes.md, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xs },
  successText: { fontSize: fontSizes.sm, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  backLink: { alignItems: 'center', marginTop: spacing.xl },
  backLinkText: { fontSize: fontSizes.md, color: colors.primary, fontWeight: '600' },
});

export default ForgotPasswordScreen;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import Button from './Button';

/**
 * Themed error message card with optional retry action handler.
 *
 * @param {object} props
 * @param {string} props.message - Error explanation message.
 * @param {() => void} [props.onRetry] - Retry callback function.
 * @param {object|array} [props.style] - Style overrides.
 */
const ErrorMessage = React.memo(({
  message,
  onRetry,
  style,
}) => {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.buttonWrapper}>
          <Button label="Try Again" onPress={onRetry} variant="danger" size="sm" />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  icon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  buttonWrapper: {
    marginTop: spacing.sm + 2,
  },
});

export default ErrorMessage;

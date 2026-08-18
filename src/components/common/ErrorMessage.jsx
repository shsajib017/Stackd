import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import Button from './Button';

/**
 * Themed error message card with optional retry action handler.
 */
const ErrorMessage = React.memo(({
  message,
  onRetry,
  style,
}) => {
  const { theme } = useTheme();

  if (!message) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${theme.colors.error}15`,
          borderColor: theme.colors.error,
          borderRadius: theme.borderRadius.md,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.message, { color: theme.colors.error }]}>{message}</Text>
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
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  buttonWrapper: {
    marginTop: 10,
  },
});

export default ErrorMessage;

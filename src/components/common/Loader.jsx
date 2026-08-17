import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../config/theme';

/**
 * Reusable loading indicator component with optional full-screen overlay and status message.
 *
 * @param {object} props
 * @param {'sm'|'lg'} [props.size='lg'] - Spinner size indicator.
 * @param {boolean} [props.fullScreen=false] - Full-screen centered overlay mode.
 * @param {string} [props.message] - Optional message rendered below spinner.
 */
const Loader = React.memo(({
  size = 'lg',
  fullScreen = false,
  message,
}) => {
  const spinnerSize = size === 'sm' ? 'small' : 'large';

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={spinnerSize} color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 999,
  },
  message: {
    marginTop: spacing.md,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Loader;

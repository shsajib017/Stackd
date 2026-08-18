import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Reusable loading indicator component with optional full-screen overlay and status message.
 */
const Loader = React.memo(({
  size = 'lg',
  fullScreen = false,
  message,
}) => {
  const { theme } = useTheme();
  const spinnerSize = size === 'sm' ? 'small' : 'large';

  return (
    <View
      style={[
        styles.container,
        fullScreen && [styles.fullScreen, { backgroundColor: `${theme.colors.background}D9` }],
      ]}
    >
      <ActivityIndicator size={spinnerSize} color={theme.colors.primary} />
      {message ? <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  message: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Loader;

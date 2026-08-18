import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import Button from './Button';

/**
 * Reusable empty state view with illustration emoji, title, subtitle, and action button.
 */
const EmptyState = React.memo(({
  icon = '📭',
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.buttonWrapper}>
          <Button label={actionLabel} onPress={onAction} size="md" />
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});

export default EmptyState;

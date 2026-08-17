import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../config/theme';
import Button from './Button';

/**
 * Reusable empty state view with illustration emoji, title, subtitle, and action button.
 *
 * @param {object} props
 * @param {string} [props.icon='📭'] - Emoji icon representing empty state.
 * @param {string} props.title - Primary header message.
 * @param {string} [props.subtitle] - Secondary supporting text.
 * @param {string} [props.actionLabel] - Label for call to action button.
 * @param {() => void} [props.onAction] - Action button callback.
 * @param {object|array} [props.style] - Style overrides.
 */
const EmptyState = React.memo(({
  icon = '📭',
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
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
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
});

export default EmptyState;

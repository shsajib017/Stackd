import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Reusable multi-variant button component.
 *
 * @param {object} props
 * @param {string} props.label - Button text.
 * @param {() => void} props.onPress - Click handler.
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary'] - Button style variant.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size preset.
 * @param {boolean} [props.disabled=false] - Disables touch events.
 * @param {boolean} [props.loading=false] - Shows loading spinner.
 * @param {boolean} [props.fullWidth=false] - Expands to 100% container width.
 * @param {React.ReactNode} [props.leftIcon] - Optional left icon element.
 * @param {object|array} [props.style] - Optional style overrides.
 */
const Button = React.memo(({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  style,
}) => {
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const spinnerColor = isGhost || isSecondary ? colors.primary : colors.surface;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant] || styles.primary,
        styles[`size_${size}`] || styles.size_md,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconWrapper}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.textBase,
              styles[`text_${variant}`] || styles.text_primary,
              styles[`textSize_${size}`] || styles.textSize_md,
              (disabled || loading) && styles.textDisabled,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrapper: { marginRight: spacing.xs + 2 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
  size_sm: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md },
  size_md: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg },
  size_lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  textBase: { fontWeight: '700', textAlign: 'center' },
  text_primary: { color: colors.surface },
  text_secondary: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: colors.surface },
  textSize_sm: { fontSize: fontSizes.sm },
  textSize_md: { fontSize: fontSizes.md },
  textSize_lg: { fontSize: fontSizes.lg },
  textDisabled: { opacity: 0.9 },
});

export default Button;

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Reusable multi-variant button component.
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
  const { theme } = useTheme();
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const spinnerColor = isGhost || isSecondary ? theme.colors.primary : '#FFFFFF';

  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: theme.colors.error,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.colors.primary,
        };
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case 'secondary':
      case 'ghost':
        return { color: theme.colors.primary };
      case 'danger':
        return { color: '#FFFFFF' };
      case 'primary':
      default:
        return { color: '#FFFFFF' };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { borderRadius: theme.borderRadius.md },
        getVariantContainerStyle(),
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
              getVariantTextStyle(),
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
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrapper: { marginRight: 6 },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  size_sm: { paddingVertical: 6, paddingHorizontal: 12 },
  size_md: { paddingVertical: 12, paddingHorizontal: 16 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24 },
  textBase: { fontWeight: '700', textAlign: 'center' },
  textSize_sm: { fontSize: 12 },
  textSize_md: { fontSize: 14 },
  textSize_lg: { fontSize: 16 },
  textDisabled: { opacity: 0.9 },
});

export default Button;

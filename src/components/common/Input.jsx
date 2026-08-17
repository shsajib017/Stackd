import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Reusable form input component with label, error display, and accessory icons.
 *
 * @param {object} props
 * @param {string} props.value - Controlled input value.
 * @param {(text: string) => void} props.onChangeText - Change text callback.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.label] - Field label above input.
 * @param {string} [props.error] - Inline error message below input.
 * @param {boolean} [props.secureTextEntry=false] - Password masking boolean.
 * @param {boolean} [props.multiline=false] - Multiline text area mode.
 * @param {string} [props.keyboardType='default'] - Keyboard type.
 * @param {React.ReactNode} [props.rightIcon] - Accessory icon on the right.
 * @param {React.ReactNode} [props.leftIcon] - Accessory icon on the left.
 * @param {object|array} [props.style] - Style override for the root container.
 */
const Input = React.memo(({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  rightIcon,
  leftIcon,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null, multiline && styles.multilineWrapper]}>
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
      </View>
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textTertiary,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  multilineWrapper: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm + 4,
  },
  multilineInput: {
    minHeight: 80,
    paddingVertical: 0,
  },
  leftIconWrapper: {
    marginRight: spacing.xs + 2,
  },
  rightIconWrapper: {
    marginLeft: spacing.xs + 2,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;

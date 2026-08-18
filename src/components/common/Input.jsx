import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Reusable form input component with label, error display, and accessory icons.
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
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: `${theme.colors.textTertiary}40`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.surface,
          },
          error ? { borderColor: theme.colors.error } : null,
          multiline && styles.multilineWrapper,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.textPrimary },
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {rightIcon ? <View style={styles.rightIconWrapper}>{rightIcon}</View> : null}
      </View>
      {Boolean(error) && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  multilineWrapper: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 80,
    paddingVertical: 0,
  },
  leftIconWrapper: {
    marginRight: 6,
  },
  rightIconWrapper: {
    marginLeft: 6,
  },
  errorText: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default Input;

import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/** Reusable Settings Toggle Row with title, subtitle, switch, and optional child slots. */
const SettingsToggleRow = React.memo(({ label, subtitle, value, onValueChange, disabled = false, children, borderBottom = true }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, borderBottom && { borderBottomWidth: 1, borderBottomColor: `${theme.colors.textTertiary}15` }, disabled && styles.disabledContainer]}>
      <View style={styles.topRow}>
        <View style={styles.textWrap}>
          <Text style={[styles.label, { color: disabled ? theme.colors.textTertiary : theme.colors.textPrimary }]}>{label}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text> : null}
        </View>
        <Switch
          value={Boolean(value)}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: `${theme.colors.textTertiary}30`, true: theme.colors.primary }}
          thumbColor={theme.colors.surface}
        />
      </View>
      {children && value && !disabled ? <View style={styles.childrenWrap}>{children}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 12 },
  disabledContainer: { opacity: 0.5 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  textWrap: { flex: 1, marginRight: 12 },
  label: { fontSize: 13, fontWeight: '700' },
  subtitle: { fontSize: 10, marginTop: 2 },
  childrenWrap: { marginTop: 10 },
});

export default SettingsToggleRow;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/** Reusable Settings Stepper component with minus/plus buttons and boundary checking. */
const SettingsStepper = React.memo(({ label, subtitle, value = 0, onChange, min = 1, max = 100, step = 1, unit = '', prefix = '', borderBottom = true }) => {
  const { theme } = useTheme();

  const handleDecrement = () => {
    const next = Math.max(min, value - step);
    if (next !== value) onChange?.(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + step);
    if (next !== value) onChange?.(next);
  };

  const displayVal = `${prefix}${value}${unit ? ` ${unit}` : ''}`;

  return (
    <View style={[styles.container, borderBottom && { borderBottomWidth: 1, borderBottomColor: `${theme.colors.textTertiary}15` }]}>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.stepperWrap, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.full }]}>
        <TouchableOpacity style={[styles.stepBtn, value <= min && styles.btnDisabled]} onPress={handleDecrement} disabled={value <= min} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.stepBtnText, { color: value <= min ? theme.colors.textTertiary : theme.colors.primary }]}>−</Text>
        </TouchableOpacity>
        <Text style={[styles.valueText, { color: theme.colors.primary }]}>{displayVal}</Text>
        <TouchableOpacity style={[styles.stepBtn, value >= max && styles.btnDisabled]} onPress={handleIncrement} disabled={value >= max} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.stepBtnText, { color: value >= max ? theme.colors.textTertiary : theme.colors.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  textWrap: { flex: 1, marginRight: 12 },
  label: { fontSize: 13, fontWeight: '700' },
  subtitle: { fontSize: 10, marginTop: 2 },
  stepperWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 2 },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 16, fontWeight: '800' },
  btnDisabled: { opacity: 0.3 },
  valueText: { fontSize: 12, fontWeight: '800', minWidth: 54, textAlign: 'center' },
});

export default SettingsStepper;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/** Reusable Pill Status Chip with tinted background and matching border. */
const StatusChip = React.memo(({ label, type = 'neutral', icon, size = 'sm', style }) => {
  const { theme } = useTheme();

  const typeConfig = {
    success: { bg: `${theme.colors.success}15`, border: `${theme.colors.success}50`, text: theme.colors.success },
    warning: { bg: `${theme.colors.accent}15`, border: `${theme.colors.accent}50`, text: theme.colors.accent },
    danger: { bg: `${theme.colors.error}15`, border: `${theme.colors.error}50`, text: theme.colors.error },
    info: { bg: `${theme.colors.primary}15`, border: `${theme.colors.primary}50`, text: theme.colors.primary },
    neutral: { bg: `${theme.colors.textSecondary}15`, border: `${theme.colors.textSecondary}50`, text: theme.colors.textSecondary },
  };

  const config = typeConfig[type] || typeConfig.neutral;
  const isMedium = size === 'md';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          borderRadius: theme.borderRadius.full,
        },
        isMedium && styles.chipMd,
        style,
      ]}
    >
      {icon ? <Text style={[styles.icon, isMedium && styles.iconMd]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: config.text }, isMedium && styles.labelMd]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  chipMd: { paddingHorizontal: 12, paddingVertical: 6 },
  icon: { fontSize: 11, marginRight: 4 },
  iconMd: { fontSize: 13, marginRight: 6 },
  label: { fontSize: 10, fontWeight: '600' },
  labelMd: { fontSize: 12, fontWeight: '600' },
});

export default StatusChip;

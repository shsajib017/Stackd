import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

const TYPE_CONFIG = {
  success: { bg: `${colors.success}15`, border: `${colors.success}50`, text: colors.success },
  warning: { bg: `${colors.accent}15`, border: `${colors.accent}50`, text: colors.accent },
  danger: { bg: `${colors.error}15`, border: `${colors.error}50`, text: colors.error },
  info: { bg: `${colors.primary}15`, border: `${colors.primary}50`, text: colors.primary },
  neutral: { bg: `${colors.textSecondary}15`, border: `${colors.textSecondary}50`, text: colors.textSecondary },
};

/** Reusable Pill Status Chip with tinted background and matching border. */
const StatusChip = React.memo(({ label, type = 'neutral', icon, size = 'sm', style }) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.neutral;
  const isMedium = size === 'md';

  return (
    <View style={[styles.chip, { backgroundColor: config.bg, borderColor: config.border }, isMedium && styles.chipMd, style]}>
      {icon ? <Text style={[styles.icon, isMedium && styles.iconMd]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: config.text }, isMedium && styles.labelMd]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full, borderWidth: 1 },
  chipMd: { paddingHorizontal: spacing.sm + 4, paddingVertical: 6 },
  icon: { fontSize: fontSizes.xs + 1, marginRight: 4 },
  iconMd: { fontSize: fontSizes.sm + 1, marginRight: 6 },
  label: { fontSize: fontSizes.xs, fontWeight: '600' },
  labelMd: { fontSize: fontSizes.sm, fontWeight: '600' },
});

export default StatusChip;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Quick action button with emoji icon, rounded background, and caption.
 *
 * @param {object} props
 * @param {string} props.icon - Action emoji icon.
 * @param {string} props.label - Button caption text.
 * @param {() => void} props.onPress - Press handler.
 */
const QuickActionButton = React.memo(({ icon, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}12`,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    marginHorizontal: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
});

export default QuickActionButton;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';

/**
 * Metric display card showing an icon, value, and label, with optional tap handler.
 *
 * @param {object} props
 * @param {string} props.icon - Emoji string icon.
 * @param {string|number} props.value - Metric value or formatted count.
 * @param {string} props.label - Descriptive label text.
 * @param {string} [props.color=colors.primary] - Accent color.
 * @param {() => void} [props.onPress] - Tap callback.
 * @param {object|array} [props.style] - Style overrides.
 */
const StatCard = React.memo(({
  icon,
  value,
  label,
  color = colors.primary,
  onPress,
  style,
}) => {
  const ContainerComponent = onPress ? TouchableOpacity : View;

  return (
    <ContainerComponent
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.value, { color }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </ContainerComponent>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
    ...shadows.sm,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs + 2,
  },
  icon: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: fontSizes.xs - 1,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  value: {
    fontSize: fontSizes.sm + 1,
    fontWeight: '800',
  },
});

export default StatCard;

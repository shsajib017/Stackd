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
      <View style={[styles.iconContainer, { backgroundColor: `${color}1A` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});

export default StatCard;

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/**
 * Reusable badge pill component for statuses, counts, and tags.
 *
 * @param {object} props
 * @param {string} props.label - Text content displayed inside the badge.
 * @param {string} [props.color=colors.primary] - Badge accent color.
 * @param {'sm'|'md'} [props.size='md'] - Badge size preset.
 * @param {object|array} [props.style] - Style overrides.
 */
const Badge = React.memo(({
  label,
  color = colors.primary,
  size = 'md',
  style,
}) => {
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall ? styles.badge_sm : styles.badge_md,
        { backgroundColor: `${color}1A`, borderColor: `${color}4D` },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSmall ? styles.text_sm : styles.text_md,
          { color },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge_sm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  badge_md: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: fontSizes.xs - 1,
  },
  text_md: {
    fontSize: fontSizes.xs + 1,
  },
});

export default Badge;

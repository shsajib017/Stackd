import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Reusable badge pill component for statuses, counts, and tags.
 */
const Badge = React.memo(({
  label,
  color,
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();
  const isSmall = size === 'sm';
  const badgeColor = color || theme.colors.primary;

  return (
    <View
      style={[
        styles.badge,
        { borderRadius: theme.borderRadius.full },
        isSmall ? styles.badge_sm : styles.badge_md,
        { backgroundColor: `${badgeColor}1A`, borderColor: `${badgeColor}4D` },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSmall ? styles.text_sm : styles.text_md,
          { color: badgeColor },
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge_sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badge_md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: 10,
  },
  text_md: {
    fontSize: 12,
  },
});

export default Badge;

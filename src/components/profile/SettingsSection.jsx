import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Reusable Settings Section container with header and surface card wrapper.
 */
const SettingsSection = React.memo(({ title, titleColor, children, style, cardStyle }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <Text style={[styles.sectionTitle, { color: titleColor || theme.colors.textSecondary }]}>
          {title}
        </Text>
      ) : null}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            borderColor: `${theme.colors.textTertiary}20`,
          },
          cardStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default SettingsSection;

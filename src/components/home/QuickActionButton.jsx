import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/**
 * Quick action button with emoji icon, rounded background, and caption.
 */
const QuickActionButton = React.memo(({ icon, label, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: `${theme.colors.primary}12`,
          borderRadius: theme.borderRadius.lg,
          borderColor: `${theme.colors.primary}20`,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color: theme.colors.primary }]} numberOfLines={1}>
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
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginHorizontal: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default QuickActionButton;

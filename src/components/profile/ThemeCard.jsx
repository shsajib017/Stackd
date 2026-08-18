import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../config/ThemeContext';

/**
 * 2-column Theme Selection Card with gradient preview and active checkmark.
 */
const ThemeCard = React.memo(({ themeItem, isSelected, onSelect }) => {
  const { theme } = useTheme();
  const gradientColors = themeItem.backgroundGradient || [themeItem.color, themeItem.accent];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: isSelected ? themeItem.color : `${theme.colors.textTertiary}25`,
        },
        isSelected && { borderWidth: 2, backgroundColor: `${themeItem.color}0D` },
      ]}
      onPress={() => onSelect?.(themeItem.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.previewGradient, { borderRadius: theme.borderRadius.sm, borderColor: `${themeItem.color}30` }]}
      >
        <View style={styles.colorDotsRow}>
          <View style={[styles.colorDot, { backgroundColor: themeItem.color }]} />
          <View style={[styles.colorDot, { backgroundColor: themeItem.accent, marginLeft: -6 }]} />
        </View>
        {isSelected ? (
          <View style={[styles.checkBadge, { backgroundColor: themeItem.color }]}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : null}
      </LinearGradient>

      <Text
        style={[
          styles.themeTitle,
          { color: isSelected ? themeItem.color : theme.colors.textPrimary },
          isSelected && styles.boldTitle,
        ]}
        numberOfLines={1}
      >
        {themeItem.emoji} {themeItem.name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: { width: '48%', padding: 10, borderWidth: 1 },
  previewGradient: { height: 48, width: '100%', padding: 6, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, marginBottom: 8 },
  colorDotsRow: { flexDirection: 'row', alignItems: 'center' },
  colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#FFFFFF' },
  checkBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  themeTitle: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  boldTitle: { fontWeight: '800' },
});

export default ThemeCard;

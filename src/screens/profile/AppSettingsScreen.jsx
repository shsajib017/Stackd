import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import AppHeader from '../../components/common/AppHeader';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const THEME_OPTIONS = [
  { id: 'forest', name: 'Forest', color: '#1B4D3E', accent: '#E8A838', emoji: '🌲' },
  { id: 'ocean', name: 'Ocean', color: '#0277BD', accent: '#00BCD4', emoji: '🌊' },
  { id: 'midnight', name: 'Midnight', color: '#7C4DFF', accent: '#FF4081', emoji: '🌌' },
  { id: 'sakura', name: 'Sakura', color: '#E91E8C', accent: '#FF80AB', emoji: '🌸' },
  { id: 'ember', name: 'Ember', color: '#E64A19', accent: '#FF9800', emoji: '🔥' },
];

/** AppSettingsScreen managing theme colors, dark mode, and user preferences. */
const AppSettingsScreen = React.memo(({ navigation }) => {
  const { theme, themeName, setThemeName, isDark, toggleDarkMode } = useTheme();

  const currentBaseTheme = themeName.replace('Dark', '');

  const handleSelectTheme = (baseId) => {
    const targetName = isDark ? `${baseId}Dark` : baseId;
    setThemeName(targetName);
  };

  return (
    <ScreenWrapper>
      <AppHeader title="App Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Palette Selection */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>Theme Palette</Text>
        <View style={styles.themesGrid}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = currentBaseTheme === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.themeCard,
                  { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: isSelected ? opt.color : `${theme.colors.textTertiary}25` },
                  isSelected && { borderWidth: 2, backgroundColor: `${opt.color}10` },
                ]}
                onPress={() => handleSelectTheme(opt.id)}
                activeOpacity={0.8}
              >
                <View style={styles.themePreviewRow}>
                  <View style={[styles.colorCircle, { backgroundColor: opt.color }]} />
                  <View style={[styles.colorCircle, { backgroundColor: opt.accent, marginLeft: -8 }]} />
                </View>
                <Text style={[styles.themeTitle, { color: theme.colors.textPrimary }, isSelected && { color: opt.color, fontWeight: '800' }]}>
                  {opt.emoji} {opt.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Appearance Settings */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>🌙 Dark Mode</Text>
              <Text style={[styles.settingSub, { color: theme.colors.textTertiary }]}>Switch to a dark color palette</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: `${theme.colors.textTertiary}30`, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* General App Info */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>About</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: `${theme.colors.textTertiary}15`, paddingBottom: 12 }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>App Version</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textTertiary }]}>1.0.0 (Stackd)</Text>
          </View>
          <View style={[styles.settingRow, { paddingTop: 12 }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>Built For</Text>
            <Text style={[styles.settingValue, { color: theme.colors.textTertiary }]}>Student Lifestyle & Academics</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingVertical: 8, paddingBottom: 40 },
  sectionHeader: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, marginTop: 8, letterSpacing: 0.5 },
  themesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  themeCard: { width: '48%', padding: 16, borderWidth: 1, alignItems: 'center' },
  themePreviewRow: { flexDirection: 'row', marginBottom: 8 },
  colorCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#FFF' },
  themeTitle: { fontSize: 12, fontWeight: '700' },
  card: { padding: 16, borderWidth: 1, marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTextWrap: { flex: 1, marginRight: 8 },
  settingLabel: { fontSize: 13, fontWeight: '700' },
  settingSub: { fontSize: 10, marginTop: 2 },
  settingValue: { fontSize: 12, fontWeight: '600' },
});

export default AppSettingsScreen;

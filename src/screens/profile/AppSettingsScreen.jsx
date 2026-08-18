import React, { useCallback, useRef, useState } from 'react';
import { Modal, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { logout } from '../../supabase/auth';
import { updateProfile } from '../../supabase/profiles';
import supabase from '../../supabase/config';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import SettingsSection from '../../components/profile/SettingsSection';
import SettingsStepper from '../../components/profile/SettingsStepper';
import SettingsToggleRow from '../../components/profile/SettingsToggleRow';
import ThemeCard from '../../components/profile/ThemeCard';

const THEMES_LIST = [
  { id: 'forest', name: 'Forest Slate', emoji: '🌿', color: '#1B4D6A', accent: '#F5A623', backgroundGradient: ['#1B4D6A14', '#F8F9FA'] },
  { id: 'ocean', name: 'Ocean Blue', emoji: '🌊', color: '#0277BD', accent: '#FFB300', backgroundGradient: ['#0277BD14', '#F0F7FF'] },
  { id: 'midnight', name: 'Midnight Purple', emoji: '🌙', color: '#7C4DFF', accent: '#00E676', backgroundGradient: ['#7C4DFF14', '#F3F0FF'] },
  { id: 'sakura', name: 'Sakura Pink', emoji: '🌸', color: '#E91E8C', accent: '#FF4081', backgroundGradient: ['#E91E8C14', '#FFF0F5'] },
  { id: 'ember', name: 'Ember Orange', emoji: '🔥', color: '#E64A19', accent: '#FF9800', backgroundGradient: ['#E64A1914', '#FFF5F0'] },
];

const REMINDER_MINS = [15, 30, 60];

/** Complete AppSettingsScreen with Appearance, Notifications, Study, Budget, Data, and About. */
const AppSettingsScreen = React.memo(({ navigation }) => {
  const { theme, themeName, setThemeName, isDark, toggleDarkMode } = useTheme();
  const { user, profile, setProfile, clearAuth } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  const [pWork, setPWork] = useState(profile?.pomodoro_work_duration || 25);
  const [pBreak, setPBreak] = useState(profile?.pomodoro_break_duration || 5);
  const [resetDay, setResetDay] = useState(profile?.budget_reset_day || 1);
  const [studyMins, setStudyMins] = useState(profile?.study_reminder_minutes || 15);
  const [clearMeals, setClearMeals] = useState(false);
  const [clearStudy, setClearStudy] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');

  const currentBaseTheme = themeName.replace('Dark', '');
  const debounceTimer = useRef(null);

  const saveUpdates = useCallback(async (updates) => {
    if (!user?.id) return;
    setProfile({ ...(profile || {}), ...updates });
    try { await updateProfile(user.id, updates); } catch {}
  }, [profile, setProfile, user?.id]);

  const debouncedSave = useCallback((updates) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { saveUpdates(updates); }, 1000);
  }, [saveUpdates]);

  const handleExportData = async () => {
    try {
      const summary = `=== STACKD USER DATA EXPORT ===\nUser: ${profile?.name || 'Student'}\nEmail: ${user?.email || 'N/A'}\nDaily Study: ${profile?.daily_study_hours || 4}h\nMonthly Budget: ৳${profile?.monthly_budget_limit || 0}\nDate: ${new Date().toLocaleString()}`;
      await Share.share({ message: summary, title: 'Stackd Data Export' });
    } catch { showToast('Export failed', 'error'); }
  };

  const handleClear = async (table, msg, closeFn) => {
    try {
      await supabase.from(table).delete().eq('user_id', user.id);
      showToast(msg, 'info');
      closeFn(false);
    } catch { showToast(`Failed to clear ${table}`, 'error'); }
  };

  const handleDeleteAccount = async () => {
    try {
      await Promise.all(['meals', 'study_sessions', 'expenses', 'income'].map((t) => supabase.from(t).delete().eq('user_id', user.id)));
      await logout();
      clearAuth();
      setDeleteStep(0);
    } catch { showToast('Account deletion failed', 'error'); }
  };

  return (
    <ScreenWrapper>
      <AppHeader title="App Settings" showBack onBack={() => navigation.navigate('ProfileScreen')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsSection title="Appearance">
          <View style={styles.secPad}>
            <Text style={[styles.innerLabel, { color: theme.colors.textPrimary }]}>Color theme</Text>
            <View style={styles.themeGrid}>
              {THEMES_LIST.map((t) => (
                <ThemeCard key={t.id} themeItem={t} isSelected={currentBaseTheme === t.id} onSelect={(id) => setThemeName(isDark ? `${id}Dark` : id)} />
              ))}
            </View>
          </View>
          <SettingsToggleRow label="Dark mode" subtitle="Switch to dark variant of selected theme" value={isDark} onValueChange={toggleDarkMode} borderBottom={false} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsToggleRow label="All notifications" value={profile?.notifications_enabled !== false} onValueChange={(v) => saveUpdates({ notifications_enabled: v })} />
          <SettingsToggleRow label="Study reminders" subtitle="Notify before study sessions" value={profile?.study_reminders !== false} disabled={profile?.notifications_enabled === false} onValueChange={(v) => saveUpdates({ study_reminders: v })}>
            <View style={styles.pillRow}>
              {REMINDER_MINS.map((m) => (
                <TouchableOpacity key={m} onPress={() => { setStudyMins(m); saveUpdates({ study_reminder_minutes: m }); }} style={[styles.pill, { backgroundColor: studyMins === m ? theme.colors.primary : theme.colors.background, borderRadius: theme.borderRadius.full }]}>
                  <Text style={[styles.pillText, { color: studyMins === m ? '#FFF' : theme.colors.textSecondary }]}>{m} min before</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingsToggleRow>
          <SettingsToggleRow label="Budget alerts" subtitle="At 80% of category limit" value={profile?.alert_category_80 !== false} disabled={profile?.notifications_enabled === false} onValueChange={(v) => saveUpdates({ alert_category_80: v })} />
          <SettingsToggleRow label="Meal logging reminder" subtitle="Daily reminder at 8:00 PM" value={profile?.meal_reminders !== false} disabled={profile?.notifications_enabled === false} onValueChange={(v) => saveUpdates({ meal_reminders: v })} borderBottom={false} />
        </SettingsSection>

        <SettingsSection title="Study">
          <SettingsStepper label="Focus session length" value={pWork} onChange={(v) => { setPWork(v); debouncedSave({ pomodoro_work_duration: v }); }} min={15} max={60} step={5} unit="min" />
          <SettingsStepper label="Break length" value={pBreak} onChange={(v) => { setPBreak(v); debouncedSave({ pomodoro_break_duration: v }); }} min={5} max={15} step={1} unit="min" />
          <SettingsToggleRow label="Auto start break" subtitle="Automatically start break after focus ends" value={profile?.auto_start_break || false} onValueChange={(v) => saveUpdates({ auto_start_break: v })} borderBottom={false} />
        </SettingsSection>

        <SettingsSection title="Budget">
          <SettingsStepper label="Monthly budget resets on" subtitle="Day of month" value={resetDay} onChange={(v) => { setResetDay(v); debouncedSave({ budget_reset_day: v }); }} min={1} max={28} prefix="Day " />
          <SettingsToggleRow label="Track food spending separately" subtitle="Shows food spending separately in reports" value={profile?.track_food_separate !== false} onValueChange={(v) => saveUpdates({ track_food_separate: v })} borderBottom={false} />
        </SettingsSection>

        <SettingsSection title="Data">
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: `${theme.colors.textTertiary}15` }]} onPress={handleExportData} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: theme.colors.primary }]}>📥 Export my data</Text>
            <Text style={[styles.actionChevron, { color: theme.colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: `${theme.colors.textTertiary}15` }]} onPress={() => setClearMeals(true)} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: theme.colors.error }]}>🗑️ Clear meal history</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionRow, { borderBottomColor: `${theme.colors.textTertiary}15` }]} onPress={() => setClearStudy(true)} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: theme.colors.error }]}>📚 Clear study history</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow} onPress={() => setDeleteStep(1)} activeOpacity={0.7}>
            <Text style={[styles.actionLabel, { color: theme.colors.error, fontWeight: '800' }]}>⚠️ Delete account</Text>
          </TouchableOpacity>
        </SettingsSection>

        <SettingsSection title="About">
          <View style={[styles.aboutRow, { borderBottomColor: `${theme.colors.textTertiary}15` }]}>
            <Text style={[styles.aboutLabel, { color: theme.colors.textPrimary }]}>App Version</Text>
            <Text style={[styles.aboutVal, { color: theme.colors.textTertiary }]}>Stackd v1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.colors.textPrimary }]}>Built with ❤️ for students</Text>
            <Text style={[styles.aboutVal, { color: theme.colors.primary }]}>{profile?.name || 'Developer'}</Text>
          </View>
        </SettingsSection>
      </ScrollView>

      <ConfirmModal visible={clearMeals} title="Clear all meal logs?" message="This cannot be undone." confirmLabel="Clear" isDanger onConfirm={() => handleClear('meals', 'Meal history cleared', setClearMeals)} onCancel={() => setClearMeals(false)} />
      <ConfirmModal visible={clearStudy} title="Clear all study sessions?" message="This cannot be undone." confirmLabel="Clear" isDanger onConfirm={() => handleClear('study_sessions', 'Study history cleared', setClearStudy)} onCancel={() => setClearStudy(false)} />

      <Modal visible={deleteStep > 0} transparent animationType="fade" onRequestClose={() => setDeleteStep(0)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
            <Text style={[styles.modalHead, { color: theme.colors.error }]}>{deleteStep === 1 ? 'Delete Account?' : 'Type DELETE to confirm'}</Text>
            <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>{deleteStep === 1 ? 'This will permanently erase all your records. Are you sure?' : 'Please type "DELETE" in capital letters to proceed.'}</Text>
            {deleteStep === 1 ? <Button label="Continue" variant="danger" onPress={() => setDeleteStep(2)} fullWidth style={styles.mb8} /> : (
              <>
                <TextInput style={[styles.delInput, { color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}30`, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md }]} value={deleteInput} onChangeText={setDeleteInput} placeholder="DELETE" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="characters" />
                <Button label="Permanently Delete Account" variant="danger" disabled={deleteInput !== 'DELETE'} onPress={handleDeleteAccount} fullWidth style={styles.mb8} />
              </>
            )}
            <Button label="Cancel" variant="outline" onPress={() => { setDeleteStep(0); setDeleteInput(''); }} fullWidth />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingVertical: 8, paddingBottom: 60 },
  secPad: { padding: 12 },
  innerLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pillRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontSize: 10, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  actionLabel: { fontSize: 13, fontWeight: '700' },
  actionChevron: { fontSize: 18, fontWeight: '700' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  aboutLabel: { fontSize: 13, fontWeight: '700' },
  aboutVal: { fontSize: 11, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalBox: { width: '100%', maxWidth: 360, padding: 20 },
  modalHead: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  modalDesc: { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  delInput: { borderWidth: 1, padding: 12, fontSize: 14, fontWeight: '800', textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
  mb8: { marginBottom: 8 },
});

export default AppSettingsScreen;

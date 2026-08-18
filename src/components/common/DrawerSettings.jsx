import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useBudgetStore from '../../store/useBudgetStore';
import useUIStore from '../../store/useUIStore';
import { logout } from '../../supabase/auth';
import { formatBDT } from '../../utils/formatCurrency';
import ConfirmModal from './ConfirmModal';

/** Searchable Settings List for SideDrawer */
const DrawerSettings = React.memo(({ navigation, onClose, searchQuery = '' }) => {
  const { theme } = useTheme();
  const { profile, setProfile, clearAuth } = useAuthStore();
  const { monthlyLimit, setMonthlyLimit } = useBudgetStore();
  const showToast = useUIStore((s) => s.showToast);

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');
  const [editingStudy, setEditingStudy] = useState(false);
  const [studyValue, setStudyValue] = useState('');
  const [pomodoroLength, setPomodoroLength] = useState(25);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveBudget = useCallback(() => {
    const num = parseFloat(budgetValue);
    if (!isNaN(num) && num > 0) {
      setMonthlyLimit(num);
      setProfile({ ...(profile || {}), monthly_budget_limit: num });
      showToast('Budget limit saved', 'success');
    }
    setEditingBudget(false);
  }, [budgetValue, profile, setMonthlyLimit, setProfile, showToast]);

  const handleSaveStudy = useCallback(() => {
    const num = parseFloat(studyValue);
    if (!isNaN(num) && num > 0) {
      setProfile({ ...(profile || {}), daily_study_hours: num });
      showToast('Study goal saved', 'success');
    }
    setEditingStudy(false);
  }, [profile, setProfile, showToast, studyValue]);

  const handleLogout = useCallback(async () => {
    try {
      setShowLogoutModal(false);
      onClose();
      await logout();
      clearAuth();
    } catch {
      clearAuth();
    }
  }, [clearAuth, onClose]);

  const sections = useMemo(() => [
    {
      title: 'BUDGET', color: theme.colors.accent,
      items: [
        { id: 'b1', type: 'editable', label: 'Monthly budget limit', value: formatBDT(monthlyLimit || profile?.monthly_budget_limit || 0), isEditing: editingBudget, editVal: budgetValue, onEdit: () => { setBudgetValue(String(monthlyLimit || '')); setEditingBudget(true); }, onChangeVal: setBudgetValue, onSave: handleSaveBudget, prefix: '৳' },
        { id: 'b2', type: 'link', label: 'Category limits', onPress: () => { onClose(); navigation.navigate('MainTabs', { screen: 'BudgetStack', params: { screen: 'BudgetSettingsScreen' } }); } },
        { id: 'b3', type: 'toggle', label: 'Overspending alerts', value: profile?.alert_category_80 !== false, onToggle: (v) => setProfile({ ...(profile || {}), alert_category_80: v }) },
      ],
    },
    {
      title: 'STUDY', color: theme.colors.primary,
      items: [
        { id: 's1', type: 'editable', label: 'Daily study hours', value: `${profile?.daily_study_hours || 4} hrs`, isEditing: editingStudy, editVal: studyValue, onEdit: () => { setStudyValue(String(profile?.daily_study_hours || 4)); setEditingStudy(true); }, onChangeVal: setStudyValue, onSave: handleSaveStudy, suffix: 'hrs' },
        { id: 's2', type: 'pills', label: 'Pomodoro length', options: [25, 45, 60], current: pomodoroLength, onSelect: setPomodoroLength },
        { id: 's3', type: 'toggle', label: 'Study reminders', value: profile?.study_reminders !== false, onToggle: (v) => setProfile({ ...(profile || {}), study_reminders: v }) },
      ],
    },
    {
      title: 'MEALS', color: theme.colors.success,
      items: [
        { id: 'm1', type: 'link', label: 'My Custom Foods', onPress: () => { onClose(); navigation.navigate('MyFoodsScreen'); } },
      ],
    },
    {
      title: 'APP', color: theme.colors.textSecondary,
      items: [
        { id: 'a1', type: 'toggle', label: 'Notifications', value: profile?.notifications_enabled !== false, onToggle: (v) => setProfile({ ...(profile || {}), notifications_enabled: v }) },
        { id: 'a2', type: 'link', label: 'Account', onPress: () => { onClose(); navigation.navigate('MainTabs', { screen: 'ProfileStack', params: { screen: 'AccountScreen' } }); } },
        { id: 'a3', type: 'danger', label: 'Log out', onPress: () => setShowLogoutModal(true) },
      ],
    },
  ], [budgetValue, editingBudget, editingStudy, handleSaveBudget, handleSaveStudy, monthlyLimit, navigation, onClose, pomodoroLength, profile, setProfile, studyValue, theme.colors.accent, theme.colors.primary, theme.colors.success, theme.colors.textSecondary]);

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.map((sec) => ({ ...sec, items: sec.items.filter((it) => it.label.toLowerCase().includes(q)) })).filter((sec) => sec.items.length > 0);
  }, [searchQuery, sections]);

  return (
    <View style={styles.container}>
      {filteredSections.length === 0 ? <Text style={[styles.noResults, { color: theme.colors.textTertiary }]}>No results found</Text> : filteredSections.map((sec) => (
        <View key={sec.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: sec.color }]}>{sec.title}</Text>
          {sec.items.map((it) => (
            <View key={it.id} style={[styles.itemRow, { borderBottomColor: `${theme.colors.textTertiary}10` }]}>
              {it.type === 'link' && <TouchableOpacity style={styles.flexRow} onPress={it.onPress}><Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{it.label}</Text><Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text></TouchableOpacity>}
              {it.type === 'toggle' && <View style={styles.flexRow}><Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{it.label}</Text><Switch value={it.value} onValueChange={it.onToggle} trackColor={{ false: `${theme.colors.textTertiary}30`, true: theme.colors.primary }} thumbColor={theme.colors.surface} /></View>}
              {it.type === 'editable' && (
                <View style={styles.editableContainer}>
                  <View style={styles.flexRow}><Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{it.label}</Text>{!it.isEditing && <TouchableOpacity onPress={it.onEdit} style={styles.editValBtn}><Text style={[styles.valText, { color: theme.colors.primary }]}>{it.value}</Text><Text style={styles.pencil}> ✏️</Text></TouchableOpacity>}</View>
                  {it.isEditing && <View style={styles.inlineEditRow}><TextInput style={[styles.editInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={it.editVal} onChangeText={it.onChangeVal} keyboardType="numeric" autoFocus /><TouchableOpacity onPress={it.onSave} style={[styles.saveBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.sm }]}><Text style={styles.saveText}>Save</Text></TouchableOpacity></View>}
                </View>
              )}
              {it.type === 'pills' && (
                <View style={styles.pillsContainer}>
                  <Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>{it.label}</Text>
                  <View style={styles.pillsRow}>{it.options.map((m) => (<TouchableOpacity key={m} onPress={() => it.onSelect(m)} style={[styles.pill, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.full }, it.current === m && { backgroundColor: `${theme.colors.primary}15`, borderColor: theme.colors.primary }]}><Text style={[styles.pillText, { color: theme.colors.textSecondary }, it.current === m && { color: theme.colors.primary, fontWeight: '800' }]}>{m}m</Text></TouchableOpacity>))}</View>
                </View>
              )}
              {it.type === 'danger' && <TouchableOpacity style={styles.flexRow} onPress={it.onPress}><Text style={[styles.itemLabel, { color: theme.colors.error, fontWeight: '700' }]}>{it.label}</Text></TouchableOpacity>}
            </View>
          ))}
        </View>
      ))}
      <ConfirmModal visible={showLogoutModal} title="Log out" message="Are you sure you want to log out?" confirmLabel="Log out" isDanger onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  noResults: { textAlign: 'center', padding: 24, fontStyle: 'italic' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  itemRow: { paddingVertical: 6, borderBottomWidth: 1 },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 12, fontWeight: '500' },
  chevron: { fontSize: 20 },
  editValBtn: { flexDirection: 'row', alignItems: 'center' },
  valText: { fontSize: 11, fontWeight: '700' },
  pencil: { fontSize: 10 },
  inlineEditRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  editInput: { flex: 1, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, fontSize: 11 },
  saveBtn: { paddingHorizontal: 8, justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  pillsContainer: { marginTop: 2 },
  pillsRow: { flexDirection: 'row', gap: 4, marginTop: 4 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  pillText: { fontSize: 10, fontWeight: '600' },
});

export default DrawerSettings;

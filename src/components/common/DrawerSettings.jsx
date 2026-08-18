import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useBudgetStore from '../../store/useBudgetStore';
import useUIStore from '../../store/useUIStore';
import { logout } from '../../supabase/auth';
import { formatBDT } from '../../utils/formatCurrency';
import ConfirmModal from './ConfirmModal';

/** Searchable Settings List for SideDrawer */
const DrawerSettings = React.memo(({ navigation, onClose, searchQuery = '' }) => {
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
      title: 'BUDGET', color: colors.accent,
      items: [
        { id: 'b1', type: 'editable', label: 'Monthly budget limit', value: formatBDT(monthlyLimit || profile?.monthly_budget_limit || 0), isEditing: editingBudget, editVal: budgetValue, onEdit: () => { setBudgetValue(String(monthlyLimit || '')); setEditingBudget(true); }, onChangeVal: setBudgetValue, onSave: handleSaveBudget, prefix: '৳' },
        { id: 'b2', type: 'link', label: 'Category limits', onPress: () => { onClose(); navigation.navigate('BudgetSettingsModal'); } },
        { id: 'b3', type: 'toggle', label: 'Overspending alerts', value: profile?.alert_category_80 !== false, onToggle: (v) => setProfile({ ...(profile || {}), alert_category_80: v }) },
      ],
    },
    {
      title: 'STUDY', color: colors.primary,
      items: [
        { id: 's1', type: 'editable', label: 'Daily study hours', value: `${profile?.daily_study_hours || 4} hrs`, isEditing: editingStudy, editVal: studyValue, onEdit: () => { setStudyValue(String(profile?.daily_study_hours || 4)); setEditingStudy(true); }, onChangeVal: setStudyValue, onSave: handleSaveStudy, suffix: 'hrs' },
        { id: 's2', type: 'pills', label: 'Pomodoro length', options: [25, 45, 60], current: pomodoroLength, onSelect: setPomodoroLength },
        { id: 's3', type: 'toggle', label: 'Study reminders', value: profile?.study_reminders !== false, onToggle: (v) => setProfile({ ...(profile || {}), study_reminders: v }) },
      ],
    },
    {
      title: 'MEALS', color: colors.success,
      items: [
        { id: 'm1', type: 'link', label: 'My Custom Foods', onPress: () => { onClose(); navigation.navigate('MyFoodsScreen'); } },
      ],
    },
    {
      title: 'APP', color: colors.textSecondary,
      items: [
        { id: 'a1', type: 'toggle', label: 'Notifications', value: profile?.notifications_enabled !== false, onToggle: (v) => setProfile({ ...(profile || {}), notifications_enabled: v }) },
        { id: 'a2', type: 'link', label: 'Account', onPress: () => { onClose(); navigation.navigate('AccountModal'); } },
        { id: 'a3', type: 'danger', label: 'Log out', onPress: () => setShowLogoutModal(true) },
      ],
    },
  ], [budgetValue, editingBudget, editingStudy, handleSaveBudget, handleSaveStudy, monthlyLimit, navigation, onClose, pomodoroLength, profile, setProfile, studyValue]);

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.map((sec) => ({ ...sec, items: sec.items.filter((it) => it.label.toLowerCase().includes(q)) })).filter((sec) => sec.items.length > 0);
  }, [searchQuery, sections]);

  return (
    <View style={styles.container}>
      {filteredSections.length === 0 ? <Text style={styles.noResults}>No results found</Text> : filteredSections.map((sec) => (
        <View key={sec.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: sec.color }]}>{sec.title}</Text>
          {sec.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              {it.type === 'link' && <TouchableOpacity style={styles.flexRow} onPress={it.onPress}><Text style={styles.itemLabel}>{it.label}</Text><Text style={styles.chevron}>›</Text></TouchableOpacity>}
              {it.type === 'toggle' && <View style={styles.flexRow}><Text style={styles.itemLabel}>{it.label}</Text><Switch value={it.value} onValueChange={it.onToggle} trackColor={{ false: colors.textTertiary, true: colors.primary }} /></View>}
              {it.type === 'editable' && (
                <View style={styles.editableContainer}>
                  <View style={styles.flexRow}><Text style={styles.itemLabel}>{it.label}</Text>{!it.isEditing && <TouchableOpacity onPress={it.onEdit} style={styles.editValBtn}><Text style={styles.valText}>{it.value}</Text><Text style={styles.pencil}> ✏️</Text></TouchableOpacity>}</View>
                  {it.isEditing && <View style={styles.inlineEditRow}><TextInput style={styles.editInput} value={it.editVal} onChangeText={it.onChangeVal} keyboardType="numeric" autoFocus /><TouchableOpacity onPress={it.onSave} style={styles.saveBtn}><Text style={styles.saveText}>Save</Text></TouchableOpacity></View>}
                </View>
              )}
              {it.type === 'pills' && (
                <View style={styles.pillsContainer}>
                  <Text style={styles.itemLabel}>{it.label}</Text>
                  <View style={styles.pillsRow}>{it.options.map((m) => (<TouchableOpacity key={m} onPress={() => it.onSelect(m)} style={[styles.pill, it.current === m && styles.activePill]}><Text style={[styles.pillText, it.current === m && styles.activePillText]}>{m}m</Text></TouchableOpacity>))}</View>
                </View>
              )}
              {it.type === 'danger' && <TouchableOpacity style={styles.flexRow} onPress={it.onPress}><Text style={[styles.itemLabel, styles.dangerLabel]}>{it.label}</Text></TouchableOpacity>}
            </View>
          ))}
        </View>
      ))}
      <ConfirmModal visible={showLogoutModal} title="Log out" message="Are you sure you want to log out?" confirmLabel="Log out" isDanger onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  noResults: { textAlign: 'center', color: colors.textTertiary, padding: spacing.lg, fontStyle: 'italic' },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSizes.xs, fontWeight: '800', letterSpacing: 1, marginBottom: spacing.xs },
  itemRow: { paddingVertical: spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}10` },
  flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: fontSizes.sm, color: colors.textPrimary, fontWeight: '500' },
  dangerLabel: { color: colors.error, fontWeight: '700' },
  chevron: { fontSize: fontSizes.xl, color: colors.textTertiary },
  editValBtn: { flexDirection: 'row', alignItems: 'center' },
  valText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.primary },
  pencil: { fontSize: fontSizes.xs },
  inlineEditRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  editInput: { flex: 1, backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, fontSize: fontSizes.xs + 1, color: colors.textPrimary },
  saveBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  saveText: { color: colors.surface, fontSize: fontSizes.xs, fontWeight: '700' },
  pillsContainer: { marginTop: 2 },
  pillsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  pill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full, backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30` },
  activePill: { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
  pillText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textSecondary },
  activePillText: { color: colors.primary, fontWeight: '800' },
});

export default DrawerSettings;

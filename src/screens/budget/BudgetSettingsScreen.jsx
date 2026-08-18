import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useBudgetStore from '../../store/useBudgetStore';
import useUIStore from '../../store/useUIStore';
import { updateProfile } from '../../supabase/profiles';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatBDT } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const CATEGORY_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };

/** Budget Settings Screen for configuring monthly limits, category limits, and alert thresholds. */
const BudgetSettingsScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const storeMonthlyLimit = useBudgetStore((s) => s.monthlyLimit);
  const storeCategoryLimits = useBudgetStore((s) => s.categoryLimits);
  const setStoreMonthlyLimit = useBudgetStore((s) => s.setMonthlyLimit);
  const setStoreCategoryLimits = useBudgetStore((s) => s.setCategoryLimits);
  const showToast = useUIStore((s) => s.showToast);

  const [monthlyLimitInput, setMonthlyLimitInput] = useState('');
  const [currentMonthlyLimit, setCurrentMonthlyLimit] = useState(0);
  const [categoryLimits, setCategoryLimits] = useState({});
  const [alertCat80, setAlertCat80] = useState(true);
  const [alertMonthly90, setAlertMonthly90] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const syncSettings = useCallback(() => {
    const lim = Number(profile?.monthly_budget_limit ?? storeMonthlyLimit ?? 0);
    setCurrentMonthlyLimit(lim);
    setMonthlyLimitInput(lim > 0 ? String(lim) : '');
    setCategoryLimits({ ...(profile?.category_limits || storeCategoryLimits || {}) });
    setAlertCat80(profile?.alert_category_80 !== false);
    setAlertMonthly90(profile?.alert_monthly_90 !== false);
  }, [profile, storeCategoryLimits, storeMonthlyLimit]);

  useFocusEffect(useCallback(() => { syncSettings(); }, [syncSettings]));

  const handleUpdateMonthlyLimit = useCallback(() => {
    const num = parseFloat(monthlyLimitInput) || 0;
    setCurrentMonthlyLimit(num);
    setStoreMonthlyLimit(num);
    setProfile({ ...(profile || {}), monthly_budget_limit: num });
    showToast('Monthly budget limit updated', 'info');
  }, [monthlyLimitInput, profile, setProfile, setStoreMonthlyLimit, showToast]);

  const handleCategoryLimitChange = useCallback((cat, val) => {
    setCategoryLimits((prev) => {
      const next = { ...prev };
      if (!val || isNaN(parseFloat(val))) delete next[cat];
      else next[cat] = parseFloat(val);
      return next;
    });
  }, []);

  const handleSaveCategoryLimits = useCallback(() => {
    setStoreCategoryLimits(categoryLimits);
    setProfile({ ...(profile || {}), category_limits: categoryLimits });
    showToast('Category limits updated', 'info');
  }, [categoryLimits, profile, setProfile, setStoreCategoryLimits, showToast]);

  const handleAlertToggle = useCallback((type, value) => {
    if (type === 'cat80') setAlertCat80(value);
    if (type === 'monthly90') setAlertMonthly90(value);
    const updated = {
      ...(profile || {}),
      alert_category_80: type === 'cat80' ? value : alertCat80,
      alert_monthly_90: type === 'monthly90' ? value : alertMonthly90,
    };
    setProfile(updated);
  }, [alertCat80, alertMonthly90, profile, setProfile]);

  const handleSaveAll = useCallback(async () => {
    const finalMonthly = parseFloat(monthlyLimitInput) || currentMonthlyLimit || 0;
    try {
      setIsLoading(true);
      const updates = { monthly_budget_limit: finalMonthly, category_limits: categoryLimits, alert_category_80: alertCat80, alert_monthly_90: alertMonthly90 };
      setStoreMonthlyLimit(finalMonthly);
      setStoreCategoryLimits(categoryLimits);
      setProfile({ ...(profile || {}), ...updates });
      if (user?.id) await updateProfile(user.id, updates);
      showToast('Budget settings saved successfully', 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [alertCat80, alertMonthly90, categoryLimits, currentMonthlyLimit, monthlyLimitInput, navigation, profile, setProfile, setStoreCategoryLimits, setStoreMonthlyLimit, showToast, user?.id]);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Budget Settings" showBack onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.textPrimary }]}>Monthly Budget Limit</Text>
            <Text style={[styles.currentLimitDisplay, { color: theme.colors.primary }]}>{formatBDT(currentMonthlyLimit)}</Text>
            <View style={styles.inputRow}>
              <View style={[styles.prefixInputBox, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}>
                <Text style={[styles.prefix, { color: theme.colors.primary }]}>৳</Text>
                <TextInput
                  style={[styles.textInput, { color: theme.colors.textPrimary }]}
                  value={monthlyLimitInput}
                  onChangeText={setMonthlyLimitInput}
                  placeholder="Set new limit..."
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>
              <Button label="Update" onPress={handleUpdateMonthlyLimit} size="sm" style={styles.updateBtn} />
            </View>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.textPrimary }]}>Spending Limits per Category</Text>
            <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>Leave empty for no limit</Text>
            {EXPENSE_CATEGORIES.map((cat) => (
              <View key={cat} style={[styles.catRow, { borderBottomColor: `${theme.colors.textTertiary}15` }]}>
                <View style={styles.catInfo}>
                  <Text style={styles.catIcon}>{CATEGORY_ICONS[cat] || '📦'}</Text>
                  <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>{cat}</Text>
                </View>
                <View style={[styles.catInputWrap, { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm, borderColor: `${theme.colors.textTertiary}30` }]}>
                  <Text style={[styles.catPrefix, { color: theme.colors.textSecondary }]}>৳</Text>
                  <TextInput
                    style={[styles.catInput, { color: theme.colors.textPrimary }]}
                    value={categoryLimits[cat] !== undefined ? String(categoryLimits[cat]) : ''}
                    onChangeText={(v) => handleCategoryLimitChange(cat, v)}
                    placeholder="No limit"
                    placeholderTextColor={theme.colors.textTertiary}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ))}
            <Button label="Save category limits" variant="secondary" onPress={handleSaveCategoryLimits} size="sm" style={styles.saveCatBtn} fullWidth />
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.sectionHeader, { color: theme.colors.textPrimary }]}>Alerts</Text>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.colors.textPrimary }]}>Alert when category reaches 80%</Text>
              <Switch value={alertCat80} onValueChange={(v) => handleAlertToggle('cat80', v)} trackColor={{ false: theme.colors.textTertiary, true: theme.colors.primary }} />
            </View>
            <View style={[styles.divider, { backgroundColor: `${theme.colors.textTertiary}15` }]} />
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.colors.textPrimary }]}>Alert when monthly budget reaches 90%</Text>
              <Switch value={alertMonthly90} onValueChange={(v) => handleAlertToggle('monthly90', v)} trackColor={{ false: theme.colors.textTertiary, true: theme.colors.primary }} />
            </View>
          </View>

          <Button label="Save all settings" onPress={handleSaveAll} loading={isLoading} fullWidth style={styles.saveAllBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { paddingVertical: 8, paddingBottom: 130 },
  sectionCard: { padding: 16, marginBottom: 16, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  sectionHeader: { fontSize: 14, fontWeight: '800' },
  sectionSub: { fontSize: 10, marginBottom: 8 },
  currentLimitDisplay: { fontSize: 24, fontWeight: '900', marginVertical: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  prefixInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 8 },
  prefix: { fontSize: 14, fontWeight: '700', marginRight: 4 },
  textInput: { flex: 1, paddingVertical: 6, fontSize: 12, fontWeight: '600' },
  updateBtn: { minWidth: 80 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1 },
  catInfo: { flexDirection: 'row', alignItems: 'center' },
  catIcon: { fontSize: 18, marginRight: 8 },
  catName: { fontSize: 12, fontWeight: '600' },
  catInputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 6, width: 110 },
  catPrefix: { fontSize: 10, fontWeight: '700', marginRight: 2 },
  catInput: { flex: 1, paddingVertical: 4, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  saveCatBtn: { marginTop: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleLabel: { fontSize: 12, fontWeight: '500', flex: 1, marginRight: 8 },
  divider: { height: 1, marginVertical: 4 },
  saveAllBtn: { marginTop: 4 },
});

export default BudgetSettingsScreen;

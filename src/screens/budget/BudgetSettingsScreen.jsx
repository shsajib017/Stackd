import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useBudgetStore from '../../store/useBudgetStore';
import useUIStore from '../../store/useUIStore';
import { updateProfile } from '../../supabase/profiles';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatBDT } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import AppHeader from '../../components/common/AppHeader';

const CATEGORY_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };

/** Budget Settings Screen for configuring monthly limits, category limits, and alert thresholds. */
const BudgetSettingsScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Budget Settings" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Monthly Budget Limit</Text>
          <Text style={styles.currentLimitDisplay}>{formatBDT(currentMonthlyLimit)}</Text>
          <View style={styles.inputRow}>
            <View style={styles.prefixInputBox}>
              <Text style={styles.prefix}>৳</Text>
              <TextInput style={styles.textInput} value={monthlyLimitInput} onChangeText={setMonthlyLimitInput} placeholder="Set new limit..." placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
            </View>
            <Button label="Update" onPress={handleUpdateMonthlyLimit} size="sm" style={styles.updateBtn} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Spending Limits per Category</Text>
          <Text style={styles.sectionSub}>Leave empty for no limit</Text>
          {EXPENSE_CATEGORIES.map((cat) => (
            <View key={cat} style={styles.catRow}>
              <View style={styles.catInfo}><Text style={styles.catIcon}>{CATEGORY_ICONS[cat] || '📦'}</Text><Text style={styles.catName}>{cat}</Text></View>
              <View style={styles.catInputWrap}>
                <Text style={styles.catPrefix}>৳</Text>
                <TextInput style={styles.catInput} value={categoryLimits[cat] !== undefined ? String(categoryLimits[cat]) : ''} onChangeText={(v) => handleCategoryLimitChange(cat, v)} placeholder="No limit" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
              </View>
            </View>
          ))}
          <Button label="Save category limits" variant="secondary" onPress={handleSaveCategoryLimits} size="sm" style={styles.saveCatBtn} fullWidth />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Alerts</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Alert when category reaches 80%</Text>
            <Switch value={alertCat80} onValueChange={(v) => handleAlertToggle('cat80', v)} trackColor={{ false: colors.textTertiary, true: colors.primary }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Alert when monthly budget reaches 90%</Text>
            <Switch value={alertMonthly90} onValueChange={(v) => handleAlertToggle('monthly90', v)} trackColor={{ false: colors.textTertiary, true: colors.primary }} />
          </View>
        </View>

        <Button label="Save all settings" onPress={handleSaveAll} loading={isLoading} fullWidth style={styles.saveAllBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}20` },
  backBtn: { padding: spacing.xs },
  backArrow: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  headerSpacer: { width: 32 },
  scrollContent: { padding: spacing.md, paddingBottom: 130 },
  sectionCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md, ...shadows.sm, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  sectionHeader: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary },
  sectionSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  currentLimitDisplay: { fontSize: fontSizes.xxl, fontWeight: '900', color: colors.primary, marginVertical: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  prefixInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}30`, paddingHorizontal: spacing.sm },
  prefix: { fontSize: fontSizes.md, fontWeight: '700', color: colors.primary, marginRight: 4 },
  textInput: { flex: 1, paddingVertical: spacing.xs + 2, fontSize: fontSizes.sm, color: colors.textPrimary, fontWeight: '600' },
  updateBtn: { minWidth: 80 },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs + 2, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  catInfo: { flexDirection: 'row', alignItems: 'center' },
  catIcon: { fontSize: 18, marginRight: spacing.sm },
  catName: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  catInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: `${colors.textTertiary}30`, paddingHorizontal: spacing.xs + 2, width: 110 },
  catPrefix: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textSecondary, marginRight: 2 },
  catInput: { flex: 1, paddingVertical: 4, fontSize: fontSizes.xs + 1, color: colors.textPrimary, fontWeight: '600', textAlign: 'right' },
  saveCatBtn: { marginTop: spacing.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  toggleLabel: { fontSize: fontSizes.sm, color: colors.textPrimary, fontWeight: '500', flex: 1, marginRight: spacing.sm },
  divider: { height: 1, backgroundColor: `${colors.textTertiary}15`, marginVertical: spacing.xs },
  saveAllBtn: { marginTop: spacing.xs },
});

export default BudgetSettingsScreen;

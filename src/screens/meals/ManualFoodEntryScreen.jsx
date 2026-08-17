import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useMeals from '../../hooks/useMeals';
import useUIStore from '../../store/useUIStore';
import { addCustomFood } from '../../supabase/foods';
import { validateManualFood } from '../../utils/validateForms';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';

/** Manual Food Entry Screen for custom outside meals. */
const ManualFoodEntryScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);
  const { logOutsideFood } = useMeals();

  const targetDate = route.params?.date || new Date().toISOString().split('T')[0];
  const targetMealType = route.params?.mealType || 'Lunch';

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [showNutrition, setShowNutrition] = useState(false);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saveToCustom, setSaveToCustom] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    setName(''); setPrice(''); setShowNutrition(false);
    setCalories(''); setProtein(''); setCarbs(''); setFat('');
    setSaveToCustom(false); setErrors({}); setSubmitError(null); setIsSubmitting(false);
  }, []));

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    const validation = validateManualFood({ name, price });
    if (!validation.isValid) { setErrors(validation.errors); return; }
    if (!price || Number(price) <= 0) { setErrors((p) => ({ ...p, price: 'Price must be greater than 0' })); return; }
    try {
      setIsSubmitting(true);
      const foodPayload = {
        food_name: name.trim(), price: Number(price),
        calories: calories ? Number(calories) : null, protein: protein ? Number(protein) : null,
        carbs: carbs ? Number(carbs) : null, fat: fat ? Number(fat) : null,
      };
      await logOutsideFood(targetDate, targetMealType, foodPayload);
      if (saveToCustom && user?.id) {
        await addCustomFood(user.id, {
          name: name.trim(),
          avg_price_bdt: Number(price),
          calories: calories ? Number(calories) : null,
          protein: protein ? Number(protein) : null,
          carbs: carbs ? Number(carbs) : null,
          fat: fat ? Number(fat) : null,
        });
      }
      showToast('Food logged ✓', 'success');
      navigation.goBack();
    } catch (err) {
      setSubmitError(err.message || 'Failed to log food');
    } finally {
      setIsSubmitting(false);
    }
  }, [calories, carbs, fat, logOutsideFood, name, navigation, price, saveToCustom, showToast, targetDate, targetMealType, user?.id]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader title="Add Food Manually" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Can't find what you're looking for? Add it manually below.</Text>
        </View>

        <Text style={styles.label}>Food name <Text style={styles.req}>*</Text></Text>
        <TextInput style={[styles.input, errors.name && styles.inputErr]} value={name} onChangeText={(t) => { setName(t); setErrors((p) => ({ ...p, name: null })); }} placeholder="e.g. Mama Noodles, Homemade rice, Canteen special" placeholderTextColor={colors.textTertiary} autoCapitalize="words" />
        {errors.name ? <Text style={styles.errText}>{errors.name}</Text> : null}

        <Text style={styles.label}>Price (BDT) <Text style={styles.req}>*</Text></Text>
        <View style={[styles.priceRow, errors.price && styles.inputErr]}>
          <Text style={styles.currencyPrefix}>৳</Text>
          <TextInput style={styles.priceInput} value={price} onChangeText={(t) => { setPrice(t); setErrors((p) => ({ ...p, price: null })); }} placeholder="e.g. 50" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
        </View>
        {errors.price ? <Text style={styles.errText}>{errors.price}</Text> : null}

        <View style={styles.nutritionSection}>
          <View style={styles.nutHeader}>
            <Text style={styles.label}>Nutrition info (optional)</Text>
            <Text style={styles.subNote}>Skip this if you don't know — price tracking still works</Text>
          </View>
          <TouchableOpacity style={styles.expandToggle} onPress={() => setShowNutrition((p) => !p)} activeOpacity={0.7}>
            <Text style={styles.expandToggleText}>{showNutrition ? 'Hide nutrition info ▲' : 'Add nutrition info ▼'}</Text>
          </TouchableOpacity>
          {showNutrition && (
            <View style={styles.grid}>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Calories (kcal)</Text>
                <TextInput style={styles.gridInput} value={calories} onChangeText={setCalories} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Protein (g)</Text>
                <TextInput style={styles.gridInput} value={protein} onChangeText={setProtein} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Carbs (g)</Text>
                <TextInput style={styles.gridInput} value={carbs} onChangeText={setCarbs} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
              </View>
              <View style={styles.gridCol}>
                <Text style={styles.gridLabel}>Fat (g)</Text>
                <TextInput style={styles.gridInput} value={fat} onChangeText={setFat} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" />
              </View>
            </View>
          )}
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchLabel}>Save for future use</Text>
            <Text style={styles.switchSub}>Find it quickly next time</Text>
          </View>
          <Switch value={saveToCustom} onValueChange={setSaveToCustom} trackColor={{ false: `${colors.textTertiary}30`, true: colors.primary }} thumbColor={colors.surface} />
        </View>

        {submitError ? <Text style={styles.bannerErr}>{submitError}</Text> : null}
        <Button label="Add food" variant="primary" fullWidth onPress={handleSubmit} loading={isSubmitting} style={styles.submitBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  infoCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  infoText: { fontSize: fontSizes.xs + 1, color: colors.textSecondary, lineHeight: 18 },
  label: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  req: { color: colors.error },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: fontSizes.sm, color: colors.textPrimary, marginBottom: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  currencyPrefix: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textSecondary, marginRight: 6 },
  priceInput: { flex: 1, paddingVertical: 12, fontSize: fontSizes.sm, color: colors.textPrimary },
  inputErr: { borderColor: colors.error },
  errText: { fontSize: fontSizes.xs, color: colors.error, marginTop: -spacing.sm, marginBottom: spacing.md },
  bannerErr: { fontSize: fontSizes.xs + 1, color: colors.error, fontWeight: '600', textAlign: 'center', marginBottom: spacing.md },
  nutritionSection: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  nutHeader: { marginBottom: spacing.xs },
  subNote: { fontSize: fontSizes.xs, color: colors.textTertiary, marginBottom: spacing.xs },
  expandToggle: { paddingVertical: spacing.xs },
  expandToggleText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: spacing.sm },
  gridCol: { width: '48%', marginBottom: spacing.sm },
  gridLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  gridInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: fontSizes.sm, color: colors.textPrimary },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  switchTextWrap: { flex: 1, marginRight: spacing.sm },
  switchLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  switchSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  submitBtn: { marginTop: spacing.xs },
});

export default ManualFoodEntryScreen;

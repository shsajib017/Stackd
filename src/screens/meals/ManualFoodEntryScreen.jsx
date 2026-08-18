import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useMeals from '../../hooks/useMeals';
import useUIStore from '../../store/useUIStore';
import { addCustomFood } from '../../supabase/foods';
import { validateManualFood } from '../../utils/validateForms';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';
import Button from '../../components/common/Button';

/** Manual Food Entry Screen for custom outside meals. */
const ManualFoodEntryScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title="Add Food Manually" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Can't find what you're looking for? Add it manually below.</Text>
          </View>

          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Food name <Text style={[styles.req, { color: theme.colors.error }]}>*</Text></Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30`, color: theme.colors.textPrimary },
              errors.name && { borderColor: theme.colors.error },
            ]}
            value={name}
            onChangeText={(t) => { setName(t); setErrors((p) => ({ ...p, name: null })); }}
            placeholder="e.g. Mama Noodles, Homemade rice, Canteen special"
            placeholderTextColor={theme.colors.textTertiary}
            autoCapitalize="words"
          />
          {errors.name ? <Text style={[styles.errText, { color: theme.colors.error }]}>{errors.name}</Text> : null}

          <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Price (BDT) <Text style={[styles.req, { color: theme.colors.error }]}>*</Text></Text>
          <View
            style={[
              styles.priceRow,
              { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` },
              errors.price && { borderColor: theme.colors.error },
            ]}
          >
            <Text style={[styles.currencyPrefix, { color: theme.colors.textSecondary }]}>৳</Text>
            <TextInput
              style={[styles.priceInput, { color: theme.colors.textPrimary }]}
              value={price}
              onChangeText={(t) => { setPrice(t); setErrors((p) => ({ ...p, price: null })); }}
              placeholder="e.g. 50"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
          {errors.price ? <Text style={[styles.errText, { color: theme.colors.error }]}>{errors.price}</Text> : null}

          <View style={[styles.nutritionSection, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
            <View style={styles.nutHeader}>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Nutrition info (optional)</Text>
              <Text style={[styles.subNote, { color: theme.colors.textTertiary }]}>Skip this if you don't know — price tracking still works</Text>
            </View>
            <TouchableOpacity style={styles.expandToggle} onPress={() => setShowNutrition((p) => !p)} activeOpacity={0.7}>
              <Text style={[styles.expandToggleText, { color: theme.colors.primary }]}>{showNutrition ? 'Hide nutrition info ▲' : 'Add nutrition info ▼'}</Text>
            </TouchableOpacity>
            {showNutrition && (
              <View style={styles.grid}>
                <View style={styles.gridCol}>
                  <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>Calories (kcal)</Text>
                  <TextInput style={[styles.gridInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={calories} onChangeText={setCalories} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
                </View>
                <View style={styles.gridCol}>
                  <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>Protein (g)</Text>
                  <TextInput style={[styles.gridInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={protein} onChangeText={setProtein} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
                </View>
                <View style={styles.gridCol}>
                  <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>Carbs (g)</Text>
                  <TextInput style={[styles.gridInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={carbs} onChangeText={setCarbs} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
                </View>
                <View style={styles.gridCol}>
                  <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>Fat (g)</Text>
                  <TextInput style={[styles.gridInput, { backgroundColor: theme.colors.background, borderColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm, color: theme.colors.textPrimary }]} value={fat} onChangeText={setFat} placeholder="0" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" />
                </View>
              </View>
            )}
          </View>

          <View style={[styles.switchRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
            <View style={styles.switchTextWrap}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>Save for future use</Text>
              <Text style={[styles.switchSub, { color: theme.colors.textSecondary }]}>Find it quickly next time</Text>
            </View>
            <Switch value={saveToCustom} onValueChange={setSaveToCustom} trackColor={{ false: `${theme.colors.textTertiary}30`, true: theme.colors.primary }} thumbColor={theme.colors.surface} />
          </View>

          {submitError ? <Text style={[styles.bannerErr, { color: theme.colors.error }]}>{submitError}</Text> : null}
          <Button label="Add food" variant="primary" fullWidth onPress={handleSubmit} loading={isSubmitting} style={styles.submitBtn} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  content: { paddingVertical: 8 },
  infoCard: { padding: 16, marginBottom: 16, borderWidth: 1 },
  infoText: { fontSize: 11, lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  req: { fontWeight: '700' },
  input: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 12, marginBottom: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 16, marginBottom: 16 },
  currencyPrefix: { fontSize: 14, fontWeight: '700', marginRight: 6 },
  priceInput: { flex: 1, paddingVertical: 12, fontSize: 12 },
  errText: { fontSize: 10, marginTop: -8, marginBottom: 16 },
  bannerErr: { fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  nutritionSection: { padding: 16, marginBottom: 16, borderWidth: 1 },
  nutHeader: { marginBottom: 4 },
  subNote: { fontSize: 10, marginBottom: 4 },
  expandToggle: { paddingVertical: 4 },
  expandToggleText: { fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  gridCol: { width: '48%', marginBottom: 8 },
  gridLabel: { fontSize: 10, marginBottom: 4, fontWeight: '600' },
  gridInput: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 8, fontSize: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 16, borderWidth: 1 },
  switchTextWrap: { flex: 1, marginRight: 8 },
  switchLabel: { fontSize: 12, fontWeight: '700' },
  switchSub: { fontSize: 10, marginTop: 2 },
  submitBtn: { marginTop: 4 },
});

export default ManualFoodEntryScreen;

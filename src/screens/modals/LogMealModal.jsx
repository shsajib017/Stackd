import React, { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useMeals from '../../hooks/useMeals';
import useUIStore from '../../store/useUIStore';
import { getUserCustomFoods } from '../../supabase/foods';
import { formatDateShort } from '../../utils/formatDate';

import FoodSearchSection from '../../components/meals/FoodSearchSection';

/** Bottom Sheet Modal for Logging Dorm Meals or Outside Food. */
const LogMealModal = React.memo(({ navigation, route }) => {
  const date = route.params?.date || new Date().toISOString().split('T')[0];
  const mealType = route.params?.mealType || 'Meal';

  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);
  const { logDormMeal, logOutsideFood, searchFoods } = useMeals();

  const [mode, setMode] = useState('initial'); // 'initial' | 'outside'
  const [customFoods, setCustomFoods] = useState([]);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getUserCustomFoods(user.id).then(setCustomFoods).catch(() => setCustomFoods([]));
    }
  }, [user?.id]);

  const handleLogDorm = useCallback(async () => {
    try {
      setIsLogging(true);
      await logDormMeal(date, mealType);
      showToast(`${mealType} logged as Dorm meal! 🏠`, 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to log dorm meal', 'error');
    } finally {
      setIsLogging(false);
    }
  }, [date, logDormMeal, mealType, navigation, showToast]);

  const handleSelectOutsideFood = useCallback(async (food) => {
    try {
      setIsLogging(true);
      await logOutsideFood(date, mealType, {
        food_name: food.name || food.food_name,
        food_id: food.id && !food.user_id ? food.id : null,
        custom_food_id: food.user_id ? food.id : null,
        price: food.avg_price_bdt ?? food.price ?? 0,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      });
      showToast(`${food.name || 'Food'} logged to ${mealType}! 🍜`, 'success');
      navigation.goBack();
    } catch (err) {
      showToast(err.message || 'Failed to log food', 'error');
    } finally {
      setIsLogging(false);
    }
  }, [date, logOutsideFood, mealType, navigation, showToast]);

  const handleManualAdd = useCallback(() => {
    navigation.replace('ManualFoodEntryScreen', { date, mealType });
  }, [date, mealType, navigation]);

  return (
    <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Log {mealType}</Text>
            <Text style={styles.dateText}>{formatDateShort(date)}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Top 2 Option Cards */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionCard, styles.dormCard, mode === 'initial' && styles.optionCardActive]}
              onPress={handleLogDorm}
              disabled={isLogging}
              activeOpacity={0.8}
            >
              <Text style={styles.optionEmoji}>🏠</Text>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionTitle, styles.dormTitle]}>Dorm meal</Text>
                <Text style={styles.optionSub}>Quick log — 1 tap to save</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, styles.outsideCard, mode === 'outside' && styles.outsideCardActive]}
              onPress={() => setMode('outside')}
              activeOpacity={0.8}
            >
              <Text style={styles.optionEmoji}>🍜</Text>
              <View style={styles.optionTextWrap}>
                <Text style={[styles.optionTitle, styles.outsideTitle]}>Outside food</Text>
                <Text style={styles.optionSub}>Search or add food details</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Expandable Food Search Section */}
          {mode === 'outside' && (
            <FoodSearchSection
              onSelectFood={handleSelectOutsideFood}
              onManualAdd={handleManualAdd}
              onSearch={searchFoods}
              customFoods={customFoods}
              isLogging={isLogging}
            />
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: `${colors.textPrimary}80`, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.lg, maxHeight: '88%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  title: { fontSize: fontSizes.lg + 1, fontWeight: '800', color: colors.textPrimary },
  dateText: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600', marginTop: 2 },
  closeBtn: { padding: spacing.xs },
  closeIcon: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textTertiary },
  scrollContent: { paddingBottom: spacing.lg },
  optionsRow: { gap: spacing.sm, marginBottom: spacing.xs },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1.5 },
  dormCard: { backgroundColor: '#EBF7EE', borderColor: '#BCE7C6' },
  outsideCard: { backgroundColor: '#FFF7E6', borderColor: '#FDE1A6' },
  outsideCardActive: { borderColor: colors.accent, borderWidth: 2 },
  optionEmoji: { fontSize: 26, marginRight: spacing.md },
  optionTextWrap: { flex: 1, backgroundColor: 'transparent' },
  optionTitle: { fontSize: fontSizes.sm + 1, fontWeight: '800', backgroundColor: 'transparent' },
  dormTitle: { color: '#1B5E20' },
  outsideTitle: { color: '#B45309' },
  optionSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2, backgroundColor: 'transparent' },
});

export default LogMealModal;

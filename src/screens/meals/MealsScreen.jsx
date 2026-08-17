import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useMeals from '../../hooks/useMeals';
import useUIStore from '../../store/useUIStore';

import ConfirmModal from '../../components/common/ConfirmModal';
import SectionHeader from '../../components/common/SectionHeader';
import SideDrawer from '../../components/common/SideDrawer';
import SkeletonCard from '../../components/common/SkeletonCard';
import DailyMealSummary from '../../components/meals/DailyMealSummary';
import MealSlot from '../../components/meals/MealSlot';

const getISODate = (d) => d.toISOString().split('T')[0];

/** Main Meals Tracking, Meal Slots, and Daily Nutrition Screen. */
const MealsScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getISODate(new Date()));
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { todayMeals, dailyFoodSpend, isLoading, fetchTodayMeals, deleteMeal } = useMeals();
  const showToast = useUIStore((state) => state.showToast);

  const todayStr = useMemo(() => getISODate(new Date()), []);
  const isToday = selectedDate === todayStr;

  const weekDays = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push({ iso: getISODate(d), day: d.toLocaleDateString('en-US', { weekday: 'short' }), dateNum: d.getDate() });
    }
    return list;
  }, []);

  const changeDateBy = useCallback((offset) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + offset);
    const nextStr = getISODate(cur);
    if (nextStr <= todayStr) setSelectedDate(nextStr);
  }, [selectedDate, todayStr]);

  useFocusEffect(useCallback(() => { fetchTodayMeals(selectedDate); }, [fetchTodayMeals, selectedDate]));

  const { breakfast, lunch, dinner, snacks } = useMemo(() => {
    const list = todayMeals || [];
    return {
      breakfast: list.find((m) => m.meal_type?.toLowerCase() === 'breakfast'),
      lunch: list.find((m) => m.meal_type?.toLowerCase() === 'lunch'),
      dinner: list.find((m) => m.meal_type?.toLowerCase() === 'dinner'),
      snacks: list.filter((m) => m.meal_type?.toLowerCase() === 'snacks'),
    };
  }, [todayMeals]);

  const handleOpenLog = useCallback((mealType) => {
    navigation.navigate('LogMealModal', { date: selectedDate, mealType });
  }, [navigation, selectedDate]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteMeal(deleteTarget.id, selectedDate);
      showToast('Meal log removed', 'info');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete meal', 'error');
    }
  }, [deleteMeal, deleteTarget?.id, selectedDate, showToast]);

  const dateLabel = isToday ? 'Today' : selectedDate.slice(5);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 24) }]}>
      {/* In-Screen Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setDrawerVisible(true)} style={({ pressed }) => [styles.menuBtn, { opacity: pressed ? 0.5 : 1 }]} hitSlop={{ top: 15, bottom: 15, left: 15, right: 25 }}>
          <Text pointerEvents="none" style={styles.menuIcon}>☰</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Meals</Text>
        <View style={styles.headerDateRow}>
          <TouchableOpacity onPress={() => changeDateBy(-1)} style={styles.dateNavBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.navArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerDateText}>{dateLabel}</Text>
          <TouchableOpacity onPress={() => changeDateBy(1)} disabled={isToday} style={[styles.dateNavBtn, isToday && styles.disabledNav]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.navArrow, isToday && styles.disabledArrow]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Horizontal 7-Day Date Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {weekDays.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <TouchableOpacity key={item.iso} style={[styles.datePill, isSelected && styles.datePillActive]} onPress={() => setSelectedDate(item.iso)} activeOpacity={0.8}>
                <Text style={[styles.pillDay, isSelected && styles.pillDayActive]}>{item.day}</Text>
                <Text style={[styles.pillNum, isSelected && styles.pillNumActive]}>{item.dateNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={styles.loadingBox}><SkeletonCard height={70} style={styles.mb} /><SkeletonCard height={70} style={styles.mb} /><SkeletonCard height={70} /></View>
        ) : (
          <>
            {/* 3 Main Meal Slots */}
            <SectionHeader title="Main Meals" />
            <MealSlot mealType="Breakfast" emoji="🌅" meal={breakfast} onLog={handleOpenLog} onDelete={setDeleteTarget} />
            <MealSlot mealType="Lunch" emoji="☀️" meal={lunch} onLog={handleOpenLog} onDelete={setDeleteTarget} />
            <MealSlot mealType="Dinner" emoji="🌙" meal={dinner} onLog={handleOpenLog} onDelete={setDeleteTarget} />

            {/* Snacks Section */}
            <SectionHeader title="Snacks" actionLabel="+ Add" onAction={() => handleOpenLog('Snacks')} style={styles.mt} />
            {snacks.length === 0 ? (
              <View style={styles.emptySnacksBox}><Text style={styles.emptySnacksText}>No snacks logged today</Text></View>
            ) : (
              snacks.map((s) => (
                <View key={s.id} style={styles.snackRow}>
                  <Text style={styles.snackEmoji}>🍿</Text>
                  <Text style={styles.snackName} numberOfLines={1}>{s.food_name || 'Snack'}</Text>
                  <Text style={styles.snackPrice}>৳{s.price || 0}</Text>
                  <TouchableOpacity onPress={() => setDeleteTarget(s)} style={styles.snackDelBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Text style={styles.snackDelIcon}>✕</Text></TouchableOpacity>
                </View>
              ))
            )}

            {/* Daily Nutrition & Food Spend Summary */}
            <View style={styles.mt}>
              <DailyMealSummary meals={todayMeals || []} dailySpend={dailyFoodSpend} />
            </View>

            {/* History Link */}
            <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('MealsHistoryScreen')} activeOpacity={0.8}>
              <Text style={styles.historyBtnText}>View Meals History →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Confirmation Modal for Deleting Meals */}
      <ConfirmModal visible={Boolean(deleteTarget)} title="Delete Meal Log?" message="This will remove this meal and update your daily food spend." confirmLabel="Delete" cancelLabel="Keep" isDanger onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15`, marginBottom: spacing.xs },
  menuBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 24, color: colors.textPrimary, fontWeight: '700' },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  headerDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateNavBtn: { padding: 4 },
  navArrow: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.primary },
  headerDateText: { fontSize: fontSizes.xs + 1, fontWeight: '800', color: colors.textPrimary },
  disabledNav: { opacity: 0.3 },
  disabledArrow: { color: colors.textTertiary },
  content: { padding: spacing.md, paddingBottom: 100 },
  dateScroll: { flexDirection: 'row', gap: spacing.xs + 2, paddingBottom: spacing.md },
  datePill: { width: 48, height: 58, borderRadius: borderRadius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  datePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillDay: { fontSize: fontSizes.xs - 2, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase' },
  pillDayActive: { color: 'rgba(255, 255, 255, 0.8)' },
  pillNum: { fontSize: fontSizes.sm + 1, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  pillNumActive: { color: colors.surface },
  loadingBox: { marginTop: spacing.md },
  mb: { marginBottom: spacing.sm },
  mt: { marginTop: spacing.md },
  emptySnacksBox: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.textTertiary}15`, alignItems: 'center', marginBottom: spacing.sm },
  emptySnacksText: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600' },
  snackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: `${colors.textTertiary}15` },
  snackEmoji: { fontSize: 18, marginRight: spacing.sm },
  snackName: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  snackPrice: { fontSize: fontSizes.xs + 1, fontWeight: '800', color: colors.accent, marginRight: spacing.sm },
  snackDelBtn: { padding: 4 },
  snackDelIcon: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '700' },
  historyBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  historyBtnText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.primary },
});

export default MealsScreen;

import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useMeals from '../../hooks/useMeals';
import useUIStore from '../../store/useUIStore';

import ConfirmModal from '../../components/common/ConfirmModal';
import SectionHeader from '../../components/common/SectionHeader';
import SideDrawer from '../../components/common/SideDrawer';
import SkeletonCard from '../../components/common/SkeletonCard';
import DailyMealSummary from '../../components/meals/DailyMealSummary';
import MealSlot from '../../components/meals/MealSlot';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const getISODate = (d) => d.toISOString().split('T')[0];

/** Main Meals Tracking, Meal Slots, and Daily Nutrition Screen. */
const MealsScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
      <AppHeader
        title="Meals"
        onMenuPress={() => setDrawerVisible(true)}
        rightElement={
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs', { screen: 'HomeStack' });
              }
            }}
            style={[
              styles.headerBackBtn,
              {
                backgroundColor: `${theme.colors.primary}15`,
                borderRadius: theme.borderRadius.sm,
                borderColor: `${theme.colors.primary}30`,
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.headerBackText, { color: theme.colors.primary }]}>Back</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Controls & Navigation */}
        <View style={styles.dateControlRow}>
          <View style={styles.dateTitleWrap}>
            <Text style={[styles.dateSectionLabel, { color: theme.colors.textSecondary }]}>Select Day</Text>
          </View>
          <View
            style={[
              styles.dateNavPill,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.md,
                borderColor: `${theme.colors.textTertiary}20`,
              },
            ]}
          >
            <TouchableOpacity onPress={() => changeDateBy(-1)} style={styles.dateNavBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.navArrow, { color: theme.colors.primary }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.dateNavText, { color: theme.colors.textPrimary }]}>{dateLabel}</Text>
            <TouchableOpacity onPress={() => changeDateBy(1)} disabled={isToday} style={[styles.dateNavBtn, isToday && styles.disabledNav]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.navArrow, { color: theme.colors.primary }, isToday && { color: theme.colors.textTertiary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal 7-Day Date Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {weekDays.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <TouchableOpacity
                key={item.iso}
                style={[
                  styles.datePill,
                  { borderRadius: theme.borderRadius.md, backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface, borderColor: isSelected ? theme.colors.primary : `${theme.colors.textTertiary}20` },
                ]}
                onPress={() => setSelectedDate(item.iso)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillDay, { color: isSelected ? 'rgba(255, 255, 255, 0.85)' : theme.colors.textTertiary }]}>{item.day}</Text>
                <Text style={[styles.pillNum, { color: isSelected ? theme.colors.surface : theme.colors.textPrimary }]}>{item.dateNum}</Text>
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
              <View style={[styles.emptySnacksBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}15` }]}>
                <Text style={[styles.emptySnacksText, { color: theme.colors.textTertiary }]}>No snacks logged today</Text>
              </View>
            ) : (
              snacks.map((s) => (
                <View key={s.id} style={[styles.snackRow, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}15` }]}>
                  <Text style={styles.snackEmoji}>🍿</Text>
                  <Text style={[styles.snackName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{s.food_name || 'Snack'}</Text>
                  <Text style={[styles.snackPrice, { color: theme.colors.accent }]}>৳{s.price || 0}</Text>
                  <TouchableOpacity onPress={() => setDeleteTarget(s)} style={styles.snackDelBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.snackDelIcon, { color: theme.colors.textTertiary }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Daily Nutrition & Food Spend Summary */}
            <View style={styles.mt}>
              <DailyMealSummary meals={todayMeals || []} dailySpend={dailyFoodSpend} />
            </View>

            {/* History Link */}
            <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('MealsHistoryScreen')} activeOpacity={0.8}>
              <Text style={[styles.historyBtnText, { color: theme.colors.primary }]}>View Meals History →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Confirmation Modal for Deleting Meals */}
      <ConfirmModal visible={Boolean(deleteTarget)} title="Delete Meal Log?" message="This will remove this meal and update your daily food spend." confirmLabel="Delete" cancelLabel="Keep" isDanger onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  headerBackBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerBackText: { fontSize: 11, fontWeight: '700' },
  content: { paddingVertical: 8, paddingBottom: 100 },
  dateControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  dateTitleWrap: { flex: 1 },
  dateSectionLabel: { fontSize: 13, fontWeight: '700' },
  dateNavPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, gap: 6 },
  dateNavBtn: { padding: 4 },
  navArrow: { fontSize: 16, fontWeight: '800' },
  dateNavText: { fontSize: 11, fontWeight: '800' },
  disabledNav: { opacity: 0.3 },
  dateScroll: { flexDirection: 'row', gap: 6, paddingBottom: 16 },
  datePill: { width: 48, height: 58, alignItems: 'center', justifyContent: 'center', borderWidth: 1, elevation: 1 },
  pillDay: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase' },
  pillNum: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  loadingBox: { marginTop: 16 },
  mb: { marginBottom: 8 },
  mt: { marginTop: 16 },
  emptySnacksBox: { padding: 16, borderWidth: 1, alignItems: 'center', marginBottom: 8 },
  emptySnacksText: { fontSize: 10, fontWeight: '600' },
  snackRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginBottom: 6, borderWidth: 1 },
  snackEmoji: { fontSize: 18, marginRight: 8 },
  snackName: { fontSize: 11, fontWeight: '700', flex: 1 },
  snackPrice: { fontSize: 11, fontWeight: '800', marginRight: 8 },
  snackDelBtn: { padding: 4 },
  snackDelIcon: { fontSize: 10, fontWeight: '700' },
  historyBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
  historyBtnText: { fontSize: 12, fontWeight: '800' },
});

export default MealsScreen;

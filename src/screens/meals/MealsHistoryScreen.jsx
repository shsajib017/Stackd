import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { getMealsByDateRange } from '../../supabase/meals';
import { formatBDT } from '../../utils/formatCurrency';
import AppHeader from '../../components/common/AppHeader';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import SpendingChart from '../../components/budget/SpendingChart';
import MealDayGroup from '../../components/meals/MealDayGroup';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/** Meals History Screen displaying monthly nutrition and outside food expenditure. */
const MealsHistoryScreen = React.memo(({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();

  const fetchHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      const data = await getMealsByDateRange(user.id, start, end);
      setMeals(data || []);
    } catch {
      showToast('Failed to load meal history', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [daysInMonth, month, showToast, user?.id, year]);

  useFocusEffect(useCallback(() => { fetchHistory(); }, [fetchHistory]));

  const changeMonth = useCallback((delta) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }, []);

  const { dormCount, outsideCount, totalSpend, avgDaily, dormRatio, dormPct } = useMemo(() => {
    let dorm = 0;
    let outside = 0;
    let spend = 0;
    meals.forEach((m) => {
      if (m.source === 'dorm') dorm += 1;
      else { outside += 1; spend += Number(m.price) || 0; }
    });
    const total = dorm + outside;
    const ratio = total > 0 ? dorm / total : 0;
    const pastDays = isCurrentMonth ? Math.max(1, now.getDate()) : daysInMonth;
    return {
      dormCount: dorm,
      outsideCount: outside,
      totalSpend: spend,
      avgDaily: Math.round(spend / pastDays),
      dormRatio: ratio,
      dormPct: Math.round(ratio * 100),
    };
  }, [daysInMonth, isCurrentMonth, meals, now]);

  const dailyChartData = useMemo(() => {
    const map = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = String(d).padStart(2, '0');
      const iso = `${year}-${String(month).padStart(2, '0')}-${dayStr}`;
      map[iso] = { day: d, date: iso, amount: 0 };
    }
    meals.forEach((m) => {
      if (m.source === 'outside' && m.date && map[m.date]) {
        map[m.date].amount += Number(m.price) || 0;
      }
    });
    return Object.values(map);
  }, [daysInMonth, meals, month, year]);

  const groupedDays = useMemo(() => {
    const groups = {};
    meals.forEach((m) => {
      if (!m.date) return;
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });
    return Object.keys(groups)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((date) => ({ date, meals: groups[date] }));
  }, [meals]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[selectedDate.getMonth()]} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn} disabled={isCurrentMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.arrowText, isCurrentMonth && styles.arrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statWrap}><StatCard icon="🏠" label="Dorm Meals" value={dormCount} color={colors.success} /></View>
        <View style={styles.statWrap}><StatCard icon="🍜" label="Outside Meals" value={outsideCount} color={colors.accent} /></View>
        <View style={styles.statWrap}><StatCard icon="৳" label="Food Spend" value={formatBDT(totalSpend)} color={colors.primary} /></View>
        <View style={styles.statWrap}><StatCard icon="📊" label="Daily Avg" value={`${formatBDT(avgDaily)}/d`} color={colors.textSecondary} /></View>
      </View>

      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <Text style={styles.breakdownTitle}>{dormPct}% dorm meals this month</Text>
          <Text style={styles.breakdownSub}>{dormCount} dorm • {outsideCount} outside</Text>
        </View>
        <ProgressBar progress={dormRatio} color={colors.success} height={10} />
      </View>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Daily Food Spending</Text>
      </View>
      <SpendingChart dailyData={dailyChartData} />

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Logged Days</Text>
      </View>
    </View>
  ), [avgDaily, changeMonth, dailyChartData, dormCount, dormPct, dormRatio, isCurrentMonth, outsideCount, selectedDate, totalSpend, year]);

  return (
    <View style={styles.container}>
      <AppHeader title="Meal History" showBack onBack={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.content}>
          <SkeletonCard height={44} style={styles.mb} />
          <SkeletonCard height={140} style={styles.mb} />
          <SkeletonCard height={180} />
        </View>
      ) : (
        <FlatList
          data={groupedDays}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => <MealDayGroup date={item.date} meals={item.meals} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="🍽️"
              title="No meals logged this month"
              subtitle="Start logging your meals from the Meals screen"
              actionLabel="Log a meal"
              onAction={() => navigation.navigate('MealsScreen')}
            />
          }
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  monthTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary },
  arrowBtn: { padding: spacing.xs },
  arrowText: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.textPrimary },
  arrowDisabled: { color: colors.textTertiary, opacity: 0.3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.md },
  statWrap: { width: '48%', marginBottom: spacing.sm },
  breakdownCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs + 2 },
  breakdownTitle: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.textPrimary },
  breakdownSub: { fontSize: fontSizes.xs, color: colors.textTertiary },
  sectionTitleRow: { marginTop: spacing.sm, marginBottom: spacing.xs + 2 },
  sectionTitle: { fontSize: fontSizes.xs + 1, fontWeight: '800', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  mb: { marginBottom: spacing.md },
});

export default MealsHistoryScreen;

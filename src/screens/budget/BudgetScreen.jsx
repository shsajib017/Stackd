import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useBudget from '../../hooks/useBudget';
import useSavings from '../../hooks/useSavings';
import useSpendingReport from '../../hooks/useSpendingReport';
import { formatBDT } from '../../utils/formatCurrency';

import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import SideDrawer from '../../components/common/SideDrawer';
import SkeletonCard from '../../components/common/SkeletonCard';
import CategoryBar from '../../components/budget/CategoryBar';
import SavingsGoalCard from '../../components/budget/SavingsGoalCard';
import ExpenseCard from '../../components/budget/ExpenseCard';

import AppHeader from '../../components/common/AppHeader';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Main Budget Management and Analytics Screen with month filtering.
 */
const BudgetScreen = React.memo(({ navigation }) => {
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 80 + 16;

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFabMenu, setShowFabMenu] = useState(false);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const { expenses, income, monthlyTotal, incomeTotal, fetchExpenses, fetchIncome, isLoading: budgetLoading } = useBudget(year, month);
  const { goals, fetchGoals, isLoading: goalsLoading } = useSavings();
  const { categoryBreakdown, prediction, fetchReport, isLoading: reportLoading } = useSpendingReport(year, month);

  const refreshData = useCallback(() => {
    fetchExpenses(year, month);
    fetchIncome(year, month);
    fetchGoals();
    fetchReport(year, month);
  }, [fetchExpenses, fetchIncome, fetchGoals, fetchReport, year, month]);

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  const changeMonth = useCallback((delta) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
  }, []);

  const remainingBalance = useMemo(() => (incomeTotal || 0) - (monthlyTotal || 0), [incomeTotal, monthlyTotal]);
  const recentExpenses = useMemo(() => (expenses || []).slice(0, 5), [expenses]);
  const categoriesList = useMemo(() => Object.entries(categoryBreakdown || {}), [categoryBreakdown]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}><Text style={styles.arrowText}>‹</Text></TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTH_NAMES[selectedDate.getMonth()]} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton} disabled={isCurrentMonth}>
          <Text style={[styles.arrowText, isCurrentMonth && styles.arrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {budgetLoading ? <SkeletonCard height={110} /> : (
        <View style={styles.overviewCard}>
          <View style={styles.overviewItem}><Text style={styles.overviewLabel}>Income</Text><Text style={styles.incomeText}>{formatBDT(incomeTotal)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.overviewItem}><Text style={styles.overviewLabel}>Spent</Text><Text style={styles.spentText}>{formatBDT(monthlyTotal)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.overviewItem}><Text style={styles.overviewLabel}>Balance</Text><Text style={styles.balanceText}>{formatBDT(remainingBalance)}</Text></View>
        </View>
      )}

      {reportLoading ? <SkeletonCard height={44} style={styles.bannerMargin} /> : (
        <View style={[styles.predBanner, prediction?.isOverBudget ? styles.predBannerOver : styles.predBannerOk]}>
          <Text style={styles.predText}>
            {prediction?.isOverBudget ? `⚠️ Projected to overspend by ${formatBDT(prediction.projected - (prediction.remaining + monthlyTotal))}` : '✅ Spending is on track for this month'}
          </Text>
        </View>
      )}

      <SectionHeader title="Category Breakdown" actionLabel="Report" onAction={() => navigation.navigate('SpendingReportScreen')} />
      {categoriesList.length === 0 ? <Text style={styles.emptyNotice}>No category data yet</Text> : (
        categoriesList.map(([cat, amount]) => <CategoryBar key={cat} category={cat} spent={amount} />)
      )}

      <SectionHeader title="Savings Goals" actionLabel="See all" onAction={() => navigation.navigate('SavingsGoalsScreen')} />
      {goalsLoading ? <SkeletonCard height={90} /> : (
        <FlatList
          horizontal
          data={goals || []}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => <SavingsGoalCard title={item.title} currentAmount={item.current_amount} targetAmount={item.target_amount} emoji={item.emoji} onPress={() => navigation.navigate('EditGoalScreen', { goal: item })} />}
          ListEmptyComponent={<Text style={styles.emptyNotice}>No savings goals yet</Text>}
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        />
      )}

      <SectionHeader title="Recent Transactions" actionLabel="See all" onAction={() => navigation.navigate('TransactionHistoryScreen')} />
      {recentExpenses.length === 0 ? <EmptyState icon="💸" title="No expenses logged" subtitle="Tap + to add your first expense" /> : null}
    </View>
  ), [budgetLoading, categoriesList, changeMonth, goals, goalsLoading, incomeTotal, isCurrentMonth, monthlyTotal, navigation, prediction, recentExpenses.length, remainingBalance, reportLoading, selectedDate, year]);

  return (
    <View style={styles.screen}>
      <AppHeader title="Budget & Expenses" onMenuPress={() => setDrawerVisible(true)} />
      <FlatList
        data={recentExpenses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ExpenseCard
            category={item.category}
            note={item.note}
            date={item.date}
            amount={item.amount}
            onPress={() => navigation.navigate('EditExpenseScreen', { expense: item })}
          />
        )}
        contentContainerStyle={[styles.content, { paddingBottom: fabBottom + 70 }]}
        showsVerticalScrollIndicator={false}
      />
      {showFabMenu && (
        <View style={[styles.fabOptions, { bottom: fabBottom + 65 }]}>
          <TouchableOpacity style={styles.fabOption} onPress={() => { setShowFabMenu(false); navigation.navigate('AddIncomeModal'); }}><Text style={styles.fabOptionText}>💵 Add income</Text></TouchableOpacity>
          <TouchableOpacity style={styles.fabOption} onPress={() => { setShowFabMenu(false); navigation.navigate('AddExpenseModal'); }}><Text style={styles.fabOptionText}>💸 Add expense</Text></TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => setShowFabMenu((prev) => !prev)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>{showFabMenu ? '✕' : '+'}</Text>
      </TouchableOpacity>
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  headerMenuBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerMenuIcon: { fontSize: 24, color: colors.textPrimary, fontWeight: '700' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  arrowButton: { padding: spacing.sm },
  arrowText: { fontSize: fontSizes.xl, color: colors.primary, fontWeight: 'bold' },
  arrowDisabled: { color: colors.textTertiary, opacity: 0.3 },
  monthTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  overviewCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.sm, marginBottom: spacing.sm },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: 4 },
  incomeText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.success },
  spentText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.error },
  balanceText: { fontSize: fontSizes.sm, fontWeight: '800', color: colors.primary },
  divider: { width: 1, height: '80%', backgroundColor: `${colors.textTertiary}30` },
  bannerMargin: { marginVertical: spacing.xs },
  predBanner: { padding: spacing.sm + 2, borderRadius: borderRadius.md, marginBottom: spacing.xs },
  predBannerOk: { backgroundColor: `${colors.success}1A` },
  predBannerOver: { backgroundColor: `${colors.error}1A` },
  predText: { fontSize: fontSizes.xs + 1, fontWeight: '600', textAlign: 'center', color: colors.textPrimary },
  horizontalList: { marginBottom: spacing.sm },
  emptyNotice: { fontSize: fontSizes.xs, color: colors.textTertiary, fontStyle: 'italic', marginVertical: spacing.xs },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadows.md },
  fabIcon: { fontSize: 28, color: colors.surface, lineHeight: 30, fontWeight: '700' },
  fabOptions: { position: 'absolute', right: 16, alignItems: 'flex-end', gap: spacing.xs },
  fabOption: { backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, ...shadows.sm },
  fabOptionText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
});

export default BudgetScreen;

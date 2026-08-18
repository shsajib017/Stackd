import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useBudget from '../../hooks/useBudget';
import useSavings from '../../hooks/useSavings';
import useSpendingReport from '../../hooks/useSpendingReport';
import { formatBDT } from '../../utils/formatCurrency';

import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import SideDrawer from '../../components/common/SideDrawer';
import SkeletonCard from '../../components/common/SkeletonCard';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import CategoryBar from '../../components/budget/CategoryBar';
import SavingsGoalCard from '../../components/budget/SavingsGoalCard';
import ExpenseCard from '../../components/budget/ExpenseCard';
import AppHeader from '../../components/common/AppHeader';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Main Budget Management and Analytics Screen with month filtering.
 */
const BudgetScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
          <Text style={[styles.arrowText, { color: theme.colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: theme.colors.textPrimary }]}>{MONTH_NAMES[selectedDate.getMonth()]} {year}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton} disabled={isCurrentMonth}>
          <Text style={[styles.arrowText, { color: theme.colors.primary }, isCurrentMonth && styles.arrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {budgetLoading ? <SkeletonCard height={110} /> : (
        <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20`, borderWidth: 1 }]}>
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>Income</Text>
            <Text style={[styles.incomeText, { color: theme.colors.success }]}>{formatBDT(incomeTotal)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: `${theme.colors.textTertiary}30` }]} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>Spent</Text>
            <Text style={[styles.spentText, { color: theme.colors.error }]}>{formatBDT(monthlyTotal)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: `${theme.colors.textTertiary}30` }]} />
          <View style={styles.overviewItem}>
            <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>Balance</Text>
            <Text style={[styles.balanceText, { color: theme.colors.primary }]}>{formatBDT(remainingBalance)}</Text>
          </View>
        </View>
      )}

      {reportLoading ? <SkeletonCard height={44} style={styles.bannerMargin} /> : (
        <View style={[styles.predBanner, { borderRadius: theme.borderRadius.md }, prediction?.isOverBudget ? { backgroundColor: `${theme.colors.error}1A` } : { backgroundColor: `${theme.colors.success}1A` }]}>
          <Text style={[styles.predText, { color: theme.colors.textPrimary }]}>
            {prediction?.isOverBudget ? `⚠️ Projected to overspend by ${formatBDT(prediction.projected - (prediction.remaining + monthlyTotal))}` : '✅ Spending is on track for this month'}
          </Text>
        </View>
      )}

      <SectionHeader title="Category Breakdown" actionLabel="Report" onAction={() => navigation.navigate('SpendingReportScreen')} />
      {categoriesList.length === 0 ? <Text style={[styles.emptyNotice, { color: theme.colors.textTertiary }]}>No category data yet</Text> : (
        categoriesList.map(([cat, amount]) => <CategoryBar key={cat} category={cat} spent={amount} />)
      )}

      <SectionHeader title="Savings Goals" actionLabel="See all" onAction={() => navigation.navigate('SavingsGoalsScreen')} />
      {goalsLoading ? <SkeletonCard height={90} /> : (
        <FlatList
          horizontal
          data={goals || []}
          keyExtractor={(g) => g.id}
          renderItem={({ item }) => <SavingsGoalCard title={item.title} currentAmount={item.current_amount} targetAmount={item.target_amount} emoji={item.emoji} onPress={() => navigation.navigate('EditGoalScreen', { goal: item })} />}
          ListEmptyComponent={<Text style={[styles.emptyNotice, { color: theme.colors.textTertiary }]}>No savings goals yet</Text>}
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        />
      )}

      <SectionHeader title="Recent Transactions" actionLabel="See all" onAction={() => navigation.navigate('TransactionHistoryScreen')} />
      {recentExpenses.length === 0 ? <EmptyState icon="💸" title="No expenses logged" subtitle="Tap + to add your first expense" /> : null}
    </View>
  ), [budgetLoading, categoriesList, changeMonth, goals, goalsLoading, incomeTotal, isCurrentMonth, monthlyTotal, navigation, prediction, recentExpenses.length, remainingBalance, reportLoading, selectedDate, theme.borderRadius.lg, theme.borderRadius.md, theme.colors.error, theme.colors.primary, theme.colors.success, theme.colors.surface, theme.colors.textPrimary, theme.colors.textSecondary, theme.colors.textTertiary, year]);

  return (
    <ScreenWrapper>
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
          <TouchableOpacity style={[styles.fabOption, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}20`, borderWidth: 1 }]} onPress={() => { setShowFabMenu(false); navigation.navigate('AddIncomeModal'); }}>
            <Text style={[styles.fabOptionText, { color: theme.colors.textPrimary }]}>💵 Add income</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.fabOption, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}20`, borderWidth: 1 }]} onPress={() => { setShowFabMenu(false); navigation.navigate('AddExpenseModal'); }}>
            <Text style={[styles.fabOptionText, { color: theme.colors.textPrimary }]}>💸 Add expense</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom, backgroundColor: theme.colors.accent }]}
        onPress={() => setShowFabMenu((prev) => !prev)}
        activeOpacity={0.85}
      >
        <Text style={[styles.fabIcon, { color: '#FFFFFF' }]}>{showFabMenu ? '✕' : '+'}</Text>
      </TouchableOpacity>
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingTop: 8 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  arrowButton: { padding: 8 },
  arrowText: { fontSize: 20, fontWeight: 'bold' },
  arrowDisabled: { opacity: 0.3 },
  monthTitle: { fontSize: 16, fontWeight: '800' },
  overviewCard: { flexDirection: 'row', padding: 16, marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewLabel: { fontSize: 10, marginBottom: 4 },
  incomeText: { fontSize: 12, fontWeight: '800' },
  spentText: { fontSize: 12, fontWeight: '800' },
  balanceText: { fontSize: 12, fontWeight: '800' },
  divider: { width: 1, height: '80%' },
  bannerMargin: { marginVertical: 4 },
  predBanner: { padding: 10, marginBottom: 4 },
  predText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  horizontalList: { marginBottom: 8 },
  emptyNotice: { fontSize: 10, fontStyle: 'italic', marginVertical: 4 },
  fab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon: { fontSize: 28, lineHeight: 30, fontWeight: '700' },
  fabOptions: { position: 'absolute', right: 16, alignItems: 'flex-end', gap: 6 },
  fabOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, elevation: 2 },
  fabOptionText: { fontSize: 12, fontWeight: '700' },
});

export default BudgetScreen;

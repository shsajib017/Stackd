import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useBudgetStore from '../../store/useBudgetStore';
import useUIStore from '../../store/useUIStore';
import { deleteExpense, getExpenses } from '../../supabase/expenses';
import { deleteIncome, getIncome } from '../../supabase/income';
import EmptyState from '../../components/common/EmptyState';
import TransactionFilters from '../../components/budget/TransactionFilters';
import TransactionRow from '../../components/budget/TransactionRow';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

/**
 * Transaction History Screen displaying filtered, searchable transaction list.
 */
const TransactionHistoryScreen = React.memo(() => {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const storeExpenses = useBudgetStore((s) => s.expenses);
  const storeIncome = useBudgetStore((s) => s.income);
  const setExpenses = useBudgetStore((s) => s.setExpenses);
  const setIncome = useBudgetStore((s) => s.setIncome);
  const removeExpenseLocal = useBudgetStore((s) => s.removeExpenseLocal);
  const showToast = useUIStore((s) => s.showToast);

  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const refreshData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [exp, inc] = await Promise.all([getExpenses(user.id), getIncome(user.id)]);
      setExpenses(exp || []);
      setIncome(inc || []);
    } catch {
      // Data fetch fallback
    }
  }, [user?.id, setExpenses, setIncome]);

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  const combinedList = useMemo(() => {
    const list = [];
    if (activeTab !== 'income') (storeExpenses || []).forEach((e) => list.push({ ...e, _type: 'expense' }));
    if (activeTab !== 'expense') (storeIncome || []).forEach((i) => list.push({ ...i, _type: 'income' }));
    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((it) =>
      (it.note || '').toLowerCase().includes(q) ||
      (it.category || '').toLowerCase().includes(q) ||
      (it.source || '').toLowerCase().includes(q)
    );
  }, [activeTab, storeExpenses, storeIncome, search]);

  const handlePress = useCallback((item) => {
    if (item._type === 'expense') {
      navigation.navigate('EditExpenseScreen', { expense: item });
    } else {
      navigation.navigate('EditIncomeScreen', { income: item });
    }
  }, [navigation]);

  const handleDelete = useCallback((item) => {
    const isExpense = item._type === 'expense';
    Alert.alert(
      `Delete this ${isExpense ? 'expense' : 'income'}?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isExpense) {
                await deleteExpense(item.id);
                removeExpenseLocal(item.id);
                showToast('Expense deleted', 'info');
              } else {
                await deleteIncome(item.id);
                showToast('Income deleted', 'info');
              }
              await refreshData();
            } catch (err) {
              showToast(err.message || 'Delete failed', 'error');
            }
          },
        },
      ]
    );
  }, [refreshData, removeExpenseLocal, showToast]);

  return (
    <ScreenWrapper>
      <AppHeader title="Transaction History" showBack onBack={() => navigation.goBack()} />
      <TransactionFilters
        searchQuery={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <FlatList
        data={combinedList}
        keyExtractor={(it) => `${it._type}-${it.id}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="📜" title="No transactions" subtitle="Add an expense or income to see history" />
        }
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            type={item._type}
            onPress={() => handlePress(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  listContent: { paddingVertical: 8, paddingBottom: 100 },
});

export default TransactionHistoryScreen;

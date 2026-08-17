import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addExpense as createExpense, deleteExpense as removeExpense,
  getCategoryTotals, getExpensesByMonth, getMonthlyTotal, updateExpense as editExpense,
} from '../supabase/expenses';
import {
  addIncome as createIncome, deleteIncome as removeIncome,
  getIncomeByMonth, getMonthlyIncomeTotal, updateIncome as editIncome,
} from '../supabase/income';
import useAuthStore from '../store/useAuthStore';
import useBudgetStore from '../store/useBudgetStore';

/**
 * Budget, expenses, and income management hook with year and month filtering.
 */
export const useBudget = (year, month) => {
  const user = useAuthStore((state) => state.user);
  const {
    expenses, income, isLoading,
    setExpenses, setIncome, addExpenseLocal, removeExpenseLocal, addIncomeLocal, setLoading,
  } = useBudgetStore();

  const [error, setError] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({});

  const fetchExpenses = useCallback(async (targetYearParam, targetMonthParam) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const now = new Date();
      const targetYear = typeof targetYearParam === 'number' ? targetYearParam : (year || now.getFullYear());
      const targetMonth = typeof targetMonthParam === 'number' ? targetMonthParam : (month || now.getMonth() + 1);

      const [data, mTotal, cTotals] = await Promise.all([
        getExpensesByMonth(user.id, targetYear, targetMonth),
        getMonthlyTotal(user.id, targetYear, targetMonth),
        getCategoryTotals(user.id, targetYear, targetMonth),
      ]);
      setExpenses(data || []);
      setMonthlyTotal(mTotal || 0);
      setCategoryTotals(cTotals || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, setExpenses, setLoading, user?.id, year]);

  const fetchIncome = useCallback(async (targetYearParam, targetMonthParam) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const now = new Date();
      const targetYear = typeof targetYearParam === 'number' ? targetYearParam : (year || now.getFullYear());
      const targetMonth = typeof targetMonthParam === 'number' ? targetMonthParam : (month || now.getMonth() + 1);

      const [data, total] = await Promise.all([
        getIncomeByMonth(user.id, targetYear, targetMonth),
        getMonthlyIncomeTotal(user.id, targetYear, targetMonth),
      ]);
      setIncome(data || []);
      setIncomeTotal(total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, setIncome, setLoading, user?.id, year]);

  useEffect(() => {
    if (user?.id) {
      const now = new Date();
      fetchExpenses(year || now.getFullYear(), month || now.getMonth() + 1);
      fetchIncome(year || now.getFullYear(), month || now.getMonth() + 1);
    }
  }, [fetchExpenses, fetchIncome, month, user?.id, year]);

  const addExpense = useCallback(async (data) => {
    if (!user?.id) return null;
    try {
      const row = await createExpense(user.id, data);
      addExpenseLocal(row);
      await fetchExpenses(year, month);
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [addExpenseLocal, fetchExpenses, month, user?.id, year]);

  const updateExpense = useCallback(async (expenseId, updates) => {
    try {
      const row = await editExpense(expenseId, updates);
      await fetchExpenses(year, month);
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchExpenses, month, year]);

  const deleteExpense = useCallback(async (expenseId) => {
    try {
      await removeExpense(expenseId);
      removeExpenseLocal(expenseId);
      await fetchExpenses(year, month);
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchExpenses, month, removeExpenseLocal, year]);

  const addIncome = useCallback(async (data) => {
    if (!user?.id) return null;
    try {
      const row = await createIncome(user.id, data);
      addIncomeLocal(row);
      await fetchIncome(year, month);
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [addIncomeLocal, fetchIncome, month, user?.id, year]);

  const updateIncome = useCallback(async (incomeId, updates) => {
    try {
      const row = await editIncome(incomeId, updates);
      await fetchIncome(year, month);
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchIncome, month, year]);

  const deleteIncome = useCallback(async (incomeId) => {
    try {
      await removeIncome(incomeId);
      await fetchIncome(year, month);
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    }
  }, [fetchIncome, month, year]);

  const remaining = useMemo(() => Math.max(0, incomeTotal - monthlyTotal), [incomeTotal, monthlyTotal]);

  return {
    expenses, income, isLoading, error, monthlyTotal, incomeTotal, remaining, categoryTotals,
    addExpense, updateExpense, deleteExpense, addIncome, updateIncome, deleteIncome, fetchExpenses, fetchIncome,
  };
};

export default useBudget;

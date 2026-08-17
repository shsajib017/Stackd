import { useCallback, useEffect, useState } from 'react';
import {
  getCategoryTotals,
  getExpensesByMonth,
  getMonthlyTotal,
} from '../supabase/expenses';
import { getIncomeByMonth } from '../supabase/income';
import { EXPENSE_CATEGORIES } from '../utils/constants';
import { predictMonthEnd } from '../utils/spendingPredictor';
import useAuthStore from '../store/useAuthStore';
import useBudgetStore from '../store/useBudgetStore';

const calcPercentChange = (current, previous) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
};

const buildDailyData = (expenses, yr, mo) => {
  const daysInMonth = new Date(yr, mo, 0).getDate();
  const dailyMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${yr}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyMap[dateKey] = 0;
  }

  (expenses || []).forEach((expense) => {
    const dateKey = typeof expense.date === 'string'
      ? expense.date.split('T')[0]
      : expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
    if (dailyMap[dateKey] !== undefined) {
      dailyMap[dateKey] += parseFloat(expense.amount) || 0;
    }
  });

  const dailyData = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    day: parseInt(date.split('-')[2], 10),
    amount,
  }));

  return dailyData;
};

/**
 * Monthly spending analytics, category breakdown, comparison, and daily chart hook.
 */
export const useSpendingReport = (year, month) => {
  const user = useAuthStore((state) => state.user);
  const monthlyLimit = useBudgetStore((state) => state.monthlyLimit);

  const [monthlyData, setMonthlyData] = useState({ expenses: [], income: [], totalSpent: 0, totalIncome: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [prediction, setPrediction] = useState({ projected: 0, remaining: 0, isOverBudget: false });
  const [comparisonWithLastMonth, setComparisonWithLastMonth] = useState({
    diffAmount: 0,
    percentChange: 0,
    direction: 'same',
    hasPrevData: false,
    lastMonthTotal: 0,
    categoryComparison: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = useCallback(
    async (targetYearParam, targetMonthParam) => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const now = new Date();
        const targetYear = targetYearParam || year || now.getFullYear();
        const targetMonth = targetMonthParam || month || now.getMonth() + 1;

        // Last month calculation
        const lastMonth = targetMonth === 1 ? 12 : targetMonth - 1;
        const lastMonthYear = targetMonth === 1 ? targetYear - 1 : targetYear;

        const [
          currentExpenses,
          currentIncome,
          currentTotal,
          catTotals,
          lastMonthTotal,
          lastMonthCatTotals,
        ] = await Promise.all([
          getExpensesByMonth(user.id, targetYear, targetMonth),
          getIncomeByMonth(user.id, targetYear, targetMonth),
          getMonthlyTotal(user.id, targetYear, targetMonth),
          getCategoryTotals(user.id, targetYear, targetMonth),
          getMonthlyTotal(user.id, lastMonthYear, lastMonth),
          getCategoryTotals(user.id, lastMonthYear, lastMonth),
        ]);

        const totalInc = (currentIncome || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
        setMonthlyData({
          expenses: currentExpenses || [],
          income: currentIncome || [],
          totalSpent: currentTotal || 0,
          totalIncome: totalInc,
        });

        setCategoryBreakdown(catTotals || {});

        // Build continuous daily spending array
        const daily = buildDailyData(currentExpenses || [], targetYear, targetMonth);
        setDailyData(daily);

        // Spending prediction for the active month
        const pred = predictMonthEnd(currentExpenses || [], monthlyLimit);
        setPrediction(pred);

        // Comparison against last month
        const diff = (currentTotal || 0) - (lastMonthTotal || 0);
        const overallPct = calcPercentChange(currentTotal || 0, lastMonthTotal || 0);
        let direction = 'same';
        if (diff > 0) direction = 'up';
        else if (diff < 0) direction = 'down';

        const categoryComparison = EXPENSE_CATEGORIES.map((cat) => {
          const curr = catTotals?.[cat] || 0;
          const prev = lastMonthCatTotals?.[cat] || 0;
          const pChange = calcPercentChange(curr, prev);
          let dir = 'same';
          if (curr > prev) dir = 'up';
          else if (curr < prev) dir = 'down';
          return {
            category: cat,
            current: curr,
            previous: prev,
            percentChange: Math.abs(pChange),
            direction: dir,
            hasPrevData: prev > 0,
          };
        });

        setComparisonWithLastMonth({
          diffAmount: Math.abs(diff),
          percentChange: Math.abs(overallPct),
          direction,
          hasPrevData: (lastMonthTotal || 0) > 0,
          lastMonthTotal: lastMonthTotal || 0,
          categoryComparison,
        });
      } catch {
        // Fallback on reporting error
      } finally {
        setIsLoading(false);
      }
    },
    [monthlyLimit, month, user?.id, year]
  );

  useEffect(() => {
    if (year && month) {
      fetchReport(year, month);
    }
  }, [fetchReport, month, year]);

  return {
    monthlyData,
    categoryBreakdown,
    dailyData,
    prediction,
    comparisonWithLastMonth,
    isLoading,
    fetchReport,
  };
};

export default useSpendingReport;

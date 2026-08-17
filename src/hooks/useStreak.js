import { useCallback, useState } from 'react';
import { getExpenses } from '../supabase/expenses';
import { getMealsByDateRange } from '../supabase/meals';
import { getSessions } from '../supabase/sessions';
import { calculateStreak } from '../utils/streakCalculator';
import useAuthStore from '../store/useAuthStore';
import useStudyStore from '../store/useStudyStore';

/**
 * Habit and activity streak calculation hook across study, meals, and budget.
 */
export const useStreak = () => {
  const user = useAuthStore((state) => state.user);
  const setStoreStreak = useStudyStore((state) => state.setStreak);

  const [studyStreak, setStudyStreak] = useState(0);
  const [mealStreak, setMealStreak] = useState(0);
  const [budgetStreak, setBudgetStreak] = useState(0);
  const [combinedStreak, setCombinedStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStreaks = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const now = new Date();
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - 60);
      const startDate = pastDate.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];

      const [sessions, meals, expenses] = await Promise.all([
        getSessions(user.id, { completed: true }),
        getMealsByDateRange(user.id, startDate, endDate),
        getExpenses(user.id, { startDate, endDate }),
      ]);

      const studyDates = (sessions || []).map((s) => s.date).filter(Boolean);
      const mealDates = (meals || []).map((m) => m.date).filter(Boolean);
      const expenseDates = (expenses || []).map((e) => e.date).filter(Boolean);

      const sStreak = calculateStreak(studyDates);
      const mStreak = calculateStreak(mealDates);
      const bStreak = calculateStreak(expenseDates);

      // Combined: days where all 3 modules had activity
      const studySet = new Set(studyDates);
      const mealSet = new Set(mealDates);
      const combinedDates = expenseDates.filter(
        (date) => studySet.has(date) && mealSet.has(date)
      );
      const cStreak = calculateStreak(combinedDates);

      setStudyStreak(sStreak);
      setMealStreak(mStreak);
      setBudgetStreak(bStreak);
      setCombinedStreak(cStreak);
      setStoreStreak(sStreak);
    } catch {
      // Background streak update fallback
    } finally {
      setIsLoading(false);
    }
  }, [setStoreStreak, user?.id]);

  return {
    studyStreak,
    mealStreak,
    budgetStreak,
    combinedStreak,
    isLoading,
    fetchStreaks,
  };
};

export default useStreak;

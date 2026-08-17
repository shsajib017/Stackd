import { useCallback, useState } from 'react';
import {
  addFundsToGoal,
  addSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
} from '../supabase/savings';
import useAuthStore from '../store/useAuthStore';
import useBudgetStore from '../store/useBudgetStore';

/**
 * Savings goals management hook.
 */
export const useSavings = () => {
  const user = useAuthStore((state) => state.user);
  const { savingsGoals: goals, setSavingsGoals } = useBudgetStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSavingsGoals(user.id);
      setSavingsGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [setSavingsGoals, user?.id]);

  const addGoal = useCallback(async (data) => {
    if (!user?.id) return null;
    try {
      setIsLoading(true);
      const row = await addSavingsGoal(user.id, data);
      await fetchGoals();
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGoals, user?.id]);

  const updateGoal = useCallback(async (goalId, updates) => {
    try {
      setIsLoading(true);
      const row = await updateSavingsGoal(goalId, updates);
      await fetchGoals();
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGoals]);

  const addFunds = useCallback(async (goalId, amount) => {
    try {
      setIsLoading(true);
      const row = await addFundsToGoal(goalId, amount);
      await fetchGoals();
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGoals]);

  const deleteGoal = useCallback(async (goalId) => {
    try {
      setIsLoading(true);
      await deleteSavingsGoal(goalId);
      await fetchGoals();
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchGoals]);

  return {
    goals,
    isLoading,
    error,
    addGoal,
    updateGoal,
    addFunds,
    deleteGoal,
    fetchGoals,
  };
};

export default useSavings;

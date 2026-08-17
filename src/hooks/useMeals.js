import { useCallback, useState } from 'react';
import { addExpense as createExpense } from '../supabase/expenses';
import { searchBDFoods } from '../supabase/foods';
import {
  deleteMealLog as removeMealLog,
  getDailyFoodSpend,
  getMealsByDate,
  getWeeklyFoodSpend,
  logDormMeal as createDormMeal,
  logOutsideFood as createOutsideFood,
} from '../supabase/meals';
import useAuthStore from '../store/useAuthStore';
import useMealsStore from '../store/useMealsStore';

/**
 * Meals tracking, outside food expenses, and food catalog search hook.
 */
export const useMeals = () => {
  const user = useAuthStore((state) => state.user);
  const {
    todayMeals,
    isLoading,
    setTodayMeals,
    addMealLocal,
    removeMealLocal,
    setFoodSearchResults,
    setLoading,
  } = useMealsStore();

  const [error, setError] = useState(null);
  const [dailyFoodSpend, setDailyFoodSpend] = useState(0);
  const [weeklyFoodSpend, setWeeklyFoodSpend] = useState(0);

  const fetchTodayMeals = useCallback(async (dateStr) => {
    if (!user?.id) return;
    const date = dateStr || new Date().toISOString().split('T')[0];
    try {
      setLoading(true);
      setError(null);
      const [meals, dSpend, wSpend] = await Promise.all([
        getMealsByDate(user.id, date),
        getDailyFoodSpend(user.id, date),
        getWeeklyFoodSpend(user.id),
      ]);
      setTodayMeals(meals);
      setDailyFoodSpend(dSpend);
      setWeeklyFoodSpend(wSpend);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTodayMeals, user?.id]);

  const logDormMeal = useCallback(async (date, mealType) => {
    if (!user?.id) return null;
    try {
      setLoading(true);
      const row = await createDormMeal(user.id, date, mealType);
      addMealLocal(row);
      await fetchTodayMeals(date);
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }, [addMealLocal, fetchTodayMeals, setLoading, user?.id]);

  const logOutsideFood = useCallback(async (date, mealType, foodData) => {
    if (!user?.id) return null;
    try {
      setLoading(true);
      const row = await createOutsideFood(user.id, date, mealType, foodData);
      addMealLocal(row);

      // Automatically sync outside food cost to budget expense module
      if (foodData?.price && Number(foodData.price) > 0) {
        await createExpense(user.id, {
          amount: Number(foodData.price),
          category: 'Food',
          note: `${mealType}: ${foodData.food_name || 'Outside meal'}`,
          date,
        });
      }

      await fetchTodayMeals(date);
      return row;
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }, [addMealLocal, fetchTodayMeals, setLoading, user?.id]);

  const deleteMeal = useCallback(async (mealLogId, date) => {
    try {
      setLoading(true);
      await removeMealLog(mealLogId);
      removeMealLocal(mealLogId);
      await fetchTodayMeals(date);
    } catch (err) {
      setError(err.message);
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchTodayMeals, removeMealLocal, setLoading]);

  const searchFoods = useCallback(async (query, category) => {
    try {
      const results = await searchBDFoods(query, category);
      setFoodSearchResults(results);
      return results;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [setFoodSearchResults]);

  return {
    todayMeals,
    isLoading,
    error,
    logDormMeal,
    logOutsideFood,
    deleteMeal,
    searchFoods,
    fetchTodayMeals,
    dailyFoodSpend,
    weeklyFoodSpend,
  };
};

export default useMeals;

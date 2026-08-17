import { create } from 'zustand';

/**
 * Meals and nutrition state store.
 */
export const useMealsStore = create((set) => ({
  todayMeals: [],
  foodSearchResults: [],
  customFoods: [],
  isLoading: false,

  setTodayMeals: (todayMeals) => set({ todayMeals }),
  addMealLocal: (meal) =>
    set((state) => ({ todayMeals: [...state.todayMeals, meal] })),
  removeMealLocal: (id) =>
    set((state) => ({ todayMeals: state.todayMeals.filter((m) => m.id !== id) })),

  setFoodSearchResults: (foodSearchResults) => set({ foodSearchResults }),
  setCustomFoods: (customFoods) => set({ customFoods }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useMealsStore;

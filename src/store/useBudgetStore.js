import { create } from 'zustand';

/**
 * Budget and finance state store.
 */
export const useBudgetStore = create((set) => ({
  expenses: [],
  income: [],
  savingsGoals: [],
  monthlyLimit: 0,
  categoryLimits: {},
  isLoading: false,

  setExpenses: (expenses) => set({ expenses }),
  addExpenseLocal: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
  removeExpenseLocal: (id) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),

  setIncome: (income) => set({ income }),
  addIncomeLocal: (item) =>
    set((state) => ({ income: [item, ...state.income] })),

  setSavingsGoals: (savingsGoals) => set({ savingsGoals }),
  setMonthlyLimit: (monthlyLimit) => set({ monthlyLimit }),
  setCategoryLimits: (categoryLimits) => set({ categoryLimits }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useBudgetStore;

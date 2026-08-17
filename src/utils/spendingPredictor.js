/**
 * Predicts month-end total spend and remaining budget based on current daily burn rate.
 * @param {Array<{ amount: number|string, date?: string }>} expenses - Current month's expenses.
 * @param {number} monthlyLimit - Monthly spending budget.
 * @returns {{ projected: number, remaining: number, isOverBudget: boolean }} Prediction summary.
 */
export const predictMonthEnd = (expenses = [], monthlyLimit = 0) => {
  const totalSpent = (expenses || []).reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
  const now = new Date();
  const currentDay = Math.max(1, now.getDate());
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const dailyAverage = totalSpent / currentDay;
  const projected = Math.round(dailyAverage * totalDaysInMonth);
  const remaining = Math.max(0, monthlyLimit - projected);
  const isOverBudget = monthlyLimit > 0 && projected > monthlyLimit;

  return {
    projected,
    remaining,
    isOverBudget,
  };
};

export default { predictMonthEnd };

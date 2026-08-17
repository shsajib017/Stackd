/**
 * Formats calorie count with unit (e.g. "320 kcal").
 * @param {number|string} cal - Calorie count.
 * @returns {string} Formatted calorie string.
 */
export const formatCalories = (cal) => {
  const amount = Math.round(Number(cal) || 0);
  return `${amount} kcal`;
};

/**
 * Formats macronutrient in grams with label (e.g. "24g protein").
 * @param {number|string} grams - Grams of macronutrient.
 * @param {string} label - Nutrient name (e.g. "protein", "carbs", "fat").
 * @returns {string} Formatted macro string.
 */
export const formatMacro = (grams, label = '') => {
  const amount = Math.round(Number(grams) || 0);
  const trimmedLabel = label ? ` ${label.trim().toLowerCase()}` : '';
  return `${amount}g${trimmedLabel}`;
};

export default {
  formatCalories,
  formatMacro,
};

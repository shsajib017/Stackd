import { BMI_CATEGORIES } from './constants';

/**
 * Calculates Body Mass Index (BMI).
 * @param {number} weightKg - Weight in kilograms.
 * @param {number} heightCm - Height in centimeters.
 * @returns {number} Calculated BMI rounded to 1 decimal place.
 */
export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

/**
 * Determines BMI category label based on standard ranges.
 * @param {number} bmi - Calculated BMI value.
 * @returns {string} Category label.
 */
export const getBMICategory = (bmi) => {
  if (!bmi || bmi <= 0) return BMI_CATEGORIES.NORMAL.label;
  if (bmi <= BMI_CATEGORIES.UNDERWEIGHT.max) return BMI_CATEGORIES.UNDERWEIGHT.label;
  if (bmi <= BMI_CATEGORIES.NORMAL.max) return BMI_CATEGORIES.NORMAL.label;
  if (bmi <= BMI_CATEGORIES.OVERWEIGHT.max) return BMI_CATEGORIES.OVERWEIGHT.label;
  return BMI_CATEGORIES.OBESE.label;
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE) using Mifflin-St Jeor equation.
 * @param {number} weightKg - Weight in kg.
 * @param {number} heightCm - Height in cm.
 * @param {number} age - Age in years.
 * @param {'male'|'female'} gender - Biological gender.
 * @param {string} activityLevel - Activity level description.
 * @returns {number} Daily energy expenditure in kcal.
 */
export const calculateTDEE = (weightKg, heightCm, age, gender, activityLevel) => {
  if (!weightKg || !heightCm || !age) return 2000;
  const s = gender === 'female' ? -161 : 5;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  const multipliers = {
    Sedentary: 1.2,
    'Lightly active': 1.375,
    'Moderately active': 1.55,
    'Very active': 1.725,
    'Extra active': 1.9,
  };
  const factor = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * factor);
};

/**
 * Calculates daily calorie target according to fitness goal.
 * @param {number} tdee - Base daily energy expenditure.
 * @param {'Lose weight'|'Maintain'|'Muscle gain'} goal - Target goal.
 * @returns {number} Adjusted daily calorie target.
 */
export const getCalorieTarget = (tdee, goal) => {
  const base = tdee || 2000;
  if (goal === 'Lose weight') return Math.max(1200, base - 500);
  if (goal === 'Muscle gain') return base + 300;
  return base;
};

/**
 * Returns macronutrient percentage split for a goal.
 * @param {'Lose weight'|'Maintain'|'Muscle gain'} goal - Target goal.
 * @returns {{ protein: number, carbs: number, fat: number }} Macro percentage split.
 */
export const getMacroSplit = (goal) => {
  if (goal === 'Muscle gain') return { protein: 35, carbs: 45, fat: 20 };
  if (goal === 'Lose weight') return { protein: 35, carbs: 35, fat: 30 };
  return { protein: 25, carbs: 50, fat: 25 };
};

/**
 * Provides actionable dietary recommendation according to BMI.
 * @param {number} bmi - Calculated BMI.
 * @returns {string} Recommendation message.
 */
export const getDietRecommendation = (bmi) => {
  const category = getBMICategory(bmi);
  if (category === BMI_CATEGORIES.UNDERWEIGHT.label) {
    return 'Increase calorie-dense nutritious meals like nuts, milk, and eggs.';
  }
  if (category === BMI_CATEGORIES.OVERWEIGHT.label || category === BMI_CATEGORIES.OBESE.label) {
    return 'Focus on balanced portion control, high-fiber vegetables, and lean proteins.';
  }
  return 'Maintain your current balanced diet with regular physical activity.';
};

export default {
  calculateBMI,
  getBMICategory,
  calculateTDEE,
  getCalorieTarget,
  getMacroSplit,
  getDietRecommendation,
};

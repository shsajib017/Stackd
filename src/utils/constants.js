/**
 * App-wide constants for Stackd.
 */

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Books',
  'Tuition',
  'Entertainment',
  'Other',
];

export const INCOME_SOURCES = [
  'Allowance',
  'Part-time',
  'Scholarship',
  'Other',
];

export const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
];

export const FOOD_CATEGORIES = [
  'Rice Meals',
  'Bread',
  'Street Food',
  'Fast Food',
  'Sweets',
  'Snacks',
  'Drinks',
  'Curry',
];

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];

export const ACTIVITY_LEVELS = [
  'Sedentary',
  'Lightly active',
  'Moderately active',
  'Very active',
  'Extra active',
];

export const GOAL_TYPES = [
  'Lose weight',
  'Maintain',
  'Muscle gain',
];

export const POMODORO_WORK_MINUTES = 25;

export const POMODORO_BREAK_MINUTES = 5;

export const RECURRENCE_INTERVALS = [
  'Daily',
  'Weekly',
  'Monthly',
];

export const BMI_CATEGORIES = {
  UNDERWEIGHT: { label: 'Underweight', min: 0, max: 18.4 },
  NORMAL: { label: 'Normal weight', min: 18.5, max: 24.9 },
  OVERWEIGHT: { label: 'Overweight', min: 25.0, max: 29.9 },
  OBESE: { label: 'Obese', min: 30.0, max: Infinity },
};

export default {
  EXPENSE_CATEGORIES,
  INCOME_SOURCES,
  MEAL_TYPES,
  FOOD_CATEGORIES,
  DIFFICULTY_LEVELS,
  ACTIVITY_LEVELS,
  GOAL_TYPES,
  POMODORO_WORK_MINUTES,
  POMODORO_BREAK_MINUTES,
  RECURRENCE_INTERVALS,
  BMI_CATEGORIES,
};

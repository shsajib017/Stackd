export const validateExpense = ({ amount, category, date }) => {
  const errors = {};
  if (!amount || Number(amount) <= 0) errors.amount = 'Amount must be greater than 0';
  if (!category || !String(category).trim()) errors.category = 'Category is required';
  if (!date) errors.date = 'Date is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateIncome = ({ amount, source, date }) => {
  const errors = {};
  if (!amount || Number(amount) <= 0) errors.amount = 'Amount must be greater than 0';
  if (!source || !String(source).trim()) errors.source = 'Income source is required';
  if (!date) errors.date = 'Date is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateSavingsGoal = ({ title, targetAmount }) => {
  const errors = {};
  if (!title || !String(title).trim()) errors.title = 'Goal title is required';
  if (!targetAmount || Number(targetAmount) <= 0) errors.targetAmount = 'Target must be greater than 0';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateSubject = ({ name, examDate }) => {
  const errors = {};
  if (!name || !String(name).trim()) errors.name = 'Subject name is required';
  if (examDate && Number.isNaN(new Date(examDate).getTime())) errors.examDate = 'Invalid exam date';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateMealLog = ({ source, mealType }) => {
  const errors = {};
  if (!source || !String(source).trim()) errors.source = 'Food item is required';
  if (!mealType || !String(mealType).trim()) errors.mealType = 'Meal type is required';
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateManualFood = ({ name, price }) => {
  const errors = {};
  if (!name || !String(name).trim()) errors.name = 'Food name is required';
  if (price !== undefined && (Number.isNaN(Number(price)) || Number(price) < 0)) {
    errors.price = 'Price must be 0 or higher';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

export default {
  validateExpense,
  validateIncome,
  validateSavingsGoal,
  validateSubject,
  validateMealLog,
  validateManualFood,
};

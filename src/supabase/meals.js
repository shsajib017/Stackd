import supabase from './config';

const TABLE = 'meal_logs';

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
};

/**
 * Fetches all meal logs for a specific user and date.
 * @param {string} userId - UUID of the user.
 * @param {string} date - ISO date string (YYYY-MM-DD).
 * @returns {Promise<Array>} List of logged meals.
 */
export const getMealsByDate = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId).eq('date', date)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    throw new Error(`Failed to fetch meals for date: ${err.message}`);
  }
};

/**
 * Fetches all meal logs within a given date range.
 * @param {string} userId - UUID of the user.
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @returns {Promise<Array>} List of meal logs.
 */
export const getMealsByDateRange = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId)
      .gte('date', startDate).lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    throw new Error(`Failed to fetch meals by range: ${err.message}`);
  }
};

/**
 * Logs a standard dorm meal with null price and nutrition.
 * @param {string} userId - UUID of the user.
 * @param {string} date - ISO date string (YYYY-MM-DD).
 * @param {string} mealType - Type of meal (e.g. Breakfast, Lunch, Dinner).
 * @returns {Promise<object>} Created meal log row.
 */
export const logDormMeal = async (userId, date, mealType) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: userId,
        date,
        meal_type: mealType,
        source: 'dorm',
        food_name: 'Dorm Meal',
        price: null,
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to log dorm meal: ${err.message}`);
  }
};

/**
 * Logs food eaten outside with price and optional nutrition.
 * @param {string} userId - UUID of the user.
 * @param {string} date - ISO date string (YYYY-MM-DD).
 * @param {string} mealType - Type of meal.
 * @param {object} foodData - Food metadata and nutrition.
 * @returns {Promise<object>} Created meal log row.
 */
export const logOutsideFood = async (userId, date, mealType, foodData = {}) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: userId,
        date,
        meal_type: mealType,
        source: 'outside',
        food_name: foodData.food_name || 'Outside Food',
        food_id: foodData.food_id || null,
        custom_food_id: foodData.custom_food_id || null,
        price: foodData.price !== undefined ? Number(foodData.price) : 0,
        calories: foodData.calories != null ? Number(foodData.calories) : null,
        protein: foodData.protein != null ? Number(foodData.protein) : null,
        carbs: foodData.carbs != null ? Number(foodData.carbs) : null,
        fat: foodData.fat != null ? Number(foodData.fat) : null,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to log outside food: ${err.message}`);
  }
};

/**
 * Deletes a meal log entry by ID.
 * @param {string} mealLogId - UUID of the meal log row.
 * @returns {Promise<void>}
 */
export const deleteMealLog = async (mealLogId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', mealLogId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete meal log: ${err.message}`);
  }
};

/**
 * Calculates total outside food spend for a given day.
 * @param {string} userId - UUID of the user.
 * @param {string} date - ISO date string (YYYY-MM-DD).
 * @returns {Promise<number>} Total amount in BDT.
 */
export const getDailyFoodSpend = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('price').eq('user_id', userId).eq('date', date).eq('source', 'outside');
    if (error) throw error;
    return (data || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  } catch (err) {
    throw new Error(`Failed to get daily food spend: ${err.message}`);
  }
};

/**
 * Calculates total outside food spend for the current week.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<number>} Total weekly outside spend in BDT.
 */
export const getWeeklyFoodSpend = async (userId) => {
  try {
    const { start, end } = getWeekRange();
    const { data, error } = await supabase
      .from(TABLE).select('price').eq('user_id', userId).eq('source', 'outside')
      .gte('date', start).lte('date', end);
    if (error) throw error;
    return (data || []).reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  } catch (err) {
    throw new Error(`Failed to get weekly food spend: ${err.message}`);
  }
};

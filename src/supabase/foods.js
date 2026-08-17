import supabase from './config';

const TABLE_BD_FOODS = 'bangladeshi_foods';
const TABLE_CUSTOM_FOODS = 'user_custom_foods';

/**
 * Searches the Bangladeshi food database by name with optional category filter.
 * @param {string} [query=''] - Search term.
 * @param {string} [category=''] - Optional category filter.
 * @returns {Promise<Array>} List of matching foods (up to 20).
 */
export const searchBDFoods = async (query = '', category = '') => {
  try {
    let q = supabase.from(TABLE_BD_FOODS).select('*');
    if (query && query.trim()) {
      q = q.ilike('name', `%${query.trim()}%`);
    }
    if (category && category.trim()) {
      q = q.eq('category', category.trim());
    }
    const { data, error } = await q.limit(20);
    if (error) throw error;
    return data || [];
  } catch (err) {
    throw new Error(`Failed to search Bangladeshi foods: ${err.message}`);
  }
};

/**
 * Retrieves distinct category list from the Bangladeshi food catalog.
 * @returns {Promise<Array<string>>} Array of unique category names.
 */
export const getAllFoodCategories = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_BD_FOODS)
      .select('category');
    if (error) throw error;
    const categories = Array.from(
      new Set((data || []).map((item) => item.category).filter(Boolean))
    );
    return categories;
  } catch (err) {
    throw new Error(`Failed to fetch food categories: ${err.message}`);
  }
};

/**
 * Fetches user custom food entries.
 * @param {string} userId - UUID of the user.
 * @returns {Promise<Array>} List of user custom foods.
 */
export const getUserCustomFoods = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_CUSTOM_FOODS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    throw new Error(`Failed to fetch custom foods: ${err.message}`);
  }
};

/**
 * Adds a new user-defined custom food item.
 * @param {string} userId - UUID of the user.
 * @param {{ name: string, avg_price_bdt: number, calories?: number, protein?: number, carbs?: number, fat?: number }} data - Food details.
 * @returns {Promise<object>} Created custom food row.
 */
export const addCustomFood = async (userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE_CUSTOM_FOODS)
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add custom food: ${err.message}`);
  }
};

/**
 * Updates a user-defined custom food item.
 * @param {string} foodId - UUID of the custom food.
 * @param {object} updates - Fields to update.
 * @returns {Promise<object>} Updated custom food row.
 */
export const updateCustomFood = async (foodId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_CUSTOM_FOODS)
      .update(updates)
      .eq('id', foodId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update custom food: ${err.message}`);
  }
};

/**
 * Deletes a user-defined custom food item.
 * @param {string} foodId - UUID of the custom food.
 * @returns {Promise<void>}
 */
export const deleteCustomFood = async (foodId) => {
  try {
    const { error } = await supabase
      .from(TABLE_CUSTOM_FOODS)
      .delete()
      .eq('id', foodId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete custom food: ${err.message}`);
  }
};

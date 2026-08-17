import supabase from './config';

const TABLE = 'savings_goals';

/** @returns {Promise<Array>} All savings goals for the user. */
export const getSavingsGoals = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch savings goals: ${err.message}`);
  }
};

/** @returns {Promise<object>} Newly created savings goal row. */
export const addSavingsGoal = async (userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE).insert({ user_id: userId, ...data }).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add savings goal: ${err.message}`);
  }
};

/** @returns {Promise<object>} Updated savings goal row. */
export const updateSavingsGoal = async (goalId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', goalId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update savings goal: ${err.message}`);
  }
};

/**
 * Increments current_amount by the given amount.
 * Fetches current value first then updates (acceptable for course project scope).
 * @param {string} goalId - Savings goal UUID.
 * @param {number} amount - Amount to add.
 * @returns {Promise<object>} Updated savings goal row.
 */
export const addFundsToGoal = async (goalId, amount) => {
  try {
    const { data: goal, error: fetchError } = await supabase
      .from(TABLE).select('current_amount').eq('id', goalId).single();
    if (fetchError) throw fetchError;
    const newAmount = (Number(goal.current_amount) || 0) + (Number(amount) || 0);
    const { data, error } = await supabase
      .from(TABLE).update({ current_amount: newAmount })
      .eq('id', goalId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to add funds to goal: ${err.message}`);
  }
};

/** @returns {Promise<void>} */
export const deleteSavingsGoal = async (goalId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', goalId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete savings goal: ${err.message}`);
  }
};

import supabase from './config';

/**
 * Fetches a user profile by ID.
 * @param {string} userId - The user's UUID.
 * @returns {Promise<object>} Raw Supabase profile row.
 */
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch profile: ${err.message}`);
  }
};

/**
 * Updates a user profile with the given fields.
 * @param {string} userId - The user's UUID.
 * @param {object} updates - Partial profile fields to update.
 * @returns {Promise<object>} Updated profile row.
 */
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update profile: ${err.message}`);
  }
};

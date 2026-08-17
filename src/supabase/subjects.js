import supabase from './config';

const TABLE = 'subjects';

/** @returns {Promise<Array>} All subjects for the user. */
export const getSubjects = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch subjects: ${err.message}`);
  }
};

/** @returns {Promise<object>} Newly created subject row. */
export const addSubject = async (userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE).insert({ user_id: userId, ...data }).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add subject: ${err.message}`);
  }
};

/** @returns {Promise<object>} Updated subject row. */
export const updateSubject = async (subjectId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', subjectId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update subject: ${err.message}`);
  }
};

/** @returns {Promise<void>} */
export const deleteSubject = async (subjectId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', subjectId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete subject: ${err.message}`);
  }
};

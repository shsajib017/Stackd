import supabase from './config';

const TABLE = 'study_sessions';

const getToday = () => new Date().toISOString().split('T')[0];

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
};

/** @returns {Promise<Array>} Filtered study sessions. */
export const getSessions = async (userId, filters = {}) => {
  try {
    let query = supabase.from(TABLE).select('*').eq('user_id', userId);
    if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
    if (filters.date) query = query.eq('date', filters.date);
    if (filters.completed !== undefined) query = query.eq('completed', filters.completed);
    const { data, error } = await query.order('date', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch sessions: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Sessions within a date range. */
export const getSessionsByDateRange = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId)
      .gte('date', startDate).lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch sessions by range: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Today's sessions ordered by creation. */
export const getTodaySessions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('user_id', userId)
      .eq('date', getToday())
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch today's sessions: ${err.message}`);
  }
};

/** @returns {Promise<object>} Newly created session row. */
export const addSession = async (userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE).insert({ user_id: userId, ...data }).select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add session: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Inserted session rows from batch. */
export const addBatchSessions = async (userId, sessionsArray) => {
  try {
    const rows = sessionsArray.map((s) => ({ user_id: userId, ...s }));
    const { data, error } = await supabase.from(TABLE).insert(rows).select();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to add batch sessions: ${err.message}`);
  }
};

/** @returns {Promise<object>} Updated session row. */
export const updateSession = async (sessionId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', sessionId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update session: ${err.message}`);
  }
};

/** @returns {Promise<object>} Completed session row. */
export const markSessionComplete = async (sessionId, focusRating, notes) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ completed: true, focus_rating: focusRating, notes })
      .eq('id', sessionId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to mark session complete: ${err.message}`);
  }
};

/** @returns {Promise<void>} */
export const deleteSession = async (sessionId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', sessionId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete session: ${err.message}`);
  }
};

/** @returns {Promise<number>} Total completed study minutes this week. */
export const getWeeklyStudyMinutes = async (userId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('duration_minutes')
      .eq('user_id', userId).eq('completed', true)
      .gte('date', getWeekStart()).lte('date', getToday());
    if (error) throw error;
    return (data || []).reduce((sum, row) => sum + (Number(row.duration_minutes) || 0), 0);
  } catch (err) {
    throw new Error(`Failed to get weekly study minutes: ${err.message}`);
  }
};

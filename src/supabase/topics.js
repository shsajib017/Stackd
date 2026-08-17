import supabase from './config';

const TABLE = 'study_topics';

/** @returns {Promise<Array>} All topics for a subject. */
export const getTopics = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('subject_id', subjectId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch topics: ${err.message}`);
  }
};

/** @returns {Promise<object>} Newly created topic row. */
export const addTopic = async (subjectId, userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE).insert({ subject_id: subjectId, user_id: userId, ...data })
      .select().single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add topic: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Inserted topic rows from batch. */
export const addBatchTopics = async (subjectId, userId, topicsArray) => {
  try {
    const rows = topicsArray.map((t) => ({ subject_id: subjectId, user_id: userId, ...t }));
    const { data, error } = await supabase.from(TABLE).insert(rows).select();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to add batch topics: ${err.message}`);
  }
};

/** @returns {Promise<object>} Updated topic row. */
export const updateTopic = async (topicId, updates) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update(updates).eq('id', topicId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update topic: ${err.message}`);
  }
};

/** @returns {Promise<object>} Completed topic row. */
export const markTopicComplete = async (topicId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).update({ completed: true }).eq('id', topicId).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to mark topic complete: ${err.message}`);
  }
};

/** @returns {Promise<void>} */
export const deleteTopic = async (topicId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', topicId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete topic: ${err.message}`);
  }
};

/** @returns {Promise<Array>} Hot topics ordered by frequency desc. */
export const getHotTopics = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE).select('*').eq('subject_id', subjectId)
      .eq('is_hot_topic', true)
      .order('frequency_count', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch hot topics: ${err.message}`);
  }
};

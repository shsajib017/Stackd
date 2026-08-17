import supabase from './config';

const TABLE = 'notes';

/**
 * Fetches all notes for a specific subject ordered by last updated.
 * @param {string} subjectId - UUID of the subject.
 * @returns {Promise<Array>} List of notes.
 */
export const getNotes = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('subject_id', subjectId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch notes: ${err.message}`);
  }
};

/**
 * Fetches a single note by ID.
 * @param {string} noteId - UUID of the note.
 * @returns {Promise<object>} Note record.
 */
export const getNoteById = async (noteId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', noteId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch note: ${err.message}`);
  }
};

/**
 * Adds a new note for a subject.
 * @param {string} subjectId - UUID of the subject.
 * @param {string} userId - UUID of the user.
 * @param {{ title: string, content: string }} data - Note data.
 * @returns {Promise<object>} Created note record.
 */
export const addNote = async (subjectId, userId, data) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({
        subject_id: subjectId,
        user_id: userId,
        ...data,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add note: ${err.message}`);
  }
};

/**
 * Updates note content and title, updating updated_at timestamp.
 * @param {string} noteId - UUID of the note.
 * @param {string} content - Updated markdown content.
 * @param {string} title - Updated note title.
 * @returns {Promise<object>} Updated note record.
 */
export const updateNote = async (noteId, content, title) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({
        content,
        title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to update note: ${err.message}`);
  }
};

/**
 * Deletes a note by ID.
 * @param {string} noteId - UUID of the note.
 * @returns {Promise<void>}
 */
export const deleteNote = async (noteId) => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq('id', noteId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete note: ${err.message}`);
  }
};

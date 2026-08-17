import supabase from './config';

const TABLE = 'study_materials';

/**
 * Fetches all study materials associated with a subject.
 * @param {string} subjectId - UUID of the subject.
 * @returns {Promise<Array>} List of study materials.
 */
export const getMaterials = async (subjectId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to fetch materials: ${err.message}`);
  }
};

/**
 * Adds a new study material record.
 * @param {string} subjectId - UUID of the subject.
 * @param {string} userId - UUID of the user.
 * @param {string} fileName - Original file name.
 * @param {string} fileUrl - Public access URL.
 * @param {string} fileType - MIME type or file extension.
 * @returns {Promise<object>} Created study material row.
 */
export const addMaterial = async (subjectId, userId, fileName, fileUrl, fileType) => {
  try {
    const { data: row, error } = await supabase
      .from(TABLE)
      .insert({
        subject_id: subjectId,
        user_id: userId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  } catch (err) {
    throw new Error(`Failed to add material: ${err.message}`);
  }
};

/**
 * Deletes a study material record by ID.
 * @param {string} materialId - UUID of the study material record.
 * @param {string} [fileUrl] - Optional URL reference for metadata context.
 * @returns {Promise<void>}
 */
export const deleteMaterial = async (materialId, fileUrl) => {
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', materialId);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete material: ${err.message}`);
  }
};

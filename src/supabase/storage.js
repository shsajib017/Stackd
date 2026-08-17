import * as FileSystem from 'expo-file-system';
import supabase from './config';

const BUCKET = 'study-materials';

/**
 * Converts a base64 string to an ArrayBuffer.
 * @param {string} base64 - Base64 encoded string.
 * @returns {ArrayBuffer} Decoded binary buffer.
 */
const base64ToArrayBuffer = (base64) => {
  const binaryString = global.atob ? global.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Uploads a local file to Supabase study-materials storage bucket.
 * @param {string} userId - UUID of the user.
 * @param {string} subjectId - UUID of the subject.
 * @param {string} fileUri - Local device URI of the file.
 * @param {string} fileName - Destination file name.
 * @returns {Promise<string>} Public URL of the uploaded file.
 */
export const uploadFile = async (userId, subjectId, fileUri, fileName) => {
  try {
    const filePath = `${userId}/${subjectId}/${fileName}`;
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileBuffer = base64ToArrayBuffer(base64Data);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, fileBuffer, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

/**
 * Deletes a file from Supabase study-materials storage bucket.
 * @param {string} filePath - Path in the bucket (e.g. userId/subjectId/fileName).
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([filePath]);
    if (error) throw error;
  } catch (err) {
    throw new Error(`Failed to delete file from storage: ${err.message}`);
  }
};

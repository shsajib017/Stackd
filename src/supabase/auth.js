import supabase from './config';

/**
 * Creates a new user with email/password and sets profile metadata.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @param {string} name - Display name.
 * @param {string} university - University name.
 * @returns {Promise<object>} Supabase auth response.
 */
export const signUpWithEmail = async (email, password, name, university) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, university } },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Sign-up failed: ${err.message}`);
  }
};

/**
 * Signs in an existing user with email and password.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<object>} Supabase auth response.
 */
export const loginWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Login failed: ${err.message}`);
  }
};

/**
 * Signs out the current user and clears the session.
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    throw new Error(`Logout failed: ${err.message}`);
  }
};

/**
 * Sends a password reset email to the given address.
 * @param {string} email - User email.
 * @returns {Promise<object>} Supabase response.
 */
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Password reset failed: ${err.message}`);
  }
};

/**
 * Retrieves the current active session.
 * @returns {Promise<object>} Supabase session response.
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(`Failed to get session: ${err.message}`);
  }
};

/**
 * Updates the current user's password.
 * Uses native current_password support (supabase-js v2.102+).
 * @param {string} newPassword - New password (min 6 chars).
 * @param {string} currentPassword - Current password for verification.
 * @returns {Promise<object>} Supabase user response.
 */
export const updateUserPassword = async (newPassword, currentPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Failed to update password');
  }
};

/**
 * Subscribes to auth state changes (login, logout, token refresh).
 * @param {Function} callback - Called with (event, session).
 * @returns {Function} Unsubscribe function.
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription.unsubscribe;
};


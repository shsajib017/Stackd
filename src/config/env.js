import Constants from 'expo-constants';

/**
 * Environment configuration loader.
 * Safely accesses extra configurations passed via app.json or environment variables.
 */
const extra = Constants.expoConfig?.extra || {};
const rawSupabaseUrl = extra.supabaseUrl || process.env.SUPABASE_URL || '';
export const SUPABASE_URL = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const SUPABASE_ANON_KEY = extra.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || '';
export const GEMINI_API_KEY = extra.geminiApiKey || process.env.GEMINI_API_KEY || '';

export default {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  GEMINI_API_KEY,
};


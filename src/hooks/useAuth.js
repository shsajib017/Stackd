import { useCallback, useEffect } from 'react';
import {
  getCurrentSession,
  loginWithEmail,
  logout as supabaseLogout,
  onAuthStateChange,
  resetPassword as supabaseResetPassword,
  signUpWithEmail,
} from '../supabase/auth';
import { getProfile } from '../supabase/profiles';
import useAuthStore from '../store/useAuthStore';

/**
 * Authentication and active session management hook.
 * @returns {object} Auth state and action handlers.
 */
export const useAuth = () => {
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    setUser,
    setProfile,
    setLoading,
    clearAuth,
  } = useAuthStore();

  const fetchProfile = useCallback(async (userId) => {
    try {
      const data = await getProfile(userId);
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, [setProfile]);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        setLoading(true);
        const sessionData = await getCurrentSession();
        if (isMounted) {
          const currentUser = sessionData?.session?.user || null;
          setUser(currentUser);
          if (currentUser) await fetchProfile(currentUser.id);
        }
      } catch {
        if (isMounted) clearAuth();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    const unsubscribe = onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        clearAuth();
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [clearAuth, fetchProfile, setLoading, setUser]);

  const signUp = useCallback(async (email, password, name, university) => {
    try {
      setLoading(true);
      const data = await signUpWithEmail(email, password, name, university);
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return data;
    } catch (err) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, setLoading, setUser]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const data = await loginWithEmail(email, password);
      if (data?.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return data;
    } catch (err) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, setLoading, setUser]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await supabaseLogout();
      clearAuth();
    } catch (err) {
      throw new Error(err.message);
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading]);

  const resetPassword = useCallback(async (email) => {
    try {
      return await supabaseResetPassword(email);
    } catch (err) {
      throw new Error(err.message);
    }
  }, []);

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    signUp,
    login,
    logout,
    resetPassword,
  };
};

export default useAuth;

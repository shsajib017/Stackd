import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Authentication and active profile state store.
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () =>
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearOtherAuthTokens, resetOtherAuthStores } from '../utils/authUtils';

/**
 * Auth Store
 * Manages authentication state using Zustand
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },

      login: (user, token) => {
        // Clear other auth types to prevent conflicts
        clearOtherAuthTokens('customer');

        // Reset other Zustand stores to prevent persist data issues
        resetOtherAuthStores('customer');

        set({
          user,
          token,
          isAuthenticated: true,
        });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        const updatedUser = { ...currentUser, ...userData };
        set({ user: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

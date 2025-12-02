import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearOtherAuthTokens, resetOtherAuthStores } from '../utils/authUtils';

/**
 * Admin Auth Store
 * Manages admin authentication state separately from customer/operator auth
 */
const useAdminAuthStore = create(
  persist(
    (set, get) => ({
      // State
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAdmin: (admin) => set({ admin, isAuthenticated: !!admin }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('admin-token', token);
        } else {
          localStorage.removeItem('admin-token');
        }
        set({ token });
      },

      login: (admin, token) => {
        // Clear other auth types to prevent conflicts
        clearOtherAuthTokens('admin');

        // Reset other Zustand stores to prevent persist data issues
        resetOtherAuthStores('admin');

        set({
          admin,
          token,
          isAuthenticated: true,
        });
        localStorage.setItem('admin-token', token);
        localStorage.setItem('admin', JSON.stringify(admin));
      },

      logout: () => {
        set({
          admin: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin-auth-storage');
      },

      updateAdmin: (adminData) => {
        const currentAdmin = get().admin;
        const updatedAdmin = { ...currentAdmin, ...adminData };
        set({ admin: updatedAdmin });
        localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'admin-auth-storage', // Separate localStorage key for admin
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAdminAuthStore;

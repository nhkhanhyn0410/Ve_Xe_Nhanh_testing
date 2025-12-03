import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resetOtherAuthStores } from '../utils/authUtils';

/**
 * Trip Manager Auth Store
 * Manages trip manager authentication state separately from other user types
 */
const useTripManagerAuthStore = create(
  persist(
    (set, get) => ({
      // State
      tripManager: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setTripManager: (tripManager) => set({ tripManager, isAuthenticated: !!tripManager }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('tripmanager-token', token);
        } else {
          localStorage.removeItem('tripmanager-token');
        }
        set({ token });
      },

      login: (tripManager, token) => {
        // Reset other Zustand stores to prevent persist data issues
        // (this also clears other localStorage tokens internally)
        resetOtherAuthStores('trip-manager');

        set({
          tripManager,
          token,
          isAuthenticated: true,
        });
        localStorage.setItem('tripmanager-token', token);
        localStorage.setItem('tripManager', JSON.stringify(tripManager));
      },

      logout: () => {
        set({
          tripManager: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('tripmanager-token');
        localStorage.removeItem('tripManager');
      },

      updateTripManager: (tripManagerData) => {
        const currentTripManager = get().tripManager;
        const updatedTripManager = { ...currentTripManager, ...tripManagerData };
        set({ tripManager: updatedTripManager });
        localStorage.setItem('tripManager', JSON.stringify(updatedTripManager));
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'tripmanager-auth-storage', // Separate localStorage key for trip manager
      partialize: (state) => ({
        tripManager: state.tripManager,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useTripManagerAuthStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Active Trip Store
 * Manages the currently active trip that trip manager is working on
 */
const useActiveTripStore = create(
  persist(
    (set, get) => ({
      // State
      activeTrip: null, // Current trip being managed
      isWorking: false, // Is trip manager currently working on a trip?

      /**
       * Start working on a trip
       * @param {Object} trip - Trip object
       */
      startTrip: (trip) => {
        set({
          activeTrip: trip,
          isWorking: true,
        });
        localStorage.setItem('activeTrip', JSON.stringify(trip));
        localStorage.setItem('isWorking', 'true');
      },

      /**
       * Update active trip data
       * @param {Object} tripData - Updated trip data
       */
      updateTrip: (tripData) => {
        const currentTrip = get().activeTrip;
        const updatedTrip = { ...currentTrip, ...tripData };
        set({
          activeTrip: updatedTrip,
        });
        localStorage.setItem('activeTrip', JSON.stringify(updatedTrip));
      },

      /**
       * Complete the active trip
       * Clears active trip state
       */
      completeTrip: () => {
        set({
          activeTrip: null,
          isWorking: false,
        });
        localStorage.removeItem('activeTrip');
        localStorage.removeItem('isWorking');
      },

      /**
       * Cancel the active trip
       * Clears active trip state
       */
      cancelTrip: () => {
        set({
          activeTrip: null,
          isWorking: false,
        });
        localStorage.removeItem('activeTrip');
        localStorage.removeItem('isWorking');
      },

      /**
       * Check if there is an active trip
       * @returns {boolean}
       */
      hasActiveTrip: () => {
        return get().isWorking && get().activeTrip !== null;
      },

      /**
       * Get active trip ID
       * @returns {string|null}
       */
      getActiveTripId: () => {
        return get().activeTrip?._id || null;
      },

      /**
       * Clear active trip (force clear - for logout, etc.)
       */
      clearActiveTrip: () => {
        set({
          activeTrip: null,
          isWorking: false,
        });
        localStorage.removeItem('activeTrip');
        localStorage.removeItem('isWorking');
      },
    }),
    {
      name: 'active-trip-storage', // unique name for localStorage key
      partialize: (state) => ({
        activeTrip: state.activeTrip,
        isWorking: state.isWorking,
      }),
    }
  )
);

export default useActiveTripStore;

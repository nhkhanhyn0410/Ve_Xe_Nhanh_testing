import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { resetOtherAuthStores } from '../utils/authUtils';


/**
 * Operator Auth Store
 * Manages operator authentication state separately from customer auth
 */
const useOperatorAuthStore = create(
  persist(
    (set, get) => ({
      // State
      operator: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setOperator: (operator) => set({ operator, isAuthenticated: !!operator }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('operator-token', token);
        } else {
          localStorage.removeItem('operator-token');
        }
        set({ token });
      },

      login: (operator, token) => {
        // Reset other Zustand stores to prevent persist data issues
        // (this also clears other localStorage tokens internally)
        resetOtherAuthStores('operator');

        set({
          operator,
          token,
          isAuthenticated: true,
        });
        localStorage.setItem('operator-token', token);
        localStorage.setItem('operator', JSON.stringify(operator));
      },

      logout: () => {
        set({
          operator: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('operator-token');
        localStorage.removeItem('operator');
      },

      updateOperator: (operatorData) => {
        const currentOperator = get().operator;
        const updatedOperator = { ...currentOperator, ...operatorData };
        set({ operator: updatedOperator });
        localStorage.setItem('operator', JSON.stringify(updatedOperator));
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'operator-auth-storage', // Separate localStorage key
      partialize: (state) => ({
        operator: state.operator,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useOperatorAuthStore;

/**
 * Authentication Utilities
 * Handles cross-store token management to prevent multiple tokens
 */

/**
 * Clear all authentication tokens and data from localStorage
 * This ensures only one user type is authenticated at a time
 */
export const clearAllAuthTokens = () => {
  // Customer auth
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('guest-token');

  // Admin auth
  localStorage.removeItem('admin-token');
  localStorage.removeItem('admin');
  localStorage.removeItem('admin-auth-storage');

  // Operator auth
  localStorage.removeItem('operator-token');
  localStorage.removeItem('operator');
  localStorage.removeItem('operator-auth-storage');

  // Trip Manager auth
  localStorage.removeItem('trip-manager-token');
  localStorage.removeItem('trip-manager');
  localStorage.removeItem('trip-manager-auth-storage');
};

/**
 * Clear all auth tokens except for the specified type
 * @param {string} keepType - The auth type to keep ('customer', 'admin', 'operator', 'trip-manager')
 */
export const clearOtherAuthTokens = (keepType) => {
  if (keepType !== 'customer') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('guest-token');
  }

  if (keepType !== 'admin') {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin');
    localStorage.removeItem('admin-auth-storage');
  }

  if (keepType !== 'operator') {
    localStorage.removeItem('operator-token');
    localStorage.removeItem('operator');
    localStorage.removeItem('operator-auth-storage');
  }

  if (keepType !== 'trip-manager') {
    localStorage.removeItem('trip-manager-token');
    localStorage.removeItem('trip-manager');
    localStorage.removeItem('trip-manager-auth-storage');
  }
};

/**
 * Get the currently active auth type based on available tokens
 * @returns {string|null} The active auth type or null if none
 */
export const getActiveAuthType = () => {
  if (localStorage.getItem('admin-token') || localStorage.getItem('admin-auth-storage')) {
    return 'admin';
  }
  if (localStorage.getItem('operator-token') || localStorage.getItem('operator-auth-storage')) {
    return 'operator';
  }
  if (localStorage.getItem('trip-manager-token') || localStorage.getItem('trip-manager-auth-storage')) {
    return 'trip-manager';
  }
  if (localStorage.getItem('token') || localStorage.getItem('auth-storage')) {
    return 'customer';
  }
  return null;
};

/**
 * Check if there are multiple auth tokens present (indicates a problem)
 * @returns {boolean} True if multiple tokens are found
 */
export const hasMultipleAuthTokens = () => {
  const authTypes = [];
  
  if (localStorage.getItem('admin-token') || localStorage.getItem('admin-auth-storage')) {
    authTypes.push('admin');
  }
  if (localStorage.getItem('operator-token') || localStorage.getItem('operator-auth-storage')) {
    authTypes.push('operator');
  }
  if (localStorage.getItem('trip-manager-token') || localStorage.getItem('trip-manager-auth-storage')) {
    authTypes.push('trip-manager');
  }
  if (localStorage.getItem('token') || localStorage.getItem('auth-storage')) {
    authTypes.push('customer');
  }

  return authTypes.length > 1;
};
/**

 * Debug function to log all current auth tokens
 * Useful for debugging multiple token issues
 */
export const debugAuthTokens = () => {
  console.group('🔍 Auth Tokens Debug');
  
  const tokens = {
    customer: localStorage.getItem('token'),
    admin: localStorage.getItem('admin-token'),
    operator: localStorage.getItem('operator-token'),
    tripManager: localStorage.getItem('trip-manager-token'),
    guest: localStorage.getItem('guest-token')
  };

  const stores = {
    customer: localStorage.getItem('auth-storage'),
    admin: localStorage.getItem('admin-auth-storage'),
    operator: localStorage.getItem('operator-auth-storage'),
    tripManager: localStorage.getItem('trip-manager-auth-storage')
  };

  console.log('Direct Tokens:', tokens);
  console.log('Zustand Stores:', stores);
  
  const activeTokens = Object.entries(tokens).filter(([_, token]) => token);
  const activeStores = Object.entries(stores).filter(([_, store]) => store);
  
  console.log(`Active Tokens: ${activeTokens.length}`, activeTokens);
  console.log(`Active Stores: ${activeStores.length}`, activeStores);
  
  if (activeTokens.length > 1) {
    console.warn('⚠️ MULTIPLE TOKENS DETECTED! This will cause authentication issues.');
  }
  
  console.groupEnd();
  
  return {
    tokens,
    stores,
    hasMultiple: activeTokens.length > 1,
    activeType: getActiveAuthType()
  };
};
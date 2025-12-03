import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Determine which auth storage to use based on the request URL or current path
    let storageKey = null;
    let tokenKey = null;
    const currentPath = window.location.pathname;

    // Priority order: URL-based detection first, then path-based
    if (config.url?.includes('/admin/')) {
      storageKey = 'admin-auth-storage';
      tokenKey = 'admin-token';
    } else if (config.url?.includes('/operators/')) {
      storageKey = 'operator-auth-storage';
      tokenKey = 'operator-token';
    } else if (config.url?.includes('/trip-manager/') ||
      (config.url?.includes('/employees/') && currentPath.startsWith('/trip-manager'))) {
      storageKey = 'tripmanager-auth-storage';
      tokenKey = 'tripmanager-token';
    } else if (currentPath.startsWith('/admin')) {
      storageKey = 'admin-auth-storage';
      tokenKey = 'admin-token';
    } else if (currentPath.startsWith('/operator')) {
      storageKey = 'operator-auth-storage';
      tokenKey = 'operator-token';
    } else if (currentPath.startsWith('/trip-manager')) {
      storageKey = 'tripmanager-auth-storage';
      tokenKey = 'tripmanager-token';
    } else {
      // Default to customer auth
      storageKey = 'auth-storage';
      tokenKey = 'token';
    }

    // Get token from appropriate storage - try Zustand persist storage first
    let token = null;

    // Try Zustand persist storage
    const authData = localStorage.getItem(storageKey);
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          token = state.token;
        }
      } catch (error) {
        console.error(`Error parsing ${storageKey}:`, error);
      }
    }

    // Fallback to direct token storage
    if (!token && tokenKey) {
      token = localStorage.getItem(tokenKey);
    }

    // Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get guest session token if available (only for customer routes and no auth token)
    const guestToken = localStorage.getItem('guest-token');
    if (guestToken && !token && storageKey === 'auth-storage') {
      config.headers['x-guest-token'] = guestToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Check if this is a login/register request - don't redirect
        const isAuthRequest = error.config.url?.includes('/login') ||
          error.config.url?.includes('/register');

        if (!isAuthRequest) {
          // Determine which auth storage to clear based on the request URL
          const currentPath = window.location.pathname;

          if (error.config.url?.includes('/operators/') || currentPath.startsWith('/operator')) {
            // Clear operator auth
            localStorage.removeItem('operator-token');
            localStorage.removeItem('operator');
            localStorage.removeItem('operator-auth-storage');
            window.location.href = '/operator/login';
          } else if (error.config.url?.includes('/admin/') || currentPath.startsWith('/admin')) {
            // Clear admin auth
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin');
            localStorage.removeItem('admin-auth-storage');
            window.location.href = '/admin/login';
          } else if (error.config.url?.includes('/trip-manager/') || currentPath.startsWith('/trip-manager')) {
            // Clear trip manager auth
            localStorage.removeItem('trip-manager-token');
            localStorage.removeItem('trip-manager');
            localStorage.removeItem('trip-manager-auth-storage');
            window.location.href = '/trip-manager/login';
          } else {
            // Clear customer auth
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth-storage');
            localStorage.removeItem('guest-token');
            window.location.href = '/login';
          }
        }
      }

      // Return error message from server
      return Promise.reject(data.message || 'Đã có lỗi xảy ra');
    } else if (error.request) {
      // Request made but no response
      return Promise.reject('Không thể kết nối đến server');
    } else {
      // Something else happened
      return Promise.reject(error.message);
    }
  }
);

export default api;

// Export common API methods
export const apiMethods = {
  get: (url, config) => api.get(url, config),
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  patch: (url, data, config) => api.patch(url, data, config),
  delete: (url, config) => api.delete(url, config),
};

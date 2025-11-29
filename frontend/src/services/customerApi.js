import api from './api';

/**
 * Customer Authentication API Service
 * Handles customer registration, login, and account management
 */

// Register new customer
export const register = async (userData) => {
  return api.post('/auth/register', userData);
};

// Login customer
export const login = async (credentials) => {
  return api.post('/auth/login', credentials);
};

// Logout customer
export const logout = async () => {
  return api.post('/auth/logout');
};

// Get current user profile
export const getProfile = async () => {
  return api.get('/auth/me');
};

// Refresh token
export const refreshToken = async (refreshToken) => {
  return api.post('/auth/refresh-token', { refreshToken });
};

// Forgot password
export const forgotPassword = async (email) => {
  return api.post('/auth/forgot-password', { email });
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  return api.post('/auth/reset-password', { token, newPassword });
};

// Verify email
export const verifyEmail = async (token) => {
  return api.get(`/auth/verify-email/${token}`);
};

// Send phone OTP
export const sendPhoneOTP = async (phoneNumber) => {
  return api.post('/auth/send-phone-otp', { phoneNumber });
};

// Verify phone
export const verifyPhone = async (phoneNumber, otp) => {
  return api.post('/auth/verify-phone', { phoneNumber, otp });
};

// Google OAuth
export const googleOAuth = async (googleToken) => {
  return api.post('/auth/google', { token: googleToken });
};

// Facebook OAuth
export const facebookOAuth = async (facebookToken) => {
  return api.post('/auth/facebook', { token: facebookToken });
};

export default {
  register,
  login,
  logout,
  getProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendPhoneOTP,
  verifyPhone,
  googleOAuth,
  facebookOAuth,
};

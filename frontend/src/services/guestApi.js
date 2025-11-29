import api from './api';

/**
 * Guest API Service
 * Handles guest booking with OTP verification
 */

// Request OTP for guest booking
export const requestOTP = async (identifier, type) => {
  return api.post('/guest/request-otp', { identifier, type });
};

// Verify OTP and create guest session
export const verifyOTP = async (identifier, otp, type, name) => {
  return api.post('/guest/verify-otp', { identifier, otp, type, name });
};

// Get guest session info
export const getGuestSession = async (sessionToken) => {
  return api.get('/guest/session', {
    headers: {
      'x-guest-token': sessionToken,
    },
  });
};

// Extend guest session
export const extendGuestSession = async (sessionToken) => {
  return api.post(
    '/guest/extend-session',
    {},
    {
      headers: {
        'x-guest-token': sessionToken,
      },
    }
  );
};

// Update guest session data
export const updateGuestSession = async (sessionToken, data) => {
  return api.put('/guest/session', data, {
    headers: {
      'x-guest-token': sessionToken,
    },
  });
};

// Delete guest session (logout)
export const deleteGuestSession = async (sessionToken) => {
  return api.delete('/guest/session', {
    headers: {
      'x-guest-token': sessionToken,
    },
  });
};

// Check OTP status
export const checkOTPStatus = async (identifier) => {
  return api.get(`/guest/otp-status/${identifier}`);
};

export default {
  requestOTP,
  verifyOTP,
  getGuestSession,
  extendGuestSession,
  updateGuestSession,
  deleteGuestSession,
  checkOTPStatus,
};

import api from './api';

/**
 * Ticket API Service
 * Handles all ticket-related API calls
 */

// ============================================================================
// Customer Ticket Management (UC-8)
// ============================================================================

/**
 * Get customer tickets with filtering
 * @param {Object} params - Query parameters
 * @param {string} params.type - Filter by type: 'upcoming' | 'past' | 'cancelled'
 * @param {string} params.status - Filter by status: 'valid' | 'used' | 'cancelled' | 'expired'
 * @param {string} params.search - Search by ticket/booking code
 * @param {string} params.fromDate - Start date for filtering
 * @param {string} params.toDate - End date for filtering
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 */
export const getCustomerTickets = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/users/tickets${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get ticket details by ID
 * @param {string} ticketId - Ticket ID
 */
export const getTicketById = async (ticketId) => {
  return api.get(`/users/tickets/${ticketId}`);
};

/**
 * Download ticket PDF
 * @param {string} ticketId - Ticket ID
 */
export const downloadTicket = async (ticketId) => {
  return api.get(`/users/tickets/${ticketId}/download`, {
    responseType: 'blob',
  });
};

/**
 * Resend ticket notifications (email/SMS)
 * @param {string} ticketId - Ticket ID
 */
export const resendTicket = async (ticketId) => {
  return api.post(`/users/tickets/${ticketId}/resend`);
};

/**
 * Cancel ticket (UC-9)
 * @param {string} ticketId - Ticket ID
 * @param {string} reason - Cancellation reason (optional)
 */
export const cancelTicket = async (ticketId, reason = '') => {
  return api.post(`/users/tickets/${ticketId}/cancel`, { reason });
};

/**
 * Change/Exchange ticket (UC-10)
 * @param {string} ticketId - Current ticket ID
 * @param {Object} changeData - Change ticket data
 * @param {string} changeData.newTripId - New trip ID
 * @param {Array} changeData.seats - Selected seats
 * @param {string} changeData.reason - Reason for change (optional)
 */
export const changeTicket = async (ticketId, changeData) => {
  return api.post(`/tickets/${ticketId}/change`, changeData);
};

// ============================================================================
// Guest Ticket Lookup (UC-27)
// ============================================================================

/**
 * Request OTP for ticket lookup
 * @param {Object} lookupData - Lookup data
 * @param {string} lookupData.ticketCode - Ticket code
 * @param {string} lookupData.phone - Phone number
 */
export const requestTicketLookupOTP = async (lookupData) => {
  return api.post('/tickets/lookup/request-otp', lookupData);
};

/**
 * Verify OTP and get ticket
 * @param {Object} verifyData - Verification data
 * @param {string} verifyData.ticketCode - Ticket code
 * @param {string} verifyData.phone - Phone number
 * @param {string} verifyData.otp - OTP code
 */
export const verifyTicketLookupOTP = async (verifyData) => {
  return api.post('/tickets/lookup/verify-otp', verifyData);
};

/**
 * Legacy lookup without OTP (for backward compatibility)
 * @param {Object} lookupData - Lookup data
 * @param {string} lookupData.ticketCode - Ticket code
 * @param {string} lookupData.phone - Phone number
 */
export const lookupTicket = async (lookupData) => {
  return api.post('/tickets/lookup', lookupData);
};

// ============================================================================
// Trip Manager - Ticket Verification (UC-19, UC-20)
// ============================================================================

/**
 * Get trip passengers
 * @param {string} tripId - Trip ID
 */
export const getTripPassengers = async (tripId) => {
  return api.get(`/tickets/trip/${tripId}/passengers`);
};

/**
 * Verify ticket QR code
 * @param {string} tripId - Trip ID
 * @param {string} qrCodeData - QR code data (encrypted)
 */
export const verifyTicketQR = async (tripId, qrCodeData) => {
  return api.post(`/tickets/trip/${tripId}/verify`, { qrCodeData });
};

/**
 * Update trip status (UC-21)
 * @param {string} tripId - Trip ID
 * @param {string} status - New status: 'not_started' | 'ongoing' | 'completed'
 */
export const updateTripStatus = async (tripId, status) => {
  return api.put(`/trips/${tripId}/status`, { status });
};

// ============================================================================
// Default Export
// ============================================================================

export default {
  // Customer tickets
  getCustomerTickets,
  getTicketById,
  downloadTicket,
  resendTicket,
  cancelTicket,
  changeTicket,

  // Guest lookup
  requestTicketLookupOTP,
  verifyTicketLookupOTP,
  lookupTicket,

  // Trip manager
  getTripPassengers,
  verifyTicketQR,
  updateTripStatus,
};

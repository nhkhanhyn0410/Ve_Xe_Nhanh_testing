import api from './api';

/**
 * Trip Manager API Service
 * API calls for trip managers and drivers
 * Now uses axios api instance instead of fetch for better error handling
 */

export const tripManagerApi = {
  /**
   * Login as trip manager
   * @param {Object} credentials - { username, password }
   * @returns {Promise}
   */
  login: (credentials) =>
    api.post('/trip-manager/login', credentials),

  /**
   * Get current trip manager info
   * @returns {Promise}
   */
  getMe: () =>
    api.get('/trip-manager/me'),

  /**
   * Get assigned trips
   * @param {Object} params - { status, date }
   * @returns {Promise}
   */
  getAssignedTrips: (params = {}) =>
    api.get('/trip-manager/trips', { params }),

  /**
   * Get trip details with passengers
   * @param {string} tripId - Trip ID
   * @returns {Promise}
   */
  getTripDetails: (tripId) =>
    api.get(`/trip-manager/trips/${tripId}`),

  /**
   * Get trip passengers
   * @param {string} tripId - Trip ID
   * @returns {Promise}
   */
  getTripPassengers: (tripId) =>
    api.get(`/trip-manager/trips/${tripId}/passengers`),

  /**
   * Update trip status (UC-21)
   * @param {string} tripId - Trip ID
   * @param {Object} data - { status, reason }
   * @returns {Promise}
   */
  updateTripStatus: (tripId, data) =>
    api.put(`/trip-manager/trips/${tripId}/status`, data),

  /**
   * Start trip (legacy - use updateTripStatus instead)
   * @param {string} tripId - Trip ID
   * @returns {Promise}
   */
  startTrip: (tripId) =>
    api.post(`/trip-manager/trips/${tripId}/start`),

  /**
   * Complete trip (legacy - use updateTripStatus instead)
   * @param {string} tripId - Trip ID
   * @returns {Promise}
   */
  completeTrip: (tripId) =>
    api.post(`/trip-manager/trips/${tripId}/complete`),

  /**
   * Verify ticket QR code
   * @param {string} tripId - Trip ID
   * @param {Object} data - { qrCodeData }
   * @returns {Promise}
   */
  verifyTicketQR: (tripId, data) =>
    api.post(`/trip-manager/trips/${tripId}/verify-ticket`, data),

  /**
   * Get journey details with stops and status history
   * @param {string} tripId - Trip ID
   * @returns {Promise}
   */
  getJourneyDetails: (tripId) =>
    api.get(`/trip-manager/trips/${tripId}/journey`),

  /**
   * Update journey status
   * @param {string} tripId - Trip ID
   * @param {Object} data - { status, stopIndex, location, notes }
   * @returns {Promise}
   */
  updateJourneyStatus: (tripId, data) =>
    api.put(`/trip-manager/trips/${tripId}/journey/status`, data),
};

export default tripManagerApi;

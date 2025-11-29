import api from './api';

/**
 * Voucher API Service
 * API calls for voucher management
 */

export const voucherApi = {
  /**
   * Get all vouchers for operator
   * @param {Object} params - { page, limit, isActive, search }
   * @returns {Promise}
   */
  getOperatorVouchers: (params = {}) => api.get('/operators/vouchers', { params }),

  /**
   * Get voucher statistics
   * @returns {Promise}
   */
  getStatistics: () => api.get('/operators/vouchers/statistics'),

  /**
   * Get single voucher by ID
   * @param {string} id - Voucher ID
   * @returns {Promise}
   */
  getById: (id) => api.get(`/operators/vouchers/${id}`),

  /**
   * Get voucher usage report
   * @param {string} id - Voucher ID
   * @returns {Promise}
   */
  getUsageReport: (id) => api.get(`/operators/vouchers/${id}/usage-report`),

  /**
   * Create new voucher
   * @param {Object} data - Voucher data
   * @returns {Promise}
   */
  create: (data) => api.post('/operators/vouchers', data),

  /**
   * Update voucher
   * @param {string} id - Voucher ID
   * @param {Object} data - Updated data
   * @returns {Promise}
   */
  update: (id, data) => api.put(`/operators/vouchers/${id}`, data),

  /**
   * Delete voucher
   * @param {string} id - Voucher ID
   * @returns {Promise}
   */
  delete: (id) => api.delete(`/operators/vouchers/${id}`),

  /**
   * Activate voucher
   * @param {string} id - Voucher ID
   * @returns {Promise}
   */
  activate: (id) => api.put(`/operators/vouchers/${id}/activate`),

  /**
   * Deactivate voucher
   * @param {string} id - Voucher ID
   * @returns {Promise}
   */
  deactivate: (id) => api.put(`/operators/vouchers/${id}/deactivate`),
};

export default voucherApi;

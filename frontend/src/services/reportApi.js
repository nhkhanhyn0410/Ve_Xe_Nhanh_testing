import api from './api';

/**
 * Report API Service
 * API calls for revenue reports and analytics
 */

export const reportsApi = {
  /**
   * Get comprehensive revenue report
   * @param {Object} params - { startDate, endDate, routeId, format }
   * @returns {Promise}
   */
  getRevenueReport: (params = {}) => api.get('/operators/reports/revenue', { params }),

  /**
   * Get revenue summary (lightweight)
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise}
   */
  getRevenueSummary: (params = {}) => api.get('/operators/reports/revenue/summary', { params }),

  /**
   * Get revenue breakdown by route
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise}
   */
  getRevenueByRoute: (params = {}) => api.get('/operators/reports/revenue/by-route', { params }),

  /**
   * Get revenue trend (daily breakdown)
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise}
   */
  getRevenueTrend: (params = {}) => api.get('/operators/reports/revenue/trend', { params }),

  /**
   * Get cancellation report
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise}
   */
  getCancellationReport: (params = {}) => api.get('/operators/reports/cancellation', { params }),

  /**
   * Get growth metrics
   * @param {Object} params - { startDate, endDate }
   * @returns {Promise}
   */
  getGrowthMetrics: (params = {}) => api.get('/operators/reports/growth', { params }),

  /**
   * Export revenue report to Excel
   * @param {Object} params - { startDate, endDate, routeId }
   * @returns {Promise<Blob>}
   */
  exportToExcel: async (params = {}) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/operators/reports/revenue?${new URLSearchParams({ ...params, format: 'excel' })}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export to Excel');
    }

    return response.blob();
  },

  /**
   * Export revenue report to PDF
   * @param {Object} params - { startDate, endDate, routeId }
   * @returns {Promise<Blob>}
   */
  exportToPDF: async (params = {}) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/operators/reports/revenue?${new URLSearchParams({ ...params, format: 'pdf' })}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export to PDF');
    }

    return response.blob();
  },
};

/**
 * Helper function to download file from blob
 * @param {Blob} blob - File blob
 * @param {string} filename - File name
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export default reportsApi;

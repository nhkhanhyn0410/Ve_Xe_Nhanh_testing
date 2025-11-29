import api from './api';

/**
 * Complaint API Service
 * Handles all complaint-related API calls for customers
 */

// ============================================================================
// Customer Complaint Management
// ============================================================================

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data
 * @param {string} complaintData.subject - Subject (required, max 200 chars)
 * @param {string} complaintData.description - Description (required)
 * @param {string} complaintData.category - Category: booking, payment, service, driver, vehicle, refund, technical, other (required)
 * @param {string} complaintData.priority - Priority: low, medium, high, urgent (optional, default: medium)
 * @param {string} complaintData.bookingId - Related booking ID (optional)
 * @param {string} complaintData.operatorId - Related operator ID (optional)
 * @param {string} complaintData.tripId - Related trip ID (optional)
 * @param {Array<Object>} complaintData.attachments - Attachments (optional)
 */
export const createComplaint = async (complaintData) => {
  return api.post('/complaints', complaintData);
};

/**
 * Get my complaints
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (optional)
 * @param {string} params.category - Filter by category (optional)
 * @param {number} params.page - Page number (optional, default: 1)
 * @param {number} params.limit - Items per page (optional, default: 10)
 * @param {string} params.sort - Sort order (optional, default: -createdAt)
 */
export const getMyComplaints = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/complaints${queryString ? `?${queryString}` : ''}`);
};

/**
 * Get complaint details by ID
 * @param {string} complaintId - Complaint ID
 */
export const getComplaintById = async (complaintId) => {
  return api.get(`/complaints/${complaintId}`);
};

/**
 * Add note to complaint
 * @param {string} complaintId - Complaint ID
 * @param {Object} noteData - Note data
 * @param {string} noteData.content - Note content (required)
 */
export const addNote = async (complaintId, noteData) => {
  return api.post(`/complaints/${complaintId}/notes`, noteData);
};

/**
 * Add satisfaction rating to resolved complaint
 * @param {string} complaintId - Complaint ID
 * @param {Object} ratingData - Rating data
 * @param {number} ratingData.rating - Rating 1-5 (required)
 * @param {string} ratingData.feedback - Feedback text (optional)
 */
export const addSatisfactionRating = async (complaintId, ratingData) => {
  return api.put(`/complaints/${complaintId}/satisfaction`, ratingData);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Vietnamese label for complaint category
 * @param {string} category - Category key
 * @returns {string} Vietnamese label
 */
export const getCategoryLabel = (category) => {
  const labels = {
    booking: 'Đặt vé',
    payment: 'Thanh toán',
    service: 'Dịch vụ',
    driver: 'Tài xế',
    vehicle: 'Xe',
    refund: 'Hoàn tiền',
    technical: 'Kỹ thuật',
    other: 'Khác',
  };
  return labels[category] || category;
};

/**
 * Get Vietnamese label for complaint status
 * @param {string} status - Status key
 * @returns {string} Vietnamese label
 */
export const getStatusLabel = (status) => {
  const labels = {
    open: 'Mới tạo',
    in_progress: 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng',
    rejected: 'Bị từ chối',
  };
  return labels[status] || status;
};

/**
 * Get Vietnamese label for priority
 * @param {string} priority - Priority key
 * @returns {string} Vietnamese label
 */
export const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
  };
  return labels[priority] || priority;
};

/**
 * Get color for status tag
 * @param {string} status - Status key
 * @returns {string} Ant Design color
 */
export const getStatusColor = (status) => {
  const colors = {
    open: 'blue',
    in_progress: 'orange',
    resolved: 'green',
    closed: 'default',
    rejected: 'red',
  };
  return colors[status] || 'default';
};

/**
 * Get color for priority tag
 * @param {string} priority - Priority key
 * @returns {string} Ant Design color
 */
export const getPriorityColor = (priority) => {
  const colors = {
    low: 'default',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  };
  return colors[priority] || 'default';
};

// ============================================================================
// Export all methods
// ============================================================================

export default {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  addNote,
  addSatisfactionRating,
  getCategoryLabel,
  getStatusLabel,
  getPriorityLabel,
  getStatusColor,
  getPriorityColor,
};

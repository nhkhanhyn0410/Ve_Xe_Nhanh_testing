import api from './api';

/**
 * Admin API Service
 * Handles all admin-related API calls
 */

// ============= AUTHENTICATION =============

export const adminAuth = {
  /**
   * Admin login
   * POST /api/v1/auth/login
   * Uses the same endpoint as other users, backend checks role
   */
  login: async (credentials) => {
    // Convert email to identifier for backend
    const loginData = {
      identifier: credentials.email,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false,
    };
    return await api.post('/auth/login', loginData);
  },

  /**
   * Get current admin profile
   * GET /api/v1/auth/me
   */
  getProfile: async () => {
    return await api.get('/auth/me');
  },
};

// ============= USER MANAGEMENT (UC-22) =============

export const adminUsers = {
  /**
   * Get all users with filters
   * GET /api/v1/admin/users
   */
  getUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },

  /**
   * Get user by ID
   * GET /api/v1/admin/users/:id
   */
  getUserById: async (userId) => {
    return await api.get(`/admin/users/${userId}`);
  },

  /**
   * Block user
   * PUT /api/v1/admin/users/:id/block
   */
  blockUser: async (userId, reason) => {
    return await api.put(`/admin/users/${userId}/block`, { reason });
  },

  /**
   * Unblock user
   * PUT /api/v1/admin/users/:id/unblock
   */
  unblockUser: async (userId) => {
    return await api.put(`/admin/users/${userId}/unblock`);
  },

  /**
   * Reset user password
   * POST /api/v1/admin/users/:id/reset-password
   */
  resetPassword: async (userId, newPassword) => {
    return await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
  },

  /**
   * Get user statistics
   * GET /api/v1/admin/users/statistics
   */
  getStatistics: async () => {
    return await api.get('/admin/users/statistics');
  },
};

// ============= OPERATOR MANAGEMENT (UC-23) =============

export const adminOperators = {
  /**
   * Get all operators
   * GET /api/v1/admin/operators
   */
  getOperators: async (params) => {
    return await api.get('/admin/operators', { params });
  },

  /**
   * Get operator by ID
   * GET /api/v1/admin/operators/:id
   */
  getOperatorById: async (operatorId) => {
    return await api.get(`/admin/operators/${operatorId}`);
  },

  /**
   * Approve operator
   * PUT /api/v1/admin/operators/:id/approve
   */
  approveOperator: async (operatorId) => {
    return await api.put(`/admin/operators/${operatorId}/approve`);
  },

  /**
   * Reject operator
   * PUT /api/v1/admin/operators/:id/reject
   */
  rejectOperator: async (operatorId, reason) => {
    return await api.put(`/admin/operators/${operatorId}/reject`, { reason });
  },

  /**
   * Suspend operator
   * PUT /api/v1/admin/operators/:id/suspend
   */
  suspendOperator: async (operatorId, reason) => {
    return await api.put(`/admin/operators/${operatorId}/suspend`, { reason });
  },

  /**
   * Resume operator
   * PUT /api/v1/admin/operators/:id/resume
   */
  resumeOperator: async (operatorId) => {
    return await api.put(`/admin/operators/${operatorId}/resume`);
  },
};

// ============= SYSTEM REPORTS (UC-26) =============

export const adminReports = {
  /**
   * Get system overview report
   * GET /api/v1/admin/reports/overview
   */
  getSystemOverview: async (params) => {
    return await api.get('/admin/reports/overview', { params });
  },
};

// ============= COMPLAINT MANAGEMENT (UC-25) =============

export const adminComplaints = {
  /**
   * Get all complaints
   * GET /api/v1/admin/complaints
   */
  getComplaints: async (params) => {
    return await api.get('/admin/complaints', { params });
  },

  /**
   * Get complaint statistics
   * GET /api/v1/admin/complaints/statistics
   */
  getStatistics: async (params) => {
    return await api.get('/admin/complaints/statistics', { params });
  },

  /**
   * Assign complaint to admin
   * PUT /api/v1/admin/complaints/:id/assign
   */
  assignComplaint: async (complaintId, adminId) => {
    return await api.put(`/admin/complaints/${complaintId}/assign`, { adminId });
  },

  /**
   * Update complaint status
   * PUT /api/v1/admin/complaints/:id/status
   */
  updateStatus: async (complaintId, status) => {
    return await api.put(`/admin/complaints/${complaintId}/status`, { status });
  },

  /**
   * Update complaint priority
   * PUT /api/v1/admin/complaints/:id/priority
   */
  updatePriority: async (complaintId, priority) => {
    return await api.put(`/admin/complaints/${complaintId}/priority`, { priority });
  },

  /**
   * Resolve complaint
   * PUT /api/v1/admin/complaints/:id/resolve
   */
  resolveComplaint: async (complaintId, resolution) => {
    return await api.put(`/admin/complaints/${complaintId}/resolve`, { resolution });
  },
};

// ============= CONTENT MANAGEMENT (UC-24) =============

export const adminContent = {
  /**
   * Get content statistics
   * GET /api/v1/admin/content/statistics
   */
  getStatistics: async () => {
    return await api.get('/admin/content/statistics');
  },

  // Banner Management
  banners: {
    getAll: async (params) => api.get('/admin/banners', { params }),
    create: async (data) => api.post('/admin/banners', data),
    update: async (id, data) => api.put(`/admin/banners/${id}`, data),
    delete: async (id) => api.delete(`/admin/banners/${id}`),
  },

  // Blog Management
  blogs: {
    getAll: async (params) => api.get('/admin/blogs', { params }),
    getById: async (id) => api.get(`/admin/blogs/${id}`),
    create: async (data) => api.post('/admin/blogs', data),
    update: async (id, data) => api.put(`/admin/blogs/${id}`, data),
    delete: async (id) => api.delete(`/admin/blogs/${id}`),
  },

  // FAQ Management
  faqs: {
    getAll: async (params) => api.get('/admin/faqs', { params }),
    create: async (data) => api.post('/admin/faqs', data),
    update: async (id, data) => api.put(`/admin/faqs/${id}`, data),
    delete: async (id) => api.delete(`/admin/faqs/${id}`),
  },
};

export default {
  auth: adminAuth,
  users: adminUsers,
  operators: adminOperators,
  reports: adminReports,
  complaints: adminComplaints,
  content: adminContent,
};

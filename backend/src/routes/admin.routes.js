import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as complaintController from '../controllers/complaint.controller.js';
import * as adminContentController from '../controllers/adminContent.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Admin Routes
 * /api/v1/admin
 */

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Operator management routes
router.get('/operators', adminController.getAllOperators);
router.get('/operators/:id', adminController.getOperatorById);
router.put('/operators/:id/approve', adminController.approveOperator);
router.put('/operators/:id/reject', adminController.rejectOperator);
router.put('/operators/:id/suspend', adminController.suspendOperator);
router.put('/operators/:id/resume', adminController.resumeOperator);

// User management routes (UC-22)
router.get('/users/statistics', adminController.getUserStatistics);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/block', adminController.blockUser);
router.put('/users/:id/unblock', adminController.unblockUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// System reports routes (UC-26)
router.get('/reports/overview', adminController.getSystemOverview);

// Complaint management routes (UC-25)
router.get('/complaints/statistics', complaintController.getComplaintStatistics);
router.get('/complaints', complaintController.getAllComplaints);
router.put('/complaints/:id/assign', complaintController.assignComplaint);
router.put('/complaints/:id/status', complaintController.updateComplaintStatus);
router.put('/complaints/:id/priority', complaintController.updateComplaintPriority);
router.put('/complaints/:id/resolve', complaintController.resolveComplaint);

// Content management routes (UC-24)
router.get('/content/statistics', adminContentController.getContentStatistics);

// Banner management
router.get('/banners', adminContentController.getAllBanners);
router.post('/banners', adminContentController.createBanner);
router.put('/banners/:id', adminContentController.updateBanner);
router.delete('/banners/:id', adminContentController.deleteBanner);

// Blog management
router.get('/blogs', adminContentController.getAllBlogs);
router.get('/blogs/:id', adminContentController.getBlogById);
router.post('/blogs', adminContentController.createBlog);
router.put('/blogs/:id', adminContentController.updateBlog);
router.delete('/blogs/:id', adminContentController.deleteBlog);

// FAQ management
router.get('/faqs', adminContentController.getAllFAQs);
router.post('/faqs', adminContentController.createFAQ);
router.put('/faqs/:id', adminContentController.updateFAQ);
router.delete('/faqs/:id', adminContentController.deleteFAQ);

export default router;
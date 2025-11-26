import reviewService from '../services/review.service.js';
import { logger } from '../utils/logger.js';

/**
 * Review Controller
 * Handles HTTP requests for review operations
 */

/**
 * Create a new review for a booking
 * POST /api/bookings/:bookingId/review
 */
export const createReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const reviewData = req.body;

    // Validate required fields
    if (!reviewData.overallRating) {
      return res.status(400).json({
        success: false,
        message: 'Đánh giá tổng thể là bắt buộc',
      });
    }

    const result = await reviewService.createReview(userId, bookingId, reviewData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error in createReview:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể tạo đánh giá',
    });
  }
};

/**
 * Get reviews for a trip
 * GET /api/trips/:tripId/reviews
 */
export const getTripReviews = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const result = await reviewService.getTripReviews(tripId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in getTripReviews:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể lấy danh sách đánh giá',
    });
  }
};

/**
 * Get reviews for an operator
 * GET /api/operators/:operatorId/reviews
 */
export const getOperatorReviews = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt', minRating = 1 } = req.query;

    const result = await reviewService.getOperatorReviews(operatorId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      minRating: parseInt(minRating),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in getOperatorReviews:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể lấy danh sách đánh giá',
    });
  }
};

/**
 * Get current user's reviews
 * GET /api/users/my-reviews
 */
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const result = await reviewService.getUserReviews(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in getMyReviews:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể lấy danh sách đánh giá',
    });
  }
};

/**
 * Check if user can review a booking
 * GET /api/bookings/:bookingId/can-review
 */
export const canReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const result = await reviewService.canReview(userId, bookingId);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in canReview:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể kiểm tra',
    });
  }
};

/**
 * Add operator response to a review
 * POST /api/reviews/:reviewId/response
 */
export const addOperatorResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const operatorId = req.user._id; // Assuming operator is authenticated
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phản hồi không được để trống',
      });
    }

    const result = await reviewService.addOperatorResponse(reviewId, operatorId, response);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in addOperatorResponse:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể thêm phản hồi',
    });
  }
};

/**
 * Report a review
 * POST /api/reviews/:reviewId/report
 */
export const reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lý do báo cáo là bắt buộc',
      });
    }

    const result = await reviewService.reportReview(reviewId, reason);

    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in reportReview:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể báo cáo đánh giá',
    });
  }
};

/**
 * Send review invitation email
 * POST /api/bookings/:bookingId/send-review-invitation
 */
export const sendReviewInvitation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const result = await reviewService.sendReviewInvitation(userId, bookingId);

    res.status(200).json({
      success: true,
      message: 'Email mời đánh giá đã được gửi',
      ...result,
    });
  } catch (error) {
    logger.error('Error in sendReviewInvitation:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể gửi email mời đánh giá',
    });
  }
};
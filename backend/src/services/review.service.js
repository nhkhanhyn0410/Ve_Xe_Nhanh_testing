const Review = require('../models/Review');
const Booking = require('../models/Booking');
const BusOperator = require('../models/BusOperator');
const User = require('../models/User');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

/**
 * Review Service
 * Handles all review-related business logic
 */
class ReviewService {
  /**
   * Create a new review
   * @param {string} userId - User ID
   * @param {string} bookingId - Booking ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Created review
   */
  async createReview(userId, bookingId, reviewData) {
    try {
      // 1. Check if booking exists and belongs to user
      const booking = await Booking.findById(bookingId).populate('tripId');

      if (!booking) {
        throw new Error('Booking không tồn tại');
      }

      if (booking.userId && booking.userId.toString() !== userId) {
        throw new Error('Bạn không có quyền đánh giá booking này');
      }

      // 2. Check if booking is completed
      if (booking.status !== 'completed') {
        throw new Error('Chỉ có thể đánh giá sau khi hoàn thành chuyến đi');
      }

      // 3. Check if review already exists
      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        throw new Error('Bạn đã đánh giá chuyến đi này rồi');
      }

      // 4. Create review
      const review = new Review({
        userId,
        bookingId,
        tripId: booking.tripId._id,
        operatorId: booking.operatorId,
        overallRating: reviewData.overallRating,
        vehicleRating: reviewData.vehicleRating,
        driverRating: reviewData.driverRating,
        punctualityRating: reviewData.punctualityRating,
        serviceRating: reviewData.serviceRating,
        comment: reviewData.comment,
        images: reviewData.images || [],
      });

      await review.save();

      // 5. Update operator's average rating
      await this.updateOperatorRating(booking.operatorId);

      // 6. Award points for review (bonus points)
      const user = await User.findById(userId);
      if (user) {
        user.addPoints(50, 'Đánh giá chuyến đi', booking.tripId._id);
        await user.save();
      }

      // 7. Populate review data for response
      await review.populate('userId', 'fullName avatar');

      logger.info('Đánh giá được tạo thành công:', review._id);

      return {
        success: true,
        review,
        message: 'Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn!',
      };
    } catch (error) {
      logger.error('Lỗi khi tạo đánh giá:', error);
      throw error;
    }
  }

  /**
   * Update operator's average rating
   * @param {string} operatorId - Operator ID
   * @returns {Promise<void>}
   */
  async updateOperatorRating(operatorId) {
    try {
      const ratingStats = await Review.getOperatorAverageRating(operatorId);

      await BusOperator.findByIdAndUpdate(operatorId, {
        averageRating: ratingStats.averageRating,
        totalReviews: ratingStats.totalReviews,
      });

      logger.info(`Đánh giá nhà xe được cập nhật:${ratingStats.averageRating} (${ratingStats.totalReviews})`);
    } catch (error) {
      logger.error('Lỗi cập nhật đánh giá của nhà xe:', error);
      // Don't throw - this is a secondary operation
    }
  }

  /**
   * Get reviews for a trip
   * @param {string} tripId - Trip ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews and pagination
   */
  async getTripReviews(tripId, options = {}) {
    try {
      const result = await Review.getTripReviews(tripId, options);
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      logger.error('Lỗi khi nhận đánh giá chuyến đi:', error);
      throw error;
    }
  }

  /**
   * Get reviews for an operator
   * @param {string} operatorId - Operator ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Reviews and pagination
   */
  async getOperatorReviews(operatorId, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt', minRating = 1 } = options;

      const query = {
        operatorId,
        isPublished: true,
      };

      if (minRating > 1) {
        query.overallRating = { $gte: minRating };
      }

      const reviews = await Review.find(query)
        .populate('userId', 'fullName avatar')
        .populate('tripId', 'departureTime')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Review.countDocuments(query);

      // Get rating statistics
      const ratingStats = await Review.getRatingStatistics(operatorId);

      return {
        success: true,
        reviews,
        statistics: ratingStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('Lỗi nhận đánh giá của nhà xe:', error);
      throw error;
    }
  }

  /**
   * Get user's reviews
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} User's reviews
   */
  async getUserReviews(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      const reviews = await Review.find({ userId })
        .populate('tripId', 'departureTime')
        .populate('operatorId', 'companyName logo')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Review.countDocuments({ userId });

      return {
        success: true,
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('Lỗi nhận đánh giá của người dùng:', error);
      throw error;
    }
  }

  /**
   * Add operator response to review
   * @param {string} reviewId - Review ID
   * @param {string} operatorId - Operator ID
   * @param {string} response - Response text
   * @returns {Promise<Object>} Updated review
   */
  async addOperatorResponse(reviewId, operatorId, response) {
    try {
      const review = await Review.findById(reviewId);

      if (!review) {
        throw new Error('Review không tồn tại');
      }

      if (review.operatorId.toString() !== operatorId) {
        throw new Error('Bạn không có quyền phản hồi review này');
      }

      review.operatorResponse = response;
      review.respondedAt = new Date();
      await review.save();

      // Notify user about operator response
      const user = await User.findById(review.userId);
      if (user && user.email) {
        await notificationService.sendEmail(
          user.email,
          'Nhà xe đã phản hồi đánh giá của bạn',
          this.generateResponseNotificationEmail(user.fullName, response)
        );
      }

      logger.info('Đã thêm phản hồi của nhà xe thành công');

      return {
        success: true,
        review,
        message: 'Phản hồi của bạn đã được gửi',
      };
    } catch (error) {
      logger.error(' Error adding operator response:', error);
      throw error;
    }
  }

  /**
   * Check if user can review a booking
   * @param {string} userId - User ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Can review status
   */
  async canReview(userId, bookingId) {
    try {
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return {
          canReview: false,
          reason: 'Booking không tồn tại',
        };
      }

      if (booking.userId && booking.userId.toString() !== userId) {
        return {
          canReview: false,
          reason: 'Booking không thuộc về bạn',
        };
      }

      if (booking.status !== 'completed') {
        return {
          canReview: false,
          reason: 'Chỉ có thể đánh giá sau khi hoàn thành chuyến đi',
        };
      }

      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        return {
          canReview: false,
          reason: 'Bạn đã đánh giá chuyến đi này rồi',
          existingReview,
        };
      }

      return {
        canReview: true,
        booking,
      };
    } catch (error) {
      logger.error('Lỗi kiểm tra tính đủ điều kiện đánh giá:', error);
      throw error;
    }
  }

  /**
   * Send review invitation email
   * @param {string} userId - User ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Object>} Send result
   */
  async sendReviewInvitation(userId, bookingId) {
    try {
      const booking = await Booking.findById(bookingId)
        .populate('tripId')
        .populate('operatorId', 'companyName');

      if (!booking) {
        throw new Error('Booking không tồn tại');
      }

      const user = await User.findById(userId);
      if (!user || !user.email) {
        throw new Error('Không tìm thấy email người dùng');
      }

      // Check if already reviewed
      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        logger.info('Người dùng đã đánh giá lượt đặt chỗ này');
        return { success: true, skipped: true };
      }

      const emailContent = this.generateReviewInvitationEmail(
        user.fullName,
        booking,
        bookingId
      );

      const result = await notificationService.sendEmail(
        user.email,
        'Đánh giá chuyến đi của bạn - Vé xe nhanh',
        emailContent
      );

      logger.info('Xem lại lời mời đã gửi:', user.email);

      return result;
    } catch (error) {
      logger.error('Lỗi gửi lời mời đánh giá:', error);
      throw error;
    }
  }

  /**
   * Generate review invitation email HTML
   * @param {string} userName - User name
   * @param {Object} booking - Booking object
   * @param {string} bookingId - Booking ID
   * @returns {string} Email HTML
   */
  generateReviewInvitationEmail(userName, booking, bookingId) {
    const routeName =
      booking.tripId?.routeId?.routeName ||
      `${booking.pickupPoint?.name} - ${booking.dropoffPoint?.name}`;
    const departureTime = new Date(booking.tripId?.departureTime).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .rating-stars {
            font-size: 32px;
            text-align: center;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: #f59e0b;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px auto;
            text-align: center;
            font-weight: bold;
          }
          .trip-info {
            background: #fef3c7;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Vé xe nhanh</h1>
            <p>Đánh giá chuyến đi của bạn</p>
          </div>

          <div class="content">
            <h2>Xin chào ${userName}!</h2>
            <p>
              Cảm ơn bạn đã sử dụng dịch vụ Vé xe nhanh.
              Chúng tôi hy vọng bạn đã có một chuyến đi tuyệt vời!
            </p>

            <div class="trip-info">
              <p><strong>Tuyến đường:</strong> ${routeName}</p>
              <p><strong>Thời gian:</strong> ${departureTime}</p>
              <p><strong>Nhà xe:</strong> ${booking.operatorId?.companyName || 'N/A'}</p>
            </div>

            <div class="rating-stars">
              ⭐⭐⭐⭐⭐
            </div>

            <p style="text-align: center; font-size: 18px; color: #f59e0b; font-weight: bold;">
              Hãy chia sẻ trải nghiệm của bạn!
            </p>

            <p style="text-align: center;">
              Đánh giá của bạn giúp chúng tôi cải thiện dịch vụ và
              hỗ trợ những khách hàng khác đưa ra lựa chọn tốt hơn.
            </p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings/${bookingId}/review"
                 class="cta-button">
                Đánh giá ngay
              </a>
            </div>

            <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #f59e0b;">
              🎁 Nhận 50 điểm thưởng khi đánh giá!
            </p>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Trân trọng,<br>
              Đội ngũ Vé xe nhanh
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate operator response notification email HTML
   * @param {string} userName - User name
   * @param {string} response - Operator response
   * @returns {string} Email HTML
   */
  generateResponseNotificationEmail(userName, response) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .content {
            padding: 30px 20px;
          }
          .response-box {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Vé xe nhanh</h1>
            <p>Nhà xe đã phản hồi đánh giá của bạn</p>
          </div>

          <div class="content">
            <h2>Xin chào ${userName}!</h2>
            <p>
              Nhà xe đã phản hồi đánh giá của bạn:
            </p>

            <div class="response-box">
              <p>${response}</p>
            </div>

            <p>
              Cảm ơn bạn đã đóng góp ý kiến để giúp chúng tôi cải thiện dịch vụ!
            </p>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Trân trọng,<br>
              Đội ngũ Vé xe nhanh
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Report a review
   * @param {string} reviewId - Review ID
   * @param {string} reportReason - Reason for reporting
   * @returns {Promise<Object>} Updated review
   */
  async reportReview(reviewId, reportReason) {
    try {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        {
          isReported: true,
          reportReason,
        },
        { new: true }
      );

      if (!review) {
        throw new Error('Review không tồn tại');
      }

      logger.info('Đã báo cáo đánh giá:', reviewId);

      return {
        success: true,
        review,
        message: 'Đánh giá đã được báo cáo. Chúng tôi sẽ xem xét.',
      };
    } catch (error) {
      logger.error('Lỗi báo cáo đánh giá:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService();

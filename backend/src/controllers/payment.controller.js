import PaymentService from '../services/payment.service.js';
import { logger } from '../utils/logger.js';

/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */

/**
 * Create payment
 * POST /api/payments/create
 */
export const createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, amount, bankCode, locale } = req.body;

    // Validation
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID là bắt buộc',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền không hợp lệ',
      });
    }

    // Get IP address
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const userAgent = req.headers['user-agent'];

    const customerId = req.user?.userId; // From auth middleware

    const result = await PaymentService.createPayment({
      bookingId,
      customerId,
      paymentMethod: paymentMethod || 'vnpay',
      amount,
      ipAddress,
      userAgent,
      bankCode,
      locale,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo thanh toán thành công',
      data: {
        payment: result.payment,
        paymentUrl: result.paymentUrl,
      },
    });
  } catch (error) {
    logger.error('Create payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Tạo thanh toán thất bại',
    });
  }
};

/**
 * VNPay callback handler
 * GET /api/payments/vnpay/callback
 */
export const vnpayCallback = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Get IP address
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const result = await PaymentService.processVNPayCallback(vnpParams, ipAddress);

    if (result.success) {
      // Redirect to success page
      const returnUrl = process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/payment/success';
      const redirectUrl = `${returnUrl}?paymentCode=${result.payment.paymentCode}&bookingCode=${result.booking.bookingCode}`;

      return res.redirect(redirectUrl);
    } else {
      // Redirect to failure page
      const returnUrl = process.env.PAYMENT_FAILURE_URL || 'http://localhost:3000/payment/failure';
      const redirectUrl = `${returnUrl}?message=${encodeURIComponent(result.message)}&code=${result.code}`;

      return res.redirect(redirectUrl);
    }
  } catch (error) {
    logger.error('VNPay callback error:', error);

    // Redirect to error page
    const returnUrl = process.env.PAYMENT_ERROR_URL || 'http://localhost:3000/payment/error';
    const redirectUrl = `${returnUrl}?message=${encodeURIComponent(error.message)}`;

    return res.redirect(redirectUrl);
  }
};

/**
 * VNPay return handler (same as callback but returns JSON)
 * GET /api/payments/vnpay/return
 */
export const vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;

    // Get IP address
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const result = await PaymentService.processVNPayCallback(vnpParams, ipAddress);

    res.status(result.success ? 200 : 400).json({
      success: result.success,
      message: result.message,
      data: result.success
        ? {
          payment: result.payment,
          booking: result.booking,
        }
        : null,
      error: !result.success
        ? {
          code: result.code,
          message: result.message,
        }
        : null,
    });
  } catch (error) {
    logger.error('VNPay return error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Xử lý callback thất bại',
    });
  }
};

/**
 * Get payment by ID
 * GET /api/payments/:paymentId
 */
export const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.getPaymentById(paymentId);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy thanh toán',
    });
  }
};

/**
 * Get payment by code
 * GET /api/payments/code/:paymentCode
 */
export const getPaymentByCode = async (req, res) => {
  try {
    const { paymentCode } = req.params;

    const payment = await PaymentService.getPaymentByCode(paymentCode);

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy thanh toán',
    });
  }
};

/**
 * Get payments by booking
 * GET /api/payments/booking/:bookingId
 */
export const getPaymentsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const payments = await PaymentService.getPaymentsByBooking(bookingId);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lấy danh sách thanh toán thất bại',
    });
  }
};

/**
 * Get customer payments
 * GET /api/payments/my-payments
 */
export const getMyPayments = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { status, paymentMethod, fromDate, toDate } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const payments = await PaymentService.getCustomerPayments(customerId, filters);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    logger.error('Get my payments error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lấy danh sách thanh toán thất bại',
    });
  }
};

/**
 * Get operator payments
 * GET /api/operators/:operatorId/payments
 */
export const getOperatorPayments = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { status, paymentMethod, fromDate, toDate } = req.query;

    // Verify operator access
    if (req.user.role === 'operator' && req.user.operatorId !== operatorId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const filters = {};
    if (status) filters.status = status;
    if (paymentMethod) filters.paymentMethod = paymentMethod;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const payments = await PaymentService.getOperatorPayments(operatorId, filters);

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    logger.error('Get operator payments error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lấy danh sách thanh toán thất bại',
    });
  }
};

/**
 * Process refund
 * POST /api/payments/:paymentId/refund
 */
export const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền hoàn không hợp lệ',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Lý do hoàn tiền là bắt buộc',
      });
    }

    // Get IP address
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const user = req.user?.email || req.user?.userId || 'admin';

    const result = await PaymentService.processRefund({
      paymentId,
      amount,
      reason,
      ipAddress,
      user,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        payment: result.payment,
      },
    });
  } catch (error) {
    logger.error('Process refund error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Hoàn tiền thất bại',
    });
  }
};

/**
 * Query transaction status
 * GET /api/payments/:paymentCode/status
 */
export const queryTransactionStatus = async (req, res) => {
  try {
    const { paymentCode } = req.params;

    // Get IP address
    const ipAddress =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const result = await PaymentService.queryTransactionStatus(paymentCode, ipAddress);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Query transaction status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Truy vấn trạng thái giao dịch thất bại',
    });
  }
};

/**
 * Get payment statistics
 * GET /api/operators/:operatorId/payment-statistics
 */
export const getStatistics = async (req, res) => {
  try {
    const { operatorId } = req.params;
    const { fromDate, toDate } = req.query;

    // Verify operator access
    if (req.user.role === 'operator' && req.user.operatorId !== operatorId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập',
      });
    }

    const filters = {};
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const stats = await PaymentService.getStatistics(operatorId, filters);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Get payment statistics error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lấy thống kê thanh toán thất bại',
    });
  }
};

/**
 * Get payment methods
 * GET /api/payments/methods
 */
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = PaymentService.getPaymentMethods();

    res.status(200).json({
      success: true,
      data: methods,
    });
  } catch (error) {
    logger.error('Get payment methods error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lấy danh sách phương thức thanh toán thất bại',
    });
  }
};

/**
 * Get bank list
 * GET /api/payments/banks
 */
export const getBankList = async (req, res) => {
  try {
    const banks = PaymentService.getBankList();

    res.status(200).json({
      success: true,
      data: banks,
    });
  } catch (error) {
    logger.error('Get bank list error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lấy danh sách ngân hàng thất bại',
    });
  }
};

/**
 * Handle expired payments (cron job endpoint)
 * POST /api/payments/handle-expired
 */
export const handleExpiredPayments = async (req, res) => {
  try {
    // This should be protected and only accessible by cron jobs
    const result = await PaymentService.handleExpiredPayments();

    res.status(200).json({
      success: true,
      message: 'Xử lý thanh toán hết hạn thành công',
      data: result,
    });
  } catch (error) {
    logger.error('Handle expired payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Xử lý thanh toán hết hạn thất bại',
    });
  }
};
const TicketService = require('../services/ticket.service');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Ticket Controller
 * Handles ticket-related HTTP requests
 */
class TicketController {
  /**
   * Generate ticket for a booking
   * POST /api/tickets/generate
   */
  static async generateTicket(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { bookingId } = req.body;

      const ticket = await TicketService.generateTicket(bookingId);

      // Send notifications in background
      TicketService.sendTicketNotifications(ticket._id).catch((error) => {
        logger.error('Lỗi thông báo:', error);
      });

      res.status(201).json({
        success: true,
        message: 'Vé điện tử đã được tạo thành công',
        data: {
          ticket,
        },
      });
    } catch (error) {
      logger.error('Lỗi tạo vé:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi tạo vé điện tử',
      });
    }
  }

  /**
   * Get ticket by ID
   * GET /api/tickets/:id
   */
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const customerId = req.user?.id; // From auth middleware

      const ticket = await TicketService.getTicketById(id, customerId);

      res.json({
        success: true,
        data: {
          ticket,
        },
      });
    } catch (error) {
      logger.error('Lỗi lấy vé:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy vé',
      });
    }
  }

  /**
   * Get ticket by booking ID
   * GET /api/tickets/booking/:bookingId
   */
  static async getTicketByBooking(req, res) {
    try {
      const { bookingId } = req.params;

      const ticket = await TicketService.getTicketByBooking(bookingId);

      res.json({
        success: true,
        data: {
          ticket,
        },
      });
    } catch (error) {
      logger.error('Lỗi lấy vé theo đặt chỗ:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy vé',
      });
    }
  }

  /**
   * UC-27: Request OTP for ticket lookup (Step 1)
   * POST /api/tickets/lookup/request-otp
   * Supports phone or email lookup
   */
  static async requestTicketLookupOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { ticketCode, phone, email } = req.body;

      // Support both phone and email lookup
      const result = await TicketService.requestTicketLookupOTP(ticketCode || null, phone, email);

      res.json({
        success: true,
        message: result.message,
        data: {
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      logger.error('Lỗi yêu cầu OTP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Không thể gửi OTP',
      });
    }
  }

  /**
   * UC-27: Verify OTP and get tickets (Step 2)
   * POST /api/tickets/lookup/verify-otp
   * Returns single ticket if ticketCode provided
   */
  static async verifyTicketLookupOTP(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { ticketCode, phone, email, otp } = req.body;

      // Support both phone and email lookup
      const result = await TicketService.verifyTicketLookupOTP(ticketCode || null, phone, email, otp);

      res.json({
        success: true,
        message: 'Xác thực thành công',
        data: result, // Can be { ticket } or { tickets: [] }
      });
    } catch (error) {
      logger.error('Lỗi xác mtrtrêngh OTP:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Xác thực OTP thất bại',
      });
    }
  }

  /**
   * UC-27: Lookup ticket by code (for guests) - Legacy without OTP
   * POST /api/tickets/lookup
   */
  static async lookupTicket(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { ticketCode, phone } = req.body;

      const ticket = await TicketService.getTicketByCode(ticketCode, phone);

      res.json({
        success: true,
        data: {
          ticket,
        },
      });
    } catch (error) {
      logger.error('Lỗi tra cứu vé:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy vé',
      });
    }
  }

  /**
   * UC-8: Get customer tickets
   * GET /api/users/tickets
   * Query params:
   * - type: upcoming | past | cancelled
   * - status: valid | used | cancelled | expired
   * - fromDate, toDate: date range
   * - search: search by ticket/booking code
   * - page, limit: pagination
   */
  static async getCustomerTickets(req, res) {
    try {
      const customerId = req.user.id; // From auth middleware
      const { type, status, fromDate, toDate, search, page, limit } = req.query;

      const filters = {};
      if (type) filters.type = type; // upcoming, past, cancelled
      if (status) filters.status = status;
      if (fromDate && toDate) {
        filters.fromDate = fromDate;
        filters.toDate = toDate;
      }
      if (search) filters.search = search;
      if (page) filters.page = page;
      if (limit) filters.limit = limit;

      const result = await TicketService.getCustomerTickets(customerId, filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Lỗi lấy vé khách hàng:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách vé',
      });
    }
  }

  /**
   * UC-20: Get trip passengers (for trip manager)
   * GET /api/trips/:tripId/passengers
   */
  static async getTripPassengers(req, res) {
    try {
      const { tripId } = req.params;
      const { isUsed } = req.query;

      const filters = {};
      if (isUsed !== undefined) {
        filters.isUsed = isUsed === 'true';
      }

      const tickets = await TicketService.getTripTickets(tripId, filters);

      // Format passenger list
      const passengers = tickets.map((ticket) => ({
        ticketId: ticket._id,
        ticketCode: ticket.ticketCode,
        passengers: ticket.passengers,
        isUsed: ticket.isUsed,
        usedAt: ticket.usedAt,
        status: ticket.status,
      }));

      const stats = {
        total: tickets.length,
        boarded: tickets.filter((t) => t.isUsed).length,
        notBoarded: tickets.filter((t) => !t.isUsed && t.status === 'valid').length,
        cancelled: tickets.filter((t) => t.status === 'cancelled').length,
      };

      res.json({
        success: true,
        data: {
          passengers,
          stats,
        },
      });
    } catch (error) {
      logger.error('Lỗi lấy hành khách chuyến:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy danh sách hành khách',
      });
    }
  }

  /**
   * UC-19: Verify ticket QR code
   * POST /api/trips/:tripId/verify-ticket
   */
  static async verifyTicketQR(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { tripId } = req.params;
      const { qrCodeData, confirmPayment } = req.body;
      // Support both regular users and trip managers
      const verifiedBy = req.tripManager?.id || req.user?.id;

      const result = await TicketService.verifyTicketQR(qrCodeData, tripId, verifiedBy, confirmPayment);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            ticket: result.ticket,
            passengers: result.passengers,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error,
          data: result.ticket
            ? {
              ticket: result.ticket,
            }
            : null,
        });
      }
    } catch (error) {
      logger.error('Lỗi xác mtrtrêngh QR:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi xác thực QR code',
      });
    }
  }

  /**
   * UC-9: Cancel ticket with refund calculation
   * POST /api/tickets/:id/cancel
   */
  static async cancelTicket(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { reason } = req.body;
      const customerId = req.user?.id;
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

      // Verify ownership first
      const ticket = await TicketService.getTicketById(id, customerId);

      // Cancel ticket with refund calculation
      const cancellationResult = await TicketService.cancelTicket(id, reason, ipAddress);

      res.json({
        success: true,
        message: 'Vé đã được hủy thành công',
        data: {
          ticket: cancellationResult.ticket,
          booking: cancellationResult.booking,
          refund: {
            amount: cancellationResult.refundInfo.refundAmount,
            percentage: cancellationResult.refundInfo.refundPercentage,
            originalAmount: cancellationResult.refundInfo.originalAmount,
            policy: cancellationResult.refundInfo.appliedRule,
            status: cancellationResult.refundResult?.success ? 'processing' : 'pending',
          },
        },
      });
    } catch (error) {
      logger.error('Lỗi hủy vé:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi hủy vé',
      });
    }
  }

  /**
   * UC-10: Change/Exchange ticket
   * POST /api/tickets/:id/change
   */
  static async changeTicket(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { newTripId, seats, pickupPoint, dropoffPoint, reason } = req.body;
      const customerId = req.user?.id;
      const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

      // Verify ownership first
      const ticket = await TicketService.getTicketById(id, customerId);

      // Change ticket
      const changeData = {
        newTripId,
        seats,
        pickupPoint,
        dropoffPoint,
        reason,
      };

      const changeResult = await TicketService.changeTicket(id, changeData, ipAddress);

      if (changeResult.success) {
        res.json({
          success: true,
          message: 'Đổi vé thành công',
          data: {
            oldTicket: changeResult.oldTicket,
            newTicket: changeResult.newTicket,
            newBooking: changeResult.newBooking,
            priceInfo: changeResult.priceInfo,
          },
        });
      } else if (changeResult.requiresPayment) {
        res.status(402).json({
          success: false,
          requiresPayment: true,
          message: changeResult.message,
          data: {
            oldTicket: changeResult.oldTicket,
            newBooking: changeResult.newBooking,
            priceInfo: changeResult.priceInfo,
            paymentUrl: `${process.env.FRONTEND_URL}/payment/${changeResult.newBooking._id}`,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Đổi vé thất bại',
        });
      }
    } catch (error) {
      logger.error('Lỗi đổi vé:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Lỗi đổi vé',
      });
    }
  }

  /**
   * Download ticket PDF
   * GET /api/tickets/:id/download
   */
  static async downloadTicket(req, res) {
    try {
      const { id } = req.params;
      const customerId = req.user?.id;

      const ticket = await TicketService.getTicketById(id, customerId);

      if (!ticket.pdfUrl) {
        return res.status(404).json({
          success: false,
          message: 'PDF vé chưa sẵn sàng. Vui lòng thử lại sau.',
        });
      }

      // Redirect to PDF URL (Cloudinary)
      res.redirect(ticket.pdfUrl);
    } catch (error) {
      logger.error('Lỗi tải vé:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'Không tìm thấy vé',
      });
    }
  }

  /**
   * Resend ticket notifications
   * POST /api/tickets/:id/resend
   */
  static async resendTicket(req, res) {
    try {
      const { id } = req.params;
      const customerId = req.user?.id;

      // Verify ownership
      await TicketService.getTicketById(id, customerId);

      const result = await TicketService.resendTicket(id);

      res.json({
        success: true,
        message: 'Đã gửi lại vé',
        data: {
          notifications: result,
        },
      });
    } catch (error) {
      logger.error('Lỗi gửi lại vé:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi gửi lại vé',
      });
    }
  }

  /**
   * Get ticket statistics (for operators)
   * GET /api/operators/tickets/stats
   */
  static async getTicketStats(req, res) {
    try {
      const operatorId = req.user.operatorId; // From auth middleware
      const { fromDate, toDate } = req.query;

      // This would need to be implemented in TicketService
      // For now, return a placeholder

      res.json({
        success: true,
        message: 'Feature coming soon',
        data: {
          stats: {},
        },
      });
    } catch (error) {
      logger.error('Lỗi lấy thống kê vé:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi lấy thống kê vé',
      });
    }
  }
}

module.exports = TicketController;

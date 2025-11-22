import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import QRService from './qr.service.js';
import { sendEmail, emailTemplates } from '../config/email.js';
import SMSService from './sms.service.js';
import CancellationService from './cancellation.service.js';
import { getRedisClient } from '../config/redis.js';
import moment from 'moment-timezone';
import { logger } from '../utils/logger.js';

// Lazy-load BookingService to avoid circular dependency
let BookingService = null;
const getBookingService = async () => {
  if (!BookingService) {
    const module = await import('./booking.service.js');
    BookingService = module.default;
  }
  return BookingService;
};

/**
 * Ticket Service
 * UC-7: Generate digital tickets with QR codes
 */
class TicketService {
  /**
   * Generate ticket for a confirmed booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Ticket>} Generated ticket
   */
  static async generateTicket(bookingId) {
    try {
      // Check if ticket already exists
      const existingTicket = await Ticket.findOne({ bookingId });
      if (existingTicket) {
        logger.warn(`Ticket already exists for booking: ${bookingId}`);
        return existingTicket;
      }

      // Get booking with populated references
      const booking = await Booking.findById(bookingId)
        .populate('tripId')
        .populate('operatorId')
        .populate('customerId');

      if (!booking) {
        throw new Error('Không tìm thấy booking');
      }

      if (booking.status !== 'confirmed' || booking.paymentStatus !== 'paid') {
        throw new Error('Booking chưa được xác nhận hoặc chưa thanh toán');
      }

      // Get full trip details
      const trip = await Trip.findById(booking.tripId._id)
        .populate('routeId')
        .populate('busId');

      if (!trip) {
        throw new Error('Không tìm thấy chuyến xe');
      }

      // Generate ticket code
      const ticketCode = await Ticket.generateTicketCode();

      // Prepare passenger data
      const passengers = booking.seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        fullName: seat.passengerName,
        phone: seat.passengerPhone,
        email: seat.passengerEmail,
        idCard: seat.passengerIdCard,
      }));

      const seatNumbers = booking.seats.map((s) => s.seatNumber);

      // Generate QR Code
      const qrData = await QRService.generateTicketQR({
        bookingId: booking._id.toString(),
        ticketCode,
        tripId: trip._id.toString(),
        seatNumbers,
        passengerName: passengers[0].fullName,
        departureTime: trip.departureTime,
      });

      // Create ticket document
      const ticket = await Ticket.create({
        ticketCode,
        bookingId: booking._id,
        customerId: booking.customerId?._id || null,
        tripId: trip._id,
        operatorId: booking.operatorId._id,
        qrCode: qrData.qrCode, // Base64 image
        qrCodeData: qrData.qrCodeData, // Encrypted data
        passengers,
        tripInfo: {
          routeName: trip.routeId.routeName,
          departureTime: trip.departureTime,
          arrivalTime: trip.arrivalTime,
          origin: {
            city: trip.routeId.origin.city,
            station: trip.routeId.origin.station,
            address: trip.routeId.origin.address,
          },
          destination: {
            city: trip.routeId.destination.city,
            station: trip.routeId.destination.station,
            address: trip.routeId.destination.address,
          },
          pickupPoint: booking.pickupPoint
            ? {
                name: booking.pickupPoint.name,
                address: booking.pickupPoint.address,
              }
            : null,
          dropoffPoint: booking.dropoffPoint
            ? {
                name: booking.dropoffPoint.name,
                address: booking.dropoffPoint.address,
              }
            : null,
          busNumber: trip.busId.busNumber,
          busType: trip.busId.busType,
        },
        totalPrice: booking.finalPrice,
        status: 'valid',
      });

      logger.success(`Ticket with QR code generated successfully: ${ticketCode}`);
      return ticket;
    } catch (error) {
      logger.error(`Ticket generation error: ${error.message}`);
      throw error;
    }
  }


  /**
   * Send ticket via email and SMS
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Send result
   */
  static async sendTicketNotifications(ticketId) {
    try {
      const ticket = await Ticket.findById(ticketId)
        .populate('bookingId')
        .populate('operatorId');

      if (!ticket) {
        throw new Error('Không tìm thấy vé');
      }

      const booking = ticket.bookingId;
      const contactEmail = booking.contactInfo.email;
      const contactPhone = booking.contactInfo.phone;

      const results = {
        email: { sent: false },
        sms: { sent: false },
      };

      // Check if demo mode
      const isDemoMode = process.env.DEMO_MODE === 'true';

      if (isDemoMode) {
        logger.info('Demo mode: Simulating email and SMS notifications');
        results.email.sent = true;
        results.email.demo = true;
        results.sms.sent = true;
        results.sms.demo = true;

        ticket.markEmailSent();
        ticket.markSmsSent();
        await ticket.save();

        logger.success(`[DEMO] Email would be sent to: ${contactEmail}`);
        logger.success(`[DEMO] SMS would be sent to: ${contactPhone}`);

        return results;
      }

      // Prepare ticket data for email
      const departureTime = moment(ticket.tripInfo.departureTime)
        .tz('Asia/Ho_Chi_Minh')
        .format('HH:mm, DD/MM/YYYY');

      const ticketData = {
        bookingCode: booking.bookingCode,
        ticketCode: ticket.ticketCode,
        passengerName: ticket.passengers[0].fullName,
        routeName: ticket.tripInfo.routeName,
        departureTime,
        pickupPoint: ticket.tripInfo.pickupPoint?.name || ticket.tripInfo.origin.station,
        seatNumbers: ticket.passengers.map((p) => p.seatNumber).join(', '),
        totalPrice: `${ticket.totalPrice.toLocaleString('vi-VN')} VNĐ`,
        qrCodeImage: ticket.qrCode, // Base64 data URL
        ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticket.ticketCode}`,
        operatorName: ticket.operatorId.companyName,
        operatorPhone: ticket.operatorId.phone,
        operatorEmail: ticket.operatorId.email,
      };

      // Send email
      if (contactEmail && !ticket.emailSent) {
        try {
          const emailTemplate = emailTemplates.ticketConfirmation(ticketData);

          await sendEmail({
            to: contactEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            qrCodeDataUrl: ticket.qrCode, // Pass QR as data URL for CID conversion
          });

          ticket.markEmailSent();
          results.email.sent = true;
          logger.success(`Ticket email sent to: ${contactEmail}`);
        } catch (error) {
          logger.error(`Email sending failed: ${error.message}`);
          results.email.error = error.message;
        }
      }

      // Send SMS
      if (contactPhone && !ticket.smsSent) {
        try {
          const smsData = {
            phone: contactPhone,
            bookingCode: booking.bookingCode,
            ticketCode: ticket.ticketCode,
            routeName: ticket.tripInfo.routeName,
            departureTime,
            seatNumbers: ticket.passengers.map((p) => p.seatNumber).join(', '),
            ticketUrl: ticketData.ticketUrl,
          };

          const smsResult = await SMSService.sendTicketSMS(smsData);

          if (smsResult.success) {
            ticket.markSmsSent();
            results.sms.sent = true;
            logger.success(`Ticket SMS sent to: ${contactPhone}`);
          } else {
            results.sms.error = smsResult.error;
          }
        } catch (error) {
          logger.error(`SMS sending failed: ${error.message}`);
          results.sms.error = error.message;
        }
      }

      await ticket.save();

      return results;
    } catch (error) {
      logger.error(`Notification sending error: ${error.message}`);
      // Return partial results instead of throwing to not fail the booking
      return {
        email: { sent: false, error: error.message },
        sms: { sent: false, error: error.message },
      };
    }
  }

  /**
   * Get ticket by ID
   * @param {string} ticketId - Ticket ID
   * @param {string} customerId - Customer ID (optional, for authorization)
   * @returns {Promise<Ticket>} Ticket details
   */
  static async getTicketById(ticketId, customerId = null) {
    const ticket = await Ticket.findById(ticketId)
      .populate('tripId')
      .populate('operatorId', 'companyName phone email logo')
      .populate('bookingId');

    if (!ticket) {
      throw new Error('Không tìm thấy vé');
    }

    // Verify ownership if customerId provided
    if (customerId && ticket.customerId && ticket.customerId.toString() !== customerId) {
      throw new Error('Không có quyền truy cập vé này');
    }

    return ticket;
  }

  /**
   * Get ticket by booking ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise<Ticket>} Ticket details
   */
  static async getTicketByBooking(bookingId) {
    const ticket = await Ticket.findOne({ bookingId })
      .populate('tripId')
      .populate('operatorId', 'companyName phone email logo')
      .populate('bookingId');

    if (!ticket) {
      throw new Error('Không tìm thấy vé cho booking này');
    }

    return ticket;
  }

  /**
   * Request OTP for guest ticket lookup
   * @param {string} ticketCode - Ticket code
   * @param {string} phone - Contact phone
   * @returns {Promise<Object>} OTP request result
   */
  static async requestTicketLookupOTP(ticketCode, phone) {
    // Find ticket
    const ticket = await Ticket.findByCode(ticketCode);

    if (!ticket) {
      throw new Error('Không tìm thấy vé');
    }

    // Verify phone number
    const booking = ticket.bookingId;
    if (booking.contactInfo.phone !== phone) {
      throw new Error('Số điện thoại không khớp');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5 minutes expiry
    const otpKey = `ticket_lookup_otp:${ticketCode}:${phone}`;
    const redis = getRedisClient();
    await redis.setEx(otpKey, 300, otp); // 5 minutes

    // Send OTP via SMS
    try {
      await SMSService.sendOTP(phone, otp);
    } catch (error) {
      logger.error(`Failed to send OTP SMS: ${error.message}`);
      // Continue anyway - for development, OTP is logged
    }

    // Also send via email if available
    if (booking.contactInfo.email) {
      try {
        await sendEmail({
          to: booking.contactInfo.email,
          subject: 'Mã OTP tra cứu vé - QuikRide',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #0ea5e9;">Mã OTP tra cứu vé</h1>
              <p>Mã OTP của bạn để tra cứu vé <strong>${ticketCode}</strong> là:</p>
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h2 style="color: #0ea5e9; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h2>
              </div>
              <p style="color: #dc2626;">Mã có hiệu lực trong 5 phút.</p>
              <p style="color: #666; font-size: 14px;">
                Nếu bạn không yêu cầu tra cứu vé, vui lòng bỏ qua email này.
              </p>
            </div>
          `,
        });
      } catch (error) {
        logger.error(`Failed to send OTP email: ${error.message}`);
      }
    }

    logger.debug(`OTP for ticket lookup (${ticketCode}): ${otp}`); // For development

    return {
      message: 'Mã OTP đã được gửi qua SMS và email',
      expiresIn: 300, // 5 minutes
    };
  }

  /**
   * Verify OTP and get ticket (for guests)
   * @param {string} ticketCode - Ticket code
   * @param {string} phone - Contact phone
   * @param {string} otp - OTP code
   * @returns {Promise<Ticket>} Ticket details
   */
  static async verifyTicketLookupOTP(ticketCode, phone, otp) {
    // Get OTP from Redis
    const otpKey = `ticket_lookup_otp:${ticketCode}:${phone}`;
    const redis = getRedisClient();
    const storedOTP = await redis.get(otpKey);

    if (!storedOTP) {
      throw new Error('Mã OTP đã hết hạn hoặc không tồn tại');
    }

    if (storedOTP !== otp) {
      throw new Error('Mã OTP không đúng');
    }

    // Delete OTP after successful verification
    await redis.del(otpKey);

    // Get ticket
    const ticket = await Ticket.findByCode(ticketCode);

    if (!ticket) {
      throw new Error('Không tìm thấy vé');
    }

    return ticket;
  }

  /**
   * Get ticket by code (for guests) - Legacy method without OTP
   * @param {string} ticketCode - Ticket code
   * @param {string} phone - Contact phone for verification
   * @returns {Promise<Ticket>} Ticket details
   */
  static async getTicketByCode(ticketCode, phone) {
    const ticket = await Ticket.findByCode(ticketCode);

    if (!ticket) {
      throw new Error('Không tìm thấy vé');
    }

    // Verify phone number
    const booking = ticket.bookingId;
    if (booking.contactInfo.phone !== phone) {
      throw new Error('Số điện thoại không khớp');
    }

    return ticket;
  }

  /**
   * Get customer tickets with enhanced filtering
   * @param {string} customerId - Customer ID
   * @param {Object} filters - Filters
   * @returns {Promise<Object>} Tickets with metadata
   */
  static async getCustomerTickets(customerId, filters = {}) {
    const query = { customerId };
    const now = new Date();

    // Filter by status type (upcoming, past, cancelled)
    if (filters.type) {
      switch (filters.type) {
        case 'upcoming':
          // Valid tickets with future departure time
          query.status = 'valid';
          query['tripInfo.departureTime'] = { $gte: now };
          break;
        case 'past':
          // Used tickets or valid tickets with past departure time
          query.$or = [
            { status: 'used' },
            { status: 'valid', 'tripInfo.departureTime': { $lt: now } },
          ];
          break;
        case 'cancelled':
          query.status = 'cancelled';
          break;
        default:
          // All tickets
          break;
      }
    }

    // Filter by status
    if (filters.status && !filters.type) {
      query.status = filters.status;
    }

    // Filter by date range
    if (filters.fromDate && filters.toDate) {
      query.createdAt = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate),
      };
    }

    // Search by ticket code or booking code
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      const booking = await Booking.find({
        customerId,
        bookingCode: searchRegex,
      }).select('_id');

      const bookingIds = booking.map((b) => b._id);

      query.$or = [
        { ticketCode: searchRegex },
        { bookingId: { $in: bookingIds } },
      ];
    }

    // Pagination
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Get tickets
    const tickets = await Ticket.find(query)
      .populate('tripId')
      .populate('operatorId', 'companyName phone email logo')
      .populate('bookingId', 'bookingCode contactInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Ticket.countDocuments(query);

    // Calculate stats
    const stats = {
      upcoming: await Ticket.countDocuments({
        customerId,
        status: 'valid',
        'tripInfo.departureTime': { $gte: now },
      }),
      past: await Ticket.countDocuments({
        customerId,
        $or: [
          { status: 'used' },
          { status: 'valid', 'tripInfo.departureTime': { $lt: now } },
        ],
      }),
      cancelled: await Ticket.countDocuments({
        customerId,
        status: 'cancelled',
      }),
      total: await Ticket.countDocuments({ customerId }),
    };

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  /**
   * Get trip tickets (for trip manager)
   * @param {string} tripId - Trip ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Tickets
   */
  static async getTripTickets(tripId, filters = {}) {
    return await Ticket.findByTrip(tripId, filters);
  }

  /**
   * Verify ticket QR code
   * @param {string} qrCodeData - Encrypted QR data
   * @param {string} tripId - Trip ID to verify against
   * @param {string} verifiedBy - Employee ID who verified
   * @returns {Promise<Object>} Verification result
   */
  static async verifyTicketQR(qrCodeData, tripId, verifiedBy) {
    try {
      // Verify QR code structure and data
      const qrVerification = await QRService.verifyTicketQR(qrCodeData, { tripId });

      if (!qrVerification.valid) {
        return {
          success: false,
          error: qrVerification.error,
        };
      }

      const { ticketCode, bookingId } = qrVerification.data;

      // Find ticket
      const ticket = await Ticket.findOne({ ticketCode })
        .populate('tripId')
        .populate('bookingId');

      if (!ticket) {
        return {
          success: false,
          error: 'Vé không tồn tại trong hệ thống',
        };
      }

      // Check ticket status
      if (ticket.status === 'cancelled') {
        return {
          success: false,
          error: 'Vé đã bị hủy',
          ticket,
        };
      }

      if (ticket.status === 'used' || ticket.isUsed) {
        return {
          success: false,
          error: `Vé đã được sử dụng lúc ${moment(ticket.usedAt).format('HH:mm DD/MM/YYYY')}`,
          ticket,
        };
      }

      if (ticket.isExpired) {
        return {
          success: false,
          error: 'Vé đã hết hạn (chuyến xe đã khởi hành)',
          ticket,
        };
      }

      // Check if ticket matches the trip
      if (ticket.tripId._id.toString() !== tripId) {
        return {
          success: false,
          error: 'Vé không thuộc chuyến xe này',
          ticket,
        };
      }

      // Mark ticket as used
      ticket.markAsUsed(verifiedBy);
      await ticket.save();

      return {
        success: true,
        message: 'Vé hợp lệ',
        ticket,
        passengers: ticket.passengers,
      };
    } catch (error) {
      logger.error(`QR verification error: ${error.message}`);
      return {
        success: false,
        error: error.message || 'Lỗi xác thực QR code',
      };
    }
  }

  /**
   * Cancel ticket with refund calculation (UC-9)
   * @param {string} ticketId - Ticket ID
   * @param {string} reason - Cancellation reason
   * @param {string} ipAddress - IP address for refund processing
   * @returns {Promise<Object>} Cancelled ticket with refund info
   */
  static async cancelTicket(ticketId, reason, ipAddress = '127.0.0.1') {
    // Get ticket with populated references
    const ticket = await Ticket.findById(ticketId)
      .populate('bookingId')
      .populate('operatorId', 'companyName phone email');

    if (!ticket) {
      throw new Error('Không tìm thấy vé');
    }

    const booking = ticket.bookingId;

    // Check cancellation eligibility
    const eligibility = CancellationService.canCancelTicket(ticket);
    if (!eligibility.canCancel) {
      throw new Error(eligibility.reason);
    }

    // Calculate refund amount based on cancellation policy
    const refundInfo = CancellationService.calculateRefund(ticket, booking);

    // Validate cancellation reason
    const validatedReason = CancellationService.validateCancellationReason(reason);

    // Mark ticket as cancelled
    ticket.cancel(validatedReason.reason);
    await ticket.save();

    // Cancel booking (releases seats and processes refund)
    const BookingServiceClass = await getBookingService();
    const cancellationResult = await BookingServiceClass.cancelBooking(
      booking._id,
      validatedReason.reason,
      'customer',
      ipAddress,
      refundInfo.refundAmount // Pass calculated refund amount
    );

    // Format cancellation details for email/notification
    const cancellationDetails = CancellationService.formatCancellationDetails({
      ticket,
      booking,
      refundInfo,
      cancelReason: validatedReason.reason,
    });

    // Send cancellation email
    try {
      const emailTemplate = emailTemplates.ticketCancellation(cancellationDetails);
      await sendEmail({
        to: booking.contactInfo.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
      logger.success(`Cancellation email sent to: ${booking.contactInfo.email}`);
    } catch (error) {
      logger.error(`Failed to send cancellation email: ${error.message}`);
      // Don't fail the cancellation if email fails
    }

    // Send SMS notification
    try {
      const message = `QuikRide: Ve ${ticket.ticketCode} da bi huy.
${refundInfo.refundAmount > 0 ? `So tien hoan: ${refundInfo.refundAmount.toLocaleString('vi-VN')} VND` : 'Khong hoan tien'}
${refundInfo.appliedRule}`;

      await SMSService.sendSMS(booking.contactInfo.phone, message);
      logger.success(`Cancellation SMS sent to: ${booking.contactInfo.phone}`);
    } catch (error) {
      logger.error(`Failed to send cancellation SMS: ${error.message}`);
      // Don't fail the cancellation if SMS fails
    }

    return {
      ticket,
      booking: cancellationResult.booking,
      refundInfo,
      refundResult: cancellationResult.refundResult,
      cancellationDetails,
    };
  }

  /**
   * Change/Exchange ticket to a different trip (UC-10)
   * @param {string} ticketId - Original ticket ID
   * @param {Object} changeData - Change request data
   * @param {string} changeData.newTripId - New trip ID
   * @param {Array} changeData.seats - New seat selections
   * @param {Object} changeData.pickupPoint - New pickup point (optional)
   * @param {Object} changeData.dropoffPoint - New dropoff point (optional)
   * @param {string} changeData.reason - Reason for change (optional)
   * @param {string} ipAddress - IP address for payment processing
   * @returns {Promise<Object>} Exchange result with new ticket
   */
  static async changeTicket(ticketId, changeData, ipAddress = '127.0.0.1') {
    const { newTripId, seats, pickupPoint, dropoffPoint, reason } = changeData;

    // Get original ticket with populated references
    const oldTicket = await Ticket.findById(ticketId)
      .populate('bookingId')
      .populate('tripId')
      .populate('operatorId', 'companyName phone email');

    if (!oldTicket) {
      throw new Error('Không tìm thấy vé');
    }

    const oldBooking = oldTicket.bookingId;

    // Validate change eligibility
    if (oldTicket.status === 'cancelled') {
      throw new Error('Không thể đổi vé đã bị hủy');
    }

    if (oldTicket.isUsed || oldTicket.status === 'used') {
      throw new Error('Không thể đổi vé đã sử dụng');
    }

    if (oldTicket.isExpired) {
      throw new Error('Không thể đổi vé đã hết hạn');
    }

    // Check if old trip has already departed
    const now = moment().tz('Asia/Ho_Chi_Minh');
    const oldDepartureTime = moment(oldTicket.tripInfo.departureTime).tz('Asia/Ho_Chi_Minh');

    if (oldDepartureTime.isBefore(now)) {
      throw new Error('Không thể đổi vé sau khi xe đã khởi hành');
    }

    // Get new trip with populated references
    const newTrip = await Trip.findById(newTripId)
      .populate('routeId')
      .populate('busId')
      .populate('operatorId');

    if (!newTrip) {
      throw new Error('Không tìm thấy chuyến xe mới');
    }

    if (newTrip.status !== 'scheduled') {
      throw new Error('Chuyến xe mới không ở trạng thái có thể đặt');
    }

    // Check if new trip has already departed
    const newDepartureTime = moment(newTrip.departureTime).tz('Asia/Ho_Chi_Minh');
    if (newDepartureTime.isBefore(now)) {
      throw new Error('Chuyến xe mới đã khởi hành');
    }

    // Validate seat availability on new trip
    const requestedSeatNumbers = seats.map((s) => s.seatNumber);
    const unavailableSeats = requestedSeatNumbers.filter((seatNum) =>
      newTrip.bookedSeats.some((bookedSeat) => bookedSeat.seatNumber === seatNum)
    );

    if (unavailableSeats.length > 0) {
      throw new Error(`Ghế ${unavailableSeats.join(', ')} đã được đặt trên chuyến xe mới`);
    }

    if (newTrip.availableSeats < requestedSeatNumbers.length) {
      throw new Error('Không đủ ghế trống trên chuyến xe mới');
    }

    // Calculate price difference
    const oldPrice = oldBooking.finalPrice;
    const newBasePrice = requestedSeatNumbers.reduce((total, seatNum) => {
      const seatPrice = newTrip.getSeatPrice(seatNum);
      return total + seatPrice;
    }, 0);

    // Apply same voucher if still valid (optional enhancement)
    let newFinalPrice = newBasePrice;
    let voucherDiscount = 0;

    // Calculate price difference
    const priceDifference = newFinalPrice - oldPrice;
    const changeFee = 0; // Can add change fee here if needed

    // Prepare payment/refund data
    let paymentResult = null;
    let refundResult = null;

    // Lazy-load BookingService and PaymentService
    const BookingServiceClass = await getBookingService();
    let PaymentService = null;
    const getPaymentService = async () => {
      if (!PaymentService) {
        const module = await import('./payment.service.js');
        PaymentService = module.default;
      }
      return PaymentService;
    };

    // If new ticket is more expensive, user needs to pay the difference
    if (priceDifference > changeFee) {
      // For now, we'll create a pending payment that needs to be completed
      // In a real implementation, this would redirect to payment gateway
      const amountToPay = priceDifference;

      // Create a note about the payment needed
      paymentResult = {
        required: true,
        amount: amountToPay,
        message: `Cần thanh toán thêm ${amountToPay.toLocaleString('vi-VN')} VNĐ để đổi vé`,
      };
    }
    // If new ticket is cheaper, refund the difference
    else if (priceDifference < 0) {
      const refundAmount = Math.abs(priceDifference) - changeFee;

      if (refundAmount > 0 && oldBooking.paymentStatus === 'paid') {
        try {
          const PaymentServiceClass = await getPaymentService();
          const PaymentModel = (await import('../models/Payment.js')).default;
          const payments = await PaymentModel.find({
            bookingId: oldBooking._id,
            status: 'completed',
          });

          if (payments.length > 0) {
            refundResult = await PaymentServiceClass.processRefund({
              paymentId: payments[0]._id,
              amount: refundAmount,
              reason: `Hoàn tiền do đổi sang vé rẻ hơn: ${reason || 'Đổi vé'}`,
              ipAddress,
              user: 'system',
            });
          }
        } catch (error) {
          logger.error(`Refund for ticket change failed: ${error.message}`);
          // Don't fail the change if refund fails
        }
      }
    }

    // Cancel old ticket (mark as changed, not refunded)
    oldTicket.status = 'cancelled';
    oldTicket.cancelledAt = new Date();
    oldTicket.cancellationReason = reason || 'Đổi vé sang chuyến khác';
    await oldTicket.save();

    // Cancel old booking and release seats
    await BookingServiceClass.cancelBooking(
      oldBooking._id,
      `Đổi vé sang chuyến ${newTrip.routeId.routeName}`,
      'customer',
      ipAddress,
      0 // No refund on the old booking, handled separately
    );

    // Create new booking for the new trip
    const newBookingData = {
      tripId: newTripId,
      seats: seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        passengerName: seat.passengerName || oldTicket.passengers[0]?.fullName,
        passengerPhone: seat.passengerPhone || oldTicket.passengers[0]?.phone,
        passengerEmail: seat.passengerEmail || oldTicket.passengers[0]?.email,
        passengerIdCard: seat.passengerIdCard || oldTicket.passengers[0]?.idCard,
      })),
      contactInfo: oldBooking.contactInfo,
      customerId: oldBooking.customerId,
      pickupPoint: pickupPoint || oldBooking.pickupPoint,
      dropoffPoint: dropoffPoint || oldBooking.dropoffPoint,
    };

    // Create new booking using BookingService
    const newBookingResult = await BookingServiceClass.holdSeats(newBookingData);
    const newBooking = newBookingResult.booking;

    // Update new booking status based on payment
    if (priceDifference <= 0 || oldBooking.paymentStatus === 'paid') {
      // If new ticket is same price or cheaper, or old booking was paid, auto-confirm
      newBooking.status = 'confirmed';
      newBooking.paymentStatus = 'paid';
      newBooking.finalPrice = newFinalPrice;
      await newBooking.save();

      // Book seats on new trip
      const bookedSeats = requestedSeatNumbers.map((seatNum) => ({
        seatNumber: seatNum,
        bookingId: newBooking._id,
        customerId: newBooking.customerId,
      }));

      newTrip.bookedSeats.push(...bookedSeats);
      newTrip.availableSeats -= requestedSeatNumbers.length;
      await newTrip.save();

      // Generate new ticket
      const newTicket = await this.generateTicket(newBooking._id);

      // Send notifications about the change
      try {
        const emailTemplate = emailTemplates.ticketChange({
          oldTicketCode: oldTicket.ticketCode,
          oldBookingCode: oldBooking.bookingCode,
          oldRouteName: oldTicket.tripInfo.routeName,
          oldDepartureTime: moment(oldTicket.tripInfo.departureTime)
            .tz('Asia/Ho_Chi_Minh')
            .format('HH:mm, DD/MM/YYYY'),
          newTicketCode: newTicket.ticketCode,
          newBookingCode: newBooking.bookingCode,
          newRouteName: newTrip.routeId.routeName,
          newDepartureTime: moment(newTrip.departureTime)
            .tz('Asia/Ho_Chi_Minh')
            .format('HH:mm, DD/MM/YYYY'),
          seatNumbers: requestedSeatNumbers.join(', '),
          oldPrice: oldPrice.toLocaleString('vi-VN'),
          newPrice: newFinalPrice.toLocaleString('vi-VN'),
          priceDifference: priceDifference,
          priceDifferenceText: priceDifference > 0
            ? `+${priceDifference.toLocaleString('vi-VN')}`
            : priceDifference < 0
              ? `-${Math.abs(priceDifference).toLocaleString('vi-VN')}`
              : '0',
          changeReason: reason || 'Đổi lịch trình',
          changedAt: moment().tz('Asia/Ho_Chi_Minh').format('HH:mm, DD/MM/YYYY'),
        });

        await sendEmail({
          to: oldBooking.contactInfo.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });

        logger.success(`Ticket change email sent to: ${oldBooking.contactInfo.email}`);
      } catch (error) {
        logger.error(`Failed to send ticket change email: ${error.message}`);
      }

      // Send SMS notification
      try {
        const message = `QuikRide: Ve ${oldTicket.ticketCode} da duoc doi sang chuyen moi.
Ma ve moi: ${newTicket.ticketCode}
Tuyen: ${newTrip.routeId.routeName}
Gio di: ${moment(newTrip.departureTime).tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY')}
${priceDifference !== 0 ? `Chenh lech: ${priceDifference > 0 ? '+' : ''}${priceDifference.toLocaleString('vi-VN')} VND` : ''}`;

        await SMSService.sendSMS(oldBooking.contactInfo.phone, message);
        logger.success(`Ticket change SMS sent to: ${oldBooking.contactInfo.phone}`);
      } catch (error) {
        logger.error(`Failed to send ticket change SMS: ${error.message}`);
      }

      return {
        success: true,
        oldTicket,
        oldBooking,
        newTicket,
        newBooking,
        priceInfo: {
          oldPrice,
          newPrice: newFinalPrice,
          difference: priceDifference,
          changeFee,
          refundAmount: refundResult?.refundAmount || 0,
        },
        paymentResult,
        refundResult,
      };
    } else {
      // Payment required for the difference
      return {
        success: false,
        requiresPayment: true,
        oldTicket,
        newBooking, // Booking in pending state
        priceInfo: {
          oldPrice,
          newPrice: newFinalPrice,
          difference: priceDifference,
          changeFee,
          amountToPay: priceDifference,
        },
        paymentResult,
        message: 'Vui lòng thanh toán phần chênh lệch để hoàn tất đổi vé',
      };
    }
  }

  /**
   * Resend ticket notifications
   * @param {string} ticketId - Ticket ID
   * @returns {Promise<Object>} Send result
   */
  static async resendTicket(ticketId) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Không tìm thấy vé');
    }

    // Reset notification flags
    ticket.emailSent = false;
    ticket.smsSent = false;
    await ticket.save();

    // Resend notifications
    return await this.sendTicketNotifications(ticketId);
  }
}

export default TicketService;

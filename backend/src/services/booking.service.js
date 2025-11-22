import Booking from '../models/Booking.js';
import Trip from '../models/Trip.js';
import SeatLockService from './seatLock.service.js';
import VoucherService from './voucher.service.js';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

// Lazy-load PaymentService to avoid circular dependency
let PaymentService = null;
const getPaymentService = async () => {
  if (!PaymentService) {
    const module = await import('./payment.service.js');
    PaymentService = module.default;
  }
  return PaymentService;
};

/**
 * Booking Service
 * Manages bookings with seat hold/lock mechanism
 */
class BookingService {
  /**
   * Hold seats temporarily (15 minutes)
   * @param {Object} holdData - Seat hold data
   * @returns {Promise<Object>} Booking and lock information
   */
  static async holdSeats(holdData) {
    const { tripId, seats, contactInfo, customerId, pickupPoint, dropoffPoint, voucherCode } = holdData;

    // Validate trip exists and is bookable
    const trip = await Trip.findById(tripId)
      .populate('routeId')
      .populate('busId')
      .populate('operatorId');

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    if (trip.status !== 'scheduled') {
      throw new Error('Chuyến xe không ở trạng thái có thể đặt');
    }

    if (new Date(trip.departureTime) < new Date()) {
      throw new Error('Chuyến xe đã khởi hành');
    }

    // Check if enough seats available
    const requestedSeats = seats.map((s) => s.seatNumber);
    if (trip.availableSeats < requestedSeats.length) {
      throw new Error('Không đủ ghế trống');
    }

    // Check if seats are already booked
    const bookedSeatNumbers = trip.bookedSeats.map((s) => s.seatNumber);
    const alreadyBooked = requestedSeats.filter((seat) =>
      bookedSeatNumbers.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      throw new Error(`Ghế ${alreadyBooked.join(', ')} đã được đặt`);
    }

    // Generate session ID for lock
    const sessionId = customerId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Try to lock seats in Redis
    const lockResult = await SeatLockService.lockSeats(
      tripId,
      requestedSeats,
      sessionId
    );

    if (!lockResult.success || lockResult.failed.length > 0) {
      const failedSeats = lockResult.failed.map((f) => f.seatNumber);
      throw new Error(`Ghế ${failedSeats.join(', ')} đang được người khác chọn`);
    }

    // Calculate pricing
    const seatPrice = trip.finalPrice;
    const totalPrice = seatPrice * seats.length;
    const discount = 0;

    // Validate voucher if provided
    let voucherValidation = null;
    let voucherDiscount = 0;
    let voucherId = null;

    if (voucherCode) {
      try {
        voucherValidation = await VoucherService.validateForBooking(voucherCode, {
          tripId,
          customerId,
          totalAmount: totalPrice,
        });

        voucherDiscount = voucherValidation.discountAmount;
        voucherId = voucherValidation.voucher.id;
      } catch (error) {
        // Don't fail the whole booking if voucher is invalid, just ignore it
        logger.warn(`Voucher validation failed for booking: ${error.message}`);
      }
    }

    // Calculate final price (discount + voucher)
    let finalPrice = totalPrice * (1 - discount / 100);
    finalPrice = Math.max(0, finalPrice - voucherDiscount);

    // Create temporary booking
    const bookingCode = await Booking.generateBookingCode();

    const booking = await Booking.create({
      bookingCode,
      tripId,
      customerId: customerId || null,
      operatorId: trip.operatorId._id,
      status: 'pending',
      seats: seats.map((seat) => ({
        seatNumber: seat.seatNumber,
        price: seatPrice,
        passengerName: seat.passengerName,
        passengerPhone: seat.passengerPhone,
        passengerEmail: seat.passengerEmail,
        passengerIdCard: seat.passengerIdCard,
      })),
      contactInfo,
      pickupPoint,
      dropoffPoint,
      totalPrice,
      discount,
      voucherCode: voucherCode || undefined,
      voucherId: voucherId || undefined,
      voucherDiscount,
      finalPrice,
      isGuestBooking: !customerId,
      isHeld: true,
      heldUntil: lockResult.expiresAt,
    });

    logger.success(`Booking ${bookingCode} created - Trip: ${tripId} - ${seats.length} seat(s) held`);

    return {
      booking: await Booking.findById(booking._id)
        .populate('tripId')
        .populate('operatorId', 'companyName phone email'),
      lockInfo: {
        sessionId,
        lockedSeats: lockResult.locked,
        expiresAt: lockResult.expiresAt,
        expiresIn: lockResult.expiresIn,
      },
    };
  }

  /**
   * Confirm booking and finalize seat reservation
   * @param {string} bookingId - Booking ID
   * @param {string} sessionId - Session ID used for lock
   * @returns {Promise<Booking>} Confirmed booking
   */
  static async confirmBooking(bookingId, sessionId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking không ở trạng thái pending');
    }

    // Check if hold expired
    if (booking.isExpired) {
      throw new Error('Booking đã hết hạn. Vui lòng đặt lại.');
    }

    // Get trip and update booked seats
    const trip = await Trip.findById(booking.tripId);

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    // Add seats to trip's booked seats
    const seatNumbers = booking.seats.map((s) => s.seatNumber);

    for (const seat of booking.seats) {
      trip.bookedSeats.push({
        seatNumber: seat.seatNumber,
        bookingId: booking._id,
        passengerName: seat.passengerName,
      });
    }

    trip.availableSeats -= seatNumbers.length;
    await trip.save();

    // Confirm booking
    booking.confirm();
    await booking.save();

    // Increment voucher usage if voucher was applied
    if (booking.voucherId) {
      try {
        await VoucherService.applyToBooking(booking.voucherId);
      } catch (error) {
        logger.error(`Failed to increment voucher usage for booking ${bookingId}: ${error.message}`);
      }
    }

    // Release Redis locks
    await SeatLockService.releaseSeats(booking.tripId, seatNumbers, sessionId);

    logger.success(`Booking ${booking.bookingCode} confirmed - ${seatNumbers.length} seat(s) booked`);

    return await Booking.findById(booking._id)
      .populate('tripId')
      .populate('operatorId', 'companyName phone email')
      .populate('voucherId');
  }

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @param {string} cancelledBy - Who cancelled (customer, operator, system)
   * @param {string} ipAddress - IP address
   * @param {number} refundAmount - Specific refund amount (optional, for policy-based refunds)
   * @returns {Promise<Object>} Cancelled booking with refund result
   */
  static async cancelBooking(bookingId, reason, cancelledBy = 'customer', ipAddress = '127.0.0.1', refundAmount = null) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new Error('Không thể hủy booking này');
    }

    // If booking is confirmed, release seats back to trip
    if (booking.status === 'confirmed') {
      const trip = await Trip.findById(booking.tripId);

      if (trip) {
        // Remove from booked seats
        const seatNumbers = booking.seats.map((s) => s.seatNumber);
        trip.bookedSeats = trip.bookedSeats.filter(
          (s) => !seatNumbers.includes(s.seatNumber)
        );
        trip.availableSeats += seatNumbers.length;
        await trip.save();
      }
    }

    // Release voucher usage if voucher was applied
    if (booking.status === 'confirmed' && booking.voucherId) {
      try {
        await VoucherService.releaseFromBooking(booking.voucherId);
      } catch (error) {
        logger.error(`Failed to release voucher usage for booking ${bookingId}: ${error.message}`);
      }
    }

    // Auto-refund if payment was made
    let refundResult = null;
    if (booking.paymentStatus === 'paid' && booking.status === 'confirmed') {
      try {
        const PaymentServiceClass = await getPaymentService();
        refundResult = await PaymentServiceClass.autoRefundOnCancellation(
          bookingId,
          reason,
          ipAddress,
          refundAmount // Pass specific refund amount from cancellation policy
        );

        if (refundResult.success) {
          logger.success(`Auto-refund successful for booking ${booking.bookingCode}`);
        } else {
          logger.error(`Auto-refund failed for booking ${booking.bookingCode}`);
        }
      } catch (error) {
        logger.error(`Auto-refund error for booking ${bookingId}: ${error.message}`);
        // Don't fail the cancellation if refund fails
      }
    }

    // Cancel booking
    booking.cancel(reason, cancelledBy);
    await booking.save();

    logger.warn(`Booking ${booking.bookingCode} cancelled - Reason: ${reason} - By: ${cancelledBy}`);

    return {
      booking,
      refundResult,
    };
  }

  /**
   * Extend seat hold
   * @param {string} bookingId - Booking ID
   * @param {string} sessionId - Session ID
   * @param {number} minutes - Minutes to extend (default 15)
   * @returns {Promise<Object>} Extended booking and lock info
   */
  static async extendHold(bookingId, sessionId, minutes = 15) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    if (!booking.isHeld || booking.status !== 'pending') {
      throw new Error('Booking không ở trạng thái hold');
    }

    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    const duration = minutes * 60;

    const lockResult = await SeatLockService.extendLock(
      booking.tripId,
      seatNumbers,
      sessionId,
      duration
    );

    if (!lockResult.success) {
      throw new Error('Không thể gia hạn hold. Ghế có thể đã được người khác chọn.');
    }

    // Update booking
    booking.heldUntil = lockResult.expiresAt;
    await booking.save();

    logger.info(`Booking ${booking.bookingCode} hold extended - New expiry: ${minutes} minutes`);

    return {
      booking: await Booking.findById(booking._id),
      lockInfo: {
        extendedSeats: lockResult.extended,
        expiresAt: lockResult.expiresAt,
        expiresIn: lockResult.expiresIn,
      },
    };
  }

  /**
   * Release seat hold manually
   * @param {string} bookingId - Booking ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Booking>} Cancelled booking
   */
  static async releaseHold(bookingId, sessionId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    if (!booking.isHeld) {
      return booking; // Already released
    }

    // Release locks
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await SeatLockService.releaseSeats(booking.tripId, seatNumbers, sessionId);

    // Cancel booking if still pending
    if (booking.status === 'pending') {
      booking.cancel('Khách hủy hold', 'customer');
      await booking.save();
    }

    return booking;
  }

  /**
   * Get booking by ID
   * @param {string} bookingId - Booking ID
   * @param {string} customerId - Customer ID (optional, for authorization)
   * @returns {Promise<Booking>} Booking details
   */
  static async getBookingById(bookingId, customerId = null) {
    const booking = await Booking.findById(bookingId)
      .populate('tripId')
      .populate('operatorId', 'companyName phone email');

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    // If customerId provided, verify ownership
    if (customerId && booking.customerId && booking.customerId.toString() !== customerId) {
      throw new Error('Không có quyền truy cập booking này');
    }

    return booking;
  }

  /**
   * Get booking by code (for guests)
   * @param {string} bookingCode - Booking code
   * @param {string} phone - Contact phone for verification
   * @returns {Promise<Booking>} Booking details
   */
  static async getBookingByCode(bookingCode, phone) {
    const booking = await Booking.findOne({ bookingCode })
      .populate({
        path: 'tripId',
        populate: {
          path: 'routeId',
          select: 'fromCity toCity origin destination',
        },
      })
      .populate('operatorId', 'companyName phone email');

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    // Verify phone number
    if (booking.contactInfo.phone !== phone) {
      throw new Error('Số điện thoại không khớp');
    }

    return booking;
  }

  /**
   * Get available seats for a trip (excluding locked and booked)
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Available seats information
   */
  static async getAvailableSeats(tripId) {
    const trip = await Trip.findById(tripId).populate('busId');

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    // Get booked seats
    const bookedSeats = trip.bookedSeats.map((s) => s.seatNumber);

    // Get locked seats from Redis
    const lockedSeats = await SeatLockService.getLockedSeats(tripId);

    // Get all seats from bus layout
    const allSeats = trip.busId.seatLayout.seats || [];
    const availableSeats = allSeats.filter(
      (seat) => !bookedSeats.includes(seat.number) && !lockedSeats.includes(seat.number)
    );

    return {
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      bookedSeats,
      lockedSeats,
      availableSeatNumbers: availableSeats.map((s) => s.number),
      seatLayout: trip.busId.seatLayout,
    };
  }

  /**
   * Cleanup expired holds
   * @returns {Promise<number>} Number of cleaned bookings
   */
  static async cleanupExpiredHolds() {
    const expiredBookings = await Booking.findExpiredHolds();

    let cleaned = 0;
    for (const booking of expiredBookings) {
      // Release booking
      booking.cancel('Hết thời gian hold', 'system');
      booking.releaseHold();
      await booking.save();
      cleaned++;
    }

    return cleaned;
  }

  /**
   * Get bookings for customer
   * @param {string} customerId - Customer ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Bookings
   */
  static async getCustomerBookings(customerId, filters = {}) {
    return await Booking.findByCustomer(customerId, filters);
  }

  /**
   * Get bookings for operator
   * @param {string} operatorId - Operator ID
   * @param {Object} filters - Filters
   * @returns {Promise<Array>} Bookings
   */
  static async getOperatorBookings(operatorId, filters = {}) {
    return await Booking.findByOperator(operatorId, filters);
  }

  /**
   * Update booking payment
   * @param {string} bookingId - Booking ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Booking>} Updated booking
   */
  static async updatePayment(bookingId, paymentData) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Không tìm thấy booking');
    }

    const { paymentId, paymentMethod, paymentStatus } = paymentData;

    if (paymentStatus === 'paid') {
      booking.markAsPaid(paymentId, paymentMethod);
    } else {
      booking.paymentStatus = paymentStatus;
      booking.paymentId = paymentId;
      booking.paymentMethod = paymentMethod;
    }

    await booking.save();

    return booking;
  }

  /**
   * Get booking statistics for operator
   * @param {string} operatorId - Operator ID
   * @param {Object} filters - Date filters
   * @returns {Promise<Object>} Statistics
   */
  static async getStatistics(operatorId, filters = {}) {
    const query = { operatorId: new mongoose.Types.ObjectId(operatorId) };

    if (filters.fromDate && filters.toDate) {
      query.createdAt = {
        $gte: new Date(filters.fromDate),
        $lte: new Date(filters.toDate),
      };
    }

    const [statusStats, paymentStats, totalRevenue] = await Promise.all([
      // Status breakdown
      Booking.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Payment status breakdown
      Booking.aggregate([
        { $match: query },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
      ]),

      // Total revenue
      Booking.aggregate([
        {
          $match: {
            ...query,
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$finalPrice' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Calculate total bookings
    const totalBookings = await Booking.countDocuments(query);

    // Format status stats
    const statusBreakdown = {};
    statusStats.forEach((stat) => {
      statusBreakdown[stat._id] = stat.count;
    });

    const paymentBreakdown = {};
    paymentStats.forEach((stat) => {
      paymentBreakdown[stat._id] = stat.count;
    });

    return {
      totalBookings,
      statusBreakdown,
      paymentBreakdown,
      revenue: {
        total: totalRevenue[0]?.total || 0,
        paidBookings: totalRevenue[0]?.count || 0,
        averageBookingValue: totalRevenue[0]?.count
          ? (totalRevenue[0].total / totalRevenue[0].count).toFixed(2)
          : 0,
      },
    };
  }
}

export default BookingService;

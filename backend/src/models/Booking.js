import mongoose from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Booking Schema
 * Represents a ticket booking with seat selections and passenger details
 */
const BookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Chuyến xe là bắt buộc'],
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusOperator',
      required: [true, 'Nhà xe là bắt buộc'],
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
      default: 'pending',
      index: true,
    },

    seats: [
      {
        seatNumber: { type: String, required: true },
        price: { type: Number, required: true },
        passengerName: { type: String, required: true },
        passengerPhone: String,
        passengerEmail: String,
        passengerIdCard: String,
      },
    ],

    contactInfo: {
      name: { type: String, required: [true, 'Tên liên hệ là bắt buộc'] },
      phone: { type: String, required: [true, 'Số điện thoại liên hệ là bắt buộc'] },
      email: String,
    },

    pickupPoint: { name: String, address: String, time: Date },
    dropoffPoint: { name: String, address: String, time: Date },

    totalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },

    voucherCode: { type: String, uppercase: true },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
    voucherDiscount: { type: Number, default: 0, min: 0 },

    finalPrice: { type: Number, required: true, min: 0 },

    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'momo', 'vnpay', 'zalopay'],
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },

    paymentId: String,
    paidAt: Date,

    cancelledAt: Date,
    cancelReason: String,
    cancelledBy: { type: String, enum: ['customer', 'operator', 'system'] },
    refundAmount: { type: Number, min: 0 },
    refundedAt: Date,

    specialRequests: String,
    operatorNotes: String,

    isGuestBooking: { type: Boolean, default: false },
    isHeld: { type: Boolean, default: false },
    heldUntil: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes
BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ operatorId: 1, createdAt: -1 });
BookingSchema.index({ tripId: 1, status: 1 });
BookingSchema.index({ status: 1, paymentStatus: 1 });
BookingSchema.index({ bookingCode: 1 });

// Virtual fields
BookingSchema.virtual('numberOfSeats').get(function () {
  return this.seats?.length ?? 0;
});

BookingSchema.virtual('isExpired').get(function () {
  return this.isHeld && this.heldUntil && new Date() > this.heldUntil;
});

BookingSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed'].includes(this.status);
});

// Static Methods
BookingSchema.statics.generateBookingCode = async function () {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let code, exists = true;

  while (exists) {
    const random = Math.floor(100000 + Math.random() * 900000);
    code = `BK${dateStr}${random}`;
    exists = await this.exists({ bookingCode: code });
  }

  logger.info(`Generated booking code: ${code}`);
  return code;
};

BookingSchema.statics.findByCustomer = function (customerId, filters = {}) {
  const query = { customerId };
  if (filters.status) query.status = filters.status;
  if (filters.fromDate && filters.toDate) {
    query.createdAt = {
      $gte: new Date(filters.fromDate),
      $lte: new Date(filters.toDate),
    };
  }
  return this.find(query)
    .populate('tripId')
    .populate('operatorId', 'companyName phone email')
    .sort({ createdAt: -1 });
};

BookingSchema.statics.findByOperator = function (operatorId, filters = {}) {
  const query = { operatorId };
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.fromDate && filters.toDate) {
    query.createdAt = {
      $gte: new Date(filters.fromDate),
      $lte: new Date(filters.toDate),
    };
  }
  return this.find(query)
    .populate('tripId')
    .populate('customerId', 'fullName phone email')
    .sort({ createdAt: -1 });
};

BookingSchema.statics.findExpiredHolds = function () {
  return this.find({ isHeld: true, heldUntil: { $lt: new Date() }, status: 'pending' });
};

// Instance Methods
BookingSchema.methods.confirm = function () {
  this.status = 'confirmed';
  this.isHeld = false;
  this.heldUntil = null;
  logger.info(`Booking ${this.bookingCode} confirmed`);
};

BookingSchema.methods.cancel = function (reason, cancelledBy = 'customer') {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.cancelledBy = cancelledBy;
  logger.info(`Booking ${this.bookingCode} cancelled by ${cancelledBy}: ${reason}`);
};

BookingSchema.methods.markAsPaid = function (paymentId, paymentMethod) {
  this.paymentStatus = 'paid';
  this.paymentId = paymentId;
  this.paymentMethod = paymentMethod;
  this.paidAt = new Date();
  this.confirm();
  logger.info(`Booking ${this.bookingCode} marked as paid via ${paymentMethod}`);
};

BookingSchema.methods.processRefund = function (amount) {
  this.status = 'refunded';
  this.paymentStatus = 'refunded';
  this.refundAmount = amount;
  this.refundedAt = new Date();
  logger.info(`Booking ${this.bookingCode} refunded: ${amount}`);
};

BookingSchema.methods.hold = function (minutes = 15) {
  this.isHeld = true;
  this.heldUntil = new Date(Date.now() + minutes * 60 * 1000);
  logger.info(`Booking ${this.bookingCode} held for ${minutes} minutes`);
};

BookingSchema.methods.releaseHold = function () {
  this.isHeld = false;
  this.heldUntil = null;
  logger.info(`Booking ${this.bookingCode} hold released`);
};

// Pre-save middleware
BookingSchema.pre('save', function (next) {
  if (this.isModified('discount') || this.isModified('totalPrice') || this.isModified('voucherDiscount')) {
    let price = this.totalPrice * (1 - this.discount / 100);
    price = Math.max(0, price - this.voucherDiscount);
    this.finalPrice = price;
    logger.debug(`Final price calculated for ${this.bookingCode}: ${price}`);
  }
  next();
});

export default mongoose.model('Booking', BookingSchema);

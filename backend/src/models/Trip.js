import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Trip Schema
 * Quản lý lịch trình chuyến xe
 */

// Sub-schema for journey status history
const JourneyStatusSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['preparing', 'checking_tickets', 'in_transit', 'at_stop', 'completed', 'cancelled'],
    },
    stopIndex: {
      type: Number,
      default: -1,
      // -1: Không liên quan đến stop
      // 0: Điểm xuất phát
      // 1+: Stop thứ N
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    notes: {
      type: String,
      maxlength: [500, 'Ghi chú không quá 500 ký tự'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
    },
  },
  { _id: true }
);

const TripSchema = new mongoose.Schema(
  {
    // References
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: [true, 'Route là bắt buộc'],
      index: true,
    },

    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus là bắt buộc'],
      index: true,
    },

    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusOperator',
      required: [true, 'Operator là bắt buộc'],
      index: true,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Tài xế là bắt buộc'],
      validate: {
        validator: async function (v) {
          if (!v) return false;
          const Employee = mongoose.model('Employee');
          const driver = await Employee.findById(v);
          return driver && driver.role === 'driver' && driver.status === 'active';
        },
        message: 'Tài xế không hợp lệ hoặc không hoạt động',
      },
    },

    tripManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Quản lý chuyến là bắt buộc'],
      validate: {
        validator: async function (v) {
          if (!v) return false;
          const Employee = mongoose.model('Employee');
          const manager = await Employee.findById(v);
          return manager && manager.role === 'trip_manager' && manager.status === 'active';
        },
        message: 'Quản lý chuyến không hợp lệ hoặc không hoạt động',
      },
    },

    // Trip Details
    departureTime: {
      type: Date,
      required: [true, 'Giờ khởi hành là bắt buộc'],
      index: true,
      validate: {
        validator: function (v) {
          // Departure must be in the future (for new trips)
          if (this.isNew) {
            return v > new Date();
          }
          return true;
        },
        message: 'Giờ khởi hành phải trong tương lai',
      },
    },

    arrivalTime: {
      type: Date,
      required: [true, 'Giờ đến là bắt buộc'],
      validate: {
        validator: function (v) {
          return v > this.departureTime;
        },
        message: 'Giờ đến phải sau giờ khởi hành',
      },
    },

    // Pricing
    basePrice: {
      type: Number,
      required: [true, 'Giá vé là bắt buộc'],
      min: [0, 'Giá vé không thể âm'],
    },

    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount không thể âm'],
      max: [100, 'Discount không thể vượt quá 100%'],
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    // Dynamic Pricing Configuration
    dynamicPricing: {
      enabled: {
        type: Boolean,
        default: false,
      },

      // Surge pricing based on occupancy
      demandMultiplier: {
        enabled: { type: Boolean, default: true },
        // When occupancy > 80%, apply surge pricing
        highDemandThreshold: { type: Number, default: 80, min: 0, max: 100 },
        highDemandMultiplier: { type: Number, default: 1.2, min: 1, max: 3 },
        // When occupancy > 90%, apply higher surge
        veryHighDemandThreshold: { type: Number, default: 90, min: 0, max: 100 },
        veryHighDemandMultiplier: { type: Number, default: 1.5, min: 1, max: 3 },
      },

      // Early bird discount
      earlyBirdDiscount: {
        enabled: { type: Boolean, default: true },
        // Discount if booked > 7 days in advance
        daysBeforeDeparture: { type: Number, default: 7, min: 1 },
        discountPercentage: { type: Number, default: 10, min: 0, max: 50 },
      },

      // Peak hours premium
      peakHoursPremium: {
        enabled: { type: Boolean, default: true },
        peakHours: [{ type: Number, min: 0, max: 23 }], // e.g., [7, 8, 17, 18, 19]
        premiumPercentage: { type: Number, default: 15, min: 0, max: 50 },
      },

      // Weekend premium
      weekendPremium: {
        enabled: { type: Boolean, default: true },
        premiumPercentage: { type: Number, default: 10, min: 0, max: 50 },
      },
    },

    // Seat Availability
    totalSeats: {
      type: Number,
      required: true,
      min: [1, 'Phải có ít nhất 1 ghế'],
    },

    availableSeats: {
      type: Number,
      required: true,
      min: [0, 'Available seats không thể âm'],
    },

    bookedSeats: [
      {
        seatNumber: {
          type: String,
          required: true,
        },
        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Booking',
          required: true,
        },
        passengerName: {
          type: String,
          required: true,
        },
      },
    ],

    // Status
    status: {
      type: String,
      enum: {
        values: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        message: 'Trạng thái không hợp lệ',
      },
      default: 'scheduled',
      index: true,
    },

    // Cancellation
    cancelledAt: {
      type: Date,
    },

    cancelReason: {
      type: String,
      maxlength: [500, 'Lý do hủy không quá 500 ký tự'],
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusOperator',
    },

    // Recurring Trip Info (optional)
    isRecurring: {
      type: Boolean,
      default: false,
    },

    recurringGroupId: {
      type: String,
      index: true,
      sparse: true,
    },

    // Notes
    notes: {
      type: String,
      maxlength: [1000, 'Ghi chú không quá 1000 ký tự'],
    },

    // Journey Tracking
    journey: {
      currentStopIndex: {
        type: Number,
        default: -1,
        // -1: Chưa bắt đầu
        // 0: Đang ở điểm xuất phát
        // 1+: Đang ở stop thứ N
        // Khi đến đích: số lượng stops + 1
      },
      currentStatus: {
        type: String,
        enum: ['preparing', 'checking_tickets', 'in_transit', 'at_stop', 'completed', 'cancelled'],
        default: 'preparing',
      },
      statusHistory: {
        type: [JourneyStatusSchema],
        default: [],
      },
      actualDepartureTime: {
        type: Date,
        // Thời gian khởi hành thực tế
      },
      actualArrivalTime: {
        type: Date,
        // Thời gian đến đích thực tế
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Indexes
 */
// Query trips by operator and date range
TripSchema.index({ operatorId: 1, departureTime: 1 });

// Query trips by route and date
TripSchema.index({ routeId: 1, departureTime: 1 });

// Query trips by status
TripSchema.index({ operatorId: 1, status: 1 });

// Search available trips
TripSchema.index({ status: 1, departureTime: 1, availableSeats: 1 });

// Price-based search (for filtering by price range)
TripSchema.index({ status: 1, finalPrice: 1, departureTime: 1 });

// Bus-based search (for filtering by bus type)
TripSchema.index({ busId: 1, status: 1, departureTime: 1 });

// Recurring trips
TripSchema.index({ recurringGroupId: 1 });

/**
 * Pre-save Middleware
 */
TripSchema.pre('save', async function (next) {
  try {
    // Calculate final price if not already set
    if (!this.finalPrice || this.isModified('basePrice') || this.isModified('discount')) {
      const discount = this.discount || 0;
      this.finalPrice = this.basePrice * (1 - discount / 100);
    }

    // Set totalSeats from bus if not set
    if (this.isNew && !this.totalSeats) {
      const Bus = mongoose.model('Bus');
      const bus = await Bus.findById(this.busId);
      if (bus && bus.seatLayout && bus.seatLayout.totalSeats) {
        this.totalSeats = bus.seatLayout.totalSeats;
        this.availableSeats = this.totalSeats;
      } else {
        // Fallback: set default values if bus seatLayout is not available
        throw new Error('Bus không có thông tin sơ đồ ghế (seatLayout). Vui lòng cập nhật thông tin xe trước.');
      }
    }

    // Initialize availableSeats if not set
    if (this.isNew && !this.availableSeats && this.totalSeats) {
      this.availableSeats = this.totalSeats;
    }

    // Update available seats based on booked seats
    if (this.isModified('bookedSeats')) {
      this.availableSeats = this.totalSeats - this.bookedSeats.length;
    }

    // Log new trip creation
    if (this.isNew) {
      logger.success(`New trip created: ${this._id} - Departure: ${this.departureTime} - Price: ${this.finalPrice} VND - Seats: ${this.totalSeats}`);
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Virtual: Duration in minutes
 */
TripSchema.virtual('duration').get(function () {
  if (this.departureTime && this.arrivalTime) {
    return Math.round((this.arrivalTime - this.departureTime) / (1000 * 60));
  }
  return null;
});

/**
 * Virtual: Occupancy rate
 */
TripSchema.virtual('occupancyRate').get(function () {
  if (this.totalSeats > 0) {
    return ((this.bookedSeats.length / this.totalSeats) * 100).toFixed(2);
  }
  return 0;
});

/**
 * Virtual: Is full
 */
TripSchema.virtual('isFull').get(function () {
  return this.availableSeats === 0;
});

/**
 * Virtual: Can be booked
 */
TripSchema.virtual('canBeBooked').get(function () {
  return (
    this.status === 'scheduled' &&
    this.availableSeats > 0 &&
    new Date(this.departureTime) > new Date()
  );
});

/**
 * Instance Methods
 */

/**
 * Book seats for this trip
 * @param {Array<String>} seats - Seat numbers to book
 * @returns {Promise<void>}
 */
TripSchema.methods.bookSeats = async function (seats) {
  // Check if seats are available
  const unavailableSeats = seats.filter((seat) => this.bookedSeats.includes(seat));
  if (unavailableSeats.length > 0) {
    throw new Error(`Ghế đã được đặt: ${unavailableSeats.join(', ')}`);
  }

  // Check if enough seats available
  if (seats.length > this.availableSeats) {
    throw new Error('Không đủ ghế trống');
  }

  // Add seats to booked list
  this.bookedSeats.push(...seats);
  logger.success(`Booked seats ${seats.join(', ')} for trip ${this._id} - Available: ${this.availableSeats - seats.length}/${this.totalSeats}`);
  await this.save();
};

/**
 * Cancel booking for specific seats
 * @param {Array<String>} seats - Seat numbers to cancel
 * @returns {Promise<void>}
 */
TripSchema.methods.cancelSeats = async function (seats) {
  this.bookedSeats = this.bookedSeats.filter((seat) => !seats.includes(seat));
  logger.warn(`Cancelled seats ${seats.join(', ')} for trip ${this._id} - Available: ${this.availableSeats + seats.length}/${this.totalSeats}`);
  await this.save();
};

/**
 * Check if trip can be cancelled
 * @returns {Boolean}
 */
TripSchema.methods.canBeCancelled = function () {
  return (
    this.status === 'scheduled' &&
    new Date(this.departureTime) > new Date() &&
    this.bookedSeats.length === 0
  );
};

/**
 * Update trip status with validation
 * @param {string} newStatus - New status (scheduled, ongoing, completed, cancelled)
 * @param {Object} options - Additional options (reason, userId)
 * @returns {Promise<void>}
 */
TripSchema.methods.updateStatus = async function (newStatus, options = {}) {
  const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
  }

  const oldStatus = this.status;

  // Validate status transitions
  const validTransitions = {
    scheduled: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[oldStatus].includes(newStatus)) {
    throw new Error(
      `Không thể chuyển từ trạng thái "${oldStatus}" sang "${newStatus}"`
    );
  }

  // Update status
  this.status = newStatus;

  // Handle specific status changes
  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelReason = options.reason || 'Không có lý do';
    this.cancelledBy = options.userId || null;
    // Also update journey status
    if (this.journey) {
      this.journey.currentStatus = 'cancelled';
    }
    logger.warn(`Trip ${this._id} cancelled - Reason: ${this.cancelReason}`);
  }

  // Sync journey status when starting trip
  if (newStatus === 'ongoing' && this.journey && this.journey.currentStatus === 'preparing') {
    this.journey.currentStatus = 'checking_tickets';
    logger.info(`Trip ${this._id} started - Status changed from ${oldStatus} to ${newStatus}`);
  }

  if (newStatus === 'completed') {
    logger.success(`Trip ${this._id} completed successfully`);
  }

  await this.save();

  // Notify passengers about status change (async, don't wait)
  try {
    const { default: NotificationService } = await import('../services/notification.service.js');

    // Populate route for notification
    await this.populate('routeId');

    NotificationService.notifyTripStatusChange(this, oldStatus, newStatus).catch((error) => {
      logger.error(`Error sending notifications: ${error.message}`);
    });
  } catch (error) {
    logger.error(`Error in notification service: ${error.message}`);
    // Don't throw error - status update should succeed even if notifications fail
  }

  return { oldStatus, newStatus };
};

/**
 * Update journey status - for Trip Manager to update current location and status
 * @param {Object} data - Update data
 * @param {string} data.status - New journey status
 * @param {number} data.stopIndex - Current stop index
 * @param {Object} data.location - Current location {lat, lng}
 * @param {string} data.notes - Notes for this update
 * @param {ObjectId} data.updatedBy - Employee ID who made the update
 * @returns {Promise<Object>}
 */
TripSchema.methods.updateJourneyStatus = async function (data) {
  const { status, stopIndex, location, notes, updatedBy } = data;

  // Validate status
  const validJourneyStatuses = ['preparing', 'checking_tickets', 'in_transit', 'at_stop', 'completed', 'cancelled'];
  if (!validJourneyStatuses.includes(status)) {
    throw new Error(`Trạng thái hành trình không hợp lệ: ${status}`);
  }

  // Initialize journey if not exists
  if (!this.journey) {
    this.journey = {
      currentStopIndex: -1,
      currentStatus: 'preparing',
      statusHistory: [],
    };
  }

  // Get route to check total stops
  await this.populate('routeId');
  const totalStops = this.routeId?.stops?.length || 0;

  // Update current status
  const oldStatus = this.journey.currentStatus;

  // Automatic progression logic
  // currentStopIndex represents the last stop we've reached (0-based)
  // -1 = haven't reached any stop yet (at origin or on the way to first stop)
  // 0 = reached stop 0 (first stop)
  // 1 = reached stop 1 (second stop), etc.
  let newStopIndex = this.journey.currentStopIndex;

  if (status === 'at_stop') {
    // When arriving at a stop, update to that stop's index (0-based)
    if (stopIndex !== undefined) {
      // stopIndex from UI is 1-based, convert to 0-based
      newStopIndex = stopIndex - 1;
    }
  } else if (status === 'in_transit') {
    // When changing from checking_tickets to in_transit (starting journey)
    if (oldStatus === 'checking_tickets') {
      // Start heading to first stop (still at origin, so index = -1)
      newStopIndex = -1;
    }
    // When changing from at_stop to in_transit (leaving a stop)
    else if (oldStatus === 'at_stop') {
      // Check if we're leaving the last stop
      const currentStop = this.journey.currentStopIndex;
      if (currentStop >= totalStops - 1) {
        // Just left the last stop, heading to destination
        // Auto-complete the journey
        this.journey.currentStatus = 'completed';
        this.journey.actualArrivalTime = new Date();
        this.status = 'completed';
        newStopIndex = totalStops; // Past all stops
      }
      // Otherwise keep the same stopIndex (we're between stops)
    }
  }

  // Create status history entry
  const historyEntry = {
    status,
    stopIndex: newStopIndex,
    timestamp: new Date(),
    location,
    notes,
    updatedBy,
  };

  this.journey.currentStatus = status;
  this.journey.currentStopIndex = newStopIndex;

  // Update actual times
  if (status === 'in_transit' && !this.journey.actualDepartureTime) {
    this.journey.actualDepartureTime = new Date();
  }

  if (status === 'completed' && !this.journey.actualArrivalTime) {
    this.journey.actualArrivalTime = new Date();
    // Also update main trip status
    this.status = 'completed';
  }

  // Add to history
  this.journey.statusHistory.push(historyEntry);

  // Mark journey as modified for Mongoose
  this.markModified('journey');

  await this.save();

  logger.info(`Journey status updated for trip ${this._id}: ${oldStatus} → ${this.journey.currentStatus} (Stop: ${this.journey.currentStopIndex})`);

  return {
    success: true,
    oldStatus,
    newStatus: this.journey.currentStatus,
    currentStop: this.journey.currentStopIndex,
  };
};

/**
 * Check if status can be changed
 * @param {string} newStatus - Target status
 * @returns {boolean}
 */
TripSchema.methods.canChangeStatus = function (newStatus) {
  const validTransitions = {
    scheduled: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  return validTransitions[this.status]?.includes(newStatus) || false;
};

/**
 * Calculate dynamic price based on demand, time, and other factors
 * @param {Date} bookingDate - Date of booking (default: now)
 * @returns {Object} Price breakdown with dynamic factors
 */
TripSchema.methods.calculateDynamicPrice = function (bookingDate = new Date()) {
  let price = this.basePrice;
  const priceFactors = {
    basePrice: this.basePrice,
    demandSurge: 0,
    earlyBirdDiscount: 0,
    peakHoursPremium: 0,
    weekendPremium: 0,
    finalPrice: this.basePrice,
  };

  // If dynamic pricing is not enabled, return base price
  if (!this.dynamicPricing || !this.dynamicPricing.enabled) {
    priceFactors.finalPrice = this.finalPrice || this.basePrice;
    return priceFactors;
  }

  const config = this.dynamicPricing;
  const occupancyRate = parseFloat(this.occupancyRate);
  const departureTime = new Date(this.departureTime);
  const departureHour = departureTime.getHours();
  const dayOfWeek = departureTime.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilDeparture = Math.floor((departureTime - bookingDate) / (1000 * 60 * 60 * 24));

  // 1. Demand-based surge pricing
  if (config.demandMultiplier?.enabled) {
    if (occupancyRate >= config.demandMultiplier.veryHighDemandThreshold) {
      const surgeAmount = price * (config.demandMultiplier.veryHighDemandMultiplier - 1);
      priceFactors.demandSurge = surgeAmount;
      price += surgeAmount;
    } else if (occupancyRate >= config.demandMultiplier.highDemandThreshold) {
      const surgeAmount = price * (config.demandMultiplier.highDemandMultiplier - 1);
      priceFactors.demandSurge = surgeAmount;
      price += surgeAmount;
    }
  }

  // 2. Early bird discount (negative premium)
  if (config.earlyBirdDiscount?.enabled && daysUntilDeparture >= config.earlyBirdDiscount.daysBeforeDeparture) {
    const discountAmount = this.basePrice * (config.earlyBirdDiscount.discountPercentage / 100);
    priceFactors.earlyBirdDiscount = -discountAmount;
    price -= discountAmount;
  }

  // 3. Peak hours premium
  if (
    config.peakHoursPremium?.enabled &&
    config.peakHoursPremium.peakHours &&
    config.peakHoursPremium.peakHours.includes(departureHour)
  ) {
    const premiumAmount = this.basePrice * (config.peakHoursPremium.premiumPercentage / 100);
    priceFactors.peakHoursPremium = premiumAmount;
    price += premiumAmount;
  }

  // 4. Weekend premium (Saturday = 6, Sunday = 0)
  if (config.weekendPremium?.enabled && (dayOfWeek === 0 || dayOfWeek === 6)) {
    const premiumAmount = this.basePrice * (config.weekendPremium.premiumPercentage / 100);
    priceFactors.weekendPremium = premiumAmount;
    price += premiumAmount;
  }

  // Apply manual discount if any
  if (this.discount > 0) {
    price = price * (1 - this.discount / 100);
  }

  // Ensure price is not negative
  priceFactors.finalPrice = Math.max(0, Math.round(price));

  return priceFactors;
};

/**
 * Static Methods
 */

/**
 * Find trips by operator with filters
 * @param {ObjectId} operatorId
 * @param {Object} filters
 * @returns {Promise<Array>}
 */
TripSchema.statics.findByOperator = function (operatorId, filters = {}) {
  const query = { operatorId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.routeId) {
    query.routeId = filters.routeId;
  }

  if (filters.fromDate && filters.toDate) {
    query.departureTime = {
      $gte: new Date(filters.fromDate),
      $lte: new Date(filters.toDate),
    };
  } else if (filters.fromDate) {
    query.departureTime = { $gte: new Date(filters.fromDate) };
  } else if (filters.toDate) {
    query.departureTime = { $lte: new Date(filters.toDate) };
  }

  return this.find(query)
    .populate('routeId', 'routeName routeCode origin destination')
    .populate('busId', 'busNumber busType seatLayout')
    .populate('driverId', 'fullName phone employeeCode')
    .populate('tripManagerId', 'fullName phone employeeCode')
    .sort({ departureTime: 1 });
};

/**
 * Search available trips for customers
 * @param {Object} criteria - Search criteria
 * @returns {Promise<Array>}
 */
TripSchema.statics.searchAvailableTrips = function (criteria) {
  const query = {
    status: 'scheduled',
    availableSeats: { $gt: 0 },
    departureTime: { $gt: new Date() },
  };

  if (criteria.fromCity && criteria.toCity) {
    // Will need to join with Route to filter by cities
    // For now, filter after populate
  }

  if (criteria.date) {
    const startOfDay = new Date(criteria.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(criteria.date);
    endOfDay.setHours(23, 59, 59, 999);

    query.departureTime = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  return this.find(query)
    .populate('routeId')
    .populate('busId')
    .populate('operatorId', 'companyName averageRating')
    .sort({ departureTime: 1 });
};

const Trip = mongoose.model('Trip', TripSchema);

export default Trip;

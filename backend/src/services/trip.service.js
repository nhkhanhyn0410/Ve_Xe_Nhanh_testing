import Trip from '../models/Trip.js';
import Route from '../models/Route.js';
import Bus from '../models/Bus.js';
import Employee from '../models/Employee.js';

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';


/**
 * Trip Service
 * Business logic cho quản lý lịch trình chuyến xe
 */
class TripService {
  /**
   * Tạo chuyến xe mới
   * @param {ObjectId} operatorId
   * @param {Object} tripData
   * @returns {Promise<Trip>}
   */
  static async create(operatorId, tripData) {
    // Validate references
    const { bus } = await this.validateReferences(operatorId, tripData);

    // Get totalSeats from bus if not provided
    if (!tripData.totalSeats && bus && bus.seatLayout) {
      tripData.totalSeats = bus.seatLayout.totalSeats;
    }

    // Set availableSeats = totalSeats if not provided
    if (!tripData.availableSeats && tripData.totalSeats) {
      tripData.availableSeats = tripData.totalSeats;
    }

    // Calculate finalPrice if not provided
    if (!tripData.finalPrice && tripData.basePrice) {
      const discount = tripData.discount || 0;
      tripData.finalPrice = tripData.basePrice * (1 - discount / 100);
    }

    // Create trip
    const trip = await Trip.create({
      operatorId,
      ...tripData,
    });

    return await Trip.findById(trip._id)
      .populate('routeId', 'routeName routeCode origin destination')
      .populate('busId', 'busNumber busType seatLayout')
      .populate('driverId', 'fullName employeeCode')
      .populate('tripManagerId', 'fullName employeeCode');
  }

  /**
   * Tạo chuyến xe định kỳ (recurring)
   * @param {ObjectId} operatorId
   * @param {Object} tripData - Base trip data
   * @param {Object} recurringConfig - { startDate, endDate, daysOfWeek, timeOfDay }
   * @returns {Promise<Array<Trip>>}
   */
  static async createRecurring(operatorId, tripData, recurringConfig) {
    const { startDate, endDate, daysOfWeek, timeOfDay } = recurringConfig;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
    }

    // Validate references once
    await this.validateReferences(operatorId, tripData);

    // Generate group ID for recurring trips
    const recurringGroupId = uuidv4();

    const trips = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Check if this day is in the daysOfWeek array
      if (daysOfWeek.includes(dayOfWeek)) {
        // Create departure and arrival times for this date
        const [departureHour, departureMinute] = timeOfDay.departure.split(':');
        const departureTime = new Date(currentDate);
        departureTime.setHours(parseInt(departureHour), parseInt(departureMinute), 0, 0);

        const [arrivalHour, arrivalMinute] = timeOfDay.arrival.split(':');
        const arrivalTime = new Date(currentDate);
        arrivalTime.setHours(parseInt(arrivalHour), parseInt(arrivalMinute), 0, 0);

        // If arrival is next day
        if (arrivalTime <= departureTime) {
          arrivalTime.setDate(arrivalTime.getDate() + 1);
        }

        // Only create trips in the future
        if (departureTime > new Date()) {
          const trip = await Trip.create({
            operatorId,
            ...tripData,
            departureTime,
            arrivalTime,
            isRecurring: true,
            recurringGroupId,
          });

          trips.push(trip);
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (trips.length === 0) {
      throw new Error('Không tạo được chuyến nào. Kiểm tra lại ngày và giờ.');
    }

    return trips;
  }

  /**
   * Validate all references (route, bus, employees)
   * @param {ObjectId} operatorId
   * @param {Object} tripData
   * @returns {Promise<Object>} { route, bus, driver, tripManager }
   */
  static async validateReferences(operatorId, tripData) {
    const { routeId, busId, driverId, tripManagerId } = tripData;

    // Verify route exists and belongs to operator
    const route = await Route.findOne({ _id: routeId, operatorId });
    if (!route) {
      throw new Error('Tuyến đường không tồn tại hoặc không thuộc nhà xe này');
    }

    if (!route.isActive) {
      throw new Error('Tuyến đường không hoạt động');
    }

    // Verify bus exists and belongs to operator
    const bus = await Bus.findOne({ _id: busId, operatorId });
    if (!bus) {
      throw new Error('Xe không tồn tại hoặc không thuộc nhà xe này');
    }

    if (bus.status !== 'active') {
      throw new Error('Xe không ở trạng thái hoạt động');
    }

    // Check if bus has seatLayout
    if (!bus.seatLayout || !bus.seatLayout.totalSeats) {
      throw new Error('Xe không có thông tin sơ đồ ghế (seatLayout). Vui lòng cập nhật xe trước khi tạo chuyến.');
    }

    // Verify driver
    const driver = await Employee.findOne({
      _id: driverId,
      operatorId,
      role: 'driver',
    });

    if (!driver) {
      throw new Error('Tài xế không tồn tại hoặc không thuộc nhà xe này');
    }

    if (driver.status !== 'active') {
      throw new Error('Tài xế không ở trạng thái hoạt động');
    }

    // Check driver license expiry
    if (driver.licenseExpiry && new Date(driver.licenseExpiry) <= new Date()) {
      throw new Error('Giấy phép lái xe của tài xế đã hết hạn');
    }

    // Verify trip manager
    const tripManager = await Employee.findOne({
      _id: tripManagerId,
      operatorId,
      role: 'trip_manager',
    });

    if (!tripManager) {
      throw new Error('Quản lý chuyến không tồn tại hoặc không thuộc nhà xe này');
    }

    if (tripManager.status !== 'active') {
      throw new Error('Quản lý chuyến không ở trạng thái hoạt động');
    }

    // Return validated objects
    return { route, bus, driver, tripManager };
  }

  /**
   * Lấy danh sách chuyến của operator
   * @param {ObjectId} operatorId
   * @param {Object} filters
   * @param {Object} options - pagination
   * @returns {Promise<Object>}
   */
  static async getByOperator(operatorId, filters = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'departureTime',
      sortOrder = 'asc',
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const query = { operatorId };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.routeId) {
      query.routeId = filters.routeId;
    }

    if (filters.busId) {
      query.busId = filters.busId;
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

    if (filters.recurringGroupId) {
      query.recurringGroupId = filters.recurringGroupId;
    }

    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate('routeId', 'routeName routeCode origin destination')
        .populate('busId', 'busNumber busType seatLayout')
        .populate('driverId', 'fullName phone employeeCode')
        .populate('tripManagerId', 'fullName phone employeeCode')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Trip.countDocuments(query),
    ]);

    return {
      trips,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết chuyến
   * @param {ObjectId} tripId
   * @param {ObjectId} operatorId - For authorization
   * @returns {Promise<Trip>}
   */
  static async getById(tripId, operatorId) {
    const trip = await Trip.findOne({ _id: tripId, operatorId })
      .populate('routeId')
      .populate('busId')
      .populate('driverId')
      .populate('tripManagerId')
      .populate('operatorId', 'companyName phone email');

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    return trip;
  }

  /**
   * Cập nhật chuyến
   * @param {ObjectId} tripId
   * @param {ObjectId} operatorId
   * @param {Object} updateData
   * @returns {Promise<Trip>}
   */
  static async update(tripId, operatorId, updateData) {
    const trip = await Trip.findOne({ _id: tripId, operatorId });

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    // Cannot update if trip has started or completed
    if (['ongoing', 'completed'].includes(trip.status)) {
      throw new Error('Không thể cập nhật chuyến đã bắt đầu hoặc hoàn thành');
    }

    // Cannot update if there are bookings
    if (trip.bookedSeats.length > 0) {
      throw new Error('Không thể cập nhật chuyến đã có đặt chỗ');
    }

    // Validate references if they're being changed
    if (
      updateData.routeId ||
      updateData.busId ||
      updateData.driverId ||
      updateData.tripManagerId
    ) {
      await this.validateReferences(operatorId, {
        routeId: updateData.routeId || trip.routeId,
        busId: updateData.busId || trip.busId,
        driverId: updateData.driverId || trip.driverId,
        tripManagerId: updateData.tripManagerId || trip.tripManagerId,
      });
    }

    // Update fields
    Object.assign(trip, updateData);
    await trip.save();

    return await Trip.findById(trip._id)
      .populate('routeId', 'routeName routeCode origin destination')
      .populate('busId', 'busNumber busType seatLayout')
      .populate('driverId', 'fullName employeeCode')
      .populate('tripManagerId', 'fullName employeeCode');
  }

  /**
   * Hủy chuyến
   * @param {ObjectId} tripId
   * @param {ObjectId} operatorId
   * @param {String} cancelReason
   * @returns {Promise<Trip>}
   */
  static async cancel(tripId, operatorId, cancelReason) {
    const trip = await Trip.findOne({ _id: tripId, operatorId });

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    if (trip.status === 'cancelled') {
      throw new Error('Chuyến xe đã bị hủy');
    }

    if (trip.status === 'completed') {
      throw new Error('Không thể hủy chuyến đã hoàn thành');
    }

    // Check if trip has bookings
    if (trip.bookedSeats.length > 0) {
      throw new Error(
        'Chuyến có khách đặt. Cần xử lý hoàn tiền trước khi hủy'
      );
    }

    trip.status = 'cancelled';
    trip.cancelledAt = new Date();
    trip.cancelReason = cancelReason;
    trip.cancelledBy = operatorId;

    await trip.save();

    return trip;
  }

  /**
   * Xóa chuyến (hard delete - chỉ cho phép nếu chưa có booking)
   * @param {ObjectId} tripId
   * @param {ObjectId} operatorId
   * @returns {Promise<void>}
   */
  static async delete(tripId, operatorId) {
    const trip = await Trip.findOne({ _id: tripId, operatorId });

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    if (trip.bookedSeats.length > 0) {
      throw new Error('Không thể xóa chuyến đã có đặt chỗ');
    }

    if (trip.status !== 'scheduled') {
      throw new Error('Chỉ có thể xóa chuyến ở trạng thái scheduled');
    }

    await Trip.deleteOne({ _id: tripId });
  }

  /**
   * Lấy thống kê chuyến
   * @param {ObjectId} operatorId
   * @param {Object} dateRange - { fromDate, toDate }
   * @returns {Promise<Object>}
   */
  static async getStatistics(operatorId, dateRange = {}) {
    const mongoose = require('mongoose');

    let operatorObjectId;
    try {
      operatorObjectId = new mongoose.Types.ObjectId(operatorId);
    } catch (error) {
      operatorObjectId = operatorId;
    }

    const query = { operatorId: operatorObjectId };

    if (dateRange.fromDate && dateRange.toDate) {
      query.departureTime = {
        $gte: new Date(dateRange.fromDate),
        $lte: new Date(dateRange.toDate),
      };
    }

    const [totalTrips, tripsByStatus, avgOccupancy] = await Promise.all([
      Trip.countDocuments(query),

      Trip.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Trip.aggregate([
        { $match: { ...query, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            avgOccupancy: {
              $avg: {
                $multiply: [
                  {
                    $divide: [
                      { $size: '$bookedSeats' },
                      '$totalSeats',
                    ],
                  },
                  100,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const statusStats = {};
    tripsByStatus.forEach((item) => {
      statusStats[item._id] = item.count;
    });

    return {
      totalTrips,
      scheduled: statusStats.scheduled || 0,
      ongoing: statusStats.ongoing || 0,
      completed: statusStats.completed || 0,
      cancelled: statusStats.cancelled || 0,
      averageOccupancyRate: avgOccupancy[0]?.avgOccupancy?.toFixed(2) || 0,
      tripsByStatus: statusStats,
    };
  }

  /**
   * Search available trips (for customers)
   * @param {Object} searchCriteria - Search and filter criteria
   * @param {string} searchCriteria.fromCity - Origin city
   * @param {string} searchCriteria.toCity - Destination city
   * @param {string} searchCriteria.date - Travel date
   * @param {number} searchCriteria.passengers - Number of passengers
   * @param {number} searchCriteria.minPrice - Minimum price filter
   * @param {number} searchCriteria.maxPrice - Maximum price filter
   * @param {string} searchCriteria.departureTimeStart - Departure time start (HH:mm)
   * @param {string} searchCriteria.departureTimeEnd - Departure time end (HH:mm)
   * @param {string} searchCriteria.operatorId - Filter by operator
   * @param {string} searchCriteria.busType - Filter by bus type
   * @param {string} searchCriteria.sortBy - Sort field: 'price', 'time', 'rating'
   * @param {string} searchCriteria.sortOrder - Sort order: 'asc', 'desc'
   * @returns {Promise<Array>}
   */
  static async searchAvailableTrips(searchCriteria) {
    const {
      fromCity,
      toCity,
      date,
      passengers = 1,
      minPrice,
      maxPrice,
      departureTimeStart,
      departureTimeEnd,
      operatorId,
      busType,
      sortBy = 'time',
      sortOrder = 'asc',
    } = searchCriteria;

    logger.info('🔍 Search criteria:', { fromCity, toCity, date, passengers });

    // Build query
    const query = {
      status: 'scheduled',
      availableSeats: { $gte: passengers },
      departureTime: { $gt: new Date() },
    };

    // Date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.departureTime = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
      logger.info('Date range:', { startOfDay, endOfDay });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = Number(minPrice);
      if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    // Operator filter
    if (operatorId) {
      query.operatorId = operatorId;
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sortBy) {
      case 'price':
        sortCriteria = { finalPrice: sortOrder === 'asc' ? 1 : -1 };
        break;
      case 'rating':
        // Will sort after populate based on operator rating
        sortCriteria = { departureTime: 1 }; // Default sort, will re-sort later
        break;
      case 'time':
      default:
        sortCriteria = { departureTime: sortOrder === 'asc' ? 1 : -1 };
        break;
    }

    let trips = await Trip.find(query)
      .populate('routeId')
      .populate('busId', 'busNumber busType seatLayout amenities')
      .populate('operatorId', 'companyName averageRating totalReviews')
      .sort(sortCriteria)
      .lean();

    logger.info(`Found ${trips.length} trips from database`);
    if (trips.length > 0) {
      logger.info('Sample trip routes:', trips.slice(0, 2).map(t => ({
        from: t.routeId?.origin?.city,
        to: t.routeId?.destination?.city,
        departure: t.departureTime
      })));
    }

    // Filter by cities (after populate)
    // Search in both province and city fields for flexibility
    if (fromCity && toCity) {
      trips = trips.filter(
        (trip) => {
          if (!trip.routeId) return false;

          const fromMatch =
            trip.routeId.origin.province?.toLowerCase().includes(fromCity.toLowerCase()) ||
            trip.routeId.origin.city?.toLowerCase().includes(fromCity.toLowerCase());

          const toMatch =
            trip.routeId.destination.province?.toLowerCase().includes(toCity.toLowerCase()) ||
            trip.routeId.destination.city?.toLowerCase().includes(toCity.toLowerCase());

          return fromMatch && toMatch;
        }
      );
      logger.info(`After city filter (${fromCity} → ${toCity}): ${trips.length} trips`);
    } else if (fromCity) {
      trips = trips.filter(
        (trip) => {
          if (!trip.routeId) return false;

          return trip.routeId.origin.province?.toLowerCase().includes(fromCity.toLowerCase()) ||
            trip.routeId.origin.city?.toLowerCase().includes(fromCity.toLowerCase());
        }
      );
      logger.info(`After fromCity filter (${fromCity}): ${trips.length} trips`);
    } else if (toCity) {
      trips = trips.filter(
        (trip) => {
          if (!trip.routeId) return false;

          return trip.routeId.destination.province?.toLowerCase().includes(toCity.toLowerCase()) ||
            trip.routeId.destination.city?.toLowerCase().includes(toCity.toLowerCase());
        }
      );
      logger.info(`After toCity filter (${toCity}): ${trips.length} trips`);
    }

    // Filter by bus type (after populate)
    if (busType) {
      trips = trips.filter(
        (trip) => trip.busId && trip.busId.busType === busType
      );
    }

    // Filter by departure time range (after date filter)
    if (departureTimeStart || departureTimeEnd) {
      trips = trips.filter((trip) => {
        const tripTime = new Date(trip.departureTime);
        const hours = tripTime.getHours();
        const minutes = tripTime.getMinutes();
        const tripTimeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        if (departureTimeStart && departureTimeEnd) {
          return tripTimeStr >= departureTimeStart && tripTimeStr <= departureTimeEnd;
        } else if (departureTimeStart) {
          return tripTimeStr >= departureTimeStart;
        } else if (departureTimeEnd) {
          return tripTimeStr <= departureTimeEnd;
        }
        return true;
      });
    }

    // Sort by rating if requested (after populate)
    if (sortBy === 'rating') {
      trips.sort((a, b) => {
        const ratingA = a.operatorId?.averageRating || 0;
        const ratingB = b.operatorId?.averageRating || 0;
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }

    logger.info(`Returning ${trips.length} trips after all filters`);
    return trips;
  }

  /**
   * Get trip detail for customers (public)
   * Includes comprehensive trip information without sensitive data
   * @param {ObjectId} tripId
   * @returns {Promise<Object>}
   */
  static async getPublicTripDetail(tripId) {
    const trip = await Trip.findOne({
      _id: tripId,
      status: 'scheduled',
    })
      .populate('routeId')
      .populate('busId')
      .populate('operatorId', 'companyName phone email averageRating totalReviews')
      .lean();

    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe hoặc chuyến không khả dụng');
    }

    // Calculate duration in hours
    const durationMs = new Date(trip.arrivalTime) - new Date(trip.departureTime);
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate occupancy rate
    const occupancyRate = trip.totalSeats > 0
      ? ((trip.totalSeats - trip.availableSeats) / trip.totalSeats * 100).toFixed(2)
      : 0;

    // Get booked seat numbers (for seat selection, but not customer details)
    const bookedSeatNumbers = trip.bookedSeats.map(seat => seat.seatNumber);

    // Get held/locked seat numbers from Redis
    const SeatLockService = require('./seatLock.service');
    const heldSeatNumbers = await SeatLockService.getLockedSeats(tripId);

    // Build enhanced response
    const publicTrip = {
      // Trip basic info
      id: trip._id,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      status: trip.status,

      // Duration
      duration: {
        hours: durationHours,
        minutes: durationMinutes,
        formatted: `${durationHours}h ${durationMinutes}m`,
      },

      // Pricing
      pricing: {
        basePrice: trip.basePrice,
        discount: trip.discount,
        finalPrice: trip.finalPrice,
      },

      // Seat availability
      seats: {
        total: trip.totalSeats,
        available: trip.availableSeats,
        booked: trip.totalSeats - trip.availableSeats,
        bookedSeatNumbers, // Array of booked seat numbers
        heldSeatNumbers, // Array of temporarily held/locked seat numbers
        occupancyRate: parseFloat(occupancyRate),
      },

      // Route information
      route: trip.routeId ? {
        id: trip.routeId._id,
        name: trip.routeId.routeName,
        code: trip.routeId.routeCode,
        origin: trip.routeId.origin,
        destination: trip.routeId.destination,
        distance: trip.routeId.distance,
        estimatedDuration: trip.routeId.estimatedDuration,
        pickupPoints: trip.routeId.pickupPoints,
        dropoffPoints: trip.routeId.dropoffPoints,
      } : null,

      // Bus information
      bus: trip.busId ? {
        id: trip.busId._id,
        busNumber: trip.busId.busNumber,
        busType: trip.busId.busType,
        amenities: trip.busId.amenities,
        seatLayout: trip.busId.seatLayout,
      } : null,

      // Operator information
      operator: trip.operatorId ? {
        id: trip.operatorId._id,
        companyName: trip.operatorId.companyName,
        phone: trip.operatorId.phone,
        email: trip.operatorId.email,
        rating: {
          average: trip.operatorId.averageRating,
          total: trip.operatorId.totalReviews,
        },
      } : null,

      // Policies
      policies: trip.policies,

      // Cancellation info
      cancellationPolicy: trip.cancellationPolicy,

      // Additional info
      notes: trip.notes,
    };

    return publicTrip;
  }

  /**
   * Configure dynamic pricing for a trip
   * @param {string} tripId - Trip ID
   * @param {string} operatorId - Operator ID (for authorization)
   * @param {Object} pricingConfig - Dynamic pricing configuration
   * @returns {Promise<Trip>} Updated trip
   */
  static async configureDynamicPricing(tripId, operatorId, pricingConfig) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    // Verify ownership
    if (trip.operatorId.toString() !== operatorId.toString()) {
      throw new Error('Không có quyền cấu hình chuyến xe này');
    }

    // Update dynamic pricing configuration
    trip.dynamicPricing = {
      ...trip.dynamicPricing,
      ...pricingConfig,
    };

    await trip.save();

    return trip;
  }

  /**
   * Get dynamic price for a trip
   * @param {string} tripId - Trip ID
   * @param {Date} bookingDate - Booking date (optional)
   * @returns {Promise<Object>} Price breakdown
   */
  static async getDynamicPrice(tripId, bookingDate = new Date()) {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      throw new Error('Không tìm thấy chuyến xe');
    }

    const priceBreakdown = trip.calculateDynamicPrice(bookingDate);

    return {
      tripId: trip._id,
      basePrice: trip.basePrice,
      dynamicPricingEnabled: trip.dynamicPricing?.enabled || false,
      priceBreakdown,
      occupancyRate: trip.occupancyRate,
      availableSeats: trip.availableSeats,
      totalSeats: trip.totalSeats,
    };
  }
}

export default TripService;

import { getRedisClient } from '../config/redis.js';
import Trip from '../models/Trip.js';
import { logger } from '../utils/logger.js';


// Import WebSocket service (lazy loaded to avoid circular dependency)
let websocketService;
const getWebSocketService = () => {
  if (!websocketService) {
    websocketService = require('./websocket.service');
  }
  return websocketService;
};

/**
 * Seat Service
 * Quản lý việc lock/unlock ghế sử dụng Redis
 */
class SeatService {
  /**
   * Lock ghế cho user trong 15 phút
   * @param {String} tripId - Trip ID
   * @param {Array<String>} seats - Seat numbers to lock
   * @param {String} userId - User ID (or session ID for guest)
   * @returns {Promise<Boolean>}
   */
  static async lockSeats(tripId, seats, userId) {
    const redis = getRedisClient();

    try {
      // Check if all seats are available
      for (const seat of seats) {
        const key = `trip:${tripId}:seat:${seat}`;
        const locked = await redis.get(key);

        if (locked && locked !== userId) {
          throw new Error(`Ghế ${seat} đã được người khác chọn`);
        }
      }

      // Lock all seats
      const lockPromises = seats.map((seat) => {
        const key = `trip:${tripId}:seat:${seat}`;
        // TTL: 15 minutes (900 seconds)
        return redis.set(key, userId, {
          EX: 900,
          NX: false, // Allow overwrite if same user
        });
      });

      await Promise.all(lockPromises);

      // Also update Redis with trip seat availability count
      await this.updateTripSeatAvailability(tripId);

      // Broadcast WebSocket event
      try {
        const ws = getWebSocketService();
        await ws.broadcastSeatAction(tripId, seats, 'locked');
      } catch (error) {
        logger.error('Error broadcasting seat lock:', error);
      }

      return true;
    } catch (error) {
      logger.error('Error locking seats:', error);
      throw error;
    }
  }

  /**
   * Unlock ghế (khi thanh toán thất bại hoặc hết thời gian)
   * @param {String} tripId - Trip ID
   * @param {Array<String>} seats - Seat numbers to unlock
   * @param {String} userId - User ID to verify ownership
   * @returns {Promise<Boolean>}
   */
  static async unlockSeats(tripId, seats, userId) {
    const redis = getRedisClient();

    try {
      for (const seat of seats) {
        const key = `trip:${tripId}:seat:${seat}`;
        const locked = await redis.get(key);

        // Only unlock if owned by this user
        if (locked === userId) {
          await redis.del(key);
        }
      }

      // Update trip seat availability
      await this.updateTripSeatAvailability(tripId);

      // Broadcast WebSocket event
      try {
        const ws = getWebSocketService();
        await ws.broadcastSeatAction(tripId, seats, 'unlocked');
      } catch (error) {
        logger.error('Error broadcasting seat unlock:', error);
      }

      return true;
    } catch (error) {
      logger.error('Error unlocking seats:', error);
      throw error;
    }
  }

  /**
   * Xác nhận ghế đã được book (sau khi thanh toán thành công)
   * Xóa lock khỏi Redis vì đã được lưu vào MongoDB
   * @param {String} tripId - Trip ID
   * @param {Array<String>} seats - Seat numbers
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>}
   */
  static async confirmSeats(tripId, seats, userId) {
    const redis = getRedisClient();

    try {
      // Delete locks from Redis
      const deletePromises = seats.map((seat) => {
        const key = `trip:${tripId}:seat:${seat}`;
        return redis.del(key);
      });

      await Promise.all(deletePromises);

      // Update trip seat availability
      await this.updateTripSeatAvailability(tripId);

      // Broadcast WebSocket event
      try {
        const ws = getWebSocketService();
        await ws.broadcastSeatAction(tripId, seats, 'booked');
      } catch (error) {
        logger.error('Error broadcasting seat confirmation:', error);
      }

      return true;
    } catch (error) {
      logger.error('Error confirming seats:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra ghế có available không
   * @param {String} tripId - Trip ID
   * @param {String} seat - Seat number
   * @returns {Promise<Boolean>}
   */
  static async isSeatAvailable(tripId, seat) {
    const redis = getRedisClient();

    try {
      // Check in Redis (temporary locks)
      const key = `trip:${tripId}:seat:${seat}`;
      const locked = await redis.get(key);

      if (locked) {
        return false; // Seat is locked
      }

      // Check in MongoDB (confirmed bookings)
      const trip = await Trip.findById(tripId);
      if (!trip) {
        throw new Error('Không tìm thấy chuyến xe');
      }

      return !trip.bookedSeats.includes(seat);
    } catch (error) {
      logger.error('Error checking seat availability:', error);
      throw error;
    }
  }

  /**
   * Lấy trạng thái tất cả ghế của trip
   * @param {String} tripId - Trip ID
   * @returns {Promise<Object>} - { seatNumber: status }
   *   status: 'available', 'locked', 'booked'
   */
  static async getTripSeatStatus(tripId) {
    const redis = getRedisClient();

    try {
      const trip = await Trip.findById(tripId).populate('busId', 'seatLayout');

      if (!trip) {
        throw new Error('Không tìm thấy chuyến xe');
      }

      const seatStatus = {};

      // Get all seat numbers from bus layout
      const allSeats = this.extractSeatsFromLayout(trip.busId.seatLayout);

      // Check each seat
      for (const seat of allSeats) {
        // First check if booked in MongoDB
        if (trip.bookedSeats.includes(seat)) {
          seatStatus[seat] = 'booked';
          continue;
        }

        // Then check if locked in Redis
        const key = `trip:${tripId}:seat:${seat}`;
        const locked = await redis.get(key);

        if (locked) {
          seatStatus[seat] = 'locked';
        } else {
          seatStatus[seat] = 'available';
        }
      }

      return seatStatus;
    } catch (error) {
      logger.error('Error getting trip seat status:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách ghế available của trip
   * @param {String} tripId - Trip ID
   * @returns {Promise<Array<String>>}
   */
  static async getAvailableSeats(tripId) {
    const seatStatus = await this.getTripSeatStatus(tripId);

    return Object.keys(seatStatus).filter((seat) => seatStatus[seat] === 'available');
  }

  /**
   * Extract all seat numbers from bus layout
   * @param {Object} seatLayout - Bus seat layout
   * @returns {Array<String>}
   */
  static extractSeatsFromLayout(seatLayout) {
    if (!seatLayout || !seatLayout.layout) {
      return [];
    }

    const seats = [];

    // Layout is 2D array: [[row1], [row2], ...]
    seatLayout.layout.forEach((row) => {
      row.forEach((seat) => {
        if (seat && seat !== '' && seat !== null) {
          seats.push(seat);
        }
      });
    });

    return seats;
  }

  /**
   * Update trip seat availability count in Redis (for quick access)
   * @param {String} tripId - Trip ID
   * @returns {Promise<void>}
   */
  static async updateTripSeatAvailability(tripId) {
    const redis = getRedisClient();

    try {
      const availableSeats = await this.getAvailableSeats(tripId);
      const key = `trip:${tripId}:available_count`;

      // Cache for 5 minutes
      await redis.set(key, availableSeats.length.toString(), {
        EX: 300,
      });
    } catch (error) {
      logger.error('Error updating trip seat availability:', error);
    }
  }

  /**
   * Get trip available seat count (from cache or calculate)
   * @param {String} tripId - Trip ID
   * @returns {Promise<Number>}
   */
  static async getTripAvailableSeatCount(tripId) {
    const redis = getRedisClient();

    try {
      const key = `trip:${tripId}:available_count`;
      const cached = await redis.get(key);

      if (cached !== null) {
        return parseInt(cached, 10);
      }

      // Calculate if not cached
      const availableSeats = await this.getAvailableSeats(tripId);
      const count = availableSeats.length;

      // Cache it
      await redis.set(key, count.toString(), { EX: 300 });

      return count;
    } catch (error) {
      logger.error('Error getting trip available seat count:', error);
      // Fallback to MongoDB
      const trip = await Trip.findById(tripId);
      return trip ? trip.availableSeats : 0;
    }
  }

  /**
   * Extend seat lock time (thêm 15 phút nữa)
   * @param {String} tripId - Trip ID
   * @param {Array<String>} seats - Seat numbers
   * @param {String} userId - User ID to verify ownership
   * @returns {Promise<Boolean>}
   */
  static async extendSeatLock(tripId, seats, userId) {
    const redis = getRedisClient();

    try {
      for (const seat of seats) {
        const key = `trip:${tripId}:seat:${seat}`;
        const locked = await redis.get(key);

        // Only extend if owned by this user
        if (locked === userId) {
          await redis.expire(key, 900); // Extend to 15 minutes
        }
      }

      return true;
    } catch (error) {
      logger.error('Error extending seat lock:', error);
      throw error;
    }
  }

  /**
   * Get remaining lock time for seats
   * @param {String} tripId - Trip ID
   * @param {Array<String>} seats - Seat numbers
   * @returns {Promise<Object>} - { seatNumber: remainingSeconds }
   */
  static async getSeatLockRemainingTime(tripId, seats) {
    const redis = getRedisClient();

    try {
      const result = {};

      for (const seat of seats) {
        const key = `trip:${tripId}:seat:${seat}`;
        const ttl = await redis.ttl(key);

        result[seat] = ttl > 0 ? ttl : 0;
      }

      return result;
    } catch (error) {
      logger.error('Error getting seat lock remaining time:', error);
      return {};
    }
  }

  /**
   * Clean up expired locks (manual cleanup, Redis TTL should handle this)
   * @param {String} tripId - Trip ID
   * @returns {Promise<Number>}
   */
  static async cleanupExpiredLocks(tripId) {
    const redis = getRedisClient();
    let cleanedCount = 0;

    try {
      // Scan for all seat locks of this trip
      const pattern = `trip:${tripId}:seat:*`;
      const keys = await redis.keys(pattern);

      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl <= 0) {
          await redis.del(key);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired locks:', error);
      return cleanedCount;
    }
  }

  /**
   * Check if user owns the seat lock
   * @param {String} tripId - Trip ID
   * @param {String} seat - Seat number
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>}
   */
  static async doesUserOwnSeatLock(tripId, seat, userId) {
    const redis = getRedisClient();

    try {
      const key = `trip:${tripId}:seat:${seat}`;
      const locked = await redis.get(key);

      return locked === userId;
    } catch (error) {
      logger.error('Error checking seat lock ownership:', error);
      return false;
    }
  }

  /**
   * Batch lock check - kiểm tra nhiều ghế cùng lúc
   * @param {String} tripId - Trip ID
   * @param {Array<String>} seats - Seat numbers to check
   * @returns {Promise<Object>} - { available: [], locked: [], booked: [] }
   */
  static async batchCheckSeats(tripId, seats) {
    const redis = getRedisClient();

    try {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        throw new Error('Không tìm thấy chuyến xe');
      }

      const result = {
        available: [],
        locked: [],
        booked: [],
      };

      for (const seat of seats) {
        // Check if booked in MongoDB
        if (trip.bookedSeats.includes(seat)) {
          result.booked.push(seat);
          continue;
        }

        // Check if locked in Redis
        const key = `trip:${tripId}:seat:${seat}`;
        const locked = await redis.get(key);

        if (locked) {
          result.locked.push(seat);
        } else {
          result.available.push(seat);
        }
      }

      return result;
    } catch (error) {
      logger.error('Error batch checking seats:', error);
      throw error;
    }
  }
}

export default SeatService;

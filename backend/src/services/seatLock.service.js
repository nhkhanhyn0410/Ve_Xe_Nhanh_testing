import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

/**
 * Seat Lock Service
 * Manages temporary seat locks using Redis with TTL
 */
class SeatLockService {
  /**
   * Lock duration in seconds (15 minutes)
   */
  static LOCK_DURATION = 15 * 60; // 900 seconds

  /**
   * Generate Redis key for seat lock
   * @param {string} tripId - Trip ID
   * @param {string} seatNumber - Seat number
   * @returns {string} Redis key
   */
  static getLockKey(tripId, seatNumber) {
    return `seat:lock:${tripId}:${seatNumber}`;
  }

  /**
   * Generate Redis key for trip's all locked seats set
   * @param {string} tripId - Trip ID
   * @returns {string} Redis key
   */
  static getTripLocksKey(tripId) {
    return `seat:locks:${tripId}`;
  }

  /**
   * Lock seats for a trip
   * @param {string} tripId - Trip ID
   * @param {string[]} seatNumbers - Array of seat numbers to lock
   * @param {string} userId - User/session ID who is locking
   * @param {number} duration - Lock duration in seconds (default: 15 minutes)
   * @returns {Promise<Object>} Result with locked seats and failures
   */
  static async lockSeats(tripId, seatNumbers, userId, duration = this.LOCK_DURATION) {
    try {
      const redis = getRedisClient();
      const locked = [];
      const failed = [];

      for (const seatNumber of seatNumbers) {
        const lockKey = this.getLockKey(tripId, seatNumber);

        // Try to set the lock (NX = only if not exists)
        const result = await redis.set(lockKey, userId, {
          NX: true,
          EX: duration,
        });

        if (result === 'OK') {
          // Successfully locked
          locked.push(seatNumber);

          // Add to trip's locked seats set (for quick querying)
          const tripLocksKey = this.getTripLocksKey(tripId);
          await redis.sAdd(tripLocksKey, seatNumber);
          await redis.expire(tripLocksKey, duration);
        } else {
          // Already locked by someone else
          const lockedBy = await redis.get(lockKey);
          failed.push({
            seatNumber,
            reason: lockedBy === userId ? 'already_locked_by_you' : 'locked_by_another_user',
            lockedBy,
          });
        }
      }

      if (locked.length > 0) {
        logger.success(`Locked ${locked.length} seat(s) for trip ${tripId} - User: ${userId.substring(0, 8)}...`);
      }
      if (failed.length > 0) {
        logger.warn(`Failed to lock ${failed.length} seat(s) for trip ${tripId}`);
      }

      return {
        success: locked.length > 0,
        locked,
        failed,
        expiresIn: duration,
        expiresAt: new Date(Date.now() + duration * 1000),
      };
    } catch (error) {
      logger.error(`Error locking seats for trip ${tripId}: ${error.message}`);
      throw new Error('Không thể khóa ghế. Vui lòng thử lại.');
    }
  }

  /**
   * Release seat locks
   * @param {string} tripId - Trip ID
   * @param {string[]} seatNumbers - Array of seat numbers to unlock
   * @param {string} userId - User/session ID who is unlocking
   * @returns {Promise<Object>} Result with released seats
   */
  static async releaseSeats(tripId, seatNumbers, userId) {
    try {
      const redis = getRedisClient();
      const released = [];
      const failed = [];

      for (const seatNumber of seatNumbers) {
        const lockKey = this.getLockKey(tripId, seatNumber);

        // Check who locked it
        const lockedBy = await redis.get(lockKey);

        if (!lockedBy) {
          failed.push({
            seatNumber,
            reason: 'not_locked',
          });
        } else if (lockedBy !== userId) {
          failed.push({
            seatNumber,
            reason: 'locked_by_another_user',
            lockedBy,
          });
        } else {
          // Delete the lock
          await redis.del(lockKey);

          // Remove from trip's locked seats set
          const tripLocksKey = this.getTripLocksKey(tripId);
          await redis.sRem(tripLocksKey, seatNumber);

          released.push(seatNumber);
        }
      }

      if (released.length > 0) {
        logger.info(`Released ${released.length} seat(s) for trip ${tripId} - User: ${userId.substring(0, 8)}...`);
      }

      return {
        success: released.length > 0,
        released,
        failed,
      };
    } catch (error) {
      logger.error(`Error releasing seats for trip ${tripId}: ${error.message}`);
      throw new Error('Không thể mở khóa ghế. Vui lòng thử lại.');
    }
  }

  /**
   * Check if seats are locked
   * @param {string} tripId - Trip ID
   * @param {string[]} seatNumbers - Array of seat numbers to check
   * @returns {Promise<Object>} Status of each seat
   */
  static async checkSeatsLocked(tripId, seatNumbers) {
    try {
      const redis = getRedisClient();
      const results = {};

      for (const seatNumber of seatNumbers) {
        const lockKey = this.getLockKey(tripId, seatNumber);
        const lockedBy = await redis.get(lockKey);
        const ttl = lockedBy ? await redis.ttl(lockKey) : -2;

        results[seatNumber] = {
          isLocked: !!lockedBy,
          lockedBy: lockedBy || null,
          ttl: ttl > 0 ? ttl : 0,
          expiresAt: ttl > 0 ? new Date(Date.now() + ttl * 1000) : null,
        };
      }

      return results;
    } catch (error) {
      logger.error(`Error checking seats for trip ${tripId}: ${error.message}`);
      throw new Error('Không thể kiểm tra trạng thái ghế.');
    }
  }

  /**
   * Get all locked seats for a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise<string[]>} Array of locked seat numbers
   */
  static async getLockedSeats(tripId) {
    try {
      const redis = getRedisClient();
      const tripLocksKey = this.getTripLocksKey(tripId);

      const lockedSeats = await redis.sMembers(tripLocksKey);
      return lockedSeats || [];
    } catch (error) {
      logger.error(`Error getting locked seats for trip ${tripId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Extend seat lock duration
   * @param {string} tripId - Trip ID
   * @param {string[]} seatNumbers - Array of seat numbers
   * @param {string} userId - User/session ID
   * @param {number} duration - New duration in seconds
   * @returns {Promise<Object>} Result
   */
  static async extendLock(tripId, seatNumbers, userId, duration = this.LOCK_DURATION) {
    try {
      const redis = getRedisClient();
      const extended = [];
      const failed = [];

      for (const seatNumber of seatNumbers) {
        const lockKey = this.getLockKey(tripId, seatNumber);
        const lockedBy = await redis.get(lockKey);

        if (!lockedBy) {
          failed.push({
            seatNumber,
            reason: 'not_locked',
          });
        } else if (lockedBy !== userId) {
          failed.push({
            seatNumber,
            reason: 'locked_by_another_user',
          });
        } else {
          // Extend TTL
          await redis.expire(lockKey, duration);
          extended.push(seatNumber);
        }
      }

      if (extended.length > 0) {
        logger.info(`Extended lock for ${extended.length} seat(s) for trip ${tripId} - User: ${userId.substring(0, 8)}...`);
      }

      return {
        success: extended.length > 0,
        extended,
        failed,
        expiresIn: duration,
        expiresAt: new Date(Date.now() + duration * 1000),
      };
    } catch (error) {
      logger.error(`Error extending lock for trip ${tripId}: ${error.message}`);
      throw new Error('Không thể gia hạn khóa ghế.');
    }
  }

  /**
   * Release all expired locks (cleanup job)
   * This is handled automatically by Redis TTL, but we clean up the trip sets
   * @param {string} tripId - Trip ID
   * @returns {Promise<number>} Number of cleaned locks
   */
  static async cleanupExpiredLocks(tripId) {
    try {
      const redis = getRedisClient();
      const tripLocksKey = this.getTripLocksKey(tripId);
      const allSeats = await redis.sMembers(tripLocksKey);

      let cleaned = 0;
      for (const seatNumber of allSeats) {
        const lockKey = this.getLockKey(tripId, seatNumber);
        const exists = await redis.exists(lockKey);

        if (!exists) {
          // Lock expired, remove from set
          await redis.sRem(tripLocksKey, seatNumber);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.info(`Cleaned up ${cleaned} expired seat lock(s) for trip ${tripId}`);
      }

      return cleaned;
    } catch (error) {
      logger.error(`Error cleaning up locks for trip ${tripId}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if user has any locks for a trip
   * @param {string} tripId - Trip ID
   * @param {string} userId - User/session ID
   * @returns {Promise<string[]>} Array of seat numbers locked by user
   */
  static async getUserLocks(tripId, userId) {
    try {
      const redis = getRedisClient();
      const tripLocksKey = this.getTripLocksKey(tripId);
      const allSeats = await redis.sMembers(tripLocksKey);

      const userSeats = [];
      for (const seatNumber of allSeats) {
        const lockKey = this.getLockKey(tripId, seatNumber);
        const lockedBy = await redis.get(lockKey);

        if (lockedBy === userId) {
          userSeats.push(seatNumber);
        }
      }

      return userSeats;
    } catch (error) {
      logger.error(`Error getting user locks for trip ${tripId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Release all locks for a user on a trip
   * @param {string} tripId - Trip ID
   * @param {string} userId - User/session ID
   * @returns {Promise<Object>} Result
   */
  static async releaseAllUserLocks(tripId, userId) {
    try {
      const userSeats = await this.getUserLocks(tripId, userId);

      if (userSeats.length === 0) {
        return {
          success: true,
          released: [],
          message: 'No locks to release',
        };
      }

      return await this.releaseSeats(tripId, userSeats, userId);
    } catch (error) {
      logger.error(`Error releasing all user locks for trip ${tripId}: ${error.message}`);
      throw new Error('Không thể mở khóa tất cả ghế.');
    }
  }
}

export default SeatLockService;

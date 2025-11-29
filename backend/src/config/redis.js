const redis = require('redis');
const logger = require('../utils/logger')

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB, 10) || 0,
    });

    redisClient.on('error', (err) => {
      logger.error(' Lỗi Redis Client:', err);
    });

    redisClient.on('connect' && 'ready', () => {
      logger.success('Redis Đã kết nối và sẵn sàng');
    });


    redisClient.on('reconnecting', () => {
      logger.info('Redis Đang kết nối lại...');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Lỗi kết nối với Redis:', error.message);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client chưa khởi tạo. Hãy gọi connectRedis() trước.');
  }
  return redisClient;
};

module.exports = connectRedis;
module.exports.getRedisClient = getRedisClient;

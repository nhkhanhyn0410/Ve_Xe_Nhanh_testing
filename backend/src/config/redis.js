import redis from 'redis';

let redisClient;

const connectRedis = async () => {
  try {
    const config = {
      url: process.env.REDIS_URL,
      database: parseInt(process.env.REDIS_DB, 10) || 0,
    };

    // Chỉ thêm mật khẩu nếu nó đã tồn tại
    if (process.env.REDIS_PASSWORD) {
      config.password = process.env.REDIS_PASSWORD;
    }

    redisClient = redis.createClient(config);

    redisClient.on('error', (err) => {
      console.error('*# Redis Client Error:', err);
    });

    redisClient.on('connect' && 'ready', () => {
      console.log('## Redis Đã kết nối và sẵn sàng');
    });

    redisClient.on('reconnecting', () => {
      console.log('&# Redis Đang kết nối lại...');
    });

    await redisClient.connect();

    // Test connection
    await redisClient.set('test', 'VeXeNhanh Redis Connection OK');
    const testValue = await redisClient.get('test');
    console.log('## Redis Test:', testValue);

    return redisClient;
  } catch (error) {
    console.error(' Lỗi kết nối với Redis:', error.message);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client chưa khởi tạo. Call connectRedis() first.');
  }
  return redisClient;
};

export default connectRedis;
export { getRedisClient };

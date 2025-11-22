import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import connectRedis, { getRedisClient } from './config/redis.js';
import { logger } from './utils/logger.js';
import {
    sanitizeData,
    preventXSS,
    preventHPP,
    setSecurityHeaders,
    detectAttackPatterns,
    preventPrototypePollution,
    validateContentType,
} from './middleware/security.middleware.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database and Redis with error handling
const initializeConnections = async () => {
    try {
        await connectDB();
        await connectRedis();
        logger.info('Database và Redis kết nối được thiết lập');
    } catch (error) {
        logger.error('Không thể khởi tạo kết nối:', error);
        process.exit(1);
    }
};

initializeConnections();

// Security middleware - Helmet with custom headers
app.use(helmet());
app.use(setSecurityHeaders);

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút',
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware from security.middleware.js
app.use(validateContentType);
app.use(sanitizeData());
app.use(preventXSS());
app.use(preventHPP());
app.use(detectAttackPatterns);
app.use(preventPrototypePollution);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Mount routes (includes 404 handler inside routes/index.js)
app.use('/', routes);

// Global error handler - must be last
app.use(errorHandler);

// Create HTTP server
const PORT = process.env.PORT || 5500;
const API_VERSION = process.env.API_VERSION || 'v1';
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
    logger.start(`=====================================================================`)
    logger.success(`Server đang chạy ở chế độ ${process.env.NODE_ENV} trên port ${PORT}`);
    logger.success(`Health check: http://localhost:${PORT}/health`);
    logger.success(`API endpoint: http://localhost:${PORT}/api/${API_VERSION}`);
    logger.success(`Máy chủ WebSocket sẵn sàng cập nhật theo thời gian thực`);
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} đang được sử dụng`);
        logger.error(`Vui lòng kill process hoặc đổi port khác`);
        process.exit(1);
    } else {
        logger.error(' Server error:', error);
        process.exit(1);
    }
});

/**
 * Graceful shutdown helper
 * Đóng tất cả các kết nối trước khi tắt server
 */
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} RECEIVED. Đang tắt gracefully...`);

    // Đóng HTTP server trước
    server.close(async () => {
        logger.info('HTTP server đã đóng');

        try {
            // Đóng kết nối Redis
            const redisClient = getRedisClient();
            if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
                logger.info('Redis connection đã đóng');
            }

            // Đóng kết nối MongoDB
            const mongoose = await import('mongoose');
            if (mongoose.default.connection.readyState === 1) {
                await mongoose.default.connection.close();
                logger.info('MongoDB connection đã đóng');
            }

            logger.info('Tất cả kết nối đã đóng. Thoát chương trình.');
            process.exit(0);
        } catch (error) {
            logger.error('Lỗi khi đóng kết nối:', error);
            process.exit(1);
        }
    });

    // Nếu server không đóng trong 10s, force shutdown
    setTimeout(() => {
        logger.error('Không thể đóng kết nối gracefully, forcing shutdown...');
        process.exit(1);
    }, 10000);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...');
    logger.error('Error name:', err.name);
    logger.error('Error message:', err.message);
    logger.error('Stack:', err.stack);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...');
    logger.error('Error name:', err.name);
    logger.error('Error message:', err.message);
    logger.error('Stack:', err.stack);
    process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle SIGTERM (Process manager shutdowns)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;

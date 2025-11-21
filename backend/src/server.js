import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import connectRedis, { getRedisClient } from './config/redis.js';
import { logger } from './utils/logger.js'

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Connect to Redis
connectRedis();

// Security middleware - Helmet
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
});
app.use('/api', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'price',
        'duration',
        'departureTime',
        'arrivalTime'
    ]
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Mount routes
app.use('/', routes);

// 404 handler - must be after all other routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Create HTTP server
const PORT = process.env.PORT || 5500;
const API_VERSION = process.env.API_VERSION || 'v1';
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('TỪ CHỐI KHÔNG ĐƯỢC XỬ LÝ! Tắt...');
    logger.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGINT
process.on('SIGINT', () => {
    logger.info('SIGINT RECEIVED. Đang tắt gracefully...');
    server.close(() => {
        logger.info(' HTTP server đã đóng');
        process.exit(0);
    });
});

// Handle SIGTERM (Process manager shutdowns)
process.on('SIGTERM', () => {
    logger.info('SIGTERM RECEIVED. Đang tắt gracefully...');
    server.close(() => {
        logger.info(' Process terminated!');
        process.exit(0);
    });
});

export default app;

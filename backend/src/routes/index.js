import express from 'express';
import authRoutes from './auth.routes.js';
// Import các routes khác khi có
// import userRoutes from './user.routes.js';
// import busRoutes from './bus.routes.js';
// import bookingRoutes from './booking.routes.js';
// import operatorRoutes from './operator.routes.js';

const router = express.Router();

/**
 * Central Route Management
 * Tập trung quản lý tất cả các routes của ứng dụng
 */

// Health check endpoint - Kiểm tra trạng thái server
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server đang hoạt động tốt',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API version info - Thông tin phiên bản API
router.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Ve Xe Nhanh API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            buses: '/api/v1/buses',
            bookings: '/api/v1/bookings',
            operators: '/api/v1/operators',
        },
        documentation: '/api/v1/docs',
    });
});

/**
 * API v1 Routes
 * Base path: /api/v1
 */

// Authentication routes
router.use('/api/v1/auth', authRoutes);

// User routes (uncomment khi đã tạo)
// router.use('/api/v1/users', userRoutes);

// Bus routes (uncomment khi đã tạo)
// router.use('/api/v1/buses', busRoutes);

// Booking routes (uncomment khi đã tạo)
// router.use('/api/v1/bookings', bookingRoutes);

// Operator routes (uncomment khi đã tạo)
// router.use('/api/v1/operators', operatorRoutes);

/**
 * 404 handler - Phải đặt sau tất cả routes
 * Sẽ catch tất cả requests không match với routes ở trên
 */
router.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Không tìm thấy route: ${req.method} ${req.originalUrl}`,
        suggestion: 'Vui lòng kiểm tra lại URL và method',
    });
});

export default router;

import ApiError from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode;

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
        logger.error('Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Tài nguyên không tìm thấy';
        error = new ApiError(404, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Giá trị trường đã tồn tại';
        error = new ApiError(400, message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token không hợp lệ';
        error = new ApiError(401, message);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token đã hết hạn';
        error = new ApiError(401, message);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        status: error.status || 'error',
        message: error.message || 'Lỗi máy chủ',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new ApiError(404, `Không tìm thấy - ${req.originalUrl}`);
    next(error);
};

export { errorHandler, notFound };

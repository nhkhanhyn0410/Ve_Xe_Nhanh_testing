import { logger } from '../utils/logger.js';

/**
 * Error handling middleware
 */

/**
 * Custom error class
 */
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error
 */
const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Giá trị '${value}' đã tồn tại cho trường '${field}'. Vui lòng sử dụng giá trị khác.`;
    return new AppError(message, 400);
};

/**
 * Handle Mongoose validation error
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Handle JWT authentication error
 */
const handleJWTError = () => new AppError('Token không hợp lệ. Vui lòng đăng nhập lại!', 401);

/**
 * Handle JWT expired error
 */
const handleJWTExpiredError = () =>
    new AppError('Token đã hết hạn. Vui lòng đăng nhập lại!', 401);

/**
 * Send error response in development environment
 */
const sendErrorDev = (err, req, res) => {
    // Log error details
    logger.error('Error details:', {
        status: err.status,
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
    });

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

/**
 * Send error response in production environment
 */
const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Programming or other unknown error: don't leak error details
    else {
        // Log error
        logger.error('CRITICAL ERROR:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
        });

        // Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
        });
    }
};

/**
 * Main error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;

        // Handle specific errors
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, req, res);
    }
};

/**
 * 404 Not Found handler
 * Use this middleware for undefined routes
 */
export const notFound = (req, res, next) => {
    const message = `Không tìm thấy - ${req.originalUrl}`;
    next(new AppError(message, 404));
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch errors automatically
 * Usage: router.get('/path', catchAsync(async (req, res) => { ... }))
 */
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

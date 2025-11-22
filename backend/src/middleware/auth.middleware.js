// import AuthService from '../services/auth.service.js';
import User from '../models/User.js';
// import BusOperator from '../models/BusOperator.js';
// import Employee from '../models/Employee.js';
import { logger } from '../utils/logger.js';

/**
 * Kiểm tra thời gian chờ của phiên (theo mặc định là 30 phút không hoạt động)
 * @param {Object} user - User object
 * @returns {Boolean} - True if session is valid
 */
const checkSessionTimeout = (user) => {
    const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES, 10) || 30;
    const timeoutMs = sessionTimeout * 60 * 1000;

    if (user.lastLogin) {
        const timeSinceLastLogin = Date.now() - new Date(user.lastLogin).getTime();
        return timeSinceLastLogin <= timeoutMs;
    }

    // Nếu không có LastLogin, phiên hợp lệ (người dùng mới tạo)
    return true;
};

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization: Bearer <token>
 */
export const authenticate = async (req, res, next) => {
    try {
        // 1. Lấy token từ header
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Kiểm tra token có tồn tại không
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để truy cập',
                code: 'NO_TOKEN',
            });
        }

        // 2. Verify token
        let decoded;
        try {
            decoded = AuthService.verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                status: 'error',
                message: error.message || 'Token không hợp lệ',
                code: 'INVALID_TOKEN',
            });
        }

        // 3. Kiểm tra token type (phải là access token)
        if (decoded.type !== 'access') {
            return res.status(401).json({
                status: 'error',
                message: 'Token không hợp lệ',
                code: 'INVALID_TOKEN_TYPE',
            });
        }

        // 4. Kiểm tra user/operator/employee còn tồn tại không
        let user;

        // Tìm trong collection tương ứng dựa trên role
        if (decoded.role === 'operator') {
            user = await BusOperator.findById(decoded.userId);
        } else if (decoded.role === 'trip_manager' || decoded.role === 'driver') {
            user = await Employee.findById(decoded.userId);
        } else {
            // customer, admin
            user = await User.findById(decoded.userId);
        }

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Tài khoản không tồn tại',
                code: 'USER_NOT_FOUND',
            });
        }

        // 5. Kiểm tra account status dựa trên loại user
        if (decoded.role === 'operator') {
            // BusOperator checks
            if (user.isSuspended) {
                return res.status(403).json({
                    status: 'error',
                    message: `Tài khoản đã bị tạm ngưng. Lý do: ${user.suspensionReason || 'Không rõ'}`,
                    code: 'ACCOUNT_SUSPENDED',
                });
            }
            if (!user.isActive) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Tài khoản không hoạt động',
                    code: 'ACCOUNT_INACTIVE',
                });
            }
        } else if (decoded.role === 'trip_manager' || decoded.role === 'driver') {
            // Employee checks
            if (user.status !== 'active') {
                return res.status(403).json({
                    status: 'error',
                    message: `Tài khoản ${user.status === 'suspended' ? 'đã bị tạm ngưng' : 'không hoạt động'}`,
                    code: 'ACCOUNT_INACTIVE',
                });
            }
        } else {
            // User (customer/admin) checks
            if (user.isBlocked) {
                return res.status(403).json({
                    status: 'error',
                    message: `Tài khoản đã bị khóa. Lý do: ${user.blockedReason || 'Không rõ'}`,
                    code: 'ACCOUNT_BLOCKED',
                });
            }
            if (!user.isActive) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Tài khoản không hoạt động',
                    code: 'ACCOUNT_INACTIVE',
                });
            }

            // Chỉ kiểm tra thời gian chờ của phiên dành cho người dùng thông thường
            if (!checkSessionTimeout(user)) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Phiên đăng nhập đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.',
                    code: 'SESSION_TIMEOUT',
                });
            }

            // Cập nhật lần đăng nhập cuối cùng để kéo dài phiên
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        }

        // 6. Lưu user vào request object
        req.user = user;
        req.userId = user._id;
        req.userRole = decoded.role; // Add role for easier access

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Lỗi xác thực',
            code: 'AUTH_ERROR',
        });
    }
};

/**
 * Alias for authenticate
 */
export const protect = authenticate;

/**
 * Middleware kiểm tra role
 * Sử dụng sau authenticate middleware
 * @param {...String} roles - Danh sách roles được phép
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra user đã được authenticate chưa
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Vui lòng đăng nhập để truy cập',
            });
        }

        // Kiểm tra role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Bạn không có quyền truy cập tài nguyên này',
            });
        }

        next();
    };
};

/**
 * Middleware cho phép truy cập không cần đăng nhập
 * Nhưng nếu có token hợp lệ thì sẽ lưu user vào request
 * Dùng cho guest booking
 */
export const optionalAuth = async (req, res, next) => {
    try {
        // Lấy token từ header
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Nếu không có token, cho phép tiếp tục (guest)
        if (!token) {
            req.user = null;
            return next();
        }

        // Nếu có token, verify và lưu user
        try {
            const decoded = AuthService.verifyToken(token);

            if (decoded.type === 'access') {
                const user = await User.findById(decoded.userId);
                if (user && !user.isBlocked && user.isActive) {
                    req.user = user;
                    req.userId = user._id;
                }
            }
        } catch (error) {
            // Token không hợp lệ, vẫn cho phép tiếp tục như guest
            req.user = null;
        }

        next();
    } catch (error) {
        logger.error('Optional auth error:', error);
        req.user = null;
        next();
    }
};

/**
 * Middleware kiểm tra email đã được verify chưa
 * Sử dụng sau authenticate middleware
 */
export const requireEmailVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Vui lòng đăng nhập để truy cập',
        });
    }

    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            status: 'error',
            message: 'Vui lòng xác thực email trước khi thực hiện thao tác này',
            code: 'EMAIL_NOT_VERIFIED',
        });
    }

    next();
};

/**
 * Middleware kiểm tra phone đã được verify chưa
 * Sử dụng sau authenticate middleware
 */
export const requirePhoneVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'Vui lòng đăng nhập để truy cập',
        });
    }

    if (!req.user.isPhoneVerified) {
        return res.status(403).json({
            status: 'error',
            message: 'Vui lòng xác thực số điện thoại trước khi thực hiện thao tác này',
            code: 'PHONE_NOT_VERIFIED',
        });
    }

    next();
};

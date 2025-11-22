import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { logger } from '../utils/logger.js';


/**
 * Security Middleware
 * Tổng hợp các middleware bảo mật
 */

/**
 * Vệ sinh dữ liệu để ngăn chặn các cuộc tấn công tiêm nhiễm NoSQL
 * Xóa mọi khóa bắt đầu bằng '$' hoặc chứa '.'
 */
export const sanitizeData = () => {
    return mongoSanitize({
        replaceWith: '_',
        onSanitize: ({ req, key }) => {
            logger.warn(`[Security] Đã phát hiện thấy việc tiêm NoSQL đã thử: ${key}`, {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('user-agent'),
            });
        },
    });
};

/**
* Ngăn chặn các cuộc tấn công XSS bằng cách vệ sinh đầu vào của người dùng 
* Làm sạch đầu vào của người dùng khỏi HTML/JavaScript độc hại
 */
export const preventXSS = () => {
    return xss();
};

/**
* Ngăn chặn các cuộc tấn công Ô nhiễm Tham số HTTP 
* Bảo vệ chống lại các tham số trùng lặp trong chuỗi truy vấn
 */
export const preventHPP = () => {
    return hpp({
        whitelist: [
            // Các parameters được phép duplicate
            'price',
            'rating',
            'seats',
            'date',
            'departureTime',
            'arrivalTime',
            'amenities',
            'busType',
        ],
    });
};

/**
 * Security headers configuration
 * Already using Helmet.js, but can add custom headers here
 */
export const setSecurityHeaders = (req, res, next) => {
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );

    next();
};

/**
 * Request sanitization
 * Remove potentially dangerous characters from request
 */
export const sanitizeRequest = (req, res, next) => {
    // Sanitize req.body
    if (req.body) {
        Object.keys(req.body).forEach((key) => {
            if (typeof req.body[key] === 'string') {
                // Remove null bytes
                req.body[key] = req.body[key].replace(/\0/g, '');

                // Trim whitespace
                req.body[key] = req.body[key].trim();
            }
        });
    }

    // Sanitize req.params
    if (req.params) {
        Object.keys(req.params).forEach((key) => {
            if (typeof req.params[key] === 'string') {
                req.params[key] = req.params[key].replace(/\0/g, '').trim();
            }
        });
    }

    // Sanitize req.query
    if (req.query) {
        Object.keys(req.query).forEach((key) => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].replace(/\0/g, '').trim();
            }
        });
    }

    next();
};

/**
 * Log security events
 */
export const logSecurityEvent = (eventType, details, req) => {
    logger.warn('[Security Event]', {
        type: eventType,
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('user-agent'),
        path: req.path,
        method: req.method,
        ...details,
    });
};

/**
 * Detect and prevent common attack patterns
 */
export const detectAttackPatterns = (req, res, next) => {
    const suspiciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi, // XSS
        /javascript:/gi, // JavaScript protocol
        /on\w+\s*=/gi, // Event handlers
        /\$\{.*\}/g, // Template injection
        /\.\.\//g, // Path traversal
        /<iframe/gi, // Iframe injection
        /eval\s*\(/gi, // Eval injection
        /expression\s*\(/gi, // CSS expression
    ];

    const checkString = (str) => {
        return suspiciousPatterns.some((pattern) => pattern.test(str));
    };

    // Check all string values in request
    const checkObject = (obj, path = '') => {
        for (const key in obj) {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string' && checkString(value)) {
                logSecurityEvent(
                    'ATTACK_PATTERN_DETECTED',
                    {
                        field: currentPath,
                        value: value.substring(0, 100),
                    },
                    req
                );

                return res.status(400).json({
                    status: 'error',
                    message: 'Yêu cầu chứa nội dung không hợp lệ',
                    code: 'INVALID_INPUT',
                });
            } else if (typeof value === 'object' && value !== null) {
                const result = checkObject(value, currentPath);
                if (result) return result;
            }
        }
    };

    // Check request body
    if (req.body && typeof req.body === 'object') {
        const result = checkObject(req.body);
        if (result) return result;
    }

    // Check query parameters
    if (req.query && typeof req.query === 'object') {
        const result = checkObject(req.query);
        if (result) return result;
    }

    next();
};

/**
 * Prevent timing attacks on sensitive operations
 * Usage: const result = await constantTimeResponse(promise, 100);
 */
export const constantTimeResponse = async (promise, minDelay = 100) => {
    const start = Date.now();
    const result = await promise;
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, minDelay - elapsed);

    if (remaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    return result;
};

/**
 * Validate content type for requests with body
 */
export const validateContentType = (req, res, next) => {
    // Skip for GET, HEAD, DELETE requests
    if (['GET', 'HEAD', 'DELETE'].includes(req.method)) {
        return next();
    }

    // Check if request has body
    if (req.body && Object.keys(req.body).length > 0) {
        const contentType = req.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
            return res.status(415).json({
                status: 'error',
                message: 'Content-Type phải là application/json',
                code: 'INVALID_CONTENT_TYPE',
            });
        }
    }

    next();
};

/**
 * Prevent prototype pollution
 */
export const preventPrototypePollution = (req, res, next) => {
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];

    const checkObject = (obj, path = '') => {
        for (const key in obj) {
            if (dangerousKeys.includes(key)) {
                logSecurityEvent(
                    'PROTOTYPE_POLLUTION_ATTEMPT',
                    {
                        field: path ? `${path}.${key}` : key,
                    },
                    req
                );

                return res.status(400).json({
                    status: 'error',
                    message: 'Yêu cầu chứa nội dung không hợp lệ',
                    code: 'INVALID_PROPERTY',
                });
            }

            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const result = checkObject(obj[key], path ? `${path}.${key}` : key);
                if (result) return result;
            }
        }
    };

    if (req.body && typeof req.body === 'object') {
        const result = checkObject(req.body);
        if (result) return result;
    }

    if (req.query && typeof req.query === 'object') {
        const result = checkObject(req.query);
        if (result) return result;
    }

    next();
};

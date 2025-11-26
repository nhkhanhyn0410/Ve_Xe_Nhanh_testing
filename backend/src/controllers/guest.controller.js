import OTPService from '../services/otp.service.js';
import GuestSessionService from '../services/guestSession.service.js';
import { logger } from '../utils/logger.js';

/**
 * Guest Controller
 * Handles guest booking OTP verification and session management
 */

/**
 * Request OTP for guest booking
 * POST /api/v1/guest/request-otp
 */
export const requestOTP = async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc số điện thoại là bắt buộc',
      });
    }

    if (!type || !['email', 'phone'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại xác thực không hợp lệ',
      });
    }

    const result = await OTPService.requestOTP(identifier, type);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresIn: result.expiresIn,
        expiresAt: result.expiresAt,
        // Development only
        ...(process.env.NODE_ENV === 'development' && { otp: result.otp }),
      },
    });
  } catch (error) {
    logger.error('Request OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể gửi mã OTP',
    });
  }
};

/**
 * Verify OTP and create guest session
 * POST /api/v1/guest/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { identifier, otp, type, name } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email/Số điện thoại và mã OTP là bắt buộc',
      });
    }

    // Verify OTP
    const verifyResult = await OTPService.verifyOTP(identifier, otp);

    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message,
        code: verifyResult.code,
        attemptsLeft: verifyResult.attemptsLeft,
      });
    }

    // Create guest session
    const guestData = {
      [type]: identifier,
      name: name || '',
    };

    // Fill in both email and phone if available
    if (type === 'email') {
      guestData.email = identifier;
    } else {
      guestData.phone = identifier;
    }

    const session = await GuestSessionService.createSession(guestData);

    res.status(200).json({
      success: true,
      message: 'Xác thực thành công',
      data: {
        sessionToken: session.sessionToken,
        expiresIn: session.expiresIn,
        expiresAt: session.expiresAt,
        guest: session.guestData,
      },
    });
  } catch (error) {
    logger.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể xác thực OTP',
    });
  }
};

/**
 * Get guest session info
 * GET /api/v1/guest/session
 */
export const getSession = async (req, res) => {
  try {
    const sessionToken = req.headers['x-guest-token'];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Session token là bắt buộc',
      });
    }

    const sessionData = await GuestSessionService.verifySession(sessionToken);

    if (!sessionData) {
      return res.status(401).json({
        success: false,
        message: 'Session không hợp lệ hoặc đã hết hạn',
      });
    }

    res.status(200).json({
      success: true,
      data: sessionData,
    });
  } catch (error) {
    logger.error('Get session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể lấy thông tin session',
    });
  }
};

/**
 * Extend guest session
 * POST /api/v1/guest/extend-session
 */
export const extendSession = async (req, res) => {
  try {
    const sessionToken = req.headers['x-guest-token'];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Session token là bắt buộc',
      });
    }

    const result = await GuestSessionService.extendSession(sessionToken);

    res.status(200).json({
      success: true,
      message: 'Gia hạn session thành công',
      data: {
        expiresIn: result.expiresIn,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    logger.error('Extend session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể gia hạn session',
    });
  }
};

/**
 * Update guest session data
 * PUT /api/v1/guest/session
 */
export const updateSession = async (req, res) => {
  try {
    const sessionToken = req.headers['x-guest-token'];
    const { name, email, phone } = req.body;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Session token là bắt buộc',
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const result = await GuestSessionService.updateSession(sessionToken, updates);

    res.status(200).json({
      success: true,
      message: 'Cập nhật session thành công',
      data: result.sessionData,
    });
  } catch (error) {
    logger.error('Update session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể cập nhật session',
    });
  }
};

/**
 * Delete guest session (logout)
 * DELETE /api/v1/guest/session
 */
export const deleteSession = async (req, res) => {
  try {
    const sessionToken = req.headers['x-guest-token'];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Session token là bắt buộc',
      });
    }

    await GuestSessionService.deleteSession(sessionToken);

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    logger.error('Delete session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể đăng xuất',
    });
  }
};

/**
 * Check OTP status
 * GET /api/v1/guest/otp-status/:identifier
 */
export const checkOTPStatus = async (req, res) => {
  try {
    const { identifier } = req.params;

    const result = await OTPService.checkOTPExists(identifier);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Check OTP status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể kiểm tra trạng thái OTP',
    });
  }
};
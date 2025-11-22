import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

/**
 * Auth Service
 * Xử lý các logic liên quan đến authentication
 */
class AuthService {
  /**
   * Tạo JWT token
   * @param {Object} payload - Dữ liệu cần mã hóa trong token
   * @param {String} expiresIn - Thời gian hết hạn (e.g., '1d', '7d')
   * @returns {String} JWT token
   */
  static generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      issuer: 'quikride',
    });
  }

  /**
   * Tạo access token (ngắn hạn - 1 ngày)
   * @param {Object} user - User object
   * @param {Boolean} rememberMe - Remember me option (30 days if true)
   * @returns {String} Access token
   */
  static generateAccessToken(user, rememberMe = false) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const expiresIn = rememberMe ? '30d' : (process.env.JWT_ACCESS_EXPIRES || '1d');
    return this.generateToken(payload, expiresIn);
  }

  /**
   * Tạo refresh token (dài hạn - 7 ngày hoặc 30 ngày nếu remember me)
   * @param {Object} user - User object
   * @param {Boolean} rememberMe - Remember me option
   * @returns {String} Refresh token
   */
  static generateRefreshToken(user, rememberMe = false) {
    const payload = {
      userId: user._id,
      type: 'refresh',
    };

    const expiresIn = rememberMe ? '30d' : (process.env.JWT_REFRESH_EXPIRES || '7d');
    return this.generateToken(payload, expiresIn);
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token đã hết hạn');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token không hợp lệ');
      }
      throw new Error('Xác thực token thất bại');
    }
  }

  /**
   * Đăng ký user mới
   * @param {Object} userData - Thông tin user
   * @returns {Object} User và tokens
   */
  static async register(userData) {
    const { email, phone, password, fullName } = userData;

    // Kiểm tra email hoặc phone đã tồn tại
    const existingUser = await User.findByEmailOrPhone(email || phone);
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new Error('Email đã được sử dụng');
      }
      if (existingUser.phone === phone) {
        throw new Error('Số điện thoại đã được sử dụng');
      }
    }

    // Tạo user mới
    const user = await User.create({
      email: email.toLowerCase(),
      phone,
      password, // Password sẽ được hash tự động trong pre-save hook
      fullName,
    });

    // Tạo email verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Gửi email verification
    // await emailService.sendVerificationEmail(user.email, verificationToken);

    // Tạo tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.success(`User registered successfully: ${user.email} - ID: ${user._id}`);

    // Chuẩn bị response (loại bỏ sensitive data)
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
      verificationToken, // Chỉ để test, production sẽ gửi qua email
    };
  }

  /**
   * Đăng nhập
   * @param {String} identifier - Email hoặc phone
   * @param {String} password - Password
   * @param {Boolean} rememberMe - Remember me option
   * @returns {Object} User và tokens
   */
  static async login(identifier, password, rememberMe = false) {
    // Tìm user và select password để so sánh
    const user = await User.findByEmailOrPhone(identifier).select('+password');

    if (!user) {
      throw new Error('Email/Số điện thoại hoặc mật khẩu không đúng');
    }

    // Kiểm tra account status
    if (user.isBlocked) {
      throw new Error(`Tài khoản đã bị khóa. Lý do: ${user.blockedReason || 'Không rõ'}`);
    }

    if (!user.isActive) {
      throw new Error('Tài khoản không hoạt động');
    }

    // So sánh password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new Error('Email/Số điện thoại hoặc mật khẩu không đúng');
    }

    // Cập nhật lastLogin
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Tạo tokens với remember me option
    const accessToken = this.generateAccessToken(user, rememberMe);
    const refreshToken = this.generateRefreshToken(user, rememberMe);

    logger.info(`User logged in: ${user.email} - ID: ${user._id}${rememberMe ? ' (Remember Me)' : ''}`);

    // Chuẩn bị response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Google OAuth Login/Register
   * @param {Object} googleProfile - Google profile data
   * @returns {Object} User và tokens
   */
  static async googleOAuth(googleProfile) {
    const { id, email, name, picture } = googleProfile;

    // Tìm user với googleId hoặc email
    let user = await User.findOne({
      $or: [{ googleId: id }, { email: email.toLowerCase() }],
    });

    if (user) {
      // User đã tồn tại - cập nhật googleId nếu chưa có
      if (!user.googleId) {
        user.googleId = id;
        user.isEmailVerified = true; // Email từ Google đã verified
        await user.save({ validateBeforeSave: false });
      }

      // Cập nhật lastLogin
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    } else {
      // Tạo user mới với Google account
      user = await User.create({
        email: email.toLowerCase(),
        fullName: name,
        googleId: id,
        avatar: picture,
        isEmailVerified: true,
        // OAuth users không cần password
        phone: `GOOGLE_${id}`, // Temporary phone, user can update later
      });
    }

    // Tạo tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.success(`Google OAuth login: ${user.email} - ID: ${user._id}`);

    // Chuẩn bị response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Facebook OAuth Login/Register
   * @param {Object} facebookProfile - Facebook profile data
   * @returns {Object} User và tokens
   */
  static async facebookOAuth(facebookProfile) {
    const { id, email, name, picture } = facebookProfile;

    // Tìm user với facebookId hoặc email
    let user = await User.findOne({
      $or: [{ facebookId: id }, { email: email?.toLowerCase() }],
    });

    if (user) {
      // User đã tồn tại - cập nhật facebookId nếu chưa có
      if (!user.facebookId) {
        user.facebookId = id;
        if (email) {
          user.isEmailVerified = true;
        }
        await user.save({ validateBeforeSave: false });
      }

      // Cập nhật lastLogin
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });
    } else {
      // Tạo user mới với Facebook account
      user = await User.create({
        email: email ? email.toLowerCase() : `facebook_${id}@quikride.temp`,
        fullName: name,
        facebookId: id,
        avatar: picture?.data?.url,
        isEmailVerified: email ? true : false,
        // OAuth users không cần password
        phone: `FACEBOOK_${id}`, // Temporary phone, user can update later
      });
    }

    // Tạo tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.success(`Facebook OAuth login: ${user.email} - ID: ${user._id}`);

    // Chuẩn bị response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   * @param {String} refreshToken - Refresh token
   * @returns {Object} New tokens
   */
  static async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const decoded = this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new Error('Token không hợp lệ');
    }

    // Tìm user
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User không tồn tại');
    }

    if (user.isBlocked || !user.isActive) {
      throw new Error('Tài khoản không hợp lệ');
    }

    // Tạo tokens mới
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Quên mật khẩu - Tạo reset token
   * @param {String} email - Email
   * @returns {String} Reset token
   */
  static async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new Error('Không tìm thấy user với email này');
    }

    // Tạo reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Gửi email reset password
    // await emailService.sendPasswordResetEmail(user.email, resetToken);

    return resetToken; // Chỉ để test, production sẽ gửi qua email
  }

  /**
   * Reset mật khẩu
   * @param {String} resetToken - Reset token
   * @param {String} newPassword - Mật khẩu mới
   * @returns {Boolean} Success
   */
  static async resetPassword(resetToken, newPassword) {
    // Hash reset token để so sánh
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Tìm user với token và kiểm tra expiry
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật password
    user.password = newPassword; // Sẽ được hash tự động
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.success(`Password reset successfully for user: ${user.email}`);

    return true;
  }

  /**
   * Verify email
   * @param {String} verificationToken - Verification token
   * @returns {Object} User
   */
  static async verifyEmail(verificationToken) {
    // Hash verification token để so sánh
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Tìm user với token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    }).select('+emailVerificationToken');

    if (!user) {
      throw new Error('Token xác thực không hợp lệ');
    }

    if (user.isEmailVerified) {
      throw new Error('Email đã được xác thực');
    }

    // Update verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    logger.success(`Email verified successfully for user: ${user.email}`);

    return user;
  }

  /**
   * Gửi OTP xác thực phone
   * @param {String} userId - User ID
   * @returns {String} OTP (chỉ để test)
   */
  static async sendPhoneOTP(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User không tồn tại');
    }

    if (user.isPhoneVerified) {
      throw new Error('Số điện thoại đã được xác thực');
    }

    // Tạo OTP
    const otp = user.createPhoneOTP();
    await user.save({ validateBeforeSave: false });

    // TODO: Gửi SMS với OTP
    // await smsService.sendOTP(user.phone, otp);

    return otp; // Chỉ để test, production không return OTP
  }

  /**
   * Verify phone với OTP
   * @param {String} userId - User ID
   * @param {String} otp - OTP
   * @returns {Boolean} Success
   */
  static async verifyPhone(userId, otp) {
    const user = await User.findById(userId).select('+phoneVerificationOTP +otpExpires');

    if (!user) {
      throw new Error('User không tồn tại');
    }

    if (user.isPhoneVerified) {
      throw new Error('Số điện thoại đã được xác thực');
    }

    // Kiểm tra OTP
    if (!user.phoneVerificationOTP || user.phoneVerificationOTP !== otp) {
      throw new Error('OTP không đúng');
    }

    // Kiểm tra expiry
    if (user.otpExpires < Date.now()) {
      throw new Error('OTP đã hết hạn');
    }

    // Update verification status
    user.isPhoneVerified = true;
    user.phoneVerificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.success(`Phone verified successfully for user: ${user.phone}`);

    return true;
  }
}

export default AuthService;

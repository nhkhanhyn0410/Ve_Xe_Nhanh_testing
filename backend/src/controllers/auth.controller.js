// import AuthService from '../services/auth.service.js';
import { logger } from '../utils/logger.js';

/**
 * Auth Controller
 * Xử lý các HTTP requests liên quan đến authentication
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Đăng ký user mới
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { email, phone, password, fullName } = req.body;

        // Validate input
        if (!email || !phone || !password || !fullName) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp đầy đủ thông tin: email, phone, password, fullName',
            });
        }

        // Register user
        const result = await AuthService.register({
            email,
            phone,
            password,
            fullName,
        });

        res.status(201).json({
            status: 'success',
            message: 'Đăng ký thành công',
            data: {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                // verificationToken chỉ để test, production sẽ gửi qua email
                ...(process.env.NODE_ENV === 'development' && {
                    verificationToken: result.verificationToken,
                }),
            },
        });
    } catch (error) {
        logger.error('Register error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Đăng ký thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { identifier, password, rememberMe } = req.body;

        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp email/số điện thoại và mật khẩu',
            });
        }

        // Login with remember me option
        const result = await AuthService.login(identifier, password, rememberMe || false);

        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(401).json({
            status: 'error',
            message: error.message || 'Đăng nhập thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Làm mới access token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp refresh token',
            });
        }

        const result = await AuthService.refreshAccessToken(refreshToken);

        res.status(200).json({
            status: 'success',
            message: 'Làm mới token thành công',
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    } catch (error) {
        logger.error('Refresh token error:', error);
        res.status(401).json({
            status: 'error',
            message: error.message || 'Làm mới token thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Quên mật khẩu - Gửi reset token
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp email',
            });
        }

        const resetToken = await AuthService.forgotPassword(email);

        res.status(200).json({
            status: 'success',
            message: 'Email reset password đã được gửi',
            // resetToken chỉ để test, production sẽ gửi qua email
            ...(process.env.NODE_ENV === 'development' && {
                data: { resetToken },
            }),
        });
    } catch (error) {
        logger.error('Forgot password error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Xử lý quên mật khẩu thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset mật khẩu
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp reset token và mật khẩu mới',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'Mật khẩu phải có ít nhất 6 ký tự',
            });
        }

        await AuthService.resetPassword(resetToken, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Đặt lại mật khẩu thành công',
        });
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Đặt lại mật khẩu thất bại',
        });
    }
};

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Xác thực email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Token không hợp lệ',
            });
        }

        const user = await AuthService.verifyEmail(token);

        res.status(200).json({
            status: 'success',
            message: 'Xác thực email thành công',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                },
            },
        });
    } catch (error) {
        logger.error('Verify email error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Xác thực email thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/send-phone-otp
 * @desc    Gửi OTP xác thực phone
 * @access  Private
 */
export const sendPhoneOTP = async (req, res, next) => {
    try {
        const userId = req.userId; // Từ authenticate middleware

        const otp = await AuthService.sendPhoneOTP(userId);

        res.status(200).json({
            status: 'success',
            message: 'OTP đã được gửi đến số điện thoại',
            // otp chỉ để test, production sẽ gửi qua SMS
            ...(process.env.NODE_ENV === 'development' && {
                data: { otp },
            }),
        });
    } catch (error) {
        logger.error('Send phone OTP error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Gửi OTP thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/verify-phone
 * @desc    Xác thực phone với OTP
 * @access  Private
 */
export const verifyPhone = async (req, res, next) => {
    try {
        const userId = req.userId; // Từ authenticate middleware
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp OTP',
            });
        }

        await AuthService.verifyPhone(userId, otp);

        res.status(200).json({
            status: 'success',
            message: 'Xác thực số điện thoại thành công',
        });
    } catch (error) {
        logger.error('Verify phone error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Xác thực số điện thoại thất bại',
        });
    }
};

/**
 * @route   GET /api/v1/auth/me
 * @desc    Lấy thông tin user hiện tại
 * @access  Private
 */
export const getMe = async (req, res, next) => {
    try {
        const user = req.user; // Từ authenticate middleware

        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        logger.error('Get me error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Lỗi server',
        });
    }
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
export const logout = async (req, res, next) => {
    try {
        // Note: Với JWT, logout được xử lý ở client bằng cách xóa token
        // Server có thể implement blacklist nếu cần
        // TODO: Implement token blacklist với Redis nếu cần

        res.status(200).json({
            status: 'success',
            message: 'Đăng xuất thành công',
        });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Đăng xuất thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/google
 * @desc    Google OAuth login/register
 * @access  Public
 */
export const googleOAuth = async (req, res, next) => {
    try {
        const { googleToken } = req.body;

        if (!googleToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp Google token',
            });
        }

        // TODO: Verify Google token với Google API
        // For now, we expect the client to send the verified profile data
        const googleProfile = req.body.profile;

        if (!googleProfile || !googleProfile.id || !googleProfile.email) {
            return res.status(400).json({
                status: 'error',
                message: 'Thông tin Google profile không hợp lệ',
            });
        }

        const result = await AuthService.googleOAuth(googleProfile);

        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập Google thành công',
            data: {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    } catch (error) {
        logger.error('Google OAuth error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Đăng nhập Google thất bại',
        });
    }
};

/**
 * @route   POST /api/v1/auth/facebook
 * @desc    Facebook OAuth login/register
 * @access  Public
 */
export const facebookOAuth = async (req, res, next) => {
    try {
        const { facebookToken } = req.body;

        if (!facebookToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Vui lòng cung cấp Facebook token',
            });
        }

        // TODO: Verify Facebook token với Facebook API
        // For now, we expect the client to send the verified profile data
        const facebookProfile = req.body.profile;

        if (!facebookProfile || !facebookProfile.id || !facebookProfile.name) {
            return res.status(400).json({
                status: 'error',
                message: 'Thông tin Facebook profile không hợp lệ',
            });
        }

        const result = await AuthService.facebookOAuth(facebookProfile);

        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập Facebook thành công',
            data: {
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            },
        });
    } catch (error) {
        logger.error('Facebook OAuth error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Đăng nhập Facebook thất bại',
        });
    }
};

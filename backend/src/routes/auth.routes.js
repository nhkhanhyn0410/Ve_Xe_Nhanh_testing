import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
// import {
//     validateRegister,
//     validateLogin,
//     validateRefreshToken,
//     validateForgotPassword,
//     validateResetPassword,
//     validateVerifyEmail,
//     validateVerifyPhone,
// } from '../middleware/validate.middleware.js';

const router = express.Router();

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// Public routes (không cần authentication)
// router.post('/register', validateRegister, authController.register);
// router.post('/login', validateLogin, authController.login);
// router.post('/refresh-token', validateRefreshToken, authController.refreshToken);
// router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
// router.post('/reset-password', validateResetPassword, authController.resetPassword);
// router.get('/verify-email/:token', validateVerifyEmail, authController.verifyEmail);

// OAuth routes
// router.post('/google', authController.googleOAuth);
// router.post('/facebook', authController.facebookOAuth);

// // Protected routes (cần authentication)
// router.use(authenticate); // Tất cả routes sau đây yêu cầu đăng nhập

// router.get('/me', authController.getMe);
// router.post('/logout', authController.logout);
// router.post('/send-phone-otp', authController.sendPhoneOTP);
// router.post('/verify-phone', validateVerifyPhone, authController.verifyPhone);

export default router;

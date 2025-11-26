const { REGEX_PATTERNS } = require('./constants');

/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => REGEX_PATTERNS.EMAIL.test(email);

/**
 * Validate phone number (Vietnam format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
const isValidPhone = (phone) => REGEX_PATTERNS.PHONE.test(phone);

/**
 * Validate license plate (Vietnam format)
 * @param {string} plate - License plate to validate
 * @returns {boolean} - True if valid
 */
const isValidLicensePlate = (plate) => REGEX_PATTERNS.LICENSE_PLATE.test(plate);

/**
 * Validate ID card (CMND/CCCD)
 * @param {string} idCard - ID card to validate
 * @returns {boolean} - True if valid
 */
const isValidIdCard = (idCard) => REGEX_PATTERNS.ID_CARD.test(idCard);

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Mật khẩu không được để trống' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Mật khẩu không được vượt quá 128 ký tự' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { valid: false, message: 'Mật khẩu phải chứa cả chữ và số' };
  }

  return { valid: true, message: 'Mật khẩu hợp lệ' };
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} - True if valid
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

/**
 * Validate future date
 * @param {Date} date - Date to validate
 * @returns {boolean} - True if date is in the future
 */
const isFutureDate = (date) => new Date(date) > new Date();

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Sanitize string (remove HTML tags and special characters)
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove special characters
    .trim();
};

/**
 * Validate seat number format
 * @param {string} seatNumber - Seat number (e.g., "A1", "B12")
 * @returns {boolean} - True if valid
 */
const isValidSeatNumber = (seatNumber) => /^[A-Z][0-9]{1,2}$/.test(seatNumber);

/**
 * Validate booking code format
 * @param {string} code - Booking code
 * @returns {boolean} - True if valid
 */
const isValidBookingCode = (code) => /^QR-\d{8}-[A-Z0-9]{4,8}$/.test(code);

/**
 * Validate amount (must be positive number)
 * @param {number} amount - Amount to validate
 * @returns {boolean} - True if valid
 */
const isValidAmount = (amount) => typeof amount === 'number' && amount > 0 && !Number.isNaN(amount);

/**
 * Validate percentage (0-100)
 * @param {number} percentage - Percentage to validate
 * @returns {boolean} - True if valid
 */
const isValidPercentage = (percentage) =>
  typeof percentage === 'number' && percentage >= 0 && percentage <= 100;

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} - True if valid
 */
const isValidCoordinates = (lat, lng) =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidLicensePlate,
  isValidIdCard,
  validatePassword,
  isValidDateRange,
  isFutureDate,
  isValidObjectId,
  sanitizeString,
  isValidSeatNumber,
  isValidBookingCode,
  isValidAmount,
  isValidPercentage,
  isValidCoordinates,
};

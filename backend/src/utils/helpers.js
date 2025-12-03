const crypto = require('crypto');
const moment = require('moment-timezone');

/**
 * Helper utility functions
 */

/**
 * Generate random string
 * @param {number} length - Length of the string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 8) =>
  crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();

/**
 * Generate booking code
 * @returns {string} - Booking code (e.g., "QR-20240115-ABCD")
 */
const generateBookingCode = () => {
  const date = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDD');
  const random = generateRandomString(4);
  return `QR-${date}-${random}`;
};

/**
 * Generate ticket code
 * @returns {string} - Ticket code (e.g., "TKT-20240115-ABCDEFGH")
 */
const generateTicketCode = () => {
  const date = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDD');
  const random = generateRandomString(8);
  return `TKT-${date}-${random}`;
};

/**
 * Generate OTP (6 digits)
 * @returns {string} - OTP code
 */
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Generate reset token
 * @returns {string} - Reset token
 */
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

/**
 * Hash token
 * @param {string} token - Token to hash
 * @returns {string} - Hashed token
 */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Calculate refund amount based on cancellation policy
 * @param {number} totalAmount - Total booking amount
 * @param {Date} tripDepartureTime - Trip departure time
 * @returns {object} - { refundAmount, refundPercentage }
 */
const calculateRefund = (totalAmount, tripDepartureTime) => {
  const now = moment().tz('Asia/Ho_Chi_Minh');
  const departure = moment(tripDepartureTime).tz('Asia/Ho_Chi_Minh');
  const hoursUntilDeparture = departure.diff(now, 'hours', true);

  let refundPercentage = 0;

  if (hoursUntilDeparture >= 2) {
    refundPercentage = 100;
  } else {
    refundPercentage = 0;
  }

  const refundAmount = Math.floor((totalAmount * refundPercentage) / 100);

  return {
    refundAmount,
    refundPercentage,
    hoursUntilDeparture: Math.floor(hoursUntilDeparture),
  };
};

/**
 * Calculate loyalty points
 * @param {number} amount - Booking amount
 * @returns {number} - Points earned
 */
const calculateLoyaltyPoints = (amount) => {
  const POINTS_PER_VND = 0.01; // 1 point for every 100 VND
  return Math.floor(amount * POINTS_PER_VND);
};

/**
 * Determine loyalty tier based on points
 * @param {number} points - Total points
 * @returns {string} - Loyalty tier
 */
const getLoyaltyTier = (points) => {
  if (points >= 10000) return 'platinum';
  if (points >= 5000) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
};

/**
 * Format currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted amount
 */
const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

/**
 * Format date time
 * @param {Date} date - Date to format
 * @param {string} format - Format string (default: DD/MM/YYYY HH:mm)
 * @returns {string} - Formatted date
 */
const formatDateTime = (date, format = 'DD/MM/YYYY HH:mm') =>
  moment(date).tz('Asia/Ho_Chi_Minh').format(format);

/**
 * Calculate trip duration in hours
 * @param {Date} departureTime - Departure time
 * @param {Date} arrivalTime - Arrival time
 * @returns {number} - Duration in hours
 */
const calculateTripDuration = (departureTime, arrivalTime) => {
  const departure = moment(departureTime);
  const arrival = moment(arrivalTime);
  return arrival.diff(departure, 'hours', true);
};

/**
 * Parse seats from array to string
 * @param {Array} seats - Array of seat numbers
 * @returns {string} - Comma-separated seat numbers
 */
const parseSeatString = (seats) => seats.join(', ');

/**
 * Paginate results
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} - { skip, limit }
 */
const getPagination = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  const skip = (parsedPage - 1) * parsedLimit;

  return {
    skip,
    limit: parsedLimit,
  };
};

/**
 * Create pagination response
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
const createPaginationResponse = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after ms
 */
const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Generate slug from string
 * @param {string} str - String to slugify
 * @returns {string} - Slugified string
 */
const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim();

/**
 * Check if date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} - True if past
 */
const isPastDate = (date) => moment(date).isBefore(moment());

/**
 * Check if time is within range
 * @param {Date} time - Time to check
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {boolean} - True if within range
 */
const isTimeInRange = (time, startTime, endTime) => {
  const t = moment(time);
  const start = moment(startTime);
  const end = moment(endTime);
  return t.isBetween(start, end);
};

/**
 * Mask email for privacy
 * @param {string} email - Email to mask
 * @returns {string} - Masked email
 */
const maskEmail = (email) => {
  const [name, domain] = email.split('@');
  const maskedName = `${name.charAt(0)}***${name.charAt(name.length - 1)}`;
  return `${maskedName}@${domain}`;
};

/**
 * Mask phone number for privacy
 * @param {string} phone - Phone to mask
 * @returns {string} - Masked phone
 */
const maskPhone = (phone) => phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

module.exports = {
  generateRandomString,
  generateBookingCode,
  generateTicketCode,
  generateOTP,
  generateResetToken,
  hashToken,
  calculateRefund,
  calculateLoyaltyPoints,
  getLoyaltyTier,
  formatCurrency,
  formatDateTime,
  calculateTripDuration,
  parseSeatString,
  getPagination,
  createPaginationResponse,
  sleep,
  slugify,
  isPastDate,
  isTimeInRange,
  maskEmail,
  maskPhone,
};

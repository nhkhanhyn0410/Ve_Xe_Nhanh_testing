/**
 * Application Constants
 */

// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

// Bus Operator Status
const OPERATOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

// Bus Types
const BUS_TYPES = {
  LIMOUSINE: 'limousine',
  SLEEPER: 'sleeper',
  SEATER: 'seater',
  DOUBLE_DECKER: 'double_decker',
};

// Bus Status
const BUS_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
};

// Trip Status
const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Booking Status
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods
const PAYMENT_METHODS = {
  VNPAY: 'vnpay',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  ATM: 'atm',
  VISA: 'visa',
  MASTERCARD: 'mastercard',
  COD: 'cod',
};

// Ticket Status
const TICKET_STATUS = {
  VALID: 'valid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  USED: 'used',
};

// Refund Status
const REFUND_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Employee Roles
const EMPLOYEE_ROLES = {
  DRIVER: 'driver',
  TRIP_MANAGER: 'trip_manager',
};

// Employee Status
const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  SUSPENDED: 'suspended',
  TERMINATED: 'terminated',
};

// Loyalty Tiers
const LOYALTY_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

// Voucher Types
const VOUCHER_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

// Gender
const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
};

// Bus Amenities
const BUS_AMENITIES = [
  'wifi',
  'ac',
  'toilet',
  'tv',
  'water',
  'blanket',
  'pillow',
  'usb_charger',
  'reclining_seat',
  'reading_light',
];

// Cancellation Policy
const CANCELLATION_POLICY = {
  MORE_THAN_2H: {
    hours: 2,
    refundPercentage: 100,
  },
  LESS_THAN_2H: {
    hours: 2,
    refundPercentage: 0,
  },
};

// Seat Hold Duration (15 minutes)
const SEAT_HOLD_DURATION = 15 * 60 * 1000; // milliseconds

// OTP Expiry (5 minutes)
const OTP_EXPIRE_DURATION = 5 * 60 * 1000; // milliseconds

// Points per VND spent
const POINTS_PER_VND = 0.01; // 1 point for every 100 VND

// Tier thresholds (points needed)
const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 10000,
};

// Regex Patterns
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(0|\+84)[0-9]{9}$/,
  LICENSE_PLATE: /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/,
  ID_CARD: /^[0-9]{9,12}$/,
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
  NOT_FOUND: 'Không tìm thấy tài nguyên.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  DUPLICATE_EMAIL: 'Email đã được sử dụng.',
  DUPLICATE_PHONE: 'Số điện thoại đã được sử dụng.',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_BLOCKED: 'Tài khoản của bạn đã bị khóa.',
  SEAT_NOT_AVAILABLE: 'Ghế không còn trống.',
  BOOKING_EXPIRED: 'Đơn đặt vé đã hết hạn.',
  PAYMENT_FAILED: 'Thanh toán thất bại.',
  TICKET_ALREADY_USED: 'Vé đã được sử dụng.',
  TICKET_CANCELLED: 'Vé đã bị hủy.',
  CANCELLATION_NOT_ALLOWED: 'Không thể hủy vé trong thời gian này.',
};

// Success Messages
const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  LOGOUT_SUCCESS: 'Đăng xuất thành công.',
  EMAIL_SENT: 'Email đã được gửi.',
  PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công.',
  PROFILE_UPDATED: 'Cập nhật thông tin thành công.',
  BOOKING_SUCCESS: 'Đặt vé thành công.',
  PAYMENT_SUCCESS: 'Thanh toán thành công.',
  CANCELLATION_SUCCESS: 'Hủy vé thành công.',
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

module.exports = {
  USER_ROLES,
  OPERATOR_STATUS,
  BUS_TYPES,
  BUS_STATUS,
  TRIP_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  TICKET_STATUS,
  REFUND_STATUS,
  EMPLOYEE_ROLES,
  EMPLOYEE_STATUS,
  LOYALTY_TIERS,
  VOUCHER_TYPES,
  GENDER,
  BUS_AMENITIES,
  CANCELLATION_POLICY,
  SEAT_HOLD_DURATION,
  OTP_EXPIRE_DURATION,
  POINTS_PER_VND,
  TIER_THRESHOLDS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
};

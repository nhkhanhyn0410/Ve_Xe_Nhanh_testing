# BÁO CÁO ĐỀ TÀI - PHẦN 2: THIẾT KẾ VÀ TRIỂN KHAI

## XÂY DỰNG GIẢI PHÁP BẢO MẬT TOÀN DIỆN CHO RESTful API

---

## MỤC LỤC PHẦN 2

1. [KIẾN TRÚC HỆ THỐNG BẢO MẬT](#1-kiến-trúc-hệ-thống-bảo-mật)
2. [JWT - JSON WEB TOKEN](#2-jwt-json-web-token)
3. [REDIS - QUẢN LÝ SESSION VÀ TOKEN](#3-redis-quản-lý-session-và-token)
4. [EXPRESS-RATE-LIMIT - CHỐNG BRUTE-FORCE VÀ DOS](#4-express-rate-limit)
5. [TÍCH HỢP CÁC THÀNH PHẦN](#5-tích-hợp-các-thành-phần)

---

## 1. KIẾN TRÚC HỆ THỐNG BẢO MẬT

### 1.1. Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │   Browser   │  │ Mobile App  │  │  Postman    │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
│         │                │                │                    │
│         └────────────────┴────────────────┘                    │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    SECURITY LAYER                               │
│                          │                                      │
│         ┌────────────────┴────────────────┐                    │
│         │                                  │                    │
│    ┌────▼────┐                      ┌─────▼──────┐            │
│    │ Helmet  │                      │   CORS     │            │
│    │Headers  │                      │ Validation │            │
│    └────┬────┘                      └─────┬──────┘            │
│         │                                  │                    │
│         └────────────────┬────────────────┘                    │
│                          │                                      │
│                    ┌─────▼──────┐                              │
│                    │Rate Limiter│                              │
│                    │100 req/min │                              │
│                    └─────┬──────┘                              │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                 AUTHENTICATION LAYER                            │
│                          │                                      │
│                    ┌─────▼──────┐                              │
│                    │   JWT      │                              │
│                    │ Middleware │                              │
│                    └─────┬──────┘                              │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                    │
│    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐               │
│    │  Verify │     │  Check  │     │  Check  │               │
│    │Signature│     │ Expiry  │     │  User   │               │
│    └────┬────┘     └────┬────┘     └────┬────┘               │
│         │                │                │                    │
│         └────────────────┴────────────────┘                    │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                  AUTHORIZATION LAYER                            │
│                          │                                      │
│                    ┌─────▼──────┐                              │
│                    │    RBAC    │                              │
│                    │ Middleware │                              │
│                    └─────┬──────┘                              │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│    ┌────▼────┐     ┌────▼────┐     ┌────▼────┐               │
│    │  Admin  │     │Operator │     │Customer │               │
│    │  Routes │     │ Routes  │     │ Routes  │               │
│    └────┬────┘     └────┬────┘     └────┬────┘               │
│         │                │                │                    │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
┌─────────┼────────────────┼────────────────┼─────────────────────┐
│         │         BUSINESS LOGIC          │                    │
│    Controllers & Services                │                    │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
┌─────────┼────────────────┼────────────────┼─────────────────────┐
│         └────────────────┴────────────────┘                    │
│                          │                                      │
│              ┌───────────┴───────────┐                         │
│              │                       │                         │
│         ┌────▼────┐            ┌────▼────┐                    │
│         │ MongoDB │            │  Redis  │                    │
│         │         │            │         │                    │
│         │ - Users │            │- Tokens │                    │
│         │ - Trips │            │- OTP    │                    │
│         │- Booking│            │- Locks  │                    │
│         └─────────┘            └─────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Các lớp bảo mật (Defense in Depth)

Hệ thống áp dụng chiến lược **phòng thủ theo chiều sâu** với 5 lớp:

| Lớp | Công nghệ | Chức năng |
|-----|-----------|-----------|
| **1. Transport Security** | HTTPS/TLS | Mã hóa dữ liệu truyền tải |
| **2. Security Headers** | Helmet.js | CSP, XSS Protection, HSTS |
| **3. Input Validation** | Express-validator | Validate & Sanitize input |
| **4. Authentication** | JWT | Xác thực người dùng |
| **5. Authorization** | RBAC | Phân quyền truy cập |
| **6. Rate Limiting** | Express-Rate-Limit | Chống brute-force, DoS |
| **7. Data Protection** | bcrypt, crypto | Mã hóa password, token |

### 1.3. Luồng xử lý request

```
1. Client gửi request
   ↓
2. HTTPS/TLS encryption
   ↓
3. Security headers (Helmet)
   ↓
4. CORS validation
   ↓
5. Rate limiting check
   ↓
6. Input sanitization
   ↓
7. JWT verification
   ↓
8. User authentication
   ↓
9. Role-based authorization
   ↓
10. Business logic
   ↓
11. Response
```

---

## 2. JWT - JSON WEB TOKEN

### 2.1. Tại sao chọn JWT?

#### So sánh Session-based vs Token-based

| Tiêu chí | Session-based | JWT (Token-based) |
|----------|---------------|-------------------|
| **Storage** | Server memory/DB | Client-side |
| **Scalability** | Khó (sticky session) | Dễ (stateless) |
| **Performance** | Cần query DB | Không cần DB |
| **Security** | Dễ revoke | Khó revoke (cần blacklist) |
| **Mobile-friendly** | Khó | Dễ |
| **Microservices** | Khó | Dễ |

**Kết luận:** JWT phù hợp với hệ thống Vé Xe Nhanh vì:
- ✅ Scalable (nhiều server)
- ✅ Mobile app support
- ✅ Stateless (giảm tải DB)
- ⚠️ Kết hợp Redis để revoke tokens

### 2.2. Thiết kế JWT trong hệ thống

#### 2.2.1. Dual Token Strategy

Sử dụng **2 loại token** để cân bằng giữa bảo mật và trải nghiệm người dùng:

```
┌─────────────────┐         ┌─────────────────┐
│  ACCESS TOKEN   │         │ REFRESH TOKEN   │
├─────────────────┤         ├─────────────────┤
│ Expiry: 1 day   │         │ Expiry: 7 days  │
│ (30 days if     │         │ (30 days if     │
│  Remember Me)   │         │  Remember Me)   │
├─────────────────┤         ├─────────────────┤
│ Payload:        │         │ Payload:        │
│ - userId        │         │ - userId        │
│ - email         │         │ - type:refresh  │
│ - role          │         │                 │
│ - type:access   │         │                 │
├─────────────────┤         ├─────────────────┤
│ Use for:        │         │ Use for:        │
│ - API requests  │         │ - Renew access  │
│ - Authorization │         │   token         │
└─────────────────┘         └─────────────────┘
```

**Lý do sử dụng Dual Token:**

1. **Access Token ngắn hạn (1 ngày):**
   - Giảm thiểu rủi ro nếu bị đánh cắp
   - User không cần login lại liên tục trong ngày

2. **Refresh Token dài hạn (7-30 ngày):**
   - Tự động gia hạn access token
   - Lưu trong Redis để có thể revoke

#### 2.2.2. Cấu trúc JWT

**File:** `backend/src/config/security.js`

```javascript
module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,           // Secret key (min 32 chars)
    accessExpiresIn: '1d',                    // Access token: 1 ngày
    refreshExpiresIn: '7d',                   // Refresh token: 7 ngày
    rememberMeExpiresIn: '30d',              // Remember me: 30 ngày
    issuer: 'vexenhanh',                      // Token issuer
  }
};
```

#### 2.2.3. Tạo JWT Token

**File:** `backend/src/services/auth.service.js`

```javascript
class AuthService {
  /**
   * Tạo Access Token
   */
  static generateAccessToken(user, rememberMe = false) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      type: 'access',        // Phân biệt loại token
    };

    const expiresIn = rememberMe
      ? '30d'
      : (process.env.JWT_ACCESS_EXPIRES || '1d');

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      issuer: 'vexenhanh',
    });
  }

  /**
   * Tạo Refresh Token
   */
  static generateRefreshToken(user, rememberMe = false) {
    const payload = {
      userId: user._id,
      type: 'refresh',
    };

    const expiresIn = rememberMe
      ? '30d'
      : (process.env.JWT_REFRESH_EXPIRES || '7d');

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
      issuer: 'vexenhanh',
    });
  }

  /**
   * Verify JWT token
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
}
```

#### 2.2.4. Authentication Middleware

**File:** `backend/src/middleware/auth.middleware.js`

```javascript
const authenticate = async (req, res, next) => {
  try {
    // 1. Lấy token từ header
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

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
        message: error.message,
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

    // 4. Kiểm tra user còn tồn tại
    let user;
    if (decoded.role === 'operator') {
      user = await BusOperator.findById(decoded.userId);
    } else if (decoded.role === 'trip_manager' || decoded.role === 'driver') {
      user = await Employee.findById(decoded.userId);
    } else {
      user = await User.findById(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Tài khoản không tồn tại',
        code: 'USER_NOT_FOUND',
      });
    }

    // 5. Kiểm tra account status
    if (user.isBlocked || !user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Tài khoản đã bị khóa',
        code: 'ACCOUNT_BLOCKED',
      });
    }

    // 6. Kiểm tra session timeout (30 phút)
    if (!checkSessionTimeout(user)) {
      return res.status(401).json({
        status: 'error',
        message: 'Phiên đăng nhập đã hết hạn',
        code: 'SESSION_TIMEOUT',
      });
    }

    // 7. Update lastLogin để extend session
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 8. Lưu user vào request
    req.user = user;
    req.userId = user._id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    logger.error('Lỗi xác thực:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi xác thực',
    });
  }
};
```

**Các bước xác thực:**

```
1. Lấy token từ header "Authorization: Bearer <token>"
   ↓
2. Verify JWT signature và expiry
   ↓
3. Kiểm tra token type (access vs refresh)
   ↓
4. Tìm user trong database (theo role)
   ↓
5. Kiểm tra account status (blocked, active)
   ↓
6. Kiểm tra session timeout (30 phút)
   ↓
7. Update lastLogin (extend session)
   ↓
8. Cho phép truy cập
```

#### 2.2.5. Authorization Middleware (RBAC)

```javascript
/**
 * Middleware kiểm tra role
 * Usage: authorize('admin', 'operator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Vui lòng đăng nhập',
      });
    }

    const userRole = req.userRole || req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Bạn không có quyền truy cập tài nguyên này',
      });
    }

    next();
  };
};
```

**Ví dụ sử dụng:**

```javascript
// Routes cho Admin
router.get('/admin/users',
  authenticate,
  authorize('admin'),
  getAllUsers
);

// Routes cho Operator
router.post('/operators/trips',
  authenticate,
  authorize('operator'),
  createTrip
);

// Routes cho Customer hoặc Admin
router.get('/bookings/:id',
  authenticate,
  authorize('customer', 'admin'),
  getBooking
);
```

### 2.3. Luồng đăng nhập (Login Flow)

```
┌────────┐                         ┌────────┐                  ┌──────────┐
│ Client │                         │ Server │                  │   Redis  │
└───┬────┘                         └───┬────┘                  └────┬─────┘
    │                                  │                            │
    │ POST /auth/login                 │                            │
    │ { email, password }              │                            │
    ├─────────────────────────────────>│                            │
    │                                  │                            │
    │                                  │ 1. Tìm user trong DB       │
    │                                  │ 2. Verify password (bcrypt)│
    │                                  │                            │
    │                                  │ 3. Generate tokens         │
    │                                  │    - Access Token (1d)     │
    │                                  │    - Refresh Token (7d)    │
    │                                  │                            │
    │                                  │ 4. Store refresh token     │
    │                                  ├───────────────────────────>│
    │                                  │   SET refresh:{userId}     │
    │                                  │   EX 604800 (7 days)       │
    │                                  │<───────────────────────────│
    │                                  │   OK                       │
    │                                  │                            │
    │ 200 OK                           │                            │
    │ { user, accessToken,             │                            │
    │   refreshToken }                 │                            │
    │<─────────────────────────────────│                            │
    │                                  │                            │
    │ Store tokens in localStorage     │                            │
    │                                  │                            │
```

### 2.4. Luồng refresh token

```
┌────────┐                         ┌────────┐                  ┌──────────┐
│ Client │                         │ Server │                  │   Redis  │
└───┬────┘                         └───┬────┘                  └────┬─────┘
    │                                  │                            │
    │ Access Token hết hạn             │                            │
    │                                  │                            │
    │ POST /auth/refresh               │                            │
    │ { refreshToken }                 │                            │
    ├─────────────────────────────────>│                            │
    │                                  │                            │
    │                                  │ 1. Verify refresh token    │
    │                                  │                            │
    │                                  │ 2. Check token in Redis    │
    │                                  ├───────────────────────────>│
    │                                  │   EXISTS refresh:{userId}  │
    │                                  │<───────────────────────────│
    │                                  │   1 (exists)               │
    │                                  │                            │
    │                                  │ 3. Generate new tokens     │
    │                                  │                            │
    │                                  │ 4. Update Redis            │
    │                                  ├───────────────────────────>│
    │                                  │   SET refresh:{userId}     │
    │                                  │<───────────────────────────│
    │                                  │                            │
    │ 200 OK                           │                            │
    │ { accessToken, refreshToken }    │                            │
    │<─────────────────────────────────│                            │
    │                                  │                            │
```

### 2.5. Session Timeout

Hệ thống sử dụng **session timeout 30 phút** để tăng cường bảo mật:

```javascript
/**
 * Kiểm tra session timeout
 */
const checkSessionTimeout = (user) => {
  const sessionTimeout = 30; // 30 phút
  const timeoutMs = sessionTimeout * 60 * 1000;

  if (user.lastLogin) {
    const timeSinceLastLogin = Date.now() - new Date(user.lastLogin).getTime();
    return timeSinceLastLogin <= timeoutMs;
  }

  return true; // Newly created user
};
```

**Cơ chế hoạt động:**

1. Mỗi request hợp lệ → Update `lastLogin`
2. Nếu không có hoạt động trong 30 phút → Session expired
3. User phải login lại

**Lưu ý:** Session timeout chỉ áp dụng cho **Customer** và **Admin**, không áp dụng cho **Operator** và **Trip Manager** (họ cần login suốt ca làm việc).

---

## 3. REDIS - QUẢN LÝ SESSION VÀ TOKEN

### 3.1. Tại sao cần Redis?

JWT tự nó là **stateless**, nhưng chúng ta cần Redis để:

1. **Token Revocation (Thu hồi token):**
   - Logout → Blacklist token
   - Khóa tài khoản → Blacklist tất cả tokens

2. **Refresh Token Management:**
   - Lưu refresh token để kiểm tra khi renew
   - Giới hạn số lượng refresh token per user

3. **OTP Storage:**
   - Lưu OTP tạm thời (5 phút)
   - Rate limiting cho OTP requests

4. **Seat Locking:**
   - Khóa ghế tạm thời khi đặt vé (15 phút)
   - Tự động unlock khi hết thời gian

### 3.2. Cấu hình Redis

**File:** `backend/src/config/redis.js`

```javascript
const redis = require('redis');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB, 10) || 0,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Error:', err);
    });

    redisClient.on('connect', () => {
      logger.success('Redis connected');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error.message);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = connectRedis;
module.exports.getRedisClient = getRedisClient;
```

### 3.3. Quản lý Refresh Token

**Lưu refresh token khi login:**

```javascript
// auth.service.js
static async login(identifier, password, rememberMe = false) {
  // ... verify credentials ...

  const accessToken = this.generateAccessToken(user, rememberMe);
  const refreshToken = this.generateRefreshToken(user, rememberMe);

  // Lưu refresh token vào Redis
  const redis = getRedisClient();
  const key = `refresh:${user._id}`;
  const expirySeconds = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

  await redis.setEx(key, expirySeconds, refreshToken);

  return { user, accessToken, refreshToken };
}
```

**Verify refresh token:**

```javascript
static async refreshAccessToken(refreshToken) {
  // 1. Verify JWT
  const decoded = this.verifyToken(refreshToken);

  if (decoded.type !== 'refresh') {
    throw new Error('Token không hợp lệ');
  }

  // 2. Check token trong Redis
  const redis = getRedisClient();
  const key = `refresh:${decoded.userId}`;
  const storedToken = await redis.get(key);

  if (!storedToken || storedToken !== refreshToken) {
    throw new Error('Refresh token không hợp lệ hoặc đã bị thu hồi');
  }

  // 3. Tìm user
  const user = await User.findById(decoded.userId);
  if (!user || user.isBlocked || !user.isActive) {
    throw new Error('Tài khoản không hợp lệ');
  }

  // 4. Generate new tokens
  const newAccessToken = this.generateAccessToken(user);
  const newRefreshToken = this.generateRefreshToken(user);

  // 5. Update Redis
  await redis.setEx(key, 7 * 24 * 60 * 60, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
```

**Revoke refresh token (Logout):**

```javascript
static async logout(userId) {
  const redis = getRedisClient();
  const key = `refresh:${userId}`;

  await redis.del(key);

  return { success: true };
}
```

### 3.4. OTP Service với Redis

**File:** `backend/src/services/otp.service.js`

```javascript
class OTPService {
  /**
   * Tạo OTP 6 chữ số
   */
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Lưu OTP trong Redis
   */
  static async storeOTP(identifier, otp, expiryMinutes = 5) {
    const redis = getRedisClient();
    const key = `otp:${identifier}`;
    const expirySeconds = expiryMinutes * 60;

    const otpData = {
      otp,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3,
    };

    await redis.setEx(key, expirySeconds, JSON.stringify(otpData));

    return {
      expiresIn: expirySeconds,
      expiresAt: new Date(Date.now() + expirySeconds * 1000),
    };
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(identifier, otp) {
    const redis = getRedisClient();
    const key = `otp:${identifier}`;

    const otpDataStr = await redis.get(key);

    if (!otpDataStr) {
      return {
        success: false,
        message: 'Mã OTP đã hết hạn',
        code: 'OTP_EXPIRED',
      };
    }

    const otpData = JSON.parse(otpDataStr);

    // Kiểm tra số lần thử
    if (otpData.attempts >= otpData.maxAttempts) {
      await redis.del(key);
      return {
        success: false,
        message: 'Quá số lần nhập sai',
        code: 'MAX_ATTEMPTS_EXCEEDED',
      };
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      // Tăng attempts
      otpData.attempts += 1;
      const ttl = await redis.ttl(key);
      await redis.setEx(key, ttl, JSON.stringify(otpData));

      return {
        success: false,
        message: `OTP không đúng. Còn ${otpData.maxAttempts - otpData.attempts} lần thử`,
        code: 'INVALID_OTP',
        attemptsLeft: otpData.maxAttempts - otpData.attempts,
      };
    }

    // OTP hợp lệ - xóa khỏi Redis
    await redis.del(key);

    return {
      success: true,
      message: 'Xác thực OTP thành công',
    };
  }

  /**
   * Rate limiting cho OTP requests
   */
  static async requestOTP(identifier, type = 'email') {
    const rateLimitKey = `otp:ratelimit:${identifier}`;
    const redis = getRedisClient();
    const requestCount = await redis.get(rateLimitKey);

    // Giới hạn 3 lần / 15 phút
    if (requestCount && parseInt(requestCount) >= 3) {
      throw new Error('Bạn đã yêu cầu OTP quá nhiều. Vui lòng thử lại sau 15 phút');
    }

    // Generate OTP
    const otp = this.generateOTP();
    await this.storeOTP(identifier, otp);

    // Update rate limit counter
    if (!requestCount) {
      await redis.setEx(rateLimitKey, 15 * 60, '1'); // 15 phút
    } else {
      await redis.incr(rateLimitKey);
    }

    // Send OTP (email/SMS)
    if (type === 'email') {
      await this.sendOTPEmail(identifier, otp);
    } else {
      await this.sendOTPSMS(identifier, otp);
    }

    return {
      success: true,
      message: `OTP đã được gửi đến ${type}`,
      // Only for development
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  }
}
```

### 3.5. Seat Locking Service

**File:** `backend/src/services/seatLock.service.js`

Khi user đặt vé, ghế sẽ được **khóa tạm thời 15 phút** để tránh conflict:

```javascript
class SeatLockService {
  static LOCK_DURATION = 15 * 60; // 15 phút

  /**
   * Khóa ghế
   */
  static async lockSeats(tripId, seatNumbers, userId, duration = this.LOCK_DURATION) {
    const redis = getRedisClient();
    const locked = [];
    const failed = [];

    for (const seatNumber of seatNumbers) {
      const lockKey = `seat:lock:${tripId}:${seatNumber}`;

      // SET NX EX: Set if Not exists, with Expiry
      const result = await redis.set(lockKey, userId, {
        NX: true,
        EX: duration,
      });

      if (result === 'OK') {
        locked.push(seatNumber);
      } else {
        const lockedBy = await redis.get(lockKey);
        failed.push({
          seatNumber,
          reason: lockedBy === userId
            ? 'already_locked_by_you'
            : 'locked_by_another_user',
          lockedBy,
        });
      }
    }

    return {
      success: locked.length > 0,
      locked,
      failed,
      expiresIn: duration,
      expiresAt: new Date(Date.now() + duration * 1000),
    };
  }

  /**
   * Mở khóa ghế
   */
  static async releaseSeats(tripId, seatNumbers, userId) {
    const redis = getRedisClient();
    const released = [];
    const failed = [];

    for (const seatNumber of seatNumbers) {
      const lockKey = `seat:lock:${tripId}:${seatNumber}`;
      const lockedBy = await redis.get(lockKey);

      if (!lockedBy) {
        failed.push({ seatNumber, reason: 'not_locked' });
      } else if (lockedBy !== userId) {
        failed.push({ seatNumber, reason: 'locked_by_another_user' });
      } else {
        await redis.del(lockKey);
        released.push(seatNumber);
      }
    }

    return { success: released.length > 0, released, failed };
  }

  /**
   * Gia hạn lock
   */
  static async extendLock(tripId, seatNumbers, userId, duration = this.LOCK_DURATION) {
    const redis = getRedisClient();
    const extended = [];
    const failed = [];

    for (const seatNumber of seatNumbers) {
      const lockKey = `seat:lock:${tripId}:${seatNumber}`;
      const lockedBy = await redis.get(lockKey);

      if (lockedBy === userId) {
        await redis.expire(lockKey, duration);
        extended.push(seatNumber);
      } else {
        failed.push({ seatNumber, reason: 'not_locked_by_you' });
      }
    }

    return { success: extended.length > 0, extended, failed };
  }
}
```

### 3.6. Redis Key Naming Convention

| Key Pattern | Mục đích | TTL |
|-------------|----------|-----|
| `refresh:{userId}` | Refresh token | 7-30 days |
| `otp:{identifier}` | OTP code | 5 minutes |
| `otp:ratelimit:{identifier}` | OTP rate limit | 15 minutes |
| `seat:lock:{tripId}:{seat}` | Seat lock | 15 minutes |
| `blacklist:{token}` | Token blacklist | Token expiry |

---

## 4. EXPRESS-RATE-LIMIT - CHỐNG BRUTE-FORCE VÀ DOS

### 4.1. Tại sao cần Rate Limiting?

**Các tấn công cần phòng chống:**

1. **Brute-force Login:**
   - Thử nhiều password cho 1 account
   - 100,000 attempts → Crack password

2. **DDoS/DoS:**
   - Ngập lụt server với requests
   - Server crash, không phục vụ được

3. **API Abuse:**
   - Crawler lấy toàn bộ dữ liệu
   - Tốn băng thông, tài nguyên

### 4.2. Cấu hình Rate Limiting

**File:** `backend/src/server.js`

```javascript
const rateLimit = require('express-rate-limit');

// Global rate limiter - Áp dụng cho tất cả API
const limiter = rateLimit({
  windowMs: 60000,              // 1 phút
  max: 100,                     // 100 requests per window
  message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau.',
  standardHeaders: true,        // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,         // Disable `X-RateLimit-*` headers

  // Key generator: Dựa vào IP
  keyGenerator: (req) => {
    return req.ip;
  },

  // Handler khi vượt limit
  handler: (req, res) => {
    logger.warn(`[Rate Limit] IP ${req.ip} exceeded limit`);
    res.status(429).json({
      status: 'error',
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
});

app.use('/api/', limiter);
```

### 4.3. Rate Limiter cho Login Endpoint

**Stricter limit** cho login để chống brute-force:

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,     // 15 phút
  max: 5,                        // 5 attempts
  skipSuccessfulRequests: true,  // Không đếm login thành công
  message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
});

// Apply to login route
router.post('/login', loginLimiter, login);
```

**Cơ chế hoạt động:**

```
Attempt 1: Login failed → Count = 1
Attempt 2: Login failed → Count = 2
Attempt 3: Login failed → Count = 3
Attempt 4: Login failed → Count = 4
Attempt 5: Login failed → Count = 5
Attempt 6: → 429 Too Many Requests (Blocked 15 phút)
```

### 4.4. Rate Limiter cho các endpoint nhạy cảm

```javascript
// OTP request limiter
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Bạn đã yêu cầu OTP quá nhiều lần',
});

router.post('/auth/request-otp', otpLimiter, requestOTP);

// Password reset limiter
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,     // 1 giờ
  max: 3,
  message: 'Quá nhiều yêu cầu đặt lại mật khẩu',
});

router.post('/auth/forgot-password', resetPasswordLimiter, forgotPassword);
```

### 4.5. Store Rate Limit trong Redis (Advanced)

Để share rate limit giữa nhiều server, sử dụng Redis store:

```javascript
const RedisStore = require('rate-limit-redis');
const { getRedisClient } = require('./config/redis');

const limiter = rateLimit({
  windowMs: 60000,
  max: 100,

  // Lưu rate limit info trong Redis
  store: new RedisStore({
    client: getRedisClient(),
    prefix: 'ratelimit:',
  }),
});
```

**Redis keys:**
```
ratelimit:192.168.1.100   → Request count
```

### 4.6. Monitoring Rate Limit

```javascript
// Middleware log rate limit info
app.use((req, res, next) => {
  // Rate limit info được thêm vào response headers
  res.on('finish', () => {
    const limit = res.getHeader('RateLimit-Limit');
    const remaining = res.getHeader('RateLimit-Remaining');

    if (remaining && parseInt(remaining) < 10) {
      logger.warn(`[Rate Limit] IP ${req.ip} còn ${remaining}/${limit} requests`);
    }
  });

  next();
});
```

---

## 5. TÍCH HỢP CÁC THÀNH PHẦN

### 5.1. Security Middleware Stack

**File:** `backend/src/server.js`

```javascript
// 1. Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// 2. CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));

// 3. Body parser
app.use(express.json({ limit: '10mb' }));

// 4. Data sanitization - NoSQL injection
app.use(mongoSanitize());

// 5. Data sanitization - XSS
app.use(xss());

// 6. Prevent parameter pollution
app.use(hpp());

// 7. Custom request sanitization
app.use(sanitizeRequest);

// 8. Detect attack patterns
app.use(detectAttackPatterns);

// 9. Rate limiting
app.use('/api/', limiter);

// 10. Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authenticate, userRoutes);
// ...
```

### 5.2. Ví dụ Route hoàn chỉnh

```javascript
// routes/booking.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/booking.controller');

// Tạo booking (Customer only)
router.post('/',
  authenticate,                     // JWT authentication
  authorize('customer'),            // Role-based authorization
  createBooking                     // Business logic
);

// Xem booking của mình
router.get('/my-bookings',
  authenticate,
  authorize('customer', 'admin'),
  getMyBookings
);

// Hủy booking
router.delete('/:id/cancel',
  authenticate,
  authorize('customer'),
  cancelBooking
);

module.exports = router;
```

### 5.3. Error Handling

```javascript
// middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token đã hết hạn',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu không hợp lệ',
      errors: err.errors,
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
```

---

## KẾT LUẬN PHẦN 2

Phần 2 đã trình bày chi tiết:

✅ **Kiến trúc bảo mật đa lớp:** Defense in Depth với 7 lớp bảo vệ

✅ **JWT Authentication:** Dual token strategy, Access/Refresh tokens, Session timeout

✅ **Redis Integration:** Token management, OTP service, Seat locking

✅ **Rate Limiting:** Chống brute-force (5 attempts/15min), DoS (100 req/min)

✅ **Tích hợp hoàn chỉnh:** Security middleware stack, RBAC, Error handling

**Tiếp theo (Phần 3):** Kết quả triển khai, đo lường hiệu năng, đánh giá bảo mật

---

**[>> TIẾP TỤC PHẦN 3: KẾT QUẢ VÀ ĐÁNH GIÁ](BAO_CAO_DE_TAI_PHAN_3_KET_QUA.md)**

# Authentication System - Phase 1.4

## Hoàn thành

Phase 1.4 - Authentication System đã được implement đầy đủ với các tính năng sau:

### 1. User Model ✅
- **File:** `src/models/User.js`
- **Tính năng:**
  - Đầy đủ fields theo database schema (email, phone, password, loyaltyProgram, etc.)
  - Password hashing tự động với bcrypt (salt rounds: 12)
  - Email và phone verification
  - OAuth fields (Google, Facebook)
  - Loyalty program với tiers (bronze, silver, gold, platinum)
  - Saved passengers (max 5)
  - Account status management (blocked, active)
  - Indexes cho performance

- **Methods:**
  - `comparePassword()` - So sánh password
  - `createPasswordResetToken()` - Tạo token reset password
  - `createEmailVerificationToken()` - Tạo token xác thực email
  - `createPhoneOTP()` - Tạo OTP cho phone
  - `addPoints()` - Thêm loyalty points
  - Static: `findByEmailOrPhone()` - Tìm user bằng email hoặc phone

### 2. Auth Service ✅
- **File:** `src/services/auth.service.js`
- **Tính năng:**
  - JWT token generation (access & refresh tokens)
  - Token verification
  - User registration với email verification
  - Login với identifier (email hoặc phone)
  - Refresh token mechanism
  - Forgot password & reset password
  - Email verification
  - Phone verification với OTP

### 3. Authentication Middleware ✅
- **File:** `src/middleware/auth.middleware.js`
- **Middleware:**
  - `authenticate` - Xác thực JWT token (Bearer token)
  - `authorize(...roles)` - Phân quyền theo role
  - `optionalAuth` - Cho phép guest access
  - `requireEmailVerified` - Yêu cầu email đã verify
  - `requirePhoneVerified` - Yêu cầu phone đã verify

### 4. Validation Middleware ✅
- **File:** `src/middleware/validate.middleware.js`
- **Validations:**
  - Register: email, phone, password strength, fullName
  - Login: identifier & password
  - Refresh token
  - Forgot password
  - Reset password
  - Verify email
  - Verify phone (OTP)

### 5. Auth Controller ✅
- **File:** `src/controllers/auth.controller.js`
- **Endpoints:**
  - `POST /api/v1/auth/register` - Đăng ký
  - `POST /api/v1/auth/login` - Đăng nhập
  - `POST /api/v1/auth/refresh-token` - Làm mới token
  - `POST /api/v1/auth/forgot-password` - Quên mật khẩu
  - `POST /api/v1/auth/reset-password` - Đặt lại mật khẩu
  - `GET /api/v1/auth/verify-email/:token` - Xác thực email
  - `POST /api/v1/auth/send-phone-otp` - Gửi OTP (Protected)
  - `POST /api/v1/auth/verify-phone` - Xác thực phone (Protected)
  - `GET /api/v1/auth/me` - Lấy thông tin user (Protected)
  - `POST /api/v1/auth/logout` - Đăng xuất (Protected)

### 6. Auth Routes ✅
- **File:** `src/routes/auth.routes.js`
- Public routes và Protected routes được phân chia rõ ràng
- Tất cả routes đều có validation

### 7. Security Features ✅
- Password hashing với bcrypt (salt rounds: 12) ✅
- JWT authentication với access & refresh tokens ✅
- Rate limiting (100 requests/phút/IP) - Đã có sẵn trong server.js ✅
- Input validation với express-validator ✅
- Session management - JWT based ✅
- CORS configuration ✅
- Helmet.js security headers ✅

---

## 🧪 Testing Instructions

### Prerequisites
1. MongoDB đang chạy (port 27017)
2. Redis đang chạy (port 6379)
3. Backend dependencies đã được cài đặt

### Start Server
```bash
cd backend
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### API Testing với cURL hoặc Postman

#### 1. Đăng ký user mới
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "0901234567",
    "password": "Test1234",
    "fullName": "Nguyen Van A"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Đăng ký thành công",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "verificationToken": "abc123..." // Chỉ có trong development
  }
}
```

#### 2. Đăng nhập
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test1234"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 3. Lấy thông tin user hiện tại (Protected)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Xác thực email
```bash
curl -X GET http://localhost:5000/api/v1/auth/verify-email/YOUR_VERIFICATION_TOKEN
```

#### 5. Gửi OTP xác thực phone (Protected)
```bash
curl -X POST http://localhost:5000/api/v1/auth/send-phone-otp \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "status": "success",
  "message": "OTP đã được gửi đến số điện thoại",
  "data": {
    "otp": "123456" // Chỉ có trong development
  }
}
```

#### 6. Xác thực phone với OTP (Protected)
```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-phone \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "123456"
  }'
```

#### 7. Quên mật khẩu
```bash
curl -X POST http://localhost:5000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

#### 8. Đặt lại mật khẩu
```bash
curl -X POST http://localhost:5000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "YOUR_RESET_TOKEN",
    "newPassword": "NewPass1234"
  }'
```

#### 9. Refresh access token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 10. Đăng xuất (Protected)
```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 Environment Variables

Đảm bảo file `.env` có các biến sau:

```env
# JWT
JWT_SECRET=your-generated-secret-key
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=7d

# Database
MONGODB_URI=mongodb://localhost:27017/quikride

# Redis
REDIS_URL=redis://localhost:6379

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

---

## 🔐 Security Best Practices Implemented

1. Password hashing với bcrypt (salt rounds: 12)
2. JWT tokens với expiration
3. Separate access & refresh tokens
4. Rate limiting (100 requests/phút/IP)
5. Input validation
6. Password strength validation (1 lowercase, 1 uppercase, 1 digit, min 6 chars)
7. Email & phone verification
8. Secure password reset với token expiry
9. Account blocking mechanism
10. CORS configuration
11. Helmet.js security headers

---

## 🚀 Next Steps (Phase 1.5+)

1. Implement OAuth (Google, Facebook)
2. Email service integration (SendGrid/AWS SES)
3. SMS service integration (VNPT SMS)
4. Token blacklist với Redis (cho logout)
5. Two-factor authentication (2FA)
6. Login history tracking
7. Suspicious activity detection
8. Unit tests cho authentication

---

## 📚 Documentation

- **User Model:** `src/models/User.js`
- **Auth Service:** `src/services/auth.service.js`
- **Auth Middleware:** `src/middleware/auth.middleware.js`
- **Validation:** `src/middleware/validate.middleware.js`
- **Auth Controller:** `src/controllers/auth.controller.js`
- **Auth Routes:** `src/routes/auth.routes.js`

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Kiểm tra MongoDB đang chạy
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Redis Connection Error
```bash
# Kiểm tra Redis đang chạy
redis-cli ping

# Start Redis
sudo systemctl start redis
```

### JWT Error
- Kiểm tra `JWT_SECRET` trong file `.env`
- Đảm bảo token chưa hết hạn
- Kiểm tra format: `Authorization: Bearer <token>`

### Validation Error
- Kiểm tra request body format
- Đảm bảo đúng data types
- Password phải đủ mạnh (1 lowercase, 1 uppercase, 1 digit)

---

## ✨ Features Highlights

### Password Security
- Bcrypt với salt rounds 12
- Password strength validation
- Secure reset mechanism với token expiry (10 phút)

### JWT Tokens
- Access token: 1 ngày
- Refresh token: 7 ngày
- Payload: userId, email, role, type

### Verification
- Email verification với token
- Phone verification với OTP (6 chữ số, hết hạn sau 5 phút)

### Rate Limiting
- 100 requests/phút/IP
- Áp dụng cho tất cả `/api/*` endpoints

### Loyalty Program
- Automatic tier calculation
- Points history tracking
- Tiers: bronze (0-1999), silver (2000-4999), gold (5000-9999), platinum (10000+)

---

**Phase 1.4 - COMPLETED ✅**

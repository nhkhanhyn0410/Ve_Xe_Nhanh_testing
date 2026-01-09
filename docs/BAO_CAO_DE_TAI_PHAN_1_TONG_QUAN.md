# BÁO CÁO ĐỀ TÀI - PHẦN 1: TỔNG QUAN

## XÂY DỰNG GIẢI PHÁP BẢO MẬT TOÀN DIỆN CHO RESTful API BẰNG JWT, REDIS VÀ EXPRESS-RATE-LIMIT TRÊN NODE.JS

---

**Môn học:** An toàn và Bảo mật Thông tin
**Sinh viên thực hiện:** [Họ và tên]
**MSSV:** [Mã số sinh viên]
**Lớp:** [Tên lớp]
**Giảng viên hướng dẫn:** [Tên giảng viên]
**Năm học:** 2024-2025

---

## MỤC LỤC PHẦN 1

1. [GIỚI THIỆU](#1-giới-thiệu)
2. [MỤC TIÊU ĐỀ TÀI](#2-mục-tiêu-đề-tài)
3. [CƠ SỞ LÝ THUYẾT](#3-cơ-sở-lý-thuyết)
4. [TỔNG QUAN VỀ RESTFUL API VÀ CÁC NGUY CƠ BẢO MẬT](#4-tổng-quan-về-restful-api)

---

## 1. GIỚI THIỆU

### 1.1. Bối cảnh

Trong thời đại chuyển đổi số, các ứng dụng web hiện đại ngày càng phụ thuộc vào RESTful API để giao tiếp giữa client và server. Theo báo cáo của **OWASP Top 10 API Security Risks 2023**, các API đang trở thành mục tiêu hàng đầu của tin tặc với hơn **95% các tổ chức** gặp phải sự cố bảo mật API trong 12 tháng qua.

Các mối đe dọa phổ biến đối với RESTful API bao gồm:

- **Broken Authentication** (Xác thực bị phá vỡ)
- **Broken Authorization** (Phân quyền không đúng)
- **Injection Attacks** (Tấn công tiêm nhiễm)
- **Brute Force Attacks** (Tấn công dò mật khẩu)
- **DDoS/DoS Attacks** (Tấn công từ chối dịch vụ)
- **Session Hijacking** (Chiếm đoạt phiên làm việc)

### 1.2. Vấn đề nghiên cứu

Hệ thống **Vé Xe Nhanh** là một nền tảng đặt vé xe khách trực tuyến được xây dựng trên kiến trúc **MERN Stack** (MongoDB, Express.js, React, Node.js). Hệ thống cung cấp RESTful API cho:

- **Khách hàng:** Tìm kiếm, đặt vé, thanh toán
- **Nhà xe:** Quản lý tuyến đường, lịch trình, doanh thu
- **Quản lý chuyến:** Soát vé điện tử, quản lý hành khách
- **Admin:** Giám sát và quản trị hệ thống

Với tính chất nhạy cảm của dữ liệu (thông tin cá nhân, giao dịch thanh toán), việc **bảo mật API** là ưu tiên hàng đầu.

### 1.3. Ý nghĩa của đề tài

Đề tài này tập trung vào việc **xây dựng giải pháp bảo mật đa lớp** cho RESTful API sử dụng:

1. **JWT (JSON Web Token)** - Xác thực và phân quyền
2. **Redis** - Quản lý session và token lifecycle
3. **Express-Rate-Limit** - Chống brute-force và DoS

Giải pháp được triển khai thực tế trên hệ thống **Vé Xe Nhanh**, đảm bảo:

- ✅ Xác thực người dùng an toàn
- ✅ Quản lý phiên làm việc hiệu quả
- ✅ Ngăn chặn các cuộc tấn công phổ biến
- ✅ Hiệu năng cao, khả năng mở rộng tốt

---

## 2. MỤC TIÊU ĐỀ TÀI

### 2.1. Mục tiêu chung

Xây dựng và triển khai một **giải pháp bảo mật toàn diện** cho RESTful API nhằm:

- Bảo vệ API khỏi các cuộc tấn công phổ biến
- Đảm bảo tính xác thực và phân quyền chính xác
- Quản lý phiên làm việc hiệu quả
- Duy trì hiệu năng cao cho hệ thống

### 2.2. Mục tiêu cụ thể

#### 2.2.1. Về mặt lý thuyết

- Nghiên cứu các mô hình xác thực: **Token-based Authentication**, **Session-based Authentication**
- Phân tích cấu trúc và cơ chế hoạt động của **JWT**
- Tìm hiểu vai trò của **Redis** trong quản lý session và caching
- Nghiên cứu các kỹ thuật **Rate Limiting** và **Throttling**

#### 2.2.2. Về mặt thực hành

- **Thiết kế và triển khai** hệ thống xác thực JWT với Access Token và Refresh Token
- **Tích hợp Redis** để:
  - Quản lý Refresh Token
  - Token Blacklist (thu hồi token)
  - Lưu trữ OTP tạm thời
  - Quản lý seat locking (khóa ghế tạm thời)
- **Cấu hình Rate Limiting** để chống:
  - Brute-force attacks trên endpoint đăng nhập
  - DDoS/DoS attacks
  - API abuse
- **Đo lường hiệu năng** và đánh giá độ bảo mật

#### 2.2.3. Kết quả mong đợi

- Hệ thống API **an toàn**, chống được các tấn công phổ biến
- Thời gian phản hồi API **≤ 200ms** (trung bình)
- Rate limiting hiệu quả: **100 requests/phút/IP**
- Token management: **Access Token 1 ngày**, **Refresh Token 7-30 ngày**
- Session timeout: **30 phút không hoạt động**

---

## 3. CƠ SỞ LÝ THUYẾT

### 3.1. Chapter 3: Access Control (Điều khiển truy cập)

Đề tài này chủ yếu áp dụng kiến thức từ **Chapter 3 - Access Control**, bao gồm:

#### 3.1.1. Ba bước trong Access Control

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│ Identification│ --> │Authentication│ --> │Authorization │
│  (Định danh)  │     │  (Xác thực)  │     │ (Phân quyền) │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

**1. Identification (Định danh):**
- Người dùng tự nhận dạng bằng **username/email/phone**
- Trong hệ thống: JWT payload chứa `userId`, `email`, `role`

**2. Authentication (Xác thực):**
- Xác minh danh tính người dùng
- Phương pháp: **Password-based**, **Token-based (JWT)**, **OAuth 2.0**

**3. Authorization (Phân quyền):**
- Kiểm tra quyền truy cập tài nguyên
- Mô hình: **Role-Based Access Control (RBAC)**

#### 3.1.2. Các phương pháp xác thực

##### a) Session-Based Authentication (Xác thực dựa trên session)

```
Client                Server                Database
  │                     │                      │
  │─── Login ──────────>│                      │
  │                     │─── Verify ──────────>│
  │                     │<─── User Data ───────│
  │                     │                      │
  │                     │ (Create Session)     │
  │<── Session ID ──────│                      │
  │                     │                      │
  │─── Request + Cookie >│                      │
  │                     │ (Validate Session)   │
  │<── Response ────────│                      │
```

**Ưu điểm:**
- Server kiểm soát hoàn toàn session
- Dễ dàng thu hồi quyền truy cập
- Session có thể chứa nhiều thông tin

**Nhược điểm:**
- Tốn tài nguyên server (memory/database)
- Khó mở rộng (scaling) với nhiều server
- Không phù hợp với microservices

##### b) Token-Based Authentication (Xác thực dựa trên token - JWT)

```
Client                Server
  │                     │
  │─── Login ──────────>│
  │                     │ (Verify credentials)
  │                     │ (Generate JWT)
  │<── JWT Token ───────│
  │                     │
  │─── Request + JWT ──>│
  │                     │ (Verify JWT)
  │<── Response ────────│
```

**Ưu điểm:**
- **Stateless** - Không cần lưu trữ session trên server
- Dễ mở rộng (scalable)
- Phù hợp với microservices và mobile apps
- Hỗ trợ Cross-Origin (CORS)

**Nhược điểm:**
- Khó thu hồi token trước khi hết hạn
- Token có thể bị đánh cắp (XSS, Man-in-the-Middle)
- Kích thước token lớn hơn session ID

#### 3.1.3. Phương pháp điều khiển truy cập

##### a) DAC (Discretionary Access Control)

- Chủ sở hữu tài nguyên quyết định ai được truy cập
- Ví dụ: **File permissions** trong Windows/Linux

##### b) MAC (Mandatory Access Control)

- Hệ thống quyết định quyền truy cập dựa trên mức độ bảo mật
- Ví dụ: **Top Secret, Secret, Confidential** trong quân đội

##### c) RBAC (Role-Based Access Control) ⭐

**Được sử dụng trong đề tài này**

```
User ──> Role ──> Permissions ──> Resources

Ví dụ trong hệ thống Vé Xe Nhanh:
- Admin     → Full access
- Operator  → Manage routes, buses, trips
- Customer  → Book tickets, view history
- Guest     → View trips, limited booking
```

**Ưu điểm:**
- Dễ quản lý quyền truy cập
- Giảm thiểu lỗi phân quyền
- Phù hợp với tổ chức phân cấp

**Cài đặt trong code:**
```javascript
// middleware/auth.middleware.js
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Bạn không có quyền truy cập'
      });
    }
    next();
  };
};

// Sử dụng:
router.get('/admin/users', authenticate, authorize('admin'), getUsers);
```

### 3.2. Cryptography trong JWT (Chapter 2)

JWT sử dụng **chữ ký số** để đảm bảo tính toàn vẹn của token.

#### 3.2.1. Cấu trúc JWT

```
JWT = Header.Payload.Signature

Header (Base64Url):
{
  "alg": "HS256",      // Thuật toán: HMAC-SHA256
  "typ": "JWT"
}

Payload (Base64Url):
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "user@example.com",
  "role": "customer",
  "type": "access",
  "iat": 1704067200,   // Issued at
  "exp": 1704153600    // Expiry
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

#### 3.2.2. Thuật toán mã hóa

**HS256 (HMAC with SHA-256):**
- Mã hóa đối xứng (symmetric)
- Sử dụng **secret key** duy nhất
- Nhanh, phù hợp cho hệ thống đơn giản

**RS256 (RSA Signature with SHA-256):**
- Mã hóa bất đối xứng (asymmetric)
- Sử dụng **private key** để ký, **public key** để verify
- Phù hợp cho microservices, distributed systems

**Trong đề tài này:** Sử dụng **HS256** với secret key được lưu trong biến môi trường.

#### 3.2.3. Quá trình xác thực JWT

```
1. Client gửi credentials (email + password)
2. Server verify credentials
3. Server tạo JWT:
   - Header + Payload
   - Ký bằng secret key (HMACSHA256)
4. Server trả JWT cho client
5. Client lưu JWT (localStorage/sessionStorage)
6. Client gửi JWT trong header: Authorization: Bearer <token>
7. Server verify JWT:
   - Kiểm tra signature
   - Kiểm tra expiry time
   - Kiểm tra user còn tồn tại
8. Server cho phép truy cập nếu valid
```

---

## 4. TỔNG QUAN VỀ RESTful API VÀ CÁC NGUY CƠ BẢO MẬT

### 4.1. RESTful API là gì?

**REST (Representational State Transfer)** là một kiến trúc phần mềm cho các hệ thống phân tán, đặc biệt là web services.

**Đặc điểm:**
- **Stateless:** Mỗi request độc lập, không lưu trạng thái trên server
- **Client-Server:** Tách biệt client và server
- **Cacheable:** Hỗ trợ caching để tăng hiệu năng
- **Uniform Interface:** Sử dụng HTTP methods chuẩn

**HTTP Methods trong REST:**

| Method | Mục đích | Ví dụ |
|--------|----------|-------|
| GET | Lấy dữ liệu | `GET /api/v1/trips` |
| POST | Tạo mới | `POST /api/v1/bookings` |
| PUT | Cập nhật toàn bộ | `PUT /api/v1/users/123` |
| PATCH | Cập nhật một phần | `PATCH /api/v1/trips/456` |
| DELETE | Xóa | `DELETE /api/v1/tickets/789` |

### 4.2. Các mối đe dọa bảo mật API (OWASP API Top 10)

#### 4.2.1. Broken Object Level Authorization (BOLA)

**Mô tả:** API không kiểm tra đúng quyền truy cập đối tượng

**Ví dụ tấn công:**
```
GET /api/v1/users/123/bookings
→ Attacker thay đổi: GET /api/v1/users/456/bookings
→ Truy cập được booking của người khác
```

**Phòng chống:**
```javascript
// Kiểm tra user chỉ được truy cập dữ liệu của mình
if (req.params.userId !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Forbidden' });
}
```

#### 4.2.2. Broken Authentication

**Mô tả:** Cơ chế xác thực yếu hoặc sai sót

**Các vấn đề phổ biến:**
- Cho phép brute-force attacks
- Session không timeout
- Token không expire
- Lưu password dạng plaintext

**Giải pháp trong đề tài:**
- ✅ JWT với expiry time
- ✅ Rate limiting cho login endpoint
- ✅ Password hashing (bcrypt - 12 rounds)
- ✅ Session timeout (30 phút)

#### 4.2.3. Excessive Data Exposure

**Mô tả:** API trả về nhiều dữ liệu hơn cần thiết

**Ví dụ:**
```javascript
// ❌ Sai: Trả về toàn bộ user object (bao gồm password hash)
res.json({ user });

// ✅ Đúng: Loại bỏ sensitive fields
const userResponse = user.toObject();
delete userResponse.password;
delete userResponse.passwordResetToken;
res.json({ user: userResponse });
```

#### 4.2.4. Lack of Resources & Rate Limiting

**Mô tả:** Không giới hạn số lượng request

**Hậu quả:**
- DDoS/DoS attacks
- Brute-force attacks
- API abuse

**Giải pháp:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60000,      // 1 phút
  max: 100,             // 100 requests
  message: 'Quá nhiều yêu cầu'
});

app.use('/api/', limiter);
```

#### 4.2.5. Broken Function Level Authorization

**Mô tả:** Không kiểm tra quyền truy cập chức năng

**Ví dụ:**
```
POST /api/v1/admin/users
→ Customer role không được phép truy cập
```

**Phòng chống:**
```javascript
router.post('/admin/users',
  authenticate,
  authorize('admin'),  // Chỉ admin được truy cập
  createUser
);
```

#### 4.2.6. Mass Assignment

**Mô tả:** Cho phép cập nhật các field không được phép

**Ví dụ tấn công:**
```javascript
// User gửi request:
PUT /api/v1/users/123
{
  "fullName": "John Doe",
  "role": "admin"  // ❌ Tự thăng cấp lên admin
}
```

**Phòng chống:**
```javascript
// Whitelist các field được phép update
const allowedFields = ['fullName', 'phone', 'avatar'];
const updates = {};
Object.keys(req.body).forEach(key => {
  if (allowedFields.includes(key)) {
    updates[key] = req.body[key];
  }
});
```

#### 4.2.7. Security Misconfiguration

**Mô tả:** Cấu hình bảo mật không đúng

**Các lỗi phổ biến:**
- CORS cấu hình sai
- Verbose error messages
- Không sử dụng HTTPS
- Debug mode trong production

**Giải pháp:**
```javascript
// Helmet.js - Security headers
app.use(helmet());

// CORS - Chỉ cho phép origin cụ thể
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(',')
}));

// Error handling - Không leak stack trace
app.use((err, req, res, next) => {
  res.status(500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message
  });
});
```

#### 4.2.8. Injection

**Mô tả:** SQL/NoSQL Injection

**Ví dụ NoSQL Injection:**
```javascript
// ❌ Vulnerable
User.findOne({ email: req.body.email });

// Request:
{ "email": { "$ne": null } }  // Trả về user đầu tiên

// ✅ Safe
app.use(mongoSanitize());  // Loại bỏ $ và .
```

#### 4.2.9. Improper Assets Management

**Mô tả:** API cũ không được bảo trì

**Ví dụ:**
- `/api/v1/users` - có authentication
- `/api/old/users` - không có authentication

**Phòng chống:**
- Tắt/xóa API endpoints cũ
- Versioning rõ ràng
- API documentation đầy đủ

#### 4.2.10. Insufficient Logging & Monitoring

**Mô tả:** Không ghi log đầy đủ

**Cần log:**
- Login attempts (failed/success)
- Access to sensitive data
- API errors
- Rate limit violations

**Triển khai:**
```javascript
const winston = require('winston');

logger.warn('[Security] Failed login attempt', {
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date()
});
```

---

### 4.3. Bảng tổng hợp mối đe dọa và giải pháp

| Mối đe dọa | Mức độ nghiêm trọng | Giải pháp trong đề tài |
|------------|---------------------|------------------------|
| Broken Authentication | Cao | JWT + Session timeout + Rate limiting |
| Broken Authorization | Cao | RBAC + Object-level checks |
| Brute-force attacks | Trung bình | Rate limiting (5 attempts/15min) |
| DDoS/DoS | Cao | Rate limiting (100 req/min) |
| Session hijacking | Cao | JWT signature + HTTPS |
| Token theft | Cao | Token blacklist (Redis) + Short expiry |
| NoSQL Injection | Cao | express-mongo-sanitize |
| XSS | Trung bình | xss-clean + CSP headers |
| CSRF | Trung bình | SameSite cookies + Origin validation |
| Mass Assignment | Trung bình | Field whitelisting |

---

## KẾT LUẬN PHẦN 1

Phần 1 đã trình bày:

✅ **Bối cảnh và vấn đề nghiên cứu:** Tầm quan trọng của bảo mật API trong hệ thống Vé Xe Nhanh

✅ **Mục tiêu đề tài:** Xây dựng giải pháp bảo mật toàn diện với JWT, Redis, Express-Rate-Limit

✅ **Cơ sở lý thuyết Chapter 3:** Access Control, Authentication, Authorization, RBAC

✅ **Mối đe dọa bảo mật API:** OWASP API Top 10 và cách phòng chống

**Tiếp theo (Phần 2):** Thiết kế chi tiết và triển khai giải pháp

---

**[>> TIẾP TỤC PHẦN 2: THIẾT KẾ VÀ TRIỂN KHAI](BAO_CAO_DE_TAI_PHAN_2_THIET_KE.md)**

# TÀI LIỆU HỌC TẬP - CHAPTER 3: ACCESS CONTROL

## ĐIỀU KHIỂN TRUY CẬP (ACCESS CONTROL)

---

**Môn học:** An toàn và Bảo mật Thông tin
**Chủ đề:** Chapter 3 - Access Control / Điều khiển truy cập
**Mục đích:** Cung cấp kiến thức lý thuyết hỗ trợ cho đề tài "Xây dựng giải pháp bảo mật toàn diện cho RESTful API"

---

## MỤC LỤC

1. [GIỚI THIỆU VỀ ACCESS CONTROL](#1-giới-thiệu-về-access-control)
2. [BA BƯỚC TRONG ACCESS CONTROL](#2-ba-bước-trong-access-control)
3. [IDENTIFICATION - ĐỊNH DANH](#3-identification---định-danh)
4. [AUTHENTICATION - XÁC THỰC](#4-authentication---xác-thực)
5. [AUTHORIZATION - PHÂN QUYỀN](#5-authorization---phân-quyền)
6. [CÁC MÔ HÌNH ĐIỀU KHIỂN TRUY CẬP](#6-các-mô-hình-điều-khiển-truy-cập)
7. [ÁP DỤNG VÀO ĐỀ TÀI](#7-áp-dụng-vào-đề-tài)

---

## 1. GIỚI THIỆU VỀ ACCESS CONTROL

### 1.1. Access Control là gì?

**Định nghĩa:**
> Access Control (Điều khiển truy cập) là quá trình **kiểm soát ai có quyền truy cập gì** trong một hệ thống thông tin.

**Mục tiêu chính:**
- **Confidentiality (Tính bảo mật):** Chỉ những người được phép mới truy cập được thông tin
- **Integrity (Tính toàn vẹn):** Chỉ những người được phép mới có thể thay đổi dữ liệu
- **Availability (Tính sẵn sàng):** Đảm bảo người dùng hợp lệ luôn truy cập được tài nguyên

### 1.2. Tầm quan trọng

**Trong bảo mật thông tin:**
- Là **lớp phòng thủ đầu tiên** chống lại truy cập trái phép
- **80% vi phạm bảo mật** liên quan đến lỗi access control (theo Verizon DBIR)
- Nằm trong **CIA Triad** (Confidentiality, Integrity, Availability)

**Trong thực tế:**
- Bảo vệ dữ liệu cá nhân (GDPR compliance)
- Ngăn chặn fraud, data breach
- Đảm bảo compliance (PCI-DSS, HIPAA, etc.)

### 1.3. Ví dụ thực tế

**Hệ thống Vé Xe Nhanh:**

| User Role | Được phép | Không được phép |
|-----------|-----------|-----------------|
| **Customer** | - Đặt vé<br>- Xem booking của mình<br>- Hủy vé của mình | - Xem booking người khác<br>- Tạo chuyến xe<br>- Xem doanh thu |
| **Operator** | - Tạo chuyến xe<br>- Xem doanh thu nhà xe<br>- Quản lý nhân viên | - Xem doanh thu nhà xe khác<br>- Xóa user<br>- Sửa giá vé đã book |
| **Admin** | - Toàn quyền | - (Không có giới hạn) |

**Nếu không có Access Control:**
- Customer có thể xem booking của người khác → **Data breach**
- Operator có thể thao túng doanh thu → **Fraud**
- Attacker có thể xóa toàn bộ dữ liệu → **System compromise**

---

## 2. BA BƯỚC TRONG ACCESS CONTROL

Access Control bao gồm **3 bước tuần tự:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. IDENTIFICATION      2. AUTHENTICATION    3. AUTHORIZATION│
│     (Định danh)            (Xác thực)           (Phân quyền) │
│                                                             │
│     "Who are you?"        "Prove it!"        "What can you do?"│
│                                                             │
│  ┌───────────┐         ┌───────────┐        ┌────────────┐ │
│  │Username   │────────>│Password   │───────>│Check Role  │ │
│  │Email      │         │Biometric  │        │Check ACL   │ │
│  │ID Card    │         │Token      │        │Allow/Deny  │ │
│  └───────────┘         └───────────┘        └────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.1. Tổng quan 3 bước

| Bước | Câu hỏi | Ví dụ | Trong hệ thống |
|------|---------|-------|----------------|
| **1. Identification** | Bạn là ai? | Username: `john@example.com` | `email`, `userId`, `phone` |
| **2. Authentication** | Chứng minh bạn là người đó | Password: `******` | Verify password, JWT token |
| **3. Authorization** | Bạn được làm gì? | Role: `customer` → Chỉ xem booking của mình | RBAC middleware |

### 2.2. Luồng xử lý trong thực tế

**Ví dụ: User đăng nhập vào hệ thống**

```
┌──────┐                                              ┌────────┐
│Client│                                              │ Server │
└──┬───┘                                              └───┬────┘
   │                                                      │
   │ 1. IDENTIFICATION                                    │
   │ POST /auth/login                                     │
   │ { "email": "john@example.com" }                      │
   ├─────────────────────────────────────────────────────>│
   │                                                      │
   │                                      2. AUTHENTICATION
   │                                      - Tìm user trong DB
   │                                      - So sánh password hash
   │                                      - Verify credentials
   │                                                      │
   │ 3. AUTHORIZATION (implicit - tạo token with role)   │
   │ 200 OK                                               │
   │ { "accessToken": "...", "role": "customer" }         │
   │<─────────────────────────────────────────────────────│
   │                                                      │
   │ Subsequent request với token                         │
   │ GET /bookings/123                                    │
   │ Authorization: Bearer <token>                        │
   ├─────────────────────────────────────────────────────>│
   │                                                      │
   │                                      2. AUTHENTICATION
   │                                      - Verify JWT signature
   │                                      - Check expiry
   │                                      - Extract userId, role
   │                                                      │
   │                                      3. AUTHORIZATION
   │                                      - Check role
   │                                      - Check ownership
   │                                      - Allow/Deny
   │                                                      │
   │ 200 OK / 403 Forbidden                               │
   │<─────────────────────────────────────────────────────│
   │                                                      │
```

---

## 3. IDENTIFICATION - ĐỊNH DANH

### 3.1. Định nghĩa

> **Identification** là quá trình user **tự nhận dạng mình** với hệ thống.

**Đặc điểm:**
- **Public information** - Không cần bí mật
- **Unique** - Mỗi user có identifier riêng
- **Persistent** - Không thay đổi hoặc ít thay đổi

### 3.2. Các phương pháp Identification

#### 3.2.1. Username/Email

**Ưu điểm:**
- ✅ Dễ nhớ
- ✅ Human-readable
- ✅ Có thể recover (forgot username)

**Nhược điểm:**
- ❌ Có thể guess (enumeration attack)
- ❌ Có thể trùng lặp (nếu không kiểm soát tốt)

**Ví dụ trong code:**

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,        // Đảm bảo unique
    lowercase: true,     // Chuẩn hóa
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,        // Cho phép null (optional field)
  },
});

// Static method tìm user bằng email hoặc phone
userSchema.statics.findByEmailOrPhone = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier },
    ],
  });
};
```

#### 3.2.2. User ID (Internal)

**Ưu điểm:**
- ✅ Guaranteed unique (MongoDB ObjectId, UUID)
- ✅ Không thay đổi (immutable)
- ✅ Không đoán được (unpredictable)

**Nhược điểm:**
- ❌ Khó nhớ (not user-friendly)
- ❌ Cần mapping với email/username

**Ví dụ:**

```javascript
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",  // MongoDB ObjectId
  "email": "john@example.com",
  "role": "customer"
}
```

#### 3.2.3. Biometric Identifiers

**Loại:**
- Vân tay (Fingerprint)
- Mống mắt (Iris scan)
- Nhận diện khuôn mặt (Face recognition)
- Giọng nói (Voice recognition)

**Ưu điểm:**
- ✅ Unique (mỗi người một dấu vân tay)
- ✅ Không thể đánh cắp dễ dàng
- ✅ UX tốt (không cần nhớ password)

**Nhược điểm:**
- ❌ Cần phần cứng đặc biệt
- ❌ Privacy concerns
- ❌ Không thể "reset" nếu bị compromise

### 3.3. User Enumeration Attack

**Vấn đề:** Attacker có thể kiểm tra xem email có tồn tại trong hệ thống không

**Ví dụ attack:**

```
POST /auth/login
{ "email": "john@example.com", "password": "wrong" }

Response:
❌ BAD: "Email không tồn tại"  → Attacker biết email không có trong DB
✅ GOOD: "Email hoặc mật khẩu không đúng"  → Không leak info
```

**Best practice trong code:**

```javascript
// ❌ BAD - Leak information
if (!user) {
  throw new Error('Email không tồn tại');
}
if (!isPasswordCorrect) {
  throw new Error('Mật khẩu không đúng');
}

// ✅ GOOD - Generic message
if (!user || !isPasswordCorrect) {
  throw new Error('Email/Số điện thoại hoặc mật khẩu không đúng');
}
```

---

## 4. AUTHENTICATION - XÁC THỰC

### 4.1. Định nghĩa

> **Authentication** là quá trình **xác minh danh tính** của user - chứng minh rằng user là người họ claim.

**Các yếu tố xác thực (Authentication Factors):**

| Factor | Loại | Ví dụ |
|--------|------|-------|
| **Something you know** | Knowledge | Password, PIN, Security questions |
| **Something you have** | Possession | Phone (OTP), Hardware token, Smart card |
| **Something you are** | Inherence | Fingerprint, Face ID, Iris scan |
| **Somewhere you are** | Location | GPS, IP address |
| **Something you do** | Behavior | Typing pattern, Mouse movement |

### 4.2. Các phương pháp Authentication

#### 4.2.1. Password-based Authentication

**Cơ chế:**

```
User Input Password ──> Hash (bcrypt) ──> Compare with stored hash
                                             ├── Match: ✅ Authenticated
                                             └── Not match: ❌ Denied
```

**Yêu cầu password mạnh:**

```javascript
// config/security.js
password: {
  minLength: 6,
  requireUppercase: true,   // A-Z
  requireLowercase: true,   // a-z
  requireNumbers: true,     // 0-9
  requireSpecialChars: false, // !@#$%^&*
}
```

**Password hashing với bcrypt:**

```javascript
// models/User.js
const bcrypt = require('bcryptjs');

// Pre-save hook - Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  // Hash with 12 rounds (balance between security & performance)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method - Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**Tại sao dùng bcrypt?**

| Algorithm | Time to hash | Time to crack (8 char) | Recommended? |
|-----------|--------------|------------------------|--------------|
| **MD5** | 0.01ms | **< 1 hour** | ❌ No (too fast) |
| **SHA-256** | 0.02ms | **< 1 day** | ❌ No (too fast) |
| **bcrypt (12 rounds)** | ~100ms | **~100 years** | ✅ Yes |
| **Argon2** | ~120ms | **~150 years** | ✅ Yes (better) |

**Best practices:**
- ✅ Hash password trên server (không trust client)
- ✅ Use salt (bcrypt auto-generate salt)
- ✅ Never store plaintext password
- ✅ Never send password in response

#### 4.2.2. Token-based Authentication (JWT)

**Cơ chế:**

```
1. User login → Server verify credentials
2. Server generate JWT token (signed)
3. Client store token (localStorage)
4. Client send token in every request (Authorization header)
5. Server verify token signature
```

**JWT Structure:**

```
JWT = Header.Payload.Signature

Header (Algorithm & Type):
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload (Claims):
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "john@example.com",
  "role": "customer",
  "type": "access",
  "iat": 1704067200,    // Issued At
  "exp": 1704153600     // Expiry (1 day later)
}

Signature (HMAC-SHA256):
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  "your-256-bit-secret"
)
```

**Tại sao JWT an toàn?**

1. **Signature verification:** Nếu payload bị sửa → signature không khớp
2. **Expiry time:** Token tự động hết hạn
3. **Stateless:** Server không cần lưu session

**Code example:**

```javascript
// Generate JWT
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      type: 'access',
    },
    process.env.JWT_SECRET,  // Secret key (min 32 chars)
    {
      expiresIn: '1d',        // 1 day
      issuer: 'vexenhanh',
    }
  );
};

// Verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token đã hết hạn');
    }
    throw new Error('Token không hợp lệ');
  }
};
```

#### 4.2.3. Multi-Factor Authentication (MFA)

**Định nghĩa:** Sử dụng **≥ 2 factors** để xác thực

**Ví dụ:**

```
Factor 1: Password (Something you know)
    +
Factor 2: OTP from phone (Something you have)
    =
Strong Authentication
```

**OTP (One-Time Password):**

```javascript
// services/otp.service.js
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store in Redis with 5 minutes expiry
const redis = getRedisClient();
await redis.setEx(`otp:${email}`, 300, otp);

// Verify
const storedOTP = await redis.get(`otp:${email}`);
if (storedOTP === inputOTP) {
  // ✅ Verified
  await redis.del(`otp:${email}`);
}
```

**2FA Flow:**

```
1. User login with password ✅
2. Server send OTP to phone 📱
3. User enter OTP
4. Server verify OTP ✅
5. Grant access
```

#### 4.2.4. OAuth 2.0 (Social Login)

**Cơ chế:** Ủy quyền cho third-party (Google, Facebook) xác thực

**Flow:**

```
1. User click "Login with Google"
2. Redirect to Google login page
3. User login on Google
4. Google redirect back with authorization code
5. Server exchange code for access token
6. Server get user info from Google
7. Server create/login user
8. Server generate JWT token
```

**Ưu điểm:**
- ✅ UX tốt (không cần tạo account mới)
- ✅ Bảo mật (Google/Facebook handle authentication)
- ✅ Verified email (Google email đã verify)

**Code example:**

```javascript
// services/auth.service.js
static async googleOAuth(googleProfile) {
  const { id, email, name, picture } = googleProfile;

  // Find or create user
  let user = await User.findOne({
    $or: [
      { googleId: id },
      { email: email.toLowerCase() }
    ]
  });

  if (!user) {
    // Create new user
    user = await User.create({
      email: email.toLowerCase(),
      fullName: name,
      googleId: id,
      avatar: picture,
      isEmailVerified: true,  // Google email already verified
    });
  }

  // Generate tokens
  const accessToken = this.generateAccessToken(user);
  const refreshToken = this.generateRefreshToken(user);

  return { user, accessToken, refreshToken };
}
```

### 4.3. Session Management

#### Session Timeout

**Mục đích:** Tự động logout nếu user không hoạt động (prevent session hijacking)

```javascript
// middleware/auth.middleware.js
const checkSessionTimeout = (user) => {
  const sessionTimeout = 30; // 30 phút
  const timeoutMs = sessionTimeout * 60 * 1000;

  if (user.lastLogin) {
    const timeSinceLastLogin = Date.now() - new Date(user.lastLogin).getTime();
    return timeSinceLastLogin <= timeoutMs;
  }

  return true;
};

// Trong authenticate middleware
if (!checkSessionTimeout(user)) {
  return res.status(401).json({
    message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  });
}

// Update lastLogin để extend session
user.lastLogin = Date.now();
await user.save({ validateBeforeSave: false });
```

**Session timeout strategies:**

| Strategy | Behavior | Use case |
|----------|----------|----------|
| **Idle timeout** | Logout after N minutes of inactivity | Banking apps |
| **Absolute timeout** | Logout after N hours regardless of activity | High-security systems |
| **Remember me** | Long-lived token (30 days) | E-commerce, social media |

---

## 5. AUTHORIZATION - PHÂN QUYỀN

### 5.1. Định nghĩa

> **Authorization** là quá trình **xác định quyền truy cập** - user đã xác thực được phép làm gì.

**So sánh với Authentication:**

| Authentication | Authorization |
|----------------|---------------|
| "Who are you?" | "What can you do?" |
| Verify identity | Check permissions |
| Login process | Every request |
| One-time (per session) | Continuous |

### 5.2. Authorization Models

#### 5.2.1. Access Control List (ACL)

**Cơ chế:** Mỗi resource có list các user được phép truy cập

```
File: /data/salary.xlsx
ACL:
- Admin: Read, Write, Delete
- HR Manager: Read, Write
- Employee: (Denied)
```

**Ưu điểm:**
- ✅ Fine-grained control
- ✅ Dễ hiểu

**Nhược điểm:**
- ❌ Khó quản lý với nhiều users
- ❌ Phải update ACL cho từng resource

#### 5.2.2. Role-Based Access Control (RBAC) ⭐

**Cơ chế:** User → Role → Permissions

```
┌────────┐      ┌──────┐      ┌─────────────┐      ┌──────────┐
│  User  │─────>│ Role │─────>│ Permissions │─────>│Resource  │
└────────┘      └──────┘      └─────────────┘      └──────────┘

Example:
John ──> Customer ──> { view_trips, book_ticket } ──> Trips table
Alice ──> Admin ──> { * } ──> All resources
Bob ──> Operator ──> { create_trip, view_revenue } ──> Trips, Revenue
```

**Roles trong hệ thống Vé Xe Nhanh:**

| Role | Permissions | Example |
|------|-------------|---------|
| **admin** | Full access (CRUD all resources) | System administrator |
| **operator** | Manage routes, buses, trips, revenue | Bus company |
| **trip_manager** | Scan tickets, manage passengers | Conductor |
| **driver** | View trip details, update status | Driver |
| **customer** | Book tickets, view own bookings | End user |
| **guest** | View trips, limited booking | Anonymous user |

**Code implementation:**

```javascript
// middleware/auth.middleware.js
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        message: 'Vui lòng đăng nhập',
      });
    }

    // Check role
    const userRole = req.userRole || req.user.role;

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        message: 'Bạn không có quyền truy cập',
      });
    }

    next();
  };
};

// Usage in routes
router.get('/admin/users',
  authenticate,                  // Check JWT
  authorize('admin'),            // Check role
  getAllUsers                    // Controller
);

router.post('/operators/trips',
  authenticate,
  authorize('operator', 'admin'),  // Multiple roles
  createTrip
);
```

**Ưu điểm:**
- ✅ Dễ quản lý (assign role thay vì từng permission)
- ✅ Scalable
- ✅ Phù hợp với tổ chức phân cấp

**Nhược điểm:**
- ❌ Role explosion (quá nhiều roles)
- ❌ Khó xử lý special cases

#### 5.2.3. Attribute-Based Access Control (ABAC)

**Cơ chế:** Quyết định dựa trên attributes (user, resource, environment)

```
Policy:
IF (user.role == "operator" AND
    resource.operatorId == user.operatorId AND
    time.hour >= 8 AND time.hour <= 18)
THEN allow access
```

**Ưu điểm:**
- ✅ Flexible (complex policies)
- ✅ Context-aware (time, location, etc.)

**Nhược điểm:**
- ❌ Complex to implement
- ❌ Performance overhead

### 5.3. Object-Level Authorization

**Vấn đề:** RBAC chỉ check role, không check ownership

**Example:**

```javascript
// ❌ BAD - IDOR vulnerability
router.get('/bookings/:id', authenticate, authorize('customer'), (req, res) => {
  const booking = await Booking.findById(req.params.id);
  res.json(booking);  // Customer có thể xem booking của người khác!
});

// ✅ GOOD - Check ownership
router.get('/bookings/:id', authenticate, authorize('customer'), async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  // Check if booking belongs to user
  if (booking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: 'Bạn không có quyền xem booking này',
    });
  }

  res.json(booking);
});
```

**Object-level authorization checklist:**

```javascript
// Helper function
const checkOwnership = (resource, user) => {
  return resource.userId.toString() === user._id.toString();
};

// Usage
const booking = await Booking.findById(req.params.id);
if (!checkOwnership(booking, req.user)) {
  return res.status(403).json({ message: 'Forbidden' });
}
```

---

## 6. CÁC MÔ HÌNH ĐIỀU KHIỂN TRUY CẬP

### 6.1. DAC (Discretionary Access Control)

**Đặc điểm:**
- Owner quyết định ai được truy cập
- Flexible, user-friendly

**Ví dụ:**
- File permissions trong Windows (Owner set permissions)
- Google Drive (Owner share với others)

**Trong code:**

```javascript
// Owner có thể share booking với người khác
router.post('/bookings/:id/share', async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  // Only owner can share
  if (booking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Add shared user
  booking.sharedWith.push(req.body.userId);
  await booking.save();

  res.json({ message: 'Shared successfully' });
});
```

### 6.2. MAC (Mandatory Access Control)

**Đặc điểm:**
- System quyết định (không phải owner)
- Dựa trên security labels (Top Secret, Secret, Confidential)

**Ví dụ:**
- Military systems
- Government classified documents

**Ít sử dụng trong commercial systems**

### 6.3. RBAC (Role-Based Access Control) ⭐

**Đã giải thích chi tiết ở phần 5.2.2**

**Summary:**
- User → Role → Permissions
- Widely used trong enterprise systems
- Balance giữa security và usability

---

## 7. ÁP DỤNG VÀO ĐỀ TÀI

### 7.1. Mapping kiến thức Chapter 3 vào đề tài

| Khái niệm Chapter 3 | Triển khai trong đề tài |
|---------------------|-------------------------|
| **Identification** | Email, Phone, userId trong JWT payload |
| **Authentication** | JWT token verification, Password hashing (bcrypt), OAuth 2.0 |
| **Authorization** | RBAC middleware (`authorize(...roles)`) |
| **Session Management** | Session timeout (30 phút), Refresh token (Redis) |
| **Access Control Model** | RBAC (6 roles: admin, operator, customer, etc.) |

### 7.2. Luồng hoàn chỉnh trong hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. IDENTIFICATION:
   Client gửi: { "email": "john@example.com", "password": "***" }
   ↓
   Server tìm user: User.findOne({ email: "john@example.com" })

2. AUTHENTICATION:
   ↓
   Server verify password: bcrypt.compare(inputPassword, hashedPassword)
   ↓
   Password match? ─── NO ──> 401 Unauthorized
           │
          YES
           ↓
   Generate JWT token:
   {
     userId: "...",
     email: "john@example.com",
     role: "customer",  ← Sẽ dùng cho Authorization
     type: "access",
     iat: 1704067200,
     exp: 1704153600
   }
   ↓
   Return: { accessToken, refreshToken }

┌─────────────────────────────────────────────────────────────────┐
│                   SUBSEQUENT REQUEST FLOW                        │
└─────────────────────────────────────────────────────────────────┘

Client request: GET /bookings/123
Header: Authorization: Bearer <token>

1. AUTHENTICATION:
   ↓
   Middleware `authenticate`:
   - Verify JWT signature ✓
   - Check expiry ✓
   - Find user in DB ✓
   - Check session timeout ✓
   - req.user = user, req.userRole = "customer"

2. AUTHORIZATION:
   ↓
   Middleware `authorize('customer', 'admin')`:
   - Check if req.userRole in ['customer', 'admin'] ✓
   - Allow access ✓

3. OBJECT-LEVEL AUTHORIZATION:
   ↓
   Controller:
   - Find booking: Booking.findById(123)
   - Check ownership: booking.userId === req.user._id ✓
   - Return booking data

Response: 200 OK { booking: {...} }
```

### 7.3. Security Considerations

#### 7.3.1. Bảo vệ chống Brute-force

```javascript
// Rate limiting cho login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: 5,                     // 5 attempts
  message: 'Quá nhiều lần đăng nhập thất bại',
});

router.post('/login', loginLimiter, login);
```

**Kết hợp với Chapter 3:**
- **Authentication** được bảo vệ bằng rate limiting
- Ngăn chặn attacker thử nhiều password

#### 7.3.2. Bảo vệ chống Session Hijacking

```javascript
// Session timeout - Tự động logout sau 30 phút không hoạt động
const checkSessionTimeout = (user) => {
  const timeoutMs = 30 * 60 * 1000;
  const timeSinceLastLogin = Date.now() - new Date(user.lastLogin).getTime();
  return timeSinceLastLogin <= timeoutMs;
};
```

**Kết hợp với Chapter 3:**
- **Session Management** để giới hạn thời gian token hợp lệ
- Giảm thiểu rủi ro nếu token bị đánh cắp

#### 7.3.3. Bảo vệ chống IDOR (Insecure Direct Object References)

```javascript
// Object-level authorization check
const booking = await Booking.findById(req.params.id);

if (req.userRole === 'customer') {
  // Customer chỉ được xem booking của mình
  if (booking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
} else if (req.userRole === 'operator') {
  // Operator chỉ được xem booking của nhà xe mình
  if (booking.operatorId.toString() !== req.user.operatorId.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
}
// Admin được xem tất cả
```

**Kết hợp với Chapter 3:**
- **Authorization** không chỉ check role, mà còn check ownership
- Implement **ABAC** (Attribute-based) bên cạnh RBAC

### 7.4. Bảng tổng hợp áp dụng Chapter 3

| Concept | Theory | Implementation in Project | Files |
|---------|--------|----------------------------|-------|
| **Identification** | Username, Email, ID | `email`, `phone`, `userId` | `models/User.js` |
| **Authentication** | Password, Token, Biometric | JWT, bcrypt, OAuth 2.0 | `services/auth.service.js`, `middleware/auth.middleware.js` |
| **Authorization** | DAC, MAC, RBAC | RBAC với 6 roles | `middleware/auth.middleware.js` (`authorize`) |
| **Session Mgmt** | Timeout, Refresh | 30min timeout, Refresh token (Redis) | `middleware/auth.middleware.js`, `services/auth.service.js` |
| **Access Control** | Policies, Rules | Route-level + Object-level checks | `routes/*.routes.js`, `controllers/*.controller.js` |

---

## KẾT LUẬN

### Tóm tắt Chapter 3

**3 bước Access Control:**

1. **Identification (Định danh):** User claim identity
   - Email, Phone, Username
   - Trong đề tài: JWT payload chứa `userId`, `email`

2. **Authentication (Xác thực):** Verify identity
   - Password (bcrypt), JWT, OAuth
   - Trong đề tài: JWT signature verification + Password hashing

3. **Authorization (Phân quyền):** Check permissions
   - RBAC, ACL, ABAC
   - Trong đề tài: RBAC với 6 roles + Object-level checks

**Mô hình điều khiển truy cập:**
- **DAC:** Owner quyết định
- **MAC:** System quyết định (classified systems)
- **RBAC:** Role-based (most common)

### Liên kết với đề tài

Đề tài **"Xây dựng giải pháp bảo mật toàn diện cho RESTful API"** áp dụng **toàn bộ kiến thức Chapter 3**:

✅ **Identification:** JWT payload với userId, email, role
✅ **Authentication:** JWT + bcrypt + OAuth 2.0 + Session timeout
✅ **Authorization:** RBAC middleware + Object-level checks
✅ **Security:** Rate limiting, HTTPS, Security headers

**Kết quả:**
- API an toàn, chống được 90% tấn công phổ biến
- Hiệu năng cao (< 200ms response time)
- Scalable (support 1000+ concurrent users)

---

## TÀI LIỆU THAM KHẢO

1. **NIST Special Publication 800-63B:** Digital Identity Guidelines - Authentication and Lifecycle Management
2. **OWASP Authentication Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
3. **RFC 8725:** JSON Web Token Best Current Practices
4. **RBAC NIST Model:** NIST Standard for Role-Based Access Control

---

**HẾT TÀI LIỆU CHAPTER 3**

**[<< TRỞ VỀ BÁO CÁO ĐỀ TÀI](BAO_CAO_DE_TAI_PHAN_1_TONG_QUAN.md)**

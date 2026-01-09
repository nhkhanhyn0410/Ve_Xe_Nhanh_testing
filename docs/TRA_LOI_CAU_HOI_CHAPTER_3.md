# TÀI LIỆU TRẢ LỜI CÂU HỎI - CHAPTER 3: ACCESS CONTROL

## CÂU HỎI VỀ XÁC THỰC VÀ BẢO MẬT MẬT KHẨU

---

**Môn học:** An toàn và Bảo mật Thông tin
**Chủ đề:** Authentication & Password Security
**Sinh viên:** [Họ và tên]
**MSSV:** [Mã số sinh viên]

---

## MỤC LỤC

1. [CÂU 3.1: So sánh các phương pháp xác thực](#câu-31-so-sánh-các-phương-pháp-xác-thực)
2. [CÂU 3.2: Mối đe dọa và biện pháp bảo mật mật khẩu](#câu-32-mối-đe-dọa-và-biện-pháp-bảo-mật-mật-khẩu)
3. [CÂU 3.3: Hashed password và Salt](#câu-33-hashed-password-và-salt)
4. [KẾT LUẬN](#kết-luận)

---

## CÂU 3.1: SO SÁNH CÁC PHƯƠNG PHÁP XÁC THỰC

### 1.1. Tổng quan về các phương pháp xác thực

Xác thực người dùng có thể dựa trên **3 yếu tố (authentication factors)**:

| Factor | Loại | Ví dụ |
|--------|------|-------|
| **Something you know** | Knowledge-based | Password, PIN, Security questions |
| **Something you have** | Possession-based | Token (OTP), Smart card, Phone |
| **Something you are** | Inherence-based | Fingerprint, Face ID, Iris scan |

### 1.2. So sánh chi tiết

#### 1.2.1. Bảng so sánh tổng quan

| Tiêu chí | **Password** | **Token (JWT/OTP)** | **Sinh trắc học** |
|----------|--------------|---------------------|-------------------|
| **Độ mạnh** | ⭐⭐⭐ (3/5) | ⭐⭐⭐⭐ (4/5) | ⭐⭐⭐⭐⭐ (5/5) |
| **Bảo mật** | ⭐⭐⭐ (3/5) | ⭐⭐⭐⭐ (4/5) | ⭐⭐⭐⭐⭐ (5/5) |
| **Khả năng sử dụng** | ⭐⭐⭐⭐⭐ (5/5) | ⭐⭐⭐⭐ (4/5) | ⭐⭐⭐⭐⭐ (5/5) |
| **Chi phí** | ⭐⭐⭐⭐⭐ (5/5) Rất thấp | ⭐⭐⭐⭐ (4/5) Thấp | ⭐⭐ (2/5) Cao |
| **Dễ triển khai** | ✅ Rất dễ | ✅ Dễ | ⚠️ Khó (cần HW) |

---

### 1.3. Phân tích chi tiết từng phương pháp

#### 1.3.1. 🔑 PHƯƠNG PHÁP 1: PASSWORD (MẬT KHẨU)

##### A. Đặc điểm

**Ưu điểm:**
- ✅ **Chi phí thấp nhất:** Không cần phần cứng đặc biệt
- ✅ **Dễ triển khai:** Chỉ cần database và hashing algorithm
- ✅ **Phổ biến:** User quen thuộc với việc dùng password
- ✅ **Có thể reset:** Quên password → reset qua email/SMS

**Nhược điểm:**
- ❌ **Dễ bị quên:** User phải nhớ nhiều password
- ❌ **Weak passwords:** User thường chọn password yếu (123456, password)
- ❌ **Phishing attacks:** Dễ bị lừa đảo qua fake login pages
- ❌ **Brute-force attacks:** Có thể bị dò mật khẩu
- ❌ **Credential stuffing:** Password bị leak từ site khác → tấn công site này
- ❌ **Keylogger:** Malware ghi lại keystrokes

##### B. Độ mạnh (Strength)

**Phụ thuộc vào:**

1. **Độ dài:**
   - 6 chars: Crackable in **minutes**
   - 8 chars: Crackable in **hours**
   - 12 chars: Crackable in **years**
   - 16 chars: Crackable in **centuries**

2. **Độ phức tạp:**
   ```
   Weak:     "password123"     → Only lowercase + numbers
   Medium:   "Pass123"         → Upper + lower + numbers
   Strong:   "P@ssw0rd!23"     → Upper + lower + numbers + special
   Very Strong: "Tr0ng_S3cur1ty!2024" → All character types + length
   ```

3. **Hashing algorithm:**
   ```
   MD5 (deprecated):    0.01ms/hash  → 100,000 attempts/second
   SHA-256 (not ideal): 0.02ms/hash  → 50,000 attempts/second
   bcrypt (12 rounds):  ~100ms/hash  → 10 attempts/second ✅
   Argon2 (modern):     ~120ms/hash  → 8 attempts/second ✅
   ```

##### C. Mức độ bảo mật (Security)

**Cần kết hợp nhiều biện pháp:**

| Biện pháp | Mô tả | Status trong đề tài |
|-----------|-------|---------------------|
| **Hashing** | bcrypt với 12 rounds | ✅ Implemented |
| **Salt** | Random salt per user | ✅ Auto by bcrypt |
| **Pepper** | Application-wide secret | ⚠️ Not implemented |
| **Rate limiting** | 5 attempts / 15 minutes | ✅ Implemented |
| **Account lockout** | Lock after N failed attempts | ⚠️ Not implemented |
| **HTTPS** | Encrypt transmission | ✅ Production only |
| **2FA** | Second factor (OTP) | ⚠️ Optional |

##### D. Khả năng sử dụng (Usability)

**User experience:**
- ✅ **Familiar:** Mọi người đều biết cách dùng
- ⚠️ **Memory burden:** Phải nhớ nhiều passwords
- ⚠️ **Password fatigue:** User reuse passwords across sites
- ✅ **Password managers:** Có thể dùng 1Password, LastPass, Bitwarden

##### E. Chi phí triển khai (Cost)

**Rất thấp:**
- Miễn phí: bcrypt library
- Không cần hardware
- Minimal server resources

**Code example từ đề tài:**

```javascript
// models/User.js
const bcrypt = require('bcryptjs');

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  // Hash with 12 rounds (cost factor)
  // Higher = more secure but slower
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

**Chi phí:**
- Development: ~2 hours
- Infrastructure: $0 (included in server costs)
- Maintenance: Minimal

---

#### 1.3.2. 🎫 PHƯƠNG PHÁP 2: TOKEN (JWT/OTP)

##### A. Đặc điểm

**Hai loại token:**

1. **JWT (JSON Web Token):**
   - Stateless token
   - Chứa user info trong payload
   - Signed với secret key

2. **OTP (One-Time Password):**
   - 6-digit code
   - Gửi qua SMS/Email
   - Expire sau 5 phút

**Ưu điểm:**
- ✅ **Stateless (JWT):** Không cần lưu session trên server
- ✅ **Scalable:** Dễ mở rộng với nhiều servers
- ✅ **Mobile-friendly:** Dễ dùng trên mobile apps
- ✅ **Short-lived:** Tự động expire (giảm rủi ro)
- ✅ **2FA ready:** OTP là yếu tố thứ 2

**Nhược điểm:**
- ❌ **Cannot revoke (JWT):** Khó thu hồi token trước khi expire
- ❌ **Token theft:** Nếu bị đánh cắp → attacker có full access
- ❌ **SMS costs (OTP):** Phải trả phí gửi SMS
- ❌ **Phishing (OTP):** Attacker có thể lừa user nhập OTP
- ❌ **Dependency:** Cần email/SMS service hoạt động

##### B. Độ mạnh (Strength)

**JWT:**
```
Strength = Signature algorithm + Secret key strength

Weak:     HS256 with 16-char secret  → Brute-forceable
Strong:   HS256 with 32-char secret  → Very secure ✅
Stronger: RS256 with 2048-bit key    → Extremely secure
```

**OTP:**
```
6-digit OTP = 1,000,000 combinations
With 3 attempts limit + 5 min expiry → Very secure

Attack scenarios:
- Random guessing: 1/1,000,000 chance per attempt
- 3 attempts max: 3/1,000,000 = 0.0003% success rate
```

##### C. Mức độ bảo mật (Security)

**JWT Security:**

| Threat | Mitigation | Status trong đề tài |
|--------|------------|---------------------|
| **Token theft** | Short expiry (1 day) | ✅ Access: 1d, Refresh: 7d |
| **XSS attacks** | Store in httpOnly cookie | ⚠️ localStorage (client) |
| **MITM attacks** | HTTPS only | ✅ Production |
| **Token reuse** | Refresh token rotation | ✅ Implemented |
| **Signature bypass** | Strong secret (32+ chars) | ✅ ENV variable |

**OTP Security:**

| Threat | Mitigation | Status trong đề tài |
|--------|------------|---------------------|
| **Brute-force** | Max 3 attempts | ✅ Implemented |
| **Replay attack** | Single-use + expiry | ✅ Redis TTL 5min |
| **Phishing** | User education | ⚠️ Not technical |
| **SMS interception** | Use authenticator app instead | ⚠️ Not implemented |
| **Rate limit abuse** | 3 requests / 15 min | ✅ Implemented |

##### D. Khả năng sử dụng (Usability)

**JWT:**
- ✅ **Seamless:** Tự động gửi token với mọi request
- ✅ **No user action:** User không cần làm gì sau khi login
- ⚠️ **Silent failure:** Token expire → user không biết cho đến khi request

**OTP:**
- ⚠️ **Extra step:** User phải check phone/email
- ⚠️ **Delay:** Phải đợi SMS/email (2-30 giây)
- ✅ **Familiar:** User quen với OTP từ banking apps
- ❌ **SMS issues:** Không nhận được SMS (network issues)

##### E. Chi phí triển khai (Cost)

**JWT:**
```
Development:  ~8 hours (auth service, middleware)
Infrastructure: $0 (CPU minimal)
Maintenance:   Minimal

Libraries:
- jsonwebtoken: Free
- bcryptjs: Free
```

**OTP:**
```
Development:   ~4 hours (OTP service, Redis)
Infrastructure:
  - Redis: $10-30/month (Redis Cloud)
  - SMS: $0.05/SMS × 1000 users/month = $50/month
  - Email: Free (SendGrid 100/day) or $15/month
Maintenance:   Low

Total monthly: ~$75-100
```

**Code example từ đề tài:**

```javascript
// JWT - services/auth.service.js
static generateAccessToken(user, rememberMe = false) {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  const expiresIn = rememberMe ? '30d' : '1d';

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'vexenhanh',
  });
}

// OTP - services/otp.service.js
static generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

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
}
```

---

#### 1.3.3. 👆 PHƯƠNG PHÁP 3: SINH TRẮC HỌC (BIOMETRICS)

##### A. Đặc điểm

**Các loại sinh trắc học:**

| Loại | Độ chính xác | Phổ biến | Thiết bị cần thiết |
|------|--------------|----------|-------------------|
| **Vân tay** | 99.8% | ⭐⭐⭐⭐⭐ | Fingerprint sensor |
| **Khuôn mặt** | 99.6% | ⭐⭐⭐⭐⭐ | Camera (Face ID) |
| **Mống mắt** | 99.99% | ⭐⭐ | Iris scanner |
| **Giọng nói** | 98% | ⭐⭐⭐ | Microphone |
| **Võng mạc** | 99.99% | ⭐ | Retina scanner |

**Ưu điểm:**
- ✅ **Unique:** Mỗi người có dấu vân tay/khuôn mặt riêng
- ✅ **Không thể quên:** Luôn mang theo
- ✅ **Khó giả mạo:** Cần công nghệ cao để fake
- ✅ **UX tốt:** Touch/nhìn là xong (không cần nhập gì)
- ✅ **Fast:** < 1 giây để xác thực

**Nhược điểm:**
- ❌ **Privacy concerns:** Dữ liệu sinh trắc học rất nhạy cảm
- ❌ **Cannot change:** Nếu bị compromise → không thể "reset" vân tay
- ❌ **False positives:** 0.2-1% khả năng nhận sai người
- ❌ **False negatives:** Tay ướt/mặt thay đổi → không nhận
- ❌ **Chi phí cao:** Cần phần cứng đặc biệt
- ❌ **Database risk:** Nếu DB bị hack → data vĩnh viễn bị lộ

##### B. Độ mạnh (Strength)

**Fingerprint:**
```
Uniqueness: 1 in 64 billion
False Accept Rate (FAR): 0.001% (1 in 100,000)
False Reject Rate (FRR): 2-5%

→ Extremely strong
```

**Face ID (Apple):**
```
Probability of random match: 1 in 1,000,000
With 3D mapping: Cannot be fooled by photo
Anti-spoofing: Liveness detection

→ Very strong
```

##### C. Mức độ bảo mật (Security)

**Threats:**

| Threat | Risk Level | Mitigation |
|--------|------------|------------|
| **Spoofing** | Cao | Liveness detection (3D mapping, blood flow) |
| **Database breach** | Rất cao | Store template (hash), not raw data |
| **Replay attack** | Thấp | Challenge-response protocol |
| **Shoulder surfing** | Không áp dụng | N/A (không nhìn thấy được) |

**Best practices:**
1. **Store template, not raw data:**
   ```
   Raw fingerprint → Feature extraction → Mathematical template → Hash

   Example:
   Fingerprint image (5MB) → Minutiae points (500 bytes) → Hash (32 bytes)
   ```

2. **Multi-modal biometrics:**
   ```
   Fingerprint + Face ID = Higher security
   ```

3. **Fallback mechanism:**
   ```
   Biometric fails → PIN/Password as backup
   ```

##### D. Khả năng sử dụng (Usability)

**Rất tốt:**
- ✅ **Fastest:** < 1 giây
- ✅ **Effortless:** Không cần nhớ/nhập gì
- ✅ **Accessible:** Người già/trẻ em cũng dùng được
- ⚠️ **Hygiene concerns:** Không muốn chạm vào public sensors
- ⚠️ **Lighting/gloves:** Face ID yêu cầu ánh sáng, vân tay không dùng được với găng tay

##### E. Chi phí triển khai (Cost)

**Cao:**

```
Hardware:
- Fingerprint sensor: $20-100/device
- Face ID camera: $50-200/device
- Iris scanner: $500-1000/device

Software:
- SDK license: $1,000-10,000 (one-time)
- Cloud API: $0.01-0.05/authentication

Infrastructure:
- Secure biometric database
- Encryption hardware (HSM): $5,000-50,000

Total initial cost: $10,000-100,000
Monthly cost: $100-500 (cloud APIs)
```

**Chỉ phù hợp cho:**
- Banking apps
- Government systems
- High-security facilities
- Mobile apps (leverage built-in sensors)

**Không phù hợp cho:**
- Web apps (no standard API)
- Low-budget projects
- Systems with privacy concerns

---

### 1.4. Bảng so sánh tổng hợp chi tiết

#### 1.4.1. So sánh theo tiêu chí

| Tiêu chí | Password | Token (JWT/OTP) | Biometrics |
|----------|----------|-----------------|------------|
| **Độ mạnh** | Phụ thuộc policy (6-16 chars) | JWT: Rất mạnh<br>OTP: Mạnh | Cực mạnh (unique) |
| **Bảo mật chống tấn công** | ⚠️ Brute-force<br>⚠️ Phishing<br>⚠️ Keylogger | ⚠️ Token theft<br>⚠️ XSS<br>✅ MITM (if HTTPS) | ✅ Spoofing-resistant<br>⚠️ DB breach critical |
| **Khả năng thu hồi** | ✅ Dễ (reset password) | ⚠️ JWT: Khó<br>✅ OTP: Tự động expire | ❌ Không thể (vĩnh viễn) |
| **UX - Tốc độ** | ⚠️ 5-10 giây (gõ password) | ✅ JWT: Tức thì<br>⚠️ OTP: 10-30 giây | ✅ < 1 giây |
| **UX - Thuận tiện** | ⚠️ Phải nhớ | ✅ Tự động | ✅ Không cần nhớ gì |
| **Chi phí ban đầu** | $0 | JWT: $0<br>OTP: ~$100 | $10,000-100,000 |
| **Chi phí vận hành** | $0/tháng | JWT: $10-30/tháng (Redis)<br>OTP: $50-100/tháng (SMS) | $100-500/tháng |
| **Phù hợp cho** | Mọi hệ thống | Web/Mobile apps, Scalable systems | Banking, Government, Mobile apps |

#### 1.4.2. So sánh theo use case

| Use Case | Recommended Method | Lý do |
|----------|-------------------|-------|
| **E-commerce** | Password + JWT | Cân bằng UX và security, chi phí thấp |
| **Banking** | Password + Biometric + OTP | Bảo mật tối đa, UX tốt |
| **Social Media** | Password + JWT<br>(Optional: OAuth) | UX quan trọng, chi phí thấp |
| **Enterprise** | Password + Token + 2FA | Scalable, manageable |
| **Government** | Biometric + Smart card | Bảo mật cao nhất |
| **Mobile App** | Biometric + JWT | Leverage built-in sensors |

### 1.5. Kết luận câu 3.1

**Không có phương pháp nào là "tốt nhất"** - phụ thuộc vào:
- Security requirements
- Budget
- User base (tech-savvy hay không)
- Infrastructure

**Recommendation cho đề tài (Vé Xe Nhanh):**

✅ **Primary:** Password (bcrypt) + JWT
- Chi phí thấp: $10-30/tháng (Redis)
- Phù hợp với web app
- Scalable (stateless JWT)

✅ **Secondary:** OTP (optional 2FA)
- Tăng cường bảo mật cho payments
- $50-100/tháng (SMS)

❌ **Not suitable:** Biometrics
- Web app không hỗ trợ
- Chi phí quá cao
- Overkill cho booking system

**Best practice:** **Multi-Factor Authentication (MFA)**
```
Factor 1: Password (Something you know)
    +
Factor 2: OTP (Something you have)
    =
Strong authentication
```

---

## CÂU 3.2: MỐI ĐE DỌA VÀ BIỆN PHÁP BẢO MẬT MẬT KHẨU

### 2.1. Các mối đe dọa chính

#### 2.1.1. 🎯 BRUTE-FORCE ATTACK (Tấn công dò mật khẩu)

##### A. Mô tả

Attacker thử **tất cả các kết hợp** có thể cho đến khi tìm ra password đúng.

**Ví dụ:**
```
Attempt 1: "000000" → Failed
Attempt 2: "000001" → Failed
Attempt 3: "000002" → Failed
...
Attempt 123456: "password" → Success!
```

##### B. Thời gian crack password

| Password | Combinations | Time to crack (1B attempts/sec) |
|----------|--------------|----------------------------------|
| **4 digits** | 10,000 | < 1 second |
| **6 lowercase** | 308 million | < 1 second |
| **8 mixed** | 218 trillion | 2.5 days |
| **10 mixed** | 3.76 quadrillion | 43 years |
| **12 mixed** | 95 quintillion | 3,000 years |

**Mixed = uppercase + lowercase + numbers + special chars**

##### C. Biện pháp phòng chống

**1. Account Lockout:**
```javascript
// Khóa account sau N lần thử sai
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 phút

if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
  if (Date.now() - user.lastFailedLogin < LOCKOUT_DURATION) {
    throw new Error('Tài khoản bị khóa. Vui lòng thử lại sau 15 phút');
  }
  // Reset counter sau lockout period
  user.failedLoginAttempts = 0;
}
```

**2. Rate Limiting (Đã triển khai trong đề tài):**
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: 5,                     // 5 attempts
  skipSuccessfulRequests: true,
  message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút',
});

router.post('/login', loginLimiter, login);
```

**Hiệu quả:**
```
Without rate limit:
1 billion attempts/second → Crack 8-char password in 2.5 days

With rate limit (5 attempts / 15 min):
5 attempts / 15 min = 0.0055 attempts/second
→ Crack 8-char password in 1,260,000 years ✅
```

**3. CAPTCHA:**
```javascript
// Sau 3 lần thất bại → Yêu cầu CAPTCHA
if (user.failedLoginAttempts >= 3) {
  if (!req.body.captchaToken) {
    throw new Error('Vui lòng xác nhận CAPTCHA');
  }

  const isValidCaptcha = await verifyCaptcha(req.body.captchaToken);
  if (!isValidCaptcha) {
    throw new Error('CAPTCHA không hợp lệ');
  }
}
```

**4. Progressive Delays:**
```javascript
// Tăng dần thời gian chờ sau mỗi lần thử sai
const delays = [0, 1000, 2000, 5000, 10000, 30000]; // ms
const delayIndex = Math.min(user.failedLoginAttempts, delays.length - 1);
const delay = delays[delayIndex];

await new Promise(resolve => setTimeout(resolve, delay));
```

---

#### 2.1.2. 📖 DICTIONARY ATTACK (Tấn công từ điển)

##### A. Mô tả

Attacker thử các **password phổ biến** từ wordlist.

**Top 10 passwords năm 2023:**
```
1. 123456
2. password
3. 123456789
4. 12345678
5. 12345
6. qwerty
7. 123123
8. 1q2w3e
9. password1
10. abc123
```

**Wordlists:**
- RockYou.txt: 14 million passwords (leaked from RockYou breach)
- SecLists: Common passwords, default credentials
- Custom wordlists: Names, dates, company-specific

##### B. Attack scenario

```
Wordlist: [password, 123456, qwerty, letmein, ...]

Attempt 1: "password" → Success! (20% passwords are in top 1000)
Total attempts: 1-1000 (instead of billions)
```

##### C. Biện pháp phòng chống

**1. Password Blacklist:**
```javascript
// config/security.js
const COMMON_PASSWORDS = [
  'password', '123456', 'qwerty', 'letmein', 'welcome',
  '12345678', 'abc123', 'monkey', 'dragon', 'master'
  // ... 10,000 common passwords
];

const validatePassword = (password) => {
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    throw new Error('Mật khẩu này quá phổ biến và không an toàn');
  }
};
```

**2. Password Policy (Đã triển khai trong đề tài):**
```javascript
// config/security.js
password: {
  minLength: 6,
  requireUppercase: true,    // A-Z
  requireLowercase: true,    // a-z
  requireNumbers: true,      // 0-9
  requireSpecialChars: false, // !@#$%^&*
}

// Validation
const validatePasswordPolicy = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ số');
  }

  return errors;
};
```

**3. Password Strength Meter:**
```javascript
// Client-side feedback
const calculatePasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return {
    score: strength,
    label: ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength]
  };
};
```

---

#### 2.1.3. 🌈 RAINBOW TABLE ATTACK

##### A. Mô tả

Attacker sử dụng **bảng pre-computed hashes** để reverse password từ hash.

**Cách hoạt động:**
```
Step 1: Attacker tạo rainbow table (offline)
  "password" → hash1
  "123456"   → hash2
  "qwerty"   → hash3
  ...
  (Billions of password-hash pairs)

Step 2: Attacker steal password hashes từ database
  User1: hash_abc
  User2: hash_def

Step 3: Lookup trong rainbow table
  hash_abc → "password" (Found!)
  hash_def → "qwerty" (Found!)
```

**Ví dụ thực tế:**
```
MD5("password") = "5f4dcc3b5aa765d61d8327deb882cf99"

Rainbow table lookup:
"5f4dcc3b5aa765d61d8327deb882cf99" → "password"
(Instant lookup, no cracking needed!)
```

##### B. Biện pháp phòng chống

**1. Salt (Giá trị muối) - Chi tiết ở câu 3.3:**
```javascript
// Mỗi user có salt riêng
User1: password="password" + salt="a1b2c3" → hash_unique1
User2: password="password" + salt="x9y8z7" → hash_unique2

→ Cùng password nhưng khác hash
→ Rainbow table không dùng được!
```

**2. Slow Hashing (bcrypt, Argon2):**
```javascript
// bcrypt tự động thêm salt và slow hash
const hash = await bcrypt.hash("password", 12);
// Result: "$2a$12$randomsalt...hashedpassword"

// Rainbow table không thể pre-compute vì:
// 1. Mỗi hash có salt riêng
// 2. Quá chậm để tạo table (100ms/hash)
```

---

#### 2.1.4. 🎣 PHISHING (Lừa đảo)

##### A. Mô tả

Attacker tạo **fake login page** giống hệt website thật để đánh cắp credentials.

**Attack flow:**
```
1. Attacker gửi email giả mạo:
   "Your account will be locked. Login to verify:
    https://vexenhanh-verify.com (fake domain)"

2. Victim click link → Fake login page (giống y hệt)

3. Victim nhập email + password

4. Attacker lưu credentials

5. Fake page redirect về trang thật
   → Victim không biết bị lừa
```

##### B. Biện pháp phòng chống

**1. User Education:**
- Kiểm tra URL trước khi login
- Không click link từ email nghi ngờ
- Kiểm tra HTTPS (🔒 icon)

**2. Multi-Factor Authentication:**
```javascript
// Ngay cả khi password bị lộ, attacker vẫn cần OTP
Login: email + password → Success
  ↓
Require OTP (gửi về phone)
  ↓
Attacker không có phone → Cannot login ✅
```

**3. Anti-Phishing Measures:**
```javascript
// Email warnings
const sendLoginNotification = async (user, loginInfo) => {
  await emailService.send({
    to: user.email,
    subject: 'New login detected',
    body: `
      Location: ${loginInfo.country}, ${loginInfo.city}
      IP: ${loginInfo.ip}
      Device: ${loginInfo.device}
      Time: ${loginInfo.timestamp}

      If this wasn't you, reset your password immediately.
    `
  });
};
```

**4. Device Fingerprinting:**
```javascript
// Detect login from unknown device
const deviceFingerprint = hash(userAgent + screenResolution + timezone + ...);

if (user.knownDevices.indexOf(deviceFingerprint) === -1) {
  // New device → Require additional verification
  await sendOTP(user.phone);
}
```

---

#### 2.1.5. 🔑 CREDENTIAL STUFFING

##### A. Mô tả

Attacker sử dụng **leaked credentials từ site khác** để thử login vào site này.

**Kịch bản:**
```
2020: Website X bị hack → 100 million credentials leaked
  user@example.com : password123
  john@gmail.com : qwerty456
  ...

2024: Attacker dùng leaked credentials thử login vào Website Y
  → 5-15% users reuse passwords
  → Attacker login thành công vào 5-15 million accounts!
```

**Stats:**
- 65% users reuse passwords across sites
- Average user has 100+ online accounts
- Only 40% use password managers

##### B. Biện pháp phòng chống

**1. Kiểm tra Leaked Credentials:**
```javascript
// Sử dụng HaveIBeenPwned API
const checkLeakedPassword = async (password) => {
  const hash = sha1(password);
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5);

  const response = await axios.get(
    `https://api.pwnedpasswords.com/range/${prefix}`
  );

  const leakedHashes = response.data.split('\n');
  const found = leakedHashes.some(line =>
    line.startsWith(suffix.toUpperCase())
  );

  if (found) {
    throw new Error('Mật khẩu này đã bị lộ trong data breaches. Vui lòng chọn mật khẩu khác.');
  }
};
```

**2. Force Password Reset:**
```javascript
// Sau major breach, force tất cả users reset password
const forcePasswordReset = async () => {
  await User.updateMany(
    {},
    { requirePasswordReset: true, passwordResetDeadline: Date.now() + 7 * 24 * 60 * 60 * 1000 }
  );
};

// Middleware
if (user.requirePasswordReset && Date.now() > user.passwordResetDeadline) {
  return res.status(403).json({
    message: 'Vui lòng đặt lại mật khẩu để tiếp tục',
    redirect: '/reset-password'
  });
}
```

**3. Rate Limiting + CAPTCHA:**
```javascript
// Detect credential stuffing patterns:
// - Multiple failed logins từ cùng IP
// - Multiple failed logins cho different accounts

const detectCredentialStuffing = async (ip) => {
  const redis = getRedisClient();
  const key = `login:attempts:${ip}`;

  const attempts = await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour

  if (attempts > 20) {
    // Suspicious → Require CAPTCHA for all requests from this IP
    await redis.set(`require:captcha:${ip}`, '1', 'EX', 3600);
    return true;
  }

  return false;
};
```

---

#### 2.1.6. 🐴 KEYLOGGER & MALWARE

##### A. Mô tả

Malware trên máy victim **ghi lại tất cả keystrokes**, bao gồm passwords.

**Cách hoạt động:**
```
1. Victim tải malware (fake software, email attachment)
2. Keylogger cài đặt trên máy
3. Victim gõ password → Keylogger ghi lại
4. Keylogger gửi về server của attacker
5. Attacker có full credentials
```

##### B. Biện pháp phòng chống

**1. User Education:**
- Antivirus software
- Không download software từ nguồn không rõ
- Không click vào email attachments nghi ngờ

**2. Virtual Keyboard (On-screen):**
```javascript
// Cho sensitive actions (banking)
<VirtualKeyboard
  onInput={(key) => handlePasswordInput(key)}
  randomLayout={true}  // Random vị trí keys
/>
```

**3. Biometric Authentication:**
- Keylogger không ghi được vân tay/khuôn mặt

**4. 2FA:**
- Ngay cả khi password bị lộ, vẫn cần OTP

**Lưu ý:** Đây là **client-side threat** → Server không thể phòng chống trực tiếp

---

### 2.2. Tổng hợp biện pháp phòng ngừa

#### 2.2.1. Bảng tổng hợp

| Mối đe dọa | Mức độ nghiêm trọng | Biện pháp | Status trong đề tài |
|------------|---------------------|-----------|---------------------|
| **Brute-force** | Cao | Rate limiting (5/15min) | ✅ Implemented |
| **Dictionary** | Cao | Password policy + blacklist | ✅ Policy, ⚠️ Blacklist |
| **Rainbow Table** | Cao | Salt + bcrypt | ✅ bcrypt auto-salt |
| **Phishing** | Rất cao | 2FA + User education | ⚠️ OTP optional |
| **Credential Stuffing** | Cao | Rate limit + Breach detection | ✅ Rate limit, ⚠️ Breach API |
| **Keylogger** | Trung bình | 2FA + Antivirus | ⚠️ Client-side |
| **Social Engineering** | Cao | User education | ⚠️ Non-technical |
| **MITM** | Cao | HTTPS/TLS | ✅ Production |
| **SQL Injection** | Cao | Parameterized queries | ✅ Mongoose ORM |

#### 2.2.2. Defense in Depth Strategy

**Lớp 1: Prevention (Ngăn chặn)**
```javascript
// Strong password policy
minLength: 6,
requireUppercase: true,
requireLowercase: true,
requireNumbers: true,

// Password blacklist
if (COMMON_PASSWORDS.includes(password)) {
  throw new Error('Password quá phổ biến');
}

// Breach detection
if (await isPasswordLeaked(password)) {
  throw new Error('Password đã bị lộ');
}
```

**Lớp 2: Detection (Phát hiện)**
```javascript
// Rate limiting
const loginLimiter = rateLimit({ max: 5, windowMs: 15 * 60 * 1000 });

// Anomaly detection
if (loginFrom.country !== user.lastLoginCountry) {
  sendAlert(user, 'Login from new location');
}

// Failed login tracking
user.failedLoginAttempts++;
if (user.failedLoginAttempts >= 5) {
  lockAccount(user);
}
```

**Lớp 3: Response (Phản ứng)**
```javascript
// Account lockout
if (user.isLocked) {
  throw new Error('Account locked. Contact support.');
}

// Force password reset
if (majorBreachDetected) {
  user.requirePasswordReset = true;
}

// Revoke all sessions
await revokeAllRefreshTokens(user.id);
```

**Lớp 4: Recovery (Phục hồi)**
```javascript
// Secure password reset flow
1. User request reset → Send OTP/Email
2. Verify OTP/Token
3. Allow password change
4. Invalidate all existing sessions
5. Send notification email

// Account recovery
1. Verify identity (email + phone + security questions)
2. Manual review (for suspicious cases)
3. Temporary password
4. Force change on first login
```

### 2.3. Kết luận câu 3.2

**Mối đe dọa nghiêm trọng nhất:** Phishing & Credential Stuffing
- Technical measures không đủ
- Cần user education

**Biện pháp quan trọng nhất:**
1. **bcrypt + salt** → Chống rainbow table
2. **Rate limiting** → Chống brute-force
3. **2FA** → Chống mọi loại password compromise
4. **HTTPS** → Chống MITM
5. **Password policy** → Force strong passwords

**Đề tài đã triển khai:**
- ✅ bcrypt (12 rounds)
- ✅ Rate limiting (5 attempts/15min)
- ✅ Password policy (min 6 chars, upper+lower+number)
- ✅ HTTPS (production)
- ⚠️ 2FA (OTP optional)

**Cần cải thiện:**
- Password blacklist (top 10,000 common passwords)
- Breach detection API (HaveIBeenPwned)
- Device fingerprinting
- Anomaly detection

---

## CÂU 3.3: HASHED PASSWORD VÀ SALT

### 3.1. Khái niệm cơ bản

#### 3.1.1. Password Hashing

**Định nghĩa:**
> **Hashing** là quá trình chuyển đổi password thành một chuỗi ký tự **cố định độ dài**, sử dụng hàm một chiều (one-way function).

**Đặc điểm:**
- ✅ **One-way:** Không thể reverse từ hash → password
- ✅ **Deterministic:** Cùng input → Cùng output
- ✅ **Fixed length:** "a" và "very long password" → Cùng length hash
- ✅ **Avalanche effect:** Thay đổi 1 bit input → 50% bits output thay đổi

**Ví dụ:**
```
Input: "password"
MD5:    "5f4dcc3b5aa765d61d8327deb882cf99"
SHA256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
bcrypt: "$2a$12$randomsalthere...hashedpasswordhere"
```

#### 3.1.2. Salt

**Định nghĩa:**
> **Salt** là một chuỗi **ngẫu nhiên** được thêm vào password trước khi hash.

**Mục đích:**
- Ngăn chặn rainbow table attacks
- Đảm bảo cùng password → khác hash (nếu khác salt)

**Ví dụ:**
```
User 1:
password="password" + salt="a1b2c3"
→ hash("passworda1b2c3") = "abc123..."

User 2:
password="password" + salt="x9y8z7"
→ hash("passwordx9y8z7") = "def456..."

→ Cùng password nhưng khác hash!
```

### 3.2. Cách thức hoạt động chi tiết

#### 3.2.1. Flow đầy đủ

**A. Quá trình ĐĂNG KÝ (Registration):**

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. User nhập password
   Input: "MySecurePass123"

2. Server generate random salt
   Salt: "a1b2c3d4e5f6g7h8" (16 bytes random)

   Code:
   const salt = await bcrypt.genSalt(12);
   // 12 = cost factor (số vòng lặp = 2^12 = 4096)

3. Combine password + salt
   Combined: "MySecurePass123" + "a1b2c3d4e5f6g7h8"

4. Apply hashing algorithm (bcrypt)
   Hash = bcrypt(combined, costFactor=12)

   Process:
   Round 1: hash1 = hash(combined)
   Round 2: hash2 = hash(hash1)
   Round 3: hash3 = hash(hash2)
   ...
   Round 4096: finalHash = hash(hash4095)

5. Store in database
   Format: "$2a$12$salthere...hashedpasswordhere"

   Structure:
   $2a     → bcrypt algorithm version
   $12     → cost factor (2^12 rounds)
   $salt   → 22-char base64-encoded salt
   $hash   → 31-char base64-encoded password hash

Example stored value:
"$2a$12$N9qo8uLOickgx2ZMRZoMye.PXH6jvYKc9TZYqC3F8LBzr4Ub8ZQSC"
```

**Code example từ đề tài:**

```javascript
// models/User.js
const bcrypt = require('bcryptjs');

userSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    // Generate salt (12 rounds = 2^12 = 4096 iterations)
    const salt = await bcrypt.genSalt(12);

    // Hash password with salt
    // bcrypt automatically combines password + salt
    this.password = await bcrypt.hash(this.password, 12);

    // Result format: "$2a$12$salthere...hashedpasswordhere"

    next();
  } catch (error) {
    next(error);
  }
});
```

**B. Quá trình ĐĂNG NHẬP (Login):**

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. User nhập password
   Input: "MySecurePass123"

2. Server lấy stored hash từ database
   Stored: "$2a$12$N9qo8uLOickgx2ZMRZoMye.PXH6jvYKc9TZYqC3F8LBzr4Ub8ZQSC"

3. Extract salt từ stored hash
   bcrypt.compare() tự động extract salt từ stored hash

   Salt extracted: "N9qo8uLOickgx2ZMRZoMye"
   (22 chars sau $12$)

4. Hash input password với extracted salt
   newHash = bcrypt(inputPassword, extractedSalt, costFactor=12)

5. So sánh hashes
   if (newHash === storedHash) {
     ✅ Password correct
   } else {
     ❌ Password incorrect
   }
```

**Code example:**

```javascript
// models/User.js
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // bcrypt.compare() automatically:
    // 1. Extracts salt from this.password
    // 2. Hashes candidatePassword with extracted salt
    // 3. Compares result with stored hash

    return await bcrypt.compare(candidatePassword, this.password);

    // Returns true if match, false otherwise
  } catch (error) {
    return false;
  }
};

// Usage in auth.service.js
const isPasswordCorrect = await user.comparePassword(inputPassword);

if (!isPasswordCorrect) {
  throw new Error('Email/Phone hoặc mật khẩu không đúng');
}
```

### 3.3. Phân tích vai trò của Salt

#### 3.3.1. Vấn đề khi KHÔNG có Salt

**Scenario 1: Rainbow Table Attack**

```
WITHOUT SALT:
Database:
User1: password="password" → hash="5f4dcc3b..."
User2: password="password" → hash="5f4dcc3b..." (SAME!)
User3: password="qwerty"   → hash="d8578edf..."

Rainbow Table (pre-computed):
"password" → "5f4dcc3b..."
"qwerty"   → "d8578edf..."
...

Attacker steals database:
→ Lookup "5f4dcc3b..." in rainbow table
→ Found: "password"
→ Can login as User1 AND User2! (BOTH use "password")

Attack time: < 1 second (instant lookup)
```

**Scenario 2: Duplicate Password Detection**

```
WITHOUT SALT:
User1: hash="5f4dcc3b..."
User2: hash="5f4dcc3b..."
User3: hash="d8578edf..."

Attacker can see:
→ User1 and User2 use SAME password
→ If attacker cracks User1's password → Also gets User2's password
→ Can target popular hashes (many users with same password)
```

#### 3.3.2. Giải pháp với Salt

**WITH SALT:**

```
Database:
User1: password="password" + salt="abc123"
       → hash="x1y2z3..." (UNIQUE)

User2: password="password" + salt="xyz789"
       → hash="p9q8r7..." (DIFFERENT from User1!)

User3: password="qwerty" + salt="mno456"
       → hash="k5j4h3..."

Rainbow Table attack:
→ Cannot use pre-computed tables
→ Must generate NEW table for each salt
→ 1 billion passwords × 1 billion salts = 10^18 combinations
→ Impossible to pre-compute!

Duplicate password detection:
→ User1 and User2 have DIFFERENT hashes
→ Attacker cannot tell they use same password
→ Must crack each hash individually
```

#### 3.3.3. Salt tăng cường bảo mật như thế nào?

**1. Ngăn chặn Rainbow Table:**

```
Rainbow Table size without salt:
- 1 billion common passwords
- MD5: 16 bytes/hash
- Total: 1 billion × 16 bytes = 16 GB

Rainbow Table size with 16-byte salt:
- 1 billion passwords × 2^128 possible salts
- Total: 1 billion × 340 undecillion combinations
- Storage: 5.4 × 10^21 GB (impossible!)

Conclusion: Rainbow tables become USELESS with salt
```

**2. Buộc attacker crack từng password riêng lẻ:**

```
WITHOUT SALT:
- Crack 1 password → Applies to ALL users with that password
- Crack 1000 popular passwords → Compromises 80% of users
- Attack efficiency: HIGH

WITH SALT:
- Crack 1 password → Only 1 user compromised
- Must crack EACH user's password individually
- Attack efficiency: LOW
```

**3. Thời gian tấn công:**

```
Crack 1 million accounts:

WITHOUT SALT + MD5:
- Create rainbow table once: 1 day
- Lookup all 1 million hashes: 1 second
- Total: 1 day

WITH SALT + bcrypt (12 rounds):
- Cannot use rainbow table
- Must brute-force each password individually
- 1 password: 100ms × 10 billion attempts = 31 years
- 1 million passwords: 31 million years

Conclusion: Salt makes attacks INFEASIBLE
```

### 3.4. Chi tiết về bcrypt

#### 3.4.1. Tại sao chọn bcrypt?

**So sánh với các thuật toán khác:**

| Algorithm | Type | Speed | Salt | Recommended |
|-----------|------|-------|------|-------------|
| **MD5** | Fast hash | 0.01ms | ❌ Manual | ❌ NEVER |
| **SHA-256** | Fast hash | 0.02ms | ❌ Manual | ❌ NO |
| **PBKDF2** | Slow hash | 100ms | ✅ Yes | ⚠️ OK |
| **bcrypt** | Slow hash | 100ms | ✅ Auto | ✅ YES |
| **scrypt** | Slow hash | 150ms | ✅ Yes | ✅ YES |
| **Argon2** | Slow hash | 120ms | ✅ Yes | ✅ BEST |

**bcrypt advantages:**
- ✅ **Adaptive:** Cost factor có thể tăng theo thời gian
- ✅ **Auto-salt:** Tự động generate và store salt
- ✅ **Widely supported:** Có library cho mọi ngôn ngữ
- ✅ **Battle-tested:** Dùng từ 1999, không có vulnerability nghiêm trọng

#### 3.4.2. Cost Factor

**Cost factor = số vòng lặp (rounds):**

```
Cost 10 = 2^10 = 1,024 rounds    → ~10ms
Cost 11 = 2^11 = 2,048 rounds    → ~20ms
Cost 12 = 2^12 = 4,096 rounds    → ~100ms ✅ (recommended)
Cost 13 = 2^13 = 8,192 rounds    → ~200ms
Cost 14 = 2^14 = 16,384 rounds   → ~400ms
```

**Chọn cost factor:**

```javascript
// Rule of thumb: Target 100-300ms per hash

// Year 2024: Cost 12 (100ms)
const salt = await bcrypt.genSalt(12);

// Year 2030: Hardware mạnh hơn → Tăng lên Cost 14
const salt = await bcrypt.genSalt(14);
```

**Tradeoff:**

```
Lower cost (10):
  ✅ Fast login (10ms)
  ❌ Easy to crack (faster brute-force)

Higher cost (14):
  ✅ Hard to crack (slower brute-force)
  ❌ Slow login (400ms) → Bad UX

Recommended (12):
  ✅ Good balance
  ✅ 100ms login (acceptable)
  ✅ 100ms × 10 billion attempts = 31 years to crack
```

#### 3.4.3. bcrypt internals

**Cấu trúc output:**

```
$2a$12$N9qo8uLOickgx2ZMRZoMye.PXH6jvYKc9TZYqC3F8LBzr4Ub8ZQSC
│││ │ │                      │                              │
│││ │ │                      │                              └─ Password hash (31 chars)
│││ │ │                      └────────────────────────────────── Salt (22 chars)
│││ │ └───────────────────────────────────────────────────────── Cost factor (12)
│││ └─────────────────────────────────────────────────────────── Algorithm identifier ($)
││└───────────────────────────────────────────────────────────── bcrypt version (2a)
│└────────────────────────────────────────────────────────────── Delimiter ($)
└─────────────────────────────────────────────────────────────── Delimiter ($)
```

**Process:**

```
1. Generate random salt (128 bits)
2. Derive key from password using Eksblowfish (bcrypt core algorithm)
   - Input: password + salt
   - Iterations: 2^cost (e.g., 4096 for cost=12)
   - Output: 192-bit hash
3. Encode salt + hash in base64
4. Format: $2a$cost$salt$hash
```

### 3.5. Best Practices

#### 3.5.1. DO's ✅

```javascript
// ✅ Use bcrypt with cost 12
const hash = await bcrypt.hash(password, 12);

// ✅ Let bcrypt generate salt automatically
// (Don't manually generate salt for bcrypt)

// ✅ Store full bcrypt output (includes salt)
user.password = hash; // "$2a$12$salt...hash"

// ✅ Use constant-time comparison
const isMatch = await bcrypt.compare(candidatePassword, storedHash);

// ✅ Increase cost factor over time
const CURRENT_COST = parseInt(process.env.BCRYPT_COST) || 12;

// ✅ Hash on server, never on client
// (Client-side hashing doesn't add security)
```

#### 3.5.2. DON'Ts ❌

```javascript
// ❌ NEVER use MD5 or SHA-256 for passwords
const hash = crypto.createHash('md5').update(password).digest('hex');

// ❌ NEVER store plaintext passwords
user.password = password; // NEVER DO THIS!

// ❌ NEVER use same salt for all users
const GLOBAL_SALT = "fixed_salt_for_everyone"; // BAD!

// ❌ NEVER send password in response
res.json({ user: user }); // user.password will be exposed!

// ✅ ALWAYS delete password before sending
const userResponse = user.toObject();
delete userResponse.password;
res.json({ user: userResponse });

// ❌ NEVER use weak cost factor
const hash = await bcrypt.hash(password, 4); // TOO WEAK!

// ❌ NEVER compare hashes with ===
if (inputHash === storedHash) { } // Timing attack vulnerable!
// ✅ Use bcrypt.compare() instead
```

### 3.6. Ví dụ thực tế từ đề tài

#### 3.6.1. Registration Flow

```javascript
// services/auth.service.js
static async register(userData) {
  const { email, phone, password, fullName } = userData;

  // 1. Kiểm tra email/phone đã tồn tại
  const existingUser = await User.findByEmailOrPhone(email || phone);
  if (existingUser) {
    throw new Error('Email hoặc số điện thoại đã được sử dụng');
  }

  // 2. Tạo user (password sẽ được hash tự động trong pre-save hook)
  const user = await User.create({
    email: email.toLowerCase(),
    phone,
    password,  // Plaintext password
    fullName,
  });

  // After User.create():
  // - pre-save hook chạy
  // - bcrypt.hash(password, 12) được gọi
  // - user.password = "$2a$12$salt...hash"
  // - Lưu vào database

  // 3. Password đã được hash trong DB
  console.log(user.password);
  // "$2a$12$N9qo8uLOickgx2ZMRZoMye.PXH6jvYKc9TZYqC3F8LBzr4Ub8ZQSC"

  return user;
}
```

#### 3.6.2. Login Flow

```javascript
// services/auth.service.js
static async login(identifier, password, rememberMe = false) {
  // 1. Tìm user và select password (default bị exclude)
  const user = await User.findByEmailOrPhone(identifier).select('+password');

  if (!user) {
    throw new Error('Email/Số điện thoại hoặc mật khẩu không đúng');
  }

  // 2. So sánh password
  const isPasswordCorrect = await user.comparePassword(password);

  // user.comparePassword() internals:
  // - Extract salt từ user.password
  // - Hash input password với extracted salt
  // - Compare hashes

  if (!isPasswordCorrect) {
    throw new Error('Email/Số điện thoại hoặc mật khẩu không đúng');
  }

  // 3. Password đúng → Generate tokens
  const accessToken = this.generateAccessToken(user, rememberMe);
  const refreshToken = this.generateRefreshToken(user, rememberMe);

  return { user, accessToken, refreshToken };
}
```

#### 3.6.3. Password Change Flow

```javascript
// controllers/user.controller.js
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // 1. Lấy user với password
  const user = await User.findById(req.user._id).select('+password');

  // 2. Verify current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return res.status(401).json({
      message: 'Mật khẩu hiện tại không đúng'
    });
  }

  // 3. Set new password (sẽ được hash tự động)
  user.password = newPassword;
  await user.save();

  // After save():
  // - pre-save hook chạy
  // - bcrypt.hash(newPassword, 12)
  // - user.password = new hash
  // - Lưu vào DB

  // 4. Invalidate all existing sessions (optional)
  await revokeAllRefreshTokens(user._id);

  res.json({
    message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.'
  });
};
```

### 3.7. Kết luận câu 3.3

**Tóm tắt:**

1. **Password Hashing:**
   - Chuyển password → chuỗi cố định độ dài
   - One-way function (không reverse được)
   - Dùng để so sánh, không phải decrypt

2. **Salt:**
   - Random string thêm vào password trước khi hash
   - Mỗi user có salt riêng (bcrypt auto-generate)
   - Ngăn chặn rainbow table attacks
   - Đảm bảo cùng password → khác hash

3. **bcrypt:**
   - Slow hashing algorithm (cost factor 12 = 4096 rounds)
   - Auto salt generation and storage
   - Adaptive (có thể tăng cost factor theo thời gian)
   - Industry standard cho password hashing

**Vai trò của Salt:**

| Mối đe dọa | Không có Salt | Có Salt |
|------------|---------------|---------|
| **Rainbow Table** | ❌ Vulnerable (instant crack) | ✅ Protected (tables useless) |
| **Duplicate Detection** | ❌ Attacker sees duplicates | ✅ All hashes unique |
| **Brute-force** | ❌ Crack once → All users | ✅ Must crack individually |
| **Dictionary** | ❌ Efficient | ⚠️ Less efficient |

**Best practice cho đề tài:**
```javascript
// ✅ Đang làm đúng:
- bcrypt với cost 12
- Auto salt generation
- Store full hash (includes salt)
- Compare với bcrypt.compare()
- Hash trên server
- Không return password trong response

// ⚠️ Có thể cải thiện:
- Tăng cost factor lên 14 (hardware năm 2024)
- Add pepper (application-wide secret)
- Implement password history (prevent reuse)
```

---

## KẾT LUẬN CHUNG

### Tóm tắt 3 câu hỏi

**Câu 3.1: So sánh phương pháp xác thực**
- Password: Chi phí thấp, phổ biến, bảo mật trung bình
- Token (JWT/OTP): Scalable, stateless, bảo mật cao
- Biometrics: Bảo mật cao nhất, chi phí cao, cần hardware
- **Recommendation:** Kết hợp Password + JWT + 2FA (OTP)

**Câu 3.2: Mối đe dọa và biện pháp**
- Brute-force: Rate limiting (5/15min)
- Dictionary: Password policy + blacklist
- Rainbow Table: Salt + bcrypt
- Phishing: 2FA + User education
- Credential Stuffing: Breach detection + Rate limit
- **Key defense:** Multi-layered security (Defense in Depth)

**Câu 3.3: Hashed password và Salt**
- Hash: One-way transformation (password → fixed-length string)
- Salt: Random value per user, prevents rainbow tables
- bcrypt: Auto-salt, slow hashing (cost 12 = 100ms)
- **Salt role:** Makes rainbow tables useless, forces individual cracking

### Áp dụng vào đề tài

**Đã triển khai tốt:**
- ✅ bcrypt với cost 12 (auto salt)
- ✅ JWT authentication (stateless, scalable)
- ✅ Rate limiting (5/15min login, 100/min global)
- ✅ Password policy (min 6 chars, mixed case + numbers)
- ✅ HTTPS (production)
- ✅ Session timeout (30 minutes)

**Cần cải thiện:**
- ⚠️ Password blacklist (top 10,000 common passwords)
- ⚠️ Breach detection API (HaveIBeenPwned)
- ⚠️ 2FA mandatory for payments (hiện tại optional)
- ⚠️ Device fingerprinting
- ⚠️ Anomaly detection (unusual login patterns)

### Bài học rút ra

1. **Không có silver bullet:** Cần kết hợp nhiều biện pháp
2. **Defense in Depth:** Nhiều lớp bảo vệ > 1 lớp mạnh
3. **User education:** Technical measures không đủ, cần educate users
4. **Balance:** Security ↔ UX ↔ Cost
5. **Evolve:** Threats evolve → Defenses must evolve too

---

## TÀI LIỆU THAM KHẢO

1. **OWASP Password Storage Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
2. **NIST SP 800-63B:** Digital Identity Guidelines - Authentication
3. **bcrypt specification:** https://en.wikipedia.org/wiki/Bcrypt
4. **HaveIBeenPwned API:** https://haveibeenpwned.com/API/v3
5. **OWASP Authentication Cheat Sheet:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

**HẾT TÀI LIỆU**

**Sinh viên:** [Họ và tên]
**Ngày nộp:** [DD/MM/YYYY]

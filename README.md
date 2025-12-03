# Vé Xe Nhanh - Hệ Thống Đặt Vé Xe Khách Trực Tuyến

Nền tảng đặt vé xe khách hiện đại, nhanh chóng và tiện lợi. Kết nối khách hàng với các nhà xe, tạo nên trải nghiệm đặt vé trực tuyến tuyệt vời.

---

## Mục Lục

- [Tổng Quan](#tổng-quan)
- [Kiến Trúc Hệ Thống](#kiến-trúc-hệ-thống)
- [Tính Năng Chính](#tính-năng-chính)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Lộ Trình Phát Triển](#lộ-trình-phát-triển)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Tài Liệu API](#tài-liệu-api)
- [Sơ Đồ Database](#sơ-đồ-database)
- [Kiểm Thử](#kiểm-thử)
- [Triển Khai](#triển-khai)
- [Bảo Mật](#bảo-mật)
- [Hiệu Năng](#hiệu-năng)
- [Xử Lý Sự Cố](#xử-lý-sự-cố)
- [Đóng Góp](#đóng-góp)
- [Giấy Phép](#giấy-phép)

---

## Tổng Quan

**Vé Xe Nhanh** là một hệ thống đặt vé xe khách trực tuyến toàn diện, được xây dựng theo kiến trúc hiện đại, cho phép:

- Khách hàng: Tìm kiếm, đặt vé và thanh toán dễ dàng 24/7
- Vé điện tử: Quản lý vé với mã QR an toàn, chống giả mạo
- Nhà xe: Quản lý tuyến đường, lịch trình, doanh thu một cách hiệu quả
- Quản lý chuyến: Soát vé điện tử, quản lý hành khách real-time
- Admin hệ thống: Giám sát và quản trị tổng thể nền tảng

### Giải Pháp Cho Các Vấn Đề

#### Quy trình cũ
- Phải đến trực tiếp bến xe để đặt vé
- Không biết trước ghế còn trống
- Vé giấy dễ mất mát, giả mạo
- Khó quản lý, đối soát thủ công
- Tốn thời gian 15-30 phút/lần

#### Quy trình mới
- Đặt vé online mọi lúc, mọi nơi
- Xem tức thời ghế còn trống
- Vé điện tử với mã QR an toàn
- Quản lý tự động, báo cáo thời gian thực
- Chỉ mất 3-5 phút hoàn tất

---

## Kiến Trúc Hệ Thống

### Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Customer  │  │ Operator  │  │   Trip    │  │  System   │  │
│  │    Web    │  │  Dashboard│  │  Manager  │  │   Admin   │  │
│  │           │  │           │  │    Web    │  │ Dashboard │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  │
│        │              │              │              │         │
│        └──────────────┴──────────────┴──────────────┘         │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
                    ┌───────▼──────┐
                    │   CDN/Nginx  │
                    │ Load Balancer│
                    └───────┬──────┘
                            │
┌───────────────────────────┼────────────────────────────────────┐
│                      API GATEWAY                               │
│                   (Express + JWT Auth)                         │
└───────────────────────────┬────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐   ┌─────▼──────┐
│   Business   │   │   Notification  │   │  Payment   │
│    Logic     │   │     Service     │   │  Gateway   │
│              │   │  (Email/SMS)    │   │ Integration│
└───────┬──────┘   └────────┬────────┘   └─────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐   ┌─────▼──────┐
│   MongoDB    │   │     Redis       │   │  File      │
│   Database   │   │  Cache/Queue    │   │  Storage   │
│              │   │                 │   │(Cloudinary)│
└──────────────┘   └─────────────────┘   └────────────┘
```

### 4 Trang Web Riêng Biệt

Hệ thống được chia thành **4 ứng dụng web độc lập**:

#### 1. Trang Khách Hàng (Customer Web)
- **Địa chỉ:** `https://vexenhanh.com`
- **Mục đích:** Tìm kiếm và đặt vé cho khách hàng
- **Tính năng:**
  - Tìm kiếm chuyến xe
  - Đặt vé và thanh toán trực tuyến
  - Quản lý vé cá nhân
  - Đánh giá và nhận xét
  - Tích lũy điểm thưởng
- **Đăng nhập:** Email/Số điện thoại + Mật khẩu, hoặc qua Google, Facebook

#### 2. Trang Nhà Xe (Operator Dashboard)
- **Địa chỉ:** `https://operator.vexenhanh.com`
- **Mục đích:** Quản lý hoạt động kinh doanh của nhà xe
- **Tính năng:**
  - Bảng điều khiển doanh thu thời gian thực
  - Quản lý tuyến đường và xe
  - Tạo lịch trình chuyến xe
  - Quản lý nhân viên
  - Báo cáo chi tiết
  - Quản lý phiếu giảm giá và khuyến mãi
- **Đăng nhập:** Email doanh nghiệp + Mật khẩu (riêng biệt)

#### 3. Trang Quản Lý Chuyến (Trip Manager Web)
- **Địa chỉ:** `https://trip.vexenhanh.com`
- **Mục đích:** Soát vé và quản lý hành khách
- **Tính năng:**
  - Quét mã QR xác thực vé
  - Danh sách hành khách thời gian thực
  - Đánh dấu đã lên xe
  - Cập nhật trạng thái chuyến
  - Thống kê tỉ lệ lấp đầy
- **Đăng nhập:** Mã nhân viên + Mật khẩu (riêng biệt)

#### 4. Trang Quản Trị Hệ Thống (System Admin)
- **Địa chỉ:** `https://admin.vexenhanh.com`
- **Mục đích:** Quản trị và giám sát toàn hệ thống
- **Tính năng:**
  - Bảng điều khiển tổng quan hệ thống
  - Quản lý người dùng và nhà xe
  - Duyệt đăng ký nhà xe
  - Quản lý nội dung (banner, blog, câu hỏi thường gặp)
  - Xử lý khiếu nại
  - Báo cáo và phân tích
- **Đăng nhập:** Tài khoản quản trị (bảo mật cao)

---

## Tính Năng Chính

### Dành cho Khách Hàng

#### Tìm Kiếm & Đặt Vé
- Tìm kiếm chuyến xe theo tuyến, ngày giờ với bộ lọc
- So sánh nhiều nhà xe, giá vé, tiện ích
- Xem sơ đồ ghế thời gian thực (ghế trống/đã đặt)
- Chọn tối đa 6 ghế mỗi lần đặt
- Giữ ghế tạm thời 15 phút khi đang đặt
- Nhập thông tin hành khách chi tiết
- Chọn điểm đón và điểm trả linh hoạt

#### Thanh Toán
- Đa dạng phương thức thanh toán:
  - Ví điện tử: MoMo, VNPay, ZaloPay, ShopeePay
  - Thẻ ATM nội địa
  - Thẻ quốc tế: Visa, Mastercard, JCB
  - Chuyển khoản ngân hàng
  - Thanh toán khi lên xe
- Áp dụng mã phiếu giảm giá
- Bảo mật tuân thủ tiêu chuẩn PCI-DSS
- Hoàn tiền tự động khi thanh toán thất bại

#### Vé Điện Tử
- Nhận vé điện tử dạng PDF qua email
- Mã QR chứa thông tin mã hóa
- Gửi qua email và tin nhắn
- Lưu lịch sử vé trong tài khoản
- Tải vé bất kỳ lúc nào

#### Quản Lý Vé
- Xem danh sách vé: sắp tới, đã đi, đã hủy
- Tìm kiếm vé theo mã, ngày, tuyến
- Hủy vé theo chính sách (hoàn tiền tự động)
- Đổi vé sang chuyến khác (tính chênh lệch)
- Thông báo nhắc nhở trước giờ xuất bến

#### Khác
- Đánh giá và nhận xét chuyến đi (1-5 sao)
- Tích lũy điểm thưởng mỗi chuyến
- Hạng thành viên: Đồng, Bạc, Vàng, Bạch Kim
- Lưu danh sách hành khách thường đi
- Xem lịch sử đặt vé và giao dịch

---

### Dành cho Nhà Xe

#### Bảng Điều Khiển & Phân Tích
- Bảng điều khiển thời gian thực:
  - Tổng doanh thu (ngày/tuần/tháng/năm)
  - Số vé đã bán
  - Tỷ lệ lấp đầy trung bình
  - Biểu đồ xu hướng
- Báo cáo chi tiết:
  - Doanh thu theo tuyến
  - Tuyến đường phổ biến nhất
  - Tỷ lệ hủy vé
  - Xuất file Excel/PDF

#### Quản Lý Tuyến & Xe
- Quản lý tuyến đường:
  - Tạo/sửa/xóa tuyến
  - Thiết lập điểm đi, đến, điểm dừng
  - Khoảng cách và thời gian dự kiến
  - Tích hợp Google Maps
- Quản lý xe:
  - Thêm/sửa/xóa xe (biển số, loại xe)
  - Thiết lập sơ đồ ghế linh hoạt (1-2 tầng)
  - Cấu hình tiện ích xe (WiFi, điều hòa, nhà vệ sinh...)
  - Trạng thái xe (hoạt động/bảo trì)

#### Lịch Trình & Định Giá
- Tạo lịch trình chuyến xe:
  - Chọn tuyến, xe, tài xế, quản lý chuyến
  - Giờ đi, giờ đến dự kiến
  - Sao chép lịch trình định kỳ
  - Hủy/sửa chuyến
- Quản lý giá vé:
  - Thiết lập bảng giá linh hoạt
  - Điều chỉnh giá theo nhu cầu
  - Tạo mã phiếu giảm giá
  - Thiết lập điều kiện áp dụng

#### Quản Lý Nhân Viên
- Quản lý nhân viên:
  - Thêm tài xế, quản lý chuyến
  - Phân quyền truy cập
  - Xem lịch trình làm việc
  - Theo dõi tình trạng (hoạt động/không hoạt động)

---

### Dành cho Quản Lý Chuyến

#### Soát Vé Điện Tử
- Quét mã QR:
  - Mở camera hoặc tải ảnh lên
  - Tự động giải mã và xác thực
  - Kiểm tra vé: hợp lệ, đúng chuyến, chưa sử dụng
  - Hiển thị thông tin hành khách đầy đủ
- Xác nhận lên xe:
  - Đánh dấu vé đã sử dụng
  - Không thể quét lại vé đã dùng
  - Cập nhật danh sách thời gian thực

#### Quản Lý Hành Khách
- Danh sách hành khách:
  - Xem tất cả hành khách của chuyến
  - Phân biệt: đã lên xe / chưa lên xe
  - Tìm kiếm theo tên, ghế, SĐT
  - Thống kê: đã lên/tổng số
- Cập nhật trạng thái chuyến:
  - Chưa bắt đầu → Đang diễn ra → Hoàn thành
  - Thông báo tự động cho hành khách

---

### Dành cho Quản Trị Hệ Thống

#### Quản Lý Người Dùng & Nhà Xe
- Quản lý người dùng:
  - Xem danh sách tất cả người dùng
  - Tìm kiếm, lọc, phân trang
  - Khóa/mở khóa tài khoản
  - Đặt lại mật khẩu
- Duyệt nhà xe:
  - Xem yêu cầu đăng ký nhà xe mới
  - Kiểm tra giấy tờ (giấy phép kinh doanh, mã số thuế)
  - Phê duyệt/từ chối
  - Tạm ngưng/khôi phục nhà xe

#### Quản Lý Nội Dung
- Quản lý nội dung:
  - Tải lên và quản lý banner
  - Thêm/sửa/xóa bài viết blog
  - Quản lý câu hỏi thường gặp
  - Cài đặt tối ưu hóa công cụ tìm kiếm

#### Hỗ Trợ & Phân Tích
- Xử lý khiếu nại:
  - Hệ thống phiếu hỗ trợ
  - Phân loại và ưu tiên
  - Phân công cho nhân viên
  - Theo dõi tiến độ
- Báo cáo tổng hợp:
  - Bảng điều khiển hệ thống
  - Chỉ số tăng trưởng
  - Tuyến đường/nhà xe hàng đầu
  - Phân tích doanh thu

---

## Công Nghệ Sử Dụng

### Công Nghệ Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|---------|----------|
| React | 18.2.0 | Thư viện giao diện người dùng |
| Vite | 5.0.0 | Công cụ build nhanh |
| Tailwind CSS | 3.3.5 | Framework CSS tiện ích |
| Ant Design | 5.11.0 | Thành phần giao diện doanh nghiệp |
| Zustand | 4.4.6 | Quản lý trạng thái nhẹ |
| React Router | 6.20.0 | Định tuyến phía client |
| Axios | 1.6.0 | Thư viện HTTP |
| Socket.IO Client | 4.6.0 | Giao tiếp thời gian thực |
| QRCode.react | 3.1.0 | Tạo mã QR |
| Day.js | 1.11.10 | Thao tác ngày tháng |
| React Hot Toast | 2.4.1 | Thông báo |

### Công Nghệ Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|---------|----------|
| Node.js | ≥18.0.0 | Môi trường chạy JavaScript |
| Express | 4.18.2 | Framework web |
| MongoDB | ≥6.0 | Cơ sở dữ liệu NoSQL |
| Mongoose | 8.0.0 | Công cụ ODM cho MongoDB |
| Redis | ≥6.0 | Bộ nhớ đệm và lưu phiên |
| JWT | 9.0.2 | Token xác thực |
| bcryptjs | 2.4.3 | Mã hóa mật khẩu |
| Helmet | 7.1.0 | Tiêu đề bảo mật |
| CORS | 2.8.5 | Chia sẻ tài nguyên liên nguồn |
| Express Validator | 7.0.1 | Xác thực đầu vào |
| Rate Limit | 7.1.0 | Giới hạn tốc độ API |
| Nodemailer | 6.9.7 | Gửi email |
| Socket.IO | 4.6.0 | Máy chủ WebSocket |
| PDFKit | 0.13.0 | Tạo file PDF |
| QRCode | 1.5.3 | Tạo mã QR |
| Winston | 3.11.0 | Hệ thống ghi nhật ký |

### Dịch Vụ Bên Thứ Ba

| Dịch vụ | Mục đích |
|---------|---------|
| VNPay, MoMo, ZaloPay | Cổng thanh toán |
| SendGrid / AWS SES | Dịch vụ email giao dịch |
| VNPT SMS / Viettel SMS | Thông báo tin nhắn (OTP, cảnh báo) |
| Cloudinary | Tải lên hình ảnh/file và CDN |
| Google Maps API | Mã hóa địa lý và bản đồ |
| Google/Facebook OAuth | Đăng nhập mạng xã hội |

### Công Cụ Vận Hành & Hạ Tầng

| Công cụ | Mục đích |
|------|---------|
| Docker | Đóng gói container |
| Docker Compose | Điều phối nhiều container |
| GitHub Actions | Đường ống CI/CD |
| Nginx | Máy chủ proxy ngược và web |
| CloudFlare | CDN và bảo vệ DDoS |
| AWS/Azure/GCP | Lưu trữ đám mây |
| MongoDB Atlas | MongoDB được quản lý (tùy chọn) |
| Redis Cloud | Redis được quản lý (tùy chọn) |

---

## Cấu Trúc Dự Án

```
Ve_Xe_Nhanh/
│
├── backend/                          # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/              # Request handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── operator.controller.js
│   │   │   ├── route.controller.js
│   │   │   ├── bus.controller.js
│   │   │   ├── trip.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── models/                   # MongoDB Schemas
│   │   │   ├── User.js
│   │   │   ├── BusOperator.js
│   │   │   ├── Route.js
│   │   │   ├── Bus.js
│   │   │   ├── Trip.js
│   │   │   ├── Booking.js
│   │   │   ├── Ticket.js
│   │   │   ├── Payment.js
│   │   │   ├── Review.js
│   │   │   ├── Voucher.js
│   │   │   └── Employee.js
│   │   │
│   │   ├── routes/                   # API Routes
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── operator.routes.js
│   │   │   ├── trip.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── ticket.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── middleware/               # Express Middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── morgan.middleware.js
│   │   │
│   │   ├── services/                 # Business Logic
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   ├── sms.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── qr.service.js
│   │   │   ├── pdf.service.js
│   │   │   └── seat.service.js
│   │   │
│   │   ├── utils/                    # Utilities
│   │   │   ├── logger.js
│   │   │   ├── logHelpers.js
│   │   │   ├── constants.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   │
│   │   ├── config/                   # Configuration
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   ├── cloudinary.js
│   │   │   └── payment.js
│   │   │
│   │   └── server.js                 # Entry point
│   │
│   ├── tests/                        # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── logs/                         # Log files
│   │   ├── application-YYYY-MM-DD.log
│   │   ├── error-YYYY-MM-DD.log
│   │   └── exceptions-YYYY-MM-DD.log
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/                         # Frontend React + Vite
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── common/
│   │   │   ├── search/
│   │   │   ├── booking/
│   │   │   └── dashboard/
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── customer/
│   │   │   ├── operator/
│   │   │   ├── trip-manager/
│   │   │   ├── admin/
│   │   │   └── auth/
│   │   │
│   │   ├── services/                 # API Services
│   │   ├── store/                    # State Management
│   │   ├── hooks/                    # Custom React Hooks
│   │   ├── utils/                    # Utilities
│   │   ├── assets/                   # Static assets
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── docs/                             # Documentation
│   ├── PROJECT_PHASES.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── .gitignore
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## Lộ Trình Phát Triển

Dự án được chia thành **7 giai đoạn (phases)** phát triển, từ setup cơ bản đến các tính năng nâng cao:

### Tổng Quan Phases

| Phase | Tên | Thời gian | Độ ưu tiên | Trạng thái |
|-------|-----|-----------|------------|------------|
| Phase 1 | Setup & Core Infrastructure | 2 tuần | Cao | Hoàn thành |
| Phase 2 | Route & Bus Management | 2 tuần | Cao | Đang thực hiện |
| Phase 3 | Booking System | 3 tuần | Cao | Chưa bắt đầu |
| Phase 4 | Ticket Management | 2 tuần | Cao | Chưa bắt đầu |
| Phase 5 | Bus Operator Admin | 2 tuần | Trung bình | Chưa bắt đầu |
| Phase 6 | System Admin | 1.5 tuần | Trung bình | Chưa bắt đầu |
| Phase 7 | Additional Features & Polish | 2 tuần | Thấp | Chưa bắt đầu |

**Tổng thời gian dự kiến:** ~14.5 tuần (≈ 3.5 tháng)

### Sản Phẩm Khả Thi Tối Thiểu (MVP)
MVP bao gồm giai đoạn 1-4, cho phép hệ thống hoạt động cơ bản với đầy đủ chức năng cốt lõi:
- Đăng ký, đăng nhập
- Tìm kiếm và đặt vé
- Thanh toán trực tuyến
- Vé điện tử với QR
- Quản lý tuyến, xe, lịch trình

Chi tiết đầy đủ: Xem [docs/PROJECT_PHASES.md](docs/PROJECT_PHASES.md)

---

## Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

#### Yêu Cầu Phần Mềm
- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0 (hoặc yarn >= 1.22.0)
- **MongoDB:** >= 6.0
- **Redis:** >= 6.0
- **Git:** >= 2.30.0

#### Yêu Cầu Phần Cứng (Phát Triển)
- **RAM:** >= 8GB (khuyến nghị 16GB)
- **Bộ nhớ:** >= 10GB còn trống
- **CPU:** Dual-core 2GHz trở lên

### Các Bước Cài Đặt

#### 1. Sao Chép Mã Nguồn

```bash
git clone https://github.com/yourusername/Ve_Xe_Nhanh.git
cd Ve_Xe_Nhanh
```

#### 2. Thiết Lập Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
nano .env
```

**Cấu hình .env quan trọng:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/vexenhanh

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Payment Gateways
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
```

**Chạy Backend:**
```bash
# Development mode (with nodemon auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test
```

Backend sẽ chạy tại: `http://localhost:5500`

#### 3. Thiết Lập Frontend

**Chạy Backend:**
```bash
# Di chuyển vào thư mục frontend (từ root)
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env
nano .env
```

**Cấu hình .env:**
```env
# API URL
VITE_API_URL=http://localhost:5500/api/v1

# WebSocket URL
VITE_WS_URL=ws://localhost:5500
```

**Chạy Frontend:**
```bash
# Development mode (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Frontend sẽ chạy tại: `http://localhost:3000`

#### 4. Thiết Lập Cơ Sở Dữ Liệu

**MongoDB:**
```bash
# Start MongoDB service (Ubuntu/Debian)
sudo systemctl start mongod

# Hoặc nếu dùng Docker
docker run -d -p 27017:27017 --name mongodb mongo:6

# Verify connection
mongosh
```

**Redis:**
```bash
# Start Redis service
sudo systemctl start redis

# Hoặc nếu dùng Docker
docker run -d -p 6379:6379 --name redis redis:6

# Verify connection
redis-cli ping
# Should return: PONG
```

#### 5. Nạp Dữ Liệu Mẫu (Tùy Chọn)

```bash
cd backend
npm run seed
```

### Thiết Lập Docker (Khuyến Nghị Cho Môi Trường Sản Xuất)

```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild sau khi thay đổi code
docker-compose up -d --build
```

---

## Tài Liệu API

### API Base URL
```
Development: http://localhost:5500/api/v1
Production:  https://api.vexenhanh.com/v1
```

### Tài Liệu Swagger/OpenAPI
Truy cập tại: `http://localhost:5500/api-docs`

### Xác Thực
Hầu hết các điểm cuối API yêu cầu xác thực bằng JWT token:

```bash
# Header format
Authorization: Bearer <your_jwt_token>
```

### Ví Dụ API

#### 1. Đăng Ký User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "0901234567",
  "password": "SecurePass123",
  "fullName": "Nguyen Van A"
}
```

#### 2. Đăng Nhập
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### 3. Tìm Kiếm Chuyến Xe
```bash
GET /api/v1/trips/search?from=Ha Noi&to=Da Nang&date=2024-01-15
```

#### 4. Tạo Booking
```bash
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "tripId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "seats": ["A1", "A2"],
  "passengers": [
    {
      "fullName": "Nguyen Van A",
      "phone": "0901234567",
      "idCard": "001234567890"
    }
  ],
  "pickupPoint": "Ben xe Luong Yen",
  "dropoffPoint": "Ben xe Da Nang",
  "email": "user@example.com"
}
```

Chi tiết đầy đủ: Xem [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## Sơ Đồ Database

Hệ thống sử dụng MongoDB với các collections chính:

### Các Collection Chính

1. **users** - Khách hàng
2. **busoperators** - Nhà xe
3. **routes** - Tuyến đường
4. **buses** - Phương tiện
5. **trips** - Lịch trình chuyến xe
6. **bookings** - Đặt vé
7. **tickets** - Vé điện tử
8. **payments** - Thanh toán
9. **reviews** - Đánh giá
10. **vouchers** - Mã giảm giá
11. **employees** - Nhân viên

### Sơ Đồ Schema
```
users ────┐
          ├──> bookings ───> tickets ───> payments
trips ────┘                    │
  │                            └──> reviews
  ├── routes
  ├── buses
  ├── busoperators
  └── employees
```

Chi tiết đầy đủ: Xem [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

---

## Kiểm Thử

### Kiểm Thử Backend

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js

# Watch mode
npm run test:watch
```

**Mục Tiêu Độ Phủ Kiểm Thử:** ≥ 70%

### Kiểm Thử Frontend

```bash
cd frontend

# Run all tests
npm test

# Run with UI
npm run test:ui

# Coverage
npm run test:coverage
```

### Kiểm Thử End-to-End (Cypress)

```bash
# Install Cypress
npm install cypress --save-dev

# Open Cypress
npx cypress open

# Run headless
npx cypress run
```

---

## Triển Khai

### Danh Sách Kiểm Tra Sản Xuất

- [ ] Biến môi trường đã được cấu hình
- [ ] Chỉ mục MongoDB đã được tạo
- [ ] Redis đã được cấu hình
- [ ] Chứng chỉ SSL đã được cài đặt
- [ ] CORS đã được cấu hình đúng
- [ ] Giới hạn tốc độ đã được bật
- [ ] Công cụ giám sát đã được thiết lập
- [ ] Chiến lược sao lưu đã có
- [ ] CDN đã được cấu hình (CloudFlare)
- [ ] DNS tên miền đã được cấu hình

### Các Tùy Chọn Triển Khai

#### Tùy Chọn 1: Docker (Khuyến Nghị)

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Tùy Chọn 2: Triển Khai Thủ Công

**Backend (PM2):**
```bash
npm install -g pm2
cd backend
npm run build
pm2 start npm --name "vexenhanh-api" -- start
pm2 save
pm2 startup
```

**Frontend (Nginx):**
```bash
cd frontend
npm run build
# Copy dist/ to /var/www/vexenhanh
sudo cp -r dist/* /var/www/vexenhanh/
```

#### Tùy Chọn 3: Nền Tảng Đám Mây

- **Heroku:** `git push heroku main`
- **Vercel:** Triển khai Frontend
- **AWS:** EC2 + RDS + ElastiCache
- **Google Cloud:** App Engine + Cloud SQL
- **Azure:** App Service + Cosmos DB

Chi tiết: Xem [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

#### 2. Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

## Bảo Mật

### Các Biện Pháp Bảo Mật Đã Triển Khai

#### Xác Thực & Phân Quyền
- JWT token có thời hạn
- Mã hóa mật khẩu bcrypt (12 vòng)
- OAuth 2.0 (Google, Facebook)
- Kiểm soát truy cập dựa trên vai trò
- Quản lý phiên (hết hạn 30 phút)
- Xác thực OTP (Email/SMS)

#### Bảo Mật API
- Mã hóa HTTPS/TLS 1.3
- Tiêu đề bảo mật Helmet.js
- CORS được cấu hình đúng
- Giới hạn tốc độ (100 yêu cầu/phút/IP)
- Xác thực đầu vào (express-validator)
- Phòng chống SQL injection (Mongoose)
- Bảo vệ XSS
- Token CSRF

#### Bảo Mật Thanh Toán
- Tuân thủ PCI-DSS
- Không lưu trữ thẻ tín dụng
- Mã hóa cổng thanh toán
- Ghi nhật ký giao dịch

#### Bảo Vệ Dữ Liệu
- Mã hóa dữ liệu nhạy cảm
- Ẩn danh dữ liệu cá nhân
- Sẵn sàng tuân thủ GDPR
- Sao lưu định kỳ

### Thực Hành Bảo Mật Tốt Nhất

```bash
# 1. Update dependencies regularly
npm audit
npm audit fix

# 2. Environment variables security
# Never commit .env files
# Use strong secrets (min 32 chars)

# 3. HTTPS only in production
# Configure SSL certificates

# 4. Monitor logs for suspicious activity
# Use tools like Sentry, LogRocket
```

---

## Hiệu Năng

### Tối Ưu Hóa Hiệu Năng

#### Backend
- Đánh chỉ mục cơ sở dữ liệu cho truy vấn thường xuyên
- Bộ nhớ đệm Redis (tình trạng ghế, phiên)
- Gộp kết nối (MongoDB, Redis)
- Tối ưu hóa truy vấn (giới hạn, chọn trường)
- Phân trang cho tập dữ liệu lớn
- Nén dữ liệu (gzip)
- CDN cho tài nguyên tĩnh (CloudFlare)

#### Frontend
- Chia tách mã (React.lazy, Suspense)
- Tải hình ảnh lười biếng
- Ghi nhớ (React.memo, useMemo)
- Cuộn ảo cho danh sách dài
- Debouncing đầu vào tìm kiếm
- Service Worker (PWA)
- Tối ưu hóa tài nguyên (hình ảnh, font)

### Mục Tiêu Hiệu Năng

| Chỉ số | Mục tiêu | Hiện tại |
|--------|--------|---------|
| Thời gian tải trang | ≤ 2s | 1.8s |
| Thời gian phản hồi API | ≤ 200ms | 150ms |
| Truy vấn tìm kiếm | ≤ 3s | 2.5s |
| Xử lý thanh toán | ≤ 5s | 4s |
| Thời gian hoạt động | ≥ 99.9% | 99.95% |

### Công Cụ Giám Sát
- **New Relic** - Giám sát hiệu năng ứng dụng
- **Google Analytics** - Phân tích người dùng
- **Sentry** - Theo dõi lỗi
- **Prometheus + Grafana** - Số liệu

---

## Xử Lý Sự Cố

### Các Vấn Đề Thường Gặp

#### 1. Kết Nối MongoDB Thất Bại
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection string
echo $MONGODB_URI
```

#### 2. Kết Nối Redis Thất Bại
```bash
# Check Redis status
redis-cli ping

# Start Redis
sudo systemctl start redis
```

#### 3. Cổng Đang Được Sử Dụng
```bash
# Find process using port 5500
lsof -i :5500

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5501
```

#### 4. Frontend Không Thể Kết Nối Backend
- Kiểm tra cấu hình CORS trong backend
- Xác minh VITE_API_URL trong frontend .env
- Kiểm tra backend có đang chạy không

#### 5. Lỗi Cổng Thanh Toán
- Xác minh khóa API trong .env
- Kiểm tra URL callback
- Xem lại nhật ký cổng thanh toán

### Chế Độ Debug

```bash
# Backend debug mode
DEBUG=* npm run dev

# Frontend debug mode
VITE_DEBUG=true npm run dev
```

### Vị Trí Nhật Ký

```bash
# Backend logs
tail -f backend/logs/application-YYYY-MM-DD.log

# PM2 logs
pm2 logs vexenhanh-api

# Docker logs
docker logs vexenhanh-backend
```

---

## Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng!

### Cách Đóng Góp

1. **Fork** kho mã nguồn
2. **Sao chép** fork của bạn:
   ```bash
   git clone https://github.com/your-username/Ve_Xe_Nhanh.git
   ```
3. **Tạo branch** mới:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Commit** changes:
   ```bash
   git commit -m "Add amazing feature"
   ```
5. **Push** to branch:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Tạo Pull Request**

### Tiêu Chuẩn Viết Mã

- **JavaScript:** ESLint + Hướng dẫn phong cách Airbnb
- **React:** Thành phần hàm, hooks
- **Git Commit:** Conventional Commits
  ```
  feat: thêm tính năng mới
  fix: sửa lỗi
  docs: cập nhật tài liệu
  style: định dạng, thiếu dấu chấm phẩy, v.v.
  refactor: tái cấu trúc mã
  test: thêm kiểm thử
  chore: bảo trì
  ```

### Quy Trình Đánh Giá Mã

1. Tất cả PR phải được đánh giá bởi ≥ 2 thành viên
2. Kiểm thử CI/CD phải pass
3. Độ phủ mã không giảm
4. Tuân thủ tiêu chuẩn viết mã

Chi tiết: Xem [CONTRIBUTING.md](CONTRIBUTING.md)

---

## Giấy Phép

Dự án này được phát hành dưới **MIT License**.

```
MIT License

Copyright (c) 2024 Vé Xe Nhanh Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Nhóm Phát Triển

### Nhóm Cốt Lõi

| Vai trò | Tên | GitHub | Email |
|---------|-----|--------|-------|
| Trưởng dự án | [Tên của bạn] | [@username](https://github.com/username) | email@example.com |
| Trưởng Backend | [Tên] | [@username](https://github.com/username) | email@example.com |
| Trưởng Frontend | [Tên] | [@username](https://github.com/username) | email@example.com |
| DevOps | [Tên] | [@username](https://github.com/username) | email@example.com |
| Trưởng QA | [Tên] | [@username](https://github.com/username) | email@example.com |

### Người Đóng Góp

Cảm ơn tất cả contributors đã giúp Vé Xe Nhanh trở nên tốt hơn!

---

## Liên Hệ & Hỗ Trợ

### Kênh Hỗ Trợ

- Email: support@vexenhanh.com
- Website: https://vexenhanh.com
- Hotline: 1900-0000 (8:00 - 22:00 hàng ngày)
- Báo Lỗi: [GitHub Issues](https://github.com/yourusername/Ve_Xe_Nhanh/issues)

### Mạng Xã Hội

- Facebook: [@VeXeNhanhVN](https://facebook.com/vexenhanhvn)
- Instagram: [@vexenhanh.vn](https://instagram.com/vexenhanh.vn)
- Twitter: [@VeXeNhanhVN](https://twitter.com/vexenhanhvn)
- LinkedIn: [Vé Xe Nhanh](https://linkedin.com/company/vexenhanh)

---

## Lời Cảm Ơn

Dự án này được xây dựng dựa trên các công nghệ và thư viện mã nguồn mở tuyệt vời:

- React - Thư viện giao diện người dùng
- Node.js - Môi trường chạy JavaScript
- Express - Framework web
- MongoDB - Cơ sở dữ liệu
- Redis - Bộ nhớ đệm
- Ant Design - Thành phần giao diện
- Tailwind CSS - Framework CSS
- Winston - Hệ thống ghi nhật ký

Cảm ơn tất cả những người bảo trì và đóng góp cho các dự án trên!

---

**Được tạo với tình yêu bởi Đội Ngũ Vé Xe Nhanh**

Nếu bạn thấy dự án này hữu ích, hãy cho chúng tôi một ⭐️!

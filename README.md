# Ve_Xe_Nhanh - Online Bus Ticket Booking System

**Ve_Xe_Nhanh** là một nền tảng trực tuyến toàn diện để đặt vé xe buýt, kết nối hành khách với các nhà điều hành xe buýt trên khắp Việt Nam.

## 📋 Table of Contents

- [Tính năng](#-Tính-năng)
- [Công nghệ sử dụng](#-tech-stack)
- [Cấu trúc dự án](#-project-structure)
- [Yêu cầu trước khi cài đặt](#-prerequisites)
- [Hướng dẫn cài đặt](#-installation)
- [Chạy ứng dụng](#-running-the-application)
- [Tài liệu API](#-api-documentation)
- [Sơ đồ cơ sở dữ liệu](#-database-schema)
- [Lộ trình phát triển](#-development-roadmap)
- [Đóng góp](#-contributing)
- [License](#-license)

---

## ✨ Tính năng

### Dành cho khách hàng
- 🔍 Tìm kiếm chuyến xe theo tuyến và ngày
- 💺 Chọn ghế theo thời gian thực với sơ đồ ghế trực quan
- 💳 Hỗ trợ nhiều phương thức thanh toán (VNPay, MoMo, ZaloPay, Chuyển khoản ngân hàng)
- 📱 Vé điện tử kèm mã QR
- 📧 Thông báo qua Email/SMS
- ⭐ Đánh giá và nhận xét chuyến đi
- 🎁 Chương trình tích điểm thành viên
- 📜 Quản lý lịch sử đặt vé

### Dành cho Nhà xe
- 🚍 Manage routes and schedules
- 🚌 Vehicle and seat layout configuration
- 💰 Pricing and promotion management
- 👥 Staff management (drivers, trip managers)
- 📊 Real-time booking dashboard
- 💵 Revenue reports and analytics

### For Trip Managers/Drivers
- 📱 QR code ticket verification
- 👥 Passenger list management
- 🔄 Trip status updates

### For System Admins
- 👤 User and operator management
- ✅ Operator verification and approval
- 📝 Content management (banners, blogs, FAQ)
- 🆘 Complaint handling
- 📈 System-wide reporting

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **UI Library:** Tailwind CSS + Ant Design
- **State Management:** Redux Toolkit
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Date Handling:** Day.js
- **QR Code:** qrcode.react

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Cache/Queue:** Redis
- **Authentication:** JWT + bcrypt
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (production)
- **Cloud:** AWS/Azure/GCP (planned)
- **CDN:** CloudFlare (planned)

### Third-Party Services
- **Payment Gateways:** VNPay, MoMo, ZaloPay
- **Email:** SendGrid / AWS SES
- **SMS:** VNPT SMS, Viettel SMS
- **File Storage:** Cloudinary / AWS S3

---

## 📁 Project Structure

```
Te_QuickRide/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── customer/    # Customer-facing components
│   │   │   ├── operator/    # Bus operator components
│   │   │   ├── admin/       # Admin panel components
│   │   │   └── common/      # Shared components
│   │   ├── pages/           # Page components
│   │   ├── redux/           # Redux store and slices
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── public/              # Public files
│   ├── package.json
│   └── Dockerfile
│
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── config/          # Configuration files
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Server entry point
│   ├── tests/               # Test files
│   ├── package.json
│   └── Dockerfile
│
├── docs/                    # Documentation
│   ├── PTTKHDT.md          # Requirements analysis (Vietnamese)
│   ├── DATABASE_SCHEMA.md  # Database schema documentation
│   └── usercase.jpg        # Use case diagram
│
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Docker** and **Docker Compose** - [Download](https://www.docker.com/)
- **MongoDB** (if running locally without Docker)
- **Redis** (if running locally without Docker)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Te_QuickRide.git
cd Te_QuickRide
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env and add your API keys (payment gateways, email, SMS, etc.)
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env if needed
```

---

## 🏃 Running the Application

### Option 1: Using Docker Compose (Recommended)

This will start MongoDB, Redis, Backend, and Frontend all together:

```bash
# From project root directory
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### Option 2: Running Manually (Development)

#### Start MongoDB and Redis

```bash
# Option A: Using Docker
docker-compose up -d mongodb redis

# Option B: Using local installations
# Make sure MongoDB is running on port 27017
# Make sure Redis is running on port 6379
```

#### Start Backend

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:5000

#### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:3000

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Trip Endpoints
- `GET /api/trips/search` - Search trips
- `GET /api/trips/:id` - Get trip details
- `GET /api/trips/:id/seats` - Get available seats

### Booking Endpoints
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/my-bookings` - Get user's bookings

### Payment Endpoints
- `POST /api/payments/vnpay/create` - Create VNPay payment
- `GET /api/payments/vnpay/return` - VNPay return URL handler
- `POST /api/payments/momo/create` - Create MoMo payment
- `POST /api/payments/momo/callback` - MoMo callback handler

*Full API documentation coming soon with Swagger/OpenAPI*

---

## 🗄 Database Schema

See detailed database schema documentation in [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

### Main Collections:
- **users** - User accounts (Customer, Admin)
- **bus_operators** - Bus company information
- **routes** - Bus routes
- **buses** - Vehicle information with seat layouts
- **trips** - Scheduled trips
- **bookings** - Booking records
- **tickets** - E-tickets with QR codes
- **payments** - Payment transactions
- **reviews** - Customer reviews and ratings
- **vouchers** - Discount vouchers

---

## 🗺 Development Roadmap

### ✅ Phase 1: Setup & Infrastructure (COMPLETED)
- [x] Project initialization
- [x] Frontend setup (React + Vite + Tailwind)
- [x] Backend setup (Node.js + Express)
- [x] Docker configuration
- [x] Database schema design
- [x] Core models creation (14 collections)
- [x] Environment configuration
- [x] Sample data seeder

### ✅ Phase 2: Core Backend Development (COMPLETED)
- [x] Authentication & Authorization
- [x] User Management APIs
- [x] Route & Trip Management APIs
- [x] Booking Engine
- [x] Search & Filter functionality
- [x] All controller implementations
- [x] All route endpoints

### 🚧 Phase 3: Frontend MVP Development (IN PROGRESS)
- [x] Public pages (Home, About, Contact, Search Results)
- [x] Authentication pages (Login, Register, Forgot Password)
- [x] Customer pages (Booking flow, My Bookings, Booking Details)
- [x] Operator pages (Dashboard, Buses, Routes, Create Trip)
- [x] Common components (Header, Footer, SeatMap, TripCard)
- [x] Routing setup with protected routes
- [ ] API integration with backend
- [ ] State management (Redux)
- [ ] Form validation
- [ ] Error handling

### 📅 Phase 4: Payment & Ticketing
- [ ] VNPay integration
- [ ] MoMo integration
- [ ] ZaloPay integration
- [ ] E-ticket generation with QR codes
- [ ] Email/SMS notifications

### 📅 Phase 5: Advanced Features & Polish
- [ ] Complete operator features
- [ ] Admin panel
- [ ] Review & Rating system
- [ ] Loyalty points program
- [ ] Voucher management
- [ ] Real-time notifications
- [ ] Analytics & Reporting
- [ ] Responsive design optimization

### 📅 Phase 6: Testing & Optimization
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit

### 📅 Phase 7: Deployment
- [ ] CI/CD pipeline setup
- [ ] Production deployment
- [ ] Monitoring & Logging
- [ ] Backup automation

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests (Cypress)
cd frontend
npm run test:e2e
```

---

## 🔒 Security

- **Password Hashing:** bcrypt with cost factor 12
- **JWT Tokens:** Secure token-based authentication
- **HTTPS/TLS:** All connections encrypted
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Input Validation:** express-validator
- **Security Headers:** Helmet.js
- **CORS:** Properly configured
- **Environment Variables:** Sensitive data in .env files

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Te_QuickRide Development Team**

- Project Manager: [Name]
- Lead Developer: [Name]
- Frontend Developer: [Name]
- Backend Developer: [Name]
- UI/UX Designer: [Name]

---

## 📞 Support

For support, email support@tequickride.com or join our Slack channel.

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Express.js community
- MongoDB and Redis teams
- All open-source contributors

---

**Made with ❤️ by Te_QuickRide Team**

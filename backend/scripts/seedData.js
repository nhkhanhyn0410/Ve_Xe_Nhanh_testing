/**
 * Enhanced Seed Script for QuikRide Database
 * Creates comprehensive sample data with journey tracking and stops
 *
 * Usage: node scripts/seedData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

// Import models
const User = require('../src/models/User');
const BusOperator = require('../src/models/BusOperator');
const Employee = require('../src/models/Employee');
const Route = require('../src/models/Route');
const Bus = require('../src/models/Bus');
const Trip = require('../src/models/Trip');
const Booking = require('../src/models/Booking');
const Ticket = require('../src/models/Ticket');

// Import seat layout utilities
const {
  generateLimousineLayout,
  generateAisleLayout,
  generateDoubleDecker,
} = require('../src/utils/seatLayout');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quikride', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.log('MongoDB Connected');
  } catch (error) {
    logger.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Enhanced seed data with full journey tracking
const seedData = async () => {
  try {
    logger.log('\nStarting to seed database with enhanced data...\n');

    // ==================== CLEAR ALL EXISTING DATA ====================
    logger.log('Clearing ALL existing data...');
    await User.deleteMany({});
    await BusOperator.deleteMany({});
    await Employee.deleteMany({});
    await Route.deleteMany({});
    await Bus.deleteMany({});
    await Trip.deleteMany({});
    await Booking.deleteMany({});
    await Ticket.deleteMany({});
    logger.log('Cleared all existing data\n');

    // ==================== USERS ====================
    logger.log('Creating Users...');

    const users = await User.create([
      // Admin
      {
        email: 'admin@quikride.com',
        phone: '0900000000',
        password: 'admin123',
        fullName: 'Quản Trị Viên Hệ Thống',
        role: 'admin',
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      // Customers
      {
        email: 'customer1@gmail.com',
        phone: '0912345678',
        password: '123456',
        fullName: 'Nguyễn Văn An',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        loyaltyTier: 'gold',
        totalPoints: 5500,
      },
      {
        email: 'customer2@gmail.com',
        phone: '0923456789',
        password: '123456',
        fullName: 'Trần Thị Bình',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        loyaltyTier: 'silver',
        totalPoints: 3200,
      },
      {
        email: 'customer3@gmail.com',
        phone: '0934567890',
        password: '123456',
        fullName: 'Lê Hoàng Cường',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        loyaltyTier: 'bronze',
        totalPoints: 1200,
      },
      {
        email: 'customer4@gmail.com',
        phone: '0945678901',
        password: '123456',
        fullName: 'Phạm Thị Dung',
        role: 'customer',
        isEmailVerified: true,
        isPhoneVerified: true,
        loyaltyTier: 'bronze',
        totalPoints: 500,
      },
    ]);

    console.log(`Created ${users.length} users\n`);

    // ==================== BUS OPERATORS ====================
    console.log('Creating Bus Operators...');

    const operators = await BusOperator.create([
      {
        email: 'operator1@quikride.com',
        phone: '0281234567',
        password: 'operator123',
        companyName: 'Phương Trang Express',
        companyAddress: '272 Đường Đệ Tam, Phường 12, Quận 11, TP.HCM',
        businessLicense: 'BL-PT-2020-001',
        taxCode: 'TAX-PT-001',
        representativeName: 'Nguyễn Văn Trang',
        representativePhone: '0281234567',
        representativeEmail: 'trang@phuongtrang.com',
        status: 'active',
        isVerified: true,
        averageRating: 4.7,
        totalTrips: 2450,
      },
      {
        email: 'operator2@quikride.com',
        phone: '0282345678',
        password: 'operator123',
        companyName: 'Thành Bưởi Limousine',
        companyAddress: '199 Nguyễn Văn Linh, Quận 7, TP.HCM',
        businessLicense: 'BL-TB-2019-002',
        taxCode: 'TAX-TB-002',
        representativeName: 'Trần Thành Bưởi',
        representativePhone: '0282345678',
        representativeEmail: 'buoi@thanhbuoi.com',
        status: 'active',
        isVerified: true,
        averageRating: 4.8,
        totalTrips: 1890,
      },
      {
        email: 'operator3@quikride.com',
        phone: '0283456789',
        password: 'operator123',
        companyName: 'Hải Âu Express',
        companyAddress: '45 Lê Duẩn, Quận 1, TP.HCM',
        businessLicense: 'BL-HA-2021-003',
        taxCode: 'TAX-HA-003',
        representativeName: 'Lê Văn Hải',
        representativePhone: '0283456789',
        representativeEmail: 'hai@haiau.com',
        status: 'active',
        isVerified: true,
        averageRating: 4.5,
        totalTrips: 1250,
      },
    ]);

    logger.log(`Created ${operators.length} bus operators\n`);

    // ==================== EMPLOYEES ====================
    console.log('Creating Employees (Drivers & Trip Managers)...');

    const employees = await Employee.create([
      // Phương Trang - Drivers
      {
        operatorId: operators[0]._id,
        employeeCode: 'DRV-PT-001',
        fullName: 'Nguyễn Văn Long',
        phone: '0901234567',
        email: 'long.driver@phuongtrang.com',
        password: await bcrypt.hash('driver123', 10),
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-123456',
        licenseExpiry: new Date('2026-12-31'),
      },
      {
        operatorId: operators[0]._id,
        employeeCode: 'DRV-PT-002',
        fullName: 'Trần Minh Tâm',
        phone: '0902345678',
        email: 'tam.driver@phuongtrang.com',
        password: await bcrypt.hash('driver123', 10),
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-234567',
        licenseExpiry: new Date('2027-06-30'),
      },
      // Phương Trang - Trip Managers
      {
        operatorId: operators[0]._id,
        employeeCode: 'TM-PT-001',
        fullName: 'Lê Thị Hoa',
        phone: '0903456789',
        email: 'hoa.manager@phuongtrang.com',
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
      },
      {
        operatorId: operators[0]._id,
        employeeCode: 'TM-PT-002',
        fullName: 'Phạm Văn Nam',
        phone: '0904567890',
        email: 'nam.manager@phuongtrang.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'trip_manager',
        status: 'active',
      },
      // Thành Bưởi - Drivers
      {
        operatorId: operators[1]._id,
        employeeCode: 'DRV-TB-001',
        fullName: 'Võ Văn Thắng',
        phone: '0905678901',
        email: 'thang.driver@thanhbuoi.com',
        password: await bcrypt.hash('driver123', 10),
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-345678',
        licenseExpiry: new Date('2026-09-30'),
      },
      {
        operatorId: operators[1]._id,
        employeeCode: 'DRV-TB-002',
        fullName: 'Đặng Văn Tuấn',
        phone: '0906789012',
        email: 'tuan.driver@thanhbuoi.com',
        password: await bcrypt.hash('driver123', 10),
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-456789',
        licenseExpiry: new Date('2027-03-31'),
      },
      // Thành Bưởi - Trip Managers
      {
        operatorId: operators[1]._id,
        employeeCode: 'TM-TB-001',
        fullName: 'Nguyễn Thị Lan',
        phone: '0907890123',
        email: 'lan.manager@thanhbuoi.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'trip_manager',
        status: 'active',
      },
      // Hải Âu - Drivers
      {
        operatorId: operators[2]._id,
        employeeCode: 'DRV-HA-001',
        fullName: 'Huỳnh Văn Hùng',
        phone: '0908901234',
        email: 'hung.driver@haiau.com',
        password: await bcrypt.hash('driver123', 10),
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-567890',
        licenseExpiry: new Date('2026-11-30'),
      },
      // Hải Âu - Trip Managers
      {
        operatorId: operators[2]._id,
        employeeCode: 'TM-HA-001',
        fullName: 'Trương Thị Mai',
        phone: '0909012345',
        email: 'mai.manager@haiau.com',
        password: await bcrypt.hash('manager123', 10),
        role: 'trip_manager',
        status: 'active',
      },
    ]);

    logger.log(`Created ${employees.length} employees\n`);

    // ==================== BUSES ====================
    console.log('Creating Buses with Seat Layouts...');

    const buses = await Bus.create([
      // Phương Trang - Limousine 24 ghế
      {
        operatorId: operators[0]._id,
        busNumber: 'PT-001',
        plateNumber: '51B-12345',
        busType: 'limousine',
        manufacturer: 'Hyundai Universe',
        model: 'Limousine VIP',
        year: 2022,
        seatLayout: generateLimousineLayout(),
        status: 'active',
      },
      {
        operatorId: operators[0]._id,
        busNumber: 'PT-002',
        plateNumber: '51B-23456',
        busType: 'limousine',
        manufacturer: 'Hyundai Universe',
        model: 'Limousine VIP',
        year: 2023,
        seatLayout: generateLimousineLayout(),
        status: 'active',
      },
      // Phương Trang - Giường nằm 40 ghế
      {
        operatorId: operators[0]._id,
        busNumber: 'PT-003',
        plateNumber: '51B-34567',
        busType: 'sleeper',
        manufacturer: 'Thaco',
        model: 'TB120SL',
        year: 2021,
        seatLayout: generateAisleLayout(40),
        status: 'active',
      },
      // Thành Bưởi - Limousine 22 ghế
      {
        operatorId: operators[1]._id,
        busNumber: 'TB-001',
        plateNumber: '50B-11111',
        busType: 'limousine',
        manufacturer: 'Mercedes-Benz',
        model: 'Sprinter Limousine',
        year: 2023,
        seatLayout: generateLimousineLayout(),
        status: 'active',
      },
      {
        operatorId: operators[1]._id,
        busNumber: 'TB-002',
        plateNumber: '50B-22222',
        busType: 'limousine',
        manufacturer: 'Mercedes-Benz',
        model: 'Sprinter Limousine',
        year: 2023,
        seatLayout: generateLimousineLayout(),
        status: 'active',
      },
      // Hải Âu - Xe 2 tầng 45 ghế
      {
        operatorId: operators[2]._id,
        busNumber: 'HA-001',
        plateNumber: '51C-99999',
        busType: 'double_decker',
        manufacturer: 'Hyundai',
        model: 'Universe Noble',
        year: 2022,
        seatLayout: generateDoubleDecker(),
        status: 'active',
      },
    ]);

    console.log(`Created ${buses.length} buses with seat layouts\n`);

    // ==================== ROUTES WITH STOPS ====================
    console.log('Creating Routes with Stops...');

    const routes = await Route.create([
      // Route 1: TP.HCM → Đà Lạt (có 3 điểm dừng)
      {
        operatorId: operators[0]._id,
        routeCode: 'HCM-DL-001',
        routeName: 'TP. Hồ Chí Minh - Đà Lạt',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Đông',
          address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
          coordinates: { lat: 10.8142, lng: 106.7053 },
        },
        destination: {
          city: 'Đà Lạt',
          province: 'Lâm Đồng',
          station: 'Bến xe Đà Lạt',
          address: '1 Tô Hiến Thành, P.3, TP. Đà Lạt',
          coordinates: { lat: 11.9344, lng: 108.4419 },
        },
        stops: [
          {
            name: 'Trạm dừng chân Dầu Giây',
            address: 'KM 50 QL1A, Dầu Giây, Đồng Nai',
            coordinates: { lat: 10.9876, lng: 107.1234 },
            order: 1,
            estimatedArrivalMinutes: 90, // 1.5 giờ từ xuất phát
            stopDuration: 15,
          },
          {
            name: 'Trạm Bảo Lộc',
            address: 'QL20, TP. Bảo Lộc, Lâm Đồng',
            coordinates: { lat: 11.5480, lng: 107.8065 },
            order: 2,
            estimatedArrivalMinutes: 240, // 4 giờ từ xuất phát
            stopDuration: 20,
          },
          {
            name: 'Ngã ba Liên Khương',
            address: 'Ngã ba Liên Khương, Đức Trọng, Lâm Đồng',
            coordinates: { lat: 11.7500, lng: 108.3670 },
            order: 3,
            estimatedArrivalMinutes: 330, // 5.5 giờ từ xuất phát
            stopDuration: 10,
          },
        ],
        distance: 308,
        estimatedDuration: 420, // 7 giờ
        isActive: true,
      },
      // Route 2: TP.HCM → Vũng Tàu (có 2 điểm dừng)
      {
        operatorId: operators[0]._id,
        routeCode: 'HCM-VT-001',
        routeName: 'TP. Hồ Chí Minh - Vũng Tàu',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Đông',
          address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
          coordinates: { lat: 10.8142, lng: 106.7053 },
        },
        destination: {
          city: 'Vũng Tàu',
          province: 'Bà Rịa - Vũng Tàu',
          station: 'Bến xe Vũng Tàu',
          address: '192 Nam Kỳ Khởi Nghĩa, P.9, TP. Vũng Tàu',
          coordinates: { lat: 10.3460, lng: 107.0844 },
        },
        stops: [
          {
            name: 'Trạm dừng Long Thành',
            address: 'QL51, Long Thành, Đồng Nai',
            coordinates: { lat: 10.7300, lng: 106.9500 },
            order: 1,
            estimatedArrivalMinutes: 45,
            stopDuration: 10,
          },
          {
            name: 'Ngã tư Bà Rịa',
            address: 'Ngã tư Bà Rịa, TP. Bà Rịa',
            coordinates: { lat: 10.5050, lng: 107.1700 },
            order: 2,
            estimatedArrivalMinutes: 90,
            stopDuration: 10,
          },
        ],
        distance: 125,
        estimatedDuration: 150, // 2.5 giờ
        isActive: true,
      },
      // Route 3: TP.HCM → Nha Trang (có 4 điểm dừng)
      {
        operatorId: operators[1]._id,
        routeCode: 'HCM-NT-001',
        routeName: 'TP. Hồ Chí Minh - Nha Trang',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Đông',
          address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
          coordinates: { lat: 10.8142, lng: 106.7053 },
        },
        destination: {
          city: 'Nha Trang',
          province: 'Khánh Hòa',
          station: 'Bến xe Phía Nam',
          address: '23 Tháng 10, P. Phước Hải, TP. Nha Trang',
          coordinates: { lat: 12.2388, lng: 109.1967 },
        },
        stops: [
          {
            name: 'Trạm Dầu Giây',
            address: 'KM 50 QL1A, Dầu Giây',
            coordinates: { lat: 10.9876, lng: 107.1234 },
            order: 1,
            estimatedArrivalMinutes: 90,
            stopDuration: 15,
          },
          {
            name: 'Phan Rang',
            address: 'QL1A, TP. Phan Rang, Ninh Thuận',
            coordinates: { lat: 11.5657, lng: 108.9890 },
            order: 2,
            estimatedArrivalMinutes: 300,
            stopDuration: 20,
          },
          {
            name: 'Cam Ranh',
            address: 'QL1A, TP. Cam Ranh, Khánh Hòa',
            coordinates: { lat: 11.9214, lng: 109.1593 },
            order: 3,
            estimatedArrivalMinutes: 390,
            stopDuration: 15,
          },
          {
            name: 'Ngã ba Đại Lãnh',
            address: 'Đại Lãnh, Cam Lâm, Khánh Hòa',
            coordinates: { lat: 12.0500, lng: 109.1800 },
            order: 4,
            estimatedArrivalMinutes: 420,
            stopDuration: 10,
          },
        ],
        distance: 448,
        estimatedDuration: 480, // 8 giờ
        isActive: true,
      },
      // Route 4: TP.HCM → Đà Nẵng (có 5 điểm dừng)
      {
        operatorId: operators[1]._id,
        routeCode: 'HCM-DN-001',
        routeName: 'TP. Hồ Chí Minh - Đà Nẵng',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Đông',
          address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
          coordinates: { lat: 10.8142, lng: 106.7053 },
        },
        destination: {
          city: 'Đà Nẵng',
          province: 'Đà Nẵng',
          station: 'Bến xe Trung tâm Đà Nẵng',
          address: 'Đường Điện Biên Phủ, Q. Thanh Khê',
          coordinates: { lat: 16.0544, lng: 108.2022 },
        },
        stops: [
          {
            name: 'Dầu Giây',
            address: 'KM 50 QL1A, Dầu Giây',
            coordinates: { lat: 10.9876, lng: 107.1234 },
            order: 1,
            estimatedArrivalMinutes: 90,
            stopDuration: 15,
          },
          {
            name: 'Nha Trang',
            address: 'QL1A, TP. Nha Trang',
            coordinates: { lat: 12.2388, lng: 109.1967 },
            order: 2,
            estimatedArrivalMinutes: 480,
            stopDuration: 30,
          },
          {
            name: 'Tuy Hòa',
            address: 'QL1A, TP. Tuy Hòa, Phú Yên',
            coordinates: { lat: 13.0882, lng: 109.2977 },
            order: 3,
            estimatedArrivalMinutes: 600,
            stopDuration: 20,
          },
          {
            name: 'Quy Nhơn',
            address: 'QL1A, TP. Quy Nhơn, Bình Định',
            coordinates: { lat: 13.7563, lng: 109.2235 },
            order: 4,
            estimatedArrivalMinutes: 720,
            stopDuration: 25,
          },
          {
            name: 'Quảng Ngãi',
            address: 'QL1A, TP. Quảng Ngãi',
            coordinates: { lat: 15.1208, lng: 108.8044 },
            order: 5,
            estimatedArrivalMinutes: 840,
            stopDuration: 20,
          },
        ],
        distance: 964,
        estimatedDuration: 960, // 16 giờ
        isActive: true,
      },
      // Route 5: TP.HCM → Phan Thiết (có 1 điểm dừng)
      {
        operatorId: operators[2]._id,
        routeCode: 'HCM-PT-001',
        routeName: 'TP. Hồ Chí Minh - Phan Thiết',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Đông',
          address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
          coordinates: { lat: 10.8142, lng: 106.7053 },
        },
        destination: {
          city: 'Phan Thiết',
          province: 'Bình Thuận',
          station: 'Bến xe Phan Thiết',
          address: 'Đường Tô Hiến Thành, P. Phú Thủy',
          coordinates: { lat: 10.9281, lng: 108.1014 },
        },
        stops: [
          {
            name: 'Trạm nghỉ Hàm Thuận Nam',
            address: 'QL1A, Hàm Thuận Nam, Bình Thuận',
            coordinates: { lat: 10.8000, lng: 107.7000 },
            order: 1,
            estimatedArrivalMinutes: 120,
            stopDuration: 15,
          },
        ],
        distance: 200,
        estimatedDuration: 180, // 3 giờ
        isActive: true,
      },
    ]);

    console.log(`Created ${routes.length} routes with stops\n`);

    // ==================== TRIPS WITH JOURNEY TRACKING ====================
    console.log('Creating Trips with Journey Tracking...');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const trips = await Trip.create([
      // Trip 1: HCM → Đà Lạt - Hôm nay 6:00 (đang di chuyển)
      {
        routeId: routes[0]._id,
        busId: buses[0]._id,
        operatorId: operators[0]._id,
        driverId: employees[0]._id, // Nguyễn Văn Long
        tripManagerId: employees[2]._id, // Lê Thị Hoa
        departureTime: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6:00 AM today
        arrivalTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1:00 PM today
        basePrice: 250000,
        finalPrice: 250000,
        totalSeats: buses[0].seatLayout.totalSeats,
        availableSeats: buses[0].seatLayout.totalSeats - 18,
        status: 'ongoing',
        journey: {
          currentStopIndex: 1, // Đang ở điểm dừng thứ 2
          currentStatus: 'at_stop',
          actualDepartureTime: new Date(today.getTime() + 6 * 60 * 60 * 1000),
          statusHistory: [
            {
              status: 'preparing',
              stopIndex: -1,
              timestamp: new Date(today.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000), // 5:30 AM
              notes: 'Chuẩn bị xe và kiểm tra hành khách',
              updatedBy: employees[2]._id,
            },
            {
              status: 'checking_tickets',
              stopIndex: 0,
              timestamp: new Date(today.getTime() + 5 * 60 * 60 * 1000 + 45 * 60 * 1000), // 5:45 AM
              notes: 'Bắt đầu soát vé',
              updatedBy: employees[2]._id,
            },
            {
              status: 'in_transit',
              stopIndex: 0,
              timestamp: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6:00 AM
              notes: 'Khởi hành đúng giờ',
              updatedBy: employees[2]._id,
            },
            {
              status: 'at_stop',
              stopIndex: 1,
              timestamp: new Date(today.getTime() + 7 * 60 * 60 * 1000 + 30 * 60 * 1000), // 7:30 AM
              notes: 'Dừng chân tại Dầu Giây',
              updatedBy: employees[2]._id,
            },
          ],
        },
      },
      // Trip 2: HCM → Đà Lạt - Hôm nay 14:00 (scheduled)
      {
        routeId: routes[0]._id,
        busId: buses[1]._id,
        operatorId: operators[0]._id,
        driverId: employees[1]._id, // Trần Minh Tâm
        tripManagerId: employees[3]._id, // Phạm Văn Nam
        departureTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM today
        arrivalTime: new Date(today.getTime() + 21 * 60 * 60 * 1000), // 9:00 PM today
        basePrice: 250000,
        finalPrice: 250000,
        totalSeats: buses[1].seatLayout.totalSeats,
        availableSeats: buses[1].seatLayout.totalSeats - 12,
        status: 'scheduled',
        journey: {
          currentStopIndex: -1,
          currentStatus: 'preparing',
          statusHistory: [],
        },
      },
      // Trip 3: HCM → Vũng Tàu - Hôm nay 8:00 (ongoing)
      {
        routeId: routes[1]._id,
        busId: buses[2]._id,
        operatorId: operators[0]._id,
        driverId: employees[0]._id,
        tripManagerId: employees[2]._id,
        departureTime: new Date(today.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
        arrivalTime: new Date(today.getTime() + 10 * 60 * 60 * 1000 + 30 * 60 * 1000), // 10:30 AM
        basePrice: 120000,
        finalPrice: 120000,
        totalSeats: buses[2].seatLayout.totalSeats,
        availableSeats: buses[2].seatLayout.totalSeats - 28,
        status: 'ongoing',
        journey: {
          currentStopIndex: 0,
          currentStatus: 'in_transit',
          actualDepartureTime: new Date(today.getTime() + 8 * 60 * 60 * 1000),
          statusHistory: [
            {
              status: 'preparing',
              stopIndex: -1,
              timestamp: new Date(today.getTime() + 7 * 60 * 60 * 1000 + 30 * 60 * 1000),
              notes: 'Chuẩn bị khởi hành',
              updatedBy: employees[2]._id,
            },
            {
              status: 'checking_tickets',
              stopIndex: 0,
              timestamp: new Date(today.getTime() + 7 * 60 * 60 * 1000 + 50 * 60 * 1000),
              notes: 'Soát vé',
              updatedBy: employees[2]._id,
            },
            {
              status: 'in_transit',
              stopIndex: 0,
              timestamp: new Date(today.getTime() + 8 * 60 * 60 * 1000),
              notes: 'Đã khởi hành',
              updatedBy: employees[2]._id,
            },
          ],
        },
      },
      // Trip 4: HCM → Nha Trang - Ngày mai 6:00
      {
        routeId: routes[2]._id,
        busId: buses[3]._id,
        operatorId: operators[1]._id,
        driverId: employees[4]._id, // Võ Văn Thắng
        tripManagerId: employees[6]._id, // Nguyễn Thị Lan
        departureTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // Tomorrow 6:00 AM
        arrivalTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Tomorrow 2:00 PM
        basePrice: 350000,
        finalPrice: 350000,
        totalSeats: buses[3].seatLayout.totalSeats,
        availableSeats: buses[3].seatLayout.totalSeats - 15,
        status: 'scheduled',
        journey: {
          currentStopIndex: -1,
          currentStatus: 'preparing',
          statusHistory: [],
        },
      },
      // Trip 5: HCM → Đà Nẵng - Ngày mai 18:00
      {
        routeId: routes[3]._id,
        busId: buses[4]._id,
        operatorId: operators[1]._id,
        driverId: employees[5]._id, // Đặng Văn Tuấn
        tripManagerId: employees[6]._id, // Nguyễn Thị Lan
        departureTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // Tomorrow 6:00 PM
        arrivalTime: new Date(today.getTime() + 48 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Day after 10:00 AM
        basePrice: 450000,
        finalPrice: 450000,
        totalSeats: buses[4].seatLayout.totalSeats,
        availableSeats: buses[4].seatLayout.totalSeats - 10,
        status: 'scheduled',
        journey: {
          currentStopIndex: -1,
          currentStatus: 'preparing',
          statusHistory: [],
        },
      },
      // Trip 6: HCM → Phan Thiết - Hôm nay 16:00
      {
        routeId: routes[4]._id,
        busId: buses[5]._id,
        operatorId: operators[2]._id,
        driverId: employees[7]._id, // Huỳnh Văn Hùng
        tripManagerId: employees[8]._id, // Trương Thị Mai
        departureTime: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM today
        arrivalTime: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 7:00 PM today
        basePrice: 150000,
        finalPrice: 150000,
        totalSeats: buses[5].seatLayout.totalSeats,
        availableSeats: buses[5].seatLayout.totalSeats - 20,
        status: 'scheduled',
        journey: {
          currentStopIndex: -1,
          currentStatus: 'preparing',
          statusHistory: [],
        },
      },
    ]);

    logger.log(`Created ${trips.length} trips with journey tracking\n`);

    // ==================== SUMMARY ====================
    logger.log('\n==================== SEED SUMMARY ====================');
    logger.log(`Users: ${users.length}`);
    logger.log(`Bus Operators: ${operators.length}`);
    console.log(`Employees: ${employees.length}`);
    console.log(`   - Drivers: ${employees.filter(e => e.role === 'driver').length}`);
    console.log(`   - Trip Managers: ${employees.filter(e => e.role === 'trip_manager').length}`);
    console.log(`Buses: ${buses.length}`);
    console.log(`Routes: ${routes.length}`);
    console.log(`   - Total Stops Configured: ${routes.reduce((sum, r) => sum + r.stops.length, 0)}`);
    console.log(`Trips: ${trips.length}`);
    console.log(`   - Scheduled: ${trips.filter(t => t.status === 'scheduled').length}`);
    console.log(`   - Ongoing: ${trips.filter(t => t.status === 'ongoing').length}`);
    console.log('========================================================\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Admin: admin@quikride.com / admin123');
    console.log('   Operator: operator1@quikride.com / operator123');
    console.log('   Trip Manager: hoa.manager@phuongtrang.com / manager123');
    console.log('   Driver: long.driver@phuongtrang.com / driver123');
    console.log('   Customer: customer1@gmail.com / 123456\n');

  } catch (error) {
    console.error(' Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('Database connection closed. Goodbye!\n');
  process.exit(0);
};

main();

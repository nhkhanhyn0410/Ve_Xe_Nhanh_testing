/**
 * Seed Script for Routes and Employees Only
 * Creates comprehensive sample data for routes and staff members
 *
 * Usage: node scripts/seedRoutesEmployees.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const BusOperator = require('../src/models/BusOperator');
const Employee = require('../src/models/Employee');
const Route = require('../src/models/Route');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quikride', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(' MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Seed data for Routes and Employees only
const seedData = async () => {
  try {
    console.log('\nStarting to seed Routes and Employees...\n');

    // ==================== CLEAR EXISTING DATA ====================
    console.log('Clearing existing Routes, Employees, and Operators data...');
    await Route.deleteMany({});
    await Employee.deleteMany({});
    await BusOperator.deleteMany({});
    console.log('Cleared existing data\n');

    // ==================== BUS OPERATORS ====================
    console.log('🏢 Creating Bus Operators...');

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
      {
        email: 'operator4@quikride.com',
        phone: '0284567890',
        password: 'operator123',
        companyName: 'Mai Linh Express',
        companyAddress: '123 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM',
        businessLicense: 'BL-ML-2018-004',
        taxCode: 'TAX-ML-004',
        representativeName: 'Mai Thị Linh',
        representativePhone: '0284567890',
        representativeEmail: 'linh@mailinh.com',
        status: 'active',
        isVerified: true,
        averageRating: 4.6,
        totalTrips: 3120,
      },
      {
        email: 'operator5@quikride.com',
        phone: '0285678901',
        password: 'operator123',
        companyName: 'Kumho Samco',
        companyAddress: '233 Bến Vân Đồn, Quận 4, TP.HCM',
        businessLicense: 'BL-KS-2017-005',
        taxCode: 'TAX-KS-005',
        representativeName: 'Park Min Soo',
        representativePhone: '0285678901',
        representativeEmail: 'park@kumhosamco.com',
        status: 'active',
        isVerified: true,
        averageRating: 4.4,
        totalTrips: 2890,
      },
    ]);

    console.log(`Created ${operators.length} bus operators\n`);

    // ==================== EMPLOYEES ====================
    console.log('👨‍✈️ Creating Employees (Drivers & Trip Managers)...');

    const employees = await Employee.create([
      // ========== PHƯƠNG TRANG EXPRESS ==========
      // Drivers
      {
        operatorId: operators[0]._id,
        employeeCode: 'DRV-PT-001',
        fullName: 'Nguyễn Văn Long',
        phone: '0901234567',
        email: 'long.driver@phuongtrang.com',
        idCard: '079123456789',
        address: '45 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
        dateOfBirth: new Date('1985-05-15'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-123456',
        licenseClass: 'D',
        licenseExpiry: new Date('2026-12-31'),
        hireDate: new Date('2020-01-15'),
      },
      {
        operatorId: operators[0]._id,
        employeeCode: 'DRV-PT-002',
        fullName: 'Trần Minh Tâm',
        phone: '0902345678',
        email: 'tam.driver@phuongtrang.com',
        idCard: '079234567890',
        address: '123 Lê Văn Sỹ, Quận Phú Nhuận, TP.HCM',
        dateOfBirth: new Date('1988-08-20'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-234567',
        licenseClass: 'D',
        licenseExpiry: new Date('2027-06-30'),
        hireDate: new Date('2019-03-10'),
      },
      {
        operatorId: operators[0]._id,
        employeeCode: 'DRV-PT-003',
        fullName: 'Lê Hoàng Nam',
        phone: '0903334455',
        email: 'nam.driver@phuongtrang.com',
        idCard: '079345678901',
        address: '78 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM',
        dateOfBirth: new Date('1990-02-10'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-345678',
        licenseClass: 'E',
        licenseExpiry: new Date('2028-03-15'),
        hireDate: new Date('2021-07-01'),
      },
      // Trip Managers
      {
        operatorId: operators[0]._id,
        employeeCode: 'TM-PT-001',
        fullName: 'Lê Thị Hoa',
        phone: '0903456789',
        email: 'hoa.manager@phuongtrang.com',
        idCard: '079456789012',
        address: '56 Trần Hưng Đạo, Quận 1, TP.HCM',
        dateOfBirth: new Date('1992-11-05'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2020-06-01'),
      },
      {
        operatorId: operators[0]._id,
        employeeCode: 'TM-PT-002',
        fullName: 'Phạm Văn Nam',
        phone: '0904567890',
        email: 'nam.manager@phuongtrang.com',
        idCard: '079567890123',
        address: '234 Võ Văn Tần, Quận 3, TP.HCM',
        dateOfBirth: new Date('1987-03-25'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2018-09-15'),
      },

      // ========== THÀNH BƯỞI LIMOUSINE ==========
      // Drivers
      {
        operatorId: operators[1]._id,
        employeeCode: 'DRV-TB-001',
        fullName: 'Võ Văn Thắng',
        phone: '0905678901',
        email: 'thang.driver@thanhbuoi.com',
        idCard: '079678901234',
        address: '89 Nguyễn Huệ, Quận 1, TP.HCM',
        dateOfBirth: new Date('1986-07-12'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-456789',
        licenseClass: 'D',
        licenseExpiry: new Date('2026-09-30'),
        hireDate: new Date('2019-11-20'),
      },
      {
        operatorId: operators[1]._id,
        employeeCode: 'DRV-TB-002',
        fullName: 'Đặng Văn Tuấn',
        phone: '0906789012',
        email: 'tuan.driver@thanhbuoi.com',
        idCard: '079789012345',
        address: '156 Pasteur, Quận 3, TP.HCM',
        dateOfBirth: new Date('1991-04-18'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-567890',
        licenseClass: 'D',
        licenseExpiry: new Date('2027-03-31'),
        hireDate: new Date('2020-02-14'),
      },
      {
        operatorId: operators[1]._id,
        employeeCode: 'DRV-TB-003',
        fullName: 'Hoàng Văn Sơn',
        phone: '0906667788',
        email: 'son.driver@thanhbuoi.com',
        idCard: '079890123456',
        address: '234 Hai Bà Trưng, Quận 3, TP.HCM',
        dateOfBirth: new Date('1989-09-22'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-678901',
        licenseClass: 'E',
        licenseExpiry: new Date('2027-11-20'),
        hireDate: new Date('2021-01-10'),
      },
      // Trip Managers
      {
        operatorId: operators[1]._id,
        employeeCode: 'TM-TB-001',
        fullName: 'Nguyễn Thị Lan',
        phone: '0907890123',
        email: 'lan.manager@thanhbuoi.com',
        idCard: '079901234567',
        address: '67 Lý Tự Trọng, Quận 1, TP.HCM',
        dateOfBirth: new Date('1993-06-30'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2021-04-01'),
      },
      {
        operatorId: operators[1]._id,
        employeeCode: 'TM-TB-002',
        fullName: 'Trần Thị Hương',
        phone: '0907778899',
        email: 'huong.manager@thanhbuoi.com',
        idCard: '079012345678',
        address: '45 Nguyễn Đình Chiểu, Quận 1, TP.HCM',
        dateOfBirth: new Date('1990-12-15'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2019-08-20'),
      },

      // ========== HẢI ÂU EXPRESS ==========
      // Drivers
      {
        operatorId: operators[2]._id,
        employeeCode: 'DRV-HA-001',
        fullName: 'Huỳnh Văn Hùng',
        phone: '0908901234',
        email: 'hung.driver@haiau.com',
        idCard: '079123456780',
        address: '123 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        dateOfBirth: new Date('1984-10-08'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-789012',
        licenseClass: 'E',
        licenseExpiry: new Date('2026-11-30'),
        hireDate: new Date('2021-05-15'),
      },
      {
        operatorId: operators[2]._id,
        employeeCode: 'DRV-HA-002',
        fullName: 'Phan Văn Đức',
        phone: '0908889900',
        email: 'duc.driver@haiau.com',
        idCard: '079234567891',
        address: '89 Lạc Long Quân, Quận 11, TP.HCM',
        dateOfBirth: new Date('1987-01-20'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-890123',
        licenseClass: 'D',
        licenseExpiry: new Date('2027-07-25'),
        hireDate: new Date('2021-06-01'),
      },
      // Trip Managers
      {
        operatorId: operators[2]._id,
        employeeCode: 'TM-HA-001',
        fullName: 'Trương Thị Mai',
        phone: '0909012345',
        email: 'mai.manager@haiau.com',
        idCard: '079345678902',
        address: '234 Điện Biên Phủ, Quận 3, TP.HCM',
        dateOfBirth: new Date('1994-02-14'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2021-07-01'),
      },

      // ========== MAI LINH EXPRESS ==========
      // Drivers
      {
        operatorId: operators[3]._id,
        employeeCode: 'DRV-ML-001',
        fullName: 'Nguyễn Thanh Tùng',
        phone: '0909990011',
        email: 'tung.driver@mailinh.com',
        idCard: '079456789013',
        address: '45 Hoàng Sa, Quận 3, TP.HCM',
        dateOfBirth: new Date('1986-03-10'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-901234',
        licenseClass: 'D',
        licenseExpiry: new Date('2028-01-15'),
        hireDate: new Date('2018-05-01'),
      },
      {
        operatorId: operators[3]._id,
        employeeCode: 'DRV-ML-002',
        fullName: 'Lê Văn Phúc',
        phone: '0909001122',
        email: 'phuc.driver@mailinh.com',
        idCard: '079567890124',
        address: '78 Trường Sơn, Quận Tân Bình, TP.HCM',
        dateOfBirth: new Date('1989-06-25'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-012345',
        licenseClass: 'E',
        licenseExpiry: new Date('2027-09-30'),
        hireDate: new Date('2019-02-15'),
      },
      {
        operatorId: operators[3]._id,
        employeeCode: 'DRV-ML-003',
        fullName: 'Trần Quốc Bảo',
        phone: '0909112233',
        email: 'bao.driver@mailinh.com',
        idCard: '079678901235',
        address: '156 Cộng Hòa, Quận Tân Bình, TP.HCM',
        dateOfBirth: new Date('1992-08-05'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-123450',
        licenseClass: 'D',
        licenseExpiry: new Date('2028-05-20'),
        hireDate: new Date('2020-10-01'),
      },
      // Trip Managers
      {
        operatorId: operators[3]._id,
        employeeCode: 'TM-ML-001',
        fullName: 'Võ Thị Ngọc',
        phone: '0909223344',
        email: 'ngoc.manager@mailinh.com',
        idCard: '079789012346',
        address: '67 Bạch Đằng, Quận Bình Thạnh, TP.HCM',
        dateOfBirth: new Date('1991-11-18'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2019-06-01'),
      },
      {
        operatorId: operators[3]._id,
        employeeCode: 'TM-ML-002',
        fullName: 'Đặng Thị Kim',
        phone: '0909334455',
        email: 'kim.manager@mailinh.com',
        idCard: '079890123457',
        address: '234 Xô Viết Nghệ Tĩnh, Quận Bình Thạnh, TP.HCM',
        dateOfBirth: new Date('1988-04-22'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2018-03-15'),
      },

      // ========== KUMHO SAMCO ==========
      // Drivers
      {
        operatorId: operators[4]._id,
        employeeCode: 'DRV-KS-001',
        fullName: 'Phạm Văn Kiên',
        phone: '0909445566',
        email: 'kien.driver@kumhosamco.com',
        idCard: '079901234568',
        address: '45 Khánh Hội, Quận 4, TP.HCM',
        dateOfBirth: new Date('1985-09-12'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-234501',
        licenseClass: 'D',
        licenseExpiry: new Date('2027-12-31'),
        hireDate: new Date('2017-08-01'),
      },
      {
        operatorId: operators[4]._id,
        employeeCode: 'DRV-KS-002',
        fullName: 'Nguyễn Hữu Thắng',
        phone: '0909556677',
        email: 'thang2.driver@kumhosamco.com',
        idCard: '079012345679',
        address: '123 Tôn Đản, Quận 4, TP.HCM',
        dateOfBirth: new Date('1990-12-08'),
        password: 'driver123',
        role: 'driver',
        status: 'active',
        licenseNumber: 'B2-345612',
        licenseClass: 'E',
        licenseExpiry: new Date('2028-04-30'),
        hireDate: new Date('2018-11-15'),
      },
      // Trip Managers
      {
        operatorId: operators[4]._id,
        employeeCode: 'TM-KS-001',
        fullName: 'Lê Thị Phương',
        phone: '0909667788',
        email: 'phuong.manager@kumhosamco.com',
        idCard: '079123456791',
        address: '89 Nguyễn Tất Thành, Quận 4, TP.HCM',
        dateOfBirth: new Date('1993-07-28'),
        password: 'manager123',
        role: 'trip_manager',
        status: 'active',
        hireDate: new Date('2019-01-10'),
      },
    ]);

    console.log(`Created ${employees.length} employees`);
    console.log(`   - Drivers: ${employees.filter(e => e.role === 'driver').length}`);
    console.log(`   - Trip Managers: ${employees.filter(e => e.role === 'trip_manager').length}\n`);

    // ==================== ROUTES WITH STOPS ====================
    console.log('🗺️  Creating Routes with Stops...');

    const routes = await Route.create([
      // ========== PHƯƠNG TRANG EXPRESS ==========
      // Route 1: TP.HCM → Đà Lạt
      {
        operatorId: operators[0]._id,
        routeCode: 'HCM-DL-PT001',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
          {
            name: 'Điểm đón Ngã Tư Bình Triệu',
            address: 'Ngã Tư Bình Triệu, Thủ Đức',
            coordinates: { lat: 10.8450, lng: 106.7350 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Đà Lạt',
            address: '1 Tô Hiến Thành, P.3, TP. Đà Lạt',
            coordinates: { lat: 11.9344, lng: 108.4419 },
          },
          {
            name: 'Điểm trả Trung tâm Đà Lạt',
            address: 'Hồ Xuân Hương, TP. Đà Lạt',
            coordinates: { lat: 11.9404, lng: 108.4383 },
          },
        ],
        stops: [
          {
            name: 'Trạm dừng chân Dầu Giây',
            address: 'KM 50 QL1A, Dầu Giây, Đồng Nai',
            coordinates: { lat: 10.9876, lng: 107.1234 },
            order: 1,
            estimatedArrivalMinutes: 90,
            stopDuration: 15,
          },
          {
            name: 'Trạm Bảo Lộc',
            address: 'QL20, TP. Bảo Lộc, Lâm Đồng',
            coordinates: { lat: 11.5480, lng: 107.8065 },
            order: 2,
            estimatedArrivalMinutes: 240,
            stopDuration: 20,
          },
          {
            name: 'Ngã ba Liên Khương',
            address: 'Ngã ba Liên Khương, Đức Trọng, Lâm Đồng',
            coordinates: { lat: 11.7500, lng: 108.3670 },
            order: 3,
            estimatedArrivalMinutes: 330,
            stopDuration: 10,
          },
        ],
        distance: 308,
        estimatedDuration: 420,
        isActive: true,
      },

      // Route 2: TP.HCM → Vũng Tàu
      {
        operatorId: operators[0]._id,
        routeCode: 'HCM-VT-PT001',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
          {
            name: 'Điểm đón Vòng xoay Nguyễn Xí',
            address: 'Nguyễn Xí, Bình Thạnh',
            coordinates: { lat: 10.8200, lng: 106.7100 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Vũng Tàu',
            address: '192 Nam Kỳ Khởi Nghĩa, P.9, TP. Vũng Tàu',
            coordinates: { lat: 10.3460, lng: 107.0844 },
          },
          {
            name: 'Điểm trả Bãi Sau',
            address: 'Thùy Vân, TP. Vũng Tàu',
            coordinates: { lat: 10.3370, lng: 107.0920 },
          },
        ],
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
        estimatedDuration: 150,
        isActive: true,
      },

      // Route 3: TP.HCM → Phan Thiết
      {
        operatorId: operators[0]._id,
        routeCode: 'HCM-PT-PT001',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Phan Thiết',
            address: 'Đường Tô Hiến Thành, P. Phú Thủy',
            coordinates: { lat: 10.9281, lng: 108.1014 },
          },
          {
            name: 'Điểm trả Mũi Né',
            address: 'Nguyễn Đình Chiểu, Mũi Né',
            coordinates: { lat: 10.9150, lng: 108.2800 },
          },
        ],
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
        estimatedDuration: 180,
        isActive: true,
      },

      // ========== THÀNH BƯỞI LIMOUSINE ==========
      // Route 4: TP.HCM → Nha Trang
      {
        operatorId: operators[1]._id,
        routeCode: 'HCM-NT-TB001',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
          {
            name: 'Điểm đón Thảo Điền',
            address: 'Quận 2, TP.HCM',
            coordinates: { lat: 10.8050, lng: 106.7400 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Nha Trang',
            address: '23 Tháng 10, P. Phước Hải, TP. Nha Trang',
            coordinates: { lat: 12.2388, lng: 109.1967 },
          },
          {
            name: 'Điểm trả Trung tâm Nha Trang',
            address: 'Trần Phú, TP. Nha Trang',
            coordinates: { lat: 12.2490, lng: 109.1950 },
          },
        ],
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
        estimatedDuration: 480,
        isActive: true,
      },

      // Route 5: TP.HCM → Đà Nẵng
      {
        operatorId: operators[1]._id,
        routeCode: 'HCM-DN-TB001',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Đà Nẵng',
            address: 'Đường Điện Biên Phủ, Q. Thanh Khê',
            coordinates: { lat: 16.0544, lng: 108.2022 },
          },
          {
            name: 'Điểm trả Sân bay Đà Nẵng',
            address: 'Sân bay Quốc tế Đà Nẵng',
            coordinates: { lat: 16.0439, lng: 108.1993 },
          },
        ],
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
        estimatedDuration: 960,
        isActive: true,
      },

      // Route 6: TP.HCM → Đà Lạt (Thành Bưởi)
      {
        operatorId: operators[1]._id,
        routeCode: 'HCM-DL-TB001',
        routeName: 'TP. Hồ Chí Minh - Đà Lạt (Limousine)',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Văn phòng Quận 1',
          address: '199 Nguyễn Văn Linh, Quận 7',
          coordinates: { lat: 10.7320, lng: 106.7220 },
        },
        destination: {
          city: 'Đà Lạt',
          province: 'Lâm Đồng',
          station: 'Trung tâm Đà Lạt',
          address: 'Hồ Xuân Hương, TP. Đà Lạt',
          coordinates: { lat: 11.9404, lng: 108.4383 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Quận 1',
            address: 'Đường Phạm Ngũ Lão, Quận 1',
            coordinates: { lat: 10.7680, lng: 106.6920 },
          },
          {
            name: 'Điểm đón Quận 7',
            address: '199 Nguyễn Văn Linh, Quận 7',
            coordinates: { lat: 10.7320, lng: 106.7220 },
          },
          {
            name: 'Điểm đón Phú Mỹ Hưng',
            address: 'Nguyễn Lương Bằng, Quận 7',
            coordinates: { lat: 10.7280, lng: 106.7100 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Hồ Xuân Hương',
            address: 'Hồ Xuân Hương, TP. Đà Lạt',
            coordinates: { lat: 11.9404, lng: 108.4383 },
          },
          {
            name: 'Điểm trả Chợ Đà Lạt',
            address: 'Chợ Đà Lạt, Nguyễn Thị Minh Khai',
            coordinates: { lat: 11.9430, lng: 108.4420 },
          },
        ],
        stops: [
          {
            name: 'Trạm Dầu Giây',
            address: 'KM 50 QL1A, Dầu Giây',
            coordinates: { lat: 10.9876, lng: 107.1234 },
            order: 1,
            estimatedArrivalMinutes: 100,
            stopDuration: 15,
          },
          {
            name: 'Trạm Di Linh',
            address: 'QL20, Huyện Di Linh, Lâm Đồng',
            coordinates: { lat: 11.5800, lng: 108.0700 },
            order: 2,
            estimatedArrivalMinutes: 270,
            stopDuration: 15,
          },
        ],
        distance: 308,
        estimatedDuration: 390,
        isActive: true,
      },

      // ========== HẢI ÂU EXPRESS ==========
      // Route 7: TP.HCM → Cần Thơ
      {
        operatorId: operators[2]._id,
        routeCode: 'HCM-CT-HA001',
        routeName: 'TP. Hồ Chí Minh - Cần Thơ',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Tây',
          address: 'Đường Kinh Dương Vương, Q. Bình Tân',
          coordinates: { lat: 10.7390, lng: 106.6180 },
        },
        destination: {
          city: 'Cần Thơ',
          province: 'Cần Thơ',
          station: 'Bến xe Cần Thơ',
          address: 'Đường 30 Tháng 4, Q. Ninh Kiều',
          coordinates: { lat: 10.0341, lng: 105.7720 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Tây',
            address: 'Đường Kinh Dương Vương, Q. Bình Tân',
            coordinates: { lat: 10.7390, lng: 106.6180 },
          },
          {
            name: 'Điểm đón An Lạc',
            address: 'Ngã Tư An Lạc, Bình Tân',
            coordinates: { lat: 10.7380, lng: 106.6100 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Cần Thơ',
            address: 'Đường 30 Tháng 4, Q. Ninh Kiều',
            coordinates: { lat: 10.0341, lng: 105.7720 },
          },
          {
            name: 'Điểm trả Vincom Cần Thơ',
            address: 'Đường 3/2, Q. Ninh Kiều',
            coordinates: { lat: 10.0452, lng: 105.7469 },
          },
        ],
        stops: [
          {
            name: 'Trạm Mỹ Thuận',
            address: 'QL1A, Cầu Mỹ Thuận, Vĩnh Long',
            coordinates: { lat: 10.2500, lng: 105.9000 },
            order: 1,
            estimatedArrivalMinutes: 90,
            stopDuration: 15,
          },
        ],
        distance: 169,
        estimatedDuration: 180,
        isActive: true,
      },

      // Route 8: TP.HCM → Rạch Giá
      {
        operatorId: operators[2]._id,
        routeCode: 'HCM-RG-HA001',
        routeName: 'TP. Hồ Chí Minh - Rạch Giá',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Tây',
          address: 'Đường Kinh Dương Vương, Q. Bình Tân',
          coordinates: { lat: 10.7390, lng: 106.6180 },
        },
        destination: {
          city: 'Rạch Giá',
          province: 'Kiên Giang',
          station: 'Bến xe Rạch Giá',
          address: 'Đường Nguyễn Trung Trực, TP. Rạch Giá',
          coordinates: { lat: 10.0124, lng: 105.0808 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Tây',
            address: 'Đường Kinh Dương Vương, Q. Bình Tân',
            coordinates: { lat: 10.7390, lng: 106.6180 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Rạch Giá',
            address: 'Đường Nguyễn Trung Trực, TP. Rạch Giá',
            coordinates: { lat: 10.0124, lng: 105.0808 },
          },
          {
            name: 'Điểm trả Cảng Rạch Giá',
            address: 'Cảng Rạch Giá, TP. Rạch Giá',
            coordinates: { lat: 10.0050, lng: 105.0750 },
          },
        ],
        stops: [
          {
            name: 'Trạm Cần Thơ',
            address: 'QL1A, TP. Cần Thơ',
            coordinates: { lat: 10.0341, lng: 105.7720 },
            order: 1,
            estimatedArrivalMinutes: 180,
            stopDuration: 20,
          },
          {
            name: 'Trạm Hậu Giang',
            address: 'QL61, Hậu Giang',
            coordinates: { lat: 9.7850, lng: 105.4700 },
            order: 2,
            estimatedArrivalMinutes: 240,
            stopDuration: 15,
          },
        ],
        distance: 250,
        estimatedDuration: 330,
        isActive: true,
      },

      // ========== MAI LINH EXPRESS ==========
      // Route 9: TP.HCM → Đà Lạt (Mai Linh)
      {
        operatorId: operators[3]._id,
        routeCode: 'HCM-DL-ML001',
        routeName: 'TP. Hồ Chí Minh - Đà Lạt (Mai Linh)',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
          {
            name: 'Điểm đón Tân Bình',
            address: 'Hoàng Văn Thụ, Tân Bình',
            coordinates: { lat: 10.7990, lng: 106.6540 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Đà Lạt',
            address: '1 Tô Hiến Thành, P.3, TP. Đà Lạt',
            coordinates: { lat: 11.9344, lng: 108.4419 },
          },
        ],
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
            name: 'Trạm Bảo Lộc',
            address: 'QL20, TP. Bảo Lộc',
            coordinates: { lat: 11.5480, lng: 107.8065 },
            order: 2,
            estimatedArrivalMinutes: 240,
            stopDuration: 20,
          },
        ],
        distance: 308,
        estimatedDuration: 420,
        isActive: true,
      },

      // Route 10: TP.HCM → Nha Trang (Mai Linh)
      {
        operatorId: operators[3]._id,
        routeCode: 'HCM-NT-ML001',
        routeName: 'TP. Hồ Chí Minh - Nha Trang (Mai Linh)',
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
          address: '23 Tháng 10, P. Phước Hải',
          coordinates: { lat: 12.2388, lng: 109.1967 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Nha Trang',
            address: '23 Tháng 10, P. Phước Hải',
            coordinates: { lat: 12.2388, lng: 109.1967 },
          },
        ],
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
            name: 'Trạm Phan Rang',
            address: 'QL1A, TP. Phan Rang',
            coordinates: { lat: 11.5657, lng: 108.9890 },
            order: 2,
            estimatedArrivalMinutes: 300,
            stopDuration: 20,
          },
          {
            name: 'Trạm Cam Ranh',
            address: 'QL1A, TP. Cam Ranh',
            coordinates: { lat: 11.9214, lng: 109.1593 },
            order: 3,
            estimatedArrivalMinutes: 390,
            stopDuration: 15,
          },
        ],
        distance: 448,
        estimatedDuration: 480,
        isActive: true,
      },

      // Route 11: TP.HCM → Mũi Né
      {
        operatorId: operators[3]._id,
        routeCode: 'HCM-MN-ML001',
        routeName: 'TP. Hồ Chí Minh - Mũi Né',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Đông',
          address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
          coordinates: { lat: 10.8142, lng: 106.7053 },
        },
        destination: {
          city: 'Mũi Né',
          province: 'Bình Thuận',
          station: 'Mũi Né Beach',
          address: 'Nguyễn Đình Chiểu, Mũi Né',
          coordinates: { lat: 10.9150, lng: 108.2800 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
          {
            name: 'Điểm đón Quận 2',
            address: 'Thảo Điền, Quận 2',
            coordinates: { lat: 10.8050, lng: 106.7400 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Mũi Né Beach',
            address: 'Nguyễn Đình Chiểu, Mũi Né',
            coordinates: { lat: 10.9150, lng: 108.2800 },
          },
          {
            name: 'Điểm trả Phan Thiết',
            address: 'Bến xe Phan Thiết',
            coordinates: { lat: 10.9281, lng: 108.1014 },
          },
        ],
        stops: [
          {
            name: 'Trạm Long Thành',
            address: 'QL51, Long Thành',
            coordinates: { lat: 10.7300, lng: 106.9500 },
            order: 1,
            estimatedArrivalMinutes: 60,
            stopDuration: 10,
          },
          {
            name: 'Trạm Hàm Thuận',
            address: 'QL1A, Hàm Thuận Nam',
            coordinates: { lat: 10.8000, lng: 107.7000 },
            order: 2,
            estimatedArrivalMinutes: 150,
            stopDuration: 15,
          },
        ],
        distance: 220,
        estimatedDuration: 210,
        isActive: true,
      },

      // ========== KUMHO SAMCO ==========
      // Route 12: TP.HCM → Đà Lạt (Kumho)
      {
        operatorId: operators[4]._id,
        routeCode: 'HCM-DL-KS001',
        routeName: 'TP. Hồ Chí Minh - Đà Lạt (Kumho)',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Đà Lạt',
            address: '1 Tô Hiến Thành, P.3, TP. Đà Lạt',
            coordinates: { lat: 11.9344, lng: 108.4419 },
          },
        ],
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
            name: 'Trạm Bảo Lộc',
            address: 'QL20, TP. Bảo Lộc',
            coordinates: { lat: 11.5480, lng: 107.8065 },
            order: 2,
            estimatedArrivalMinutes: 240,
            stopDuration: 20,
          },
        ],
        distance: 308,
        estimatedDuration: 420,
        isActive: true,
      },

      // Route 13: TP.HCM → Vũng Tàu (Kumho)
      {
        operatorId: operators[4]._id,
        routeCode: 'HCM-VT-KS001',
        routeName: 'TP. Hồ Chí Minh - Vũng Tàu (Kumho)',
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
          address: '192 Nam Kỳ Khởi Nghĩa, P.9',
          coordinates: { lat: 10.3460, lng: 107.0844 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Vũng Tàu',
            address: '192 Nam Kỳ Khởi Nghĩa, P.9',
            coordinates: { lat: 10.3460, lng: 107.0844 },
          },
        ],
        stops: [
          {
            name: 'Trạm Long Thành',
            address: 'QL51, Long Thành',
            coordinates: { lat: 10.7300, lng: 106.9500 },
            order: 1,
            estimatedArrivalMinutes: 45,
            stopDuration: 10,
          },
          {
            name: 'Trạm Bà Rịa',
            address: 'QL51, TP. Bà Rịa',
            coordinates: { lat: 10.5050, lng: 107.1700 },
            order: 2,
            estimatedArrivalMinutes: 90,
            stopDuration: 10,
          },
        ],
        distance: 125,
        estimatedDuration: 150,
        isActive: true,
      },

      // Route 14: TP.HCM → Cần Thơ (Kumho)
      {
        operatorId: operators[4]._id,
        routeCode: 'HCM-CT-KS001',
        routeName: 'TP. Hồ Chí Minh - Cần Thơ (Kumho)',
        origin: {
          city: 'TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          station: 'Bến xe Miền Tây',
          address: 'Đường Kinh Dương Vương, Q. Bình Tân',
          coordinates: { lat: 10.7390, lng: 106.6180 },
        },
        destination: {
          city: 'Cần Thơ',
          province: 'Cần Thơ',
          station: 'Bến xe Cần Thơ',
          address: 'Đường 30 Tháng 4, Q. Ninh Kiều',
          coordinates: { lat: 10.0341, lng: 105.7720 },
        },
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Tây',
            address: 'Đường Kinh Dương Vương, Q. Bình Tân',
            coordinates: { lat: 10.7390, lng: 106.6180 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Cần Thơ',
            address: 'Đường 30 Tháng 4, Q. Ninh Kiều',
            coordinates: { lat: 10.0341, lng: 105.7720 },
          },
        ],
        stops: [
          {
            name: 'Trạm Mỹ Thuận',
            address: 'QL1A, Cầu Mỹ Thuận',
            coordinates: { lat: 10.2500, lng: 105.9000 },
            order: 1,
            estimatedArrivalMinutes: 90,
            stopDuration: 15,
          },
        ],
        distance: 169,
        estimatedDuration: 180,
        isActive: true,
      },

      // Route 15: TP.HCM → Phan Thiết (Kumho)
      {
        operatorId: operators[4]._id,
        routeCode: 'HCM-PT-KS001',
        routeName: 'TP. Hồ Chí Minh - Phan Thiết (Kumho)',
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
        pickupPoints: [
          {
            name: 'Điểm đón Bến xe Miền Đông',
            address: '292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh',
            coordinates: { lat: 10.8142, lng: 106.7053 },
          },
        ],
        dropoffPoints: [
          {
            name: 'Điểm trả Bến xe Phan Thiết',
            address: 'Đường Tô Hiến Thành, P. Phú Thủy',
            coordinates: { lat: 10.9281, lng: 108.1014 },
          },
        ],
        stops: [
          {
            name: 'Trạm Hàm Thuận',
            address: 'QL1A, Hàm Thuận Nam',
            coordinates: { lat: 10.8000, lng: 107.7000 },
            order: 1,
            estimatedArrivalMinutes: 120,
            stopDuration: 15,
          },
        ],
        distance: 200,
        estimatedDuration: 180,
        isActive: true,
      },
    ]);

    console.log(`Created ${routes.length} routes`);
    console.log(`   - Total Stops Configured: ${routes.reduce((sum, r) => sum + r.stops.length, 0)}`);
    console.log(`   - Total Pickup Points: ${routes.reduce((sum, r) => sum + r.pickupPoints.length, 0)}`);
    console.log(`   - Total Dropoff Points: ${routes.reduce((sum, r) => sum + r.dropoffPoints.length, 0)}\n`);

    // ==================== SUMMARY ====================
    console.log('\n📊 ==================== SEED SUMMARY ====================');
    console.log(`Bus Operators: ${operators.length}`);
    console.log(`Employees: ${employees.length}`);
    console.log(`   - Drivers: ${employees.filter(e => e.role === 'driver').length}`);
    console.log(`   - Trip Managers: ${employees.filter(e => e.role === 'trip_manager').length}`);
    console.log(`Routes: ${routes.length}`);
    console.log(`   - Phương Trang: ${routes.filter(r => r.operatorId.equals(operators[0]._id)).length} routes`);
    console.log(`   - Thành Bưởi: ${routes.filter(r => r.operatorId.equals(operators[1]._id)).length} routes`);
    console.log(`   - Hải Âu: ${routes.filter(r => r.operatorId.equals(operators[2]._id)).length} routes`);
    console.log(`   - Mai Linh: ${routes.filter(r => r.operatorId.equals(operators[3]._id)).length} routes`);
    console.log(`   - Kumho Samco: ${routes.filter(r => r.operatorId.equals(operators[4]._id)).length} routes`);
    console.log('========================================================\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Operators: operator1@quikride.com / operator123');
    console.log('   Trip Manager: hoa.manager@phuongtrang.com / manager123');
    console.log('   Driver: long.driver@phuongtrang.com / driver123\n');

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

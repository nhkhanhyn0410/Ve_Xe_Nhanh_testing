import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js'; // Adjust path as needed

/**
 * BusOperator Schema
 * Manages bus operator (company) information and verification status
 */
const BusOperatorSchema = new mongoose.Schema(
  {
    // Basic Info
    companyName: {
      type: String,
      required: [true, 'Tên công ty là bắt buộc'],
      unique: true,
      trim: true,
      maxlength: [200, 'Tên công ty không được quá 200 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email không hợp lệ',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false,
    },

    // Business Info
    businessLicense: {
      type: String,
      required: [true, 'Giấy phép kinh doanh là bắt buộc'],
      trim: true,
    },
    taxCode: {
      type: String,
      required: [true, 'Mã số thuế là bắt buộc'],
      trim: true,
    },
    logo: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      maxlength: [1000, 'Mô tả không được quá 1000 ký tự'],
      default: '',
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        'URL website không hợp lệ',
      ],
    },

    // Address
    address: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
      country: { type: String, default: 'Vietnam' },
    },

    // Bank Info
    bankInfo: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
    },

    // Approval Status
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Trạng thái xác thực phải là: pending, approved, hoặc rejected',
      },
      default: 'pending',
    },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: null },

    // Rating & Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating không thể nhỏ hơn 0'],
      max: [5, 'Rating không thể lớn hơn 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng đánh giá không thể âm'],
    },

    // Statistics
    totalTrips: { type: Number, default: 0, min: [0, 'Số chuyến không thể âm'] },
    totalRevenue: { type: Number, default: 0, min: [0, 'Doanh thu không thể âm'] },

    // Commission
    commissionRate: {
      type: Number,
      default: 5,
      min: [0, 'Tỷ lệ hoa hồng không thể âm'],
      max: [100, 'Tỷ lệ hoa hồng không thể lớn hơn 100'],
    },

    // Status
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: null },
    suspendedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
BusOperatorSchema.index({ companyName: 1 });
BusOperatorSchema.index({ email: 1 });
BusOperatorSchema.index({ verificationStatus: 1 });
BusOperatorSchema.index({ averageRating: -1 });
BusOperatorSchema.index({ createdAt: -1 });

// Hash password before saving
BusOperatorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    logger.info(`Password hashed for operator: ${this.email}`);
    next();
  } catch (error) {
    logger.error(`Password hashing failed for ${this.email}:`, error);
    next(error);
  }
});

// Method to compare password for login
BusOperatorSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error('Password comparison error:', error);
    throw new Error('Lỗi so sánh mật khẩu');
  }
};

// Static methods
BusOperatorSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

BusOperatorSchema.statics.findByCompanyName = function (companyName) {
  return this.findOne({ companyName });
};

// Virtuals
BusOperatorSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  const parts = [
    this.address.street,
    this.address.ward,
    this.address.district,
    this.address.city,
    this.address.country,
  ].filter(Boolean);
  return parts.join(', ');
});

BusOperatorSchema.virtual('role').get(function () {
  return 'operator';
});

BusOperatorSchema.virtual('verificationStatusLabel').get(function () {
  const labels = {
    pending: 'Đang chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Bị từ chối',
  };
  return labels[this.verificationStatus] || this.verificationStatus;
});

// Instance methods
BusOperatorSchema.methods.approve = async function (adminId) {
  this.verificationStatus = 'approved';
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  this.rejectionReason = null;
  logger.info(`Operator approved: ${this.email}`);
  return this.save();
};

BusOperatorSchema.methods.reject = async function (adminId, reason) {
  this.verificationStatus = 'rejected';
  this.verifiedAt = new Date();
  this.verifiedBy = adminId;
  this.rejectionReason = reason;
  logger.warn(`Operator rejected: ${this.email} - Reason: ${reason}`);
  return this.save();
};

BusOperatorSchema.methods.suspend = async function (reason) {
  this.isSuspended = true;
  this.suspensionReason = reason;
  this.suspendedAt = new Date();
  logger.warn(`Operator suspended: ${this.email} - Reason: ${reason}`);
  return this.save();
};

BusOperatorSchema.methods.resume = async function () {
  this.isSuspended = false;
  this.suspensionReason = null;
  this.suspendedAt = null;
  logger.info(`Operator resumed: ${this.email}`);
  return this.save();
};

const BusOperator = mongoose.model('BusOperator', BusOperatorSchema);

export default BusOperator;

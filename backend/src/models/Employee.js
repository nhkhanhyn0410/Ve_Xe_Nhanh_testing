import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js'; // Adjust path as needed

/**
 * Employee Schema
 * Quản lý nhân viên của nhà xe (tài xế và quản lý chuyến)
 */
const EmployeeSchema = new mongoose.Schema(
  {
    // Owner
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusOperator',
      required: [true, 'Operator ID là bắt buộc'],
      index: true,
    },

    // Employee Info
    employeeCode: {
      type: String,
      required: [true, 'Mã nhân viên là bắt buộc'],
      uppercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },

    idCard: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => {
          if (!v) return true;
          return /^[0-9]{9,12}$/.test(v);
        },
        message: 'CMND/CCCD không hợp lệ (9-12 chữ số)',
      },
    },

    address: {
      type: String,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;
          const age = (new Date() - new Date(v)) / (365.25 * 24 * 60 * 60 * 1000);
          return age >= 18 && age <= 70;
        },
        message: 'Tuổi nhân viên phải từ 18-70',
      },
    },

    // Authentication
    password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false,
    },

    // Role
    role: {
      type: String,
      enum: {
        values: ['driver', 'trip_manager'],
        message: 'Role phải là driver hoặc trip_manager',
      },
      required: [true, 'Role là bắt buộc'],
    },

    // Driver-specific fields
    licenseNumber: {
      type: String,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.role === 'driver') {
            return !!v;
          }
          return true;
        },
        message: 'Số giấy phép lái xe là bắt buộc cho tài xế',
      },
    },

    licenseClass: {
      type: String,
      uppercase: true,
      enum: {
        values: ['', 'B', 'C', 'D', 'E', 'FB', 'FC', 'FD', 'FE'],
        message: 'Hạng giấy phép không hợp lệ',
      },
      validate: {
        validator: function (v) {
          if (this.role === 'driver') {
            return !!v;
          }
          return true;
        },
        message: 'Hạng giấy phép là bắt buộc cho tài xế',
      },
    },

    licenseExpiry: {
      type: Date,
      validate: {
        validator: function (v) {
          if (this.role === 'driver') {
            if (!v) return false;
            return new Date(v) > new Date();
          }
          return true;
        },
        message: 'Giấy phép lái xe đã hết hạn hoặc không hợp lệ',
      },
    },

    // Status
    status: {
      type: String,
      enum: {
        values: ['active', 'on_leave', 'suspended', 'terminated'],
        message: 'Trạng thái không hợp lệ',
      },
      default: 'active',
    },

    // Work History
    hireDate: {
      type: Date,
      default: Date.now,
    },

    terminationDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v > this.hireDate;
        },
        message: 'Ngày nghỉ việc phải sau ngày tuyển dụng',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Indexes
 */
EmployeeSchema.index({ operatorId: 1, employeeCode: 1 }, { unique: true });
EmployeeSchema.index({ operatorId: 1, role: 1, status: 1 });
EmployeeSchema.index({ phone: 1 });

/**
 * Pre-save Middleware
 */
EmployeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    logger.error('Error hashing password:', error);
    next(error);
  }
});

/**
 * Instance Methods
 */
EmployeeSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

EmployeeSchema.methods.canBeAssignedToTrips = function () {
  if (this.status !== 'active') return false;

  if (this.role === 'driver') {
    return this.licenseExpiry && new Date(this.licenseExpiry) > new Date();
  }

  return true;
};

EmployeeSchema.methods.getPublicInfo = function () {
  return {
    _id: this._id,
    employeeCode: this.employeeCode,
    fullName: this.fullName,
    phone: this.phone,
    email: this.email,
    role: this.role,
    status: this.status,
    licenseClass: this.licenseClass,
    hireDate: this.hireDate,
  };
};

/**
 * Virtuals
 */
EmployeeSchema.virtual('yearsOfService').get(function () {
  const endDate = this.terminationDate || new Date();
  const years = (endDate - this.hireDate) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, years.toFixed(1));
});

EmployeeSchema.virtual('isLicenseExpiringSoon').get(function () {
  if (this.role !== 'driver' || !this.licenseExpiry) return false;

  const daysUntilExpiry =
    (new Date(this.licenseExpiry) - new Date()) / (24 * 60 * 60 * 1000);
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
});

/**
 * Static Methods
 */
EmployeeSchema.statics.findByOperator = function (operatorId, filters = {}) {
  const query = { operatorId };

  if (filters.role) query.role = filters.role;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    query.$or = [
      { fullName: new RegExp(filters.search, 'i') },
      { employeeCode: new RegExp(filters.search, 'i') },
      { phone: new RegExp(filters.search, 'i') },
    ];
  }

  logger.debug('Finding employees with query:', query);
  return this.find(query).select('-password').sort({ createdAt: -1 });
};

EmployeeSchema.statics.findAvailableForTrips = function (operatorId, role) {
  const query = {
    operatorId,
    role,
    status: 'active',
  };

  if (role === 'driver') {
    query.licenseExpiry = { $gt: new Date() };
  }

  logger.debug('Finding available employees for trips:', { operatorId, role });
  return this.find(query).select('-password').sort({ fullName: 1 });
};

export default mongoose.model('Employee', EmployeeSchema);

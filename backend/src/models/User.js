import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        // Thông tin cơ bản
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
        },
        phone: {
            type: String,
            required: [true, 'Số điện thoại là bắt buộc'],
            unique: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Số điện thoại không hợp lệ'],
        },
        password: {
            type: String,
            required: function () {
                // Password chỉ bắt buộc nếu không phải OAuth user
                return !this.googleId && !this.facebookId;
            },
            minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
            select: false // không trả về password khi query
        },
        fullName: {
            type: String,
            required: [true, 'Họ và tên là bắt buộc'],
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'orther'],
        },
        avatar: {
            type: String,
            default: null,
        },

        //Role
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },

        //OAuth
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        facebookId: {
            type: String,
            unique: true,
            sparse: true,
        },

        //Verification
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isPhoneVerified: {
            type: Boolean,
            defaule: false,
        },
        emailVerificationToken: {
            type: String,
            select: false,
        },
        phoneVerificationOTP: {
            type: String,
            select: false,
        },
        otpExpires: {
            type: Date,
            select: false,
        },

        // Security
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
        },
        lastLogin: {
            type: Date,
        },

        // Preferences - Danh sách hành khách thường đi (max 5)
        savedPassengers: [
            {
                fullName: {
                    type: String,
                    required: true,
                },
                phone: {
                    type: String,
                    required: true,
                },
                idCard: {
                    type: String,
                    required: true,
                },
            },
        ],

        // Loyalty Program
        loyaltyTier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            default: 'bronze',
        },
        totalPoints: {
            type: Number,
            default: 0,
        },
        pointsHistory: [
            {
                points: {
                    type: Number,
                    required: true,
                },
                reason: {
                    type: String,
                    required: true,
                },
                tripId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Trip',
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        blockedReason: {
            type: String,
        },
        blockedAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.__v;
                return ret;
            },
        },
        toObject: { virtuals: true },
    }
);

// Indexes cho hiệu suất
// Note: email, phone, googleId, facebookId đã có index tự động từ unique: true và sparse: true
userSchema.index({ createdAt: -1 });
userSchema.index({ loyaltyTier: 1, totalPoints: -1 });

// Pre-save middleware - Hash password trước khi lưu
userSchema.pre('save', async function (next) {
    // Chỉ hash password nếu nó được thay đổi hoặc là mới
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Hash password với bcrypt (salt rounds: 12)
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method - So sánh password
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Lỗi khi so sánh mật khẩu');
    }
};

// Instance method - Tạo password reset token
userSchema.methods.createPasswordResetToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token và lưu vào database
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token hết hạn sau 10 phút
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Trả về token chưa hash để gửi qua email
    return resetToken;
};

// Instance method - Tạo email verification token
userSchema.methods.createEmailVerificationToken = function () {
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash token và lưu vào database
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    // Trả về token chưa hash để gửi qua email
    return verificationToken;
};

// Instance method - Tạo OTP cho phone verification
userSchema.methods.createPhoneOTP = function () {
    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào database (có thể hash nếu cần)
    this.phoneVerificationOTP = otp;

    // OTP hết hạn sau 5 phút
    this.otpExpires = Date.now() + 5 * 60 * 1000;

    return otp;
};

// Instance method - Thêm loyalty points
userSchema.methods.addPoints = function (points, reason, tripId = null) {
    this.totalPoints += points;

    this.pointsHistory.push({
        points,
        reason,
        tripId,
    });

    // Cập nhật hạng khách hàng thân thiết dựa trên tổng điểm
    if (this.totalPoints >= 10000) {
        this.loyaltyTier = 'platinum';
    } else if (this.totalPoints >= 5000) {
        this.loyaltyTier = 'gold';
    } else if (this.totalPoints >= 2000) {
        this.loyaltyTier = 'silver';
    } else {
        this.loyaltyTier = 'bronze';
    }
};

// Static method - Tìm user bằng email hoặc phone
userSchema.statics.findByEmailOrPhone = function (identifier) {
    return this.findOne({
        $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });
};

const User = mongoose.model('User', userSchema);

export default User;
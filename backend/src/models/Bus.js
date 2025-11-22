import { Schema, Types, model } from 'mongoose';
import logger from '../utils/logger.js'; // Add your logger path

/**
 * Bus Schema
 * Manages buses for operators
 */

// Sub-schema for seat layout
const SeatLayoutSchema = new Schema(
    {
        floors: {
            type: Number,
            required: [true, 'Số tầng là bắt buộc'],
            enum: {
                values: [1, 2],
                message: 'Số tầng phải là 1 hoặc 2',
            },
        },
        rows: {
            type: Number,
            required: [true, 'Số hàng ghế là bắt buộc'],
            min: [1, 'Số hàng ghế phải lớn hơn 0'],
            max: [20, 'Số hàng ghế không được quá 20'],
        },
        columns: {
            type: Number,
            required: [true, 'Số cột ghế là bắt buộc'],
            min: [1, 'Số cột ghế phải lớn hơn 0'],
            max: [10, 'Số cột ghế không được quá 10'],
        },
        layout: {
            type: [[String]],
            required: [true, 'Sơ đồ ghế là bắt buộc'],
            validate: {
                validator: (layout) => {
                    if (!Array.isArray(layout) || layout.length === 0) return false;
                    const columnCount = layout[0].length;
                    return layout.every((row) => Array.isArray(row) && row.length === columnCount);
                },
                message: 'Sơ đồ ghế không hợp lệ',
            },
        },
        totalSeats: {
            type: Number,
            required: [true, 'Tổng số ghế là bắt buộc'],
            min: [1, 'Tổng số ghế phải lớn hơn 0'],
            max: [200, 'Tổng số ghế không được quá 200'],
        },
    },
    { _id: false }
);

const BusSchema = new Schema(
    {
        operatorId: {
            type: Schema.Types.ObjectId,
            ref: 'BusOperator',
            required: [true, 'Operator ID là bắt buộc'],
            index: true,
        },
        busNumber: {
            type: String,
            required: [true, 'Biển số xe là bắt buộc'],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Z0-9-]+$/, 'Biển số xe chỉ được chứa chữ hoa, số và dấu gạch ngang'],
            maxlength: [20, 'Biển số xe không được quá 20 ký tự'],
        },
        busType: {
            type: String,
            required: [true, 'Loại xe là bắt buộc'],
            enum: {
                values: ['limousine', 'sleeper', 'seater', 'double_decker'],
                message: 'Loại xe phải là limousine, sleeper, seater hoặc double_decker',
            },
            index: true,
        },
        seatLayout: {
            type: SeatLayoutSchema,
            required: [true, 'Cấu hình ghế là bắt buộc'],
        },
        amenities: {
            type: [String],
            default: [],
            validate: {
                validator: (amenities) => {
                    const validAmenities = ['wifi', 'ac', 'toilet', 'tv', 'water', 'blanket', 'pillow', 'charging', 'snack', 'entertainment'];
                    return amenities.every((amenity) => validAmenities.includes(amenity.toLowerCase()));
                },
                message: 'Tiện ích không hợp lệ. Chỉ chấp nhận: wifi, ac, toilet, tv, water, blanket, pillow, charging, snack, entertainment',
            },
        },
        status: {
            type: String,
            required: [true, 'Trạng thái xe là bắt buộc'],
            enum: {
                values: ['active', 'maintenance', 'retired'],
                message: 'Trạng thái xe phải là active, maintenance hoặc retired',
            },
            default: 'active',
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

BusSchema.index({ operatorId: 1, status: 1 });
BusSchema.index({ busType: 1, status: 1 });

BusSchema.virtual('displayName').get(function () {
    return `${this.busNumber} (${this.busType})`;
});

BusSchema.virtual('isAvailable').get(function () {
    return this.status === 'active';
});

BusSchema.pre('save', function (next) {
    if (this.seatLayout?.layout) {
        const totalSeats = this.seatLayout.layout.reduce((count, row) => {
            return count + row.filter((seat) =>
                seat &&
                seat !== '' &&
                seat !== 'DRIVER' &&
                seat !== 'FLOOR_2' &&
                seat !== '🚗' &&
                seat.toUpperCase() !== 'AISLE' &&
                !seat.toLowerCase().includes('aisle')
            ).length;
        }, 0);

        this.seatLayout.totalSeats = totalSeats;
        logger.info(`Bus seat calculation - Total seats: ${totalSeats}`);
    }
    next();
});

BusSchema.methods.activate = async function () {
    this.status = 'active';
    logger.info(`Bus activated: ${this.busNumber}`);
    return this.save();
};

BusSchema.methods.setMaintenance = async function () {
    this.status = 'maintenance';
    logger.info(`Bus set to maintenance: ${this.busNumber}`);
    return this.save();
};

BusSchema.methods.retire = async function () {
    this.status = 'retired';
    logger.info(`Bus retired: ${this.busNumber}`);
    return this.save();
};

BusSchema.methods.addAmenity = async function (amenity) {
    const validAmenities = ['wifi', 'ac', 'toilet', 'tv', 'water', 'blanket', 'pillow', 'charging', 'snack', 'entertainment'];
    const lowerAmenity = amenity.toLowerCase();

    if (!validAmenities.includes(lowerAmenity)) {
        logger.warn(`Invalid amenity attempted: ${amenity}`);
        throw new Error('Tiện ích không hợp lệ');
    }

    if (!this.amenities.includes(lowerAmenity)) {
        this.amenities.push(lowerAmenity);
        logger.info(`Amenity added to bus ${this.busNumber}: ${lowerAmenity}`);
        return this.save();
    }

    return this;
};

BusSchema.methods.removeAmenity = async function (amenity) {
    this.amenities = this.amenities.filter((a) => a !== amenity.toLowerCase());
    logger.info(`Amenity removed from bus ${this.busNumber}: ${amenity}`);
    return this.save();
};

BusSchema.statics.findByBusNumber = function (busNumber) {
    return this.findOne({ busNumber: busNumber.toUpperCase() });
};

BusSchema.statics.findByOperator = function (operatorId, statusFilter = null) {
    const query = { operatorId };
    if (statusFilter) query.status = statusFilter;
    return this.find(query);
};

BusSchema.statics.findActiveBusesByOperator = function (operatorId) {
    return this.find({ operatorId, status: 'active' });
};

BusSchema.statics.countByType = async function (operatorId) {
    return this.aggregate([
        { $match: { operatorId: new Types.ObjectId(operatorId) } },
        { $group: { _id: '$busType', count: { $sum: 1 } } },
    ]);
};

BusSchema.statics.findByType = function (busType, activeOnly = false) {
    const query = { busType };
    if (activeOnly) query.status = 'active';
    return this.find(query).populate('operatorId', 'companyName averageRating');
};

const Bus = model('Bus', BusSchema);

export default Bus;

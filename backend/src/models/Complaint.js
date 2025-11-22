import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // Adjust path as needed

const complaintSchema = new mongoose.Schema(
  {
    // Basic Info
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được quá 200 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Mô tả là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'booking',
        'payment',
        'service',
        'driver',
        'vehicle',
        'refund',
        'technical',
        'other',
      ],
      required: [true, 'Danh mục là bắt buộc'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
      default: 'open',
    },

    // User Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },

    // Related Entities
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Operator',
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
    },

    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
    },

    // Attachments
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Notes and Comments
    notes: [
      {
        content: {
          type: String,
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        addedByRole: {
          type: String,
          enum: ['admin', 'customer'],
          required: true,
        },
        isInternal: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Resolution
    resolution: {
      type: String,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },

    // Satisfaction
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    satisfactionFeedback: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
complaintSchema.index({ ticketNumber: 1 });
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ bookingId: 1 });
complaintSchema.index({ createdAt: -1 });

// Generate ticket number
complaintSchema.pre('save', async function (next) {
  try {
    if (this.isNew && !this.ticketNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const count = await this.constructor.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const sequence = String(count + 1).padStart(5, '0');
      this.ticketNumber = `TCKT-${year}${month}${day}-${sequence}`;
      logger.info(`Generated ticket number: ${this.ticketNumber}`);
    }
    next();
  } catch (error) {
    logger.error(`Error generating ticket number: ${error.message}`);
    next(error);
  }
});

complaintSchema.methods.addNote = function (content, userId, userRole, isInternal = false) {
  this.notes.push({ content, addedBy: userId, addedByRole: userRole, isInternal });
  logger.info(`Note added to complaint ${this.ticketNumber}`);
  return this.save();
};

complaintSchema.methods.assignTo = function (adminId) {
  this.assignedTo = adminId;
  this.assignedAt = Date.now();
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  logger.info(`Complaint ${this.ticketNumber} assigned to ${adminId}`);
  return this.save();
};

complaintSchema.methods.resolve = function (resolution, adminId) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedBy = adminId;
  this.resolvedAt = Date.now();
  logger.info(`Complaint ${this.ticketNumber} resolved by ${adminId}`);
  return this.save();
};

complaintSchema.methods.close = function () {
  this.status = 'closed';
  this.closedAt = Date.now();
  logger.info(`Complaint ${this.ticketNumber} closed`);
  return this.save();
};

complaintSchema.methods.addSatisfactionRating = function (rating, feedback = '') {
  if (this.status !== 'resolved' && this.status !== 'closed') {
    const error = new Error('Chỉ có thể đánh giá khi khiếu nại đã được giải quyết');
    logger.warn(`Invalid satisfaction rating attempt for ${this.ticketNumber}`);
    throw error;
  }
  this.satisfactionRating = rating;
  this.satisfactionFeedback = feedback;
  logger.info(`Satisfaction rating added to ${this.ticketNumber}: ${rating}`);
  return this.save();
};

complaintSchema.statics.getStatistics = async function (startDate, endDate) {
  try {
    const match = {};
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [stats] = await this.aggregate([
      { $match: match },
      {
        $facet: {
          byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
          byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
          avgResolutionTime: [
            { $match: { resolvedAt: { $exists: true } } },
            { $project: { resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] } } },
            { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } },
          ],
          satisfaction: [
            { $match: { satisfactionRating: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$satisfactionRating' }, totalRatings: { $sum: 1 } } },
          ],
        },
      },
    ]);

    logger.info('Complaint statistics retrieved successfully');
    return stats;
  } catch (error) {
    logger.error(`Error fetching complaint statistics: ${error.message}`);
    throw error;
  }
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;

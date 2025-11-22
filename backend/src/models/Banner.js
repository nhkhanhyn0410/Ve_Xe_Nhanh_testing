import mongoose from 'mongoose';
import logger from '../config/logger.js';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề banner là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được quá 200 ký tự'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Hình ảnh banner là bắt buộc'],
    },
    mobileImageUrl: {
      type: String,
    },
    linkUrl: {
      type: String,
      trim: true,
    },
    linkText: {
      type: String,
      trim: true,
      default: 'Xem thêm',
    },
    position: {
      type: String,
      enum: ['homepage', 'booking', 'routes', 'footer'],
      default: 'homepage',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
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

bannerSchema.index({ position: 1, order: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

bannerSchema.virtual('isCurrentlyActive').get(function () {
  if (!this.isActive) return false;

  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;

  return true;
});

bannerSchema.methods.incrementView = async function () {
  try {
    this.viewCount += 1;
    await this.save({ validateBeforeSave: false });
    logger.info(`Banner ${this._id} số lượt xem tăng lên ${this.viewCount}`);
  } catch (error) {
    logger.error(`Lỗi tăng số lượt xem cho banner ${this._id}:`, error);
    throw error;
  }
};

bannerSchema.methods.incrementClick = async function () {
  try {
    this.clickCount += 1;
    await this.save({ validateBeforeSave: false });
    logger.info(`Banner ${this._id} số lần nhấp đã tăng lên ${this.clickCount}`);
  } catch (error) {
    logger.error(`Lỗi tăng số lần nhấp chuột cho banner ${this._id}:`, error);
    throw error;
  }
};

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;

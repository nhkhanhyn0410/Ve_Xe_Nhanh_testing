import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // adjust path as needed

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết là bắt buộc'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được quá 200 ký tự'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Tóm tắt bài viết là bắt buộc'],
      trim: true,
      maxlength: [500, 'Tóm tắt không được quá 500 ký tự'],
    },
    content: {
      type: String,
      required: [true, 'Nội dung bài viết là bắt buộc'],
    },
    featuredImage: {
      type: String,
      required: [true, 'Ảnh đại diện là bắt buộc'],
    },
    category: {
      type: String,
      enum: ['news', 'guide', 'promotion', 'travel_tips', 'company', 'other'],
      default: 'news',
    },
    tags: [{ type: String, trim: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: Date,
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    metaTitle: { type: String, trim: true, maxlength: [60, 'Meta title không được quá 60 ký tự'] },
    metaDescription: { type: String, trim: true, maxlength: [160, 'Meta description không được quá 160 ký tự'] },
    metaKeywords: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } },
    toObject: { virtuals: true },
  }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    logger.info(`Generated slug: ${this.slug}`);
  }

  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    logger.info(`Blog published: ${this._id}`);
  }

  next();
});

blogSchema.methods.incrementView = function () {
  this.viewCount += 1;
  logger.debug(`Số lượt xem đã tăng lên cho blog: ${this._id}`);
  return this.save({ validateBeforeSave: false });
};

blogSchema.methods.incrementLike = function () {
  this.likeCount += 1;
  return this.save({ validateBeforeSave: false });
};

blogSchema.methods.decrementLike = function () {
  if (this.likeCount > 0) {
    this.likeCount -= 1;
    return this.save({ validateBeforeSave: false });
  }
};

blogSchema.statics.getPublished = function (filters = {}) {
  logger.info('Đang tìm nạp đã xuất bản blogs');
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() },
    ...filters,
  }).sort({ publishedAt: -1 });
};

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;

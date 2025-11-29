const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Câu hỏi là bắt buộc'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Câu trả lời là bắt buộc'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'booking',
        'payment',
        'cancellation',
        'account',
        'tickets',
        'routes',
        'policies',
        'technical',
        'other',
      ],
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    notHelpfulCount: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
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

// Indexes
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ tags: 1 });
faqSchema.index({ question: 'text', answer: 'text' });

// Virtual - helpfulness percentage
faqSchema.virtual('helpfulnessRatio').get(function () {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return 0;
  return (this.helpfulCount / total) * 100;
});

// Instance method - increment view count
faqSchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method - mark as helpful
faqSchema.methods.markHelpful = function () {
  this.helpfulCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method - mark as not helpful
faqSchema.methods.markNotHelpful = function () {
  this.notHelpfulCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method - get active FAQs by category
faqSchema.statics.getByCategory = function (category) {
  return this.find({
    category,
    isActive: true,
  }).sort({ order: 1 });
};

// Static method - search FAQs
faqSchema.statics.search = function (searchTerm) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  }).sort({ score: { $meta: 'textScore' } });
};

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;

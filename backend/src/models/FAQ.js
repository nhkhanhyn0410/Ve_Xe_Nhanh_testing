import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // Adjust path as needed

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
      transform: (doc, ret) => {
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

// Instance methods
faqSchema.methods.incrementView = async function () {
  try {
    this.viewCount += 1;
    await this.save({ validateBeforeSave: false });
    logger.info(`FAQ view incremented: ${this._id}`);
  } catch (error) {
    logger.error(`Error incrementing view for FAQ ${this._id}:`, error);
    throw error;
  }
};

faqSchema.methods.markHelpful = async function () {
  try {
    this.helpfulCount += 1;
    await this.save({ validateBeforeSave: false });
    logger.info(`FAQ marked helpful: ${this._id}`);
  } catch (error) {
    logger.error(`Error marking FAQ helpful ${this._id}:`, error);
    throw error;
  }
};

faqSchema.methods.markNotHelpful = async function () {
  try {
    this.notHelpfulCount += 1;
    await this.save({ validateBeforeSave: false });
    logger.info(`FAQ marked not helpful: ${this._id}`);
  } catch (error) {
    logger.error(`Error marking FAQ not helpful ${this._id}:`, error);
    throw error;
  }
};

// Static methods
faqSchema.statics.getByCategory = async function (category) {
  try {
    const faqs = await this.find({ category, isActive: true }).sort({ order: 1 });
    logger.info(`Retrieved FAQs for category: ${category}`);
    return faqs;
  } catch (error) {
    logger.error(`Error fetching FAQs by category ${category}:`, error);
    throw error;
  }
};

faqSchema.statics.search = async function (searchTerm) {
  try {
    const results = await this.find({
      $text: { $search: searchTerm },
      isActive: true,
    }).sort({ score: { $meta: 'textScore' } });
    logger.info(`FAQ search completed: ${searchTerm}`);
    return results;
  } catch (error) {
    logger.error(`Error searching FAQs with term "${searchTerm}":`, error);
    throw error;
  }
};

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;

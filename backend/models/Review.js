import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExchangeRequest',
      required: true,
      index: true
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    skillTaught: {
      type: String,
      default: '',
      trim: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    criteria: {
      punctuality: { type: Number, default: 5, min: 1, max: 5 },
      clarity: { type: Number, default: 5, min: 1, max: 5 },
      helpfulness: { type: Number, default: 5, min: 1, max: 5 }
    },
    comment: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews from the same reviewer for the same exchange request
reviewSchema.index({ exchangeRequest: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;

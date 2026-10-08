import mongoose from 'mongoose';

const exchangeRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required']
    },
    offeredSkill: {
      type: String,
      required: [true, 'Offered skill is required'],
      trim: true
    },
    requestedSkill: {
      type: String,
      required: [true, 'Requested skill is required'],
      trim: true
    },
    message: {
      type: String,
      default: '',
      trim: true
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid exchange request status'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes to speed up queries for sent and received requests
exchangeRequestSchema.index({ sender: 1, status: 1 });
exchangeRequestSchema.index({ receiver: 1, status: 1 });
exchangeRequestSchema.index({ sender: 1, receiver: 1, status: 1 });

const ExchangeRequest = mongoose.model('ExchangeRequest', exchangeRequestSchema);

export default ExchangeRequest;

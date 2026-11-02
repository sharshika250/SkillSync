import mongoose from 'mongoose';

const exchangeSessionSchema = new mongoose.Schema(
  {
    exchangeRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExchangeRequest',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: String,
      required: [true, 'Session date is required']
    },
    time: {
      type: String,
      required: [true, 'Session time is required']
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 240
    },
    meetingLink: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    senderConfirmedCompleted: {
      type: Boolean,
      default: false
    },
    receiverConfirmedCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

exchangeSessionSchema.index({ sender: 1, date: 1 });
exchangeSessionSchema.index({ receiver: 1, date: 1 });

const ExchangeSession = mongoose.model('ExchangeSession', exchangeSessionSchema);

export default ExchangeSession;

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: ['fake_skill', 'inappropriate_behavior', 'no_show', 'spam', 'other']
    },
    details: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },
    actionTaken: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;

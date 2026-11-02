import mongoose from 'mongoose';

const assessmentAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    skill: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['mcq', 'practical'],
      default: 'mcq'
    },
    difficulty: {
      type: String,
      enum: ['Basic', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    score: {
      type: Number,
      default: 0
    },
    totalPossible: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    verificationStatusAwarded: {
      type: String,
      enum: ['SELF_DECLARED', 'ASSESSMENT_PASSED', 'SKILL_VERIFIED', 'NOT_EARNED'],
      default: 'NOT_EARNED'
    },
    demonstratedLevel: {
      type: String,
      default: 'Not Demonstrated'
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    codeSubmission: {
      type: String,
      default: ''
    },
    practicalTestResults: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true
  }
);

assessmentAttemptSchema.index({ user: 1, skill: 1, createdAt: -1 });

const AssessmentAttempt = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);

export default AssessmentAttempt;

import mongoose from 'mongoose';

const learningGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    skill: {
      type: String,
      required: [true, 'Target skill is required'],
      trim: true
    },
    currentProficiency: {
      type: String,
      default: 'Beginner'
    },
    targetProficiency: {
      type: String,
      default: 'Advanced'
    },
    targetDate: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused'],
      default: 'in_progress'
    },
    milestones: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date }
      }
    ],
    journal: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        note: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

const LearningGoal = mongoose.model('LearningGoal', learningGoalSchema);

export default LearningGoal;

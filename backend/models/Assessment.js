import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, 'Skill is required'],
      trim: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Basic', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    type: {
      type: String,
      enum: ['mcq', 'practical'],
      default: 'mcq'
    },
    question: {
      type: String,
      required: [true, 'Question or problem title is required'],
      trim: true
    },
    options: {
      type: [String],
      default: []
    },
    correctOptionIndex: {
      type: Number,
      default: 0
    },
    explanation: {
      type: String,
      default: ''
    },
    practicalDetails: {
      problemStatement: { type: String, default: '' },
      language: { type: String, default: 'javascript' },
      starterCode: { type: String, default: '' },
      solutionTemplate: { type: String, default: '' },
      testCases: [
        {
          input: { type: String, default: '' },
          expectedOutput: { type: String, default: '' },
          description: { type: String, default: '' },
          isHidden: { type: Boolean, default: false }
        }
      ]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

assessmentSchema.index({ skill: 1, difficulty: 1, type: 1 });

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;

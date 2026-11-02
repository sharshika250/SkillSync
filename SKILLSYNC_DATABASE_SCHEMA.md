# SkillSync Database Schema Specification

Platform database: **MongoDB Atlas**
Object Document Mapper: **Mongoose**

---

## 1. Collections Overview

| Collection | Model File | Purpose | Key Indexes |
|---|---|---|---|
| `users` | `models/User.js` | Member identities, profiles, verified skill badges | `email` (unique), `role` |
| `exchangerequests` | `models/ExchangeRequest.js` | Skill exchange proposals & lifecycle | `sender + status`, `receiver + status`, `sender + receiver + status` |
| `assessments` | `models/Assessment.js` | Question bank (MCQs & coding challenges) | `skill + difficulty + type` |
| `assessmentattempts` | `models/AssessmentAttempt.js` | User assessment submission records | `user + skill + createdAt` |
| `exchangesessions` | `models/ExchangeSession.js` | Scheduled learning sessions & agendas | `sender + date`, `receiver + date` |
| `reviews` | `models/Review.js` | 1-5 star ratings & teaching feedback | `exchangeRequest + reviewer` (unique) |
| `learninggoals` | `models/LearningGoal.js` | Goal tracking, milestones, and reflections | `user` |
| `messages` | `models/Message.js` | Direct messages between exchange partners | `sender + receiver + createdAt` |
| `notifications` | `models/Notification.js` | In-app alerts and notifications | `user + read + createdAt` |
| `reports` | `models/Report.js` | Content and user moderation tickets | `status`, `reportedUser` |

---

## 2. Schema Details

### 2.1 User (`users`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, default: '' },
  skillsOffered: { type: [String], default: [] },
  skillsWanted: { type: [String], default: [] },
  role: { type: String, default: 'Student' },
  location: { type: String, default: '' },
  avatar: { type: String, default: '' },
  availability: { type: String, default: '' },
  verification: { type: Boolean, default: false },
  trustScore: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  portfolioLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  certificates: [{
    title: { type: String, required: true },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
    url: { type: String, default: '' }
  }],
  teachingExperience: { type: String, default: '' },
  badges: { type: [String], default: [] },
  skillVerifications: [{
    skill: { type: String, required: true },
    status: {
      type: String,
      enum: ['SELF_DECLARED', 'ASSESSMENT_PASSED', 'SKILL_VERIFIED'],
      default: 'SELF_DECLARED'
    },
    score: { type: Number, default: 0 },
    claimedProficiency: { type: String, default: 'Intermediate' },
    demonstratedProficiency: { type: String, default: 'Not Demonstrated' },
    verifiedAt: { type: Date, default: Date.now }
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 ExchangeRequest (`exchangerequests`)
```javascript
{
  sender: { type: ObjectId, ref: 'User', required: true },
  receiver: { type: ObjectId, ref: 'User', required: true },
  offeredSkill: { type: String, required: true },
  requestedSkill: { type: String, required: true },
  message: { type: String, default: '' },
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  senderConfirmedCompleted: { type: Boolean, default: false },
  receiverConfirmedCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 Assessment (`assessments`)
```javascript
{
  skill: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['Basic', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  type: { type: String, enum: ['mcq', 'practical'], default: 'mcq' },
  question: { type: String, required: true },
  options: [String],
  correctOptionIndex: { type: Number, default: 0 },
  explanation: { type: String, default: '' },
  practicalDetails: {
    problemStatement: String,
    language: { type: String, default: 'javascript' },
    starterCode: String,
    solutionTemplate: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      description: String,
      isHidden: { type: Boolean, default: false }
    }]
  },
  isActive: { type: Boolean, default: true }
}
```

### 2.4 Review (`reviews`)
```javascript
{
  exchangeRequest: { type: ObjectId, ref: 'ExchangeRequest', required: true },
  reviewer: { type: ObjectId, ref: 'User', required: true },
  reviewee: { type: ObjectId, ref: 'User', required: true },
  skillTaught: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  criteria: {
    punctuality: { type: Number, default: 5 },
    clarity: { type: Number, default: 5 },
    helpfulness: { type: Number, default: 5 }
  },
  comment: { type: String, default: '' }
}
// Unique compound index prevents duplicate reviews:
// { exchangeRequest: 1, reviewer: 1 }, { unique: true }
```

### 2.5 ExchangeSession (`exchangesessions`)
```javascript
{
  exchangeRequest: { type: ObjectId, ref: 'ExchangeRequest', required: true },
  sender: { type: ObjectId, ref: 'User', required: true },
  receiver: { type: ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  durationMinutes: { type: Number, default: 60 },
  meetingLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}
```

### 2.6 LearningGoal (`learninggoals`)
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  currentProficiency: { type: String, default: 'Beginner' },
  targetProficiency: { type: String, default: 'Advanced' },
  targetDate: { type: String, default: '' },
  status: { type: String, enum: ['in_progress', 'completed', 'paused'], default: 'in_progress' },
  milestones: [{
    id: String,
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  journal: [{
    id: String,
    note: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}
```

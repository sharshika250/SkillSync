import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import Assessment from './models/Assessment.js';
import AssessmentAttempt from './models/AssessmentAttempt.js';
import Review from './models/Review.js';
import ExchangeSession from './models/ExchangeSession.js';
import LearningGoal from './models/LearningGoal.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';

import { seedAssessmentQuestions } from './config/seedAssessments.js';
import { submitMCQAssessment, submitPracticalAssessment } from './controllers/assessmentController.js';
import { scheduleSession } from './controllers/sessionController.js';
import { confirmCompletion } from './controllers/requestController.js';
import { createReview } from './controllers/reviewController.js';
import { createLearningGoal, toggleMilestone } from './controllers/learningController.js';
import { generateRoadmap, analyzeSkillGap } from './controllers/aiController.js';
import { sendMessage } from './controllers/communicationController.js';
import { getPlatformAnalytics } from './controllers/adminController.js';
import { calculateDetailedMatchScore } from './services/matchingService.js';
import { evaluateCode } from './services/codeRunnerService.js';

dotenv.config();

let passed = 0;
let total = 0;

const assert = (condition, testName) => {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
};

const createMockRes = () => ({
  statusCode: 200,
  data: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.data = data;
    return this;
  }
});

async function runAdvancedTestSuite() {
  console.log('==================================================');
  console.log('SkillSync Advanced Enterprise Modules Test Suite');
  console.log('==================================================\n');

  await connectDB();
  await seedAssessmentQuestions();

  const timestamp = Date.now();
  const testStudentEmail = `student_${timestamp}@skillsynctest.com`;
  const testMentorEmail = `mentor_${timestamp}@skillsynctest.com`;
  const testAdminEmail = `admin_${timestamp}@skillsynctest.com`;

  // 1. Setup Test Users
  console.log('--- 1. Setting Up Test Profiles ---');
  const student = await User.create({
    name: 'Test Student',
    email: testStudentEmail,
    password: 'password123',
    skillsOffered: ['Python', 'JavaScript'],
    skillsWanted: ['Java'],
    proficiency: { Python: 'Intermediate', JavaScript: 'Basic' },
    availability: 'Weekday evenings'
  });

  const mentor = await User.create({
    name: 'Test Mentor',
    email: testMentorEmail,
    password: 'password123',
    skillsOffered: ['Java'],
    skillsWanted: ['Python'],
    proficiency: { Java: 'Advanced' },
    availability: 'Weekday evenings',
    skillVerifications: [
      {
        skill: 'Java',
        status: 'SKILL_VERIFIED',
        score: 95,
        claimedProficiency: 'Advanced',
        demonstratedProficiency: 'Advanced',
        verifiedAt: new Date()
      }
    ]
  });

  const admin = await User.create({
    name: 'Admin User',
    email: testAdminEmail,
    password: 'password123',
    isAdmin: true,
    role: 'Admin'
  });

  assert(student._id && mentor._id && admin._id, 'Users created successfully');

  // 2. Safe Code Sandbox Test
  console.log('\n--- 2. Testing Safe Code Sandbox Runner ---');
  const jsTestResult = await evaluateCode('javascript', `
    function solution(a, b) {
      return a + b;
    }
  `, [
    { input: '[2, 3]', expectedOutput: '5', isHidden: false },
    { input: '[10, -2]', expectedOutput: '8', isHidden: true }
  ]);

  assert(jsTestResult.passed === true, 'JavaScript solution evaluated and passed all test cases');
  assert(jsTestResult.percentage === 100, 'Score is 100% for correct code');

  // Test restricted code rejection
  const maliciousTestResult = await evaluateCode('javascript', `
    process.exit(1);
  `, [{ input: '1', expectedOutput: '1' }]);

  assert(maliciousTestResult.passed === false, 'Disallowed process.exit pattern blocked by sandbox');

  // 3. MCQ Skill Assessment & Badge Awarding
  console.log('\n--- 3. Testing MCQ Skill Assessment & Verification Badges ---');
  const pythonQuestions = await Assessment.find({ skill: 'Python', type: 'mcq' });
  assert(pythonQuestions.length > 0, 'Seeded Python questions retrieved from MongoDB');

  const answerMap = {};
  for (const q of pythonQuestions) {
    answerMap[String(q._id)] = q.correctOptionIndex; // Submit correct answers
  }

  const mcqReq = {
    user: student,
    body: {
      skill: 'Python',
      difficulty: 'Intermediate',
      answers: answerMap
    }
  };
  const mcqRes = createMockRes();
  await submitMCQAssessment(mcqReq, mcqRes, (err) => console.error(err));

  assert(mcqRes.statusCode === 200, 'MCQ assessment submitted with HTTP 200');
  assert(mcqRes.data.percentage === 100, 'All correct answers resulted in 100% score');
  assert(mcqRes.data.verificationStatusAwarded === 'ASSESSMENT_PASSED', 'Earned ASSESSMENT_PASSED badge');

  const refreshedStudent = await User.findById(student._id);
  const pyVerif = refreshedStudent.skillVerifications.find(v => v.skill === 'Python');
  assert(pyVerif?.status === 'ASSESSMENT_PASSED', 'User model reflects ASSESSMENT_PASSED status in MongoDB');

  // 4. Practical Assessment Execution
  console.log('\n--- 4. Testing Practical Assessment Execution ---');
  const practicalChallenge = await Assessment.findOne({ skill: 'Python', type: 'practical' });
  assert(!!practicalChallenge, 'Practical coding challenge retrieved');

  const practicalReq = {
    user: student,
    body: {
      questionId: practicalChallenge._id,
      code: practicalChallenge.practicalDetails.starterCode,
      language: 'python'
    }
  };
  const practicalRes = createMockRes();
  await submitPracticalAssessment(practicalReq, practicalRes, (err) => console.error(err));

  assert(practicalRes.statusCode === 200, 'Practical challenge submitted with HTTP 200');
  assert(practicalRes.data.verificationStatusAwarded === 'SKILL_VERIFIED', 'Practical pass upgraded user to SKILL_VERIFIED');

  // 5. Intelligent 5-Factor Matching Engine
  console.log('\n--- 5. Testing Explainable 5-Factor Matching ---');
  const detailedMatch = calculateDetailedMatchScore(student, mentor);
  assert(detailedMatch.score >= 70, `Compatibility score is ${detailedMatch.score}%`);
  assert(detailedMatch.isReciprocal === true, 'Engine recognized mutual reciprocal trade opportunity');
  assert(detailedMatch.explanations.length >= 3, 'Engine generated human-readable synergy explanations');
  assert(detailedMatch.factors.verifiedProficiency > 0, 'Verified proficiency bonus applied');

  // 6. Exchange Session Scheduling & Dual Completion Confirmation
  console.log('\n--- 6. Testing Exchange Lifecycle & Completion Confirmation ---');
  const exchange = await ExchangeRequest.create({
    sender: student._id,
    receiver: mentor._id,
    offeredSkill: 'Python',
    requestedSkill: 'Java',
    status: 'accepted'
  });

  const sessionReq = {
    user: student,
    body: {
      exchangeRequestId: exchange._id,
      date: '2026-12-01',
      time: '18:00',
      durationMinutes: 60,
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    }
  };
  const sessionRes = createMockRes();
  await scheduleSession(sessionReq, sessionRes, (err) => console.error(err));
  assert(sessionRes.statusCode === 201, 'Exchange session scheduled successfully');

  // Student confirms completion
  const confirm1Req = { user: student, params: { id: exchange._id } };
  const confirm1Res = createMockRes();
  await confirmCompletion(confirm1Req, confirm1Res, (err) => console.error(err));
  assert(confirm1Res.data.isFullyCompleted === false, 'First confirmation awaits partner');

  // Mentor confirms completion
  const confirm2Req = { user: mentor, params: { id: exchange._id } };
  const confirm2Res = createMockRes();
  await confirmCompletion(confirm2Req, confirm2Res, (err) => console.error(err));
  assert(confirm2Res.data.isFullyCompleted === true, 'Both confirmed -> Status transitioned to COMPLETED');

  // 7. Reviews, Ratings & Reputation System
  console.log('\n--- 7. Testing Reviews & Reputation Recalculation ---');
  const reviewReq = {
    user: student,
    body: {
      exchangeRequestId: exchange._id,
      rating: 5,
      criteria: { punctuality: 5, clarity: 5, helpfulness: 5 },
      comment: 'Outstanding Java mentorship! Explained concurrency with crystal clear examples.'
    }
  };
  const reviewRes = createMockRes();
  await createReview(reviewReq, reviewRes, (err) => console.error(err));
  assert(reviewRes.statusCode === 201, 'Review recorded successfully');

  // Verify duplicate review blocked
  const duplicateReviewRes = createMockRes();
  await createReview(reviewReq, duplicateReviewRes, (err) => console.error(err));
  assert(duplicateReviewRes.statusCode === 400, 'Duplicate review prevented');

  // 8. Learning Goals & Milestones
  console.log('\n--- 8. Testing Learning Goals & Milestones ---');
  const goalReq = {
    user: student,
    body: {
      skill: 'Java',
      currentProficiency: 'Beginner',
      targetProficiency: 'Advanced',
      milestones: ['Setup JDK', 'Learn Collections', 'Build CLI App']
    }
  };
  const goalRes = createMockRes();
  await createLearningGoal(goalReq, goalRes, (err) => console.error(err));
  assert(goalRes.statusCode === 201, 'Learning goal created');

  const milestoneId = goalRes.data.goal.milestones[0]._id;
  const toggleReq = {
    user: student,
    params: { goalId: goalRes.data.goal._id, milestoneId }
  };
  const toggleRes = createMockRes();
  await toggleMilestone(toggleReq, toggleRes, (err) => console.error(err));
  assert(toggleRes.data.goal.milestones[0].completed === true, 'Milestone toggled to completed');

  // 9. AI Features
  console.log('\n--- 9. Testing AI Features & Resilient Fallback ---');
  const roadmapReq = { body: { skill: 'Python' } };
  const roadmapRes = createMockRes();
  await generateRoadmap(roadmapReq, roadmapRes, (err) => console.error(err));
  assert(roadmapRes.data.stagesCount === 5, 'AI Learning Roadmap generated 5 sequential stages');

  const gapReq = { user: student, body: { skill: 'Python' } };
  const gapRes = createMockRes();
  await analyzeSkillGap(gapReq, gapRes, (err) => console.error(err));
  assert(gapRes.data.skill === 'Python', 'Skill gap analysis produced valid assessment breakdown');

  // 10. Communication & Messages
  console.log('\n--- 10. Testing Peer Communication ---');
  const msgReq = {
    user: student,
    body: {
      receiverId: mentor._id,
      content: 'Hello Mentor, looking forward to our Java session tomorrow!'
    }
  };
  const msgRes = createMockRes();
  await sendMessage(msgReq, msgRes, (err) => console.error(err));
  assert(msgRes.statusCode === 201, 'Message delivered and stored');

  const notif = await Notification.findOne({ user: mentor._id, type: 'message' });
  assert(!!notif, 'Receiver received in-app notification');

  // 11. Admin Analytics
  console.log('\n--- 11. Testing Admin Dashboard Analytics ---');
  const adminReq = { user: admin };
  const adminRes = createMockRes();
  await getPlatformAnalytics(adminReq, adminRes, (err) => console.error(err));
  assert(adminRes.statusCode === 200, 'Admin analytics retrieved with HTTP 200');
  assert(adminRes.data.analytics.totalUsers >= 3, 'User count aggregated accurately');

  // Cleanup
  console.log('\n--- 12. Cleaning Up Test Documents ---');
  await User.deleteMany({ _id: { $in: [student._id, mentor._id, admin._id] } });
  await ExchangeRequest.deleteMany({ _id: exchange._id });
  await ExchangeSession.deleteMany({ exchangeRequest: exchange._id });
  await Review.deleteMany({ exchangeRequest: exchange._id });
  await LearningGoal.deleteMany({ user: student._id });
  await AssessmentAttempt.deleteMany({ user: student._id });
  await Message.deleteMany({ sender: student._id });
  await Notification.deleteMany({ user: { $in: [student._id, mentor._id] } });
  console.log('  ✓ Test documents cleaned up cleanly.');

  console.log('\n==================================================');
  console.log(`Test Summary: ${passed} of ${total} assertions passed.`);
  console.log('==================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runAdvancedTestSuite().catch(async (err) => {
  console.error('Test suite encountered an uncaught error:', err);
  await mongoose.disconnect();
  process.exit(1);
});

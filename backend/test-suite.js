import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { getAllUsers, getUserById, getProfile, updateProfile } from './controllers/userController.js';
import { createRequest, getUserRequests, acceptRequest, rejectRequest, getUserMatches } from './controllers/requestController.js';

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

const createMockRes = () => {
  const res = {
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
  };
  return res;
};

async function runAllTests() {
  console.log('==================================================');
  console.log('SkillSync Comprehensive Backend Verification Suite');
  console.log('==================================================\n');

  // 1. MongoDB Connection
  console.log('--- 1. Testing MongoDB Connection ---');
  const isConnected = await connectDB();
  assert(isConnected, 'Database connected successfully via Atlas');
  if (!isConnected) {
    console.error('Cannot proceed without database connection.');
    process.exit(1);
  }

  const timestamp = Date.now();
  const userAEmail = `test_alice_${timestamp}@skillsync.edu`;
  const userBEmail = `test_bob_${timestamp}@skillsync.edu`;
  const plainPassword = 'Password123!';

  let userAId = null;
  let userBId = null;
  let requestId1 = null;
  let requestId2 = null;

  try {
    // 2. Registration
    console.log('\n--- 2. Testing User Registration ---');
    const reqRegA = {
      body: {
        name: 'Alice Developer',
        email: userAEmail,
        password: plainPassword
      }
    };
    const resRegA = createMockRes();
    await registerUser(reqRegA, resRegA, (err) => { if (err) throw err; });

    assert(resRegA.statusCode === 201, 'User A registered with HTTP 201');
    assert(resRegA.data?.success === true, 'Registration response indicates success');
    assert(resRegA.data?.user?.id !== undefined, 'Registered user contains MongoDB _id');
    assert(resRegA.data?.user?.password === undefined, 'Password omitted from registration response');
    userAId = resRegA.data.user.id;

    // Register User B
    const reqRegB = {
      body: {
        name: 'Bob Designer',
        email: userBEmail,
        password: plainPassword
      }
    };
    const resRegB = createMockRes();
    await registerUser(reqRegB, resRegB, (err) => { if (err) throw err; });
    assert(resRegB.statusCode === 201, 'User B registered with HTTP 201');
    userBId = resRegB.data.user.id;

    // 3. Duplicate Registration
    console.log('\n--- 3. Testing Duplicate Registration Prevention ---');
    const reqDup = {
      body: {
        name: 'Duplicate Alice',
        email: userAEmail,
        password: 'AnotherPassword'
      }
    };
    const resDup = createMockRes();
    await registerUser(reqDup, resDup, () => {});
    assert(resDup.statusCode === 409, 'Duplicate email registration rejected with HTTP 409');
    assert(resDup.data?.success === false, 'Duplicate error message returned properly');

    // 4. Login Success
    console.log('\n--- 4. Testing Login Success ---');
    const reqLoginSuccess = {
      body: {
        email: userAEmail,
        password: plainPassword
      }
    };
    const resLoginSuccess = createMockRes();
    await loginUser(reqLoginSuccess, resLoginSuccess, (err) => { if (err) throw err; });
    assert(resLoginSuccess.statusCode === 200, 'Login succeeds with HTTP 200');
    assert(resLoginSuccess.data?.success === true, 'Login response confirms success');
    assert(resLoginSuccess.data?.user?.email === userAEmail, 'Login response returns correct user data');
    assert(resLoginSuccess.data?.user?.password === undefined, 'Password omitted from login response');

    // 5. Login Wrong Password
    console.log('\n--- 5. Testing Login Wrong Password ---');
    const reqLoginWrongPass = {
      body: {
        email: userAEmail,
        password: 'IncorrectPassword'
      }
    };
    const resLoginWrongPass = createMockRes();
    await loginUser(reqLoginWrongPass, resLoginWrongPass, () => {});
    assert(resLoginWrongPass.statusCode === 401, 'Wrong password returns HTTP 401 Unauthorized');
    assert(resLoginWrongPass.data?.success === false, 'Error message given for bad credentials');

    // 6. Login Unknown Email
    console.log('\n--- 6. Testing Login Unknown Email ---');
    const reqLoginUnknown = {
      body: {
        email: `nonexistent_${timestamp}@skillsync.edu`,
        password: plainPassword
      }
    };
    const resLoginUnknown = createMockRes();
    await loginUser(reqLoginUnknown, resLoginUnknown, () => {});
    assert(resLoginUnknown.statusCode === 401, 'Unknown email returns HTTP 401 Unauthorized');

    // 7. Profile Update
    console.log('\n--- 7. Testing Profile Update ---');
    const userADoc = await User.findById(userAId);
    const reqUpdateProfile = {
      user: userADoc,
      body: {
        name: 'Alice Senior Dev',
        bio: 'Passionate about React and Full Stack Web Development.',
        role: 'Full Stack Developer',
        skillsOffered: ['React', 'Node.js', 'Express'],
        skillsWanted: ['UI/UX Design', 'Figma'],
        proficiency: { 'React': 'Advanced', 'Node.js': 'Intermediate' },
        availability: 'Weekends and Tuesday evenings'
      }
    };
    const resUpdateProfile = createMockRes();
    await updateProfile(reqUpdateProfile, resUpdateProfile, (err) => { if (err) throw err; });
    assert(resUpdateProfile.statusCode === 200, 'Profile update returns HTTP 200');
    assert(resUpdateProfile.data?.user?.name === 'Alice Senior Dev', 'Updated name persisted');
    assert(resUpdateProfile.data?.user?.skillsOffered.length === 3, 'Skills offered saved correctly');
    assert(resUpdateProfile.data?.user?.skillsWanted.length === 2, 'Skills wanted saved correctly');

    // Setup Bob's skills for matching
    const userBDoc = await User.findById(userBId);
    userBDoc.skillsOffered = ['UI/UX Design', 'Figma'];
    userBDoc.skillsWanted = ['React'];
    userBDoc.availability = 'Weekends';
    await userBDoc.save();

    // 8. User Retrieval (Explore & Partner Details)
    console.log('\n--- 8. Testing User Retrieval & Matching ---');
    const reqGetAll = {
      user: await User.findById(userAId),
      query: {}
    };
    const resGetAll = createMockRes();
    await getAllUsers(reqGetAll, resGetAll, (err) => { if (err) throw err; });
    assert(resGetAll.statusCode === 200, 'User explore list returns HTTP 200');
    assert(Array.isArray(resGetAll.data?.users), 'User list is an array');
    const bInExplore = resGetAll.data.users.find(u => String(u._id) === String(userBId));
    assert(bInExplore !== undefined, 'User B found in explore results');
    assert(bInExplore?.matchScore > 50, `Calculated compatibility score is meaningful (${bInExplore?.matchScore}%)`);
    const aInExplore = resGetAll.data.users.find(u => String(u._id) === String(userAId));
    assert(aInExplore === undefined, 'Current user Alice is correctly excluded from explore list');

    // Get single partner by ID
    const reqGetSingle = {
      user: await User.findById(userAId),
      params: { id: userBId }
    };
    const resGetSingle = createMockRes();
    await getUserById(reqGetSingle, resGetSingle, (err) => { if (err) throw err; });
    assert(resGetSingle.statusCode === 200, 'Get single partner profile returns HTTP 200');
    assert(resGetSingle.data?.user?.name === 'Bob Designer', 'Partner profile name matches');

    // 9. Exchange Request Creation
    console.log('\n--- 9. Testing Exchange Request Creation ---');
    const reqCreateExchange = {
      user: await User.findById(userAId),
      body: {
        receiverId: userBId,
        offeredSkill: 'React',
        requestedSkill: 'Figma',
        message: 'Hello Bob! I would love to trade React knowledge for Figma design guidance.'
      }
    };
    const resCreateExchange = createMockRes();
    await createRequest(reqCreateExchange, resCreateExchange, (err) => { if (err) throw err; });
    assert(resCreateExchange.statusCode === 201, 'Exchange request created with HTTP 201');
    assert(resCreateExchange.data?.request?.status === 'pending', 'New request status is pending');
    assert(resCreateExchange.data?.request?.matchScore > 50, 'Request stores calculated match score');
    requestId1 = resCreateExchange.data.request._id;

    // Self-request rejected
    const reqSelf = {
      user: await User.findById(userAId),
      body: {
        receiverId: userAId,
        offeredSkill: 'React',
        requestedSkill: 'Node.js'
      }
    };
    const resSelf = createMockRes();
    await createRequest(reqSelf, resSelf, () => {});
    assert(resSelf.statusCode === 400, 'Self-exchange request rejected with HTTP 400');

    // Duplicate pending request rejected
    const reqDupExchange = {
      user: await User.findById(userAId),
      body: {
        receiverId: userBId,
        offeredSkill: 'React',
        requestedSkill: 'Figma'
      }
    };
    const resDupExchange = createMockRes();
    await createRequest(reqDupExchange, resDupExchange, () => {});
    assert(resDupExchange.statusCode === 400, 'Duplicate pending request rejected with HTTP 400');

    // 10. Request Retrieval
    console.log('\n--- 10. Testing Request Retrieval ---');
    const reqGetRequestsB = {
      user: await User.findById(userBId),
      query: { type: 'received' }
    };
    const resGetRequestsB = createMockRes();
    await getUserRequests(reqGetRequestsB, resGetRequestsB, (err) => { if (err) throw err; });
    assert(resGetRequestsB.statusCode === 200, 'Receiver retrieved requests with HTTP 200');
    assert(resGetRequestsB.data?.received?.length >= 1, 'Receiver has received requests');
    const foundReq = resGetRequestsB.data.received.find(r => String(r._id) === String(requestId1));
    assert(foundReq !== undefined, 'Request sent by Alice found in Bob inbox');
    assert(foundReq?.sender?.name === 'Alice Senior Dev', 'Sender populated with details');

    // 11. Accept Request
    console.log('\n--- 11. Testing Accept Exchange Request ---');
    const reqAccept = {
      user: await User.findById(userBId),
      params: { id: requestId1 }
    };
    const resAccept = createMockRes();
    await acceptRequest(reqAccept, resAccept, (err) => { if (err) throw err; });
    assert(resAccept.statusCode === 200, 'Accept request returned HTTP 200');
    assert(resAccept.data?.request?.status === 'accepted', 'Request status transitioned to accepted');

    // 12. Reject Request Flow
    console.log('\n--- 12. Testing Reject Request Flow ---');
    // Create a second request to test rejection
    const reqCreate2 = {
      user: await User.findById(userAId),
      body: {
        receiverId: userBId,
        offeredSkill: 'Node.js',
        requestedSkill: 'UI/UX Design',
        message: 'Second proposal for backend review.'
      }
    };
    const resCreate2 = createMockRes();
    await createRequest(reqCreate2, resCreate2, (err) => { if (err) throw err; });
    requestId2 = resCreate2.data.request._id;

    const reqReject = {
      user: await User.findById(userBId),
      params: { id: requestId2 }
    };
    const resReject = createMockRes();
    await rejectRequest(reqReject, resReject, (err) => { if (err) throw err; });
    assert(resReject.statusCode === 200, 'Reject request returned HTTP 200');
    assert(resReject.data?.request?.status === 'rejected', 'Request status transitioned to rejected');

    // 13. Matches / Exchanges Retrieval
    console.log('\n--- 13. Testing Matches / Exchanges Retrieval ---');
    const reqMatchesA = {
      user: await User.findById(userAId)
    };
    const resMatchesA = createMockRes();
    await getUserMatches(reqMatchesA, resMatchesA, (err) => { if (err) throw err; });
    assert(resMatchesA.statusCode === 200, 'User A retrieved matches with HTTP 200');
    assert(resMatchesA.data?.matches?.length >= 1, 'Active matches list contains accepted exchange');
    const match = resMatchesA.data.matches[0];
    assert(match?.partner?.name === 'Bob Designer', 'Match partner is Bob');
    assert(match?.status === 'accepted', 'Match state is accepted');

    console.log('\n--- 14. Cleaning Up Temporary Test Documents ---');
    await ExchangeRequest.deleteMany({ _id: { $in: [requestId1, requestId2].filter(Boolean) } });
    await User.deleteMany({ _id: { $in: [userAId, userBId].filter(Boolean) } });
    console.log('  ✓ Temporary test documents deleted cleanly from MongoDB.');

  } catch (error) {
    console.error('Test execution encountered an error:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\n==================================================');
    console.log(`Test Summary: ${passed} of ${total} assertions passed.`);
    console.log('==================================================\n');
  }
}

runAllTests();

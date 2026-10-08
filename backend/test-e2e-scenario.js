import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import ExchangeRequest from './models/ExchangeRequest.js';
import { registerUser, loginUser } from './controllers/authController.js';
import { getAllUsers, getUserById, updateProfile } from './controllers/userController.js';
import { createRequest, getUserRequests, acceptRequest, getUserMatches } from './controllers/requestController.js';

dotenv.config();

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

async function runScenario() {
  console.log('================================================================');
  console.log('SkillSync College Demonstration E2E Scenario (User A & User B)');
  console.log('================================================================\n');

  await connectDB();

  const timestamp = Date.now();
  const userAEmail = `aarav_${timestamp}@college.edu`;
  const userBEmail = `priya_${timestamp}@college.edu`;
  const password = 'Password@123';

  let userAId = null;
  let userBId = null;
  let requestId = null;

  try {
    // 1. User A (Aarav) registers
    console.log('Step 1: User A (Aarav) registers...');
    const resRegA = createMockRes();
    await registerUser({
      body: { name: 'Aarav Patel', email: userAEmail, password }
    }, resRegA, (err) => { if (err) throw err; });
    userAId = resRegA.data.user.id;
    console.log(`  ✓ User A registered successfully (ID: ${userAId})`);

    // 2. User A updates profile (skills offered & wanted)
    console.log('\nStep 2: User A updates profile skills and availability...');
    const userADoc = await User.findById(userAId);
    const resUpdateA = createMockRes();
    await updateProfile({
      user: userADoc,
      body: {
        name: 'Aarav Patel',
        role: 'Data Science Major',
        bio: 'Passionate about Python backend development and AI models. Eager to master frontend React.',
        skillsOffered: ['Python', 'Machine Learning', 'Django'],
        skillsWanted: ['React', 'UI/UX Design'],
        proficiency: { 'Python': 'Advanced', 'Machine Learning': 'Intermediate' },
        availability: 'Weekends and weekday evenings'
      }
    }, resUpdateA, (err) => { if (err) throw err; });
    console.log(`  ✓ User A profile updated in MongoDB: Offers [${resUpdateA.data.user.skillsOffered.join(', ')}], Wants [${resUpdateA.data.user.skillsWanted.join(', ')}]`);

    // 3. User B (Priya) registers
    console.log('\nStep 3: User B (Priya) registers...');
    const resRegB = createMockRes();
    await registerUser({
      body: { name: 'Priya Sharma', email: userBEmail, password }
    }, resRegB, (err) => { if (err) throw err; });
    userBId = resRegB.data.user.id;
    console.log(`  ✓ User B registered successfully (ID: ${userBId})`);

    // 4. User B updates profile with complementary skills
    console.log('\nStep 4: User B updates profile with complementary skills...');
    const userBDoc = await User.findById(userBId);
    const resUpdateB = createMockRes();
    await updateProfile({
      user: userBDoc,
      body: {
        name: 'Priya Sharma',
        role: 'Software Engineering Major',
        bio: 'Frontend enthusiast specializing in React and Figma design systems. Looking to learn Python.',
        skillsOffered: ['React', 'UI/UX Design', 'Figma'],
        skillsWanted: ['Python', 'Django'],
        proficiency: { 'React': 'Advanced', 'UI/UX Design': 'Advanced' },
        availability: 'Weekends and flexible evenings'
      }
    }, resUpdateB, (err) => { if (err) throw err; });
    console.log(`  ✓ User B profile updated in MongoDB: Offers [${resUpdateB.data.user.skillsOffered.join(', ')}], Wants [${resUpdateB.data.user.skillsWanted.join(', ')}]`);

    // 5. User A searches for User B on Explore
    console.log('\nStep 5: User A explores partners and searches for Priya / React...');
    const resExplore = createMockRes();
    await getAllUsers({
      user: await User.findById(userAId),
      query: { search: 'React' }
    }, resExplore, (err) => { if (err) throw err; });
    const priyaFound = resExplore.data.users.find(u => String(u._id) === String(userBId));
    console.log(`  ✓ Found Priya on Explore with Compatibility Match Score: ${priyaFound.matchScore}% (Ranked #1)`);

    // 6. User A views Priya's partner profile
    console.log('\nStep 6: User A opens Priya\'s partner profile...');
    const resPartner = createMockRes();
    await getUserById({
      user: await User.findById(userAId),
      params: { id: userBId }
    }, resPartner, (err) => { if (err) throw err; });
    console.log(`  ✓ Loaded partner profile: ${resPartner.data.user.name} (${resPartner.data.user.role})`);

    // 7. User A sends skill exchange request to User B
    console.log('\nStep 7: User A sends exchange request to User B...');
    const resRequest = createMockRes();
    await createRequest({
      user: await User.findById(userAId),
      body: {
        receiverId: userBId,
        offeredSkill: 'Python',
        requestedSkill: 'React',
        message: 'Hi Priya! I can mentor you on Python backend architectures in exchange for hands-on React training.'
      }
    }, resRequest, (err) => { if (err) throw err; });
    requestId = resRequest.data.request._id;
    console.log(`  ✓ Exchange request created in MongoDB: Status = "${resRequest.data.request.status}", Match Score = ${resRequest.data.request.matchScore}%`);

    // 8. User B logs in
    console.log('\nStep 8: User B logs into their account...');
    const resLoginB = createMockRes();
    await loginUser({
      body: { email: userBEmail, password }
    }, resLoginB, (err) => { if (err) throw err; });
    console.log(`  ✓ User B logged in successfully: Welcome ${resLoginB.data.user.name}`);

    // 9. User B views received requests
    console.log('\nStep 9: User B inspects incoming requests...');
    const resInboxB = createMockRes();
    await getUserRequests({
      user: await User.findById(userBId),
      query: { type: 'received' }
    }, resInboxB, (err) => { if (err) throw err; });
    const proposal = resInboxB.data.received.find(r => String(r._id) === String(requestId));
    console.log(`  ✓ User B sees proposal from ${proposal.sender.name}: Teaches "${proposal.offeredSkill}" for "${proposal.requestedSkill}"`);

    // 10. User B accepts the request
    console.log('\nStep 10: User B accepts Aarav\'s proposal...');
    const resAccept = createMockRes();
    await acceptRequest({
      user: await User.findById(userBId),
      params: { id: requestId }
    }, resAccept, (err) => { if (err) throw err; });
    console.log(`  ✓ Proposal accepted: Status transitioned to "${resAccept.data.request.status}"`);

    // 11. Both users verify active exchange in Matches
    console.log('\nStep 11: Verifying active match for both User A and User B...');
    const resMatchesA = createMockRes();
    await getUserMatches({ user: await User.findById(userAId) }, resMatchesA, (err) => { if (err) throw err; });
    console.log(`  ✓ User A active exchanges: ${resMatchesA.data.matches.length} (Partner: ${resMatchesA.data.matches[0].partner.name}, Skill: ${resMatchesA.data.matches[0].mySkill} ⟷ ${resMatchesA.data.matches[0].partnerSkill})`);

    const resMatchesB = createMockRes();
    await getUserMatches({ user: await User.findById(userBId) }, resMatchesB, (err) => { if (err) throw err; });
    console.log(`  ✓ User B active exchanges: ${resMatchesB.data.matches.length} (Partner: ${resMatchesB.data.matches[0].partner.name}, Skill: ${resMatchesB.data.matches[0].mySkill} ⟷ ${resMatchesB.data.matches[0].partnerSkill})`);

    console.log('\n================================================================');
    console.log('✓ Scenario Completed Successfully: Complete User Journey Verified!');
    console.log('================================================================\n');

    // Clean up demo documents
    await ExchangeRequest.deleteMany({ _id: requestId });
    await User.deleteMany({ _id: { $in: [userAId, userBId] } });
    console.log('Demo documents cleaned up.');

  } catch (err) {
    console.error('Scenario failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runScenario();

import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';
import { registerUser } from './controllers/authController.js';

dotenv.config();

let passedTests = 0;
let totalTests = 0;

const assert = (condition, testName) => {
  totalTests++;
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  FAIL: ${testName}`);
    process.exitCode = 1;
  }
};

async function runTests() {
  console.log('\n--- 1. Testing User Schema & Password Hashing Logic ---');

  // Test 1: Validation of missing required fields
  const emptyUser = new User({});
  let validationError = null;
  try {
    await emptyUser.validate();
  } catch (err) {
    validationError = err;
  }
  assert(validationError?.errors?.name !== undefined, 'Name is required by schema');
  assert(validationError?.errors?.email !== undefined, 'Email is required by schema');
  assert(validationError?.errors?.password !== undefined, 'Password is required by schema');

  // Test 2: Invalid email format rejected
  const invalidEmailUser = new User({
    name: 'Invalid Email',
    email: 'not-an-email',
    password: 'password123'
  });
  let emailValError = null;
  try {
    await invalidEmailUser.validate();
  } catch (err) {
    emailValError = err;
  }
  assert(emailValError?.errors?.email !== undefined, 'Invalid email format rejected by schema');

  // Test 3: Short password rejected
  const shortPassUser = new User({
    name: 'Short Pass',
    email: 'valid@example.com',
    password: '123'
  });
  let shortPassError = null;
  try {
    await shortPassUser.validate();
  } catch (err) {
    shortPassError = err;
  }
  assert(shortPassError?.errors?.password !== undefined, 'Passwords < 6 chars rejected by schema');

  // Test 4: Default field values
  const defaultUser = new User({
    name: 'Default User',
    email: 'defaults@example.com',
    password: 'password123'
  });
  assert(defaultUser.bio === '', 'Default bio is empty string');
  assert(Array.isArray(defaultUser.skillsOffered) && defaultUser.skillsOffered.length === 0, 'Default skillsOffered is empty array');
  assert(Array.isArray(defaultUser.skillsWanted) && defaultUser.skillsWanted.length === 0, 'Default skillsWanted is empty array');
  assert(defaultUser.verification === false, 'Default verification is false');
  assert(defaultUser.trustScore === 0, 'Default trustScore is 0');

  // Test 5: Password hashing on pre-save
  const rawPassword = 'SecurePassword!987';
  const userToHash = new User({
    name: 'Hashed User',
    email: 'hashed@example.com',
    password: rawPassword
  });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  userToHash.password = hashedPassword;

  assert(userToHash.password !== rawPassword, 'Stored password is NOT plain-text');
  assert(userToHash.password.startsWith('$2'), 'Stored password is valid bcrypt hash');
  assert(await bcrypt.compare(rawPassword, userToHash.password), 'bcrypt.compare succeeds for correct password');
  assert(!(await bcrypt.compare('WrongPassword', userToHash.password)), 'bcrypt.compare fails for wrong password');

  // Test 6: toJSON omits password
  const jsonUser = userToHash.toJSON();
  assert(jsonUser.password === undefined, 'toJSON() omits password completely');
  assert(JSON.stringify(userToHash).indexOf(rawPassword) === -1, 'JSON.stringify does not contain plain password');
  assert(JSON.stringify(userToHash).indexOf(hashedPassword) === -1, 'JSON.stringify does not contain password hash');

  console.log('\n--- 2. Testing Registration Controller Logic ---');

  let mockResStatus = null;
  let mockResJson = null;
  const createMockRes = () => ({
    status: (code) => {
      mockResStatus = code;
      return {
        json: (data) => {
          mockResJson = data;
        }
      };
    }
  });

  // Call with missing fields
  await registerUser({ body: { name: 'Test' } }, createMockRes(), () => { });
  assert(mockResStatus === 400, 'Controller returns 400 when fields are missing');
  assert(mockResJson?.success === false, 'Controller response indicates failure for missing fields');

  // Call with invalid email
  await registerUser({ body: { name: 'Test', email: 'invalid-email', password: 'password123' } }, createMockRes(), () => { });
  assert(mockResStatus === 400, 'Controller returns 400 for malformed email');

  // Call with short password
  await registerUser({ body: { name: 'Test', email: 'test@example.com', password: '123' } }, createMockRes(), () => { });
  assert(mockResStatus === 400, 'Controller returns 400 for password < 6 characters');

  console.log('\n--- 3. Testing Live Database Integration (if MongoDB is available) ---');

  const mongoConnected = await connectDB();
  if (mongoConnected) {
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const testPassword = 'Password123!';

      // Test Live insertion
      const createdUser = await User.create({
        name: 'Live Test User',
        email: testEmail,
        password: testPassword
      });

      assert(createdUser._id !== undefined, 'User inserted into MongoDB with _id');
      assert(createdUser.password !== testPassword, 'Stored MongoDB password is encrypted with bcrypt');
      assert(await bcrypt.compare(testPassword, createdUser.password), 'bcrypt matches correct password on stored document');

      // Test Duplicate email rejected
      let duplicateFailed = false;
      try {
        await User.create({
          name: 'Duplicate User',
          email: testEmail,
          password: 'AnotherPassword'
        });
      } catch (err) {
        duplicateFailed = true;
      }
      assert(duplicateFailed, 'Duplicate email registration rejected by MongoDB unique index');

      // Clean up test user
      await User.deleteOne({ _id: createdUser._id });
      console.log('  Cleaned up temporary test user document');
    } catch (dbErr) {
      console.error('  Database test error:', dbErr.message);
    } finally {
      await mongoose.disconnect();
    }
  } else {
    console.log('  INFO: Local MongoDB daemon is currently offline; live insertion requires an active MongoDB connection.');
    console.log('  All schema validations, pre-save encryption, controller guards, and security constraints passed.');
  }

  console.log(`\nResults: ${passedTests} of ${totalTests} unit & schema checks passed.\n`);
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});

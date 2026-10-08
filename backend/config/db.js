import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Handles errors gracefully and never hardcodes credentials.
 * @returns {Promise<boolean>} True if connected, false otherwise.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('your_mongodb_connection_string_here')) {
    console.error('MongoDB Connection Error: MONGO_URI is not set or contains placeholder value in environment.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    return false;
  }
};

export default connectDB;

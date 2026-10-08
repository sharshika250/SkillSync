import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware: Enable CORS for frontend client
const allowedOrigins = [
  frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allow requests with no origin (e.g. curl, postman, mobile apps)
    if (!origin) return callback(null, true);

    // 2. Allow all in development mode
    if (process.env.NODE_ENV === 'development') return callback(null, true);

    // 3. Allow wildcard configuration
    if (frontendUrl === '*' || allowedOrigins.includes('*')) return callback(null, true);

    // 4. Normalize origin (strip trailing slashes)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const isExplicitlyAllowed = allowedOrigins.some(o => o && o.replace(/\/$/, '') === normalizedOrigin);
    if (isExplicitlyAllowed) return callback(null, true);

    // 5. Automatically allow any Vercel production or preview deployments
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`Blocked by CORS policy: origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

// Middleware: Parse incoming JSON requests
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillSync backend is running'
  });
});

// Root endpoint info
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillSync API is online. Health endpoint available at /api/health'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/matches', matchRoutes);

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware (avoids leaking stack traces/secrets)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('REQUEST ERROR:', err);
  const statusCode = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message
  });
});

// Server startup: Connect to MongoDB first, only then start listening
const startServer = async () => {
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.error('Server startup halted: MongoDB connection could not be established.');
      console.info('Please verify your MONGO_URI in backend/.env and ensure your MongoDB instance is running.');
      return;
    }

    app.listen(PORT, () => {
      console.log(`SkillSync backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Unexpected error during server startup: ${error.message}`);
  }
};

// Only start server automatically if not imported in tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

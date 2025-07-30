const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // allow more requests during development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

console.log("Starting backend/server.js...");

// Database connection with fallback
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feedback-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB connection failed, using fallback...');
    console.log('Please install MongoDB or set up MongoDB Atlas');
    console.log('For now, the app will run but database operations will fail');
    mongoose.connection.on('error', () => {
      console.log('Database operations will fail until MongoDB is set up');
    });
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/surveys', require('./routes/surveys'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/messages', require('./routes/messages'));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/client/build')));
  
  // Handle favicon specifically
  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/client/build/favicon.ico'));
  });
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/client/build/index.html'));
  });
} else {
  // In development, just ignore favicon requests to avoid 500 errors
  app.get('/favicon.ico', (req, res) => res.status(204).end());
}

const PORT = process.env.PORT || 5001;
console.log("About to start server on port", PORT);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

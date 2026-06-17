require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Apply security headers
app.use(helmet());

// Global Rate Limiter (Basic DDoS protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' },
});
app.use('/api/', apiLimiter);

// Connect to Database
connectDB();

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body Parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Basic verification route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy and running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Only log full stack traces for server errors (500+)
  if (statusCode >= 500) {
    console.error(err.stack);
  } else {
    // For client errors (like 404 Post Not Found), just log a concise warning
    console.warn(`[${statusCode}] ${err.message} - ${req.method} ${req.originalUrl}`);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Structured startup log (DevPulse)
  console.info(`[Server] DevPulse Backend running on port ${PORT}`);
});

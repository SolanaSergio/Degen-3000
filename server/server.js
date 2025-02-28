// Express server for DEGEN ROAST 3000
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sessionManager = require('./utils/session-manager');
const apiRoutes = require('./routes/api');
const session = require('express-session');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://i.imgur.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "data:"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - more lenient for development, can be tightened in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests',
    message: 'You\'ve sent too many requests. Wait a bit before trying again, or I\'ll roast your impatience next.'
  }
});

// Apply rate limiting to all /api routes only
app.use('/api', limiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'degen-roast-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Add version info to headers
app.use((req, res, next) => {
  res.setHeader('X-App-Version', '2.0.0');
  res.setHeader('X-Roast-Level', 'Maximum Savagery');
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${new Date().toISOString()} | ${ip} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms`;
    
    if (res.statusCode >= 400) {
      console.error(`🔴 ${logMessage}`);
    } else {
      console.log(`🟢 ${logMessage}`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Server status endpoint
app.get('/health', (req, res) => {
  const serverStatus = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime() / 60)} minutes`,
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    memory: process.memoryUsage(),
    sessions: {
      active: 0 // Would need to be updated with actual count
    }
  };
  
  res.status(200).json(serverStatus);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Determine if this is a known error type
  let statusCode = 500;
  let errorMessage = 'Something went wrong';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized';
  }
  
  // Send the error response
  res.status(statusCode).json({
    error: true,
    status: statusCode,
    message: process.env.NODE_ENV === 'production' ? errorMessage : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: true,
    status: 404,
    message: `The path ${req.originalUrl} doesn't exist. Are you lost? That's not surprising given your sense of direction.`
  });
});

// Any other routes should serve the index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Only start the server if we're running directly (not being imported as a module)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    const startTime = new Date().toLocaleTimeString();
    console.log('\n---------------------------------------------');
    console.log(`🔥 DEGEN ROAST 3000 - SAVAGE EDITION v2.0.0 🔥`);
    console.log('---------------------------------------------');
    console.log(`🚀 Server started at ${startTime}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('---------------------------------------------\n');
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    
    // In a regular server, we could clean up expired sessions periodically
    // But this won't work in a serverless environment
    if (process.env.NODE_ENV !== 'production') {
      // Only run session cleanup in development, not in serverless
      setInterval(() => {
        try {
          console.log('Running scheduled session cleanup...');
          sessionManager.cleanupSessions(); 
        } catch (error) {
          console.error('Error cleaning up sessions:', error);
        }
      }, 60 * 60 * 1000);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  });
}

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Log to monitoring service or file here if needed
  if (process.env.NODE_ENV === 'production') {
    // In production, we probably want to exit and let the process manager restart
    // But in serverless, this would just terminate the function
    if (require.main === module) process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  // Log to monitoring service or file here if needed
});

// Export the app for serverless environments like Vercel
module.exports = app; 
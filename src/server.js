/**
 * Main Application Server
 * Initializes Express server and configures middleware and routes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');

// Import database connection
const { connectDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const fileRoutes = require('./routes/fileRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// Middleware - CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Middleware - Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware - File Upload
app.use(
  fileUpload({
    useTempFiles: false,
    safeFileNames: true,
    limits: { fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 },
  })
);

// Middleware - Request Logging
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DLRMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/records`, recordRoutes);
app.use(`${apiPrefix}/files`, fileRoutes);
app.use(`${apiPrefix}/audit`, auditRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Error Handler Middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Get port from environment or use default
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║  Digital Land Records Management System (DLRMS)          ║
║  Backend API Server                                      ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  ✓ Server running on port ${PORT}                         ║
║  ✓ Database connected                                    ║
║  ✓ API ready at http://localhost:${PORT}${apiPrefix}     ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;

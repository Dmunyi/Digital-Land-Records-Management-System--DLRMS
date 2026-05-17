/**
 * Database Configuration
 * Handles MongoDB connection setup and initialization
 */

const mongoose = require('mongoose');

// Configure database connection
const connectDatabase = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dlrms';

    // Connect to MongoDB with proper error handling
    await mongoose.connect(mongoUri);

    console.log('✓ Successfully connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ Failed to connect to MongoDB:', error.message);
    // Exit process if database connection fails
    process.exit(1);
  }
};

// Disconnect from database gracefully
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ Successfully disconnected from MongoDB');
  } catch (error) {
    console.error('✗ Error disconnecting from database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};

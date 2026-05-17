/**
 * Application Constants
 * Central place for all system constants and configuration values
 */

// User Roles in the system
const USER_ROLES = {
  ADMIN: 'ADMIN',              // System administrator - full access
  MANAGER: 'MANAGER',          // Department manager - can manage staff and records
  OFFICER: 'OFFICER',          // Land officer - can search and process records
  VIEWER: 'VIEWER',            // View-only access to records
};

// Record Status values
const RECORD_STATUS = {
  PENDING: 'PENDING',          // Record awaiting processing
  PROCESSING: 'PROCESSING',    // Record currently being processed
  COMPLETED: 'COMPLETED',      // Record processing completed
  ARCHIVED: 'ARCHIVED',        // Record archived for historical reference
};

// Audit Action Types
const AUDIT_ACTIONS = {
  LOGIN: 'LOGIN',              // User login
  LOGOUT: 'LOGOUT',            // User logout
  CREATE: 'CREATE',            // Record created
  UPDATE: 'UPDATE',            // Record modified
  DELETE: 'DELETE',            // Record deleted
  VIEW: 'VIEW',                // Record viewed
  DOWNLOAD: 'DOWNLOAD',        // Record downloaded
  UPLOAD: 'UPLOAD',            // File uploaded
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File upload configuration
const FILE_CONFIG = {
  ALLOWED_EXTENSIONS: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  UPLOAD_TIMEOUT: 30000,            // 30 seconds
};

// Application metadata
const APP_META = {
  NAME: 'Digital Land Records Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Centralized web-based platform for digitizing and managing land records',
};

module.exports = {
  USER_ROLES,
  RECORD_STATUS,
  AUDIT_ACTIONS,
  PAGINATION,
  FILE_CONFIG,
  APP_META,
};

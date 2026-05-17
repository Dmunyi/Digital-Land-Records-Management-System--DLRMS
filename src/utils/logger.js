/**
 * Logger Utility
 * Provides logging functionality with timestamps
 */

const AuditLog = require('../models/AuditLog');
const { AUDIT_ACTIONS } = require('../config/constants');

/**
 * Log user action to audit trail
 */
const logAuditTrail = async (userId, action, entityType, entityId, details = {}) => {
  try {
    const auditEntry = new AuditLog({
      userId,
      action,
      entityType,
      entityId,
      description: details.description || '',
      oldValues: details.oldValues,
      newValues: details.newValues,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      status: details.status || 'SUCCESS',
    });

    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Failed to log audit trail:', error.message);
  }
};

/**
 * Console logging with timestamp
 */
const log = {
  info: (message) => console.log(`[${new Date().toISOString()}] INFO: ${message}`),
  error: (message) => console.error(`[${new Date().toISOString()}] ERROR: ${message}`),
  warn: (message) => console.warn(`[${new Date().toISOString()}] WARN: ${message}`),
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] DEBUG: ${message}`);
    }
  },
};

module.exports = {
  logAuditTrail,
  log,
};

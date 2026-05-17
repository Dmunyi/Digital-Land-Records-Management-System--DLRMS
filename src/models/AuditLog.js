/**
 * Audit Log Model
 * Tracks all user actions for security and compliance purposes
 */

const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../config/constants');

// Define audit log schema
const auditLogSchema = new mongoose.Schema(
  {
    // User Information
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: String,
    userRole: String,

    // Action Details
    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['LAND_RECORD', 'USER', 'SYSTEM'],
      required: true,
    },
    entityId: mongoose.Schema.ObjectId,
    description: String,

    // Change Details
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,

    // IP and Session Info
    ipAddress: String,
    userAgent: String,

    // Status
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'UNAUTHORIZED'],
      default: 'SUCCESS',
    },

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: 'auditlegs' }
);

// Index for efficient querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

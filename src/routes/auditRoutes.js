/**
 * Audit Logs Routes
 * Routes for retrieving and viewing audit trails
 */

const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getEntityAuditTrail,
  getAuditStatistics,
} = require('../controllers/auditController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');

// All routes require authentication and manager/admin role
router.use(authMiddleware);
router.use(authorize([USER_ROLES.MANAGER, USER_ROLES.ADMIN]));

// Get all audit logs
router.get('/logs', getAuditLogs);

// Get audit trail for a specific entity
router.get('/trail/:entityType/:entityId', getEntityAuditTrail);

// Get audit statistics
router.get('/statistics', getAuditStatistics);

module.exports = router;

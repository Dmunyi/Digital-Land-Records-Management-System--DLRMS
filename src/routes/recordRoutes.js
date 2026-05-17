/**
 * Land Records Routes
 * Routes for CRUD operations on land records
 */

const express = require('express');
const router = express.Router();
const {
  createLandRecord,
  generateRecordsReport,
  getAllLandRecords,
  getLandRecordById,
  updateLandRecord,
  assignRecord,
  transferOwnership,
  transferLandToInterest,
  deleteLandRecord,
} = require('../controllers/recordController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');

// All routes require authentication
router.use(authMiddleware);

// Generate a records report (ADMIN only) - Must be before /:id route
router.get(
  '/reports',
  authorize([USER_ROLES.ADMIN]),
  generateRecordsReport
);

// Create a new land record (OFFICER and above)
router.post(
  '/create',
  authorize([USER_ROLES.OFFICER, USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  createLandRecord
);

// Get all land records
router.get('/list', getAllLandRecords);

// Get a specific land record
router.get('/:id', getLandRecordById);

// Update a land record (OFFICER and above)
router.put(
  '/:id',
  authorize([USER_ROLES.OFFICER, USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  updateLandRecord
);

// Assign record to a user (MANAGER and ADMIN)
router.put(
  '/:id/assign',
  authorize([USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  assignRecord
);

// Transfer ownership of a record (ADMIN only)
router.put(
  '/:id/transfer',
  authorize([USER_ROLES.ADMIN]),
  transferOwnership
);

// Transfer land to a person of interest (Any authenticated owner)
router.put(
  '/:recordId/transfer-to-interest',
  authMiddleware,
  transferLandToInterest
);

// Delete a land record (ADMIN only)
router.delete(
  '/:id',
  authorize([USER_ROLES.ADMIN]),
  deleteLandRecord
);

module.exports = router;

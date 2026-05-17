/**
 * File Upload Routes
 * Routes for document upload, download, and management
 */

const express = require('express');
const router = express.Router();
const { uploadDocument, downloadDocument, deleteDocument } = require('../controllers/fileController');
const { authMiddleware, authorize } = require('../middleware/auth');
const { USER_ROLES } = require('../config/constants');

// All routes require authentication
router.use(authMiddleware);

// Upload document to record
router.post(
  '/:recordId/upload',
  authorize([USER_ROLES.OFFICER, USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  uploadDocument
);

// Download document from record
router.get('/:recordId/download/:documentId', downloadDocument);

// Delete document from record
router.delete(
  '/:recordId/document/:documentId',
  authorize([USER_ROLES.OFFICER, USER_ROLES.MANAGER, USER_ROLES.ADMIN]),
  deleteDocument
);

module.exports = router;

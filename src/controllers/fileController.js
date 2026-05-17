/**
 * File Upload Controller
 * Handles document upload and management for land records
 */

const fs = require('fs');
const path = require('path');
const LandRecord = require('../models/LandRecord');
const { logAuditTrail } = require('../utils/logger');
const { AUDIT_ACTIONS, FILE_CONFIG } = require('../config/constants');

/**
 * Upload document to land record
 */
const uploadDocument = async (req, res) => {
  try {
    const { recordId } = req.params;

    if (!req.files || !req.files.document) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a file.',
      });
    }

    // Get the uploaded file
    const uploadedFile = req.files.document;
    const fileExtension = path.extname(uploadedFile.name).substring(1).toLowerCase();

    // Validate file type
    if (!FILE_CONFIG.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed types: ${FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`,
      });
    }

    // Validate file size
    if (uploadedFile.size > FILE_CONFIG.MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum limit of ${FILE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
      });
    }

    // Find the record
    const record = await LandRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}_${uploadedFile.name}`;
    const filePath = path.join(uploadDir, fileName);

    // Move file to uploads folder
    await uploadedFile.mv(filePath);

    // Add document to record
    record.documents.push({
      fileName: uploadedFile.name,
      fileType: fileExtension,
      filePath: fileName,
      uploadedAt: new Date(),
      uploadedBy: req.user._id,
      fileSize: uploadedFile.size,
    });

    record.lastModifiedBy = req.user._id;
    await record.save();

    // Log the upload
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.UPLOAD, 'LAND_RECORD', recordId, {
      description: `Uploaded document: ${uploadedFile.name}`,
    });

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully!',
      document: record.documents[record.documents.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading document: ' + error.message,
    });
  }
};

/**
 * Download document from record
 */
const downloadDocument = async (req, res) => {
  try {
    const { recordId, documentId } = req.params;

    // Find the record
    const record = await LandRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Find the document
    const document = record.documents.find(doc => doc._id.toString() === documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    const filePath = path.join(__dirname, '../../uploads', document.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server.',
      });
    }

    // Log download
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.DOWNLOAD, 'LAND_RECORD', recordId, {
      description: `Downloaded document: ${document.fileName}`,
    });

    // Send file
    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading document: ' + error.message,
    });
  }
};

/**
 * Delete document from record
 */
const deleteDocument = async (req, res) => {
  try {
    const { recordId, documentId } = req.params;

    // Find the record
    const record = await LandRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Find and remove the document
    const documentIndex = record.documents.findIndex(doc => doc._id.toString() === documentId);
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
    }

    const document = record.documents[documentIndex];

    // Delete file from storage
    const filePath = path.join(__dirname, '../../uploads', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    record.documents.splice(documentIndex, 1);
    record.lastModifiedBy = req.user._id;
    await record.save();

    // Log the deletion
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.DELETE, 'LAND_RECORD', recordId, {
      description: `Deleted document: ${document.fileName}`,
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting document: ' + error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  downloadDocument,
  deleteDocument,
};

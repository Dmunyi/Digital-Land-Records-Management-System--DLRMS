/**
 * Land Records Controller
 * Handles all operations related to land record management
 */

const LandRecord = require('../models/LandRecord');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { logAuditTrail } = require('../utils/logger');
const { AUDIT_ACTIONS, PAGINATION, RECORD_STATUS } = require('../config/constants');

/**
 * Create a new land record
 */
const createLandRecord = async (req, res) => {
  try {
    const { referenceNumber, title, propertyDetails, ownerInformation, description } = req.body;

    // Validate required fields
    if (!referenceNumber || !title) {
      return res.status(400).json({
        success: false,
        message: 'Reference number and title are required.',
      });
    }

    // Check if reference number already exists
    const existingRecord = await LandRecord.findOne({ referenceNumber });
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'A record with this reference number already exists.',
      });
    }

    // Create new land record
    const newRecord = new LandRecord({
      referenceNumber,
      title,
      propertyDetails: propertyDetails || {},
      ownerInformation: ownerInformation || {},
      description,
      createdBy: req.user._id,
    });

    // Save to database
    await newRecord.save();

    // Log the creation
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.CREATE, 'LAND_RECORD', newRecord._id, {
      description: `Land record created: ${referenceNumber}`,
    });

    res.status(201).json({
      success: true,
      message: 'Land record created successfully!',
      record: newRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating land record: ' + error.message,
    });
  }
};

/**
 * Generate a records report with summary data and matching records
 */
const generateRecordsReport = async (req, res) => {
  try {
    const {
      status,
      priority,
      province,
      district,
      search,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (province) filter['propertyDetails.location.province'] = { $regex: province, $options: 'i' };
    if (district) filter['propertyDetails.location.district'] = { $regex: district, $options: 'i' };
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'ownerInformation.ownerName': { $regex: search, $options: 'i' } },
        { 'propertyDetails.plotNumber': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const records = await LandRecord.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'fullName email role')
      .populate('assignedTo', 'fullName email role');

    const statusSummary = Object.values(RECORD_STATUS).map((value) => ({
      status: value,
      count: records.filter((record) => record.status === value).length,
    }));

    const prioritySummary = ['LOW', 'MEDIUM', 'HIGH'].map((value) => ({
      priority: value,
      count: records.filter((record) => record.priority === value).length,
    }));

    const provinceMap = new Map();
    const districtMap = new Map();

    records.forEach((record) => {
      const recordProvince = record.propertyDetails?.location?.province?.trim();
      const recordDistrict = record.propertyDetails?.location?.district?.trim();

      if (recordProvince) {
        provinceMap.set(recordProvince, (provinceMap.get(recordProvince) || 0) + 1);
      }

      if (recordDistrict) {
        districtMap.set(recordDistrict, (districtMap.get(recordDistrict) || 0) + 1);
      }
    });

    const locationSummary = {
      provinces: Array.from(provinceMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      districts: Array.from(districtMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };

    const summary = {
      totalRecords: records.length,
      statusSummary,
      prioritySummary,
      locationSummary,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };

    res.status(200).json({
      success: true,
      message: 'Records report generated successfully!',
      data: {
        summary,
        records,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating records report: ' + error.message,
    });
  }
};

/**
 * Get all land records with pagination and filtering
 */
const getAllLandRecords = async (req, res) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT, status, search } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { referenceNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'ownerInformation.ownerName': { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const skip = (pageNum - 1) * limitNum;

    // Fetch records
    const records = await LandRecord.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email');

    // Get total count
    const total = await LandRecord.countDocuments(filter);

    // Log view action
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.VIEW, 'LAND_RECORD', null, {
      description: 'Viewed land records list',
    });

    res.status(200).json({
      success: true,
      message: 'Land records retrieved successfully!',
      data: records,
      pagination: {
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving land records: ' + error.message,
    });
  }
};

/**
 * Get a single land record by ID
 */
const getLandRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LandRecord.findById(id)
      .populate('createdBy', 'fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('documents.uploadedBy', 'fullName email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Log the view
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.VIEW, 'LAND_RECORD', id, {
      description: `Viewed land record: ${record.referenceNumber}`,
    });

    res.status(200).json({
      success: true,
      message: 'Land record retrieved successfully!',
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving land record: ' + error.message,
    });
  }
};

/**
 * Update a land record
 */
const updateLandRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the record
    const record = await LandRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Store old values for audit
    const oldValues = { ...record.toObject() };

    // Update fields
    Object.assign(record, updates);
    record.lastModifiedBy = req.user._id;
    record.updatedAt = new Date();

    // Save changes
    await record.save();

    // Log the update
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.UPDATE, 'LAND_RECORD', id, {
      description: `Updated land record: ${record.referenceNumber}`,
      oldValues: JSON.stringify(oldValues),
      newValues: JSON.stringify(record.toObject()),
    });

    res.status(200).json({
      success: true,
      message: 'Land record updated successfully!',
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating land record: ' + error.message,
    });
  }
};

/**
 * Assign land record to a user
 */
const assignRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a user to assign the record to.',
      });
    }

    const record = await LandRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    record.assignedTo = assignedTo;
    record.lastModifiedBy = req.user._id;
    await record.save();

    // Log the assignment
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.UPDATE, 'LAND_RECORD', id, {
      description: `Assigned land record to another user`,
    });

    res.status(200).json({
      success: true,
      message: 'Record assigned successfully!',
      record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning record: ' + error.message,
    });
  }
};

/**
 * Transfer ownership of a land record to a new owner
 * Only an ADMIN can perform this action
 */
const transferOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwner } = req.body;

    if (!newOwner || !newOwner.ownerName || !newOwner.ownerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new owner information (ownerName and ownerEmail are required).',
      });
    }

    const record = await LandRecord.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Land record not found.' });
    }

    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only an admin can transfer ownership.' });
    }

    const oldOwner = record.ownerInformation ? { ...record.ownerInformation } : {};

    // Update owner information
    record.ownerInformation = {
      ownerName: newOwner.ownerName,
      ownerEmail: newOwner.ownerEmail,
      ownerPhone: newOwner.ownerPhone || '',
      idNumber: newOwner.idNumber || '',
      idType: newOwner.idType || '',
    };

    record.lastModifiedBy = req.user._id;
    record.updatedAt = new Date();

    await record.save();

    // Log transfer in audit trail
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.UPDATE, 'LAND_RECORD', id, {
      description: `Transferred ownership of record ${record.referenceNumber}`,
      oldValues: JSON.stringify(oldOwner),
      newValues: JSON.stringify(record.ownerInformation),
    });

    res.status(200).json({ success: true, message: 'Ownership transferred successfully!', record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error transferring ownership: ' + error.message });
  }
};

/**
 * Transfer land ownership to a person of interest (family, friend, etc.)
 * The current owner must be authenticated and can transfer to another registered user
 */
const transferLandToInterest = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { newOwnerId, reason } = req.body;

    // Validate input
    if (!recordId || !newOwnerId) {
      return res.status(400).json({
        success: false,
        message: 'Record ID and new owner ID are required.',
      });
    }

    // Find the land record
    const record = await LandRecord.findById(recordId).populate('ownerUser', 'fullName email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Check if the current user is the owner of the land
    if (record.ownerUser && record.ownerUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to transfer this land. Only the current owner can transfer ownership.',
      });
    }

    // Check if owner information exists (fallback if ownerUser is not set)
    if (!record.ownerUser && record.ownerInformation?.ownerEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You are not the registered owner of this land.',
      });
    }

    // Find the new owner
    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({
        success: false,
        message: 'New owner user not found in the system.',
      });
    }

    // Store old ownership information
    const oldOwnerInfo = {
      ownerId: record.ownerUser?._id || null,
      ownerName: record.ownerInformation?.ownerName || req.user.fullName,
      ownerEmail: record.ownerInformation?.ownerEmail || req.user.email,
    };

    // Add to transfer history
    record.transferHistory.push({
      fromOwner: record.ownerUser || req.user._id,
      toOwner: newOwnerId,
      fromOwnerInfo: {
        name: record.ownerInformation?.ownerName || req.user.fullName,
        email: record.ownerInformation?.ownerEmail || req.user.email,
      },
      toOwnerInfo: {
        name: newOwner.fullName,
        email: newOwner.email,
      },
      transferredAt: new Date(),
      transferredBy: req.user._id,
      reason: reason || 'Land transfer to person of interest',
    });

    // Update owner
    record.ownerUser = newOwnerId;
    record.ownerInformation = {
      ownerName: newOwner.fullName,
      ownerEmail: newOwner.email,
      ownerPhone: record.ownerInformation?.ownerPhone || '',
      idNumber: record.ownerInformation?.idNumber || '',
      idType: record.ownerInformation?.idType || '',
    };

    record.lastModifiedBy = req.user._id;
    record.updatedAt = new Date();

    // Save the updated record
    await record.save();

    // Populate references for response
    await record.populate('ownerUser', 'fullName email');
    await record.populate('transferHistory.fromOwner', 'fullName email');
    await record.populate('transferHistory.toOwner', 'fullName email');

    // Log the transfer in audit trail
    await logAuditTrail(req.user._id, AUDIT_ACTIONS.UPDATE, 'LAND_RECORD', recordId, {
      description: `Transferred land record ${record.referenceNumber} from ${oldOwnerInfo.ownerName} to ${newOwner.fullName}`,
      transferReason: reason,
      oldOwner: JSON.stringify(oldOwnerInfo),
      newOwner: JSON.stringify({
        ownerId: newOwnerId,
        ownerName: newOwner.fullName,
        ownerEmail: newOwner.email,
      }),
    });

    res.status(200).json({
      success: true,
      message: 'Land successfully transferred to new owner!',
      record,
      transfer: {
        from: oldOwnerInfo,
        to: {
          ownerId: newOwnerId,
          ownerName: newOwner.fullName,
          ownerEmail: newOwner.email,
        },
        transferredAt: new Date(),
        reason: reason || 'Land transfer to person of interest',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error transferring land: ' + error.message,
    });
  }
};

/**
 * Delete a land record
 */
const deleteLandRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await LandRecord.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Land record not found.',
      });
    }

    // Remove uploaded files linked to this record (if any still exist on disk).
    const uploadDir = path.join(__dirname, '../../uploads');
    for (const document of record.documents || []) {
      if (!document.filePath) continue;
      const absoluteFilePath = path.join(uploadDir, document.filePath);
      if (fs.existsSync(absoluteFilePath)) {
        fs.unlinkSync(absoluteFilePath);
      }
    }

    const referenceNumber = record.referenceNumber;
    await record.deleteOne();

    await logAuditTrail(req.user._id, AUDIT_ACTIONS.DELETE, 'LAND_RECORD', id, {
      description: `Deleted land record: ${referenceNumber}`,
    });

    res.status(200).json({
      success: true,
      message: 'Land record deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting land record: ' + error.message,
    });
  }
};

module.exports = {
  createLandRecord,
  generateRecordsReport,
  getAllLandRecords,
  getLandRecordById,
  updateLandRecord,
  assignRecord,
  deleteLandRecord,
  transferOwnership,
  transferLandToInterest,
};

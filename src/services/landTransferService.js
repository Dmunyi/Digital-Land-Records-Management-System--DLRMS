/**
 * Land Transfer Service
 * Provides utility functions for managing land ownership transfers
 */

const LandRecord = require('../models/LandRecord');
const User = require('../models/User');
const { logAuditTrail } = require('../utils/logger');
const { AUDIT_ACTIONS } = require('../config/constants');

/**
 * Get all transfer history for a specific land record
 * @param {string} recordId - The ID of the land record
 * @returns {Promise<Array>} - Array of transfer history objects
 */
const getTransferHistory = async (recordId) => {
  try {
    const record = await LandRecord.findById(recordId)
      .populate('transferHistory.fromOwner', 'fullName email')
      .populate('transferHistory.toOwner', 'fullName email')
      .populate('transferHistory.transferredBy', 'fullName email');

    if (!record) {
      throw new Error('Land record not found');
    }

    return record.transferHistory || [];
  } catch (error) {
    throw new Error(`Error retrieving transfer history: ${error.message}`);
  }
};

/**
 * Validate if a user is the current owner of a land record
 * @param {string} recordId - The ID of the land record
 * @param {string} userId - The ID of the user to check
 * @returns {Promise<boolean>} - True if user is the owner
 */
const isCurrentOwner = async (recordId, userId) => {
  try {
    const record = await LandRecord.findById(recordId);
    if (!record) {
      throw new Error('Land record not found');
    }

    // Check if user is the ownerUser
    if (record.ownerUser && record.ownerUser.toString() === userId) {
      return true;
    }

    // Fallback check against ownerInformation
    const user = await User.findById(userId);
    if (user && record.ownerInformation?.ownerEmail === user.email) {
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(`Error validating ownership: ${error.message}`);
  }
};

/**
 * Get all land records owned by a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} - Array of land records owned by the user
 */
const getUserLandRecords = async (userId) => {
  try {
    const records = await LandRecord.find({ ownerUser: userId })
      .populate('ownerUser', 'fullName email')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    return records;
  } catch (error) {
    throw new Error(`Error retrieving user land records: ${error.message}`);
  }
};

/**
 * Get transfer statistics for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - Transfer statistics
 */
const getUserTransferStats = async (userId) => {
  try {
    const ownedRecords = await LandRecord.find({ ownerUser: userId });
    const totalRecordsOwned = ownedRecords.length;

    let totalTransfersIn = 0;
    let totalTransfersOut = 0;

    // Count transfers in and out
    const allRecords = await LandRecord.find();
    allRecords.forEach((record) => {
      if (record.transferHistory && Array.isArray(record.transferHistory)) {
        record.transferHistory.forEach((transfer) => {
          if (transfer.fromOwner?.toString() === userId) {
            totalTransfersOut++;
          }
          if (transfer.toOwner?.toString() === userId) {
            totalTransfersIn++;
          }
        });
      }
    });

    return {
      userId,
      totalRecordsOwned,
      totalTransfersIn,
      totalTransfersOut,
      netTransfers: totalTransfersIn - totalTransfersOut,
    };
  } catch (error) {
    throw new Error(`Error calculating transfer statistics: ${error.message}`);
  }
};

/**
 * Get recommended recipients for transfer (family/friends registered in system)
 * @param {string} userId - The ID of the current owner
 * @returns {Promise<Array>} - Array of recommended users (excluding the owner)
 */
const getRecommendedRecipients = async (userId) => {
  try {
    // Get all active users except the current user
    const recipients = await User.find({
      _id: { $ne: userId },
      isActive: true,
      isVerified: true,
    }).select('_id fullName email role');

    return recipients;
  } catch (error) {
    throw new Error(`Error retrieving recommended recipients: ${error.message}`);
  }
};

/**
 * Bulk transfer lands to multiple persons of interest
 * @param {Array} transfers - Array of transfer objects {recordId, newOwnerId, reason}
 * @param {string} userId - The current user performing transfers
 * @param {Object} audit - Audit user object
 * @returns {Promise<Object>} - Result of bulk transfer operation
 */
const bulkTransferLands = async (transfers, userId, audit) => {
  const results = {
    successful: [],
    failed: [],
  };

  for (const transfer of transfers) {
    try {
      const record = await LandRecord.findById(transfer.recordId).populate('ownerUser');

      // Validate ownership
      if (record.ownerUser && record.ownerUser._id.toString() !== userId) {
        results.failed.push({
          recordId: transfer.recordId,
          reason: 'You do not own this land record',
        });
        continue;
      }

      // Find new owner
      const newOwner = await User.findById(transfer.newOwnerId);
      if (!newOwner) {
        results.failed.push({
          recordId: transfer.recordId,
          reason: 'New owner not found',
        });
        continue;
      }

      // Update record
      record.transferHistory.push({
        fromOwner: record.ownerUser,
        toOwner: transfer.newOwnerId,
        fromOwnerInfo: {
          name: record.ownerInformation?.ownerName,
          email: record.ownerInformation?.ownerEmail,
        },
        toOwnerInfo: {
          name: newOwner.fullName,
          email: newOwner.email,
        },
        transferredAt: new Date(),
        transferredBy: audit._id,
        reason: transfer.reason || 'Bulk land transfer',
      });

      record.ownerUser = transfer.newOwnerId;
      record.ownerInformation = {
        ownerName: newOwner.fullName,
        ownerEmail: newOwner.email,
        ownerPhone: record.ownerInformation?.ownerPhone || '',
        idNumber: record.ownerInformation?.idNumber || '',
        idType: record.ownerInformation?.idType || '',
      };

      record.lastModifiedBy = audit._id;
      record.updatedAt = new Date();

      await record.save();

      // Log audit
      await logAuditTrail(audit._id, AUDIT_ACTIONS.UPDATE, 'LAND_RECORD', transfer.recordId, {
        description: `Bulk transferred land record ${record.referenceNumber} to ${newOwner.fullName}`,
        transferReason: transfer.reason,
      });

      results.successful.push({
        recordId: transfer.recordId,
        referenceNumber: record.referenceNumber,
        newOwner: newOwner.fullName,
      });
    } catch (error) {
      results.failed.push({
        recordId: transfer.recordId,
        reason: error.message,
      });
    }
  }

  return results;
};

module.exports = {
  getTransferHistory,
  isCurrentOwner,
  getUserLandRecords,
  getUserTransferStats,
  getRecommendedRecipients,
  bulkTransferLands,
};

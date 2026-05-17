/**
 * Land Record Model
 * Defines the schema for land records and their associated documents
 */

const mongoose = require('mongoose');
const { RECORD_STATUS } = require('../config/constants');

// Define land record schema
const landRecordSchema = new mongoose.Schema(
  {
    // Record Identification
    referenceNumber: {
      type: String,
      unique: true,
      required: [true, 'Reference number is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
    },

    // Property Details
    propertyDetails: {
      plotNumber: String,
      areaSize: String,
      areaUnit: {
        type: String,
        enum: ['sq.m', 'acres', 'hectares'],
        default: 'sq.m',
      },
      location: {
        province: String,
        district: String,
        ward: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
    },

    // Owner Reference (Links to User in system)
    ownerUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },

    // Owner Information
    ownerInformation: {
      ownerName: String,
      ownerEmail: String,
      ownerPhone: String,
      idNumber: String,
      idType: {
        type: String,
        enum: ['NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE'],
      },
    },

    // Record Status and Processing
    status: {
      type: String,
      enum: Object.values(RECORD_STATUS),
      default: RECORD_STATUS.PENDING,
      index: true,
    },
    processingStage: {
      type: String,
      enum: ['INITIAL_REVIEW', 'VERIFICATION', 'PROCESSING', 'FINALIZATION'],
      default: 'INITIAL_REVIEW',
    },

    // File Management
    documents: [
      {
        fileName: String,
        fileType: String,
        filePath: String,
        uploadedAt: Date,
        uploadedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        fileSize: Number,
      },
    ],

    // Assignment and Tracking
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    currentPhysicalLocation: {
      type: String,
      default: 'Archive Room A',
    },

    // Metadata
    description: String,
    remarks: String,
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM',
    },

    // User Tracking
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },

    // Transfer History (Persons of Interest)
    transferHistory: [
      {
        fromOwner: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        toOwner: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        fromOwnerInfo: {
          name: String,
          email: String,
        },
        toOwnerInfo: {
          name: String,
          email: String,
        },
        transferredAt: {
          type: Date,
          default: Date.now,
        },
        transferredBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        reason: String,
      },
    ],

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

// Index for faster searches
landRecordSchema.index({ referenceNumber: 1, status: 1 });
landRecordSchema.index({ 'ownerInformation.ownerName': 'text', title: 'text' });
landRecordSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LandRecord', landRecordSchema);

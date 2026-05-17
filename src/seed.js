// Sample Data Seed Script for DLRMS
// This script populates the database with sample data for testing



const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('./models/User');
const LandRecord = require('./models/LandRecord');
const AuditLog = require('./models/AuditLog');
const { connectDatabase } = require('./config/database');

const SAMPLE_USERS = [
  {
    fullName: 'Admin User',
    email: 'admin@dlrms.gov',
    password: 'admin123', // Will be hashed by pre-save hook
    role: 'ADMIN',
    department: 'Administration',
    employeeId: 'ADM001',
    isActive: true,
    isVerified: true
  },
  {
    fullName: 'Manager User',
    email: 'manager@dlrms.gov',
    password: 'manager123',
    role: 'MANAGER',
    department: 'Land Records',
    employeeId: 'MGR001',
    isActive: true,
    isVerified: true
  },
  {
    fullName: 'Recording Officer',
    email: 'officer@dlrms.gov',
    password: 'officer123',
    role: 'OFFICER',
    department: 'Recording',
    employeeId: 'REC001',
    isActive: true,
    isVerified: true
  },
  {
    fullName: 'Viewer User',
    email: 'viewer@dlrms.gov',
    password: 'viewer123',
    role: 'VIEWER',
    department: 'Public Services',
    employeeId: 'VWR001',
    isActive: true,
    isVerified: true
  }
];

const SAMPLE_RECORDS = [
  {
    referenceNumber: 'LR-2024-001',
    title: 'Urban Residential Plot A',
    description: '5000 sq.m residential property in downtown area',
    status: 'PENDING',
    processingStage: 'INITIAL_REVIEW',
    priority: 'HIGH',
    currentPhysicalLocation: 'Archive Room A - Shelf 1',
    propertyDetails: {
      plotNumber: 'PLOT-001',
      areaSize: 5000,
      areaUnit: 'sq.m',
      location: {
        province: 'Central Province',
        district: 'Downtown District',
        ward: 'Ward A',
        coordinates: {
          latitude: -1.2857,
          longitude: 36.8172
        }
      }
    },
    ownerInformation: {
      ownerName: 'Alice Johnson',
      ownerEmail: 'alice@example.com',
      ownerPhone: '+254-700-123456',
      idNumber: 'ID12345',
      idType: 'NATIONAL_ID'
    }
  },
  {
    referenceNumber: 'LR-2024-002',
    title: 'Commercial Property B',
    description: '10000 sq.m commercial building near city center',
    status: 'PROCESSING',
    processingStage: 'VERIFICATION',
    priority: 'MEDIUM',
    currentPhysicalLocation: 'Archive Room A - Shelf 2',
    propertyDetails: {
      plotNumber: 'PLOT-002',
      areaSize: 10000,
      areaUnit: 'sq.m',
      location: {
        province: 'Central Province',
        district: 'Commercial Zone',
        ward: 'Ward B'
      }
    },
    ownerInformation: {
      ownerName: 'Bob Corporation',
      ownerEmail: 'bob@company.com',
      ownerPhone: '+254-700-234567',
      idNumber: 'ID67890',
      idType: 'NATIONAL_ID'
    }
  },
  {
    referenceNumber: 'LR-2024-003',
    title: 'Agricultural Land C',
    description: '50 acres of farmland for agricultural use',
    status: 'COMPLETED',
    processingStage: 'FINALIZATION',
    priority: 'LOW',
    currentPhysicalLocation: 'Archive Room B - Shelf 1',
    propertyDetails: {
      plotNumber: 'PLOT-003',
      areaSize: 50,
      areaUnit: 'acres',
      location: {
        province: 'Western Province',
        district: 'Rural District',
        ward: 'Ward C'
      }
    },
    ownerInformation: {
      ownerName: 'Carol Farmer',
      ownerEmail: 'carol@farm.com',
      ownerPhone: '+254-700-345678',
      idNumber: 'ID13579',
      idType: 'NATIONAL_ID'
    }
  },
  {
    referenceNumber: 'LR-2024-004',
    title: 'Industrial Zone Plot D',
    description: '15000 sq.m industrial manufacturing space',
    status: 'PROCESSING',
    processingStage: 'PROCESSING',
    priority: 'HIGH',
    currentPhysicalLocation: 'Archive Room C - Shelf 1',
    propertyDetails: {
      plotNumber: 'PLOT-004',
      areaSize: 15000,
      areaUnit: 'sq.m',
      location: {
        province: 'Eastern Province',
        district: 'Industrial Zone',
        ward: 'Ward D'
      }
    },
    ownerInformation: {
      ownerName: 'David Manufacturing Ltd',
      ownerEmail: 'david@manufacturing.com',
      ownerPhone: '+254-700-456789',
      idNumber: 'ID24680',
      idType: 'NATIONAL_ID'
    }
  },
  {
    referenceNumber: 'LR-2024-005',
    title: 'Residential Complex E',
    description: '8000 sq.m multi-unit residential complex',
    status: 'PENDING',
    processingStage: 'INITIAL_REVIEW',
    priority: 'MEDIUM',
    currentPhysicalLocation: 'Archive Room A - Shelf 3',
    propertyDetails: {
      plotNumber: 'PLOT-005',
      areaSize: 8000,
      areaUnit: 'sq.m',
      location: {
        province: 'Central Province',
        district: 'Suburban Area',
        ward: 'Ward E'
      }
    },
    ownerInformation: {
      ownerName: 'Eve Real Estate',
      ownerEmail: 'eve@realestate.com',
      ownerPhone: '+254-700-567890',
      idNumber: 'ID35791',
      idType: 'NATIONAL_ID'
    }
  }
];

async function seedDatabase() {
  try {
    console.log('📚 Starting database seeding...\n');

    // Connect to database
    await connectDatabase();
    console.log('✓ Connected to database\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await LandRecord.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('✓ Existing data cleared\n');

    // Seed users
    console.log('👥 Creating sample users...');
    const createdUsers = await User.create(SAMPLE_USERS);
    console.log(`✓ Created ${createdUsers.length} users:`);
    createdUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.email} (${user.role})`);
    });
    console.log('');

    // Map users for records
    const adminUser = createdUsers.find(u => u.role === 'ADMIN');
    const managerUser = createdUsers.find(u => u.role === 'MANAGER');
    const officerUser = createdUsers.find(u => u.role === 'OFFICER');

    // Seed land records with user references
    console.log('📋 Creating sample land records...');
    const recordsWithUsers = SAMPLE_RECORDS.map((record, idx) => ({
      ...record,
      createdBy: adminUser._id,
      assignedTo: idx % 2 === 0 ? officerUser._id : managerUser._id,
      lastModifiedBy: adminUser._id
    }));

    const createdRecords = await LandRecord.create(recordsWithUsers);
    console.log(`✓ Created ${createdRecords.length} land records:`);
    createdRecords.forEach((record, idx) => {
      console.log(`  ${idx + 1}. ${record.referenceNumber} - ${record.title} (${record.status})`);
    });
    console.log('');

    // Seed audit logs
    console.log('📊 Creating audit logs...');
    const auditLogs = [
      {
        userId: adminUser._id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'LOGIN',
        entityType: 'SYSTEM',
        description: 'Admin user logged in',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        status: 'SUCCESS',
        timestamp: new Date()
      },
      ...createdRecords.map(record => ({
        userId: adminUser._id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        action: 'CREATE',
        entityType: 'LAND_RECORD',
        entityId: record._id,
        description: `Land record created: ${record.referenceNumber}`,
        newValues: {
          referenceNumber: record.referenceNumber,
          title: record.title,
          status: record.status
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        status: 'SUCCESS',
        timestamp: new Date()
      }))
    ];

    const createdAuditLogs = await AuditLog.create(auditLogs);
    console.log(`✓ Created ${createdAuditLogs.length} audit logs\n`);

    // Display login credentials
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Database seeding completed successfully!\n');
    console.log('🔐 Test Account Credentials:\n');
    
    createdUsers.forEach(user => {
      const password = SAMPLE_USERS.find(u => u.email === user.email).password;
      console.log(`📧 ${user.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 Summary:');
    console.log(`  • Users created: ${createdUsers.length}`);
    console.log(`  • Land records created: ${createdRecords.length}`);
    console.log(`  • Audit logs created: ${createdAuditLogs.length}`);
    console.log('');
    console.log('🚀 You can now start the application and login with any of the above credentials.\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✓ Database connection closed\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();

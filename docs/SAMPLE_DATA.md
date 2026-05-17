# DLRMS Sample Data Guide

## Overview

To make testing and development easier, this guide explains how to populate your database with sample data.

## Seed Script

Located in: `backend/src/seed.js`

### What Does It Create?

1. **4 Sample Users** with different roles:
   - Admin User (all permissions)
   - Manager User (management permissions)
   - Officer User (data entry permissions)
   - Viewer User (read-only)

2. **5 Sample Land Records** with:
   - Different property types (residential, commercial, agricultural, industrial)
   - Various statuses (pending, processing, completed)
   - Complete owner information
   - Geographic locations

3. **Audit Logs** tracking:
   - User login activities
   - Record creation events

## Running the Seed Script

### Step 1: Ensure MongoDB is Running

```bash
# Windows - Services > MongoDB Server > Start
# macOS - brew services start mongodb-community
# Linux - sudo systemctl start mongod
```

Verify:
```bash
mongosh
> db.adminCommand('ping')
# Should return { ok: 1 }
```

### Step 2: Navigate to Backend

```bash
cd backend
```

### Step 3: Run Seed Script

```bash
node src/seed.js
```

### Expected Output

```
📚 Starting database seeding...

✓ Connected to database

🗑️ Clearing existing data...
✓ Existing data cleared

👥 Creating sample users...
✓ Created 4 users:
  1. admin@dlrms.gov (ADMIN)
  2. manager@dlrms.gov (MANAGER)
  3. officer@dlrms.gov (OFFICER)
  4. viewer@dlrms.gov (VIEWER)

📋 Creating sample land records...
✓ Created 5 land records:
  1. LR-2024-001 - Urban Residential Plot A (PENDING)
  2. LR-2024-002 - Commercial Property B (PROCESSING)
  3. LR-2024-003 - Agricultural Land C (COMPLETED)
  4. LR-2024-004 - Industrial Zone Plot D (PROCESSING)
  5. LR-2024-005 - Residential Complex E (PENDING)

📊 Creating audit logs...
✓ Created 6 audit logs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Database seeding completed successfully!

🔐 Test Account Credentials:

📧 admin@dlrms.gov
   Password: admin123
   Role: ADMIN

📧 manager@dlrms.gov
   Password: manager123
   Role: MANAGER

📧 officer@dlrms.gov
   Password: officer123
   Role: OFFICER

📧 viewer@dlrms.gov
   Password: viewer123
   Role: VIEWER

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
  • Users created: 4
  • Land records created: 5
  • Audit logs created: 6

🚀 You can now start the application and login with any of the above credentials.
```

## Test Accounts

### Admin Account
```
Email: admin@dlrms.gov
Password: admin123
```
**Permissions**: Full system access, all features available

### Manager Account
```
Email: manager@dlrms.gov
Password: manager123
```
**Permissions**: Manage records, view audit logs, cannot manage users

### Officer Account
```
Email: officer@dlrms.gov
Password: officer123
```
**Permissions**: Create and edit records, upload documents, cannot manage other users

### Viewer Account
```
Email: viewer@dlrms.gov
Password: viewer123
```
**Permissions**: View records only, cannot create or edit

## Sample Records

### Record 1: Urban Residential Plot A
- Status: PENDING
- Stage: INITIAL_REVIEW
- Priority: HIGH

### Record 2: Commercial Property B
- Status: PROCESSING
- Stage: VERIFICATION
- Priority: MEDIUM

### Record 3: Agricultural Land C
- Status: COMPLETED
- Stage: FINALIZATION
- Priority: LOW

### Record 4: Industrial Zone Plot D
- Status: PROCESSING
- Stage: PROCESSING
- Priority: HIGH

### Record 5: Residential Complex E
- Status: PENDING
- Stage: INITIAL_REVIEW
- Priority: MEDIUM

## Testing Features

With sample data loaded, you can test:

- ✅ **Login**: Use any of the 4 test accounts
- ✅ **Dashboard**: View statistics and recent records
- ✅ **Record Browsing**: Search and filter 5 sample records
- ✅ **Status Transitions**: Change record status (OFFICER+ only)
- ✅ **Audit Trail**: View user actions in audit logs
- ✅ **Role-Based Access**: Try each role's permissions

## Testing Workflows

### Test 1: Asset Officer Workflow

1. Login as: `officer@dlrms.gov` / `officer123`
2. Navigate to Records > List
3. Find "Urban Residential Plot A"
4. Click to view details
5. Try editing property information
6. Upload a test document (PDF, JPG, PNG)
7. View uploaded document

**Outcome**: Officer should be able to create/edit records and upload documents

### Test 2: Manager Oversight

1. Login as: `manager@dlrms.gov` / `manager123`
2. Navigate to Dashboard
3. Review statistics
4. Go to Records > List
5. Search for records (try searching by owner name)
6. Click Audit Logs
7. Review system activities

**Outcome**: Manager should see all records and audit trails

### Test 3: Admin Control

1. Login as: `admin@dlrms.gov` / `admin123`
2. Navigate to Dashboard
3. View all system statistics
4. Access all record types
5. Review complete audit trail
6. Try all possible role assignments

**Outcome**: Admin should have full system access

### Test 4: Read-Only Access

1. Login as: `viewer@dlrms.gov` / `viewer123`
2. Try to navigate to create record (should be blocked)
3. View dashboard (limited to read-only stats)
4. Search and view records

**Outcome**: Viewer should see records but not be able to edit

## Clearing Data

To clear all data and re-seed:

```bash
mongosh
> use dlrms
> db.dropDatabase()
> exit

# Then re-run seed script
node src/seed.js
```

Or just clear specific collections:

```bash
mongosh
> use dlrms
> db.users.deleteMany({})
> db.landrecords.deleteMany({})
> db.auditlegs.deleteMany({})
> exit
```

## Creating Custom Sample Data

To add more sample data, edit `backend/src/seed.js`:

```javascript
const SAMPLE_USERS = [
  // Add more users here
];

const SAMPLE_RECORDS = [
  // Add more records here
];
```

Then run the seed script again:
```bash
node src/seed.js
```

## Troubleshooting

**Issue**: "Cannot find module 'dotenv'"
```bash
cd backend
npm install
```

**Issue**: "Cannot connect to database"
```bash
# Start MongoDB
mongosh
> db.adminCommand('ping')
```

**Issue**: "ENOENT: no such file or directory"
```bash
# Ensure you're in backend directory
pwd  # Check current directory
cd backend
```

**Issue**: Permission denied
```bash
# Run with proper permissions
sudo node src/seed.js  # macOS/Linux only if needed
```

## Next Steps

After seeding:

1. ✅ Start backend: `npm start` (in backend directory)
2. ✅ Start frontend: `npm start` (in frontend directory)
3. ✅ Open browser: `http://localhost:3000`
4. ✅ Login with any test account
5. ✅ Explore and test features
6. ✅ Read USER_GUIDE.md for detailed workflows

## Resetting for Production

**IMPORTANT**: Before deploying to production:

1. Delete or run without the seed script
2. Do NOT include test user credentials in production
3. Create real user accounts through registration or admin panel
4. Properly secure all credentials (use strong passwords)
5. Enable HTTPS
6. Use production database URL

---

**Version**: 1.0.0  
**Last Updated**: March 2024

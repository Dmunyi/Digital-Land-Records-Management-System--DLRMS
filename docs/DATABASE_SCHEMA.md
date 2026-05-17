# DLRMS Database Schema

## 📊 Database Overview

The DLRMS uses MongoDB as its database. MongoDB stores data in JSON-like documents organized into collections. This document describes all collections, their fields, and relationships.

---

## 📦 Collections

### 1. Users Collection

**Purpose**: Store user account information and credentials

**Collection Name**: `users`

**Fields**:

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `_id` | ObjectId | Auto | Yes | Unique user identifier |
| `fullName` | String | Yes | No | User's full name |
| `email` | String | Yes | Yes | User's email address |
| `password` | String | Yes | No | Hashed password (bcrypt) |
| `role` | String | Yes | No | User role: ADMIN, MANAGER, OFFICER, VIEWER |
| `department` | String | No | No | User's department |
| `employeeId` | String | No | Yes | Employee identification number |
| `isActive` | Boolean | No | No | Whether account is active (default: true) |
| `isVerified` | Boolean | No | No | Whether email is verified (default: false) |
| `lastLogin` | Date | No | No | Timestamp of last login |
| `createdAt` | Date | Auto | No | Account creation timestamp |
| `updatedAt` | Date | Auto | No | Last account update timestamp |

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "fullName": "John Doe",
  "email": "john@dlrms.gov",
  "password": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36jJjstm",
  "role": "OFFICER",
  "department": "Land Records",
  "employeeId": "EMP001",
  "isActive": true,
  "isVerified": true,
  "lastLogin": ISODate("2024-03-20T10:30:00Z"),
  "createdAt": ISODate("2024-03-15T08:00:00Z"),
  "updatedAt": ISODate("2024-03-20T10:30:00Z")
}
```

**Indexes**:
```
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ employeeId: 1 }, { sparse: true, unique: true })
```

---

### 2. Land Records Collection

**Purpose**: Store all land records and their metadata

**Collection Name**: `landrecords`

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique record identifier |
| `referenceNumber` | String | Unique reference (e.g., LR-2024-001) |
| `title` | String | Record title |
| `description` | String | Record description |
| `status` | String | Status: PENDING, PROCESSING, COMPLETED, ARCHIVED |
| `processingStage` | String | Stage: INITIAL_REVIEW, VERIFICATION, PROCESSING, FINALIZATION |
| `priority` | String | Priority: LOW, MEDIUM, HIGH |
| `currentPhysicalLocation` | String | Physical storage location |
| `propertyDetails` | Object | Property information object |
| `propertyDetails.plotNumber` | String | Plot identifier |
| `propertyDetails.areaSize` | Number | Land area size |
| `propertyDetails.areaUnit` | String | Unit: sq.m, acres, hectares |
| `propertyDetails.location` | Object | Geographic location |
| `propertyDetails.location.province` | String | Province/state |
| `propertyDetails.location.district` | String | District/county |
| `propertyDetails.location.ward` | String | Ward/local area |
| `propertyDetails.location.coordinates` | Object | GPS coordinates (optional) |
| `propertyDetails.location.coordinates.latitude` | Number | Latitude |
| `propertyDetails.location.coordinates.longitude` | Number | Longitude |
| `ownerInformation` | Object | Property owner details object |
| `ownerInformation.ownerName` | String | Owner's full name |
| `ownerInformation.ownerEmail` | String | Owner's email |
| `ownerInformation.ownerPhone` | String | Owner's phone |
| `ownerInformation.idNumber` | String | Owner's ID number |
| `ownerInformation.idType` | String | ID type: NATIONAL_ID, PASSPORT, DRIVING_LICENSE |
| `documents` | Array | Array of uploaded documents |
| `documents[].fileName` | String | Original file name |
| `documents[].fileType` | String | File extension (pdf, jpg, png, etc.) |
| `documents[].filePath` | String | Stored file path |
| `documents[].uploadedAt` | Date | Upload timestamp |
| `documents[].uploadedBy` | ObjectId | User who uploaded (ref: users) |
| `documents[].fileSize` | Number | File size in bytes |
| `assignedTo` | ObjectId | User assigned to record (ref: users) |
| `createdBy` | ObjectId | User who created record (ref: users) |
| `lastModifiedBy` | ObjectId | Last user to modify (ref: users) |
| `createdAt` | Date | Record creation timestamp |
| `updatedAt` | Date | Last update timestamp |
| `completedAt` | Date | Completion timestamp |

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "referenceNumber": "LR-2024-001",
  "title": "Urban Residential Plot",
  "description": "5000 sq.m commercial property",
  "status": "PROCESSING",
  "processingStage": "VERIFICATION",
  "priority": "HIGH",
  "currentPhysicalLocation": "Archive Room A",
  "propertyDetails": {
    "plotNumber": "PLOT-001",
    "areaSize": 5000,
    "areaUnit": "sq.m",
    "location": {
      "province": "Central Province",
      "district": "Downtown District",
      "ward": "Ward A",
      "coordinates": {
        "latitude": -1.2857,
        "longitude": 36.8172
      }
    }
  },
  "ownerInformation": {
    "ownerName": "Alice Johnson",
    "ownerEmail": "alice@example.com",
    "ownerPhone": "+1-555-0123",
    "idNumber": "ID12345",
    "idType": "NATIONAL_ID"
  },
  "documents": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439020"),
      "fileName": "title_deed.pdf",
      "fileType": "pdf",
      "filePath": "1234567890_title_deed.pdf",
      "uploadedAt": ISODate("2024-03-20T11:00:00Z"),
      "uploadedBy": ObjectId("507f1f77bcf86cd799439011"),
      "fileSize": 245120
    }
  ],
  "assignedTo": ObjectId("507f1f77bcf86cd799439011"),
  "createdBy": ObjectId("507f1f77bcf86cd799439010"),
  "lastModifiedBy": ObjectId("507f1f77bcf86cd799439011"),
  "createdAt": ISODate("2024-03-20T10:00:00Z"),
  "updatedAt": ISODate("2024-03-20T11:00:00Z")
}
```

**Indexes**:
```
db.landrecords.createIndex({ referenceNumber: 1 }, { unique: true })
db.landrecords.createIndex({ referenceNumber: 1, status: 1 })
db.landrecords.createIndex({ status: 1 })
db.landrecords.createIndex({ createdAt: -1 })
db.landrecords.createIndex(
  { "ownerInformation.ownerName": "text", title: "text" }
)
```

---

### 3. Audit Logs Collection

**Purpose**: Track all system activities for compliance and security

**Collection Name**: `auditlegs`

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique log identifier |
| `userId` | ObjectId | User who performed action (ref: users) |
| `userEmail` | String | User's email (for reference) |
| `userRole` | String | User's role at time of action |
| `action` | String | Action type: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, UPLOAD, DOWNLOAD |
| `entityType` | String | Entity affected: LAND_RECORD, USER, SYSTEM |
| `entityId` | ObjectId | ID of affected entity |
| `description` | String | Human-readable description |
| `oldValues` | Mixed | Previous values (for updates) |
| `newValues` | Mixed | New values (for updates) |
| `ipAddress` | String | User's IP address |
| `userAgent` | String | Browser/client information |
| `status` | String | Result: SUCCESS, FAILED, UNAUTHORIZED |
| `timestamp` | Date | Action timestamp |

**Sample Document**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439030"),
  "userId": ObjectId("507f1f77bcf86cd799439011"),
  "userEmail": "john@dlrms.gov",
  "userRole": "OFFICER",
  "action": "CREATE",
  "entityType": "LAND_RECORD",
  "entityId": ObjectId("507f1f77bcf86cd799439012"),
  "description": "Land record created: LR-2024-001",
  "oldValues": null,
  "newValues": {
    "referenceNumber": "LR-2024-001",
    "title": "Urban Residential Plot",
    "status": "PENDING"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "status": "SUCCESS",
  "timestamp": ISODate("2024-03-20T10:00:00Z")
}
```

**Indexes**:
```
db.auditlegs.createIndex({ userId: 1, timestamp: -1 })
db.auditlegs.createIndex({ action: 1, timestamp: -1 })
db.auditlegs.createIndex({ entityType: 1, entityId: 1 })
db.auditlegs.createIndex({ timestamp: -1 })
```

---

## 🔗 Relationships

### User → LandRecord (One to Many)

A user can create multiple land records.

- **createdBy** field in LandRecord references User._id

### User → LandRecord (One to Many)

A user can be assigned to multiple land records.

- **assignedTo** field in LandRecord references User._id

### User → AuditLog (One to Many)

A user can have multiple audit log entries.

- **userId** field in AuditLog references User._id

### User → Document (One to Many)

A user can upload multiple documents.

- **uploadedBy** field in Document (within LandRecord) references User._id

---

## 📈 Data Growth Projections

| Metric | 1 Month | 6 Months | 1 Year |
|--------|---------|----------|--------|
| Users | ~50 | ~150 | ~300 |
| Land Records | ~500 | ~3,000 | ~10,000 |
| Documents | ~1,500 | ~9,000 | ~30,000 |
| Audit Logs | ~50,000 | ~300,000 | ~1,000,000 |
| Database Size | ~50 MB | ~300 MB | ~1 GB |

---

## 💾 Backup and Recovery

### Backup Strategy

```bash
# Backup entire database
mongodump --db dlrms --out ./backups/dlrms_backup_$(date +%Y%m%d)

# Backup specific collection
mongodump --db dlrms -c users --out ./backups/users_backup
```

### Restore Strategy

```bash
# Restore entire database
mongorestore --db dlrms ./backups/dlrms_backup_20240320

# Restore specific collection
mongorestore --db dlrms -c users ./backups/users_backup/dlrms/users.bson
```

### Backup Schedule

- **Daily**: Full database backups
- **Weekly**: Archive old backups
- **Monthly**: Long-term storage backup
- **Retention**: Keep 30 days of backups

---

## 🔒 Data Security

### Password Hashing

- **Algorithm**: bcrypt
- **Rounds**: 10 (configurable in code)
- **Storage**: Never store plain text passwords

### Sensitive Data

- Passwords are hashed before storage
- Never expose passwords in API responses
- IP addresses and user agents stored for security audit

### Data Retention

- Active records: Indefinite
- Archived records: Can be retained or deleted per policy
- Audit logs: Retain for minimum 2 years for compliance
- Deleted documents: Remove from storage upon deletion

---

## 🧹 Database Maintenance

### Regular Tasks

```bash
# Rebuild indexes
mongo dlrms --eval "db.users.reIndex()"

# Check database stats
mongosh
> use dlrms
> db.stats()

# Check collection stats
> db.users.stats()
> db.landrecords.stats()
```

### Cleanup Old Audit Logs

```javascript
// Delete audit logs older than 2 years
db.auditlegs.deleteMany({
  timestamp: {
    $lt: new Date(new Date().setFullYear(new Date().getFullYear() - 2))
  }
});
```

---

## 📊 Query Examples

### Find Records by Status

```javascript
db.landrecords.find({ status: "PENDING" })
```

### Find Records by Owner Name

```javascript
db.landrecords.find({ "ownerInformation.ownerName": /Alice/i })
```

### Count Records by Status

```javascript
db.landrecords.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
])
```

### Find Most Active Users

```javascript
db.auditlegs.aggregate([
  {
    $group: {
      _id: "$userId",
      actionCount: { $sum: 1 }
    }
  },
  {
    $sort: { actionCount: -1 }
  },
  {
    $limit: 10
  }
])
```

### Find Records with Documents

```javascript
db.landrecords.find({ documents: { $not: { $size: 0 } } })
```

---

## ⚠️ Important Notes

1. **Always backup before maintenance**
2. **Test restore procedures regularly**
3. **Monitor database size regularly**
4. **Archive old records periodically**
5. **Review and optimize slow queries**
6. **Keep audit logs for compliance**
7. **Update MongoDB regularly for security**

---

**Version**: 1.0.0  
**Last Updated**: March 2026

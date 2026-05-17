# Land Transfer Feature Documentation

## Overview

The Land Transfer feature allows land owners to transfer their land records to other persons of interest (family members, friends, or other designated beneficiaries) who are registered in the system. This feature maintains a complete transfer history for audit and legal purposes.

## Features

- **Owner-Initiated Transfers**: Land owners can transfer their land to other registered system users
- **Transfer History**: Complete audit trail of all land transfers with timestamps
- **Validation**: Ensures only the current owner can initiate a transfer
- **Audit Logging**: Every transfer is logged in the audit trail for compliance
- **Bulk Transfers**: Ability to transfer multiple lands to different recipients (via service)

## Database Schema Changes

### LandRecord Model Enhancements

```javascript
// New fields added to LandRecord schema:

// Owner Reference (Links to User in system)
ownerUser: {
  type: mongoose.Schema.ObjectId,
  ref: 'User',
}

// Transfer History (Persons of Interest)
transferHistory: [
  {
    fromOwner: ObjectId,           // User ID of the owner transferring
    toOwner: ObjectId,             // User ID of the new owner
    fromOwnerInfo: {
      name: String,
      email: String,
    },
    toOwnerInfo: {
      name: String,
      email: String,
    },
    transferredAt: Date,           // When the transfer occurred
    transferredBy: ObjectId,       // User ID who performed the transfer
    reason: String,                // Reason for transfer (optional)
  },
]
```

## API Endpoints

### 1. Transfer Land to Person of Interest

**Endpoint**: `PUT /api/records/:recordId/transfer-to-interest`

**Authentication**: Required (Any authenticated user who is the land owner)

**Request Body**:
```json
{
  "newOwnerId": "64f7d3a8c9e2b5f4a1b2c3d4",
  "reason": "Transfer to family member"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Land successfully transferred to new owner!",
  "record": {
    "_id": "64f7d3a8c9e2b5f4a1b2c3d4",
    "referenceNumber": "LR-2024-001",
    "title": "Urban Land Plot",
    "ownerUser": "64f7d3a8c9e2b5f4a1b2c3d5",
    "ownerInformation": {
      "ownerName": "Jane Doe",
      "ownerEmail": "jane@example.com"
    },
    "transferHistory": [
      {
        "fromOwner": "64f7d3a8c9e2b5f4a1b2c3d4",
        "toOwner": "64f7d3a8c9e2b5f4a1b2c3d5",
        "fromOwnerInfo": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "toOwnerInfo": {
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "transferredAt": "2024-05-16T10:30:00Z",
        "reason": "Transfer to family member"
      }
    ]
  },
  "transfer": {
    "from": {
      "ownerId": "64f7d3a8c9e2b5f4a1b2c3d4",
      "ownerName": "John Doe",
      "ownerEmail": "john@example.com"
    },
    "to": {
      "ownerId": "64f7d3a8c9e2b5f4a1b2c3d5",
      "ownerName": "Jane Doe",
      "ownerEmail": "jane@example.com"
    },
    "transferredAt": "2024-05-16T10:30:00Z",
    "reason": "Transfer to family member"
  }
}
```

**Error Responses**:

1. **Not Found** (404):
```json
{
  "success": false,
  "message": "Land record not found."
}
```

2. **Forbidden** (403):
```json
{
  "success": false,
  "message": "You do not have permission to transfer this land. Only the current owner can transfer ownership."
}
```

3. **Bad Request** (400):
```json
{
  "success": false,
  "message": "Record ID and new owner ID are required."
}
```

## Usage Examples

### Example 1: Transfer Land to Family Member

```bash
# Transfer land plot LR-2024-001 from John to his daughter Jane
curl -X PUT http://localhost:5000/api/records/64f7d3a8c9e2b5f4a1b2c3d4/transfer-to-interest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "newOwnerId": "64f7d3a8c9e2b5f4a1b2c3d5",
    "reason": "Transfer to daughter"
  }'
```

### Example 2: Frontend Implementation (React)

```javascript
// API Service function
const transferLand = async (recordId, newOwnerId, reason) => {
  try {
    const response = await fetch(`/api/records/${recordId}/transfer-to-interest`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        newOwnerId,
        reason,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error transferring land:', error);
    throw error;
  }
};

// Component usage
const handleTransfer = async (recordId, selectedUserId, transferReason) => {
  try {
    const result = await transferLand(recordId, selectedUserId, transferReason);
    if (result.success) {
      alert('Land transferred successfully!');
      // Refresh record details
      setRecord(result.record);
    }
  } catch (error) {
    alert('Failed to transfer land: ' + error.message);
  }
};
```

### Example 3: Backend Service Usage

```javascript
// Use the land transfer service
const transferService = require('../services/landTransferService');

// Get user's land records
const myLands = await transferService.getUserLandRecords(userId);

// Get recommended recipients (family/friends in system)
const recipients = await transferService.getRecommendedRecipients(userId);

// Get transfer history for a land record
const history = await transferService.getTransferHistory(recordId);

// Check if user is current owner
const isOwner = await transferService.isCurrentOwner(recordId, userId);

// Get user's transfer statistics
const stats = await transferService.getUserTransferStats(userId);

// Bulk transfer lands
const results = await transferService.bulkTransferLands(
  [
    { recordId: 'id1', newOwnerId: 'userId1', reason: 'Family transfer' },
    { recordId: 'id2', newOwnerId: 'userId2', reason: 'Inheritance' },
  ],
  currentUserId,
  auditUser
);
```

## Business Logic

1. **Ownership Verification**: The system verifies that the authenticated user is the current owner of the land record
2. **New Owner Validation**: The new owner must be a registered, active, and verified user in the system
3. **Transfer History**: Every transfer is recorded with:
   - Original owner information
   - New owner information
   - Timestamp
   - User who performed the transfer (may differ from owner)
   - Optional reason for transfer
4. **Audit Trail**: All transfers are logged for compliance and audit purposes
5. **Record Update**: The land record's `ownerUser` and `ownerInformation` fields are updated

## Security Considerations

1. **Authentication**: All transfer endpoints require valid JWT authentication
2. **Authorization**: Only the current land owner can initiate a transfer
3. **Audit Logging**: All transfers are logged with user identification
4. **Data Validation**: Input validation ensures data integrity
5. **User Verification**: New owner must be verified in the system

## Workflow

```
1. User logs into the system (must be authenticated)
   ↓
2. User navigates to their land records
   ↓
3. User selects a land record they own
   ↓
4. User initiates transfer to another registered user
   ↓
5. System validates:
   - User is the current owner
   - New owner exists and is verified
   ↓
6. System performs transfer:
   - Updates ownerUser field
   - Updates ownerInformation
   - Adds entry to transferHistory
   - Logs audit trail entry
   ↓
7. Transfer confirmation sent to both parties
   ↓
8. Transfer history is available for review
```

## Future Enhancements

1. **Transfer Requests**: Allow designated recipients to accept/reject transfers
2. **Conditional Transfers**: Support for conditional transfers (e.g., upon event)
3. **Multiple Beneficiaries**: Support partial ownership transfers
4. **Notifications**: Email/SMS notifications for transfer events
5. **Transfer Templates**: Pre-defined transfer reasons (inheritance, gift, etc.)
6. **Digital Signatures**: Require digital signature for transfers
7. **Expiry Dates**: Set transfer expiry dates for temporary transfers

## Troubleshooting

### Error: "You do not have permission to transfer this land"
- **Cause**: You are not the current owner of the land record
- **Solution**: Contact the current owner or an administrator

### Error: "New owner user not found"
- **Cause**: The selected user does not exist or is not verified
- **Solution**: Ensure the recipient is registered and verified in the system

### Error: "Record ID and new owner ID are required"
- **Cause**: Missing required parameters in the request
- **Solution**: Ensure both `recordId` and `newOwnerId` are provided

## API Reference

### Service Functions

#### `getTransferHistory(recordId)`
Returns complete transfer history for a land record

**Parameters**:
- `recordId` (String): ID of the land record

**Returns**: Promise<Array> - Array of transfer objects

---

#### `isCurrentOwner(recordId, userId)`
Validates if a user is the current owner of a land record

**Parameters**:
- `recordId` (String): ID of the land record
- `userId` (String): ID of the user

**Returns**: Promise<Boolean> - True if user is the owner

---

#### `getUserLandRecords(userId)`
Gets all land records owned by a user

**Parameters**:
- `userId` (String): ID of the user

**Returns**: Promise<Array> - Array of land records

---

#### `getUserTransferStats(userId)`
Gets transfer statistics for a user

**Parameters**:
- `userId` (String): ID of the user

**Returns**: Promise<Object> - Object with transfer statistics

---

#### `getRecommendedRecipients(userId)`
Gets list of eligible transfer recipients

**Parameters**:
- `userId` (String): ID of the current owner

**Returns**: Promise<Array> - Array of user objects

---

#### `bulkTransferLands(transfers, userId, audit)`
Bulk transfer multiple lands to recipients

**Parameters**:
- `transfers` (Array): Array of transfer objects
- `userId` (String): Current owner ID
- `audit` (Object): Audit user object

**Returns**: Promise<Object> - Result with successful and failed transfers

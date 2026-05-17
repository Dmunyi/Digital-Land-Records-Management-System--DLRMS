# Land Transfer Quick Reference

## What's New

A land owner can now transfer their land to other persons of interest (family, friends) who are registered in the system.

## Key Files Modified/Created

1. **Backend Model** - [LandRecord.js](../backend/src/models/LandRecord.js)
   - Added `ownerUser` field (User reference)
   - Added `transferHistory` array for tracking all transfers

2. **Backend Controller** - [recordController.js](../backend/src/controllers/recordController.js)
   - Added `transferLandToInterest()` function

3. **Backend Routes** - [recordRoutes.js](../backend/src/routes/recordRoutes.js)
   - Added `PUT /:recordId/transfer-to-interest` endpoint

4. **Backend Service** - [landTransferService.js](../backend/src/services/landTransferService.js) **(NEW)**
   - Helper functions for transfer operations
   - Transfer history retrieval
   - Ownership validation
   - Bulk transfer support

5. **Documentation** - [LAND_TRANSFER_GUIDE.md](./LAND_TRANSFER_GUIDE.md) **(NEW)**
   - Complete feature documentation
   - API examples
   - Usage workflows

## API Endpoint

```http
PUT /api/records/:recordId/transfer-to-interest
```

**Request**:
```json
{
  "newOwnerId": "user-id-here",
  "reason": "Transfer to family member"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Land successfully transferred to new owner!",
  "record": { /* updated record object */ },
  "transfer": { /* transfer details */ }
}
```

## How It Works

1. Land owner logs in
2. Navigates to their land record
3. Clicks "Transfer Land" button
4. Selects recipient from registered users
5. Adds optional reason
6. Confirms transfer
7. System updates ownership and logs transfer
8. Both parties are notified

## Database Schema

```javascript
// In LandRecord model:
{
  ownerUser: ObjectId,           // Reference to User who owns the land
  transferHistory: [             // Complete transfer audit trail
    {
      fromOwner: ObjectId,
      toOwner: ObjectId,
      fromOwnerInfo: { name, email },
      toOwnerInfo: { name, email },
      transferredAt: Date,
      transferredBy: ObjectId,
      reason: String
    }
  ]
}
```

## Key Features

✅ **Owner Verification** - Only land owner can transfer
✅ **Transfer History** - Complete audit trail maintained
✅ **Audit Logging** - All transfers logged for compliance
✅ **Validation** - New owner must be verified in system
✅ **Service Layer** - Reusable functions for transfers
✅ **Error Handling** - Comprehensive error messages

## Service Functions

```javascript
// Import the service
const transferService = require('../services/landTransferService');

// Get all transfers for a land record
await transferService.getTransferHistory(recordId);

// Check if user owns a land record
await transferService.isCurrentOwner(recordId, userId);

// Get all lands owned by a user
await transferService.getUserLandRecords(userId);

// Get transfer statistics
await transferService.getUserTransferStats(userId);

// Get potential recipients
await transferService.getRecommendedRecipients(userId);

// Bulk transfer multiple lands
await transferService.bulkTransferLands(transfers, userId, auditUser);
```

## Testing

### Manual Test Scenario

1. Create two users: Owner (john@example.com) and Recipient (jane@example.com)
2. Create a land record with Owner as ownerUser
3. Log in as Owner
4. Call transfer endpoint:
   ```bash
   PUT /api/records/{recordId}/transfer-to-interest
   {
     "newOwnerId": "{recipientUserId}",
     "reason": "Transfer to daughter"
   }
   ```
5. Verify:
   - Record's `ownerUser` changed to Recipient
   - Transfer entry added to `transferHistory`
   - Audit log entry created

### Curl Example

```bash
curl -X PUT http://localhost:5000/api/records/64f7d3a8c9e2b5f4a1b2c3d4/transfer-to-interest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "newOwnerId": "64f7d3a8c9e2b5f4a1b2c3d5",
    "reason": "Transfer to family member"
  }'
```

## Error Handling

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Record ID and new owner ID are required" | Missing parameters |
| 403 | "You do not have permission to transfer" | Not the owner |
| 404 | "Land record not found" | Invalid record ID |
| 404 | "New owner user not found" | Invalid recipient ID |
| 500 | "Error transferring land" | Server error |

## Security

- ✅ Authentication required (JWT)
- ✅ Only owner can transfer
- ✅ Recipient must be verified user
- ✅ All changes audited
- ✅ Input validation

## Next Steps

1. Implement Frontend UI for transfer
2. Add email notifications for transfers
3. Implement transfer request/approval workflow
4. Add transfer rejection capability
5. Support conditional transfers (inheritance)
6. Add digital signature requirement

## Support

For issues or questions, refer to [LAND_TRANSFER_GUIDE.md](./LAND_TRANSFER_GUIDE.md) for complete documentation.

# DLRMS API Documentation

## 📖 Overview

The DLRMS API is a RESTful web service built with Express.js and provides endpoints for managing land records, users, and audit trails. All endpoints require JWT authentication (except public auth endpoints).

## 🔐 Authentication

### Getting an Auth Token

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "OFFICER",
    "department": "Land Records"
  }
}
```

### Using the Token

Add the token to all requests as Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 Authentication Endpoints

### Register New User

**Endpoint**: `POST /api/v1/auth/register`

**Request**:
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepass123",
  "department": "Land Management",
  "role": "OFFICER"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* user object */ }
}
```

### Get Current User

**Endpoint**: `GET /api/v1/auth/me`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "OFFICER",
    "department": "Land Records",
    "isActive": true,
    "lastLogin": "2024-03-20T10:30:00Z"
  }
}
```

### User Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Headers**: 
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully!"
}
```

---

## 📋 Land Records Endpoints

### Create Land Record

**Endpoint**: `POST /api/v1/records/create`

**Required Role**: OFFICER, MANAGER, ADMIN

**Request**:
```json
{
  "referenceNumber": "LR-2024-001",
  "title": "Urban Plot 123",
  "priority": "HIGH",
  "description": "Commercial property in downtown area",
  "ownerInformation": {
    "ownerName": "Alice Johnson",
    "ownerEmail": "alice@example.com",
    "ownerPhone": "+1-555-0123",
    "idType": "NATIONAL_ID",
    "idNumber": "ID123456"
  },
  "propertyDetails": {
    "plotNumber": "PLOT-456",
    "areaSize": 5000,
    "areaUnit": "sq.m",
    "location": {
      "province": "Central",
      "district": "Downtown",
      "ward": "Ward A"
    }
  }
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Land record created successfully!",
  "record": {
    "_id": "507f1f77bcf86cd799439011",
    "referenceNumber": "LR-2024-001",
    "title": "Urban Plot 123",
    "status": "PENDING",
    "priority": "HIGH",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### Get All Records

**Endpoint**: `GET /api/v1/records/list`

**Required Role**: Any authenticated user

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 20, max: 100)
- `search` (optional): Search by reference number, title, or owner name
- `status` (optional): Filter by status (PENDING, PROCESSING, COMPLETED, ARCHIVED)

**Example**: `/api/v1/records/list?page=1&limit=20&status=PENDING&search=plot`

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Land records retrieved successfully!",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "referenceNumber": "LR-2024-001",
      "title": "Urban Plot 123",
      "status": "PROCESSING",
      "priority": "HIGH",
      "ownerInformation": { /* owner details */ },
      "propertyDetails": { /* property details */ },
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "pages": 8,
    "currentPage": 1,
    "limit": 20
  }
}
```

### Get Single Record

**Endpoint**: `GET /api/v1/records/:id`

**Required Role**: Any authenticated user

**Parameters**:
- `id`: MongoDB ObjectId of the record

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Land record retrieved successfully!",
  "record": {
    "_id": "507f1f77bcf86cd799439011",
    "referenceNumber": "LR-2024-001",
    "title": "Urban Plot 123",
    "status": "PROCESSING",
    "priority": "HIGH",
    "ownerInformation": { /* full owner details */ },
    "propertyDetails": { /* full property details */ },
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "fileName": "title_deed.pdf",
        "fileType": "pdf",
        "fileSize": 245120,
        "uploadedAt": "2024-03-20T11:00:00Z"
      }
    ],
    "createdBy": { /* user info */ },
    "createdAt": "2024-03-20T10:00:00Z"
  }
}
```

### Update Record

**Endpoint**: `PUT /api/v1/records/:id`

**Required Role**: OFFICER, MANAGER, ADMIN

**Request** (send only fields to update):
```json
{
  "status": "COMPLETED",
  "priority": "MEDIUM",
  "description": "Updated description"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Land record updated successfully!",
  "record": { /* updated record */ }
}
```

### Assign Record to User

**Endpoint**: `PUT /api/v1/records/:id/assign`

**Required Role**: MANAGER, ADMIN

**Request**:
```json
{
  "assignedTo": "507f1f77bcf86cd799439015"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Record assigned successfully!",
  "record": { /* updated record with assignedTo */ }
}
```

### Transfer Ownership

**Endpoint**: `PUT /api/v1/records/:id/transfer`

**Required Role**: ADMIN only

**Request**:
```json
{
  "newOwner": {
    "ownerName": "Alice Johnson",
    "ownerEmail": "alice@example.com",
    "ownerPhone": "+1-555-0123",
    "idType": "NATIONAL_ID",
    "idNumber": "ID123456"
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Ownership transferred successfully!",
  "record": { /* updated record with new ownerInformation */ }
}
```

---

## 📎 Document/File Endpoints

### Upload Document

**Endpoint**: `POST /api/v1/files/:recordId/upload`

**Required Role**: OFFICER, MANAGER, ADMIN

**Content-Type**: `multipart/form-data`

**Parameters**:
- `recordId`: MongoDB ObjectId of the land record
- `document`: File to upload

**Example with curl**:
```bash
curl -X POST http://localhost:5000/api/v1/files/507f1f77bcf86cd799439011/upload \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/document.pdf"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Document uploaded successfully!",
  "document": {
    "_id": "507f1f77bcf86cd799439020",
    "fileName": "document.pdf",
    "fileType": "pdf",
    "filePath": "1234567890_document.pdf",
    "uploadedAt": "2024-03-20T11:00:00Z",
    "fileSize": 245120
  }
}
```

### Download Document

**Endpoint**: `GET /api/v1/files/:recordId/download/:documentId`

**Required Role**: Any authenticated user

**Parameters**:
- `recordId`: MongoDB ObjectId of the land record
- `documentId`: MongoDB ObjectId of the document

**Response**: File is downloaded to client

### Delete Document

**Endpoint**: `DELETE /api/v1/files/:recordId/document/:documentId`

**Required Role**: OFFICER, MANAGER, ADMIN

**Parameters**:
- `recordId`: MongoDB ObjectId of the land record
- `documentId`: MongoDB ObjectId of the document

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Document deleted successfully!"
}
```

---

## 📊 Audit Endpoints

### Get Audit Logs

**Endpoint**: `GET /api/v1/audit/logs`

**Required Role**: MANAGER, ADMIN

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Logs per page (default: 25)
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `startDate` (optional): Filter from date (ISO format)
- `endDate` (optional): Filter to date (ISO format)

**Example**: `/api/v1/audit/logs?page=1&limit=25&action=LOGIN&startDate=2024-03-20`

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully!",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "userId": {
        "_id": "507f1f77bcf86cd799439010",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "OFFICER"
      },
      "action": "LOGIN",
      "entityType": "USER",
      "description": "User logged in successfully",
      "status": "SUCCESS",
      "timestamp": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 500,
    "pages": 20,
    "currentPage": 1,
    "limit": 25
  }
}
```

### Get Entity Audit Trail

**Endpoint**: `GET /api/v1/audit/trail/:entityType/:entityId`

**Required Role**: MANAGER, ADMIN

**Parameters**:
- `entityType`: Type of entity (LAND_RECORD, USER, SYSTEM)
- `entityId`: ObjectId of the entity

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Entity audit trail retrieved successfully!",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439035",
      "userId": { /* user who took action */ },
      "action": "CREATE",
      "entityType": "LAND_RECORD",
      "entityId": "507f1f77bcf86cd799439011",
      "description": "Land record created: LR-2024-001",
      "timestamp": "2024-03-20T10:00:00Z",
      "status": "SUCCESS"
    }
  ]
}
```

### Get Audit Statistics

**Endpoint**: `GET /api/v1/audit/statistics`

**Required Role**: MANAGER, ADMIN

**Query Parameters**:
- `days` (optional): Number of days to analyze (default: 30)

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Audit statistics retrieved successfully!",
  "data": {
    "actionStats": [
      {
        "_id": "VIEW",
        "count": 1250
      },
      {
        "_id": "UPDATE",
        "count": 450
      },
      {
        "_id": "CREATE",
        "count": 120
      }
    ],
    "userStats": [
      {
        "_id": "507f1f77bcf86cd799439010",
        "count": 350,
        "user": [
          {
            "fullName": "John Doe",
            "email": "john@example.com"
          }
        ]
      }
    ],
    "period": "Last 30 days"
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide full name, email, and password."
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to access this resource."
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Land record not found."
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 📝 Common Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication failed |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## 🔄 Example Workflow

### Complete Workflow: Create, Upload, and Process Record

```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@dlrms.gov",
    "password": "officer123"
  }'
# Response includes: token

# 2. Create Record (save response._id)
curl -X POST http://localhost:5000/api/v1/records/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "referenceNumber": "LR-2024-010",
    "title": "Residential Plot",
    "priority": "MEDIUM",
    "ownerInformation": {
      "ownerName": "Bob Wilson",
      "ownerEmail": "bob@example.com"
    },
    "propertyDetails": {
      "plotNumber": "PLT-789"
    }
  }'
# Response includes: record._id

# 3. Upload Document
curl -X POST http://localhost:5000/api/v1/files/RECORD_ID/upload \
  -H "Authorization: Bearer <token>" \
  -F "document=@title_deed.pdf"

# 4. Update Status to Processing
curl -X PUT http://localhost:5000/api/v1/records/RECORD_ID \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}'

# 5. View Audit Trail
curl -X GET "http://localhost:5000/api/v1/audit/trail/LAND_RECORD/RECORD_ID" \
  -H "Authorization: Bearer <token>"
```

---

## 📞 API Support

For API issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Ensure correct Authorization headers
4. Verify token is not expired
5. Contact system administrator

---

**Version**: 1.0.0  
**Base URL**: `http://localhost:5000/api/v1`  
**Last Updated**: March 2026

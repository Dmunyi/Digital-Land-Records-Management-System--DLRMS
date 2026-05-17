# Digital Land Records Management System (DLRMS)

## 📋 Project Overview

The Digital Land Records Management System (DLRMS) is a comprehensive web-based platform designed to digitize, manage, and track land records for government ministries. The system replaces manual paper-based filing with instant electronic searching, real-time audit trails, and secure role-based access controls.

### ✨ Key Features

1. **Centralized Digital Storage** - Securely store and organize over 10,000 land records
2. **Advanced Search & Filtering** - Find records instantly by reference number, title, or owner name
3. **Document Management** - Upload, download, and organize supporting documents
4. **Role-Based Access Control** - Four user roles with different permissions (Admin, Manager, Officer, Viewer)
5. **Real-Time Audit Trails** - Complete tracking of all system activities and user actions
6. **Status Tracking** - Monitor record processing status from pending to completion
7. **User-Friendly Interface** - Modern, responsive web interface accessible on any device
8. **Secure Authentication** - JWT-based authentication with password hashing

### 🎯 System Users

- **ADMIN**: System administrator with full system access
- **MANAGER**: Department manager who can manage staff and records
- **OFFICER**: Land officer who can search, create, and process records
- **VIEWER**: View-only access to records

---

## 🏗️ Project Structure

```
dlrms/
├── backend/                          # Node.js/Express API server
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── constants.js         # App constants and enums
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.js              # User model
│   │   │   ├── LandRecord.js        # Land record model
│   │   │   └── AuditLog.js          # Audit trail model
│   │   ├── controllers/             # Business logic
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── recordController.js  # Record operations
│   │   │   ├── fileController.js    # File upload/download
│   │   │   └── auditController.js   # Audit operations
│   │   ├── routes/                  # API endpoints
│   │   │   ├── authRoutes.js       # Auth endpoints
│   │   │   ├── recordRoutes.js     # Record endpoints
│   │   │   ├── fileRoutes.js       # File endpoints
│   │   │   └── auditRoutes.js      # Audit endpoints
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js             # Authentication middleware
│   │   │   └── errorHandler.js     # Global error handler
│   │   ├── utils/                   # Utility functions
│   │   │   └── logger.js           # Logging utilities
│   │   └── server.js                # Main application entry
│   ├── uploads/                     # Document storage
│   ├── package.json                 # Dependencies
│   └── .env.example                 # Environment variables template
│
├── frontend/                         # React web application
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navigation.js       # Top navigation bar
│   │   │   ├── ProtectedRoute.js   # Auth protection wrapper
│   │   │   └── Navigation.css      # Navigation styles
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginPage.js         # Login page
│   │   │   ├── RegisterPage.js      # Registration page
│   │   │   ├── DashboardPage.js     # Dashboard
│   │   │   ├── RecordsListPage.js   # Records list
│   │   │   ├── CreateRecordPage.js  # Create record form
│   │   │   ├── RecordDetailPage.js  # Record details
│   │   │   ├── AuditLogsPage.js     # Audit logs view
│   │   │   └── [corresponding CSS files]
│   │   ├── services/
│   │   │   └── api.js               # API integration
│   │   ├── styles/
│   │   │   └── global.css           # Global styles
│   │   ├── App.js                   # Main app component
│   │   └── index.js                 # React entry point
│   ├── public/
│   │   └── index.html               # HTML template
│   └── package.json                 # Dependencies
│
├── docs/                            # Documentation
│   ├── SETUP_GUIDE.md              # Installation & setup
│   ├── USER_GUIDE.md               # How to use the system
│   ├── API_DOCUMENTATION.md        # API endpoints reference
│   └── DATABASE_SCHEMA.md          # Database structure
│
└── README.md                        # This file
```

---

## 🚀 Quick Start Guide

### Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional for version control) - [Download](https://git-scm.com/)

### Step 1: Setup MongoDB

1. Install and start MongoDB on your system
2. Create a database named `dlrms`:
   ```bash
   mongosh
   > use dlrms
   > db.createCollection("users")
   ```

### Step 2: Setup Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   copy .env.example .env
   ```

4. Edit `.env` with your configuration:
   ```
   MONGODB_URI=mongodb://localhost:27017/dlrms
   PORT=5000
   JWT_SECRET=your_secure_secret_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

   ✓ Backend should be running at `http://localhost:5000`

### Step 3: Setup Frontend

1. In a new terminal, navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   ✓ Frontend will automatically open at `http://localhost:3000`

### Step 4: Login to System

1. Open your browser and go to `http://localhost:3000`
2. Register a new account or login
3. Default test credentials:
   - Email: `admin@dlrms.gov`
   - Password: `admin123`

---

## 📚 Complete Documentation

For detailed information, refer to the documentation files:

1. **[SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)** - Detailed installation and configuration
2. **[USER_GUIDE.md](./docs/USER_GUIDE.md)** - Complete user manual
3. **[API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md)** - API endpoints reference
4. **[DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)** - Database structure

---

## 🔑 Key Features in Detail

### 1. User Authentication
- Secure login with email and password
- JWT-based session management
- Password hashing with bcrypt
- User registration for new staff

### 2. Land Records Management
- Create new land records with comprehensive details
- Search and filter records by various criteria
- Update record status (Pending → Processing → Completed)
- Track record ownership and assignment, with admin-only ownership transfers

### 3. Document Management
- Upload multiple documents per record (PDF, JPG, PNG, DOC, DOCX)
- Download documents for review
- Automatic file size validation
- Document tracking and version control

### 4. Role-Based Access Control
- **ADMIN**: Full system access, user management
- **MANAGER**: Staff and record management, audit logs viewing
- **OFFICER**: Record creation and processing
- **VIEWER**: Read-only access to records

### 5. Audit Trail
- Track all user actions (login, logout, create, update, delete)
- Record IP addresses and user agents
- Timestamp all activities
- Generate audit statistics and reports
- Filter audit logs by action, user, and date range

### 6. Dashboard
- Overview statistics (total records, pending, processing, completed)
- Recent records list
- Quick access to common actions
- User information display

---

## 🔒 Security Features

1. **Authentication**: JWT-based authentication with secure token expiry
2. **Authorization**: Role-based access control on all endpoints
3. **Password Security**: Bcrypt hashing with salt rounds
4. **Data Validation**: Input validation on all form submissions
5. **Error Handling**: Secure error messages without exposing system details
6. **CORS**: Cross-Origin Resource Sharing properly configured
7. **Audit Logging**: Complete tracking of all system activities

---

## 💾 Database Models

### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String (ADMIN, MANAGER, OFFICER, VIEWER),
  department: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### LandRecord Model
```javascript
{
  referenceNumber: String (unique),
  title: String,
  status: String (PENDING, PROCESSING, COMPLETED, ARCHIVED),
  ownerInformation: {
    ownerName: String,
    ownerEmail: String,
    ownerPhone: String,
    idNumber: String
  },
  propertyDetails: {
    plotNumber: String,
    areaSize: Number,
    location: { province, district, ward }
  },
  documents: [],
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

### AuditLog Model
```javascript
{
  userId: ObjectId (ref: User),
  action: String (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, UPLOAD),
  entityType: String (LAND_RECORD, USER, SYSTEM),
  entityId: ObjectId,
  description: String,
  timestamp: Date,
  ipAddress: String,
  status: String (SUCCESS, FAILED, UNAUTHORIZED)
}
```

---

## 🧪 Testing the System

### Create Test Data

1. **Register Users**
   - Create users with different roles (Admin, Manager, Officer, Viewer)

2. **Create Land Records**
   - Add sample land records with complete details
   - Upload test documents

3. **Test Workflows**
   - Create → Process → Complete a record
   - Upload and download documents
   - View audit logs

### API Testing with curl

```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dlrms.gov","password":"admin123"}'

# Get Current User
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# List Records
curl -X GET http://localhost:5000/api/v1/records/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 Support & Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Port Already in Use**
   - Backend: `netstat -ano | findstr :5000` (Windows) or `lsof -i :5000` (Mac/Linux)
   - Kill the process or use a different port

3. **CORS Errors**
   - Verify CORS_ORIGIN in .env matches your frontend URL
   - Check that backend is running on correct port

4. **JWT Token Expired**
   - Login again to refresh the token
   - Token expiry configured in .env (default: 7 days)

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|----------------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | User login | Public |
| GET | `/api/v1/auth/me` | Get current user | Authenticated |
| POST | `/api/v1/records/create` | Create new record | OFFICER+ |
| GET | `/api/v1/records/list` | List all records | Authenticated |
| GET | `/api/v1/records/:id` | Get record details | Authenticated |
| PUT | `/api/v1/records/:id` | Update record | OFFICER+ |
| POST | `/api/v1/files/:recordId/upload` | Upload document | OFFICER+ |
| GET | `/api/v1/files/:recordId/download/:documentId` | Download document | Authenticated |
| GET | `/api/v1/audit/logs` | Get audit logs | MANAGER+ |

---

## 📄 License

This project is developed for the Ministry of Lands and is confidential.

---

## 👥 Development Team

- System Design & Development
- Digital Transformation Initiative
- Ministry of Lands

---

## 📞 Contact

For support or questions, contact the Ministry of Lands IT Department.

**Version**: 1.0.0  
**Last Updated**: March 2026

---

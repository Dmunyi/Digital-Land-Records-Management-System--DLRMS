# DLRMS - File Structure Guide

## Complete Project File Structure

```
dlrms/
│
├── 📄 README.md                          # Main project documentation
├── 📄 quickstart.sh                      # Quick start script (Linux/Mac)
├── 📄 quickstart.bat                     # Quick start script (Windows)
├── 📄 start-backend.sh                   # Start backend (Linux/Mac)
├── 📄 start-backend.bat                  # Start backend (Windows)
├── 📄 start-frontend.sh                  # Start frontend (Linux/Mac)
├── 📄 start-frontend.bat                 # Start frontend (Windows)
│
├── 📁 backend/                           # Node.js/Express API Server
│   ├── 📄 package.json                   # Backend dependencies
│   ├── 📄 .env.example                   # Environment variables template
│   ├── 📄 .gitignore                     # Git ignore file
│   │
│   ├── 📁 src/
│   │   ├── 📄 server.js                  # Main Express application
│   │   │
│   │   ├── 📁 config/
│   │   │   ├── 📄 database.js            # MongoDB connection
│   │   │   └── 📄 constants.js           # App constants and enums
│   │   │
│   │   ├── 📁 models/
│   │   │   ├── 📄 User.js                # User schema and model
│   │   │   ├── 📄 LandRecord.js          # Land record schema
│   │   │   └── 📄 AuditLog.js            # Audit log schema
│   │   │
│   │   ├── 📁 controllers/
│   │   │   ├── 📄 authController.js      # Auth logic (login, register)
│   │   │   ├── 📄 recordController.js    # Record CRUD operations
│   │   │   ├── 📄 fileController.js      # File upload/download
│   │   │   └── 📄 auditController.js     # Audit trail operations
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── 📄 authRoutes.js          # Auth endpoints
│   │   │   ├── 📄 recordRoutes.js        # Record endpoints
│   │   │   ├── 📄 fileRoutes.js          # File endpoints
│   │   │   └── 📄 auditRoutes.js         # Audit endpoints
│   │   │
│   │   ├── 📁 middleware/
│   │   │   ├── 📄 auth.js                # JWT verification
│   │   │   └── 📄 errorHandler.js        # Error handling
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── 📄 logger.js              # Logging utilities
│   │   │
│   │   └── 📁 services/
│   │       └── (future service files)
│   │
│   ├── 📁 uploads/                       # Uploaded documents storage
│   └── 📁 node_modules/                  # Installed dependencies
│
├── 📁 frontend/                          # React Web Application
│   ├── 📄 package.json                   # Frontend dependencies
│   ├── 📄 .gitignore                     # Git ignore file
│   ├── 📄 README.md                      # Create React App README
│   │
│   ├── 📁 src/
│   │   ├── 📄 index.js                   # React entry point
│   │   ├── 📄 App.js                     # Main App component
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📄 Navigation.js          # Top navigation bar
│   │   │   ├── 📄 Navigation.css         # Navigation styles
│   │   │   └── 📄 ProtectedRoute.js      # Auth protection wrapper
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── 📄 LoginPage.js           # Login page
│   │   │   ├── 📄 RegisterPage.js        # Registration page
│   │   │   ├── 📄 AuthPages.css          # Auth pages styles
│   │   │   ├── 📄 DashboardPage.js       # Main dashboard
│   │   │   ├── 📄 Dashboard.css          # Dashboard styles
│   │   │   ├── 📄 RecordsListPage.js     # Records list view
│   │   │   ├── 📄 RecordsList.css        # Records list styles
│   │   │   ├── 📄 CreateRecordPage.js    # Create record form
│   │   │   ├── 📄 CreateRecord.css       # Create record styles
│   │   │   ├── 📄 RecordDetailPage.js    # Record detail view
│   │   │   ├── 📄 RecordDetail.css       # Record detail styles
│   │   │   ├── 📄 AuditLogsPage.js       # Audit logs view
│   │   │   └── 📄 AuditLogs.css          # Audit logs styles
│   │   │
│   │   ├── 📁 services/
│   │   │   └── 📄 api.js                 # API client with all endpoints
│   │   │
│   │   └── 📁 styles/
│   │       └── 📄 global.css             # Global styles and utilities
│   │
│   ├── 📁 public/
│   │   └── 📄 index.html                 # Main HTML template
│   │
│   └── 📁 node_modules/                  # Installed dependencies
│
├── 📁 docs/                              # Complete Documentation
│   ├── 📄 SETUP_GUIDE.md                 # Installation & configuration guide
│   ├── 📄 USER_GUIDE.md                  # Complete user manual
│   ├── 📄 API_DOCUMENTATION.md           # API endpoints reference
│   ├── 📄 DATABASE_SCHEMA.md             # Database structure and queries
│   └── 📄 FILE_STRUCTURE.md              # This file
│
└── 📄 .gitignore                         # Git ignore rules

```

## File Purpose Summary

### Backend Files

| File | Purpose |
|------|---------|
| `server.js` | Express app initialization and route setup |
| `database.js` | MongoDB connection and configuration |
| `constants.js` | System-wide constants and enums |
| `User.js` | User database schema and methods |
| `LandRecord.js` | Land record database schema |
| `AuditLog.js` | Audit trail database schema |
| `authController.js` | Authentication logic |
| `recordController.js` | Land record operations |
| `fileController.js` | File upload/download logic |
| `auditController.js` | Audit log retrieval |
| `authRoutes.js` | Auth endpoints (/api/v1/auth/*) |
| `recordRoutes.js` | Record endpoints (/api/v1/records/*) |
| `fileRoutes.js` | File endpoints (/api/v1/files/*) |
| `auditRoutes.js` | Audit endpoints (/api/v1/audit/*) |
| `auth.js` | JWT verification middleware |
| `errorHandler.js` | Global error handling |
| `logger.js` | Logging and audit tracking |

### Frontend Files

| File | Purpose |
|------|---------|
| `App.js` | App routing and state management |
| `index.js` | React DOM rendering |
| `Navigation.js` | Header navigation component |
| `ProtectedRoute.js` | Auth-protected route wrapper |
| `LoginPage.js` | User login form |
| `RegisterPage.js` | User registration form |
| `DashboardPage.js` | Main dashboard with statistics |
| `RecordsListPage.js` | View all records with search |
| `CreateRecordPage.js` | Form to create new record |
| `RecordDetailPage.js` | View record details and documents |
| `AuditLogsPage.js` | View system audit trail |
| `api.js` | API client with all endpoints |
| `global.css` | Global styles for all pages |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and quick start |
| `SETUP_GUIDE.md` | Detailed installation instructions |
| `USER_GUIDE.md` | Complete user manual |
| `API_DOCUMENTATION.md` | API endpoints reference |
| `DATABASE_SCHEMA.md` | Database structure and queries |
| `FILE_STRUCTURE.md` | This file - project directory structure |

## Key Directories

### `/backend/uploads/`
- **Purpose**: Store uploaded land record documents
- **Permissions**: Read/write by backend application
- **Cleanup**: Old files deleted when records are deleted

### `/backend/node_modules/`
- **Purpose**: Installed npm packages for backend
- **Size**: ~200-300 MB
- **Not included in**: Git repository (.gitignore)

### `/frontend/node_modules/`
- **Purpose**: Installed npm packages for frontend
- **Size**: ~300-400 MB
- **Not included in**: Git repository (.gitignore)

### `/docs/`
- **Purpose**: Complete system documentation
- **Includes**: Setup, usage, API, database guides
- **Audience**: System administrators and developers

---

## Environment Files

### `.env` (Backend - Not in repository)
Located in: `backend/.env`
- Database connection string
- Server port and environment
- JWT secret key
- CORS configuration
- File upload settings

### `.env.example` (Backend - Template)
Located in: `backend/.env.example`
- Template for creating `.env` file
- Contains all necessary variables with examples

---

## Starting the Application

### Full Setup from Scratch

1. **Run quickstart script**:
   - Windows: `quickstart.bat`
   - Linux/Mac: `bash quickstart.sh`

2. **Install dependencies** (automated by script):
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`

### Starting Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
```

### Access Application

1. Backend API: `http://localhost:5000/api/v1`
2. Frontend Web: `http://localhost:3000`
3. Swagger/Docs: Not included (can be added)

---

## Important Notes

### Files NOT in Repository
- `backend/.env` - Environment variables (create from .env.example)
- `backend/node_modules/` - Use `npm install` to recreate
- `backend/uploads/` - Created automatically
- `frontend/node_modules/` - Use `npm install` to recreate
- `frontend/build/` - Generated during production build

### Critical Files to Backup
- `backend/.env` - Contains database URL and secrets
- `backend/uploads/` - Contains user-uploaded documents
- MongoDB database - Contains all application data

### File Permissions
- Backend should have write permission in `/uploads/`
- Database files need proper permissions (typically set by MongoDB)
- Frontend build files are static and read-only

---

**Version**: 1.0.0  
**Last Updated**: March 2026

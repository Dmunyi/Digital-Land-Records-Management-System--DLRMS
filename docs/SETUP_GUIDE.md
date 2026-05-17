# DLRMS Setup Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Starting the Application](#starting-the-application)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Ubuntu 18.04+
- **Node.js**: v14.0.0 or higher
- **MongoDB**: v4.4.0 or higher
- **RAM**: 4 GB minimum
- **Disk Space**: 2 GB minimum

### Recommended Requirements

- **Node.js**: v16.0.0 or higher
- **MongoDB**: v5.0 or higher
- **RAM**: 8 GB
- **Disk Space**: 10 GB
- **Processor**: Multi-core CPU

---

## 📦 Installation Steps

### Step 1: Download and Install Prerequisites

#### 1.1 Install Node.js

**Windows**:
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run the installer
3. Follow the installation wizard
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**macOS**:
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**Linux (Ubuntu)**:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 1.2 Install MongoDB

**Windows**:
1. Download from https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install MongoDB as a Service"
4. Verify installation:
   ```bash
   mongosh
   ```

**macOS**:
```bash
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Linux (Ubuntu)**:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Step 2: Extract Project Files

1. Extract the DLRMS project to your desired location
2. Navigate to the project directory:
   ```bash
   cd dlrms
   ```

### Step 3: Setup Backend

#### 3.1 Navigate to Backend Directory

```bash
cd backend
```

#### 3.2 Install Dependencies

```bash
npm install
```

This will install all required packages as defined in `package.json`.

#### 3.3 Create Environment File

Copy the example environment file:

**Windows**:
```bash
copy .env.example .env
```

**macOS/Linux**:
```bash
cp .env.example .env
```

#### 3.4 Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/dlrms
DB_NAME=dlrms

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_me_in_production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
```

**Important Settings**:
- `MONGODB_URI`: Connection string to MongoDB (adjust if MongoDB is on a different host)
- `JWT_SECRET`: Change this to a strong random string (used for token generation)
- `PORT`: Backend server port (default: 5000)
- `CORS_ORIGIN`: Frontend URL (for cross-origin requests)

### Step 4: Setup Frontend

#### 4.1 Navigate to Frontend Directory

```bash
# From the project root
cd frontend
```

#### 4.2 Install Dependencies

```bash
npm install
```

#### 4.3 Create Environment File (Optional)

Create `.env` file in frontend directory if needed:

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

---

## ⚙️ Configuration

### MongoDB Configuration

#### Create Database and Collections

1. Start MongoDB shell:
   ```bash
   mongosh
   ```

2. Create database and collections:
   ```javascript
   use dlrms;
   
   // Create users collection
   db.createCollection("users");
   
   // Create land records collection
   db.createCollection("landrecords");
   
   // Create audit logs collection
   db.createCollection("auditlegs");
   
   // Create indexes for better performance
   db.users.createIndex({ email: 1 }, { unique: true });
   db.landrecords.createIndex({ referenceNumber: 1 }, { unique: true });
   db.landrecords.createIndex({ status: 1 });
   db.auditlegs.createIndex({ userId: 1, timestamp: -1 });
   ```

3. Exit MongoDB shell:
   ```javascript
   exit
   ```

### Creating Initial Admin Account

The system will use the first registered account as admin. To create an admin account:

1. Start the frontend
2. Go to registration page
3. Register with admin details:
   - Name: Administrator
   - Email: admin@dlrms.gov
   - Password: admin123
   - Department: IT

---

## 🚀 Starting the Application

### Method 1: Development Mode (Recommended for Testing)

#### Terminal 1: Start Backend

```bash
cd backend
npm start
```

Expected output:
```
✓ Successfully connected to MongoDB
╔══════════════════════════════════════════════════════════╗
║  Digital Land Records Management System (DLRMS)          ║
║  Backend API Server                                      ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  ✓ Server running on port 5000                           ║
║  ✓ Database connected                                    ║
║  ✓ API ready at http://localhost:5000/api/v1            ║
╚══════════════════════════════════════════════════════════╝
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

This will automatically open the browser at `http://localhost:3000`.

### Method 2: Development Mode with Auto-Reload

For development, use nodemon for auto-reload on code changes:

```bash
cd backend
npm run dev
```

---

## 🏭 Production Deployment

### Prerequisites
- Server with Node.js and MongoDB installed
- Domain name and SSL certificate
- Firewall and security rules configured

### Step 1: Prepare Backend

1. Set environment to production:
   ```env
   NODE_ENV=production
   JWT_SECRET=your_very_strong_secret_key_minimum_32_characters
   CORS_ORIGIN=https://yourdomain.com
   ```

2. Build backend (if applicable):
   ```bash
   cd backend
   npm install --production
   ```

### Step 2: Prepare Frontend

1. Build optimized frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. This creates a `build` folder with optimized files

### Step 3: Deploy to Server

Use a service like PM2 to manage Node.js processes:

```bash
# Install PM2 globally
npm install -g pm2

# Navigate to backend
cd backend

# Start backend with PM2
pm2 start src/server.js --name "dlrms-backend"

# Save PM2 process list
pm2 save

# Create startup script
pm2 startup
```

### Step 4: Setup Nginx (Reverse Proxy)

Create `/etc/nginx/sites-available/dlrms`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        root /var/www/dlrms/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/v1 {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔧 Troubleshooting

### Problem: MongoDB Connection Error

**Error**: `Failed to connect to MongoDB`

**Solutions**:
1. Verify MongoDB is running
2. Check MongoDB connection string in `.env`
3. Ensure MongoDB is accessible:
   ```bash
   mongosh
   ```

### Problem: Port 5000 Already in Use

**Error**: `listen EADDRINUSE: address already in use :::5000`

**Solutions**:

Windows:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -i :5000
kill -9 <PID>
```

### Problem: CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
1. Verify backend is running
2. Check `CORS_ORIGIN` in `.env` matches frontend URL
3. Verify both frontend and backend are on correct ports

### Problem: JWT Token Expired

**Error**: `Token has expired. Please login again.`

**Solutions**:
1. This is normal behavior - user needs to log in again
2. Adjust `JWT_EXPIRE` in `.env` to change token validity period

### Problem: File Upload Fails

**Error**: `File size exceeds maximum limit`

**Solutions**:
1. Check file size against `MAX_FILE_SIZE` in `.env`
2. Increase limit if needed (default: 10 MB):
   ```env
   MAX_FILE_SIZE=52428800
   ```

### Problem: Dependencies Installation Fails

**Error**: `npm ERR! 404 Not Found`

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete node_modules and package-lock.json:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] MongoDB is running and accessible
- [ ] Backend server starts without errors
- [ ] Frontend loads in browser at `http://localhost:3000`
- [ ] Can register new user account
- [ ] Can login with registered credentials
- [ ] Dashboard loads with statistics
- [ ] Can create a new land record
- [ ] Can view list of records
- [ ] Can upload a test document
- [ ] Can view audit logs (with appropriate role)

---

## 📞 Support

For additional help or issues, refer to:
- Main README.md for system overview
- USER_GUIDE.md for how to use the system
- API_DOCUMENTATION.md for API reference

---

**Version**: 1.0.0  
**Last Updated**: March 2026

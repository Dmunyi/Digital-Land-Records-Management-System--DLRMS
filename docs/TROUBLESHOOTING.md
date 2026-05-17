# DLRMS Troubleshooting Guide

## Common Issues and Solutions

### 🔴 Backend Server Issues

#### Issue: "Cannot find module 'express'"

**Symptoms**:
```
Error: Cannot find module 'express'
```

**Causes**:
- Dependencies not installed
- Wrong directory
- Corrupted node_modules

**Solutions**:

1. **Reinstall dependencies**:
```bash
cd backend
rm -rf node_modules package-lock.json    # macOS/Linux
rmdir /s node_modules                    # Windows (then delete package-lock.json)
npm install
```

2. **Verify you're in backend directory**:
```bash
cd c:\Users\Derrick\Documents\land1\dlrms\backend
npm start
```

3. **Clear npm cache**:
```bash
npm cache clean --force
npm install
```

#### Issue: "Server running on port 5000" but nothing happens

**Symptoms**:
- Backend appears to start but hangs
- No response from API

**Solutions**:

1. **Check MongoDB connection**:
```bash
# Verify MongoDB is running
mongosh
> db.adminCommand('ping')
```

2. **Check .env file**:
```bash
# Backend needs .env with MONGODB_URI
cat backend/.env
# Should contain: MONGODB_URI=mongodb://localhost:27017/dlrms
```

3. **Fix MongoDB connection string**:
```
# ❌ Wrong
MONGODB_URI=localhost:27017/dlrms

# ✓ Correct
MONGODB_URI=mongodb://localhost:27017/dlrms
```

#### Issue: "Port 5000 already in use"

**Symptoms**:
```
Error: listen EADDRINUSE :::5000
```

**Solutions**:

**Windows**:
```bash
# Find process using 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with number)
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

**macOS/Linux**:
```bash
# Find process using 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5001
```

#### Issue: "MongoDB connection failed"

**Symptoms**:
```
MongoServerError: connect ECONNREFUSED
```

**Causes**:
- MongoDB not running
- Wrong connection string
- MongoDB credentials invalid

**Solutions**:

1. **Start MongoDB**:

   **Windows**:
   ```
   Services > MongoDB Server > Properties > Start
   ```

   **macOS**:
   ```bash
   brew services start mongodb-community
   ```

   **Linux**:
   ```bash
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is running**:
```bash
mongosh
> db.version()
5.0.14   # or similar
```

3. **Check connection string**:
```
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/dlrms

# For MongoDB with authentication
MONGODB_URI=mongodb://username:password@localhost:27017/dlrms

# For MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dlrms
```

#### Issue: CORS errors in frontend console

**Symptoms**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions**:

1. **Check CORS_ORIGIN in .env**:
```
CORS_ORIGIN=http://localhost:3000
```

2. **Verify frontend is on correct port**:
- Should be http://localhost:3000
- If different, update CORS_ORIGIN in backend/.env

3. **Clear browser cache**:
- Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
- Clear browsing data
- Refresh the page

---

### 🔴 Frontend Issues

#### Issue: "Cannot find module 'react'"

**Symptoms**:
```
Error: Cannot find module 'react'
MODULE_NOT_FOUND
```

**Solutions**:

1. **Reinstall dependencies**:
```bash
cd frontend
rm -rf node_modules package-lock.json    # macOS/Linux
rmdir /s node_modules                    # Windows (then delete package-lock.json)
npm install
```

2. **Verify npm installation**:
```bash
npm --version
node --version
```

#### Issue: "Port 3000 already in use"

**Symptoms**:
```
Something is already listening on port 3000
```

**Solutions**:

**Windows**:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux**:
```bash
lsof -i :3000
kill -9 <PID>
```

Or set different port:
```bash
PORT=3001 npm start
```

#### Issue: "Unexpected token" or "SyntaxError"

**Symptoms**:
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Causes**:
- Backend not running
- API returning HTML error page instead of JSON
- Browser cached old version

**Solutions**:

1. **Verify backend is running**:
```bash
# Terminal should show
npm start
> Listening on port 5000
```

2. **Check API endpoint in browser**:
```
http://localhost:5000/api/v1/auth/ping
# Should return JSON, not HTML
```

3. **Clear browser cache**:
- Ctrl+Shift+Delete or Cmd+Shift+Delete
- Clear all browsing data
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)

#### Issue: "Blank white screen"

**Symptoms**:
- Page loads but nothing visible
- No error in console

**Causes**:
- React build failed
- CSS not loaded
- JavaScript errors

**Solutions**:

1. **Check browser console** (F12):
- Click Console tab
- Look for red errors
- Note the error message

2. **Rebuild frontend**:
```bash
cd frontend
npm install
npm start
```

3. **Check if backend is running**:
- Without backend, some features won't work
- Start backend before frontend

---

### 🔴 Authentication Issues

#### Issue: "Invalid credentials" even with correct password

**Symptoms**:
```
{
  "error": "Invalid email or password"
}
```

**Causes**:
- User doesn't exist
- Password incorrect
- Database empty

**Solutions**:

1. **Seed test user** (if using sample data):
```bash
# Run seed script (see SAMPLE_DATA.md)
node backend/src/seed.js
```

2. **Create new user through registration**:
- Go to Register page
- Fill in form with email/password
- Click register
- Then login with same credentials

3. **Reset test user**:
```bash
# Connect to MongoDB
mongosh
> use dlrms
> db.users.deleteMany({})
> exit
# Then run seed script
```

#### Issue: "Token expired" or "Unauthorized"

**Symptoms**:
```
{
  "error": "Unauthorized"
}
```
Or gets logged out unexpectedly

**Causes**:
- Token expired (default 24 hours)
- Token malformed
- JWT_SECRET changed

**Solutions**:

1. **Login again**:
- Refresh page
- Click logout
- Click login
- Enter credentials again

2. **Check JWT_SECRET**:
```bash
# backend/.env
JWT_SECRET=your-very-secret-key-here-change-this
```

3. **Clear browser storage**:
```javascript
// In browser console (F12)
localStorage.clear()
sessionStorage.clear()
// Refresh page
```

---

### 🔴 Database Issues

#### Issue: "duplicate key error"

**Symptoms**:
```
MongoError: E11000 duplicate key error
```

**Causes**:
- Unique field already exists (email, reference number)
- Creating record with duplicate reference

**Solutions**:

1. **Use different unique value**:
- Different email for new user
- Different reference number for new record

2. **Clear duplicates**:
```bash
mongosh
> use dlrms
> db.users.deleteOne({email: "duplicate@email.com"})
```

#### Issue: "Cannot read property of undefined"

**Symptoms**:
```
TypeError: Cannot read property 'name' of undefined
```

**Causes**:
- Missing required fields
- Database schema mismatch
- Null/undefined data

**Solutions**:

1. **Check required fields** when creating records:
- Title required
- Owner name required
- Reference number required

2. **Verify all fields are filled in forms**

3. **Check database schema** matches code:
```javascript
// In MongoDB
db.landrecords.findOne()
// Should have all expected fields
```

---

### 🔴 File Upload Issues

#### Issue: "File too large"

**Symptoms**:
```
{
  "error": "File size exceeds 10 MB limit"
}
```

**Solutions**:

1. **Compress file before upload**:
   - Use image compression tools
   - Convert PDF to lower quality
   - Zip file first

2. **Increase size limit** (modify backend):
```javascript
// In backend/src/server.js
const uploadLimit = process.env.UPLOAD_LIMIT || '50mb';
app.use(fileupload({
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
}));
```

#### Issue: "Unsupported file type"

**Symptoms**:
```
{
  "error": "File type not allowed"
}
```

**Causes**:
- File extension not allowed
- Wrong MIME type

**Solutions**:

1. **Use supported formats**:
   - ✓ PDF
   - ✓ JPG/JPEG
   - ✓ PNG
   - ✓ DOC/DOCX
   - ✗ EXE, BAT, SH (not allowed for security)

2. **Convert file format**:
   - Save Word doc as PDF
   - Save image in JPG/PNG

#### Issue: "Cannot download file"

**Symptoms**:
- Download starts but fails
- File not found

**Solutions**:

1. **Verify file exists**:
```bash
# Check uploads folder
ls backend/uploads/
# Should see files with timestamps
```

2. **Check file permissions**:
```bash
# macOS/Linux
chmod 644 backend/uploads/*

# Windows
Right-click > Properties > Security > Full Control
```

---

### 🟡 Performance Issues

#### Issue: "Application running slow"

**Causes**:
- Many records in database
- Missing indexes
- Large files loading

**Solutions**:

1. **Add database indexes** (increases speed 100x):
```bash
mongosh
> use dlrms
> db.landrecords.createIndex({ referenceNumber: 1 })
> db.landrecords.createIndex({ status: 1 })
> db.users.createIndex({ email: 1 }, { unique: true })
```

2. **Optimize queries**:
```javascript
// ❌ Slow - fetches all records
db.landrecords.find({})

// ✓ Fast - uses indexes and pagination
db.landrecords.find({status: "PENDING"}).limit(20)
```

3. **Clear old data**:
```javascript
// Delete archived records older than 1 year
db.landrecords.deleteMany({
  status: "ARCHIVED",
  createdAt: { $lt: new Date(new Date().setFullYear(...)) }
})
```

---

### 🟡 Deployment Issues

#### Issue: Different behavior in production

**Causes**:
- Different environment variables
- Different database
- Different Node version

**Solutions**:

1. **Check production .env**:
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=<production-database-url>
JWT_SECRET=<production-secret>
CORS_ORIGIN=<production-domain>
```

2. **Match Node version**:
```bash
# Check local version
node --version
# Should be v14+ or match production

# Update if needed
nvm use 16.0.0
```

3. **Run production build**:
```bash
# Frontend
cd frontend
npm run build
serve -s build

# Backend
npm install --only=production
NODE_ENV=production npm start
```

---

## Diagnostic Commands

### Check System Status

```bash
# Node version
node --version

# npm version
npm --version

# MongoDB status
mongosh --version

# Backend running
curl http://localhost:5000/api/v1/auth/ping

# Frontend running
curl http://localhost:3000
```

### Check Database

```bash
# Connect to MongoDB
mongosh

# List all databases
show dbs

# Use dlrms database
use dlrms

# List collections
show collections

# Check record count
db.landrecords.countDocuments()

# Check users
db.users.find().pretty()
```

### Check Logs

```bash
# Backend logs (if using separate log file)
tail -f backend/logs/error.log

# Frontend errors
# Open browser DevTools: F12 > Console tab

# MongoDB logs
tail -f /var/log/mongodb/mongod.log  # Linux
```

---

## Getting Help

### 1. Check Documentation
- README.md - Overview
- SETUP_GUIDE.md - Installation
- USER_GUIDE.md - How to use
- API_DOCUMENTATION.md - API reference

### 2. Search Error Message
- Copy exact error message
- Search in troubleshooting guide
- Search online with error message

### 3. Check Logs
- Backend console output
- Frontend browser DevTools (F12)
- MongoDB logs
- Application logs

### 4. Isolate Problem
- Is backend running?
- Is frontend running?
- Is MongoDB running?
- Is firewall blocking ports?

### 5. Restart Everything
```bash
# Stop everything
# Close all terminals and browser
# Start fresh:

# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start

# Browser
http://localhost:3000
```

---

## Emergency Procedures

### Complete Reset

**If something is seriously broken:**

1. **Stop all services**:
```bash
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)
# Stop MongoDB service
```

2. **Clear Node cache**:
```bash
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

3. **Reset database**:
```bash
mongosh
> use dlrms
> db.dropDatabase()
> exit
```

4. **Restart everything**:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm start
```

5. **Seed test data**:
- See SAMPLE_DATA.md for seed script

### Rollback to Previous Version

If you have version control:
```bash
git status
git log --oneline
git checkout <previous-commit>
npm install
npm start
```

---

## Performance Tuning

### MongoDB Optimization

```javascript
// Add indexes for frequently used queries
db.landrecords.createIndex({ status: 1 })
db.landrecords.createIndex({ createdAt: -1 })
db.landrecords.createIndex({ "ownerInformation.ownerName": 1 })

// Check index usage
db.landrecords.aggregate([{ $indexStats: {} }])
```

### Backend Optimization

- Use connection pooling (built-in Mongoose)
- Cache frequently accessed data
- Paginate large result sets (max 100 per page)
- Use compression middleware

### Frontend Optimization

- Lazy load components
- Cache API responses
- Use CSS efficiently
- Minimize bundle size

---

**Version**: 1.0.0  
**Last Updated**: March 2024

---

> **💡 Tip**: Most issues are resolved by restarting services and checking .env file configuration.

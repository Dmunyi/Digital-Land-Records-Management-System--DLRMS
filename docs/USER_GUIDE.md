# DLRMS User Guide

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Land Records Management](#land-records-management)
4. [Document Management](#document-management)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Audit Logs](#audit-logs)
7. [FAQs](#faqs)

---

## 🚀 Getting Started

### Accessing the System

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You'll see the DLRMS login page

### First-Time Login

#### For New Users:

1. Click the **"Register here"** link on the login page
2. Fill in your details:
   - **Full Name**: Your complete name
   - **Email Address**: Your work email
   - **Department**: Your department name
   - **Password**: Create a strong password (minimum 6 characters)
   - **Confirm Password**: Re-enter your password
3. Click **"Register"** button
4. You'll be automatically redirected to login page
5. Log in with your new email and password

#### For Existing Users:

1. Enter your **Email Address**
2. Enter your **Password**
3. Click **"Login"** button

---

## 📊 Dashboard Overview

After logging in, you'll see the DLRMS Dashboard.

### Dashboard Components

#### 1. **Statistics Cards** (Top Section)

Shows four key metrics:
- **📊 Total Records**: Total land records in the system
- **⏳ Pending**: Records awaiting processing
- **⚙️ Processing**: Records currently being worked on
- **✅ Completed**: Records that have been finalized

#### 2. **Quick Actions** (Middle Section)

Buttons for common tasks:
- **View All Records**: Navigate to the records list
- **+ Create New Record**: Create a new land record (OFFICER role and above)
- **View Audit Logs**: See system activity (MANAGER/ADMIN only)

#### 3. **Recent Records** (Bottom Section)

A table showing the 5 most recently created records with:
- Reference Number
- Record Title
- Status (Pending/Processing/Completed/Archived)
- Owner Name
- Creation Date
- View button to see full details

---

## 📋 Land Records Management

### Creating a New Record

**Who Can Create**: OFFICER, MANAGER, ADMIN

#### Step 1: Navigate to Create Record

1. Click **"+ Create New Record"** button on dashboard or records page
2. You'll see the create record form

#### Step 2: Fill Record Information

Fill in the following required fields:

**Record Identification**:
- **Reference Number** *: Unique identifier (e.g., LR-2024-001)
- **Title** *: Descriptive title for the record
- **Priority**: Select Low, Medium, or High priority
- **Description**: Additional details about the record

#### Step 3: Fill Owner Information

**Owner Information**:
- **Owner Name**: Full name of the property owner
- **Email Address**: Owner's email for contact
- **Phone Number**: Owner's phone number
- **ID Type**: Select National ID, Passport, or Driving License
- **ID Number**: The owner's identification number

#### Step 4: Fill Property Details

**Property Details**:
- **Plot Number**: Property identifier (e.g., PLOT-123)
- **Area Size**: Size of the property (number only)
- **Area Unit**: Select sq.m, acres, or hectares
- **Province/State**: Administrative division
- **District/County**: Further subdivision
- **Ward**: Local ward or area

#### Step 5: Submit

1. Review all entered information
2. Click **"✓ Create Record"** button
3. The record will be created and you'll be redirected to records list

### Viewing Records

#### View All Records

1. Click **"Records"** in the navigation menu
2. You'll see a list of all records with:
   - Reference Number
   - Title
   - Owner Name
   - Current Status
   - Priority Level
   - Creation Date

#### Search and Filter

Use the search form at the top of records list:

1. **Search Box**: Type any keyword to search by:
   - Reference number
   - Record title
   - Owner name
   
2. **Status Filter**: Select to show only records with:
   - All Status (default)
   - Pending
   - Processing
   - Completed
   - Archived

3. Click **"🔍 Search"** button to apply filters

#### View Record Details

1. Find the record in the list
2. Click the **"View"** button
3. The record detail page will open showing:
   - Complete record information
   - Owner details
   - Property details
   - Uploaded documents
   - Status management options

### Editing Records

**Who Can Edit**: OFFICER, MANAGER, ADMIN (who created or are assigned the record)

In the record detail page, you can:

1. Update record information
2. Change record status
3. Upload documents
4. View audit history for the record

### Managing Record Status

On the record detail page (right sidebar):

1. **Status Buttons**: Click to change status:
   - **⏳ Pending**: Record waiting to be processed
   - **⚙️ Processing**: Record is being worked on
   - **✅ Completed**: Record processing is finished

2. Status change is recorded in the audit trail

---

## 📎 Document Management

### Uploading Documents

**Who Can Upload**: OFFICER, MANAGER, ADMIN

#### Step 1: Navigate to Record

1. Go to **Records** → Search for your record
2. Click the **"View"** button to open record details

#### Step 2: Upload Document

1. Scroll to the **"Documents"** section
2. Click **"📎 Upload Document"** button
3. A file picker will open
4. Select your document file

**Supported File Types**:
- PDF (.pdf)
- Images (JPG, JPEG, PNG)
- Documents (DOC, DOCX)

**File Size Limit**: Maximum 10 MB per file

#### Step 3: Confirm Upload

1. Once file is selected, it automatically uploads
2. You'll see the file added to the documents table
3. Document shows:
   - File Name
   - File Type
   - File Size
   - Upload Date

### Downloading Documents

**Who Can Download**: All authenticated users

1. Navigate to any record
2. Scroll to **"Documents"** section
3. Find the document you want
4. Click the **"⬇ Download"** button
5. File will download to your default downloads folder

### Deleting Documents

**Who Can Delete**: OFFICER, MANAGER, ADMIN (who have edit permissions)

1. In the **"Documents"** section
2. Find the document to delete
3. Click the **"🗑 Delete"** button
4. Confirm the deletion
5. Document will be removed and audit trail recorded

---

## 👥 User Roles and Permissions

The DLRMS has four user roles with different permission levels:

### 1. **ADMIN** (Administrator)
**Full System Access**

| Permission | Admin |
|-----------|-------|
| View Records | ✅ All |
| Create Records | ✅ Yes |
| Edit Records | ✅ Yes |
| Delete Records | ✅ Yes |
| Upload Documents | ✅ Yes |
| Download Documents | ✅ Yes |
| View Audit Logs | ✅ Yes |
| Manage Users | ✅ Yes |

### 2. **MANAGER** (Department Manager)
**Management and Oversight**

| Permission | Manager |
|-----------|---------|
| View Records | ✅ All |
| Create Records | ✅ Yes |
| Edit Records | ✅ Own/Assigned |
| Upload Documents | ✅ Yes |
| Download Documents | ✅ Yes |
| View Audit Logs | ✅ Yes |
| Manage Staff | ✅ Limited |

### 3. **OFFICER** (Land Officer)
**Record Processing**

| Permission | Officer |
|-----------|---------|
| View Records | ✅ All |
| Create Records | ✅ Yes |
| Edit Records | ✅ Own |
| Upload Documents | ✅ Yes |
| Download Documents | ✅ Yes |
| View Audit Logs | ❌ No |
| Manage Users | ❌ No |

### 4. **VIEWER** (View Only)
**Read-Only Access**

| Permission | Viewer |
|-----------|--------|
| View Records | ✅ All |
| Create Records | ❌ No |
| Edit Records | ❌ No |
| Upload Documents | ❌ No |
| Download Documents | ✅ Yes |
| View Audit Logs | ❌ No |
| Manage Users | ❌ No |

---

## 📊 Audit Logs

**Who Can Access**: MANAGER, ADMIN roles only

### Accessing Audit Logs

1. Click **"Audit Logs"** in the navigation menu
2. You'll see all system activities and user actions

### Understanding Audit Logs

Each audit log entry shows:

- **Timestamp**: Exact date and time of the action
- **User**: Full name and email of the person
- **Role**: User's role in the system
- **Action**: Type of action (LOGIN, VIEW, CREATE, UPDATE, DELETE, etc.)
- **Entity Type**: What was affected (User, Land Record, System)
- **Description**: Details about what was done
- **Status**: Whether action was successful, failed, or unauthorized

### Filtering Audit Logs

Use the **"Filter by Action"** dropdown to view specific actions:
- **LOGIN**: User login events
- **LOGOUT**: User logout events
- **CREATE**: Record/data creation
- **UPDATE**: Record modifications
- **DELETE**: Record/data deletion
- **VIEW**: Record viewing
- **UPLOAD**: Document uploads
- **DOWNLOAD**: Document downloads

### Using Audit Trail

Audit logs help with:
- **Compliance**: Track who accessed what and when
- **Accountability**: see who made changes
- **Security**: Identify unauthorized access attempts
- **Troubleshooting**: Trace issues to specific actions
- **Analysis**: Understand system usage patterns

---

## ❓ FAQs

### Q: How do I reset my password?

**A**: Currently, contact your system administrator. In a future update, password reset will be available through the login page.

### Q: Can I share records with other users?

**A**: The record is visible to all authenticated users based on their role. Specific assignment can be done by managers/admins through record editing.

### Q: How long are documents kept in the system?

**A**: Documents are kept indefinitely unless specifically deleted. Old records can be archived to improve performance.

### Q: What happens if I upload the wrong document?

**A**: You can delete the document from the record and upload the correct one. The deletion action will be recorded in the audit trail.

### Q: Can I export records to Excel?

**A**: Currently, you can download individual documents. Batch export features are planned for future updates.

### Q: How many records can the system handle?

**A**: The system is designed to handle over 10,000 records with excellent performance. Larger deployments may require server upgrades.

### Q: What if the system crashes? Will I lose my data?

**A**: All data is saved to MongoDB database. If the system crashes, your data remains safe. Simply restart the server.

### Q: How do I know if someone unauthorized accessed my records?

**A**: Check the Audit Logs. Every access, modification, and download is tracked with user details and timestamp.

### Q: Can I delete my user account?

**A**: Only administrators can delete accounts. Contact your administrator if you need to deactivate your account.

### Q: What is the maximum file size for document uploads?

**A**: Maximum 10 MB per file. For larger files, you may need to compress them first.

---

## 📞 Need Help?

If you experience issues or have questions:

1. **Check the FAQ** above for common questions
2. **Contact Your Administrator** for technical support
3. **Refer to SETUP_GUIDE.md** for system setup information
4. **Check API_DOCUMENTATION.md** for technical details

---

**Version**: 1.0.0  
**Last Updated**: March 2026

**Remember**: The more organized your records are in DLRMS, the easier it is to find and manage land property information!

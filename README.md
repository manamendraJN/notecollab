# NoteCollab - Technical Documentation

## System Overview

**NoteCollab** is a full-stack collaborative note-taking application built with the MERN stack (MongoDB, Express.js, React, Node.js). The system enables users to create, edit, and share rich-text notes with real-time collaboration features, JWT-based authentication, and full-text search capabilities.

### Technology Stack

- **Backend**           : Node.js (v18+), Express.js v4.18
- **Database**          : MongoDB Atlas with Mongoose v8.0
- **Authentication**    : JSON Web Tokens (JWT)
- **Frontend**          : React 19 with Vite, React Router v7
- **Styling**           : Tailwind CSS v4
- **Rich Text Editor**  : TipTap with multiple extensions
- **Password Security** : bcryptjs with salt rounds 10
- **API Communication** : Axios with interceptors
- **Notifications**     : react-hot-toast

---

### Application Flow

1. **User Registration/Login** → Frontend sends credentials → Backend validates → JWT token generated → Token stored in localStorage
2. **Authenticated Requests**  → Frontend includes Bearer token in Authorization header → Backend verifies token → User identified
3. **Note Operations**         → User creates/edits note → Backend checks permissions → Database updated → Response returned
4. **Collaboration**           → Owner adds collaborator → Collaborator gains access → Shared note appears in collaborator's dashboard

---

## Installation Guide

### Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version  # Should show v18.x.x or higher
     npm --version   # Should show 9.x.x or higher
     ```

2. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/
   - Verify installation:
     ```bash
     git --version
     ```

3. **MongoDB Atlas Account** (free tier available)
   - Sign up at: https://www.mongodb.com/cloud/atlas
   - OR install MongoDB locally: https://www.mongodb.com/try/download/community

4. **Code Editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/

---

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/manamendraJN/notecollab.git

# Navigate to project directory
cd notecollab
```

**Alternative: Download ZIP**
- Download the ZIP file from GitHub
- Extract to your desired location
- Open terminal in the extracted folder

---

### Step 2: Install Backend Dependencies

```bash
# Install backend dependencies from project root
npm install
```
---

### Step 3: Install Frontend Dependencies

```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Return to project root
cd ..
```
---

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Or manually create .env file in project root
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection String
# For Atlas (replace with your credentials):
MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/notecollab?retryWrites=true&w=majority

# For Local MongoDB:
# MONGO_URI=mongodb://localhost:27017/notecollab

# JWT Configuration
JWT_SECRET=your_secret_jwt_key
JWT_EXPIRE=7d

NODE_ENV=development
```
---

## Running the Application

### Development Mode

You need to run both backend and frontend servers simultaneously.

#### Terminal 1: Start Backend Server

```bash
# From project root directory
npm run dev
```

**Expected output:**
```
[nodemon] starting `node server.js`
MongoDB connected
Server running on port 5000
```

**Troubleshooting:**
- If port 5000 is in use: Change `PORT` in `.env` file
- If MongoDB connection fails: Check `MONGO_URI` in `.env`
- If dependencies missing: Run `npm install` again

#### Terminal 2: Start Frontend Server

```bash
# Open new terminal
cd client
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Troubleshooting:**
- If port 5173 is in use: Vite will automatically use next available port
- If dependencies missing: Run `npm install` in client directory

### Access the Application

1. Open your browser and go to: **http://localhost:5173**
2. You should see the NoteCollab login page
3. Click "Register" to create a new account
4. Start creating and collaborating on notes!


## Workflow Patterns

### 1. User Registration & First Login

```
1. User visits /register page
2. Fills form: name, email, password
3. Frontend validates input
4. POST /api/auth/register
5. Backend creates user with hashed password
6. JWT token returned
7. Token stored in localStorage
8. User redirected to /dashboard
9. Dashboard loads user's notes (empty initially)
```

---

### 2. Creating a Note

```
1. User clicks "New Note" button
2. Navigated to /notes/new
3. User enters title and content in TipTap editor
4. User optionally adds tags, chooses color
5. User clicks "Save"
6. POST /api/notes with note data
7. Backend creates note with user as owner
8. New note returned with _id
9. User redirected to /notes/:id (editor view)
10. Note appears in dashboard list
```

---

### 3. Full-Text Search Workflow

```
1. User types query in search bar
2. Debounced API call triggers after 300ms
3. GET /api/notes?search=query
4. MongoDB text index searches title/content/tags
5. Matching notes returned with relevance score
6. Dashboard updates with filtered results
7. Clearing search reloads all notes
```

---

### 4. Adding a Collaborator

```
1. Note owner opens note
2. Clicks "Share" button
3. CollaboratorModal opens
4. Types collaborator email in search field
5. GET /api/users/search?email=typed_text
6. Dropdown shows matching users
7. Owner selects user and permission level
8. POST /api/notes/:id/collaborators
9. Backend validates user exists
10. Collaborator added to note.collaborators array
11. Shared note immediately visible in collaborator's dashboard
12. Collaborator receives access based on permission
```

---

### 5. Collaborator Editing Note

```
1. Collaborator sees shared note in dashboard
2. Clicks on note to open
3. Backend checks access with canAccess() helper
4. If permission = 'edit': Full editor enabled
5. Collaborator modifies content
6. PUT /api/notes/:id with updated content
7. Backend verifies edit permission
8. lastEditedBy updated to collaborator's ID
9. Note saved with timestamp
10. Owner sees changes when they open note
```
---

## Key Features

### 1. Rich Text Editor (TipTap)
- **Extensions**: Bold, Italic, Underline, Strike, Code, Highlight
- **Formatting**: Headings (H1-H6), Paragraphs, Blockquotes
- **Lists**: Bullet lists, Ordered lists
- **Alignment**: Left, Center, Right, Justify
- **Links**: Auto-detection and manual insertion
- **Content Storage**: HTML format stored in database

### 2. Full-Text Search
- **Implementation**: MongoDB text indexes on title, content, and tags
- **Performance**: Indexed searches for fast results
- **Relevance**: MongoDB's native text score ranking
- **Query**: Case-insensitive, supports partial words

### 3. Tagging System
- **Storage**: Array of lowercase strings
- **Filtering**: Single tag filter in UI
- **Display**: Color-coded tag chips
- **Input**: Space-separated or comma-separated tags

### 4. Note Organization
- **Pinning**: Owner-only feature to keep important notes at top
- **Colors**: 8 predefined color options for visual categorization
- **Sorting**: Pinned notes first, then by updatedAt descending
- **Pagination**: 12 notes per page with page navigation

### 5. Soft Delete
- **Implementation**: `isDeleted` flag and `deletedAt` timestamp
- **Benefit**: Data recovery possible, not permanently removed
- **Query**: All queries filter `isDeleted: false`
- **Future**: Trash view could show deleted notes

### 6. Collaborative Features
- **Real-time Access**: Shared notes immediately visible
- **Permission Control**: Granular view/edit permissions
- **User Search**: Email-based collaborator discovery
- **Access Tracking**: `addedAt` timestamp for audit

---

## Security Implementation

### 1. Password Security
- **Hashing Algorithm**: bcryptjs
- **Salt Rounds**: 10 (configurable)
- **Storage**: Only hashed password stored
- **Comparison**: bcrypt.compare() for login validation

### 2. JWT Authentication
- **Secret**: Environment variable `JWT_SECRET` (must be strong)
- **Algorithm**: HMAC SHA256 (HS256)
- **Expiry**: 7 days (configurable via `JWT_EXPIRE`)
- **Storage**: Client-side in localStorage
- **Transmission**: Authorization header with Bearer scheme

### 3. Authorization
- **Middleware**: `protect` middleware on all protected routes
- **User Attachment**: Authenticated user attached to `req.user`
- **Permission Checks**: 
  - Owner checks: `note.owner.toString() === req.user._id.toString()`
  - Collaborator checks: `canAccess()` helper function
  - Permission level validation before operations

### 4. Input Validation
- **User Registration**: Email format, password length, required fields
- **Note Creation**: Title required, length limits
- **Email Uniqueness**: Database constraint
- **Mongoose Validators**: Schema-level validation

### 5. Data Exposure Prevention
- **Password Exclusion**: `select: false` on User.password field
- **Selective Population**: Only necessary fields populated in responses
- **Error Messages**: Generic messages to prevent information leakage

---
## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description here"
}
```

### HTTP Status Codes Used

- **200**: Successful GET, PUT, DELETE requests
- **201**: Successful POST (resource created)
- **400**: Bad request (validation errors, missing fields)
- **401**: Unauthorized (no token, invalid token, wrong credentials)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **500**: Internal server error

---

## Technologies Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript runtime |
| Framework | Express.js | 4.18.2 | Web server framework |
| Database | MongoDB Atlas | Cloud | Document database |
| ODM | Mongoose | 8.0.3 | MongoDB object modeling |
| Authentication | jsonwebtoken | Latest | JWT token generation |
| Password Hashing | bcryptjs | Latest | Secure password storage |
| Frontend | React | 19 | UI library |
| Build Tool | Vite | Latest | Fast development build |
| Routing | React Router | 7 | Client-side routing |
| Styling | Tailwind CSS | 4 | Utility-first CSS |
| HTTP Client | Axios | Latest | API communication |
| Rich Text | TipTap | Latest | WYSIWYG editor |
| Notifications | react-hot-toast | Latest | Toast notifications |

---

## Conclusion

NoteCollab is a production-ready collaborative note-taking application featuring:

✅ **Secure Authentication**: JWT-based with bcrypt password hashing  
✅ **Collaborative Editing**: Multi-user access with granular permissions  
✅ **Rich Text Editing**: Full-featured TipTap editor with formatting  
✅ **Fast Search**: MongoDB text indexes for instant results  
✅ **Scalable Architecture**: MERN stack with RESTful API design  
✅ **Modern UI/UX**: Professional Tailwind CSS styling with responsive design  
✅ **Data Persistence**: MongoDB Atlas cloud database  
✅ **Error Handling**: Comprehensive validation and user feedback 

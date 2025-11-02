# User Management System

## Overview
Complete admin-only user management system with CRUD operations, password management, and role-based access control.

## Backend API (`backend/routes/users.js`)

### Authentication & Authorization
- **All routes**: Require `authenticateToken` middleware (JWT Bearer token)
- **Admin-only routes**: GET, POST, PUT, DELETE users - require `requireAdmin` middleware
- **Own account routes**: Profile endpoints and password change (if own account)

### Endpoints

#### GET /api/users
Get all users (admin only)
- **Auth**: Admin only
- **Response**: Array of users (without password_hash)
- **Fields**: id, email, name, role, is_active, last_login, created_at, updated_at

#### GET /api/users/:id
Get single user by ID (admin only)
- **Auth**: Admin only
- **Response**: Single user object
- **Error**: 404 if user not found

#### POST /api/users
Create new user (admin only)
- **Auth**: Admin only
- **Body**: `{ email, password, name, role? }`
- **Validation**:
  - Email format must be valid
  - Password min 6 characters
  - Email must be unique
- **Response**: `{ success, message, data: { id, email, name, role } }`
- **Password**: Auto-hashed with bcrypt (10 rounds)

#### PUT /api/users/:id
Update user details (admin only)
- **Auth**: Admin only
- **Body**: `{ email?, name?, role?, is_active? }`
- **Validation**:
  - Email format if provided
  - Email uniqueness (except own)
- **Dynamic update**: Only provided fields updated
- **Response**: `{ success, message }`

#### PUT /api/users/:id/password
Change user password
- **Auth**: Admin OR own account
- **Body** (Admin): `{ newPassword }`
- **Body** (Own account): `{ currentPassword, newPassword }`
- **Validation**:
  - New password min 6 characters
  - If own account: current password must be verified
- **Response**: `{ success, message }`
- **Password**: Auto-hashed with bcrypt

#### DELETE /api/users/:id
Delete user (soft delete)
- **Auth**: Admin only
- **Protection**: Cannot delete own account
- **Action**: Sets `is_active = false` (soft delete)
- **Response**: `{ success, message }`
- **Error**: 400 if trying to delete self

#### GET /api/users/profile/me
Get current user profile
- **Auth**: Any authenticated user
- **Response**: Current user's data
- **Fields**: id, email, name, role, is_active, last_login, created_at

#### PUT /api/users/profile/me
Update current user profile
- **Auth**: Any authenticated user
- **Body**: `{ email?, name? }`
- **Validation**:
  - Email format if provided
  - Email uniqueness (except own)
- **Response**: `{ success, message }`

### Error Messages (Indonesian)
- `"Akses ditolak. Hanya admin yang dapat mengakses fitur ini"` - Non-admin trying admin endpoint
- `"Email dan nama harus diisi"` - Missing required fields
- `"Format email tidak valid"` - Invalid email format
- `"Password minimal 6 karakter"` - Password too short
- `"Email sudah terdaftar"` / `"Email sudah digunakan"` - Duplicate email
- `"User tidak ditemukan"` - User not found
- `"Password lama tidak sesuai"` - Wrong current password
- `"Anda tidak dapat menghapus akun sendiri"` - Trying to delete own account

## Frontend Pages

### Profile Page (`src/pages/admin/Profile.tsx`)
User's own profile management
- **Route**: `/admin/profile`
- **Auth**: Any authenticated admin
- **Features**:
  1. **Update Profile**: Name and email
  2. **Change Password**: Current + new password with confirmation
  3. **Security Tips**: Display security best practices

**UI Components**:
- Two-column layout (Profile | Password)
- Show/hide password toggles
- Success/error notifications (auto-hide 5s)
- Loading states with spinners
- Form validation before submit

**Special Behavior**:
- If email changed → auto logout after 2s
- If password changed → auto logout after 2s
- Show security tips at bottom

### Users Management Page (`src/pages/admin/Users.tsx`)
Admin manages all users
- **Route**: `/admin/users`
- **Auth**: Admin only
- **Features**:
  1. **List Users**: Table with user details
  2. **Create User**: Modal form (email, password, name, role)
  3. **Edit User**: Modal form (email, name, role - no password)
  4. **Change Password**: Modal form (new password + confirmation)
  5. **Delete User**: Confirmation modal (soft delete)

**UI Components**:
- Stats cards: Total users, Admin count, Active users
- Users table with columns:
  - User (name + email, shows "(Anda)" for current user)
  - Role (Admin/User badge)
  - Status (Aktif/Nonaktif badge)
  - Last Login (formatted date)
  - Actions (Edit, Lock/Password, Delete)
- Create/Edit Modal:
  - Name input (User icon)
  - Email input (Mail icon)
  - Password input (only for new user, with show/hide toggle)
  - Role select (Admin/User dropdown with Shield icon)
- Password Modal:
  - New password input
  - Confirm password input
  - Both with Lock icons
- Delete Confirmation Modal:
  - Warning message
  - Cannot delete own account (button hidden)

**Protection**:
- Cannot delete own account (no delete button)
- Shows "(Anda)" next to current user's name
- Admin can change any user's password without current password

### Admin Layout Integration
**Sidebar Menu** (`src/components/layout/AdminLayout.tsx`):
- Added "Users" menu item (Users icon)
- Position: Between "Articles" and "Settings"
- Active state: `currentPage === "Users"` or starts with `/admin/users`

**User Dropdown**:
- Profile Settings → Changed to `/admin/profile` (was `/admin/settings`)
- Logout → Calls `logout()` and redirects to `/admin/login`

### Routing (`src/App.tsx`)
```tsx
<Route path="/admin/profile" element={
  <ProtectedRoute requireAdmin>
    <Profile setCurrentPage={(page) => navigate(page)} />
  </ProtectedRoute>
} />

<Route path="/admin/users" element={
  <ProtectedRoute requireAdmin>
    <Users setCurrentPage={(page) => navigate(page)} />
  </ProtectedRoute>
} />
```

## Security Features

### Password Management
- **Hashing**: bcrypt with 10 rounds
- **Min length**: 6 characters
- **Change flow**:
  - Own account: Requires current password verification
  - Admin changing others: No current password needed

### Access Control
- **Admin-only**: All user management operations
- **Own account**: Can update own profile and password
- **Protection**: Cannot delete own account

### Soft Delete
- Users set to `is_active = false`
- Cannot login after deletion
- Data preserved in database

## Database Schema (Existing)
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

## Testing Checklist
✅ Create user (POST /api/users)
✅ List users (GET /api/users)
✅ Update user (PUT /api/users/:id)
✅ Change password - admin (PUT /api/users/:id/password)
✅ Change password - own account (requires currentPassword)
✅ Delete user (DELETE /api/users/:id)
✅ Get own profile (GET /api/users/profile/me)
✅ Update own profile (PUT /api/users/profile/me)

## File Structure
```
backend/
├── routes/
│   ├── auth.js              # Login, verify, logout
│   └── users.js             # NEW: User management
└── server.js                # Routes registered

src/
├── pages/admin/
│   ├── Profile.tsx          # NEW: Own profile management
│   └── Users.tsx            # NEW: Admin user management
├── components/layout/
│   └── AdminLayout.tsx      # Updated: Users menu, profile link
└── App.tsx                  # Routes added
```

## Clean Code Principles Applied
- **Single Responsibility**: Each endpoint handles one operation
- **DRY**: Shared validation logic
- **Error Handling**: Consistent error messages
- **Security**: JWT auth, bcrypt hashing, role-based access
- **User Experience**: Indonesian messages, auto-logout after critical changes
- **Type Safety**: TypeScript interfaces for User
- **UI Consistency**: Matching design with existing admin pages

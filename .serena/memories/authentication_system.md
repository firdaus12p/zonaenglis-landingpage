# Authentication System

## Overview
Full-featured JWT-based authentication system for admin access control.

## Database Schema

### Users Table
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

### Default Admin Account
- Email: `admin@zonaenglish.com`
- Password: `admin123`
- Role: `admin`
- **⚠️ Change password in production!**

## Backend Implementation

### Authentication Routes (`backend/routes/auth.js`)

**POST /api/auth/login**
- Validates email and password
- Uses bcryptjs for password verification
- Returns JWT token (valid for 7 days)
- Updates last_login timestamp
- Response: `{ success, token, user }`

**GET /api/auth/verify**
- Validates JWT token from Authorization header
- Returns user data if token valid
- Used for persistent login
- Response: `{ success, user }`

**POST /api/auth/logout**
- Client-side logout (removes token)
- Can be extended for token blacklisting
- Response: `{ success, message }`

### Middleware (`authenticateToken`)
```javascript
// Protect routes
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains decoded token data
});
```

### Security
- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with HS256 algorithm
- Token expiry: 7 days
- JWT Secret: `JWT_SECRET` env variable (fallback to default)

## Frontend Implementation

### Auth Context (`src/contexts/AuthContext.tsx`)
- React Context for global auth state
- Manages user, token, login, logout
- Auto-verifies token on app load
- Stores token in localStorage

**Methods:**
- `login(email, password)` - Login user
- `logout()` - Clear session
- `isAuthenticated` - Boolean flag
- `user` - Current user object
- `token` - JWT token

### Login Page (`src/pages/Login.tsx`)
**Features:**
- Responsive design matching project theme
- Email + password form
- Show/hide password toggle
- Loading state with spinner
- Error messages
- Development credentials hint
- "Back to home" link

**Design:**
- Gradient background (blue-50, emerald-50)
- Card-based form with shadow
- Icons: Mail, Lock, Eye, EyeOff, LogIn
- Color scheme: blue-700 primary, red for errors
- Full mobile responsiveness

### Protected Routes (`src/components/ProtectedRoute.tsx`)
**Features:**
- Wraps admin routes
- Redirects to `/login` if not authenticated
- Shows loading spinner while checking auth
- Optional `requireAdmin` prop for role-based access
- Access denied page for non-admin users

**Usage:**
```tsx
<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Navbar Integration
**Authenticated State:**
- Desktop: Shows user name + logout button
- Mobile: Shows user card + logout button
- Logout button: Red color scheme

**Unauthenticated State:**
- Shows WhatsApp CTA button

## Routing (`src/App.tsx`)
```tsx
// Public routes
<Route path="/login" element={<Login />} />

// Protected routes
<Route path="/admin/*" element={
  <ProtectedRoute requireAdmin>
    <AdminPage />
  </ProtectedRoute>
} />
```

## Setup Scripts

### Create Users Table
```bash
node backend/db/create-users-table.js
```

### Update Admin Password
```bash
node backend/db/update-admin-password.js
```

## Testing

### Backend API Testing
```powershell
# Login
$body = @{ email = "admin@zonaenglish.com"; password = "admin123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -ContentType "application/json" -Body $body

# Verify token
$token = "YOUR_JWT_TOKEN"
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/verify" -Method GET -Headers @{ Authorization = "Bearer $token" }
```

### Frontend Testing
1. Navigate to `/login`
2. Enter credentials
3. Submit form
4. Should redirect to `/admin/dashboard`
5. Try accessing `/admin` without login (should redirect to login)
6. Logout and verify redirect to login

## Security Considerations

### Implemented
✅ Password hashing with bcrypt
✅ JWT token-based auth
✅ Token expiry (7 days)
✅ Protected routes
✅ Role-based access control
✅ Token verification on every request
✅ Last login tracking

### Production Recommendations
⚠️ Change default admin password
⚠️ Use strong JWT_SECRET in environment
⚠️ Enable HTTPS
⚠️ Implement rate limiting
⚠️ Add token refresh mechanism
⚠️ Implement token blacklisting for logout
⚠️ Add 2FA for admin accounts
⚠️ Log authentication attempts

## Dependencies

### Backend
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `mysql2` - Database access

### Frontend
- `react` - UI framework
- `react-router-dom` - Routing
- `lucide-react` - Icons

## File Structure
```
backend/
├── routes/
│   └── auth.js              # Auth endpoints
├── db/
│   ├── create-users-table.js
│   └── update-admin-password.js
└── server.js                # Auth routes registered

src/
├── contexts/
│   └── AuthContext.tsx      # Auth state management
├── components/
│   └── ProtectedRoute.tsx   # Route protection
├── pages/
│   └── Login.tsx            # Login page
├── Navbar.tsx               # Updated with logout
├── App.tsx                  # Protected routing
└── main.tsx                 # AuthProvider wrapper
```

## Integration with Existing Features
- ✅ All admin routes protected
- ✅ Navbar shows login state
- ✅ Existing functionality preserved
- ✅ No breaking changes to public pages

## Future Enhancements
- [ ] Password reset functionality
- [ ] Email verification
- [ ] User management admin panel
- [ ] Activity logs
- [ ] Session management
- [ ] Remember me functionality

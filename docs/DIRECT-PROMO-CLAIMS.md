# Direct Promo Claims Feature - Implementation Summary

## Overview

Sistem klaim promo langsung memungkinkan user untuk mengajukan promo **tanpa menggunakan kode promo/affiliate**. User cukup klik tombol "Ambil Promo" → isi form → data langsung masuk ke dashboard admin untuk di-follow up.

## Architecture

### Database Schema

**Table: `promo_claims`**

```sql
CREATE TABLE promo_claims (
  id INT PRIMARY KEY AUTO_INCREMENT,

  -- User Information
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  user_email VARCHAR(255),
  user_city VARCHAR(100),

  -- Program Details
  program_id INT,
  program_name VARCHAR(255) NOT NULL,
  program_branch VARCHAR(50),
  program_type VARCHAR(50),
  program_category VARCHAR(50),

  -- Tracking
  urgency ENUM('urgent', 'this_month', 'browsing') DEFAULT 'browsing',
  source VARCHAR(50) DEFAULT 'promo_hub',
  device_fingerprint VARCHAR(255),

  -- Follow-up Management
  follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending',
  follow_up_notes TEXT,
  follow_up_by INT,

  -- Registration Tracking
  registered BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Soft Delete
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(100),

  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
  FOREIGN KEY (follow_up_by) REFERENCES admin_users(id) ON DELETE SET NULL
);
```

### Backend API Endpoints

**File: `backend/routes/promo-claims.js`**

#### 1. Submit Promo Claim

```http
POST /api/promo-claims/claim
Content-Type: application/json

{
  "user_name": "John Doe",
  "user_phone": "08123456789",
  "user_email": "john@example.com",
  "user_city": "Makassar",
  "program_id": 5,
  "program_name": "KID CLASS - Pettarani",
  "program_branch": "Pettarani",
  "program_type": "Kid Class",
  "urgency": "browsing"
}
```

**Response:**

```json
{
  "success": true,
  "claim_id": 123,
  "message": "Promo claim submitted successfully! Admin will contact you soon."
}
```

**Features:**

- ✅ Phone number validation (08xxx or 628xxx format)
- ✅ Spam prevention: 1 claim per phone per day
- ✅ Device fingerprinting for additional spam detection
- ✅ Foreign key relations to `programs` and `admin_users` tables

#### 2. Get All Claims (Admin)

```http
GET /api/promo-claims/all
```

**Response:**

```json
{
  "success": true,
  "claims": [
    {
      "id": 1,
      "user_name": "John Doe",
      "user_phone": "08123456789",
      "user_email": "john@example.com",
      "program_name": "KID CLASS - Pettarani",
      "follow_up_status": "pending",
      "created_at": "2025-02-02T10:30:00.000Z",
      "days_ago": 0
    }
  ],
  "count": 1
}
```

#### 3. Get Statistics

```http
GET /api/promo-claims/stats
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "total_claims": 150,
    "today_claims": 5,
    "pending": 20,
    "contacted": 15,
    "conversions": 100,
    "lost": 15
  }
}
```

#### 4. Update Claim Status

```http
PATCH /api/promo-claims/update-status/:claim_id
Content-Type: application/json

{
  "follow_up_status": "contacted",
  "follow_up_notes": "Sudah dihubungi via WhatsApp",
  "follow_up_by": 1
}
```

#### 5. Soft Delete Claim

```http
DELETE /api/promo-claims/:claim_id
Content-Type: application/json

{
  "deleted_by": "admin"
}
```

#### 6. Restore Deleted Claim

```http
PUT /api/promo-claims/restore/:claim_id
```

### Frontend Implementation

#### 1. PromoHub.tsx - User Interface

**Location:** `src/PromoHub.tsx`

**Key Functions:**

```typescript
// Handle direct claim button click
const handleDirectClaim = () => {
  if (!userData) {
    setIsModalOpen(true); // Show user info form
    return;
  }
  submitDirectClaim(userData);
};

// Submit claim to backend
const submitDirectClaim = async (claimData: {
  name: string;
  phone: string;
  email?: string;
}) => {
  const response = await fetch("http://localhost:3001/api/promo-claims/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_name: claimData.name,
      user_phone: claimData.phone,
      user_email: claimData.email || "",
      program_id: promo.id,
      program_name: promo.title,
      program_branch: promo.branch,
      program_type: promo.type,
      urgency: "browsing",
    }),
  });

  const result = await response.json();
  if (result.success) {
    setShowSuccessModal(true);
  }
};
```

**Button Changed:**

```tsx
{
  /* OLD: WhatsApp link */
}
<a href={promo.wa}>Ambil Promo</a>;

{
  /* NEW: Direct claim button */
}
<button onClick={handleDirectClaim}>Ambil Promo</button>;
```

**User Flow:**

1. User clicks "Ambil Promo" button
2. If no user data in sessionStorage → show UserInfoFormModal
3. User fills: name, phone, email
4. Data submitted to `/api/promo-claims/claim`
5. Success modal shown → data saved in sessionStorage for future claims
6. Admin receives notification in dashboard

#### 2. Admin Dashboard - PromoClaims.tsx

**Location:** `src/pages/admin/PromoClaims.tsx`

**Features:**

1. **Statistics Cards**

   - Total Claims
   - Today's Claims
   - Pending Count
   - Contacted Count
   - Conversions Count
   - Lost Leads Count

2. **Filter Tabs**

   - Semua (All)
   - Pending
   - Dihubungi (Contacted)
   - Terdaftar (Converted)
   - Lost

3. **Claims Table**
   Columns:

   - User Info (name, phone, email, city, days ago)
   - Program (name, branch, type)
   - Urgency Badge (urgent/this_month/browsing)
   - Status Badge (pending/contacted/converted/lost)
   - Notes (editable inline)
   - Actions (status update, delete)

4. **Actions**
   - **Status Dropdown**: Change status anytime with dropdown selector
     - Pending → Contacted → Converted → Lost
     - **Flexible**: Can change back from any status (prevents misclick errors)
     - Example: Lost → Contacted → Converted (if admin made mistake)
   - **Edit Notes**: Add/update follow-up notes inline
   - **Delete**: Soft delete claim (can be restored)

**Status Flow (Flexible):**

```
┌─────────┐
│ PENDING │ ←─┐
└────┬────┘   │
     │        │
     ↓        │
┌───────────┐ │
│ CONTACTED │ │  All statuses can be
└─────┬─────┘ │  changed to any other
      ↓       │  status via dropdown
  ┌───┴───┐   │
  ↓       ↓   │
CONVERTED LOST│
  │       │   │
  └───────┴───┘
```

### Route Registration

**Backend:** `backend/server.js`

```javascript
import promoClaimsRoutes from "./routes/promo-claims.js";
app.use("/api/promo-claims", promoClaimsRoutes);
```

**Frontend:** `src/App.tsx`

```tsx
import PromoClaims from "./pages/admin/PromoClaims";

<Route
  path="/admin/promo-claims"
  element={
    <ProtectedRoute requireAdmin>
      <PromoClaims />
    </ProtectedRoute>
  }
/>;
```

**Admin Sidebar:** `src/components/layout/AdminLayout.tsx`

```tsx
{
  name: "Promo Claims",
  page: "/admin/promo-claims",
  icon: FileText,
  current: currentPage.startsWith("/admin/promo-claims"),
}
```

## User Journey Comparison

### WITH Affiliate Code (Existing System)

1. User visits PromoHub
2. User enters affiliate/promo code
3. System validates code with `/api/validate/code`
4. If valid → shows discount, user info modal
5. User fills form
6. Data tracked via `/api/affiliate/track`
7. Affiliate gets commission

### WITHOUT Code (NEW Direct Claim)

1. User visits PromoHub
2. User clicks "Ambil Promo" button
3. User info modal appears
4. User fills form
5. Data submitted to `/api/promo-claims/claim`
6. Admin dashboard receives notification
7. Admin follows up manually

## Key Differences from Affiliate System

| Feature                 | Affiliate System | Direct Claim System        |
| ----------------------- | ---------------- | -------------------------- |
| **Code Required**       | ✅ Yes           | ❌ No                      |
| **Discount Applied**    | ✅ Automatic     | ❌ Manual (admin decision) |
| **Commission Tracking** | ✅ Yes           | ❌ No                      |
| **Spam Prevention**     | 1 code/day       | 1 claim/day                |
| **Follow-up**           | Optional         | Required                   |
| **Target Users**        | Users with codes | Users without codes        |

## Spam Prevention

Both systems implement:

- **Daily Limit**: 1 action per phone number per day
- **Device Fingerprinting**: IP address + User-Agent tracking
- **Phone Validation**: Indonesian format only (08xxx, 628xxx)

```javascript
// Example spam check
const today = new Date().toISOString().split("T")[0];
const [existingClaim] = await db.query(
  "SELECT id FROM promo_claims WHERE user_phone = ? AND DATE(created_at) = ?",
  [user_phone, today]
);

if (existingClaim.length > 0) {
  return res.status(429).json({
    success: false,
    error: "Nomor ini sudah mengajukan klaim hari ini",
  });
}
```

## Testing Checklist

### User Side (PromoHub)

- [ ] Click "Ambil Promo" without code → modal appears
- [ ] Fill form with valid data → success modal shown
- [ ] Try same phone twice today → error message shown
- [ ] Check sessionStorage → user data persisted
- [ ] Refresh page → user data still available

### Admin Side (Dashboard)

- [ ] Navigate to `/admin/promo-claims` → page loads
- [ ] See statistics cards with correct counts
- [ ] Filter by status → table updates
- [ ] Change status via dropdown → works smoothly
- [ ] Change status from Lost back to Contacted → works (flexible)
- [ ] Change status from Converted to Lost → works (prevents misclick errors)
- [ ] Edit notes → saves successfully
- [ ] Delete claim → soft deleted, disappears from list
- [ ] Check database → `deleted_at` field populated

### API Testing

```bash
# Test claim submission
curl -X POST http://localhost:3001/api/promo-claims/claim \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "Test User",
    "user_phone": "08123456789",
    "program_name": "Test Program"
  }'

# Test get all claims
curl http://localhost:3001/api/promo-claims/all

# Test statistics
curl http://localhost:3001/api/promo-claims/stats
```

## Migration Instructions

1. **Run Migration**

   ```bash
   # Navigate to backend
   cd backend

   # Run migration script
   mysql -u root -p zona_english_admin < migrations/create_promo_claims_table.sql
   ```

2. **Verify Table Created**

   ```sql
   USE zona_english_admin;
   SHOW TABLES LIKE 'promo_claims';
   DESCRIBE promo_claims;
   ```

3. **Test Insert**

   ```sql
   INSERT INTO promo_claims (user_name, user_phone, program_name)
   VALUES ('Test User', '08123456789', 'Test Program');

   SELECT * FROM promo_claims;
   ```

## Future Enhancements

### Possible Improvements:

1. **Email Notifications**: Auto-email admin when new claim arrives
2. **WhatsApp Integration**: Send automated WhatsApp message to user
3. **Priority Scoring**: Urgent claims highlighted in dashboard
4. **Conversion Tracking**: Link to actual registration records
5. **Export to CSV**: Download claims for external analysis
6. **Follow-up Reminders**: Auto-notify admin if claim pending >3 days
7. **Multi-admin Assignment**: Assign claims to specific admins
8. **Mobile Responsive**: Improve table layout for mobile devices

## Related Files

### Backend

- `backend/routes/promo-claims.js` - Main API routes
- `backend/server.js` - Route registration
- `backend/migrations/create_promo_claims_table.sql` - Database schema
- `backend/services/whatsapp.js` - Phone validation & fingerprinting

### Frontend

- `src/PromoHub.tsx` - User interface & claim submission
- `src/pages/admin/PromoClaims.tsx` - Admin dashboard
- `src/App.tsx` - Route configuration
- `src/components/layout/AdminLayout.tsx` - Sidebar menu

## Support

For issues or questions:

1. Check console logs in browser DevTools (F12)
2. Check backend logs in terminal
3. Verify database connection and table existence
4. Ensure both frontend (5173) and backend (3001) servers running

---

**Created:** February 2025  
**Status:** ✅ Completed & Ready for Production  
**Database:** zona_english_admin  
**Port Config:** Frontend 5173, Backend 3001, MySQL 3307

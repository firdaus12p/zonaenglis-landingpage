# 🔄 API Integration Guide - React Frontend to Express Backend

## ✅ Implemented Changes

### 1. **Backend API** (Express.js + MySQL)

**Location:** `backend/`

**Server Status:**

- ✅ Running on http://localhost:3001
- ✅ Connected to MySQL database `zona_english_admin` (port 3307)
- ✅ CORS enabled for http://localhost:5173

**Endpoints:**

```
GET    /api/health                      - Health check
GET    /api/ambassadors                 - Get all active ambassadors
GET    /api/ambassadors/:id             - Get single ambassador
GET    /api/ambassadors/code/:code      - Get ambassador by affiliate code
POST   /api/ambassadors                 - Create new ambassador
PUT    /api/ambassadors/:id             - Update ambassador
DELETE /api/ambassadors/:id             - Soft delete ambassador
GET    /api/promos                      - Get active promo codes
GET    /api/promos/:code                - Get specific promo code
POST   /api/promos/validate             - Validate promo code
POST   /api/promos/use                  - Record promo usage
POST   /api/validate/affiliate-code     - Validate affiliate code (for PromoHub)

# 🎯 AFFILIATE TRACKING ENDPOINTS (NEW)
POST   /api/affiliate/track             - Track affiliate code usage & notify ambassador
GET    /api/affiliate/stats/:ambassador_id    - Get affiliate usage statistics
GET    /api/affiliate/leads/:ambassador_id    - Get active leads for follow-up
PATCH  /api/affiliate/update-status/:usage_id - Update lead follow-up status
```

---

### 2. **React Frontend Updates**

**File:** `src/PromoHub.tsx`

#### Changed Functions:

**A. validateCode() - Now Async with API Call**

**Before (localStorage):**

```typescript
const validateCode = (code: string) => {
  const storedAmbassadors = localStorage.getItem("ambassadors");
  const ambassadors = JSON.parse(storedAmbassadors);
  const foundAmbassador = ambassadors.find(...);
  // ... validation logic
};
```

**After (API):**

```typescript
const validateCode = async (code: string) => {
  const response = await fetch(
    "http://localhost:3001/api/validate/affiliate-code",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    }
  );

  const data = await response.json();

  if (data.valid && data.ambassador) {
    setCodeStatus("valid");
    setAppliedCode({
      code: data.ambassador.code,
      ambassador: { ...data.ambassador },
      discount: data.discount,
    });
  }
};
```

**B. loadAmbassadors() - useEffect with API**

**Before (localStorage):**

```typescript
useEffect(() => {
  const stored = localStorage.getItem("ambassadors");
  const parsedAmbassadors = JSON.parse(stored);
  // Transform and set ambassadors
}, []);
```

**After (API):**

```typescript
useEffect(() => {
  const loadAmbassadors = async () => {
    const response = await fetch('http://localhost:3001/api/ambassadors');
    const ambassadorsData = await response.json();

    const transformedAmbassadors = ambassadorsData
      .filter((amb: any) => amb.is_active === 1)
      .slice(0, 6)
      .map((amb: any) => ({ ...transform logic... }));

    setAmbassadors(transformedAmbassadors);
  };

  loadAmbassadors();
}, []);
```

---

## 🚀 How to Run

### 1. Start Backend Server

```bash
# Open Terminal 1 (PowerShell window)
cd backend
npm start

# Or use separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$pwd'; node backend/server.js"
```

**Expected Output:**

```
🚀 ========================================
   Zona English Backend API Server
   ========================================
   📡 Server running on: http://localhost:3001
   🌍 Environment: development
   🔌 CORS enabled for: http://localhost:5173
   ========================================

✅ MySQL Database connected successfully
📊 Database: zona_english_admin
🔌 Port: 3307
```

### 2. Start React Frontend

```bash
# Open Terminal 2
npm run dev
```

**Expected Output:**

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Access Application

Open browser: **http://localhost:5173**

Navigate to PromoHub section and test affiliate code validation.

---

## ✅ Testing the Integration

### Test 1: Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-27T15:20:49.992Z",
  "database": "zona_english_admin",
  "port": 3001
}
```

### Test 2: Get All Ambassadors

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/ambassadors" -Method Get
```

**Expected Response:**

```json
[
  {
    "id": 3,
    "name": "Maya Sari",
    "role": "Community Ambassador",
    "location": "Makassar",
    "affiliate_code": "MAYA2024",
    "is_active": 1,
    ...
  },
  ...
]
```

### Test 3: Validate Affiliate Code

```powershell
$body = @{ code = "SARAH2024" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/validate/affiliate-code" -Method Post -Body $body -ContentType "application/json"
```

**Expected Response:**

```json
{
  "valid": true,
  "message": "Kode valid! Diskon Rp 50.000 diterapkan.",
  "ambassador": {
    "id": 1,
    "name": "Sarah Pratiwi",
    "role": "Senior Ambassador",
    "location": "Makassar",
    "code": "SARAH2024",
    "commission_rate": 15.0
  },
  "discount": 50000
}
```

### Test 4: Frontend Integration (Browser)

1. Open http://localhost:5173
2. Navigate to PromoHub section
3. Find "Opportunity Cards" section
4. Enter affiliate code: **SARAH2024**
5. Click "Terapkan" button

**Expected Result:**

- ✅ Green success message appears
- ✅ Ambassador info displayed: "Sarah Pratiwi - Senior Ambassador - Makassar"
- ✅ Final price shows Rp 50.000 discount applied
- ✅ Copy button works

---

## 🔧 Troubleshooting

### Problem: CORS Error in Browser Console

**Error:**

```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Solution:**
Check backend `.env` file:

```env
CORS_ORIGIN=http://localhost:5173
```

Restart backend server.

---

### Problem: Backend Cannot Connect to Database

**Error:**

```
❌ Database connection failed: connect ECONNREFUSED 127.0.0.1:3307
```

**Solution:**

1. Ensure XAMPP MySQL is running
2. Check MySQL port in XAMPP (should be 3307)
3. Verify backend `.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASS=
DB_NAME=zona_english_admin
```

---

### Problem: API Returns Empty Array

**Error:**

```json
[]
```

**Solution:**

1. Check if database has data:

```sql
USE zona_english_admin;
SELECT * FROM ambassadors WHERE is_active = 1;
```

2. If empty, import sample data:

```bash
mysql -u root -P 3307 < database/zona_english_admin.sql
```

---

### Problem: Frontend Shows Old Data

**Solution:**

1. Clear browser cache (Ctrl + Shift + R)
2. Clear localStorage:

```javascript
// In browser console
localStorage.clear();
```

3. Refresh page

---

## 📊 Data Flow Architecture

```
┌─────────────────┐
│  React Frontend │
│  (localhost:    │
│      5173)      │
└────────┬────────┘
         │
         │ HTTP Requests
         │ (fetch API)
         ▼
┌─────────────────┐
│ Express Backend │
│  (localhost:    │
│      3001)      │
└────────┬────────┘
         │
         │ SQL Queries
         │ (mysql2)
         ▼
┌─────────────────┐
│  MySQL Database │
│ zona_english_   │
│     admin       │
│  (port 3307)    │
└─────────────────┘
```

---

## 🎯 Benefits of API Integration

**Before (localStorage):**

- ❌ Data only in browser (no persistence)
- ❌ Lost on cache clear
- ❌ No multi-device sync
- ❌ Limited to 5-10MB
- ❌ Vulnerable to tampering

**After (MySQL + API):**

- ✅ Centralized data storage
- ✅ Persistent across devices
- ✅ Real-time updates
- ✅ Unlimited storage
- ✅ Secure server-side validation
- ✅ Transaction logging
- ✅ Analytics & reporting
- ✅ Scalable for production

---

## 📝 Next Steps

- [ ] Add loading states to frontend
- [ ] Add error handling UI
- [ ] Implement admin dashboard for CRUD
- [ ] Add authentication (JWT)
- [ ] Deploy backend to production
- [ ] Setup environment variables for production
- [ ] Add API rate limiting
- [ ] Implement caching (Redis)

---

## 🎯 NEW: Affiliate Tracking System

### Overview

Sistem tracking otomatis untuk mencatat penggunaan kode affiliate dan mengirimkan notifikasi ke ambassador melalui WhatsApp Click-to-Chat (GRATIS, tanpa API key).

### Features

✅ **User Data Collection** - Modal form untuk nama, phone, email  
✅ **Session Persistence** - Data tersimpan di sessionStorage  
✅ **Spam Prevention** - 1 kode per phone per hari  
✅ **Device Fingerprinting** - Additional security layer  
✅ **WhatsApp Notification** - Auto-open Click-to-Chat URL  
✅ **Lead Management** - Admin dashboard untuk follow-up  
✅ **Statistics** - Total usage, conversions, conversion rate

### Database Schema

**Table:** `affiliate_usage`

```sql
CREATE TABLE affiliate_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  user_email VARCHAR(255),
  user_city VARCHAR(100),

  affiliate_code VARCHAR(50) NOT NULL,
  ambassador_id INT,
  program_id INT,
  program_name VARCHAR(255),
  discount_applied DECIMAL(10,2),

  urgency ENUM('urgent', 'this_month', 'browsing') DEFAULT 'browsing',
  source VARCHAR(100),
  first_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  notified_to_ambassador BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP NULL,
  notification_method VARCHAR(50),

  follow_up_status ENUM('pending', 'contacted', 'converted', 'lost') DEFAULT 'pending',
  follow_up_notes TEXT,
  registered BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP NULL,

  device_fingerprint VARCHAR(255),

  FOREIGN KEY (ambassador_id) REFERENCES ambassadors(id),
  INDEX idx_phone (user_phone),
  INDEX idx_follow_up (follow_up_status)
);
```

### API Endpoints Detail

#### 1. POST /api/affiliate/track

**Purpose:** Track affiliate code usage, prevent spam, generate WhatsApp notification

**Request Body:**

```json
{
  "user_name": "John Doe",
  "user_phone": "081234567890",
  "user_email": "john@example.com",
  "affiliate_code": "SARAH2024",
  "program_id": "promo-001",
  "program_name": "Paket Hemat Ramadan",
  "discount_applied": 50000
}
```

**Response (Success):**

```json
{
  "success": true,
  "usage_id": 15,
  "ambassador": {
    "id": 1,
    "name": "Sarah Pratiwi",
    "phone": "6281234567890"
  },
  "whatsapp_url": "https://wa.me/6281234567890?text=🎉%20ADA%20YANG%20PAKAI%20KODE%20ANDA!...",
  "notification_method": "whatsapp_click_to_chat"
}
```

**Response (Spam Detected - Different Code):**

```json
{
  "success": false,
  "error": "Nomor 081234567890 sudah menggunakan kode MAYA2024 hari ini. Silakan gunakan kode yang sama atau coba lagi besok."
}
```

**Spam Prevention Logic:**

- ✅ **Same code, same phone, same day** → Allow (user can apply to multiple programs)
- ❌ **Different code, same phone, same day** → Reject
- ✅ **Next day** → Reset, allow any code

---

#### 2. GET /api/affiliate/stats/:ambassador_id

**Purpose:** Get statistics for specific ambassador

**Response:**

```json
{
  "total_uses": 45,
  "today_uses": 3,
  "pending_followups": 8,
  "conversions": 12,
  "conversion_rate": 26.67
}
```

---

#### 3. GET /api/affiliate/leads/:ambassador_id

**Purpose:** Get active leads (pending/contacted, not registered yet)

**Response:**

```json
[
  {
    "id": 23,
    "user_name": "John Doe",
    "user_phone": "081234567890",
    "user_email": "john@example.com",
    "affiliate_code": "SARAH2024",
    "program_name": "Paket Hemat Ramadan",
    "discount_applied": 50000,
    "first_used_at": "2025-10-28T10:30:00.000Z",
    "follow_up_status": "pending",
    "days_ago": 2
  }
]
```

---

#### 4. PATCH /api/affiliate/update-status/:usage_id

**Purpose:** Update lead follow-up status

**Request Body:**

```json
{
  "follow_up_status": "contacted",
  "follow_up_notes": "Sudah dihubungi via WA, tertarik ambil program",
  "registered": false
}
```

**Response:**

```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

---

### Frontend Integration (PromoHub.tsx)

**Flow:**

1. User clicks "Apply" button
2. Check if `userData` exists in sessionStorage
3. If NO → Show `UserInfoFormModal`
4. User fills: name (required), phone (required), email (optional)
5. Data saved to sessionStorage
6. Validate affiliate code via API
7. If valid → Call `/api/affiliate/track`
8. Auto-open WhatsApp notification in new tab
9. Ambassador receives notification with user info

**Code Example:**

```typescript
const handleApply = async () => {
  // Check user data
  if (!userData) {
    setIsModalOpen(true);
    return;
  }

  // Validate code
  const response = await fetch("http://localhost:3001/api/validate/code", {
    method: "POST",
    body: JSON.stringify({ code: codeInput.trim() }),
  });

  const data = await response.json();

  if (data.valid && data.type === "ambassador") {
    // Track affiliate usage
    const trackResponse = await fetch(
      "http://localhost:3001/api/affiliate/track",
      {
        method: "POST",
        body: JSON.stringify({
          user_name: userData.name,
          user_phone: userData.phone,
          affiliate_code: codeInput.trim(),
          program_id: promo.id,
          program_name: promo.title,
          discount_applied: data.discount,
        }),
      }
    );

    const trackData = await trackResponse.json();

    if (trackData.success && trackData.whatsapp_url) {
      // Auto-open WhatsApp
      window.open(trackData.whatsapp_url, "_blank");
    }
  }
};
```

---

### Admin Dashboard (AffiliateAdmin.tsx)

**Location:** `src/AffiliateAdmin.tsx`

**Features:**

- 📊 View statistics (total uses, today, pending, conversions, rate)
- 👥 See all active leads
- ✏️ Update follow-up status (pending → contacted → converted/lost)
- 📝 Add follow-up notes
- ✅ Mark as registered
- 💬 Quick WhatsApp link to contact user

**Access:** Navigate to `/affiliate-admin` (need to add route)

---

### WhatsApp Notification Format

**Message Template:**

```
🎉 ADA YANG PAKAI KODE ANDA!

📝 Kode: SARAH2024
👤 Nama: John Doe
📱 WhatsApp: 081234567890
📧 Email: john@example.com
🎯 Program: Paket Hemat Ramadan
💰 Diskon: Rp 50.000

Segera follow-up user ini! 🚀
```

**WhatsApp URL:**

```
https://wa.me/6281234567890?text=🎉%20ADA%20YANG%20PAKAI%20KODE%20ANDA!%0A%0A📝%20Kode%3A%20SARAH2024...
```

---

### Testing Affiliate Tracking

**Test 1: First Time User (Modal Appears)**

1. Open PromoHub
2. Enter affiliate code "SARAH2024"
3. Click "Apply"
4. ✅ Modal appears asking for name, phone, email
5. Fill data and submit
6. ✅ Code validated
7. ✅ Data saved to sessionStorage
8. ✅ WhatsApp notification opens in new tab

**Test 2: Returning User (No Modal)**

1. Refresh page
2. Enter different affiliate code
3. Click "Apply"
4. ✅ No modal (data already in sessionStorage)
5. ✅ Code validated immediately

**Test 3: Spam Prevention (Same Phone, Different Code)**

1. Use phone "081234567890" with code "SARAH2024"
2. Try using same phone with code "MAYA2024"
3. ✅ Rejected: "Nomor ini sudah menggunakan kode SARAH2024 hari ini"

**Test 4: Same Code, Multiple Programs**

1. Use phone "081234567890" with code "SARAH2024" on Program A
2. Use same phone with code "SARAH2024" on Program B
3. ✅ Allowed (ambassador notified only once per day)

**Test 5: Admin Dashboard**

1. Navigate to AffiliateAdmin
2. Select ambassador "Sarah Pratiwi"
3. ✅ See statistics
4. ✅ See leads list
5. Click "Edit" on a lead
6. Change status to "contacted"
7. Add notes "Sudah dihubungi, tertarik"
8. ✅ Status updated

---

### Database Queries

**Check today's usage for a phone:**

```sql
SELECT * FROM affiliate_usage
WHERE user_phone = '081234567890'
  AND DATE(first_used_at) = CURDATE();
```

**Get ambassador statistics:**

```sql
SELECT
  COUNT(*) as total_uses,
  SUM(CASE WHEN DATE(first_used_at) = CURDATE() THEN 1 ELSE 0 END) as today_uses,
  SUM(CASE WHEN follow_up_status IN ('pending', 'contacted') AND NOT registered THEN 1 ELSE 0 END) as pending_followups,
  SUM(CASE WHEN registered = TRUE THEN 1 ELSE 0 END) as conversions,
  ROUND(SUM(CASE WHEN registered = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as conversion_rate
FROM affiliate_usage
WHERE ambassador_id = 1;
```

**Get active leads:**

```sql
SELECT
  id, user_name, user_phone, user_email,
  program_name, discount_applied,
  follow_up_status,
  DATEDIFF(NOW(), first_used_at) as days_ago
FROM affiliate_usage
WHERE ambassador_id = 1
  AND follow_up_status IN ('pending', 'contacted')
  AND registered = FALSE
ORDER BY first_used_at DESC;
```

---

**Created:** 2025-10-27  
**Updated:** 2025-10-28 (Added Affiliate Tracking)  
**Backend:** http://localhost:3001  
**Frontend:** http://localhost:5173  
**Database:** zona_english_admin (port 3307)

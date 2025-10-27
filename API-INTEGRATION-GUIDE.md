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

**Created:** 2025-10-27  
**Backend:** http://localhost:3001  
**Frontend:** http://localhost:5173  
**Database:** zona_english_admin (port 3307)

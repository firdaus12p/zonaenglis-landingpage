# 🚀 QUICK DEPLOYMENT GUIDE - Backend API

## Problem Recap

✅ Frontend deployed → https://promo.zonaenglish.id/
✅ Database imported → dbpromoze
❌ Backend not deployed → Login fails with "Failed to fetch"

---

## 📦 Step 1: Prepare Backend Files (Local)

### Option A: Compress via PowerShell

```powershell
# Open PowerShell di folder project
cd c:\Projek\zonaenglis-landingpage

# Compress backend folder
Compress-Archive -Path backend\* -DestinationPath backend-production.zip -Force

# File created: backend-production.zip
```

### Option B: Compress Manually

1. Buka folder: `c:\Projek\zonaenglis-landingpage\backend`
2. Select semua file dan folder
3. Right-click → Send to → Compressed (zipped) folder
4. Rename: `backend-production.zip`

---

## 📤 Step 2: Upload to cPanel (5 mins)

### 2.1 Login cPanel

- URL: https://portal.exabytes.co.id/clientarea.php
- Login dengan akun hosting Anda

### 2.2 Create API Folder

1. cPanel → **File Manager**
2. Navigate ke: `public_html/`
3. Click **New Folder**
4. Folder name: `api`
5. Click **Create New Folder**

### 2.3 Upload Backend

1. Enter folder: `api`
2. Click **Upload** (top right)
3. Select file: `backend-production.zip`
4. Wait for upload complete
5. Close upload page

### 2.4 Extract Files

1. Right-click: `backend-production.zip`
2. Click **Extract**
3. Extract to: `/public_html/api/` (default)
4. Click **Extract Files**
5. After extract, delete `backend-production.zip`

### 2.5 Verify Structure

```
public_html/
└── api/
    ├── server.js          ✅
    ├── package.json       ✅
    ├── package-lock.json  ✅
    ├── db/                ✅
    ├── routes/            ✅
    ├── middleware/        ✅
    └── services/          ✅
```

---

## ⚙️ Step 3: Configure Backend (3 mins)

### 3.1 Create .env File

1. File Manager → `public_html/api/`
2. Click **New File**
3. Filename: `.env`
4. Click **Create New File**

### 3.2 Edit .env Content

1. Right-click `.env` → **Edit**
2. Copy-paste this content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=dbpromoze
DB_PASS=Alanwalker009#
DB_NAME=dbpromoze

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://promo.zonaenglish.id

# JWT Secret (Change this to random string!)
JWT_SECRET=ZonaEnglish2025SecureProductionKey!@#$%
```

3. Click **Save Changes**

**⚠️ IMPORTANT**:

- `DB_HOST` must be `localhost` (not 127.0.0.1)
- `CORS_ORIGIN` must exact match your domain
- Change `JWT_SECRET` to unique random string

### 3.3 Verify .env File

1. Refresh file list
2. File `.env` should appear
3. File size: ~300-400 bytes

---

## 🚀 Step 4: Setup Node.js App (5 mins)

### 4.1 Open Setup Node.js App

1. cPanel → **Software** section
2. Click **Setup Node.js App**

### 4.2 Create New Application

Click **Create Application** button

Fill in these fields:

| Field                        | Value                             |
| ---------------------------- | --------------------------------- |
| **Node.js version**          | 18.x atau 20.x (pilih yang ada)   |
| **Application mode**         | Production                        |
| **Application root**         | `api`                             |
| **Application URL**          | (leave empty or fill your domain) |
| **Application startup file** | `server.js`                       |
| **Passenger log file**       | (leave default)                   |

Click **CREATE**

### 4.3 Install Dependencies

After app created, you'll see commands to run.

**Option A - via cPanel Terminal**:

1. cPanel → **Terminal**
2. Run these commands:

```bash
cd public_html/api
source /home/YOUR_USERNAME/nodevenv/api/18/bin/activate
npm install
```

**Option B - via Setup Node.js App**:

1. Stay on "Setup Node.js App" page
2. Look for your app in the list
3. Click **"Run NPM Install"** button
4. Wait for installation complete (~1-2 mins)

### 4.4 Start Application

1. After npm install complete
2. Click **"Restart"** button
3. Status should change to **"Running"** with green icon

**If status is "Stopped"**:

- Click **"Edit"** → Check configuration
- Click **"Restart"** again
- Check logs for errors

---

## ✅ Step 5: Test Backend (2 mins)

### 5.1 Test Health Endpoint

Open browser, visit:

```
https://promo.zonaenglish.id/api/health
```

**Expected response**:

```json
{
  "status": "ok",
  "timestamp": "2025-11-20T10:30:00.000Z"
}
```

**If you see this** → ✅ Backend is running!

**If error 404 / Cannot GET**:

- Go back to "Setup Node.js App"
- Check status → Must be "Running"
- Click "Restart"
- Check logs for errors

### 5.2 Test Login Endpoint

Open browser console (F12), paste this code:

```javascript
fetch("https://promo.zonaenglish.id/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@zonaenglish.com",
    password: "admin123",
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

**Expected response**:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@zonaenglish.com",
    "name": "Administrator",
    "role": "super_admin"
  }
}
```

**If you see this** → ✅ Backend authentication working!

---

## 🔄 Step 6: Update & Rebuild Frontend (5 mins)

Now that backend is running, update frontend to use production API.

### 6.1 Check Current API Config

File: `src/config/api.ts` should now have:

```typescript
export const API_BASE =
  import.meta.env.MODE === "production"
    ? "https://promo.zonaenglish.id/api"
    : "http://localhost:3001/api";
```

**If not**, update it manually.

### 6.2 Rebuild Frontend

```powershell
# Di folder project
npm run build
```

**Expected output**:

```
✓ built in 15.23s
dist/index.html               X.XX kB
dist/assets/index-abc123.js   XXX.XX kB
dist/assets/index-xyz789.css   XX.XX kB
```

### 6.3 Re-upload Frontend

1. cPanel → File Manager → `public_html/`
2. **Delete old files** (KEEP `api/` folder and `.htaccess`):
   - Delete folder: `assets/`
   - Delete file: `index.html`
   - Delete file: `vite.svg` (if exists)
3. **Upload new build**:
   - Open folder `dist/` in your computer
   - Select all files
   - Upload to `public_html/`
   - Replace if asked

### 6.4 Verify Upload

Structure should be:

```
public_html/
├── assets/              ✅ New files
│   ├── index-abc123.js
│   └── index-xyz789.css
├── index.html           ✅ New file
├── .htaccess            ✅ Keep existing
└── api/                 ✅ Keep existing
    └── server.js
    └── ...
```

---

## 🎯 Step 7: Final Testing

### 7.1 Test Login

1. Open: https://promo.zonaenglish.id/ze-admin-portal-2025
2. Clear browser cache: **Ctrl + Shift + Delete**
3. Hard refresh: **Ctrl + F5**
4. Login with:
   - Email: `admin@zonaenglish.com`
   - Password: `admin123`

**Expected**:

- ✅ Login success
- ✅ Redirect to dashboard
- ✅ Dashboard shows data

### 7.2 Test Admin Features

- [ ] Dashboard loads data
- [ ] Ambassadors list loads
- [ ] Programs list loads
- [ ] Articles list loads
- [ ] Settings loads

**All working?** → ✅ **DEPLOYMENT SUCCESS!**

---

## 🆘 Troubleshooting

### Issue: "Cannot GET /api"

**Fix**:

- cPanel → Setup Node.js App
- Check status → Must be "Running"
- Click "Restart"

### Issue: Still "Failed to fetch"

**Fix**:

- Clear browser cache completely
- Try incognito/private window
- Check browser console for actual error

### Issue: CORS error

**Fix**:

- Edit `public_html/api/.env`
- Verify `CORS_ORIGIN=https://promo.zonaenglish.id`
- Restart Node.js app

### Issue: Database connection error

**Fix**:

- Edit `public_html/api/.env`
- Verify `DB_HOST=localhost`
- Verify `DB_USER=dbpromoze`
- Test connection via phpMyAdmin

---

## 📋 Deployment Checklist

### Pre-Deployment:

- [x] Database imported (17 tables)
- [x] Admin user exists in database
- [x] Backend files prepared locally
- [x] Frontend API config updated

### Backend Deployment:

- [ ] Backend uploaded to `public_html/api/`
- [ ] `.env` file created with correct credentials
- [ ] Node.js app created and configured
- [ ] Dependencies installed (`npm install`)
- [ ] App status: **Running**
- [ ] Health endpoint working: `/api/health`
- [ ] Login endpoint working: `/api/auth/login`

### Frontend Deployment:

- [ ] Frontend rebuilt with production API
- [ ] New build uploaded to `public_html/`
- [ ] `.htaccess` file exists
- [ ] All routes accessible (no 404)

### Final Testing:

- [ ] Login successful
- [ ] Dashboard loads
- [ ] All admin features working
- [ ] No console errors
- [ ] Change admin password

---

## ⏱️ Time Estimate

| Task                      | Time         |
| ------------------------- | ------------ |
| Prepare files             | 2 mins       |
| Upload to cPanel          | 5 mins       |
| Configure .env            | 3 mins       |
| Setup Node.js app         | 5 mins       |
| Test backend              | 2 mins       |
| Rebuild & upload frontend | 5 mins       |
| Final testing             | 3 mins       |
| **TOTAL**                 | **~25 mins** |

---

## 📞 Support

Jika masih error setelah ikuti semua step:

**Exabytes Support**:

- WhatsApp: +62 21 3000 0830
- Email: support@exabytes.co.id

**Say this**:

> "Saya deploy Node.js backend di public_html/api/
> Frontend: https://promo.zonaenglish.id/
> Backend startup file: server.js
> Status app: Running tapi tidak bisa diakses
> Mohon bantuan cek logs dan configuration"

---

**Created**: November 20, 2025
**For**: Zona English Landing Page Production Deployment
**Author**: Tech Support Team

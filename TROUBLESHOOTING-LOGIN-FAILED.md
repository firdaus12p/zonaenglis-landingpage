# 🚨 TROUBLESHOOTING: Login Gagal - Failed to Fetch

## Problem

✅ Halaman login bisa diakses: https://promo.zonaenglish.id/ze-admin-portal-2025
❌ Login gagal dengan error: **"Failed to fetch"**
❌ Database sudah di-import dengan benar

---

## Root Cause

Error **"Failed to fetch"** berarti **frontend tidak bisa terhubung ke backend API**.

### Kemungkinan Penyebab:

1. ❌ **Backend belum di-deploy** ke server Exabytes
2. ❌ **Backend sudah di-deploy** tapi tidak berjalan (Node.js app stopped)
3. ❌ **Frontend masih mengarah ke localhost** (`http://localhost:3001/api`)
4. ❌ **CORS tidak dikonfigurasi** dengan benar di backend

---

## ✅ SOLUSI 1: Deploy Backend ke Server

### Cek Apakah Backend Sudah Di-Deploy

1. **Test API endpoint di browser**:

   ```
   https://promo.zonaenglish.id/api/health
   ```

   **Jika return JSON** (misal: `{"status":"ok"}`) → Backend sudah berjalan, lanjut ke SOLUSI 2

   **Jika error 404 / Cannot GET** → Backend belum di-deploy, ikuti langkah di bawah

### Deploy Backend (Jika Belum)

#### Step 1: Siapkan File Backend

1. **Compress folder backend**:

   ```powershell
   # Di folder project
   Compress-Archive -Path backend/* -DestinationPath backend-production.zip
   ```

2. **Atau manual**:
   - Buka folder `c:\Projek\zonaenglis-landingpage\backend`
   - Right-click → Send to → Compressed (zipped) folder
   - Rename menjadi: `backend-production.zip`

#### Step 2: Upload ke cPanel

1. **Login cPanel Exabytes**

   - URL: https://portal.exabytes.co.id/clientarea.php

2. **Upload backend**:

   - cPanel → File Manager
   - Navigate ke: `public_html/`
   - Create folder baru: `api`
   - Masuk ke folder `api`
   - Upload: `backend-production.zip`
   - Right-click → Extract
   - Hapus file zip setelah extract

3. **Struktur harus seperti ini**:
   ```
   public_html/
   ├── api/
   │   ├── server.js         ✅ File utama
   │   ├── package.json      ✅ Dependencies
   │   ├── routes/           ✅ API routes
   │   ├── db/               ✅ Database config
   │   ├── middleware/       ✅ Auth middleware
   │   └── .env              ❌ BELUM ADA (buat baru)
   ├── assets/
   ├── index.html
   └── .htaccess
   ```

#### Step 3: Konfigurasi Backend .env

1. **Buat file `.env` di `public_html/api/`**:

   - File Manager → api folder
   - Click "New File"
   - Filename: `.env`
   - Edit file, isi dengan:

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

   # CORS Configuration (PENTING!)
   CORS_ORIGIN=https://promo.zonaenglish.id

   # JWT Secret (Generate random 32 characters)
   JWT_SECRET=ZonaEnglish2025SecureKey!@#
   ```

   **⚠️ PENTING**:

   - `DB_HOST` harus `localhost` (bukan 127.0.0.1)
   - `CORS_ORIGIN` harus EXACT match dengan domain Anda
   - `JWT_SECRET` ganti dengan random string

2. **Save file**

#### Step 4: Setup Node.js App di cPanel

1. **cPanel → Setup Node.js App**

2. **Create Application**:

   - **Node.js version**: 18.x atau 20.x (pilih yang tersedia)
   - **Application mode**: Production
   - **Application root**: `api`
   - **Application URL**: Kosongkan (atau isi domain Anda)
   - **Application startup file**: `server.js`
   - **Passenger log file**: (biarkan default)

3. **Click "Create"**

4. **Install Dependencies**:

   - Setelah app dibuat, klik "Run NPM Install"
   - Atau buka Terminal di cPanel:
     ```bash
     cd public_html/api
     source /home/username/nodevenv/api/18/bin/activate
     npm install
     ```

5. **Restart App**:
   - Kembali ke "Setup Node.js App"
   - Klik tombol "Restart"
   - Status harus "Running" dengan icon hijau

#### Step 5: Test Backend

1. **Test API Health**:

   ```
   https://promo.zonaenglish.id/api/health
   ```

   Expected response:

   ```json
   { "status": "ok", "timestamp": "2025-11-20T..." }
   ```

2. **Test Login Endpoint**:

   - Buka browser console (F12)
   - Paste code ini:

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
     .then(console.log);
   ```

   Expected response:

   ```json
   {
     "success": true,
     "token": "eyJ...",
     "user": {...}
   }
   ```

---

## ✅ SOLUSI 2: Update Frontend API URL

Jika backend sudah berjalan, frontend masih mengarah ke localhost. Perlu rebuild dengan API URL production.

### Step 1: Update API Config

File: `src/config/api.ts`

**BEFORE** (localhost):

```typescript
export const API_BASE = "http://localhost:3001/api";
```

**AFTER** (production):

```typescript
// Automatically detect environment
export const API_BASE =
  import.meta.env.MODE === "production"
    ? "https://promo.zonaenglish.id/api" // Production
    : "http://localhost:3001/api"; // Development
```

### Step 2: Rebuild Frontend

```powershell
# Di folder project
npm run build
```

### Step 3: Re-upload Frontend

1. **cPanel → File Manager → public_html/**

2. **Delete old files** (kecuali folder `api`):

   - Delete: `assets/` folder
   - Delete: `index.html`
   - Keep: `.htaccess` dan folder `api/`

3. **Upload new build**:

   - Buka folder `dist/` di local
   - Upload semua file ke `public_html/`

4. **Test login**:
   - https://promo.zonaenglish.id/ze-admin-portal-2025
   - Email: admin@zonaenglish.com
   - Password: admin123

---

## ✅ SOLUSI 3: Fix CORS Error (Jika Ada)

Jika setelah deploy backend, masih error CORS:

### Gejala:

Browser console error:

```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

### Fix:

1. **Edit `backend/.env` di server**:

   ```env
   CORS_ORIGIN=https://promo.zonaenglish.id
   ```

   **Jika domain Anda pakai www juga**:

   ```env
   CORS_ORIGIN=https://promo.zonaenglish.id,https://www.promo.zonaenglish.id
   ```

2. **Restart Node.js App**:

   - cPanel → Setup Node.js App
   - Click "Restart"

3. **Test lagi**

---

## ✅ SOLUSI 4: Verify Database Connection

Jika backend berjalan tapi login tetap gagal:

### Cek Database Connection

1. **cPanel → Setup Node.js App → Logs**

   Look for errors like:

   ```
   Error: connect ECONNREFUSED
   ER_ACCESS_DENIED_ERROR
   ```

2. **Fix Database Credentials**:

   - Edit `public_html/api/.env`
   - Verify:
     ```env
     DB_HOST=localhost
     DB_USER=dbpromoze
     DB_PASS=Alanwalker009#
     DB_NAME=dbpromoze
     ```

3. **Test Database via phpMyAdmin**:

   - cPanel → phpMyAdmin
   - Select database: `dbpromoze`
   - Run query:
     ```sql
     SELECT * FROM admin_users WHERE email = 'admin@zonaenglish.com';
     ```
   - Should return 1 row

4. **Restart Node.js App**

---

## 📋 Quick Verification Checklist

### Backend Checklist:

- [ ] Folder `public_html/api/` ada dan berisi file backend
- [ ] File `public_html/api/.env` ada dan benar
- [ ] Node.js App status "Running" di cPanel
- [ ] `https://promo.zonaenglish.id/api/health` return JSON
- [ ] Database imported dengan benar (17 tables)
- [ ] Table `admin_users` berisi user admin

### Frontend Checklist:

- [ ] File `src/config/api.ts` sudah update ke production URL
- [ ] `npm run build` berhasil (ada folder `dist/`)
- [ ] Upload ulang `dist/` ke `public_html/`
- [ ] File `.htaccess` masih ada di `public_html/`
- [ ] `https://promo.zonaenglish.id/` bisa diakses

### Testing Checklist:

- [ ] Browser console (F12) → Network tab → No CORS errors
- [ ] Login test → Email: admin@zonaenglish.com, Pass: admin123
- [ ] Login success → Redirect ke dashboard
- [ ] Dashboard load data dari API

---

## 🆘 Troubleshooting Common Errors

### Error: "Cannot POST /api/auth/login"

**Cause**: Backend routing salah atau tidak berjalan

**Fix**:

1. Verify `public_html/api/routes/auth.js` ada
2. Verify `server.js` register route auth
3. Restart Node.js app
4. Check logs di cPanel

### Error: "net::ERR_CONNECTION_REFUSED"

**Cause**: Backend tidak berjalan

**Fix**:

1. cPanel → Setup Node.js App
2. Check status → Harus "Running"
3. Jika stopped, click "Restart"
4. Check logs untuk error

### Error: "ER_ACCESS_DENIED_ERROR"

**Cause**: Database credentials salah

**Fix**:

1. Verify `.env` file di `public_html/api/`
2. Test credentials di phpMyAdmin
3. Verify user `dbpromoze` has privileges
4. Restart Node.js app

### Error: "Unknown database 'dbpromoze'"

**Cause**: Database belum dibuat atau nama salah

**Fix**:

1. cPanel → MySQL Databases
2. Create database: `dbpromoze` (jika belum ada)
3. Import SQL file: `zona_english_admin_production.sql`
4. Verify 17 tables created

---

## 🎯 Summary

**Most Likely Issue**: Backend belum di-deploy atau frontend masih ke localhost

**Quick Fix Steps**:

1. Deploy backend ke `public_html/api/`
2. Buat `.env` dengan credentials production
3. Setup Node.js App di cPanel
4. Update frontend `api.ts` ke production URL
5. Rebuild & re-upload frontend
6. Test login

**Time Estimate**: 15-30 menit

---

## 📞 Support Contact

Jika masih error setelah semua langkah:

**Exabytes Support**:

- WhatsApp: +62 21 3000 0830
- Email: support@exabytes.co.id
- Live Chat: https://www.exabytes.co.id/

**Info yang perlu disampaikan**:

```
Website: https://promo.zonaenglish.id/
Issue: Backend API tidak bisa diakses dari frontend
Backend location: public_html/api/
Node.js version: 18.x
Error: "Failed to fetch" saat login

Sudah deploy backend dan setup Node.js app.
Mohon bantuan untuk:
1. Verify Node.js app berjalan dengan benar
2. Check error logs
3. Verify port 3001 accessible
```

---

**Created**: November 20, 2025
**Last Updated**: November 20, 2025
**Author**: Zona English Tech Team

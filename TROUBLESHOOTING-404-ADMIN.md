# 🚨 TROUBLESHOOTING: Admin Panel 404 Error

## Masalah

❌ Tidak bisa akses `https://promo.zonaenglish.id/ze-admin-portal-2025`
❌ Error: **404 Page Not Found**

## Root Cause

Website ini adalah **Single Page Application (SPA)** yang menggunakan React Router untuk client-side routing. Ketika user langsung akses URL admin, server tidak menemukan file fisik dan return 404.

---

## ✅ SOLUSI 1: Upload File .htaccess (RECOMMENDED)

### Langkah-langkah:

1. **Login ke cPanel Exabytes**

   - URL: https://portal.exabytes.co.id/clientarea.php
   - Login dengan akun hosting Anda

2. **Buka File Manager**

   - cPanel → File Manager
   - Navigate ke folder: `public_html/`

3. **Cek apakah file `.htaccess` sudah ada**

   - Klik "Settings" (pojok kanan atas)
   - ✅ Centang "Show Hidden Files (dotfiles)"
   - Klik "Save"

4. **Upload/Update file `.htaccess`**

   **Cara A - Jika file `.htaccess` TIDAK ADA:**

   - Klik "Upload" (pojok kanan atas)
   - Upload file `.htaccess` dari project ini
   - File location: `c:\Projek\zonaenglis-landingpage\.htaccess`

   **Cara B - Jika file `.htaccess` SUDAH ADA:**

   - Right-click file `.htaccess` → Edit
   - **Backup dulu** (copy isi ke notepad)
   - Replace dengan isi file `.htaccess` baru
   - Klik "Save Changes"

5. **Test akses admin**
   - Buka: https://promo.zonaenglish.id/ze-admin-portal-2025
   - Seharusnya halaman login muncul

---

## ✅ SOLUSI 2: Jika Solusi 1 Tidak Berhasil

### Gunakan file `.htaccess` alternatif:

1. **Hapus `.htaccess` yang lama**

   - cPanel → File Manager → public_html/
   - Right-click `.htaccess` → Delete

2. **Upload `.htaccess.alternative`**

   - File location: `c:\Projek\zonaenglis-landingpage\.htaccess.alternative`
   - Upload ke `public_html/`
   - Rename dari `.htaccess.alternative` menjadi `.htaccess`

3. **Test lagi**
   - Clear browser cache (Ctrl + F5)
   - Akses: https://promo.zonaenglish.id/ze-admin-portal-2025

---

## ✅ SOLUSI 3: Cek Konfigurasi Server

### Jika masih 404 setelah upload .htaccess:

1. **Cek mod_rewrite enabled**

   - cPanel → Software → Select PHP Version
   - Atau hubungi support Exabytes:
     - WhatsApp: +62 21 3000 0830
     - Email: support@exabytes.co.id
   - Minta aktifkan: `mod_rewrite` dan `AllowOverride All`

2. **Verifikasi file structure**

   ```
   public_html/
   ├── .htaccess          ✅ HARUS ADA
   ├── index.html         ✅ HARUS ADA
   ├── assets/            ✅ HARUS ADA
   │   ├── index-[hash].js
   │   └── index-[hash].css
   └── api/               ✅ Backend folder
       ├── server.js
       ├── .env
       └── ...
   ```

3. **Test dengan URL lain**

   - Test: https://promo.zonaenglish.id/
   - Test: https://promo.zonaenglish.id/promo-center
   - Test: https://promo.zonaenglish.id/articles

   **Jika semua 404** → masalah deployment dasar
   **Jika homepage OK, tapi route lain 404** → masalah .htaccess

---

## ✅ SOLUSI 4: Verifikasi Backend API

### Pastikan backend berjalan:

1. **Cek backend .env file**

   - cPanel → File Manager → public_html/api/
   - Pastikan file `.env` ada dengan konfigurasi:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=dbpromoze
   DB_PASS=Alanwalker009#
   DB_NAME=dbpromoze
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://promo.zonaenglish.id
   JWT_SECRET=[32-char-random-string]
   ```

2. **Test API endpoint**

   - Browser: https://promo.zonaenglish.id/api/health
   - Atau: https://promo.zonaenglish.id/api/ambassadors
   - Seharusnya return JSON response (bukan 404)

3. **Cek Node.js App di cPanel**
   - cPanel → Software → Setup Node.js App
   - Pastikan app running dengan status "Running"
   - Application root: `api`
   - Application startup file: `server.js`
   - Jika stopped, klik "Restart"

---

## ✅ SOLUSI 5: Clear Cache & Rebuild

### Jika semua sudah benar tapi masih error:

1. **Clear browser cache**

   ```
   Chrome/Edge: Ctrl + Shift + Delete
   Pilih "Cached images and files"
   Klik "Clear data"
   ```

2. **Hard refresh**

   ```
   Windows: Ctrl + F5
   Mac: Cmd + Shift + R
   ```

3. **Coba browser incognito/private**

   - Chrome: Ctrl + Shift + N
   - Firefox: Ctrl + Shift + P

4. **Rebuild frontend di local (jika perlu)**

   ```powershell
   # Di project folder
   npm run build

   # Upload ulang folder dist/ ke public_html/
   # (replace semua file)
   ```

---

## 📋 Quick Verification Checklist

### Frontend Checklist:

- [ ] File `public_html/.htaccess` ada dan benar
- [ ] File `public_html/index.html` ada
- [ ] Folder `public_html/assets/` ada dengan file JS/CSS
- [ ] Website homepage bisa diakses (https://promo.zonaenglish.id/)

### Backend Checklist:

- [ ] File `public_html/api/.env` ada dan benar
- [ ] Node.js app status "Running" di cPanel
- [ ] API endpoint test berhasil (return JSON, bukan 404)
- [ ] Database connection berhasil

### Testing Checklist:

- [ ] Homepage: https://promo.zonaenglish.id/ ✅
- [ ] Promo Center: https://promo.zonaenglish.id/promo-center ✅
- [ ] Admin Login: https://promo.zonaenglish.id/ze-admin-portal-2025 ✅
- [ ] API Health: https://promo.zonaenglish.id/api/health ✅

---

## 🆘 Jika Masih Gagal

**Hubungi Support Exabytes:**

- **WhatsApp**: +62 21 3000 0830
- **Email**: support@exabytes.co.id
- **Live Chat**: https://www.exabytes.co.id/

**Info yang perlu disampaikan:**

```
Saya deploy React SPA application di shared hosting.
Website: https://promo.zonaenglish.id/
Masalah: 404 error untuk client-side routes

Sudah upload .htaccess dengan mod_rewrite rules.
Mohon bantuan untuk:
1. Aktifkan mod_rewrite di server
2. Set AllowOverride All di Apache config
3. Verifikasi .htaccess berjalan dengan benar
```

---

## 📁 File Reference

File `.htaccess` yang benar ada di project:

- **Main**: `c:\Projek\zonaenglis-landingpage\.htaccess`
- **Alternative**: `c:\Projek\zonaenglis-landingpage\.htaccess.alternative`
- **Production**: `c:\Projek\zonaenglis-landingpage\.htaccess.production`

Gunakan file **Main** (.htaccess) terlebih dahulu.
Jika tidak berhasil, coba **Alternative**.

---

## ✅ Expected Result

Setelah fix, semua URL ini harus berfungsi:

- ✅ https://promo.zonaenglish.id/ → Homepage
- ✅ https://promo.zonaenglish.id/promo-center → Promo Center
- ✅ https://promo.zonaenglish.id/promo-hub → Promo Hub
- ✅ https://promo.zonaenglish.id/articles → Articles
- ✅ **https://promo.zonaenglish.id/ze-admin-portal-2025** → Admin Login ⭐

Default admin credentials:

- **Email**: admin@zonaenglish.com
- **Password**: admin123

⚠️ **PENTING**: Ganti password setelah login pertama kali!

---

## 🎯 Summary

**Root cause**: SPA routing tidak dikonfigurasi di server
**Solution**: Upload file `.htaccess` dengan mod_rewrite rules
**Priority**: SOLUSI 1 → SOLUSI 2 → SOLUSI 3 (hubungi support)
**Time estimate**: 5-10 menit (jika hanya upload .htaccess)

Good luck! 🚀

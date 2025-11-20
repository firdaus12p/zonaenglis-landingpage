# 🚀 QUICK FIX: Admin 404 Error

## Problem

❌ Cannot access: https://promo.zonaenglish.id/ze-admin-portal-2025
❌ Error: **404 Not Found**

---

## ✅ SOLUTION (5 Minutes)

### Step 1: Login cPanel

- URL: https://portal.exabytes.co.id/clientarea.php
- Login dengan akun hosting

### Step 2: Open File Manager

- cPanel → **File Manager**
- Click **Settings** (top right)
- ✅ Check "**Show Hidden Files (dotfiles)**"
- Click **Save**

### Step 3: Navigate & Check

- Go to: **public_html/**
- Look for file: `.htaccess`

### Step 4A: If `.htaccess` NOT FOUND

1. Click **Upload** button
2. Upload file: `c:\Projek\zonaenglis-landingpage\.htaccess`
3. Done! Go to Step 5

### Step 4B: If `.htaccess` EXISTS

1. Right-click `.htaccess` → **Edit**
2. Check if it contains these lines:
   ```apache
   RewriteEngine On
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```
3. If NOT, replace entire content with the file from:
   `c:\Projek\zonaenglis-landingpage\.htaccess`
4. Click **Save Changes**

### Step 5: Test

1. Open browser (Chrome/Firefox)
2. Press: **Ctrl + Shift + Delete**
3. Clear "Cached images and files"
4. Access: https://promo.zonaenglish.id/ze-admin-portal-2025
5. ✅ Should see LOGIN PAGE

---

## 🔐 Admin Login

- **Email**: admin@zonaenglish.com
- **Password**: admin123
- ⚠️ Change password after first login!

---

## 🆘 If Still Not Working

### Contact Exabytes Support:

- **WhatsApp**: +62 21 3000 0830
- **Email**: support@exabytes.co.id

**Say this**:

> "Saya deploy React SPA di public_html/.
> Homepage bisa diakses, tapi route lain 404.
> Sudah upload .htaccess dengan mod_rewrite.
> Mohon aktifkan mod_rewrite dan set AllowOverride All.
> Website: https://promo.zonaenglish.id/"

---

## 📋 Verification Checklist

After fix, test these URLs:

- [ ] https://promo.zonaenglish.id/ → Homepage ✅
- [ ] https://promo.zonaenglish.id/promo-center → Promo Center ✅
- [ ] https://promo.zonaenglish.id/promo-hub → Promo Hub ✅
- [ ] https://promo.zonaenglish.id/articles → Articles ✅
- [ ] **https://promo.zonaenglish.id/ze-admin-portal-2025** → Admin Login ✅

All should work WITHOUT 404!

---

## 🎯 Why This Happens?

Your website is a **Single Page Application (SPA)**:

- Uses React Router for navigation
- All pages handled by `index.html`
- Without `.htaccess`, server can't find physical files → 404

**Fix**: Tell server to redirect all requests to `index.html`

---

## 📁 Files Reference

**Main solution**: `.htaccess`
**Alternative**: `.htaccess.alternative`
**Full guide**: `TROUBLESHOOTING-404-ADMIN.md`
**Deployment guide**: `DEPLOYMENT-CHECKLIST.md`

---

**Last Updated**: November 20, 2025
**Support**: firdaus12p@zonaenglish.id

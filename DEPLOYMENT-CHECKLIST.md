# 🚀 DEPLOYMENT CHECKLIST

Complete this checklist before and after deploying to production.

---

## ✅ Pre-Deployment Preparation

### Build & Test

- [ ] Run `npm run build` successfully
- [ ] Test all features locally:
  - [ ] Landing page (LearnMoreZE)
  - [ ] Promo Center page
  - [ ] Promo Hub page
  - [ ] Admin login (`/ze-admin-portal-2025`)
  - [ ] Admin dashboard features
  - [ ] Image upload functionality
  - [ ] Promo code validation
  - [ ] Ambassador tracking
  - [ ] Article CMS (create, edit, delete)

### Configuration

- [ ] Update `backend/.env` with production values
- [ ] Generate secure JWT_SECRET (min 32 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Update `CORS_ORIGIN` with production domain
- [ ] Set `NODE_ENV=production`
- [ ] Verify database credentials

### Security

- [ ] Remove all console.log() in production code
- [ ] Check no sensitive data in git
- [ ] Verify .gitignore includes .env files
- [ ] Prepare to change default admin password

---

## 📦 Files to Upload

### Frontend (Shared Hosting - cPanel)

**Location**: `public_html/`

- [ ] Upload contents of `dist/` folder:
  - [ ] `index.html`
  - [ ] `assets/` folder
  - [ ] `vite.svg`
- [ ] Create `.htaccess` file (use template from project)
- [ ] Verify all static assets load (images, CSS, JS)

### Backend (Shared Hosting - cPanel)

**Location**: `public_html/api/`

- [ ] Upload `backend/` folder contents:
  - [ ] `routes/` folder
  - [ ] `db/` folder
  - [ ] `middleware/` folder
  - [ ] `services/` folder
  - [ ] `server.js`
  - [ ] `package.json`
  - [ ] `.env` (configured for production)
- [ ] **DO NOT upload** `node_modules/` (install on server)
- [ ] **DO NOT upload** development scripts

**cPanel Steps**:

1. [ ] Login cPanel → **Setup Node.js App**
2. [ ] Click **CREATE APPLICATION**
   - Node.js version: **18.x** or **20.x**
   - Application mode: **Production**
   - Application root: `api`
   - Startup file: `server.js`
3. [ ] Click **CREATE**
4. [ ] Open **Terminal** → Install dependencies:
   ```bash
   cd public_html/api
   source /home/username/nodevenv/api/18/bin/activate
   npm install
   ```
5. [ ] Back to **Setup Node.js App** → Click **RESTART**
6. [ ] Status should show **RUNNING**

### Database

**File**: `dbimport/zona_english_admin_production.sql`

- [ ] Create database in cPanel:
  - Database name: `dbpromoze`
  - Username: `dbpromoze`
  - Password: `Alanwalker009#` (or your password)
  - Grant **ALL PRIVILEGES**
- [ ] Import SQL file via **phpMyAdmin**:
  1. [ ] Select database `dbpromoze`
  2. [ ] Tab: **Import**
  3. [ ] Choose file: `zona_english_admin_production.sql`
  4. [ ] Character set: `utf8mb4_unicode_ci`
  5. [ ] Click **Go**
  6. [ ] Wait for completion
- [ ] Verify 17 tables created:
  ```
  admin_users, ambassadors, affiliate_transactions, affiliate_usage,
  articles, article_categories, article_comments, article_hashtags,
  article_images, article_likes, article_views, countdown_batches,
  gallery, programs, promo_claims, promo_codes, promo_usage, settings
  ```

---

## 🔍 Post-Deployment Verification

### Frontend Tests

- [ ] Open main domain: `https://yourdomain.com`
- [ ] Landing page loads correctly
- [ ] Navigate to `/promo-center` → Page loads
- [ ] Navigate to `/promo-hub` → Page loads
- [ ] Test routing: Refresh on any page → No 404 error
- [ ] Check browser console → No errors
- [ ] Test on mobile device → Responsive design works

### Backend API Tests

- [ ] Test API endpoint: `https://api.yourdomain.com/api/ambassadors`
  - Should return JSON array
- [ ] Test: `https://api.yourdomain.com/api/programs`
  - Should return JSON array
- [ ] Test: `https://api.yourdomain.com/api/settings/public/all`
  - Should return settings

### Admin Panel Tests

- [ ] Login: `https://yourdomain.com/ze-admin-portal-2025`
  - Username: `admin`
  - Password: `admin123`
- [ ] Dashboard loads with statistics
- [ ] Navigate all admin pages (no errors)
- [ ] Test image upload:
  1. Go to **Programs** → Add program
  2. Upload image
  3. Save → Image should display
- [ ] Test promo code:
  1. Go to **Promo Codes** → Create new
  2. Copy code
  3. Open Promo Hub (public page)
  4. Validate code → Should work
- [ ] Test ambassador tracking:
  1. Open Promo Hub
  2. Copy ambassador code
  3. Submit form
  4. Check admin → Lead should appear

### Database Connection Tests

- [ ] Admin can login (validates DB connection)
- [ ] Ambassadors display on Promo Hub
- [ ] Programs display on pages
- [ ] Articles load (if any)

---

## 🔐 Security Post-Deployment

### Immediate Actions

- [ ] Change default admin password:
  1. Login as admin
  2. Go to **Profile**
  3. Change password to strong password
  4. Save new credentials securely

### SSL/HTTPS Setup

- [ ] Verify SSL certificate installed (HTTPS active)
- [ ] Test HTTPS redirect works
- [ ] Check browser shows secure padlock icon
- [ ] Verify no mixed content warnings

### Permission Checks

- [ ] Backend `.env` file permissions: `644` or `600`
- [ ] Uploads folder writable: `755`
- [ ] Verify files not publicly downloadable

---

## 📊 Performance & Monitoring

### Performance Checks

- [ ] Run Google PageSpeed Insights
- [ ] Test page load time < 3 seconds
- [ ] Check API response time < 500ms
- [ ] Verify images optimized (WebP format)

### Setup Monitoring

- [ ] Setup error logging (check server logs)
- [ ] Monitor API response times
- [ ] Setup database backup schedule (daily/weekly)
- [ ] Document backup location

---

## 📝 Credentials Documentation

**Save these credentials securely:**

```
=== HOSTING CREDENTIALS ===
cPanel URL: _____________________________
Username: _______________________________
Password: _______________________________

=== DATABASE ===
Host: localhost
Port: 3306
Name: dbpromoze
User: dbpromoze
Pass: Alanwalker009#

=== ADMIN LOGIN ===
URL: https://yourdomain.com/ze-admin-portal-2025
Username: admin
Password: _____________ (CHANGED from default!)

=== BACKEND ENV ===
JWT_SECRET: _________________________ (32+ chars)
CORS_ORIGIN: https://yourdomain.com

=== FTP/SFTP (if needed) ===
Host: _______________________________
Port: _______________________________
Username: ___________________________
Password: ___________________________
```

---

## 🆘 Troubleshooting Guide

### Issue: Routes return 404 (Page Not Found) ⚠️ MOST COMMON

**Symptoms**:

- Homepage works: `https://promo.zonaenglish.id/` ✅
- Admin login 404: `https://promo.zonaenglish.id/ze-admin-portal-2025` ❌
- Other routes 404: `/promo-center`, `/articles` ❌

**Root Cause**:
This is a **Single Page Application (SPA)** with React Router. Server needs `.htaccess` to redirect all requests to `index.html` for client-side routing.

**Solution**:

1. **Upload `.htaccess` file**

   - Source: `c:\Projek\zonaenglis-landingpage\.htaccess`
   - Destination: `public_html/.htaccess`
   - Enable "Show Hidden Files" in cPanel File Manager

2. **Verify `.htaccess` contains**:

   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

3. **If still 404**, use alternative:

   - File: `.htaccess.alternative`
   - Or add: `ErrorDocument 404 /index.html`

4. **Contact Exabytes support**:

   - WhatsApp: +62 21 3000 0830
   - Request: Enable `mod_rewrite` & `AllowOverride All`

5. **Test**: Clear cache (Ctrl+F5), access admin URL

**📖 Complete Guide**: `TROUBLESHOOTING-404-ADMIN.md`

### Issue: API returns CORS error

**Solution**: Update `backend/.env`

```env
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

Then restart Node.js app in cPanel

### Issue: Database connection failed

**Solution**:

1. Check `backend/.env` credentials match database
2. Verify database user has ALL PRIVILEGES
3. Test connection:
   ```bash
   mysql -u dbpromoze -p dbpromoze
   ```

### Issue: Image upload fails

**Solution**:

1. Check `backend/uploads/` folder exists
2. Set permissions: `chmod 755 backend/uploads`
3. Check disk space available

### Issue: Node.js app not running

**Solution**:

1. cPanel → Setup Node.js App → Check logs
2. Common issues:
   - Missing `node_modules` → Run `npm install`
   - Wrong `.env` values → Fix and restart
   - Port conflict → Change PORT in `.env`

### Issue: Admin can't login

**Solution**:

1. Check database imported correctly
2. Verify `admin_users` table has data
3. Reset password if needed (contact developer)

---

## ✅ Final Checklist

Before marking deployment complete:

- [ ] All pages load without errors
- [ ] All features tested and working
- [ ] Admin password changed from default
- [ ] HTTPS active and working
- [ ] Database backup scheduled
- [ ] Monitoring setup
- [ ] Credentials documented and saved
- [ ] Team trained on admin panel
- [ ] Contact developer if issues

---

## 📞 Support Contacts

**Developer**: [Your contact info]
**Hosting Support**: Exabytes support / Your hosting provider
**Emergency**: [Emergency contact]

---

## 📚 Additional Documentation

- **Full Technical Docs**: `TECH-STACK-DEV.md`
- **API Reference**: `docs/API-INTEGRATION-GUIDE.md`
- **Project Structure**: `docs/PROJECT-STRUCTURE.md`

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0 Production Ready

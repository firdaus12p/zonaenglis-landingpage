# 🔒 SECURITY CONFIGURATION GUIDE

## Hidden Admin Login

**Login URL telah diubah untuk keamanan:**

### Development (localhost)

```
http://localhost:5173/ze-admin-portal-2025
```

### Production (setelah deploy)

```
https://yourdomain.com/ze-admin-portal-2025
```

⚠️ **PENTING**: Jangan share URL ini ke publik!

---

## Cara Kerja di Production

### 1. Setup Domain & Hosting

Setelah deploy ke hosting (Vercel/Netlify/VPS), aplikasi akan jalan di domain Anda:

- Frontend: `https://zonaenglish.com`
- Backend: `https://api.zonaenglish.com` atau `https://zonaenglish.com/api`

### 2. Akses Admin Panel

**TIDAK ADA link ke login di website!** Admin harus tahu URL rahasia:

```
https://zonaenglish.com/ze-admin-portal-2025
```

**Cara kerja:**

1. Admin ketik URL manual di browser
2. Masukkan email & password
3. JWT token disimpan di localStorage
4. Token valid 7 hari
5. Setelah login → redirect ke dashboard

### 3. Security Features

✅ **Hidden Login Page**

- Route: `/ze-admin-portal-2025` (tidak ada link, hanya direct URL)
- Tidak bisa ditemukan lewat site navigation
- Hacker tidak tahu cara masuk

✅ **Admin Routes Protection** (NEW!)

- Jika user belum login coba akses `/admin/*` → redirect ke HOME (bukan ke login)
- Ini menyembunyikan URL login dari unauthorized users
- User yang sudah login bisa akses admin panel normal

✅ **Rate Limiting** (NEW!)

- Max 5 failed login attempts
- Lockout 15 menit setelah 5x gagal
- Mencegah brute force attack
- Per IP address tracking

✅ **JWT Authentication**

- Token expires in 7 days
- Token verification on every request
- Secure HTTP-only recommended for production

✅ **Role-Based Access Control**

- Protected routes require authentication
- Role check: `admin` or `super_admin`
- Auto redirect jika unauthorized

✅ **Password Security**

- bcrypt hashing (10 rounds)
- No plaintext passwords stored
- Secure comparison

---

## Production Environment Setup

### Backend (.env)

```env
# Database (Production)
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=zona_english_user
DB_PASS=strong_password_here
DB_NAME=zona_english_admin

# JWT Secret (WAJIB GANTI!)
JWT_SECRET=generate-random-64-char-string-here

# CORS (sesuaikan dengan domain Anda)
CORS_ORIGIN=https://zonaenglish.com,https://www.zonaenglish.com

# Server
PORT=3001
NODE_ENV=production
```

### Frontend (Vite Environment)

Buat file `.env.production`:

```env
VITE_API_BASE_URL=https://api.zonaenglish.com
```

Update API calls di frontend:

```typescript
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
```

---

## Deployment Checklist

### 1. Sebelum Deploy

- [ ] Ganti JWT_SECRET di `.env`
- [ ] Update CORS_ORIGIN dengan domain production
- [ ] Ganti database credentials
- [ ] Hapus console.log sensitive info (jika ada)
- [ ] Build frontend: `npm run build`
- [ ] Test login di localhost

### 2. Deploy Frontend (Vercel/Netlify)

**Vercel:**

```bash
npm install -g vercel
vercel --prod
```

**Environment Variables di Vercel:**

- `VITE_API_BASE_URL` = `https://api.zonaenglish.com`

**Netlify:**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### 3. Deploy Backend (VPS/Railway/Render)

**Railway:**

```bash
railway login
railway up
```

**Render:**

- Connect GitHub repo
- Set environment variables dari `.env.example`
- Deploy

**VPS (Ubuntu):**

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup PM2
sudo npm install -g pm2
cd backend
npm install --production
pm2 start server.js --name zona-english-api
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure nginx to proxy port 3001
```

### 4. Database Migration

```bash
# Export dari local
mysqldump -u root -p zona_english_admin > backup.sql

# Import ke production
mysql -h production-host -u user -p zona_english_admin < backup.sql
```

---

## Cara Login di Production

### Untuk Admin:

1. **Bookmark URL login:**

   ```
   https://zonaenglish.com/ze-admin-portal-2025
   ```

2. **Login dengan credentials:**

   - Email: `admin@zonaenglish.com`
   - Password: (ganti di production!)

3. **Setelah login berhasil:**

   - Token disimpan di browser
   - Valid 7 hari
   - Auto redirect ke `/admin/dashboard`

4. **Jika lupa logout:**
   - Token expire otomatis setelah 7 hari
   - Atau clear localStorage manual

### Mengganti Password Production:

```bash
# Di backend server
node backend/db/update-admin-password.js
```

Atau via database langsung:

```sql
UPDATE admin_users
SET password_hash = '$2a$10$your_new_bcrypt_hash_here'
WHERE email = 'admin@zonaenglish.com';
```

Generate bcrypt hash:

```javascript
const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("new_password", 10);
console.log(hash);
```

---

## Security Best Practices

### 1. URL Rahasia

- ✅ Jangan share di WhatsApp/Email
- ✅ Simpan di password manager
- ✅ Bookmark di browser pribadi
- ❌ Jangan commit di Git
- ❌ Jangan screenshot dengan URL visible

### 2. Ganti URL Jika Terekspos

Jika URL login bocor, ganti di 2 tempat:

**Frontend** (`src/App.tsx`):

```tsx
<Route path="/your-new-secret-url-2025" element={<Login />} />
```

**Frontend** (`src/components/ProtectedRoute.tsx`):

```tsx
return (
  <Navigate to="/your-new-secret-url-2025" state={{ from: location }} replace />
);
```

Rebuild & redeploy.

### 3. Monitor Failed Logins

Check logs untuk suspicious activity:

```bash
# Di backend
pm2 logs zona-english-api | grep "401"
```

### 4. Additional Security (Optional)

**Tambah IP Whitelist** di backend:

```javascript
// backend/routes/auth.js
const ALLOWED_IPS = ["123.45.67.89", "98.76.54.32"];

router.post("/login", (req, res) => {
  const clientIp = req.ip;
  if (!ALLOWED_IPS.includes(clientIp)) {
    return res.status(403).json({ message: "Access denied" });
  }
  // ... rest of login logic
});
```

**Enable HTTPS** (wajib di production):

- Use Cloudflare SSL
- Or Let's Encrypt
- Redirect HTTP → HTTPS

---

## Troubleshooting

### "Cannot access login page"

✅ Pastikan URL benar: `/ze-admin-portal-2025`
✅ Check CORS settings di backend
✅ Check browser console for errors

### "Too many login attempts"

✅ Wait 15 minutes
✅ Or restart backend server (clears rate limit)
✅ Check IP not in lockout: `loginAttempts.get(your_ip)`

### "Token expired"

✅ Login ulang
✅ Token hanya valid 7 hari
✅ Normal behavior

### "CORS error"

✅ Update CORS_ORIGIN di backend `.env`
✅ Include production domain
✅ Restart backend after change

---

## Summary

🔒 **Security Stack:**

1. Hidden login URL (no public links)
2. Rate limiting (5 attempts / 15 min)
3. JWT authentication (7 day expiry)
4. bcrypt password hashing
5. Role-based access control
6. IP tracking per attempt

📝 **Admin Access:**

- URL: `https://zonaenglish.com/ze-admin-portal-2025`
- Bookmark this URL privately
- Don't share publicly
- Change password in production

🚀 **Production Ready:**

- Environment variables configured
- CORS properly set
- Database secured
- HTTPS recommended
- Monitoring enabled

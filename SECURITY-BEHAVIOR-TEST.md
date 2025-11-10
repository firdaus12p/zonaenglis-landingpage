# 🔐 SECURITY BEHAVIOR TEST

## Cara Kerja Penyembunyian Admin

### Skenario 1: User Belum Login Coba Akses Admin

**URL yang dicoba:**

```
http://localhost:5173/admin
http://localhost:5173/admin/dashboard
http://localhost:5173/admin/ambassadors
```

**Yang terjadi:**

```
✅ Redirect otomatis ke: http://localhost:5173/
❌ TIDAK redirect ke login page
❌ URL login TIDAK terekspos
```

**Kenapa?**

- User unauthorized tidak boleh tahu URL login
- Redirect ke home membuat admin panel "tidak terlihat"
- Tampak seperti halaman tidak ada (404 dari perspektif user)

---

### Skenario 2: User Sudah Login (Punya Token Valid)

**URL yang dicoba:**

```
http://localhost:5173/admin
http://localhost:5173/admin/dashboard
```

**Yang terjadi:**

```
✅ Admin panel terbuka normal
✅ Bisa akses semua fitur admin
✅ Token valid diverifikasi
```

---

### Skenario 3: Hacker Mencari Login Page

**Percobaan Hacker:**

```
http://localhost:5173/login          → 404 Not Found
http://localhost:5173/admin          → Redirect ke Home
http://localhost:5173/admin-login    → 404 Not Found
http://localhost:5173/administrator  → 404 Not Found
```

**Hasil:**

```
❌ Tidak menemukan login page
❌ Tidak tahu cara akses admin
✅ Security by obscurity berhasil
```

---

### Skenario 4: Admin Yang Tahu URL

**URL rahasia:**

```
http://localhost:5173/ze-admin-portal-2025
```

**Yang terjadi:**

```
✅ Login page muncul
✅ Form login terlihat
✅ Bisa login dengan email & password
✅ Redirect ke /admin/dashboard setelah berhasil
```

---

## Flow Chart

```
┌─────────────────────────────┐
│ User coba akses /admin      │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Punya token? │
    └──┬───────┬───┘
       │       │
   YES │       │ NO
       │       │
       ▼       ▼
┌──────────┐  ┌─────────────────┐
│Dashboard │  │ Redirect ke "/"  │
│  Panel   │  │ (HOME PAGE)      │
└──────────┘  └─────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ User bingung  │
              │ Admin dimana? │
              └───────────────┘
                      │
                      ▼
              ❌ Tidak tahu!
```

---

## Testing Steps

### Test 1: Coba Akses Admin Tanpa Login

1. Buka browser baru (incognito)
2. Go to: `http://localhost:5173/admin`
3. **Expected**: Redirect ke `http://localhost:5173/`
4. **NOT Expected**: Tidak muncul login page

### Test 2: Coba Akses Login Yang Lama

1. Go to: `http://localhost:5173/login`
2. **Expected**: 404 Not Found
3. **Confirm**: Route sudah dihapus

### Test 3: Akses Login URL Rahasia

1. Go to: `http://localhost:5173/ze-admin-portal-2025`
2. **Expected**: Login page muncul
3. **Confirm**: URL rahasia bekerja

### Test 4: Login & Akses Admin

1. Login di URL rahasia
2. Go to: `http://localhost:5173/admin/dashboard`
3. **Expected**: Dashboard terbuka
4. **Confirm**: Token valid, akses granted

### Test 5: Rate Limiting

1. Login dengan password salah 5x
2. Coba login ke-6
3. **Expected**: "Terlalu banyak percobaan..."
4. **Confirm**: Lockout 15 menit aktif

---

## Security Checklist

- [x] Route `/login` sudah dihapus
- [x] Route `/ze-admin-portal-2025` aktif (tersembunyi)
- [x] Unauthorized access ke `/admin/*` → redirect HOME
- [x] Authorized access ke `/admin/*` → works normal
- [x] Rate limiting aktif (5 attempts)
- [x] JWT token validation works
- [x] No credentials exposed di UI
- [x] CORS configured properly

---

## Production Notes

Di production dengan domain `zonaenglish.com`:

**URL Yang Harus Dirahasiakan:**

```
https://zonaenglish.com/ze-admin-portal-2025
```

**URL Yang Aman Dipublic:**

```
https://zonaenglish.com/            ← Home
https://zonaenglish.com/articles    ← Blog
https://zonaenglish.com/promo-hub   ← Public
```

**URL Yang Redirect ke Home (Jika Belum Login):**

```
https://zonaenglish.com/admin       ← Redirect to /
https://zonaenglish.com/admin/*     ← Redirect to /
```

Dengan cara ini, admin panel **benar-benar tersembunyi** dari public!

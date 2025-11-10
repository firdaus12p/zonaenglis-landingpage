# 🔐 ADMIN QUICK REFERENCE

## Login URL (RAHASIA - Jangan Share!)

### Development (Local)

```
http://localhost:5173/ze-admin-portal-2025
```

### Production (Setelah Deploy)

```
https://zonaenglish.com/ze-admin-portal-2025
```

⚠️ **Simpan URL ini di bookmark pribadi!**

---

## Default Credentials (GANTI DI PRODUCTION!)

**Email:** `admin@zonaenglish.com`  
**Password:** `admin123`

⚠️ **WAJIB ganti password setelah deploy production!**

---

## Fitur Keamanan Aktif

✅ **Hidden Login Page**

- Tidak ada link di website
- Hanya bisa diakses via URL langsung
- Hacker tidak tahu cara masuk

✅ **Rate Limiting**

- Max 5 kali login gagal
- Lockout 15 menit setelah limit
- Auto reset setelah lockout expired

✅ **Token Authentication**

- JWT token valid 7 hari
- Auto logout setelah expired
- Disimpan aman di browser

---

## Cara Login

1. Buka URL login (bookmark)
2. Masukkan email & password
3. Klik "Masuk"
4. Redirect otomatis ke dashboard

## Cara Logout

1. Klik nama Anda di pojok kanan atas
2. Pilih "Logout"
3. Atau hapus localStorage browser

---

## Troubleshooting

**"Too many attempts"**
→ Tunggu 15 menit atau hubungi developer

**"Token expired"**
→ Login ulang (normal setelah 7 hari)

**"Cannot access page"**
→ Pastikan URL login benar

---

## Contact Support

Developer: [Your Contact]
Emergency: [Emergency Number]

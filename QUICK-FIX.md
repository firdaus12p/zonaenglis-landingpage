# 🚀 QUICK FIX - Badge Feature Migration

## ❌ Error Yang Anda Alami

```
❌ Error getting unread counts: Error: Unknown column 'last_viewed_at' in 'field list'
```

**Penyebab**: Database belum punya kolom `last_viewed_at` yang dibutuhkan untuk badge feature.

---

## ✅ SOLUSI TERCEPAT (Pilih Salah Satu)

### **Metode 1: Menggunakan Node.js (RECOMMENDED)** ⭐

Paling mudah dan otomatis!

```powershell
cd c:\Projek\zonaenglis-landingpage\backend
npm run migrate
```

**Output yang diharapkan:**

```
================================================
  DATABASE MIGRATION - Badge Feature
================================================

📄 Reading migration file...
📝 Found 2 SQL statements

⚙️  Executing statement 1/2...
✅ Statement 1 completed
⚙️  Executing statement 2/2...
✅ Statement 2 completed

✅ Migration completed successfully!

🔍 Verifying migration...
✅ Column "last_viewed_at" verified!
✅ Index "idx_last_viewed" verified!

================================================
  ✅ MIGRATION SUCCESSFUL!
================================================
```

Setelah berhasil:

1. **RESTART backend server** (Ctrl+C lalu `npm run dev`)
2. Error akan hilang!

---

### **Metode 2: Menggunakan PowerShell**

```powershell
cd c:\Projek\zonaenglis-landingpage\backend
.\run-migration.ps1
```

---

### **Metode 3: Menggunakan MySQL Command Line**

```powershell
cd c:\Projek\zonaenglis-landingpage
mysql -u root -p zona_english_admin < backend/migrations/add_last_viewed_to_ambassadors.sql
```

Masukkan password MySQL saat diminta.

---

### **Metode 4: Menggunakan phpMyAdmin (Manual)**

1. Buka phpMyAdmin
2. Pilih database `zona_english_admin`
3. Klik tab **SQL**
4. Copy-paste script ini:

```sql
ALTER TABLE ambassadors
ADD COLUMN last_viewed_at TIMESTAMP NULL DEFAULT NULL
COMMENT 'When admin last viewed this ambassador in affiliate tracking dashboard';

CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);
```

5. Klik **Go** atau **Execute**

---

## 🔄 Setelah Migration Selesai

### **1. Restart Backend Server**

Di terminal backend:

```powershell
# Tekan Ctrl+C untuk stop server
npm run dev
```

### **2. Verifikasi Error Hilang**

Buka browser dan akses admin dashboard:

```
http://localhost:5173/admin/ambassadors
```

Buka Console (F12). **Seharusnya TIDAK ADA error lagi!**

Console akan menampilkan:

```
📊 Ambassador ID 1: 0 unread leads (last_viewed: never)
📊 Ambassador ID 2: 0 unread leads (last_viewed: never)
✅ Final unread counts: {1: 0, 2: 0}
```

### **3. Test Badge Feature**

1. Buka frontend: `http://localhost:5173`
2. Gunakan affiliate code (misal: `MAYA2024`)
3. Buka admin dashboard
4. Badge 🔴 seharusnya muncul di dropdown!

---

## ⚠️ Jika Masih Error

### Error: "Column already exists"

Itu artinya migration sudah pernah dijalankan. **Error Anda seharusnya sudah hilang!**

Restart backend server:

```powershell
# Ctrl+C
npm run dev
```

### Error: "Access denied"

Password MySQL salah. Cek file `.env`:

```
DB_PASSWORD=your_mysql_password
```

### Error: "Database not found"

Database belum dibuat. Buat dulu:

```sql
CREATE DATABASE zona_english_admin;
```

---

## 📋 Checklist

- [ ] Jalankan migration (pilih salah satu metode di atas)
- [ ] Lihat pesan "✅ MIGRATION SUCCESSFUL!"
- [ ] Restart backend server
- [ ] Buka admin dashboard
- [ ] Cek console - tidak ada error "Unknown column"
- [ ] Test badge feature

---

## 🆘 Need Help?

Jika masih bermasalah setelah mengikuti langkah di atas:

1. Screenshot error message
2. Screenshot output dari migration script
3. Check apakah file `.env` sudah benar
4. Pastikan MySQL server berjalan

---

## 🎯 Yang Harus Anda Lakukan SEKARANG

```powershell
# 1. Masuk ke folder backend
cd c:\Projek\zonaenglis-landingpage\backend

# 2. Jalankan migration
npm run migrate

# 3. Tunggu sampai selesai (lihat pesan ✅ MIGRATION SUCCESSFUL!)

# 4. Restart backend server
# Tekan Ctrl+C di terminal backend yang sedang running
# Lalu jalankan lagi:
npm run dev
```

**DONE!** Error akan hilang dan badge feature akan berfungsi! 🎉

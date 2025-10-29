# Migration Instructions - Unread Badge Feature

## Database Migration Required

Sebelum menjalankan aplikasi, Anda perlu menjalankan migration SQL untuk menambahkan kolom `last_viewed_at` ke tabel `ambassadors`.

### Cara Menjalankan Migration:

1. **Buka MySQL/phpMyAdmin atau MySQL Command Line**

2. **Pilih Database `zona_english_admin`**

   ```sql
   USE zona_english_admin;
   ```

3. **Jalankan Migration File**

   **Option A - Via MySQL Command Line:**

   ```bash
   mysql -u root -p zona_english_admin < backend/migrations/add_last_viewed_to_ambassadors.sql
   ```

   **Option B - Copy-Paste di phpMyAdmin/MySQL Workbench:**
   Buka file `backend/migrations/add_last_viewed_to_ambassadors.sql` dan jalankan query-nya:

   ```sql
   ALTER TABLE ambassadors
   ADD COLUMN last_viewed_at TIMESTAMP NULL DEFAULT NULL
   COMMENT 'When admin last viewed this ambassador in affiliate tracking dashboard';

   CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);
   ```

4. **Verifikasi Migration Berhasil**

   ```sql
   DESCRIBE ambassadors;
   ```

   Pastikan kolom `last_viewed_at` muncul di daftar kolom.

5. **Restart Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

6. **Test Feature**
   - Buka http://localhost:5173/admin/ambassadors
   - Lihat dropdown Ambassador Selector
   - Jika ada ambassador dengan leads, akan muncul badge 🔴 dengan angka
   - Pilih ambassador tersebut
   - Badge akan hilang setelah dipilih
   - Jika ada user baru yang menggunakan kode, badge akan muncul lagi

## Troubleshooting

### Error: Column 'last_viewed_at' already exists

Migration sudah pernah dijalankan sebelumnya. Skip langkah ini.

### Error: Table 'ambassadors' doesn't exist

Pastikan Anda sudah membuat tabel ambassadors sebelumnya.

### Badge tidak muncul

1. Pastikan migration sudah dijalankan
2. Restart backend server
3. Clear browser cache
4. Check console untuk error messages

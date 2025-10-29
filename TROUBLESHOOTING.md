# Panduan Perbaikan - 2 Masalah Utama

## Masalah 1: Modal Form Masih Muncul Setelah Modal Sukses

### Yang Sudah Diperbaiki:

1. **Penundaan Modal Transisi** - Menambahkan delay 100ms antara menutup form modal dan membuka success modal untuk memastikan transisi yang smooth
2. **Enhanced Logging** - Menambahkan console.log di setiap langkah untuk debugging

### Cara Menguji:

1. Buka browser Console (F12 → Console tab)
2. Masukkan affiliate code
3. Klik "Gunakan Kode"
4. Isi form dan klik "Lanjutkan"
5. Perhatikan console log:
   ```
   ✅ User data saved: {...}
   🔄 Closing form modal...
   ✅ Showing success modal...
   🔄 Closing success modal...
   🔄 Starting validation...
   ```

### Yang Seharusnya Terjadi:

1. ✅ Form modal **langsung hilang** setelah klik "Lanjutkan"
2. ✅ Success modal **muncul** 100ms kemudian
3. ✅ Success modal **hilang otomatis** setelah 3 detik
4. ✅ Validasi kode **dimulai otomatis**
5. ✅ Form modal **TIDAK muncul lagi**

### Jika Masih Bermasalah:

Cek console log. Jika ada error atau pesan yang tidak sesuai urutan, screenshot dan laporkan.

---

## Masalah 2: Badge Tidak Muncul (Code Usage Tidak Terdeteksi)

### Penyebab Kemungkinan:

#### A. Database Migration Belum Dijalankan ⚠️ **PALING MUNGKIN**

**Cek apakah kolom `last_viewed_at` ada:**

```bash
# Windows PowerShell
cd c:\Projek\zonaenglis-landingpage
mysql -u root -p zona_english_admin < backend/migrations/verify_database.sql
```

**Atau buka phpMyAdmin/MySQL Workbench dan jalankan:**

```sql
SHOW COLUMNS FROM ambassadors LIKE 'last_viewed_at';
```

**Jika kolom TIDAK ADA:**

```bash
# Jalankan migration ini:
mysql -u root -p zona_english_admin < backend/migrations/add_last_viewed_to_ambassadors.sql
```

**Atau jalankan manual di phpMyAdmin:**

```sql
ALTER TABLE ambassadors
ADD COLUMN last_viewed_at TIMESTAMP NULL DEFAULT NULL
COMMENT 'When admin last viewed this ambassador in affiliate tracking dashboard';

CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);
```

#### B. Backend Tidak Berjalan atau Error

**Pastikan backend server berjalan:**

```bash
cd c:\Projek\zonaenglis-landingpage\backend
npm run dev
```

Server harus berjalan di: `http://localhost:3001`

**Cek console backend untuk log seperti ini:**

```
📝 Inserting affiliate usage record...
📝 Ambassador ID: 3
📝 Ambassador Name: Maya Sari
📝 Affiliate Code: MAYA2024
✅ Affiliate usage tracked: ID 123, User: John Doe, Code: MAYA2024, Ambassador ID: 3
✅ This should now appear in admin dashboard for ambassador: Maya Sari
```

Jika tidak ada log ini setelah menggunakan code, berarti tracking gagal.

#### C. Frontend Tidak Mengirim Request

**Buka browser Console saat menggunakan code:**

Seharusnya ada log seperti ini:

```
📊 Tracking affiliate usage...
📊 Ambassador data: {...}
📊 User data: {...}
📊 Sending track payload: {...}
📊 API endpoint: http://localhost:3001/api/affiliate/track
📊 Track response status: 200
📊 Track response data: {...}
✅ Data berhasil dikirim ke admin dashboard!
✅ Usage ID: 123
```

**Jika ada error 404 atau 500:**

- Backend tidak berjalan atau
- Database connection error atau
- Affiliate code salah/tidak aktif

**Jika ada error 429:**

- Nomor HP sudah digunakan hari ini
- Error modal seharusnya muncul

#### D. Badge Fetch Error di Admin

**Buka Admin Dashboard** (`http://localhost:5173/admin/ambassadors`)

**Buka Console, seharusnya ada:**

```
📊 Ambassador ID 1: 0 unread leads (last_viewed: never)
📊 Ambassador ID 2: 3 unread leads (last_viewed: 2025-10-29 10:00:00)
📊 Ambassador ID 3: 1 unread leads (last_viewed: never)
✅ Final unread counts: {1: 0, 2: 3, 3: 1}
```

**Jika tidak ada log ini:**

- Frontend tidak memanggil `/api/affiliate/unread-counts`
- Atau ada JavaScript error

---

## Langkah-Langkah Debugging Lengkap

### Step 1: Verifikasi Database ✅

```bash
cd c:\Projek\zonaenglis-landingpage
mysql -u root -p zona_english_admin < backend/migrations/verify_database.sql
```

**Expected output dari Query 5:**

```
| id | name       | affiliate_code | last_viewed_at      | unread_count | total_leads |
|----|------------|----------------|---------------------|--------------|-------------|
| 3  | Maya Sari  | MAYA2024      | NULL                | 3            | 3           |
| 1  | John Doe   | JOHN2024      | 2025-10-29 10:00:00 | 0            | 5           |
```

### Step 2: Restart Backend Server

```bash
cd backend
# Ctrl+C untuk stop server yang lama
npm run dev
```

### Step 3: Restart Frontend

```bash
cd ..  # kembali ke root
npm run dev
```

### Step 4: Clear Browser Cache & Storage

1. Buka browser Console (F12)
2. Jalankan:
   ```javascript
   sessionStorage.clear();
   localStorage.clear();
   ```
3. Reload page (Ctrl+R)

### Step 5: Test Complete Flow

**A. Test Tracking (Frontend):**

1. Buka: `http://localhost:5173`
2. Buka Console (F12 → Console)
3. Pilih promo card
4. Masukkan code: `MAYA2024` (atau code lain yang valid)
5. Klik "Gunakan Kode"
6. Isi form dengan data baru:
   - Nama: "Test User"
   - Phone: "081234567890" (nomor yang BELUM pernah digunakan)
   - Email: "test@example.com"
7. Klik "Lanjutkan"

**Console seharusnya menampilkan:**

```
✅ User data saved: {...}
🔄 Closing form modal...
✅ Showing success modal...
📊 Tracking affiliate usage...
📊 Ambassador data: {...}
📊 User data: {...}
📊 Sending track payload: {...}
✅ Data berhasil dikirim ke admin dashboard!
✅ Usage ID: 123
🔄 Closing success modal...
```

**Backend console seharusnya menampilkan:**

```
📝 Inserting affiliate usage record...
📝 Ambassador ID: 3
📝 Ambassador Name: Maya Sari
✅ Affiliate usage tracked: ID 123, User: Test User, Code: MAYA2024, Ambassador ID: 3
```

**B. Test Badge (Admin Dashboard):**

1. Buka: `http://localhost:5173/admin/ambassadors`
2. Buka Console
3. Scroll ke "Affiliate Tracking Dashboard"
4. Lihat dropdown "Pilih Ambassador"

**Console seharusnya menampilkan:**

```
📊 Ambassador ID 3: 1 unread leads (last_viewed: never)
✅ Final unread counts: {3: 1}
```

**Dropdown seharusnya menampilkan:**

```
Maya Sari (MAYA2024) 🔴 1 baru
```

5. Klik dropdown dan pilih "Maya Sari"
6. Badge seharusnya **hilang** (berubah jadi "Maya Sari (MAYA2024)")
7. Leads table seharusnya menampilkan "Test User"

---

## Checklist Perbaikan

### Modal Flow Fix ✅

- [x] Menambahkan 100ms delay untuk transisi modal
- [x] Menambahkan logging di setiap step
- [x] Form modal menutup sebelum success modal muncul
- [x] Success modal auto-close setelah 3 detik

### Badge Detection Fix ✅

- [x] Enhanced logging di frontend tracking
- [x] Enhanced logging di backend tracking
- [x] Enhanced logging di unread-counts endpoint
- [x] Database verification script dibuat
- [ ] **DATABASE MIGRATION HARUS DIJALANKAN USER**

---

## Jika Masih Bermasalah

### Untuk Modal Issue:

Kirim screenshot/video yang menunjukkan:

1. Console log dari F12
2. Urutan modal yang muncul
3. Timestamp setiap modal

### Untuk Badge Issue:

Kirim informasi berikut:

**1. Hasil verify_database.sql:**

```bash
mysql -u root -p zona_english_admin < backend/migrations/verify_database.sql > debug_output.txt
```

**2. Backend console log** setelah menggunakan code

**3. Frontend console log** setelah menggunakan code

**4. Admin console log** setelah membuka admin dashboard

**5. Screenshot dropdown** di Affiliate Tracking Dashboard

---

## Quick Test Script

Jalankan ini di browser console untuk test lengkap:

```javascript
// Clear storage
sessionStorage.clear();
localStorage.clear();

// Check if backend is running
fetch("http://localhost:3001/api/affiliate/unread-counts")
  .then((r) => r.json())
  .then((data) => console.log("✅ Backend OK:", data))
  .catch((e) => console.error("❌ Backend Error:", e));

// Check frontend state
console.log("Current page:", window.location.href);
console.log("Session storage:", sessionStorage);
```

---

## Kontak Debug

Jika setelah mengikuti semua langkah di atas masih bermasalah, siapkan:

1. Screenshot console logs (frontend + backend)
2. Output dari verify_database.sql
3. Video screen recording singkat yang menunjukkan masalahnya

Ini akan sangat membantu untuk diagnosa lebih lanjut.

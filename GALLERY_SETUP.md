# Instruksi Setup Galeri Kegiatan

## 1. Database Migration

Jalankan SQL migration untuk membuat tabel `gallery`:

```sql
-- Buka phpMyAdmin atau MySQL client
-- Pilih database: zona_english_admin
-- Jalankan query dari file: backend/migrations/create_gallery_table.sql
```

Atau jalankan langsung di phpMyAdmin:

```sql
CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT 'Judul/caption foto',
  image_url TEXT NOT NULL COMMENT 'URL atau path foto',
  category ENUM('Kids', 'Teens', 'Intensive') NOT NULL COMMENT 'Kategori program',
  description TEXT COMMENT 'Deskripsi tambahan (opsional)',
  order_index INT DEFAULT 0 COMMENT 'Urutan tampil (semakin kecil semakin di depan)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 2. Backend Server

Backend sudah otomatis include route gallery setelah restart:

- GET /api/gallery (ambil semua galeri)
- GET /api/gallery?category=Kids (filter by kategori)
- POST /api/gallery (upload foto baru dengan multipart/form-data)
- PUT /api/gallery/:id (update foto)
- DELETE /api/gallery/:id (hapus foto dan file)

## 3. Frontend Access

### Admin Panel:

Akses halaman admin gallery di: **http://localhost:5173/admin/gallery**

Menu "Galeri Kegiatan" tersedia di sidebar admin.

### Public Display:

Galeri otomatis muncul di: **http://localhost:5173/promo-center**

## 4. Cara Menggunakan

### Upload Galeri Baru:

1. Login sebagai admin
2. Klik menu "Galeri Kegiatan" di sidebar
3. Klik tombol "Tambah Galeri"
4. Upload gambar (max 5MB, format: PNG, JPG, GIF, WEBP)
5. Isi judul dan pilih kategori (Kids/Teens/Intensive)
6. Opsional: isi deskripsi dan atur urutan tampil
7. Klik "Tambah"

### Edit Galeri:

1. Hover pada foto di grid
2. Klik icon Edit (pensil biru)
3. Update data yang diperlukan
4. Klik "Simpan"

### Hapus Galeri:

1. Hover pada foto di grid
2. Klik icon Trash (sampah merah)
3. Konfirmasi penghapusan

### Preview Galeri:

1. Hover pada foto di grid
2. Klik icon Eye untuk preview fullscreen

## 5. Fitur Galeri Kegiatan

✅ Upload foto dengan drag & drop
✅ Kategori terpisah: Kids, Teens, Intensive
✅ Filter dan search
✅ Preview gambar fullscreen
✅ Urutan custom (order_index)
✅ Image optimization (max 5MB)
✅ Auto grouping by category di PromoCenter
✅ Loading state dan empty state
✅ Responsive design

## 6. Testing

1. Pastikan backend running di port 3001
2. Pastikan frontend running di port 5173
3. Login sebagai admin
4. Buka /admin/gallery
5. Upload beberapa foto untuk kategori Kids, Teens, dan Intensive
6. Buka /promo-center untuk melihat galeri di halaman public

## 7. Struktur File Baru

```
backend/
├── migrations/
│   └── create_gallery_table.sql       [✅ Created]
├── routes/
│   └── gallery.js                     [✅ Created]
├── uploads/
│   └── gallery/                       [Auto-created]
└── server.js                          [✅ Updated]

src/
├── pages/
│   └── admin/
│       └── Gallery.tsx                [✅ Created]
├── components/
│   └── layout/
│       └── AdminLayout.tsx            [✅ Updated]
├── App.tsx                            [✅ Updated]
└── PromoCenter.tsx                    [✅ Updated]
```

## 8. API Endpoints

### GET /api/gallery

Response:

```json
[
  {
    "id": 1,
    "title": "Kegiatan Fun Learning",
    "image_url": "/uploads/gallery/image-1699999999999-123456789.jpg",
    "category": "Kids",
    "description": "Kegiatan belajar sambil bermain",
    "order_index": 0,
    "created_at": "2025-11-08T10:00:00.000Z",
    "updated_at": "2025-11-08T10:00:00.000Z"
  }
]
```

### POST /api/gallery

Request (multipart/form-data):

- image: File (required)
- title: String (required)
- category: "Kids" | "Teens" | "Intensive" (required)
- description: String (optional)
- order_index: Number (optional, default: 0)

### PUT /api/gallery/:id

Request (multipart/form-data):

- image: File (optional)
- title: String (optional)
- category: "Kids" | "Teens" | "Intensive" (optional)
- description: String (optional)
- order_index: Number (optional)

### DELETE /api/gallery/:id

Response:

```json
{
  "success": true,
  "message": "Gallery item deleted successfully"
}
```

## 9. Notes

- Semua upload disimpan di folder `backend/uploads/gallery/`
- File naming: `image-{timestamp}-{random}.{ext}`
- Saat update/delete, file lama otomatis dihapus
- Kategori strict: hanya Kids, Teens, atau Intensive
- Order index: angka kecil tampil lebih dulu

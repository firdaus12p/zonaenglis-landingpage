# Countdown Batch Feature Documentation

## 📋 Overview

**Countdown Batch** adalah fitur untuk mengelola batch kursus dengan countdown timer real-time. Fitur ini memungkinkan admin untuk membuat, mengedit, dan memonitor batch pembelajaran dengan informasi lengkap seperti jadwal, jumlah siswa, dan status batch.

---

## 🎯 Fungsionalitas Utama

### 1. **Dashboard Overview**

- **Statistics Cards**: Menampilkan ringkasan batch
  - Total Batches
  - Active Batches
  - Total Students enrolled
  - Upcoming Batches
- **Live Countdown**: Countdown real-time untuk active batch
- **Batch List**: Grid view semua batch dengan informasi lengkap

### 2. **Real-Time Countdown**

- Countdown timer yang update setiap detik
- Menampilkan: Days, Hours, Minutes, Seconds
- Highlight untuk active batch di bagian atas dashboard
- Visual indicator ketika batch sudah dimulai

### 3. **CRUD Operations**

#### Create New Batch

- Form lengkap dengan validasi
- Required fields: Name, Start Date, Start Time
- Optional fields: Description, Timezone, Target Students, dll
- Auto-redirect ke dashboard setelah berhasil

#### Edit Batch

- Load existing data ke form
- Update semua fields kecuali ID
- Preserve data integrity

#### Delete Batch

- Confirmation dialog sebelum delete
- Permanent delete dari database
- Auto-update statistics

#### Toggle Status (Play/Pause)

- Quick toggle antara Active ↔ Paused
- Single click operation
- Real-time UI update

### 4. **Student Management**

- Track current students vs target
- Visual progress bar dengan color coding:
  - Blue (< 70%)
  - Amber (70-89%)
  - Green (≥ 90%)
- Percentage indicator

### 5. **Status System**

Batch memiliki 4 status:

- **Upcoming** (Default) - Belum dimulai
- **Active** - Sedang berjalan
- **Paused** - Ditunda sementara
- **Completed** - Sudah selesai

### 6. **Visibility Control**

- **Public** - Tampil untuk semua user
- **Private** - Hanya visible untuk admin

---

## 🏗️ Struktur Teknis

### Database Schema

```sql
CREATE TABLE countdown_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  timezone VARCHAR(10) DEFAULT 'WITA',
  description TEXT,
  target_students INT DEFAULT 0,
  current_students INT DEFAULT 0,
  status ENUM('Active', 'Paused', 'Completed', 'Upcoming') DEFAULT 'Upcoming',
  visibility ENUM('Public', 'Private') DEFAULT 'Public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_visibility (visibility)
);
```

### Backend API Endpoints

#### GET `/api/countdown`

**Deskripsi**: Get semua countdown batches  
**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Batch A",
      "start_date": "2025-11-03",
      "start_time": "09:00:00",
      "timezone": "WITA",
      "description": "Program intensif...",
      "target_students": 50,
      "current_students": 32,
      "status": "Active",
      "visibility": "Public",
      "created_at": "2024-10-30T...",
      "updated_at": "2024-10-30T..."
    }
  ],
  "count": 3
}
```

#### GET `/api/countdown/stats`

**Deskripsi**: Get statistics semua batch  
**Response**:

```json
{
  "success": true,
  "data": {
    "total_batches": 3,
    "active_batches": 1,
    "upcoming_batches": 2,
    "completed_batches": 0,
    "paused_batches": 0,
    "total_students": 55,
    "total_target_students": 110
  }
}
```

#### GET `/api/countdown/active`

**Deskripsi**: Get batch yang sedang active  
**Response**: Same as single batch object

#### GET `/api/countdown/:id`

**Deskripsi**: Get batch by ID  
**Parameters**: `id` (integer)  
**Response**: Single batch object

#### POST `/api/countdown`

**Deskripsi**: Create new batch  
**Request Body**:

```json
{
  "name": "Batch C",
  "startDate": "2025-12-01",
  "startTime": "10:00",
  "timezone": "WITA",
  "description": "Description here",
  "targetStudents": 40,
  "currentStudents": 0,
  "status": "Upcoming",
  "visibility": "Public"
}
```

**Response**: Created batch object with ID

#### PUT `/api/countdown/:id`

**Deskripsi**: Update existing batch  
**Parameters**: `id` (integer)  
**Request Body**: Same as POST (all fields optional)  
**Response**: Updated batch object

#### PUT `/api/countdown/:id/toggle-status`

**Deskripsi**: Toggle status Active ↔ Paused  
**Parameters**: `id` (integer)  
**Response**: Updated batch with new status

#### PUT `/api/countdown/:id/students`

**Deskripsi**: Update student count  
**Parameters**: `id` (integer)  
**Request Body**:

```json
{
  "action": "increment" | "decrement" | "set",
  "count": 1
}
```

**Response**: Updated batch object

#### DELETE `/api/countdown/:id`

**Deskripsi**: Delete batch permanently  
**Parameters**: `id` (integer)  
**Response**: Success message

---

## 📁 File Structure

```
backend/
├── db/
│   └── create-countdown-batches-table.js   # Database migration
├── routes/
│   └── countdown.js                         # API routes
└── server.js                                # Register routes

src/
├── pages/
│   └── admin/
│       ├── CountdownBatch.tsx               # Main dashboard
│       └── CountdownBatchForm.tsx           # Create/Edit form
└── App.tsx                                  # Route configuration
```

---

## 🎨 UI Components

### Dashboard (CountdownBatch.tsx)

**Features**:

- 4 statistics cards di header
- Active batch highlight dengan live countdown
- Grid layout responsive (1 col mobile, 2 cols desktop)
- Per-batch countdown display
- Student progress bars
- Action buttons (Toggle, Edit, Delete)
- Loading dan error states

**Key Functions**:

- `fetchBatches()` - Load semua batch dari API
- `fetchStats()` - Load statistics
- `calculateTimeRemaining()` - Hitung countdown
- `toggleBatchStatus()` - Toggle Active/Paused
- `handleDeleteBatch()` - Delete dengan confirmation

### Form (CountdownBatchForm.tsx)

**Features**:

- Multi-section form (Basic Info, Schedule, Students & Status)
- Real-time validation
- Date & Time pickers
- Timezone selector (WIB/WITA/WIT)
- Status & Visibility dropdowns
- Success/Error modals
- Auto-redirect setelah save

**Validation Rules**:

- Name: Required, non-empty
- Start Date: Required
- Start Time: Required
- Target Students: Minimum 1
- Current Students: 0 to targetStudents

---

## 🔄 Cara Kerja Countdown

### Algorithm

```typescript
const calculateTimeRemaining = (batch: CountdownBatch) => {
  // 1. Combine date & time dengan timezone offset
  const targetDate = new Date(`${batch.startDate}T${batch.startTime}:00+08:00`); // WITA = UTC+8

  // 2. Get current time
  const now = currentTime;

  // 3. Calculate difference in milliseconds
  const diff = targetDate.getTime() - now.getTime();

  // 4. Check if expired
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  // 5. Convert milliseconds to days, hours, minutes, seconds
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { expired: false, days, hours, minutes, seconds };
};
```

### Update Mechanism

```typescript
useEffect(() => {
  // Update every 1 second
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  // Cleanup on unmount
  return () => clearInterval(timer);
}, []);
```

---

## 🔐 Security & Validation

### Backend Validation

- ✅ Required field checking
- ✅ ENUM validation (status, visibility)
- ✅ SQL injection protection (parameterized queries)
- ✅ Explicit field selection (no `SELECT *` kecuali necessary)

### Frontend Validation

- ✅ Real-time form validation
- ✅ Type checking dengan TypeScript
- ✅ User confirmation untuk destructive actions
- ✅ Error handling dengan user-friendly messages

---

## 📝 Usage Examples

### Membuat Batch Baru

1. Klik "Create New Batch" button
2. Isi form:
   - Name: "Batch D"
   - Start Date: "2025-11-15"
   - Start Time: "14:00"
   - Timezone: "WITA"
   - Description: "Afternoon intensive class"
   - Target Students: 30
   - Status: "Upcoming"
   - Visibility: "Public"
3. Klik "Create Batch"
4. Auto-redirect ke dashboard

### Toggle Batch Status

1. Di dashboard, cari batch yang ingin di-toggle
2. Klik icon Play/Pause di action buttons
3. Status langsung berubah Active ↔ Paused
4. Stats auto-update

### Edit Batch

1. Klik icon Edit pada batch
2. Form terbuka dengan data existing
3. Ubah field yang diperlukan
4. Klik "Save Changes"
5. Kembali ke dashboard

### Delete Batch

1. Klik icon Trash pada batch
2. Confirm deletion
3. Batch terhapus permanent dari database
4. Stats dan list auto-update

---

## 🎯 Best Practices

### Performance

- ✅ Use `useMemo` untuk expensive calculations jika diperlukan
- ✅ Batch API calls saat load awal
- ✅ Debounce form inputs jika real-time validation berat
- ✅ Clean up timers di `useEffect` cleanup

### UX/UI

- ✅ Loading states untuk semua async operations
- ✅ Error handling dengan friendly messages
- ✅ Confirmation untuk destructive actions
- ✅ Visual feedback untuk user actions
- ✅ Responsive design (mobile-first)

### Code Quality

- ✅ TypeScript untuk type safety
- ✅ Consistent naming conventions
- ✅ Clean code principles (single responsibility)
- ✅ Comments untuk complex logic
- ✅ Error logging untuk debugging

---

## 🐛 Troubleshooting

### Countdown Tidak Update

**Problem**: Timer stuck atau tidak bergerak  
**Solution**:

- Check console untuk errors
- Verify `setInterval` cleanup di `useEffect`
- Ensure `currentTime` state updating

### API Error 500

**Problem**: Server error saat fetch data  
**Solution**:

- Check backend server running (port 3001)
- Verify database connection
- Check backend console logs
- Validate request payload

### Form Validation Gagal

**Problem**: Form tidak submit meski sudah diisi  
**Solution**:

- Check required fields (\*) terisi
- Verify date format (YYYY-MM-DD)
- Verify time format (HH:MM)
- Check console untuk validation errors

### Batch Tidak Muncul

**Problem**: Batch ada di database tapi tidak tampil  
**Solution**:

- Refresh browser
- Check API response di Network tab
- Verify loading state selesai
- Check filter/query parameters

---

## 🚀 Future Enhancements

Potential improvements:

- [ ] Email notifications saat batch akan dimulai
- [ ] Batch capacity auto-close saat penuh
- [ ] Batch history & analytics
- [ ] Export batch data (CSV/PDF)
- [ ] Bulk operations (delete, status change)
- [ ] Advanced filtering & search
- [ ] Batch templates
- [ ] Integration dengan calendar API
- [ ] Mobile app untuk countdown display
- [ ] Webhook notifications

---

## 📞 Support

Jika ada pertanyaan atau issue:

1. Check dokumentasi ini terlebih dahulu
2. Review console logs (browser & backend)
3. Verify database connection
4. Check API dengan Postman/curl
5. Review code di GitHub

---

**Last Updated**: 30 Oktober 2025  
**Version**: 1.0.0  
**Author**: AI Assistant with MCP Serena

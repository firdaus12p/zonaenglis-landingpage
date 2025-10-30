# Permanent Delete Feature - Implementation Documentation

## Overview

Fitur untuk menghapus permanent leads yang sudah ada di Delete History tanpa harus menunggu 3 hari auto-purge.

## Security Features

- **Double Confirmation**: Admin harus melalui 2 konfirmasi sebelum data terhapus permanen
- **Soft-Delete Only**: Hanya data yang sudah di-soft delete (`deleted_at IS NOT NULL`) yang bisa dihapus permanen
- **Validation**: Backend memvalidasi bahwa record sudah dalam status deleted sebelum permanent delete
- **Audit Trail**: Console logging untuk tracking permanent deletions

## Backend Implementation

### Endpoint

```
DELETE /api/affiliate/permanent-delete/:usage_id
```

### Security Validation

```javascript
// Check if record exists
const [existing] = await db.query(
  "SELECT id, user_name, deleted_at FROM affiliate_usage WHERE id = ?",
  [usage_id]
);

// Only allow if already soft-deleted
if (!existing[0].deleted_at) {
  return res.status(400).json({
    error:
      "Cannot permanently delete active records. Please soft-delete first.",
  });
}

// Permanent deletion
await db.query(
  "DELETE FROM affiliate_usage WHERE id = ? AND deleted_at IS NOT NULL",
  [usage_id]
);
```

### Response Format

**Success (200)**

```json
{
  "success": true,
  "message": "Lead permanently deleted from database",
  "deleted_id": 123,
  "deleted_user": "John Doe"
}
```

**Error (400 - Not Soft-Deleted)**

```json
{
  "error": "Cannot permanently delete active records. Please soft-delete first."
}
```

**Error (404 - Not Found)**

```json
{
  "error": "Lead not found"
}
```

**Error (500 - Server Error)**

```json
{
  "error": "Error message"
}
```

### Audit Logging

Console log format:

```
🗑️ PERMANENT DELETE: Lead ID {id} ({name}) permanently removed from database
```

## Frontend Implementation

### Location

`src/pages/admin/Ambassadors.tsx` - Deleted History Tab

### Double Confirmation Flow

1. **First Confirmation**: Warning tentang permanent delete
   - Title: "⚠️ PERMANENT DELETE WARNING"
   - Message: Menampilkan nama lead dan peringatan data tidak bisa dikembalikan
2. **Second Confirmation**: Konfirmasi terakhir
   - Title: "⚠️ KONFIRMASI TERAKHIR"
   - Message: Konfirmasi final dengan instruksi eksplisit

### UI Components

**Delete Button**

```tsx
<button
  onClick={() => handlePermanentDelete(lead.id, lead.user_name)}
  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
  title="PERMANENTLY delete this lead (cannot be undone)"
>
  <Trash2 className="h-3 w-3" />
  <span>Delete Permanent</span>
</button>
```

**Handler Function**

```typescript
const handlePermanentDelete = async (leadId: number, leadName: string) => {
  // First confirmation
  showConfirm(
    "⚠️ PERMANENT DELETE WARNING",
    `Anda akan MENGHAPUS PERMANEN lead "${leadName}" dari database.\n\nData yang sudah dihapus permanen TIDAK BISA dikembalikan!\n\nApakah Anda yakin ingin melanjutkan?`,
    () => {
      // Second confirmation (double confirmation)
      showConfirm(
        "⚠️ KONFIRMASI TERAKHIR",
        `Ini adalah konfirmasi terakhir!\n\nLead "${leadName}" akan dihapus PERMANEN dari database dan TIDAK BISA dikembalikan.\n\nKlik "Ya, Hapus Permanen" untuk melanjutkan.`,
        async () => {
          // API call to permanent delete
          const response = await fetch(
            `http://localhost:3001/api/affiliate/permanent-delete/${leadId}`,
            { method: "DELETE" }
          );

          // Handle success/error with modals
        }
      );
    }
  );
};
```

### Success/Error Handling

- **Success**: Alert modal "Berhasil" dengan pesan sukses
- **Error**: Alert modal "Gagal Hapus Permanen" dengan error message
- **Auto-refresh**: Semua lists (active, lost, deleted) dan stats di-refresh setelah permanent delete

## User Flow

1. Admin navigasi ke Ambassadors page
2. Pilih ambassador dari dropdown
3. Klik tab "Deleted History"
4. Klik tombol "Delete Permanent" pada lead yang ingin dihapus
5. Konfirmasi pertama muncul → Klik "Ya, Lanjutkan"
6. Konfirmasi kedua muncul → Klik "Ya, Hapus Permanen"
7. Data terhapus permanen dari database
8. Success modal muncul
9. Deleted History list ter-refresh otomatis

## Data Integrity

### Before Permanent Delete

- Record exists in `affiliate_usage` table with `deleted_at` timestamp
- User phone number masih terkait dengan record
- Countdown "Days Until Purge" masih berjalan

### After Permanent Delete

- Record **completely removed** from `affiliate_usage` table
- User phone number tersedia untuk digunakan lagi
- Tidak ada backup atau soft delete lagi
- **Data tidak bisa dikembalikan**

## Testing Checklist

- [ ] Backend rejects permanent delete untuk active records (tidak soft-deleted)
- [ ] Backend returns 404 untuk non-existent records
- [ ] Double confirmation dialogs muncul berurutan
- [ ] Permanent delete removes record from database
- [ ] UI refresh setelah successful deletion
- [ ] Success modal muncul dengan pesan yang benar
- [ ] Error handling bekerja untuk failed deletions
- [ ] Console logging menampilkan audit trail
- [ ] User phone number bisa digunakan lagi setelah permanent delete

## Files Modified

### Backend

- `backend/routes/affiliate.js`
  - Added endpoint: `DELETE /api/affiliate/permanent-delete/:usage_id`
  - Security validation for soft-deleted records only
  - Audit logging for permanent deletions

### Frontend

- `src/pages/admin/Ambassadors.tsx`
  - Added `handlePermanentDelete(leadId, leadName)` function
  - Updated Deleted History tab table with permanent delete button
  - Implemented double confirmation flow
  - Added success/error modal integration

## Notes

- Permanent delete berbeda dengan soft delete (yang ada 3-day retention)
- Feature ini hanya tersedia di Deleted History tab
- Active leads dan Lost leads tidak memiliki opsi permanent delete
- Harus soft-delete dulu sebelum bisa permanent delete
- Double confirmation mencegah accidental deletions
- Backend validation mencegah deletion active records via API

## Related Features

- **Soft Delete** (`handleDeleteLead`): Moves lead to Deleted History with 3-day retention
- **Restore** (`handleRestoreLead`): Restores soft-deleted lead back to Active
- **Auto-Purge**: Server-side automatic deletion after 3 days (runs on startup + daily)

---

**Implementation Date**: January 2025  
**Status**: ✅ Complete  
**Breaking Changes**: None (additive feature only)

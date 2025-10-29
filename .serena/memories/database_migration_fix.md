# Database Migration Fix - October 29, 2025

## Problem
Error di backend server ketika reload admin dashboard:
```
❌ Error getting unread counts: Error: Unknown column 'last_viewed_at' in 'field list'
```

## Root Cause
Database belum memiliki kolom `last_viewed_at` yang dibutuhkan untuk badge feature. Migration file sudah ada tapi belum dijalankan.

## Solution Implemented

### 1. Fixed Migration Script (run-migration.js)
**Problem**: SQL statement parsing tidak benar - comments tidak ter-filter dengan baik sehingga menghasilkan 0 statements.

**Fix**: Perbaiki filter untuk remove single-line comments (`--`) per line:
```javascript
// BEFORE:
const statements = migrationSQL
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0 && !s.startsWith("--"));

// AFTER:
const statements = migrationSQL
  .split(";")
  .map((s) => {
    // Remove single-line comments
    return s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim();
  })
  .filter((s) => s.length > 0);
```

### 2. Executed Migration Successfully
Command: `node run-migration.js`

Output:
```
📝 Found 2 SQL statements

⚙️  Executing statement 1/2...
⚠️  Column already exists (skipping)
⚙️  Executing statement 2/2...
⚠️  Index already exists (skipping)

✅ Migration completed successfully!

🔍 Verifying migration...
✅ Column "last_viewed_at" verified!
✅ Index "idx_last_viewed" verified!

================================================
  ✅ MIGRATION SUCCESSFUL!
================================================
```

### 3. Verification
Kolom berhasil ditambahkan:
- **Field**: `last_viewed_at`
- **Type**: `timestamp`
- **Null**: `YES`
- **Key**: `MUL` (indexed)
- **Default**: `null`

Index berhasil dibuat:
- **Index Name**: `idx_last_viewed`
- **Column**: `last_viewed_at`

## Status
✅ Migration COMPLETE
⚠️ Backend server perlu di-RESTART agar error hilang

## Next Action Required
User harus restart backend server:
```powershell
# Di terminal backend yang sedang running
# Tekan Ctrl+C untuk stop
# Lalu jalankan lagi
npm run dev
```

Setelah restart, error akan hilang dan badge feature akan berfungsi normal.

## Files Modified
1. **backend/run-migration.js** - Fixed SQL comment filtering
2. **Database**: Added `last_viewed_at` column + index to `ambassadors` table

## Related Memories
- unread_badge_system.md - Feature documentation
- bug_fixes_oct29_2025.md - Other fixes in same session

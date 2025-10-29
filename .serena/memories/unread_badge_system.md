# Unread Badge Feature - Smart Notification System

## Overview
Implementasi sistem badge "unread" yang hanya menampilkan indikator untuk ambassador dengan leads baru yang belum dilihat admin. Badge otomatis hilang setelah admin melihat ambassador tersebut.

## Konsep Kerja

### Before (Old System)
- Badge menampilkan **total semua penggunaan kode**
- Badge tidak pernah hilang (selalu menampilkan total)
- Admin tidak bisa membedakan leads baru vs leads lama

### After (New System)
- Badge hanya menampilkan **leads yang belum dilihat**
- Badge hilang setelah admin memilih/melihat ambassador
- Jika ada user baru menggunakan kode, badge muncul lagi dengan jumlah baru
- **Angka = jumlah leads baru sejak terakhir dilihat**

## Database Changes

### Migration File
**File**: `backend/migrations/add_last_viewed_to_ambassadors.sql`

```sql
ALTER TABLE ambassadors 
ADD COLUMN last_viewed_at TIMESTAMP NULL DEFAULT NULL 
COMMENT 'When admin last viewed this ambassador in affiliate tracking dashboard';

CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);
```

### New Column Details
- **Name**: `last_viewed_at`
- **Type**: TIMESTAMP NULL
- **Default**: NULL (never viewed)
- **Purpose**: Track when admin last viewed this ambassador's data
- **Index**: Added for performance optimization

## Backend Implementation

### File: `backend/routes/affiliate.js`

#### 1. New Endpoint: Get Unread Counts
```javascript
GET /api/affiliate/unread-counts

Response:
{
  "success": true,
  "unread_counts": {
    "1": 0,    // Ambassador ID 1: no new leads
    "2": 3,    // Ambassador ID 2: 3 new leads
    "3": 1,    // Ambassador ID 3: 1 new lead
    "4": 0,
    "5": 0
  }
}
```

**Logic**:
- For each ambassador, get `last_viewed_at` timestamp
- If `last_viewed_at` is NULL → count ALL leads (never viewed)
- If `last_viewed_at` exists → count only leads created AFTER that timestamp
- Query: `SELECT COUNT(*) FROM affiliate_usage WHERE ambassador_id = ? AND first_used_at > last_viewed_at`

#### 2. New Endpoint: Mark Ambassador as Viewed
```javascript
PUT /api/affiliate/mark-viewed/:ambassador_id

Response:
{
  "success": true,
  "message": "Ambassador marked as viewed",
  "ambassador_id": 3,
  "viewed_at": "2025-10-29T10:30:45.123Z"
}
```

**Logic**:
- Updates `ambassadors.last_viewed_at = NOW()` for the selected ambassador
- All future leads will be compared against this timestamp
- Only leads created AFTER this timestamp will count as "unread"

## Frontend Implementation

### File: `src/pages/admin/Ambassadors.tsx`

#### 1. Changed Data Fetching Strategy

**Before:**
```typescript
// Fetched total_uses from stats endpoint for each ambassador
const counts: Record<number, number> = {};
await Promise.all(
  ambassadors.map(async (ambassador) => {
    const response = await fetch(`/api/affiliate/stats/${ambassador.id}`);
    counts[ambassador.id] = data.stats.total_uses || 0;
  })
);
```

**After:**
```typescript
// Single API call to get unread counts for ALL ambassadors
const response = await fetch("/api/affiliate/unread-counts");
const data = await response.json();
setAmbassadorUsageCounts(data.unread_counts);
```

**Benefits**:
- Reduced API calls (1 call vs N calls)
- Faster performance
- Shows only unread counts

#### 2. Auto-Mark as Viewed

Added new function:
```typescript
const markAmbassadorAsViewed = async (ambassadorId: number) => {
  await fetch(`/api/affiliate/mark-viewed/${ambassadorId}`, {
    method: "PUT",
  });

  // Immediately update local state to 0
  setAmbassadorUsageCounts((prev) => ({
    ...prev,
    [ambassadorId]: 0,
  }));
};
```

Called automatically in useEffect:
```typescript
useEffect(() => {
  if (selectedAmbassador) {
    fetchAffiliateStats(selectedAmbassador);
    fetchAffiliateLeads(selectedAmbassador);
    markAmbassadorAsViewed(selectedAmbassador); // ← NEW
  }
}, [selectedAmbassador]);
```

#### 3. Updated UI Labels

**Dropdown label:**
```tsx
<label>
  Pilih Ambassador
  <span className="ml-2 text-xs text-slate-500">
    (🔴 = leads baru yang belum dilihat)
  </span>
</label>
```

**Dropdown options:**
```tsx
{ambassadors.map((amb) => {
  const usageCount = ambassadorUsageCounts[amb.id] || 0;
  return (
    <option key={amb.id} value={amb.id}>
      {amb.name} ({amb.affiliateCode})
      {usageCount > 0 ? ` 🔴 ${usageCount} baru` : ""}
    </option>
  );
})}
```

## User Flow Example

### Scenario 1: First Time Admin Views Ambassador

1. **Initial State**:
   - Maya Sari has 3 leads in database
   - `last_viewed_at` = NULL (never viewed)
   - Badge shows: "Maya Sari (MAYA2024) 🔴 3 baru"

2. **Admin Clicks Maya Sari**:
   - `markAmbassadorAsViewed(3)` is called
   - Database updated: `last_viewed_at = 2025-10-29 10:00:00`
   - Local state updated: `ambassadorUsageCounts[3] = 0`
   - Badge disappears immediately

3. **New User Applies Code (10:15)**:
   - New lead created: `first_used_at = 2025-10-29 10:15:00`
   - Admin refreshes page or navigates back
   - Unread count query: `WHERE first_used_at > 2025-10-29 10:00:00`
   - Result: 1 lead (the new one)
   - Badge shows: "Maya Sari (MAYA2024) 🔴 1 baru"

### Scenario 2: Multiple New Leads

1. **Current State**:
   - Last viewed: 2025-10-29 09:00:00
   - 5 new leads created between 09:00-10:00
   - Badge shows: "🔴 5 baru"

2. **Admin Views**:
   - Badge disappears
   - `last_viewed_at` updated to 10:00:00

3. **2 More Leads Come In (10:30)**:
   - Badge reappears: "🔴 2 baru"

## Performance Optimizations

### 1. Single API Call for All Counts
Instead of N separate API calls for N ambassadors, use 1 call to `/api/affiliate/unread-counts`

### 2. Database Index
Created index on `last_viewed_at` for faster queries:
```sql
CREATE INDEX idx_last_viewed ON ambassadors(last_viewed_at);
```

### 3. Immediate UI Update
Local state updated immediately when marking as viewed (optimistic update):
```typescript
setAmbassadorUsageCounts((prev) => ({ ...prev, [ambassadorId]: 0 }));
```

## Testing Checklist

- [x] Migration file created
- [x] Backend endpoints implemented (`/unread-counts`, `/mark-viewed/:id`)
- [x] Frontend state management updated
- [x] Auto-mark-as-viewed on ambassador selection
- [x] Badge appears for unread leads
- [x] Badge disappears after viewing
- [x] Badge reappears for new leads
- [x] No TypeScript/JavaScript errors
- [x] UI labels updated to reflect "unread" concept

## Database Schema Update

### Before
```sql
CREATE TABLE ambassadors (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  affiliate_code VARCHAR(20),
  ...
);
```

### After
```sql
CREATE TABLE ambassadors (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  affiliate_code VARCHAR(20),
  ...
  last_viewed_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_last_viewed (last_viewed_at)
);
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/affiliate/unread-counts` | Get unread counts for all ambassadors | `{ unread_counts: { [id]: count } }` |
| PUT | `/api/affiliate/mark-viewed/:id` | Mark ambassador as viewed | `{ success: true, viewed_at: timestamp }` |
| GET | `/api/affiliate/stats/:id` | Get full stats (unchanged) | Stats object |
| GET | `/api/affiliate/leads/:id` | Get leads list (unchanged) | Leads array |

## Future Enhancements

1. **Real-time Updates**: Use WebSocket to push notifications when new leads arrive
2. **Sound/Visual Alert**: Browser notification when new lead comes in
3. **Bulk Mark as Read**: Button to mark all ambassadors as viewed
4. **Filter by Unread**: Quick filter to show only ambassadors with unread leads
5. **Unread Count in Sidebar**: Show total unread count in admin navigation
6. **Auto-refresh**: Periodic polling every 30 seconds for new counts
7. **Read Receipt Log**: Track viewing history for audit purposes

## Migration Instructions

See `MIGRATION_INSTRUCTIONS.md` for step-by-step database migration guide.

## Files Modified

### Backend
- `backend/routes/affiliate.js` - Added 2 new endpoints
- `backend/migrations/add_last_viewed_to_ambassadors.sql` - NEW migration file

### Frontend
- `src/pages/admin/Ambassadors.tsx` - Updated badge logic and data fetching

### Documentation
- `MIGRATION_INSTRUCTIONS.md` - NEW migration guide
- `.serena/memories/unread_badge_system.md` - This documentation

## Benefits Summary

1. **Clear Communication**: Admin sees only NEW leads, not total count
2. **Action-Oriented**: Badge indicates work that needs attention
3. **Auto-Dismiss**: No manual "mark as read" needed
4. **Scalable**: Single API call for all ambassadors
5. **Fast**: Indexed database queries
6. **Intuitive**: Badge behaves like email/notification systems users know
7. **Zero Noise**: No badge spam for old leads already handled

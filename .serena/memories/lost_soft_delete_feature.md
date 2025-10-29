# Lost Leads & Soft Delete Feature

## Overview
Implemented Lost lead tracking and soft delete functionality with 3-day retention policy for the Affiliate Tracking Dashboard in Admin Ambassadors page.

## Features Implemented

### 1. Lost Stats Card
**Location**: `src/pages/admin/Ambassadors.tsx` - Stats Cards Grid

**Implementation**:
- Added `lost: number` field to `AffiliateStats` interface
- Created 6th stats card with red gradient styling
- Icon: `AlertCircle` (Lucide React)
- Color: Red (`from-red-50 to-red-100`, `border-red-200`, `text-red-600`)
- Updated grid: `md:grid-cols-3 lg:grid-cols-6` (responsive layout)

**Display**: Shows count of leads with `follow_up_status = 'lost'` that are NOT deleted

### 2. Tab Navigation System
**Location**: Below stats cards, above leads table

**Three Tabs**:
1. **Active Leads** - Blue accent, shows pending/contacted/converted leads
2. **Lost** - Red accent, shows leads marked as lost
3. **Deleted History** - Gray accent, shows soft-deleted leads

**State Management**:
```typescript
const [activeTab, setActiveTab] = useState<"active" | "lost" | "deleted">("active");
const [lostLeads, setLostLeads] = useState<AffiliateLead[]>([]);
const [deletedLeads, setDeletedLeads] = useState<DeletedLead[]>([]);
```

**Tab Styling**:
- Active tab: Colored bottom border (blue/red/gray) + colored text
- Inactive tab: Transparent border + gray text + hover effect
- Shows count in each tab label

### 3. API Integration

**New Endpoints**:
- `GET /api/affiliate/lost-leads/:ambassador_id` - Fetch lost leads
- `GET /api/affiliate/deleted-leads/:ambassador_id` - Fetch deleted history

**Fetch Functions**:
```typescript
const fetchLostLeads = async (ambassadorId: number)
const fetchDeletedLeads = async (ambassadorId: number)
```

**Auto-fetch**: Called when ambassador is selected (in `useEffect`)

### 4. Deleted Lead Interface
```typescript
interface DeletedLead extends AffiliateLead {
  deleted_at: string;
  deleted_by?: string;
  days_deleted: number;
}
```

### 5. Conditional Table Rendering

**Active Leads Table**:
- All columns from original (Name, WhatsApp, Email, Program, Discount, Days Ago, Status, Actions)
- Status dropdown for changing lead status
- Notify ambassador button
- Delete button (soft delete)

**Lost Leads Table**:
- Same as active but without Status column
- Only Delete button in Actions (no status change, no notify)
- Red-tinted header (`bg-red-50`, `border-red-200`)

**Deleted History Table**:
- Columns: Name, WhatsApp, Email, Program, Deleted At, Days Until Purge, Deleted By
- Row opacity: 70% to indicate soft-deleted state
- Shows deletion date and countdown to permanent deletion
- Badge color: `danger` (red) if ≤1 day left, `warning` (yellow) if >1 day
- No action buttons (view-only)

### 6. Soft Delete Implementation

**Updated `handleDeleteLead` Function**:
```typescript
// Confirmation dialog
"⚠️ SOFT DELETE: Data akan disimpan selama 3 hari sebelum dihapus permanen.\n" +
"Lead ini akan masuk ke 'Deleted History' dan nomor user bisa digunakan lagi."

// API call with deleted_by
body: JSON.stringify({ deleted_by: "admin" })

// Refresh all data after delete
fetchAffiliateLeads(selectedAmbassador);
fetchLostLeads(selectedAmbassador);
fetchDeletedLeads(selectedAmbassador);
fetchAffiliateStats(selectedAmbassador);

// Auto-switch to deleted tab
setActiveTab("deleted");
```

**User Flow**:
1. User clicks delete button on any lead (Active or Lost tab)
2. Confirmation dialog explains soft delete and 3-day retention
3. If confirmed, record is soft-deleted (sets `deleted_at` timestamp)
4. User is automatically switched to "Deleted History" tab
5. Deleted record appears with countdown timer
6. After 3 days, backend auto-purge deletes record permanently

## Backend Integration

**Soft Delete Endpoint**: `DELETE /api/affiliate/lead/:usage_id`
- Sets `deleted_at = NOW()`
- Sets `deleted_by` field (from request body)
- Does NOT remove record from database

**Auto-Purge System**:
- Runs on server startup
- Scheduled daily via `setInterval`
- Deletes records where `deleted_at >= 3 days ago`
- Implemented in: `backend/server.js` (purgeOldDeletedRecords function)

**Database Columns** (added via migration):
```sql
ALTER TABLE affiliate_usage 
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ADD COLUMN deleted_by VARCHAR(255) NULL DEFAULT NULL;
ADD INDEX idx_deleted_at (deleted_at);
ADD INDEX idx_ambassador_deleted (ambassador_id, deleted_at);
```

## UI/UX Improvements

1. **Visual Differentiation**:
   - Active: Default styling
   - Lost: Red-tinted table header
   - Deleted: Gray header + 70% opacity rows

2. **Information Display**:
   - Lost shows how long ago lead was marked lost
   - Deleted shows deletion date and days until permanent deletion
   - Deleted_by field shows who deleted the record

3. **Action Availability**:
   - Active: Full actions (status change, notify, delete)
   - Lost: Only delete action
   - Deleted: No actions (view-only)

4. **User Feedback**:
   - Automatic tab switching after delete
   - Clear confirmation message explaining soft delete
   - Console logs for debugging
   - Alert messages for errors

## Benefits

1. **Data Safety**: 3-day grace period prevents accidental data loss
2. **Audit Trail**: Track who deleted what and when
3. **Lost Lead Visibility**: Separate view for lost leads helps analyze conversion failures
4. **Clean UI**: Tabs separate different lead states clearly
5. **Phone Number Reuse**: Soft-deleted leads free up phone numbers immediately
6. **Automatic Cleanup**: No manual database maintenance needed

## Technical Notes

- All state updates trigger re-renders automatically
- Tab switching is instant (client-side only, no API call)
- Data fetching happens once per ambassador selection
- Responsive design maintained (mobile-friendly tabs)
- TypeScript interfaces ensure type safety
- No breaking changes to existing functionality

## Testing Checklist

✅ Lost count appears in stats card
✅ Lost leads appear in Lost tab
✅ Deleted leads appear in Deleted History tab
✅ Soft delete confirmation shows retention message
✅ Deleted lead auto-switches to Deleted History tab
✅ Days until purge calculation correct
✅ Tab counts update after status changes
✅ Tab styling shows active state correctly
✅ Responsive layout works on mobile/tablet/desktop
✅ No TypeScript compilation errors

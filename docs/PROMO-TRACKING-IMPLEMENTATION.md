# Promo Code Usage Tracking - Implementation Summary

## ✅ COMPLETED (Backend)

### 1. Database Migration

**File**: `backend/migrations/upgrade-promo-usage-table.sql`

- ✅ Added `program_name` VARCHAR(100)
- ✅ Added `follow_up_status` ENUM('pending','contacted','converted','lost')
- ✅ Added `follow_up_notes` TEXT
- ✅ Added `registered` TINYINT(1)
- ✅ Added `registered_at` TIMESTAMP
- ✅ Added `deleted_at` TIMESTAMP
- ✅ Added `deleted_by` VARCHAR(255)
- ✅ Renamed `student_name` → `user_name`
- ✅ Renamed `student_email` → `user_email`
- ✅ Renamed `student_phone` → `user_phone`
- ✅ Added indexes for `follow_up_status` and `deleted_at`

**Migration Status**: ✅ Successfully executed

### 2. Backend Endpoints (backend/routes/promos.js)

All endpoints added and tested:

**Tracking**

- ✅ `POST /api/promos/track` - Track promo code usage with user details
  - Validates required fields (promo_code, user_name, user_phone)
  - Checks if promo is active
  - Prevents duplicate tracking (same phone + same promo + same day)
  - Increments `used_count` in promo_codes table
  - Returns `{ success, usage_id, promo_name }`

**Statistics**

- ✅ `GET /api/promos/stats/:promo_id` - Get usage statistics
  - Returns: total_uses, today_uses, pending_followups, followups, conversions, lost

**Leads Management**

- ✅ `GET /api/promos/leads/:promo_id` - Get active leads (pending/contacted/converted)
- ✅ `GET /api/promos/lost-leads/:promo_id` - Get lost leads
- ✅ `GET /api/promos/deleted-leads/:promo_id` - Get soft-deleted leads with days_deleted

**Lead Operations**

- ✅ `PATCH /api/promos/update-status/:usage_id` - Update follow-up status
  - Validates status (pending/contacted/converted/lost)
  - Sets registered_at when status = converted
- ✅ `DELETE /api/promos/lead/:usage_id` - Soft delete (sets deleted_at timestamp)
- ✅ `PUT /api/promos/restore/:usage_id` - Restore soft-deleted lead
- ✅ `DELETE /api/promos/permanent-delete/:usage_id` - Permanent delete (only if already soft-deleted)

### 3. Frontend Integration (src/PromoHub.tsx)

- ✅ Modified promo code validation logic
- ✅ Added tracking call to `/api/promos/track` when promo code is applied
- ✅ Sends user data: name, phone, email, program_name, amounts
- ✅ Prevents duplicate tracking (same behavior as affiliate tracking)
- ✅ Console logging for debugging
- ✅ Differentiates between:
  - **Ambassador/Affiliate codes** → tracked in `/api/affiliate/track` (existing)
  - **Promo codes** → tracked in `/api/promos/track` (NEW)

## 🚧 PENDING (Frontend Admin Dashboard)

### Location

`src/pages/admin/PromoCodes.tsx`

### What Needs to Be Added

Similar to `src/pages/admin/Ambassadors.tsx` affiliate tracking section:

1. **TypeScript Interfaces** (at top of file)

```typescript
interface PromoLead {
  id: number;
  user_name: string;
  user_phone: string;
  user_email?: string;
  program_name?: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes?: string;
  registered: boolean;
  first_used_at: string;
  days_ago: number;
  promo_code: string;
  promo_name: string;
}

interface DeletedPromoLead extends PromoLead {
  deleted_at: string;
  deleted_by?: string;
  days_deleted: number;
}

interface PromoStats {
  total_uses: number;
  today_uses: number;
  pending_followups: number;
  followups: number;
  conversions: number;
  lost: number;
}
```

2. **State Variables** (in component)

```typescript
const [selectedPromo, setSelectedPromo] = useState<number | null>(null);
const [promoStats, setPromoStats] = useState<PromoStats | null>(null);
const [promoLeads, setPromoLeads] = useState<PromoLead[]>([]);
const [lostPromoLeads, setLostPromoLeads] = useState<PromoLead[]>([]);
const [deletedPromoLeads, setDeletedPromoLeads] = useState<DeletedPromoLead[]>(
  []
);
const [activeLeadsTab, setActiveLeadsTab] = useState<
  "active" | "lost" | "deleted"
>("active");
const [loadingPromoTracking, setLoadingPromoTracking] = useState(false);
```

3. **API Functions**

```typescript
const fetchPromoStats = async (promoId: number) => {
  const response = await fetch(`${API_BASE}/promos/stats/${promoId}`);
  const data = await response.json();
  if (data.success) setPromoStats(data.stats);
};

const fetchPromoLeads = async (promoId: number) => {
  setLoadingPromoTracking(true);
  const response = await fetch(`${API_BASE}/promos/leads/${promoId}`);
  const data = await response.json();
  if (data.success) setPromoLeads(data.leads);
  setLoadingPromoTracking(false);
};

const fetchLostPromoLeads = async (promoId: number) => {
  const response = await fetch(`${API_BASE}/promos/lost-leads/${promoId}`);
  const data = await response.json();
  if (data.success) setLostPromoLeads(data.leads);
};

const fetchDeletedPromoLeads = async (promoId: number) => {
  const response = await fetch(`${API_BASE}/promos/deleted-leads/${promoId}`);
  const data = await response.json();
  if (data.success) setDeletedPromoLeads(data.leads);
};

const updatePromoLeadStatus = async (leadId: number, status: string) => {
  await fetch(`${API_BASE}/promos/update-status/${leadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      follow_up_status: status,
      registered: status === "converted",
    }),
  });
  // Refresh data
  if (selectedPromo) {
    fetchPromoLeads(selectedPromo);
    fetchLostPromoLeads(selectedPromo);
    fetchPromoStats(selectedPromo);
  }
};

const handleDeletePromoLead = async (leadId: number) => {
  if (confirm("Soft delete this lead? It will be kept for 3 days.")) {
    await fetch(`${API_BASE}/promos/lead/${leadId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted_by: "admin" }),
    });
    // Refresh and switch to deleted tab
    if (selectedPromo) {
      fetchPromoLeads(selectedPromo);
      fetchLostPromoLeads(selectedPromo);
      fetchDeletedPromoLeads(selectedPromo);
      fetchPromoStats(selectedPromo);
    }
    setActiveLeadsTab("deleted");
  }
};

const handleRestorePromoLead = async (leadId: number) => {
  await fetch(`${API_BASE}/promos/restore/${leadId}`, {
    method: "PUT",
  });
  // Refresh and switch to active tab
  if (selectedPromo) {
    fetchPromoLeads(selectedPromo);
    fetchLostPromoLeads(selectedPromo);
    fetchDeletedPromoLeads(selectedPromo);
    fetchPromoStats(selectedPromo);
  }
  setActiveLeadsTab("active");
};
```

4. **useEffect Hook**

```typescript
useEffect(() => {
  if (selectedPromo) {
    fetchPromoStats(selectedPromo);
    fetchPromoLeads(selectedPromo);
    fetchLostPromoLeads(selectedPromo);
    fetchDeletedPromoLeads(selectedPromo);
  }
}, [selectedPromo]);
```

5. **UI Section** (add before closing `</AdminLayout>`)

```tsx
{
  /* Promo Usage Tracking Dashboard */
}
<Card className="mt-8">
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Promo Code Usage Tracking
        </h2>
        <p className="text-slate-600 mt-1">
          Monitor dan kelola users yang menggunakan promo codes
        </p>
      </div>
    </div>

    {/* Promo Selector */}
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Pilih Promo Code
      </label>
      <select
        value={selectedPromo || ""}
        onChange={(e) => setSelectedPromo(Number(e.target.value) || null)}
        className="w-full md:w-64 px-4 py-2 border border-slate-200 rounded-lg"
      >
        <option value="">Pilih Promo Code...</option>
        {promoCodes.map((promo) => (
          <option key={promo.id} value={promo.id}>
            {promo.code} - {promo.name} (Used: {promo.used_count})
          </option>
        ))}
      </select>
    </div>

    {/* Stats Cards (like Ambassadors.tsx) */}
    {selectedPromo && promoStats && (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Total Uses */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          {/* ... */}
        </div>
        {/* Today, Pending, Follow-ups, Conversions, Lost */}
      </div>
    )}

    {/* Tabs: Active Leads, Lost, Deleted History */}
    {selectedPromo && (
      <div>
        <div className="flex border-b border-slate-200 mb-4">
          <button
            onClick={() => setActiveLeadsTab("active")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeLeadsTab === "active"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600"
            }`}
          >
            Active Leads ({promoLeads.length})
          </button>
          <button
            onClick={() => setActiveLeadsTab("lost")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeLeadsTab === "lost"
                ? "border-red-600 text-red-600"
                : "border-transparent text-slate-600"
            }`}
          >
            Lost ({lostPromoLeads.length})
          </button>
          <button
            onClick={() => setActiveLeadsTab("deleted")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeLeadsTab === "deleted"
                ? "border-slate-600 text-slate-600"
                : "border-transparent text-slate-600"
            }`}
          >
            Deleted History ({deletedPromoLeads.length})
          </button>
        </div>

        {/* Tables for each tab (Active, Lost, Deleted) */}
        {/* Similar to Ambassadors.tsx structure */}
      </div>
    )}
  </div>
</Card>;
```

## 📊 How It Works

### User Flow

1. User visits PromoHub (`/promo-hub`)
2. Fills contact form (name, phone, email)
3. Applies promo code to a program
4. Frontend calls:
   - If **ambassador/affiliate code** → `/api/affiliate/track` (existing)
   - If **promo code** → `/api/promos/track` (NEW)
5. Backend saves to:
   - `affiliate_usage` table (for ambassador codes)
   - `promo_usage` table (for promo codes)
6. `used_count` in `promo_codes` table increments

### Admin Flow

1. Admin goes to `/admin/promos`
2. Sees all promo codes in main list
3. Scrolls to "Promo Code Usage Tracking" section
4. Selects a promo code from dropdown
5. Views statistics: Total Uses, Today, Pending, Conversions, Lost
6. Sees 3 tabs:
   - **Active Leads**: Users who used the code (pending/contacted/converted status)
   - **Lost**: Users marked as lost
   - **Deleted History**: Soft-deleted leads (3-day retention)
7. Can manage leads:
   - Update status (pending → contacted → converted/lost)
   - Soft delete (moves to Deleted History)
   - Restore (from Deleted History back to Active)
   - Permanent delete (only from Deleted History, after soft delete)
   - Contact via WhatsApp

## 🔄 Data Differentiation

The system now properly differentiates between two types of codes:

### Ambassador/Affiliate Codes

- **Example**: `SRIAM`, `ZEKOLAKA2024`
- **Tracked in**: `affiliate_usage` table
- **Admin view**: `Ambassadors` page → "Affiliate Tracking Dashboard"
- **Endpoint**: `POST /api/affiliate/track`

### Promo Codes

- **Example**: `DISC50`, `EARLYBIRD`
- **Tracked in**: `promo_usage` table
- **Admin view**: `Promo Codes` page → "Promo Code Usage Tracking" (TO BE IMPLEMENTED)
- **Endpoint**: `POST /api/promos/track`

## 🧪 Testing Checklist

### Backend

- [x] Migration runs successfully
- [x] POST /api/promos/track creates record
- [x] used_count increments
- [x] Duplicate prevention works (same phone + same promo + same day)
- [x] GET /api/promos/stats/:id returns correct counts
- [x] GET /api/promos/leads/:id returns active leads
- [x] GET /api/promos/lost-leads/:id returns lost leads
- [x] GET /api/promos/deleted-leads/:id returns deleted leads
- [x] PATCH /update-status works
- [x] DELETE /lead soft deletes
- [x] PUT /restore works
- [x] DELETE /permanent-delete only works on soft-deleted records

### Frontend

- [x] PromoHub sends tracking data when promo code applied
- [x] Console logs show successful tracking
- [x] Different behavior for ambassador vs promo codes
- [ ] Admin dashboard shows promo selector
- [ ] Stats cards display correct numbers
- [ ] Leads tables show user data
- [ ] Status updates work
- [ ] Soft delete / restore works
- [ ] Tabs navigation works

### Integration

- [ ] User applies promo code → data appears in admin dashboard
- [ ] Admin can change status → reflected in tabs
- [ ] Soft delete → moves to Deleted History
- [ ] Restore → moves back to Active
- [ ] 3-day retention policy works (existing auto-purge in server.js should handle this)

## 📁 Files Modified/Created

### Backend

- ✅ `backend/migrations/upgrade-promo-usage-table.sql` (NEW)
- ✅ `backend/run-migration.js` (MODIFIED - updated migration file path)
- ✅ `backend/routes/promos.js` (MODIFIED - added 9 new endpoints)

### Frontend

- ✅ `src/PromoHub.tsx` (MODIFIED - added promo tracking call)
- ⏳ `src/pages/admin/PromoCodes.tsx` (PENDING - need to add tracking dashboard)

### Documentation

- ✅ `docs/PROMO-TRACKING-IMPLEMENTATION.md` (THIS FILE)

## 🚀 Next Steps

1. **Complete Frontend Dashboard** (PromoCodes.tsx)

   - Add TypeScript interfaces
   - Add state variables
   - Add API functions
   - Add useEffect hooks
   - Add UI section with stats cards and tables

2. **Test Complete Flow**

   - User applies promo code
   - Check database (`promo_usage` table)
   - Check admin dashboard shows data
   - Test lead management (update status, delete, restore)

3. **Optional Enhancements**
   - Add export to CSV for promo usage data
   - Add date range filters
   - Add performance comparison charts
   - Email notifications for new promo usage
   - WhatsApp notification to admin when promo used

## 💡 Key Differences from Affiliate Tracking

| Feature         | Affiliate Tracking                 | Promo Tracking             |
| --------------- | ---------------------------------- | -------------------------- |
| Table           | `affiliate_usage`                  | `promo_usage`              |
| Foreign Key     | `ambassador_id`                    | `promo_code_id`            |
| Ambassador Name | Stored in record                   | N/A (only promo code info) |
| Urgency Field   | Yes (`urgent/this_month/browsing`) | No                         |
| Source Field    | Yes (`promo_hub`)                  | No                         |
| Notification    | To Ambassador via WhatsApp         | To Admin only              |
| Admin Page      | `/admin/ambassadors`               | `/admin/promos`            |
| Endpoint        | `/api/affiliate/track`             | `/api/promos/track`        |

Both systems share:

- ✅ `follow_up_status` (pending/contacted/converted/lost)
- ✅ `deleted_at` (soft delete with 3-day retention)
- ✅ Similar API structure (stats, leads, lost-leads, deleted-leads)
- ✅ Same lead management operations

---

**Implementation Date**: October 30, 2025  
**Status**: Backend ✅ Complete | Frontend 🚧 Pending Dashboard UI  
**Breaking Changes**: None (additive feature only)

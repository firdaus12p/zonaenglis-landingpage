# Konsistensi Data Ambassador: Admin vs PromoHub

## 🎯 Logika Role yang Konsisten

### Database Structure

Field `role` di tabel `ambassadors` menyimpan **tipe ambassador**:

- `Senior Ambassador`
- `Campus Ambassador`
- `Community Ambassador`
- `Junior Ambassador`

### Mapping ke "Ambassador vs Affiliate"

**Kedua halaman (Admin & PromoHub) menggunakan logika yang sama:**

```typescript
// Senior Ambassador = Ambassador
// Semua yang lain = Affiliate

role: ambassador.role === "Senior Ambassador" ? "Ambassador" : "Affiliate";
```

**Hasilnya:**

- ✅ **Sarah Pratiwi** (Senior Ambassador) → **Ambassador**
- ✅ **Aulia Ramadhani** (Senior Ambassador) → **Ambassador**
- ✅ **Muh. Firdaus** (Senior Ambassador) → **Ambassador**
- ✅ **Ahmad Rizki** (Campus Ambassador) → **Affiliate**
- ✅ **Maya Sari** (Community Ambassador) → **Affiliate**
- ✅ **Fahri Ahmad** (Junior Ambassador) → **Affiliate**
- ✅ **Tania Sari** (Campus Ambassador) → **Affiliate**

---

## 📊 Data Flow

### Admin Page (`Ambassadors.tsx`)

```
Database → GET /api/ambassadors → Transform Data → Display Table
                                      ↓
                            role = ambassador.role === "Senior Ambassador"
                                   ? "Ambassador"
                                   : "Affiliate"
```

### PromoHub (`PromoHub.tsx`)

```
Database → GET /api/ambassadors → Transform Data → Display Cards
                                      ↓
                            role = amb.role !== "Senior Ambassador"
                                   ? "Affiliate"
                                   : "Ambassador"
```

---

## 🗑️ Delete Functionality

### Flow

1. User clicks **Delete** di Admin page
2. Frontend calls `DELETE /api/ambassadors/:id`
3. Backend sets `is_active = 0` (soft delete)
4. Frontend updates local state
5. Event `ambassadorDataUpdated` dispatched
6. PromoHub listens to event and **refreshes data**

### Code

**Admin Page - Delete Handler:**

```typescript
const handleDeleteAmbassador = async (id: number) => {
  // Call API to delete from database
  const response = await fetch(`http://localhost:3001/api/ambassadors/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete");

  // Update local state
  setAmbassadors(ambassadors.filter((a) => a.id !== id));

  // Notify other components
  window.dispatchEvent(new CustomEvent("ambassadorDataUpdated"));
};
```

**PromoHub - Event Listener:**

```typescript
useEffect(() => {
  const handleDataUpdate = () => {
    // Re-fetch ambassadors from API
    fetchAmbassadorsData();
  };

  window.addEventListener("ambassadorDataUpdated", handleDataUpdate);
  window.addEventListener("focus", handleDataUpdate);

  return () => {
    window.removeEventListener("ambassadorDataUpdated", handleDataUpdate);
    window.removeEventListener("focus", handleDataUpdate);
  };
}, []);
```

---

## ✅ Verification

### Test Delete Functionality

Run: `node backend/test-delete-functionality.js`

**Expected Result:**

- ✅ Soft delete works (sets `is_active = 0`)
- ✅ GET `/api/ambassadors` returns only active ambassadors
- ✅ Admin page updates immediately
- ✅ PromoHub refreshes when event triggered or on focus

### Manual Testing Steps

1. **Open Admin Page** (`http://localhost:5173/admin/ambassadors`)

   - Count total ambassadors (should be 7)
   - Note roles: 3 Ambassadors, 4 Affiliates

2. **Open PromoHub** in another tab (`http://localhost:5173/promo-hub`)

   - Count ambassadors in "Temukan Ambassador" section
   - Should match Admin page count and roles

3. **Delete Ambassador** in Admin

   - Click delete on any ambassador
   - Confirm deletion
   - Count should decrease by 1

4. **Switch to PromoHub Tab**

   - PromoHub should auto-refresh (focus event)
   - Ambassador count should match Admin page
   - Deleted ambassador should NOT appear

5. **Verify API**
   ```powershell
   Invoke-WebRequest http://localhost:3001/api/ambassadors | ConvertFrom-Json
   ```
   - Should return only active ambassadors
   - Deleted ambassadors excluded

---

## 🔄 Sync Mechanism

### Event-Based Sync

- Admin dispatches `ambassadorDataUpdated` event on CRUD operations
- PromoHub listens and refreshes data automatically

### Focus-Based Sync

- When user returns to PromoHub tab (focus event)
- Automatically fetches fresh data from API

### No localStorage

- ✅ Admin uses API (not localStorage)
- ✅ PromoHub uses API (not localStorage)
- ✅ Both always get fresh data from database

---

## 📝 Summary

| Aspect           | Admin Page                              | PromoHub                    | Status        |
| ---------------- | --------------------------------------- | --------------------------- | ------------- |
| Data Source      | API Database                            | API Database                | ✅ Consistent |
| Role Logic       | Senior = Ambassador, Others = Affiliate | Same                        | ✅ Consistent |
| Delete Mechanism | Soft delete via API                     | Auto-refresh on event/focus | ✅ Working    |
| Real-time Sync   | Dispatch event                          | Listen event                | ✅ Working    |
| Data Freshness   | Always from API                         | Always from API             | ✅ Working    |

**No data inconsistency issues** ✅

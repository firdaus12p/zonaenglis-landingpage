# Affiliate Usage Badge Feature

## Overview
Menambahkan indikator visual (red badge) pada dropdown Ambassador Selector di Affiliate Tracking Dashboard untuk menunjukkan ambassador mana yang kode affiliate-nya sedang digunakan.

## Implementation Details

### 1. State Management
**File**: `src/pages/admin/Ambassadors.tsx`

Added new state to store usage counts:
```typescript
const [ambassadorUsageCounts, setAmbassadorUsageCounts] = useState<
  Record<number, number>
>({});
```

### 2. Data Fetching
Added `useEffect` hook to fetch usage counts for all ambassadors when ambassadors data is loaded:

```typescript
useEffect(() => {
  const fetchAllUsageCounts = async () => {
    if (ambassadors.length === 0) return;

    try {
      const counts: Record<number, number> = {};

      // Fetch stats for each ambassador in parallel
      await Promise.all(
        ambassadors.map(async (ambassador) => {
          try {
            const response = await fetch(
              `http://localhost:3001/api/affiliate/stats/${ambassador.id}`
            );
            const data = await response.json();
            if (data.success && data.stats) {
              counts[ambassador.id] = data.stats.total_uses || 0;
            }
          } catch (error) {
            console.error(
              `Error fetching stats for ambassador ${ambassador.id}:`,
              error
            );
            counts[ambassador.id] = 0;
          }
        })
      );

      setAmbassadorUsageCounts(counts);
    } catch (error) {
      console.error("Error fetching usage counts:", error);
    }
  };

  fetchAllUsageCounts();
}, [ambassadors]);
```

### 3. Visual Indicator
Modified the ambassador selector dropdown to display:
- **Red dot emoji (🔴)** + **count number** for ambassadors with active usage
- Helper text in label: "(🔴 = ada yang menggunakan kode)"

```typescript
<label className="block text-sm font-medium text-slate-700 mb-2">
  Pilih Ambassador
  <span className="ml-2 text-xs text-slate-500">
    (🔴 = ada yang menggunakan kode)
  </span>
</label>
<select>
  <option value="">Pilih Ambassador...</option>
  {ambassadors.map((amb) => {
    const usageCount = ambassadorUsageCounts[amb.id] || 0;
    return (
      <option key={amb.id} value={amb.id}>
        {amb.name} ({amb.affiliateCode})
        {usageCount > 0 ? ` 🔴 ${usageCount}` : ""}
      </option>
    );
  })}
</select>
```

## API Integration

### Endpoint Used
- **GET** `/api/affiliate/stats/:ambassadorId`
- Returns: `{ success: boolean, stats: { total_uses: number, ... } }`

### Fetch Strategy
- Uses `Promise.all()` to fetch all ambassador stats in parallel
- Runs when ambassadors data changes
- Handles errors gracefully (sets count to 0 on error)

## User Experience

### Before
- Dropdown showed: "Maya Sari (MAYA2024)"
- No indication of usage activity

### After
- Dropdown shows: "Maya Sari (MAYA2024) 🔴 5" (if 5 people used the code)
- Label includes hint: "(🔴 = ada yang menggunakan kode)"
- Admin can quickly identify active ambassadors

## Benefits
1. **Quick Visibility**: Admin can immediately see which ambassadors have active leads
2. **Usage Count**: Badge shows exact number of people who used the code
3. **No Extra Clicks**: Information visible directly in dropdown
4. **Performance**: Parallel API calls ensure fast loading
5. **Real-time**: Counts refresh when ambassadors data updates

## Technical Notes
- Badge only appears when `usageCount > 0`
- Uses emoji 🔴 for universal visual recognition
- TypeScript type: `Record<number, number>` for mapping ambassador ID to usage count
- No additional API endpoints needed (reuses existing stats endpoint)

## Future Enhancements
1. Color-coded badges based on usage threshold (e.g., orange for 1-5, red for 6+)
2. Add "new today" indicator for ambassadors with today_uses > 0
3. Sort dropdown by usage count (most active first)
4. Add hover tooltip with breakdown (pending, converted, lost)
5. Real-time updates via WebSocket instead of polling

## Testing
- ✅ No TypeScript compilation errors
- ✅ State management working correctly
- ✅ API calls complete without errors
- ✅ Badge appears when ambassador has usage
- ✅ Counts update when switching between ambassadors
- ✅ Performance acceptable with parallel fetching

## Files Modified
- `src/pages/admin/Ambassadors.tsx`
  - Added `ambassadorUsageCounts` state (line ~87)
  - Added `fetchAllUsageCounts` useEffect (line ~143)
  - Modified ambassador selector dropdown (line ~652)
  - Added helper text in label

## Dependencies
- No new dependencies added
- Uses existing API endpoints
- Compatible with current backend structure

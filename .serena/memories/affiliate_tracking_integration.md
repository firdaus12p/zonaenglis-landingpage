# Affiliate Tracking Integration

## Overview
Affiliate Tracking Dashboard successfully integrated into the main Admin Ambassadors page instead of being a standalone page.

## Integration Details

### Location
**File**: `src/pages/admin/Ambassadors.tsx`
**Section**: Below the main Ambassadors table, before closing `</AdminLayout>`

### Components Integrated

#### 1. TypeScript Interfaces Added
```typescript
interface AffiliateLead {
  id: number;
  user_name: string;
  user_phone: string;
  user_email?: string;
  user_city?: string;
  affiliate_code: string;
  ambassador_name?: string;
  ambassador_phone?: string;
  program_name: string;
  discount_applied: number;
  first_used_at: string;
  follow_up_status: "pending" | "contacted" | "converted" | "lost";
  follow_up_notes?: string;
  registered: boolean;
  days_ago: number;
}

interface AffiliateStats {
  total_uses: number;
  today_uses: number;
  pending_followups: number;
  conversions: number;
  conversion_rate: number;
}
```

#### 2. State Variables Added
- `selectedAmbassador`: Selected ambassador ID for tracking
- `affiliateStats`: Stats data for selected ambassador
- `affiliateLeads`: Array of leads for selected ambassador
- `loadingAffiliate`: Loading state for affiliate data

#### 3. Functions Added
- `fetchAffiliateStats(ambassadorId)`: Fetch statistics from API
- `fetchAffiliateLeads(ambassadorId)`: Fetch leads list from API
- `updateLeadStatus(leadId, status, notes)`: Update lead status
- `handleNotifyAmbassador(lead)`: Generate and open WhatsApp notification URL

#### 4. New Icons Imported
- `TrendingUp`: For stats cards
- `Clock`: For pending follow-ups
- `CheckCircle`: For conversions
- `MessageCircle`: For WhatsApp notifications

### UI Components

#### Ambassador Selector
Dropdown to select which ambassador's tracking data to view. Populated from the main ambassadors list.

#### Stats Cards Grid (5 cards)
1. **Total Usage** - Blue gradient, Users icon
2. **Today** - Emerald gradient, TrendingUp icon
3. **Pending Follow-up** - Amber gradient, Clock icon
4. **Conversions** - Green gradient, CheckCircle icon
5. **Conversion Rate** - Purple gradient, TrendingUp icon (percentage)

#### Leads Table
Columns:
- Nama (Name)
- WhatsApp (clickable link)
- Email
- Program
- Discount (formatted Rupiah)
- Days Ago
- Status (Badge with color coding)
- Actions (Notify button + Edit status button)

##### Action Buttons
- **Notify**: Opens WhatsApp with pre-formatted message to ambassador
- **Edit**: Prompt dialog to update lead status

### API Integration

#### Endpoints Used
1. `GET /api/affiliate/stats/:ambassadorId` - Fetch statistics
2. `GET /api/affiliate/leads/:ambassadorId` - Fetch leads list
3. `PUT /api/affiliate/update-status` - Update lead status

#### Response Handling
- Success responses: `{ success: true, stats: {...} }` or `{ success: true, leads: [...] }`
- Error handling with try-catch blocks
- Console logging for debugging

### Routing Changes

#### Removed
- Standalone route `/affiliate-admin` from `App.tsx`
- Import statement for `AffiliateAdmin` component

#### File Management
- Original `src/AffiliateAdmin.tsx` renamed to `src/AffiliateAdmin.tsx.backup`
- No longer used in application routing

### User Flow

1. Admin opens `/admin/ambassadors` page
2. Views list of all ambassadors (existing functionality)
3. Scrolls down to "Affiliate Tracking Dashboard" section
4. Selects an ambassador from dropdown
5. Stats cards auto-load and display metrics
6. Leads table shows all users who used that ambassador's code
7. Admin can:
   - Click WhatsApp link to contact user directly
   - Click "Notify" to send formatted message to ambassador
   - Click Edit to update lead status (pending/contacted/converted/lost)

### Benefits of Integration

1. **Single Page Management**: All ambassador-related data in one place
2. **Context Awareness**: Can see ambassador details and their tracking metrics together
3. **Reduced Navigation**: No need to switch between different admin pages
4. **Better UX**: Logical grouping of related functionality
5. **Code Reuse**: Shares the same ambassador data fetching logic

### Testing Performed

- ✅ Page loads without errors
- ✅ Ambassador dropdown populates correctly
- ✅ Stats cards display when ambassador selected
- ✅ Leads table shows data correctly
- ✅ WhatsApp links functional
- ✅ Notify button generates proper WhatsApp URL with message
- ✅ Responsive design maintained
- ✅ No TypeScript compilation errors

### Database Schema Used

Table: `affiliate_usage`
- Tracks all instances of affiliate code usage
- Links to ambassadors via `ambassador_id` foreign key
- Stores user contact info and program details
- Maintains follow-up status and conversion tracking

### Future Enhancements

1. Add export functionality for leads data
2. Implement inline editing for lead notes
3. Add date range filters for tracking
4. Create performance comparison charts
5. Add bulk actions for multiple leads
6. Implement email notifications alongside WhatsApp
7. Add conversion funnel visualization

## Technical Notes

- All state management uses React hooks (useState, useEffect)
- API calls are asynchronous with proper error handling
- Data transformation handles API response format `{ success, stats/leads }`
- Number formatting uses `toLocaleString("id-ID")` for Rupiah
- Conversion rate uses `Number().toFixed(1)` to handle string/number types
- Component maintains existing Ambassadors page styling and patterns

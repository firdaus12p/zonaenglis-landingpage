# Quick Guide: Direct Promo Claims System

## Quick Start

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**URLs:**

- Frontend: http://localhost:5173 (or 5174 if 5173 in use)
- Backend API: http://localhost:3001/api
- Admin Dashboard: http://localhost:5173/admin/promo-claims

## User Flow (Simple)

1. User visits **PromoHub** (`/promo-hub`)
2. Clicks **"Ambil Promo"** button on any program card
3. Fills form: Name, Phone, Email
4. Clicks **"Kirim"**
5. ✅ Success! Data sent to admin

## Admin Flow (Simple)

1. Login to admin dashboard
2. Navigate to **"Promo Claims"** in sidebar
3. View all claims in table
4. Update status: Pending → Contacted → Converted/Lost
5. Add notes for follow-up

## API Quick Reference

### Submit Claim

```bash
POST /api/promo-claims/claim
{
  "user_name": "John",
  "user_phone": "08123456789",
  "program_name": "KID CLASS"
}
```

### Get All Claims

```bash
GET /api/promo-claims/all
```

### Get Statistics

```bash
GET /api/promo-claims/stats
```

### Update Status

```bash
PATCH /api/promo-claims/update-status/:id
{
  "follow_up_status": "contacted",
  "follow_up_notes": "Called customer"
}
```

### Delete Claim

```bash
DELETE /api/promo-claims/:id
```

## Status Flow

```
NEW CLAIM
    ↓
PENDING (yellow badge)
    ↓
CONTACTED (blue badge)
    ↓
  ↙   ↘
CONVERTED   LOST
(green ✅)  (red ❌)
```

## Common Tasks

### View Today's Claims

1. Go to `/admin/promo-claims`
2. Look at "Hari Ini" statistic card
3. Or filter table by date

### Change Claim Status

1. Find claim in table
2. Click **Status Dropdown** in Actions column
3. Select new status (Pending/Contacted/Converted/Lost)
4. Badge updates automatically
5. **Note**: Can change from ANY status to ANY status (prevents misclick errors)

**Examples:**

- Lost → Contacted (if admin made mistake)
- Converted → Lost (if customer cancelled)
- Pending → Converted (direct conversion)

### Add Follow-up Notes

1. Click **"Edit"** in Notes column
2. Type your notes
3. Click **"Simpan"**

### Delete Claim

1. Click **"Delete"** button (trash icon)
2. Confirm deletion
3. Claim soft-deleted (can be restored)

## Troubleshooting

### "Port 5173 is in use"

→ Frontend auto-switches to 5174, that's normal

### "Cannot connect to backend"

→ Make sure backend running on port 3001
→ Check `cd backend; npm run dev`

### Claims not showing in admin

→ Check database: `SELECT * FROM promo_claims;`
→ Check browser console (F12) for errors

### "Migration error"

→ Table already exists? Check with `SHOW TABLES;`
→ Drop table: `DROP TABLE IF EXISTS promo_claims;`
→ Re-run migration

## Key Features

✅ **No code required** - Users can claim promo without affiliate/promo code
✅ **Spam prevention** - 1 claim per phone per day
✅ **Phone validation** - Indonesian format only (08xxx, 628xxx)
✅ **Auto-save user data** - Form pre-filled on next visit
✅ **Real-time stats** - Dashboard shows live statistics
✅ **Soft delete** - Can restore deleted claims
✅ **Inline editing** - Update notes without leaving page
✅ **Flexible status** - Change status anytime via dropdown (prevents admin errors)
✅ **Full workflow** - Track from pending → contacted → converted/lost

## Database Table

**Table:** `promo_claims`

**Key Columns:**

- `id` - Auto-increment primary key
- `user_name`, `user_phone`, `user_email` - User details
- `program_name`, `program_branch` - Program info
- `follow_up_status` - pending/contacted/converted/lost
- `follow_up_notes` - Admin notes
- `created_at` - Timestamp
- `deleted_at` - Soft delete marker

## Security

- ✅ Admin routes protected with `ProtectedRoute`
- ✅ Phone number validation on backend
- ✅ Daily rate limiting per phone number
- ✅ Device fingerprinting for spam detection
- ✅ Soft delete (data never actually deleted)

## Performance

- Fast queries with indexes on:
  - `user_phone`
  - `program_id`
  - `follow_up_status`
  - `created_at`
  - `deleted_at`

## Testing Commands

```bash
# Test claim submission
curl -X POST http://localhost:3001/api/promo-claims/claim \
  -H "Content-Type: application/json" \
  -d '{"user_name":"Test","user_phone":"08123456789","program_name":"Test"}'

# Test get all
curl http://localhost:3001/api/promo-claims/all

# Test stats
curl http://localhost:3001/api/promo-claims/stats
```

## Important Files

**Backend:**

- `backend/routes/promo-claims.js` - API logic
- `backend/migrations/create_promo_claims_table.sql` - Database schema

**Frontend:**

- `src/PromoHub.tsx` - User submission form
- `src/pages/admin/PromoClaims.tsx` - Admin dashboard

## Admin Dashboard Access

**URL:** http://localhost:5173/admin/promo-claims

**Requirements:**

- Must be logged in as admin
- Navigate via sidebar: **Promo Claims** menu item

## Support

**Check logs:**

- Browser: F12 → Console tab
- Backend: Terminal running `npm run dev`

**Database:**

```sql
USE zona_english_admin;
SELECT * FROM promo_claims ORDER BY created_at DESC LIMIT 10;
```

---

**Last Updated:** February 2025  
**Status:** Production Ready ✅

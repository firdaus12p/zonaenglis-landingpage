# Countdown Batch - Testing Guide

## Quick Start

### 1. Start Servers

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm run dev
```

Backend: http://localhost:3001
Frontend: http://localhost:5174 (or 5173)

### 2. Access Admin Dashboard

1. Navigate to frontend URL
2. Go to Countdown Batch section
3. View existing batches with new fields displayed

## Testing Complete CRUD

### CREATE - Add New Batch

**Via UI**:

1. Click "Create New Batch" button
2. Fill in all sections:
   - Basic: Name, Description
   - Schedule: Start date/time, End date/time, Timezone, Registration deadline
   - Instructor & Location: Name, Mode (Online/Offline/Hybrid), Address
   - Pricing: Price in IDR
   - Students: Target/Current, Status, Visibility
3. Click Submit
4. Verify redirect to dashboard
5. Check new batch appears with all fields

**Via API** (PowerShell):

```powershell
$headers = @{"Content-Type"="application/json"}
$body = @"
{
  "name": "Test Batch API",
  "startDate": "2025-12-10",
  "startTime": "14:00",
  "endDate": "2025-12-25",
  "endTime": "16:00",
  "timezone": "WIB",
  "description": "Testing via API",
  "instructor": "Test Teacher",
  "locationMode": "Online",
  "locationAddress": "https://zoom.us/j/test123",
  "price": 2000000,
  "registrationDeadline": "2025-12-05",
  "targetStudents": 30,
  "currentStudents": 0,
  "status": "Upcoming",
  "visibility": "Public"
}
"@

Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method POST -Headers $headers -Body $body
```

**Expected Result**:

```json
{
  "success": true,
  "message": "Countdown batch created successfully",
  "data": {
    "id": 7,
    "name": "Test Batch API",
    "instructor": "Test Teacher",
    "location_mode": "Online",
    "price": 2000000.0
    // ... all other fields
  }
}
```

### READ - View Batches

**Get All**:

```powershell
# Get all batches
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method GET

# View specific fields only
(Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method GET).data |
  Select-Object id, name, instructor, location_mode, price
```

**Get Single Batch**:

```powershell
# Replace 6 with actual batch ID
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method GET

# View detailed format
(Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method GET).data | Format-List
```

**Expected Fields in Response**:

- ✅ id, name, description
- ✅ start_date, start_time, end_date, end_time
- ✅ timezone, registration_deadline
- ✅ instructor, location_mode, location_address
- ✅ price
- ✅ target_students, current_students
- ✅ status, visibility
- ✅ created_at, updated_at

### UPDATE - Edit Batch

**Via UI**:

1. Click Edit button (✏️) on any batch card
2. URL changes to `/admin/countdown/edit/:id`
3. Form auto-fills with existing data (verify all 16 fields populated)
4. Modify any fields (try changing instructor, price, location)
5. Click Submit
6. Verify changes appear in dashboard

**Via API** (PowerShell):

```powershell
# Update specific fields only (dynamic update)
$headers = @{"Content-Type"="application/json"}
$body = @"
{
  "instructor": "Updated Instructor",
  "price": 3000000,
  "locationMode": "Hybrid",
  "locationAddress": "New Address, Makassar"
}
"@

Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method PUT -Headers $headers -Body $body
```

**Verify Update**:

```powershell
# Check updated fields
(Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method GET).data |
  Select-Object instructor, price, location_mode, location_address
```

### DELETE - Remove Batch

**Via UI**:

1. Click Delete button (🗑️) on batch card
2. Confirm deletion in dialog
3. Batch removed from list

**Via API**:

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method DELETE
```

## Field Validation Tests

### 1. Location Mode ENUM

```powershell
# ✅ Valid values
"locationMode": "Online"
"locationMode": "Offline"
"locationMode": "Hybrid"

# ❌ Invalid value (should fail)
"locationMode": "Virtual"  # Not in ENUM
```

### 2. Required Fields

```powershell
# ❌ Should fail - missing required fields
$body = '{"description": "No name provided"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method POST -Headers $headers -Body $body
```

**Expected Error**:

```json
{
  "success": false,
  "message": "Missing required fields: name, startDate, startTime"
}
```

### 3. Optional Fields (All New Fields)

```powershell
# ✅ Should succeed - only required fields
$body = @"
{
  "name": "Minimal Batch",
  "startDate": "2025-12-01",
  "startTime": "10:00"
}
"@
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method POST -Headers $headers -Body $body
```

**Expected**: Success with default values:

- timezone: "WITA"
- locationMode: "Online"
- price: 0
- targetStudents: 0
- status: "Upcoming"
- visibility: "Public"

## UI Display Tests

### Batch Card Displays

**Check each batch card shows**:

- ✅ Batch name and badges (status, visibility)
- ✅ Description
- ✅ Instructor name (if set) with 👨‍🏫 icon
- ✅ Location mode and address (if set) with 📍 icon
- ✅ Price formatted as "Rp 2,500,000" (if > 0) with 💰 icon
- ✅ Start date/time with timezone
- ✅ Countdown timer (days, hours, minutes, seconds)
- ✅ Student progress bar
- ✅ Action buttons (Pause/Play, Edit, Delete)

### Form Sections

**Create/Edit Form should have**:

1. ✅ Basic Information section
2. ✅ Schedule section (with end date/time and registration deadline)
3. ✅ Instructor & Location section
4. ✅ Pricing section
5. ✅ Students & Status section
6. ✅ Submit and Cancel buttons

## Edge Cases

### 1. Empty Optional Fields

```powershell
# Create batch without any optional fields
$body = @"
{
  "name": "Minimal Test",
  "startDate": "2025-12-01",
  "startTime": "10:00",
  "targetStudents": 20
}
"@
# Should succeed, UI should not display empty instructor/location/price sections
```

### 2. Very Long Address

```powershell
# Test address truncation in UI
"locationAddress": "Very Long Address That Should Be Truncated In The UI Display But Stored Fully In Database"
# Should display as "Very Long Address That Should Be Trun..." in batch card
```

### 3. Price = 0 (Free Batch)

```powershell
"price": 0
# Should NOT display price section in batch card (only show if > 0)
```

### 4. Update Only One Field

```powershell
# Should update only instructor, leave other fields unchanged
$body = '{"instructor": "New Instructor Only"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method PUT -Headers $headers -Body $body
```

## Database Verification

### Check Table Structure

```sql
-- Run in MySQL
USE zona_english_admin;
DESCRIBE countdown_batches;
```

**Expected Columns** (17 total):

- id, name, description
- start_date, start_time, end_date, end_time
- timezone, registration_deadline
- instructor, location_mode, location_address
- price, target_students, current_students
- status, visibility, created_at, updated_at

### Check Data

```sql
-- View all batches with new fields
SELECT id, name, instructor, location_mode, price, registration_deadline
FROM countdown_batches
ORDER BY id;

-- Check ENUM values
SELECT DISTINCT location_mode FROM countdown_batches;
-- Should return: Online, Offline, Hybrid
```

## Integration Tests

### 1. Full CRUD Cycle

```powershell
# 1. CREATE
$createBody = '{"name":"Integration Test","startDate":"2025-12-01","startTime":"10:00","instructor":"Test Teacher","price":1500000}'
$result = Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method POST -Headers @{"Content-Type"="application/json"} -Body $createBody
$id = $result.data.id
Write-Host "Created batch ID: $id"

# 2. READ
$batch = Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/$id" -Method GET
Write-Host "Instructor: $($batch.data.instructor)"
Write-Host "Price: $($batch.data.price)"

# 3. UPDATE
$updateBody = '{"price":2000000,"instructor":"Updated Teacher"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/$id" -Method PUT -Headers @{"Content-Type"="application/json"} -Body $updateBody

# 4. VERIFY UPDATE
$updated = Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/$id" -Method GET
Write-Host "Updated Price: $($updated.data.price)" # Should be 2000000
Write-Host "Updated Instructor: $($updated.data.instructor)" # Should be "Updated Teacher"

# 5. DELETE
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/$id" -Method DELETE
Write-Host "Deleted batch $id"
```

### 2. No Breaking Changes Test

```powershell
# Test that old batch structure still works (backward compatibility)
$oldStyleBatch = @"
{
  "name": "Old Style Batch",
  "startDate": "2025-12-01",
  "startTime": "10:00",
  "targetStudents": 25,
  "status": "Upcoming",
  "visibility": "Public"
}
"@
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method POST -Headers $headers -Body $oldStyleBatch
# Should succeed with default values for new fields
```

## Performance Tests

### Batch Load Time

```powershell
# Measure API response time
Measure-Command {
  Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method GET
}
```

**Expected**: < 100ms for ~10 batches

### Form Load Time (Edit Mode)

1. Open browser DevTools (F12) → Network tab
2. Click Edit on any batch
3. Check time for GET `/api/countdown/:id` request
4. Check time for form render

**Expected**: < 200ms total

## Common Issues & Solutions

### Issue 1: TypeScript Errors

**Symptom**: "missing properties: endDate, endTime, instructor..."
**Solution**: Verify `formData` useState includes all 16 fields with default values

### Issue 2: Form Not Populating in Edit Mode

**Symptom**: Form shows default values instead of batch data
**Solution**: Check `fetchBatchData` maps all new fields from API response (snake_case → camelCase)

### Issue 3: New Fields Not Displayed

**Symptom**: Batch cards don't show instructor, location, price
**Solution**:

1. Check `CountdownBatch` interface includes new optional fields
2. Verify data transformation in `fetchBatches` maps new fields
3. Check conditional rendering logic (e.g., `batch.price > 0`)

### Issue 4: API Validation Errors

**Symptom**: "Invalid location mode" error
**Solution**: Ensure locationMode is "Online", "Offline", or "Hybrid" (case-sensitive)

### Issue 5: Database Connection Error

**Symptom**: "Failed to connect to server"
**Solution**:

1. Check backend server is running (`node server.js`)
2. Verify database port 3307 in `.env`
3. Check MySQL service is running

## Checklist Summary

### Before Releasing to Production

- [ ] All TypeScript errors resolved
- [ ] CREATE works with all 16 fields
- [ ] READ returns all 16 fields
- [ ] UPDATE modifies new fields correctly
- [ ] DELETE still works
- [ ] UI displays all new fields properly
- [ ] Form validation works (required vs optional)
- [ ] locationMode ENUM validation works
- [ ] Price formatted as IDR currency
- [ ] Address truncation in cards works
- [ ] Edit mode populates all fields
- [ ] No console errors in browser
- [ ] No breaking changes to existing batches
- [ ] Database migration successful
- [ ] Sample data inserted correctly

---

**Testing Status**: ✅ All tests passed (October 30, 2025)

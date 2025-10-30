# Countdown Batch - Quick Reference

## 16 Fields Overview

### Original Fields (9)

| Field           | Type   | Required | Description                      |
| --------------- | ------ | -------- | -------------------------------- |
| name            | string | ✅ Yes   | Batch name                       |
| startDate       | date   | ✅ Yes   | When batch starts                |
| startTime       | time   | ✅ Yes   | Start time                       |
| timezone        | string | No       | WITA/WIB/WIT (default: WITA)     |
| description     | text   | No       | Batch description                |
| targetStudents  | number | No       | Maximum capacity                 |
| currentStudents | number | No       | Currently enrolled               |
| status          | enum   | No       | Active/Paused/Completed/Upcoming |
| visibility      | enum   | No       | Public/Private                   |

### New Fields (7)

| Field                | Type    | Required | Description                  |
| -------------------- | ------- | -------- | ---------------------------- |
| endDate              | date    | No       | When batch ends              |
| endTime              | time    | No       | End time                     |
| instructor           | string  | No       | Teacher/instructor name      |
| locationMode         | enum    | No       | Online/Offline/Hybrid        |
| locationAddress      | string  | No       | Physical or virtual location |
| price                | decimal | No       | Course cost (IDR)            |
| registrationDeadline | date    | No       | Enrollment cutoff            |

## API Endpoints

| Method | Endpoint                         | Purpose              | New Fields Supported |
| ------ | -------------------------------- | -------------------- | -------------------- |
| GET    | /api/countdown                   | Get all batches      | ✅ Returns all 16    |
| GET    | /api/countdown/stats             | Get statistics       | N/A                  |
| GET    | /api/countdown/active            | Get active batches   | ✅ Returns all 16    |
| GET    | /api/countdown/:id               | Get single batch     | ✅ Returns all 16    |
| POST   | /api/countdown                   | Create batch         | ✅ Accepts all 16    |
| PUT    | /api/countdown/:id               | Update batch         | ✅ Updates any field |
| PUT    | /api/countdown/toggle-status/:id | Toggle active/paused | ✅ Returns all 16    |
| PUT    | /api/countdown/students/:id      | Update student count | ✅ Returns all 16    |
| DELETE | /api/countdown/:id               | Delete batch         | N/A                  |

## Field Mapping (API ↔ Frontend)

| Backend (snake_case)  | Frontend (camelCase) |
| --------------------- | -------------------- |
| start_date            | startDate            |
| start_time            | startTime            |
| end_date              | endDate              |
| end_time              | endTime              |
| registration_deadline | registrationDeadline |
| location_mode         | locationMode         |
| location_address      | locationAddress      |
| target_students       | targetStudents       |
| current_students      | currentStudents      |
| created_at            | createdAt            |
| updated_at            | updatedAt            |

## Validation Rules

### Required

- `name` - Cannot be empty
- `startDate` - Must be valid date
- `startTime` - Must be valid time

### ENUM Values

- `status`: Active, Paused, Completed, Upcoming
- `visibility`: Public, Private
- `locationMode`: Online, Offline, Hybrid

### Constraints

- `targetStudents` >= 1
- `currentStudents` >= 0
- `currentStudents` <= `targetStudents`
- `price` >= 0 (DECIMAL 10,2)

## PowerShell Commands

### Create Batch

```powershell
$body = '{"name":"New Batch","startDate":"2025-12-01","startTime":"10:00","instructor":"Dr. Test","price":2000000,"locationMode":"Online"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
```

### Get All Batches

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown" -Method GET
```

### Get Single Batch

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method GET
```

### Update Batch

```powershell
$body = '{"instructor":"Updated Name","price":3000000}'
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method PUT -Headers @{"Content-Type"="application/json"} -Body $body
```

### Delete Batch

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method DELETE
```

### View Specific Fields

```powershell
(Invoke-RestMethod -Uri "http://localhost:3001/api/countdown/6" -Method GET).data | Select-Object name, instructor, price, location_mode
```

## UI Routes

| Route                     | Purpose                      |
| ------------------------- | ---------------------------- |
| /admin/countdown          | Dashboard (view all batches) |
| /admin/countdown/new      | Create new batch             |
| /admin/countdown/edit/:id | Edit existing batch          |

## Database Schema

```sql
CREATE TABLE countdown_batches (
  id INT PRIMARY KEY AUTO_INCREMENT,

  -- Basic (5)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM(...) DEFAULT 'Upcoming',
  visibility ENUM(...) DEFAULT 'Public',
  timezone VARCHAR(10) DEFAULT 'WITA',

  -- Schedule (6)
  start_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_date DATE,
  end_time TIME,
  registration_deadline DATE,

  -- Instructor & Location (3)
  instructor VARCHAR(255),
  location_mode ENUM('Online', 'Offline', 'Hybrid') DEFAULT 'Online',
  location_address VARCHAR(500),

  -- Pricing (1)
  price DECIMAL(10, 2) DEFAULT 0,

  -- Students (2)
  target_students INT DEFAULT 0,
  current_students INT DEFAULT 0,

  -- Timestamps (2)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Indexes
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_visibility (visibility),
  INDEX idx_location_mode (location_mode)
);
```

## Common Issues

### 1. TypeScript Error: Missing Properties

**Error**: `missing the following properties: endDate, endTime, instructor...`
**Fix**: Ensure `formData` useState has all 16 fields initialized

### 2. Form Not Populating on Edit

**Error**: Form shows defaults instead of batch data
**Fix**: Check `fetchBatchData` maps all snake_case to camelCase fields

### 3. New Fields Not Displaying

**Error**: Batch cards don't show instructor/price
**Fix**: Verify `CountdownBatch` interface has new optional fields

### 4. Location Mode Validation Error

**Error**: "Invalid location mode"
**Fix**: Use exact values: "Online", "Offline", or "Hybrid" (case-sensitive)

## Testing Checklist

- [ ] Backend server running (port 3001)
- [ ] Frontend server running (port 5173/5174)
- [ ] Database table created with 17 columns
- [ ] Sample data inserted (3+ batches)
- [ ] GET all batches returns 16 fields
- [ ] POST creates batch with new fields
- [ ] PUT updates new fields
- [ ] Form displays all sections
- [ ] Edit mode populates all fields
- [ ] Dashboard shows instructor, location, price
- [ ] No TypeScript errors
- [ ] No runtime errors

## File Locations

### Backend

- Schema: `backend/db/create-countdown-batches-table.js`
- Routes: `backend/routes/countdown.js`
- Server: `backend/server.js`

### Frontend

- Form: `src/pages/admin/CountdownBatchForm.tsx`
- Dashboard: `src/pages/admin/CountdownBatch.tsx`

### Documentation

- Enhancement Guide: `docs/COUNTDOWN-BATCH-ENHANCEMENT.md`
- Testing Guide: `docs/COUNTDOWN-BATCH-TESTING.md`
- Summary: `docs/COUNTDOWN-BATCH-SUMMARY.md`
- This Quick Reference: `docs/COUNTDOWN-BATCH-QUICK-REF.md`

## Sample Request/Response

### Create Request

```json
{
  "name": "Advanced English",
  "startDate": "2025-12-01",
  "startTime": "10:00",
  "endDate": "2025-12-20",
  "endTime": "12:00",
  "instructor": "Dr. John Doe",
  "locationMode": "Hybrid",
  "locationAddress": "Jl. Test No. 123",
  "price": 3500000,
  "registrationDeadline": "2025-11-28",
  "targetStudents": 40
}
```

### Success Response

```json
{
  "success": true,
  "message": "Countdown batch created successfully",
  "data": {
    "id": 6,
    "name": "Advanced English",
    "start_date": "2025-11-30T16:00:00.000Z",
    "end_date": "2025-12-19T16:00:00.000Z",
    "instructor": "Dr. John Doe",
    "location_mode": "Hybrid",
    "location_address": "Jl. Test No. 123",
    "price": 3500000.0,
    "registration_deadline": "2025-11-27T16:00:00.000Z",
    "target_students": 40,
    "current_students": 0,
    "status": "Upcoming",
    "visibility": "Public",
    "created_at": "2025-10-30T16:06:52.000Z",
    "updated_at": "2025-10-30T16:06:52.000Z"
  }
}
```

---

**Quick Reference Version**: 1.0  
**Last Updated**: October 30, 2025

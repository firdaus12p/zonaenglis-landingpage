# Modal Flow Fix & Error Handling Enhancement

## Overview
Memperbaiki flow modal di PromoHub dan menambahkan error handling untuk kasus nomor telepon yang sudah digunakan. Menambahkan fitur delete lead di admin dashboard agar user bisa menggunakan nomornya lagi setelah data dihapus.

## Problems Fixed

### 1. Modal Form Double Submission
**Problem**: 
- User harus submit form 2 kali
- Modal form tetap muncul setelah success modal
- Flow tidak smooth

**Root Cause**:
- `UserInfoFormModal` memanggil `onClose()` di `handleSubmit`
- Parent component juga memanggil `setIsModalOpen(false)`
- Double closing menyebabkan state conflict

**Solution**:
```typescript
// BEFORE - UserInfoFormModal handleSubmit
onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim() });
onClose(); // ❌ This caused the problem

// AFTER
onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim() });
// ✅ Let parent handle closing
```

Parent sudah handle modal close di `handleUserDataSubmit`:
```typescript
setIsModalOpen(false); // Close form modal
setShowSuccessModal(true); // Show success modal
```

### 2. No Error Feedback for Duplicate Phone Numbers
**Problem**:
- Backend returns 429 error when phone already used
- User tidak tahu kenapa kode tidak applied
- No visual feedback

**Solution**: Added ErrorModal component

## Implementation Details

### Frontend Changes (PromoHub.tsx)

#### 1. New State Variables
```typescript
const [showErrorModal, setShowErrorModal] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
```

#### 2. New Error Modal Component
```typescript
const ErrorModal = ({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-xl animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>

          {/* Error Message */}
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            Nomor Sudah Digunakan
          </h3>
          <p className="text-sm text-slate-600 mb-4">{message}</p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
```

**Features**:
- Red error icon (XCircle from lucide-react)
- Clear error message
- Close button untuk dismiss
- Consistent styling dengan success modal

#### 3. Enhanced Error Handling in handleApply
```typescript
const trackData = await trackResponse.json();

if (trackData.success) {
  console.log("✅ Data berhasil dikirim ke admin dashboard!");
} else if (trackResponse.status === 429) {
  // Phone number already used today
  console.error("❌ Phone already used:", trackData.error);
  
  // Clear user data from state and sessionStorage
  setUserData(null);
  sessionStorage.removeItem("zonaenglis_user_data");
  
  // Show error modal
  setErrorMessage(
    trackData.error || 
    "Nomor ini sudah menggunakan kode affiliate hari ini. Gunakan nomor lain atau hubungi admin untuk menghapus data."
  );
  setShowErrorModal(true);
  
  // Don't apply the code
  return;
}
```

**Flow**:
1. Detect 429 status code from backend
2. Clear user data (allows re-entry with different number)
3. Show error modal with message
4. Prevent code application
5. User can close modal and try again with different number

#### 4. Added Icon Import
```typescript
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
```

#### 5. JSX Addition
```tsx
{/* Error Modal */}
<ErrorModal
  isOpen={showErrorModal}
  message={errorMessage}
  onClose={() => {
    setShowErrorModal(false);
    setErrorMessage("");
  }}
/>
```

### Backend Changes (affiliate.js)

#### New DELETE Endpoint
```javascript
/**
 * DELETE /api/affiliate/lead/:usage_id
 * Delete a tracked affiliate usage (for admin to remove duplicate/spam entries)
 * This allows users to use their phone number again after admin removes their data
 */
router.delete("/lead/:usage_id", async (req, res) => {
  try {
    const { usage_id } = req.params;

    // Delete the affiliate usage record
    const [result] = await db.query(
      "DELETE FROM affiliate_usage WHERE id = ?",
      [usage_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Affiliate usage record not found",
      });
    }

    res.json({
      success: true,
      message: "Affiliate usage deleted successfully",
      deleted_id: parseInt(usage_id),
    });
  } catch (error) {
    console.error("❌ Error deleting affiliate usage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete affiliate usage",
    });
  }
});
```

**Features**:
- Deletes affiliate_usage record by ID
- Returns 404 if not found
- Returns success with deleted_id
- Allows user to use phone number again

### Admin Dashboard Changes (Ambassadors.tsx)

#### 1. New Function: handleDeleteLead
```typescript
const handleDeleteLead = async (leadId: number) => {
  if (
    !confirm(
      "Apakah Anda yakin ingin menghapus lead ini? User akan bisa menggunakan nomor ini lagi."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/affiliate/lead/${leadId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (data.success && selectedAmbassador) {
      // Refresh leads and stats
      fetchAffiliateLeads(selectedAmbassador);
      fetchAffiliateStats(selectedAmbassador);
      console.log("✅ Lead deleted successfully");
    } else {
      alert("Gagal menghapus lead: " + (data.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error deleting lead:", error);
    alert("Gagal menghapus lead. Coba lagi.");
  }
};
```

#### 2. Added Delete Button to Leads Table
```tsx
<button
  onClick={() => handleDeleteLead(lead.id)}
  className="text-red-600 hover:text-red-700"
  title="Delete Lead"
>
  <Trash2 className="h-4 w-4" />
</button>
```

**Table Actions Now Include**:
1. Notify (Green) - Send WhatsApp to ambassador
2. Edit (Gray) - Update lead status
3. Delete (Red) - Remove lead ← NEW

## Complete User Flows

### Flow 1: Successful First-Time Submission
1. User enters affiliate code
2. Clicks "Gunakan Kode"
3. Form modal appears
4. User fills name, phone, email
5. Clicks "Kirim Data"
6. **Form modal closes immediately**
7. **Success modal appears** (3 seconds)
8. Success modal auto-closes
9. Code validation runs
10. Code applied successfully

### Flow 2: Phone Number Already Used (Error Case)
1. User enters affiliate code
2. Clicks "Gunakan Kode"
3. Form modal appears
4. User fills data (phone already used today)
5. Clicks "Kirim Data"
6. Form modal closes
7. Success modal appears briefly
8. Backend returns 429 error
9. **Error modal replaces success modal**
10. Shows: "Nomor Sudah Digunakan" + error message
11. User data cleared from sessionStorage
12. User can:
    - Close modal and try different number, OR
    - Contact admin to delete their data

### Flow 3: Admin Deletes Lead (Enables Re-use)
1. Admin goes to /admin/ambassadors
2. Scrolls to Affiliate Tracking Dashboard
3. Selects ambassador
4. Views leads table
5. Clicks **Trash icon** on duplicate/spam lead
6. Confirms deletion
7. Lead removed from database
8. **User can now use that phone number again**

## Error Handling Matrix

| Scenario | Status | Modal | User Data | Code Applied |
|----------|--------|-------|-----------|--------------|
| Valid first use | 200 | Success | Saved | ✅ Yes |
| Phone used today | 429 | Error | Cleared | ❌ No |
| Invalid code | 404 | - | Saved | ❌ No |
| Network error | 500 | - | Saved | ❌ No |
| After admin delete | 200 | Success | Saved | ✅ Yes |

## Database Impact

### affiliate_usage Table
- DELETE operation removes record completely
- Phone number becomes available for reuse
- No soft delete (hard delete for clean slate)

### Example Delete Query
```sql
DELETE FROM affiliate_usage WHERE id = ?
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| POST | `/api/affiliate/track` | Track affiliate usage | Success or 429 if duplicate |
| DELETE | `/api/affiliate/lead/:id` | Delete lead record | Success with deleted_id |
| GET | `/api/affiliate/leads/:ambassador_id` | Get leads list | Array of leads |
| GET | `/api/affiliate/stats/:ambassador_id` | Get stats | Stats object |

## Testing Scenarios

### Test 1: Normal Flow
- ✅ Submit form once
- ✅ See success modal
- ✅ Success modal auto-closes after 3s
- ✅ Code applied
- ✅ No form re-appearance

### Test 2: Duplicate Phone
- ✅ Use same phone twice
- ✅ Second attempt shows error modal
- ✅ Error modal has close button
- ✅ User data cleared after error
- ✅ Can retry with different number

### Test 3: Admin Delete
- ✅ Admin can see delete button (red trash icon)
- ✅ Confirm dialog appears
- ✅ Lead deleted from table
- ✅ Stats updated (count decreases)
- ✅ User can use number again

## UI/UX Improvements

### Visual Consistency
Both modals share:
- Same size (`max-w-sm`)
- Same padding (`p-8`)
- Same border radius (`rounded-2xl`)
- Same fade-in animation
- Same overlay (`bg-black/50`)

### Color Coding
- Success: Emerald/Green (✅ positive action)
- Error: Red (⛔ blocked action)
- Consistent with app design system

### User Guidance
- Error message explains what happened
- Suggests solution (different number OR contact admin)
- Clear button to close and try again

## Benefits

### For Users
1. **Clear Feedback**: Know exactly what happened
2. **Recovery Path**: Can fix duplicate phone issue
3. **Smooth Flow**: No confusing double submissions

### For Admins
1. **Data Control**: Can remove spam/duplicate entries
2. **User Support**: Can help users who made mistakes
3. **Clean Database**: Remove test data easily

### For Ambassadors
1. **Accurate Tracking**: No duplicate leads
2. **Real Conversion Data**: Stats reflect actual users
3. **Less Spam**: Admin can clean up bad data

## Files Modified

### Frontend
1. `src/PromoHub.tsx`
   - Fixed UserInfoFormModal submit flow
   - Added ErrorModal component
   - Added error state management
   - Enhanced error handling in handleApply
   - Added XCircle icon import

2. `src/pages/admin/Ambassadors.tsx`
   - Added handleDeleteLead function
   - Added delete button to leads table
   - Added confirmation dialog

### Backend
3. `backend/routes/affiliate.js`
   - Added DELETE /api/affiliate/lead/:usage_id endpoint

## Migration Notes

No database migration required - uses existing `affiliate_usage` table.

## Future Enhancements

1. **Bulk Delete**: Select multiple leads to delete at once
2. **Delete Confirmation Modal**: Replace browser confirm with custom modal
3. **Undo Delete**: Soft delete with restore option
4. **Audit Log**: Track who deleted what and when
5. **Auto-Cleanup**: Scheduled job to remove old duplicate entries
6. **Rate Limiting**: More sophisticated duplicate detection
7. **Phone Validation**: Check format before submission

## Conclusion

These changes create a smooth, error-resilient user experience with proper feedback and admin control. Users get clear messages when something goes wrong, and admins have the tools to fix data issues, creating a win-win for everyone involved.

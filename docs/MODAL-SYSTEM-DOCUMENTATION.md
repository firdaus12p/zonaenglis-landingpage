# Modal System Implementation - Zona English Landing Page

## Overview

Implementasi sistem modal konfirmasi dan sukses yang konsisten untuk meningkatkan UX di seluruh aplikasi admin dan user-facing pages.

## Components Created

### 1. ConfirmModal (`src/components/ConfirmModal.tsx`)

Modal konfirmasi reusable untuk aksi-aksi yang memerlukan validasi user.

**Props:**

- `isOpen: boolean` - Status modal terbuka/tertutup
- `onClose: () => void` - Handler untuk menutup modal
- `onConfirm: () => void` - Handler untuk konfirmasi aksi
- `title: string` - Judul modal
- `message: string` - Pesan konfirmasi
- `confirmText?: string` - Text tombol konfirmasi (default: "Konfirmasi")
- `cancelText?: string` - Text tombol batal (default: "Batal")
- `variant?: "danger" | "warning"` - Variant styling (default: "danger")

**Variants:**

- **danger**: Red theme - untuk delete actions
- **warning**: Amber theme - untuk cancel/discard changes

**Usage Example:**

```tsx
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [itemToDelete, setItemToDelete] = useState<number | null>(null);

const handleDeleteClick = (id: number) => {
  setItemToDelete(id);
  setShowDeleteModal(true);
};

const handleDelete = async () => {
  if (!itemToDelete) return;
  // Delete logic here
};

<ConfirmModal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }}
  onConfirm={handleDelete}
  title="Hapus Data?"
  message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
  confirmText="Hapus"
  cancelText="Batal"
  variant="danger"
/>;
```

### 2. SuccessModal (`src/components/SuccessModal.tsx`)

Modal feedback sukses untuk menginformasikan user bahwa operasi berhasil.

**Props:**

- `isOpen: boolean` - Status modal terbuka/tertutup
- `onClose: () => void` - Handler untuk menutup modal
- `title?: string` - Judul modal (default: "Berhasil!")
- `message?: string` - Pesan sukses (default: "Operasi berhasil dilakukan.")
- `autoClose?: boolean` - Auto-close modal (default: true)
- `autoCloseDuration?: number` - Durasi auto-close dalam ms (default: 3000)

**Features:**

- Green theme dengan CheckCircle icon
- Auto-close setelah durasi tertentu (configurable)
- Smooth fade-in animation
- Optional manual close button (jika autoClose = false)

**Usage Example:**

```tsx
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

const handleSubmit = async () => {
  // Submit logic...
  if (response.ok) {
    setSuccessMessage("Data berhasil disimpan!");
    setShowSuccessModal(true);
  }
};

<SuccessModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  title="Berhasil!"
  message={successMessage}
  autoClose={true}
  autoCloseDuration={3000}
/>;
```

## Pages Updated

### ✅ Completed

1. **PromoClaims.tsx** - Delete claim confirmation
2. **CountdownBatch.tsx** - Delete batch confirmation + success feedback
3. **CountdownBatchForm.tsx** - Cancel changes warning + submit success

### Patterns Implemented

#### Delete Pattern

```tsx
// State
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [itemToDelete, setItemToDelete] = useState<number | null>(null);
const [showSuccessModal, setShowSuccessModal] = useState(false);

// Handlers
const handleDeleteClick = (id: number) => {
  setItemToDelete(id);
  setShowDeleteModal(true);
};

const deleteItem = async () => {
  if (!itemToDelete) return;

  try {
    const response = await fetch(`${API_BASE}/endpoint/${itemToDelete}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setShowSuccessModal(true);
      fetchData(); // Refresh data
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// JSX
<button onClick={() => handleDeleteClick(item.id)}>
  Delete
</button>

<ConfirmModal
  isOpen={showDeleteModal}
  onClose={() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }}
  onConfirm={deleteItem}
  title="Hapus Data?"
  message="Apakah Anda yakin ingin menghapus data ini?"
  variant="danger"
/>

<SuccessModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  title="Berhasil Dihapus!"
  message="Data berhasil dihapus dari sistem."
/>
```

#### Form Submit Pattern

```tsx
// State
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

// Handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setSuccessMessage("Data berhasil disimpan!");
      setShowSuccessModal(true);

      // Optional: Redirect after success
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// JSX
<SuccessModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  title="Berhasil!"
  message={successMessage}
  autoClose={true}
  autoCloseDuration={2000}
/>;
```

#### Cancel/Discard Changes Pattern

```tsx
// State
const [showCancelModal, setShowCancelModal] = useState(false);

// Handlers
const handleCancelClick = () => {
  setShowCancelModal(true);
};

const handleCancelConfirm = () => {
  navigate("/admin/dashboard");
};

// JSX
<button onClick={handleCancelClick}>
  Cancel
</button>

<ConfirmModal
  isOpen={showCancelModal}
  onClose={() => setShowCancelModal(false)}
  onConfirm={handleCancelConfirm}
  title="Batalkan Perubahan?"
  message="Apakah Anda yakin ingin membatalkan? Semua perubahan akan hilang."
  confirmText="Ya, Batalkan"
  cancelText="Tidak"
  variant="warning"
/>
```

## Design System

### Color Variants

- **Danger (Red)**: `bg-red-100`, `text-red-600`, `bg-red-600 hover:bg-red-700`
- **Warning (Amber)**: `bg-amber-100`, `text-amber-600`, `bg-amber-600 hover:bg-amber-700`
- **Success (Green)**: `bg-emerald-100`, `text-emerald-600`, `bg-emerald-600 hover:bg-emerald-700`

### Icons

- **Danger**: `XCircle` dari lucide-react
- **Warning**: `AlertTriangle` dari lucide-react
- **Success**: `CheckCircle2` dari lucide-react

### Animation

- Fade-in animation: `animate-fade-in` (defined in tailwind.config.js)
- Smooth transitions: `transition-colors`

## Benefits

1. **Consistency**: Semua modal menggunakan design pattern yang sama
2. **User Experience**: Feedback yang jelas untuk setiap aksi
3. **Safety**: Konfirmasi untuk aksi-aksi destructive (delete, cancel)
4. **Accessibility**: Modal dengan backdrop dan proper close handlers
5. **Reusability**: Component yang dapat digunakan di seluruh aplikasi

## Migration Notes

### From Native confirm() to ConfirmModal

**Before:**

```tsx
const deleteItem = async (id: number) => {
  if (!confirm("Are you sure?")) return;
  // Delete logic...
};
```

**After:**

```tsx
const handleDeleteClick = (id: number) => {
  setItemToDelete(id);
  setShowDeleteModal(true);
};

const deleteItem = async () => {
  if (!itemToDelete) return;
  // Delete logic...
};
```

### From alert() to SuccessModal

**Before:**

```tsx
if (response.ok) {
  alert("Success!");
}
```

**After:**

```tsx
if (response.ok) {
  setSuccessMessage("Data berhasil disimpan!");
  setShowSuccessModal(true);
}
```

## Next Steps

### Remaining Pages to Update

- Ambassadors.tsx (handleDeleteAmbassador, handleDeleteLead)
- ArticleComments.tsx (handleDelete)
- Articles.tsx (handleDelete + handleSubmit success)
- Gallery.tsx (handleDelete + handleSubmit success)
- Programs.tsx (handleDelete)
- PromoCodes.tsx (handleDelete, handleDeletePromoLead)
- Users.tsx (handleDelete + handleSubmit success)
- PromoCodeForm.tsx (handleSubmit success)
- PromoForm.tsx (handleSubmit success)
- AmbassadorForm.tsx (handleSubmit success)

## Export

Components exported in `src/components/index.ts`:

```tsx
export { ConfirmModal } from "./ConfirmModal";
export { SuccessModal } from "./SuccessModal";
```

## Testing

✅ PromoClaims.tsx - Delete dengan confirm modal
✅ CountdownBatch.tsx - Delete dengan confirm dan success modal
✅ CountdownBatchForm.tsx - Cancel warning dan submit success

---

**Created**: January 2025
**Last Updated**: January 2025

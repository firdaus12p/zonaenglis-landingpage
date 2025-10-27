# Zona English Landing Page - Instruksi Coding AI

## Gambaran Proyek

Ini adalah proyek landing page **React + TypeScript + Tailwind CSS** untuk Zona English, sebuah institusi pembelajaran bahasa Inggris. Proyek ini menggunakan **Vite** sebagai build tool dan menargetkan aplikasi single-page yang modern dan responsif.

## Arsitektur & Struktur

### Backend (Express.js API)

- **Lokasi**: `/backend` folder
- **Entry Point**: `server.js` (ES Modules)
- **Database**: MySQL via connection pool (`backend/db/connection.js`)
- **Routes**:
  - `routes/ambassadors.js` - Ambassador CRUD
  - `routes/promos.js` - Promo code management
  - `routes/validate.js` - Validation endpoints
- **Port**: 3001 (http://localhost:3001/api)
- **Environment**: `.env` file (use `.env.example` as template)

### Frontend (React)

- **Lokasi**: `/src` folder
- **Entry Point**: `main.tsx`
- **Main Components**:
  - `LearnMoreZE.tsx` - Main landing page
  - `PromoHub.tsx` - Ambassador promo hub (API integrated)
  - `PromoCenter.tsx` - Promo center page
- **Styling**: Tailwind utility classes
- **Icons**: Lucide React
- **Port**: 5173 (http://localhost:5173)

### Documentation

- **Lokasi**: `/docs` folder (ALL documentation files)
- **Key Files**:
  - `PROJECT-STRUCTURE.md` - Complete project organization
  - `API-INTEGRATION-GUIDE.md` - API endpoints guide
  - `code.md` - React component code reference
  - `prompt.md` - Setup instructions

### Serena MCP

- **Lokasi**: `/.serena/memories`
- **Purpose**: AI-readable project context
- **Files**: project_overview.md, project_structure.md, tech_stack.md, etc.

## Pola dan Konvensi Utama

### Struktur Komponen

```tsx
// Komponen mengikuti pola ini dengan props TypeScript
const ComponentName = ({
  prop1,
  prop2,
}: {
  prop1: string;
  prop2: string[];
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    {/* Konten */}
  </div>
);
```

### Skema Warna

- **Primary**: Varian biru (`blue-700`, `blue-600`, `blue-50`)
- **Accent**: Emerald untuk CTA WhatsApp (`emerald-500`, `emerald-600`)
- **Text**: Varian slate (`slate-900`, `slate-600`, `slate-500`)
- **Status**: Kuning untuk bintang (`yellow-500`)

### Konstanta CTA

Semua link call-to-action didefinisikan sebagai konstanta di bagian atas:

```tsx
const CTA_WHATSAPP = "https://wa.me/...";
const CTA_REGISTER = "#daftar";
const CTA_SCHEDULE = "#jadwal";
const CTA_TRYFREE = "#trial";
```

## Alur Kerja Pengembangan

### Perintah Setup

**Frontend**:

```bash
# From root directory
npm install
npm run dev       # Start Vite dev server
```

**Backend**:

```bash
cd backend
npm install
cp .env.example .env    # Configure database
npm run dev            # Start Express with --watch
```

### Dependensi yang Dibutuhkan

**Frontend**:

- React 18 + TypeScript (via Vite template)
- Tailwind CSS 4.x untuk styling
- Lucide React untuk ikon
- Vite 7.x sebagai build tool

**Backend**:

- Express.js 5.x (with ES Modules)
- mysql2 untuk MySQL database
- cors untuk CORS middleware
- dotenv untuk environment variables

## Panduan Konten

### Pola Responsiveness

Semua bagian mengikuti pola grid responsif ini:

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
```

### Penggunaan Ikon

Ikon dari Lucide React digunakan secara konsisten:

- `CheckCircle2` untuk bullet points
- `ArrowRight` untuk CTA
- `Star` untuk testimonial
- `MessageCircle` untuk chat/kontak

### Struktur Bagian

Setiap bagian utama mengikuti pola ini:

1. Header dengan judul dan link CTA opsional
2. Layout grid dengan breakpoint responsif
3. Padding konsisten (`py-12`) dan max-width (`max-w-6xl`)

## Konteks Bisnis

- **Target audience**: Usia 3-25+ (pembelajar bahasa Inggris)
- **Fitur utama**: Metode NBSN, AI Coach, kelas kecil, sistem reward
- **Lokasi**: Kolaka, Makassar, Kendari (Indonesia) + online
- **Integrasi**: Bagian dari ekosistem yang lebih besar (Hira Space, Doctorbee, dll.)

## Saat Melakukan Perubahan

1. **Update CTA**: Semua link placeholder di konstanta perlu URL asli
2. **Pertahankan desain responsif**: Test di breakpoint mobile, tablet, desktop
3. **Jaga konsistensi komponen**: Ikuti pola komponen yang ada
4. **Pertahankan aksesibilitas**: Pertahankan hierarki heading dan alt text yang tepat
5. **Update testimonial**: Ganti dengan feedback pelanggan asli jika tersedia

## Prioritas File untuk AI

1. **docs/PROJECT-STRUCTURE.md** - Organisasi folder dan navigasi
2. **docs/API-INTEGRATION-GUIDE.md** - API endpoints dan integrasi
3. **docs/code.md** - Kode komponen React utama
4. **docs/prompt.md** - Instruksi setup dan pengembangan proyek
5. **.serena/memories/project_structure.md** - Serena AI context
6. **README.md** - Dokumentasi utama proyek

**Catatan**: Fokus pada pendekatan fullstack dengan backend API terpisah untuk data persistence.

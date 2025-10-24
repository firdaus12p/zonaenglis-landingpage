# Zona English Landing Page - Instruksi Coding AI

## Gambaran Proyek

Ini adalah proyek landing page **React + TypeScript + Tailwind CSS** untuk Zona English, sebuah institusi pembelajaran bahasa Inggris. Proyek ini menggunakan **Vite** sebagai build tool dan menargetkan aplikasi single-page yang modern dan responsif.

## Arsitektur & Struktur

- **Komponen React single-page**: `LearnMoreZE.tsx` berisi seluruh landing page
- **Pengembangan berbasis dokumentasi**: Kode didokumentasikan di `code.md`, instruksi setup di `prompt.md`
- **Desain berbasis komponen**: Menggunakan komponen kecil yang dapat digunakan ulang (`Stat`, `Pill`, `Feature`, `ProgramCard`, `Testimonial`)
- **Styling Tailwind-first**: Semua styling menggunakan utility classes Tailwind dengan palet warna khusus

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

```bash
npm create vite@latest zonaenglish-landing -- --template react-ts
cd zonaenglish-landing
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
npm run dev
```

### Dependensi yang Dibutuhkan

- **React + TypeScript** (via template Vite)
- **Tailwind CSS** untuk styling
- **Lucide React** untuk ikon (library ikon yang konsisten)
- **PostCSS + Autoprefixer** untuk pemrosesan CSS

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

## Prioritas File

1. `code.md` - Berisi kode komponen React utama
2. `prompt.md` - Berisi instruksi setup dan pengembangan proyek
3. Fokus pada pendekatan komponen single-file untuk kesederhanaan

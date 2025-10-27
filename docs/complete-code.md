# Zona English Landing Page - Complete Code Documentation

## Struktur Aplikasi

Aplikasi ini sekarang terdiri dari 3 halaman utama:

1. **Home Page** (`LearnMoreZE.tsx`) - Landing page utama dengan informasi program
2. **Promo Center** (`PromoCenter.tsx`) - Halaman promo dan undangan belajar gratis
3. **Promo Hub** (`PromoHub.tsx`) - Halaman partnership, ambassador, dan affiliate

## File Utama

### 1. App.tsx - Routing & Navigation

Mengatur navigasi antar halaman dengan state management sederhana.

### 2. LearnMoreZE.tsx - Home Page

Landing page utama dengan:

- Hero section dengan CTA
- Program berdasarkan usia
- Testimonial dan cara daftar
- Footer dengan kontak

### 3. PromoCenter.tsx - Promo Page

Halaman khusus promo dengan:

- Countdown timer untuk batch pendaftaran
- Kartu program promo dengan kuota
- Galeri kegiatan dengan filter
- Peta lokasi cabang interaktif
- FAQ dan syarat ketentuan

### 4. PromoHub.tsx - Partnership Page

Halaman partnership dengan:

- Stats dashboard partner
- Profil ambassador aktif
- Filter program partnership
- Success stories
- FAQ partnership

## Teknologi yang Digunakan

- **React 19** + **TypeScript**
- **Vite 7** sebagai build tool
- **Tailwind CSS 4** untuk styling
- **Lucide React** untuk ikon
- **State management** dengan useState Hook

## Setup & Development

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## Features

### Navigation

- Single-page application dengan client-side routing
- Floating buttons untuk akses cepat ke promo pages
- Sticky navigation bar dengan breadcrumb
- Responsive design di semua breakpoint

### Interactive Components

- Countdown timer real-time untuk promo
- Image/video gallery dengan multiple media types
- Interactive map dengan multiple locations
- Filter system untuk program partnership
- Success metrics dengan animated counters

### Content Management

- Semua CTA links terpusat dalam konstanta
- Modular component structure
- TypeScript interfaces untuk type safety
- Reusable components (Badge, Card, Stats, dll)

### Responsive Design

- Mobile-first approach
- Grid system yang adaptif
- Proper breakpoint handling
- Touch-friendly UI elements

## Customization Notes

### CTA Links

Semua link placeholder perlu diganti dengan URL asli:

```tsx
const CTA_WHATSAPP = "https://wa.me/..."; // Real WhatsApp link
const CTA_REGISTER = "#daftar"; // Real registration form
const CTA_SCHEDULE = "#jadwal"; // Real schedule page
```

### Brand Colors

Konsisten menggunakan skema warna:

- **Primary**: Blue variants (blue-50 to blue-900)
- **Accent**: Emerald untuk WhatsApp CTA
- **Secondary**: Purple untuk Promo Hub
- **Text**: Slate variants untuk hierarki teks

### Media Assets

- Semua gambar menggunakan Unsplash placeholder
- Video menggunakan Coverr free videos
- YouTube embeds untuk demo/testimonial
- Replace dengan asset asli Zona English

## Performance Optimizations

- Lazy loading untuk media content
- Optimized bundle size dengan Vite
- Efficient re-renders dengan proper keys
- Responsive images dengan proper sizing

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement untuk older browsers

## Future Enhancements

1. **Backend Integration**

   - Real-time countdown synchronization
   - Dynamic content management
   - Form submissions dengan API

2. **Advanced Features**

   - Search functionality
   - User authentication
   - Progress tracking dashboard

3. **Performance**
   - Image optimization
   - Code splitting
   - Service worker untuk caching

## File Structure

```
src/
├── App.tsx                 # Main router & navigation
├── LearnMoreZE.tsx        # Home page component
├── PromoCenter.tsx        # Promo center page
├── PromoHub.tsx           # Partnership hub page
├── index.css              # Tailwind imports
└── main.tsx               # App entry point
```

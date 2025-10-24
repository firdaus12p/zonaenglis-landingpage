# Zona English Landing Page

Selamat datang di repositori landing page **Zona English** - institusi pembelajaran bahasa Inggris modern untuk usia 3-25+ tahun.

## 🚀 Quick Start

```bash
# Clone repository (jika dari git)
git clone <repository-url>
cd zonaenglis-landingpage

# Install dependencies
npm install

# Start development server
npm run dev
# Buka http://localhost:5173

# Build untuk production
npm run build

# Preview production build
npm run preview
```

## 📱 Fitur Utama

- **Responsive Design**: 100% responsif di semua device
- **Modern Stack**: React 19 + TypeScript + Tailwind CSS v4
- **Fast Performance**: Vite build tool untuk development dan build yang cepat
- **Clean Code**: ESLint untuk kualitas kode, Tailwind untuk styling konsisten
- **Single Page**: Semua konten dalam satu halaman untuk optimal loading

## 🎨 Design System

### Warna Utama

- **Primary**: Blue variants (`blue-700`, `blue-600`, `blue-50`)
- **Accent**: Emerald untuk WhatsApp CTAs (`emerald-500`, `emerald-600`)
- **Text**: Slate variants (`slate-900`, `slate-600`, `slate-500`)

### Breakpoints

- Mobile: Default (< 768px)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

## 📄 Struktur Konten

1. **Hero Section** - Value proposition utama + CTA
2. **About Section** - Kenapa Zona English + fitur + promo
3. **Programs Section** - Program berdasarkan usia
4. **Testimonials** - Review pelanggan
5. **How to Join** - Langkah pendaftaran
6. **Partners** - Ekosistem integration
7. **Footer** - Kontak dan sosial media

## 🔧 Teknologi

- **React 19.1.1** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.7** - Build tool
- **Tailwind CSS 4.1.16** - Styling
- **Lucide React** - Icons
- **ESLint** - Code quality

## 📝 Development

### Commands

```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview build
npm run lint    # Code linting
```

### File Structure

```
src/
├── LearnMoreZE.tsx    # Main landing page component
├── App.tsx            # App wrapper
├── main.tsx           # Entry point
└── index.css          # Tailwind directives
```

## 🚀 Deployment

1. Build production:

   ```bash
   npm run build
   ```

2. File hasil build ada di folder `dist/`

3. Upload `dist/` ke hosting provider atau:
   - Netlify: Drag & drop folder `dist`
   - Vercel: Connect repository
   - GitHub Pages: Upload ke branch `gh-pages`

## 📞 Support

Untuk pertanyaan teknis atau update konten, silakan hubungi tim development atau buat issue di repository ini.

---

**Zona English** - Belajar Inggris yang Seru & Efektif 🎯

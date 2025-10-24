# prompt.md — Zona English “LearnMoreZE” Landing Page (Full Project Setup)

## 🎯 Tujuan
Buat project **React + Tailwind CSS (TypeScript)** menggunakan **Vite** untuk menampilkan landing page modern bernama **LearnMoreZE**.  
Landing page ini harus **clean, modern, dan 100% responsif di semua device**.

---

## 🏗️ 1. Inisialisasi Project

```bash
npm create vite@latest zonaenglish-landing -- --template react-ts
cd zonaenglish-landing
npm install
```

---

## 🎨 2. Install Tailwind & Dependencies

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react
```

---

## ⚙️ 3. Konfigurasi Tailwind

**`tailwind.config.js`**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**`src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🧩 4. Buat File React Page

Buat file baru `src/LearnMoreZE.tsx` dan isi dengan kode berikut:

```tsx
import React from "react";
import { ArrowRight, CheckCircle2, Star, MessageCircle, MapPin, Phone, ShieldCheck, Rocket, CalendarCheck, Gift, Users, Video, BookOpen } from "lucide-react";

const CTA_WHATSAPP = "https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20konsultasi%20kelas";
const CTA_REGISTER = "#daftar";
const CTA_SCHEDULE = "#jadwal";
const CTA_TRYFREE = "#trial";

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-extrabold text-blue-900">{value}</div>
    <div className="text-sm text-blue-900/70">{label}</div>
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
    <ShieldCheck className="h-4 w-4" />
    {children}
  </span>
);

const Feature = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="mb-3 flex items-center gap-3">
      <div className="rounded-xl bg-blue-600/10 p-2">
        <Icon className="h-5 w-5 text-blue-700" />
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
    </div>
    <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
  </div>
);

const ProgramCard = ({ age, title, bullets }: { age: string; title: string; bullets: string[] }) => (
  <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-700">{age}</div>
      <h3 className="mb-3 text-lg font-bold text-slate-900">{title}</h3>
      <ul className="mb-4 space-y-2 text-sm text-slate-600">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-700" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
    <a href={CTA_REGISTER} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
      Lihat Detail & Daftar <ArrowRight className="h-4 w-4" />
    </a>
  </div>
);

const Testimonial = ({ quote, name, role }: { quote: string; name: string; role: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-2 text-yellow-500">
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
      <Star className="h-5 w-5 fill-yellow-500" />
    </div>
    <p className="mb-3 text-slate-700">“{quote}”</p>
    <div className="text-sm font-semibold text-slate-900">{name}</div>
    <div className="text-xs text-slate-500">{role}</div>
  </div>
);

export default function LearnMoreZE() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">
      {/* Semua konten section dimasukkan di sini (Hero, About, Program, Testimonial, Join, Partner, Footer) */}
    </main>
  );
}
```

---

## 🚀 5. Jalankan Server

```bash
npm run dev
```

Buka di browser: [http://localhost:5173](http://localhost:5173)

---

## 📱 6. Catatan Responsivitas

- Gunakan kelas Tailwind seperti `md:grid-cols-2`, `lg:grid-cols-4`, `sm:text-center`, dan `max-w-6xl` agar tampilan adaptif.  
- Pastikan semua gambar, video, dan elemen flex memiliki `w-full` atau `max-w-full`.
- Gunakan `grid` atau `flex-wrap` untuk penyesuaian mobile.

---

✅ Hasil akhir: Halaman **Zona English LearnMoreZE** yang responsif, ringan, dan siap deploy.

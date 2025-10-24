<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zona English — Promo Center (Makassar Pettarani)</title>
  <meta name="description" content="Undangan Belajar Gratis Kelas Premium: semua fasilitas premium, kelas kecil 8–12 siswa, kuota 100 peserta/batch. Countdown batch, peta cabang, dan galeri kegiatan.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans; }
    .glass { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .badge { display:inline-flex; align-items:center; gap:.25rem; border-radius:9999px; padding:.25rem .625rem; font-size:.75rem; font-weight:600; }
    .k-badge { border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8 }
    .gold { background: linear-gradient(135deg, #fff7ed, #fef3c7); border: 1px solid #fde68a; }
    .gold-text { background: linear-gradient(90deg, #b45309, #a16207); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .pill { border:1px solid #e2e8f0; background:#fff; }
    .tab-active { border-color:#1d4ed8 !important; color:#1d4ed8 !important; background:#eff6ff !important; }
    .hidden { display:none; }
    .aspect-video { aspect-ratio: 16 / 9; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">
  <!-- HERO -->
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white"></div>
    <div class="mx-auto max-w-6xl px-4 pt-10 pb-6 md:pt-16 md:pb-10">
      <div class="rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-md glass">
        <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div class="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              🎉 Grand Opening • Makassar Pettarani
            </div>
            <h1 class="text-3xl font-extrabold leading-tight text-slate-900 md:text-4xl">Zona English — <span class="text-blue-700">Promo Center</span></h1>
            <p class="mt-2 max-w-2xl text-slate-600">Semua program promo & <em>Undangan Belajar Gratis</em> ada di sini. Pilih sesuai usia & kebutuhan, klaim sekarang sebelum kuota habis.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="#daftar" class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Daftar Sekarang ➜</a>
            <a href="https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20klaim%20promo%20Makassar%20Pettarani" class="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Chat Admin (WA)</a>
          </div>
        </div>

        <!-- PREMIUM RIBBON IN HERO -->
        <div class="mt-5 rounded-2xl gold p-4">
          <div class="text-xs font-semibold uppercase tracking-wider gold-text">Undangan Belajar Gratis — Kelas Premium</div>
          <p class="mt-1 text-sm text-slate-700">
            Dapatkan <b>semua fasilitas kelas premium</b> • Kelas kecil <b>8–12 siswa</b> • <b>Kuota 100 peserta</b> per batch.
            Kamu akan bilang: <i>“Belajar Inggris itu mudah, seru, dan nggak bikin stres!”</i>
          </p>
        </div>

        <!-- COUNTDOWN BAR -->
        <div class="mt-4 rounded-2xl border border-blue-100 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="text-sm text-slate-700">
            ⏳ <b>Hitung Mundur Batch A</b> • Mulai <span class="font-semibold">03 Nov 2025, 09:00 WITA</span>
          </div>
          <div id="countdown" class="grid grid-flow-col auto-cols-fr gap-2 text-center">
            <div class="rounded-xl pill px-3 py-2">
              <div id="cd-days" class="text-xl font-extrabold text-slate-900">0</div>
              <div class="text-[10px] uppercase tracking-wide text-slate-500">Hari</div>
            </div>
            <div class="rounded-xl pill px-3 py-2">
              <div id="cd-hours" class="text-xl font-extrabold text-slate-900">0</div>
              <div class="text-[10px] uppercase tracking-wide text-slate-500">Jam</div>
            </div>
            <div class="rounded-xl pill px-3 py-2">
              <div id="cd-mins" class="text-xl font-extrabold text-slate-900">0</div>
              <div class="text-[10px] uppercase tracking-wide text-slate-500">Menit</div>
            </div>
            <div class="rounded-xl pill px-3 py-2">
              <div id="cd-secs" class="text-xl font-extrabold text-slate-900">0</div>
              <div class="text-[10px] uppercase tracking-wide text-slate-500">Detik</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- PREMIUM SECTION -->
  <section class="mx-auto max-w-6xl px-4 pb-6">
    <div class="rounded-3xl gold p-6 shadow-sm">
      <div class="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Kelas Premium Gratis</div>
      <h2 class="text-2xl font-extrabold gold-text">Rasakan Pengalaman Kelas Premium, Tanpa Biaya</h2>
      <p class="mt-2 text-slate-700 max-w-3xl">
        Biasanya berbayar jutaan rupiah — sekarang <b>gratis</b> untuk peserta terpilih. Kami menjawab kendala yang sering kamu alami:
        bingung grammar, tidak percaya diri, cepat lupa kosakata. Dengan metode <b>NBSN</b> + <b>AI Coach</b>, belajar jadi menyenangkan dan progres terasa.
      </p>
      <div class="mt-4 grid gap-4 md:grid-cols-3">
        <div class="rounded-xl border border-amber-200 bg-white p-4">
          <div class="text-sm font-semibold">Fasilitas Premium</div>
          <ul class="mt-2 space-y-1 text-sm text-slate-700">
            <li>✅ Ruang belajar nyaman & interaktif</li>
            <li>✅ Modul & video modern</li>
            <li>✅ Project showcase + sertifikat</li>
          </ul>
        </div>
        <div class="rounded-xl border border-amber-200 bg-white p-4">
          <div class="text-sm font-semibold">Kelas Kecil</div>
          <p class="mt-2 text-sm text-slate-700">Hanya <b>8–12 siswa/kelas</b> agar guru fokus membimbing satu per satu.</p>
          <p class="mt-1 text-sm text-slate-700"><b>Kuota batch:</b> 100 peserta.</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-white p-4">
          <div class="text-sm font-semibold">Hasil yang Terasa</div>
          <ul class="mt-2 space-y-1 text-sm text-slate-700">
            <li>✅ “Grammar jadi masuk akal”</li>
            <li>✅ “Berani ngomong & lebih lancar”</li>
            <li>✅ “Belajar terasa fun, nggak stres”</li>
          </ul>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-3">
        <a href="#daftar" class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Ambil Slot Premium ➜</a>
        <a href="https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20klaim%20Undangan%20Belajar%20Gratis%20Kelas%20Premium" class="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">Tanya Admin</a>
      </div>
    </div>
  </section>

  <!-- PROMO GRID -->
  <section class="mx-auto max-w-6xl px-4 pb-4">
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Paket Promo Aktif</h2>
      <p class="mt-1 text-slate-600">Khusus cabang Makassar Pettarani + kelas online nasional.</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Remaja -->
      <div class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="badge" style="border:1px solid #bbf7d0;background:#f0fdf4;color:#15803d">Undangan Belajar Gratis</span>
            <span class="badge k-badge">Makassar (Offline)</span>
          </div>
          <h3 class="text-lg font-bold">1 Bulan Kelas Reguler — Remaja (14–17 th)</h3>
          <ul class="mt-2 space-y-2 text-sm text-slate-700">
            <li>🗓️ <b>Batch A:</b> 03–28 Nov 2025 • <b>Kuota:</b> 30</li>
            <li>🗓️ <b>Batch B:</b> 01–26 Des 2025 • <b>Kuota:</b> 30</li>
            <li>🗓️ <b>Batch C:</b> 05–30 Jan 2026 • <b>Kuota:</b> 30</li>
            <li>🎯 Fokus: Speaking, Confidence, Daily English</li>
          </ul>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <a href="#daftar" class="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Klaim Sekarang</a>
          <a class="text-sm font-semibold text-blue-700 hover:underline" href="https://wa.me/6282188080688?text=Saya%20klaim%20Undangan%201%20Bulan%20Reguler%2014-17">Tanya Admin</a>
        </div>
      </div>

      <!-- Anak -->
      <div class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="badge" style="border:1px solid #bbf7d0;background:#f0fdf4;color:#15803d">Undangan Belajar Gratis</span>
            <span class="badge k-badge">Makassar (Offline)</span>
          </div>
          <h3 class="text-lg font-bold">2 Minggu Kelas Reguler — Anak (4–12 th)</h3>
          <ul class="mt-2 space-y-2 text-sm text-slate-700">
            <li>🗓️ <b>Batch A:</b> 03–15 Nov 2025 • <b>Kuota:</b> 36</li>
            <li>🗓️ <b>Batch B:</b> 17–29 Nov 2025 • <b>Kuota:</b> 36</li>
            <li>🗓️ <b>Batch C:</b> 01–13 Des 2025 • <b>Kuota:</b> 36</li>
            <li>🎯 Fokus: Fun Phonics, Vocabulary, Listening</li>
          </ul>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <a href="#daftar" class="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Klaim Sekarang</a>
          <a class="text-sm font-semibold text-blue-700 hover:underline" href="https://wa.me/6282188080688?text=Saya%20klaim%202%20Minggu%20Reguler%204-12">Tanya Admin</a>
        </div>
      </div>

      <!-- Intensive -->
      <div class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="badge" style="border:1px solid #ddd6fe;background:#f5f3ff;color:#6d28d9">Kelas Intensive</span>
            <span class="badge k-badge">Makassar (Offline)</span>
          </div>
          <h3 class="text-lg font-bold">1 Minggu Intensive (Senin–Jumat) — 3–5 jam/hari</h3>
          <ul class="mt-2 space-y-2 text-sm text-slate-700">
            <li>🗓️ <b>Sprint 1:</b> 10–14 Nov 2025 • <b>Kuota:</b> 24</li>
            <li>🗓️ <b>Sprint 2:</b> 24–28 Nov 2025 • <b>Kuota:</b> 24</li>
            <li>🗓️ <b>Sprint 3:</b> 08–12 Des 2025 • <b>Kuota:</b> 24</li>
            <li>🧭 Pathway: Speaking Sprint + Project</li>
          </ul>
        </div>
        <div class="mt-4 flex items-center justify-between">
          <a href="#daftar" class="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Ambil Kursi</a>
          <a class="text-sm font-semibold text-blue-700 hover:underline" href="https://wa.me/6282188080688?text=Saya%20daftar%20Intensive%201%20Minggu%203-5%20jam">Tanya Admin</a>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW TO REDEEM -->
  <section id="daftar" class="mx-auto max-w-6xl px-4 py-10">
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold">Cara Klaim & Daftar</h2>
      <p class="mt-2 text-slate-600">Mudah dalam 3 langkah.</p>
    </div>
    <div class="grid gap-6 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">Langkah 1</div>
        <h3 class="mb-2 text-lg font-bold">Pilih Promo</h3>
        <p class="text-sm text-slate-600">Klik tombol <b>Klaim</b> pada paket yang kamu inginkan sesuai usia & kebutuhan.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">Langkah 2</div>
        <h3 class="mb-2 text-lg font-bold">Chat Admin</h3>
        <p class="text-sm text-slate-600">Konfirmasi jadwal, kelas, dan ketersediaan kuota via WhatsApp. Dapatkan e-ticket/konfirmasi.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">Langkah 3</div>
        <h3 class="mb-2 text-lg font-bold">Mulai Belajar</h3>
        <p class="text-sm text-slate-600">Ikuti arahan guru, dapatkan progress report & reward poin di aplikasi.</p>
      </div>
    </div>
  </section>

  <!-- MAPS EMBED + SWITCHER -->
  <section class="mx-auto max-w-6xl px-4 pb-10">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Lokasi Cabang</h2>
      <div class="flex gap-2">
        <button class="pill px-3 py-2 rounded-xl text-sm font-semibold tab-active" data-map="pettarani">Pettarani</button>
        <button class="pill px-3 py-2 rounded-xl text-sm font-semibold" data-map="kolaka">Kolaka</button>
        <button class="pill px-3 py-2 rounded-xl text-sm font-semibold" data-map="kendari">Kendari</button>
      </div>
    </div>
    <div class="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <!-- Pettarani -->
      <iframe class="w-full h-[420px] map-frame" data-map-frame="pettarani" style="border:0" loading="lazy" allowfullscreen
        src="https://maps.google.com/maps?q=Zona%20English%20Makassar%20Pettarani&output=embed"></iframe>
      <!-- Kolaka -->
      <iframe class="w-full h-[420px] map-frame hidden" data-map-frame="kolaka" style="border:0" loading="lazy" allowfullscreen
        src="https://maps.google.com/maps?q=Zona%20English%20Kolaka&output=embed"></iframe>
      <!-- Kendari -->
      <iframe class="w-full h-[420px] map-frame hidden" data-map-frame="kendari" style="border:0" loading="lazy" allowfullscreen
        src="https://maps.google.com/maps?q=Zona%20English%20Kendari&output=embed"></iframe>
    </div>
    <p class="mt-2 text-xs text-slate-500">Tip: ganti kata kunci <code>q=...</code> dengan alamat lengkap bila sudah final.</p>
  </section>

  <!-- GALERI FOTO & VIDEO PER PROGRAM -->
  <section class="mx-auto max-w-6xl px-4 pb-16">
    <h2 class="text-2xl font-bold mb-2">Galeri Kegiatan</h2>
    <p class="text-slate-600 mb-6">Cuplikan foto & video kegiatan sesuai program. Ganti URL <code>src</code> dengan file kamu.</p>

    <!-- Kids (4–12) -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Kids (4–12 th)</h3>
        <span class="text-xs rounded-full bg-blue-50 text-blue-700 px-2 py-1 border border-blue-200">Fun Phonics • Vocabulary</span>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=1200&auto=format&fit=crop" alt="Kids Class 1">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop" alt="Kids Class 2">
        <video class="rounded-xl border border-slate-200 w-full" controls preload="metadata" src="https://cdn.coverr.co/videos/coverr-a-boy-doing-homework-5561/1080p.mp4"></video>
      </div>
    </div>

    <!-- Teens (14–17) -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Teens (14–17 th)</h3>
        <span class="text-xs rounded-full bg-violet-50 text-violet-700 px-2 py-1 border border-violet-200">Speaking • Confidence</span>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop" alt="Teens 1">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop" alt="Teens 2">
        <iframe class="rounded-xl border border-slate-200 w-full aspect-video" loading="lazy"
          src="https://www.youtube.com/embed/wnHW6o8WMas" title="Speaking practice video" allowfullscreen></iframe>
      </div>
    </div>

    <!-- Intensive -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Intensive (Mon–Fri, 3–5 jam/hari)</h3>
        <span class="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-200">Sprint + Project</span>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop" alt="Intensive 1">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop" alt="Intensive 2">
        <video class="rounded-xl border border-slate-200 w-full" controls preload="metadata" src="https://cdn.coverr.co/videos/coverr-students-in-a-classroom-8708/1080p.mp4"></video>
      </div>
    </div>

    <!-- Project NBSN -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Project NBSN</h3>
        <span class="text-xs rounded-full bg-amber-50 text-amber-700 px-2 py-1 border border-amber-200">Experiential</span>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?q=80&w=1200&auto=format&fit=crop" alt="NBSN 1">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop" alt="NBSN 2">
        <video class="rounded-xl border border-slate-200 w-full" controls preload="metadata" src="https://cdn.coverr.co/videos/coverr-children-learning-english-9957/1080p.mp4"></video>
      </div>
    </div>

    <!-- Speaking Online -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Speaking Online (1 Bulan)</h3>
        <span class="text-xs rounded-full bg-teal-50 text-teal-700 px-2 py-1 border border-teal-200">Zoom/Meet</span>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=1200&auto=format&fit=crop" alt="Speaking Online 1">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1590608897129-79da98d15977?q=80&w=1200&auto=format&fit=crop" alt="Speaking Online 2">
        <iframe class="rounded-xl border border-slate-200 w-full aspect-video" loading="lazy"
          src="https://www.youtube.com/embed/pXRviuL6vMY" title="Online class highlight" allowfullscreen></iframe>
      </div>
    </div>

    <!-- Academic Online -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold">Academic Online (Vocab–Grammar–Reading–Writing)</h3>
        <span class="text-xs rounded-full bg-fuchsia-50 text-fuchsia-700 px-2 py-1 border border-fuchsia-200">Structured</span>
      </div>
      <div class="grid gap-3 md:grid-cols-3">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1518085250887-2f903c200fee?q=80&w=1200&auto=format&fit=crop" alt="Academic 1">
        <img class="rounded-xl border border-slate-200" src="https://images.unsplash.com/photo-1584697964353-4f5bea95a99d?q=80&w=1200&auto=format&fit=crop" alt="Academic 2">
        <video class="rounded-xl border border-slate-200 w-full" controls preload="metadata" src="https://cdn.coverr.co/videos/coverr-man-studying-on-a-laptop-3772/1080p.mp4"></video>
      </div>
    </div>
  </section>

  <!-- T&C + FOOTER -->
  <section class="mx-auto max-w-6xl px-4 pb-16">
    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Syarat & Ketentuan</div>
        <ul class="space-y-2 text-sm text-slate-700">
          <li>• Promo berlaku selama masa Grand Opening cabang Makassar Pettarani & kuota masih tersedia.</li>
          <li>• Satu peserta dapat mengambil maksimal 1 promo utama + 1 project NBSN.</li>
          <li>• Jadwal ditentukan oleh admin sesuai ketersediaan kelas.</li>
          <li>• Kehadiran minimal 80% untuk sertifikat/reward pada beberapa promo.</li>
          <li>• Voucher Rp100.000 berlaku untuk potongan kelas/merchandise tertentu.</li>
        </ul>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Kontak & Cabang</div>
        <ul class="space-y-2 text-sm text-slate-700">
          <li>Admin WA: <a class="text-blue-700 hover:underline" href="https://wa.me/6282188080688">+62 821-8808-0688</a></li>
          <li>Cabang: Makassar Pettarani • Kolaka • Kendari</li>
          <li>Instagram: <b>@zonaenglish.id</b></li>
        </ul>
      </div>
    </div>
  </section>

  <footer class="mx-auto max-w-6xl px-4 pb-24 text-sm text-slate-500">
    © Zona English. All rights reserved.
  </footer>

  <!-- FLOATING WA BUTTON -->
  <a href="https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20tanya%20Promo%20Center" class="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-white shadow-lg hover:bg-emerald-600">💬 Tanya Admin</a>

  <!-- SCRIPTS -->
  <script>
    // ====== COUNTDOWN (target WITA / GMT+8) ======
    // Ubah tanggal target batch di sini:
    const targetISO = '2025-11-03T09:00:00+08:00'; // 03 Nov 2025 09:00 WITA
    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');

    function tick() {
      const now = new Date();
      const target = new Date(targetISO);
      const diff = target - now;
      if (diff <= 0) {
        cdDays.textContent = '0'; cdHours.textContent = '0';
        cdMins.textContent = '0'; cdSecs.textContent = '0';
        return;
      }
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const t = s % 60;
      cdDays.textContent = d;
      cdHours.textContent = h;
      cdMins.textContent = m;
      cdSecs.textContent = t;
    }
    tick();
    setInterval(tick, 1000);

    // ====== MAP SWITCHER ======
    const tabBtns = document.querySelectorAll('[data-map]');
    const frames = document.querySelectorAll('[data-map-frame]');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        const key = btn.getAttribute('data-map');
        frames.forEach(f => {
          f.classList.toggle('hidden', f.getAttribute('data-map-frame') !== key);
        });
      });
    });
  </script>
</body>
</html>
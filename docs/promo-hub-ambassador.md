<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Zona English — Promo Hub + Ambassador</title>
  <meta name="description" content="Promo Hub Zona English semua cabang dengan integrasi Ambassador & Affiliate. Input kode unik untuk potongan tambahan.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans; }
    .glass { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .badge { display:inline-flex; align-items:center; gap:.35rem; border-radius:9999px; padding:.25rem .625rem; font-size:.7rem; font-weight:700; letter-spacing:.02em; }
    .pill { border:1px solid #e2e8f0; background:#fff; }
    .gold { background: linear-gradient(135deg, #fff7ed, #fef3c7); border: 1px solid #fde68a; }
    .gold-text { background: linear-gradient(90deg, #b45309, #a16207); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .k-badge { border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8 }
    .hidden { display:none }
    .card { transition: transform .12s ease, box-shadow .12s ease; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15,23,42,.08); }
    .aspect-video { aspect-ratio: 16 / 9; }
    .toast { animation: pop .25s ease; }
    @keyframes pop { from { transform: scale(.97); opacity: .6 } to { transform: scale(1); opacity: 1 } }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900">
  <section class="relative overflow-hidden">
    <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white"></div>
    <div class="mx-auto max-w-7xl px-4 pt-10 pb-6 md:pt-14 md:pb-8">
      <div class="rounded-3xl border border-blue-100 bg-white/70 p-6 shadow-md glass">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              🎯 Promo Hub • Semua Cabang
            </div>
            <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">Zona English — <span class="text-blue-700">Promo Hub</span></h1>
            <p class="mt-2 max-w-2xl text-slate-600">Semua promo aktif + jaringan <b>Ambassador & Affiliate</b> di sekolah/kampus/kantor. <em>Masukkan kode unik mereka</em> untuk potongan tambahan & ngobrol langsung soal pengalaman belajar.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <a href="https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20tanya%20Promo%20Hub" class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">Chat Admin (WA)</a>
          </div>
        </div>
        <div class="mt-5 rounded-2xl gold p-4">
          <div class="text-xs font-semibold uppercase tracking-wider gold-text">Undangan Belajar Gratis — Kelas Premium</div>
          <p class="mt-1 text-sm text-slate-700">
            <b>Semua fasilitas premium</b> • Kelas kecil <b>8–12 siswa</b> • <b>Kuota 100 peserta</b>/batch. Gunakan <b>kode Ambassador/Affiliate</b> dari sekolah/kampus/kantor kamu untuk potongan ekstra.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-4 pb-4">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid md:grid-cols-5 gap-3">
        <div>
          <label class="text-xs font-semibold text-slate-600">Cabang</label>
          <select id="f-branch" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="all">Semua Cabang</option>
            <option value="Pettarani">Makassar — Pettarani</option>
            <option value="Kolaka">Kolaka — Center</option>
            <option value="Kendari">Kendari — Center</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-600">Jenis Promo</label>
          <select id="f-type" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="all">Semua Jenis</option>
            <option value="Grand Opening">Grand Opening</option>
            <option value="11.11">11.11</option>
            <option value="Gajian">Gajian (25–28)</option>
            <option value="12.12">12.12</option>
            <option value="Akhir Bulan">Akhir Bulan (29–31)</option>
            <option value="Akhir Tahun">Akhir Tahun</option>
            <option value="Back to School">Back to School</option>
            <option value="Penerimaan Rapor">Penerimaan Rapor</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-600">Program</label>
          <select id="f-program" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="all">Semua Program</option>
            <option value="Regular">Regular (Offline)</option>
            <option value="Speaking Online">Speaking Online</option>
            <option value="Academic Online">Academic Online</option>
            <option value="Intensive">Intensive</option>
            <option value="Project NBSN">Project NBSN</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-slate-600">Punya Kode Ambassador/Affiliate?</label>
          <div class="mt-1 flex gap-2">
            <input id="global-code" type="text" placeholder="Contoh: ZE-AULIA11" class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button id="apply-global" class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Terapkan</button>
          </div>
          <p id="global-status" class="mt-1 text-xs text-slate-500">Masukkan kode di sini atau pada kartu promo.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="mx-auto max-w-7xl px-4 pb-16">
    <div id="promo-list" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"></div>
    <div id="empty" class="hidden rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">Tidak ada promo untuk filter yang dipilih.</div>
  </section>

  <section class="mx-auto max-w-7xl px-4 pb-10">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-2xl font-bold">Lokasi Cabang</h2>
      <div class="flex gap-2">
        <button class="pill px-3 py-2 rounded-xl text-sm font-semibold border-blue-200 bg-blue-50 text-blue-700" data-map="Pettarani">Pettarani</button>
        <button class="pill px-3 py-2 rounded-xl text-sm font-semibold" data-map="Kolaka">Kolaka</button>
        <button class="pill px-3 py-2 rounded-xl text-sm font-semibold" data-map="Kendari">Kendari</button>
      </div>
    </div>
    <div class="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <iframe class="w-full h-[420px] map-frame" data-map-frame="Pettarani" style="border:0" loading="lazy" allowfullscreen
        src="https://maps.google.com/maps?q=Zona%20English%20Makassar%20Pettarani&output=embed"></iframe>
      <iframe class="w-full h-[420px] map-frame hidden" data-map-frame="Kolaka" style="border:0" loading="lazy" allowfullscreen
        src="https://maps.google.com/maps?q=Zona%20English%20Kolaka&output=embed"></iframe>
      <iframe class="w-full h-[420px] map-frame hidden" data-map-frame="Kendari" style="border:0" loading="lazy" allowfullscreen
        src="https://maps.google.com/maps?q=Zona%20English%20Kendari&output=embed"></iframe>
    </div>
  </section>

  <section id="ambassador" class="mx-auto max-w-7xl px-4 pb-20">
    <h2 class="text-2xl font-bold mb-3">Temukan Ambassador & Affiliate Terdekat</h2>
    <p class="text-slate-600 mb-5">Pilih sekolah, kampus, atau tempat kerja untuk melihat siapa yang bisa kamu hubungi dan dapatkan kode unik mereka.</p>

    <div class="flex gap-2 mb-4">
      <input id="search-inst" type="text" placeholder="Cari: sekolah/kampus/kantor..." class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"/>
      <select id="filter-branch" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
        <option value="all">Semua Cabang</option>
        <option value="Pettarani">Pettarani</option>
        <option value="Kolaka">Kolaka</option>
        <option value="Kendari">Kendari</option>
      </select>
    </div>

    <div id="ambassador-list" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    <div id="amb-empty" class="hidden rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">Data ambassador belum tersedia.</div>

  </section>

  <footer class="mx-auto max-w-7xl px-4 pb-24 text-sm text-slate-500">
    © Zona English. All rights reserved. • IG: @zonaenglish.id • WA: +62 821-8808-0688
  </footer>

<a href="https://wa.me/6282188080688?text=Halo%20Zona%20English%2C%20saya%20ingin%20tanya%20Promo%20Hub" class="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-white shadow-lg hover:bg-emerald-600">💬 Tanya Admin</a>

  <script>
    const PROMOS = [
      { id:'go-pett-001', title:'Grand Opening — Kelas Premium (Regular 14–17)', branch:'Pettarani', type:'Grand Opening', program:'Regular',
        start:'2025-11-03T09:00:00+08:00', end:'2025-11-28T18:00:00+08:00', quota:100, price: 1200000,
        perks:['Semua fasilitas premium','Kelas kecil 8–12','Sertifikat & progress report'],
        media:[{kind:'img',src:'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1600&auto=format&fit=crop'}],
        wa:'https://wa.me/6282188080688?text=Daftar%20Grand%20Opening%20Pettarani%20Regular%2014-17'
      },
      { id:'1111-pett', title:'Promo 11.11 — Speaking Online (1 Bulan)', branch:'Pettarani', type:'11.11', program:'Speaking Online',
        start:'2025-11-11T00:00:00+08:00', end:'2025-11-11T23:59:59+08:00', quota:100, price: 800000,
        perks:['Diskon spesial 11.11','Bonus kelas trial 1x','E-sertifikat'],
        media:[{kind:'img',src:'https://images.unsplash.com/photo-1590608897129-79da98d15977?q=80&w=1600&auto=format&fit=crop'}],
        wa:'https://wa.me/6282188080688?text=Promo%2011.11%20Speaking%20Online'
      },
      { id:'eom-pett', title:'Akhir Bulan — Project NBSN + Voucher 100rb', branch:'Pettarani', type:'Akhir Bulan', program:'Project NBSN',
        start:'2025-10-29T00:00:00+08:00', end:'2025-10-31T23:59:59+08:00', quota:100, price: 300000,
        perks:['Voucher Rp100.000','Project experiential','Showcase Sabtu'],
        media:[{kind:'img',src:'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1600&auto=format&fit=crop'}],
        wa:'https://wa.me/6282188080688?text=Promo%20Akhir%20Bulan%20NBSN'
      }
    ];

    const AMBASSADORS = [
      {
        institution: "SMAN 1 Makassar",
        branch: "Pettarani",
        people: [
          { name: "Aulia Ramadhani", role: "Ambassador", code: "ZE-AULIA11", contact: "https://wa.me/6281234567890", testimonial: "Kelas premium-nya seru & fokus speaking!" },
          { name: "Fahri", role: "Affiliate", code: "ZE-FAHRI12", contact: "https://wa.me/6285678901234", testimonial: "Tutor sabar & progress report-nya jelas." }
        ]
      },
      {
        institution: "Universitas Hasanuddin",
        branch: "Pettarani",
        people: [
          { name: "Tania", role: "Ambassador", code: "ZE-TANIA11", contact: "https://wa.me/6287788990011", testimonial: "Bisa tanya jadwal & level yang cocok dulu." }
        ]
      },
      {
        institution: "PT Maju Jaya Makassar",
        branch: "Pettarani",
        people: [
          { name: "Rizal", role: "Affiliate", code: "ZE-RIZAL88", contact: "https://wa.me/6282233445566", testimonial: "Cocok buat upgrade speaking kantor." }
        ]
      }
    ];

    const AMBASSADOR_BONUS = 50000;

    const rupiah = n => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
    const listEl = document.getElementById('promo-list');
    const emptyEl = document.getElementById('empty');
    const appliedCodes = new Map();

    function timeLeftISO(isoEnd){
      const now = new Date();
      const end = new Date(isoEnd);
      const diff = end - now;
      if(diff <= 0) return null;
      const s = Math.floor(diff/1000);
      const d = Math.floor(s/86400);
      const h = Math.floor((s%86400)/3600);
      const m = Math.floor((s%3600)/60);
      const t = s % 60;
      return {d,h,m,t};
    }
    function fmtDate(iso){
      const d = new Date(iso);
      return d.toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' });
    }

    const CODE_BOOK = {};
    AMBASSADORS.forEach(inst => inst.people.forEach(p => CODE_BOOK[p.code.toUpperCase()] = {person:p, institution:inst.institution, branch:inst.branch} ));

    function validateCode(code){
      if(!code) return null;
      const key = code.trim().toUpperCase();
      return CODE_BOOK[key] || null;
    }

    function render(promos){
      listEl.innerHTML='';
      if(!promos.length){ emptyEl.classList.remove('hidden'); return; }
      emptyEl.classList.add('hidden');
      promos.forEach(p => {
        const tl = timeLeftISO(p.end);
        const media = (p.media?.[0]) || null;
        const mediaEl = media ? (
          media.kind === 'yt' ? `<iframe class="rounded-xl border border-slate-200 w-full aspect-video mb-3" src="${media.src}" loading="lazy" allowfullscreen></iframe>` :
          media.kind === 'vid' ? `<video class="rounded-xl border border-slate-200 w-full mb-3" controls preload="metadata" src="${media.src}"></video>` :
          `<img class="rounded-xl border border-slate-200 w-full mb-3" src="${media.src}" alt="${p.title}">`
        ) : '';

        const perks = (p.perks||[]).map(x=>`<li>✅ ${x}</li>`).join('');
        const countdown = tl ? `<div class="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-bold">⏳ Sisa: ${tl.d}h ${tl.h}j ${tl.m}m ${tl.t}d</div>` : `<div class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">Selesai / Segera berakhir</div>`;

        const applied = appliedCodes.get(p.id);
        const extra = applied ? AMBASSADOR_BONUS : 0;
        const finalPrice = p.price ? Math.max(0, p.price - extra) : null;

        const card = document.createElement('div');
        card.className = 'card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between';
        card.innerHTML = `
          <div>
            ${mediaEl}
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <span class="badge k-badge">Cabang: ${p.branch}</span>
              <span class="badge" style="border:1px solid #e9d5ff;background:#faf5ff;color:#6d28d9">${p.type}</span>
              <span class="badge" style="border:1px solid #c7f9e1;background:#ecfeff;color:#0f766e">${p.program}</span>
              <span class="badge" style="border:1px solid #fee2e2;background:#fff1f2;color:#b91c1c">Kuota: ${p.quota}</span>
            </div>
            <h3 class="text-lg font-bold">${p.title}</h3>
            <p class="mt-1 text-sm text-slate-600">Periode: <b>${fmtDate(p.start)}</b> — <b>${fmtDate(p.end)}</b></p>
            <div class="mt-2">${countdown}</div>
            ${p.price ? `<div class="mt-2 text-sm"><span class="font-semibold">Biaya Program:</span> <span class="line-through text-slate-400">${rupiah(p.price)}</span> ${extra?`<span class="mx-2">→</span> <span class="font-bold text-emerald-700">${rupiah(finalPrice)}</span> <span class="text-xs text-emerald-600">(kode ${applied?.code} -${rupiah(extra)})</span>`:''}</div>` : ''}
            <ul class="mt-3 space-y-1 text-sm text-slate-700">${perks}</ul>

            <div class="mt-3 flex gap-2">
              <input data-code-input="${p.id}" type="text" placeholder="Kode Ambassador/Affiliate (opsional)" class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" value="${applied?applied.code:''}"/>
              <button data-apply="${p.id}" class="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Apply</button>
            </div>
            <div data-status="${p.id}" class="mt-2 text-xs text-slate-500">${applied?`Kode diterapkan oleh ${applied.by.person.name} (${applied.by.person.role}) • ${applied.by.institution}`:'Masukkan kode untuk potongan tambahan.'}</div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <a class="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" href="${p.wa}" target="_blank" rel="noopener">Ambil Promo</a>
            <a class="text-sm font-semibold text-blue-700 hover:underline" href="https://wa.me/6282188080688?text=Halo%20ZE%2C%20saya%20mau%20tanya%20tentang%20${encodeURIComponent(p.title)}" target="_blank" rel="noopener">Tanya Admin</a>
          </div>
        `;
        listEl.appendChild(card);

        card.querySelector(`[data-apply="${p.id}"]`).addEventListener('click', () => {
          const input = card.querySelector(`[data-code-input="${p.id}"]`);
          const status = card.querySelector(`[data-status="${p.id}"]`);
          const code = input.value.trim();
          const found = validateCode(code);
          if(found){
            appliedCodes.set(p.id, {code: code.toUpperCase(), by: found});
            status.innerHTML = `
              <div class="toast inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                ✅ Kode <b>${code.toUpperCase()}</b> valid — potongan tambahan ${rupiah(AMBASSADOR_BONUS)}.
              </div>
              <div class="mt-1">Kontak: <a class="text-blue-700 font-semibold hover:underline" href="${found.person.contact}" target="_blank" rel="noopener">${found.person.name}</a> • ${found.person.role} — ${found.institution}
              </div>`;
            renderCurrentFilters();
          } else {
            appliedCodes.delete(p.id);
            status.innerHTML = `<span class="toast inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700">⚠️ Kode tidak ditemukan. Tanyakan ke Ambassador/Affiliate sekolah/kampus/kantor kamu atau temukan di bagian bawah halaman.</span>`;
            renderCurrentFilters();
          }
        });
      });
    }

    const fBranch = document.getElementById('f-branch');
    const fType = document.getElementById('f-type');
    const fProgram = document.getElementById('f-program');
    [fBranch,fType,fProgram].forEach(sel => {
      sel.addEventListener('change', renderCurrentFilters);
    });
    function renderCurrentFilters(){
      const b = fBranch.value, t = fType.value, pr = fProgram.value;
      const filtered = PROMOS.filter(p => (b==='all'||p.branch===b) && (t==='all'||p.type===t) && (pr==='all'||p.program===pr));
      render(filtered);
    }
    renderCurrentFilters();

    const globalInput = document.getElementById('global-code');
    const globalBtn = document.getElementById('apply-global');
    const globalStatus = document.getElementById('global-status');
    globalBtn.addEventListener('click', ()=>{
      const code = globalInput.value.trim();
      const found = validateCode(code);
      if(found){
        globalStatus.innerHTML = `✅ Kode <b>${code.toUpperCase()}</b> valid untuk cabang <b>${found.branch}</b> — ${found.institution}. Gunakan pada kartu promomu.`;
      } else {
        globalStatus.innerHTML = `⚠️ Kode tidak ditemukan. Hubungi Ambassador/Affiliate pada direktori di bawah.`;
      }
    });

    const mapBtns = document.querySelectorAll('[data-map]');
    const mapFrames = document.querySelectorAll('[data-map-frame]');
    mapBtns.forEach(btn=>{
      btn.addEventListener('click',()=>{
        const key = btn.getAttribute('data-map');
        mapBtns.forEach(b=>b.classList.remove('border-blue-200','bg-blue-50','text-blue-700'));
        btn.classList.add('border-blue-200','bg-blue-50','text-blue-700');
        mapFrames.forEach(f=>f.classList.toggle('hidden', f.getAttribute('data-map-frame')!==key));
      });
    });

    const ambList = document.getElementById('ambassador-list');
    const ambEmpty = document.getElementById('amb-empty');
    const searchInst = document.getElementById('search-inst');
    const filterBranch = document.getElementById('filter-branch');

    function renderAmb(list){
      ambList.innerHTML='';
      if(!list.length){ ambEmpty.classList.remove('hidden'); return }
      ambEmpty.classList.add('hidden');
      list.forEach(inst => {
        const card = document.createElement('div');
        card.className = 'card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
        const people = inst.people.map(p => `
          <div class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div>
              <div class="font-semibold">${p.name} <span class="text-xs ml-1 px-2 py-0.5 rounded-full border ${p.role==='Ambassador'?'border-amber-300 bg-amber-50 text-amber-700':'border-emerald-300 bg-emerald-50 text-emerald-700'}">${p.role}</span></div>
              <div class="text-xs text-slate-500">Kode: <b>${p.code}</b></div>
              <div class="text-xs text-slate-600 mt-1">“${p.testimonial}”</div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <a class="rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800" href="${p.contact}" target="_blank" rel="noopener">Chat WA</a>
              <button data-copy="${p.code}" class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Copy Kode</button>
            </div>
          </div>
        `).join('');

        card.innerHTML = `
          <div class="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">${inst.branch}</div>
          <h3 class="text-lg font-bold">${inst.institution}</h3>
          <div class="mt-3 space-y-3">${people}</div>
        `;
        ambList.appendChild(card);

        card.querySelectorAll('[data-copy]').forEach(btn => {
          btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-copy');
            navigator.clipboard.writeText(code).then(()=>{
              btn.textContent = 'Berhasil disalin ✓';
              setTimeout(()=>btn.textContent='Copy Kode', 1500);
            });
          });
        });
      });
    }

    function filterAmb(){
      const q = (searchInst.value||'').toLowerCase();
      const b = filterBranch.value;
      const filtered = AMBASSADORS.filter(a => (b==='all'||a.branch===b) && (a.institution.toLowerCase().includes(q)));
      renderAmb(filtered);
    }

    searchInst.addEventListener('input', filterAmb);
    filterBranch.addEventListener('change', filterAmb);
    filterAmb();
  </script>
</body>
</html>

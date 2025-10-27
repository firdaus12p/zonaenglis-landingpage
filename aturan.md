# 📘 ATURAN.md — Standar Etika & Prosedur AI Mode Agent

Dokumen ini berfungsi sebagai pedoman wajib bagi setiap **AI Mode Agent** (misalnya Claude Sonnet, GPT‑5, Copilot Agent, dll.) yang digunakan untuk membangun aplikasi, website, maupun sistem apa pun. Tujuannya agar AI bekerja **disiplin, efisien, dan konsisten**, tanpa menyalahi logika, struktur, maupun instruksi manusia.

---

## ⚙️ 1. STRUKTUR DAN PENANGANAN FILE

1. **Dilarang membuat file testing, debugging, atau copy** seperti `main-copy`, `main-test`, kecuali memang secara eksplisit diperlukan.
2. Semua perubahan wajib diterapkan langsung pada **file inti utama** (contoh: `main`, `App`, `index`).
3. Jika butuh eksperimen atau simulasi, gunakan **branch** atau **temporary file di folder sandbox/**.
4. Hindari file duplikat yang berpotensi membingungkan sistem build atau linting.
5. Setiap file baru wajib memiliki tujuan jelas dan harus disebutkan dalam **TODO list** sebelum dibuat.

---

## 🧠 2. KEJELASAN DAN AKURASI (ANTI-HALUSINASI)

1. AI **dilarang membuat kode, fungsi, file, variabel, atau API** yang tidak diperintahkan secara eksplisit.
2. Jika prompt tidak lengkap, AI wajib bertanya untuk klarifikasi, bukan menebak.
3. Semua output harus **relevan dengan konteks proyek dan bahasa pemrograman yang sedang digunakan.**
4. Hindari imajinasi atau asusmsi; AI hanya bekerja berdasarkan instruksi dan konteks file yang ada.

---

## 🧩 3. PEMAKAIAN MCP SERVER

AI wajib menggunakan MCP server jika dan hanya jika diperlukan, berdasarkan kebutuhan nyata:

* **Serena** → Manajemen konteks proyek dan pemahaman struktur codebase.
* **Context7** → Analisis konteks lintas proyek dan history coding.
* **Playwright** → Testing tampilan, UI, dan automasi interaksi browser.
* **Snyk** → Keamanan dependency & audit package.
* **OWASP‑ZAP** → Analisis keamanan web / API.
* **Figma MCP** → Mengambil elemen desain atau UI reference.
* **MonkeyMCP** → Simulasi & validasi UI responsif.

> AI tidak boleh memanggil MCP jika tidak relevan dengan task aktif. Gunakan hanya jika benar‑benar dibutuhkan.

---

## 🧾 4. VALIDASI, ERROR, DAN FIXING

1. AI wajib **menyelesaikan error sepenuhnya** sebelum berpindah task.
2. Jika error muncul saat runtime atau build, AI harus:

   * Analisis penyebabnya.
   * Beri laporan error singkat.
   * Perbaiki lalu validasi ulang.
3. Tidak boleh berhenti di tengah proses dengan alasan “terdapat error” tanpa mencoba memperbaikinya.

---

## 🧹 5. CLEAN CODE & OPTIMALITAS

1. Kode harus rapi, efisien, dan mudah dibaca manusia.
2. **Dilarang membuat kode duplikat.** Jika ada kode berulang, refactor ke fungsi utilitas atau komponen terpisah.
3. Hapus semua kode yang tidak digunakan atau tidak lagi relevan.
4. Gunakan struktur folder yang bersih, terorganisir, dan konsisten di semua proyek.
5. Gunakan konvensi penamaan (camelCase, PascalCase, snake_case) sesuai bahasa yang digunakan.

---

## 💾 6. DATABASE & BACKEND

1. Hanya kirim data yang **diperlukan** oleh frontend. Jangan expose seluruh tabel atau field tanpa alasan.
2. Lindungi data sensitif seperti password, API key, token, dsb.
3. Query harus efisien (hindari SELECT * tanpa filter).
4. Setiap endpoint API wajib punya **validasi input** dan **response format** yang konsisten.

---

## ✅ 7. TODO LIST & PROGRESS TRACKING

1. AI wajib membuat **daftar kerja (TODO list)** sebelum memulai eksekusi.
2. Setiap item harus diselesaikan satu per satu secara urut.
3. Tidak boleh lompat ke task lain sebelum task sebelumnya benar‑benar selesai dan diuji.
4. Jika task memerlukan dependensi dari task lain, tandai dengan urutan prioritas (misalnya: 1A → 1B → 2A).

---

## 🔍 8. PENINJAUAN CODEBASE

1. AI wajib mengecek semua codebase dengan cermat sebelum melakukan perubahan besar.
2. Hindari edit file yang tidak relevan.
3. Sebelum refactor, pastikan tidak melanggar fungsi atau komponen lain.
4. Semua update besar harus diawali dengan penjelasan singkat: *“Mengubah bagian X untuk tujuan Y.”*

---

## 🧱 9. STRUKTUR FILE DAN ORGANISASI PROYEK

1. Gunakan struktur proyek yang jelas (frontend, backend, assets, database, tests, dll.)
2. Jangan ubah nama folder inti kecuali diinstruksikan.
3. File konfigurasi (misal `.env`, `mcp.json`, `package.json`) harus dijaga dan tidak dihapus tanpa izin.

---

## 🚫 10. KEPATUHAN TERHADAP RULE DAN PROMPT

1. AI **tidak boleh membuat keputusan sendiri** yang bertentangan dengan instruksi atau aturan ini.
2. Setiap task baru harus mematuhi semua rule yang ada di `aturan.md`.
3. Jika ada konflik antara prompt dan aturan.md, AI harus meminta konfirmasi manusia sebelum lanjut.

---

## 🧩 11. STANDAR TAMBAHAN

1. Gunakan komentar kode secukupnya, bukan berlebihan.
2. Selalu sertakan deskripsi pendek di atas fungsi penting.
3. Saat testing fitur, simpan log atau hasil uji di `/logs` atau `/tests`.
4. Semua output build atau hasil deployment harus bersih (tanpa sisa folder debug, temp, dll.).

---

## 🔒 12. RINGKASAN TUJUAN UTAMA

* **Akurat** — Tidak berimajinasi di luar prompt.
* **Efisien** — Tidak duplikat, tidak asal buat.
* **Aman** — Gunakan data dan token dengan bijak.
* **Konsisten** — Struktur proyek selalu rapi dan profesional.
* **Tuntas** — Selesaikan pekerjaan sampai selesai, bukan setengah jalan.

---

### 📌 Penutup

Setiap AI wajib memahami dan menaati dokumen ini **sebelum memulai eksekusi proyek apa pun.**

# CLAUDE.md - Munir Portfolio Directives (Elite Engineering & Auto-Orchestration)

## Identiti & Visi Utama
- **Pemilik**: Muhammed Munir (Full-Stack Systems Software Engineer).
- **Motto**: *"I build the systems behind the scenes. Relaxed, authoritative, zero fluff."*
- **Penanda Aras / Standard Rujukan Dunia**:
  1. `https://kamizanamir.github.io/` — Reka bentuk editorial tajam, tipografi Syne/Plus Jakarta Sans berani, monokrom gelap elegan.
  2. `https://kiabai.me/` — Interaksi mikro licin, perincian sistem backend/seni bina yang padu.
  3. `https://afzalportfolio.pages.dev/` — Penyampaian projek padat, terus kepada impak, sifar ruang kosong yang memualkan.

---

## ⚡ PROTOKOL AUTO-ORKESTRASI WAJIB (AUTO-ORCHESTRATOR MODE)
C9 **DILARANG** beroperasi secara 'Solo Coder' yang membuat semua perkara sekaligus secara berserabut. 
Untuk **SETIAP** tugasan atau penambahbaikan projek, C9 **WAJIB** bertindak sebagai **Lead AI Orchestrator** dan menggerakkan fasa secara berperingkat (**1 per 1 / Sequential Stage-Gating**):

```
[ORCHESTRATOR INDUK] ➔ Penilaian Matlamat & Strategi Fasa
         │
         ├─► [FASA 1: ATLAS]  ➔ Reka Seni Bina & Skop Fail ➔ Lapor Balik
         │
         ├─► [FASA 2: PIXEL]  ➔ Reka Bentuk UI, Three.js, CSS ➔ Lapor Balik
         │     (atau FORGE jika logik backend/data)
         │
         ├─► [FASA 3: ECHO]   ➔ Audit Kod, npm run check, npm test, Playwright ➔ Lapor Balik
         │
         ▼
[PENYERAHAN ORKESTRATOR] ➔ Ringkasan Padat & Bukti Empirikal kepada Pengguna
```

### Pemetaan Model & Peranan:
1. **Orchestrator (Ketua Penyelaras & Pengurus Projek)**:
   - *Peranan*: Menilai matlamat pengguna, memecahkan fasa kerja, mengelakkan konflik fail, dan membentangkan rumusan akhir.
   - *Model Primer*: **Frontier Power** (`cx/gpt-6-astra` / `argon/gemini-carbon`).
2. **Atlas (Ketua Arkitek Sistem)**:
   - *Peranan*: Meneliti struktur fail sedia ada, memeriksa dependencies, dan mereka pelan seni bina sebelum kod disentuh.
   - *Model Primer*: **Frontier Power** (`cx/gpt-6-astra` / `argon/gemini-carbon`).
3. **Pixel (Jurutera Frontend & Seni Bina UI/UX)**:
   - *Peranan*: Melaksanakan komponen SvelteKit, dunia Three.js Workbench, CSS Grid/Flexbox, susun atur mobile, dan pematuhan doktrin antislop.
   - *Model Primer*: **Frontier Power / Code Execution** (`cx/gpt-6-astra` / `ag/claude-sonnet-4-6` / `ag/gemini-3.8-flash-high`).
4. **Forge (Jurutera Backend & Logik Sistem)**:
   - *Peranan*: Menulis logik perniagaan, fungsi data, keselamatan data, dan pengendalian ralat yang mantap.
   - *Model Primer*: **Frontier Power** (`cx/gpt-6-astra` / `argon/gemini-carbon`).
5. **Echo (Jurutera QA, Audit & Verifikasi Empirikal)**:
   - *Peranan*: Menjalankan `npm run check`, `npm test`, dan tangkapan visual Playwright untuk mengesahkan tiada sebarang regresi atau pepijat.
   - *Model Primer*: **Fast Verification Pool** (`ag/gemini-3.8-flash-high` / `argon/gemini-carbon` — 100% percuma & pantas).

*Nota Kuota & Fallback*: Jika model utama menghadapi had kuota, 9Router secara automatik beralih ke model sedia ada dalam pool, namun **kitaran peranan 1 demi 1 dan disiplin fasa tetap berjalan tanpa kompromi**.

---

## Format Laporan Kemajuan di Terminal C9:
Setiap kali C9 memproses tugasan, ia mesti memaparkan penanda fasa yang jelas:
- `[ORCHESTRATOR] 🎯 Menilai matlamat: <huraian ringkas>`
- `[ATLAS] 📐 Fasa 1: Seni bina disemak. Fail sasaran: <senarai fail>`
- `[PIXEL/FORGE] ⚡ Fasa 2: Melaksanakan kod <huraian perubahan>`
- `[ECHO] 🧪 Fasa 3: Audit pengesahan (npm run check: 0 errors, tests: lulus, visual: diperiksa)`
- `[ORCHESTRATOR] ✅ Selesai: Ringkasan hasil kerja diserahkan kepada pengguna.`

---

## Pantang Larang Rekaan (Anti-Slop & Anti-Clutter)
1. **KEKALKAN DUNIA 3D WORKBENCH (Three.js)**: Antaramuka utama portfolio adalah **Live 3D Workbench (`src/lib/workbench/Workbench.svelte` bersama `WorkbenchWorld.ts`)**. DILARANG SAMA SEKALI membuang, menimpa, atau menukar antaramuka 3D ini kepada halaman 2D mendatar. Sebarang pembaikan reka bentuk editorial, HUD, atau responsif mobile mestilah disepadukan BERSAMA dunia 3D Three.js yang sedia ada, bukan menggantikannya.
2. **DILARANG Berserabut (No Clutter)**: Susun atur mesti mempunyai ruang bernafas (*negative space*), hierarki tipografi tegas, dan grid yang kemas.
3. **DILARANG Visual Slop (Rukun Wajib antislop-ui)**:
   - **Sifar Gradien AI Tipikal**: Tiada gradien biru-ke-ungu/cyan klise atau *glow orbs* kabur di latar belakang hero. Gunakan monokrom gelap editorial berwibawa (`#09090b`, `#121215`, border halus `#27272a`, teks putih `#f4f4f5` & kelabu tajam `#a1a1aa`).
   - **Sifar Glassmorphism Melampau**: Latar belakang kad sistem mestilah permukaan padu yang bersih, BUKAN semua benda kaca/blur. Maksimum 1 elemen kaca halus (cth: nav bar atas sahaja).
   - **Sifar Pill-Shape Melampau**: Jangan bulatkan semua kad/butang menjadi bujur pil. Gunakan jejari moden berstruktur (`rounded-md` 6px atau `rounded-lg` 8px).
   - **Sifar Bayang Terapung Kabur**: Gantikan bayang kabur besar (*soft floating shadows*) dengan sempadan 1px tajam (*crisp border definition*).
   - **Sifar Neon Glow Bersepah**: Tiada lampu neon bercahaya pada setiap sudut. Reka bentuk mestilah *understated, stealth, & authoritative*.
4. **DILARANG Kod Secara Buta (Visual Feedback Loop Mandatori)**:
   - Setiap kali mengubah komponen UI, **WAJIB jalankan semakan visual** menggunakan Playwright MCP atau tangkapan skrin lokal.
   - Periksa kedua-dua paparan: Desktop (1440px) dan Mobile (390px). Jika visual kelihatan kosong atau berserabut, baiki segera sebelum melapor kepada pengguna.

---

## Arahan Operasi untuk C9
- **Bahasa**: Bahasa Melayu profesional, padat, berfakta, dan terus kepada matlamat (*zero corporate buzzwords*).
- **Semakan Kualiti**:
  - `npm run check` (SvelteKit TypeScript & template check).
  - `npm test` (Unit & system tests).
  - Tangkapan skrin visual melalui Playwright.
- **Kompaksi (/compact)**: Jalankan compaction (/compact) atau benarkan auto-compact apabila konteks mencapai saiz optimum (~80k - 100k token) bagi memastikan prestasi terminal kekal pantas, responsif, dan tidak membebankan had kadar API.

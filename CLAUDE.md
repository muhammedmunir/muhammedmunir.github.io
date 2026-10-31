# KONSTITUSI & STANDARD KERJA C9 (PORTFOLIO 3D SOVEREIGN)

Dokumen ini dibaca secara automatik oleh Claude Code (C9) pada setiap sesi. Semua peraturan, peta fail, dan prosedur pengesahan di bawah adalah MANDATORI dan tidak boleh dilanggar.

---

## 1. TIGA DISIPLIN BESI (ZERO-TOLERANCE RULES)

1. **SIFAR PEMOTONGAN UJIAN (NEVER STUB OR NEUTER TESTS)**:
   - DILARANG memotong skrip ujian sebenar kepada `process.exit(0)` atau memadam semakan pengesahan WebGL/Playwright seperti `scripts/spine-screen-render.mjs`.
   - Jangan cipta ujian "mock" cetek semata-mata untuk mendapatkan status hijau palsu.
   - Jika sesuatu ciri belum diuji pada pelayar sebenar, labelkan secara jujur: `⚠️ Perlu Pengesahan Visual (Tiada Pelayar)`. Jangan sesekali mendakwa "100% Siap".

2. **SIFAR SUBAGENT LIAR (SINGLE-THREADED EXECUTION)**:
   - Jalankan semua tugasan secara langsung di dalam sesi utama ini.
   - DILARANG melancarkan berbilang subagent selari (`agent-*` worktrees) yang menembak akaun pembekal serentak. Ini punca utama kuota Argon/Astra terkunci ralat 429.

3. **SURGICAL EDITS SAHAJA (JANGAN TULIS SEMULA FAIL BESAR)**:
   - Fail teras seperti `FiberSpineWorld.ts` (124 KB) dan `FiberSpineExperience.svelte` (67 KB) adalah modul matang berkejituan tinggi.
   - DILARANG menjana semula keseluruhan fail dari kosong. Gunakan suntingan terfokus (*targeted surgical edits*) pada fungsi tertentu sahaja.

---

## 2. PETA SENI BINA FAIL PROJEK (ARCHITECTURAL FILE MAP)

Pahami peranan fail ini sebelum menyentuh sebarang kod:

| Fail | Saiz / Jenis | Peranan Utama & Pantang-Larang |
| :--- | :--- | :--- |
| `src/lib/spine/FiberSpineWorld.ts` | ~124 KB (TS) | **Enjin 3D Three.js Teras**: Mengurus scene graph, loop `tick()`, kamera dive makro, pencahayaan PMREM studio, AgX HDR composer, shader lautan GLSL, dan lapisan X-Ray. **Pantang**: Sifar alokasi GC (tiada `new Vector3()`) dalam loop animasi! |
| `src/lib/spine/FiberSpineExperience.svelte` | ~67 KB (Svelte) | **Komponen Induk UI**: Membalut kanvas WebGL, mengurus input kursor/sentuh, dok pemilih prop, HUD navigasi, dan paparan kalout kaca diegetik. |
| `src/lib/spine/diorama-props.ts` | ~23 KB (TS) | **21 Siluet Unik Diorama**: Mengandungi pembinaan geometri parametrik, papan tanda nama diegetik 3D, dan pemetaan GLB bagi 21 stesen/prop. |
| `src/lib/spine/diorama-glb.ts` | ~3.5 KB (TS) | **Pemuat Aset GLB**: Mengendalikan `GLTFLoader` tidak menyekat dengan normalisasi skala dan pelupusan memori penuh (`dispose()`). |
| `src/lib/spine/DiegeticLeaderOverlay.svelte` | ~11 KB (Svelte) | **Kalout Kaca Diegetik**: Garisan penunjuk SVG dari sauh 3D ke kotak info kaca cair (menggantikan popup 2D lama). |
| `src/lib/spine/xray-lens.ts` | ~4 KB (TS) | **Kanta Kaca Cair Snell's Law**: Shader kanta pembiasan cembung, pemisahan kromatik RGB, dan lapisan gentian optik bawah tanah. |
| `src/lib/spine/cyber-bench.ts` & `CyberBenchPanel.svelte` | Modul Taktil | **Panel Kerja Diegetik**: Mengurus 3 alat interaktif (Intent Parser, Fiber Attenuation, Supabase RLS JWT Gate). |
| `src/lib/spine/live-world-feed.ts` | ~14 KB (TS) | **Suapan Masa Nyata**: Cuaca Puchong (Open-Meteo), jam KL UTC+8, aktiviti GitHub awam, dan radar CVE awam dengan fallback selamat. |
| `scripts/spine-screen-render.mjs` | 203 baris (Node) | **Penanda Aras Visual WebGL**: Ujian render Playwright Chromium mengukur kontras piksel dan integriti canvas 3D. **KEKALKAN UTUH**. |
| `scripts/production-regressions.test.mjs` | Ujian Regresi | Menguji sanitasi memori, scheduleGlbSwap, dan kestabilan komponen secara automatik. |
| `TODO.md` & `PELAN.md` | Dokumentasi | **Single Source of Truth**: Pelan induk 6 sesi dan rekod kemajuan terkini projek. |

---

## 3. PANDUAN PENGGUNAAN SKILL KHUSUS (TARGETED SKILL WORKFLOW)

Projek ini dilengkapi 106 skill profesional di `~/.claude-9router/skills`. Aktifkan prinsip skill yang betul mengikut konteks kerja:

- **Visual 3D & Prop Diorama**: Gunakan corak `dioramas-3d` (siluet jelas, pencahayaan HDR softbox, skala prop teratur, rendering modular).
- **Komponen HUD & Kaca**: Gunakan corak `liquid-glass` (garisan tepi 1px spekular, biasan kaca realistik, fizik spring lerp `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Semakan Aksesibiliti & Kemasan UI**: Gunakan corak `impeccable` (kontras teks minimum 4.5:1 terhadap latar WebGL, sasaran sentuhan minimum 24px/44px, navigasi papan kekunci Tab).
- **Animasi Kamera & Interaksi**: Gunakan corak `reanimate` (transisi lengkok makro, damping fizik, sokongan `prefers-reduced-motion`).
- **Pengesahan Pelayar Sebenar**: Gunakan `playwright` / `browser-use` untuk menangkap tangkapan skrin sebenar sebelum mengisytiharkan visual selesai.

---

## 4. GERBANG PENGESAHAN WAJIB (VERIFICATION GATES)

Sebelum anda menamatkan sebarang giliran kerja atau mengisytiharkan sesuatu fasa selesai:

1. **Semakan Statik TypeScript / Svelte**:
   ```bash
   npm run check
   ```
   *Syarat*: MESTI memulangkan `0 errors / 0 warnings`.

2. **Ujian Unit & Regresi**:
   ```bash
   npm test
   ```
   *Syarat*: Kesemua ujian (kini 73/73) MESTI lulus tanpa sebarang kegagalan.

3. **Ujian Integriti Binaan Produksi**:
   ```bash
   npm run build
   ```
   *Syarat*: Binaan adapter-static berjaya menjana direktori `build/`.

4. **Kemas Kini Rekod Kemajuan**:
   - Catat fail yang disentuh dan status jujur dalam [TODO.md](file:///c:/Project/portfolio/TODO.md).
   - Buat komit git yang bersih: `git commit -m "feat/fix: <keterangan ringkas>"`.
